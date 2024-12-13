const db = require('../../models');

const GenericCRUD = require('../genericCrud');
const categoryCrud = new GenericCRUD({ model: db.ComicCategory, where: null });
const categoryMappingCrud = new GenericCRUD({ model: db.ComicCategoryMapping, where: null });

const {errorSender} = require('../../utils');
const HttpStatusCode = require('http-status-codes');

class ComicCategoryController {
    constructor() {}

    getAllCategoryAsync(req, res) {
        categoryCrud.getAll()
            .then(categories => res.json(categories))
            .catch(err => {
                res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

    getCategoryAsync(req, res) {
        const { categoryID } = req.params;
        categoryCrud.findOne({ where: { categoryID } })
            .then(category => res.json(category))
            .catch(err => {
                res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

    createCategoryAsync(req, res) {
        const { categoryName } = req.body;
        if (!categoryName) {
            const error = errorSender.errorObject(HttpStatusCode.BAD_REQUEST, "categoryName is required.");
            return res.status(error.status).send(error.message);
        }

        categoryCrud.create({ categoryName })
            .then(newCategory => res.status(201).json(newCategory))
            .catch(err => {
                res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

    updateCategoryAsync(req, res) {
        const { categoryID, categoryName } = req.body;
        if (!categoryID) {
            const error = errorSender.errorObject(HttpStatusCode.BAD_REQUEST, "categoryID is required.");
            return res.status(error.status).send(error.message);
        }

        categoryCrud.update({ where: { categoryID } }, { categoryName })
            .then(() => {
                return categoryCrud.findOne({ where: { categoryID } });
            })
            .then(updatedCategory => {
                res.json(updatedCategory);
            })
            .catch(err => {
                res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

    removeCategoryAsync(req, res) {
        const { categoryID } = req.params;

        categoryCrud.delete({ categoryID })
            .then(() => {
                return categoryMappingCrud.getAll();
            })
            .then(mappings => {
                if (mappings.length === 0) {
                    return {
                        message: 'Category deleted successfully. No related mappings found to delete.',
                        deletedMappings: []
                    };
                }

                const deletedMappings = mappings.map(mapping => mapping.toJSON());

                return categoryMappingCrud.delete({ categoryID })
                    .then(() => ({
                        message: 'Category and related mappings deleted successfully.',
                        deletedMappings: deletedMappings
                    }));
            })
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

}

module.exports = ComicCategoryController;
