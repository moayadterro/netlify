const db = require("../../helpers/db");

module.exports = {
  create,
  getAll,
  getByUsername,
  getAllTags,
  getArticlesTagByUser,
  getById,
  deleteById,
  deleteArticlesCollection,
  deleteAll,
};

// tags is a list
async function create({
  title,
  description,
  image,
  url,
  type,
  note,
  tags = [],
  userId,
}) {
  const articleExist = await db.Article.findOne({
    $and: [{ url }, { user: userId }],
  });

  if (articleExist) {
    throw "article is already exist!";
  }
  // create a new article
  const article = new db.Article({
    title,
    description,
    image,
    url,
    tags,
    type,
    note,
    isDisabled: false,
    user: userId,
  });
  await article.save();

  return basicDetails(article);
  {
  }
}

async function getAll({ tags, page, perPage }) {
  // tags param can be a single tag as string ("sport")
  // or an array of tags (e.g. ["sport", "kids"])
  if (typeof tags === "string") {
    tags = [tags];
  }
  let articles = [];
  let criteria = {};
  if (tags) criteria = { tags: { $in: tags } };

  articles = await db.Article.find(criteria)
    .sort({ _id: -1 })
    .skip(page > 0 ? (page - 1) * perPage : 0)
    .limit(perPage);

  let totalCount = await db.Article.count(criteria);

  return {
    totalCount,
    list: articles.map((article) => basicDetails(article)),
  };
}

async function getByUsername({ username, tags, page, perPage }) {
  // tags param can be a single tag as string ("sport")
  // or an array of tags (e.g. ["sport", "kids"])
  if (typeof tags === "string") {
    tags = [tags];
  }
  let articles = [];
  let criteria = {};

  let user = await db.User.findOne({ username });
  if (!user) throw "not found";

  if (tags) criteria = { $and: [{ tags: { $in: tags } }, { user: user.id }] };
  else criteria = { user: user.id };

  articles = await db.Article.find(criteria)
    .sort({ _id: -1 })
    .skip(page > 0 ? (page - 1) * perPage : 0)
    .limit(perPage);

  let totalCount = await db.Article.count(criteria);

  return {
    totalCount,
    list: articles.map((article) => basicDetails(article)),
  };
}

async function getArticlesTagByUser(username) {
  let user = await db.User.findOne({ username });
  if (!user) throw "username not found";

  const articles = await db.Article.find({ user: user.id }).sort({ _id: -1 });
  let tags = [];
  articles.map((article) => {
    article.tags.map((tag) => {
      if (!tags.includes(tag)) tags.push(tag);
    });
  });
  return tags;
}

async function getAllTags() {
  const articles = await db.Article.find().sort({ _id: -1 });
  let tags = [];
  articles.map((article) => {
    article.tags.map((tag) => {
      if (!tags.includes(tag)) tags.push(tag);
    });
  });
  return tags;
}

async function getById(id) {
  const article = await getArticle(id);
  return basicDetails(article);
}

// helper functions
async function getArticle(id) {
  if (!db.isValidId(id)) throw "article not found";
  const article = await db.Article.findById(id);
  if (!article) throw "article not found";
  return article;
}

async function deleteById(id) {
  // id param can be a single id as string ("123")
  // or an array of id (e.g. ["123", "234"])
  if (typeof id === "string") id = [id];

  await db.Article.deleteMany({ _id: { $in: id } });
}

async function deleteArticlesCollection(username, id) {
  // id param can be a single id as string ("123")
  // or an array of id (e.g. ["123", "234"])
  if (typeof id === "string") {
    id = [id];
  }
  let user = await db.User.findOne({ username });
  if (!user) throw "article not found";

  let criteria = { $and: [{ _id: { $in: id } }, { user: user.id }] };
  await db.Article.deleteMany(criteria);
}

async function deleteAll() {
  await db.Article.deleteMany({});
}

function basicDetails(article) {
  const {
    id,
    title,
    description,
    image,
    tags,
    url,
    type,
    note,
    isDisabled,
    createdAt,
  } = article;
  return {
    id,
    title,
    description,
    image,
    tags,
    url,
    type,
    note,
    isDisabled,
    createdAt,
  };
}
