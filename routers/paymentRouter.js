require('dotenv/config');
const router = require('express')();

const ControllerFactory = require('../controllers/controllerFactory');
const paymentController = ControllerFactory.creating('payment.controller');

const {validators, verifyToken} = require('../middleware');
const paymentValidator = validators.paymentValidator;
const tokenControl = verifyToken.tokenControl;

router.post(
    '/start-checkout-form',
    tokenControl,
    paymentValidator.startCF,
    paymentController.startCheckoutAsync
);

router.get(
    '/verify-payment/:userID',
    paymentController.verifyCheckoutPaymentAsync
);

module.exports = router;