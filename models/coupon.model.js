module.exports = (sequelize, Sequelize) => {
    const Coupon = sequelize.define(
        'Coupon',
        {
            couponID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false,
                primaryKey: true
            },
            packageID: {
                type: Sequelize.UUID,
                allowNull: true,
                defaultValue: null
            },
            salePercent: {
                type: Sequelize.DOUBLE,
                allowNull: true,
                defaultValue: 0
            },
            couponCode: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return Coupon;
};