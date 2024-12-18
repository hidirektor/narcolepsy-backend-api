const db = require('../../models');
const GenericCRUD = require('../genericCrud');
const HttpStatusCode = require('http-status-codes');

const userRatingCrud = new GenericCRUD({ model: db.UserRatings });
const userCommentsCrud = new GenericCRUD({ model: db.UserComments });
const comicDownloadMappingCrud = new GenericCRUD({ model: db.ComicDownloadMapping });
const comicStatsCrud = new GenericCRUD({ model: db.ComicStats });
const comicCategoryMappingCrud = new GenericCRUD({ model: db.ComicCategoryMapping });
const comicEpisodesCrud = new GenericCRUD({ model: db.ComicEpisode });
const comicSeasonsCrud = new GenericCRUD({ model: db.ComicSeason });

class StatsController {
    constructor() {}

    async getStatsAsync(req, res) {
        const { statType, type, id,  } = req.params;

        try {
            let data = [];
            let total = 0;

            switch (statType) {
                case 'comic':
                    if (type === 'rates') {
                        data = await userRatingCrud.getAll({ where: { comicID: id } });
                        total = data.reduce((sum, r) => sum + r.userRating, 0);
                    } else if (type === 'views' || type === 'downloads') {
                        const episodes = await comicEpisodesCrud.getAll({ where: { comicID: id } });

                        if (!episodes || episodes.length === 0) {
                            return res.status(404).json({ message: `No episodes found for comicID ${id}` });
                        }

                        const episodeIDs = episodes.map(e => e.episodeID);

                        console.log('Fetched Episode IDs:', episodeIDs);

                        if (episodeIDs.length === 0) {
                            return res.status(404).json({ message: `No episode IDs found for comicID ${id}` });
                        }

                        const stats = await comicStatsCrud.getAll({
                            where: { episodeID: { [db.Sequelize.Op.in]: episodeIDs } },
                        });

                        if (!stats || stats.length === 0) {
                            return res.status(404).json({ message: `No stats found for episodes of comicID ${id}` });
                        }

                        total = stats.reduce(
                            (sum, stat) =>
                                sum + (type === 'views' ? stat.viewCount : stat.downloadCount),
                            0
                        );

                        data = stats.map(stat => ({
                            episodeID: stat.episodeID,
                            value: type === 'views' ? stat.viewCount : stat.downloadCount,
                        }));

                        if (data.length === 0) {
                            return res.status(404).json({ message: `No ${type} stats found for comicID ${id}` });
                        }

                        res.status(200).json({
                            total,
                            data,
                        });
                    } else if (type === 'comments') {
                        data = await userCommentsCrud.getAll({ where: { comicID: id } });
                        total = data.length;
                    }
                    break;

                case 'episode':
                    // Validate episode existence
                    const episode = await comicEpisodesCrud.findOne({ where: { episodeID: id } });
                    if (!episode || !episode.result) {
                        return res.status(404).json({ message: `No episode found for episodeID ${id}` });
                    }

                    if (type === 'rates') {
                        // Fetch and process ratings for the episode
                        data = await userRatingCrud.getAll({ where: { episodeID: id } });

                        if (!data || data.length === 0) {
                            return res.status(404).json({ message: `No ratings found for episodeID ${id}` });
                        }

                        total = data.reduce((sum, r) => sum + r.userRating, 0);

                    } else if (type === 'views' || type === 'downloads') {
                        // Fetch and process stats for the episode
                        const stats = await comicStatsCrud.getAll({ where: { episodeID: id } });

                        if (!stats || stats.length === 0) {
                            return res.status(404).json({
                                message: `No ${type} stats found for episodeID ${id}`,
                            });
                        }

                        total = stats.reduce(
                            (sum, stat) =>
                                sum + (type === 'views' ? stat.viewCount : stat.downloadCount),
                            0
                        );

                        data = stats.map((stat) => ({
                            episodeID: stat.episodeID,
                            value: type === 'views' ? stat.viewCount : stat.downloadCount,
                        }));

                    } else if (type === 'comments') {
                        // Fetch and process comments for the episode
                        const comments = await userCommentsCrud.getAll({ where: { episodeID: id } });

                        if (!comments || comments.length === 0) {
                            return res.status(404).json({
                                message: `No comments found for episodeID ${id}`,
                            });
                        }

                        data = comments.map((comment) => ({
                            commentID: comment.commentID,
                            episodeID: comment.episodeID,
                            userID: comment.userID,
                            userComment: comment.userComment,
                        }));

                        total = comments.length;
                    }

                    break;

                case 'category':
                    // Step 1: Fetch comics related to the categoryID
                    const mappings = await comicCategoryMappingCrud.getAll({ where: { categoryID: id } });
                    const comicIDs = mappings.map((m) => m.comicID);

                    if (comicIDs.length === 0) {
                        return res.status(404).json({ message: `No comics found for categoryID ${id}` });
                    }

                    if (type === 'rates') {
                        // Step 2: Fetch ratings for the comics
                        data = await userRatingCrud.getAll({ where: { comicID: comicIDs } });
                        total = data.reduce((sum, r) => sum + r.userRating, 0);

                    } else if (type === 'views' || type === 'downloads') {
                        // Step 3: Fetch all episodeIDs for the comics
                        const episodes = await comicEpisodesCrud.getAll({
                            where: { comicID: { [db.Sequelize.Op.in]: comicIDs } },
                        });

                        if (!episodes || episodes.length === 0) {
                            return res
                                .status(404)
                                .json({ message: `No episodes found for comics in categoryID ${id}` });
                        }

                        const episodeIDs = episodes.map((e) => e.episodeID);

                        // Step 4: Fetch stats for the episodes
                        const stats = await comicStatsCrud.getAll({
                            where: { episodeID: { [db.Sequelize.Op.in]: episodeIDs } },
                        });

                        if (!stats || stats.length === 0) {
                            return res
                                .status(404)
                                .json({ message: `No ${type} stats found for episodes in categoryID ${id}` });
                        }

                        total = stats.reduce(
                            (sum, stat) =>
                                sum + (type === 'views' ? stat.viewCount : stat.downloadCount),
                            0
                        );

                        data = stats.map((stat) => ({
                            episodeID: stat.episodeID,
                            value: type === 'views' ? stat.viewCount : stat.downloadCount,
                        }));

                    } else if (type === 'comments') {
                        // Step 5: Fetch comments for the comics
                        const comments = await userCommentsCrud.getAll({
                            where: { comicID: { [db.Sequelize.Op.in]: comicIDs } },
                        });

                        if (!comments || comments.length === 0) {
                            return res
                                .status(404)
                                .json({ message: `No comments found for comics in categoryID ${id}` });
                        }

                        // Process comments for episode-based comments
                        const episodeComments = comments.filter((c) => c.comicID === null);
                        const episodeIDs = episodeComments.map((c) => c.episodeID);

                        // Fetch comics for these episodeIDs
                        const episodes = await comicEpisodesCrud.getAll({
                            where: { episodeID: { [db.Sequelize.Op.in]: episodeIDs } },
                        });

                        if (!episodes || episodes.length === 0) {
                            return res.status(404).json({
                                message: `No comics found for episode-based comments in categoryID ${id}`,
                            });
                        }

                        // Filter episodes matching the category's comics
                        const validEpisodes = episodes.filter((e) =>
                            comicIDs.includes(e.comicID)
                        );

                        if (!validEpisodes || validEpisodes.length === 0) {
                            return res.status(404).json({
                                message: `No valid episodes found for comments in categoryID ${id}`,
                            });
                        }

                        data = comments.map((comment) => ({
                            commentID: comment.commentID,
                            comicID: comment.comicID,
                            episodeID: comment.episodeID,
                            userComment: comment.userComment,
                        }));

                        total = comments.length;
                    }

                    break;

                case 'season':
                    // Step 1: Fetch the comicID for the given seasonID
                    const season = await comicSeasonsCrud.findOne({ where: { seasonID: id } });
                    if (!season || !season.result) {
                        return res.status(404).json({ message: `No comics found for seasonID ${id}` });
                    }

                    const comicID = season.result.comicID;

                    // Step 2: Fetch episodes related to the season's comicID
                    const episodes = await comicEpisodesCrud.getAll({ where: { seasonID: id } });
                    const episodeIDs = episodes.map((e) => e.episodeID);

                    if (episodeIDs.length === 0) {
                        return res
                            .status(404)
                            .json({ message: `No episodes found for seasonID ${id}` });
                    }

                    if (type === 'rates') {
                        // Step 3: Fetch ratings for the episodes in the season
                        data = await userRatingCrud.getAll({ where: { episodeID: { [db.Sequelize.Op.in]: episodeIDs } } });

                        total = data.reduce((sum, r) => sum + r.userRating, 0);

                    } else if (type === 'views' || type === 'downloads') {
                        // Step 4: Fetch stats for the episodes
                        const stats = await comicStatsCrud.getAll({
                            where: { episodeID: { [db.Sequelize.Op.in]: episodeIDs } },
                        });

                        if (!stats || stats.length === 0) {
                            return res.status(404).json({
                                message: `No ${type} stats found for seasonID ${id}`,
                            });
                        }

                        total = stats.reduce(
                            (sum, stat) =>
                                sum + (type === 'views' ? stat.viewCount : stat.downloadCount),
                            0
                        );

                        data = stats.map((stat) => ({
                            episodeID: stat.episodeID,
                            value: type === 'views' ? stat.viewCount : stat.downloadCount,
                        }));

                    } else if (type === 'comments') {
                        // Step 5: Fetch comments for the episodes in the season
                        const comments = await userCommentsCrud.getAll({
                            where: { episodeID: { [db.Sequelize.Op.in]: episodeIDs } },
                        });

                        if (!comments || comments.length === 0) {
                            return res.status(404).json({
                                message: `No comments found for episodes in seasonID ${id}`,
                            });
                        }

                        data = comments.map((comment) => ({
                            commentID: comment.commentID,
                            episodeID: comment.episodeID,
                            userID: comment.userID,
                            userComment: comment.userComment,
                        }));

                        total = comments.length;
                    }

                    break;

                default:
                    return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid type.' });
            }

            res.status(HttpStatusCode.OK).json({ total, data });
        } catch (error) {
            console.log(id);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async getUserStatsAsync(req, res) {
        const { statType, type, id } = req.params;
        const { userID } = req.body;

        try {
            let result;

            if (statType === 'downloads') {
                result = await comicDownloadMappingCrud.getAll({ where: { userID, [`${type}ID`]: id } });
            } else if (statType === 'rates') {
                if (type === 'comic') {
                    // Fetch all episodes for the comic
                    const episodes = await comicEpisodesCrud.getAll({ where: { comicID: id } });
                    if (!episodes || episodes.length === 0) {
                        return res.status(HttpStatusCode.NOT_FOUND).json({
                            message: `No episodes found for comicID ${id}`,
                        });
                    }

                    const episodeIDs = episodes.map((e) => e.episodeID);

                    // Fetch ratings for all episodes of the comic
                    result = await userRatingCrud.getAll({
                        where: { userID, episodeID: { [db.Sequelize.Op.in]: episodeIDs } },
                    });
                } else {
                    // Standard case: Fetch ratings for the specific type and ID
                    result = await userRatingCrud.getAll({ where: { userID, [`${type}ID`]: id } });
                }
            } else if (statType === 'comments') {
                result = await userCommentsCrud.getAll({ where: { userID, [`${type}ID`]: id } });
            } else {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid stat type.' });
            }

            if (!result || result.length === 0) {
                return res.status(HttpStatusCode.NOT_FOUND).json({
                    message: `No ${statType} found for the given parameters.`,
                });
            }

            res.status(HttpStatusCode.OK).json({ statType, type, id, userID, data: result });
        } catch (error) {
            console.error(`Error fetching ${statType} for user:`, error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: `Failed to fetch ${statType} for user.`,
            });
        }
    }
}

module.exports = StatsController;
