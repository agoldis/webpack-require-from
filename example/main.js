/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var parentJsonpFunction = window["webpackJsonp"];
/******/ 	window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [], result;
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules, executeModules);
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 	};
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// objects to store loaded and loading chunks
/******/ 	var installedChunks = {
/******/ 		6: 0
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData === 0) {
/******/ 			return new Promise(function(resolve) { resolve(); });
/******/ 		}
/******/
/******/ 		// a Promise means "currently loading".
/******/ 		if(installedChunkData) {
/******/ 			return installedChunkData[2];
/******/ 		}
/******/
/******/ 		// setup Promise in chunk cache
/******/ 		var promise = new Promise(function(resolve, reject) {
/******/ 			installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 		});
/******/ 		installedChunkData[2] = promise;
/******/
/******/ 		// start chunk loading
/******/ 		var head = document.getElementsByTagName('head')[0];
/******/ 		var script = document.createElement('script');
/******/ 		script.type = 'text/javascript';
/******/ 		script.charset = 'utf-8';
/******/ 		script.async = true;
/******/ 		script.timeout = 120000;
/******/
/******/ 		if (__webpack_require__.nc) {
/******/ 			script.setAttribute("nonce", __webpack_require__.nc);
/******/ 		}
/******/ 		script.src = __webpack_require__.p + "" + chunkId + ".main.js";
/******/ 		var timeout = setTimeout(onScriptComplete, 120000);
/******/ 		script.onerror = script.onload = onScriptComplete;
/******/ 		function onScriptComplete() {
/******/ 			// avoid mem leaks in IE.
/******/ 			script.onerror = script.onload = null;
/******/ 			clearTimeout(timeout);
/******/ 			var chunk = installedChunks[chunkId];
/******/ 			if(chunk !== 0) {
/******/ 				if(chunk) {
/******/ 					chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
/******/ 				}
/******/ 				installedChunks[chunkId] = undefined;
/******/ 			}
/******/ 		};,script.src = (function(originalSrc) {
/******/ 		try {
/******/ 		  if (typeof replaceDynamicSrc !== "function") {
/******/ 		    throw new Error("WebpackRequireFrom: 'replaceDynamicSrc' is not a function or not available at runtime. See https://github.com/agoldis/webpack-require-from#troubleshooting");
/******/ 		  }
/******/ 		  var newSrc = replaceDynamicSrc(originalSrc);
/******/ 		  if (!newSrc || typeof newSrc !== 'string') {
/******/ 		    throw new Error("WebpackRequireFrom: 'replaceDynamicSrc' does not return string. See https://github.com/agoldis/webpack-require-from#troubleshooting");
/******/ 		  }
/******/ 		  return newSrc;
/******/ 		} catch (e) {
/******/ 		  console.error(e);
/******/ 		  return originalSrc;
/******/ 		}
/******/ 		})(script.src);
/******/ 		head.appendChild(script);
/******/
/******/ 		return promise;
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// on error function for async loading
/******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
/******/ 	// WebpackRequireFrom
/******/ 	Object.defineProperty(__webpack_require__, "p", {
/******/ 	  get: function () {
/******/ 	try {
/******/ 	  if (typeof setSDN !== "function") {
/******/ 	    throw new Error("WebpackRequireFrom: 'setSDN' is not a function or not available at runtime. See https://github.com/agoldis/webpack-require-from#troubleshooting");
/******/ 	  }
/******/ 	  return setSDN();
/******/ 	} catch (e) {
/******/ 	  console.error(e);
/******/ 	  return "";
/******/ 	}
/******/ 	 }
/******/ 	})
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
global.replaceDynamicSrc = function (src) {
	console.log("Manipulating ", src);
	return "https://see.network.panel/";
}

global.setSDN = function () {
	return "https://new.url/"
}

__webpack_require__.e/* require.ensure */(5).then((function () {
	const a = __webpack_require__(1);
	a.run();
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe)

__webpack_require__.e/* require.ensure */(0/* duplicate */).then((function () {
	const b = __webpack_require__(0);
	b.run();
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe)

__webpack_require__.e/* require.ensure */(3).then((function () {
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe)

__webpack_require__.e/* require.ensure */(2).then((function () {
 const c = __webpack_require__(2);
 const b = __webpack_require__(0);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe)

__webpack_require__.e/* require.ensure */(1).then((function () {
 const c = __webpack_require__(2);
 const b = __webpack_require__(0);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe)

__webpack_require__.e/* require.ensure */(0/* duplicate */).then((function (request) {
	const b = request('./b.js');
	b.run();
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe)


__webpack_require__.e/* import() */(4).then(__webpack_require__.bind(null, 5)).then(d => d.run()).catch(err => console.error('cannot load d', err));



/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })
/******/ ]);