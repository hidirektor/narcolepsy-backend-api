require('dotenv/config');
const router = require('express')();
const multer = require('multer');
const upload = multer();
const uploadZip = require('../middleware/upload');

const ControllerFactory = require('../controllers/controllerFactory');
const comicController = ControllerFactory.creating('comic.controller');

const { validators, verifyToken } = require('../middleware');
const Authorization = require("../middleware/authorization");
const {EDITOR, MODERATOR, SYSOP} = require("../models/roles");
const tokenControl = verifyToken.tokenControl;
const comicValidator = validators.comicValidator;

router.post(
    '/create-comic',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    upload.single('comicBanner'),
    comicValidator.createComic,
    comicController.createComicAsync
);

router.post(
    '/bulk-create',
    tokenControl,
    Authorization.authControl([SYSOP]),
    uploadZip.single('file'),
    comicValidator.bulkCreate,
    comicController.bulkCreateComicAsync
);

router.post(
    '/change-comic-banner',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    upload.single('comicBanner'),
    comicValidator.changeBanner,
    comicController.changeComicBannerAsync
);

router.delete(
    '/delete-comic/:comicID',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    comicValidator.deleteComic,
    comicController.deleteComicAsync
);

router.post(
    '/confirm-delete-comic',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    comicValidator.confirmDeleteComic,
    comicController.confirmDeleteComicAsync
);

router.put(
    '/edit-comic',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    comicValidator.editComic,
    comicController.editComicAsync
);

router.get(
    '/get-all',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    comicController.getAllAsync
);

router.get(
    '/get/:comicID',
    tokenControl,
    comicValidator.getById,
    comicController.getByIdAsync
);

router.get(
    '/get-by-category/:categoryName',
    tokenControl,
    comicValidator.getByCategory,
    comicController.getByCategoryAsync
);

router.get(
    '/get-by-episode/:episodeID',
    tokenControl,
    comicValidator.getByEpisode,
    comicController.getByEpisodeAsync
);

module.exports = router;
