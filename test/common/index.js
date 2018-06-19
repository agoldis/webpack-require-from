global.__cdnUrl = function() {
  // return URL based on your application logic
  return "http://customURL.com/";
};

require.ensure(["./moduleB"], function(require) {
  const moduleB = require("./moduleB");
  moduleB.run();
});

import(/* webpackChunkName: "moduleC" */ "./moduleC")
  .then(moduleC => {
    moduleC.run();
  })
  .catch(error => "An error occurred while import()");
