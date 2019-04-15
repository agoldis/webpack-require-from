const memoryFS = require("memory-fs");
const cloneDeep = require("lodash.clonedeep");

const webpackConfigurations = require("./webpack.config.shared");

const compile = (webpackEngine, config, fs) => {
  const compiler = webpackEngine(cloneDeep(config));
  compiler.outputFileSystem = fs;
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        reject(new Error(err || stats.compilation.errors));
      }
      const code = fs
        .readFileSync(`${webpackConfigurations.buildPath}/main.js`)
        .toString();
      console.log(code);
      // eval(code);
      resolve();
    });
  });
};

const compileWithWebpackVersion = (webpackVersion, configName) =>
  compile(
    require(`../${webpackVersion}/node_modules/webpack`),
    {
      mode: "development",
      entry: {
        main: "./test/common/src/index.js"
      },
      output: {
        filename: "[name].js",
        chunkFilename: "[name].js",
        publicPath: "originalPublicPath/",
        path: webpackConfigurations.buildPath
      },
      module: {
        rules: [
          {
            test: /index\.js$/,
            use: {
              loader: path.resolve(
                `test/${webpackVersion}/node_modules/worker-loader`
              )
            }
          }
        ]
      },
      plugins: [
        new WebpackRequireFrom({
          path: "staticPath/"
        })
      ]
    },
    new memoryFS()
  );

(async function run() {
  await compileWithWebpackVersion(
    "webpack4",
    "replaceSrcMethodName_pluginConf"
  );
})();
