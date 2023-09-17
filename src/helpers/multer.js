const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads/");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     fileExtension = file.originalname.split(".")[1]; // get file extension from original file name
//     cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
//   },
// });

const upload = multer({});

module.exports = upload;
