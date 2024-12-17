module.exports = (sequelize, Sequelize) => {
    const UserRatings = sequelize.define(
        'UserRatings',
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
            ratingID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
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
            userRating: {
                type: Sequelize.DOUBLE,
                allowNull: false
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return UserRatings;
};
