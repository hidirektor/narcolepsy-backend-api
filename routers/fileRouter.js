require('dotenv/config');
const router = require('express')();
const multer = require('multer');
const upload = multer();

const ControllerFactory = require('../controllers/controllerFactory');
const {validators, verifyToken} = require('../middleware');
const fileController = ControllerFactory.creating('file.controller');

const fileValidator = validators.fileValidator;
const tokenControl = verifyToken.tokenControl;

router.post('/upload-profile-photo', tokenControl, upload.single('profilePhoto'), fileValidator.uploadProfilePhoto, fileController.uploadProfilePhotoAsync);
router.get('/get-profile-photo/:eMail', tokenControl, fileValidator.getProfilePhoto, fileController.getProfilePhotoAsync);

module.exports = router;