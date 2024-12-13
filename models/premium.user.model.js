module.exports = (sequelize, Sequelize) => {
    const PremiumUsers = sequelize.define(
        'PremiumUsers',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userID: {
                type: Sequelize.UUID,
                unique: false,
                allowNull: false
            },
            orderID: {
                type: Sequelize.UUID,
                unique: true,
                allowNull: true
            },
            startDate: {
                type: Sequelize.BIGINT,
                unique: false,
                allowNull: false
            },
            endDate: {
                type: Sequelize.BIGINT,
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

    return PremiumUsers;
};
