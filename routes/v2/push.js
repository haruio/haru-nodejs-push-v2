var express = require('express');
var router = express.Router();
var push = require('../../controller/v2/push');

router.post('/', push.send);
router.get('/', push.pushList);
router.get('/:id', push.getPush);


router.post('/reservation/:id', push.sendImmediately);
router.delete('/reservation/:id', push.cancelReserveNotification);
router.put('/reservation/:id', push.updateReserveNotification);



module.exports = router;
