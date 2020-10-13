const assert = require('assert');
const { fs } = require('memfs');
const memoryFS = require('memory-fs');
const cloneDeep = require('lodash.clonedeep');

const WebpackRequireFrom = require('../..');
const webpackConfigurations = require('./webpack.config.shared');

let appendChildTrap;

const originalConsoleError = console.error;

const createGlobalEnv = function () {
  // create micro browser-like environment for the tests
  // global.setTimeout = () => {};
  global.window = {};
  appendChildTrap = () => {};
  getAttributeTrap = () => {};
  setAttributeTrap = () => {};

  global.document = {
    head: { appendChild: appendChildTrap },
    createElement: () => ({
      src: {},
      getAttribute: getAttributeTrap,
      setAttribute: setAttributeTrap,
    }),
    getElementsByTagName: () => [
      {
        appendChild: appendChildTrap,
        getAttribute: getAttributeTrap,
        setAttribute: setAttributeTrap,
      },
    ],
  };
  global.setWebpackPublicPath = false;
  global.onTheFlyPublicPath = 'onTheFlyPublicPath/';
  global.getSrc = global.getPublicPath = global.publicPath = undefined;
};

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
      eval(code);
      resolve(code);
    });
  });
};

const compileWithWebpackVersion = (webpackVersion, configName) =>
  compile(
    require(`../${webpackVersion}/node_modules/webpack`),
    webpackConfigurations[webpackVersion][configName],
    new memoryFS()
  );

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
describe('webpack-require-from', function () {
  const documentRegex = /var originalScript = \(function \(document\) \{/;
  const jsonpRegex = /var original_jsonpScriptSrc = jsonpScriptSrc/;

  beforeEach(() => {
    createGlobalEnv();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });
  describe('Configuration', function () {
    it('throws when two of more of [path, methodName, variableName] are defined', () => {
      try {
        new WebpackRequireFrom({ path: 'some', methodName: 'thing' });
        throw new Error(
          'should throw when two of more of [path, methodName, variableName] are defined'
        );
      } catch (e) {}
    });
    it('throws when two of more of [path, methodName, variableName] are defined', () => {
      try {
        new WebpackRequireFrom({ path: 'some', variableName: 'thing' });
        throw new Error(
          'should throw when two of more of [path, methodName, variableName] are defined'
        );
      } catch (e) {}
    });
    it('throws when two of more of [path, methodName, variableName] are defined', () => {
      try {
        new WebpackRequireFrom({ variableName: 'some', methodName: 'thing' });
        throw new Error(
          'should throw when two of more of [path, methodName, variableName] are defined'
        );
      } catch (e) {}
    });
  });

  describe('Monkey Patching', () => {
    it('Patches jsonpScriptSrc for webpack4', async () => {
      global.getSrc = () => '/';
      const code = await compileWithWebpackVersion(
        'webpack4',
        'replaceSrcMethodName_pluginConf'
      );
      // jsonpScriptSrc patch exist
      assert(code.match(jsonpRegex));
      // document.createElement does not exist
      assert(!code.match(documentRegex));
    });

    it('Patches document.createElement for webpack < 4', async () => {
      global.getSrc = () => '/';
      const code3 = await compileWithWebpackVersion(
        'webpack3',
        'replaceSrcMethodName_pluginConf'
      );

      const code2 = await compileWithWebpackVersion(
        'webpack2',
        'replaceSrcMethodName_pluginConf'
      );

      // jsonpScriptSrc patch exist
      assert(!code3.match(jsonpRegex));
      assert(!code2.match(jsonpRegex));
      // document.createElement does not exist
      assert(code3.match(documentRegex));
      assert(code2.match(documentRegex));
    });
  });

  Array.of('webpack2', 'webpack3', 'webpack4', 'webpack5').map(
    (webpackVersion) =>
      // Array.of('webpack5').map((webpackVersion) =>
      describe(webpackVersion, () => {
        it('does nothing when config is empty', async () => {
          appendChildTrap = ({ src }) =>
            assert.strictEqual(src.split('/')[0], 'originalPublicPath');
          await compileWithWebpackVersion(webpackVersion, 'empty_pluginConf');
        });
        it('allows public path to be set on the fly when config is empty', async () => {
          global.setWebpackPublicPath = true;
          appendChildTrap = ({ src }) =>
            assert.strictEqual(src.split('/')[0], 'onTheFlyPublicPath');
          await compileWithWebpackVersion(webpackVersion, 'empty_pluginConf');
        });
        it('does nothing when config is empty object', async () => {
          appendChildTrap = ({ src }) =>
            assert.strictEqual(src.split('/')[0], 'originalPublicPath');
          await compileWithWebpackVersion(
            webpackVersion,
            'emptyObject_pluginConf'
          );
        });
        it('allows public path to be set on the fly when config is empty object', async () => {
          global.setWebpackPublicPath = true;
          appendChildTrap = ({ src }) =>
            assert.strictEqual(src.split('/')[0], 'onTheFlyPublicPath');
          await compileWithWebpackVersion(
            webpackVersion,
            'emptyObject_pluginConf'
          );
        });
        it('replaces with a static path', async () => {
          appendChildTrap = ({ src }) =>
            assert.strictEqual(src.split('/')[0], 'staticPath');
          await compileWithWebpackVersion(webpackVersion, 'path_pluginConf');
        });
        it('does not allow public path to be set on the fly when path is present', async () => {
          global.setWebpackPublicPath = true;
          appendChildTrap = ({ src }) =>
            assert.strictEqual(src.split('/')[0], 'staticPath');
          await compileWithWebpackVersion(webpackVersion, 'path_pluginConf');
        });
        it('replaces with a result of methodName', async () => {
          global.getPublicPath = () => 'newPublicPath/';
          appendChildTrap = ({ src }) =>
            assert.strictEqual(src.split('/')[0], 'newPublicPath');
          await compileWithWebpackVersion(
            webpackVersion,
            'methodName_pluginConf'
          );
        });
        it('does not allow public path to be set on the fly when methodName is present', async () => {
          global.getPublicPath = () => 'newPublicPath/';
          global.setWebpackPublicPath = true;
          appendChildTrap = ({ src }) =>
            assert.strictEqual(src.split('/')[0], 'newPublicPath');
          await compileWithWebpackVersion(
            webpackVersion,
            'methodName_pluginConf'
          );
        });
        it('replaces with a result of variableName', async () => {
          global.publicPath = 'newPublicPath/';
          appendChildTrap = ({ src }) =>
            assert.strictEqual(src.split('/')[0], 'newPublicPath');
          await compileWithWebpackVersion(
            webpackVersion,
            'variableName_pluginConf'
          );
        });
        it('does not allow public path to be set on the fly if variableName is present', async () => {
          global.publicPath = 'newPublicPath/';
          global.setWebpackPublicPath = true;
          appendChildTrap = ({ src }) =>
            assert.strictEqual(src.split('/')[0], 'newPublicPath');
          await compileWithWebpackVersion(
            webpackVersion,
            'variableName_pluginConf'
          );
        });
        it('uses default public path when methodName is undefined', async () => {
          let errorCalled = false;
          console.error = () => {
            errorCalled = true;
          };
          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'originalPublicPath');
            assert.strictEqual(errorCalled, true);
          };
          await compileWithWebpackVersion(
            webpackVersion,
            'methodName_pluginConf'
          );
        });
        it('uses default public path when variableName is undefined', async () => {
          let errorCalled = false;
          console.error = () => {
            errorCalled = true;
          };
          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'originalPublicPath');
            assert.strictEqual(errorCalled, true);
          };
          await compileWithWebpackVersion(
            webpackVersion,
            'variableName_pluginConf'
          );
        });
        it('uses default windows public path when methodName is undefined', async () => {
          console.error = () => {};

          const config = cloneDeep(
            webpackConfigurations[webpackVersion]['methodName_pluginConf']
          );
          config.output.publicPath = 'C:\\windows\\path\\';

          appendChildTrap = ({ src }) =>
            assert.ok(src.match(/C:\\windows\\path\\.*/));

          await compile(
            require(`../${webpackVersion}/node_modules/webpack`),
            config,
            new memoryFS()
          );
        });
        it('uses default windows public path when variableName is undefined', async () => {
          console.error = () => {};
          global.publicPath = undefined;

          const config = cloneDeep(
            webpackConfigurations[webpackVersion]['variableName_pluginConf']
          );
          config.output.publicPath = 'C:\\windows\\path\\';

          appendChildTrap = ({ src }) =>
            assert.ok(src.match(/C:\\windows\\path\\.*/));

          await compile(
            require(`../${webpackVersion}/node_modules/webpack`),
            config,
            new memoryFS()
          );
        });
        it('replaces with result of replaceSrcMethodName', async () => {
          global.getSrc = (original) => `newSrc/${original}`;
          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'newSrc');
            assert.strictEqual(src.split('/')[1], 'originalPublicPath');
          };
          await compileWithWebpackVersion(
            webpackVersion,
            'replaceSrcMethodName_pluginConf'
          );
        });
        it("uses default public path when replaceSrcMethodName doesn't return a string", async () => {
          let errorCalled = false;
          console.error = () => {
            errorCalled = true;
          };
          global.getSrc = (original) => null;
          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'originalPublicPath');
            assert.strictEqual(errorCalled, true);
          };
          await compileWithWebpackVersion(
            webpackVersion,
            'replaceSrcMethodName_pluginConf'
          );
        });
        it('uses default public path when replaceSrcMethodName is undefined', async () => {
          console.error = () => {};
          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'originalPublicPath');
          };
          await compileWithWebpackVersion(
            webpackVersion,
            'replaceSrcMethodName_pluginConf'
          );
        });
        it('replaces with result of methodName > replaceSrcMethodName', async () => {
          global.getPublicPath = () => 'newPublicPath/';
          global.getSrc = (original) => `newSrc/${original}`;
          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'newSrc');
            assert.strictEqual(src.split('/')[1], 'newPublicPath');
          };
          await compileWithWebpackVersion(
            webpackVersion,
            'replaceSrcMethodName_methodName_pluginConf'
          );
        });
        it('replaces with result of variableName > replaceSrcMethodName', async () => {
          global.publicPath = 'newPublicPath/';
          global.getSrc = (original) => `newSrc/${original}`;
          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'newSrc');
            assert.strictEqual(src.split('/')[1], 'newPublicPath');
          };
          await compileWithWebpackVersion(
            webpackVersion,
            'replaceSrcMethodName_variableName_pluginConf'
          );
        });
        it('replaces with result of path > replaceSrcMethodName', async () => {
          global.getSrc = (original) => `newSrc/${original}`;
          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'newSrc');
            assert.strictEqual(src.split('/')[1], 'staticPath');
          };
          await compileWithWebpackVersion(
            webpackVersion,
            'replaceSrcMethodName_path_pluginConf'
          );
        });
        it('replaces with result of methodName together with HTMLWebPack plugin', async () => {
          global.getPublicPath = () => 'newPublicPath/';

          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'newPublicPath');
          };

          // html-webpack-plugn requires webpack (and embedded mplugins) relatively to its location
          const htmlWebpackPlugin = require(`../${webpackVersion}/node_modules/html-webpack-plugin/`);
          const config = cloneDeep(
            webpackConfigurations[webpackVersion]['methodName_pluginConf']
          );
          config.plugins.unshift(new htmlWebpackPlugin());

          await compile(
            require(`../${webpackVersion}/node_modules/webpack`),
            config,
            new memoryFS()
          );
          global.getPublicPath = undefined;
        });
        it('replaces with result of variableName together with HTMLWebPack plugin', async () => {
          global.publicPath = 'newPublicPath/';

          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'newPublicPath');
          };

          // html-webpack-plugn requires webpack (and embedded mplugins) relatively to its location
          const htmlWebpackPlugin = require(`../${webpackVersion}/node_modules/html-webpack-plugin/`);
          const config = cloneDeep(
            webpackConfigurations[webpackVersion]['variableName_pluginConf']
          );
          config.plugins.unshift(new htmlWebpackPlugin());

          await compile(
            require(`../${webpackVersion}/node_modules/webpack`),
            config,
            new memoryFS()
          );
        });
        it('replaces with result of replaceSrcMethodName together with HTMLWebPack plugin', async () => {
          global.getSrc = (original) => `newSrc/${original}`;

          appendChildTrap = ({ src }) => {
            assert.strictEqual(src.split('/')[0], 'newSrc');
          };

          // html-webpack-plugn requires webpack (and embedded mplugins) relatively to its location
          const htmlWebpackPlugin = require(`../${webpackVersion}/node_modules/html-webpack-plugin/`);
          const config = cloneDeep(
            webpackConfigurations[webpackVersion][
              'replaceSrcMethodName_pluginConf'
            ]
          );
          config.plugins.unshift(new htmlWebpackPlugin());

          await compile(
            require(`../${webpackVersion}/node_modules/webpack`),
            config,
            new memoryFS()
          );
        });
        it('suppresses errors when methodName is undefined', async () => {
          let errorCalled = false;
          console.error = () => {
            errorCalled = true;
          };
          const config = cloneDeep(
            webpackConfigurations[webpackVersion].default
          );
          config.plugins = [
            new WebpackRequireFrom({
              suppressErrors: true,
              methodName: 'getPublicPath',
            }),
          ];

          await compile(
            require(`../${webpackVersion}/node_modules/webpack`),
            config,
            new memoryFS()
          );

          assert.strictEqual(errorCalled, false);
        });
        it('suppresses errors when variableName is undefined', async () => {
          let errorCalled = false;
          console.error = () => {
            errorCalled = true;
          };

          const config = cloneDeep(
            webpackConfigurations[webpackVersion].default
          );
          config.plugins = [
            new WebpackRequireFrom({
              suppressErrors: true,
              variableName: 'publicPath',
            }),
          ];

          await compile(
            require(`../${webpackVersion}/node_modules/webpack`),
            config,
            new memoryFS()
          );

          assert.strictEqual(errorCalled, false);
        });

        it('suppresses errors when replaceSrcMethodName is undefined', async () => {
          let errorCalled = false;
          console.error = (_) => {
            errorCalled = true;
          };

          const config = cloneDeep(
            webpackConfigurations[webpackVersion].default
          );
          config.plugins = [
            new WebpackRequireFrom({
              supressErrors: true,
              replaceSrcMethodName: 'getSrc',
            }),
          ];
          await compile(
            require(`../${webpackVersion}/node_modules/webpack`),
            config,
            new memoryFS()
          );

          assert.strictEqual(errorCalled, false);
        });
      })
  );
});
