const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var uniqueValidator = require("mongoose-unique-validator");

const ArticleSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    url: {
      type: String,
    },
    type: {
      type: String,
    },
    note: {
      type: String,
    },
    isDisabled: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

ArticleSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

ArticleSchema.plugin(uniqueValidator, { message: "URL is already exist!" });
const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
