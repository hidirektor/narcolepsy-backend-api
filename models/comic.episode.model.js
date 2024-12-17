const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
    const ComicEpisode = sequelize.define(
        'ComicEpisode',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            episodeID: {
                type: Sequelize.UUID,
                defaultValue: uuidv4(),
                unique: true,
                allowNull: false
            },
            comicID: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Comics',
                    key: 'comicID'
                }
            },
            seasonID: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'ComicSeasons',
                    key: 'seasonID'
                }
            },
            episodeOrder: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            episodePrice: {
                type: Sequelize.DOUBLE,
                allowNull: false
            },
            episodeName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            episodePublisher: {
                type: Sequelize.STRING,
                allowNull: false
            },
            episodeBannerID: {
                type: Sequelize.STRING,
                allowNull: true
            },
            episodePageCount: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            episodeFileID: {
                type: Sequelize.STRING,
                allowNull: false
            },
            episodePublishDate: {
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: Math.floor(Date.now() / 1000)
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return ComicEpisode;
};