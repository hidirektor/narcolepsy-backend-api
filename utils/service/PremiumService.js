const RabbitClient = require('../thirdParty/messaging/rabbitClient');

class PremiumService {

    static async queuePremiumUser(userID, endDate) {
        try {
            const premiumUserMessage = {
                type: 'premiumUser',
                userID: userID,
                endDate: endDate,
            };

            await RabbitClient.sendToQueue('premiumUserQueue', premiumUserMessage);
        } catch (error) {
            console.error('Premium kullanıcı kuyruğa ekleme hatası:', error);
        }
    }
}

module.exports = PremiumService;