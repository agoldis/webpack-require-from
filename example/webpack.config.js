const HtmlWebpackPlugin = require("html-webpack-plugin");
const RequireFrom = require("../");
const path = require("path");

module.exports = {
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist/"),
    globalObject: "this"
  },
  entry: ["./globals.js", "./index.js"],
  mode: "development",
  module: {
    rules: [
      {
        test: /worker\.js$/,
        use: {
          loader: `worker-loader`
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html"
    }),
    new RequireFrom({
      // path: 'https://custom.domain',
      // variableName: "__globalCustomDomain",
      // methodName: "__globalCustomDomain",
      replaceSrcMethodName: "__replaceWebpackDynamicImport"
    })
  ]
};
