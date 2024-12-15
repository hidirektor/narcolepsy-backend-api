const express = require('express');
const router = express.Router();

const Authorization = require('../middleware/authorization');

const ControllerFactory = require('../controllers/controllerFactory');
const comicCategoryController = ControllerFactory.creating('comic.category.controller');

const { EDITOR, MODERATOR, SYSOP } = require('../models/roles');

const {validators, verifyToken} = require('../middleware');
const tokenControl = verifyToken.tokenControl;

const categoryValidator = validators.categoryValidator;

router.get(
    '/get-all',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    categoryValidator.getAllCategory,
    comicCategoryController.getAllCategoryAsync
);

router.get(
    '/get/:categoryID',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    categoryValidator.getCategory,
    comicCategoryController.getCategoryAsync
);

router.post(
    '/create-category',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    categoryValidator.createCategory,
    comicCategoryController.createCategoryAsync
);

router.post(
    '/edit-category',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    categoryValidator.updateCategory,
    comicCategoryController.updateCategoryAsync
);

router.delete(
    '/delete-category/:categoryID',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    categoryValidator.deleteCategory,
    comicCategoryController.removeCategoryAsync
);

router.post(
    '/confirm-delete-category',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    categoryValidator.confirmDeleteCategory,
    comicCategoryController.confirmRemoveCategoryAsync
);

module.exports = router;