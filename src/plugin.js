const { PLUGIN_NAME, REPLACE_SRC_OPTION_NAME, SUPPRESS_ERRORS_OPTION_NAME } = require("./constants");
const { getOrSetHookMethod } = require("./helpers");
const {
  buildSrcReplaceCode,
  buildMethodCode,
  buildStringCode,
  buildVariableCode
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

    // `path`, `methodName` and `variableName` are mutualy exclusive and cannot be used together
    this.exclusiveOptionLength = [this.options.methodName, this.options.path, this.options.variableName].filter(_=>_).length;
    if (this.exclusiveOptionLength && this.exclusiveOptionLength !== 1) {
      throw new Error(
        `${PLUGIN_NAME}: Specify either "methodName", "path" or "variableName", not two or more. See https://github.com/agoldis/webpack-require-from#configuration`
      );
    }
  }

  apply(compiler) {
    getOrSetHookMethod(compiler, "compilation")(this.compilationHook.bind(this));
  }

  compilationHook({ mainTemplate }) {
    // only replace the public path if one of methodName, path or variableName was set
    if (this.exclusiveOptionLength > 0) {
      this.activateReplacePublicPath(mainTemplate);
    }

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

      const _config = this.options;

      let getterBody;
	  if (_config.variableName) {
        getterBody = buildVariableCode(_config.variableName, defaultPublicPath, this.options[SUPPRESS_ERRORS_OPTION_NAME]);
      } else if (_config.methodName) {
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
