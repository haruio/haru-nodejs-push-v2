/**
 * Created by syntaxfish on 15. 9. 29..
 */
var request = require('request');

var config = require('config').get('Moncast.account');


exports.count = function(condition, callback) {
    request(config.host+'/devices/count' + _jsonToQueryString(condition), function (err, res, body) {
        if(err) return callback(err);

        callback(err, JSON.parse(body).count);
    });
};

exports.find = function(condition, skip, limit, callback) {
    request(config.host+'/devices' + _jsonToQueryString(condition), function (err, res, body) {
        if(err) return callback(err);

        callback(err, JSON.parse(body));
    });
};

exports.updateRegistrationIds = function(devicesUpdateRegistrationIds, callback) {
    request.put(config.host+'/devices').form({ids: devicesUpdateRegistrationIds});
};

exports.removeRegistrationIds = function(devicesUpdateRegistrationIds, callback) {
    request.post(config.host+'/devices/remove').form({ids: devicesUpdateRegistrationIds});
};

function _jsonToQueryString(json){
    return "?page=1&pageSize=10";
};