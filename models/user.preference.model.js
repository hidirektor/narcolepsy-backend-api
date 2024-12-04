const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
    const UserPreferences = sequelize.define(
        'UserPreference',
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
            language: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "tr"
            },
            themeColor: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "dark"
            },
            pushNotification: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            mailNotification: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return UserPreferences;
};