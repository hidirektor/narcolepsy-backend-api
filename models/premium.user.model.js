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
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'userID'
                }
            },
            orderID: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Orders',
                    key: 'orderID'
                }
            },
            startDate: {
                type: Sequelize.BIGINT,
                allowNull: false
            },
            endDate: {
                type: Sequelize.BIGINT,
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
