var express = require('express');
var router = express.Router();
var push = require('../../controller/v2/push');

router.post('/', push.send);

module.exports = router;
