const refactJsonQuake = (quake = {}) => {
  const result = {};

  for (const key in quake.Infogempa.gempa) {
    if (key === 'Shakemap') {
      result[
        key.toLowerCase()
      ] = `https://data.bmkg.go.id/DataMKG/TEWS/${quake.Infogempa.gempa[key]}`;

      continue;
    }

    result[key.toLowerCase()] = quake.Infogempa.gempa[key];
  }

  return result;
};

module.exports = refactJsonQuake;
