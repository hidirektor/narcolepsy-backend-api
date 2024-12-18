module.exports = (sequelize, Sequelize) => {
    const ComicStats = sequelize.define(
        'ComicStats',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            episodeID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                references: {
                    model: 'ComicEpisodes',
                    key: 'episodeID'
                }
            },
            viewCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            downloadCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return ComicStats;
};