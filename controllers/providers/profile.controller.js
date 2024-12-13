const db = require('../../models');
const HttpStatusCode = require('http-status-codes');
const {errorSender} = require('../../utils');

const redisClient = require('../../utils/thirdParty/redis/redisClient');
const GenericCRUD = require('../genericCrud');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userCrud = new GenericCRUD({model: db.User, where: null});
const userProfileCrud = new GenericCRUD({model: db.UserProfile, where: null});
const userPreferencesCrud = new GenericCRUD({model: db.UserPreferences, where: null});
const userVerificationsCrud = new GenericCRUD({model: db.UserVerifications, where: null});

class ProfileController {
    constructor() {
    }

    async getProfileAsync(req, res) {
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

            const userProfile = await userProfileCrud.findOne({where: {userID: foundedUserID} });

            if(!userProfile.result.isActive) {
                throw errorSender.errorObject(
                    HttpStatusCode.BAD_REQUEST,
                    'Your account is not active!'
                );
            }

            const userPreferences = await userPreferencesCrud.findOne({where: {userID: foundedUserID} });
            const userVerifications = await userVerificationsCrud.findOne({where: {userID: foundedUserID} });

            res.json({userData: findUser.result, profileData: userProfile.result, preferencesData: userPreferences.result, verificationData: userVerifications.result});
        } catch (error) {
            res
                .status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(error.message);
        }
    }

    async updateProfileAsync(req, res) {
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
            const userProfile = await userProfileCrud.findOne({where: {userID: foundedUserID} });

            if(!userProfile.result.isActive) {
                throw errorSender.errorObject(
                    HttpStatusCode.BAD_REQUEST,
                    'Your account is not active!'
                );
            }

            let isUpdated = false;

            const userPreferences = await userPreferencesCrud.findOne({where: {userID: foundedUserID} });
            const userVerifications = await userVerificationsCrud.findOne({where: {userID: foundedUserID} });

            if (req.body.userName || req.body.userSurname || req.body.nickName) {
                await userCrud.update(
                    {
                        where: { userID: foundedUserID }
                    },
                    {
                        ...(req.body.userName && { userName: req.body.userName }),
                        ...(req.body.userSurname && { userSurname: req.body.userSurname }),
                        ...(req.body.nickName && { nickName: req.body.nickName })
                });
                isUpdated = true;
            }

            if (req.body.birthDate) {
                await userProfileCrud.update( { where: { userID: foundedUserID } }, { birthDate: req.body.birthDate });
                isUpdated = true;
            }

            if (req.body.language || req.body.themeColor || req.body.pushNotification !== undefined || req.body.mailNotification !== undefined) {
                await userPreferencesCrud.update(
                    {
                        where: { userID: foundedUserID }
                    },
                    {
                        ...(req.body.language && { language: req.body.language }),
                        ...(req.body.themeColor && { themeColor: req.body.themeColor }),
                        ...(req.body.pushNotification !== undefined && { pushNotification: req.body.pushNotification }),
                        ...(req.body.mailNotification !== undefined && { mailNotification: req.body.mailNotification })
                });
                isUpdated = true;
            }

            if (isUpdated) {
                await userProfileCrud.update(
                    {
                        where: { userID: foundedUserID }
                    },
                    {
                    updateDate: Math.floor(Date.now() / 1000) // Unix timestamp
                });
            }

            const updatedUser = await userCrud.findOne({ where: { userID: foundedUserID }});
            const updatedUserPreferences = await userPreferencesCrud.findOne({ where: { userID: foundedUserID } });
            const updatedUserProfile = await userProfileCrud.findOne({ where: { userID: foundedUserID } });

            res.json({
                userData: updatedUser.result,
                profileData: updatedUserProfile.result,
                preferencesData: updatedUserPreferences.result
            });
        } catch (error) {
            res
                .status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(error.message);
        }
    }
}

module.exports = ProfileController;