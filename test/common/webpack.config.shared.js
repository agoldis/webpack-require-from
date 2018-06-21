const path = require("path");
const WebpackRequireFrom = require("../../");

const pluginConfList = {
  empty_pluginConf: {
    plugins: [new WebpackRequireFrom()]
  },
  emptyObject_pluginConf: {
    plugins: [new WebpackRequireFrom({})]
  },
  path_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        path: "staticPath/"
      })
    ]
  },
  methodName_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        methodName: "getPublicPath"
      })
    ]
  },
  replaceSrcMethodName_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        replaceSrcMethodName: "getSrc"
      })
    ]
  },
  replaceSrcMethodName_methodName_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        methodName: "getPublicPath",
        replaceSrcMethodName: "getSrc"
      })
    ]
  },
  replaceSrcMethodName_path_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        path: "staticPath/",
        replaceSrcMethodName: "getSrc"
      })
    ]
  }
};

exports.buildPath = path.resolve("build")

const defaultConf = {
  entry: {
    main: "./test/common/index.js"
  },
  output: {
    filename: "[name].js",
    chunkFilename: "[name].js",
    publicPath: "originalPublicPath/",
    path: exports.buildPath
  }
}

exports.webpack4 = {};
exports.webpack3 = {};
exports.webpack2 = {};

Object.entries(pluginConfList).map(([configName, configValue]) => {
  exports.webpack4[configName] = Object.assign({}, defaultConf, configValue, {mode: "development"})
  exports.webpack3[configName] = Object.assign({}, defaultConf, configValue)
  exports.webpack2[configName] = Object.assign({}, defaultConf, configValue)
})
