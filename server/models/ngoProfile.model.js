module.exports = (sequelize, Sequelize) => {
  const NgoProfile = sequelize.define("ngo_profiles", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: { // Foreign key to link with the users table
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true // Each user can only have one NGO profile
    },
    ngoName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    location: {
        type: Sequelize.STRING
    },
    contactEmail: { // Specific contact for the NGO, might differ from login email
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
    },
    website: {
        type: Sequelize.STRING,
        validate: {
            isUrl: true
        }
    },
    mission: {
        type: Sequelize.TEXT
    },
    vision: {
        type: Sequelize.TEXT
    },
    impactAreas: { // Could be stored as comma-separated string, JSON, or related table later
        type: Sequelize.STRING
    },
    registrationDetails: { // Simple text field for now, consider structured data or file uploads later
        type: Sequelize.TEXT
    },
    teamSize: {
        type: Sequelize.STRING // e.g., "1-10", "11-50"
    },
    budgetRange: {
        type: Sequelize.STRING // e.g., "<$50k", "$50k-$250k"
    }
    // Verification status is handled by the isVerified flag on the User model for simplicity in MVP
    // Timestamps (createdAt, updatedAt) are added automatically
  });

  return NgoProfile;
};
