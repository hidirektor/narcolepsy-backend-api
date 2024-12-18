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

module.exports = db;