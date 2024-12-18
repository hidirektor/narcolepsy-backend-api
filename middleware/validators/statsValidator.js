const joi = require('joi');
const HttpStatusCode = require('http-status-codes');

class StatsValidator {
    static async getStats(req, res, next) {
        try {
            await joi
                .object({
                    statType: joi
                        .string()
                        .valid('comic', 'episode', 'category', 'season')
                        .required(),
                    type: joi
                        .string()
                        .valid('rates', 'views', 'downloads', 'comments')
                        .required(),
                    id: joi.string().uuid().required(),
                })
                .validateAsync({
                    statType: req.params.statType,
                    type: req.params.type,
                    id: req.params.id,
                });

            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }

    // Validator for user-specific stats
    static async getUserStats(req, res, next) {
        try {
            await joi
                .object({
                    statType: joi
                        .string()
                        .valid('downloads', 'ratings', 'comments')
                        .required(),
                    type: joi
                        .string()
                        .valid('comic', 'episode')
                        .required(),
                    id: joi.string().uuid().required(),
                    userID: joi.string().uuid().required(),
                })
                .validateAsync({
                    statType: req.params.statType,
                    type: req.params.type,
                    id: req.params.id,
                    userID: req.body.userID,
                });

            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }
}

module.exports = StatsValidator;
