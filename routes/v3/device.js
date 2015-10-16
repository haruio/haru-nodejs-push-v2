var express = require('express');
var router = express.Router();
var data = require('../../controller/v1/data');

router.get('/count', data.deviceCnt);

module.exports = router;
