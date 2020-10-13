const path = require('path');
const WebpackRequireFrom = require('../../');

const pluginConfList = {
  default: {},
  empty_pluginConf: {
    plugins: [new WebpackRequireFrom()],
  },
  emptyObject_pluginConf: {
    plugins: [new WebpackRequireFrom({})],
  },
  path_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        path: 'staticPath/',
      }),
    ],
  },
  methodName_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        methodName: 'getPublicPath',
      }),
    ],
  },
  variableName_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        variableName: 'publicPath',
      }),
    ],
  },
  replaceSrcMethodName_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        replaceSrcMethodName: 'getSrc',
      }),
    ],
  },
  replaceSrcMethodName_methodName_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        methodName: 'getPublicPath',
        replaceSrcMethodName: 'getSrc',
      }),
    ],
  },
  replaceSrcMethodName_variableName_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        variableName: 'publicPath',
        replaceSrcMethodName: 'getSrc',
      }),
    ],
  },
  replaceSrcMethodName_path_pluginConf: {
    plugins: [
      new WebpackRequireFrom({
        path: 'staticPath/',
        replaceSrcMethodName: 'getSrc',
      }),
    ],
  },
};

exports.buildPath = path.resolve('build');

const baseConf = {
  entry: {
    main: './test/common/src/index.js',
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: 'originalPublicPath/',
    path: exports.buildPath,
  },
};

exports.webpack5 = {};
exports.webpack4 = {};
exports.webpack3 = {};
exports.webpack2 = {};

Object.entries(pluginConfList).map(([configName, configValue]) => {
  exports.webpack5[configName] = Object.assign({}, baseConf, configValue, {
    mode: 'development',
    output: {
      ...baseConf.output,
      globalObject: 'this',
    },
  });
  exports.webpack4[configName] = Object.assign({}, baseConf, configValue, {
    mode: 'development',
    output: {
      ...baseConf.output,
      globalObject: 'this',
    },
  });
  exports.webpack3[configName] = Object.assign({}, baseConf, configValue);
  exports.webpack2[configName] = Object.assign({}, baseConf, configValue);
});
