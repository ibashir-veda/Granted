const db = require("../models");
const User = db.user;

checkDuplicateEmail = (req, res, next) => {
  // Email
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(user => {
    if (user) {
      res.status(400).send({
        message: "Failed! Email is already in use!"
      });
      return;
    }
    next();
  });
};

// Add checks for roles if needed later
// checkRolesExisted = (req, res, next) => { ... }

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
  // checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;
