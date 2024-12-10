require('dotenv/config');
const router = require('express')();

const ControllerFactory = require('../controllers/controllerFactory');
const paymentController = ControllerFactory.creating('payment.controller');

const {validators, verifyToken} = require('../middleware');
const authValidator = validators.authValidator;
const userValidator = validators.userValidator;
const tokenControl = verifyToken.tokenControl;

router.post(
    '/start-checkout-form',
    tokenControl,
    paymentController.startCheckoutAsync
);

router.get(
    '/:userID/:paymentToken',
    tokenControl,
    paymentController.verifyCheckoutPaymentAsync
);

module.exports = router;