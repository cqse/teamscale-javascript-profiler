/** $IS_JS_PROFILER_INSTRUMENTED=true **/ (()=>{function d(e){let n=new Blob([e],{type:"text/javascript"}),t=URL.createObjectURL(n),s=new Worker(t);return URL.revokeObjectURL(t),s}function h(){return d('var r=class{constructor(e){this.cachedMessages=[];this.url=e,this.socket=this.createSocket()}createSocket(){let e=new WebSocket(this.url);return e.onopen=()=>this.onopen(),e.onclose=()=>this.onclose(),e}onclose(){this.socket=this.createSocket()}onopen(){console.log("Connection to Coverage Collector established."),this.cachedMessages.forEach(e=>this.socket.send(e)),this.cachedMessages=[]}send(e){this.socket.readyState===WebSocket.OPEN?this.socket.send(e):(this.cachedMessages.push(e),this.cachedMessages.length%500===0&&console.log(`More than ${this.cachedMessages.length} messages are queued to be sent.`))}};var C=20,m=1e3,d=class{constructor(e,t){this.milliseconds=e;this.onCountedToZero=t;this.timerHandle=null}restartCountdown(){this.stopCountdown(),this.timerHandle=self.setTimeout(()=>{this.stopCountdown(),this.onCountedToZero()},this.milliseconds)}stopCountdown(){this.timerHandle!==null&&(self.clearTimeout(this.timerHandle),this.timerHandle=null)}},a=class{constructor(e){this.socket=e,this.cachedCoveredRanges=new Map,this.numberOfCachedPositions=0,this.flushCountdown=new d(m,()=>this.flush())}addRange(e,t){if(!t.start.line||!t.end.line)return;let o=this.cachedCoveredRanges.get(e);o||(o=new Set,this.cachedCoveredRanges.set(e,o)),o.add(t),this.numberOfCachedPositions+=1,this.flushCountdown.restartCountdown(),this.numberOfCachedPositions>=C&&this.flush()}flush(){this.numberOfCachedPositions!==0&&(this.flushCountdown.stopCountdown(),this.cachedCoveredRanges.forEach((e,t)=>{let o=Array.from(e).map(n=>`${n.start.line}:${n.start.column}:${n.end.line}:${n.end.column}`);this.socket.send(`${"c"} ${t} ${o.join(" ")}`),e.clear()}),this.cachedCoveredRanges.clear(),this.numberOfCachedPositions=0)}};console.log("Starting coverage forwarding worker.");var u=new r("ws://localhost:46427/socket"),h=new a(u),f=new Map;onmessage=s=>{if(Array.isArray(s.data))p(s.data);else{let e=s.data;if(e.startsWith("s"))u.send(e);else if(e.startsWith("i")){let t=JSON.parse(e.substring(2));f.set(t.hash,t),console.info(`Received coverage mapping information for "${t.hash}".`)}else e==="unload"?h.flush():console.error(`No handler for message: ${e}`)}};function p(s){var n;let e=s[0],t=s[1],o=f.get(e);if(!o){console.log(`No coverage mapping information for ${e} available!`);return}for(let[c,i]of t.branches.entries()){let l=(n=o.branchMap[c])==null?void 0:n.locations[i];l&&h.addRange(e,l)}for(let c of t.statements){let i=o.statementMap[c];i&&h.addRange(e,i)}}\n')}function c(){return g()}function g(){return window}function p(e,n){let t=c()[e];return t||(t=n,c()[e]=t),t}var l;(function(r){r.MESSAGE_TYPE_SOURCEMAP="s",r.MESSAGE_TYPE_COVERAGE="c",r.ISTANBUL_COV_OBJECT="i",r.UNRESOLVED_CODE_ENTITY="u"})(l||(l={}));function v(e,n){let t=new Map;function s(i){let o=t.get(i);return o||(o={branches:new Map,statements:new Set},t.set(i,o),o)}function r(i,o,w){s(i).branches.set(o,w)}function u(i,o){s(i).statements.add(o)}function a(){n(t),t.clear()}return setInterval(()=>a(),e),{putBranchCoverage:r,putStatementCoverage:u,flush:a}}var C=p("__TS_AGENT",{});function f(){return C._$BcWorker}function S(e){return C._$BcWorker=e,e}var m=v(250,e=>{for(let n of e.entries())f().postMessage(n)});c()._$stmtCov=m.putStatementCoverage;c()._$brCov=m.putBranchCoverage;var b=new Set;c()._$registerCoverageObject=function(e){let n=e.hash;if(b.has(n)){console.log(`Coverage interceptor added twice for ${n}. This seems to be a bug in the instrumentation.`);return}else b.add(n);if(!f()){let t=S(new h);(function(){let r=()=>{m.flush(),t.postMessage("unload")},u=function(i,o){!o||o.addEventListener(i,r,{capture:!0})},a=g();u("blur",a),u("unload",a),u("visibilitychange",a),u("beforeunload",a)})()}(function(){f().postMessage(`${l.ISTANBUL_COV_OBJECT} ${JSON.stringify(e)}`);let s=p("sentMaps",new Set);e.inputSourceMap&&(s.has(e.path)||(f().postMessage(`${l.MESSAGE_TYPE_SOURCEMAP} ${n}:${JSON.stringify(e.inputSourceMap)}`),s.add(e.path)))})()};})();
 const _$ffkd959i = "1c77c98e7ae57b8749e74f97f255ab8d17250a26";
