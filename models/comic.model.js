const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
    const Comic = sequelize.define(
        'Comic',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            comicID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false
            },
            comicName: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            comicDescriptionTitle: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: true
            },
            comicDescription: {
                type: Sequelize.TEXT('long'),
                unique: false,
                allowNull: false
            },
            publishDate: {
                type: Sequelize.BIGINT,
                unique: false,
                allowNull: false
            },
            sourceCountry: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            comicBannerID: {
                type: Sequelize.STRING,
                unique: true,
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