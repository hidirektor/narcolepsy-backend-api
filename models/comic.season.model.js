const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
    const ComicSeason = sequelize.define(
        'ComicSeason',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            comicID: {
                type: Sequelize.UUID,
                unique: false,
                allowNull: false
            },
            seasonID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false
            },
            seasonName: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return ComicSeason;
};