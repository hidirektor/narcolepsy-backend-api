const db = require('../../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const GenericCRUD = require('../genericCrud');

const ticketStatusEnum = require('../../models/ticket_status_types');

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

    async deleteTicketAsync(req, res) {
        const { ticketID } = req.params;

        try {
            const findTicket = await ticketCrud.findOne({ where: { ticketID } });
            if (!findTicket.result.ticketID) {
                throw errorSender.errorObject(
                    HttpStatusCode.NOT_FOUND,
                    'Ticket not found!'
                );
            }

            const findResponses = await ticketResponseCrud.getAll({ where: { ticketID } });

            const operationKey = uuidv4();
            const redisKey = `operation:remove:ticket:${operationKey}`;

            await redisClient.set(
                redisKey,
                JSON.stringify({ ticketID }),
                'EX',
                180 // 3 minutes expiration
            );

            res.json({
                message: 'Ticket deletion requires confirmation. Use the provided operation key to confirm.',
                operationKey,
                ticketData: findTicket.result,
                responseData: findResponses.result || []
            });
        } catch (error) {
            console.error('Error initiating ticket deletion:', error);
            res
                .status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(error.message);
        }
    }

    async confirmDeleteTicketAsync(req, res) {
        const { operationKey } = req.body;

        try {
            const redisKey = `operation:remove:ticket:${operationKey}`;
            const data = await redisClient.get(redisKey);

            if (!data) {
                return res.status(400).json({ message: 'Invalid or expired operation key.' });
            }

            const { ticketID } = JSON.parse(data);
            const findTicket = await ticketCrud.findOne({ where: { ticketID } });
            if (!findTicket.result.ticketID) {
                return res.status(404).json({ message: 'Ticket not found!' });
            }

            const responseAttachmentsPath = `response-attachments/${ticketID}/`;
            const ticketAttachmentsPath = `ticket-attachments/${ticketID}/`;

            await storageService.deleteFolder(storageService.buckets.tickets, ticketAttachmentsPath);
            await storageService.deleteFolder(storageService.buckets.tickets, responseAttachmentsPath);

            await ticketResponseCrud.delete({ where: { ticketID } });
            await ticketCrud.delete({ where: { ticketID } });

            await redisClient.del(redisKey);

            res.json({ message: 'Ticket and associated data deleted successfully.' });
        } catch (error) {
            console.error('Error confirming ticket deletion:', error);
            res
                .status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(error.message);
        }
    }

    async getAllTicketsAsync(req, res) {
        const { status } = req.query;

        try {
            let condition = {};

            if (status) {
                if (!Object.values(ticketStatusEnum).includes(status)) {
                    return res.status(400).json({ message: 'Invalid status value' });
                }
                condition = { ticketStatus: status };
            }

            const tickets = await ticketCrud.getAll({  where: condition });
            const ticketsResult = Array.isArray(tickets) ? tickets : [];
            const ticketIDs = ticketsResult.map(ticket => ticket.ticketID);

            const responses = await ticketResponseCrud.getAll({
                where: { ticketID: { [Op.in]: ticketIDs } }
            });

            const responsesResult = Array.isArray(responses) ? responses : [];

            res.json({
                message: 'Tickets fetched successfully',
                tickets: ticketsResult,
                responses: responsesResult
            });
        } catch (error) {
            console.error('Error fetching tickets:', error);
            res.status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async getTicketByIDAsync(req, res) {
        const { ticketID } = req.params;

        try {
            const ticket = await ticketCrud.findOne({ where: { ticketID } });
            if (!ticket.result) {
                throw errorSender.errorObject(HttpStatusCode.NOT_FOUND, 'Ticket not found!');
            }

            const responses = await ticketResponseCrud.getAll({ where: { ticketID } });

            res.json({
                message: 'Ticket fetched successfully',
                ticket: ticket.result,
                responses: responses.result || []
            });
        } catch (error) {
            console.error('Error fetching ticket:', error);
            res.status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async getResponseByIDAsync(req, res) {
        const { responseID } = req.params;

        try {
            const response = await ticketResponseCrud.findOne({ where: { responseID } });
            if (!response.result) {
                throw errorSender.errorObject(HttpStatusCode.NOT_FOUND, 'Response not found!');
            }

            res.json({ message: 'Response fetched successfully', response: response.result });
        } catch (error) {
            console.error('Error fetching response:', error);
            res.status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async getResponsesByTicketIDAsync(req, res) {
        const { ticketID } = req.params;

        try {
            const responses = await ticketResponseCrud.getAll({ where: { ticketID } });
            res.json({ message: 'Responses fetched successfully', responses: responses.result || [] });
        } catch (error) {
            console.error('Error fetching responses:', error);
            res.status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async getUserTicketsAsync(req, res) {
        const { eMail } = req.params;

        try {
            const user = await userCrud.findOne({ where: { eMail } });
            if (!user.result.userID) {
                throw errorSender.errorObject(HttpStatusCode.NOT_FOUND, 'User not found!');
            }

            const tickets = await ticketCrud.getAll({ where: { userID: user.result.userID } });
            const ticketIDs = [];

            if (Array.isArray(tickets)) {
                for (const ticket of tickets) {
                    ticketIDs.push(ticket.ticketID);
                }
            } else {
                console.error('Tickets is not an array:', tickets);
            }

            console.log(tickets);
            console.log(ticketIDs);

            const responses = await ticketResponseCrud.getAll({
                where: { ticketID: { [Op.in]: ticketIDs } }
            });

            res.json({
                message: 'User tickets fetched successfully',
                tickets: tickets,
                responses: responses.result || [] // Handle undefined or empty result
            });
        } catch (error) {
            console.error('Error fetching user tickets:', error);
            res.status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async closeTicketAsync(req, res) {
        const { ticketID } = req.params;
        const token = req.headers['authorization']?.split(' ')[1];
        const userID = req.decode?.userID;
        const userType = req.decode?.userType;

        try {
            const ticket = await ticketCrud.findOne({ where: { ticketID } });

            if (!ticket || !ticket.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Ticket not found' });
            }

            const ticketData = ticket.result;

            if (ticketData.ticketStatus === 'CLOSED') {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: 'This ticket is already closed' });
            }

            if (['USER', 'PREMIUM'].includes(userType) && ticketData.userID !== userID) {
                return res
                    .status(HttpStatusCode.FORBIDDEN)
                    .json({ message: 'You are not authorized to close this ticket' });
            }

            ticketData.ticketStatus = 'CLOSED';
            await ticketData.save();

            res.status(HttpStatusCode.OK).json({
                message: 'Ticket closed successfully',
                ticketID: ticketData.ticketID,
                updatedStatus: ticketData.ticketStatus,
            });
        } catch (error) {
            console.error('Error closing ticket:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async deleteResponseAsync(req, res) {
        const { responseID } = req.params;
        const token = req.headers['authorization']?.split(' ')[1];
        const userID = req.decode?.userID;

        try {
            const response = await ticketResponseCrud.findOne({ where: { responseID } });

            if (!response || !response.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Response not found' });
            }

            const responseData = response.result;

            if (responseData.userID !== userID) {
                return res
                    .status(HttpStatusCode.FORBIDDEN)
                    .json({ message: 'You are not authorized to delete this response' });
            }

            if (responseData.responseAttachments) {
                const attachments = JSON.parse(responseData.responseAttachments);

                for (const filePath of attachments) {
                    await storageService.deleteTicketImage(filePath);
                }
            }

            await ticketResponseCrud.delete({ where: { responseID } });

            res.status(HttpStatusCode.OK).json({ message: 'Response deleted successfully' });
        } catch (error) {
            console.error('Error deleting response:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async editResponseAsync(req, res) {
        const { responseID, ticketResponse } = req.body;
        const userID = req.decode?.userID;

        try {
            if (!responseID || !ticketResponse) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: 'responseID and ticketResponse are required.',
                });
            }

            const response = await ticketResponseCrud.findOne({ where: { responseID } });

            if (!response || !response.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({
                    message: 'Response not found',
                });
            }

            const responseData = response.result;

            const ticket = await ticketCrud.findOne({ where: { ticketID: responseData.ticketID } });

            if (!ticket || !ticket.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({
                    message: 'Associated ticket not found',
                });
            }

            const ticketData = ticket.result;

            if (ticketData.ticketStatus === 'CLOSED') {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: 'This response cannot be edited as the associated ticket is closed.',
                });
            }

            if (responseData.userID !== userID) {
                return res.status(HttpStatusCode.FORBIDDEN).json({
                    message: 'You are not authorized to edit this response.',
                });
            }

            responseData.ticketResponse = ticketResponse;

            await responseData.save();

            res.status(HttpStatusCode.OK).json({
                message: 'Response updated successfully',
                updatedResponse: {
                    responseID: responseData.responseID,
                    ticketResponse: responseData.ticketResponse,
                },
            });
        } catch (error) {
            console.error('Error editing response:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async editTicketAsync(req, res) {
        const { ticketID, ticketTitle, ticketDescription } = req.body;
        const userID = req.decode?.userID;
        const userType = req.decode?.userType;

        try {
            if (!ticketID || (!ticketTitle && !ticketDescription)) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: 'ticketID is required, and at least one of ticketTitle or ticketDescription must be provided.',
                });
            }

            const ticket = await ticketCrud.findOne({ where: { ticketID } });

            if (!ticket || !ticket.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({
                    message: 'Ticket not found',
                });
            }

            const ticketData = ticket.result;

            if (ticketData.ticketStatus === 'CLOSED') {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: 'This ticket is closed and cannot be edited.',
                });
            }

            if (['USER', 'PREMIUM'].includes(userType) && ticketData.userID !== userID) {
                return res.status(HttpStatusCode.FORBIDDEN).json({
                    message: 'You are not authorized to edit this ticket.',
                });
            }

            if (ticketTitle) {
                ticketData.ticketTitle = ticketTitle;
            }
            if (ticketDescription) {
                ticketData.ticketDescription = ticketDescription;
            }

            await ticketData.save();

            res.status(HttpStatusCode.OK).json({
                message: 'Ticket updated successfully',
                updatedTicket: {
                    ticketID: ticketData.ticketID,
                    ticketTitle: ticketData.ticketTitle,
                    ticketDescription: ticketData.ticketDescription,
                },
            });
        } catch (error) {
            console.error('Error editing ticket:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async addAttachmentAsync(req, res) {
        const { ticketID, responseID } = req.body;
        const userID = req.decode?.userID;

        try {
            if (ticketID) {
                const ticket = await ticketCrud.findOne({ where: { ticketID } });

                if (!ticket || !ticket.result) {
                    return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Ticket not found.' });
                }

                const ticketData = ticket.result;

                if (ticketData.userID !== userID) {
                    return res.status(HttpStatusCode.FORBIDDEN).json({
                        message: 'You are not authorized to add attachments to this ticket.',
                    });
                }

                if (
                    ticketData.ticketAttachments &&
                    JSON.parse(ticketData.ticketAttachments).length + req.files.length > 3
                ) {
                    return res.status(HttpStatusCode.BAD_REQUEST).json({
                        message: 'You cannot upload more than 3 attachments for a ticket.',
                    });
                }

                const uploadedAttachments = [];
                for (const file of req.files) {
                    const uploadedFilePath = await storageService.uploadTicketImage(
                        file,
                        `ticket-attachments/${ticketID}/${userID}-${Math.floor(Date.now() / 1000)}/`
                    );
                    uploadedAttachments.push(uploadedFilePath);
                }

                ticketData.ticketAttachments = JSON.stringify([
                    ...(JSON.parse(ticketData.ticketAttachments || '[]')),
                    ...uploadedAttachments,
                ]);

                await ticketData.save();

                res.status(HttpStatusCode.OK).json({
                    message: 'Attachments added successfully to the ticket.',
                    updatedAttachments: JSON.parse(ticketData.ticketAttachments),
                });
            } else if (responseID) {
                const response = await ticketResponseCrud.findOne({ where: { responseID } });

                if (!response || !response.result) {
                    return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Response not found.' });
                }

                const responseData = response.result;

                if (responseData.userID !== userID) {
                    return res.status(HttpStatusCode.FORBIDDEN).json({
                        message: 'You are not authorized to add attachments to this response.',
                    });
                }

                if (
                    responseData.responseAttachments &&
                    JSON.parse(responseData.responseAttachments).length + req.files.length > 3
                ) {
                    return res.status(HttpStatusCode.BAD_REQUEST).json({
                        message: 'You cannot upload more than 3 attachments for a response.',
                    });
                }

                const uploadedAttachments = [];
                for (const file of req.files) {
                    const uploadedFilePath = await storageService.uploadTicketImage(
                        file,
                        `response-attachments/${responseID}/${userID}-${Math.floor(Date.now() / 1000)}/`
                    );
                    uploadedAttachments.push(uploadedFilePath);
                }

                responseData.responseAttachments = JSON.stringify([
                    ...(JSON.parse(responseData.responseAttachments || '[]')),
                    ...uploadedAttachments,
                ]);

                await responseData.save();

                res.status(HttpStatusCode.OK).json({
                    message: 'Attachments added successfully to the response.',
                    updatedAttachments: JSON.parse(responseData.responseAttachments),
                });
            } else {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: 'Either ticketID or responseID is required.',
                });
            }
        } catch (error) {
            console.error('Error adding attachment:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async deleteAttachmentAsync(req, res) {
        const { ticketID, responseID, fileName } = req.body;
        const userID = req.decode?.userID;

        try {
            if (ticketID) {
                const ticket = await ticketCrud.findOne({ where: { ticketID } });

                if (!ticket || !ticket.result) {
                    return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Ticket not found.' });
                }

                const ticketData = ticket.result;

                if (ticketData.userID !== userID) {
                    return res.status(HttpStatusCode.FORBIDDEN).json({
                        message: 'You are not authorized to delete attachments from this ticket.',
                    });
                }

                const attachments = JSON.parse(ticketData.ticketAttachments || '[]');
                if (!attachments.includes(fileName)) {
                    return res.status(HttpStatusCode.NOT_FOUND).json({
                        message: 'Attachment not found in the ticket.',
                    });
                }

                const updatedAttachments = attachments.filter(
                    (attachment) => attachment !== fileName
                );

                ticketData.ticketAttachments = JSON.stringify(updatedAttachments);

                await ticketData.save();
                await storageService.deleteTicketImage(fileName);

                res.status(HttpStatusCode.OK).json({
                    message: 'Attachment removed successfully from the ticket.',
                    updatedAttachments,
                });
            } else if (responseID) {
                const response = await ticketResponseCrud.findOne({ where: { responseID } });

                if (!response || !response.result) {
                    return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Response not found.' });
                }

                const responseData = response.result;

                if (responseData.userID !== userID) {
                    return res.status(HttpStatusCode.FORBIDDEN).json({
                        message: 'You are not authorized to delete attachments from this response.',
                    });
                }

                const attachments = JSON.parse(responseData.responseAttachments || '[]');
                if (!attachments.includes(fileName)) {
                    return res.status(HttpStatusCode.NOT_FOUND).json({
                        message: 'Attachment not found in the response.',
                    });
                }

                const updatedAttachments = attachments.filter(
                    (attachment) => attachment !== fileName
                );

                responseData.responseAttachments = JSON.stringify(updatedAttachments);

                await responseData.save();
                await storageService.deleteTicketImage(fileName);

                res.status(HttpStatusCode.OK).json({
                    message: 'Attachment removed successfully from the response.',
                    updatedAttachments,
                });
            } else {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: 'Either ticketID or responseID is required.',
                });
            }
        } catch (error) {
            console.error('Error deleting attachment:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }
}

module.exports = TicketController;
