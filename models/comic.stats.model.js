module.exports = (sequelize, Sequelize) => {
    const ComicStats = sequelize.define(
        'ComicStats',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            comicID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false
            },
            comicN: {
                type: Sequelize.STRING,
                allowNull: false
            },
            comicDescriptionTitle: {
                type: Sequelize.STRING,
                allowNull: true
            },
            comicDescription: {
                type: Sequelize.TEXT('long'),
                allowNull: false
            },
            publishDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            sourceCountry: {
                type: Sequelize.STRING,
                allowNull: false
            },
            comicBannerID: {
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

    return ComicStats;
};