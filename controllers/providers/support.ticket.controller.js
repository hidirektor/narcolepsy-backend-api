const db = require('../../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const GenericCRUD = require('../genericCrud');

const StorageService = require('../../utils/service/StorageService');
const storageService = new StorageService({
    endPoint: process.env.MINIO_ENDPOINT,
    port: +process.env.MINIO_PORT,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

const userCrud = new GenericCRUD({ model: db.User, where: null });
const ticketCrud = new GenericCRUD({ model: db.Tickets, where: null });
const ticketResponseCrud = new GenericCRUD({ model: db.TicketResponses, where: null });
const redisClient = require('../../utils/thirdParty/redis/redisClient');
const HttpStatusCode = require('http-status-codes');
const {errorSender} = require("../../utils");

class TicketController {
    constructor() {}

    async createTicketAsync(req, res) {
        const { eMail, ticketType, ticketTitle, ticketDescription, comicID, episodeID } = req.body;

        try {
            const findUser = await userCrud.findOne({ where: { eMail } });
            if (!findUser.result.userID) {
                throw errorSender.errorObject(
                    HttpStatusCode.NOT_FOUND,
                    'User not found!'
                );
            }

            const ticketID = uuidv4();
            const ticket = await ticketCrud.create({
                userID: findUser.result.userID,
                ticketID,
                ticketType,
                ticketTitle,
                ticketDescription,
                comicID: comicID || null,
                episodeID: episodeID || null,
                ticketStatus: 'CREATED',
                ticketAttachments: null
            });

            const bucketName = storageService.buckets.tickets;
            await storageService._createFolderIfNotExists(bucketName, `ticket-attachments/${ticketID}/`);
            await storageService._createFolderIfNotExists(bucketName, `response-attachments/${ticketID}/`);

            res.json({ message: 'Ticket created successfully', ticketData: ticket });
        } catch (error) {
            console.error('Error creating ticket:', error);
            res
                .status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(error.message);
        }
    }

    async createTicketWithAttachmentAsync(req, res) {
        const { eMail, ticketType, ticketTitle, ticketDescription, comicID, episodeID } = req.body;

        try {
            const findUser = await userCrud.findOne({ where: { eMail } });
            if (!findUser.result.userID) {
                throw errorSender.errorObject(
                    HttpStatusCode.NOT_FOUND,
                    'User not found!'
                );
            }

            const ticketID = uuidv4();
            const bucketPath = `ticket-attachments/${ticketID}/${findUser.result.userID}-${Math.floor(Date.now() / 1000)}/`;
            await storageService._createFolderIfNotExists(storageService.buckets.tickets, bucketPath);

            const uploadedAttachments = [];
            for (const file of req.files) {
                const uploadedFilePath = await storageService.uploadTicketImage(file, bucketPath);
                uploadedAttachments.push(uploadedFilePath);
            }

            const ticket = await ticketCrud.create({
                userID: findUser.result.userID,
                ticketID,
                ticketType,
                ticketTitle,
                ticketDescription,
                comicID: comicID || null,
                episodeID: episodeID || null,
                ticketStatus: 'CREATED',
                ticketAttachments: JSON.stringify(uploadedAttachments)
            });

            res.json({ message: 'Ticket created with attachments', ticketData: ticket, ticketAttachments: uploadedAttachments });
        } catch (error) {
            console.error('Error creating ticket with attachments:', error);
            res
                .status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(error.message);
        }
    }

    async replyTicketAsync(req, res) {
        const { eMail, ticketID, ticketResponse } = req.body;

        try {
            const findUser = await userCrud.findOne({ where: { eMail } });
            if (!findUser.result.userID) {
                throw errorSender.errorObject(
                    HttpStatusCode.NOT_FOUND,
                    'User not found!'
                );
            }

            const findTicket = await ticketCrud.findOne({ where: { ticketID } });
            if (!findTicket.result.ticketID) {
                throw errorSender.errorObject(
                    HttpStatusCode.NOT_FOUND,
                    'Ticket not found!'
                );
            }

            await ticketResponseCrud.create({
                responseID: uuidv4(),
                ticketID: findTicket.result.ticketID,
                userID: findUser.result.userID,
                ticketResponse,
                responseAttachments: null
            });

            findTicket.result.ticketStatus = ['USER', 'PREMIUM'].includes(findUser.result.userType) ? 'CUSTOMER_RESPONSE' : 'ANSWERED';
            await findTicket.result.save();

            res.json({ message: 'Reply added successfully' });
        } catch (error) {
            console.error('Error replying to ticket:', error);
            res
                .status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(error.message);
        }
    }

    async replyTicketWithAttachmentAsync(req, res) {
        const { eMail, ticketID, ticketResponse } = req.body;

        try {
            const findUser = await userCrud.findOne({ where: { eMail } });
            if (!findUser.result.userID) {
                throw errorSender.errorObject(
                    HttpStatusCode.NOT_FOUND,
                    'User not found!'
                );
            }

            const findTicket = await ticketCrud.findOne({ where: { ticketID } });
            if (!findTicket.result.ticketID) {
                throw errorSender.errorObject(
                    HttpStatusCode.NOT_FOUND,
                    'Ticket not found!'
                );
            }

            const bucketPath = `response-attachments/${ticketID}/${findUser.result.userID}-${Math.floor(Date.now() / 1000)}/`;
            await storageService._createFolderIfNotExists(storageService.buckets.tickets, bucketPath);

            const uploadedAttachments = [];
            for (const file of req.files) {
                const uploadedFilePath = await storageService.uploadTicketImage(file, bucketPath);
                uploadedAttachments.push(uploadedFilePath);
            }

            const response = await ticketResponseCrud.create({
                responseID: uuidv4(),
                ticketID,
                userID: findUser.result.userID,
                ticketResponse,
                responseAttachments: JSON.stringify(uploadedAttachments)
            });

            findTicket.result.ticketStatus = ['USER', 'PREMIUM'].includes(findUser.result.userType) ? 'CUSTOMER_RESPONSE' : 'ANSWERED';
            await findTicket.result.save();

            res.status(201).json({ message: 'Reply added with attachments', responseData: response.result, responseAttachments: uploadedAttachments });
        } catch (error) {
            console.error('Error replying to ticket with attachments:', error);
            res
                .status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(error.message);
        }
    }
}

module.exports = TicketController;
