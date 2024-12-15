require('dotenv/config.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        dialectOptions: {
            charset: 'utf8',
        },

        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
        },

        logging: false
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Include db tables
db.User = require('./user.model.js')(sequelize, Sequelize);
db.UserProfile = require('./user.profile.model.js')(sequelize, Sequelize);
db.UserPreferences = require('./user.preference.model.js')(sequelize, Sequelize);
db.UserVerifications = require('./user.verification.model.js')(sequelize, Sequelize);
db.UserReactions = require('./user.reactions.model.js')(sequelize, Sequelize);

db.Comic = require('./comic.model.js')(sequelize, Sequelize);
db.ComicDetails = require('./comic.details.model.js')(sequelize, Sequelize);
db.ComicCategory = require('./comic.category.model.js')(sequelize, Sequelize);
db.ComicSeason = require('./comic.season.model.js')(sequelize, Sequelize);
db.ComicEpisode = require('./comic.episode.model.js')(sequelize, Sequelize);

db.Orders = require('./order.model.js')(sequelize, Sequelize);
db.PremiumUsers = require('./premium.user.model.js')(sequelize, Sequelize);
db.PremiumPackages = require('./premium.package.model.js')(sequelize, Sequelize);

db.Tickets = require('./support.ticket.model.js')(sequelize, Sequelize);
db.TicketResponses = require('./support.ticket.response.model.js')(sequelize, Sequelize);

db.FollowedComic = require('./followed.comic.model.js')(sequelize, Sequelize);

db.ComicCategoryMapping = require('./comic.category.mapping.model.js')(sequelize, Sequelize);

// Associations
db.User.hasOne(db.UserProfile, {
    foreignKey: 'userID',
    sourceKey: 'userID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.UserProfile.belongsTo(db.User, {
    foreignKey: 'userID',
    targetKey: 'userID'
});

