module.exports = (sequelize, Sequelize) => {
    const PremiumPackage = sequelize.define(
        'PremiumPackages',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            packageID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: false,
                allowNull: false
            },
            packageName: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            packageDescription: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            packagePrice: {
                type: Sequelize.DOUBLE,
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

    return PremiumPackage;
};
