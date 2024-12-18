const db = require('../../models');
const GenericCRUD = require('../genericCrud');
const HttpStatusCode = require('http-status-codes');

const userRatingCrud = new GenericCRUD({ model: db.UserRatings });
const userCommentsCrud = new GenericCRUD({ model: db.UserComments });
const comicDownloadMappingCrud = new GenericCRUD({ model: db.ComicDownloadMapping });
const comicStatsCrud = new GenericCRUD({ model: db.ComicStats });
const comicCategoryMappingCrud = new GenericCRUD({ model: db.ComicCategoryMapping });
const comicEpisodesCrud = new GenericCRUD({ model: db.ComicEpisode });

class StatsController {
    constructor() {}

    async getStats(req, res) {
        const { type, id } = req.params;
        const { statType } = req.query;

        try {
            let data = [];
            let total = 0;

            switch (type) {
                case 'comic':
                    if (statType === 'rates') {
                        data = await userRatingCrud.getAll({ where: { comicID: id } });
                        total = data.reduce((sum, r) => sum + r.userRating, 0);
                    } else if (statType === 'views' || statType === 'downloads') {
                        data = await comicStatsCrud.getAll({ where: { comicID: id } });
                        total = data.reduce(
                            (sum, stat) =>
                                sum +
                                (statType === 'views' ? stat.viewCount : stat.downloadCount),
                            0
                        );
                    } else if (statType === 'comments') {
                        data = await userCommentsCrud.getAll({ where: { comicID: id } });
                        total = data.length;
                    }
                    break;

                case 'episode':
                    if (statType === 'rates') {
                        data = await userRatingCrud.getAll({ where: { episodeID: id } });
                        total = data.reduce((sum, r) => sum + r.userRating, 0);
                    } else if (statType === 'views' || statType === 'downloads') {
                        data = await comicStatsCrud.getAll({ where: { episodeID: id } });
                        total = data.reduce(
                            (sum, stat) =>
                                sum +
                                (statType === 'views' ? stat.viewCount : stat.downloadCount),
                            0
                        );
                    } else if (statType === 'comments') {
                        data = await userCommentsCrud.getAll({ where: { episodeID: id } });
                        total = data.length;
                    }
                    break;

                case 'category':
                    const mappings = await comicCategoryMappingCrud.getAll({ where: { categoryID: id } });
                    const comicIDs = mappings.map((m) => m.comicID);

                    if (statType === 'rates') {
                        data = await userRatingCrud.getAll({ where: { comicID: comicIDs } });
                        total = data.reduce((sum, r) => sum + r.userRating, 0);
                    } else if (statType === 'views' || statType === 'downloads') {
                        data = await comicStatsCrud.getAll({ where: { comicID: comicIDs } });
                        total = data.reduce(
                            (sum, stat) =>
                                sum +
                                (statType === 'views' ? stat.viewCount : stat.downloadCount),
                            0
                        );
                    } else if (statType === 'comments') {
                        data = await userCommentsCrud.getAll({ where: { comicID: comicIDs } });
                        total = data.length;
                    }
                    break;

                case 'season':
                    const episodes = await comicEpisodesCrud.getAll({ where: { seasonID: id } });
                    const episodeIDs = episodes.map((e) => e.episodeID);

                    if (statType === 'rates') {
                        data = await userRatingCrud.getAll({ where: { episodeID: episodeIDs } });
                        total = data.reduce((sum, r) => sum + r.userRating, 0);
                    } else if (statType === 'views' || statType === 'downloads') {
                        data = await comicStatsCrud.getAll({ where: { episodeID: episodeIDs } });
                        total = data.reduce(
                            (sum, stat) =>
                                sum +
                                (statType === 'views' ? stat.viewCount : stat.downloadCount),
                            0
                        );
                    } else if (statType === 'comments') {
                        data = await userCommentsCrud.getAll({ where: { episodeID: episodeIDs } });
                        total = data.length;
                    }
                    break;

                default:
                    return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid type.' });
            }

            res.status(HttpStatusCode.OK).json({ total, data });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    // Specific function for user-based stats
    async getUserStats(req, res) {
        const { statType, type, id } = req.params;
        const { userID } = req.body;

        try {
            let result;

            if (statType === 'downloads') {
                result = await comicDownloadMappingCrud.getAll({ where: { userID, [`${type}ID`]: id } });
            } else if (statType === 'ratings') {
                result = await userRatingCrud.getAll({ where: { userID, [`${type}ID`]: id } });
            } else if (statType === 'comments') {
                result = await userCommentsCrud.getAll({ where: { userID, [`${type}ID`]: id } });
            } else {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid stat type.' });
            }

            if (!result || result.length === 0) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: `No ${statType} found for the given parameters.` });
            }

            res.status(HttpStatusCode.OK).json({ statType, type, id, userID, data: result });
        } catch (error) {
            console.error(`Error fetching ${statType} for user:`, error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: `Failed to fetch ${statType} for user.` });
        }
    }
}

module.exports = StatsController;
