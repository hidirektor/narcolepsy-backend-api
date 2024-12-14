const joi = require('joi');
const HttpStatusCode = require('http-status-codes');
const CommonValidator = require("./commonValidator");

class TicketValidator extends CommonValidator {
    constructor() {
        super();
    }

    static createTicket(req, res, next) {
        const schema = joi.object({
            eMail: joi.string().email().required(),
            ticketType: joi.string().valid('SUGGESTION', 'PROBLEM', 'APPLY').required(),
            ticketTitle: joi.string().min(1).max(255).required(),
            ticketDescription: joi.string().min(1).max(2000).required(),
            comicID: joi.string().min(1).max(2000).optional(),
            episodeID: joi.string().min(1).max(2000).optional(),
        });

        schema.validateAsync(req.body)
            .then(() => next())
            .catch(err => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static createTicketWithAttachment(req, res, next) {
        const { eMail, ticketType, ticketTitle, ticketDescription } = req.body;

        if (!eMail || !ticketType || !ticketTitle || !ticketDescription) {
            return res.status(HttpStatusCode.BAD_REQUEST).send('Missing required fields');
        }

        if (!req.files || req.files.length < 1 || req.files.length > 3) {
            return res.status(HttpStatusCode.BAD_REQUEST).send('You must upload between 1 and 3 attachments');
        }

        const fileNames = req.files.map(file => file.originalname);
        const hasDuplicates = new Set(fileNames).size !== fileNames.length;

        if (hasDuplicates) {
            return res.status(HttpStatusCode.BAD_REQUEST).send('Duplicate file names are not allowed');
        }

        next();
    }

    static replyTicket(req, res, next) {
        const schema = joi.object({
            eMail: joi.string().email().required(),
            ticketID: joi.string().guid({ version: 'uuidv4' }).required(),
            ticketResponse: joi.string().min(1).max(2000).required()
        });

        schema.validateAsync(req.body)
            .then(() => next())
            .catch(err => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static replyTicketWithAttachment(req, res, next) {
        const { eMail, ticketID, ticketResponse } = req.body;

        if (!eMail || !ticketID || !ticketResponse) {
            return res.status(HttpStatusCode.BAD_REQUEST).send('Missing required fields');
        }

        if (!req.files || req.files.length < 1 || req.files.length > 3) {
            return res.status(HttpStatusCode.BAD_REQUEST).send('You must upload between 1 and 3 attachments');
        }

        const fileNames = req.files.map(file => file.originalname);
        const hasDuplicates = new Set(fileNames).size !== fileNames.length;

        if (hasDuplicates) {
            return res.status(HttpStatusCode.BAD_REQUEST).send('Duplicate file names are not allowed');
        }

        next();
    }

    static deleteTicket(req, res, next) {
        const schema = joi.object({
            ticketID: joi.string().guid({ version: 'uuidv4' }).required()
        });

        schema.validateAsync(req.params)
            .then(() => next())
            .catch(err => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static confirmDeleteTicket(req, res, next) {
        const schema = joi.object({
            operationKey: joi.string().guid({ version: 'uuidv4' }).required()
        });

        schema.validateAsync(req.body)
            .then(() => next())
            .catch(err => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static getAllTickets(req, res, next) {
        const schema = joi.object({
            status: joi.string().valid('CREATED', 'ANSWERED', 'CUSTOMER_RESPONSE', 'CLOSED').optional()
        });

        schema.validateAsync(req.query)
            .then(() => next())
            .catch(err => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static getTicketByID(req, res, next) {
        const schema = joi.object({
            ticketID: joi.string().guid({ version: 'uuidv4' }).required()
        });

        schema.validateAsync(req.params)
            .then(() => next())
            .catch(err => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static getResponseByID(req, res, next) {
        const schema = joi.object({
            responseID: joi.string().guid({ version: 'uuidv4' }).required()
        });

        schema.validateAsync(req.params)
            .then(() => next())
            .catch(err => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static getResponsesByTicketID(req, res, next) {
        const schema = joi.object({
            ticketID: joi.string().guid({ version: 'uuidv4' }).required()
        });

        schema.validateAsync(req.params)
            .then(() => next())
            .catch(err => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static getUserTickets(req, res, next) {
        const schema = joi.object({
            eMail: joi.string().email().required()
        });

        schema.validateAsync(req.params)
            .then(() => next())
            .catch(err => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static closeTicket(req, res, next) {
        const schema = joi.object({
            ticketID: joi.string().guid({ version: 'uuidv4' }).required(),
        });

        schema.validateAsync(req.params)
            .then(() => next())
            .catch((err) => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static deleteResponse(req, res, next) {
        const schema = joi.object({
            responseID: joi.string().guid({ version: 'uuidv4' }).required(),
        });

        schema.validateAsync(req.params)
            .then(() => next())
            .catch((err) => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static editResponse(req, res, next) {
        const schema = joi.object({
            responseID: joi.string().guid({ version: 'uuidv4' }).required(),
            ticketResponse: joi.string().min(1).max(2000).required(),
        });

        schema.validateAsync(req.body)
            .then(() => next())
            .catch((err) => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }

    static editTicket(req, res, next) {
        const schema = joi.object({
            ticketID: joi.string().guid({ version: 'uuidv4' }).required(),
            ticketTitle: joi.string().min(1).max(255).optional(),
            ticketDescription: joi.string().min(1).max(2000).optional(),
        }).or('ticketTitle', 'ticketDescription');

        schema.validateAsync(req.body)
            .then(() => next())
            .catch((err) => res.status(HttpStatusCode.BAD_REQUEST).send(err.message));
    }
}

module.exports = TicketValidator;
