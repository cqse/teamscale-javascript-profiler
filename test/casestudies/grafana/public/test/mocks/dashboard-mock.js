/** $IS_JS_PROFILER_INSTRUMENTED=true **/ (()=>{function d(e){let n=new Blob([e],{type:"text/javascript"}),t=URL.createObjectURL(n),s=new Worker(t);return URL.revokeObjectURL(t),s}function h(){return d('var r=class{constructor(e){this.cachedMessages=[];this.url=e,this.socket=this.createSocket()}createSocket(){let e=new WebSocket(this.url);return e.onopen=()=>this.onopen(),e.onclose=()=>this.onclose(),e}onclose(){this.socket=this.createSocket()}onopen(){console.log("Connection to Coverage Collector established."),this.cachedMessages.forEach(e=>this.socket.send(e)),this.cachedMessages=[]}send(e){this.socket.readyState===WebSocket.OPEN?this.socket.send(e):(this.cachedMessages.push(e),this.cachedMessages.length%500===0&&console.log(`More than ${this.cachedMessages.length} messages are queued to be sent.`))}};var C=20,m=1e3,d=class{constructor(e,t){this.milliseconds=e;this.onCountedToZero=t;this.timerHandle=null}restartCountdown(){this.stopCountdown(),this.timerHandle=self.setTimeout(()=>{this.stopCountdown(),this.onCountedToZero()},this.milliseconds)}stopCountdown(){this.timerHandle!==null&&(self.clearTimeout(this.timerHandle),this.timerHandle=null)}},a=class{constructor(e){this.socket=e,this.cachedCoveredRanges=new Map,this.numberOfCachedPositions=0,this.flushCountdown=new d(m,()=>this.flush())}addRange(e,t){if(!t.start.line||!t.end.line)return;let o=this.cachedCoveredRanges.get(e);o||(o=new Set,this.cachedCoveredRanges.set(e,o)),o.add(t),this.numberOfCachedPositions+=1,this.flushCountdown.restartCountdown(),this.numberOfCachedPositions>=C&&this.flush()}flush(){this.numberOfCachedPositions!==0&&(this.flushCountdown.stopCountdown(),this.cachedCoveredRanges.forEach((e,t)=>{let o=Array.from(e).map(n=>`${n.start.line}:${n.start.column}:${n.end.line}:${n.end.column}`);this.socket.send(`${"c"} ${t} ${o.join(" ")}`),e.clear()}),this.cachedCoveredRanges.clear(),this.numberOfCachedPositions=0)}};console.log("Starting coverage forwarding worker.");var u=new r("ws://localhost:46427/socket"),h=new a(u),f=new Map;onmessage=s=>{if(Array.isArray(s.data))p(s.data);else{let e=s.data;if(e.startsWith("s"))u.send(e);else if(e.startsWith("i")){let t=JSON.parse(e.substring(2));f.set(t.hash,t),console.info(`Received coverage mapping information for "${t.hash}".`)}else e==="unload"?h.flush():console.error(`No handler for message: ${e}`)}};function p(s){var n;let e=s[0],t=s[1],o=f.get(e);if(!o){console.log(`No coverage mapping information for ${e} available!`);return}for(let[c,i]of t.branches.entries()){let l=(n=o.branchMap[c])==null?void 0:n.locations[i];l&&h.addRange(e,l)}for(let c of t.statements){let i=o.statementMap[c];i&&h.addRange(e,i)}}\n')}function c(){return g()}function g(){return window}function p(e,n){let t=c()[e];return t||(t=n,c()[e]=t),t}var l;(function(r){r.MESSAGE_TYPE_SOURCEMAP="s",r.MESSAGE_TYPE_COVERAGE="c",r.ISTANBUL_COV_OBJECT="i",r.UNRESOLVED_CODE_ENTITY="u"})(l||(l={}));function v(e,n){let t=new Map;function s(i){let o=t.get(i);return o||(o={branches:new Map,statements:new Set},t.set(i,o),o)}function r(i,o,w){s(i).branches.set(o,w)}function u(i,o){s(i).statements.add(o)}function a(){n(t),t.clear()}return setInterval(()=>a(),e),{putBranchCoverage:r,putStatementCoverage:u,flush:a}}var C=p("__TS_AGENT",{});function f(){return C._$BcWorker}function S(e){return C._$BcWorker=e,e}var m=v(250,e=>{for(let n of e.entries())f().postMessage(n)});c()._$stmtCov=m.putStatementCoverage;c()._$brCov=m.putBranchCoverage;var b=new Set;c()._$registerCoverageObject=function(e){let n=e.hash;if(b.has(n)){console.log(`Coverage interceptor added twice for ${n}. This seems to be a bug in the instrumentation.`);return}else b.add(n);if(!f()){let t=S(new h);(function(){let r=()=>{m.flush(),t.postMessage("unload")},u=function(i,o){!o||o.addEventListener(i,r,{capture:!0})},a=g();u("blur",a),u("unload",a),u("visibilitychange",a),u("beforeunload",a)})()}(function(){f().postMessage(`${l.ISTANBUL_COV_OBJECT} ${JSON.stringify(e)}`);let s=p("sentMaps",new Set);e.inputSourceMap&&(s.has(e.path)||(f().postMessage(`${l.MESSAGE_TYPE_SOURCEMAP} ${n}:${JSON.stringify(e.inputSourceMap)}`),s.add(e.path)))})()};})();
 const _$ffkd959l = "df109cc55d583d5a6dfc29a572569ff3f66ec9ee";
