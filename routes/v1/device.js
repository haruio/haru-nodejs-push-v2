var express = require('express');
var router = express.Router();
var data = require('../../controller/v1/data');
var subscribe = require('../../controller/v1/subscribe');


router.post('/subscribe', subscribe.validate(['uuid', 'pushType', 'deviceType', 'deviceToken']), subscribe.sub);
router.post('/unsubscribe', subscribe.unsub);
router.post('/update', subscribe.validate(['uuid']), subscribe.update);

router.post('/user', subscribe.validate(['uuid', 'user']), subscribe.registerUser);
router.delete('/user', subscribe.validate(['uuid', 'user']), subscribe.unregisterUser);

router.post('/channels', subscribe.validate(['user', 'channels']), subscribe.registerChannels);
router.delete('/channels', subscribe.validate(['user', 'channels']), subscribe.unregisterChannels);

router.get('/count', data.deviceCnt);

module.exports = router;
