const { authJwt } = require("../middleware");
const controller = require("../controllers/funder.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // --- Funder Profile ---
  app.get(
    "/api/funder/profile/me",
    [authJwt.verifyToken, authJwt.isFunder],
    controller.getMyProfile
  );

  app.put(
    "/api/funder/profile/me",
    [authJwt.verifyToken, authJwt.isFunder],
    controller.updateMyProfile
  );

  // --- Funding Opportunities (Managed by Funder) ---
   app.post(
    "/api/funder/funding",
    [authJwt.verifyToken, authJwt.isFunder],
    controller.createFundingOpportunity
  );

   app.get(
    "/api/funder/funding/my",
    [authJwt.verifyToken, authJwt.isFunder],
    controller.getMyFundingOpportunities
  );

  // Get details for a specific opportunity (for editing)
   app.get(
    "/api/funder/funding/:opportunityId",
    [authJwt.verifyToken, authJwt.isFunder],
    controller.getMyFundingOpportunityDetails
  );

  // Update a specific opportunity
   app.put(
    "/api/funder/funding/:opportunityId",
    [authJwt.verifyToken, authJwt.isFunder],
    controller.updateMyFundingOpportunity
  );

  // Delete a specific opportunity
   app.delete(
    "/api/funder/funding/:opportunityId",
    [authJwt.verifyToken, authJwt.isFunder],
    controller.deleteMyFundingOpportunity
  );

  // --- Application Viewing/Management (Funder) ---
  app.get(
    "/api/funder/funding/:opportunityId/applications",
    [authJwt.verifyToken, authJwt.isFunder],
    controller.listOpportunityApplications
  );

  // Update application status
  app.patch( // Use PATCH for partial update (status change)
    "/api/funder/applications/:submissionId/status",
    [authJwt.verifyToken, authJwt.isFunder],
    controller.updateApplicationStatus
  );

};
