global.__replaceWebpackDynamicImport = function(path) {
  console.log("May be modifying path", path);
  return `${path}/modified`;
};
