module.exports = (sequelize, Sequelize) => {
    const ComicSeason = sequelize.define(
        'ComicSeason',
        {
            seasonID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false,
                primaryKey: true
            },
            comicID: {
                type: Sequelize.UUID,
                allowNull: false
            },
            seasonName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            seasonOrder: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return ComicSeason;
};