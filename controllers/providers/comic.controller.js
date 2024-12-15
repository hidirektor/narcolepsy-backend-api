const db = require('../../models');
const GenericCRUD = require('../genericCrud');
const redisClient = require('../../utils/thirdParty/redis/redisClient');
const { errorSender } = require('../../utils');
const HttpStatusCode = require('http-status-codes');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const storageService = new (require('../../utils/service/StorageService'))({
    endPoint: process.env.MINIO_ENDPOINT,
    port: +process.env.MINIO_PORT,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const comicCrud = new GenericCRUD({ model: db.Comic });
const comicDetailsCrud = new GenericCRUD({ model: db.ComicDetails });
const comicSeasonsCrud = new GenericCRUD({ model: db.ComicSeason });
const comicEpisodesCrud = new GenericCRUD({ model: db.ComicEpisode });
const followedComicsCrud = new GenericCRUD({ model: db.FollowedComic });
const comicCategoryMappingCrud = new GenericCRUD({ model: db.ComicCategoryMapping });

class ComicController {
    constructor() {}

    async createComicAsync(req, res) {
        try {
            const {
                comicName,
                comicDescription,
                comicDescriptionTitle,
                sourceCountry,
                publishDate,
                comicStatus,
                comicLanguage,
                comicAuthor,
                comicEditor,
                comicCompany,
                comicArtist,
            } = req.body;

            // Upload comic banner to MinIO
            const comicID = db.Sequelize.UUIDV4();
            const bannerPath = `comics/${comicID}/banner-${Date.now()}-${req.file.originalname}`;
            await storageService.uploadFile(req.file, 'comics', bannerPath);

            // Create Comic record
            const comic = await comicCrud.create({
                comicID,
                comicName,
                comicDescription,
                comicDescriptionTitle: comicDescriptionTitle || null,
                sourceCountry,
                publishDate,
                comicBannerID: bannerPath,
            });

            // Create ComicDetails record
            await comicDetailsCrud.create({
                comicID,
                comicStatus,
                comicLanguage,
                comicAuthor: comicAuthor || null,
                comicEditor: comicEditor || null,
                comicCompany: comicCompany || null,
                comicArtist: comicArtist || null,
            });

            res.status(201).json({ message: 'Comic created successfully', comic });
        } catch (error) {
            console.error('Error creating comic:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async changeComicBannerAsync(req, res) {
        const { comicID } = req.body;

        try {
            if (!req.file) {
                throw errorSender.errorObject(HttpStatusCode.BAD_REQUEST, 'Comic banner is required.');
            }

            const comic = await comicCrud.findOne({ where: { comicID } });

            if (!comic.status) {
                throw errorSender.errorObject(HttpStatusCode.NOT_FOUND, 'Comic not found');
            }

            const existingComic = comic.result;

            if (existingComic.comicBannerID) {
                await storageService.deleteFile(storageService.buckets.comics, existingComic.comicBannerID);
            }

            const bucketPath = `comics/${comicID}/`;
            await storageService._createFolderIfNotExists(storageService.buckets.comics, bucketPath);
            const uploadedFileName = await storageService.uploadFile(req.file, 'comic', { comicID });

            await comicCrud.update({ where: { comicID } }, { comicBannerID: uploadedFileName });

            res.status(200).json({
                message: 'Comic banner updated successfully',
                comicID,
                comicBannerID: uploadedFileName,
            });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message || 'Internal Server Error');
        }
    }

    async deleteComicAsync(req, res) {
        const { comicID } = req.params;

        try {
            const dependencies = await Promise.all([
                comicSeasonsCrud.getAll({ where: { comicID } }),
                comicEpisodesCrud.getAll({ where: { comicID } }),
                followedComicsCrud.getAll({ where: { comicID } }),
                comicCategoryMappingCrud.getAll({ where: { comicID } }),
            ]);

            if (dependencies.some(dep => dep.length > 0)) {
                const operationKey = crypto.randomUUID();
                await redisClient.set(
                    `operation:delete:comic:${operationKey}`,
                    JSON.stringify({ comicID }),
                    'EX',
                    180
                );

                return res.status(400).json({
                    message: 'Comic has dependencies. Deletion requires confirmation.',
                    operationKey,
                });
            }

            await comicDetailsCrud.delete({ where: { comicID } });
            await comicCrud.delete({ where: { comicID } });

            // Remove banner
            const bucketPath = `comics/${comicID}/`;
            await storageService.deleteFolder(storageService.buckets.comics, bucketPath);

            res.status(200).json({ message: 'Comic deleted successfully.' });
        } catch (error) {
            console.error('Error deleting comic:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to delete comic.');
        }
    }

    async confirmDeleteComicAsync(req, res) {
        const { operationKey } = req.body;

        try {
            const data = await redisClient.get(`operation:delete:comic:${operationKey}`);

            if (!data) {
                return res.status(400).json({ message: 'Invalid or expired operation key.' });
            }

            const { comicID } = JSON.parse(data);
            await redisClient.del(`operation:delete:comic:${operationKey}`);

            await Promise.all([
                comicSeasonsCrud.delete({ where: { comicID } }),
                comicEpisodesCrud.delete({ where: { comicID } }),
                followedComicsCrud.delete({ where: { comicID } }),
                comicCategoryMappingCrud.delete({ where: { comicID } }),
                comicDetailsCrud.delete({ where: { comicID } }),
            ]);

            await comicCrud.delete({ where: { comicID } });

            // Remove banner
            const bucketPath = `comics/${comicID}/`;
            await storageService.deleteFolder(storageService.buckets.comics, bucketPath);

            res.status(200).json({ message: 'Comic and dependencies deleted successfully.' });
        } catch (error) {
            console.error('Error confirming comic deletion:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to confirm deletion.');
        }
    }

    async editComicAsync(req, res) {
        try {
            const {
                comicID,
                comicName,
                comicDescription,
                comicDescriptionTitle,
                sourceCountry,
                publishDate,
                comicStatus,
                comicLanguage,
                comicAuthor,
                comicEditor,
                comicCompany,
                comicArtist,
            } = req.body;

            const comic = await comicCrud.findOne({ where: { comicID } });
            if (!comic) {
                throw errorSender.errorObject(HttpStatusCode.NOT_FOUND, 'Comic not found.');
            }

            // Build update payload for Comic
            const comicUpdatePayload = {};
            if (comicName !== undefined) comicUpdatePayload.comicName = comicName;
            if (comicDescription !== undefined) comicUpdatePayload.comicDescription = comicDescription;
            if (comicDescriptionTitle !== undefined) comicUpdatePayload.comicDescriptionTitle = comicDescriptionTitle;
            if (sourceCountry !== undefined) comicUpdatePayload.sourceCountry = sourceCountry;
            if (publishDate !== undefined) comicUpdatePayload.publishDate = publishDate;

            // Update Comic
            if (Object.keys(comicUpdatePayload).length > 0) {
                await comicCrud.update({ where: { comicID } }, comicUpdatePayload);
            }

            // Build update payload for ComicDetails
            const comicDetailsUpdatePayload = {};
            if (comicStatus !== undefined) comicDetailsUpdatePayload.comicStatus = comicStatus;
            if (comicLanguage !== undefined) comicDetailsUpdatePayload.comicLanguage = comicLanguage;
            if (comicAuthor !== undefined) comicDetailsUpdatePayload.comicAuthor = comicAuthor;
            if (comicEditor !== undefined) comicDetailsUpdatePayload.comicEditor = comicEditor;
            if (comicCompany !== undefined) comicDetailsUpdatePayload.comicCompany = comicCompany;
            if (comicArtist !== undefined) comicDetailsUpdatePayload.comicArtist = comicArtist;

            // Update ComicDetails
            if (Object.keys(comicDetailsUpdatePayload).length > 0) {
                await comicDetailsCrud.update({ where: { comicID } }, comicDetailsUpdatePayload);
            }

            res.json({ message: 'Comic updated successfully' });
        } catch (error) {
            console.error('Error editing comic:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async getAllAsync(req, res) {
        try {
            const comics = await comicCrud.getAll();
            res.status(200).json(comics);
        } catch (error) {
            console.error('Error fetching comics:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to fetch comics.');
        }
    }

    async getByIdAsync(req, res) {
        const { comicID } = req.params;

        try {
            const comic = await comicCrud.findOne({ where: { comicID } });
            res.status(200).json(comic);
        } catch (error) {
            console.error('Error fetching comic:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to fetch comic.');
        }
    }

    async getByCategoryAsync(req, res) {
        const { categoryName } = req.params;

        try {
            const comics = await comicCategoryMappingCrud.getAll({
                include: [{ model: db.Comic, as: 'comic' }],
                where: { categoryName },
            });

            res.status(200).json(comics);
        } catch (error) {
            console.error('Error fetching comics by category:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to fetch comics.');
        }
    }

    async getByEpisodeAsync(req, res) {
        const { episodeID } = req.params;

        try {
            const episode = await comicEpisodesCrud.findOne({
                where: { episodeID },
                include: [{ model: db.Comic, as: 'comic' }],
            });

            res.status(200).json(episode);
        } catch (error) {
            console.error('Error fetching comics by episode:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to fetch comics.');
        }
    }
}

module.exports = ComicController;
