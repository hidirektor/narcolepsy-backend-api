const db = require('../../models');
const { Op } = require('sequelize');

const GenericCRUD = require('../genericCrud');
const premiumCrud = new GenericCRUD({ model: db.PremiumPackages, where: null });
const premiumUsersCrud = new GenericCRUD({ model: db.PremiumUsers, where: null });
const ordersCrud = new GenericCRUD({ model: db.Orders, where: null });
const userCrud = new GenericCRUD({ model: db.User, where: null });

const {errorSender} = require('../../utils');
const HttpStatusCode = require('http-status-codes');

const redisClient = require('../../utils/thirdParty/redis/redisClient');

class PremiumPackageController {
    constructor() {}

    getAllPremiumPackagesAsync(req, res) {
        premiumCrud.getAll()
            .then(premiumPackages => res.json(premiumPackages))
            .catch(err => {
                res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

    getPremiumPackageAsync(req, res) {
        const { packageID } = req.params;
        premiumCrud.findOne({ where: { packageID } })
            .then(premiumPackage => res.json(premiumPackage))
            .catch(err => {
                res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

    createPremiumPackageAsync(req, res) {
        const { packageName, packageDescription, packagePrice, packageTime } = req.body;
        if (!packageName || !packageDescription || !packagePrice || !packageTime) {
            const error = errorSender.errorObject(HttpStatusCode.BAD_REQUEST, "packageName, packageDescription, packagePrice and packageTime is required.");
            return res.status(error.status).send(error.message);
        }

        premiumCrud.create({ packageName: packageName, packageDescription: packageDescription, packagePrice: packagePrice, packageTime: packageTime })
            .then(newPremiumPackage => res.status(201).json(newPremiumPackage))
            .catch(err => {
                res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

    updatePremiumPackageAsync(req, res) {
        const { packageID, packageName, packageDescription, packagePrice, packageTime } = req.body;
        if (!packageID || !packageName || !packageDescription || !packagePrice || !packageTime) {
            const error = errorSender.errorObject(HttpStatusCode.BAD_REQUEST, "packageID, packageName, packageDescription, packagePrice and packageTime is required.");
            return res.status(error.status).send(error.message);
        }

        premiumCrud.update({ where: { packageID } }, { packageName: packageName, packageDescription: packageDescription, packagePrice: packagePrice, packageTime: packageTime })
            .then(() => {
                return premiumCrud.findOne({ where: { packageID } });
            })
            .then(updatedPremiumPackage => {
                res.json(updatedPremiumPackage);
            })
            .catch(err => {
                res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
            });
    }

    async removePremiumPackageAsync(req, res) {
        const { packageID } = req.params;
        const token = req.headers.authorization?.split(' ')[1];

        try {
            const orders = await ordersCrud.getAll({ where: { packageID: packageID } });
            const orderIDs = orders.map(order => order.orderID);
            const mappings = await premiumUsersCrud.getAll({ where: { orderID: orderIDs } });

            if (orders.length === 0 && mappings.length === 0) {
                await premiumCrud.delete({ where: { packageID: packageID } });

                return res.status(200).json({
                    message: 'Premium package deleted successfully. No users were affected by the deletion.',
                    affectedUsersMappings: []
                });
            }

            const affectedPremiumPackage = await premiumCrud.findOne({ where: {packageID: packageID}});
            const userIDs = mappings.map(mapping => mapping.userID);

            let affectedUsers = [];
            if (userIDs.length > 0) {
                const userPromises = userIDs.map(userID => userCrud.findOne({ where: { userID: userID } }));
                const userResults = await Promise.all(userPromises);

                affectedUsers = userResults
                    .filter(result => result.status && result.result)
                    .map(result => {
                        const user = result.result;
                        return {
                            userID: user.userID,
                            userName: user.userName,
                            userSurname: user.userSurname,
                            eMail: user.eMail,
                        };
                    });
            }

            const operationKey = crypto.randomUUID();
            const redisKey = `operation:remove:premium-package:${operationKey}`;

            await redisClient.set(
                redisKey,
                JSON.stringify({ packageID, affectedUsers, token }),
                'EX',
                180 // 3 dakika süreyle geçerli
            );

            return res.status(200).json({
                message: 'Premium package deletion requires confirmation. Use the provided operation key to confirm.',
                operationKey: operationKey,
                affectedPremiumPackage: affectedPremiumPackage.result,
                deletedPremiumUsers: affectedUsers,
                affectedOrders: orders
            });
        } catch (err) {
            console.error('Error deleting premium package:', err);
            res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
        }
    }

    async confirmRemovePremiumPackageAsync(req, res) {
        const { operationKey } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        const redisKey = `operation:remove:premium-package:${operationKey}`;

        try {
            const data = await redisClient.get(redisKey);

            if (!data) {
                return res.status(400).json({ message: 'Invalid or expired operation key.' });
            }

            const { packageID, affectedUsers, token: storedToken } = JSON.parse(data);

            if (token !== storedToken) {
                return res.status(403).json({ message: 'Invalid token for this operation.' });
            }

            console.log(affectedUsers);

            if (Array.isArray(affectedUsers) && affectedUsers.length > 0) {
                const userIDs = affectedUsers.map(user => user?.userID).filter(Boolean);

                if (userIDs.length > 0) {
                    console.log('Deleting premium users with IDs:', userIDs);

                    await premiumUsersCrud.delete({
                        where: {
                            userID: {
                                [Op.in]: userIDs
                            }
                        }
                    });
                }
            }

            const affectedOrders = await ordersCrud.getAll({ where: {packageID: packageID}});

            await ordersCrud.delete({
                where: {
                    packageID: packageID
                }
            });

            const affectedPremiumPackage = await premiumCrud.findOne({ where: {packageID: packageID}});

            await premiumCrud.delete({ packageID });

            await redisClient.del(redisKey);

            return res.status(200).json({
                message: 'Premium package, associated users, and orders deleted successfully.',
                affectedPremiumPackage: affectedPremiumPackage.result,
                deletedPremiumUsers: affectedUsers,
                affectedOrders: affectedOrders
            });
        } catch (err) {
            console.error('Error confirming premium package deletion:', err);
            res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
        }
    }

}

module.exports = PremiumPackageController;
