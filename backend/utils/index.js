const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWTSECRET = process.env.JWTSECRET;

const generateToken = (id) => {
  return jwt.sign({ id }, JWTSECRET, { expiresIn: "1d" });
};

// hash token
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token.toString()).digest("hex");
};

module.exports = {
  generateToken,
  hashToken,
};
