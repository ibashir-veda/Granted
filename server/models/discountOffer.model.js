module.exports = (sequelize, Sequelize) => {
  const DiscountOffer = sequelize.define("discount_offers", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productServiceName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    providerName: { // Can be entered manually (esp by admin) or derived from Provider Profile
      type: Sequelize.STRING,
      allowNull: true // Allow null if providerUserId is set
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    discountDetails: { // e.g., "50% off", "$10/month", "Free Tier Available"
      type: Sequelize.STRING,
      allowNull: false
    },
    eligibilityCriteria: { // e.g., "Verified NGOs only", "US-based NGOs"
      type: Sequelize.TEXT
    },
    redemptionInfo: { // Instructions, code reveal logic handled by frontend based on verification status
      type: Sequelize.TEXT,
      allowNull: false // How to get the discount
    },
    websiteLink: { // Link to product/provider website
        type: Sequelize.STRING,
        validate: {
            isUrl: true
        }
    },
    validityPeriod: { // e.g., "Ongoing", "Until Dec 31, 2024"
      type: Sequelize.STRING
    },
    categoryTags: { // Comma-separated or JSON array string (e.g., CRM, Accounting)
      type: Sequelize.STRING
    },
    postedByAdminId: { // Link to the admin user who posted it (if applicable)
        type: Sequelize.INTEGER,
        allowNull: true
    },
    providerUserId: { // Link to the service provider user who posted it (if applicable)
        type: Sequelize.INTEGER,
        allowNull: true
    }
    // Timestamps added automatically
  });

  // Add a constraint or hook later to ensure either providerName or providerUserId is present

  return DiscountOffer;
};
