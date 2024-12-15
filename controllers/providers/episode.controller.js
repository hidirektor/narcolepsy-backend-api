const db = require('../../models');
const { errorSender } = require('../../utils');
const HttpStatusCode = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');

const storageService = new (require('../../utils/service/StorageService'))({
    endPoint: process.env.MINIO_ENDPOINT,
    port: +process.env.MINIO_PORT,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});
const { generatePdf } = require('../../utils/pdfGenerator');
const fs = require('fs');

const GenericCRUD = require('../genericCrud');
const episodeCrud = new GenericCRUD({ model: db.ComicEpisode });
const userCrud = new GenericCRUD({ model: db.User });

class EpisodeController {
    constructor() {
    }

    async createEpisodeAsync(req, res) {
        try {
            const {
                comicID,
                seasonID,
                episodeOrder,
                episodePrice,
                episodeName,
                episodePublisher,
            } = req.body;

            // Validate publisher
            const user = await userCrud.findOne({ where: { eMail: episodePublisher } });
            if (!user.result) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid episodePublisher email.' });
            }
            const publisherID = user.result.userID;

            // Upload banner
            if (!req.files.episodeBanner || req.files.episodeBanner.length !== 1) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Episode banner is required.' });
            }
            const bannerPath = await storageService.uploadComicBanner(req.files.episodeBanner[0], comicID);

