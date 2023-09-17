const metascraper = require("metascraper")([
  require("metascraper-title")(),
  require("metascraper-description")(),
  require("metascraper-url")(),
  require("metascraper-lang")(),
  require("metascraper-image")(),
]);

const { default: axios } = require("axios");
const { getBase64Image } = require("./image-adapter");

function getMetaData(url) {
  if (!url) return {};
  return axios
    .get(url, {
      paramsSerializer: (params) => qs.stringify(params, { encode: false }),
      headers: {
        "user-agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      },
    })
    .then((response) => {
      return metascraper({ html: response.data, url });
    })
    .then(async (response) => {
      let base64Image = null;
      if (response.image) {
        base64Image = await getBase64Image(response.image).catch((err) => {
          return response.image;
        });
      }

      return {
        ogTitle: response.title,
        ogDescription: response.description,
        requestUrl: decodeURI(url),
        image: response.image,
        ogLocale: response.lang,
        image: base64Image,
      };
    });
}

module.exports = {
  getMetaData,
};
