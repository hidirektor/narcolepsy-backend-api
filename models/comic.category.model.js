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
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false
            },
            categoryName: {
                type: Sequelize.STRING,
                unique: false,
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
