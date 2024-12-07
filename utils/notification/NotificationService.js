const RabbitClient = require('../thirdParty/messaging/rabbitClient');
const ejs = require('ejs');
const path = require('path');

class NotificationService {

    static async queueEmail(templateName, variables, toEmail, subject) {
        try {
            const mailMessage = {
                type: 'email',
                templateName: templateName,
                variables: variables,
                to: toEmail,
                subject: subject,
            };

            await RabbitClient.sendToQueue('notificationQueue', mailMessage);

        } catch (error) {
            console.error('E-posta kuyruğa ekleme hatası:', error);
        }
    }

    static async queueSMS(toPhoneNumber, message) {
        try {
            const smsMessage = {
                type: 'sms',
                to: toPhoneNumber,
                message: message
            };

            await RabbitClient.sendToQueue('notificationQueue', smsMessage);

        } catch (error) {
            console.error('SMS kuyruğa ekleme hatası:', error);
        }
    }

    static queueRegisterMail(verificationUrl, name, email, subject) {
        const variables = {
            verificationUrl: verificationUrl,
            name: name,
        };

        return this.queueEmail('register-template', variables, email, subject);
    }

    static queueOtpMail(generatedCode, name, email, subject) {
        const variables = {
            generatedCode: generatedCode,
            name: name,
        };

        return this.queueEmail('otp-mail-template', variables, email, subject);
    }
}

module.exports = NotificationService;