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
const userPreferencesCrud = new GenericCRUD({model: db.UserPreferences, where: null});
const userVerificationsCrud = new GenericCRUD({model: db.UserVerifications, where: null});
const roles = require('../../models/roles');

const NotificationService = require('../../utils/service/NotificationService');

class AuthController {
    constructor() {}

    async signUpAsync(req, res) {
        const transaction = await db.sequelize.transaction();

        try {
            const findUser = await userCrud.findOne({
                where: {
                    [db.Sequelize.Op.or]: [
                        {eMail: req.body.eMail},
                        {nickName: req.body.nickName},
                        {phoneNumber: req.body.phoneNumber}
                    ]
                }
            });

            if (findUser.status) {
                if (findUser.result.eMail === req.body.eMail) {
                    throw errorSender.errorObject(
                        HttpStatusCode.CONFLICT,
                        'This email is already taken!'
                    );
                }

                if (findUser.result.nickName === req.body.nickName) {
                    throw errorSender.errorObject(
                        HttpStatusCode.CONFLICT,
                        'This nick name is already taken!'
                    );
                }

                if (findUser.result.phoneNumber === req.body.phoneNumber) {
                    throw errorSender.errorObject(
                        HttpStatusCode.CONFLICT,
                        'This phone number is already taken!'
                    );
                }
            }

            const insertUser = req.body;
            insertUser.password = bcrypt.hashSync(req.body.password, 10);

            const user = await userCrud.create({
                ...insertUser,
                userType: roles.USER
            });

            if (!user.status)
                throw errorSender.errorObject(
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'There was a problem adding the user!'
                );

            const userID = user.result.userID;
            const profilePhotoID = req.body.profilePhotoID;
            const birthDate = req.body.birthDate;

            await db.UserProfile.create({
                userID,
                profilePhotoID,
                birthDate
            }, {transaction});
            await db.UserPreferences.create({userID}, {transaction});
            await db.UserVerifications.create({userID}, {transaction});

            await transaction.commit();

            NotificationService.queueRegisterMail(`${process.env.BASE_URL}/v1/auth/verify/${userID}`, `${req.body.userName} ${req.body.userSurname}`, req.body.eMail, `Merhaba, ${req.body.userName} ${req.body.userSurname}!`);

            res.status(HttpStatusCode.OK).json('User registered.');
        } catch (err) {
            res
                .status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(err.message);
        }
    }

