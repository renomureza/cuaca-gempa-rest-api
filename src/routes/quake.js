const router = require('express').Router();
const controller = require('../controllers/quake');

router.get('/', controller.get);

module.exports = router;
