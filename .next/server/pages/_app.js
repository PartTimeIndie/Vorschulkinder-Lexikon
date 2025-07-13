/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./components/FaviconManager.js":
/*!**************************************!*\
  !*** ./components/FaviconManager.js ***!
  \**************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FaviconManager)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _utils_imageCache__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/imageCache */ \"./utils/imageCache.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_utils_imageCache__WEBPACK_IMPORTED_MODULE_1__]);\n_utils_imageCache__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\nfunction FaviconManager() {\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{\n        (async ()=>{\n            try {\n                const base64 = await (0,_utils_imageCache__WEBPACK_IMPORTED_MODULE_1__.getCachedImage)(\"/websiteBaseImages/lexiconFavIcon.png\");\n                document.getElementById(\"dynamic-favicon\")?.setAttribute(\"href\", base64);\n                document.getElementById(\"dynamic-appleicon\")?.setAttribute(\"href\", base64);\n                document.getElementById(\"dynamic-shortcuticon\")?.setAttribute(\"href\", base64);\n            } catch (e) {\n            // fallback: do nothing\n            }\n        })();\n    }, []);\n    return null;\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL0Zhdmljb25NYW5hZ2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBa0M7QUFDbUI7QUFFdEMsU0FBU0U7SUFDdEJGLGdEQUFTQSxDQUFDO1FBQ1A7WUFDQyxJQUFJO2dCQUNGLE1BQU1HLFNBQVMsTUFBTUYsaUVBQWNBLENBQUM7Z0JBQ3BDRyxTQUFTQyxjQUFjLENBQUMsb0JBQW9CQyxhQUFhLFFBQVFIO2dCQUNqRUMsU0FBU0MsY0FBYyxDQUFDLHNCQUFzQkMsYUFBYSxRQUFRSDtnQkFDbkVDLFNBQVNDLGNBQWMsQ0FBQyx5QkFBeUJDLGFBQWEsUUFBUUg7WUFDeEUsRUFBRSxPQUFPSSxHQUFHO1lBQ1YsdUJBQXVCO1lBQ3pCO1FBQ0Y7SUFDRixHQUFHLEVBQUU7SUFDTCxPQUFPO0FBQ1QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9raW5kZXJsZXhpa29uLy4vY29tcG9uZW50cy9GYXZpY29uTWFuYWdlci5qcz83OTNmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgZ2V0Q2FjaGVkSW1hZ2UgfSBmcm9tICcuLi91dGlscy9pbWFnZUNhY2hlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZhdmljb25NYW5hZ2VyKCkge1xyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAoYXN5bmMgKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGJhc2U2NCA9IGF3YWl0IGdldENhY2hlZEltYWdlKCcvd2Vic2l0ZUJhc2VJbWFnZXMvbGV4aWNvbkZhdkljb24ucG5nJyk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R5bmFtaWMtZmF2aWNvbicpPy5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBiYXNlNjQpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkeW5hbWljLWFwcGxlaWNvbicpPy5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBiYXNlNjQpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkeW5hbWljLXNob3J0Y3V0aWNvbicpPy5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBiYXNlNjQpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgLy8gZmFsbGJhY2s6IGRvIG5vdGhpbmdcclxuICAgICAgfVxyXG4gICAgfSkoKTtcclxuICB9LCBbXSk7XHJcbiAgcmV0dXJuIG51bGw7XHJcbn0gIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsImdldENhY2hlZEltYWdlIiwiRmF2aWNvbk1hbmFnZXIiLCJiYXNlNjQiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwic2V0QXR0cmlidXRlIiwiZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/FaviconManager.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_FaviconManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/FaviconManager */ \"./components/FaviconManager.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_components_FaviconManager__WEBPACK_IMPORTED_MODULE_2__]);\n_components_FaviconManager__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_FaviconManager__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {}, void 0, false, {\n                fileName: \"D:\\\\gitrepros\\\\Vorschulkinder Lexikon\\\\pages\\\\_app.js\",\n                lineNumber: 7,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"D:\\\\gitrepros\\\\Vorschulkinder Lexikon\\\\pages\\\\_app.js\",\n                lineNumber: 8,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBK0I7QUFDMkI7QUFFMUQsU0FBU0MsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRTtJQUNyQyxxQkFDRTs7MEJBQ0UsOERBQUNILGtFQUFjQTs7Ozs7MEJBQ2YsOERBQUNFO2dCQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7O0FBRzlCO0FBRUEsaUVBQWVGLEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9raW5kZXJsZXhpa29uLy4vcGFnZXMvX2FwcC5qcz9lMGFkIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi4vc3R5bGVzL2dsb2JhbHMuY3NzJztcbmltcG9ydCBGYXZpY29uTWFuYWdlciBmcm9tICcuLi9jb21wb25lbnRzL0Zhdmljb25NYW5hZ2VyJztcblxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9KSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxGYXZpY29uTWFuYWdlciAvPlxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgIDwvPlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBNeUFwcDsgIl0sIm5hbWVzIjpbIkZhdmljb25NYW5hZ2VyIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./utils/imageCache.js":
