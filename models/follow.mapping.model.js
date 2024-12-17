module.exports = (sequelize, Sequelize) => {
    const FollowMapping = sequelize.define(
        'FollowMapping',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userID: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'userID'
                }
            },
            comicID: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'Comics',
                    key: 'comicID'
                }
            },
            categoryID: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'ComicCategories',
                    key: 'categoryID'
                }
            }
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return FollowMapping;
};
