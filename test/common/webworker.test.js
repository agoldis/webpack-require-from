const assert = require('assert');
const path = require('path');
const memoryFS = require('memory-fs');
const cloneDeep = require('lodash.clonedeep');

const WebpackRequireFrom = require('../..');
const webpackConfigurations = require('./webpack.config.shared');

const compile = (webpackEngine, config, fs) => {
  const compiler = webpackEngine(cloneDeep(config));
  compiler.outputFileSystem = fs;
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        reject(new Error(err || stats.compilation.errors));
      }
      const files = fs.readdirSync(webpackConfigurations.buildPath);
      const workerEntryFile = files.find((f) =>
        f.match(/^[a-zA-Z0-9]+\.worker\.js/)
      );
      const code = fs
        .readFileSync(`${webpackConfigurations.buildPath}/${workerEntryFile}`)
        .toString();
      eval(code);
      resolve(code);
    });
  });
};

['webpack4'].map((webpackVersion) => {
  describe(`${webpackVersion} only`, () => {
    describe('Web workers', () => {
      it('replaces path for web workers', async () => {
        const fs = new memoryFS();
        console.error = () => {};

        let importPath, workerChunkName;
        global.getSrc = (path) => {
          workerChunkName = path;
          return `https://custom.com/${workerChunkName}`;
        };
        global.importScripts = function importScripts(path) {
          importPath = path;
        };

        global.Worker = function (path) {
          eval(
            fs
              .readFileSync(`${webpackConfigurations.buildPath}/${path}`)
              .toString()
          ).run();
        };

        const config = {
          mode: 'development',
          entry: {
            main: './test/common/src/index.js',
          },
          output: {
            filename: '[name].js',
            chunkFilename: '[name].js',
            path: webpackConfigurations.buildPath,
            globalObject: 'global',
          },
          module: {
            rules: [
              {
                test: /worker\.js$/,
                use: {
                  loader: path.resolve(
                    `test/${webpackVersion}/node_modules/worker-loader`
                  ),
                },
              },
            ],
          },
          plugins: [
            new WebpackRequireFrom({
              replaceSrcMethodName: 'getSrc',
            }),
          ],
        };

        await compile(
          require(`../${webpackVersion}/node_modules/webpack`),
          config,
          fs
        );

        assert.strictEqual(importPath, `https://custom.com/${workerChunkName}`);
      });
    });
  });
});
