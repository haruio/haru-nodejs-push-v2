/**
 * Created by syntaxfish on 15. 6. 29..
 */
var _ = require('underscore');
var moment = require('moment');


var isValid = exports.isValid = function(json, schema) {
    var properties = Object.keys(schema);

    for (var i = 0; i < properties.length; i++) {
        var key = properties[i];
        var value = schema[key];

        if(value.required && json[key] == undefined) { return false; }
        else if(json[key] == undefined) { continue; }

        if(value.type) {
            if(value.type === 'array' && !_.isArray(json[key])) {
                return false;
            } else if(value.type === 'date' && !moment.isDate(json[key])) {
                return false;
            } else if((typeof json[key]).toLowerCase() !== value.type){
                return false;
            }
        }

        if(value.properties) {
            var nested = isValid(json[key], value.properties);
            if(!nested) { return nested; }
        }

        if(typeof schema[key].validate === 'function') {
            var customValidate = schema[key].validate(json[key]);
            if(!customValidate) { return false; }
        }
    }

    return true;
};


