const articleService = require("../../services/articles/article.service");

function createNewArticle(req, res, next) {
  const { title, description, image, url, type, note, tags } = req.body;
  let user = req.user;

  try {
    new URL(url);
  } catch (err) {
    res.status(400).send({
      status: "error",
      message: "not valid URL",
    });
  }

  articleService
    .create({
      title,
      description,
      image,
      url,
      type,
      note,
      tags,
      userId: user.id,
    })
    .then((article) =>
      res.json({
        status: "success",
        message: "article created successfully!",
        data: article,
      })
    )
    .catch(next);
}

let adminAPI = {
  createNewArticle,
};

module.exports = adminAPI;
