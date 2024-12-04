const {bucketName} = require('./config');

module.exports = {
    uploadVariablesParser: req => {
        const fileMatches = req.body.File.match(
            /^data:([A-Za-z-+/]+);base64,(.+)$/
        );
        return {
            file: new Buffer.from(fileMatches[2], 'base64'),
            metaData: {'Content-Type': fileMatches[1]},
            fileName: `${new Date().getTime()}.${fileMatches[1].split('/')[1]}`,
            filePath: bucketName
        };
    }
};