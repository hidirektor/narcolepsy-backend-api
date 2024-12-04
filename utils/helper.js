const crypto = require('crypto');

module.exports = {
    isEmptyCheck: (variable) => {
        if (variable === null || variable === undefined) return true;
        return false;
    },

    uuidGenerate: () => {
        return crypto.randomUUID();
    },

    base64DecodeGetFileBuffer: (base64Image) => {
        const image = Buffer.from(base64Image, "base64");
        return image;
    }
};