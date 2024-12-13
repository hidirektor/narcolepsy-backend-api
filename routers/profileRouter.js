require('dotenv/config');
const router = require('express')();

const ControllerFactory = require('../controllers/controllerFactory');
const {validators, verifyToken} = require('../middleware');
const profileController = ControllerFactory.creating('profile.controller');

const profileValidator = validators.profileValidator;
const tokenControl = verifyToken.tokenControl;

router.post('/get-profile', tokenControl, profileValidator.getProfile, profileController.getProfileAsync);

router.post('/update-profile', tokenControl, profileValidator.updateProfile, profileController.updateProfileAsync);

module.exports = router;