db.User.hasOne(db.UserPreferences, {
    foreignKey: 'userID',
    sourceKey: 'userID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});


db.UserPreferences.belongsTo(db.User, {
    foreignKey: 'userID',
    targetKey: 'userID'
});

db.User.hasOne(db.UserVerifications, {
    foreignKey: 'userID',
    sourceKey: 'userID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.UserVerifications.belongsTo(db.User, {
    foreignKey: 'userID',
    targetKey: 'userID'
});

/*
Comic Associations
 */
db.Comic.hasOne(db.ComicDetails, {
    foreignKey: 'comicID',
    sourceKey: 'comicID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.ComicDetails.belongsTo(db.Comic, {
    foreignKey: 'comicID',
    targetKey: 'comicID'
});

db.Comic.hasOne(db.ComicSeason, {
    foreignKey: 'comicID',
    sourceKey: 'comicID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.ComicSeason.belongsTo(db.Comic, {
    foreignKey: 'comicID',
    targetKey: 'comicID'
});

db.Comic.hasOne(db.ComicEpisode, {
    foreignKey: 'comicID',
    sourceKey: 'comicID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.ComicEpisode.belongsTo(db.Comic, {
    foreignKey: 'comicID',
    targetKey: 'comicID'
});

db.ComicSeason.hasOne(db.ComicEpisode, {
    foreignKey: 'seasonID',
    sourceKey: 'seasonID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.ComicEpisode.belongsTo(db.ComicSeason, {
    foreignKey: 'seasonID',
    targetKey: 'seasonID'
});

db.User.hasOne(db.ComicEpisode, {
    foreignKey: 'userID',
    sourceKey: 'userID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.ComicEpisode.belongsTo(db.User, {
    foreignKey: 'userID',
    targetKey: 'userID'
});

db.Comic.hasOne(db.ComicCategoryMapping, {
    foreignKey: 'comicID',
    sourceKey: 'comicID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.ComicCategoryMapping.belongsTo(db.Comic, {
    foreignKey: 'comicID',
    targetKey: 'comicID'
});

db.ComicCategory.hasOne(db.ComicCategoryMapping, {
    foreignKey: 'categoryID',
    sourceKey: 'categoryID',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
});

db.ComicCategoryMapping.belongsTo(db.ComicCategory, {
    foreignKey: 'categoryID',
    targetKey: 'categoryID'
});

/*
User Reaction assosiations
 */
db.Comic.hasOne(db.UserReactions, {
    foreignKey: 'comicID',
    sourceKey: 'comicID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.UserReactions.belongsTo(db.Comic, {
    foreignKey: 'comicID',
    targetKey: 'comicID'
});

db.ComicEpisode.hasOne(db.UserReactions, {
    foreignKey: 'episodeID',
    sourceKey: 'episodeID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.UserReactions.belongsTo(db.ComicEpisode, {
    foreignKey: 'episodeID',
    targetKey: 'episodeID'
});

db.User.hasOne(db.UserReactions, {
    foreignKey: 'userID',
    sourceKey: 'userID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.UserReactions.belongsTo(db.User, {
    foreignKey: 'userID',
    targetKey: 'userID'
});

/*
Order assosiations
 */

db.User.hasOne(db.Orders, {
    foreignKey: 'userID',
    sourceKey: 'userID',
    onUpdate: 'CASCADE'
});

db.Orders.belongsTo(db.User, {
    foreignKey: 'userID',
    targetKey: 'userID'
});

db.Orders.hasOne(db.PremiumUsers, {
    foreignKey: 'orderID',
    sourceKey: 'orderID',
    onUpdate: 'CASCADE'
});

db.PremiumUsers.belongsTo(db.Orders, {
    foreignKey: 'orderID',
    targetKey: 'orderID'
});

db.User.hasOne(db.PremiumUsers, {
    foreignKey: 'userID',
    sourceKey: 'userID',
    onUpdate: 'CASCADE'
});

db.PremiumUsers.belongsTo(db.User, {
    foreignKey: 'userID',
    targetKey: 'userID'
});

db.Orders.hasOne(db.PremiumUsers, {
    foreignKey: 'orderID',
    sourceKey: 'orderID',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
});

db.PremiumUsers.belongsTo(db.Orders, {
    foreignKey: 'orderID',
    targetKey: 'orderID'
});

db.PremiumPackages.hasOne(db.Orders, {
    foreignKey: 'packageID',
    sourceKey: 'packageID',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
});

db.Orders.belongsTo(db.PremiumPackages, {
    foreignKey: 'packageID',
    targetKey: 'packageID'
});

/*
Support Tickets Assosiations
 */
db.User.hasOne(db.Tickets, {
    foreignKey: 'userID',
    sourceKey: 'userID',
    onUpdate: 'CASCADE'
});

db.Tickets.belongsTo(db.User, {
    foreignKey: 'userID',
    targetKey: 'userID'
});

db.Comic.hasOne(db.Tickets, {
    foreignKey: 'comicID',
    sourceKey: 'comicID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.Tickets.belongsTo(db.Comic, {
    foreignKey: 'comicID',
    targetKey: 'comicID'
});

db.ComicEpisode.hasOne(db.Tickets, {
    foreignKey: 'episodeID',
    sourceKey: 'episodeID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.Tickets.belongsTo(db.ComicEpisode, {
    foreignKey: 'episodeID',
    targetKey: 'episodeID'
});

db.Tickets.hasOne(db.TicketResponses, {
    foreignKey: 'ticketID',
    sourceKey: 'ticketID',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

db.TicketResponses.belongsTo(db.Tickets, {
    foreignKey: 'ticketID',
    targetKey: 'ticketID'
});

/*
Followed Comic Assosiations
 */
db.User.hasOne(db.FollowedComic, {
    foreignKey: 'userID',
    sourceKey: 'userID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.FollowedComic.belongsTo(db.User, {
    foreignKey: 'userID',
    targetKey: 'userID'
});

db.Comic.hasOne(db.FollowedComic, {
    foreignKey: 'comicID',
    sourceKey: 'comicID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

db.FollowedComic.belongsTo(db.Comic, {
    foreignKey: 'comicID',
    targetKey: 'comicID'
});

module.exports = db;