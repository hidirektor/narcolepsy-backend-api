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
                allowNull: false,
                references: {
                    model: 'Comics',
                    key: 'comicID'
                }
            },
            comicStatus: {
                type: Sequelize.ENUM,
                values: [comic_status.CONTINUE, comic_status.MID_FINAL, comic_status.FINAL],
                allowNull: false
            },
            comicLanguage: {
                type: Sequelize.STRING,
                allowNull: false
            },
            comicAuthor: {
                type: Sequelize.STRING,
                allowNull: true
            },
            comicEditor: {
                type: Sequelize.STRING,
                allowNull: true
            },
            comicCompany: {
                type: Sequelize.STRING,
                allowNull: true
            },
            comicArtist: {
                type: Sequelize.STRING,
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