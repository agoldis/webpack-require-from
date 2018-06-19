[![npm version](https://badge.fury.io/js/webpack-require-from.svg)](https://badge.fury.io/js/webpack-require-from)
[![CircleCI](https://circleci.com/gh/agoldis/webpack-require-from.svg?style=svg)](https://circleci.com/gh/agoldis/webpack-require-from)
# webpack-require-from
Webpack plugin that allows to configure the path / URL for fetching dynamic imports

* Compatible with webpack 4, 3, 2
* Lightweight
* No dependencies
* Tested
* Production-ready

# Why is it helpful?
Webpack allows to atomatically split code using [`require.ensure`](https://webpack.js.org/api/module-methods/#require-ensure) or [dynamic import](https://webpack.js.org/guides/code-splitting/#dynamic-imports) `import()`. The modules are organized into chunks automatically and extracted from your main bundle. Those chunks are fetched on-demand when your main bundle is run.

The chunks are loaded from a static URL which is determined by `config.output.publicPath` entry of webpack configuration. 

Sometimes the URL for loading chunks needs to be changed, for example:
* Chunks are hosted at a CDN
* Different environments use different URLs for loading assets (production, staging, qa)
* Your `index` file is served from a different location / port
* You need to dynamically load pre-compiled files from a different location

# How to use
```javascript
// webpack.config.js
const WebpackRequireFrom = require('webpack-require-from')
const webpackRequireFromConfig = {
  // see configuration options below
}
module.exports = {
    output: {
      publicPath: '/webpack/'
    },
    plugins: [
      new WebpackRequireFrom(webpackRequireFromConfig)
    ]
}
```

# Configuration
If no options provided, the default `config.output.publicPath` will be used.

## `path`
Set path for dynamically loading modules. The value you provide will replace `config.output.publicPath` when dynamically importing chunks. 

For example, if default URL is `https://localhost`, chunk name is `0.js` and options object is `{path: "customPath/" }`, the chunk will be fetched from `https://localhost/customPath/0.js`

> __NOTE__ `path` and `methodName` are mutualy exclusive and cannot be used together

## `methodName` 
Name of the globaly defined method that will be invoked at runtime, the method should return a path / URL that will be used for dynamically importing of chunks.

For example, if default URL is `https://localhost`, chunk name is `0.js` and options object is `{methodName: "getChunkURL" }`, while `window.getChunkURL` is defined to be:
```javascript
window.getChunkURL = function () {
  if (true) { // use any condition to choose the URL
    return 'https://app.cdn.com/buildXXX/'
  }
}
```
the chunk will be fetched from  `https://app.cdn.com/buildXXX/0.js`

If used together with `replaceSrcMethodName`, chunks URL will be first modified by `window[methodName]` and then, the modified values are passed as an argument to `window[replaceSrcMethodName]` function.

> __NOTE__ `path` and `methodName` are mutualy exclusive and cannot be used together

> __NOTE__ that the method should be defined in a global namespace and should be defined before `require.ensure` or `import()` is invoked. See examples below

## `replaceSrcMethodName` 
Name of the globaly defined method that will be invoked at runtime; the method receives the **full URL** of the dynamically required chunk as its argument and should return a `string` with the new URL.

For example, if default URL is `https://localhost`, chunk names are `0.js` and `common.js`, options object is `{replaceSrcMethodName: "replaceSrc" }`, while `window.replaceSrc` is defined to be:
```javascript
window.replaceSrc = function (originalSrc) {
  if (originalSrc.match(/common/)) {
    // rename specific chunk
    return originalSrc.replace(/common/, 'static');
  }
  return originalSrc;
}
```
the chunks will be fetched from `https://localhost/0.js` and `https://localhost/static.js` 

If used together with `methodName`, chunks URL will be first modified by `window[methodName]` and then, the modified values are passed as an argument to `window[replaceSrcMethodName]` function.

> __NOTE__ that the method should be defined in a global namespace and should be defined before `require.ensure` or `import()` is invoked.

## Defining gobaly available methods

When your JS code is executed in browser, the methods whose names you mention as `methodName` or `replaceSrcMethodName` value, should be set __before__ the first call to `require.ensure()` or `import()` is executed.

The return value of the methods will be used to build the  URL for fetching resources.

For example, let's define `veryFirst` method to be globally available before you main bundle is being executed.

Add the method definition at the very first line of you bundle:
```javascript
const window.veryFirst = function () {
 console.log("I am very first!");
}
```

You can use a separate file and use `webpack`'s [entry point list](https://webpack.js.org/configuration/entry-context/#entry):
```javascript
// filename: veryFirst.js
const window.veryFirst = function () {
 console.log("I am very first!");
}

// file webpack.config.js
module.exports = {
  entry: {
    ['./veryFirst.js', './index.js']
  }
}
```

Another approach is to define `veryFirst` as part of `index.html` when building it on your server:
```javascript
// filename: server/app.js
app.get('/', (req, res) => res.render('views/index', {
  cdnPath: 'https://qa.cdn.com/|https://prod.cdn.com/'
}));
```

```HTML
<!-- filename: views/index.ejs -->
<html>
<script>
  const baseCDN = "<%= cdnPath %>";
  window.veryFirst = function () {
      console.log(`${baseCDN}/js/`);
  }
</script>
...
</html>
```

# Troubleshooting
> `${methodName} is not a function or not available at runtime.`

* Make sure your method name in `webpack.config.js` matches the method name you define on global `window` object.

* Make sure the method is defined **before** the very first invocation of either `require.ensure()` or `import()`
> `Specify either "methodName" or "path", not together.`

* `path` and `methodName` are mutualy exclusive and cannot be used together, use either of them

> `'${methodName}' does not return string.`

* when using `replaceSrcMethodName` options the result of invoking `window[replaceSrcMethodName]` is validated - it 
should be defined and be a string

* make sure you return a string value from `window[replaceSrcMethodName]`


Don't hesitate to open issues.

# Tests
`yarn test`

