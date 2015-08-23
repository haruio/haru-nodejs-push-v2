var express = require('express');
var router = express.Router();
var timezone = require('../../controller/v2/timezone');

router.get('/', timezone.get);

module.exports = router;
