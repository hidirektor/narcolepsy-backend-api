const {routerAuthorization} = require('../utils');
const HttpStatusCode = require('http-status-codes');

const redisClient = require('../utils/thirdParty/redis/redisClient');

const GenericCRUD = require('../controllers/genericCrud');
const db = require("../models");
const userCrud = new GenericCRUD({model: db.User, where: null});

class Authorization {
    constructor() {
    }

    static authControl(allowedRoles) {
        return async (req, res, next) => {
            try {
                const userID = req.decode.userID;

                const foundedUser = await userCrud.findOne({ where: {userID: userID} });
                if(!foundedUser || !foundedUser.result) {
                    return res
                        .status(HttpStatusCode.UNAUTHORIZED)
                        .send('Unauthorized transaction.');
                }

                const userRole = foundedUser.result.userType;

                if (!allowedRoles || allowedRoles.includes(userRole)) {
                    return next();
                } else {
                    return res
                        .status(HttpStatusCode.UNAUTHORIZED)
                        .send('Unauthorized transaction.');
                }
            } catch (error) {
                res.status(error.status || 500).send(error.message);
            }
        };
    }

    static async limitedAuthControl(req, res, next) {
        try {
            const foundedUser = await userCrud.findOne({ where: {userID: userID} });
            if(!foundedUser || !foundedUser.result) {
                return res
                    .status(HttpStatusCode.UNAUTHORIZED)
                    .send('Unauthorized transaction.');
            }

            const userRole = foundedUser.result.userType;

            const auth =
                routerAuthorization[req.route.path.split('/')[1].replace('-', '_')][
                    req.method
                    ].Individual_Transactions;

            if (!auth || auth.includes(userRole)) {
                req.Individual_Transactions = true;
            } else {
                req.Individual_Transactions = false;
            }
            next();
        } catch (error) {
            res.status(error.status || 500).send(error.message);
        }
    }

    static async invalidateToken(userID, token) {
        try {
            const keys = await redisClient.keys(`auth:user:${userID}:token_*`);

            for (const key of keys) {
                const data = await redisClient.get(key);
                if (data) {
                    const parsedData = JSON.parse(data);

                    if (parsedData.token === token) {
                        await redisClient.del(key);
                        console.log(`Token "${token}" userID "${userID}" için başarıyla silindi.`);
                        return;
                    }
                }
            }

            console.log(`Belirtilen token "${token}" userID "${userID}" için bulunamadı.`);
        } catch (error) {
            console.error('Failed to invalidate token:', error);
        }
    }

    static async invalidateAllTokens(userID) {
        try {
            const tokens = await redisClient.keys(`auth:user:${userID}:token_*`);

            if (tokens.length > 0) {
                await redisClient.del(tokens);
                console.log(`User ${userID} için tüm tokenlar başarıyla silindi.`);
            } else {
                console.log(`User ${userID} için silinecek token bulunamadı.`);
            }
        } catch (error) {
            console.error('Failed to invalidate all tokens:', error);
        }
    }
}

module.exports = Authorization;