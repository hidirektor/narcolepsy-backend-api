const RabbitClient = require('../thirdParty/messaging/rabbitClient');
const ejs = require('ejs');
const path = require('path');

class NotificationService {

    static async sendMail(templateName, variables, toEmail, subject) {
        try {
            const templatePath = path.resolve(__dirname, 'templates/register-template.ejs');

            const html = await ejs.renderFile(templatePath, variables);

            const mailMessage = {
                type: 'email',
                to: toEmail,
                subject: subject,
                html: html
            };

            await RabbitClient.sendToQueue('notificationQueue', mailMessage);

        } catch (error) {
            console.error('E-posta gönderme hatası:', error);
        }
    }

    static async sendSMS(toPhoneNumber, message) {
        try {
            const smsMessage = {
                type: 'sms',
                to: toPhoneNumber,
                message: message
            };

            await RabbitClient.sendToQueue('notificationQueue', smsMessage);

        } catch (error) {
            console.error('SMS gönderme hatası:', error);
        }
    }

    static sendRegisterMail(verificationUrl, email, subject) {
        const variables = {
            verificationUrl: verificationUrl,
        };

        return this.sendMail('register-template', variables, email, subject);
    }
}

module.exports = NotificationService;