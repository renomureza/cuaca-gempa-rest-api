const router = require('express').Router();
const controller = require('../controllers/weather');

router.get('/:province', controller.getByProvince);
router.get('/:province/:city', controller.getByCity);

module.exports = router;
