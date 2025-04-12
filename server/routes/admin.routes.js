const { authJwt } = require("../middleware");
const controller = require("../controllers/admin.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // --- Dashboard Stats ---
  app.get(
    "/api/admin/stats",
    [authJwt.verifyToken, authJwt.isPlatformAdmin],
    controller.getDashboardStats
  );


  // --- NGO Verification ---
  // Route to get list of unverified NGOs
  app.get(
    "/api/admin/ngos/unverified",
    [authJwt.verifyToken, authJwt.isPlatformAdmin], // Requires login and Platform Admin role
    controller.listUnverifiedNgos
  );

  // Route to verify a specific NGO
  app.patch( // Using PATCH as it's a partial update (changing verification status)
    "/api/admin/ngos/:userId/verify",
    [authJwt.verifyToken, authJwt.isPlatformAdmin], // Requires login and Platform Admin role
    controller.verifyNgo
  );


  // --- User Management (Admin Only) ---
  app.get(
    "/api/admin/users",
    [authJwt.verifyToken, authJwt.isPlatformAdmin],
    controller.listUsers
  );

  app.patch( // Use PATCH for partial updates
    "/api/admin/users/:userId",
    [authJwt.verifyToken, authJwt.isPlatformAdmin],
    controller.updateUser
  );

  // TODO: Add delete route later
  // app.delete("/api/admin/users/:userId", ...);


  // --- Admin Content Creation (Original Routes - Keep for now or deprecate later) ---
  app.post( "/api/admin/funding", [authJwt.verifyToken, authJwt.isPlatformAdmin], controller.createFundingOpportunity );
  app.post( "/api/admin/discounts", [authJwt.verifyToken, authJwt.isPlatformAdmin], controller.createDiscountOffer );


  // --- Admin Content Management (New Routes) ---
  // Funding Opportunities
  app.get( "/api/admin/content/funding", [authJwt.verifyToken, authJwt.isPlatformAdmin], controller.listAllOpportunities );
  app.get( "/api/admin/content/funding/:opportunityId", [authJwt.verifyToken, authJwt.isPlatformAdmin], controller.getOpportunityDetails );
  app.put( "/api/admin/content/funding/:opportunityId", [authJwt.verifyToken, authJwt.isPlatformAdmin], controller.updateOpportunity );
  app.delete( "/api/admin/content/funding/:opportunityId", [authJwt.verifyToken, authJwt.isPlatformAdmin], controller.deleteOpportunity );

  // Discount Offers
  app.get( "/api/admin/content/discounts", [authJwt.verifyToken, authJwt.isPlatformAdmin], controller.listAllOffers );
  app.get( "/api/admin/content/discounts/:offerId", [authJwt.verifyToken, authJwt.isPlatformAdmin], controller.getOfferDetails );
  app.put( "/api/admin/content/discounts/:offerId", [authJwt.verifyToken, authJwt.isPlatformAdmin], controller.updateOffer );
  app.delete( "/api/admin/content/discounts/:offerId", [authJwt.verifyToken, authJwt.isPlatformAdmin], controller.deleteOffer );

};
