const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const signupValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/signup", signupValidation, authController.signup);
router.post("/login", loginValidation, authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);

module.exports = router;
