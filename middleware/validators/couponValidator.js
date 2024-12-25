const joi = require('joi');
const HttpStatusCode = require('http-status-codes');

class CouponValidator {
    constructor() {}

    static async createCoupon(req, res, next) {
        try {
            await joi
                .object({
                    packageID: joi.string().uuid().optional(),
                    salePercent: joi.number().min(1).max(100).optional(),
                })
                .xor('packageID', 'salePercent')
                .validateAsync(req.body);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).send(error.message);
        }
    }

    static async editCoupon(req, res, next) {
        try {
            await joi
                .object({
                    couponID: joi.string().uuid().required(),
                    packageID: joi.string().uuid().optional(),
                    salePercent: joi.number().min(1).max(100).optional(),
                })
                .xor('packageID', 'salePercent')
                .validateAsync(req.body);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).send(error.message);
        }
    }

    static async deleteCoupon(req, res, next) {
        try {
            await joi
                .object({
                    couponID: joi.string().uuid().required(),
                })
                .validateAsync(req.params);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).send(error.message);
        }
    }

    static async confirmDeleteCoupon(req, res, next) {
        try {
            await joi
                .object({
                    couponID: joi.string().uuid().required(),
                })
                .validateAsync(req.body);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).send(error.message);
        }
    }

    static async getUsedOrders(req, res, next) {
        try {
            await joi
                .object({
                    couponID: joi.string().uuid().required(),
                })
                .validateAsync(req.body);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).send(error.message);
        }
    }
}

module.exports = CouponValidator;