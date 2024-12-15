require('dotenv/config');
const router = require('express')();
const multer = require('multer');
const upload = multer();

const ControllerFactory = require('../controllers/controllerFactory');
const episodeController = ControllerFactory.creating('episode.controller');

const { validators, verifyToken } = require('../middleware');
const Authorization = require("../middleware/authorization");
const {EDITOR, MODERATOR, SYSOP} = require("../models/roles");
const tokenControl = verifyToken.tokenControl;
const episodeValidator = validators.episodeValidator;

router.post(
    '/create-episode',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    upload.fields([{ name: 'episodeBanner', maxCount: 1 }, { name: 'episodeImages' }]),
    episodeValidator.createEpisode,
    episodeController.createEpisodeAsync
);

router.post(
    '/change-episode-pdf',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    upload.array('episodeImages'),
    episodeValidator.changeEpisodePdf,
    episodeController.changeEpisodePdfAsync
);

router.put(
    '/edit-episode',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    episodeValidator.editEpisode,
    episodeController.editEpisodeAsync
);

router.post(
    '/change-episode-banner',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    upload.single('episodeBanner'),
    episodeValidator.changeEpisodeBanner,
    episodeController.changeEpisodeBannerAsync
);

router.delete(
    '/delete-episode/:episodeID',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    episodeValidator.deleteEpisode,
    episodeController.deleteEpisodeAsync
);

router.post(
    '/confirm-delete-episode',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    episodeValidator.confirmDeleteEpisode,
    episodeController.confirmDeleteEpisodeAsync
);

router.get(
    '/get-all',
    tokenControl,
    episodeController.getAllEpisodesAsync
);

router.get(
    '/get-by-season/:seasonID',
    tokenControl,
    episodeValidator.getBySeason,
    episodeController.getBySeasonAsync
);

router.get(
    '/get-by-comic/:comicID',
    tokenControl,
    episodeValidator.getByComic,
    episodeController.getByComicAsync
);

router.get(
    'get/:episodeID',
    tokenControl,
    episodeValidator.getEpisodeById,
    episodeController.getEpisodeByIdAsync
);

module.exports = router;
