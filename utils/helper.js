const crypto = require('crypto');

module.exports = {
    isEmptyCheck: (variable) => {
        if (variable === null || variable === undefined) return true;
        return false;
    },
};