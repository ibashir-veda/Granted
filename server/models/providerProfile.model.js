module.exports = (sequelize, Sequelize) => {
  const ServiceProviderProfile = sequelize.define("service_provider_profiles", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: { // Foreign key to link with the users table
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true // Each user can only have one Provider profile
    },
    companyName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    serviceType: { // e.g., CRM, Accounting, Marketing, Cloud Services, HR Tools
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
    description: { // Brief description of the company/services
        type: Sequelize.TEXT
    }
    // Timestamps (createdAt, updatedAt) are added automatically
  });

  return ServiceProviderProfile;
};
