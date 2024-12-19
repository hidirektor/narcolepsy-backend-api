module.exports = (sequelize, Sequelize) => {
    const ComicCategoryMapping = sequelize.define(
        'ComicCategoryMapping',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            categoryID: {
                type: Sequelize.UUID,
                allowNull: false
            },
            comicID: {
                type: Sequelize.UUID,
                allowNull: false
            }
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return ComicCategoryMapping;
};
