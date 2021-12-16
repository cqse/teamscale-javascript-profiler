/** $IS_JS_PROFILER_INSTRUMENTED=true **/ (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // ../../node_modules/detect-node/browser.js
  var require_browser = __commonJS({
    "../../node_modules/detect-node/browser.js"(exports, module) {
      module.exports = false;
    }
  });

  // (disabled):../../node_modules/unload/dist/es/node.js
  var require_node = __commonJS({
    "(disabled):../../node_modules/unload/dist/es/node.js"() {
    }
  });

  // inline-worker:__inline-worker
  function inlineWorker(scriptText) {
    let blob = new Blob([scriptText], { type: "text/javascript" });
    let url = URL.createObjectURL(blob);
    let worker = new Worker(url);
    URL.revokeObjectURL(url);
    return worker;
  }

  // src/vaccine/worker/vaccine.worker.ts
  function Worker2() {
    return inlineWorker('var n=class{constructor(t){this.cachedMessages=[];this.url=t,this.socket=this.createSocket()}createSocket(){let t=new WebSocket(this.url);return t.onopen=()=>this.onopen(),t.onclose=()=>this.onclose(),t}onclose(){this.socket=this.createSocket()}onopen(){this.cachedMessages.forEach(t=>this.socket.send(t)),this.cachedMessages=[]}send(t){this.socket.readyState===WebSocket.OPEN?this.socket.send(t):this.cachedMessages.push(t)}};var o;(function(e){e.MESSAGE_TYPE_SOURCEMAP="s",e.MESSAGE_TYPE_COVERAGE="c"})(o||(o={}));var C=20,p=1e3,a=class{constructor(t,e){this.milliseconds=t;this.onCountedToZero=e;this.timerHandle=null}restartCountdown(){this.stopCountdown(),this.timerHandle=self.setTimeout(()=>{this.stopCountdown(),this.onCountedToZero()},this.milliseconds)}stopCountdown(){this.timerHandle!==null&&(self.clearTimeout(this.timerHandle),this.timerHandle=null)}},r=class{constructor(t){this.socket=t,this.cachedCoveredPositions=new Map,this.numberOfCachedPositions=0,this.flushCountdown=new a(p,()=>this.flush())}add(t){let e=t.split(":");if(e.length!==3)return;let[c,u,l]=e,i=this.cachedCoveredPositions.get(c);i||(i=new Set,this.cachedCoveredPositions.set(c,i)),i.add(`${u}:${l}`),this.numberOfCachedPositions+=1,this.flushCountdown.restartCountdown(),this.numberOfCachedPositions>=C&&this.flush()}flush(){this.numberOfCachedPositions!==0&&(this.flushCountdown.stopCountdown(),this.cachedCoveredPositions.forEach((t,e)=>{this.socket.send(`${o.MESSAGE_TYPE_COVERAGE} ${e} ${Array.from(t).join(" ")}`)}),this.cachedCoveredPositions=new Map,this.numberOfCachedPositions=0)}};console.log("Starting coverage forwarding worker.");var h=new n("ws://localhost:54678/socket"),d=new r(h);onmessage=s=>{let t=s.data;t.startsWith(o.MESSAGE_TYPE_SOURCEMAP)?h.send(t):t==="unload"?d.flush():d.add(t)};\n');
  }

  // src/vaccine/utils.ts
  function universe() {
    return getWindow();
  }
  function hasWindow() {
    return typeof window !== "undefined";
  }
  function getWindow() {
    return window;
  }
  function universeAttribute(attributeName, defaultValue) {
    let result = universe()[attributeName];
    if (!result) {
      result = defaultValue;
      universe()[attributeName] = result;
    }
    return result;
  }

  // src/vaccine/Interceptor.ts
  var STATEMENT_COVERAGE_ID = "s";
  var Interceptor = class {
    constructor(coverageObj, path) {
      this.coverageObj = coverageObj;
      this.path = path;
    }
    get(target, prop, receiver) {
      const value = target[prop];
      if (value !== Object(value)) {
        return value;
      }
      return makeProxy(this.coverageObj, value, [...this.path, prop]);
    }
    set(obj, prop, value) {
      const fullPath = [...this.path, prop];
      if (fullPath[0] === STATEMENT_COVERAGE_ID) {
        const fileId = this.coverageObj.hash;
        const start = this.coverageObj.statementMap[fullPath[1]].start;
        universe()._$Bc(fileId, start.line, start.column);
      }
      return true;
    }
  };
  function makeProxy(coverage, target, path) {
    return new Proxy(target, new Interceptor(coverage, path));
  }

  // ../../node_modules/unload/dist/es/index.js
  var import_detect_node = __toModule(require_browser());

  // ../../node_modules/unload/dist/es/browser.js
  function add(fn) {
    if (typeof WorkerGlobalScope === "function" && self instanceof WorkerGlobalScope) {
    } else {
      if (typeof window.addEventListener !== "function")
        return;
      window.addEventListener("beforeunload", function() {
        fn();
      }, true);
      window.addEventListener("unload", function() {
        fn();
      }, true);
    }
  }
  var browser_default = {
    add
  };

  // ../../node_modules/unload/dist/es/index.js
  var import_node = __toModule(require_node());
  var USE_METHOD = import_detect_node.default ? import_node.default : browser_default;
  var LISTENERS = new Set();
  var startedListening = false;
  function startListening() {
    if (startedListening)
      return;
    startedListening = true;
    USE_METHOD.add(runAll);
  }
  function add2(fn) {
    startListening();
    if (typeof fn !== "function")
      throw new Error("Listener is no function");
    LISTENERS.add(fn);
    var addReturn = {
      remove: function remove() {
        return LISTENERS["delete"](fn);
      },
      run: function run() {
        LISTENERS["delete"](fn);
        return fn();
      }
    };
    return addReturn;
  }
  function runAll() {
    var promises = [];
    LISTENERS.forEach(function(fn) {
      promises.push(fn());
      LISTENERS["delete"](fn);
    });
    return Promise.all(promises);
  }

  // src/vaccine/protocol.ts
  var ProtocolMessageTypes;
  (function(ProtocolMessageTypes2) {
    ProtocolMessageTypes2["MESSAGE_TYPE_SOURCEMAP"] = "s";
    ProtocolMessageTypes2["MESSAGE_TYPE_COVERAGE"] = "c";
  })(ProtocolMessageTypes || (ProtocolMessageTypes = {}));

  // src/vaccine/main.ts
  var globalAgentObject = universeAttribute("__TS_AGENT", {});
  function getWorker() {
    return globalAgentObject._$BcWorker;
  }
  function setWorker(worker) {
    globalAgentObject._$BcWorker = worker;
    return worker;
  }
  universe().makeCoverageInterceptor = function(coverage) {
    const fileId = coverage.hash;
    if (!getWorker()) {
      const worker = setWorker(new Worker2());
      (function handleUnloading() {
        const protectWindowEvent = function(name) {
          let wrappedHandler = getWindow()[name];
          getWindow()[name] = function(...args) {
            worker.postMessage("unload");
            if (wrappedHandler) {
              return wrappedHandler.apply(this, args);
            }
          };
          if (hasWindow()) {
            Object.defineProperty(getWindow(), name, {
              get: function() {
                return wrappedHandler;
              },
              set: function(newHandler) {
                wrappedHandler = newHandler;
              }
            });
          }
        };
        protectWindowEvent("onunload");
        protectWindowEvent("onbeforeunload");
        add2(() => worker.postMessage("unload"));
      })();
    }
    (function sendSourceMaps() {
      const sentMaps = universeAttribute("sentMaps", new Set());
      for (const key of Object.keys(coverage)) {
        const value = coverage[key];
        const sourceMap = value.inputSourceMap;
        if (!sentMaps.has(key)) {
          if (sourceMap) {
            getWorker().postMessage(`${ProtocolMessageTypes.MESSAGE_TYPE_SOURCEMAP} ${fileId}:${JSON.stringify(sourceMap)}`);
            sentMaps.add(key);
          }
        }
      }
    })();
    (function registerCoverageReporter() {
      const reported = new Set();
      universe()._$Bc = (fileId2, coveredLine, coveredColumn) => {
        const coverageMessage = `${fileId2}:${coveredLine}:${coveredColumn}`;
        if (!reported.has(coverageMessage)) {
          getWorker().postMessage(coverageMessage);
          reported.add(coverageMessage);
        }
      };
    })();
    return makeProxy(coverage, coverage, []);
  };
})();
 function cov_1f60aiwlvu(){var path="/home/stahlbau/work/develop/teamscale-javascript-profiler/test/casestudies/angular-hero-app/karma.conf.js";var hash="519c51337e9b91d89b4e0e9c3a966f4cd7d66b8d";var global=typeof window === 'object' ? window : this;var gcv="__coverage__";var coverageData={path:"/home/stahlbau/work/develop/teamscale-javascript-profiler/test/casestudies/angular-hero-app/karma.conf.js",statementMap:{"0":{start:{line:4,column:0},end:{line:44,column:2}},"1":{start:{line:5,column:2},end:{line:43,column:5}}},fnMap:{"0":{name:"(anonymous_0)",decl:{start:{line:4,column:17},end:{line:4,column:18}},loc:{start:{line:4,column:35},end:{line:44,column:1}},line:4}},branchMap:{},s:{"0":0,"1":0},f:{"0":0},b:{},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"519c51337e9b91d89b4e0e9c3a966f4cd7d66b8d"};var coverage=global[gcv]||(global[gcv]={});if(!coverage[path]||coverage[path].hash!==hash){coverage[path]=coverageData;}var actualCoverage=coverage[path];{// @ts-ignore
cov_1f60aiwlvu=function(){return makeCoverageInterceptor(actualCoverage);};}return makeCoverageInterceptor(actualCoverage);}cov_1f60aiwlvu();cov_1f60aiwlvu().s[0]++;// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
module.exports=function(config){cov_1f60aiwlvu().f[0]++;cov_1f60aiwlvu().s[1]++;config.set({basePath:'',frameworks:['jasmine','@angular-devkit/build-angular'],plugins:[require('karma-jasmine'),require('karma-chrome-launcher'),require('karma-jasmine-html-reporter'),require('karma-coverage'),require('@angular-devkit/build-angular/plugins/karma')],client:{jasmine:{// you can add configuration options for Jasmine here
// the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
// for example, you can disable the random execution with `random: false`
// or set a specific seed with `seed: 4321`
},clearContext:false// leave Jasmine Spec Runner output visible in browser
},jasmineHtmlReporter:{suppressAll:true// removes the duplicated traces
},coverageReporter:{dir:require('path').join(__dirname,'./coverage/angular.io-example'),subdir:'.',reporters:[{type:'html'},{type:'text-summary'}]},reporters:['progress','kjhtml'],port:9876,colors:true,logLevel:config.LOG_INFO,autoWatch:true,browsers:['Chrome'],singleRun:false,restartOnFileChange:true});}; 
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImthcm1hLmNvbmYuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsImNvbmZpZyIsInNldCIsImJhc2VQYXRoIiwiZnJhbWV3b3JrcyIsInBsdWdpbnMiLCJyZXF1aXJlIiwiY2xpZW50IiwiamFzbWluZSIsImNsZWFyQ29udGV4dCIsImphc21pbmVIdG1sUmVwb3J0ZXIiLCJzdXBwcmVzc0FsbCIsImNvdmVyYWdlUmVwb3J0ZXIiLCJkaXIiLCJqb2luIiwiX19kaXJuYW1lIiwic3ViZGlyIiwicmVwb3J0ZXJzIiwidHlwZSIsInBvcnQiLCJjb2xvcnMiLCJsb2dMZXZlbCIsIkxPR19JTkZPIiwiYXV0b1dhdGNoIiwiYnJvd3NlcnMiLCJzaW5nbGVSdW4iLCJyZXN0YXJ0T25GaWxlQ2hhbmdlIl0sIm1hcHBpbmdzIjoieThCQWVZO21IQWZaO0FBQ0E7QUFFQUEsTUFBTSxDQUFDQyxPQUFQLENBQWlCLFNBQVVDLE1BQVYsQ0FBa0IsaURBQ2pDQSxNQUFNLENBQUNDLEdBQVAsQ0FBVyxDQUNUQyxRQUFRLENBQUUsRUFERCxDQUVUQyxVQUFVLENBQUUsQ0FBQyxTQUFELENBQVksK0JBQVosQ0FGSCxDQUdUQyxPQUFPLENBQUUsQ0FDUEMsT0FBTyxDQUFDLGVBQUQsQ0FEQSxDQUVQQSxPQUFPLENBQUMsdUJBQUQsQ0FGQSxDQUdQQSxPQUFPLENBQUMsNkJBQUQsQ0FIQSxDQUlQQSxPQUFPLENBQUMsZ0JBQUQsQ0FKQSxDQUtQQSxPQUFPLENBQUMsNkNBQUQsQ0FMQSxDQUhBLENBVVRDLE1BQU0sQ0FBRSxDQUNOQyxPQUFPLENBQUUsQ0FDUDtBQUNBO0FBQ0E7QUFDQTtBQUpPLENBREgsQ0FPTkMsWUFBWSxDQUFFLEtBQU07QUFQZCxDQVZDLENBbUJUQyxtQkFBbUIsQ0FBRSxDQUNuQkMsV0FBVyxDQUFFLElBQUs7QUFEQyxDQW5CWixDQXNCVEMsZ0JBQWdCLENBQUUsQ0FDaEJDLEdBQUcsQ0FBRVAsT0FBTyxDQUFDLE1BQUQsQ0FBUCxDQUFnQlEsSUFBaEIsQ0FBcUJDLFNBQXJCLENBQWdDLCtCQUFoQyxDQURXLENBRWhCQyxNQUFNLENBQUUsR0FGUSxDQUdoQkMsU0FBUyxDQUFFLENBQ1QsQ0FBRUMsSUFBSSxDQUFFLE1BQVIsQ0FEUyxDQUVULENBQUVBLElBQUksQ0FBRSxjQUFSLENBRlMsQ0FISyxDQXRCVCxDQThCVEQsU0FBUyxDQUFFLENBQUMsVUFBRCxDQUFhLFFBQWIsQ0E5QkYsQ0ErQlRFLElBQUksQ0FBRSxJQS9CRyxDQWdDVEMsTUFBTSxDQUFFLElBaENDLENBaUNUQyxRQUFRLENBQUVwQixNQUFNLENBQUNxQixRQWpDUixDQWtDVEMsU0FBUyxDQUFFLElBbENGLENBbUNUQyxRQUFRLENBQUUsQ0FBQyxRQUFELENBbkNELENBb0NUQyxTQUFTLENBQUUsS0FwQ0YsQ0FxQ1RDLG1CQUFtQixDQUFFLElBckNaLENBQVgsRUF1Q0QsQ0F4Q0QiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBLYXJtYSBjb25maWd1cmF0aW9uIGZpbGUsIHNlZSBsaW5rIGZvciBtb3JlIGluZm9ybWF0aW9uXG4vLyBodHRwczovL2thcm1hLXJ1bm5lci5naXRodWIuaW8vMS4wL2NvbmZpZy9jb25maWd1cmF0aW9uLWZpbGUuaHRtbFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgY29uZmlnLnNldCh7XG4gICAgYmFzZVBhdGg6ICcnLFxuICAgIGZyYW1ld29ya3M6IFsnamFzbWluZScsICdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhciddLFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlcXVpcmUoJ2thcm1hLWphc21pbmUnKSxcbiAgICAgIHJlcXVpcmUoJ2thcm1hLWNocm9tZS1sYXVuY2hlcicpLFxuICAgICAgcmVxdWlyZSgna2FybWEtamFzbWluZS1odG1sLXJlcG9ydGVyJyksXG4gICAgICByZXF1aXJlKCdrYXJtYS1jb3ZlcmFnZScpLFxuICAgICAgcmVxdWlyZSgnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXIvcGx1Z2lucy9rYXJtYScpXG4gICAgXSxcbiAgICBjbGllbnQ6IHtcbiAgICAgIGphc21pbmU6IHtcbiAgICAgICAgLy8geW91IGNhbiBhZGQgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciBKYXNtaW5lIGhlcmVcbiAgICAgICAgLy8gdGhlIHBvc3NpYmxlIG9wdGlvbnMgYXJlIGxpc3RlZCBhdCBodHRwczovL2phc21pbmUuZ2l0aHViLmlvL2FwaS9lZGdlL0NvbmZpZ3VyYXRpb24uaHRtbFxuICAgICAgICAvLyBmb3IgZXhhbXBsZSwgeW91IGNhbiBkaXNhYmxlIHRoZSByYW5kb20gZXhlY3V0aW9uIHdpdGggYHJhbmRvbTogZmFsc2VgXG4gICAgICAgIC8vIG9yIHNldCBhIHNwZWNpZmljIHNlZWQgd2l0aCBgc2VlZDogNDMyMWBcbiAgICAgIH0sXG4gICAgICBjbGVhckNvbnRleHQ6IGZhbHNlIC8vIGxlYXZlIEphc21pbmUgU3BlYyBSdW5uZXIgb3V0cHV0IHZpc2libGUgaW4gYnJvd3NlclxuICAgIH0sXG4gICAgamFzbWluZUh0bWxSZXBvcnRlcjoge1xuICAgICAgc3VwcHJlc3NBbGw6IHRydWUgLy8gcmVtb3ZlcyB0aGUgZHVwbGljYXRlZCB0cmFjZXNcbiAgICB9LFxuICAgIGNvdmVyYWdlUmVwb3J0ZXI6IHtcbiAgICAgIGRpcjogcmVxdWlyZSgncGF0aCcpLmpvaW4oX19kaXJuYW1lLCAnLi9jb3ZlcmFnZS9hbmd1bGFyLmlvLWV4YW1wbGUnKSxcbiAgICAgIHN1YmRpcjogJy4nLFxuICAgICAgcmVwb3J0ZXJzOiBbXG4gICAgICAgIHsgdHlwZTogJ2h0bWwnIH0sXG4gICAgICAgIHsgdHlwZTogJ3RleHQtc3VtbWFyeScgfVxuICAgICAgXVxuICAgIH0sXG4gICAgcmVwb3J0ZXJzOiBbJ3Byb2dyZXNzJywgJ2tqaHRtbCddLFxuICAgIHBvcnQ6IDk4NzYsXG4gICAgY29sb3JzOiB0cnVlLFxuICAgIGxvZ0xldmVsOiBjb25maWcuTE9HX0lORk8sXG4gICAgYXV0b1dhdGNoOiB0cnVlLFxuICAgIGJyb3dzZXJzOiBbJ0Nocm9tZSddLFxuICAgIHNpbmdsZVJ1bjogZmFsc2UsXG4gICAgcmVzdGFydE9uRmlsZUNoYW5nZTogdHJ1ZVxuICB9KTtcbn07XG4iXX0=