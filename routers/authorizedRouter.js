const router = require('express').Router();
const Authorization = require('../middleware/authorization');
const ControllerFactory = require('../controllers/controllerFactory');
const authorizedController = ControllerFactory.creating('authorized.controller');

const {validators, verifyToken} = require('../middleware');
const {SYSOP} = require("../models/roles");
const tokenControl = verifyToken.tokenControl;

const authorizedValidator = validators.authorizedValidator;

router.post(
    '/add-user',
    tokenControl,
    Authorization.authControl([SYSOP]),
    authorizedValidator.addUser,
    authorizedController.addUserAsync
);

router.put(
    '/edit-user',
    tokenControl,
    Authorization.authControl([SYSOP]),
    authorizedValidator.editUser,
    authorizedController.editUserAsync
);

router.delete(
    '/delete-user/:userID',
    tokenControl,
    Authorization.authControl([SYSOP]),
    authorizedValidator.deleteUser,
    authorizedController.deleteUserAsync
);

router.delete(
    '/delete-comment/:id',
    tokenControl,
    Authorization.authControl([SYSOP]),
    authorizedValidator.deleteEntity,
    authorizedController.deleteCommentAsync
);

router.delete(
    '/delete-rating/:id',
    tokenControl,
    Authorization.authControl([SYSOP]),
    authorizedValidator.deleteEntity,
    authorizedController.deleteRatingAsync
);

router.delete(
    '/delete-download/user/:userID/episode/:episodeID',
    tokenControl,
    Authorization.authControl([SYSOP]),
    authorizedValidator.deleteDownload,
    authorizedController.deleteDownloadAsync
);

module.exports = router;
