const axios = require('axios');
const xmlJs = require('xml-js');
const ncache = require( "node-cache" );
const geolib = require('geolib');
const cheerio = require('cheerio');
const { createCanvas, loadImage } = require('canvas');
const toUpperFirstLetterWords = require('../utils/toUpperFirstLetterWords');
const refactJsonWeather = require('../utils/refactJsonWeather');
const responseCreator = require('../utils/responseCreator');
const { dateFormat, timeStrDate }  = require('../utils/dateFormat');
const { kdTree } = require('../utils/kdTree');
const wCache = new ncache({ stdTTL: 100, checkperiod: 120 });

/**
 * calculate distance
 */
const distance = (a, b) => {
  return geolib.getDistance({lat: a.latitude,lon: a.longitude},{lat: b.latitude, lon: b.longitude});
};

var tree = new kdTree([], distance, ["latitude", "longitude"]);

wCache.on("del", function( key, value ){
	if (key=="scanall") {
    // reload data
    getDataScanAll();
  }
});

/**
 * Extract data from bmkg open data by province, cache if applicable
 * @param Request req need req.params.province
 * @param Response res 
 * @returns Response
 */
 const getDataProvince = async(province) => {
  let result = undefined;
  let timeStamp = Date.now();
  let key = province.replace(/[,-: ]/g, "").toLowerCase();

  result = wCache.get(key);
  if (result == undefined) {
    try {
      result = await axios.get(
        `https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-${toUpperFirstLetterWords(
          province
        )}.xml?${timeStamp}`
      );
  
      const weathers = xmlJs.xml2js(result.data, { compact: true, spaces: 2 });
      const refactoredJsonWeathers = refactJsonWeather(weathers);
      wCache.set(key, refactoredJsonWeathers);
  
      return refactoredJsonWeathers;
    } catch (error) {
      // console.log('error', error);
      throw error;
    }
  } 
  return result;
};

/**
 * Get Data Scan All
 */
