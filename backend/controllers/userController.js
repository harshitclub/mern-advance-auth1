const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const { generateToken, hashToken } = require("../utils/index");
const parser = require("ua-parser-js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
const Cryptr = require("cryptr");

const cryptr = new Cryptr(process.env.CRYPTR_KEY);

/* ------register user function -------------*/
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //  validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in al the required fields.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // check if user exist
  const userExist = await User.findOne({ email });

  if (userExist) {
    throw new Error("Email Already in Use.");
  }

  // get user agent
  const ua = parser(req.headers["user-agent"]);
  const userAgent = [ua.ua];

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    userAgent,
  });

  // generate token using jwt
  const token = generateToken(user._id);

  // send httpOnly cookie

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, name, email, phone, bio, photo, role, isVerified } = user;

    res.status(201).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
      token,
      userAgent,
    });
  } else {
    res.status(400);
    throw new Error("Invalid User Data");
  }
});

/*----------send verification email ----------*/
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("User Verified");
  }
  //delete token if it exist in db
  let token = await Token.findOne({ userId: user._id });

  if (token) {
    await token.deleteOne();
  }

  //create verification token & save in db
  const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(verificationToken);

  // hash token and save
  const hashedToken = hashToken(verificationToken);
  await new Token({
    userId: user._id,
    vToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * (60 * 1000), // 60min
  }).save();

  //contruct verification url
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

  //send verification email
  const subject = "Verify Your Account - LMS";
  const send_to = user.email;
  const send_from = process.env.EMAIL_USER;
  const reply_to = "noreply@lms.com";
  const template = "verifyEmail";
  const name = user.name;
  const link = verificationUrl;

  try {
    await sendEmail(
      subject,
      send_to,
      send_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: "Verification Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

// verify user
const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  const hashedToken = hashToken(verificationToken);

  const userToken = await Token.findOne({
    vToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  //find user
  const user = await User.findOne({ _id: userToken.userId });

  if (user.isVerified) {
    res.status(400);
    throw new Error("User is already verified");
  }

  // now verify the user
  user.isVerified = true;
  await user.save();

  res.status(200).json({
    message: "Account Verification Successfull",
  });
});

/* -----------login user function -----------*/
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User Not Exist | Signup Instead");
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Invalid Credentials!");
  }

  // trigger 2 factor authentication for unknown user agent
  const ua = parser(req.headers["user-agent"]);
  const thisUserAgent = ua.ua;

  const allowedAgent = user.userAgent.includes(thisUserAgent);

  if (!allowedAgent) {
    // generate 6 digit code
    const loginCode = Math.floor(100000 + Math.random() * 900000);
    console.log(loginCode);

    //encrypt login code before saving to db
    const encryptedLoginCode = cryptr.encrypt(loginCode.toString());

    //delete token if it exists in db
    let userToken = await Token.findOne({ userId: user._id });
    if (userToken) {
      await userToken.deleteOne();
    }

    //save token to db
    await new Token({
      userId: user._id,
      lToken: encryptedLoginCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 1000),
    }).save();

    res.status(400);
    throw new Error("New Browser or device detected");
  }

  //generate token

  const token = generateToken(user._id);
  if (user && passwordIsCorrect) {
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, phone, bio, photo, role, isVerified, userAgent } =
      user;

    res.status(200).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
      userAgent,
    });
  } else {
    res.status(500);
    throw new Error("Something went wrong please try again");
  }
});

// send login code
const sendLoginCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  // Find Login Code In DB
  let userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired token, please login again");
  }

  const loginCode = userToken.lToken;
  const decryptedLoginCode = cryptr.decrypt(loginCode);
  console.log(decryptedLoginCode);

  //send login code

  const subject = "Login Access Code - AUTH:Z";
  const send_to = email;
  const send_from = process.env.EMAIL_USER;
  const reply_to = "noreply@lms.com";
  const template = "loginCode";
  const name = user.name;
  const link = decryptedLoginCode;

  try {
    await sendEmail(
      subject,
      send_to,
      send_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: `Access code sent to ${email}` });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

