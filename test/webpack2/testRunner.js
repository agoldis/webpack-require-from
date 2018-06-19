const trap = {};
Object.defineProperty(trap, "src", {
  set(value) {
    console.log("Webpack2 - customURL.com:", value);
    console.assert(value.indexOf("customURL.com") > 0);
  }
});

// override defaults to able to run tests
global.setTimeout = () => {};
global.window = {};
global.document = {
  createElement: () => trap,
  getElementsByTagName: () => [{ appendChild: () => {} }]
};

require("./build/main.js");
