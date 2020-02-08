const {
  PLUGIN_NAME,
  REPLACE_SRC_OPTION_NAME,
  SUPPRESS_ERRORS_OPTION_NAME,
  DISABLE_CSS_OPTION_NAME,
} = require("./constants");
const { getHook, isLegacyTapable } = require("./helpers");

const {
  buildSrcReplaceCodeWebworker,
  buildLegacySrcReplaceCode,
  buildSrcReplaceCode,
  buildMethodCode,
  buildStringCode,
  buildVariableCode
} = require("./codeBuilders");

class WebpackRequireFrom {
  constructor(userOptions) {
    // temp fix to support typo in option name
    if (userOptions && typeof userOptions.supressErrors !== "undefined") {
      userOptions[SUPPRESS_ERRORS_OPTION_NAME] = userOptions.supressErrors;
    }

    this.options = Object.assign(
      {},
      WebpackRequireFrom.defaultOptions,
      userOptions
    );

    // `path`, `methodName` and `variableName` are mutualy exclusive and cannot be used together
    this.exclusiveOptionLength = [
      this.options.methodName,
      this.options.path,
      this.options.variableName
    ].filter(_ => _).length;
    if (this.exclusiveOptionLength && this.exclusiveOptionLength !== 1) {
      throw new Error(
        `${PLUGIN_NAME}: Specify either "methodName", "path" or "variableName", not two or more. See https://github.com/agoldis/webpack-require-from#configuration`
      );
    }
  }

  apply(compiler) {
    getHook(compiler, "compilation")(this.compilationHook.bind(this));
  }

  compilationHook(compilation) {
    const { mainTemplate, name } = compilation;

    if(this.options[DISABLE_CSS_OPTION_NAME]) {
      // skip further execution for CSS compilation
      if(/\.(sa|sc|c)ss$/i.test(name))
        return;
    }

    // compilation.hooks.addEntry.tap(PLUGIN_NAME, (entry, name) => {
    //   console.log("this", this);
    //   console.log({ entry, name });
    //   if (entry.type === "single entry") {
    //     entry = MultiEntryPlugin.createDependency([
    //       this.options.entry,
    //       entry.request
    //     ]);
    //     console.log("Replaces single entry with multientry");
    //   }
    //   if (entry.type === "multi entry") {
    //     entry.dependencies.unshift(
    //       SingleEntryPlugin.createDependency(this.options.entry)
    //     );
    //     // entry = MultiEntryPlugin.createDependency([this.options.entry]);
    //     console.log("MultiEntry dep");
    //   }
    //   entry.stam = "Sdfsdf";
    // });
    // const self = this;
    // compilation.hooks.childCompiler.tap(PLUGIN_NAME, function(
    //   childCompiler,
    //   compilerName,
    //   index
    // ) {
    //   if (Array.isArray(childCompiler.options.entry)) {
    //     childCompiler.options.entry = [
    //       self.options.entry,
    //       ...childCompiler.options.entry
    //     ];
    //   } else {
    //     childCompiler.options.entry = [
    //       self.options.entry,
    //       childCompiler.options.entry
    //     ];
    //   }
    // });
    // only replace the public path if one of methodName, path or variableName was set
    if (this.exclusiveOptionLength > 0) {
      this.activateReplacePublicPath(mainTemplate);
    }

    if (
      this.options[REPLACE_SRC_OPTION_NAME] ||
      this.options["webWorkerModifier"]
    ) {
      this.activateReplaceSrc(mainTemplate);
    }
  }

  activateReplaceSrc(mainTemplate) {
    if (isLegacyTapable(mainTemplate)) {
      getHook(mainTemplate, "jsonp-script")(source =>
        buildLegacySrcReplaceCode(
          source,
          this.options[REPLACE_SRC_OPTION_NAME],
          this.options[SUPPRESS_ERRORS_OPTION_NAME]
        )
      );
    } else {
      const isWebWorker = mainTemplate.hooks.requireEnsure.taps.some(
        tap => tap.name === "WebWorkerMainTemplatePlugin"
      );
      if (isWebWorker) {
        getHook(mainTemplate, "local-vars")(source =>
          buildSrcReplaceCodeWebworker(
            source,
            this.options[REPLACE_SRC_OPTION_NAME],
            this.options[SUPPRESS_ERRORS_OPTION_NAME]
          )
        );
      } else {
        getHook(mainTemplate, "local-vars")(source =>
          buildSrcReplaceCode(
            source,
            this.options[REPLACE_SRC_OPTION_NAME],
            this.options[SUPPRESS_ERRORS_OPTION_NAME]
          )
        );
      }
    }
  }

  activateReplacePublicPath(mainTemplate) {
    getHook(mainTemplate, "require-extensions")((source, chunk, hash) => {
      const defaultPublicPath = mainTemplate.getPublicPath({
        hash
      });

      let getterBody;
      if (this.options.variableName) {
        getterBody = buildVariableCode(
          this.options.variableName,
          defaultPublicPath,
          this.options[SUPPRESS_ERRORS_OPTION_NAME]
        );
      } else if (this.options.methodName) {
        getterBody = buildMethodCode(
          this.options.methodName,
          defaultPublicPath,
          this.options[SUPPRESS_ERRORS_OPTION_NAME]
        );
      } else if (this.options.path) {
        getterBody = buildStringCode(this.options.path);
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
    [DISABLE_CSS_OPTION_NAME]: false,
};

module.exports = WebpackRequireFrom;
