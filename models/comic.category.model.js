module.exports = (sequelize, Sequelize) => {
    const ComicCategory = sequelize.define(
        'ComicCategory',
        {
            categoryID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false,
                primaryKey: true
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
