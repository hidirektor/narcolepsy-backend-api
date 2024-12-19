module.exports = (sequelize, Sequelize) => {
    const Comic = sequelize.define(
        'Comic',
        {
            comicID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false,
                primaryKey: true
            },
            comicName: {
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

    return Comic;
};