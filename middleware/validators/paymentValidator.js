const joi = require('joi');
const HttpStatusCode = require('http-status-codes');

class PaymentValidator {
    constructor() {
    }

    static async startCF(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.string().max(99).required(),
                    packageID: joi.string().max(99).required(),
                    ipAddress: joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'optional' }).default('127.0.0.1')
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }
}

module.exports = AuthValidator;