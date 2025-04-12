const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id; // Add userId to request object
    next();
  });
};

isPlatformAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    if (user && user.role === 'platform_admin') {
      next();
      return;
    }

    res.status(403).send({
      message: "Require Platform Admin Role!"
    });
  });
};

isFunder = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    if (user && user.role === 'funder') {
      next();
      return;
    }
    res.status(403).send({
      message: "Require Funder Role!"
    });
  });
};

isServiceProvider = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    if (user && user.role === 'service_provider') {
      next();
      return;
    }
    res.status(403).send({
      message: "Require Service Provider Role!"
    });
  });
};


const authJwt = {
  verifyToken: verifyToken,
  isPlatformAdmin: isPlatformAdmin,
  isFunder: isFunder,
  isServiceProvider: isServiceProvider // Export the new function
};
module.exports = authJwt;
