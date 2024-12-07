const amqp = require('amqplib/callback_api');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const RABBITMQ_USER = process.env.RABBITMQ_USER || 'guest';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'guest';
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;

const fullRabbitMQUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;

let connection = null;
let channel = null;

const connectToRabbitMQ = () => {
    return new Promise((resolve, reject) => {
        amqp.connect(fullRabbitMQUrl, (error, conn) => {
            if (error) {
                reject('RabbitMQ bağlantı hatası: ' + error);
                return;
            }
            connection = conn;
            connection.createChannel((error, ch) => {
                if (error) {
                    reject('RabbitMQ kanal oluşturma hatası: ' + error);
                    return;
                }
                channel = ch;
                resolve(channel);
            });
        });
    });
};
const sendToQueue = async (queueName, message) => {
    try {
        if (!channel) {
            await connectToRabbitMQ();
        }

        channel.assertQueue(queueName, { durable: true });
        const msg = JSON.stringify(message);

        channel.sendToQueue(queueName, Buffer.from(msg), { persistent: true });
        console.log(`Mesaj "${queueName}" kuyruğuna gönderildi.`);
    } catch (error) {
        console.error('Mesaj gönderim hatası:', error);
    }
};


const closeConnection = () => {
    if (connection) {
        connection.close();
        console.log('RabbitMQ bağlantısı kapatıldı.');
    }
};

module.exports = {
    sendToQueue,
    closeConnection,
};