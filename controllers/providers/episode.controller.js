const db = require('../../models');
const { errorSender } = require('../../utils');
const HttpStatusCode = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../../utils/thirdParty/redis/redisClient');

const storageService = new (require('../../utils/service/StorageService'))({
    endPoint: process.env.MINIO_ENDPOINT,
    port: +process.env.MINIO_PORT,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});
const PdfGenerator = require('../../utils/pdfGenerator');
const fs = require('fs');
const sharp = require('sharp');

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

            const user = await userCrud.findOne({ where: { eMail: episodePublisher } });
            if (!user.result) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid episodePublisher email.' });
            }
            const publisherID = user.result.userID;

            if (!req.files.episodeBanner || req.files.episodeBanner.length !== 1) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Episode banner is required.' });
            }
            if (!req.files.episodeImages || req.files.episodeImages.length === 0) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Episode images are required to create the PDF.' });
            }

            const episodeID = uuidv4();
            const folderPath = `comics/${comicID}/${episodeOrder}/`;
            const bannerPath = `${folderPath}banner-${episodeID}.png`;
            const pdfPath = `${folderPath}episode-${episodeID}.pdf`;

            await storageService.uploadFileToBucket(
                storageService.buckets.comics,
                bannerPath,
                req.files.episodeBanner[0].buffer,
                'image/png'
            );

            const localPdfPath = `/tmp/${uuidv4()}.pdf`;
            const pageCount = await PdfGenerator.generatePdf(req.files.episodeImages, localPdfPath);

            const pdfBuffer = fs.readFileSync(localPdfPath);
            await storageService.uploadFileToBucket(
                storageService.buckets.comics,
                pdfPath,
                pdfBuffer,
                'application/pdf'
            );

            fs.unlinkSync(localPdfPath);

            const episode = await episodeCrud.create({
                episodeID,
                comicID,
                seasonID: seasonID || null,
                episodeOrder: parseInt(episodeOrder),
                episodePrice: parseFloat(episodePrice),
                episodeName,
                episodePublisher: publisherID,
                episodeBannerID: bannerPath,
                episodeFileID: pdfPath,
                episodePageCount: pageCount,
            });

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

            if (!req.files.episodeImages || req.files.episodeImages.length === 0) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Episode images are required to create the PDF.' });
            }

            const folderPath = `comics/${episode.result.comicID}/${episode.result.episodeOrder}/`;
            const newPdfPath = `${folderPath}episode-${episodeID}-${uuidv4()}.pdf`;

            const localPdfPath = `/tmp/${uuidv4()}.pdf`; // Temporary local file
            const pageCount = await PdfGenerator.generatePdf(req.files.episodeImages, localPdfPath);

            const pdfBuffer = fs.readFileSync(localPdfPath);

            const updatedPdfPath = await storageService.changeComicPDF(
                storageService.buckets.comics,
                episode.result.episodeFileID,
                pdfBuffer,
                newPdfPath
            );

            fs.unlinkSync(localPdfPath);

            await episodeCrud.update(
                { where: { episodeID } },
                {
                    episodeFileID: updatedPdfPath,
                    episodePageCount: pageCount,
                }
            );

            res.status(200).json({ message: 'Episode PDF updated successfully', pageCount });
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

            const currentComicID = episode.result.comicID;
            const resolvedComicID = comicID || currentComicID;

            const oldEpisodeOrder = episode.result.episodeOrder;
            if (parseInt(episodeOrder) !== oldEpisodeOrder) {
                const oldFolderPath = `comics/${resolvedComicID}/${oldEpisodeOrder}/`;
                const newFolderPath = `comics/${resolvedComicID}/${episodeOrder}/`;

                try {
                    const oldBannerPath = episode.result.episodeBannerID;
                    const newBannerPath = `${newFolderPath}banner-${episodeID}.png`;

                    await storageService.minioClient.copyObject(
                        storageService.buckets.comics,
                        newBannerPath,
                        `${storageService.buckets.comics}/${oldBannerPath}`
                    );
                    await storageService.deleteFile(storageService.buckets.comics, oldBannerPath);

                    const oldPdfPath = episode.result.episodeFileID;
                    const newPdfPath = `${newFolderPath}episode-${episodeID}.pdf`;

                    await storageService.minioClient.copyObject(
                        storageService.buckets.comics,
                        newPdfPath,
                        `${storageService.buckets.comics}/${oldPdfPath}`
                    );
                    await storageService.deleteFile(storageService.buckets.comics, oldPdfPath);

                    await episodeCrud.update({ where: { episodeID } }, {
                        episodeBannerID: newBannerPath,
                        episodeFileID: newPdfPath,
                    });

                    await storageService.deleteFolder(storageService.buckets.comics, oldFolderPath);
                } catch (error) {
                    console.error('Error moving files to new folder:', error.message);
                    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                        message: 'Failed to move files to the new episodeOrder folder.',
                    });
                }
            }

            await episodeCrud.update({ where: { episodeID } }, {
                comicID,
                seasonID,
                episodeOrder: parseInt(episodeOrder),
                episodePrice: parseFloat(episodePrice),
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

            const folderPath = `comics/${episode.result.comicID}/${episode.result.episodeOrder}/`;
            const newBannerPath = `${folderPath}banner-${episodeID}-${uuidv4()}.png`;

            const bannerBuffer = await sharp(req.file.buffer).png().toBuffer();

            const updatedBannerPath = await storageService.changeComicBanner(
                storageService.buckets.comics,
                episode.result.episodeBannerID,
                bannerBuffer,
                newBannerPath
            );

            await episodeCrud.update({ where: { episodeID } }, { episodeBannerID: updatedBannerPath });

            res.status(200).json({ message: 'Episode banner updated successfully', updatedBannerPath });
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

            await storageService.deleteFolder(storageService.buckets.comics, `comics/${episode.result.comicID}/${episode.result.episodeOrder}`);
            await episodeCrud.delete({ where: { episodeID } });

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
                await storageService.deleteFolder(storageService.buckets.comics, `comics/${episode.result.comicID}/${episode.result.episodeOrder}`);
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

            if (!episodes || episodes.length === 0) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No episodes found for the given comic.' });
            }

            res.status(200).json(episodes);
        } catch (error) {
            console.error('Error fetching episodes by comic:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch episodes.' });
        }
    }

    async getEpisodeByIdAsync(req, res) {
        try {
            const { episodeID } = req.params;
            const episode = await episodeCrud.findOne({ where: { episodeID } });

            if (!episode) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Episode not found.' });
            }

            res.status(200).json(episode);
        } catch (error) {
            console.error('Error fetching episode:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch episode.' });
        }
    }

}

module.exports = EpisodeController;
