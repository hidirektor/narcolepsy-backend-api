const joi = require('joi');
const HttpStatusCode = require('http-status-codes');
const sharp = require('sharp');

class EpisodeValidator {
    constructor() {}

    static async createEpisode(req, res, next) {
        try {
            const {
                comicID,
                seasonID,
                episodeOrder,
                episodePrice,
                episodeName,
                episodePublisher,
            } = req.body;

            // Validate fields
            if (!comicID || typeof comicID !== 'string') {
                throw new Error('comicID is required and must be a string.');
            }

            if (seasonID && typeof seasonID !== 'string') {
                throw new Error('seasonID must be a string if provided.');
            }

            if (!episodeOrder || !Number.isInteger(+episodeOrder) || +episodeOrder <= 0) {
                throw new Error('episodeOrder is required and must be an integer greater than 0.');
            }

            if (!episodePrice || isNaN(+episodePrice) || +episodePrice <= 0) {
                throw new Error('episodePrice is required and must be a positive number.');
            }

            if (!episodeName || typeof episodeName !== 'string') {
                throw new Error('episodeName is required and must be a string.');
            }

            if (!episodePublisher || typeof episodePublisher !== 'string') {
                throw new Error('episodePublisher is required and must be a valid email address.');
            }

            // Validate files
            if (!req.files || !req.files.episodeBanner || req.files.episodeBanner.length !== 1) {
                throw new Error('A single episodeBanner file is required.');
            }
            const bannerMimeType = req.files.episodeBanner[0].mimetype;
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/heic'].includes(bannerMimeType)) {
                throw new Error('episodeBanner must be a valid image file (jpeg, jpg, png, heic).');
            }

            if (!req.files.episodeImages || req.files.episodeImages.length === 0) {
                throw new Error('At least one episodeImage file is required.');
            }

            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async changeEpisodePdf(req, res, next) {
        try {
            const { episodeID } = req.body;

            if (!episodeID || typeof episodeID !== 'string') {
                throw new Error('episodeID is required and must be a valid UUID.');
            }

            if (!req.files || req.files.length === 0) {
                throw new Error('At least one episodeImage file is required to update the PDF.');
            }

            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async editEpisode(req, res, next) {
        try {
            const schema = joi.object({
                episodeID: joi.string().uuid().required().messages({
                    'any.required': 'episodeID is required.',
                    'string.uuid': 'episodeID must be a valid UUID.',
                }),
                comicID: joi.string().uuid().optional(),
                seasonID: joi.string().uuid().optional(),
                episodeOrder: joi.number().integer().min(1).optional(),
                episodePrice: joi.number().greater(0).optional(),
                episodeName: joi.string().optional(),
                episodePublisher: joi.string().email().optional(),
            });

            await schema.validateAsync(req.body, { abortEarly: false });
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.details.map((d) => d.message).join(', ') });
        }
    }

    static async changeEpisodeBanner(req, res, next) {
        try {
            const { episodeID } = req.body;

            if (!episodeID || typeof episodeID !== 'string') {
                throw new Error('episodeID is required and must be a valid UUID.');
            }

            if (!req.file) {
                throw new Error('A new episode banner file is required.');
            }

            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                throw new Error('episodeBanner must be a valid image file (jpeg, jpg, png, heic).');
            }

            req.file.buffer = await sharp(req.file.buffer).png().toBuffer();
            req.file.mimetype = 'image/png';
            req.file.originalname = req.file.originalname.replace(/\.[^/.]+$/, '.png');

            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async deleteEpisode(req, res, next) {
        try {
            await joi
                .object({ episodeID: joi.string().uuid().required() })
                .validateAsync(req.params);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async confirmDeleteEpisode(req, res, next) {
        try {
            await joi
                .object({ operationKey: joi.string().required() })
                .validateAsync(req.body);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async getBySeason(req, res, next) {
        try {
            await joi
                .object({ seasonID: joi.string().uuid().required() })
                .validateAsync(req.params);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async getByComic(req, res, next) {
        try {
            await joi
                .object({ comicID: joi.string().uuid().required() })
                .validateAsync(req.params);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async getEpisodeById(req, res, next) {
        try {
            await joi.object({ episodeID: joi.string().uuid().required() }).validateAsync(req.params);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async getAllEpisodes(req, res, next) {
        try {
            // No validation needed for this endpoint
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }
}

module.exports = EpisodeValidator;
