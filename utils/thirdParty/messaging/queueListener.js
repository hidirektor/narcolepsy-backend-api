const amqp = require('amqplib/callback_api');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const ejs = require('ejs');
const path = require('path');
const GenericCRUD = require("../../../controllers/genericCrud");
const db = require("../../../models");

const roles = require('../../../models/roles');
const userCrud = new GenericCRUD({model: db.User, where: null});
const premiumCrud = new GenericCRUD({model: db.PremiumUsers, where: null});

const RABBITMQ_USER = process.env.RABBITMQ_USER || 'guest';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'guest';
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;

const fullRabbitMQUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;

let connection = null;
let channel = null;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendEmailWithRetry = async (mailOptions, retries = 5, delay = 5000) => {
    try {
        await transporter.sendMail(mailOptions);
        console.log("E-posta başarıyla gönderildi.");
    } catch (error) {
        if (retries > 0 && error.responseCode === 421) {
            console.log(`Hata oluştu. ${retries} kez daha deneyip bekliyorum...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            await sendEmailWithRetry(mailOptions, retries - 1, delay);
        } else {
            console.error('E-posta gönderim hatası:', error);
        }
    }
};

const setupQueues = () => {
    channel.assertQueue('notificationQueue', { durable: true });

    channel.assertQueue('premiumUserQueue', {
        durable: true,
        arguments: {
            'x-message-ttl': 24 * 60 * 60 * 1000, // 24 saatlik TTL
            'x-dead-letter-exchange': 'dlxExchange',
        },
    });

    channel.assertExchange('dlxExchange', 'direct', { durable: true });

    channel.assertQueue('expiredPremiumQueue', { durable: true });
    channel.bindQueue('expiredPremiumQueue', 'dlxExchange', '');

    console.log('Kuyruklar ve DLX başarıyla ayarlandı.');
};

const startQueueListener = () => {
    if (!channel) {
        console.log('RabbitMQ bağlantısı kuruluyor...');
        connectToRabbitMQ();
        return;
    }

    setupQueues();

    const queues = ['notificationQueue', 'expiredPremiumQueue'];

    queues.forEach((queueName) => {
        if (channel) {
            console.log(`"${queueName}" kuyruğundan gelen mesajlar dinleniyor...`);

            channel.consume(queueName, async (msg) => {
                if (msg !== null) {
                    const message = JSON.parse(msg.content.toString());

                    try {
                        if (queueName === 'notificationQueue') {
                            if (message.type === 'email') {
                                await processEmail(message);
                            }

                            if (message.type === 'sms') {
                                await sendSMS(message.to, message.message);
                                console.log('SMS mesajı alındı:', message);
                            }
                        } else if (queueName === 'expiredPremiumQueue') {
                            await processPremiumUser(message);
                        }

                        channel.ack(msg);
                    } catch (error) {
                        console.error(`${queueName} kuyruğunda hata:`, error);
                        channel.nack(msg, false, true);
                    }
                }
            });
        } else {
            console.error('RabbitMQ bağlantısı kurulamamış!');
        }
    });
};

const processEmail = async ({ templateName, variables, to, subject }) => {
    try {
        const templatePath = path.resolve(__dirname, `../../../views/${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, variables);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html,
        };

        await sendEmailWithRetry(mailOptions);
    } catch (error) {
        console.error('E-posta şablonu işleme hatası:', error);
    }
};

const processPremiumUser = async (message) => {
    try {
        const { userID } = message;

        const premiumUser = await premiumCrud.findOne({
            where: { userID },
            order: [['endDate', 'DESC']],
        });

        if (premiumUser && premiumUser.endDate <= Date.now()) {
            await userCrud.update(
                { where: { userID: userID } },
                { role: roles.USER }
            );

            console.log(`Kullanıcı ${userID} premium süresi sona erdi. Rol güncellendi.`);
        }
    } catch (error) {
        console.error('Premium kullanıcı kontrolünde hata:', error);
    }
};

const sendSMS = (to, body) => {
    twilioClient.messages
        .create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to,
        })
        .then((message) => {
            console.log('SMS gönderildi:', message.sid);
        })
        .catch((error) => {
            console.error('SMS gönderimi hatası:', error);
        });
};

const connectToRabbitMQ = () => {
    amqp.connect(fullRabbitMQUrl, (error, conn) => {
        if (error) {
            console.error('RabbitMQ bağlantı hatası:', error);
            return;
        }
        connection = conn;
        connection.createChannel((error, ch) => {
            if (error) {
                console.error('RabbitMQ kanal oluşturma hatası:', error);
                return;
            }
            channel = ch;
            console.log('RabbitMQ bağlantısı başarılı ve kanal oluşturuldu.');

            startQueueListener();
        });
    });
};

const closeConnection = () => {
    if (connection) {
        connection.close();
        console.log('RabbitMQ bağlantısı kapatıldı.');
    }
};

module.exports = { startQueueListener, closeConnection };