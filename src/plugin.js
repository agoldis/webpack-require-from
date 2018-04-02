const { PLUGIN_NAME, REPLACE_SRC_OPTION_NAME } = require("./constants");
const { getHookMethod } = require("./helpers");
const { SyncWaterfallHook } = require("tapable");
const {
  buildSrcReplaceCode,
  buildMethodCode,
  buildStringCode
} = require("./codeBuilders");

class WebpackRequireFrom {
  constructor(userOptions) {
    this.options = Object.assign(
      {},
      WebpackRequireFrom.defaultOptions,
      userOptions
    );

    if (this.options.methodName && this.options.path) {
      throw new Error(
        `${PLUGIN_NAME}: Specify either "methodName" or "path", not together. See https://github.com/agoldis/webpack-require-from#configuration`
      );
    }
  }

  apply(compiler) {
    getHookMethod(compiler, "compilation")(this.compilationHook.bind(this));
  }

  compilationHook({ mainTemplate }) {
    this.activateReplacePublicPath(mainTemplate);

    if (this.options[REPLACE_SRC_OPTION_NAME]) {
      this.activateReplaceSrc(mainTemplate);
    }
  }

  activateReplaceSrc(mainTemplate) {
    if (!getHookMethod(mainTemplate, "jsonp-script")) {
      mainTemplate.hooks.jsonpScript = new SyncWaterfallHook([
        "source",
        "chunk",
        "hash"
      ]);
    }

    getHookMethod(mainTemplate, "jsonp-script")(source => [
      source,
      `script.src = (${buildSrcReplaceCode(
        this.options[REPLACE_SRC_OPTION_NAME]
      )})(script.src);`
    ]);
  }

  activateReplacePublicPath(mainTemplate) {
    getHookMethod(mainTemplate, "require-extensions")((source, chunk, hash) => {
      const defaultPublicPath = mainTemplate.getPublicPath({
        hash
      });

      const _config = Object.assign({ path: defaultPublicPath }, this.options);

      let getterBody;
      if (_config.methodName) {
        getterBody = buildMethodCode(_config.methodName, defaultPublicPath);
      } else if (_config.path) {
        getterBody = buildStringCode(_config.path);
      }

      return [
        source,
        `// ${PLUGIN_NAME}`,
        "Object.defineProperty(" + mainTemplate.requireFn + ', "p", {',
        "  get: function () {",
        getterBody,
        " }",
        "})"
      ].join("\n");
    });
  }
}

WebpackRequireFrom.prototype.defaultOptions = {};

module.exports = WebpackRequireFrom;
