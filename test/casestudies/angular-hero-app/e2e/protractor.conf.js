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
 function cov_2nulhpi9ja(){var path="/home/stahlbau/work/develop/teamscale-javascript-profiler/test/casestudies/angular-hero-app/e2e/protractor.conf.js";var hash="691cc77a3178879dfee6755d4c302963d5a5888c";var global=typeof window === 'object' ? window : this;var gcv="__coverage__";var coverageData={path:"/home/stahlbau/work/develop/teamscale-javascript-profiler/test/casestudies/angular-hero-app/e2e/protractor.conf.js",statementMap:{"0":{start:{line:5,column:43},end:{line:5,column:75}},"1":{start:{line:10,column:0},end:{line:37,column:2}},"2":{start:{line:28,column:4},end:{line:30,column:7}},"3":{start:{line:31,column:4},end:{line:35,column:8}}},fnMap:{"0":{name:"(anonymous_0)",decl:{start:{line:25,column:11},end:{line:25,column:12}},loc:{start:{line:25,column:22},end:{line:25,column:24}},line:25},"1":{name:"(anonymous_1)",decl:{start:{line:27,column:2},end:{line:27,column:3}},loc:{start:{line:27,column:14},end:{line:36,column:3}},line:27}},branchMap:{},s:{"0":0,"1":0,"2":0,"3":0},f:{"0":0,"1":0},b:{},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"691cc77a3178879dfee6755d4c302963d5a5888c"};var coverage=global[gcv]||(global[gcv]={});if(!coverage[path]||coverage[path].hash!==hash){coverage[path]=coverageData;}var actualCoverage=coverage[path];{// @ts-ignore
cov_2nulhpi9ja=function(){return makeCoverageInterceptor(actualCoverage);};}return makeCoverageInterceptor(actualCoverage);}cov_2nulhpi9ja();// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
const{SpecReporter,StacktraceOption}=(cov_2nulhpi9ja().s[0]++,require('jasmine-spec-reporter'));/**
 * @type { import("protractor").Config }
 */cov_2nulhpi9ja().s[1]++;exports.config={allScriptsTimeout:11000,specs:['./src/**/*.e2e-spec.ts'],capabilities:{browserName:'chrome'},directConnect:true,SELENIUM_PROMISE_MANAGER:false,baseUrl:'http://localhost:4200/',framework:'jasmine',jasmineNodeOpts:{showColors:true,defaultTimeoutInterval:30000,print:function(){cov_2nulhpi9ja().f[0]++;}},onPrepare(){cov_2nulhpi9ja().f[1]++;cov_2nulhpi9ja().s[2]++;require('ts-node').register({project:require('path').join(__dirname,'./tsconfig.json')});cov_2nulhpi9ja().s[3]++;jasmine.getEnv().addReporter(new SpecReporter({spec:{displayStacktrace:StacktraceOption.PRETTY}}));}}; 
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb3RyYWN0b3IuY29uZi5qcyJdLCJuYW1lcyI6WyJTcGVjUmVwb3J0ZXIiLCJTdGFja3RyYWNlT3B0aW9uIiwicmVxdWlyZSIsImV4cG9ydHMiLCJjb25maWciLCJhbGxTY3JpcHRzVGltZW91dCIsInNwZWNzIiwiY2FwYWJpbGl0aWVzIiwiYnJvd3Nlck5hbWUiLCJkaXJlY3RDb25uZWN0IiwiU0VMRU5JVU1fUFJPTUlTRV9NQU5BR0VSIiwiYmFzZVVybCIsImZyYW1ld29yayIsImphc21pbmVOb2RlT3B0cyIsInNob3dDb2xvcnMiLCJkZWZhdWx0VGltZW91dEludGVydmFsIiwicHJpbnQiLCJvblByZXBhcmUiLCJyZWdpc3RlciIsInByb2plY3QiLCJqb2luIiwiX19kaXJuYW1lIiwiamFzbWluZSIsImdldEVudiIsImFkZFJlcG9ydGVyIiwic3BlYyIsImRpc3BsYXlTdGFja3RyYWNlIiwiUFJFVFRZIl0sIm1hcHBpbmdzIjoiaXZDQWVZOzJGQWZaO0FBQ0E7QUFDQTtBQUVBLEtBQU0sQ0FBRUEsWUFBRixDQUFnQkMsZ0JBQWhCLDJCQUFxQ0MsT0FBTyxDQUFDLHVCQUFELENBQTVDLENBQU4sQ0FFQTtBQUNBO0FBQ0EsRyx3QkFDQUMsT0FBTyxDQUFDQyxNQUFSLENBQWlCLENBQ2ZDLGlCQUFpQixDQUFFLEtBREosQ0FFZkMsS0FBSyxDQUFFLENBQ0wsd0JBREssQ0FGUSxDQUtmQyxZQUFZLENBQUUsQ0FDWkMsV0FBVyxDQUFFLFFBREQsQ0FMQyxDQVFmQyxhQUFhLENBQUUsSUFSQSxDQVNmQyx3QkFBd0IsQ0FBRSxLQVRYLENBVWZDLE9BQU8sQ0FBRSx3QkFWTSxDQVdmQyxTQUFTLENBQUUsU0FYSSxDQVlmQyxlQUFlLENBQUUsQ0FDZkMsVUFBVSxDQUFFLElBREcsQ0FFZkMsc0JBQXNCLENBQUUsS0FGVCxDQUdmQyxLQUFLLENBQUUsVUFBVyx5QkFBRSxDQUhMLENBWkYsQ0FpQmZDLFNBQVMsRUFBRyxpREFDVmYsT0FBTyxDQUFDLFNBQUQsQ0FBUCxDQUFtQmdCLFFBQW5CLENBQTRCLENBQzFCQyxPQUFPLENBQUVqQixPQUFPLENBQUMsTUFBRCxDQUFQLENBQWdCa0IsSUFBaEIsQ0FBcUJDLFNBQXJCLENBQWdDLGlCQUFoQyxDQURpQixDQUE1QixFQURVLHdCQUlWQyxPQUFPLENBQUNDLE1BQVIsR0FBaUJDLFdBQWpCLENBQTZCLEdBQUl4QixDQUFBQSxZQUFKLENBQWlCLENBQzVDeUIsSUFBSSxDQUFFLENBQ0pDLGlCQUFpQixDQUFFekIsZ0JBQWdCLENBQUMwQixNQURoQyxDQURzQyxDQUFqQixDQUE3QixFQUtELENBMUJjLENBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWNoZWNrXG4vLyBQcm90cmFjdG9yIGNvbmZpZ3VyYXRpb24gZmlsZSwgc2VlIGxpbmsgZm9yIG1vcmUgaW5mb3JtYXRpb25cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL3Byb3RyYWN0b3IvYmxvYi9tYXN0ZXIvbGliL2NvbmZpZy50c1xuXG5jb25zdCB7IFNwZWNSZXBvcnRlciwgU3RhY2t0cmFjZU9wdGlvbiB9ID0gcmVxdWlyZSgnamFzbWluZS1zcGVjLXJlcG9ydGVyJyk7XG5cbi8qKlxuICogQHR5cGUgeyBpbXBvcnQoXCJwcm90cmFjdG9yXCIpLkNvbmZpZyB9XG4gKi9cbmV4cG9ydHMuY29uZmlnID0ge1xuICBhbGxTY3JpcHRzVGltZW91dDogMTEwMDAsXG4gIHNwZWNzOiBbXG4gICAgJy4vc3JjLyoqLyouZTJlLXNwZWMudHMnXG4gIF0sXG4gIGNhcGFiaWxpdGllczoge1xuICAgIGJyb3dzZXJOYW1lOiAnY2hyb21lJ1xuICB9LFxuICBkaXJlY3RDb25uZWN0OiB0cnVlLFxuICBTRUxFTklVTV9QUk9NSVNFX01BTkFHRVI6IGZhbHNlLFxuICBiYXNlVXJsOiAnaHR0cDovL2xvY2FsaG9zdDo0MjAwLycsXG4gIGZyYW1ld29yazogJ2phc21pbmUnLFxuICBqYXNtaW5lTm9kZU9wdHM6IHtcbiAgICBzaG93Q29sb3JzOiB0cnVlLFxuICAgIGRlZmF1bHRUaW1lb3V0SW50ZXJ2YWw6IDMwMDAwLFxuICAgIHByaW50OiBmdW5jdGlvbigpIHt9XG4gIH0sXG4gIG9uUHJlcGFyZSgpIHtcbiAgICByZXF1aXJlKCd0cy1ub2RlJykucmVnaXN0ZXIoe1xuICAgICAgcHJvamVjdDogcmVxdWlyZSgncGF0aCcpLmpvaW4oX19kaXJuYW1lLCAnLi90c2NvbmZpZy5qc29uJylcbiAgICB9KTtcbiAgICBqYXNtaW5lLmdldEVudigpLmFkZFJlcG9ydGVyKG5ldyBTcGVjUmVwb3J0ZXIoe1xuICAgICAgc3BlYzoge1xuICAgICAgICBkaXNwbGF5U3RhY2t0cmFjZTogU3RhY2t0cmFjZU9wdGlvbi5QUkVUVFlcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cbn07XG4iXX0=