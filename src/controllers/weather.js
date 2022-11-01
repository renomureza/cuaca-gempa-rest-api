const axios = require('axios');
const xmlJs = require('xml-js');
const ncache = require( "node-cache" );
const toUpperFirstLetterWords = require('../utils/toUpperFirstLetterWords');
const refactJsonWeather = require('../utils/refactJsonWeather');
const responseCreator = require('../utils/responseCreator');
const wCache = new ncache({ stdTTL: 100, checkperiod: 120 });

const getByProvince = async (req, res) => {
  let result = undefined;
  
  try {
    result = await getDataProvince(req, res);
  } catch (error) {
    return responseError(error, res);
  }

  return res
    .status(200)
    .send(responseCreator({ data: result }));
};

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
      console.log('error', error);
      throw error;
    }
  } 
  return result;
}

const responseError = (error, res) => {
  if (error.response.status === 404) {
    return res.status(404).send(responseCreator({ message: 'Not found' }));
  }
  
  return res
    .status(500)
    .send(responseCreator({ message: 'Something went wrong' }));
};

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
