const express = require('express');
const router = express.Router();

const Authorization = require('../middleware/authorization');

const ControllerFactory = require('../controllers/controllerFactory');
const premiumPackagesController = ControllerFactory.creating('premium.packages.controller');

const { SYSOP } = require('../models/roles');

const {validators, verifyToken} = require('../middleware');
const tokenControl = verifyToken.tokenControl;

const premiumValidator = validators.premiumValidator;

router.get(
    '/get-all',
    tokenControl,
    premiumValidator.getAllPremiumPackages,
    premiumPackagesController.getAllPremiumPackagesAsync
);

router.get(
    '/get/:packageID',
    tokenControl,
    premiumValidator.getPremiumPackage,
    premiumPackagesController.getPremiumPackageAsync
);

router.post(
    '/create-premium-package',
    tokenControl,
    Authorization.authControl([SYSOP]),
    premiumValidator.createPremiumPackage,
    premiumPackagesController.createPremiumPackageAsync
);

router.post(
    '/edit-premium-package',
    tokenControl,
    Authorization.authControl([SYSOP]),
    premiumValidator.updatePremiumPackage,
    premiumPackagesController.updatePremiumPackageAsync
);

router.delete(
    '/delete-premium-package/:packageID',
    tokenControl,
    Authorization.authControl([SYSOP]),
    premiumValidator.deletePremiumPackage,
    premiumPackagesController.removePremiumPackageAsync
);

module.exports = router;