module.exports = (sequelize, Sequelize) => {
    const ComicDownloadMapping = sequelize.define(
        'ComicDownloadMapping',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userID: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'userID'
                }
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
            }
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return ComicDownloadMapping;
};
