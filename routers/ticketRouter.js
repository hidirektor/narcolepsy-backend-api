require('dotenv/config');
const router = require('express')();

const ControllerFactory = require('../controllers/controllerFactory');
const ticketController = ControllerFactory.creating('support.ticket.controller');

const { validators, verifyToken, authorization } = require('../middleware');
const tokenControl = verifyToken.tokenControl;
const authControl = authorization.authControl;
const ticketValidator = validators.ticketValidator;

// Destek talebi oluşturma
router.post(
    '/create-ticket',
    tokenControl,
    ticketValidator.createTicket,
    ticketController.createTicketAsync
);

// Kullanıcının destek taleplerini listeleme
router.get(
    '/my-tickets',
    tokenControl,
    ticketController.getMyTicketsAsync
);

// Tüm destek taleplerini listeleme (SYSOP)
router.get(
    '/get-all',
    tokenControl,
    authControl(['SYSOP']),
    ticketController.getAllTicketsAsync
);

// Destek talebi detaylarını görüntüleme
router.get(
    '/get/:ticketID',
    tokenControl,
    ticketController.getTicketDetailsAsync
);

// Destek talebi silme (SYSOP)
router.delete(
    '/delete-ticket/:ticketID',
    tokenControl,
    authControl(['SYSOP']),
    ticketController.deleteTicketAsync
);

// Destek talebine yanıt verme
router.post(
    '/:ticketID/reply',
    tokenControl,
    ticketValidator.replyTicket,
    ticketController.replyTicketAsync
);

module.exports = router;
