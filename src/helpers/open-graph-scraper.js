const ogs = require("open-graph-scraper");
// const mql = require("@microlink/mql");
const { getBase64Image } = require("./image-adapter");

function isValidHttpUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

async function getMetaData(url) {
  let headers = {};
  let twitterReg = new RegExp("/(?:www.)?twitter.com/");

  if (twitterReg.test(url)) headers["user-agent"] = "Twitterbot/1.0";

  const options = {
    url,
    headers,
  };

  return ogs(options, async (error, results, response) => {
    if (error) {
      // if there is an error, try to use MQL as a second solution
      // let { data } = await mql(url);

      // results = {
      //   ogTitle: data.title,
      //   ogDescription: data.description,
      //   requestUrl: url,
      //   ogLocale: data.lang,
      //   ogImage: data.image,
      // };

      if (!data) throw error;
    }

    if (!results.ogUrl) results.ogUrl = results.requestUrl || url;

    let base64Image = null;

    if (results.ogImage) {
      imageURL = Array.isArray(results.ogImage)
        ? results.ogImage[0].url
        : results.ogImage.url;

      base64Image = await getBase64Image(
        encodeURI(
          isValidHttpUrl(imageURL) ? imageURL : results.ogUrl + imageURL
        )
      );
    } else if (results.favicon) {
      let favIconPath = results.favicon;

      base64Image = await getBase64Image(
        encodeURI(
          isValidHttpUrl(favIconPath)
            ? favIconPath
            : results.ogUrl + favIconPath
        )
      );
    }

    return {
      ogTitle: results.ogTitle,
      ogDescription: results.ogDescription || results.ogUrl,
      requestUrl: results.ogUrl,
      ogLocale: results.ogLocale || "en",
      image: base64Image,
    };
  });
}

module.exports = {
  getMetaData,
};
