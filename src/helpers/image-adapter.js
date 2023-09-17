const { default: axios } = require("axios");
const sharp = require("sharp");

function getBase64Image(imageUrl) {
  url = decodeURI(imageUrl);
  return axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .then((response) => {
      return sharp(response.data).resize(360, 240).toBuffer();
    })
    .then((res) => {
      return (
        "data:image/jpeg;base64," +
        Buffer.from(res, "binary").toString("base64")
      );
    })
    .catch((err) => {
      // console.log(err);
    });
}

module.exports = {
  getBase64Image,
};
