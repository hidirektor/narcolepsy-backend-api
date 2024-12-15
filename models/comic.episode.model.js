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
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false
            },
            comicID: {
                type: Sequelize.UUID,
                unique: false,
                allowNull: false
            },
            seasonID: {
                type: Sequelize.UUID,
                unique: false,
                allowNull: true
            },
            episodeOrder: {
                type: Sequelize.INTEGER,
                unique: false,
                allowNull: false
            },
            episodePrice: {
                type: Sequelize.DOUBLE,
                unique: false,
                allowNull: false
            },
            episodeName: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            episodePublisher: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            episodeBannerID: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            episodePageCount: {
                type: Sequelize.INTEGER,
                unique: false,
                allowNull: false
            },
            episodeFileID: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            episodePublishDate: {
                type: Sequelize.BIGINT,
                unique: false,
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