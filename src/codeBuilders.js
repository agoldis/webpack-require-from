const { PLUGIN_NAME } = require("./constants");

exports.buildSrcReplaceCode = function(methodName, shouldSupressErrors = false) {
  return [
    "function(originalSrc) {",
    "try {",
    `  if (typeof ${methodName} !== "function") {`,
    `    throw new Error("${PLUGIN_NAME}: '${methodName}' is not a function or not available at runtime. See https://github.com/agoldis/webpack-require-from#troubleshooting");`,
    "  }",
    `  var newSrc = ${methodName}(originalSrc);`,
    "  if (!newSrc || typeof newSrc !== 'string') {",
    `    throw new Error("${PLUGIN_NAME}: '${methodName}' does not return string. See https://github.com/agoldis/webpack-require-from#troubleshooting");`,
    "  }",
    "  return newSrc;",
    "} catch (e) {",
    `  if (!${shouldSupressErrors}) {`,
    "    console.error(e);",
    "  }",
    `  return originalSrc;`,
    "}",
    "}"
  ].join("\n");
};

exports.buildStringCode = function(pathString) {
  return `return "${pathString}";`;
};

exports.buildMethodCode = function(methodName, defaultPublicPath, shouldSupressErrors = false) {
  return [
    "try {",
    `  if (typeof ${methodName} !== "function") {`,
    `    throw new Error("${PLUGIN_NAME}: '${methodName}' is not a function or not available at runtime. See https://github.com/agoldis/webpack-require-from#troubleshooting");`,
    "  }",
    `  return ${methodName}();`,
    "} catch (e) {",
    `  if (!${shouldSupressErrors}) {`,
    "    console.error(e);",
    "  }",
    `  return "${defaultPublicPath.replace(/\\/g, "\\\\")}";`,
    "}"
  ].join("\n");
};
