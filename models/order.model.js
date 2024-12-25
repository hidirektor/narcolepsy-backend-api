const payment_status = require("./payment_status");

module.exports = (sequelize, Sequelize) => {
    const Orders = sequelize.define(
        'Orders',
        {
            orderID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false,
                primaryKey: true
            },
            userID: {
                type: Sequelize.UUID,
                allowNull: false
            },
            packageID: {
                type: Sequelize.UUID,
                allowNull: false
            },
            couponID: {
                type: Sequelize.UUID,
                allowNull: true,
                defaultValue: null
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
