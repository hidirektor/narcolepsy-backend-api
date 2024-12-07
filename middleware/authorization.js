const {routerAuthorization} = require('../utils');
const HttpStatusCode = require('http-status-codes');

const redisClient = require('../utils/thirdParty/redis/redisClient');

class Authorization {
    constructor() {
    }

    static async authControl(req, res, next) {
        try {
            const auth =
                routerAuthorization[req.route.path.split('/')[1].replace('-', '_')][
                    req.method
                    ].Authorize;
            if (!auth || auth.indexOf(req.decode.userType) !== -1) next();
            else
                res
                    .status(HttpStatusCode.UNAUTHORIZED)
                    .send('Unauthorized transaction.');
        } catch (error) {
            res.status(error.status || 500).send(error.message);
        }
    }

    static isEngineerOrSysop(req) {
        const {userType} = req.decode;
        return userType === 'ENGINEER' || userType === 'SYSOP';
    }

    static async limitedAuthControl(req, res, next) {
        try {
            const auth =
                routerAuthorization[req.route.path.split('/')[1].replace('-', '_')][
                    req.method
                    ].Individual_Transactions;
            if (!auth || auth.indexOf(req.decode.userType) !== -1)
                req.Individual_Transactions = true;
            else req.Individual_Transactions = false;
            next();
        } catch (error) {
            res.status(error.status || 500).send(error.message);
        }
    }

    static async invalidateToken(token) {
        try {
            await redisClient.set(`blacklist_${token}`, true, 'EX', process.env.JWT_EXPIRE_TIME);
        } catch (error) {
            console.error('Failed to invalidate token:', error);
        }
    }

    static async invalidateAllTokens(userID) {
        try {
            const tokens = await redisClient.keys(`token_${userID}_*`);
            const pipeline = redisClient.pipeline();
            tokens.forEach(token => {
                pipeline.set(`blacklist_${token}`, true, 'EX', process.env.JWT_EXPIRE_TIME);
            });
            await pipeline.exec();
        } catch (error) {
            console.error('Failed to invalidate all tokens:', error);
        }
    }
}

module.exports = Authorization;