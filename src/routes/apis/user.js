const articleService = require("../../services/articles/article.service");
const userService = require("../../services/users/user.service");
const ogs = require("../../helpers/open-graph-scraper");

function getMyProfile(req, res, next) {
  let { id } = req.user;
  userService
    .getById(id)
    .then((response) => {
      res.json({
        status: "success",
        data: response,
      });
    })
    .catch(next);
}

function updateMyProfile(req, res, next) {
  let { id } = req.user;
  let { fullName, email, phoneNumber } = req.body;
  let user = { id, fullName, email, phoneNumber };

  userService
    .updateProfile(user)
    .then(() => {
      res.json({
        status: "success",
        message: "Profile updated successfully",
      });
    })
    .catch(next);
}

function updateProfileAvatar(req, res, next) {
  let { id } = req.user;
  let { avatar } = req.body;

  if (!avatar) {
    return res.status(400).send({
      status: "error",
      message: "avatar is required",
    });
  }
  userService
    .updateUserAvatar({ id, avatar })
    .then(() => {
      return res.json({
        status: "success",
        message: "avatar updated successfully",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        status: "error",
        message: "couldn't save avatar profile",
        errors: err,
      });
    });
}

async function getMetaDatafromUrl(req, res, next) {
  const { url } = req.query;
  ogs
    .getMetaData(url)
    .then((data) => {
      res.json({ status: "success", data });
    })
    .catch((err) => {
      res.status(400).send({
        status: "error",
        message: "couldn't read metadata from URL",
        errors: err,
      });
    });
}

function getUserArticles(req, res, next) {
  const { tags, page, perPage } = req.query;
  const username = req.params["username"];

  articleService
    .getByUsername({ username, tags, page, perPage })
    .then((data) => res.json({ status: "success", data }))
    .catch(next);
}

function getUserArticlesTags(req, res, next) {
  const username = req.params["username"];

  articleService
    .getArticlesTagByUser(username)
    .then((tags) => res.json({ status: "success", data: { tags } }))
    .catch(next);
}

function getUserArticleById(req, res, next) {
  const { id } = req.query;
  const username = req.params["username"];
  articleService
    .getById(id)
    .then((article) => res.json({ status: "success", data: article }))
    .catch(next);
}

function deleteUserCollection(req, res, next) {
  const { id } = req.query;
  const username = req.params["username"];
  if (!id) throw { name: "ValidationError", message: "Please select an item." };
  articleService
    .deleteArticlesCollection(username, id)
    .then(() =>
      res.json({
        status: "success",
        message: "item(s) deleted successfully",
      })
    )
    .catch(next);
}

function getPublicUserInfo(req, res, next) {
  const username = req.params["username"];
  userService
    .getPublicInfoByUsername(username)
    .then((response) => {
      res.json({
        status: "success",
        data: response,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "error",
        message: "An error occurred, couldn't read username data",
        errors: err,
      });
    });
}

let userAPI = {
  getMyProfile,
  getUserArticles,
  updateMyProfile,
  getPublicUserInfo,
  updateProfileAvatar,
  getUserArticleById,
  getUserArticlesTags,
  deleteUserCollection,
  getMetaDatafromUrl,
};

module.exports = userAPI;
