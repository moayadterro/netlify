var nodemailer = require("nodemailer");
var config = require("../../config.json");

var emailTransporter = nodemailer.createTransport({
  service: config.email_service,
  auth: {
    user: config.sender_email,
    pass: config.sender_password,
  },
});

module.exports = emailTransporter;
