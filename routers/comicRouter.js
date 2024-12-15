require('dotenv/config');
const router = require('express')();
const multer = require('multer');
const upload = multer();

const ControllerFactory = require('../controllers/controllerFactory');
const comicController = ControllerFactory.creating('comic.controller');

const { validators, verifyToken } = require('../middleware');
const tokenControl = verifyToken.tokenControl;
const comicValidator = validators.comicValidator;

router.post(
    '/create-comic',
    upload.single('comicBanner'),
    comicValidator.createComic,
    comicController.createComicAsync
);

router.post(
    '/change-comic-banner',
    upload.single('comicBanner'),
    comicValidator.changeBanner,
    comicController.changeComicBannerAsync
);

router.delete(
    '/delete-comic/:comicID',
    tokenControl,
    comicValidator.deleteComic,
    comicController.deleteComicAsync
);

router.post(
    '/confirm-delete-comic',
    tokenControl,
    comicValidator.confirmDeleteComic,
    comicController.confirmDeleteComicAsync
);

router.put(
    '/edit-comic',
    tokenControl,
    comicValidator.editComic,
    comicController.editComicAsync
);

router.get(
    '/get-all',
    tokenControl,
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
