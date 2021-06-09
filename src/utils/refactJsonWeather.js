const cardCodeToText = require('./cardCodeToText');
const weatherCodeToText = require('./weatherCodeToText');

const refactJsonWeather = (weathers = {}) => {
  let result = {};

  for (const key in weathers.data.forecast) {
    if (key === 'issue') {
      const issue = {};

      for (const issueKey in weathers.data.forecast.issue) {
        issue[issueKey] = weathers.data.forecast.issue[issueKey]['_text'];
      }

      result['issue'] = issue;

      continue;
    }

    if (key === 'area') {
      const areas = weathers.data.forecast.area.map((area, indexArea) => {
        // area

        const params = weathers.data.forecast.area[indexArea].parameter?.map(
          (parameter, indexParameter) => {
            // parameter

            const times = weathers.data.forecast.area[indexArea].parameter[
              indexParameter
            ].timerange.map((timeRange) => {
              // timerange

              const attr = parameter._attributes.id;

              if (attr === 't' || attr === 'tmax' || attr === 'tmin') {
                const celcius = timeRange.value[0]._text;
                const fahrenheit = timeRange.value[1]._text;

                return {
                  ...timeRange._attributes,
                  celcius: `${celcius} C`,
                  fahrenheit: `${fahrenheit} F`,
                };
              }

              if (attr === 'ws') {
                const kt = timeRange.value[0]._text;
                const mph = timeRange.value[1]._text;
                const kph = timeRange.value[2]._text;
                const ms = timeRange.value[3]._text;

                return {
                  ...timeRange._attributes,
                  kt,
                  mph,
                  kph,
                  ms,
                };
              }

              if (attr === 'wd') {
                const deg = timeRange.value[0]._text;
                const card = timeRange.value[1]._text;
                const sexa = timeRange.value[2]._text;

                return {
                  ...timeRange._attributes,
                  deg,
                  card: `${card} (${cardCodeToText(card)})`,
                  sexa,
                };
              }

              if (attr === 'hu' || attr === 'humin' || attr === 'humax') {
                return {
                  ...timeRange._attributes,
                  value: `${timeRange.value._text} ${timeRange.value._attributes.unit}`,
                };
              }

              // weather
              return {
                ...timeRange._attributes,
                code: `${timeRange.value._text}`,
                name: weatherCodeToText(timeRange.value._text),
              };
            });

            return {
              ...parameter._attributes,
              times,
            };
          }
        );

        return {
          ...area._attributes,
          params,
        };
      });

      result['areas'] = areas;
    }
  }

  return result;
};

module.exports = refactJsonWeather;
