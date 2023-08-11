/** $IS_JS_PROFILER_INSTRUMENTED=true **/ (()=>{function d(e){let n=new Blob([e],{type:"text/javascript"}),t=URL.createObjectURL(n),s=new Worker(t);return URL.revokeObjectURL(t),s}function h(){return d('var r=class{constructor(e){this.cachedMessages=[];this.url=e,this.socket=this.createSocket()}createSocket(){let e=new WebSocket(this.url);return e.onopen=()=>this.onopen(),e.onclose=()=>this.onclose(),e}onclose(){this.socket=this.createSocket()}onopen(){console.log("Connection to Coverage Collector established."),this.cachedMessages.forEach(e=>this.socket.send(e)),this.cachedMessages=[]}send(e){this.socket.readyState===WebSocket.OPEN?this.socket.send(e):(this.cachedMessages.push(e),this.cachedMessages.length%500===0&&console.log(`More than ${this.cachedMessages.length} messages are queued to be sent.`))}};var C=20,m=1e3,d=class{constructor(e,t){this.milliseconds=e;this.onCountedToZero=t;this.timerHandle=null}restartCountdown(){this.stopCountdown(),this.timerHandle=self.setTimeout(()=>{this.stopCountdown(),this.onCountedToZero()},this.milliseconds)}stopCountdown(){this.timerHandle!==null&&(self.clearTimeout(this.timerHandle),this.timerHandle=null)}},a=class{constructor(e){this.socket=e,this.cachedCoveredRanges=new Map,this.numberOfCachedPositions=0,this.flushCountdown=new d(m,()=>this.flush())}addRange(e,t){if(!t.start.line||!t.end.line)return;let o=this.cachedCoveredRanges.get(e);o||(o=new Set,this.cachedCoveredRanges.set(e,o)),o.add(t),this.numberOfCachedPositions+=1,this.flushCountdown.restartCountdown(),this.numberOfCachedPositions>=C&&this.flush()}flush(){this.numberOfCachedPositions!==0&&(this.flushCountdown.stopCountdown(),this.cachedCoveredRanges.forEach((e,t)=>{let o=Array.from(e).map(n=>`${n.start.line}:${n.start.column}:${n.end.line}:${n.end.column}`);this.socket.send(`${"c"} ${t} ${o.join(" ")}`),e.clear()}),this.cachedCoveredRanges.clear(),this.numberOfCachedPositions=0)}};console.log("Starting coverage forwarding worker.");var u=new r("ws://localhost:46427/socket"),h=new a(u),f=new Map;onmessage=s=>{if(Array.isArray(s.data))p(s.data);else{let e=s.data;if(e.startsWith("s"))u.send(e);else if(e.startsWith("i")){let t=JSON.parse(e.substring(2));f.set(t.hash,t),console.info(`Received coverage mapping information for "${t.hash}".`)}else e==="unload"?h.flush():console.error(`No handler for message: ${e}`)}};function p(s){var n;let e=s[0],t=s[1],o=f.get(e);if(!o){console.log(`No coverage mapping information for ${e} available!`);return}for(let[c,i]of t.branches.entries()){let l=(n=o.branchMap[c])==null?void 0:n.locations[i];l&&h.addRange(e,l)}for(let c of t.statements){let i=o.statementMap[c];i&&h.addRange(e,i)}}\n')}function c(){return g()}function g(){return window}function p(e,n){let t=c()[e];return t||(t=n,c()[e]=t),t}var l;(function(r){r.MESSAGE_TYPE_SOURCEMAP="s",r.MESSAGE_TYPE_COVERAGE="c",r.ISTANBUL_COV_OBJECT="i",r.UNRESOLVED_CODE_ENTITY="u"})(l||(l={}));function v(e,n){let t=new Map;function s(i){let o=t.get(i);return o||(o={branches:new Map,statements:new Set},t.set(i,o),o)}function r(i,o,w){s(i).branches.set(o,w)}function u(i,o){s(i).statements.add(o)}function a(){n(t),t.clear()}return setInterval(()=>a(),e),{putBranchCoverage:r,putStatementCoverage:u,flush:a}}var C=p("__TS_AGENT",{});function f(){return C._$BcWorker}function S(e){return C._$BcWorker=e,e}var m=v(250,e=>{for(let n of e.entries())f().postMessage(n)});c()._$stmtCov=m.putStatementCoverage;c()._$brCov=m.putBranchCoverage;var b=new Set;c()._$registerCoverageObject=function(e){let n=e.hash;if(b.has(n)){console.log(`Coverage interceptor added twice for ${n}. This seems to be a bug in the instrumentation.`);return}else b.add(n);if(!f()){let t=S(new h);(function(){let r=()=>{m.flush(),t.postMessage("unload")},u=function(i,o){!o||o.addEventListener(i,r,{capture:!0})},a=g();u("blur",a),u("unload",a),u("visibilitychange",a),u("beforeunload",a)})()}(function(){f().postMessage(`${l.ISTANBUL_COV_OBJECT} ${JSON.stringify(e)}`);let s=p("sentMaps",new Set);e.inputSourceMap&&(s.has(e.path)||(f().postMessage(`${l.MESSAGE_TYPE_SOURCEMAP} ${n}:${JSON.stringify(e.inputSourceMap)}`),s.add(e.path)))})()};})();
 const _$ffkd959k = "24d233ded4f441ef928fdd4539db14930e2cf5fd";
