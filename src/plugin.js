const { PLUGIN_NAME, REPLACE_SRC_OPTION_NAME, SUPPRESS_ERRORS_OPTION_NAME } = require("./constants");
const { getOrSetHookMethod } = require("./helpers");
const {
  buildSrcReplaceCode,
  buildMethodCode,
  buildStringCode
} = require("./codeBuilders");

class WebpackRequireFrom {
  constructor(userOptions) {

    // temp fix to support typo in option name
    if (userOptions && typeof userOptions.supressErrors !== 'undefined') {
      userOptions[SUPPRESS_ERRORS_OPTION_NAME] = userOptions.supressErrors;
    }

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
    getOrSetHookMethod(compiler, "compilation")(this.compilationHook.bind(this));
  }

  compilationHook({ mainTemplate }) {
    this.activateReplacePublicPath(mainTemplate);

    if (this.options[REPLACE_SRC_OPTION_NAME]) {
      this.activateReplaceSrc(mainTemplate);
    }
  }

  activateReplaceSrc(mainTemplate) {
    getOrSetHookMethod(mainTemplate, "jsonp-script")(source => [
      source,
      `script.src = (${buildSrcReplaceCode(
        this.options[REPLACE_SRC_OPTION_NAME],
        this.options[SUPPRESS_ERRORS_OPTION_NAME]
      )})(script.src);`
    ].join("\n"));
  }

  activateReplacePublicPath(mainTemplate) {
    getOrSetHookMethod(mainTemplate, "require-extensions")((source, chunk, hash) => {
      const defaultPublicPath = mainTemplate.getPublicPath({
        hash
      });

      const _config = Object.assign({ path: defaultPublicPath }, this.options);

      let getterBody;
      if (_config.methodName) {
        getterBody = buildMethodCode(_config.methodName, defaultPublicPath, this.options[SUPPRESS_ERRORS_OPTION_NAME]);
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

WebpackRequireFrom.prototype.defaultOptions = {
};

module.exports = WebpackRequireFrom;
