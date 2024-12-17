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
                allowNull: false,
                references: {
                    model: 'ComicCategories',
                    key: 'categoryID'
                }
            },
            comicID: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Comics',
                    key: 'comicID'
                }
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
