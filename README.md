# webpack-require-from
Webpack plugin that allows to configure the path / URL for fetching dynamic imports

* Compatible with webpack 4, 3, 2
* Lightweight
* No dependecies
* Tested
* Production-ready

# Why is it helpful?
Webpack allows to atomatically split code using [`require.ensure`](https://webpack.js.org/api/module-methods/#require-ensure) or [dynamic import](https://webpack.js.org/guides/code-splitting/#dynamic-imports) `import()`. By using those tools, chunks are automatically created from your code by webpack, they are not part of the main bundle and fetched on-demand when your main bunlde is executed.

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
The configuration object may have either one of the options:
* `path` - set path for dynamically loading modules. The value you provide will replace `config.output.publicPath` when dynamically importing modules.
* `methodName` - set method name that will be invoked at runtime, the method should return a path / URL that dynamically importing of modules.

> __NOTE__ that the method should be defined in a global namespace and should be defined before `require.ensure` or `import()` is invoked. See examples below.

If no options provided, the default `config.output.publicPath` will be used.

# Examples
## Using `methodName` option
In your webpack config, add the plug-in:
```
...
plugins: {
    new WebpackRequireFrom({
      methodName: '__cdnJSPath'
    })
}
...
```
Now, you need to ensure that `__cdnJSPath` method is defined in global scope before the dynamic loading is issued.

When your JS code is executed in browser, this  method should be set __before__ the first call to `require.ensure()` or `import()` is executed.

The return value of the method will be used to build the  URL for fetching resources.

For example, you can add the method definition at the very first line of you bundle:
```javascript
const window.__cdnJSPath = function () {
 // return URL based on your application logic
 if (window.stage === 'QA') {
   return 'https://qa.cdn.com/js/';
 }
 return 'https://prod.cdn.com/js/';
}
```

You can use a separate file and use `webpack`'s [entry point list](https://webpack.js.org/configuration/entry-context/#entry):
```javascript
// filename: setWebpackLoadPath.js
window.__cdnJSPath = function () {
  if (window.stage === 'QA') {
    return 'https://qa.cdn.com/js/';
  }
  return 'https://prod.cdn.com/js/';
}

// file webpack.config.js
module.exports = {
  entry: {
    ['./setWebpackLoadPath.js', './index.js']
  }
}
```

Another approach is to define `__cdnJSPath` as part of `index.html` when building it on your server:
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
  window.__cdnJSPath = function () {
      return `${baseCDN}/js/`;
  }
</script>
...
</html>
```

## Using `path` option
In your webpack config, add the plug-in:
```
...
plugins: {
    new WebpackRequireFrom({
      path: 'path/for/fetching'
    })
}
...
```

This simple setup will cause webpack issue request to `http(s)://doman/path/for/fetching/chunkname.js`

# Troubleshooting
> `${PLUGIN_NAME}: ${methodName} is not a function or not available at runtime.`

* Make sure your method name in `webpack.config.js` matches the method name you define on global `window` object.

* Make sure the method is defined **before** the very first invocation of either `require.ensure()` or `import()`

Don't hesitate to open issues.

# Tests
`yarn test`

