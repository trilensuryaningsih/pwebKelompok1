var express = require('express');
var router = express.Router();
var indexControllers = require('../controllers/index/index');

router.get('/', indexControllers.index);

module.exports = router;
