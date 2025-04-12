const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  // Validate request body (add more validation as needed)
  if (!req.body.email || !req.body.password || !req.body.role) {
      return res.status(400).send({ message: "Email, password, and role are required." });
  }
  if (!['ngo_admin', 'funder', 'service_provider'].includes(req.body.role)) {
       return res.status(400).send({ message: "Invalid role specified." });
  }


  // Save User to Database
  User.create({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8), // Hash password
    role: req.body.role,
    isVerified: req.body.role !== 'ngo_admin' // Auto-verify funders/providers for now, NGOs need manual verification
  })
    .then(user => {
        // For MVP, maybe don't sign in immediately after signup, require login
        res.send({ message: "User registered successfully! Please login." });

        // Or, if you want to log them in immediately:
        /*
        var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });
        res.status(200).send({
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            accessToken: token
        });
        */
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      // Check if NGO is verified before allowing login (optional, based on requirements)
      // if (user.role === 'ngo_admin' && !user.isVerified) {
      //   return res.status(403).send({
      //     accessToken: null,
      //     message: "Account not verified yet. Please wait for admin approval."
      //   });
      // }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      res.status(200).send({
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        accessToken: token
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
