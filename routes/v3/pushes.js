var express = require('express');
var router = express.Router();

var data = require('../../controller/v1/data');

router.get('/', data.pushes);
router.get('/count', data.pushCnt);
router.get('/reservation', data.reservation);

module.exports = router;
