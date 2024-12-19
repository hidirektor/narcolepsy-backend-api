const joi = require('joi');
const HttpStatusCode = require('http-status-codes');

class AuthorizedValidator {
    constructor() {}

    static async addUser(req, res, next) {
        try {
            await joi
                .object({
                    userName: joi.string().max(100).required(),
                    userSurname: joi.string().max(100).required(),
                    eMail: joi.string().email().required(),
                    nickName: joi.string().max(50).required(),
                    phoneNumber: joi.string().max(15).required(),
                    countryCode: joi.string().max(5).required(),
                    password: joi.string().min(6).required(),
                    birthDate: joi.string().max(50).required(),
                    userType: joi.string().valid('USER', 'PREMIUM', 'MODERATOR', 'EDITOR', 'SUPPORT', 'SYSOP').required(),
                })
                .validateAsync(req.body);

            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).send(error.message);
        }
    }

    static async editUser(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.string().uuid().required(),
                    userName: joi.string().max(100).optional(),
                    userSurname: joi.string().max(100).optional(),
                    eMail: joi.string().email().optional(),
                    nickName: joi.string().max(50).optional(),
                    phoneNumber: joi.string().max(15).optional(),
                    countryCode: joi.string().max(5).optional(),
                    password: joi.string().min(6).optional(),
                    birthDate: joi.string().max(50).optional(),
                    userType: joi.string().valid('USER', 'PREMIUM', 'MODERATOR', 'EDITOR', 'SUPPORT', 'SYSOP').optional(),
                })
                .validateAsync(req.body);

            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).send(error.message);
        }
    }

    static async deleteUser(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.string().uuid().required(),
                })
                .validateAsync(req.params);

            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).send(error.message);
        }
    }

    static async deleteEntity(req, res, next) {
        try {
            await joi
                .object({
                    id: joi.string().uuid().required(),
                })
                .validateAsync(req.params);

            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).send(error.message);
        }
    }

    static async deleteDownload(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.string().uuid().required(),
                    episodeID: joi.string().uuid().required(),
                })
                .validateAsync(req.params);

            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).send(error.message);
        }
    }
}

module.exports = AuthorizedValidator;
