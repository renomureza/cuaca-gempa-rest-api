const axios = require('axios');
const xmlJs = require('xml-js');
const ncache = require( "node-cache" );
const geolib = require('geolib');
const cheerio = require('cheerio');
const toUpperFirstLetterWords = require('../utils/toUpperFirstLetterWords');
const refactJsonWeather = require('../utils/refactJsonWeather');
const responseCreator = require('../utils/responseCreator');
const { kdTree } = require('../utils/kdTree');
const wCache = new ncache({ stdTTL: 100, checkperiod: 120 });

/**
 * calculate distance
 */
const distance = (a, b) => {
  // console.log(a, b);
  return geolib.getDistance({lat: a.latitude,lon: a.longitude},{lat: b.latitude, lon: b.longitude});
};

let points = [];
var tree = new kdTree(points, distance, ["latitude", "longitude"]);

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
  // console.log(result);
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
      tree = new kdTree(points, distance, ["latitude", "longitude"]);

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

    // let min = 0;
    // for (let i = 0; i < areas.length; i++) {
    //   area = areas[i];
    //   let dis = geolib.getDistance({lat: area.latitude,lon: area.longitude},{lat: req.query.lat, lon: req.query.lon});
    //   if (i == 0 || min > dis) {
    //     idx = i;
    //     min = dis;
    //   }
    // }
    // if (idx >= 0) {
    //   area = areas[idx];
    // }


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

// init data
getDataScanAll();

module.exports = { getByProvince, getByCity, getScanAll };
