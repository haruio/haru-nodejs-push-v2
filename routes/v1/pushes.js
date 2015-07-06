var express = require('express');
var router = express.Router();

var data = require('../../controller/v1/data');

router.get('/', data.pushes);
router.get('/count', data.pushCnt);

module.exports = router;