            // Generate PDF from images
            if (!req.files.episodeImages || req.files.episodeImages.length === 0) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Episode images are required to create the PDF.' });
            }
            const pdfPath = `comics/${comicID}/${episodeOrder}/episode-${uuidv4()}.pdf`;
            const pageCount = await generatePdf(req.files.episodeImages, pdfPath);

            // Upload PDF to MinIO
            const pdfUrl = await storageService.uploadFileToMinio(pdfPath, 'comics');

            // Save episode
            const episodeID = uuidv4();
            const episode = await episodeCrud.create({
                episodeID,
                comicID,
                seasonID: seasonID || null,
                episodeOrder: parseInt(episodeOrder),
                episodePrice: parseFloat(episodePrice),
                episodeName,
                episodePublisher: publisherID,
                episodeBannerID: bannerPath,
                episodeFileID: pdfUrl,
                episodePageCount: pageCount,
            });

            fs.unlinkSync(pdfPath); // Clean up locally stored PDF
            res.status(201).json({ message: 'Episode created successfully', episode });
        } catch (error) {
            console.error('Error creating episode:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async changeEpisodePdfAsync(req, res) {
        try {
            const { episodeID } = req.body;
            const episode = await episodeCrud.findOne({ where: { episodeID } });
            if (!episode.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Episode not found.' });
            }

            // Generate new PDF
            if (!req.files.episodeImages || req.files.episodeImages.length === 0) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Episode images are required.' });
            }
            const pdfPath = `comics/${episode.result.comicID}/${episode.result.episodeOrder}/episode-${uuidv4()}.pdf`;
            const pageCount = await generatePdf(req.files.episodeImages, pdfPath);

            // Upload new PDF
            const newPdfUrl = await storageService.uploadFileToMinio(pdfPath, 'comics');

            // Delete old PDF
            await storageService.deleteFile(storageService.buckets.comics, episode.result.episodeFileID);

            // Update episode
            await episodeCrud.update({ where: { episodeID } }, {
                episodeFileID: newPdfUrl,
                episodePageCount: pageCount,
            });

            fs.unlinkSync(pdfPath); // Clean up locally stored PDF
            res.status(200).json({ message: 'Episode PDF updated successfully' });
        } catch (error) {
            console.error('Error updating episode PDF:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async editEpisodeAsync(req, res) {
        try {
            const {
                episodeID,
                comicID,
                seasonID,
                episodeOrder,
                episodePrice,
                episodeName,
                episodePublisher,
            } = req.body;

            const episode = await episodeCrud.findOne({ where: { episodeID } });
            if (!episode.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Episode not found.' });
            }

            const user = await userCrud.findOne({ where: { eMail: episodePublisher } });
            if (!user.result) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid episodePublisher email.' });
            }

            await episodeCrud.update({ where: { episodeID } }, {
                comicID,
                seasonID,
                episodeOrder,
                episodePrice,
                episodeName,
                episodePublisher: user.result.userID,
            });

            res.status(200).json({ message: 'Episode updated successfully' });
        } catch (error) {
            console.error('Error editing episode:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async changeEpisodeBannerAsync(req, res) {
        try {
            const { episodeID } = req.body;

            if (!episodeID) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'episodeID is required.' });
            }

            const episode = await episodeCrud.findOne({ where: { episodeID } });
            if (!episode.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Episode not found.' });
            }

            if (!req.file) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'A new episode banner file is required.' });
            }

            const newBannerPath = await storageService.uploadComicBanner(req.file, episode.result.comicID);

            const oldBannerPath = episode.result.episodeBannerID;
            if (oldBannerPath) {
                try {
                    await storageService.deleteFile(storageService.buckets.comics, oldBannerPath);
                    console.log('Old banner deleted successfully:', oldBannerPath);
                } catch (error) {
                    console.error('Failed to delete old banner:', error.message);
                }
            }

            await episodeCrud.update({ where: { episodeID } }, { episodeBannerID: newBannerPath });

            res.status(200).json({ message: 'Episode banner updated successfully', newBannerPath });
        } catch (error) {
            console.error('Error updating episode banner:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async deleteEpisodeAsync(req, res) {
        try {
            const { episodeID } = req.params;

            const episode = await episodeCrud.findOne({ where: { episodeID } });
            if (!episode.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Episode not found.' });
            }

            const userReactions = await db.UserReactions.count({ where: { episodeID } });
            if (userReactions > 0) {
                const operationKey = crypto.randomUUID();
                await redisClient.set(
                    `operation:delete:episode:${operationKey}`,
                    JSON.stringify({ episodeID }),
                    'EX',
                    180
                );

                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: 'Episode has dependencies. Deletion requires confirmation.',
                    operationKey,
                });
            }

            await episodeCrud.delete({ where: { episodeID } });
            await storageService.deleteFile(storageService.buckets.comics, episode.result.episodeBannerID);
            await storageService.deleteFile(storageService.buckets.comics, episode.result.episodeFileID);

            res.status(200).json({ message: 'Episode deleted successfully.' });
        } catch (error) {
            console.error('Error deleting episode:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async confirmDeleteEpisodeAsync(req, res) {
        try {
            const { operationKey } = req.body;

            const data = await redisClient.get(`operation:delete:episode:${operationKey}`);
            if (!data) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid or expired operation key.' });
            }

            const { episodeID } = JSON.parse(data);
            await redisClient.del(`operation:delete:episode:${operationKey}`);

            await db.UserReactions.destroy({ where: { episodeID } });
            const episode = await episodeCrud.findOne({ where: { episodeID } });

            if (episode.result) {
                await storageService.deleteFile(storageService.buckets.comics, episode.result.episodeBannerID);
                await storageService.deleteFile(storageService.buckets.comics, episode.result.episodeFileID);
                await episodeCrud.delete({ where: { episodeID } });
            }

            res.status(200).json({ message: 'Episode and dependencies deleted successfully.' });
        } catch (error) {
            console.error('Error confirming episode deletion:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async getAllEpisodesAsync(req, res) {
        try {
            const episodes = await episodeCrud.getAll();
            res.status(200).json(episodes || []);
        } catch (error) {
            console.error('Error fetching episodes:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch episodes.' });
        }
    }

    async getBySeasonAsync(req, res) {
        try {
            const { seasonID } = req.params;
            const episodes = await episodeCrud.getAll({ where: { seasonID } });

            if (!episodes.result || episodes.result.length === 0) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No episodes found for the given season.' });
            }

            res.status(200).json(episodes.result);
        } catch (error) {
            console.error('Error fetching episodes by season:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch episodes.' });
        }
    }

    async getByComicAsync(req, res) {
        try {
            const { comicID } = req.params;
            const episodes = await episodeCrud.getAll({ where: { comicID } });

            if (!episodes.result || episodes.result.length === 0) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No episodes found for the given comic.' });
            }

            res.status(200).json(episodes.result);
        } catch (error) {
            console.error('Error fetching episodes by comic:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch episodes.' });
        }
    }

    async getEpisodeByIdAsync(req, res) {
        try {
            const { episodeID } = req.params;
            const episode = await episodeCrud.findOne({ where: { episodeID } });

            if (!episode.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Episode not found.' });
            }

            res.status(200).json(episode.result);
        } catch (error) {
            console.error('Error fetching episode:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch episode.' });
        }
    }

}

module.exports = EpisodeController;
