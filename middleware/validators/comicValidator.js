const joi = require('joi');
const HttpStatusCode = require('http-status-codes');
const sharp = require('sharp');
const moment = require('moment');

class ComicValidator {
    constructor() {}

    static async createComic(req, res, next) {
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

            // Zorunlu alanların kontrolü
            if (!comicName || typeof comicName !== 'string') {
                throw new Error('comicName is required and must be a string.');
            }

            if (!comicDescription || typeof comicDescription !== 'string') {
                throw new Error('comicDescription is required and must be a string.');
            }

            if (comicDescriptionTitle && typeof comicDescriptionTitle !== 'string') {
                throw new Error('comicDescriptionTitle must be a string if provided.');
            }

            if (!sourceCountry || typeof sourceCountry !== 'string') {
                throw new Error('sourceCountry is required and must be a string.');
            }

            // publishDate doğrulaması
            if (
                !publishDate ||
                !moment(publishDate, 'DD.MM.YYYY', true).isValid()
            ) {
                throw new Error('publishDate is required and must be in DD.MM.YYYY format.');
            }

            // `comicStatus` doğrulaması
            const validStatuses = ['CONTINUE', 'MID_FINAL', 'FINAL'];
            if (!comicStatus || !validStatuses.includes(comicStatus)) {
                throw new Error(`comicStatus is required and must be one of the following: ${validStatuses.join(', ')}.`);
            }

            if (!comicLanguage || typeof comicLanguage !== 'string') {
                throw new Error('comicLanguage is required and must be a string.');
            }

            // Opsiyonel alanların kontrolü
            if (comicAuthor && typeof comicAuthor !== 'string') {
                throw new Error('comicAuthor must be a string if provided.');
            }

            if (comicEditor && typeof comicEditor !== 'string') {
                throw new Error('comicEditor must be a string if provided.');
            }

            if (comicCompany && typeof comicCompany !== 'string') {
                throw new Error('comicCompany must be a string if provided.');
            }

            if (comicArtist && typeof comicArtist !== 'string') {
                throw new Error('comicArtist must be a string if provided.');
            }

            // Dosya kontrolü
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/heic', 'image/png'];
            if (!req.file || !allowedMimeTypes.includes(req.file.mimetype)) {
                throw new Error('A valid comicBanner image file (jpeg, jpg, heic, png) is required.');
            }

            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async changeBanner(req, res, next) {
        try {
            const { comicID } = req.body;
            const file = req.file;

            // Validate comicID
            if (!comicID || typeof comicID !== 'string') {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'comicID is required and must be a string.' });
            }

            // Validate file
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/heic', 'image/png'];
            if (!file || !allowedMimeTypes.includes(file.mimetype)) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: 'A valid comicBanner image file (jpeg, jpg, heic, png) is required.',
                });
            }

            // Convert image to PNG
            req.file.buffer = await sharp(req.file.buffer)
                .png() // Convert to PNG
                .toBuffer();

            req.file.mimetype = 'image/png';
            req.file.originalname = req.file.originalname.replace(/\.[^/.]+$/, '.png');

            next();
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    static async editComic(req, res, next) {
        try {
            const schema = joi.object({
                comicID: joi.string().uuid().required().messages({
                    'any.required': 'comicID is required.',
                    'string.uuid': 'comicID must be a valid UUID.',
                }),
                comicName: joi.string().optional().messages({
                    'string.base': 'comicName must be a string.',
                }),
                comicDescription: joi.string().optional().messages({
                    'string.base': 'comicDescription must be a string.',
                }),
                comicDescriptionTitle: joi.string().optional().messages({
                    'string.base': 'comicDescriptionTitle must be a string.',
                }),
                sourceCountry: joi.string().optional().messages({
                    'string.base': 'sourceCountry must be a string.',
                }),
                publishDate: joi.string().custom((value, helpers) => {
                    const moment = require('moment');
                    if (!moment(value, 'DD.MM.YYYY', true).isValid()) {
                        return helpers.error('Invalid date format. Use DD.MM.YYYY.');
                    }
                    return value;
                }).optional().messages({
                    'string.base': 'publishDate must be a string.',
                }),
                comicAuthor: joi.string().optional().messages({
                    'string.base': 'comicAuthor must be a string.',
                }),
                comicEditor: joi.string().optional().messages({
                    'string.base': 'comicEditor must be a string.',
                }),
                comicCompany: joi.string().optional().messages({
                    'string.base': 'comicCompany must be a string.',
                }),
                comicArtist: joi.string().optional().messages({
                    'string.base': 'comicArtist must be a string.',
                }),
                comicStatus: joi.string().valid('CONTINUE', 'MID_FINAL', 'FINAL').optional().messages({
                    'string.base': 'comicStatus must be a string.',
                    'any.only': 'comicStatus must be one of CONTINUE, MID_FINAL, or FINAL.',
                }),
                comicLanguage: joi.string().optional().messages({
                    'string.base': 'comicLanguage must be a string.',
                }),
            });

            await schema.validateAsync(req.body, { abortEarly: false });

            next();
        } catch (error) {
            const errorMessages = error.details.map((err) => err.message);
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: errorMessages.join(', ') });
        }
    }

    static async deleteComic(req, res, next) {
        try {
            await joi.object({ comicID: joi.string().uuid().required() }).validateAsync(req.params);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async confirmDeleteComic(req, res, next) {
        try {
            await joi.object({ operationKey: joi.string().required() }).validateAsync(req.body);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async getById(req, res, next) {
        try {
            await joi.object({ comicID: joi.string().uuid().required() }).validateAsync(req.params);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async getByCategory(req, res, next) {
        try {
            await joi.object({ categoryName: joi.string().required() }).validateAsync(req.params);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async getByEpisode(req, res, next) {
        try {
            await joi.object({ episodeID: joi.string().uuid().required() }).validateAsync(req.params);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    static async getAll(req, res, next) {
        try {
            // No specific body or params required, but included for consistency
            await joi.object({}).validateAsync(req.body || {});
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }
}

module.exports = ComicValidator;