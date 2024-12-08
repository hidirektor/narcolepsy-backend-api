const db = require('../../models');
const HttpStatusCode = require('http-status-codes');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {errorSender} = require('../../utils');
const redisClient = require('../../utils/thirdParty/redis/redisClient');
const GenericCRUD = require('../genericCrud');
const userCrud = new GenericCRUD({model: db.User, where: null});
const productCrud = new GenericCRUD({model: db.PremiumPackages, where: null});
const roles = require('../../models/roles');

const axios = require('axios');
const CryptoJS = require('crypto-js');

const NotificationService = require('../../utils/notification/NotificationService');

class PaymentController {
    constructor() {
    }

    /**
     * Starts the checkout process by initializing the request to Iyzico's API.
     * @param {Object} req - The request object containing the data.
     * @param {Object} res - The response object to send results.
     */
    async startCheckoutAsync(req, res) {
        const {userID, packageID, ipAddress} = req.body;

        const apiKey = process.env.IYZICO_API_KEY;
        const secretKey = process.env.IYZICO_SECRET_KEY;
        const url = 'https://api.iyzipay.com/payment/iyzipos/checkoutform/initialize/auth/ecom';
        const callback_url = `https://narcolepsy.com.tr/payment-success/${userID}`;

        try {
            const userResponse = await userCrud.findOne({where: {userID}});

            if (!userResponse || !userResponse.result) {
                return res.status(404).send('User not found');
            }

            const user = userResponse.result;
            const userName = user.userName;
            const userSurname = user.userSurname;
            const eMail = user.eMail;
            const phoneNumber = user.phoneNumber;

            const product = await productCrud.findOne({where: {packageID}});
            if (!product || !product.result) {
                return res.status(404).send('Product not found');
            }

            const price = product.result.packagePrice;
            const productName = product.result.packageName;

            const data = {
                locale: 'tr',
                price: price,
                buyer: {
                    id: userID,
                    name: userName,
                    surname: userSurname,
                    identityNumber: '74300864791',
                    email: eMail,
                    gsmNumber: phoneNumber,
                    registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                    city: 'Istanbul',
                    country: 'Turkey',
                    ip: ipAddress
                },
                shippingAddress: {
                    address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                    contactName: `${userName} ${userSurname}`,
                    city: 'Istanbul',
                    country: 'Turkey'
                },
                billingAddress: {
                    address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                    contactName: `${userName} ${userSurname}`,
                    city: 'Istanbul',
                    country: 'Turkey'
                },
                basketItems: [
                    {
                        id: packageID,
                        price: price,
                        category1: "NarcoLepsy Üyelik",
                        name: productName,
                        itemType: 'VIRTUAL'
                    }
                ],
                callbackUrl: callback_url,
                currency: 'TRY',
                paidPrice: price,
                enabledInstallments: [1, 2, 3, 6, 9]
            };

            // Authorization Strings
            const xIyziRnd = new Date().getTime() + '123456789'; // Timestamp and random value

            let payload = xIyziRnd + '/payment/iyzipos/checkoutform/initialize/auth/ecom';
            payload += JSON.stringify(data);

            const encryptedData = CryptoJS.HmacSHA256(payload, secretKey);
            const authorizationString = `apiKey:${apiKey}&randomKey:${xIyziRnd}&signature:${encryptedData}`;
            const base64EncodedAuthorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationString));

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `IYZWSv2 ${base64EncodedAuthorization}`,
                'x-iyzi-rnd': xIyziRnd
            };

            try {
                const response = await axios.post(url, data, {
                    headers: headers,
                    proxy: false
                });

                if (response.status === 200) {
                    return res.json({success: true, data: response.data});
                } else {
                    return res.status(response.status).json({success: false, message: 'Unexpected response from Iyzico.'});
                }
            } catch (err) {
                console.error('Error starting checkout:', err.response?.data || err.message);
                return res
                    .status(err.status || 500)
                    .send(err.response?.data?.message || 'Failed to initialize checkout.');
            }
        } catch (error) {
            console.error('Error fetching data from database:', error);
            return res.status(500).send('Error fetching user or product data.');
        }
    }
}

module.exports = PaymentController;