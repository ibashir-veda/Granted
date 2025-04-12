const { authJwt } = require("../middleware");
const controller = require("../controllers/ngo.controller");

// Middleware to check if the user is an NGO Admin
const isNgoAdmin = (req, res, next) => {
    const User = require("../models").user; // Direct require to avoid circular dependency issues if models/index is complex
    User.findByPk(req.userId).then(user => {
        if (user && user.role === 'ngo_admin') {
            next();
            return;
        }
        res.status(403).send({ message: "Require NGO Admin Role!" });
    });
};

// Middleware to check if NGO is verified (needed for applying)
const isVerifiedNgoAdmin = (req, res, next) => {
    const User = require("../models").user;
    User.findByPk(req.userId).then(user => {
        if (user && user.role === 'ngo_admin' && user.isVerified) {
            next();
            return;
        }
        if (user && user.role === 'ngo_admin' && !user.isVerified) {
             res.status(403).send({ message: "Account must be verified to submit applications." });
             return;
        }
        res.status(403).send({ message: "Require Verified NGO Admin Role!" });
    });
};


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // --- NGO Profile ---
  // Get current NGO Admin's profile
  app.get(
    "/api/ngo/profile/me",
    [authJwt.verifyToken, isNgoAdmin], // Protect route: require login and NGO Admin role
    controller.getMyProfile
  );

  // Create or Update current NGO Admin's profile
  app.put(
    "/api/ngo/profile/me",
    [authJwt.verifyToken, isNgoAdmin], // Protect route
    controller.updateMyProfile
  );


  // --- Saved Searches (NGO Admin Only) ---
  app.post(
    "/api/ngo/saved-searches",
    [authJwt.verifyToken, isNgoAdmin], // Protect route
    controller.createSavedSearch
  );

  app.get(
    "/api/ngo/saved-searches",
    [authJwt.verifyToken, isNgoAdmin], // Protect route
    controller.listMySavedSearches
  );

  app.delete(
    "/api/ngo/saved-searches/:searchId",
    [authJwt.verifyToken, isNgoAdmin], // Protect route
    controller.deleteMySavedSearch
  );


  // --- Application Submission (Verified NGO Admin Only) ---
  app.post(
    "/api/ngo/opportunities/:opportunityId/apply",
    [authJwt.verifyToken, isVerifiedNgoAdmin], // Protect route, require verified NGO
    controller.submitApplication
  );

  // --- Application Tracking (NGO Admin Only) ---
  app.get(
    "/api/ngo/applications",
    [authJwt.verifyToken, isNgoAdmin], // Requires NGO Admin login
    controller.listMyApplications
  );

};
