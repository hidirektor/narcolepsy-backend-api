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
                unique: true,
                allowNull: false
            },
            comicID: {
                type: Sequelize.UUID,
                unique: false,
                allowNull: true
            },
            categoryID: {
                type: Sequelize.UUID,
                unique: false,
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
