const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
    const ComicCategory = sequelize.define(
        'ComicCategory',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            categoryID: {
                type: Sequelize.UUID,
                defaultValue: uuidv4(),
                unique: true,
                allowNull: false
            },
            categoryName: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            }
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return ComicCategory;
};
