/** $IS_JS_PROFILER_INSTRUMENTED=true **/ (()=>{function d(e){let n=new Blob([e],{type:"text/javascript"}),t=URL.createObjectURL(n),s=new Worker(t);return URL.revokeObjectURL(t),s}function h(){return d('var r=class{constructor(e){this.cachedMessages=[];this.url=e,this.socket=this.createSocket()}createSocket(){let e=new WebSocket(this.url);return e.onopen=()=>this.onopen(),e.onclose=()=>this.onclose(),e}onclose(){this.socket=this.createSocket()}onopen(){console.log("Connection to Coverage Collector established."),this.cachedMessages.forEach(e=>this.socket.send(e)),this.cachedMessages=[]}send(e){this.socket.readyState===WebSocket.OPEN?this.socket.send(e):(this.cachedMessages.push(e),this.cachedMessages.length%500===0&&console.log(`More than ${this.cachedMessages.length} messages are queued to be sent.`))}};var C=20,m=1e3,d=class{constructor(e,t){this.milliseconds=e;this.onCountedToZero=t;this.timerHandle=null}restartCountdown(){this.stopCountdown(),this.timerHandle=self.setTimeout(()=>{this.stopCountdown(),this.onCountedToZero()},this.milliseconds)}stopCountdown(){this.timerHandle!==null&&(self.clearTimeout(this.timerHandle),this.timerHandle=null)}},a=class{constructor(e){this.socket=e,this.cachedCoveredRanges=new Map,this.numberOfCachedPositions=0,this.flushCountdown=new d(m,()=>this.flush())}addRange(e,t){if(!t.start.line||!t.end.line)return;let o=this.cachedCoveredRanges.get(e);o||(o=new Set,this.cachedCoveredRanges.set(e,o)),o.add(t),this.numberOfCachedPositions+=1,this.flushCountdown.restartCountdown(),this.numberOfCachedPositions>=C&&this.flush()}flush(){this.numberOfCachedPositions!==0&&(this.flushCountdown.stopCountdown(),this.cachedCoveredRanges.forEach((e,t)=>{let o=Array.from(e).map(n=>`${n.start.line}:${n.start.column}:${n.end.line}:${n.end.column}`);this.socket.send(`${"c"} ${t} ${o.join(" ")}`),e.clear()}),this.cachedCoveredRanges.clear(),this.numberOfCachedPositions=0)}};console.log("Starting coverage forwarding worker.");var u=new r("ws://localhost:46427/socket"),h=new a(u),f=new Map;onmessage=s=>{if(Array.isArray(s.data))p(s.data);else{let e=s.data;if(e.startsWith("s"))u.send(e);else if(e.startsWith("i")){let t=JSON.parse(e.substring(2));f.set(t.hash,t),console.info(`Received coverage mapping information for "${t.hash}".`)}else e==="unload"?h.flush():console.error(`No handler for message: ${e}`)}};function p(s){var n;let e=s[0],t=s[1],o=f.get(e);if(!o){console.log(`No coverage mapping information for ${e} available!`);return}for(let[c,i]of t.branches.entries()){let l=(n=o.branchMap[c])==null?void 0:n.locations[i];l&&h.addRange(e,l)}for(let c of t.statements){let i=o.statementMap[c];i&&h.addRange(e,i)}}\n')}function c(){return g()}function g(){return window}function p(e,n){let t=c()[e];return t||(t=n,c()[e]=t),t}var l;(function(r){r.MESSAGE_TYPE_SOURCEMAP="s",r.MESSAGE_TYPE_COVERAGE="c",r.ISTANBUL_COV_OBJECT="i",r.UNRESOLVED_CODE_ENTITY="u"})(l||(l={}));function v(e,n){let t=new Map;function s(i){let o=t.get(i);return o||(o={branches:new Map,statements:new Set},t.set(i,o),o)}function r(i,o,w){s(i).branches.set(o,w)}function u(i,o){s(i).statements.add(o)}function a(){n(t),t.clear()}return setInterval(()=>a(),e),{putBranchCoverage:r,putStatementCoverage:u,flush:a}}var C=p("__TS_AGENT",{});function f(){return C._$BcWorker}function S(e){return C._$BcWorker=e,e}var m=v(250,e=>{for(let n of e.entries())f().postMessage(n)});c()._$stmtCov=m.putStatementCoverage;c()._$brCov=m.putBranchCoverage;var b=new Set;c()._$registerCoverageObject=function(e){let n=e.hash;if(b.has(n)){console.log(`Coverage interceptor added twice for ${n}. This seems to be a bug in the instrumentation.`);return}else b.add(n);if(!f()){let t=S(new h);(function(){let r=()=>{m.flush(),t.postMessage("unload")},u=function(i,o){!o||o.addEventListener(i,r,{capture:!0})},a=g();u("blur",a),u("unload",a),u("visibilitychange",a),u("beforeunload",a)})()}(function(){f().postMessage(`${l.ISTANBUL_COV_OBJECT} ${JSON.stringify(e)}`);let s=p("sentMaps",new Set);e.inputSourceMap&&(s.has(e.path)||(f().postMessage(`${l.MESSAGE_TYPE_SOURCEMAP} ${n}:${JSON.stringify(e.inputSourceMap)}`),s.add(e.path)))})()};})();
 const _$ffkd959h = "e3b8063aa1ba922ffeb1e34304bdd46a5e9ebae0";
