const db = require('../../models');
const GenericCRUD = require('../genericCrud');
const { errorSender } = require('../../utils');
const HttpStatusCode = require('http-status-codes');

const followMappingCrud = new GenericCRUD({ model: db.FollowMapping });
const userRatingCrud = new GenericCRUD({ model: db.UserRatings });
const userCommentsCrud = new GenericCRUD({ model: db.UserComments });

class UserActionsController {
    constructor() {}

    // Follow comic or category
    async followEntityAsync(req, res) {
        const { userID, comicID, categoryID } = req.body;

        try {
            const existingFollow = await followMappingCrud.findOne({
                where: { userID, comicID, categoryID }
            });
            if (existingFollow.result) {
                return res.status(HttpStatusCode.CONFLICT).json({ message: 'Already followed.' });
            }

            const follow = await followMappingCrud.create({ userID, comicID, categoryID });
            res.status(200).json({ message: 'Followed successfully.', follow });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    // Unfollow comic or category
    async unfollowEntityAsync(req, res) {
        const { userID, comicID, categoryID } = req.body;

        try {
            await followMappingCrud.delete({ where: { userID, comicID, categoryID } });
            res.status(200).json({ message: 'Unfollowed successfully.' });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    // Rate episode
    async rateEpisodeAsync(req, res) {
        const { userID, episodeID, userRating } = req.body;

        try {
            const rating = await userRatingCrud.create({ userID, episodeID, userRating });

            res.status(200).json({ message: 'Rated successfully.', rating });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    // Edit episode rating
    async editEpisodeRatingAsync(req, res) {
        const { userID, episodeID, userRating } = req.body;

        try {
            await userRatingCrud.update(
                { where: { userID, episodeID } },
                { userRating }
            );
            res.status(200).json({ message: 'Rating updated successfully.' });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    // Delete episode rating
    async deleteEpisodeRatingAsync(req, res) {
        const { userID, episodeID } = req.body;

        try {
            await userRatingCrud.delete({ where: { userID, episodeID } });
            res.status(200).json({ message: 'Rating deleted successfully.' });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    // Comment on episode
    async commentEpisodeAsync(req, res) {
        const { userID, episodeID, userComment } = req.body;

        try {
            const comment = await userCommentsCrud.create({ userID, episodeID, userComment });
            res.status(200).json({ message: 'Comment added successfully.', comment });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    // Edit episode comment
    async editEpisodeCommentAsync(req, res) {
        const { userID, episodeID, userComment } = req.body;

        try {
            await userCommentsCrud.update(
                { where: { userID, episodeID } },
                { userComment }
            );
            res.status(200).json({ message: 'Comment updated successfully.' });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    // Delete episode comment
    async deleteEpisodeCommentAsync(req, res) {
        const { userID, episodeID } = req.body;

        try {
            await userCommentsCrud.delete({ where: { userID, episodeID } });
            res.status(200).json({ message: 'Comment deleted successfully.' });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    // Get Comment by ID
    async getCommentByIDAsync(req, res) {
        const { commentID } = req.params;

        try {
            const comment = await userCommentsCrud.findOne({ where: { commentID } });

            if (!comment.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Comment not found.' });
            }

            res.status(HttpStatusCode.OK).json(comment.result);
        } catch (error) {
            console.error('Error fetching comment:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch comment.' });
        }
    }

    // Get All Comments
    async getAllCommentsAsync(req, res) {
        try {
            const comments = await userCommentsCrud.getAll();

            if (!comments || comments.length === 0) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No comments found.' });
            }

            res.status(HttpStatusCode.OK).json(comments);
        } catch (error) {
            console.error('Error fetching all comments:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch comments.' });
        }
    }

    // Controller: Get all comments by episode ID
    async getAllCommentsByEpisodeAsync(req, res) {
        const { episodeID } = req.params;

        try {
            const comments = await userCommentsCrud.getAll({ where: { episodeID } });

            if (!comments || comments.length === 0) {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: 'No comments found for the given episode ID.' });
            }

            res.status(HttpStatusCode.OK).json(comments);
        } catch (error) {
            console.error('Error fetching comments by episode:', error.message);
            res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: 'Failed to fetch comments by episode.' });
        }
    }
}

module.exports = UserActionsController;