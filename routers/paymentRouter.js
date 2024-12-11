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

router.get('/check-payment/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        res.render('check-payment', { userID: userID, status: 'loading' });
    } catch (error) {
        console.error('Error during payment verification:', error);
        return res.status(500).send('An error occurred during payment verification.');
    }
});

module.exports = router;