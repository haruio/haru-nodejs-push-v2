/**
 * Created by syntaxfish on 15. 6. 29..
 */

exports.Push = {
    // 조건
    channels:{ required: false },
    sendType: { required: false },
    deviceType: { required: false },
    condition: { required: false },

    // payload
    link: { required: false },
    pushLinkUrl: { required: false },
    payload: { required: true },

    // 시간
    timezone: { required: true },
    publishTime: { required: false }
};