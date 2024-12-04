const joi = require('joi');
const HttpStatusCode = require('http-status-codes');

class CommonValidator {
    constructor() {
    }

    static async limitAndOffset(req, res, next) {
        try {
            await joi
                .object({
                    limit: joi.number(),
                    offset: joi.number()
                })
                .with('offset', 'limit')
                .validateAsync(req.query);
            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }

    static async bodyId(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.required()
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }

    static async paramId(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.required()
                })
                .validateAsync({userID: parseInt(req.params.userID)});
            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }
}

module.exports = CommonValidator;