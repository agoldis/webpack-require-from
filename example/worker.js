require("./globals.js");

import("./worker-module.js").then(workerModule => {
  workerModule.default();
  console.log("loaded workerModule");
});
