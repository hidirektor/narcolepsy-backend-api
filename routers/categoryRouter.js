const express = require('express');
const router = express.Router();

const Authorization = require('../middleware/authorization');

const ControllerFactory = require('../controllers/controllerFactory');
const comicCategoryController = ControllerFactory.creating('comic.category.controller');

const { EDITOR, MODERATOR, SYSOP } = require('../models/roles');

const {validators, verifyToken} = require('../middleware');
const tokenControl = verifyToken.tokenControl;

const comicValidator = validators.comicValidator;

// GET /get-all - Tüm kategorileri listeleme
router.get(
    '/get-all',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    comicValidator.getAllCategory,
    comicCategoryController.getAllCategoryAsync
);

// GET /get/:categoryID - Belirli kategoriyi çekme
router.get(
    '/get/:categoryID',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    comicValidator.getCategory,
    comicCategoryController.getCategoryAsync
);

// POST /create-category - Yeni kategori ekleme
router.post(
    '/create-category',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    comicValidator.createCategory,
    comicCategoryController.createCategoryAsync
);

// POST /edit-category/:categoryID - Mevcut kategori düzenleme
router.post(
    '/edit-category',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    comicValidator.updateCategory,
    comicCategoryController.updateCategoryAsync
);

// DELETE /delete-category/:categoryID - Kategori silme
router.delete(
    '/delete-category/:categoryID',
    tokenControl,
    Authorization.authControl([EDITOR, MODERATOR, SYSOP]),
    comicValidator.deleteCategory,
    comicCategoryController.removeCategoryAsync
);

module.exports = router;