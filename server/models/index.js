const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  operatorsAliases: 0, // Using 0 instead of false for Sequelize v6+ compatibility
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models here
db.user = require("./user.model.js")(sequelize, Sequelize);
db.ngoProfile = require("./ngoProfile.model.js")(sequelize, Sequelize);
db.fundingOpportunity = require("./fundingOpportunity.model.js")(sequelize, Sequelize);
db.discountOffer = require("./discountOffer.model.js")(sequelize, Sequelize);
db.funderProfile = require("./funderProfile.model.js")(sequelize, Sequelize);
db.providerProfile = require("./providerProfile.model.js")(sequelize, Sequelize);
db.savedSearch = require("./savedSearch.model.js")(sequelize, Sequelize);
db.applicationSubmission = require("./applicationSubmission.model.js")(sequelize, Sequelize);
db.notification = require("./notification.model.js")(sequelize, Sequelize); // Add Notification model

// --- Define associations here ---
// User <> NgoProfile
db.user.hasOne(db.ngoProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.ngoProfile.belongsTo(db.user, { foreignKey: 'userId' });

// User (Funder) <> FunderProfile
db.user.hasOne(db.funderProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.funderProfile.belongsTo(db.user, { foreignKey: 'userId' });

// User (Service Provider) <> ServiceProviderProfile
db.user.hasOne(db.providerProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.providerProfile.belongsTo(db.user, { foreignKey: 'userId' });

// Admin <> FundingOpportunities (Posted by Admin)
db.user.hasMany(db.fundingOpportunity, { foreignKey: 'postedByAdminId', as: 'postedFundingOpportunitiesByAdmin' });
db.fundingOpportunity.belongsTo(db.user, { foreignKey: 'postedByAdminId', as: 'postingAdmin' });

// Admin <> DiscountOffers (Posted by Admin)
db.user.hasMany(db.discountOffer, { foreignKey: 'postedByAdminId', as: 'postedDiscountOffersByAdmin' });
db.discountOffer.belongsTo(db.user, { foreignKey: 'postedByAdminId', as: 'postingAdminOffer' });

// User (Funder) <> FundingOpportunities (Posted by Funder)
db.user.hasMany(db.fundingOpportunity, { foreignKey: 'funderUserId', as: 'postedFundingOpportunitiesByFunder' });
db.fundingOpportunity.belongsTo(db.user, { foreignKey: 'funderUserId', as: 'postingFunder' });

// User (Service Provider) <> DiscountOffers (Posted by Provider)
db.user.hasMany(db.discountOffer, { foreignKey: 'providerUserId', as: 'postedDiscountOffersByProvider' });
db.discountOffer.belongsTo(db.user, { foreignKey: 'providerUserId', as: 'postingProvider' });

// User (NGO Admin) <> SavedSearches
db.user.hasMany(db.savedSearch, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.savedSearch.belongsTo(db.user, { foreignKey: 'userId' });

// Application Submission Associations
// Submission belongs to one Funding Opportunity
db.fundingOpportunity.hasMany(db.applicationSubmission, { foreignKey: 'fundingOpportunityId' });
db.applicationSubmission.belongsTo(db.fundingOpportunity, { foreignKey: 'fundingOpportunityId' });

// Submission belongs to one User (NGO Admin)
db.user.hasMany(db.applicationSubmission, { foreignKey: 'ngoUserId' });
db.applicationSubmission.belongsTo(db.user, { foreignKey: 'ngoUserId', as: 'applicantUser' });

// Submission belongs to one NgoProfile (at time of submission)
db.ngoProfile.hasMany(db.applicationSubmission, { foreignKey: 'ngoProfileId' });
db.applicationSubmission.belongsTo(db.ngoProfile, { foreignKey: 'ngoProfileId', as: 'applicantProfile' });

// User <> Notifications
db.user.hasMany(db.notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.notification.belongsTo(db.user, { foreignKey: 'userId' });


module.exports = db;
