module.exports = (sequelize, Sequelize) => {
  const ApplicationSubmission = sequelize.define("application_submissions", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fundingOpportunityId: { // Link to the opportunity being applied for
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    ngoUserId: { // Link to the NGO user submitting
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    ngoProfileId: { // Link to the NGO profile at time of submission (snapshot)
        type: Sequelize.INTEGER,
        allowNull: true // Allow null initially if profile creation is separate
    },
    submissionData: { // Store the answers to the integratedAppFields
      type: Sequelize.JSONB,
      allowNull: false
    },
    status: { // Track application status
        type: Sequelize.ENUM('submitted', 'under_review', 'approved', 'rejected'),
        defaultValue: 'submitted',
        allowNull: false
    },
    submittedAt: { // Explicit submission timestamp
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
    // Timestamps (createdAt, updatedAt) also added automatically
  });

  return ApplicationSubmission;
};