function cov_249ssnas33() {
  var path = "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/test/mocks/dashboard-mock.js";
  var hash = "df109cc55d583d5a6dfc29a572569ff3f66ec9ee";
  var global = typeof window === 'object' ? window : this;
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/test/mocks/dashboard-mock.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 0
        },
        end: {
          line: 25,
          column: 3
        }
      },
      "1": {
        start: {
          line: 4,
          column: 2
        },
        end: {
          line: 24,
          column: 4
        }
      },
      "2": {
        start: {
          line: 6,
          column: 6
        },
        end: {
          line: 22,
          column: 8
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 1,
            column: 11
          },
          end: {
            line: 1,
            column: 12
          }
        },
        loc: {
          start: {
            line: 1,
            column: 23
          },
          end: {
            line: 25,
            column: 1
          }
        },
        line: 1
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 5,
            column: 12
          },
          end: {
            line: 5,
            column: 13
          }
        },
        loc: {
          start: {
            line: 5,
            column: 24
          },
          end: {
            line: 23,
            column: 5
          }
        },
        line: 5
      }
    },
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0
    },
    f: {
      "0": 0,
      "1": 0
    },
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "df109cc55d583d5a6dfc29a572569ff3f66ec9ee"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage=_$registerCoverageObject(coverage[path]);
  {
    // @ts-ignore
    cov_249ssnas33 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_249ssnas33();
define([], function () {
  'use strict';

  return {
    create: function () {
      return {
        title: '',
        tags: [],
        style: 'dark',
        timezone: 'browser',
        editable: true,
        failover: false,
        panel_hints: true,
        rows: [],
        pulldowns: [{
          type: 'templating'
        }, {
          type: 'annotations'
        }],
        nav: [{
          type: 'timepicker'
        }],
        time: {
          from: 'now-6h',
          to: 'now'
        },
        templating: {
          list: []
        },
        refresh: '10s'
      };
    }
  };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMjQ5c3NuYXMzMyIsImFjdHVhbENvdmVyYWdlIiwicyIsImRlZmluZSIsImYiLCJjcmVhdGUiLCJ0aXRsZSIsInRhZ3MiLCJzdHlsZSIsInRpbWV6b25lIiwiZWRpdGFibGUiLCJmYWlsb3ZlciIsInBhbmVsX2hpbnRzIiwicm93cyIsInB1bGxkb3ducyIsInR5cGUiLCJuYXYiLCJ0aW1lIiwiZnJvbSIsInRvIiwidGVtcGxhdGluZyIsImxpc3QiLCJyZWZyZXNoIl0sInNvdXJjZXMiOlsiZGFzaGJvYXJkLW1vY2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICByZXR1cm4ge1xuICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICB0YWdzOiBbXSxcbiAgICAgICAgc3R5bGU6ICdkYXJrJyxcbiAgICAgICAgdGltZXpvbmU6ICdicm93c2VyJyxcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXG4gICAgICAgIGZhaWxvdmVyOiBmYWxzZSxcbiAgICAgICAgcGFuZWxfaGludHM6IHRydWUsXG4gICAgICAgIHJvd3M6IFtdLFxuICAgICAgICBwdWxsZG93bnM6IFt7IHR5cGU6ICd0ZW1wbGF0aW5nJyB9LCB7IHR5cGU6ICdhbm5vdGF0aW9ucycgfV0sXG4gICAgICAgIG5hdjogW3sgdHlwZTogJ3RpbWVwaWNrZXInIH1dLFxuICAgICAgICB0aW1lOiB7IGZyb206ICdub3ctNmgnLCB0bzogJ25vdycgfSxcbiAgICAgICAgdGVtcGxhdGluZzoge1xuICAgICAgICAgIGxpc3Q6IFtdLFxuICAgICAgICB9LFxuICAgICAgICByZWZyZXNoOiAnMTBzJyxcbiAgICAgIH07XG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sIm1hcHBpbmdzIjoiaXFDQWVZO0FBQUFBLGNBQUEsU0FBQUEsQ0FBQSxTQUFBQyxjQUFBLFdBQUFBLGNBQUEsRUFBQUQsY0FBQSxHQUFBQSxjQUFBLEdBQUFFLENBQUEsTUFmWkMsTUFBTSxDQUFDLEVBQUUsQ0FBRSxVQUFZLENBQ3JCLFlBQVksQ0FBQ0gsY0FBQSxHQUFBSSxDQUFBLE1BQUFKLGNBQUEsR0FBQUUsQ0FBQSxNQUViLE1BQU8sQ0FDTEcsTUFBTSxDQUFFLFFBQUFBLENBQUEsQ0FBWSxDQUFBTCxjQUFBLEdBQUFJLENBQUEsTUFBQUosY0FBQSxHQUFBRSxDQUFBLE1BQ2xCLE1BQU8sQ0FDTEksS0FBSyxDQUFFLEVBQUUsQ0FDVEMsSUFBSSxDQUFFLEVBQUUsQ0FDUkMsS0FBSyxDQUFFLE1BQU0sQ0FDYkMsUUFBUSxDQUFFLFNBQVMsQ0FDbkJDLFFBQVEsQ0FBRSxJQUFJLENBQ2RDLFFBQVEsQ0FBRSxLQUFLLENBQ2ZDLFdBQVcsQ0FBRSxJQUFJLENBQ2pCQyxJQUFJLENBQUUsRUFBRSxDQUNSQyxTQUFTLENBQUUsQ0FBQyxDQUFFQyxJQUFJLENBQUUsWUFBYSxDQUFDLENBQUUsQ0FBRUEsSUFBSSxDQUFFLGFBQWMsQ0FBQyxDQUFDLENBQzVEQyxHQUFHLENBQUUsQ0FBQyxDQUFFRCxJQUFJLENBQUUsWUFBYSxDQUFDLENBQUMsQ0FDN0JFLElBQUksQ0FBRSxDQUFFQyxJQUFJLENBQUUsUUFBUSxDQUFFQyxFQUFFLENBQUUsS0FBTSxDQUFDLENBQ25DQyxVQUFVLENBQUUsQ0FDVkMsSUFBSSxDQUFFLEVBQ1IsQ0FBQyxDQUNEQyxPQUFPLENBQUUsS0FDWCxDQUFDLENBQ0gsQ0FDRixDQUFDLENBQ0gsQ0FBQyxDQUFDIn0= 
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMjQ5c3NuYXMzMyIsImFjdHVhbENvdmVyYWdlIiwicyIsImRlZmluZSIsImYiLCJjcmVhdGUiLCJ0aXRsZSIsInRhZ3MiLCJzdHlsZSIsInRpbWV6b25lIiwiZWRpdGFibGUiLCJmYWlsb3ZlciIsInBhbmVsX2hpbnRzIiwicm93cyIsInB1bGxkb3ducyIsInR5cGUiLCJuYXYiLCJ0aW1lIiwiZnJvbSIsInRvIiwidGVtcGxhdGluZyIsImxpc3QiLCJyZWZyZXNoIl0sInNvdXJjZXMiOlsiZGFzaGJvYXJkLW1vY2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICByZXR1cm4ge1xuICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICB0YWdzOiBbXSxcbiAgICAgICAgc3R5bGU6ICdkYXJrJyxcbiAgICAgICAgdGltZXpvbmU6ICdicm93c2VyJyxcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXG4gICAgICAgIGZhaWxvdmVyOiBmYWxzZSxcbiAgICAgICAgcGFuZWxfaGludHM6IHRydWUsXG4gICAgICAgIHJvd3M6IFtdLFxuICAgICAgICBwdWxsZG93bnM6IFt7IHR5cGU6ICd0ZW1wbGF0aW5nJyB9LCB7IHR5cGU6ICdhbm5vdGF0aW9ucycgfV0sXG4gICAgICAgIG5hdjogW3sgdHlwZTogJ3RpbWVwaWNrZXInIH1dLFxuICAgICAgICB0aW1lOiB7IGZyb206ICdub3ctNmgnLCB0bzogJ25vdycgfSxcbiAgICAgICAgdGVtcGxhdGluZzoge1xuICAgICAgICAgIGxpc3Q6IFtdLFxuICAgICAgICB9LFxuICAgICAgICByZWZyZXNoOiAnMTBzJyxcbiAgICAgIH07XG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sIm1hcHBpbmdzIjoiaXFDQWVZO0FBQUFBLGNBQUEsU0FBQUEsQ0FBQSxTQUFBQyxjQUFBLFdBQUFBLGNBQUEsRUFBQUQsY0FBQSxHQUFBQSxjQUFBLEdBQUFFLENBQUEsTUFmWkMsTUFBTSxDQUFDLEVBQUUsQ0FBRSxVQUFZLENBQ3JCLFlBQVksQ0FBQ0gsY0FBQSxHQUFBSSxDQUFBLE1BQUFKLGNBQUEsR0FBQUUsQ0FBQSxNQUViLE1BQU8sQ0FDTEcsTUFBTSxDQUFFLFFBQUFBLENBQUEsQ0FBWSxDQUFBTCxjQUFBLEdBQUFJLENBQUEsTUFBQUosY0FBQSxHQUFBRSxDQUFBLE1BQ2xCLE1BQU8sQ0FDTEksS0FBSyxDQUFFLEVBQUUsQ0FDVEMsSUFBSSxDQUFFLEVBQUUsQ0FDUkMsS0FBSyxDQUFFLE1BQU0sQ0FDYkMsUUFBUSxDQUFFLFNBQVMsQ0FDbkJDLFFBQVEsQ0FBRSxJQUFJLENBQ2RDLFFBQVEsQ0FBRSxLQUFLLENBQ2ZDLFdBQVcsQ0FBRSxJQUFJLENBQ2pCQyxJQUFJLENBQUUsRUFBRSxDQUNSQyxTQUFTLENBQUUsQ0FBQyxDQUFFQyxJQUFJLENBQUUsWUFBYSxDQUFDLENBQUUsQ0FBRUEsSUFBSSxDQUFFLGFBQWMsQ0FBQyxDQUFDLENBQzVEQyxHQUFHLENBQUUsQ0FBQyxDQUFFRCxJQUFJLENBQUUsWUFBYSxDQUFDLENBQUMsQ0FDN0JFLElBQUksQ0FBRSxDQUFFQyxJQUFJLENBQUUsUUFBUSxDQUFFQyxFQUFFLENBQUUsS0FBTSxDQUFDLENBQ25DQyxVQUFVLENBQUUsQ0FDVkMsSUFBSSxDQUFFLEVBQ1IsQ0FBQyxDQUNEQyxPQUFPLENBQUUsS0FDWCxDQUFDLENBQ0gsQ0FDRixDQUFDLENBQ0gsQ0FBQyxDQUFDIn0=