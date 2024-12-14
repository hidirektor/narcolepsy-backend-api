const db = require('../../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const GenericCRUD = require('../genericCrud');
const StorageService = require('../../utils/service/StorageService');

const userCrud = new GenericCRUD({ model: db.User, where: null });
const ticketCrud = new GenericCRUD({ model: db.Tickets, where: null });
const redisClient = require('../../utils/thirdParty/redis/redisClient');
const HttpStatusCode = require('http-status-codes');
const {errorSender} = require("../../utils");

class TicketController {
    constructor() {}

    // Destek talebi oluşturma
    async createTicketAsync(req, res) {
        const { eMail, ticketType, ticketTitle, ticketDescription } = req.body;

        const user = await userCrud.findOne({ where: {eMail: eMail}});

        if (!user.result.userID) {
            throw errorSender.errorObject(
                HttpStatusCode.NOT_FOUND,
                'User not found!'
            );
        }

        const userID = user.result.userID;

        try {
            const lastCreatedTimestamp = await redisClient.get(`create-ticket:${userID}`);
            const currentTimestamp = Date.now();

            if (lastCreatedTimestamp && currentTimestamp - lastCreatedTimestamp < 10 * 60 * 1000) {
                return res.status(429).json({ message: 'You can only create one ticket every 10 minutes.' });
            }

            const ticketID = uuidv4();
            const images = req.files || [];
            const imagePaths = [];

            for (const file of images) {
                const timestamp = Date.now();
                const imagePath = await StorageService.uploadTicketImage(file, ticketID, userID, timestamp);
                imagePaths.push(imagePath);
            }

            const newTicket = await ticketCrud.create({
                ticketType,
                ticketTitle,
                ticketDescription,
                ticketID,
                userID,
                ticketStatus: 'CREATED',
            });

            await redisClient.set(`create-ticket:${userID}`, currentTimestamp, 'EX', 10 * 60);

            res.status(201).json({
                message: 'Support ticket created successfully.',
                ticket: newTicket.result,
                uploadedImages: imagePaths
            });
        } catch (err) {
            console.error('Error creating ticket:', err);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
        }
    }

    // Kullanıcının destek taleplerini listeleme
    async getMyTicketsAsync(req, res) {
        const { eMail } = req.params;

        const user = await userCrud.findOne({ where: {eMail: eMail}});

        if (!user.result.userID) {
            throw errorSender.errorObject(
                HttpStatusCode.NOT_FOUND,
                'User not found!'
            );
        }

        try {
            const tickets = await ticketCrud.getAll({ where: { userID } });
            res.json(tickets);
        } catch (err) {
            console.error('Error fetching user tickets:', err);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
        }
    }

    // Tüm destek taleplerini listeleme (SYSOP)
    async getAllTicketsAsync(req, res) {
        try {
            const tickets = await ticketCrud.getAll();
            res.json(tickets);
        } catch (err) {
            console.error('Error fetching all tickets:', err);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
        }
    }

    // Destek talebi detaylarını görüntüleme
    async getTicketDetailsAsync(req, res) {
        const { ticketID } = req.params;

        try {
            const ticket = await ticketCrud.findOne({ where: { ticketID } });

            if (!ticket.status) {
                return res.status(404).json({ message: 'Ticket not found.' });
            }

            res.json(ticket.result);
        } catch (err) {
            console.error('Error fetching ticket details:', err);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
        }
    }

    // Destek talebi silme (SYSOP)
    async deleteTicketAsync(req, res) {
        const { ticketID } = req.params;

        try {
            const ticket = await ticketCrud.findOne({ where: { ticketID } });

            if (!ticket.status) {
                return res.status(404).json({ message: 'Ticket not found.' });
            }

            // Görselleri silme
            const imageFolderPath = `${ticketID}/`;
            await StorageService.deleteFolder('ticket_types', imageFolderPath);

            await ticketCrud.delete({ where: { ticketID } });

            res.status(200).json({ message: 'Ticket deleted successfully.' });
        } catch (err) {
            console.error('Error deleting ticket:', err);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
        }
    }

    // Destek talebine yanıt verme
    async replyTicketAsync(req, res) {
        const { ticketID } = req.params;
        const { ticketResponse } = req.body;
        const userID = req.user.id; // Yanıtlayan kişinin ID'si

        try {
            const ticket = await ticketCrud.findOne({ where: { ticketID } });

            if (!ticket.status) {
                return res.status(404).json({ message: 'Ticket not found.' });
            }

            const images = req.files || [];
            const imagePaths = [];

            for (const file of images) {
                const timestamp = Date.now();
                const imagePath = await StorageService.uploadTicketImage(file, ticketID, userID, timestamp);
                imagePaths.push(imagePath);
            }

            ticket.result.ticketResponse = ticketResponse;
            ticket.result.ticketStatus = 'ANSWERED';

            await ticket.result.save();

            res.status(200).json({
                message: 'Ticket replied successfully.',
                ticket: ticket.result,
                uploadedImages: imagePaths
            });
        } catch (err) {
            console.error('Error replying to ticket:', err);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
        }
    }
}

module.exports = TicketController;