/*!*****************************!*\
  !*** ./utils/imageCache.js ***!
  \*****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   clearCachedImage: () => (/* binding */ clearCachedImage),\n/* harmony export */   getCachedImage: () => (/* binding */ getCachedImage)\n/* harmony export */ });\n/* harmony import */ var idb_keyval__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! idb-keyval */ \"idb-keyval\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([idb_keyval__WEBPACK_IMPORTED_MODULE_0__]);\nidb_keyval__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n// Image Cache Utility for Base64-Caching in Local Storage with 7-day expiry\nconst DEFAULT_EXPIRY_DAYS = 7;\nfunction getCacheKey(url, version = \"\") {\n    return `imgcache_${url}_${version}`;\n}\nfunction getExpiryKey(url, version = \"\") {\n    return `imgcache_expiry_${url}_${version}`;\n}\nasync function getCachedImage(url, version = \"\", expiryDays = DEFAULT_EXPIRY_DAYS) {\n    const cacheKey = getCacheKey(url, version);\n    const expiryKey = getExpiryKey(url, version);\n    const now = Date.now();\n    try {\n        const expiry = await (0,idb_keyval__WEBPACK_IMPORTED_MODULE_0__.get)(expiryKey);\n        if (expiry && parseInt(expiry, 10) > now) {\n            const cached = await (0,idb_keyval__WEBPACK_IMPORTED_MODULE_0__.get)(cacheKey);\n            if (cached) return cached;\n        } else {\n            // Expired: Clean up\n            await (0,idb_keyval__WEBPACK_IMPORTED_MODULE_0__.del)(cacheKey);\n            await (0,idb_keyval__WEBPACK_IMPORTED_MODULE_0__.del)(expiryKey);\n        }\n    } catch (e) {\n        // IndexedDB may be unavailable\n        console.warn(\"ImageCache: IndexedDB not available\", e);\n    }\n    // Fetch and cache image as Base64\n    const response = await fetch(url);\n    if (!response.ok) throw new Error(\"Image download failed: \" + url);\n    const blob = await response.blob();\n    const base64 = await new Promise((resolve, reject)=>{\n        const reader = new FileReader();\n        reader.onloadend = ()=>resolve(reader.result);\n        reader.onerror = reject;\n        reader.readAsDataURL(blob);\n    });\n    try {\n        await (0,idb_keyval__WEBPACK_IMPORTED_MODULE_0__.set)(cacheKey, base64);\n        await (0,idb_keyval__WEBPACK_IMPORTED_MODULE_0__.set)(expiryKey, (now + expiryDays * 24 * 60 * 60 * 1000).toString());\n    } catch (e) {\n        // IndexedDB full or error\n        console.warn(\"ImageCache: IndexedDB full or error, cannot cache image\", e);\n    }\n    return base64;\n}\nasync function clearCachedImage(url, version = \"\") {\n    const cacheKey = getCacheKey(url, version);\n    const expiryKey = getExpiryKey(url, version);\n    await (0,idb_keyval__WEBPACK_IMPORTED_MODULE_0__.del)(cacheKey);\n    await (0,idb_keyval__WEBPACK_IMPORTED_MODULE_0__.del)(expiryKey);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi91dGlscy9pbWFnZUNhY2hlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUEyQztBQUUzQyw0RUFBNEU7QUFDNUUsTUFBTUcsc0JBQXNCO0FBRTVCLFNBQVNDLFlBQVlDLEdBQUcsRUFBRUMsVUFBVSxFQUFFO0lBQ3BDLE9BQU8sQ0FBQyxTQUFTLEVBQUVELElBQUksQ0FBQyxFQUFFQyxRQUFRLENBQUM7QUFDckM7QUFFQSxTQUFTQyxhQUFhRixHQUFHLEVBQUVDLFVBQVUsRUFBRTtJQUNyQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUVELElBQUksQ0FBQyxFQUFFQyxRQUFRLENBQUM7QUFDNUM7QUFFTyxlQUFlRSxlQUFlSCxHQUFHLEVBQUVDLFVBQVUsRUFBRSxFQUFFRyxhQUFhTixtQkFBbUI7SUFDdEYsTUFBTU8sV0FBV04sWUFBWUMsS0FBS0M7SUFDbEMsTUFBTUssWUFBWUosYUFBYUYsS0FBS0M7SUFDcEMsTUFBTU0sTUFBTUMsS0FBS0QsR0FBRztJQUVwQixJQUFJO1FBQ0YsTUFBTUUsU0FBUyxNQUFNYiwrQ0FBR0EsQ0FBQ1U7UUFDekIsSUFBSUcsVUFBVUMsU0FBU0QsUUFBUSxNQUFNRixLQUFLO1lBQ3hDLE1BQU1JLFNBQVMsTUFBTWYsK0NBQUdBLENBQUNTO1lBQ3pCLElBQUlNLFFBQVEsT0FBT0E7UUFDckIsT0FBTztZQUNMLG9CQUFvQjtZQUNwQixNQUFNZCwrQ0FBR0EsQ0FBQ1E7WUFDVixNQUFNUiwrQ0FBR0EsQ0FBQ1M7UUFDWjtJQUNGLEVBQUUsT0FBT00sR0FBRztRQUNWLCtCQUErQjtRQUMvQkMsUUFBUUMsSUFBSSxDQUFDLHVDQUF1Q0Y7SUFDdEQ7SUFFQSxrQ0FBa0M7SUFDbEMsTUFBTUcsV0FBVyxNQUFNQyxNQUFNaEI7SUFDN0IsSUFBSSxDQUFDZSxTQUFTRSxFQUFFLEVBQUUsTUFBTSxJQUFJQyxNQUFNLDRCQUE0QmxCO0lBQzlELE1BQU1tQixPQUFPLE1BQU1KLFNBQVNJLElBQUk7SUFDaEMsTUFBTUMsU0FBUyxNQUFNLElBQUlDLFFBQVEsQ0FBQ0MsU0FBU0M7UUFDekMsTUFBTUMsU0FBUyxJQUFJQztRQUNuQkQsT0FBT0UsU0FBUyxHQUFHLElBQU1KLFFBQVFFLE9BQU9HLE1BQU07UUFDOUNILE9BQU9JLE9BQU8sR0FBR0w7UUFDakJDLE9BQU9LLGFBQWEsQ0FBQ1Y7SUFDdkI7SUFFQSxJQUFJO1FBQ0YsTUFBTXhCLCtDQUFHQSxDQUFDVSxVQUFVZTtRQUNwQixNQUFNekIsK0NBQUdBLENBQUNXLFdBQVcsQ0FBQ0MsTUFBTUgsYUFBYSxLQUFLLEtBQUssS0FBSyxJQUFHLEVBQUcwQixRQUFRO0lBQ3hFLEVBQUUsT0FBT2xCLEdBQUc7UUFDViwwQkFBMEI7UUFDMUJDLFFBQVFDLElBQUksQ0FBQywyREFBMkRGO0lBQzFFO0lBRUEsT0FBT1E7QUFDVDtBQUVPLGVBQWVXLGlCQUFpQi9CLEdBQUcsRUFBRUMsVUFBVSxFQUFFO0lBQ3RELE1BQU1JLFdBQVdOLFlBQVlDLEtBQUtDO0lBQ2xDLE1BQU1LLFlBQVlKLGFBQWFGLEtBQUtDO0lBQ3BDLE1BQU1KLCtDQUFHQSxDQUFDUTtJQUNWLE1BQU1SLCtDQUFHQSxDQUFDUztBQUNaIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8va2luZGVybGV4aWtvbi8uL3V0aWxzL2ltYWdlQ2FjaGUuanM/MjRkMiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzZXQsIGdldCwgZGVsIH0gZnJvbSAnaWRiLWtleXZhbCc7XHJcblxyXG4vLyBJbWFnZSBDYWNoZSBVdGlsaXR5IGZvciBCYXNlNjQtQ2FjaGluZyBpbiBMb2NhbCBTdG9yYWdlIHdpdGggNy1kYXkgZXhwaXJ5XHJcbmNvbnN0IERFRkFVTFRfRVhQSVJZX0RBWVMgPSA3O1xyXG5cclxuZnVuY3Rpb24gZ2V0Q2FjaGVLZXkodXJsLCB2ZXJzaW9uID0gJycpIHtcclxuICByZXR1cm4gYGltZ2NhY2hlXyR7dXJsfV8ke3ZlcnNpb259YDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RXhwaXJ5S2V5KHVybCwgdmVyc2lvbiA9ICcnKSB7XHJcbiAgcmV0dXJuIGBpbWdjYWNoZV9leHBpcnlfJHt1cmx9XyR7dmVyc2lvbn1gO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q2FjaGVkSW1hZ2UodXJsLCB2ZXJzaW9uID0gJycsIGV4cGlyeURheXMgPSBERUZBVUxUX0VYUElSWV9EQVlTKSB7XHJcbiAgY29uc3QgY2FjaGVLZXkgPSBnZXRDYWNoZUtleSh1cmwsIHZlcnNpb24pO1xyXG4gIGNvbnN0IGV4cGlyeUtleSA9IGdldEV4cGlyeUtleSh1cmwsIHZlcnNpb24pO1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBleHBpcnkgPSBhd2FpdCBnZXQoZXhwaXJ5S2V5KTtcclxuICAgIGlmIChleHBpcnkgJiYgcGFyc2VJbnQoZXhwaXJ5LCAxMCkgPiBub3cpIHtcclxuICAgICAgY29uc3QgY2FjaGVkID0gYXdhaXQgZ2V0KGNhY2hlS2V5KTtcclxuICAgICAgaWYgKGNhY2hlZCkgcmV0dXJuIGNhY2hlZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEV4cGlyZWQ6IENsZWFuIHVwXHJcbiAgICAgIGF3YWl0IGRlbChjYWNoZUtleSk7XHJcbiAgICAgIGF3YWl0IGRlbChleHBpcnlLZXkpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIC8vIEluZGV4ZWREQiBtYXkgYmUgdW5hdmFpbGFibGVcclxuICAgIGNvbnNvbGUud2FybignSW1hZ2VDYWNoZTogSW5kZXhlZERCIG5vdCBhdmFpbGFibGUnLCBlKTtcclxuICB9XHJcblxyXG4gIC8vIEZldGNoIGFuZCBjYWNoZSBpbWFnZSBhcyBCYXNlNjRcclxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XHJcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKCdJbWFnZSBkb3dubG9hZCBmYWlsZWQ6ICcgKyB1cmwpO1xyXG4gIGNvbnN0IGJsb2IgPSBhd2FpdCByZXNwb25zZS5ibG9iKCk7XHJcbiAgY29uc3QgYmFzZTY0ID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiByZXNvbHZlKHJlYWRlci5yZXN1bHQpO1xyXG4gICAgcmVhZGVyLm9uZXJyb3IgPSByZWplY3Q7XHJcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTtcclxuICB9KTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHNldChjYWNoZUtleSwgYmFzZTY0KTtcclxuICAgIGF3YWl0IHNldChleHBpcnlLZXksIChub3cgKyBleHBpcnlEYXlzICogMjQgKiA2MCAqIDYwICogMTAwMCkudG9TdHJpbmcoKSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgLy8gSW5kZXhlZERCIGZ1bGwgb3IgZXJyb3JcclxuICAgIGNvbnNvbGUud2FybignSW1hZ2VDYWNoZTogSW5kZXhlZERCIGZ1bGwgb3IgZXJyb3IsIGNhbm5vdCBjYWNoZSBpbWFnZScsIGUpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJhc2U2NDtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQ2FjaGVkSW1hZ2UodXJsLCB2ZXJzaW9uID0gJycpIHtcclxuICBjb25zdCBjYWNoZUtleSA9IGdldENhY2hlS2V5KHVybCwgdmVyc2lvbik7XHJcbiAgY29uc3QgZXhwaXJ5S2V5ID0gZ2V0RXhwaXJ5S2V5KHVybCwgdmVyc2lvbik7XHJcbiAgYXdhaXQgZGVsKGNhY2hlS2V5KTtcclxuICBhd2FpdCBkZWwoZXhwaXJ5S2V5KTtcclxufSAiXSwibmFtZXMiOlsic2V0IiwiZ2V0IiwiZGVsIiwiREVGQVVMVF9FWFBJUllfREFZUyIsImdldENhY2hlS2V5IiwidXJsIiwidmVyc2lvbiIsImdldEV4cGlyeUtleSIsImdldENhY2hlZEltYWdlIiwiZXhwaXJ5RGF5cyIsImNhY2hlS2V5IiwiZXhwaXJ5S2V5Iiwibm93IiwiRGF0ZSIsImV4cGlyeSIsInBhcnNlSW50IiwiY2FjaGVkIiwiZSIsImNvbnNvbGUiLCJ3YXJuIiwicmVzcG9uc2UiLCJmZXRjaCIsIm9rIiwiRXJyb3IiLCJibG9iIiwiYmFzZTY0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkZW5kIiwicmVzdWx0Iiwib25lcnJvciIsInJlYWRBc0RhdGFVUkwiLCJ0b1N0cmluZyIsImNsZWFyQ2FjaGVkSW1hZ2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./utils/imageCache.js\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "idb-keyval":
/*!*****************************!*\
  !*** external "idb-keyval" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = import("idb-keyval");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.js"));
module.exports = __webpack_exports__;

})();