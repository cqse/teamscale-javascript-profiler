/** $IS_JS_PROFILER_INSTRUMENTED=true **/ (()=>{function d(e){let n=new Blob([e],{type:"text/javascript"}),t=URL.createObjectURL(n),s=new Worker(t);return URL.revokeObjectURL(t),s}function h(){return d('var r=class{constructor(e){this.cachedMessages=[];this.url=e,this.socket=this.createSocket()}createSocket(){let e=new WebSocket(this.url);return e.onopen=()=>this.onopen(),e.onclose=()=>this.onclose(),e}onclose(){this.socket=this.createSocket()}onopen(){console.log("Connection to Coverage Collector established."),this.cachedMessages.forEach(e=>this.socket.send(e)),this.cachedMessages=[]}send(e){this.socket.readyState===WebSocket.OPEN?this.socket.send(e):(this.cachedMessages.push(e),this.cachedMessages.length%500===0&&console.log(`More than ${this.cachedMessages.length} messages are queued to be sent.`))}};var C=20,m=1e3,d=class{constructor(e,t){this.milliseconds=e;this.onCountedToZero=t;this.timerHandle=null}restartCountdown(){this.stopCountdown(),this.timerHandle=self.setTimeout(()=>{this.stopCountdown(),this.onCountedToZero()},this.milliseconds)}stopCountdown(){this.timerHandle!==null&&(self.clearTimeout(this.timerHandle),this.timerHandle=null)}},a=class{constructor(e){this.socket=e,this.cachedCoveredRanges=new Map,this.numberOfCachedPositions=0,this.flushCountdown=new d(m,()=>this.flush())}addRange(e,t){if(!t.start.line||!t.end.line)return;let o=this.cachedCoveredRanges.get(e);o||(o=new Set,this.cachedCoveredRanges.set(e,o)),o.add(t),this.numberOfCachedPositions+=1,this.flushCountdown.restartCountdown(),this.numberOfCachedPositions>=C&&this.flush()}flush(){this.numberOfCachedPositions!==0&&(this.flushCountdown.stopCountdown(),this.cachedCoveredRanges.forEach((e,t)=>{let o=Array.from(e).map(n=>`${n.start.line}:${n.start.column}:${n.end.line}:${n.end.column}`);this.socket.send(`${"c"} ${t} ${o.join(" ")}`),e.clear()}),this.cachedCoveredRanges.clear(),this.numberOfCachedPositions=0)}};console.log("Starting coverage forwarding worker.");var u=new r("ws://localhost:46427/socket"),h=new a(u),f=new Map;onmessage=s=>{if(Array.isArray(s.data))p(s.data);else{let e=s.data;if(e.startsWith("s"))u.send(e);else if(e.startsWith("i")){let t=JSON.parse(e.substring(2));f.set(t.hash,t),console.info(`Received coverage mapping information for "${t.hash}".`)}else e==="unload"?h.flush():console.error(`No handler for message: ${e}`)}};function p(s){var n;let e=s[0],t=s[1],o=f.get(e);if(!o){console.log(`No coverage mapping information for ${e} available!`);return}for(let[c,i]of t.branches.entries()){let l=(n=o.branchMap[c])==null?void 0:n.locations[i];l&&h.addRange(e,l)}for(let c of t.statements){let i=o.statementMap[c];i&&h.addRange(e,i)}}\n')}function c(){return g()}function g(){return window}function p(e,n){let t=c()[e];return t||(t=n,c()[e]=t),t}var l;(function(r){r.MESSAGE_TYPE_SOURCEMAP="s",r.MESSAGE_TYPE_COVERAGE="c",r.ISTANBUL_COV_OBJECT="i",r.UNRESOLVED_CODE_ENTITY="u"})(l||(l={}));function v(e,n){let t=new Map;function s(i){let o=t.get(i);return o||(o={branches:new Map,statements:new Set},t.set(i,o),o)}function r(i,o,w){s(i).branches.set(o,w)}function u(i,o){s(i).statements.add(o)}function a(){n(t),t.clear()}return setInterval(()=>a(),e),{putBranchCoverage:r,putStatementCoverage:u,flush:a}}var C=p("__TS_AGENT",{});function f(){return C._$BcWorker}function S(e){return C._$BcWorker=e,e}var m=v(250,e=>{for(let n of e.entries())f().postMessage(n)});c()._$stmtCov=m.putStatementCoverage;c()._$brCov=m.putBranchCoverage;var b=new Set;c()._$registerCoverageObject=function(e){let n=e.hash;if(b.has(n)){console.log(`Coverage interceptor added twice for ${n}. This seems to be a bug in the instrumentation.`);return}else b.add(n);if(!f()){let t=S(new h);(function(){let r=()=>{m.flush(),t.postMessage("unload")},u=function(i,o){!o||o.addEventListener(i,r,{capture:!0})},a=g();u("blur",a),u("unload",a),u("visibilitychange",a),u("beforeunload",a)})()}(function(){f().postMessage(`${l.ISTANBUL_COV_OBJECT} ${JSON.stringify(e)}`);let s=p("sentMaps",new Set);e.inputSourceMap&&(s.has(e.path)||(f().postMessage(`${l.MESSAGE_TYPE_SOURCEMAP} ${n}:${JSON.stringify(e.inputSourceMap)}`),s.add(e.path)))})()};})();
 const _$ffkd959j = "134e663655f0797ba1dc04abc4dd6a77c08f80a2";
