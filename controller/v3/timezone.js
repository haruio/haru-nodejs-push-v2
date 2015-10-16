/**
 * Created by syntaxfish on 15. 7. 10..
 */
"use strict";
var moment_timezone = require('moment-timezone');

exports.get = function(req, res) {
    res.json(moment_timezone.tz.names());
};



