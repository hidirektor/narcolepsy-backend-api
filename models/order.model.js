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
                unique: false,
                allowNull: false
            },
            orderID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false
            },
            paymentMethod: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            paymentStatus: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            orderPrice: {
                type: Sequelize.DOUBLE,
                unique: false,
                allowNull: false
            },
            userIP: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            iyzicoToken: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            iyzicoSignature: {
                type: Sequelize.STRING,
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

    return Orders;
};
