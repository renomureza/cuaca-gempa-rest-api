const router = require('express').Router();
const controller = require('../controllers/weather');

router.get('/scanall', controller.getScanAll);
router.get('/widget', controller.getWidget);
router.get('/detail', controller.getDetail);
router.get('/:province', controller.getByProvince);
router.get('/:province/:city', controller.getByCity);

module.exports = router;
