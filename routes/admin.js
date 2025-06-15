var express = require('express');
var router = express.Router();
var adminControllers = require('../controllers/admin/index');

router.get('/', adminControllers.index);

module.exports = router;