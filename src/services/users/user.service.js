const config = require("../../../config.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../../helpers/db");
const Role = require("../../helpers/role");
const emailTransporter = require("../../helpers/send-email");

module.exports = {
  createAdminAccount,
  authenticate,
  refreshToken,
  revokeToken,
  getAll,
  getById,
  updateProfile,
  updateUserAvatar,
  getRefreshTokens,
  forgotPassword,
  resetPassword,
  getPublicInfoByUsername,
};

const authError = {
  message: "Authentication error",
  errors: {},
};

async function authenticate({ email, password, ipAddress }) {
  const user = await db.User.findOne({ email });

  if (!user) {
    throw {
      message: "Authentication error",
      errors: {
        email: "email is not registered",
      },
    };
  }

  if (!bcrypt.compareSync(password, user.hash)) {
    throw {
      message: "Authentication error",
      errors: {
        password: "password is incorrect",
      },
    };
  }

  // authentication successful so generate jwt and refresh tokens
  const jwtToken = generateJwtToken(user);
  const refreshToken = generateRefreshToken(user, ipAddress);

  // save refresh token
  await refreshToken.save();

  // return basic details and tokens
  return {
    user,
    jwtToken,
    refreshToken: refreshToken.token,
  };
}

// register a new admin
async function createAdminAccount({ fullName, username, email, password }) {
  // check if email already exsist

  const account = await db.User.findOne({ $or: [{ email }, { username }] });

  if (account && account.email === email) {
    let error = { ...authError };
    error.errors["email"] = "email is already registered";
    throw error;
  }

  if (account && account.username === username) {
    let error = { ...authError };
    error.errors["username"] = "username is already registered";
    throw error;
  }

  // create a new admin account
  const user = new db.User({
    fullName,
    username,
    email,
    hash: bcrypt.hashSync(password, 10),
    role: Role.Admin,
    isActive: true,
    isVerified: false,
  });
  await user.save();

  return {
    status: "success",
    message: "Account created successfully!",
    data: basicDetails(user),
  };
}

async function refreshToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);
  const { user } = refreshToken;

  // replace old refresh token with a new one and save
  const newRefreshToken = generateRefreshToken(user, ipAddress);
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();
  await newRefreshToken.save();

  // generate new jwt
  const jwtToken = generateJwtToken(user);

  // return basic details and tokens
  return {
    ...basicDetails(user),
    jwtToken,
    refreshToken: newRefreshToken.token,
  };
}

async function revokeToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);

  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
}

async function getAll() {
  const users = await db.User.find();
  return users.map((x) => basicDetails(x));
}

async function getById(id) {
  const user = await getUser(id);
  if (!user) throw "user not found";
  return basicDetails(user);
}

async function updateProfile({ id, fullName, email, phoneNumber }) {
  const user = await db.User.findById(id);
  if (!user) throw "User not found";
  const userbelongToEmail = await db.User.findOne({ email });
  if (userbelongToEmail && userbelongToEmail.id !== id) {
    throw {
      message: "validation error",
      errors: {
        email: "email associated with another account!",
      },
    };
  }
  await db.User.updateOne(
    { _id: id },
    { $set: { fullName, email, phoneNumber } }
  );
}

async function updateUserAvatar({ id, avatar }) {
  const user = await db.User.findById(id);
  if (!user) throw "User not found";
  await db.User.updateOne({ _id: id }, { $set: { avatar } });
}

async function getRefreshTokens(userId) {
  // check that user exists
  await getUser(userId);

  // return refresh tokens for user
  const refreshTokens = await db.RefreshToken.find({ user: userId });
  return refreshTokens;
}

// helper functions
async function getUser(id) {
  if (!db.isValidId(id)) throw "User not found";
  const user = await db.User.findById(id);
  if (!user) throw "User not found";
  return user;
}

async function getRefreshToken(token) {
  const refreshToken = await db.RefreshToken.findOne({ token }).populate(
    "user"
  );
  if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
  return refreshToken;
}

function generateJwtToken(user, expires = "15d") {
  // create a jwt token containing the user id that expires in 15 days
  return jwt.sign({ sub: user.id, id: user.id }, config.secret, {
    expiresIn: expires,
  });
}

function generateRefreshToken(user, ipAddress) {
  // create a refresh token that expires in 7 days
  return new db.RefreshToken({
    user: user.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });
}

async function forgotPassword(email) {
  const user = await db.User.findOne({ email });
  if (!user)
    throw {
      message: "validation error",
      errors: {
        email: "email is not registered",
      },
    };
  // email is registered -- save token in db
  const token = generateJwtToken(user, "1h");
  const resetPasswordToken = new db.ResetPassword({
    user: user.id,
    token,
    expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
  });
  await resetPasswordToken.save();

  // email
  const emailData = {
    from: config.sender_email,
    to: email,
    subject: `Password reset link`,
    html: `
    <p>Please use the following link to reset your password:</p>
    <p>${config.client_url}/auth/password/reset/${token}</p>
    <hr />
    <p>This email may contain sensetive information</p>
    <p>${config.client_url}</p>
    `,
  };

  emailTransporter.sendMail(emailData, null);
  return {
    status: "success",
    message: `Email has been sent to you. Follow the instructions to reset your password.`,
  };
}

async function resetPassword(token, newPassword) {
  try {
    let { id: userId } = jwt.verify(token, config.secret);
    let resetPassword = await db.ResetPassword.find({
      user: userId,
      token,
    })
      .sort({ datetime: -1 })
      .limit(1);

    if (resetPassword.length === 0 || resetPassword[0].token !== token) {
      throw null;
    }
    await db.User.updateOne(
      { _id: userId },
      { $set: { hash: bcrypt.hashSync(newPassword, 10) } }
    );
    await db.ResetPassword.deleteMany({ user: { $in: userId } });
    return {
      status: "success",
      message: `Password has been changed successfully, You can login now!`,
    };
  } catch (errors) {
    throw {
      status: "error",
      message: `Verification link is expired, request new one!`,
      errors,
    };
  }
}

async function getPublicInfoByUsername(username) {
  const user = await db.User.findOne({ username });
  if (!user) throw "user not found";
  return publicDetails(user);
}

function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}

function basicDetails(user) {
  return user;
}

function publicDetails(user) {
  const { fullName, username, avatar } = user;
  return { fullName, username, avatar };
}
