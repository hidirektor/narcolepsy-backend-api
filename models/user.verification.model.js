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
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'userID'
                }
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