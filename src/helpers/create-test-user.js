const bcrypt = require("bcryptjs");
const Role = require("./role");
const db = require("./db");

module.exports = createTestUser;

async function createTestUser() {
  // create test user if the db is empty
  if ((await db.User.count({})) === 0) {
    const user = new db.User({
      fullName: "Moayad Terro",
      username: "maoaydterro",
      email: "moaed.terro@gmail.com",
      hash: bcrypt.hashSync("12345678", 10),
      role: Role.Admin,
      isActive: true,
      isVerified: true,
    });
    await user.save();
  }
}
