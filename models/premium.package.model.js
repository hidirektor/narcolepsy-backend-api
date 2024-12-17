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
                unique: true,
                allowNull: false
            },
            packageName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            packageDescription: {
                type: Sequelize.STRING,
                allowNull: false
            },
            packagePrice: {
                type: Sequelize.DOUBLE,
                allowNull: false
            },
            packageTime: {
                type: Sequelize.INTEGER,
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
