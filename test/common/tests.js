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
  global.setWebpackPublicPath = false;
  global.onTheFlyPublicPath = "onTheFlyPublicPath/";
}

const compile = (webpackEngine, config, fs) => {
  const compiler = webpackEngine(cloneDeep(config));
  compiler.outputFileSystem = fs;
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        reject(new Error(err || stats.compilation.errors));
      }
      const code = fs.readFileSync(`${webpackConfigurations.buildPath}/main.js`).toString();
      // console.log(code);
      eval(code);
      resolve();
    })
  })
}

const compileWithWebpackVersion = (webpackVersion, configName) => compile(
  require(`../${webpackVersion}/node_modules/webpack`),
  webpackConfigurations[webpackVersion][configName],
  new memoryFS()
)

/*
Each test:
- resets micro-browser environment (beforeEach)
- defines global method the produce expected results 
- defines traps to check the output (by overriding HTML element attachChild method and checking src)
- retrevies webpack config
- optionally the modifies the default to create a good test case config 
- compiles and evaluates the output of compilation
- asserts test case in the trap function
- cleans up
*/
describe("webpack-require-from", function () {
  beforeEach(createGlobalEnv);

  it("throws when two of more of [path, methodName, variableName] are defined", () => {
    try {
      new WebpackRequireFrom({ path: "some", methodName: "thing" })
      throw new Error("should throw when two of more of [path, methodName, variableName] are defined")
    } catch (e) {}
  })
  it("throws when two of more of [path, methodName, variableName] are defined", () => {
    try {
      new WebpackRequireFrom({ path: "some", variableName: "thing" })
      throw new Error("should throw when two of more of [path, methodName, variableName] are defined")
    } catch (e) {}
  })
  it("throws when two of more of [path, methodName, variableName] are defined", () => {
    try {
      new WebpackRequireFrom({ variableName: "some", methodName: "thing" })
      throw new Error("should throw when two of more of [path, methodName, variableName] are defined")
    } catch (e) {}
  })
  Array.of("webpack2", "webpack3", "webpack4").map(webpackVersion => 
    describe(webpackVersion, () => [
      it("does nothing when config is empty", async () => {
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "originalPublicPath");
        await compileWithWebpackVersion(webpackVersion, "empty_pluginConf");
      }),
      it("allows public path to be set on the fly when config is empty", async () => {
        global.setWebpackPublicPath = true;
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "onTheFlyPublicPath");
        await compileWithWebpackVersion(webpackVersion, "empty_pluginConf");
      }),
      it("does nothing when config is empty object", async () => {
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "originalPublicPath");
        await compileWithWebpackVersion(webpackVersion, "emptyObject_pluginConf");
      }),
      it("allows public path to be set on the fly when config is empty object", async () => {
        global.setWebpackPublicPath = true;
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "onTheFlyPublicPath");
        await compileWithWebpackVersion(webpackVersion, "emptyObject_pluginConf");
      }),
      it("replaces with a static path", async () => {
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "staticPath");
        await compileWithWebpackVersion(webpackVersion, "path_pluginConf");
      }),
      it("does not allow public path to be set on the fly when path is present", async () => {
        global.setWebpackPublicPath = true;
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "staticPath");
        await compileWithWebpackVersion(webpackVersion, "path_pluginConf");
      }),
      it("replaces with a result of methodName", async () => {
        global.getPublicPath = () => 'newPublicPath/'
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "newPublicPath");
        await compileWithWebpackVersion(webpackVersion, "methodName_pluginConf");
        global.getPublicPath = undefined;
      }),
      it("does not allow public path to be set on the fly when methodName is present", async () => {
        global.getPublicPath = () => 'newPublicPath/'
        global.setWebpackPublicPath = true;
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "newPublicPath");
        await compileWithWebpackVersion(webpackVersion, "methodName_pluginConf");
        global.getPublicPath = undefined;
      }),
      it("replaces with a result of variableName", async () => {
        global.publicPath = 'newPublicPath/'
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "newPublicPath");
        await compileWithWebpackVersion(webpackVersion, "variableName_pluginConf");
        global.publicPath = undefined;
      }),
      it("does not allow public path to be set on the fly if variableName is present", async () => {
        global.publicPath = 'newPublicPath/'
        global.setWebpackPublicPath = true;
        appendChildTrap = ({src}) => assert.strictEqual(src.split("/")[0], "newPublicPath");
        await compileWithWebpackVersion(webpackVersion, "variableName_pluginConf");
        global.publicPath = undefined;
      }),
      it("uses default public path when methodName is undefined", async () => {
        let originalConsoleError = console.error;
        let errorCalled = false;
        console.error = () => { errorCalled = true; }
        global.getPublicPath = undefined;
        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "originalPublicPath");
          assert.strictEqual(errorCalled, true);
        }
        await compileWithWebpackVersion(webpackVersion, "methodName_pluginConf");
        console.error = originalConsoleError;
      }),
      it("uses default public path when variableName is undefined", async () => {
        let originalConsoleError = console.error;
        let errorCalled = false;
        console.error = () => { errorCalled = true; }
        global.publicPath = undefined;
        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "originalPublicPath");
          assert.strictEqual(errorCalled, true);
        }
        await compileWithWebpackVersion(webpackVersion, "variableName_pluginConf");
        console.error = originalConsoleError;
      }),
      it("uses default windows public path when methodName is undefined", async () => {
        let originalConsoleError = console.error;
        console.error = () => {}
        global.getPublicPath = undefined;

        const config = cloneDeep(webpackConfigurations[webpackVersion]["methodName_pluginConf"]);
        config.output.publicPath = "C:\\windows\\path\\"

        appendChildTrap = ({src}) => assert.ok(src.match(/C:\\windows\\path\\.*/));

        await compile(
          require(`../${webpackVersion}/node_modules/webpack`),
          config,
          new memoryFS()
        )
        console.error = originalConsoleError;
      }),
      it("uses default windows public path when variableName is undefined", async () => {
        let originalConsoleError = console.error;
        console.error = () => {}
        global.publicPath = undefined;

        const config = cloneDeep(webpackConfigurations[webpackVersion]["variableName_pluginConf"]);
        config.output.publicPath = "C:\\windows\\path\\";

        appendChildTrap = ({src}) => assert.ok(src.match(/C:\\windows\\path\\.*/));

        await compile(
          require(`../${webpackVersion}/node_modules/webpack`),
          config,
          new memoryFS()
        )
        console.error = originalConsoleError;
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
      it("uses default public path when replaceSrcMethodName doesn't return a string", async () => {
        let originalConsoleError = console.error;
        let errorCalled = false;
        console.error = () => { errorCalled = true; }
        global.getSrc = (original) => null
        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "originalPublicPath");
          assert.strictEqual(errorCalled, true);
        }
        await compileWithWebpackVersion(webpackVersion, "replaceSrcMethodName_pluginConf");
        global.getSrc = undefined;
        console.error = originalConsoleError;
      }),
      it("uses default public path when replaceSrcMethodName is undefined", async () => {
        let originalConsoleError = console.error;
        console.error = () => {}
        global.getSrc = undefined;
        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "originalPublicPath");
        }
        await compileWithWebpackVersion(webpackVersion, "replaceSrcMethodName_pluginConf");
        console.error = originalConsoleError;
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
      it("replaces with result of variableName > replaceSrcMethodName", async () => {
        global.publicPath = 'newPublicPath/'
        global.getSrc = (original) => `newSrc/${original}`
        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "newSrc");
          assert.strictEqual(src.split("/")[1], "newPublicPath");
        }
        await compileWithWebpackVersion(webpackVersion, "replaceSrcMethodName_variableName_pluginConf");
        global.getSrc = global.publicPath = undefined;
      }),
      it("replaces with result of path > replaceSrcMethodName", async () => {
        global.getSrc = (original) => `newSrc/${original}`
        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "newSrc");
          assert.strictEqual(src.split("/")[1], "staticPath");
        }
        await compileWithWebpackVersion(webpackVersion, "replaceSrcMethodName_path_pluginConf");
        global.getSrc = global.getPublicPath = global.publicPath = undefined;
      }),
      it("replaces with result of methodName together with HTMLWebPack plugin", async () => {
        global.getPublicPath = () => 'newPublicPath/'

        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "newPublicPath");
        }

        // html-webpack-plugn requires webpack (and embedded mplugins) relatively to its location
        const htmlWebpackPlugin= require(`../${webpackVersion}/node_modules/html-webpack-plugin/`)
        const config = cloneDeep(webpackConfigurations[webpackVersion]["methodName_pluginConf"]);
        config.plugins.unshift(new htmlWebpackPlugin());

        await compile(
          require(`../${webpackVersion}/node_modules/webpack`),
          config,
          new memoryFS()
        )
        global.getPublicPath = undefined;
      }),
      it("replaces with result of variableName together with HTMLWebPack plugin", async () => {
        global.publicPath = 'newPublicPath/'

        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "newPublicPath");
        }

        // html-webpack-plugn requires webpack (and embedded mplugins) relatively to its location
        const htmlWebpackPlugin= require(`../${webpackVersion}/node_modules/html-webpack-plugin/`)
        const config = cloneDeep(webpackConfigurations[webpackVersion]["variableName_pluginConf"]);
        config.plugins.unshift(new htmlWebpackPlugin());

        await compile(
          require(`../${webpackVersion}/node_modules/webpack`),
          config,
          new memoryFS()
        )
        global.publicPath = undefined;
      }),
      it("replaces with result of replaceSrcMethodName together with HTMLWebPack plugin", async () => {
        global.getSrc = (original) => `newSrc/${original}`

        appendChildTrap = ({src}) => {
          assert.strictEqual(src.split("/")[0], "newSrc");
        }

        // html-webpack-plugn requires webpack (and embedded mplugins) relatively to its location
        const htmlWebpackPlugin= require(`../${webpackVersion}/node_modules/html-webpack-plugin/`)
        const config = cloneDeep(webpackConfigurations[webpackVersion]["replaceSrcMethodName_pluginConf"]);
        config.plugins.unshift(new htmlWebpackPlugin());

        await compile(
          require(`../${webpackVersion}/node_modules/webpack`),
          config,
          new memoryFS()
        )
        global.getSrc = undefined;
      }),
      it("suppresses errors when methodName is undefined", async () => {
        const originalConsoleError = console.error;

        let errorCalled = false;
        console.error = () => { errorCalled = true; }

        global.getPublicPath = undefined;
        appendChildTrap = () => {}

        const config = cloneDeep(webpackConfigurations[webpackVersion].default);
        config.plugins= [new WebpackRequireFrom({ suppressErrors: true, methodName: "getPublicPath" })]

        await compile(
          require(`../${webpackVersion}/node_modules/webpack`),
          config,
          new memoryFS()
        )

        assert.strictEqual(errorCalled, false);
        console.error = originalConsoleError;
      }),
      it("suppresses errors when variableName is undefined", async () => {
        const originalConsoleError = console.error;

        let errorCalled = false;
        console.error = () => { errorCalled = true; }

        global.publicPath = undefined;
        appendChildTrap = () => {}

        const config = cloneDeep(webpackConfigurations[webpackVersion].default);
        config.plugins= [new WebpackRequireFrom({ suppressErrors: true, variableName: "publicPath" })]

        await compile(
          require(`../${webpackVersion}/node_modules/webpack`),
          config,
          new memoryFS()
        )

        assert.strictEqual(errorCalled, false);
        console.error = originalConsoleError;
      }),
      it("suppresses errors when replaceSrcMethodName is undefined", async () => {
        const originalConsoleError = console.error;
        let errorCalled = false;
        console.error = (err) => { errorCalled = true; }
        
        global.getSrc = undefined;
        appendChildTrap = () => {}

        const config = cloneDeep(webpackConfigurations[webpackVersion].default);
        config.plugins= [new WebpackRequireFrom({ supressErrors: true, replaceSrcMethodName: "getSrc" })]
        await compile(
          require(`../${webpackVersion}/node_modules/webpack`),
          config,
          new memoryFS()
        )

        assert.strictEqual(errorCalled, false);
        console.error = originalConsoleError;
      })
    ]
  )
  )
})