module.exports = (sequelize, Sequelize) => {
    const FollowedComic = sequelize.define(
        'FollowedComic',
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
                allowNull: false
            }
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return FollowedComic;
};
