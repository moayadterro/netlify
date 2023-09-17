const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "fullName is required."],
    },
    username: {
      type: String,
      lowercase: true,
      required: [true, "username is required."],
      index: true,
      unique: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "email is required."],
      match: [/\S+@\S+\.\S+/, "email is invalid."],
      index: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: null,
    },
    logo: {
      type: String,
      default: null,
    },
    hash: { type: String, required: true },
    role: { type: String, required: true },
    isActive: {
      type: Boolean,
    },
    isVerified: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "email is already taken." });

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.hash;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
