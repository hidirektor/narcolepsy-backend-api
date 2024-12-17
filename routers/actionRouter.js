const router = require('express').Router();
const Authorization = require('../middleware/authorization');
const ControllerFactory = require('../controllers/controllerFactory');
const userActionsController = ControllerFactory.creating('action.controller');

const {validators, verifyToken} = require('../middleware');
const tokenControl = verifyToken.tokenControl;

const userActionsValidator = validators.actionValidator;

router.post('/follow', tokenControl, userActionsValidator.follow, userActionsController.followEntityAsync);
router.post('/unfollow', tokenControl, userActionsValidator.unfollow, userActionsController.unfollowEntityAsync);
router.post('/rate', tokenControl, userActionsValidator.rateEpisode, userActionsController.rateEpisodeAsync);
router.put('/edit-rate', tokenControl, userActionsValidator.rateEpisode, userActionsController.editEpisodeRatingAsync);
router.delete('/delete-rate', tokenControl, userActionsValidator.rateEpisode, userActionsController.deleteEpisodeRatingAsync);
router.post('/comment', tokenControl, userActionsValidator.commentEpisode, userActionsController.commentEpisodeAsync);
router.put('/edit-comment', tokenControl, userActionsValidator.commentEpisode, userActionsController.editEpisodeCommentAsync);
router.delete('/delete-comment', tokenControl, userActionsValidator.commentEpisode, userActionsController.deleteEpisodeCommentAsync);
router.get('/comments/get/:commentID', tokenControl, userActionsValidator.getCommentByID, userActionsController.getCommentByIDAsync);
router.get('/comments/get-all', tokenControl, userActionsController.getAllCommentsAsync);
router.get(
    '/comments/get-by-episode/:episodeID',
    tokenControl,
    userActionsValidator.getAllCommentsByEpisode,
    userActionsController.getAllCommentsByEpisodeAsync
);

module.exports = router;