function cov_1rimpxwdry() {
  var path = "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/test/jest-resolver.js";
  var hash = "134e663655f0797ba1dc04abc4dd6a77c08f80a2";
  var global = typeof window === 'object' ? window : this;
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/test/jest-resolver.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 0
        },
        end: {
          line: 33,
          column: 2
        }
      },
      "1": {
        start: {
          line: 3,
          column: 2
        },
        end: {
          line: 32,
          column: 5
        }
      },
      "2": {
        start: {
          line: 26,
          column: 6
        },
        end: {
          line: 29,
          column: 7
        }
      },
      "3": {
        start: {
          line: 27,
          column: 8
        },
        end: {
          line: 27,
          column: 30
        }
      },
      "4": {
        start: {
          line: 28,
          column: 8
        },
        end: {
          line: 28,
          column: 29
        }
      },
      "5": {
        start: {
          line: 30,
          column: 6
        },
        end: {
          line: 30,
          column: 17
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 1,
            column: 17
          },
          end: {
            line: 1,
            column: 18
          }
        },
        loc: {
          start: {
            line: 1,
            column: 36
          },
          end: {
            line: 33,
            column: 1
          }
        },
        line: 1
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 6,
            column: 19
          },
          end: {
            line: 6,
            column: 20
          }
        },
        loc: {
          start: {
            line: 6,
            column: 28
          },
          end: {
            line: 31,
            column: 5
          }
        },
        line: 6
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 26,
            column: 6
          },
          end: {
            line: 29,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 26,
            column: 6
          },
          end: {
            line: 29,
            column: 7
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 26
      },
      "1": {
        loc: {
          start: {
            line: 26,
            column: 10
          },
          end: {
            line: 26,
            column: 62
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 26,
            column: 10
          },
          end: {
            line: 26,
            column: 29
          }
        }, {
          start: {
            line: 26,
            column: 33
          },
          end: {
            line: 26,
            column: 62
          }
        }],
        line: 26
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    f: {
      "0": 0,
      "1": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "134e663655f0797ba1dc04abc4dd6a77c08f80a2"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage=_$registerCoverageObject(coverage[path]);
  {
    // @ts-ignore
    cov_1rimpxwdry = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1rimpxwdry();
module.exports = (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    // Use packageFilter to process parsed `package.json` before the resolution (see https://www.npmjs.com/package/resolve#resolveid-opts-cb)
    packageFilter: pkg => {
      // see https://github.com/microsoft/accessibility-insights-web/pull/5421#issuecomment-1109168149
      // see https://github.com/uuidjs/uuid/pull/616
      //
      // jest-environment-jsdom 28+ tries to use browser exports instead of default exports,
      // but uuid/react-colorful only offers an ESM browser export and not a CommonJS one. Jest does not yet
      // support ESM modules natively, so this causes a Jest error related to trying to parse
      // "export" syntax.
      //
      // This workaround prevents Jest from considering uuid/react-colorful's module-based exports at all;
      // it falls back to uuid's CommonJS+node "main" property.
      //
      // Once we're able to migrate our Jest config to ESM and a browser crypto
      // implementation is available for the browser+ESM version of uuid to use (eg, via
      // https://github.com/jsdom/jsdom/pull/3352 or a similar polyfill), this can go away.
      //
      // How to test if this is needed anymore:
      // - comment it out
      // - run `yarn test`
      // - if all the tests pass, it means the workaround is no longer needed
      if ((pkg.name === 'uuid') || (pkg.name === 'react-colorful')) {
        delete pkg['exports'];
        delete pkg['module'];
      } else {}
      return pkg;
    }
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXJpbXB4d2RyeSIsImFjdHVhbENvdmVyYWdlIiwicyIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXRoIiwib3B0aW9ucyIsImYiLCJkZWZhdWx0UmVzb2x2ZXIiLCJwYWNrYWdlRmlsdGVyIiwicGtnIiwiYiIsIm5hbWUiXSwic291cmNlcyI6WyJqZXN0LXJlc29sdmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKHBhdGgsIG9wdGlvbnMpID0+IHtcbiAgLy8gQ2FsbCB0aGUgZGVmYXVsdFJlc29sdmVyLCBzbyB3ZSBsZXZlcmFnZSBpdHMgY2FjaGUsIGVycm9yIGhhbmRsaW5nLCBldGMuXG4gIHJldHVybiBvcHRpb25zLmRlZmF1bHRSZXNvbHZlcihwYXRoLCB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICAvLyBVc2UgcGFja2FnZUZpbHRlciB0byBwcm9jZXNzIHBhcnNlZCBgcGFja2FnZS5qc29uYCBiZWZvcmUgdGhlIHJlc29sdXRpb24gKHNlZSBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9yZXNvbHZlI3Jlc29sdmVpZC1vcHRzLWNiKVxuICAgIHBhY2thZ2VGaWx0ZXI6IChwa2cpID0+IHtcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L2FjY2Vzc2liaWxpdHktaW5zaWdodHMtd2ViL3B1bGwvNTQyMSNpc3N1ZWNvbW1lbnQtMTEwOTE2ODE0OVxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZC9wdWxsLzYxNlxuICAgICAgLy9cbiAgICAgIC8vIGplc3QtZW52aXJvbm1lbnQtanNkb20gMjgrIHRyaWVzIHRvIHVzZSBicm93c2VyIGV4cG9ydHMgaW5zdGVhZCBvZiBkZWZhdWx0IGV4cG9ydHMsXG4gICAgICAvLyBidXQgdXVpZC9yZWFjdC1jb2xvcmZ1bCBvbmx5IG9mZmVycyBhbiBFU00gYnJvd3NlciBleHBvcnQgYW5kIG5vdCBhIENvbW1vbkpTIG9uZS4gSmVzdCBkb2VzIG5vdCB5ZXRcbiAgICAgIC8vIHN1cHBvcnQgRVNNIG1vZHVsZXMgbmF0aXZlbHksIHNvIHRoaXMgY2F1c2VzIGEgSmVzdCBlcnJvciByZWxhdGVkIHRvIHRyeWluZyB0byBwYXJzZVxuICAgICAgLy8gXCJleHBvcnRcIiBzeW50YXguXG4gICAgICAvL1xuICAgICAgLy8gVGhpcyB3b3JrYXJvdW5kIHByZXZlbnRzIEplc3QgZnJvbSBjb25zaWRlcmluZyB1dWlkL3JlYWN0LWNvbG9yZnVsJ3MgbW9kdWxlLWJhc2VkIGV4cG9ydHMgYXQgYWxsO1xuICAgICAgLy8gaXQgZmFsbHMgYmFjayB0byB1dWlkJ3MgQ29tbW9uSlMrbm9kZSBcIm1haW5cIiBwcm9wZXJ0eS5cbiAgICAgIC8vXG4gICAgICAvLyBPbmNlIHdlJ3JlIGFibGUgdG8gbWlncmF0ZSBvdXIgSmVzdCBjb25maWcgdG8gRVNNIGFuZCBhIGJyb3dzZXIgY3J5cHRvXG4gICAgICAvLyBpbXBsZW1lbnRhdGlvbiBpcyBhdmFpbGFibGUgZm9yIHRoZSBicm93c2VyK0VTTSB2ZXJzaW9uIG9mIHV1aWQgdG8gdXNlIChlZywgdmlhXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vanNkb20vanNkb20vcHVsbC8zMzUyIG9yIGEgc2ltaWxhciBwb2x5ZmlsbCksIHRoaXMgY2FuIGdvIGF3YXkuXG4gICAgICAvL1xuICAgICAgLy8gSG93IHRvIHRlc3QgaWYgdGhpcyBpcyBuZWVkZWQgYW55bW9yZTpcbiAgICAgIC8vIC0gY29tbWVudCBpdCBvdXRcbiAgICAgIC8vIC0gcnVuIGB5YXJuIHRlc3RgXG4gICAgICAvLyAtIGlmIGFsbCB0aGUgdGVzdHMgcGFzcywgaXQgbWVhbnMgdGhlIHdvcmthcm91bmQgaXMgbm8gbG9uZ2VyIG5lZWRlZFxuICAgICAgaWYgKHBrZy5uYW1lID09PSAndXVpZCcgfHwgcGtnLm5hbWUgPT09ICdyZWFjdC1jb2xvcmZ1bCcpIHtcbiAgICAgICAgZGVsZXRlIHBrZ1snZXhwb3J0cyddO1xuICAgICAgICBkZWxldGUgcGtnWydtb2R1bGUnXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwa2c7XG4gICAgfSxcbiAgfSk7XG59O1xuIl0sIm1hcHBpbmdzIjoic3dEQWVZO0FBQUFBLGNBQUEsU0FBQUEsQ0FBQSxTQUFBQyxjQUFBLFdBQUFBLGNBQUEsRUFBQUQsY0FBQSxHQUFBQSxjQUFBLEdBQUFFLENBQUEsTUFmWkMsTUFBTSxDQUFDQyxPQUFPLENBQUcsQ0FBQ0MsSUFBSSxDQUFFQyxPQUFPLEdBQUssQ0FBQU4sY0FBQSxHQUFBTyxDQUFBLE1BQUFQLGNBQUEsR0FBQUUsQ0FBQSxNQUNsQztBQUNBLE1BQU8sQ0FBQUksT0FBTyxDQUFDRSxlQUFlLENBQUNILElBQUksQ0FBRSxDQUNuQyxHQUFHQyxPQUFPLENBQ1Y7QUFDQUcsYUFBYSxDQUFHQyxHQUFHLEVBQUssQ0FBQVYsY0FBQSxHQUFBTyxDQUFBLE1BQUFQLGNBQUEsR0FBQUUsQ0FBQSxNQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUksQ0FBQUYsY0FBQSxHQUFBVyxDQUFBLFNBQUFELEdBQUcsQ0FBQ0UsSUFBSSxHQUFLLE1BQU0sSUFBQVosY0FBQSxHQUFBVyxDQUFBLFNBQUlELEdBQUcsQ0FBQ0UsSUFBSSxHQUFLLGdCQUFnQixFQUFFLENBQUFaLGNBQUEsR0FBQVcsQ0FBQSxTQUFBWCxjQUFBLEdBQUFFLENBQUEsTUFDeEQsTUFBTyxDQUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUNWLGNBQUEsR0FBQUUsQ0FBQSxNQUN0QixNQUFPLENBQUFRLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FDdEIsQ0FBQyxLQUFBVixjQUFBLEdBQUFXLENBQUEsVUFBQVgsY0FBQSxHQUFBRSxDQUFBLE1BQ0QsTUFBTyxDQUFBUSxHQUFHLENBQ1osQ0FDRixDQUFDLENBQUMsQ0FDSixDQUFDIn0= 
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXJpbXB4d2RyeSIsImFjdHVhbENvdmVyYWdlIiwicyIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXRoIiwib3B0aW9ucyIsImYiLCJkZWZhdWx0UmVzb2x2ZXIiLCJwYWNrYWdlRmlsdGVyIiwicGtnIiwiYiIsIm5hbWUiXSwic291cmNlcyI6WyJqZXN0LXJlc29sdmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKHBhdGgsIG9wdGlvbnMpID0+IHtcbiAgLy8gQ2FsbCB0aGUgZGVmYXVsdFJlc29sdmVyLCBzbyB3ZSBsZXZlcmFnZSBpdHMgY2FjaGUsIGVycm9yIGhhbmRsaW5nLCBldGMuXG4gIHJldHVybiBvcHRpb25zLmRlZmF1bHRSZXNvbHZlcihwYXRoLCB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICAvLyBVc2UgcGFja2FnZUZpbHRlciB0byBwcm9jZXNzIHBhcnNlZCBgcGFja2FnZS5qc29uYCBiZWZvcmUgdGhlIHJlc29sdXRpb24gKHNlZSBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9yZXNvbHZlI3Jlc29sdmVpZC1vcHRzLWNiKVxuICAgIHBhY2thZ2VGaWx0ZXI6IChwa2cpID0+IHtcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L2FjY2Vzc2liaWxpdHktaW5zaWdodHMtd2ViL3B1bGwvNTQyMSNpc3N1ZWNvbW1lbnQtMTEwOTE2ODE0OVxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZC9wdWxsLzYxNlxuICAgICAgLy9cbiAgICAgIC8vIGplc3QtZW52aXJvbm1lbnQtanNkb20gMjgrIHRyaWVzIHRvIHVzZSBicm93c2VyIGV4cG9ydHMgaW5zdGVhZCBvZiBkZWZhdWx0IGV4cG9ydHMsXG4gICAgICAvLyBidXQgdXVpZC9yZWFjdC1jb2xvcmZ1bCBvbmx5IG9mZmVycyBhbiBFU00gYnJvd3NlciBleHBvcnQgYW5kIG5vdCBhIENvbW1vbkpTIG9uZS4gSmVzdCBkb2VzIG5vdCB5ZXRcbiAgICAgIC8vIHN1cHBvcnQgRVNNIG1vZHVsZXMgbmF0aXZlbHksIHNvIHRoaXMgY2F1c2VzIGEgSmVzdCBlcnJvciByZWxhdGVkIHRvIHRyeWluZyB0byBwYXJzZVxuICAgICAgLy8gXCJleHBvcnRcIiBzeW50YXguXG4gICAgICAvL1xuICAgICAgLy8gVGhpcyB3b3JrYXJvdW5kIHByZXZlbnRzIEplc3QgZnJvbSBjb25zaWRlcmluZyB1dWlkL3JlYWN0LWNvbG9yZnVsJ3MgbW9kdWxlLWJhc2VkIGV4cG9ydHMgYXQgYWxsO1xuICAgICAgLy8gaXQgZmFsbHMgYmFjayB0byB1dWlkJ3MgQ29tbW9uSlMrbm9kZSBcIm1haW5cIiBwcm9wZXJ0eS5cbiAgICAgIC8vXG4gICAgICAvLyBPbmNlIHdlJ3JlIGFibGUgdG8gbWlncmF0ZSBvdXIgSmVzdCBjb25maWcgdG8gRVNNIGFuZCBhIGJyb3dzZXIgY3J5cHRvXG4gICAgICAvLyBpbXBsZW1lbnRhdGlvbiBpcyBhdmFpbGFibGUgZm9yIHRoZSBicm93c2VyK0VTTSB2ZXJzaW9uIG9mIHV1aWQgdG8gdXNlIChlZywgdmlhXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vanNkb20vanNkb20vcHVsbC8zMzUyIG9yIGEgc2ltaWxhciBwb2x5ZmlsbCksIHRoaXMgY2FuIGdvIGF3YXkuXG4gICAgICAvL1xuICAgICAgLy8gSG93IHRvIHRlc3QgaWYgdGhpcyBpcyBuZWVkZWQgYW55bW9yZTpcbiAgICAgIC8vIC0gY29tbWVudCBpdCBvdXRcbiAgICAgIC8vIC0gcnVuIGB5YXJuIHRlc3RgXG4gICAgICAvLyAtIGlmIGFsbCB0aGUgdGVzdHMgcGFzcywgaXQgbWVhbnMgdGhlIHdvcmthcm91bmQgaXMgbm8gbG9uZ2VyIG5lZWRlZFxuICAgICAgaWYgKHBrZy5uYW1lID09PSAndXVpZCcgfHwgcGtnLm5hbWUgPT09ICdyZWFjdC1jb2xvcmZ1bCcpIHtcbiAgICAgICAgZGVsZXRlIHBrZ1snZXhwb3J0cyddO1xuICAgICAgICBkZWxldGUgcGtnWydtb2R1bGUnXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwa2c7XG4gICAgfSxcbiAgfSk7XG59O1xuIl0sIm1hcHBpbmdzIjoic3dEQWVZO0FBQUFBLGNBQUEsU0FBQUEsQ0FBQSxTQUFBQyxjQUFBLFdBQUFBLGNBQUEsRUFBQUQsY0FBQSxHQUFBQSxjQUFBLEdBQUFFLENBQUEsTUFmWkMsTUFBTSxDQUFDQyxPQUFPLENBQUcsQ0FBQ0MsSUFBSSxDQUFFQyxPQUFPLEdBQUssQ0FBQU4sY0FBQSxHQUFBTyxDQUFBLE1BQUFQLGNBQUEsR0FBQUUsQ0FBQSxNQUNsQztBQUNBLE1BQU8sQ0FBQUksT0FBTyxDQUFDRSxlQUFlLENBQUNILElBQUksQ0FBRSxDQUNuQyxHQUFHQyxPQUFPLENBQ1Y7QUFDQUcsYUFBYSxDQUFHQyxHQUFHLEVBQUssQ0FBQVYsY0FBQSxHQUFBTyxDQUFBLE1BQUFQLGNBQUEsR0FBQUUsQ0FBQSxNQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUksQ0FBQUYsY0FBQSxHQUFBVyxDQUFBLFNBQUFELEdBQUcsQ0FBQ0UsSUFBSSxHQUFLLE1BQU0sSUFBQVosY0FBQSxHQUFBVyxDQUFBLFNBQUlELEdBQUcsQ0FBQ0UsSUFBSSxHQUFLLGdCQUFnQixFQUFFLENBQUFaLGNBQUEsR0FBQVcsQ0FBQSxTQUFBWCxjQUFBLEdBQUFFLENBQUEsTUFDeEQsTUFBTyxDQUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUNWLGNBQUEsR0FBQUUsQ0FBQSxNQUN0QixNQUFPLENBQUFRLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FDdEIsQ0FBQyxLQUFBVixjQUFBLEdBQUFXLENBQUEsVUFBQVgsY0FBQSxHQUFBRSxDQUFBLE1BQ0QsTUFBTyxDQUFBUSxHQUFHLENBQ1osQ0FDRixDQUFDLENBQUMsQ0FDSixDQUFDIn0=