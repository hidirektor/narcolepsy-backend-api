const joi = require('joi');
const HttpStatusCode = require('http-status-codes');

class PremiumValidator {
    constructor() {}

    static getAllPremiumPackages(req, res, next) {
        return next();
    }

    static getPremiumPackage(req, res, next) {
        const schema = joi.object({
            packageID: joi.string().guid({ version: 'uuidv4' }).required()
        });

        const { error } = schema.validate(req.params);

        if (error) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send(error.message);
        }

        next();
    }

    static createPremiumPackage(req, res, next) {
        const schema = joi.object({
            packageName: joi.string().min(1).max(100).required(),
            packageDescription: joi.string().min(1).max(100).required(),
            packagePrice: joi.number()
                .precision(2)
                .min(0)
                .required()
                .messages({
                    'number.base': '"packagePrice" bir sayı olmalıdır.',
                    'number.precision': '"packagePrice" en fazla 2 ondalık basamak içerebilir.',
                    'number.min': '"packagePrice" sıfırdan büyük veya eşit olmalıdır.',
                    'any.required': '"packagePrice" zorunludur.'
                }),
            packageTime: joi.number()
                .integer()
                .min(1)
                .required()
                .messages({
                    'number.base': '"packageTime" bir sayı olmalıdır.',
                    'number.integer': '"packageTime" tam sayı olmalıdır.',
                    'number.min': '"packageTime" en az 1 olmalıdır.',
                    'any.required': '"packageTime" zorunludur.'
                }),
        });

        schema.validateAsync(req.body)
            .then(() => next())
            .catch(err => {
                res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
            });
    }

    static updatePremiumPackage(req, res, next) {
        const schema = joi.object({
            packageID: joi.string().guid({ version: 'uuidv4' }).required(),
            packageName: joi.string().min(1).max(100).required(),
            packageDescription: joi.string().min(1).max(100).required(),
            packagePrice: joi.number()
                .precision(2)
                .min(0)
                .required()
                .messages({
                    'number.base': '"packagePrice" bir sayı olmalıdır.',
                    'number.precision': '"packagePrice" en fazla 2 ondalık basamak içerebilir.',
                    'number.min': '"packagePrice" sıfırdan büyük veya eşit olmalıdır.',
                    'any.required': '"packagePrice" zorunludur.'
                }),
            packageTime: joi.number()
                .integer()
                .min(1)
                .required()
                .messages({
                    'number.base': '"packageTime" bir sayı olmalıdır.',
                    'number.integer': '"packageTime" tam sayı olmalıdır.',
                    'number.min': '"packageTime" en az 1 olmalıdır.',
                    'any.required': '"packageTime" zorunludur.'
                }),
        });

        schema.validateAsync(req.body)
            .then(() => next())
            .catch(err => {
                res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
            });
    }

    static deletePremiumPackage(req, res, next) {
        const schema = joi.object({
            packageID: joi.string().guid({ version: 'uuidv4' }).required()
        });

        const { error } = schema.validate(req.params);
        if (error) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send(error.message);
        }

        next();
    }

    static async confirmDeletePremiumPackage(req, res, next) {
        try {
            await joi
                .object({
                    operationKey: joi.string()
                        .max(100)
                        .required(),
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }
}

module.exports = PremiumValidator;
