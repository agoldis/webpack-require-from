const { PLUGIN_NAME } = require("./constants");
const { SyncWaterfallHook } = require("tapable");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function dashToCamelCase(value) {
  const dashed = value.split("-");
  const cameled = dashed.map((el, i) => {
    if (i === 0) return el;
    return capitalizeFirstLetter(el);
  });
  return cameled.join("");
}

exports.getOrSetHookMethod = function(tapable, hookName) {
  if (tapable.plugin && tapable.plugin.name !== "deprecated") {
    // webpack < 4
    return tapable.plugin.bind(tapable, [hookName]);
  }
  const newHookName = dashToCamelCase(hookName);

  if (!tapable.hooks[newHookName]) {
    tapable.hooks.jsonpScript = new SyncWaterfallHook([
      "source",
      "chunk",
      "hash"
    ]);
  }

  return tapable.hooks[newHookName].tap.bind(
    tapable.hooks[newHookName],
    PLUGIN_NAME
  );
};
