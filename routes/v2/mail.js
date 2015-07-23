/**
 * Created by syntaxfish on 15. 7. 23..
 */
var express = require('express');
var router = express.Router();


router.post('/signup', mail.signup);
router.post('/withdraw', mail.withdraw);
router.post('/resetpassword', mail.resetpassword);


module.exports = router;
