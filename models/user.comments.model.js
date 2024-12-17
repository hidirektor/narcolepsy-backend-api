const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
    const UserComments = sequelize.define(
        'UserComments',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            comicID: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Comics',
                    key: 'comicID'
                }
            },
            episodeID: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'ComicEpisodes',
                    key: 'episodeID'
                }
            },
            commentID: {
                type: Sequelize.UUID,
                defaultValue: uuidv4(),
                unique: true,
                allowNull: false
            },
            userID: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'userID'
                }
            },
            userComment: {
                type: Sequelize.STRING,
                allowNull: false
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return UserComments;
};
