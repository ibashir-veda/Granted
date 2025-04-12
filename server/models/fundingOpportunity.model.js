module.exports = (sequelize, Sequelize) => {
  const FundingOpportunity = sequelize.define("funding_opportunities", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    funderName: { // Can be entered manually (esp by admin) or derived from Funder Profile
      type: Sequelize.STRING,
      allowNull: true // Allow null if funderUserId is set
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    fundingAmountRange: { // e.g., "$10k - $50k", "Up to $100k"
      type: Sequelize.STRING
    },
    eligibilityCriteria: { // Simple text for MVP
      type: Sequelize.TEXT
    },
    applicationDeadline: {
      type: Sequelize.DATEONLY // Store only the date
    },
    applicationLink: { // Link to external portal or info page
      type: Sequelize.STRING,
      validate: {
        isUrl: true
      }
    },
    tags: { // Comma-separated or JSON array string
      type: Sequelize.STRING
    },
    postedByAdminId: { // Link to the admin user who posted it (if applicable)
        type: Sequelize.INTEGER,
        allowNull: true
    },
    funderUserId: { // Link to the funder user who posted it (if applicable)
        type: Sequelize.INTEGER,
        allowNull: true
    },
    acceptsIntegratedApp: { // Boolean flag to enable integrated application
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    integratedAppFields: { // Store definition of custom fields for integrated app
        type: Sequelize.JSONB, // Use JSONB for flexibility
        allowNull: true // Null if integrated app is not accepted
    }
    // Timestamps added automatically
  });

  // Add a constraint or hook later to ensure either funderName or funderUserId is present

  return FundingOpportunity;
};
