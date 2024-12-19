module.exports = (sequelize, Sequelize) => {
    const UserComments = sequelize.define(
        'UserComments',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            comicID: {
                type: Sequelize.UUID,
                allowNull: false
            },
            episodeID: {
                type: Sequelize.UUID,
                allowNull: false
            },
            commentID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false
            },
            userID: {
                type: Sequelize.UUID,
                allowNull: false
            },
            userComment: {
                type: Sequelize.STRING,
                allowNull: false
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return UserComments;
};
