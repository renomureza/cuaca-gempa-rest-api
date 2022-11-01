const axios = require('axios');
const xmlJs = require('xml-js');
const ncache = require( "node-cache" );
const geolib = require('geolib');
const toUpperFirstLetterWords = require('../utils/toUpperFirstLetterWords');
const refactJsonWeather = require('../utils/refactJsonWeather');
const responseCreator = require('../utils/responseCreator');
const wCache = new ncache({ stdTTL: 100, checkperiod: 120 });

/**
 * Handle request bmkg open data by province
 * @param Request req need req.params.province
 * @param Response res 
 * @returns Response
 */
const getByProvince = async (req, res) => {
  let result = undefined;
  
  try {
    result = await getDataProvince(req, res);
  } catch (error) {
    return responseError(error, res);
  }

  if (req.query.lat != null && req.query.lon != null) {
    let idx = -1;
    let min = 0;
    for (let i = 0; i < result.areas.length; i++) {
      area = result.areas[i];
      let dis = geolib.getDistance({lat: area.latitude,lon: area.longitude},{lat: req.query.lat, lon: req.query.lon});
      if (i == 0 || min > dis) {
        idx = i;
        min = dis;
      }
    }

    // return closes location
    if (idx >= 0) {
      return res.status(200).send(responseCreator({ data: result.areas[idx] }));
    }
  }

  return res
    .status(200)
    .send(responseCreator({ data: result }));
};

/**
 * Extract data from bmkg open data by province, cache if applicable
 * @param Request req need req.params.province
 * @param Response res 
 * @returns Response
 */
const getDataProvince = async(req, res) => {
  const { province } = req.params;
  let result = undefined;

  result = wCache.get(province);
  if (result == undefined) {
    try {
      result = await axios.get(
        `https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-${toUpperFirstLetterWords(
          province
        )}.xml`
      );
  
      const weathers = xmlJs.xml2js(result.data, { compact: true, spaces: 2 });
      const refactoredJsonWeathers = refactJsonWeather(weathers);
      wCache.set(province, refactoredJsonWeathers);
  
      return refactoredJsonWeathers;
    } catch (error) {
      // console.log('error', error);
      throw error;
    }
  } 
  return result;
}

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
    resultprov = await getDataProvince(req, res);
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


module.exports = { getByProvince, getByCity };
