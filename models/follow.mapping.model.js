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
                allowNull: false
            },
            comicID: {
                type: Sequelize.UUID,
                allowNull: true
            },
            categoryID: {
                type: Sequelize.UUID,
                allowNull: true
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