function cov_1uey9gahi5() {
  var path = "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/test/log-reporter.js";
  var hash = "24d233ded4f441ef928fdd4539db14930e2cf5fd";
  var global = typeof window === 'object' ? window : this;
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/test/log-reporter.js",
    statementMap: {
      "0": {
        start: {
          line: 3,
          column: 4
        },
        end: {
          line: 3,
          column: 38
        }
      },
      "1": {
        start: {
          line: 4,
          column: 4
        },
        end: {
          line: 4,
          column: 36
        }
      },
      "2": {
        start: {
          line: 5,
          column: 4
        },
        end: {
          line: 5,
          column: 36
        }
      },
      "3": {
        start: {
          line: 9,
          column: 4
        },
        end: {
          line: 11,
          column: 5
        }
      },
      "4": {
        start: {
          line: 10,
          column: 6
        },
        end: {
          line: 10,
          column: 13
        }
      },
      "5": {
        start: {
          line: 13,
          column: 4
        },
        end: {
          line: 13,
          column: 27
        }
      },
      "6": {
        start: {
          line: 14,
          column: 4
        },
        end: {
          line: 14,
          column: 34
        }
      },
      "7": {
        start: {
          line: 18,
          column: 4
        },
        end: {
          line: 18,
          column: 51
        }
      },
      "8": {
        start: {
          line: 22,
          column: 18
        },
        end: {
          line: 29,
          column: 5
        }
      },
      "9": {
        start: {
          line: 31,
          column: 4
        },
        end: {
          line: 31,
          column: 58
        }
      },
      "10": {
        start: {
          line: 36,
          column: 2
        },
        end: {
          line: 38,
          column: 3
        }
      },
      "11": {
        start: {
          line: 37,
          column: 4
        },
        end: {
          line: 37,
          column: 11
        }
      },
      "12": {
        start: {
          line: 39,
          column: 2
        },
        end: {
          line: 49,
          column: 3
        }
      },
      "13": {
        start: {
          line: 40,
          column: 21
        },
        end: {
          line: 45,
          column: 5
        }
      },
      "14": {
        start: {
          line: 48,
          column: 4
        },
        end: {
          line: 48,
          column: 63
        }
      },
      "15": {
        start: {
          line: 58,
          column: 2
        },
        end: {
          line: 60,
          column: 15
        }
      },
      "16": {
        start: {
          line: 59,
          column: 27
        },
        end: {
          line: 59,
          column: 57
        }
      },
      "17": {
        start: {
          line: 69,
          column: 2
        },
        end: {
          line: 69,
          column: 44
        }
      },
      "18": {
        start: {
          line: 78,
          column: 25
        },
        end: {
          line: 78,
          column: 42
        }
      },
      "19": {
        start: {
          line: 80,
          column: 2
        },
        end: {
          line: 80,
          column: 61
        }
      },
      "20": {
        start: {
          line: 83,
          column: 0
        },
        end: {
          line: 83,
          column: 29
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 2,
            column: 2
          },
          end: {
            line: 2,
            column: 3
          }
        },
        loc: {
          start: {
            line: 2,
            column: 62
          },
          end: {
            line: 6,
            column: 3
          }
        },
        line: 2
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 8,
            column: 2
          },
          end: {
            line: 8,
            column: 3
          }
        },
        loc: {
          start: {
            line: 8,
            column: 39
          },
          end: {
            line: 15,
            column: 3
          }
        },
        line: 8
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 17,
            column: 2
          },
          end: {
            line: 17,
            column: 3
          }
        },
        loc: {
          start: {
            line: 17,
            column: 27
          },
          end: {
            line: 19,
            column: 3
          }
        },
        line: 17
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 21,
            column: 2
          },
          end: {
            line: 21,
            column: 3
          }
        },
        loc: {
          start: {
            line: 21,
            column: 20
          },
          end: {
            line: 32,
            column: 3
          }
        },
        line: 21
      },
      "4": {
        name: "printTestFailures",
        decl: {
          start: {
            line: 35,
            column: 9
          },
          end: {
            line: 35,
            column: 26
          }
        },
        loc: {
          start: {
            line: 35,
            column: 35
          },
          end: {
            line: 50,
            column: 1
          }
        },
        line: 35
      },
      "5": {
        name: "objToLogAttributes",
        decl: {
          start: {
            line: 57,
            column: 9
          },
          end: {
            line: 57,
            column: 27
          }
        },
        loc: {
          start: {
            line: 57,
            column: 33
          },
          end: {
            line: 61,
            column: 1
          }
        },
        line: 57
      },
      "6": {
        name: "(anonymous_6)",
        decl: {
          start: {
            line: 59,
            column: 9
          },
          end: {
            line: 59,
            column: 10
          }
        },
        loc: {
          start: {
            line: 59,
            column: 27
          },
          end: {
            line: 59,
            column: 57
          }
        },
        line: 59
      },
      "7": {
        name: "escapeQuotes",
        decl: {
          start: {
            line: 68,
            column: 9
          },
          end: {
            line: 68,
            column: 21
          }
        },
        loc: {
          start: {
            line: 68,
            column: 27
          },
          end: {
            line: 70,
            column: 1
          }
        },
        line: 68
      },
      "8": {
        name: "formatValue",
        decl: {
          start: {
            line: 77,
            column: 9
          },
          end: {
            line: 77,
            column: 20
          }
        },
        loc: {
          start: {
            line: 77,
            column: 28
          },
          end: {
            line: 81,
            column: 1
          }
        },
        line: 77
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 9,
            column: 4
          },
          end: {
            line: 11,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 9,
            column: 4
          },
          end: {
            line: 11,
            column: 5
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
        line: 9
      },
      "1": {
        loc: {
          start: {
            line: 36,
            column: 2
          },
          end: {
            line: 38,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 36,
            column: 2
          },
          end: {
            line: 38,
            column: 3
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
        line: 36
      },
      "2": {
        loc: {
          start: {
            line: 39,
            column: 2
          },
          end: {
            line: 49,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 39,
            column: 2
          },
          end: {
            line: 49,
            column: 3
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
        line: 39
      },
      "3": {
        loc: {
          start: {
            line: 80,
            column: 9
          },
          end: {
            line: 80,
            column: 60
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 80,
            column: 26
          },
          end: {
            line: 80,
            column: 52
          }
        }, {
          start: {
            line: 80,
            column: 55
          },
          end: {
            line: 80,
            column: 60
          }
        }],
        line: 80
      }
    },
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
      "19": 0,
      "20": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0],
      "2": [0, 0],
      "3": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "24d233ded4f441ef928fdd4539db14930e2cf5fd"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage=_$registerCoverageObject(coverage[path]);
  {
    // @ts-ignore
    cov_1uey9gahi5 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1uey9gahi5();
class LogReporter {
  constructor(globalConfig, reporterOptions, reporterContext) {
    this._globalConfig = globalConfig;
    this._options = reporterOptions;
    this._context = reporterContext;
  }
  onRunComplete(testContexts, results) {
    if (!this._options.enable) {
      return;
    } else {}
    this.logStats(results);
    this.logTestFailures(results);
  }
  logTestFailures(results) {
    results.testResults.forEach(printTestFailures);
  }
  logStats(results) {
    const stats = ({
      suites: results.numTotalTestSuites,
      tests: results.numTotalTests,
      passes: results.numPassedTests,
      pending: results.numPendingTests,
      failures: results.numFailedTests,
      duration: Date.now() - results.startTime
    }); // JestStats suites=1 tests=94 passes=93 pending=0 failures=1 duration=3973
    console.log(`JestStats ${objToLogAttributes(stats)}`);
  }
}
function printTestFailures(result) {
  if (result.status === 'pending') {
    return;
  } else {}
  if (result.numFailingTests > 0) {
    const testInfo = ({
      file: result.testFilePath,
      failures: result.numFailingTests,
      duration: result.perfStats.end - result.perfStats.start,
      errorMessage: result.failureMessage
    }); // JestFailure file=<...>/public/app/features/dashboard/state/DashboardMigrator.test.ts
    // failures=1 duration=3251 errorMessage="formatted error message"
    console.log(`JestFailure ${objToLogAttributes(testInfo)}`);
  } else {}
} /**
  * Stringify object to be log friendly
  * @param {Object} obj
  * @returns {String}
  */
function objToLogAttributes(obj) {
  return Object.entries(obj).map(([key, value]) => {
    return `${key}=${formatValue(value)}`;
  }).join(' ');
} /**
  * Escape double quotes
  * @param {String} str
  * @returns
  */
function escapeQuotes(str) {
  return String(str).replaceAll('"', '\\"');
} /**
  * Wrap the value within double quote if needed
  * @param {*} value
  * @returns
  */
function formatValue(value) {
  const hasWhiteSpaces = (/\s/g.test(value));
  return hasWhiteSpaces ? (`"${escapeQuotes(value)}"`) : (value);
}
module.exports = LogReporter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXVleTlnYWhpNSIsImFjdHVhbENvdmVyYWdlIiwiTG9nUmVwb3J0ZXIiLCJjb25zdHJ1Y3RvciIsImdsb2JhbENvbmZpZyIsInJlcG9ydGVyT3B0aW9ucyIsInJlcG9ydGVyQ29udGV4dCIsImYiLCJzIiwiX2dsb2JhbENvbmZpZyIsIl9vcHRpb25zIiwiX2NvbnRleHQiLCJvblJ1bkNvbXBsZXRlIiwidGVzdENvbnRleHRzIiwicmVzdWx0cyIsImVuYWJsZSIsImIiLCJsb2dTdGF0cyIsImxvZ1Rlc3RGYWlsdXJlcyIsInRlc3RSZXN1bHRzIiwiZm9yRWFjaCIsInByaW50VGVzdEZhaWx1cmVzIiwic3RhdHMiLCJzdWl0ZXMiLCJudW1Ub3RhbFRlc3RTdWl0ZXMiLCJ0ZXN0cyIsIm51bVRvdGFsVGVzdHMiLCJwYXNzZXMiLCJudW1QYXNzZWRUZXN0cyIsInBlbmRpbmciLCJudW1QZW5kaW5nVGVzdHMiLCJmYWlsdXJlcyIsIm51bUZhaWxlZFRlc3RzIiwiZHVyYXRpb24iLCJEYXRlIiwibm93Iiwic3RhcnRUaW1lIiwiY29uc29sZSIsImxvZyIsIm9ialRvTG9nQXR0cmlidXRlcyIsInJlc3VsdCIsInN0YXR1cyIsIm51bUZhaWxpbmdUZXN0cyIsInRlc3RJbmZvIiwiZmlsZSIsInRlc3RGaWxlUGF0aCIsInBlcmZTdGF0cyIsImVuZCIsInN0YXJ0IiwiZXJyb3JNZXNzYWdlIiwiZmFpbHVyZU1lc3NhZ2UiLCJvYmoiLCJPYmplY3QiLCJlbnRyaWVzIiwibWFwIiwia2V5IiwidmFsdWUiLCJmb3JtYXRWYWx1ZSIsImpvaW4iLCJlc2NhcGVRdW90ZXMiLCJzdHIiLCJTdHJpbmciLCJyZXBsYWNlQWxsIiwiaGFzV2hpdGVTcGFjZXMiLCJ0ZXN0IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VzIjpbImxvZy1yZXBvcnRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMb2dSZXBvcnRlciB7XG4gIGNvbnN0cnVjdG9yKGdsb2JhbENvbmZpZywgcmVwb3J0ZXJPcHRpb25zLCByZXBvcnRlckNvbnRleHQpIHtcbiAgICB0aGlzLl9nbG9iYWxDb25maWcgPSBnbG9iYWxDb25maWc7XG4gICAgdGhpcy5fb3B0aW9ucyA9IHJlcG9ydGVyT3B0aW9ucztcbiAgICB0aGlzLl9jb250ZXh0ID0gcmVwb3J0ZXJDb250ZXh0O1xuICB9XG5cbiAgb25SdW5Db21wbGV0ZSh0ZXN0Q29udGV4dHMsIHJlc3VsdHMpIHtcbiAgICBpZiAoIXRoaXMuX29wdGlvbnMuZW5hYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5sb2dTdGF0cyhyZXN1bHRzKTtcbiAgICB0aGlzLmxvZ1Rlc3RGYWlsdXJlcyhyZXN1bHRzKTtcbiAgfVxuXG4gIGxvZ1Rlc3RGYWlsdXJlcyhyZXN1bHRzKSB7XG4gICAgcmVzdWx0cy50ZXN0UmVzdWx0cy5mb3JFYWNoKHByaW50VGVzdEZhaWx1cmVzKTtcbiAgfVxuXG4gIGxvZ1N0YXRzKHJlc3VsdHMpIHtcbiAgICBjb25zdCBzdGF0cyA9IHtcbiAgICAgIHN1aXRlczogcmVzdWx0cy5udW1Ub3RhbFRlc3RTdWl0ZXMsXG4gICAgICB0ZXN0czogcmVzdWx0cy5udW1Ub3RhbFRlc3RzLFxuICAgICAgcGFzc2VzOiByZXN1bHRzLm51bVBhc3NlZFRlc3RzLFxuICAgICAgcGVuZGluZzogcmVzdWx0cy5udW1QZW5kaW5nVGVzdHMsXG4gICAgICBmYWlsdXJlczogcmVzdWx0cy5udW1GYWlsZWRUZXN0cyxcbiAgICAgIGR1cmF0aW9uOiBEYXRlLm5vdygpIC0gcmVzdWx0cy5zdGFydFRpbWUsXG4gICAgfTtcbiAgICAvLyBKZXN0U3RhdHMgc3VpdGVzPTEgdGVzdHM9OTQgcGFzc2VzPTkzIHBlbmRpbmc9MCBmYWlsdXJlcz0xIGR1cmF0aW9uPTM5NzNcbiAgICBjb25zb2xlLmxvZyhgSmVzdFN0YXRzICR7b2JqVG9Mb2dBdHRyaWJ1dGVzKHN0YXRzKX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcmludFRlc3RGYWlsdXJlcyhyZXN1bHQpIHtcbiAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdwZW5kaW5nJykge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocmVzdWx0Lm51bUZhaWxpbmdUZXN0cyA+IDApIHtcbiAgICBjb25zdCB0ZXN0SW5mbyA9IHtcbiAgICAgIGZpbGU6IHJlc3VsdC50ZXN0RmlsZVBhdGgsXG4gICAgICBmYWlsdXJlczogcmVzdWx0Lm51bUZhaWxpbmdUZXN0cyxcbiAgICAgIGR1cmF0aW9uOiByZXN1bHQucGVyZlN0YXRzLmVuZCAtIHJlc3VsdC5wZXJmU3RhdHMuc3RhcnQsXG4gICAgICBlcnJvck1lc3NhZ2U6IHJlc3VsdC5mYWlsdXJlTWVzc2FnZSxcbiAgICB9O1xuICAgIC8vIEplc3RGYWlsdXJlIGZpbGU9PC4uLj4vcHVibGljL2FwcC9mZWF0dXJlcy9kYXNoYm9hcmQvc3RhdGUvRGFzaGJvYXJkTWlncmF0b3IudGVzdC50c1xuICAgIC8vIGZhaWx1cmVzPTEgZHVyYXRpb249MzI1MSBlcnJvck1lc3NhZ2U9XCJmb3JtYXR0ZWQgZXJyb3IgbWVzc2FnZVwiXG4gICAgY29uc29sZS5sb2coYEplc3RGYWlsdXJlICR7b2JqVG9Mb2dBdHRyaWJ1dGVzKHRlc3RJbmZvKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFN0cmluZ2lmeSBvYmplY3QgdG8gYmUgbG9nIGZyaWVuZGx5XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBvYmpUb0xvZ0F0dHJpYnV0ZXMob2JqKSB7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhvYmopXG4gICAgLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBgJHtrZXl9PSR7Zm9ybWF0VmFsdWUodmFsdWUpfWApXG4gICAgLmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBFc2NhcGUgZG91YmxlIHF1b3Rlc1xuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybnNcbiAqL1xuZnVuY3Rpb24gZXNjYXBlUXVvdGVzKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0cikucmVwbGFjZUFsbCgnXCInLCAnXFxcXFwiJyk7XG59XG5cbi8qKlxuICogV3JhcCB0aGUgdmFsdWUgd2l0aGluIGRvdWJsZSBxdW90ZSBpZiBuZWVkZWRcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKHZhbHVlKSB7XG4gIGNvbnN0IGhhc1doaXRlU3BhY2VzID0gL1xccy9nLnRlc3QodmFsdWUpO1xuXG4gIHJldHVybiBoYXNXaGl0ZVNwYWNlcyA/IGBcIiR7ZXNjYXBlUXVvdGVzKHZhbHVlKX1cImAgOiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2dSZXBvcnRlcjtcbiJdLCJtYXBwaW5ncyI6IndwSUFlWTtBQUFBQSxjQUFBLFNBQUFBLENBQUEsU0FBQUMsY0FBQSxXQUFBQSxjQUFBLEVBQUFELGNBQUEsR0FmWixLQUFNLENBQUFFLFdBQVksQ0FDaEJDLFdBQVdBLENBQUNDLFlBQVksQ0FBRUMsZUFBZSxDQUFFQyxlQUFlLENBQUUsQ0FBQU4sY0FBQSxHQUFBTyxDQUFBLE1BQUFQLGNBQUEsR0FBQVEsQ0FBQSxNQUMxRCxJQUFJLENBQUNDLGFBQWEsQ0FBR0wsWUFBWSxDQUFDSixjQUFBLEdBQUFRLENBQUEsTUFDbEMsSUFBSSxDQUFDRSxRQUFRLENBQUdMLGVBQWUsQ0FBQ0wsY0FBQSxHQUFBUSxDQUFBLE1BQ2hDLElBQUksQ0FBQ0csUUFBUSxDQUFHTCxlQUFlLENBQ2pDLENBRUFNLGFBQWFBLENBQUNDLFlBQVksQ0FBRUMsT0FBTyxDQUFFLENBQUFkLGNBQUEsR0FBQU8sQ0FBQSxNQUFBUCxjQUFBLEdBQUFRLENBQUEsTUFDbkMsR0FBSSxDQUFDLElBQUksQ0FBQ0UsUUFBUSxDQUFDSyxNQUFNLENBQUUsQ0FBQWYsY0FBQSxHQUFBZ0IsQ0FBQSxTQUFBaEIsY0FBQSxHQUFBUSxDQUFBLE1BQ3pCLE9BQ0YsQ0FBQyxLQUFBUixjQUFBLEdBQUFnQixDQUFBLFVB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 
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXVleTlnYWhpNSIsImFjdHVhbENvdmVyYWdlIiwiTG9nUmVwb3J0ZXIiLCJjb25zdHJ1Y3RvciIsImdsb2JhbENvbmZpZyIsInJlcG9ydGVyT3B0aW9ucyIsInJlcG9ydGVyQ29udGV4dCIsImYiLCJzIiwiX2dsb2JhbENvbmZpZyIsIl9vcHRpb25zIiwiX2NvbnRleHQiLCJvblJ1bkNvbXBsZXRlIiwidGVzdENvbnRleHRzIiwicmVzdWx0cyIsImVuYWJsZSIsImIiLCJsb2dTdGF0cyIsImxvZ1Rlc3RGYWlsdXJlcyIsInRlc3RSZXN1bHRzIiwiZm9yRWFjaCIsInByaW50VGVzdEZhaWx1cmVzIiwic3RhdHMiLCJzdWl0ZXMiLCJudW1Ub3RhbFRlc3RTdWl0ZXMiLCJ0ZXN0cyIsIm51bVRvdGFsVGVzdHMiLCJwYXNzZXMiLCJudW1QYXNzZWRUZXN0cyIsInBlbmRpbmciLCJudW1QZW5kaW5nVGVzdHMiLCJmYWlsdXJlcyIsIm51bUZhaWxlZFRlc3RzIiwiZHVyYXRpb24iLCJEYXRlIiwibm93Iiwic3RhcnRUaW1lIiwiY29uc29sZSIsImxvZyIsIm9ialRvTG9nQXR0cmlidXRlcyIsInJlc3VsdCIsInN0YXR1cyIsIm51bUZhaWxpbmdUZXN0cyIsInRlc3RJbmZvIiwiZmlsZSIsInRlc3RGaWxlUGF0aCIsInBlcmZTdGF0cyIsImVuZCIsInN0YXJ0IiwiZXJyb3JNZXNzYWdlIiwiZmFpbHVyZU1lc3NhZ2UiLCJvYmoiLCJPYmplY3QiLCJlbnRyaWVzIiwibWFwIiwia2V5IiwidmFsdWUiLCJmb3JtYXRWYWx1ZSIsImpvaW4iLCJlc2NhcGVRdW90ZXMiLCJzdHIiLCJTdHJpbmciLCJyZXBsYWNlQWxsIiwiaGFzV2hpdGVTcGFjZXMiLCJ0ZXN0IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VzIjpbImxvZy1yZXBvcnRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMb2dSZXBvcnRlciB7XG4gIGNvbnN0cnVjdG9yKGdsb2JhbENvbmZpZywgcmVwb3J0ZXJPcHRpb25zLCByZXBvcnRlckNvbnRleHQpIHtcbiAgICB0aGlzLl9nbG9iYWxDb25maWcgPSBnbG9iYWxDb25maWc7XG4gICAgdGhpcy5fb3B0aW9ucyA9IHJlcG9ydGVyT3B0aW9ucztcbiAgICB0aGlzLl9jb250ZXh0ID0gcmVwb3J0ZXJDb250ZXh0O1xuICB9XG5cbiAgb25SdW5Db21wbGV0ZSh0ZXN0Q29udGV4dHMsIHJlc3VsdHMpIHtcbiAgICBpZiAoIXRoaXMuX29wdGlvbnMuZW5hYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5sb2dTdGF0cyhyZXN1bHRzKTtcbiAgICB0aGlzLmxvZ1Rlc3RGYWlsdXJlcyhyZXN1bHRzKTtcbiAgfVxuXG4gIGxvZ1Rlc3RGYWlsdXJlcyhyZXN1bHRzKSB7XG4gICAgcmVzdWx0cy50ZXN0UmVzdWx0cy5mb3JFYWNoKHByaW50VGVzdEZhaWx1cmVzKTtcbiAgfVxuXG4gIGxvZ1N0YXRzKHJlc3VsdHMpIHtcbiAgICBjb25zdCBzdGF0cyA9IHtcbiAgICAgIHN1aXRlczogcmVzdWx0cy5udW1Ub3RhbFRlc3RTdWl0ZXMsXG4gICAgICB0ZXN0czogcmVzdWx0cy5udW1Ub3RhbFRlc3RzLFxuICAgICAgcGFzc2VzOiByZXN1bHRzLm51bVBhc3NlZFRlc3RzLFxuICAgICAgcGVuZGluZzogcmVzdWx0cy5udW1QZW5kaW5nVGVzdHMsXG4gICAgICBmYWlsdXJlczogcmVzdWx0cy5udW1GYWlsZWRUZXN0cyxcbiAgICAgIGR1cmF0aW9uOiBEYXRlLm5vdygpIC0gcmVzdWx0cy5zdGFydFRpbWUsXG4gICAgfTtcbiAgICAvLyBKZXN0U3RhdHMgc3VpdGVzPTEgdGVzdHM9OTQgcGFzc2VzPTkzIHBlbmRpbmc9MCBmYWlsdXJlcz0xIGR1cmF0aW9uPTM5NzNcbiAgICBjb25zb2xlLmxvZyhgSmVzdFN0YXRzICR7b2JqVG9Mb2dBdHRyaWJ1dGVzKHN0YXRzKX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcmludFRlc3RGYWlsdXJlcyhyZXN1bHQpIHtcbiAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdwZW5kaW5nJykge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocmVzdWx0Lm51bUZhaWxpbmdUZXN0cyA+IDApIHtcbiAgICBjb25zdCB0ZXN0SW5mbyA9IHtcbiAgICAgIGZpbGU6IHJlc3VsdC50ZXN0RmlsZVBhdGgsXG4gICAgICBmYWlsdXJlczogcmVzdWx0Lm51bUZhaWxpbmdUZXN0cyxcbiAgICAgIGR1cmF0aW9uOiByZXN1bHQucGVyZlN0YXRzLmVuZCAtIHJlc3VsdC5wZXJmU3RhdHMuc3RhcnQsXG4gICAgICBlcnJvck1lc3NhZ2U6IHJlc3VsdC5mYWlsdXJlTWVzc2FnZSxcbiAgICB9O1xuICAgIC8vIEplc3RGYWlsdXJlIGZpbGU9PC4uLj4vcHVibGljL2FwcC9mZWF0dXJlcy9kYXNoYm9hcmQvc3RhdGUvRGFzaGJvYXJkTWlncmF0b3IudGVzdC50c1xuICAgIC8vIGZhaWx1cmVzPTEgZHVyYXRpb249MzI1MSBlcnJvck1lc3NhZ2U9XCJmb3JtYXR0ZWQgZXJyb3IgbWVzc2FnZVwiXG4gICAgY29uc29sZS5sb2coYEplc3RGYWlsdXJlICR7b2JqVG9Mb2dBdHRyaWJ1dGVzKHRlc3RJbmZvKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFN0cmluZ2lmeSBvYmplY3QgdG8gYmUgbG9nIGZyaWVuZGx5XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBvYmpUb0xvZ0F0dHJpYnV0ZXMob2JqKSB7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhvYmopXG4gICAgLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBgJHtrZXl9PSR7Zm9ybWF0VmFsdWUodmFsdWUpfWApXG4gICAgLmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBFc2NhcGUgZG91YmxlIHF1b3Rlc1xuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybnNcbiAqL1xuZnVuY3Rpb24gZXNjYXBlUXVvdGVzKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0cikucmVwbGFjZUFsbCgnXCInLCAnXFxcXFwiJyk7XG59XG5cbi8qKlxuICogV3JhcCB0aGUgdmFsdWUgd2l0aGluIGRvdWJsZSBxdW90ZSBpZiBuZWVkZWRcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKHZhbHVlKSB7XG4gIGNvbnN0IGhhc1doaXRlU3BhY2VzID0gL1xccy9nLnRlc3QodmFsdWUpO1xuXG4gIHJldHVybiBoYXNXaGl0ZVNwYWNlcyA/IGBcIiR7ZXNjYXBlUXVvdGVzKHZhbHVlKX1cImAgOiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2dSZXBvcnRlcjtcbiJdLCJtYXBwaW5ncyI6IndwSUFlWTtBQUFBQSxjQUFBLFNBQUFBLENBQUEsU0FBQUMsY0FBQSxXQUFBQSxjQUFBLEVBQUFELGNBQUEsR0FmWixLQUFNLENBQUFFLFdBQVksQ0FDaEJDLFdBQVdBLENBQUNDLFlBQVksQ0FBRUMsZUFBZSxDQUFFQyxlQUFlLENBQUUsQ0FBQU4sY0FBQSxHQUFBTyxDQUFBLE1BQUFQLGNBQUEsR0FBQVEsQ0FBQSxNQUMxRCxJQUFJLENBQUNDLGFBQWEsQ0FBR0wsWUFBWSxDQUFDSixjQUFBLEdBQUFRLENBQUEsTUFDbEMsSUFBSSxDQUFDRSxRQUFRLENBQUdMLGVBQWUsQ0FBQ0wsY0FBQSxHQUFBUSxDQUFBLE1BQ2hDLElBQUksQ0FBQ0csUUFBUSxDQUFHTCxlQUFlLENBQ2pDLENBRUFNLGFBQWFBLENBQUNDLFlBQVksQ0FBRUMsT0FBTyxDQUFFLENBQUFkLGNBQUEsR0FBQU8sQ0FBQSxNQUFBUCxjQUFBLEdBQUFRLENBQUEsTUFDbkMsR0FBSSxDQUFDLElBQUksQ0FBQ0UsUUFBUSxDQUFDSyxNQUFNLENBQUUsQ0FBQWYsY0FBQSxHQUFBZ0IsQ0FBQSxTQUFBaEIsY0FBQSxHQUFBUSxDQUFBLE1BQ3pCLE9BQ0YsQ0FBQyxLQUFBUixjQUFBLEdBQUFnQixDQUFBLFVB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