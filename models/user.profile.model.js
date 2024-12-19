module.exports = (sequelize, Sequelize) => {
    const UserProfile = sequelize.define(
        'UserProfile',
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
            profilePhotoID: {
                type: Sequelize.STRING,
                defaultValue: null
            },
            avatarID: {
                type: Sequelize.STRING,
                defaultValue: null
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            birthDate: {
                type: Sequelize.BIGINT,
                allowNull: false
            },
            registerDate: {
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: Math.floor(Date.now() / 1000)
            },
            updateDate: {
                type: Sequelize.BIGINT,
                defaultValue: null
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return UserProfile;
};