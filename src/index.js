require('dotenv').config();
const app = require('express')();
const weatherRoute = require('./routes/weather');
const quakeRoute = require('./routes/quake');
const responseCreator = require('./utils/responseCreator');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || '';

app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
  next();
});

app.use('/weather', weatherRoute);
app.use('/quake', quakeRoute);

app.get('/', (req, res) => {
  return res.status(200).send({
    maintainer: 'Renova Muhamad Reza',
    source: 'https://github.com/renomureza/cuaca-gempa-rest-api',
    endpoint: {
      quake: `${BASE_URL}/quake`,
      weather: {
        province: {
          example: `${BASE_URL}/weather/jawa-barat`,
        },
        city: {
          example: `${BASE_URL}/weather/jawa-barat/bandung`,
        },
      },
    },
  });
});

app.all('*', (req, res) => {
  return res.status(404).send(responseCreator({ message: 'Not found' }));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
