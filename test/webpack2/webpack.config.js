const path = require("path");
const WebpackRequireFrom = require("../../");

module.exports = {
  entry: {
    main: "./index.js"
  },
  output: {
    filename: "[name].js",
    chunkFilename: "[name].js",
    publicPath: "",
    path: path.resolve("./build")
  },
  plugins: [
    new WebpackRequireFrom({
      methodName: "__cdnUrl"
    })
  ]
};
