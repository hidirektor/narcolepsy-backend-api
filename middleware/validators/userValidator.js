const joi = require('joi');
const HttpStatusCode = require('http-status-codes');
const CommonValidator = require('./commonValidator');
const roles = require('../../models/roles');

class UserValidator extends CommonValidator {
    constructor() {
        super();
    }

    static async find(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.required(),
                    isActive: joi.boolean()
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }

    static async findByUserName(req, res, next) {
        try {
            await joi
                .object({
                    userName: joi.required(),
                    isActive: joi.boolean()
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }

    static async update(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.required(),
                    userName: joi.string().max(100),
                    userData: joi.required(),
                    nameSurname: joi
                        .string()
                        .max(100)
                        .pattern(new RegExp('^[A-Za-zÇçÖöŞşÜüĞğİı ]+$')),
                    eMail: joi.string().email().max(100),
                    phoneNumber: joi.string().min(10).max(15),
                    companyName: joi.string().max(100),
                    isActive: joi.boolean(),
                    password: joi.string()
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }

    static async insert(req, res, next) {
        try {
            await joi
                .object({
                    userName: joi.string().max(100).required(),
                    nameSurname: joi
                        .string()
                        .max(100)
                        .pattern(new RegExp('^[A-Za-zÇçÖöŞşÜüĞğİı ]+$'))
                        .required(),
                    eMail: joi.string().email().max(100).required(),
                    phoneNumber: joi.string().min(10).max(15).required(),
                    companyName: joi.string().max(100).required(),
                    userType: joi
                        .string()
                        .valid(roles.SYSOP, roles.ENGINEER, roles.TECHNICIAN, roles.NORMAL)
                        .required(),
                    password: joi.string().max(99).required(),
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }

    static async otpVerification(req, res, next) {
        try {
            await joi
                .object({
                    otp: joi.string().length(6).required(),
                    otpSentTime: joi.number().required(),
                    userName: joi.string().required()
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }
}

module.exports = UserValidator;