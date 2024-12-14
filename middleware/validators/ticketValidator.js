const joi = require('joi');
const HttpStatusCode = require('http-status-codes');

class TicketValidator {
    constructor() {}

    static createTicket(req, res, next) {
        const schema = joi.object({
            eMail: joi.string()
                .email()
                .max(100)
                .required(),
            ticketType: joi.string().valid('SUGGESTION', 'PROBLEM', 'APPLY').required(),
            ticketTitle: joi.string().min(1).max(255).required(),
            ticketDescription: joi.string().min(1).max(2000).required(),
        });

        schema.validateAsync(req.body)
            .then(() => next())
            .catch(err => {
                res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
            });
    }

    static getMyTickets(req, res, next) {
        return next();
    }

    static getAllTickets(req, res, next) {
        return next();
    }

    static getTicketDetails(req, res, next) {
        const schema = joi.object({
            ticketID: joi.string().guid({ version: 'uuidv4' }).required(),
        });

        const { error } = schema.validate(req.params);

        if (error) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send(error.message);
        }

        next();
    }

    static deleteTicket(req, res, next) {
        const schema = joi.object({
            ticketID: joi.string().guid({ version: 'uuidv4' }).required(),
        });

        const { error } = schema.validate(req.params);

        if (error) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send(error.message);
        }

        next();
    }

    static replyTicket(req, res, next) {
        const paramsSchema = joi.object({
            ticketID: joi.string().guid({ version: 'uuidv4' }).required(),
        });

        const bodySchema = joi.object({
            ticketResponse: joi.string().min(1).max(2000).required(),
        });

        const paramsValidation = paramsSchema.validate(req.params);
        const bodyValidation = bodySchema.validate(req.body);

        if (paramsValidation.error) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send(paramsValidation.error.message);
        }

        if (bodyValidation.error) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send(bodyValidation.error.message);
        }

        next();
    }
}

module.exports = TicketValidator;
