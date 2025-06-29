const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { authLogger } = require("../middleware/logging");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Send token via cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    console.log("Signup - Request Body:", req.body);
    console.log("Signup - Email type:", typeof req.body.email);
    console.log("Signup - Password type:", typeof req.body.password);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      authLogger.signupFailed(email, req.ip, "User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = await User.create({
      name,
      email,
      password,
    });

    authLogger.signupSuccess(email, req.ip);
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Signup error:", error);
    authLogger.signupFailed(req.body.email, req.ip, error.message);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    console.log("Login - Request Body:", req.body);
    console.log("Login - Email:", req.body.email);
    console.log("Login - Password:", req.body.password);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Login validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Check if user exists and get password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      authLogger.loginFailed(email, req.ip, "User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password using the model method
    const isPasswordValid = await user.correctPassword(password, user.password);
    if (!isPasswordValid) {
      authLogger.loginFailed(email, req.ip, "Invalid password");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    authLogger.loginSuccess(email, req.ip);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    authLogger.loginFailed(req.body.email, req.ip, error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  authLogger.logout(req.user?.email, req.ip);

  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
