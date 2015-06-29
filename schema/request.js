/**
 * Created by syntaxfish on 15. 6. 29..
 */

exports.Push = {
    condition: {
        required: false,
        type: 'object'
    },
    pushTime: {
        required: false
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

