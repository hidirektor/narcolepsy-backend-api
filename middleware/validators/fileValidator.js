const joi = require('joi');
const HttpStatusCode = require('http-status-codes');
const {isValidPhoneNumber, parsePhoneNumberWithError} = require('libphonenumber-js');
const {User} = require("../../models");

class FileValidator {
    constructor() {
    }

    static async uploadProfilePhoto(req, res, next) {
        try {
            const { eMail, phoneNumber, countryCode } = req.body;
            const file = req.file;

            if (eMail) {
                if (phoneNumber || countryCode) {
                    return res
                        .status(HttpStatusCode.BAD_REQUEST)
                        .send('If eMail is provided, phoneNumber and countryCode should not be provided.');
                }
            }

            if (phoneNumber) {
                if (!countryCode) {
                    return res
                        .status(HttpStatusCode.BAD_REQUEST)
                        .send('countryCode is required when phoneNumber is provided.');
                }
                const fullPhoneNumber = countryCode + phoneNumber;
                if (!isValidPhoneNumber(fullPhoneNumber)) {
                    return res
                        .status(HttpStatusCode.BAD_REQUEST)
                        .send('Phone number is not valid');
                }
            }

            if (!file) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .send('Profile photo is required');
            }

            if (file.size > 5 * 1024 * 1024) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .send('Profile photo size exceeds the 5MB limit');
            }

            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .send('Invalid file type. Only JPG, PNG, and GIF are allowed');
            }

            next();
        } catch (err) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message);
        }
    }

    static async getProfilePhoto(req, res, next) {
        try {
            await joi
                .object({
                    eMail: joi.string()
                        .email()
                        .max(100)
                        .required(),
                })
                .validateAsync(req.params);

            next();
        } catch (err) {
            res.status(HttpStatusCode.BAD_REQUEST).send(err.message);
        }
    }
}

module.exports = FileValidator;