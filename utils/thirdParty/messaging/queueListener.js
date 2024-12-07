const amqp = require('amqplib/callback_api');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const rabbitClient = require('./rabbitClient');

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

const startQueueListener = () => {
    if (!channel) {
        connectToRabbitMQ();
    }

    const queueName = 'notificationQueue';
    if (channel) {
        channel.assertQueue(queueName, { durable: true });

        console.log(`"${queueName}" kuyruğundan gelen mesajlar dinleniyor...`);

        channel.consume(queueName, (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());

                if (message.type === 'email') {
                    sendEmail(message.to, message.subject, message.html);
                }

                if (message.type === 'sms') {
                    console.log('SMS mesajı alındı:', message);
                    sendSMS(message.to, message.body);
                }

                channel.ack(msg);
            }
        });
    } else {
        console.error('RabbitMQ bağlantısı kurulamamış!');
    }
};

const sendEmail = (to, subject, html) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('E-posta gönderim hatası:', error);
        } else {
            console.log('E-posta gönderildi:', info.response);
        }
    });
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