const getDataScanAll = async() => {
  let result = undefined;
  let timeStamp = Date.now();
  let key = "scanall";

  result = wCache.get(key);
  if (result == undefined) {
    console.log('load data', (new Date).toISOString());
    try {
      // get list province
      result = await axios.get(
        `https://data.bmkg.go.id/prakiraan-cuaca/?${timeStamp}`
      );
  
      const $ = cheerio.load(result.data);
      let list = [];
      $('table.table.table-striped tr td pre a').each(function (i, elm) {
        let str = $(elm).attr('href');
        let res = str.match(/DigitalForecast-(.*).xml/);
        if (res[1] != 'Indonesia') {
          list.push(res[1]);
        }
      });
      
      // get per province data
      let allAreas = [];
      tree = new kdTree([], distance, ["latitude", "longitude"]);

      await Promise.all(list.map(async(prov) => {
        let resprov = await getDataProvince(prov);
        resprov.areas.map(area => {
          tree.insert(area);
        });
        allAreas = allAreas.concat(resprov.areas);
      }));

      wCache.set(key, allAreas, 300);
      return allAreas;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  } 
  return result;
};

/**
 * Config response error by error object
 * @param Error error
 * @param Response res 
 * @returns Response
 */
 const responseError = (error, res) => {
  if (error.response.status === 404) {
    return res.status(404).send(responseCreator({ message: 'Not found' }));
  }

  return res
    .status(500)
    .send(responseCreator({ message: 'Something went wrong' }));
};

const processByLocation = (lat, lon) => {
  if (lat != null && lon != null) {
    let area = {};
    let idx = -1;

    point = {latitude: lat, longitude: lon};
    near = tree.nearest(point, 1);
    area = near[0][0];
    idx = 1;

    // const diff = process.hrtime(time);
    // console.log(diff);
    
    // return closes location
    if (idx >= 0) {
      return area;
    }
  }

  return false;
};

/**
 * Handle request bmkg open data by province
 * @param Request req need req.params.province
 * @param Response res 
 * @returns Response
 */
const getByProvince = async (req, res) => {
  let result = undefined;
  let { province } = req.params;

  // if get by location
  loc = processByLocation(req.query.lat, req.query.lon);
  if (loc !== false) {
    return res
      .status(200)
      .send(responseCreator({ data: loc }));
  }

  try {
    result = await getDataProvince(province);
  } catch (error) {
    return responseError(error, res);
  }

  return res
    .status(200)
    .send(responseCreator({ data: result }));
};


/**
 * Handle request from bmkg open data by city
 * @param Request req need req.params.province & req.params.city
 * @param Response res 
 * @returns Response
 */
const getByCity = async (req, res) => {
  const { province, city } = req.params;
  let resultprov = undefined;

  try {
    resultprov = await getDataProvince(province);
  } catch (error) {
    return responseError(error, res);
  }
  
  const weatherByCity = resultprov.areas.find(
    (area) => area.description == toUpperFirstLetterWords(city, '-', ' ')
  );

  if (!weatherByCity) {
    return res.status(404).send(responseCreator({ message: 'Not found' }));
  }

  return res.status(200).send(responseCreator({ data: weatherByCity }));
};

/**
 * Handle request bmkg open data scan all data
 * @param Request req need req.params.province
 * @param Response res 
 * @returns Response
 */
const getScanAll = async (req, res) => {
  let result = undefined;
  const time = process.hrtime();

  // if get by location
  loc = processByLocation(req.query.lat, req.query.lon);
  if (loc !== false) {
    return res
      .status(200)
      .send(responseCreator({ data: loc }));
  }
  
  try {
    result = await getDataScanAll(); 
  } catch (error) {
    return responseError(error, res);
  }

  return res
    .status(200)
    .send(responseCreator({ data: result }));
};

/**
 * Get data param with paramId from area
 * @param string strtime 
 * @param Object area
 * @returns Response
 */
const processParam = async(strtime, area) => {
  let temp;
  let weather;
  let ws;
  let wd;
  let hu;
  for (i = 0; area.params.length > i; i++) {
    val = area.params[i];
    if (val.id == 't') {
      temp = val;
    }
    if (val.id == 'weather') {
      weather = val;
    }
    if (val.id == 'ws') {
      ws = val;
    }
    if (val.id == 'wd') {
      wd = val;
    }
    if (val.id == 'hu') {
      hu = val;
    }
  };
  let j = 0
  for (j; temp.times.length > j; j++) {
    let tm = temp.times[j];
    if (tm.datetime > strtime) {
      break;
    }
  }
  j = j-1;

  return {
    'idx': j, 
    'vt': temp.times[j],
    'vweather': weather.times[j], 
    'vws': ws.times[j], 
    'vwd': wd.times[j],
    't': temp, 
    'weather': weather, 
    'ws': ws, 
    'wd': wd,
    'hu': hu,
  };
};

/**
 * Handle request serve widget weather image data
 * @param Request req need req.params.province & req.params.city
 * @param Response res 
 * @returns Response
 */
const getWidget = async (req, res) => {
  const width = req.query.width ? parseInt(req.query.width):400;
  const height = req.query.height ? parseInt(req.query.height):70;
  const bgcolor = req.query.bgcolor ? req.query.bgcolor:'#1D3051';
  const fillcolor = req.query.fillcolor ? req.query.fillcolor:'rgba(255,255,255,0.5)';
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  let text = '';

  // get area
  // if get by location
  let area = processByLocation(req.query.lat, req.query.lon);
  if (area == false) {
    return responseError(404, res);
  }

  let now = new Date();
  let strtime = dateFormat(now);
  let result = await processParam(strtime, area);

  // set background
  ctx.fillStyle = bgcolor;
  ctx.fillRect(0, 0, width, height, 50);
  ctx.fillStyle = fillcolor;

  let celciusHeight = parseInt(height/2);
  let humidityHeight = parseInt(height/5);

  let wicon = await loadImage('assets/'+result.vweather.code+'.svg');
  ctx.drawImage(wicon, 10, 0, height-20, height-20);

  // write degree
  
  let celcius = result.vt.celcius.split(' ');
  celcius = celcius[0] + '°' + celcius[1];
  ctx.font = celciusHeight + 'px Arial';
  text = ctx.measureText(celcius);
  ctx.fillText(celcius, height, height - parseInt((height - celciusHeight)/2) - (2*text.emHeightDescent));

  // write humidity
  let wtime = timeStrDate(result.vt.datetime);
  let huicon = await loadImage('assets/hu.svg');
  let huval = result.hu.times[result.idx].value;
  ctx.font = humidityHeight + 'px Arial';
  text = ctx.measureText(huval);
  // console.log(text, humidityHeight, height - humidityHeight - 10, height - humidityHeight + text.emHeightDescent);
  let posx = 10;
  ctx.drawImage(huicon, posx, height - humidityHeight - 8, humidityHeight, humidityHeight);
  posx += humidityHeight;
  ctx.fillText(huval, posx, height - 10); //text.emHeightDescent
  posx += text.width + 5;

  // write wind speed
  let wsicon = await loadImage('assets/ws.svg');
  let wsval = result.ws.times[result.idx].kph + ' kph';
  text = ctx.measureText(wsval);
  
  ctx.drawImage(wsicon, posx, height - humidityHeight - 8, humidityHeight, humidityHeight);
  posx += humidityHeight + 3;
  ctx.fillText(wsval, posx, height - 10); //text.emHeightDescent

  // write wind direction
  let wdicon = await loadImage('assets/wd.svg');
  let wdval = result.wd.times[result.idx].card.split(' ');
  wdval = wdval[0];
  posx += text.width + 5;
  ctx.drawImage(wdicon, posx, height - humidityHeight - 8, humidityHeight, humidityHeight);
  posx += humidityHeight + 3;
  ctx.fillText(wdval, posx, height - 10); //text.emHeightDescent
  
  // write city
  let cityHeight = parseInt(celciusHeight * 0.9);
  ctx.font = cityHeight + 'px Impact';
  let city = area.description;
  text = ctx.measureText(city);
  // console.log('city', cityHeight, parseInt((height - cityHeight)/2), height - parseInt(height - cityHeight) , text);
  ctx.fillText(city, width - text.width - 10, height - Number(text.actualBoundingBoxAscent)-10);

  // write weather
  let weatherHeight = parseInt(cityHeight * 0.5);
  ctx.font = weatherHeight + 'px Impact';
  let weather = result.vweather.name;
  text = ctx.measureText(weather);
  ctx.fillText(weather, width - text.width - 10, height - Number(text.actualBoundingBoxAscent));

  stream = canvas.createPNGStream();
  stream.on('end', () => res.end());
  stream.pipe(res);
 };

/**
 * Handle request serve detail wather data
 * @param Request req need req.params.province & req.params.city
 * @param Response res 
 * @returns Response
 */
 const getDetail = async (req, res) => {
};

// init data
getDataScanAll();

module.exports = { getByProvince, getByCity, getScanAll, getWidget, getDetail };
