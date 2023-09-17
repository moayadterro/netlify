const mongoose = require("mongoose");
const config = require("../../config.json");

//-- connection settings
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;
// for testing porpuse
const db = mongoose.connection;
db.once("open", function () {
  console.log("mongodb connected successfully");
});
db.on("error", console.error.bind(console, "connection error: "));

module.exports = {
  User: require("../models/users/user.model"),
  Article: require("../models/articles/article.model"),
  RefreshToken: require("../models/users/refresh-token.model"),
  ResetPassword: require("../models/users/reset-password.model"),
  isValidId,
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
