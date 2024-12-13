const db = require('../../models');
const HttpStatusCode = require('http-status-codes');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {errorSender} = require('../../utils');
const redisClient = require('../../utils/thirdParty/redis/redisClient');
const {invalidateToken, invalidateAllTokens} = require('../../middleware/authorization');

const GenericCRUD = require('../genericCrud');
const userCrud = new GenericCRUD({model: db.User, where: null});
const userProfileCrud = new GenericCRUD({model: db.UserProfile, where: null});
const roles = require('../../models/roles');

const StorageService = require('../../utils/service/StorageService');

const storageService = new StorageService({
    endPoint: process.env.MINIO_ENDPOINT,
    port: +process.env.MINIO_PORT,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

class FileController {
    constructor() {
    }

    async uploadProfilePhotoAsync(req, res) {
        const { file } = req;
        const { eMail, phoneNumber, countryCode } = req.body;

        try {
            const findUser = await userCrud.findOne({
                where: {
                    [db.Sequelize.Op.or]: [
                        req.body.eMail ? { eMail: req.body.eMail } : null,
                        req.body.phoneNumber && req.body.countryCode
                            ? {
                                phoneNumber: req.body.phoneNumber,
                                countryCode: req.body.countryCode
                            }
                            : null
                    ].filter(condition => condition !== null)
                }
            });

            if (!findUser.result.userID) {
                throw errorSender.errorObject(
                    HttpStatusCode.NOT_FOUND,
                    'User not found!'
                );
            }

            const foundedUserID = findUser.result.userID;
            const userRole = findUser.result.userType;

            const userProfile = await userProfileCrud.findOne({ where: {userID: foundedUserID}});

            const fileName = await storageService.uploadFile(file, 'profilePhoto', {
                eMail,
                phoneNumber,
                countryCode,
                userRole
            }, {
                onSuccess: async (newFileName) => {
                    if (userProfile.status && userProfile.result && userProfile.result.profilePhotoID) {
                        try {
                            await storageService.deleteFile(storageService.buckets.profiles, userProfile.result.profilePhotoID);
                        } catch (deleteErr) {
                            console.error('Eski dosya silinirken hata oluştu:', deleteErr);
                        }
                    }
                },
                onFail: (error) => {
                    console.error('Yeni dosya yüklenemedi, eski dosya silinmedi:', error);
                }
            });

            await userProfileCrud.update(
                {
                    where: { userID: foundedUserID }
                },
                {
                    profilePhotoID: fileName
                });

            return res.status(200).json({ message: 'File uploaded successfully', fileName });
        } catch (err) {
            res
                .status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(err.message);
        }
    }
}

module.exports = FileController;