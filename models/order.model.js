const payment_status = require("./payment_status");
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
    const Orders = sequelize.define(
        'Orders',
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
                defaultValue: uuidv4(),
                unique: true,
                allowNull: false
            },
            packageID: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'PremiumPackages',
                    key: 'packageID'
                }
            },
            paymentMethod: {
                type: Sequelize.STRING,
                allowNull: false
            },
            paymentStatus: {
                type: Sequelize.ENUM,
                values: [payment_status.CREATED, payment_status.PENDING, payment_status.CANCELED, payment_status.COMPLETED],
                allowNull: false
            },
            orderPrice: {
                type: Sequelize.DOUBLE,
                allowNull: false
            },
            userIP: {
                type: Sequelize.STRING,
                allowNull: false
            },
            iyzicoToken: {
                type: Sequelize.STRING,
                allowNull: false
            },
            iyzicoSignature: {
                type: Sequelize.STRING,
                allowNull: false
            },
            orderDate: {
                type: Sequelize.BIGINT,
                defaultValue: Math.floor(Date.now() / 1000),
                allowNull: false
            }
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return Orders;
};
