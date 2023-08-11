/** $IS_JS_PROFILER_INSTRUMENTED=true **/ (()=>{function d(e){let n=new Blob([e],{type:"text/javascript"}),t=URL.createObjectURL(n),s=new Worker(t);return URL.revokeObjectURL(t),s}function h(){return d('var r=class{constructor(e){this.cachedMessages=[];this.url=e,this.socket=this.createSocket()}createSocket(){let e=new WebSocket(this.url);return e.onopen=()=>this.onopen(),e.onclose=()=>this.onclose(),e}onclose(){this.socket=this.createSocket()}onopen(){console.log("Connection to Coverage Collector established."),this.cachedMessages.forEach(e=>this.socket.send(e)),this.cachedMessages=[]}send(e){this.socket.readyState===WebSocket.OPEN?this.socket.send(e):(this.cachedMessages.push(e),this.cachedMessages.length%500===0&&console.log(`More than ${this.cachedMessages.length} messages are queued to be sent.`))}};var C=20,m=1e3,d=class{constructor(e,t){this.milliseconds=e;this.onCountedToZero=t;this.timerHandle=null}restartCountdown(){this.stopCountdown(),this.timerHandle=self.setTimeout(()=>{this.stopCountdown(),this.onCountedToZero()},this.milliseconds)}stopCountdown(){this.timerHandle!==null&&(self.clearTimeout(this.timerHandle),this.timerHandle=null)}},a=class{constructor(e){this.socket=e,this.cachedCoveredRanges=new Map,this.numberOfCachedPositions=0,this.flushCountdown=new d(m,()=>this.flush())}addRange(e,t){if(!t.start.line||!t.end.line)return;let o=this.cachedCoveredRanges.get(e);o||(o=new Set,this.cachedCoveredRanges.set(e,o)),o.add(t),this.numberOfCachedPositions+=1,this.flushCountdown.restartCountdown(),this.numberOfCachedPositions>=C&&this.flush()}flush(){this.numberOfCachedPositions!==0&&(this.flushCountdown.stopCountdown(),this.cachedCoveredRanges.forEach((e,t)=>{let o=Array.from(e).map(n=>`${n.start.line}:${n.start.column}:${n.end.line}:${n.end.column}`);this.socket.send(`${"c"} ${t} ${o.join(" ")}`),e.clear()}),this.cachedCoveredRanges.clear(),this.numberOfCachedPositions=0)}};console.log("Starting coverage forwarding worker.");var u=new r("ws://localhost:34203/socket"),h=new a(u),f=new Map;onmessage=s=>{if(Array.isArray(s.data))p(s.data);else{let e=s.data;if(e.startsWith("s"))u.send(e);else if(e.startsWith("i")){let t=JSON.parse(e.substring(2));f.set(t.hash,t),console.info(`Received coverage mapping information for "${t.hash}".`)}else e==="unload"?h.flush():console.error(`No handler for message: ${e}`)}};function p(s){var n;let e=s[0],t=s[1],o=f.get(e);if(!o){console.log(`No coverage mapping information for ${e} available!`);return}for(let[c,i]of t.branches.entries()){let l=(n=o.branchMap[c])==null?void 0:n.locations[i];l&&h.addRange(e,l)}for(let c of t.statements){let i=o.statementMap[c];i&&h.addRange(e,i)}}\n')}function c(){return g()}function g(){return window}function p(e,n){let t=c()[e];return t||(t=n,c()[e]=t),t}var l;(function(r){r.MESSAGE_TYPE_SOURCEMAP="s",r.MESSAGE_TYPE_COVERAGE="c",r.ISTANBUL_COV_OBJECT="i",r.UNRESOLVED_CODE_ENTITY="u"})(l||(l={}));function v(e,n){let t=new Map;function s(i){let o=t.get(i);return o||(o={branches:new Map,statements:new Set},t.set(i,o),o)}function r(i,o,w){s(i).branches.set(o,w)}function u(i,o){s(i).statements.add(o)}function a(){n(t),t.clear()}return setInterval(()=>a(),e),{putBranchCoverage:r,putStatementCoverage:u,flush:a}}var C=p("__TS_AGENT",{});function f(){return C._$BcWorker}function S(e){return C._$BcWorker=e,e}var m=v(250,e=>{for(let n of e.entries())f().postMessage(n)});c()._$stmtCov=m.putStatementCoverage;c()._$brCov=m.putBranchCoverage;var b=new Set;c()._$registerCoverageObject=function(e){let n=e.hash;if(b.has(n)){console.log(`Coverage interceptor added twice for ${n}. This seems to be a bug in the instrumentation.`);return}else b.add(n);if(!f()){let t=S(new h);(function(){let r=()=>{m.flush(),t.postMessage("unload")},u=function(i,o){!o||o.addEventListener(i,r,{capture:!0})},a=g();u("blur",a),u("unload",a),u("visibilitychange",a),u("beforeunload",a)})()}(function(){f().postMessage(`${l.ISTANBUL_COV_OBJECT} ${JSON.stringify(e)}`);let s=p("sentMaps",new Set);e.inputSourceMap&&(s.has(e.path)||(f().postMessage(`${l.MESSAGE_TYPE_SOURCEMAP} ${n}:${JSON.stringify(e.inputSourceMap)}`),s.add(e.path)))})()};})();
 const _$fd00rn37 = "75de7d13668fe87243e83d4becfad04ad264f649";
