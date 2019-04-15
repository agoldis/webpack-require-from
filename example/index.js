require.ensure([], function() {
  const a = require("./a.js");
  a.run();
});

require.ensure(["./b.js"], function() {
  const b = require("./b.js");
  b.run();
});

import("./c.js")
  .then(c => c.run())
  .catch(err => console.error("cannot load d", err));

import(/* webpackChunkName: "worker" */ "./worker.js").then(w => w.default());
