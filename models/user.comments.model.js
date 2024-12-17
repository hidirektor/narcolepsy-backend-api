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
                unique: false,
                allowNull: false
            },
            episodeID: {
                type: Sequelize.UUID,
                unique: false,
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
                unique: false,
                allowNull: false
            },
            userComment: {
                type: Sequelize.STRING,
                unique: false,
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
