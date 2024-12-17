const joi = require('joi');
const HttpStatusCode = require('http-status-codes');
const {isValidPhoneNumber, parsePhoneNumberWithError} = require('libphonenumber-js');
const {User} = require("../../models");

class UserActionsValidator {
    constructor() {
    }

    static async follow(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.string().uuid().required(),
                    comicID: joi.string().uuid().optional(),
                    categoryID: joi.string().uuid().optional()
                })
                .xor('comicID', 'categoryID')
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    static async unfollow(req, res, next) {
        return UserActionsValidator.follow(req, res, next);
    }

    // Rate episode
    static async rateEpisode(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.string().uuid().required(),
                    episodeID: joi.string().uuid().required(),
                    userRating: joi.number().min(1).max(5).required()
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    // Edit episode rate
    static async editEpisodeRate(req, res, next) {
        return UserActionsValidator.rateEpisode(req, res, next);
    }

    static async deleteEpisodeRate(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.string().uuid().required(),
                    episodeID: joi.string().uuid().required()
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    // Comment on episode
    static async commentEpisode(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.string().uuid().required(),
                    episodeID: joi.string().uuid().required(),
                    userComment: joi.string().min(1).required()
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    // Edit episode comment
    static async editEpisodeComment(req, res, next) {
        return UserActionsValidator.commentEpisode(req, res, next);
    }

    static async deleteEpisodeComment(req, res, next) {
        try {
            await joi
                .object({
                    userID: joi.string().uuid().required(),
                    commentID: joi.string().uuid().required()
                })
                .validateAsync(req.body);
            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    // Get comment by ID
    static async getCommentByID(req, res, next) {
        try {
            await joi
                .object({
                    commentID: joi.string().uuid().required()
                })
                .validateAsync(req.params);
            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    // Get all comments by episode ID
    static async getAllCommentsByEpisode(req, res, next) {
        try {
            await joi
                .object({
                    episodeID: joi.string().uuid().required()
                })
                .validateAsync(req.params);
            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

}

module.exports = UserActionsValidator;