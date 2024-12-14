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

module.exports = router;
