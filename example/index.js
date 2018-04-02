
global.replaceDynamicSrc = function (src) {
	console.log("Manipulating ", src);
	return "https://see.network.panel/";
}

global.setSDN = function () {
	return "https://new.url/"
}

require.ensure([], function () {
	const a = require('./a.js');
	a.run();
})

require.ensure(['./b.js'], function () {
	const b = require('./b.js');
	b.run();
})

require.ensure(['./c.js', './a.js'], function () {
})

require.ensure([], function () {
 const c = require('./c.js');
 const b = require('./b.js');
})

require.ensure(['./a.js'], function () {
 const c = require('./c.js');
 const b = require('./b.js');
})

require.ensure(['./b.js'], function (request) {
	const b = request('./b.js');
	b.run();
})


import('./d.js').then(d => d.run()).catch(err => console.error('cannot load d', err));


