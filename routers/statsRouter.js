const router = require('express').Router();
const Authorization = require('../middleware/authorization');
const ControllerFactory = require('../controllers/controllerFactory');
const statsController = ControllerFactory.creating('stats.controller');

const { validators, verifyToken } = require('../middleware');
const tokenControl = verifyToken.tokenControl;

const statsValidator = validators.statsValidator;

router.get(
    '/:statType/:type/:id',
    tokenControl,
    statsValidator.getStats,
    statsController.getStatsAsync
);

router.post(
    '/user-stats/:statType/:type/:id',
    tokenControl,
    statsValidator.getUserStats,
    statsController.getUserStatsAsync
);

module.exports = router;
