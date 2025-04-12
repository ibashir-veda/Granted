module.exports = (sequelize, Sequelize) => {
  const FunderProfile = sequelize.define("funder_profiles", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: { // Foreign key to link with the users table
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true // Each user can only have one Funder profile
    },
    organizationName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    funderType: { // e.g., Foundation, Government, Corporate, Private
        type: Sequelize.STRING
    },
    website: {
        type: Sequelize.STRING,
        validate: {
            isUrl: true
        }
    },
    contactEmail: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
    },
    fundingAreas: { // Comma-separated, JSON, or related table later
        type: Sequelize.STRING
    },
    grantSizeRange: { // e.g., "$10k-$50k", "Avg $25k"
        type: Sequelize.STRING
    },
    eligibilitySummary: {
        type: Sequelize.TEXT
    },
    applicationPortalLink: { // Link to their main grant portal if exists
        type: Sequelize.STRING,
        validate: {
            isUrl: true
        }
    }
    // Timestamps (createdAt, updatedAt) are added automatically
  });

  return FunderProfile;
};
