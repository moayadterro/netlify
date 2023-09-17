const express = require("express");
const app = express();
const api = require("../src/routes/api");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");

const router = express.Router();

router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Express.js!</h1>");
  res.end();
});

router.use("/api", api);

app.use(bodyParser.json());
app.use("/.netlify/functions", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
