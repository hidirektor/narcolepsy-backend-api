const db = require('../../models');

const GenericCRUD = require('../genericCrud');
const seasonCrud = new GenericCRUD({ model: db.ComicSeason, where: null });
const redisClient = require('../../utils/thirdParty/redis/redisClient');
const HttpStatusCode = require('http-status-codes');
const { errorSender } = require('../../utils');
const { v4: uuidv4 } = require('uuid');

class SeasonController {
    constructor() {
    }

    async createSeasonAsync(req, res) {
        const { comicID, seasonName, seasonOrder } = req.body;

        try {
            const season = await seasonCrud.create({
                comicID,
                seasonID: uuidv4(),
                seasonName,
                seasonOrder
            });

            res.status(HttpStatusCode.CREATED).json({
                message: 'Season created successfully.',
                season: season.result
            });
        } catch (error) {
            console.error('Error creating season:', error);
            res.status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async editSeasonAsync(req, res) {
        const { seasonID, seasonName, seasonOrder } = req.body;

        try {
            const season = await seasonCrud.findOne({ where: { seasonID: seasonID } });

            if (!season.result.seasonID) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Season not found.' });
            }

            if(seasonOrder) {
                season.result.seasonOrder = seasonOrder;
            }

            if(seasonName) {
                season.result.seasonName = seasonName;
            }
            await season.result.save();

            const updatedSeason = await seasonCrud.findOne({ where: { seasonID: seasonID } });

            res.status(HttpStatusCode.OK).json({
                message: 'Season updated successfully.',
                season: updatedSeason.result
            });
        } catch (error) {
            console.error('Error editing season:', error);
            res.status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async getAllSeasonsAsync(req, res) {
        try {
            const seasons = await seasonCrud.getAll();

            res.status(HttpStatusCode.OK).json({
                message: 'Seasons fetched successfully.',
                seasons: seasons || []
            });
        } catch (error) {
            console.error('Error fetching all seasons:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async getSeasonByIDAsync(req, res) {
        const { seasonID } = req.params;

        try {
            const season = await seasonCrud.findOne({ where: { seasonID } });

            if (!season.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Season not found.' });
            }

            res.status(HttpStatusCode.OK).json({
                message: 'Season fetched successfully.',
                season: season.result
            });
        } catch (error) {
            console.error('Error fetching season by ID:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async deleteSeasonAsync(req, res) {
        const { seasonID } = req.params;

        try {
            const season = await seasonCrud.findOne({ where: { seasonID } });

            if (!season.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Season not found.' });
            }

            const operationKey = uuidv4();
            await redisClient.set(
                `delete:season:${operationKey}`,
                JSON.stringify({ seasonID }),
                'EX',
                180 // 3 minutes expiration
            );

            res.status(HttpStatusCode.OK).json({
                message: 'Season deletion requires confirmation. Use the operation key to confirm.',
                operationKey
            });
        } catch (error) {
            console.error('Error deleting season:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async confirmDeleteSeasonAsync(req, res) {
        const { operationKey } = req.body;

        try {
            const data = await redisClient.get(`delete:season:${operationKey}`);

            if (!data) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid or expired operation key.' });
            }

            const { seasonID } = JSON.parse(data);
            await seasonCrud.delete({ where: { seasonID } });
            await redisClient.del(`delete:season:${operationKey}`);

            res.status(HttpStatusCode.OK).json({
                message: 'Season deleted successfully.'
            });
        } catch (error) {
            console.error('Error confirming season deletion:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    async getSeasonsByComicAsync(req, res) {
        const { comicID } = req.params;

        try {
            const seasons = await seasonCrud.getAll({ where: { comicID } });

            res.status(HttpStatusCode.OK).json({
                message: 'Seasons fetched successfully by comic.',
                seasons: seasons || []
            });
        } catch (error) {
            console.error('Error fetching seasons by comic ID:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }
}

module.exports = SeasonController;