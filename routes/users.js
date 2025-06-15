var express = require('express');
var router = express.Router();
var indexControllers = require('../controllers/user/index')

/* GET users listing. */
router.get('/', indexControllers.landing);

module.exports = router;
