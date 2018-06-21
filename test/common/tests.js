const assert = require('assert');
const memoryFS = require('memory-fs');
const cloneDeep = require('lodash.clonedeep');

const WebpackRequireFrom = require("../../");
const webpackConfigurations = require("./webpack.config.shared");

let appendChildTrap;

const createGlobalEnv = function () {
  // create micro browser-like environment for the tests
  global.setTimeout = () => {};
  global.window = {};
  global.document = {
    createElement: () => ({ src: {} }),
    getElementsByTagName: () => [{ appendChild: appendChildTrap }]
  };
  appendChildTrap = console.log;
}

const compile = (webpackEngine, config, fs) => {
  const compiler = webpackEngine(cloneDeep(config));
  compiler.outputFileSystem = fs;
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        reject(new Error(err || stats.compilation.errors));
      }
      eval(fs.readFileSync(`${webpackConfigurations.buildPath}/main.js`).toString());
      resolve();
    })
  })
}

const compileWithWebpackVersion = (webpackVersion, configName) => compile(
  require(`../${webpackVersion}/node_modules/webpack`),
  webpackConfigurations[webpackVersion][configName],
  new memoryFS()
)

describe("webpack-require-from", function () {
  beforeEach(() => createGlobalEnv());

  it("throws when path and methodName are defined together", () => {
    try {
      new WebpackRequireFrom({ path: "some", methodName: "thing" })
      throw new Error("should throw when path and methodName are defined together")
    } catch (e) {}
  })
  Array.of("webpack2", "webpack3", "webpack4").map(webpackVersion => 
    describe(webpackVersion, () => [
      it("does nothing when config is empty", async () => {
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "originalPublicPath");
        await compileWithWebpackVersion(webpackVersion, "empty_pluginConf");
      }),
      it("does nothing when config is empty object", async () => {
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "originalPublicPath");
        await compileWithWebpackVersion(webpackVersion, "emptyObject_pluginConf");
      }),
      it("replaces with a static path", async () => {
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "staticPath");
        await compileWithWebpackVersion(webpackVersion, "path_pluginConf");
      }),
      it("replaces with a result of methodName", async () => {
        global.getPublicPath = () => 'newPublicPath/'
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "newPublicPath");
        await compileWithWebpackVersion(webpackVersion, "methodName_pluginConf");
        global.getPublicPath = undefined;
      }),
      it("replaces with result of replaceSrcMethodName", async () => {
        global.getSrc = (original) => `newSrc/${original}`
        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "newSrc");
          assert.strictEqual(src.split("/")[1], "originalPublicPath");
        }
        await compileWithWebpackVersion(webpackVersion, "replaceSrcMethodName_pluginConf");
        global.getSrc = undefined;
      }),
      it("replaces with result of methodName > replaceSrcMethodName", async () => {
        global.getPublicPath = () => 'newPublicPath/'
        global.getSrc = (original) => `newSrc/${original}`
        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "newSrc");
          assert.strictEqual(src.split("/")[1], "newPublicPath");
        }
        await compileWithWebpackVersion(webpackVersion, "replaceSrcMethodName_methodName_pluginConf");
        global.getSrc = global.getPublicPath = undefined;
      }),
      it("replaces with result of path > replaceSrcMethodName", async () => {
        global.getSrc = (original) => `newSrc/${original}`
        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "newSrc");
          assert.strictEqual(src.split("/")[1], "staticPath");
        }
        await compileWithWebpackVersion(webpackVersion, "replaceSrcMethodName_path_pluginConf");
        global.getSrc = global.getPublicPath = undefined;
      })
    ]
  )
  )
})