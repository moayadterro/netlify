const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResetPasswordTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  token: String,
  expires: Date,
  created: { type: Date, default: Date.now },
  createdByIp: String,
  revoked: Date,
  revokedByIp: String,
  replacedByToken: String,
});

ResetPasswordTokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expires;
});

ResetPasswordTokenSchema.virtual("isActive").get(function () {
  return !this.revoked && !this.isExpired;
});

ResetPasswordTokenSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.id;
    delete ret.user;
  },
});

module.exports = mongoose.model("ResetPassword", ResetPasswordTokenSchema);
