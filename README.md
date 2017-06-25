# webpack-require-from
Webpack plugin that allows to change the path / URL for requiring chunks at runtime

# Why is it needed?
Webpack allows to split code using `require.ensure` in to several chunks, which will be loaded at the runtime and executed. URL used to load the chunks is static and determined by `config.output.publicPath` entry of webpack configuration.

Sometime the source for loading chunks needs to be changed, for example:
* Chunks are hosted at a CDN
* Different environments use different URLs for loading assets (production, staging, qa)
* Your `index` file is served from a different location / port

# How to use
```javascript
// webpack.config.js
const WebpackRequireFrom = require('webpack-require-from')

module.exports = {
    output: {
      publicPath: '/webpack/'
    },
    plugins: [
      new WebpackRequireFrom(webpackRequireFromConfig)
    ]
}
```

The configuration object may have either of the options:
* `path` - set static path for loading chunks
* `methodName` - set method name that will be invoked at runtime, the method should return a path / URL that chunks will be loaded from.
__NOTE__, that the method should be defined in a global namespace and should be defined before `require.ensure` is invoked.

If no options provided, the default `config.output.publicPath` will be used.

# Examples
## Production CDN is different from `QA` or `staging` CDN URL
In your webpack config, plug the plug-in:
```
...
plugins: {
    new WebpackRequireFrom({
      methodName: '__cdnJSPath'
    })
}
...
```
Now, you need to ensure that `__cdnJSPath` is defined and set in global scope to a proper value when you JS code is executed in browser, this variable / method should be set __before__ the first call to `require.ensure` or `import` is executed by webpack.
The value / return value of the variable / method defines the URL that will be used by webpack to fetch on-demand resources.

For example, in the very first line of you bundle:
```javascript
const window.__cdnJSPath = function () {
 // return URL bases on your applicaion logic
}
```

Another approach is to set `__cdnJSPath` value at backend when creating `index.html` file.
