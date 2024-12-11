const db = require('../../models');
const HttpStatusCode = require('http-status-codes');
const {errorSender} = require('../../utils');

const redisClient = require('../../utils/thirdParty/redis/redisClient');
const GenericCRUD = require('../genericCrud');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userCrud = new GenericCRUD({model: db.User, where: null});
const userProfileCrud = new GenericCRUD({model: db.UserProfile, where: null});

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

            if (!findUser.status) {
                throw errorSender.errorObject(
                    HttpStatusCode.NOT_FOUND,
                    'User not found!'
                );
            }

            const passwordIsValid = await bcrypt.compare(req.body.password, findUser.result.password);
            if (!passwordIsValid) {
                throw errorSender.errorObject(
                    HttpStatusCode.BAD_REQUEST,
                    'Check your credentials!'
                );
            }

            const isUserActive = await db.UserProfile.findOne({userID: findUser.userID});

            if(!isUserActive.isActive) {
                throw errorSender.errorObject(
                    HttpStatusCode.BAD_REQUEST,
                    'Your account is not active!'
                );
            }

            const tokenExpiration = req.body.rememberMe ? '365d' : '1d';

            const payload = {
                userID: findUser.result.userID,
                userType: findUser.result.userType
            };

            const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: tokenExpiration
            });

            const finalDeviceInfo = req.headers['user-agent'];

            // Redis'te kullanıcı bilgilerini ve token'ı sakla
            const redisKey = `auth:user:${findUser.result.userID}:token`;
            const redisValue = JSON.stringify({
                token: accessToken,
                deviceInfo: finalDeviceInfo,
                loginTime: Math.floor(Date.now() / 1000),
                userName: findUser.result.userName,
                userSurname: findUser.result.userSurname,
                dialCode: findUser.result.countryCode,
                phoneNumber: findUser.result.phoneNumber,
                eMail: findUser.result.eMail,
                userType: findUser.result.userType
            });

            const expirationSeconds = (time) => time.match(/^(\d+)(d)$/) ? parseInt(time.match(/^(\d+)(d)$/)[1], 10) * 24 * 60 * 60 : 0;
            const expirationTime = expirationSeconds(tokenExpiration);

            await redisClient.set(redisKey, redisValue, 'EX', expirationTime);

            res.json({findUser: findUser.result, accessToken});
        } catch (error) {
            res
                .status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(error.message);
        }
    }
}

module.exports = ProfileController;