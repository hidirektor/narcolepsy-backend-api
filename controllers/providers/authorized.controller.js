const db = require('../../models');
const GenericCRUD = require('../genericCrud');
const HttpStatusCode = require('http-status-codes');
const { errorSender } = require('../../utils');

const userCrud = new GenericCRUD({ model: db.User });
const userCommentsCrud = new GenericCRUD({ model: db.UserComments });
const userRatingsCrud = new GenericCRUD({ model: db.UserRatings });
const comicDownloadMappingCrud = new GenericCRUD({ model: db.ComicDownloadMapping });

class AuthorizedController {
    constructor() {}

    // Add user
    async addUserAsync(req, res) {
        try {
            const { userName, userSurname, eMail, nickName, phoneNumber, countryCode, password, birthDate, userType } = req.body;

            const newUser = await userCrud.create({
                userName,
                userSurname,
                eMail,
                nickName,
                phoneNumber,
                countryCode,
                password, // Ensure password hashing in middleware if required
                birthDate,
                userType,
            });

            res.status(HttpStatusCode.CREATED).json({ message: 'User added successfully.', user: newUser });
        } catch (error) {
            console.error('Error adding user:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to add user.' });
        }
    }

    // Edit user
    async editUserAsync(req, res) {
        try {
            const { userID, ...updateFields } = req.body;

            if (!userID) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'userID is required.' });
            }

            const updatedUser = await userCrud.update({ where: { userID } }, updateFields);

            if (!updatedUser.status) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'User not found.' });
            }

            res.status(HttpStatusCode.OK).json({ message: 'User updated successfully.' });
        } catch (error) {
            console.error('Error editing user:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to edit user.' });
        }
    }

    // Delete user
    async deleteUserAsync(req, res) {
        try {
            const { userID } = req.params;

            const deleted = await userCrud.delete({ where: { userID } });

            if (!deleted.status) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'User not found.' });
            }

            res.status(HttpStatusCode.OK).json({ message: 'User deleted successfully.' });
        } catch (error) {
            console.error('Error deleting user:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete user.' });
        }
    }

    // Delete comment
    async deleteCommentAsync(req, res) {
        try {
            const { commentID } = req.params;

            const deleted = await userCommentsCrud.delete({ where: { commentID } });

            if (!deleted.status) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Comment not found.' });
            }

            res.status(HttpStatusCode.OK).json({ message: 'Comment deleted successfully.' });
        } catch (error) {
            console.error('Error deleting comment:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete comment.' });
        }
    }

    // Delete rating
    async deleteRatingAsync(req, res) {
        try {
            const { ratingID } = req.params;

            const deleted = await userRatingsCrud.delete({ where: { ratingID } });

            if (!deleted.status) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Rating not found.' });
            }

            res.status(HttpStatusCode.OK).json({ message: 'Rating deleted successfully.' });
        } catch (error) {
            console.error('Error deleting rating:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete rating.' });
        }
    }

    // Delete download
    async deleteDownloadAsync(req, res) {
        try {
            const { downloadID } = req.params;

            const deleted = await comicDownloadMappingCrud.delete({ where: { userID: downloadID, episodeID: episodeID } });

            if (!deleted.status) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Download not found.' });
            }

            res.status(HttpStatusCode.OK).json({ message: 'Download deleted successfully.' });
        } catch (error) {
            console.error('Error deleting download:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete download.' });
        }
    }
}

module.exports = AuthorizedController;
