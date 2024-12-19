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
                allowNull: false
            },
            comicID: {
                type: Sequelize.UUID,
                allowNull: false
            },
            episodeID: {
                type: Sequelize.UUID,
                allowNull: false
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
