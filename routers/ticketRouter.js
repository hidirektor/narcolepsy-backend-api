require('dotenv/config');
const router = require('express')();
const multer = require('multer');
const upload = multer();

const ControllerFactory = require('../controllers/controllerFactory');
const {validators, verifyToken} = require('../middleware');
const ticketController = ControllerFactory.creating('support.ticket.controller');

const ticketValidator = validators.ticketValidator;
const tokenControl = verifyToken.tokenControl;

const Authorization = require('../middleware/authorization');
const {SYSOP} = require("../models/roles");

router.post(
    '/create-ticket',
    tokenControl,
    ticketValidator.createTicket,
    ticketController.createTicketAsync
);

router.post(
    '/create-ticket/with-attachment',
    tokenControl,
    upload.array('attachments', 3),
    ticketValidator.createTicketWithAttachment,
    ticketController.createTicketWithAttachmentAsync
);

router.post(
    '/reply-ticket',
    tokenControl,
    ticketValidator.replyTicket,
    ticketController.replyTicketAsync
);

router.post(
    '/reply-ticket/with-attachment',
    tokenControl,
    upload.array('attachments', 3),
    ticketValidator.replyTicketWithAttachment,
    ticketController.replyTicketWithAttachmentAsync
);

router.delete(
    '/delete-ticket/:ticketID',
    tokenControl,
    Authorization.authControl([SYSOP]),
    ticketValidator.deleteTicket,
    ticketController.deleteTicketAsync
);

router.post(
    '/confirm-delete-ticket',
    tokenControl,
    Authorization.authControl([SYSOP]),
    ticketValidator.confirmDeleteTicket,
    ticketController.confirmDeleteTicketAsync
);

router.get(
    '/get-all',
    tokenControl,
    Authorization.authControl([SYSOP]),
    ticketValidator.getAllTickets,
    ticketController.getAllTicketsAsync
);

router.get(
    '/get-ticket/:ticketID',
    tokenControl,
    ticketValidator.getTicketByID,
    ticketController.getTicketByIDAsync
);

router.get(
    '/get-response/:responseID',
    tokenControl,
    ticketValidator.getResponseByID,
    ticketController.getResponseByIDAsync
);

router.get(
    '/get-responses/:ticketID',
    tokenControl,
    ticketValidator.getResponsesByTicketID,
    ticketController.getResponsesByTicketIDAsync
);

router.get(
    '/get-user-ticket/:eMail',
    tokenControl,
    ticketValidator.getUserTickets,
    ticketController.getUserTicketsAsync
);

router.patch(
    '/close-ticket/:ticketID',
    tokenControl,
    ticketValidator.closeTicket,
    ticketController.closeTicketAsync
);

router.delete(
    '/delete-response/:responseID',
    tokenControl,
    ticketValidator.deleteResponse,
    ticketController.deleteResponseAsync
);

router.put(
    '/edit-response',
    tokenControl,
    ticketValidator.editResponse,
    ticketController.editResponseAsync
);

router.put(
    '/edit-ticket',
    tokenControl,
    ticketValidator.editTicket,
    ticketController.editTicketAsync
);

router.post(
    '/add-attachment',
    tokenControl,
    upload.array('attachments', 3),
    ticketValidator.addAttachment,
    ticketController.addAttachmentAsync
);

router.delete(
    '/delete-attachment',
    tokenControl,
    ticketValidator.deleteAttachment,
    ticketController.deleteAttachmentAsync
);

module.exports = router;
