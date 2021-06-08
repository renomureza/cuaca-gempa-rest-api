const { default: axios } = require('axios');
const refactJsonQuake = require('../utils/refactJsonQuake');
const responseCreator = require('../utils/responseCreator');

const get = async (req, res) => {
  try {
    const response = await axios.get(
      'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json'
    );

    const refactoredJson = refactJsonQuake(response.data);

    return res.status(200).send(responseCreator({ data: refactoredJson }));
  } catch (error) {
    return res
      .status(500)
      .send(responseCreator({ message: 'Something went wrong' }));
  }
};

module.exports = { get };
