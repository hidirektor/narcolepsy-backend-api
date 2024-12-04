require('dotenv').config();
const jwt = require('jsonwebtoken');
const HttpStatusCode = require('http-status-codes');
const redisClient = require('../utils/thirdParty/redis/redisClient');

class VerifyToken {
    constructor() {
    }

    static async tokenControl(req, res, next) {
        const authHeader = req.headers['authorization'];
        let token;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            token = req.headers['token'] || req.body.token || req.query.token;
        }

        if (token) {
            const isBlacklisted = await redisClient.get(`blacklist_${token}`);
            if (isBlacklisted) {
                return res
                    .status(HttpStatusCode.UNAUTHORIZED)
                    .json({message: 'Token has been invalidated.'});
            }
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    res
                        .status(HttpStatusCode.PROXY_AUTHENTICATION_REQUIRED)
                        .json({message: 'Failed to authenticate token.'});
                } else {
                    req.decode = decoded;
                    next();
                }
            });
        } else {
            res
                .status(HttpStatusCode.PROXY_AUTHENTICATION_REQUIRED)
                .json({message: 'No token provided.'});
        }
    }

    static async userMatchControl(req, res, next) {
        if (req.decode.userID !== req.body.userID && req.decode.userType !== 'ADMIN') {
            return res.status(HttpStatusCode.UNAUTHORIZED).json({message: 'Unauthorized operation.'});
        }
        next();
    }
}

module.exports = VerifyToken;