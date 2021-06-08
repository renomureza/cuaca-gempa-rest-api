require('dotenv').config();
const app = require('express')();
const weatherRoute = require('./routes/weather');
const quakeRoute = require('./routes/quake');
const responseCreator = require('./utils/responseCreator');

const PORT = process.env.PORT || 3000;

app.use('/weather', weatherRoute);
app.use('/quake', quakeRoute);

app.use('*', (req, res) => {
  return res.status(404).send(responseCreator({ message: 'Not found' }));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
