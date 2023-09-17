const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("../middleware/validate-request");
const authorize = require("../middleware/authorize");
const Role = require("../helpers/role");
const userService = require("../services/users/user.service");

// routes
router.post("/signup", createAdminAccountSchema, createNewAdmin);
router.post("/login", authenticateSchema, authenticate);
router.post("/password/forgot", forgotPasswordSchema, forgotPassword);
router.post("/password/reset", resetPasswordSchema, resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/revoke-token", authorize(), revokeTokenSchema, revokeToken);
router.get("/", authorize(Role.Admin), getAll);
router.get("/:id", authorize(), getById);
router.get("/:id/refresh-tokens", authorize(), getRefreshTokens);

module.exports = router;

function authenticateSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  validateRequest(req, next, schema);
}

function createAdminAccountSchema(req, res, next) {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  validateRequest(req, next, schema);
}

function forgotPasswordSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  validateRequest(req, next, schema);
}

function resetPasswordSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  });
  validateRequest(req, next, schema);
}

function createNewAdmin(req, res, next) {
  const { fullName, username, email, password } = req.body;
  userService
    .createAdminAccount({ fullName, username, email, password })
    .then((response) => {
      res.json(response);
    })
    .catch(next);
}

function authenticate(req, res, next) {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  userService
    .authenticate({ email, password, ipAddress })
    .then(({ jwtToken, refreshToken, user }) => {
      setTokenCookie(res, refreshToken);

      res.json({ jwtToken, user });
    })
    .catch(next);
}

function refreshToken(req, res, next) {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;
  userService
    .refreshToken({ token, ipAddress })
    .then(({ refreshToken, ...user }) => {
      setTokenCookie(res, refreshToken);
      res.json(user);
    })
    .catch(next);
}

function revokeTokenSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
  // accept token from request body or cookie
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;

  if (!token) return res.status(400).json({ message: "Token is required" });

  // users can revoke their own tokens and admins can revoke any tokens
  if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  userService
    .revokeToken({ token, ipAddress })
    .then(() => res.json({ message: "Token revoked" }))
    .catch(next);
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch(next);
}

function getById(req, res, next) {
  // regular users can get their own record and admins can get any record
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  userService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch(next);
}

function getRefreshTokens(req, res, next) {
  // users can get their own refresh tokens and admins can get any user's refresh tokens
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  userService
    .getRefreshTokens(req.params.id)
    .then((tokens) => (tokens ? res.json(tokens) : res.sendStatus(404)))
    .catch(next);
}

// helper functions

function setTokenCookie(res, token) {
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie("refreshToken", token, cookieOptions);
}

function forgotPassword(req, res, next) {
  const { email } = req.body;

  userService
    .forgotPassword(email)
    .then((response) => {
      res.json(response);
    })
    .catch(next);
}

function resetPassword(req, res, next) {
  const { token, password } = req.body;

  userService
    .resetPassword(token, password)
    .then((response) => {
      res.json(response);
    })
    .catch(next);
}
