module.exports = {
    sha1Encode: (str) => {
        const sha1 = require('sha1');
        return sha1(str);
    }
};
