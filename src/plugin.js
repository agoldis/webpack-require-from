const { PLUGIN_NAME } = require("./constants");
const { getHookMethod } = require("./helpers");

class WebpackRequireFrom {
  constructor(userOptions) {
    this.options = Object.assign(
      {},
      WebpackRequireFrom.defaultOptions,
      userOptions
    );
    if (this.options.methodName && this.options.path) {
      throw new Error(
        `${PLUGIN_NAME}: Specify either "methodName" or "path". See https://github.com/agoldis/webpack-require-from#configuration`
      );
    }
  }

  apply(compiler) {
    getHookMethod(compiler, "compilation")(this.compilationHook.bind(this));
  }

  buildStringCode(pathString) {
    return `return "${pathString}";`;
  }

  buildMethodCode(methodName, defaultPublicPath) {
    return [
      "try {",
      `  if (typeof ${methodName} !== "function") {`,
      `    throw new Error("${PLUGIN_NAME}: ${methodName} is not a function or not available at runtime. See https://github.com/agoldis/webpack-require-from#Troubleshooting");`,
      "  }",
      `  return ${methodName}();`,
      "} catch (e) {",
      "  console.error(e);",
      `  return "${defaultPublicPath}";`,
      "}"
    ].join("\n");
  }

  compilationHook(compilation, params) {
    getHookMethod(compilation.mainTemplate, "require-extensions")(
      (source, chunk, hash) => {
        const defaultPublicPath = compilation.mainTemplate.getPublicPath({
          hash
        });
        const _config = Object.assign(
          { path: defaultPublicPath },
          this.options
        );
        let getterBody;

        if (_config.methodName) {
          getterBody = this.buildMethodCode(
            _config.methodName,
            defaultPublicPath
          );
        } else if (_config.path) {
          getterBody = this.buildStringCode(_config.path);
        } else {
          throw new Error(
            `${PLUGIN_NAME}: cannot determine what method to use. See https://github.com/agoldis/webpack-require-from#configuration`
          );
        }
        return [
          source,
          `// ${PLUGIN_NAME}`,
          "Object.defineProperty(" +
            compilation.mainTemplate.requireFn +
            ', "p", {',
          "  get: function () {",
          getterBody,
          " }",
          "})"
        ].join("\n");
      }
    );
  }
}

WebpackRequireFrom.prototype.defaultOptions = {};

module.exports = WebpackRequireFrom;
