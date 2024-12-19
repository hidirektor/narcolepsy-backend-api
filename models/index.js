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
db.UserComments = require('./user.comments.model.js')(sequelize, Sequelize);
db.UserRatings = require('./user.ratings.model.js')(sequelize, Sequelize);

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

db.ComicCategoryMapping = require('./comic.category.mapping.model.js')(sequelize, Sequelize);
db.FollowMapping = require('./follow.mapping.model.js')(sequelize, Sequelize);

db.ComicStats = require('./comic.stats.model.js')(sequelize, Sequelize);
db.ComicDownloadMapping = require('./comic.download.mapping.model.js')(sequelize, Sequelize);

/*
User Relations
 */
db.User.hasOne(db.UserProfile, { foreignKey: 'userID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserProfile.belongsTo(db.User, { foreignKey: 'userID' });
db.User.hasOne(db.UserPreferences, { foreignKey: 'userID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserPreferences.belongsTo(db.User, { foreignKey: 'userID' });
db.User.hasOne(db.UserVerifications, { foreignKey: 'userID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserVerifications.belongsTo(db.User, { foreignKey: 'userID' });
db.User.hasMany(db.Orders, { foreignKey: 'userID', onDelete: 'NO ACTION', onUpdate: 'CASCADE' });
db.Orders.belongsTo(db.User, { foreignKey: 'userID' });
db.User.hasOne(db.PremiumUsers, { foreignKey: 'userID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.PremiumUsers.belongsTo(db.User, { foreignKey: 'userID' });
db.User.hasMany(db.Tickets, { foreignKey: 'userID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.Tickets.belongsTo(db.User, { foreignKey: 'userID' });
db.User.hasMany(db.TicketResponses, { foreignKey: 'userID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.TicketResponses.belongsTo(db.User, { foreignKey: 'userID' });
db.User.hasMany(db.ComicDownloadMapping, { foreignKey: 'userID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ComicDownloadMapping.belongsTo(db.User, { foreignKey: 'userID' });
db.User.hasMany(db.FollowMapping, { foreignKey: 'userID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.FollowMapping.belongsTo(db.User, { foreignKey: 'userID' });
db.User.hasMany(db.UserRatings, { foreignKey: 'userID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserRatings.belongsTo(db.User, { foreignKey: 'userID' });
db.User.hasMany(db.UserComments, { foreignKey: 'userID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserComments.belongsTo(db.User, { foreignKey: 'userID' });

/*
Order Relations
 */
db.Orders.hasOne(db.PremiumUsers, { foreignKey: 'orderID', onDelete: 'NO ACTION', onUpdate: 'CASCADE' });
db.PremiumUsers.belongsTo(db.Orders, { foreignKey: 'orderID' });

/*
Premium Packages Relations
 */
db.PremiumPackages.hasMany(db.Orders, { foreignKey: 'packageID', onDelete: 'NO ACTION', onUpdate: 'CASCADE' });
db.Orders.belongsTo(db.PremiumPackages, { foreignKey: 'packageID' });

/*
Comic Relations
 */
db.Comic.hasOne(db.ComicDetails, { foreignKey: 'comicID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ComicDetails.belongsTo(db.Comic, { foreignKey: 'comicID' });
db.Comic.hasMany(db.ComicEpisode, { foreignKey: 'comicID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ComicEpisode.belongsTo(db.Comic, { foreignKey: 'comicID' });
db.Comic.hasMany(db.ComicCategoryMapping, { foreignKey: 'comicID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ComicCategoryMapping.belongsTo(db.Comic, { foreignKey: 'comicID' });
db.Comic.hasMany(db.ComicDownloadMapping, { foreignKey: 'comicID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ComicDownloadMapping.belongsTo(db.Comic, { foreignKey: 'comicID' });
db.Comic.hasMany(db.FollowMapping, { foreignKey: 'comicID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.FollowMapping.belongsTo(db.Comic, { foreignKey: 'comicID' });
db.Comic.hasMany(db.ComicSeason, { foreignKey: 'comicID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ComicSeason.belongsTo(db.Comic, { foreignKey: 'comicID' });
db.Comic.hasMany(db.UserRatings, { foreignKey: 'comicID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserRatings.belongsTo(db.Comic, { foreignKey: 'comicID' });
db.Comic.hasMany(db.UserComments, { foreignKey: 'comicID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserComments.belongsTo(db.Comic, { foreignKey: 'comicID' });
db.Comic.hasMany(db.Tickets, { foreignKey: 'comicID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.Tickets.belongsTo(db.Comic, { foreignKey: 'comicID' });

/*
Comic Category Relations
 */
db.ComicCategory.hasMany(db.ComicCategoryMapping, { foreignKey: 'categoryID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ComicCategoryMapping.belongsTo(db.ComicCategory, { foreignKey: 'categoryID' });
db.ComicCategory.hasMany(db.FollowMapping, { foreignKey: 'categoryID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.FollowMapping.belongsTo(db.ComicCategory, { foreignKey: 'categoryID' });

/*
Comic Season Relations
 */
db.ComicSeason.hasMany(db.ComicEpisode, { foreignKey: 'seasonID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ComicEpisode.belongsTo(db.ComicSeason, { foreignKey: 'seasonID' });

/*
Comic Episode Relations
 */
db.ComicEpisode.hasMany(db.UserRatings, { foreignKey: 'episodeID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserRatings.belongsTo(db.ComicEpisode, { foreignKey: 'episodeID' });
db.ComicEpisode.hasMany(db.UserComments, { foreignKey: 'episodeID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.UserComments.belongsTo(db.ComicEpisode, { foreignKey: 'episodeID' });
db.ComicEpisode.hasMany(db.ComicDownloadMapping, { foreignKey: 'episodeID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ComicDownloadMapping.belongsTo(db.ComicEpisode, { foreignKey: 'episodeID' });
db.ComicEpisode.hasMany(db.ComicStats, { foreignKey: 'episodeID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.ComicStats.belongsTo(db.ComicEpisode, { foreignKey: 'episodeID' });
db.ComicEpisode.hasMany(db.Tickets, { foreignKey: 'episodeID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.Tickets.belongsTo(db.ComicEpisode, { foreignKey: 'episodeID' });

/*
Support Tickets Relations
 */
db.Tickets.hasOne(db.TicketResponses, { foreignKey: 'ticketID', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
db.TicketResponses.belongsTo(db.Tickets, { foreignKey: 'ticketID' });

module.exports = db;