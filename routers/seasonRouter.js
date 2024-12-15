const express = require('express');
const router = express.Router();

const ControllerFactory = require('../controllers/controllerFactory');
const seasonController = ControllerFactory.creating('season.controller');
const { validators, verifyToken } = require('../middleware');
const Authorization = require("../middleware/authorization");
const {SYSOP, EDITOR, MODERATOR} = require("../models/roles");

const seasonValidator = validators.seasonValidator;
const tokenControl = verifyToken.tokenControl;

router.post(
    '/create-season',
    tokenControl,
    Authorization.authControl([SYSOP, EDITOR, MODERATOR]),
    seasonValidator.createSeason,
    seasonController.createSeasonAsync
);

router.put(
    '/edit-season',
    tokenControl,
    Authorization.authControl([SYSOP, EDITOR, MODERATOR]),
    seasonValidator.editSeason,
    seasonController.editSeasonAsync
);

router.get(
    '/get-all',
    tokenControl,
    Authorization.authControl([SYSOP, EDITOR, MODERATOR]),
    seasonValidator.getAllSeasons,
    seasonController.getAllSeasonsAsync
);

router.get(
    '/get/:seasonID',
    tokenControl,
    seasonValidator.getSeasonByID,
    seasonController.getSeasonByIDAsync
);

router.delete(
    '/delete-season/:seasonID',
    tokenControl,
    Authorization.authControl([SYSOP, EDITOR, MODERATOR]),
    seasonValidator.deleteSeason,
    seasonController.deleteSeasonAsync
);

router.post(
    '/confirm-delete-season',
    tokenControl,
    Authorization.authControl([SYSOP, EDITOR, MODERATOR]),
    seasonValidator.confirmDeleteSeason,
    seasonController.confirmDeleteSeasonAsync
);

router.get(
    '/get-seasons-by-comic/:comicID',
    tokenControl,
    seasonValidator.getSeasonsByComic,
    seasonController.getSeasonsByComicAsync
);

module.exports = router;
