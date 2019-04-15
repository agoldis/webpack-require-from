// setWebpackPublicPath and onTheFlyPublicPath are set in tests.js
if (setWebpackPublicPath) {
  __webpack_public_path__ = onTheFlyPublicPath;
}

require.ensure(["./moduleB"], function(require) {
  const moduleB = require("./moduleB");
  moduleB.run();
});

import(/* webpackChunkName: "moduleC" */ "./moduleC")
  .then(moduleC => {
    moduleC.run();
  })
  .catch(error => "An error occurred while import()");

import(/* webpackChunkName: "worker" */ "./worker").then(worker => {
  worker.default();
});