function cov_2f62ixwpa4() {
  var path = "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/locales/i18next-parser.config.js";
  var hash = "e3b8063aa1ba922ffeb1e34304bdd46a5e9ebae0";
  var global = typeof window === 'object' ? window : this;
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/locales/i18next-parser.config.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 0
        },
        end: {
          line: 21,
          column: 2
        }
      },
      "1": {
        start: {
          line: 20,
          column: 33
        },
        end: {
          line: 20,
          column: 51
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 20,
            column: 21
          },
          end: {
            line: 20,
            column: 22
          }
        },
        loc: {
          start: {
            line: 20,
            column: 33
          },
          end: {
            line: 20,
            column: 51
          }
        },
        line: 20
      }
    },
    branchMap: {},
    s: {
      "0": 0,
      "1": 0
    },
    f: {
      "0": 0
    },
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "e3b8063aa1ba922ffeb1e34304bdd46a5e9ebae0"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage=_$registerCoverageObject(coverage[path]);
  {
    // @ts-ignore
    cov_2f62ixwpa4 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_2f62ixwpa4();
module.exports = {
  // Default namespace used in your i18next config
  defaultNamespace: 'grafana',
  locales: ['en-US', 'fr-FR', 'es-ES', "de-DE", "zh-Hans", 'pseudo-LOCALE'],
  output: './public/locales/$LOCALE/$NAMESPACE.json',
  pluralSeparator: '__',
  sort: true,
  createOldCatalogs: false,
  failOnWarnings: true,
  verbose: false,
  // Don't include default values for English, they'll remain in the source code
  skipDefaultValues: locale => {
    return locale !== 'en-US';
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMmY2Mml4d3BhNCIsImFjdHVhbENvdmVyYWdlIiwicyIsIm1vZHVsZSIsImV4cG9ydHMiLCJkZWZhdWx0TmFtZXNwYWNlIiwibG9jYWxlcyIsIm91dHB1dCIsInBsdXJhbFNlcGFyYXRvciIsInNvcnQiLCJjcmVhdGVPbGRDYXRhbG9ncyIsImZhaWxPbldhcm5pbmdzIiwidmVyYm9zZSIsInNraXBEZWZhdWx0VmFsdWVzIiwibG9jYWxlIiwiZiJdLCJzb3VyY2VzIjpbImkxOG5leHQtcGFyc2VyLmNvbmZpZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gRGVmYXVsdCBuYW1lc3BhY2UgdXNlZCBpbiB5b3VyIGkxOG5leHQgY29uZmlnXG4gIGRlZmF1bHROYW1lc3BhY2U6ICdncmFmYW5hJyxcblxuICBsb2NhbGVzOiBbJ2VuLVVTJywgJ2ZyLUZSJywgJ2VzLUVTJywgXCJkZS1ERVwiLCBcInpoLUhhbnNcIiwgJ3BzZXVkby1MT0NBTEUnXSxcblxuICBvdXRwdXQ6ICcuL3B1YmxpYy9sb2NhbGVzLyRMT0NBTEUvJE5BTUVTUEFDRS5qc29uJyxcblxuICBwbHVyYWxTZXBhcmF0b3I6ICdfXycsXG5cbiAgc29ydDogdHJ1ZSxcblxuICBjcmVhdGVPbGRDYXRhbG9nczogZmFsc2UsXG5cbiAgZmFpbE9uV2FybmluZ3M6IHRydWUsXG5cbiAgdmVyYm9zZTogZmFsc2UsXG5cbiAgLy8gRG9uJ3QgaW5jbHVkZSBkZWZhdWx0IHZhbHVlcyBmb3IgRW5nbGlzaCwgdGhleSdsbCByZW1haW4gaW4gdGhlIHNvdXJjZSBjb2RlXG4gIHNraXBEZWZhdWx0VmFsdWVzOiAobG9jYWxlKSA9PiBsb2NhbGUgIT09ICdlbi1VUycsXG59O1xuIl0sIm1hcHBpbmdzIjoiaStCQWVZO0FBQUFBLGNBQUEsU0FBQUEsQ0FBQSxTQUFBQyxjQUFBLFdBQUFBLGNBQUEsRUFBQUQsY0FBQSxHQUFBQSxjQUFBLEdBQUFFLENBQUEsTUFmWkMsTUFBTSxDQUFDQyxPQUFPLENBQUcsQ0FDZjtBQUNBQyxnQkFBZ0IsQ0FBRSxTQUFTLENBRTNCQyxPQUFPLENBQUUsQ0FBQyxPQUFPLENBQUUsT0FBTyxDQUFFLE9BQU8sQ0FBRSxPQUFPLENBQUUsU0FBUyxDQUFFLGVBQWUsQ0FBQyxDQUV6RUMsTUFBTSxDQUFFLDBDQUEwQyxDQUVsREMsZUFBZSxDQUFFLElBQUksQ0FFckJDLElBQUksQ0FBRSxJQUFJLENBRVZDLGlCQUFpQixDQUFFLEtBQUssQ0FFeEJDLGNBQWMsQ0FBRSxJQUFJLENBRXBCQyxPQUFPLENBQUUsS0FBSyxDQUVkO0FBQ0FDLGlCQUFpQixDQUFHQyxNQUFNLEVBQUssQ0FBQWQsY0FBQSxHQUFBZSxDQUFBLE1BQUFmLGNBQUEsR0FBQUUsQ0FBQSxhQUFBWSxNQUFNLEdBQUssT0FBTyxDQUFELENBQ2xELENBQUMifQ== 
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMmY2Mml4d3BhNCIsImFjdHVhbENvdmVyYWdlIiwicyIsIm1vZHVsZSIsImV4cG9ydHMiLCJkZWZhdWx0TmFtZXNwYWNlIiwibG9jYWxlcyIsIm91dHB1dCIsInBsdXJhbFNlcGFyYXRvciIsInNvcnQiLCJjcmVhdGVPbGRDYXRhbG9ncyIsImZhaWxPbldhcm5pbmdzIiwidmVyYm9zZSIsInNraXBEZWZhdWx0VmFsdWVzIiwibG9jYWxlIiwiZiJdLCJzb3VyY2VzIjpbImkxOG5leHQtcGFyc2VyLmNvbmZpZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gRGVmYXVsdCBuYW1lc3BhY2UgdXNlZCBpbiB5b3VyIGkxOG5leHQgY29uZmlnXG4gIGRlZmF1bHROYW1lc3BhY2U6ICdncmFmYW5hJyxcblxuICBsb2NhbGVzOiBbJ2VuLVVTJywgJ2ZyLUZSJywgJ2VzLUVTJywgXCJkZS1ERVwiLCBcInpoLUhhbnNcIiwgJ3BzZXVkby1MT0NBTEUnXSxcblxuICBvdXRwdXQ6ICcuL3B1YmxpYy9sb2NhbGVzLyRMT0NBTEUvJE5BTUVTUEFDRS5qc29uJyxcblxuICBwbHVyYWxTZXBhcmF0b3I6ICdfXycsXG5cbiAgc29ydDogdHJ1ZSxcblxuICBjcmVhdGVPbGRDYXRhbG9nczogZmFsc2UsXG5cbiAgZmFpbE9uV2FybmluZ3M6IHRydWUsXG5cbiAgdmVyYm9zZTogZmFsc2UsXG5cbiAgLy8gRG9uJ3QgaW5jbHVkZSBkZWZhdWx0IHZhbHVlcyBmb3IgRW5nbGlzaCwgdGhleSdsbCByZW1haW4gaW4gdGhlIHNvdXJjZSBjb2RlXG4gIHNraXBEZWZhdWx0VmFsdWVzOiAobG9jYWxlKSA9PiBsb2NhbGUgIT09ICdlbi1VUycsXG59O1xuIl0sIm1hcHBpbmdzIjoiaStCQWVZO0FBQUFBLGNBQUEsU0FBQUEsQ0FBQSxTQUFBQyxjQUFBLFdBQUFBLGNBQUEsRUFBQUQsY0FBQSxHQUFBQSxjQUFBLEdBQUFFLENBQUEsTUFmWkMsTUFBTSxDQUFDQyxPQUFPLENBQUcsQ0FDZjtBQUNBQyxnQkFBZ0IsQ0FBRSxTQUFTLENBRTNCQyxPQUFPLENBQUUsQ0FBQyxPQUFPLENBQUUsT0FBTyxDQUFFLE9BQU8sQ0FBRSxPQUFPLENBQUUsU0FBUyxDQUFFLGVBQWUsQ0FBQyxDQUV6RUMsTUFBTSxDQUFFLDBDQUEwQyxDQUVsREMsZUFBZSxDQUFFLElBQUksQ0FFckJDLElBQUksQ0FBRSxJQUFJLENBRVZDLGlCQUFpQixDQUFFLEtBQUssQ0FFeEJDLGNBQWMsQ0FBRSxJQUFJLENBRXBCQyxPQUFPLENBQUUsS0FBSyxDQUVkO0FBQ0FDLGlCQUFpQixDQUFHQyxNQUFNLEVBQUssQ0FBQWQsY0FBQSxHQUFBZSxDQUFBLE1BQUFmLGNBQUEsR0FBQUUsQ0FBQSxhQUFBWSxNQUFNLEdBQUssT0FBTyxDQUFELENBQ2xELENBQUMifQ==