function cov_12kkjjzjwq() {
  var path = "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/app/features/alerting/unified/search/search.terms.js";
  var hash = "75de7d13668fe87243e83d4becfad04ad264f649";
  var global = typeof window === 'object' ? window : this;
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/app/features/alerting/unified/search/search.terms.js",
    statementMap: {
      "0": {
        start: {
          line: 2,
          column: 31
        },
        end: {
          line: 2,
          column: 32
        }
      },
      "1": {
        start: {
          line: 3,
          column: 21
        },
        end: {
          line: 3,
          column: 22
        }
      },
      "2": {
        start: {
          line: 4,
          column: 20
        },
        end: {
          line: 4,
          column: 21
        }
      },
      "3": {
        start: {
          line: 5,
          column: 16
        },
        end: {
          line: 5,
          column: 17
        }
      },
      "4": {
        start: {
          line: 6,
          column: 19
        },
        end: {
          line: 6,
          column: 20
        }
      },
      "5": {
        start: {
          line: 7,
          column: 15
        },
        end: {
          line: 7,
          column: 16
        }
      },
      "6": {
        start: {
          line: 8,
          column: 15
        },
        end: {
          line: 8,
          column: 16
        }
      },
      "7": {
        start: {
          line: 9,
          column: 14
        },
        end: {
          line: 9,
          column: 15
        }
      },
      "8": {
        start: {
          line: 10,
          column: 15
        },
        end: {
          line: 10,
          column: 16
        }
      },
      "9": {
        start: {
          line: 11,
          column: 14
        },
        end: {
          line: 11,
          column: 16
        }
      },
      "10": {
        start: {
          line: 12,
          column: 16
        },
        end: {
          line: 12,
          column: 18
        }
      },
      "11": {
        start: {
          line: 13,
          column: 23
        },
        end: {
          line: 13,
          column: 25
        }
      },
      "12": {
        start: {
          line: 14,
          column: 29
        },
        end: {
          line: 14,
          column: 30
        }
      },
      "13": {
        start: {
          line: 15,
          column: 28
        },
        end: {
          line: 15,
          column: 29
        }
      },
      "14": {
        start: {
          line: 16,
          column: 24
        },
        end: {
          line: 16,
          column: 25
        }
      },
      "15": {
        start: {
          line: 17,
          column: 24
        },
        end: {
          line: 17,
          column: 25
        }
      },
      "16": {
        start: {
          line: 18,
          column: 23
        },
        end: {
          line: 18,
          column: 24
        }
      },
      "17": {
        start: {
          line: 19,
          column: 24
        },
        end: {
          line: 19,
          column: 25
        }
      },
      "18": {
        start: {
          line: 20,
          column: 23
        },
        end: {
          line: 20,
          column: 24
        }
      },
      "19": {
        start: {
          line: 21,
          column: 25
        },
        end: {
          line: 21,
          column: 26
        }
      }
    },
    fnMap: {},
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0
    },
    f: {},
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "75de7d13668fe87243e83d4becfad04ad264f649"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage=_$registerCoverageObject(coverage[path]);
  {
    // @ts-ignore
    cov_12kkjjzjwq = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_12kkjjzjwq(); // This file was generated by lezer-generator. You probably shouldn't edit it.
export const AlertRuleSearch = (1),
  FilterExpression = (2),
  DataSourceToken = (3),
  FilterValue = (4),
  NameSpaceToken = (5),
  LabelToken = (6),
  GroupToken = (7),
  RuleToken = (8),
  StateToken = (9),
  TypeToken = (10),
  HealthToken = (11),
  FreeFormExpression = (12),
  Dialect_dataSourceFilter = (0),
  Dialect_nameSpaceFilter = (1),
  Dialect_labelFilter = (2),
  Dialect_groupFilter = (3),
  Dialect_ruleFilter = (4),
  Dialect_stateFilter = (5),
  Dialect_typeFilter = (6),
  Dialect_healthFilter = (7);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMTJra2pqemp3cSIsImFjdHVhbENvdmVyYWdlIiwiQWxlcnRSdWxlU2VhcmNoIiwicyIsIkZpbHRlckV4cHJlc3Npb24iLCJEYXRhU291cmNlVG9rZW4iLCJGaWx0ZXJWYWx1ZSIsIk5hbWVTcGFjZVRva2VuIiwiTGFiZWxUb2tlbiIsIkdyb3VwVG9rZW4iLCJSdWxlVG9rZW4iLCJTdGF0ZVRva2VuIiwiVHlwZVRva2VuIiwiSGVhbHRoVG9rZW4iLCJGcmVlRm9ybUV4cHJlc3Npb24iLCJEaWFsZWN0X2RhdGFTb3VyY2VGaWx0ZXIiLCJEaWFsZWN0X25hbWVTcGFjZUZpbHRlciIsIkRpYWxlY3RfbGFiZWxGaWx0ZXIiLCJEaWFsZWN0X2dyb3VwRmlsdGVyIiwiRGlhbGVjdF9ydWxlRmlsdGVyIiwiRGlhbGVjdF9zdGF0ZUZpbHRlciIsIkRpYWxlY3RfdHlwZUZpbHRlciIsIkRpYWxlY3RfaGVhbHRoRmlsdGVyIl0sInNvdXJjZXMiOlsic2VhcmNoLnRlcm1zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoaXMgZmlsZSB3YXMgZ2VuZXJhdGVkIGJ5IGxlemVyLWdlbmVyYXRvci4gWW91IHByb2JhYmx5IHNob3VsZG4ndCBlZGl0IGl0LlxuZXhwb3J0IGNvbnN0IEFsZXJ0UnVsZVNlYXJjaCA9IDEsXG4gIEZpbHRlckV4cHJlc3Npb24gPSAyLFxuICBEYXRhU291cmNlVG9rZW4gPSAzLFxuICBGaWx0ZXJWYWx1ZSA9IDQsXG4gIE5hbWVTcGFjZVRva2VuID0gNSxcbiAgTGFiZWxUb2tlbiA9IDYsXG4gIEdyb3VwVG9rZW4gPSA3LFxuICBSdWxlVG9rZW4gPSA4LFxuICBTdGF0ZVRva2VuID0gOSxcbiAgVHlwZVRva2VuID0gMTAsXG4gIEhlYWx0aFRva2VuID0gMTEsXG4gIEZyZWVGb3JtRXhwcmVzc2lvbiA9IDEyLFxuICBEaWFsZWN0X2RhdGFTb3VyY2VGaWx0ZXIgPSAwLFxuICBEaWFsZWN0X25hbWVTcGFjZUZpbHRlciA9IDEsXG4gIERpYWxlY3RfbGFiZWxGaWx0ZXIgPSAyLFxuICBEaWFsZWN0X2dyb3VwRmlsdGVyID0gMyxcbiAgRGlhbGVjdF9ydWxlRmlsdGVyID0gNCxcbiAgRGlhbGVjdF9zdGF0ZUZpbHRlciA9IDUsXG4gIERpYWxlY3RfdHlwZUZpbHRlciA9IDYsXG4gIERpYWxlY3RfaGVhbHRoRmlsdGVyID0gNztcbiJdLCJtYXBwaW5ncyI6Im85REFlWTtBQUFBQSxjQUFBLFNBQUFBLENBQUEsU0FBQUMsY0FBQSxXQUFBQSxjQUFBLEVBQUFELGNBQUEsR0FmWjtBQUNBLE1BQU8sTUFBTSxDQUFBRSxlQUFlLEVBQUFGLGNBQUEsR0FBQUcsQ0FBQSxNQUFHLENBQUMsRUFDOUJDLGdCQUFnQixFQUFBSixjQUFBLEdBQUFHLENBQUEsTUFBRyxDQUFDLEVBQ3BCRSxlQUFlLEVBQUFMLGNBQUEsR0FBQUcsQ0FBQSxNQUFHLENBQUMsRUFDbkJHLFdBQVcsRUFBQU4sY0FBQSxHQUFBRyxDQUFBLE1BQUcsQ0FBQyxFQUNmSSxjQUFjLEVBQUFQLGNBQUEsR0FBQUcsQ0FBQSxNQUFHLENBQUMsRUFDbEJLLFVBQVUsRUFBQVIsY0FBQSxHQUFBRyxDQUFBLE1BQUcsQ0FBQyxFQUNkTSxVQUFVLEVBQUFULGNBQUEsR0FBQUcsQ0FBQSxNQUFHLENBQUMsRUFDZE8sU0FBUyxFQUFBVixjQUFBLEdBQUFHLENBQUEsTUFBRyxDQUFDLEVBQ2JRLFVBQVUsRUFBQVgsY0FBQSxHQUFBRyxDQUFBLE1BQUcsQ0FBQyxFQUNkUyxTQUFTLEVBQUFaLGNBQUEsR0FBQUcsQ0FBQSxNQUFHLEVBQUUsRUFDZFUsV0FBVyxFQUFBYixjQUFBLEdBQUFHLENBQUEsT0FBRyxFQUFFLEVBQ2hCVyxrQkFBa0IsRUFBQWQsY0FBQSxHQUFBRyxDQUFBLE9BQUcsRUFBRSxFQUN2Qlksd0JBQXdCLEVBQUFmLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMsRUFDNUJhLHVCQUF1QixFQUFBaEIsY0FBQSxHQUFBRyxDQUFBLE9BQUcsQ0FBQyxFQUMzQmMsbUJBQW1CLEVBQUFqQixjQUFBLEdBQUFHLENBQUEsT0FBRyxDQUFDLEVBQ3ZCZSxtQkFBbUIsRUFBQWxCLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMsRUFDdkJnQixrQkFBa0IsRUFBQW5CLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMsRUFDdEJpQixtQkFBbUIsRUFBQXBCLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMsRUFDdkJrQixrQkFBa0IsRUFBQXJCLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMsRUFDdEJtQixvQkFBb0IsRUFBQXRCLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMifQ== 
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMTJra2pqemp3cSIsImFjdHVhbENvdmVyYWdlIiwiQWxlcnRSdWxlU2VhcmNoIiwicyIsIkZpbHRlckV4cHJlc3Npb24iLCJEYXRhU291cmNlVG9rZW4iLCJGaWx0ZXJWYWx1ZSIsIk5hbWVTcGFjZVRva2VuIiwiTGFiZWxUb2tlbiIsIkdyb3VwVG9rZW4iLCJSdWxlVG9rZW4iLCJTdGF0ZVRva2VuIiwiVHlwZVRva2VuIiwiSGVhbHRoVG9rZW4iLCJGcmVlRm9ybUV4cHJlc3Npb24iLCJEaWFsZWN0X2RhdGFTb3VyY2VGaWx0ZXIiLCJEaWFsZWN0X25hbWVTcGFjZUZpbHRlciIsIkRpYWxlY3RfbGFiZWxGaWx0ZXIiLCJEaWFsZWN0X2dyb3VwRmlsdGVyIiwiRGlhbGVjdF9ydWxlRmlsdGVyIiwiRGlhbGVjdF9zdGF0ZUZpbHRlciIsIkRpYWxlY3RfdHlwZUZpbHRlciIsIkRpYWxlY3RfaGVhbHRoRmlsdGVyIl0sInNvdXJjZXMiOlsic2VhcmNoLnRlcm1zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoaXMgZmlsZSB3YXMgZ2VuZXJhdGVkIGJ5IGxlemVyLWdlbmVyYXRvci4gWW91IHByb2JhYmx5IHNob3VsZG4ndCBlZGl0IGl0LlxuZXhwb3J0IGNvbnN0IEFsZXJ0UnVsZVNlYXJjaCA9IDEsXG4gIEZpbHRlckV4cHJlc3Npb24gPSAyLFxuICBEYXRhU291cmNlVG9rZW4gPSAzLFxuICBGaWx0ZXJWYWx1ZSA9IDQsXG4gIE5hbWVTcGFjZVRva2VuID0gNSxcbiAgTGFiZWxUb2tlbiA9IDYsXG4gIEdyb3VwVG9rZW4gPSA3LFxuICBSdWxlVG9rZW4gPSA4LFxuICBTdGF0ZVRva2VuID0gOSxcbiAgVHlwZVRva2VuID0gMTAsXG4gIEhlYWx0aFRva2VuID0gMTEsXG4gIEZyZWVGb3JtRXhwcmVzc2lvbiA9IDEyLFxuICBEaWFsZWN0X2RhdGFTb3VyY2VGaWx0ZXIgPSAwLFxuICBEaWFsZWN0X25hbWVTcGFjZUZpbHRlciA9IDEsXG4gIERpYWxlY3RfbGFiZWxGaWx0ZXIgPSAyLFxuICBEaWFsZWN0X2dyb3VwRmlsdGVyID0gMyxcbiAgRGlhbGVjdF9ydWxlRmlsdGVyID0gNCxcbiAgRGlhbGVjdF9zdGF0ZUZpbHRlciA9IDUsXG4gIERpYWxlY3RfdHlwZUZpbHRlciA9IDYsXG4gIERpYWxlY3RfaGVhbHRoRmlsdGVyID0gNztcbiJdLCJtYXBwaW5ncyI6Im85REFlWTtBQUFBQSxjQUFBLFNBQUFBLENBQUEsU0FBQUMsY0FBQSxXQUFBQSxjQUFBLEVBQUFELGNBQUEsR0FmWjtBQUNBLE1BQU8sTUFBTSxDQUFBRSxlQUFlLEVBQUFGLGNBQUEsR0FBQUcsQ0FBQSxNQUFHLENBQUMsRUFDOUJDLGdCQUFnQixFQUFBSixjQUFBLEdBQUFHLENBQUEsTUFBRyxDQUFDLEVBQ3BCRSxlQUFlLEVBQUFMLGNBQUEsR0FBQUcsQ0FBQSxNQUFHLENBQUMsRUFDbkJHLFdBQVcsRUFBQU4sY0FBQSxHQUFBRyxDQUFBLE1BQUcsQ0FBQyxFQUNmSSxjQUFjLEVBQUFQLGNBQUEsR0FBQUcsQ0FBQSxNQUFHLENBQUMsRUFDbEJLLFVBQVUsRUFBQVIsY0FBQSxHQUFBRyxDQUFBLE1BQUcsQ0FBQyxFQUNkTSxVQUFVLEVBQUFULGNBQUEsR0FBQUcsQ0FBQSxNQUFHLENBQUMsRUFDZE8sU0FBUyxFQUFBVixjQUFBLEdBQUFHLENBQUEsTUFBRyxDQUFDLEVBQ2JRLFVBQVUsRUFBQVgsY0FBQSxHQUFBRyxDQUFBLE1BQUcsQ0FBQyxFQUNkUyxTQUFTLEVBQUFaLGNBQUEsR0FBQUcsQ0FBQSxNQUFHLEVBQUUsRUFDZFUsV0FBVyxFQUFBYixjQUFBLEdBQUFHLENBQUEsT0FBRyxFQUFFLEVBQ2hCVyxrQkFBa0IsRUFBQWQsY0FBQSxHQUFBRyxDQUFBLE9BQUcsRUFBRSxFQUN2Qlksd0JBQXdCLEVBQUFmLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMsRUFDNUJhLHVCQUF1QixFQUFBaEIsY0FBQSxHQUFBRyxDQUFBLE9BQUcsQ0FBQyxFQUMzQmMsbUJBQW1CLEVBQUFqQixjQUFBLEdBQUFHLENBQUEsT0FBRyxDQUFDLEVBQ3ZCZSxtQkFBbUIsRUFBQWxCLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMsRUFDdkJnQixrQkFBa0IsRUFBQW5CLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMsRUFDdEJpQixtQkFBbUIsRUFBQXBCLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMsRUFDdkJrQixrQkFBa0IsRUFBQXJCLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMsRUFDdEJtQixvQkFBb0IsRUFBQXRCLGNBQUEsR0FBQUcsQ0FBQSxPQUFHLENBQUMifQ==