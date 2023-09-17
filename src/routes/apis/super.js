function getAllArticles(req, res, next) {
  const { tags, page, perPage } = req.query;

  articleService
    .getAll({ tags, page, perPage })
    .then((data) => res.json({ status: "success", data }))
    .catch(next);
}

function getArticleById(req, res, next) {
  const { id } = req.query;
  articleService
    .getById(id)
    .then((article) => res.json({ status: "success", data: article }))
    .catch(next);
}

function getAllArticlesTag(req, res, next) {
  const { tags, page, perPage } = req.query;
  articleService
    .getAllTags({ tags, page, perPage })
    .then((tags) => res.json({ status: "success", data: { tags } }))
    .catch(next);
}

function deleteArticleById(req, res, next) {
  const { id } = req.query;
  if (!id) throw { name: "ValidationError", message: "Please select an item." };
  articleService
    .deleteById(id)
    .then(() =>
      res.json({
        status: "success",
        message: "item(s) deleted successfully",
      })
    )
    .catch(next);
}

let superAPI = {
  getAllArticles,
  getArticleById,
  getAllArticlesTag,
  deleteArticleById,
};

module.exports = superAPI;
