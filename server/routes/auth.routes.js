const { verifySignUp } = require("../middleware"); // Import middleware index
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateEmail // Add middleware
      // verifySignUp.checkRolesExisted // Add if implementing role checks
    ],
    controller.signup // Use controller function
  );

  app.post("/api/auth/signin", controller.signin); // Use controller function
};
