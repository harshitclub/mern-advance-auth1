const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not Authorize, Please Login");
    }

    // verify token
    const verified = jwt.verify(token, process.env.JWTSECRET);
    // get user id from token
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.role === "suspended") {
      res.status(400);
      throw new Error("User is suspended, contact support");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not Authorize, Please Login");
  }
});

const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not Authorized As An Admin");
  }
});

const authorOnly = asyncHandler(async (req, res, next) => {
  if (req.user.role === "authorOnly" || req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not Authorized As Author");
  }
});

const verifiedOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(401);
    throw new Error("Not Authorized, Account Not Verified");
  }
});

module.exports = { protect, adminOnly, authorOnly, verifiedOnly };
