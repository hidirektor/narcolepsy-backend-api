const db = require('../../models');
const HttpStatusCode = require('http-status-codes');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {errorSender} = require('../../utils');
const redisClient = require('../../utils/thirdParty/redis/redisClient');
const GenericCRUD = require('../genericCrud');
const userCrud = new GenericCRUD({model: db.User, where: null});
const productCrud = new GenericCRUD({model: db.PremiumPackages, where: null});
const orderCrud = new GenericCRUD({model: db.Orders, where: null});
const premiumCrud = new GenericCRUD({model: db.PremiumUsers, where: null});
const packageCrud = new GenericCRUD({model: db.PremiumPackages, where: null});
const roles = require('../../models/roles');
const payment_status = require('../../models/payment_status');

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
        const callback_url = `https://api.narcolepsy.com.tr/v1/payment/check-payment/${userID}`;

        const transaction = await db.sequelize.transaction();

        try {
            const userResponse = await userCrud.findOne({where: {userID: userID}});
            const user = userResponse.result;

            if (!userResponse || !userResponse.result || !user) {
                return res.status(404).send('User not found');
            }

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

            const lastCheckout = await redisClient.get(`cooldown:user-${userID}:lastCheckout`);
            const currentTime = Date.now();
            if (lastCheckout && currentTime - lastCheckout < 5 * 60 * 1000) {
                return res.status(400).send('You can only initiate checkout every 5 minutes.');
            }

            await redisClient.set(`cooldown:user-${userID}:lastCheckout`, currentTime, 'EX', 5 * 60);

            // Authorization Strings
            const xIyziRnd = new Date().getTime() + '123456789';

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
                    console.log(response.data);
                    await db.Orders.create({
                        userID: userID,
                        packageID: packageID,
                        paymentMethod: "Iyzico",
                        paymentStatus: payment_status.CREATED,
                        orderPrice: price,
                        userIP: ipAddress,
                        iyzicoToken: response.data.token,
                        iyzicoSignature: response.data.signature
                    }, (transaction));
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

    async verifyCheckoutPaymentAsync(req, res) {
        const { userID } = req.params;

        try {
            const orderResponse = await orderCrud.findOne({
                where: { userID: userID },
                order: [['orderDate', 'DESC']],
            });

            if (!orderResponse || !orderResponse.result) {
                return res.status(404).send('Order not found');
            }

            const order = orderResponse.result;
            const { iyzicoToken, packageID } = order;

            const apiKey = process.env.IYZICO_API_KEY;
            const secretKey = process.env.IYZICO_SECRET_KEY;
            const url = 'https://api.iyzipay.com/payment/iyzipos/checkoutform/auth/ecom/detail';
            const data = {
                token: iyzicoToken,
                locale: "tr"
            };

            const xIyziRnd = new Date().getTime() + '123456789';
            let payload = xIyziRnd + '/payment/iyzipos/checkoutform/auth/ecom/detail';
            payload += JSON.stringify(data);

            const encryptedData = CryptoJS.HmacSHA256(payload, secretKey);
            const authorizationString = `apiKey:${apiKey}&randomKey:${xIyziRnd}&signature:${encryptedData}`;
            const base64EncodedAuthorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationString));

            const response = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `IYZWSv2 ${base64EncodedAuthorization}`,
                    'x-iyzi-rnd': xIyziRnd
                },
            });

            if (response.status === 200) {
                const jsonResponse = response.data;
                const paymentStatus = jsonResponse.paymentStatus;

                if (paymentStatus === "SUCCESS") {
                    await orderCrud.update(
                        { where: { orderID: order.orderID } },
                    { paymentStatus: payment_status.COMPLETED }
                    );

                    await userCrud.update(
                        { where: { userID } },
                        { userType: roles.PREMIUM }
                    );


                    const selectedPackage = await packageCrud.findOne({ where: { packageID }});
                    const existingPremiumRecord = await premiumCrud.findOne({
                        where: { orderID: order.orderID }
                    });

                    const premiumPackage = existingPremiumRecord.result;

                    if(!premiumPackage.orderID) {
                        await premiumCrud.create({
                            userID: order.userID,
                            orderID: order.orderID,
                            startDate: Math.floor(Date.now() / 1000),
                            endDate: Math.floor(Date.now() / 1000) + (selectedPackage.result.packageTime * 24 * 60 * 60)
                        });
                    }

                    return res.render('payment-success.ejs', {data: jsonResponse});
                } else {
                    await orderCrud.update(
                        { paymentStatus: payment_status.FAILED },
                        { where: { orderID: order.orderID } }
                    );

                    return res.render('payment-failure', {message: 'Payment failed.', data: jsonResponse});
                }
            } else {
                await orderCrud.update(
                    { paymentStatus: payment_status.FAILED },
                    { where: { orderID: order.orderID } }
                );

                return res.render('payment-failure', {message: 'Unexpected response from Iyzico.', data: response.data});
            }
        } catch (error) {
            console.error('Error during payment verification:', error.message);

            if (error.response) {
                return res.status(error.response.status || 500).json({
                    success: false,
                    message: error.response.data?.message || 'Failed to verify payment.',
                });
            }

            return res.status(500).send('An error occurred during payment verification.');
        }
    }
}

module.exports = PaymentController;