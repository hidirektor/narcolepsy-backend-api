const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
    const UserVerification = sequelize.define(
        'UserVerifications',
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
            phoneVerification: {
                type: Sequelize.BIGINT,
                allowNull: true
            },
            mailVerification: {
                type: Sequelize.BIGINT,
                allowNull: true
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return UserVerification;
};