//Login with code
const loginWithCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { loginCode } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  //find user login token
  const userToken = await Token.findOne({
    userId: user.id,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token, Please Login Again");
  }

  const decryptedLoginCode = cryptr.decrypt(userToken.lToken);

  if (loginCode !== decryptedLoginCode) {
    res.status(400);
    throw new Error("Incorrect login code, please try again");
  } else {
    // register userAgent
    const ua = parser(req.headers["user-agent"]);
    const thisUserAgent = ua.ua;
    user.userAgent.push(thisUserAgent);
    await user.save();

    // generate token
    const token = generateToken(user._id);

    // send http-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });
    const { _id, name, email, phone, bio, photo, role, isVerified } = user;

    res.status(200).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
      token,
    });
  }
});

/*----------logout function -------------------*/
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });

  return res.status(200).json({
    message: "Logout Success!",
  });
});

/*---------get the user details ------------*/
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { _id, name, email, phone, bio, photo, role, isVerified } = user;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/*----update User----------*/
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { name, email, phone, bio, photo, role, isVerified } = user;

    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      photo: updatedUser.photo,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/*-------delete user--------------*/
const deleteUser = asyncHandler(async (req, res) => {
  const user = User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.remove();

  res.status(200).json({
    message: "User removed successfully",
  });
});

/*-------get all users ------------*/
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt").select("-password");
  if (!users) {
    res.status(404);
    throw new Error("Something Went Wrong!");
  }
  res.status(200).json({
    users,
  });
});

/*-------login status--------------*/
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json(false);
  }

  // verify token
  const verified = jwt.verify(token, process.env.JWTSECRET);

  if (verified) {
    return res.json(true);
  }

  return res.json(false);
});

/*-------upgrade user--------------*/
const upgradeUser = asyncHandler(async (req, res) => {
  const { role, id } = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User Not Found!");
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    message: `User Role Updated To ${role}`,
  });
});

/*------send auto email ------------*/
const sendAutoEmail = asyncHandler(async (req, res) => {
  const { subject, send_to, reply_to, template, url } = req.body;

  if (!subject || !send_to || !reply_to || !template) {
    res.status(500);
    throw new Error("Missing Email Parameter");
  }

  // Get User
  const user = await User.findOne({ email: send_to });

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  const send_from = process.env.EMAIL_USER;
  const name = user.name;
  const link = `${process.env.FRONTEND_URL}${url}`;

  try {
    await sendEmail(
      subject,
      send_to,
      send_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({
      message: "Email Sent",
    });
  } catch (error) {
    res.status(500);
    throw new Error("Email Not Sent, Please try again");
  }
});

/*-------forget password-------------*/
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("No user with this email");
  }

  // Delete token if it exists in db
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // create verification token and save
  const resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  console.log(resetToken);

  // hash token and save
  const hashedToken = hashToken(resetToken);
  await new Token({
    userId: user._id,
    rToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * (60 * 1000), //60minutes
  }).save();

  // Construct Reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

  // Send Email
  const subject = "Password Reset Request - LMS";
  const send_to = user.email;
  const send_from = process.env.EMAIL_USER;
  const reply_to = "noreply@zino.com";
  const template = "forgotPassword";
  const name = user.name;
  const link = resetUrl;

  try {
    await sendEmail(
      subject,
      send_to,
      send_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: "Password Reset Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  console.log(resetToken);

  const hashedToken = hashToken(resetToken);

  const userToken = await Token.findOne({
    rToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  // find user
  const user = await User.findOne({ _id: userToken.userId });

  // now reset password
  user.password = password;

  await user.save();

  res.status(200).json({
    message: "Password Reset Successfully, Please Login!",
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, password } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  if (!oldPassword || !password) {
    throw new Error("Please Enter Old and New Password");
  }

  //check if old password is correct
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();

    res.status(200).json({
      message: "Password Change Successfully, Please Re-login",
    });
  } else {
    res.status(400);
    throw new Error("Old password is Incorrect");
  }
});

module.exports = {
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
};
