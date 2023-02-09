const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  registerUser,
  sendVerificationEmail,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  loginStatus,
  upgradeUser,
  sendAutoEmail,
  verifyUser,
  forgotPassword,
  resetPassword,
  changePassword,
  sendLoginCode,
  loginWithCode,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getUser", protect, getUser);
router.patch("/updateUser", protect, updateUser);

router.delete("/:id", protect, adminOnly, deleteUser);
router.get("/getUsers", protect, adminOnly, getUsers);
router.get("/loginStatus", loginStatus);
router.post("/upgradeUser", protect, adminOnly, upgradeUser);
router.post("/sendAutoEmail", protect, sendAutoEmail);

router.post("/verificationEmail", protect, sendVerificationEmail);
router.patch("/verifyUser/:verificationToken", verifyUser);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);
router.patch("/changePassword", protect, changePassword);

router.post("/sendLoginCode/:email", sendLoginCode);
router.post("/loginWithCode/:email", loginWithCode);

module.exports = router;
