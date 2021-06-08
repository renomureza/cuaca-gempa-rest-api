const weatherCode = {
  0: 'Cerah',
  1: 'Cerah Berawan',
  2: 'Cerah Berawan',
  3: 'Berawan',
  4: 'Berawan Tebal',
  5: 'Udara Kabur',
  10: 'Asap',
  45: 'Kabut',
  60: 'Hujan Ringan',
  61: 'Hujan Sedang',
  63: 'Hujan Lebat',
  80: 'Hujan Lokal',
  95: 'Hujan Petir',
};

const weatherCodeToText = (code) => {
  switch (code) {
    case code >= 95:
      return weatherCode[95];
    case code >= 80:
      return weatherCode[80];
    case code >= 63:
      return weatherCode[63];
    case code == 61 || code === 60:
      return weatherCode[code];
    case code >= 45:
      return weatherCode[45];
    case code >= 10:
      return weatherCode[10];
    case code >= 5:
      return weatherCode[5];
    default:
      return weatherCode[code];
  }
};

module.exports = weatherCodeToText;
