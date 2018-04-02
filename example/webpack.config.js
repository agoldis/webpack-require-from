const HtmlWebpackPlugin = require('html-webpack-plugin')
const RequireFrom = require('../');

module.exports = {
	"output": {
		"filename": "main.js"
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

