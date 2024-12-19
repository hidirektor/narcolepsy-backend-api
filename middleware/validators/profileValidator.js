const joi = require('joi');
const HttpStatusCode = require('http-status-codes');
const {isValidPhoneNumber, parsePhoneNumberWithError} = require('libphonenumber-js');
const {User} = require("../../models");

class ProfileValidator {
    constructor() {}

    static async getProfile(req, res, next) {
        try {
            await joi
                .object({
                    eMail: joi.string().email().max(100)
                        .when('phoneNumber', {
                            is: joi.exist(),
                            then: joi.forbidden(),
                            otherwise: joi.required()
                        }),
                    phoneNumber: joi.string().custom((value, helpers) => {
                        const { countryCode } = req.body;

                        if (countryCode && value) {
                            const fullPhoneNumber = countryCode + value;

                            if (!isValidPhoneNumber(fullPhoneNumber)) {
                                return helpers.message('Phone number is not valid');
                            }
                        }

                        return value;
                    }),
                    countryCode: joi.string()
                        .min(1)
                        .max(5)
                        .when('phoneNumber', {
                            is: joi.exist(),
                            then: joi.required(),
                            otherwise: joi.forbidden()
                        }),
                })
                .validateAsync(req.body);

            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }

    static async updateProfile(req, res, next) {
        try {
            await joi
                .object({
                    eMail: joi.string().email().max(100)
                        .when('phoneNumber', {
                            is: joi.exist(),
                            then: joi.forbidden(),
                            otherwise: joi.required()
                        }),
                    phoneNumber: joi.string().custom((value, helpers) => {
                        const { countryCode } = req.body;

                        if (countryCode && value) {
                            const fullPhoneNumber = countryCode + value;

                            if (!isValidPhoneNumber(fullPhoneNumber)) {
                                return helpers.message('Phone number is not valid');
                            }
                        }

                        return value;
                    }),
                    countryCode: joi.string()
                        .min(1)
                        .max(5)
                        .when('phoneNumber', {
                            is: joi.exist(),
                            then: joi.required(),
                            otherwise: joi.forbidden()
                        }),
                    userName: joi.string()
                        .min(5)
                        .max(100).optional(),
                    userSurname: joi.string()
                        .min(5)
                        .max(100).optional(),
                    nickName: joi.string()
                        .min(5)
                        .max(100).optional(),
                    birthDate: joi.string()
                        .min(5)
                        .max(100).optional(),
                    language: joi.string()
                        .min(2)
                        .max(10).optional(),
                    themeColor: joi.string()
                        .min(2)
                        .max(10).optional(),
                    pushNotification: joi.boolean()
                        .optional(),
                    mailNotification: joi.boolean()
                        .optional(),
                })
                .validateAsync(req.body);

            next();
        } catch (err) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(err.message);
        }
    }
}

module.exports = ProfileValidator;