    async loginAsync(req, res) {
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
                userID: findUser.result.userID
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

    async changePasswordAsync(req, res) {
        const {userName, oldPassword, newPassword, closeSessions} = req.body;

        try {
            const user = await db.User.findOne({where: {nickName: userName}});
            if (!user) return res.status(404).json({message: 'User not found'});

            const validPassword = await bcrypt.compare(oldPassword, user.password);
            if (!validPassword) return res.status(401).json({message: 'Invalid current password'});

            const lastPasswordChangeTime = await redisClient.get(`cooldown:user:${user.userID}:lastPasswordChange`);
            const currentTime = Math.floor(Date.now() / 1000);
            if (lastPasswordChangeTime && (currentTime - parseInt(lastPasswordChangeTime)) < 7 * 24 * 60 * 60) {
                return res.status(400).json({message: 'Password can only be changed once every 7 days'});
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.status(400).json({message: 'New password cannot be the same as the old password'});
            }

            user.password = await bcrypt.hash(newPassword, 10);
            user.lastPasswordChange = currentTime;
            await user.save();

            const redisKey = `cooldown:user:${user.userID}:lastPasswordChange`;
            const redisValue = JSON.stringify({
                userID: user.userID,
                changeTime: currentTime,
                nextChangeTime: currentTime + (7 * 24 * 60 * 60),
            });

            await redisClient.set(redisKey, redisValue, 'EX', 7 * 24 * 60 * 60);

            if (closeSessions) {
                await invalidateAllTokens(user.userID);
            }

            res.json({message: 'Password updated successfully'});
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({message: 'Internal server error'});
        }
    }

    async resetPasswordAsync(req, res) {
        const {userName, newPassword, otpCode} = req.body;

        try {
            const user = await db.User.findOne({where: {nickName: userName}});
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }

            const otpCodeRedisRecord = await redisClient.get(`auth:user:${user.userID}:otpRecord`);
            if (!otpCodeRedisRecord) {
                return res.status(404).json({ message: 'OTP code not found' });
            }

            const otpRecord = JSON.parse(otpCodeRedisRecord);
            if (otpRecord.otpCode !== otpCode) {
                return res.status(400).json({ message: 'Invalid OTP code' });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            await invalidateAllTokens(user.userID);

            res.json({message: 'Password reset successfully'});
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({message: 'An unexpected error occurred while resetting the password.'});
        }
    }

    async sendOtpAsync(req, res) {
        const { userName } = req.body;

        try {
            const user = await db.User.findOne({where: {nickName: userName}});
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }

            const otpCodeRedisRecord = await redisClient.get(`auth:user:${user.userID}:otpRecord`);
            if (otpCodeRedisRecord) {
                return res.status(404).json({ message: 'OTP code has already been generated for this user.' });
            }

            const userVerification = await db.UserVerifications.findOne({ where: { userID: user.userID } });
            if (!userVerification) {
                return res.status(404).json({ message: 'User verification record not found' });
            }

            const isMailVerified = userVerification.mailVerification && !isNaN(userVerification.mailVerification) && userVerification.mailVerification > 0;
            const isPhoneVerified = userVerification.phoneVerification && !isNaN(userVerification.phoneVerification) && userVerification.phoneVerification > 0;

            if (!isMailVerified && !isPhoneVerified) {
                return res.status(400).json({ message: 'No verified methods found for the user' });
            }

            const generatedCode = Math.floor(100000 + Math.random() * 900000);
            const currentTime = Math.floor(Date.now() / 1000);

            const redisKey = `auth:user:${user.userID}:otpRecord`;
            const redisValue = JSON.stringify({
                userID: user.userID,
                changeTime: currentTime,
                otpCode: generatedCode,
                endTime: currentTime + (3 * 60), // 3 dakika geçerlilik süresi
            });

            await redisClient.set(redisKey, redisValue, 'EX', 180);

            const smsText = `Onay kodunuz: ${generatedCode}. Lütfen bu kodu girerek işleminizi tamamlayın.`;

            if (isMailVerified) {
                await NotificationService.queueOtpMail(generatedCode, `${user.userName} ${user.userSurname}`, user.eMail, "Doğrulama Kodunuz !");
            }

            if (isPhoneVerified) {
                await NotificationService.queueSMS(`${user.countryCode}${user.phoneNumber}`, smsText);
            }

            res.json({message: 'OTP Code sent successfully'});
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({message: 'An unexpected error occurred while resetting the password.'});
        }
    }

    async verifyOtpAsync(req, res) {
        const { userName, otpCode } = req.body;

        try {
            const user = await db.User.findOne({where: {nickName: userName}});
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }

            const otpCodeRedisRecord = await redisClient.get(`auth:user:${user.userID}:otpRecord`);
            if (!otpCodeRedisRecord) {
                return res.status(404).json({ message: 'OTP code was not found. Try again.' });
            }

            try {
                const otpRecord = JSON.parse(otpCodeRedisRecord);

                if (otpRecord.otpCode !== otpCode) {
                    return res.status(400).json({ message: 'Invalid OTP code.' });
                }

                return res.status(200).json({ message: 'OTP code verified successfully.' });
            } catch (error) {
                console.error('Failed to parse OTP record:', error);
                return res.status(500).json({ message: 'An error occurred while verifying OTP code.' });
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({message: 'An unexpected error occurred while resetting the password.'});
        }
    }

    async verifyUserEmailAsync(req, res) {
        const { userID } = req.params;

        const verificationUrl = `${process.env.BASE_URL}/v1/auth/verify/${userID}`;

        try {
            const userVerification = await db.UserVerifications.findOne({
                where: { userID }
            });

            if (!userVerification) {
                return res.status(404).render('error-mail-verification.ejs', { message: 'User not found or already verified.', verificationUrl });
            }

            if (userVerification.mailVerification) {
                return res.status(400).render('error-mail-verification.ejs', { message: 'User email is already verified.', verificationUrl });
            }

            const verificationTimestamp = Math.floor(Date.now() / 1000);

            await db.UserVerifications.update(
                {
                    mailVerification: verificationTimestamp
                },
                {
                    where: { userID }
                }
            );

            res.render('success-mail-verification.ejs', { message: 'Your email has been successfully verified!' });
        } catch (error) {
            console.error('Error verifying user email:', error);
            res.status(500).render('error-mail-verification.ejs', { message: 'An unexpected error occurred while verifying the email.', verificationUrl });
        }
    }

    async logoutAsync(req, res) {
        const {userID, token} = req.body;

        try {
            await invalidateToken(userID, token);
            res.status(200).json({message: 'Logged out successfully'});
        } catch (error) {
            res.status(500).json({message: 'Error logging out', error});
        }
    }

    async tokenDecodeAsync(req, res) {
        res.json(req.decode);
    }
}

module.exports = AuthController;