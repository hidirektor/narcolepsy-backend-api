const joi = require('joi');
const HttpStatusCode = require('http-status-codes');

class CategoryValidator {
    constructor() {}

    static getAllCategory(req, res, next) {
        return next();
    }

    static getCategory(req, res, next) {
        const schema = joi.object({
            categoryID: joi.string().guid({ version: 'uuidv4' }).required()
        });

        const { error } = schema.validate(req.params);

        if (error) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send(error.message);
        }

        next();
    }

    static createCategory(req, res, next) {
        const schema = joi.object({
            categoryName: joi.string().min(1).max(100).required(),
        });

        schema.validateAsync(req.body)
            .then(() => next())
            .catch(err => {
                res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
            });
    }

    static updateCategory(req, res, next) {
        const schema = joi.object({
            categoryID: joi.string().guid({ version: 'uuidv4' }).required(),
            categoryName: joi.string().min(1).max(100).required(),
        });

        schema.validateAsync(req.body)
            .then(() => next())
            .catch(err => {
                res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
            });
    }

    static deleteCategory(req, res, next) {
        const schema = joi.object({
            categoryID: joi.string().guid({ version: 'uuidv4' }).required()
        });

        const { error } = schema.validate(req.params);
        if (error) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send(error.message);
        }

        next();
    }

    static async confirmDeleteCategory(req, res, next) {
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

module.exports = CategoryValidator;
