/**
 * Created by syntaxfish on 15. 6. 29..
 */

exports.Push = {
    condition: {
        required: false,
        type: 'object'
    },
    timezone: {
        required: true,
        validate: function (timezone) {
            return true;
        }
    },
    pushTime: {
        required: false,
        type: 'string',
        validate: function (pushTime) {
            return true;
        }
    },
    data: {
        required: true,
        type: 'object',
        properties: {
            message: {}
        }

    },
    options: {
        required: true,
        type: 'object',
        properties: {
            alert: {},
            badge: {},
            sound: {},
            title: {},
            action: {}
        }
    }
};

