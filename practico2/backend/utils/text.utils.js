const sha1 = require('sha1');

exports.sha1Encode = (text) => {
    return sha1(text);
};
