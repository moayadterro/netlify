const express = require("express");
const app = express();
const auth = require("../src/routes/auth");
const api = require("../src/routes/apis/api");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
var cors = require("cors");
const router = express.Router();
const errorHandler = require("../src/middleware/error-handler");

app.use(bodyParser.json());

app.use(express.json({ limit: "2mb" }));

// CORS is required to work -test
app.options("*", cors());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ status: "success", message: "hooray! welcome to contentboard!" });
});

app.use("/api", api);
app.use("/auth", auth);

app.use("/.netlify/functions", router); // path must route to lambda

// global error handler
app.use(errorHandler);

// error handling middleware
app.use((err, req, res, next) => {
  //console.log(err);
  res.status(422).send({ error: err.message });
});

module.exports = app;
module.exports.handler = serverless(app);
