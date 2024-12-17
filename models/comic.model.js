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
                defaultValue: uuidv4(),
                unique: true,
                allowNull: false
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