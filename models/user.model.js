const roles = require('./roles');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
        'User',
        {
            userID: {
                type: Sequelize.UUID,
                unique: true,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            userName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            userSurname: {
                type: Sequelize.STRING,
                allowNull: false
            },
            eMail: {
                type: Sequelize.STRING,
                allowNull: false
            },
            nickName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phoneNumber: {
                type: Sequelize.STRING,
                allowNull: false
            },
            countryCode: {
                type: Sequelize.STRING,
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            userType: {
                type: Sequelize.ENUM,
                values: [roles.USER, roles.PREMIUM, roles.EDITOR, roles.MODERATOR, roles.SUPPORT, roles.SYSOP],
                allowNull: false
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return User;
};