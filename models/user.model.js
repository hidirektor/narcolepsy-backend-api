const { v4: uuidv4 } = require('uuid');
const roles = require('./roles');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userID: {
                type: Sequelize.UUID,
                unique: true,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false
            },
            userName: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            userSurname: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            eMail: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            nickName: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            phoneNumber: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            countryCode: {
                type: Sequelize.STRING,
                unique: false,
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