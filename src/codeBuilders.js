const { PLUGIN_NAME } = require("./constants");

exports.buildSrcReplaceCode = function(methodName) {
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
    "  console.error(e);",
    `  return originalSrc;`,
    "}",
    "}"
  ].join("\n");
};

exports.buildStringCode = function(pathString) {
  return `return "${pathString}";`;
};

exports.buildMethodCode = function(methodName, defaultPublicPath) {
  return [
    "try {",
    `  if (typeof ${methodName} !== "function") {`,
    `    throw new Error("${PLUGIN_NAME}: '${methodName}' is not a function or not available at runtime. See https://github.com/agoldis/webpack-require-from#troubleshooting");`,
    "  }",
    `  return ${methodName}();`,
    "} catch (e) {",
    "  console.error(e);",
    `  return "${defaultPublicPath}";`,
    "}"
  ].join("\n");
};
