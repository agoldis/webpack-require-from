const path = require("path");
let src;
const trap = {};
Object.defineProperty(trap, "src", {
  set(value) {
    src = value;
    console.assert(value.indexOf("customURL.com") > 0);
    console.log(`${process.argv[2]}:  👍🏻  ${value}`);
  },
  get() {
    return src;
  }
});

// override defaults to able to run tests
global.setTimeout = () => {};
global.window = {};
global.document = {
  createElement: () => trap,
  getElementsByTagName: () => [{ appendChild: () => {} }]
};

require(path.join("..", process.argv[2], "build", "main.js"));
