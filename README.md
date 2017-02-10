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
* `methodName` - set method name that will be invoked at runtime, the method should return a path / URL that chunks will be loaded from. __NOTE__, that the method should be defined in a global namespace and should be defined before `require.ensure` is invoked.

If not options provided, the default `config.output.publicPath` will be used.
