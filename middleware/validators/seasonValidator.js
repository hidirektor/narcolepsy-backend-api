const joi = require('joi');
const HttpStatusCode = require('http-status-codes');

class SeasonValidator {
    constructor() {
    }

    static async createSeason(req, res, next) {
        try {
            await joi
                .object({
                    comicID: joi.string().guid({ version: 'uuidv4' }).required(),
                    seasonName: joi.string().min(1).max(255).required(),
                    seasonOrder: joi.number().integer().min(1).required(),
                })
                .validateAsync(req.body);

            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    static async editSeason(req, res, next) {
        try {
            await joi
                .object({
                    seasonID: joi.string().guid({ version: 'uuidv4' }).required(),
                    seasonName: joi.string().min(1).max(255).optional(),
                    seasonOrder: joi.number().integer().min(1).optional(),
                })
                .validateAsync(req.body);

            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    static async getAllSeasons(req, res, next) {
        next(); // Validation is not required for this endpoint
    }

    static async getSeasonByID(req, res, next) {
        try {
            await joi
                .object({
                    seasonID: joi.string().guid({ version: 'uuidv4' }).required(),
                })
                .validateAsync(req.params);

            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    static async deleteSeason(req, res, next) {
        try {
            await joi
                .object({
                    seasonID: joi.string().guid({ version: 'uuidv4' }).required(),
                })
                .validateAsync(req.params);

            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    static async confirmDeleteSeason(req, res, next) {
        try {
            await joi
                .object({
                    operationKey: joi.string().guid({ version: 'uuidv4' }).required(),
                })
                .validateAsync(req.body);

            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    static async getSeasonsByComic(req, res, next) {
        try {
            await joi
                .object({
                    comicID: joi.string().guid({ version: 'uuidv4' }).required(),
                })
                .validateAsync(req.params);

            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }
}

module.exports = SeasonValidator;