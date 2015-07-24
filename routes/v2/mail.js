/**
 * Created by syntaxfish on 15. 7. 23..
 */
var express = require('express');
var router = express.Router();
var mail = require('../../controller/v2/mail');


router.post('/', mail.send);
router.post('/signup', mail.signup);
router.post('/withdraw', mail.withdraw);
router.post('/resetpassword', mail.resetpassword);


module.exports = router;
