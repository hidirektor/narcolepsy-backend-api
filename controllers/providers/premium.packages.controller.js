const db = require('../../models');

const GenericCRUD = require('../genericCrud');
const premiumCrud = new GenericCRUD({ model: db.PremiumPackages, where: null });
const premiumUsersCrud = new GenericCRUD({ model: db.PremiumUsers, where: null });
const ordersCrud = new GenericCRUD({ model: db.Orders, where: null });
const userCrud = new GenericCRUD({ model: db.User, where: null });

const {errorSender} = require('../../utils');
const HttpStatusCode = require('http-status-codes');

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

        try {
            await premiumCrud.delete({ packageID });

            const orders = await ordersCrud.getAll({ where: { packageID } });

            if (orders.length === 0) {
                return res.status(200).json({
                    message: 'Premium package deleted successfully. No users were affected by the deletion.',
                    affectedUsersMappings: []
                });
            }

            const orderIDs = orders.map(order => order.orderID);

            const mappings = await premiumUsersCrud.getAll({ where: { orderID: orderIDs } });

            if (mappings.length === 0) {
                return res.status(200).json({
                    message: 'Premium package deleted successfully. No users were affected by the deletion.',
                    affectedUsersMappings: []
                });
            }

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

                // Add 'return' here to prevent further execution
                return res.status(200).json({
                    message: 'Premium package deleted. The users affected by the deletion are as follows.',
                    affectedUsersMappings: affectedUsers
                });
            }

            // This will only be reached if userIDs.length === 0
            return res.status(200).json({
                message: 'Premium package deleted successfully. No users were affected by the deletion.',
                affectedUsersMappings: []
            });
        } catch (err) {
            console.error('Error deleting premium package:', err);
            res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(err.message || 'Internal Server Error');
        }
    }

}

module.exports = PremiumPackageController;
