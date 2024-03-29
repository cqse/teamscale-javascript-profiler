import { CollectorClient } from '../CollectorClient';

/**
 * The port for the control server.
 */
export const CONTROL_URL = 'http://localhost:7777';

/**
 * The mock source map for the tests.
 */
export const SOURCE_MAP = {
	version: 3,
	file: 'index.02ace207.js',
	sources: [
		'../../vite/dynamic-import-polyfill',
		'../../react/jsx-runtime',
		'../../src/App.tsx',
		'../../src/logo.svg',
		'../../src/main.tsx'
	],
	sourcesContent: [
		"const p = function polyfill(modulePath = '.', importFunctionName = '__import__') {\n    try {\n        self[importFunctionName] = new Function('u', `return import(u)`);\n    }\n    catch (error) {\n        const baseURL = new URL(modulePath, location);\n        const cleanup = (script) => {\n            URL.revokeObjectURL(script.src);\n            script.remove();\n        };\n        self[importFunctionName] = (url) => new Promise((resolve, reject) => {\n            const absURL = new URL(url, baseURL);\n            // If the module has already been imported, resolve immediately.\n            if (self[importFunctionName].moduleMap[absURL]) {\n                return resolve(self[importFunctionName].moduleMap[absURL]);\n            }\n            const moduleBlob = new Blob([\n                `import * as m from '${absURL}';`,\n                `${importFunctionName}.moduleMap['${absURL}']=m;`\n            ], { type: 'text/javascript' });\n            const script = Object.assign(document.createElement('script'), {\n                type: 'module',\n                src: URL.createObjectURL(moduleBlob),\n                onerror() {\n                    reject(new Error(`Failed to import: ${url}`));\n                    cleanup(script);\n                },\n                onload() {\n                    resolve(self[importFunctionName].moduleMap[absURL]);\n                    cleanup(script);\n                }\n            });\n            document.head.appendChild(script);\n        });\n        self[importFunctionName].moduleMap = {};\n    }\n};__VITE_IS_MODERN__&&p(\"/assets/\");",
		'import * as jsxRuntime from "/home/stahlbau/work/develop/teamscale-javascript-profiler/test/casestudies/vite-react-ts-coverable-app/node_modules/react/jsx-runtime.js"\nexport const jsx = jsxRuntime.jsx\nexport const jsxs = jsxRuntime.jsxs\nexport const Fragment = jsxRuntime.Fragment',
		'import React, { useState } from \'react\'\nimport logo from \'./logo.svg\'\nimport \'./App.css\'\n\nfunction logSomething(msg: string): void {\n  console.log(msg);\n}\n\nfunction computeC(x: number, y: number): number {\n  if (x > 0 || y > 0) {\n    return 0;\n  }\n\n  if (x > 10) {\n    return y + 2;\n  } else {\n    return y + 3;\n  }\n}\n\nfunction computeB(x: number, y: number): number {\n  if (x > 5) {\n    return y + 4;\n  } else if (x > 5 && y === 123) {\n    return y + 5;\n  } else {\n    return y + 6;\n  }\n}\n\nfunction computeA(x: number, y: number): number {\n  const b1 = computeB(x + 1, y);\n  const b2 = computeB(5, y);\n  const c1 = computeC(1, 1);\n  return b1 + b2 + c1;\n}\n\nfunction App() {\n  const [count, setCount] = useState(0)\n\n  const r = computeA(count, count);\n  logSomething("Hello New World!");\n\n  return (\n    <div className="App">\n      <header className="App-header">\n        <img src={logo} className="App-logo" alt="logo" />\n        <p>Hello Vite + React!</p>\n        <p>\n          <button onClick={() => setCount((count) => count + 1)}>\n            count is: {count} and r is: {r}\n          </button>\n        </p>\n        <p>\n          Edit <code>App.tsx</code> and save to test HMR updates. Fooo!\n        </p>\n        <p>\n          <a\n            className="App-link"\n            href="https://reactjs.org"\n            target="_blank"\n            rel="noopener noreferrer"\n          >\n            Learn React\n          </a>\n          {\' | \'}\n          <a\n            className="App-link"\n            href="https://vitejs.dev/guide/features.html"\n            target="_blank"\n            rel="noopener noreferrer"\n          >\n            Vite Docs\n          </a>\n        </p>\n      </header>\n    </div>\n  )\n}\n\nexport default App\n',
		'export default "__VITE_ASSET__ecc203fb__"',
		"import React from 'react'\nimport ReactDOM from 'react-dom'\nimport './index.css'\nimport App from './App'\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  document.getElementById('root')\n)\n"
	],
	names: [
		'modulePath',
		'importFunctionName',
		'Function',
		'error',
		'baseURL',
		'URL',
		'location',
		'cleanup',
		'script',
		'revokeObjectURL',
		'src',
		'remove',
		'url',
		'Promise',
		'resolve',
		'reject',
		'absURL',
		'self',
		'moduleMap',
		'moduleBlob',
		'Blob',
		'type',
		'Object',
		'assign',
		'document',
		'createElement',
		'createObjectURL',
		'[object Object]',
		'Error',
		'head',
		'appendChild',
		'p',
		'jsx',
		'jsxRuntime.jsx',
		'jsxs',
		'jsxRuntime.jsxs',
		'x',
		'y',
		'count',
		'setCount',
		'useState',
		'r',
		'computeB',
		'computeC',
		'msg',
		'log',
		'className',
		'alt',
		'onClick',
		'href',
		'target',
		'rel',
		'ReactDOM',
		'render',
		'React',
		'StrictMode',
		'App',
		'getElementById'
	],
	mappings:
		'mDAAU,SAAkBA,EAAa,IAAKC,EAAqB,uBAEtDA,GAAsB,IAAIC,SAAS,IAAK,0BAE1CC,SACGC,EAAU,IAAIC,IAAIL,EAAYM,UAC9BC,EAAWC,QACTC,gBAAgBD,EAAOE,OACpBC,eAENV,GAAuBW,GAAQ,IAAIC,SAAQ,CAACC,EAASC,WAChDC,EAAS,IAAIX,IAAIO,EAAKR,MAExBa,KAAKhB,GAAoBiB,UAAUF,UAC5BF,EAAQG,KAAKhB,GAAoBiB,UAAUF,UAEhDG,EAAa,IAAIC,KAAK,CACxB,uBAAuBJ,MACvB,GAAGf,gBAAiCe,UACrC,CAAEK,KAAM,oBACLb,EAASc,OAAOC,OAAOC,SAASC,cAAc,UAAW,CAC3DJ,KAAM,SACNX,IAAKL,IAAIqB,gBAAgBP,GACzBQ,YACW,IAAIC,MAAM,qBAAqBhB,QAC9BJ,IAEZmB,WACYV,KAAKhB,GAAoBiB,UAAUF,MACnCR,eAGPqB,KAAKC,YAAYtB,WAEzBP,GAAoBiB,UAAY,IAEvBa,CAAE,YCnCjB,MAAMC,EAAMC,MACNC,EAAOC,OCkBpB,WAAkBC,EAAWC,UACvBD,EAAI,EACCC,EAAI,EACFD,EAAI,GAAW,MAANC,EACXA,EAAI,EAEJA,EAAI,EAWf,mBACSC,EAAOC,GAAYC,WAAS,GAE7BC,EATKC,EASQJ,EATK,EADGD,EAUDC,GARfI,EAAS,EAAGL,GAxBzB,SAAkBD,EAAWC,UACvBD,EAAI,GAAKC,EAAI,EACR,EAGLD,EAAI,GACCC,EAAI,EAEJA,EAAI,EAiBFM,CAAS,EAAG,GAHzB,IAA6BN,EA1BPO,SAAAA,EAqCP,2BApCLC,IAAID,YAuCLE,UAAU,2BACLA,UAAU,gCACXpC,IC9CE,4BD8CSoC,UAAU,WAAWC,IAAI,6EAG/BC,QAAS,IAAMT,MAAoBD,EAAQ,2BACtCA,gBAAkBG,iIAQ7BK,UAAU,WACVG,KAAK,sBACLC,OAAO,SACPC,IAAI,+CAIL,aAECL,UAAU,WACVG,KAAK,yCACLC,OAAO,SACPC,IAAI,qDEjEhBC,EAASC,SACNC,EAAMC,uBACJC,QAEHhC,SAASiC,eAAe'
};

function timeout(ms: number): Promise<void>  {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calls the control api to dump the coverage and upload it.
 */
export async function postAndDumpCoverage() {
	const socket = await CollectorClient.openSocket('ws://localhost:1234');
	CollectorClient.postCoverage(socket, "/foo/bar.ts", 1, 31);
	await timeout(1000);
	await CollectorClient.requestCoverageDump(CONTROL_URL);
	await timeout(500);
}

