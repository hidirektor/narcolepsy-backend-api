const db = require('../../models');

const GenericCRUD = require('../genericCrud');
const categoryCrud = new GenericCRUD({ model: db.ComicCategory, where: null });
const categoryMappingCrud = new GenericCRUD({ model: db.ComicCategoryMapping, where: null });

const {errorSender} = require('../../utils');
const HttpStatusCode = require('http-status-codes');

const redisClient = require('../../utils/thirdParty/redis/redisClient');

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
        const token = req.headers.authorization?.split(' ')[1];

        categoryCrud.delete({ categoryID })
            .then(() => {
                return categoryMappingCrud.getAll();
            })
            .then(async mappings => {
                if (mappings.length === 0) {
                    return {
                        message: 'Category deleted successfully. No related mappings found to delete.',
                        afftecedComics: []
                    };
                }

                const operationKey = crypto.randomUUID();
                const redisKey = `operation:remove:category:${operationKey}`;
                const deletedMappings = mappings.map(mapping => mapping.toJSON());

                await redisClient.set(
                    redisKey,
                    JSON.stringify({categoryID, deletedMappings, token}),
                    'EX',
                    180
                );

                return {
                    message: 'Category deletion started successfully. Mappings require confirmation for deletion.',
                    operationKey: operationKey,
                    afftecedComics: deletedMappings
                };
            })
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

    confirmRemoveCategoryAsync(req, res) {
        const { operationKey } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        const redisKey = `operation:remove:category:${operationKey}`;

        redisClient.get(redisKey)
            .then(async data => {
                if (!data) {
                    return res.status(400).json({ message: 'Invalid or expired operation key.' });
                }

                const { categoryID, deletedMappings, token: storedToken } = JSON.parse(data);

                if (token !== storedToken) {
                    return res.status(403).json({ message: 'Invalid token for this operation.' });
                }

                await redisClient.del(redisKey);

                return categoryMappingCrud.delete({ categoryID })
                    .then(() => {
                        return categoryCrud.delete({ categoryID });
                    })
                    .then(() => {
                        res.status(200).json({
                            message: 'Mappings deleted successfully.',
                            deletedMappings: deletedMappings
                        });
                    });
            })
            .catch(err => {
                res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

}

module.exports = ComicCategoryController;
