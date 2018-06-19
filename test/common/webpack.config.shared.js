const path = require("path");
const WebpackRequireFrom = require("../../");

const defaultConf = {
  entry: {
    main: "../common/index.js"
  },
  // stats: "minimal",
  output: {
    filename: "[name].js",
    chunkFilename: "[name].js",
    publicPath: "wrongPath",
    path: path.resolve("./build")
  },
  plugins: [
    new WebpackRequireFrom({
      methodName: "__cdnUrl"
    })
  ]
}
exports.webpack2 = defaultConf;
exports.webpack3 = defaultConf;
exports.webpack4 = Object.assign({}, defaultConf, { mode: "development" })

exports.webpack4static = Object.assign({}, defaultConf, { mode: "development", plugins: [
  new WebpackRequireFrom({ path: "staticPath" })
]})