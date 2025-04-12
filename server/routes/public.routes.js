const controller = require("../controllers/public.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Route to list funding opportunities
  app.get("/api/public/funding", controller.listFundingOpportunities);

  // Route to list discount offers
  app.get("/api/public/discounts", controller.listDiscountOffers);

};
