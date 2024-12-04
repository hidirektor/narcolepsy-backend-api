const { v4: uuidv4 } = require('uuid');
const comic_status= require("./comic_status");

module.exports = (sequelize, Sequelize) => {
    const ComicDetails = sequelize.define(
        'ComicDetails',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            comicID: {
                type: Sequelize.UUID,
                unique: true,
                allowNull: false
            },
            comicStatus: {
                type: Sequelize.ENUM,
                values: [comic_status.CONTINUE, comic_status.MID_FINAL, comic_status.FINAL],
                allowNull: false
            },
            comicLanguage: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            comicAuthor: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: true
            },
            comicEditor: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: true
            },
            comicCompany: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: true
            },
            comicArtist: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: true
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return ComicDetails;
};