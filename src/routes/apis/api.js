const express = require("express");
const authorize = require("../../middleware/authorize");
const validateRequest = require("../../middleware/validate-request");
const Role = require("../../helpers/role");
const userEnd = require("./user");
const adminEnd = require("./admin");
const router = express.Router();
const Joi = require("joi");
const upload = require("../../helpers/multer");

// GET
router.get("/profile", authorize(Role.Admin), userEnd.getMyProfile);
router.get("/:username/articles", userEnd.getUserArticles);
router.get("/:username/articles/tags", userEnd.getUserArticlesTags);
router.get("/:username/articles/:id", userEnd.getUserArticleById);
router.get("/getmeta", userEnd.getMetaDatafromUrl); // added authorization just for security and DoS
router.get("/:username/public_profile", userEnd.getPublicUserInfo); // added authorization just for security and DoS

// CREATE
router.post(
  "/articles/create",
  authorize(Role.Admin),
  createArticleSchema,
  adminEnd.createNewArticle
);
router.post(
  "/profile/avatar",
  authorize(Role.Admin),
  userEnd.updateProfileAvatar
);

// PUT - UPDATE
router.put("/profile", authorize(Role.Admin), userEnd.updateMyProfile);

//DELETE user article
router.delete(
  "/:username/articles",
  authorize(Role.Admin),
  userEnd.deleteUserCollection
);

function createArticleSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: [Joi.string().optional(), Joi.allow(null)],
    url: Joi.string().required(),
    type: Joi.string().allow(""),
    note: Joi.string().allow(""),
    tags: Joi.array().items(Joi.string()),
  });
  validateRequest(req, next, schema);
}

module.exports = router;