function cov_1c9ho2rdz5() {
  var path = "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/locales/psuedo.js";
  var hash = "1c77c98e7ae57b8749e74f97f255ab8d17250a26";
  var global = typeof window === 'object' ? window : this;
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/locales/psuedo.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 11
        },
        end: {
          line: 1,
          column: 33
        }
      },
      "1": {
        start: {
          line: 2,
          column: 19
        },
        end: {
          line: 2,
          column: 40
        }
      },
      "2": {
        start: {
          line: 3,
          column: 17
        },
        end: {
          line: 3,
          column: 36
        }
      },
      "3": {
        start: {
          line: 6,
          column: 2
        },
        end: {
          line: 11,
          column: 3
        }
      },
      "4": {
        start: {
          line: 8,
          column: 24
        },
        end: {
          line: 8,
          column: 54
        }
      },
      "5": {
        start: {
          line: 9,
          column: 28
        },
        end: {
          line: 9,
          column: 104
        }
      },
      "6": {
        start: {
          line: 9,
          column: 60
        },
        end: {
          line: 9,
          column: 103
        }
      },
      "7": {
        start: {
          line: 10,
          column: 4
        },
        end: {
          line: 10,
          column: 35
        }
      },
      "8": {
        start: {
          line: 13,
          column: 2
        },
        end: {
          line: 13,
          column: 15
        }
      },
      "9": {
        start: {
          line: 16,
          column: 0
        },
        end: {
          line: 24,
          column: 3
        }
      },
      "10": {
        start: {
          line: 17,
          column: 21
        },
        end: {
          line: 17,
          column: 39
        }
      },
      "11": {
        start: {
          line: 19,
          column: 21
        },
        end: {
          line: 21,
          column: 4
        }
      },
      "12": {
        start: {
          line: 23,
          column: 2
        },
        end: {
          line: 23,
          column: 81
        }
      }
    },
    fnMap: {
      "0": {
        name: "pseudoizeJsonReplacer",
        decl: {
          start: {
            line: 5,
            column: 9
          },
          end: {
            line: 5,
            column: 30
          }
        },
        loc: {
          start: {
            line: 5,
            column: 43
          },
          end: {
            line: 14,
            column: 1
          }
        },
        line: 5
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 9,
            column: 44
          },
          end: {
            line: 9,
            column: 45
          }
        },
        loc: {
          start: {
            line: 9,
            column: 60
          },
          end: {
            line: 9,
            column: 103
          }
        },
        line: 9
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 16,
            column: 56
          },
          end: {
            line: 16,
            column: 57
          }
        },
        loc: {
          start: {
            line: 16,
            column: 68
          },
          end: {
            line: 24,
            column: 1
          }
        },
        line: 16
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 6,
            column: 2
          },
          end: {
            line: 11,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 6,
            column: 2
          },
          end: {
            line: 11,
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
        line: 6
      },
      "1": {
        loc: {
          start: {
            line: 9,
            column: 60
          },
          end: {
            line: 9,
            column: 103
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 9,
            column: 72
          },
          end: {
            line: 9,
            column: 75
          }
        }, {
          start: {
            line: 9,
            column: 78
          },
          end: {
            line: 9,
            column: 103
          }
        }],
        line: 9
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
      "12": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "1c77c98e7ae57b8749e74f97f255ab8d17250a26"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage=_$registerCoverageObject(coverage[path]);
  {
    // @ts-ignore
    cov_1c9ho2rdz5 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1c9ho2rdz5();
const fs = (require('fs/promises'));
const pseudoizer = (require('pseudoizer'));
const prettier = (require('prettier'));
function pseudoizeJsonReplacer(key, value) {
  if (typeof value === 'string') {
    // Split string on brace-enclosed segments. Odd indices will be {{variables}}
    const phraseParts = (value.split(/(\{\{[^}]+}\})/g));
    const translatedParts = (phraseParts.map((str, index) => {
      return index % 2 ? (str) : (pseudoizer.pseudoize(str));
    }));
    return translatedParts.join("");
  } else {}
  return value;
}
fs.readFile('./public/locales/en-US/grafana.json').then(enJson => {
  const enMessages = (JSON.parse(enJson)); // Add newline to make prettier happy
  const pseudoJson = (prettier.format(JSON.stringify(enMessages, pseudoizeJsonReplacer, 2), {
    parser: 'json'
  }));
  return fs.writeFile('./public/locales/pseudo-LOCALE/grafana.json', pseudoJson);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMWM5aG8ycmR6NSIsImFjdHVhbENvdmVyYWdlIiwiZnMiLCJzIiwicmVxdWlyZSIsInBzZXVkb2l6ZXIiLCJwcmV0dGllciIsInBzZXVkb2l6ZUpzb25SZXBsYWNlciIsImtleSIsInZhbHVlIiwiZiIsImIiLCJwaHJhc2VQYXJ0cyIsInNwbGl0IiwidHJhbnNsYXRlZFBhcnRzIiwibWFwIiwic3RyIiwiaW5kZXgiLCJwc2V1ZG9pemUiLCJqb2luIiwicmVhZEZpbGUiLCJ0aGVuIiwiZW5Kc29uIiwiZW5NZXNzYWdlcyIsIkpTT04iLCJwYXJzZSIsInBzZXVkb0pzb24iLCJmb3JtYXQiLCJzdHJpbmdpZnkiLCJwYXJzZXIiLCJ3cml0ZUZpbGUiXSwic291cmNlcyI6WyJwc3VlZG8uanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcy9wcm9taXNlcycpO1xuY29uc3QgcHNldWRvaXplciA9IHJlcXVpcmUoJ3BzZXVkb2l6ZXInKTtcbmNvbnN0IHByZXR0aWVyID0gcmVxdWlyZSgncHJldHRpZXInKTtcblxuZnVuY3Rpb24gcHNldWRvaXplSnNvblJlcGxhY2VyKGtleSwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAvLyBTcGxpdCBzdHJpbmcgb24gYnJhY2UtZW5jbG9zZWQgc2VnbWVudHMuIE9kZCBpbmRpY2VzIHdpbGwgYmUge3t2YXJpYWJsZXN9fVxuICAgIGNvbnN0IHBocmFzZVBhcnRzID0gdmFsdWUuc3BsaXQoLyhcXHtcXHtbXn1dK31cXH0pL2cpO1xuICAgIGNvbnN0IHRyYW5zbGF0ZWRQYXJ0cyA9IHBocmFzZVBhcnRzLm1hcCgoc3RyLCBpbmRleCkgPT4gaW5kZXggJSAyID8gc3RyIDogcHNldWRvaXplci5wc2V1ZG9pemUoc3RyKSlcbiAgICByZXR1cm4gdHJhbnNsYXRlZFBhcnRzLmpvaW4oXCJcIilcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnMucmVhZEZpbGUoJy4vcHVibGljL2xvY2FsZXMvZW4tVVMvZ3JhZmFuYS5qc29uJykudGhlbigoZW5Kc29uKSA9PiB7XG4gIGNvbnN0IGVuTWVzc2FnZXMgPSBKU09OLnBhcnNlKGVuSnNvbik7XG4gIC8vIEFkZCBuZXdsaW5lIHRvIG1ha2UgcHJldHRpZXIgaGFwcHlcbiAgY29uc3QgcHNldWRvSnNvbiA9IHByZXR0aWVyLmZvcm1hdChKU09OLnN0cmluZ2lmeShlbk1lc3NhZ2VzLCBwc2V1ZG9pemVKc29uUmVwbGFjZXIsIDIpLCB7XG4gICAgcGFyc2VyOiAnanNvbicsXG4gIH0pO1xuXG4gIHJldHVybiBmcy53cml0ZUZpbGUoJy4vcHVibGljL2xvY2FsZXMvcHNldWRvLUxPQ0FMRS9ncmFmYW5hLmpzb24nLCBwc2V1ZG9Kc29uKTtcbn0pO1xuIl0sIm1hcHBpbmdzIjoicTBFQWVZO0FBQUFBLGNBQUEsU0FBQUEsQ0FBQSxTQUFBQyxjQUFBLFdBQUFBLGNBQUEsRUFBQUQsY0FBQSxHQWZaLEtBQU0sQ0FBQUUsRUFBRSxFQUFBRixjQUFBLEdBQUFHLENBQUEsTUFBR0MsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUNqQyxLQUFNLENBQUFDLFVBQVUsRUFBQUwsY0FBQSxHQUFBRyxDQUFBLE1BQUdDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFDeEMsS0FBTSxDQUFBRSxRQUFRLEVBQUFOLGNBQUEsR0FBQUcsQ0FBQSxNQUFHQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBRXBDLFFBQVMsQ0FBQUcscUJBQXFCQSxDQUFDQyxHQUFHLENBQUVDLEtBQUssQ0FBRSxDQUFBVCxjQUFBLEdBQUFVLENBQUEsTUFBQVYsY0FBQSxHQUFBRyxDQUFBLE1BQ3pDLEdBQUksTUFBTyxDQUFBTSxLQUFLLEdBQUssUUFBUSxDQUFFLENBQUFULGNBQUEsR0FBQVcsQ0FBQSxTQUM3QjtBQUNBLEtBQU0sQ0FBQUMsV0FBVyxFQUFBWixjQUFBLEdBQUFHLENBQUEsTUFBR00sS0FBSyxDQUFDSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFDbEQsS0FBTSxDQUFBQyxlQUFlLEVBQUFkLGNBQUEsR0FBQUcsQ0FBQSxNQUFHUyxXQUFXLENBQUNHLEdBQUcsQ0FBQyxDQUFDQyxHQUFHLENBQUVDLEtBQUssR0FBSyxDQUFBakIsY0FBQSxHQUFBVSxDQUFBLE1BQUFWLGNBQUEsR0FBQUcsQ0FBQSxhQUFBYyxLQUFLLENBQUcsQ0FBQyxFQUFBakIsY0FBQSxHQUFBVyxDQUFBLFNBQUdLLEdBQUcsR0FBQWhCLGNBQUEsR0FBQVcsQ0FBQSxTQUFHTixVQUFVLENBQUNhLFNBQVMsQ0FBQ0YsR0FBRyxDQUFDLEVBQUQsQ0FBQyxDQUFDLEVBQUFoQixjQUFBLEdBQUFHLENBQUEsTUFDcEcsTUFBTyxDQUFBVyxlQUFlLENBQUNLLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FDakMsQ0FBQyxLQUFBbkIsY0FBQSxHQUFBVyxDQUFBLFVBQUFYLGNBQUEsR0FBQUcsQ0FBQSxNQUVELE1BQU8sQ0FBQU0sS0FBSyxDQUNkLENBQUNULGNBQUEsR0FBQUcsQ0FBQSxNQUVERCxFQUFFLENBQUNrQixRQUFRLENBQUMscUNBQXFDLENBQUMsQ0FBQ0MsSUFBSSxDQUFFQyxNQUFNLEVBQUssQ0FBQXRCLGNBQUEsR0FBQVUsQ0FBQSxNQUNsRSxLQUFNLENBQUFhLFVBQVUsRUFBQXZCLGNBQUEsR0FBQUcsQ0FBQSxPQUFHcUIsSUFBSSxDQUFDQyxLQUFLLENBQUNILE1BQU0sQ0FBQyxFQUNyQztBQUNBLEtBQU0sQ0FBQUksVUFBVSxFQUFBMUIsY0FBQSxHQUFBRyxDQUFBLE9BQUdHLFFBQVEsQ0FBQ3FCLE1BQU0sQ0FBQ0gsSUFBSSxDQUFDSSxTQUFTLENBQUNMLFVBQVUsQ0FBRWhCLHFCQUFxQixDQUFFLENBQUMsQ0FBQyxDQUFFLENBQ3ZGc0IsTUFBTSxDQUFFLE1BQ1YsQ0FBQyxDQUFDLEVBQUM3QixjQUFBLEdBQUFHLENBQUEsT0FFSCxNQUFPLENBQUFELEVBQUUsQ0FBQzRCLFNBQVMsQ0FBQyw2Q0FBNkMsQ0FBRUosVUFBVSxDQUFDLENBQ2hGLENBQUMsQ0FBQyJ9 
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMWM5aG8ycmR6NSIsImFjdHVhbENvdmVyYWdlIiwiZnMiLCJzIiwicmVxdWlyZSIsInBzZXVkb2l6ZXIiLCJwcmV0dGllciIsInBzZXVkb2l6ZUpzb25SZXBsYWNlciIsImtleSIsInZhbHVlIiwiZiIsImIiLCJwaHJhc2VQYXJ0cyIsInNwbGl0IiwidHJhbnNsYXRlZFBhcnRzIiwibWFwIiwic3RyIiwiaW5kZXgiLCJwc2V1ZG9pemUiLCJqb2luIiwicmVhZEZpbGUiLCJ0aGVuIiwiZW5Kc29uIiwiZW5NZXNzYWdlcyIsIkpTT04iLCJwYXJzZSIsInBzZXVkb0pzb24iLCJmb3JtYXQiLCJzdHJpbmdpZnkiLCJwYXJzZXIiLCJ3cml0ZUZpbGUiXSwic291cmNlcyI6WyJwc3VlZG8uanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcy9wcm9taXNlcycpO1xuY29uc3QgcHNldWRvaXplciA9IHJlcXVpcmUoJ3BzZXVkb2l6ZXInKTtcbmNvbnN0IHByZXR0aWVyID0gcmVxdWlyZSgncHJldHRpZXInKTtcblxuZnVuY3Rpb24gcHNldWRvaXplSnNvblJlcGxhY2VyKGtleSwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAvLyBTcGxpdCBzdHJpbmcgb24gYnJhY2UtZW5jbG9zZWQgc2VnbWVudHMuIE9kZCBpbmRpY2VzIHdpbGwgYmUge3t2YXJpYWJsZXN9fVxuICAgIGNvbnN0IHBocmFzZVBhcnRzID0gdmFsdWUuc3BsaXQoLyhcXHtcXHtbXn1dK31cXH0pL2cpO1xuICAgIGNvbnN0IHRyYW5zbGF0ZWRQYXJ0cyA9IHBocmFzZVBhcnRzLm1hcCgoc3RyLCBpbmRleCkgPT4gaW5kZXggJSAyID8gc3RyIDogcHNldWRvaXplci5wc2V1ZG9pemUoc3RyKSlcbiAgICByZXR1cm4gdHJhbnNsYXRlZFBhcnRzLmpvaW4oXCJcIilcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnMucmVhZEZpbGUoJy4vcHVibGljL2xvY2FsZXMvZW4tVVMvZ3JhZmFuYS5qc29uJykudGhlbigoZW5Kc29uKSA9PiB7XG4gIGNvbnN0IGVuTWVzc2FnZXMgPSBKU09OLnBhcnNlKGVuSnNvbik7XG4gIC8vIEFkZCBuZXdsaW5lIHRvIG1ha2UgcHJldHRpZXIgaGFwcHlcbiAgY29uc3QgcHNldWRvSnNvbiA9IHByZXR0aWVyLmZvcm1hdChKU09OLnN0cmluZ2lmeShlbk1lc3NhZ2VzLCBwc2V1ZG9pemVKc29uUmVwbGFjZXIsIDIpLCB7XG4gICAgcGFyc2VyOiAnanNvbicsXG4gIH0pO1xuXG4gIHJldHVybiBmcy53cml0ZUZpbGUoJy4vcHVibGljL2xvY2FsZXMvcHNldWRvLUxPQ0FMRS9ncmFmYW5hLmpzb24nLCBwc2V1ZG9Kc29uKTtcbn0pO1xuIl0sIm1hcHBpbmdzIjoicTBFQWVZO0FBQUFBLGNBQUEsU0FBQUEsQ0FBQSxTQUFBQyxjQUFBLFdBQUFBLGNBQUEsRUFBQUQsY0FBQSxHQWZaLEtBQU0sQ0FBQUUsRUFBRSxFQUFBRixjQUFBLEdBQUFHLENBQUEsTUFBR0MsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUNqQyxLQUFNLENBQUFDLFVBQVUsRUFBQUwsY0FBQSxHQUFBRyxDQUFBLE1BQUdDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFDeEMsS0FBTSxDQUFBRSxRQUFRLEVBQUFOLGNBQUEsR0FBQUcsQ0FBQSxNQUFHQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBRXBDLFFBQVMsQ0FBQUcscUJBQXFCQSxDQUFDQyxHQUFHLENBQUVDLEtBQUssQ0FBRSxDQUFBVCxjQUFBLEdBQUFVLENBQUEsTUFBQVYsY0FBQSxHQUFBRyxDQUFBLE1BQ3pDLEdBQUksTUFBTyxDQUFBTSxLQUFLLEdBQUssUUFBUSxDQUFFLENBQUFULGNBQUEsR0FBQVcsQ0FBQSxTQUM3QjtBQUNBLEtBQU0sQ0FBQUMsV0FBVyxFQUFBWixjQUFBLEdBQUFHLENBQUEsTUFBR00sS0FBSyxDQUFDSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFDbEQsS0FBTSxDQUFBQyxlQUFlLEVBQUFkLGNBQUEsR0FBQUcsQ0FBQSxNQUFHUyxXQUFXLENBQUNHLEdBQUcsQ0FBQyxDQUFDQyxHQUFHLENBQUVDLEtBQUssR0FBSyxDQUFBakIsY0FBQSxHQUFBVSxDQUFBLE1BQUFWLGNBQUEsR0FBQUcsQ0FBQSxhQUFBYyxLQUFLLENBQUcsQ0FBQyxFQUFBakIsY0FBQSxHQUFBVyxDQUFBLFNBQUdLLEdBQUcsR0FBQWhCLGNBQUEsR0FBQVcsQ0FBQSxTQUFHTixVQUFVLENBQUNhLFNBQVMsQ0FBQ0YsR0FBRyxDQUFDLEVBQUQsQ0FBQyxDQUFDLEVBQUFoQixjQUFBLEdBQUFHLENBQUEsTUFDcEcsTUFBTyxDQUFBVyxlQUFlLENBQUNLLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FDakMsQ0FBQyxLQUFBbkIsY0FBQSxHQUFBVyxDQUFBLFVBQUFYLGNBQUEsR0FBQUcsQ0FBQSxNQUVELE1BQU8sQ0FBQU0sS0FBSyxDQUNkLENBQUNULGNBQUEsR0FBQUcsQ0FBQSxNQUVERCxFQUFFLENBQUNrQixRQUFRLENBQUMscUNBQXFDLENBQUMsQ0FBQ0MsSUFBSSxDQUFFQyxNQUFNLEVBQUssQ0FBQXRCLGNBQUEsR0FBQVUsQ0FBQSxNQUNsRSxLQUFNLENBQUFhLFVBQVUsRUFBQXZCLGNBQUEsR0FBQUcsQ0FBQSxPQUFHcUIsSUFBSSxDQUFDQyxLQUFLLENBQUNILE1BQU0sQ0FBQyxFQUNyQztBQUNBLEtBQU0sQ0FBQUksVUFBVSxFQUFBMUIsY0FBQSxHQUFBRyxDQUFBLE9BQUdHLFFBQVEsQ0FBQ3FCLE1BQU0sQ0FBQ0gsSUFBSSxDQUFDSSxTQUFTLENBQUNMLFVBQVUsQ0FBRWhCLHFCQUFxQixDQUFFLENBQUMsQ0FBQyxDQUFFLENBQ3ZGc0IsTUFBTSxDQUFFLE1BQ1YsQ0FBQyxDQUFDLEVBQUM3QixjQUFBLEdBQUFHLENBQUEsT0FFSCxNQUFPLENBQUFELEVBQUUsQ0FBQzRCLFNBQVMsQ0FBQyw2Q0FBNkMsQ0FBRUosVUFBVSxDQUFDLENBQ2hGLENBQUMsQ0FBQyJ9