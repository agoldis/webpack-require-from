const HtmlWebpackPlugin = require('html-webpack-plugin')
const RequireFrom = require('../');
const path = require('path');

module.exports = {
	"output": {
		"filename": "main.js",
		"path": path.resolve(__dirname, 'dist/')
	},
	"entry": "./index.js",
	// "mode": "development",
	"plugins": [
			new HtmlWebpackPlugin(),
			new	 RequireFrom({
				methodName: 'setSDN',
				// path: 'customPath/',
				replaceSrcMethodName: 'replaceDynamicSrc'
			})
	]
}

