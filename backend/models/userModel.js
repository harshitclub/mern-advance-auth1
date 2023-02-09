const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Add A Name"],
    },
    email: {
      type: String,
      required: [true, "Please Add An Email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please Enter A Valid Email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please Add A Password"],
    },
    photo: {
      type: String,
      required: [true, "Please Add A Photo"],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    phone: {
      type: String,
      default: "+234",
    },
    bio: {
      type: String,
      default: "bio",
    },
    role: {
      type: String,
      required: true,
      default: "user",
      // subscriber, author, and admin (suspended)
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    userAgent: {
      type: Array,
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// encrypt password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  } else {
    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
