require('dotenv/config');
const router = require('express')();

const ControllerFactory = require('../controllers/controllerFactory');
const authController = ControllerFactory.creating('auth.controller');

const {validators, verifyToken} = require('../middleware');
const tokenControl = verifyToken.tokenControl;
const authValidator = validators.authValidator;
const userValidator = validators.userValidator;

router.post('/sign-up', authValidator.signUp, authController.signUpAsync);

router.post('/sign-in', authValidator.login, authController.loginAsync);

router.post(
    '/change-password',
    tokenControl,
    authController.changePasswordAsync
);

router.post(
    '/reset-password',
    authValidator.resetPassword,
    authController.resetPasswordAsync
);

router.post(
    '/send-otp',
    authController.sendOtpAsync
);

router.post(
    '/verify-otp',
    authController.verifyOtpAsync
);

router.get('/verify/:userID', authController.verifyUserEmailAsync);

router.post('/logout', tokenControl, authController.logoutAsync);

module.exports = router;