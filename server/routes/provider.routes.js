const { authJwt } = require("../middleware");
const controller = require("../controllers/provider.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // --- Provider Profile ---
  app.get(
    "/api/provider/profile/me",
    [authJwt.verifyToken, authJwt.isServiceProvider],
    controller.getMyProfile
  );

  app.put(
    "/api/provider/profile/me",
    [authJwt.verifyToken, authJwt.isServiceProvider],
    controller.updateMyProfile
  );

  // --- Discount Offers (Managed by Provider) ---
   app.post(
    "/api/provider/discounts",
    [authJwt.verifyToken, authJwt.isServiceProvider],
    controller.createDiscountOffer
  );

   app.get(
    "/api/provider/discounts/my",
    [authJwt.verifyToken, authJwt.isServiceProvider],
    controller.getMyDiscountOffers
  );

  // Get details for a specific offer (for editing)
   app.get(
    "/api/provider/discounts/:offerId",
    [authJwt.verifyToken, authJwt.isServiceProvider],
    controller.getMyDiscountOfferDetails
  );

  // Update a specific offer
   app.put(
    "/api/provider/discounts/:offerId",
    [authJwt.verifyToken, authJwt.isServiceProvider],
    controller.updateMyDiscountOffer
  );

  // Delete a specific offer
   app.delete(
    "/api/provider/discounts/:offerId",
    [authJwt.verifyToken, authJwt.isServiceProvider],
    controller.deleteMyDiscountOffer
  );

};
