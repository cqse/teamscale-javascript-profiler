/** $IS_JS_PROFILER_INSTRUMENTED=true **/ (()=>{function d(e){let n=new Blob([e],{type:"text/javascript"}),t=URL.createObjectURL(n),s=new Worker(t);return URL.revokeObjectURL(t),s}function h(){return d('var r=class{constructor(e){this.cachedMessages=[];this.url=e,this.socket=this.createSocket()}createSocket(){let e=new WebSocket(this.url);return e.onopen=()=>this.onopen(),e.onclose=()=>this.onclose(),e}onclose(){this.socket=this.createSocket()}onopen(){console.log("Connection to Coverage Collector established."),this.cachedMessages.forEach(e=>this.socket.send(e)),this.cachedMessages=[]}send(e){this.socket.readyState===WebSocket.OPEN?this.socket.send(e):(this.cachedMessages.push(e),this.cachedMessages.length%500===0&&console.log(`More than ${this.cachedMessages.length} messages are queued to be sent.`))}};var C=20,m=1e3,d=class{constructor(e,t){this.milliseconds=e;this.onCountedToZero=t;this.timerHandle=null}restartCountdown(){this.stopCountdown(),this.timerHandle=self.setTimeout(()=>{this.stopCountdown(),this.onCountedToZero()},this.milliseconds)}stopCountdown(){this.timerHandle!==null&&(self.clearTimeout(this.timerHandle),this.timerHandle=null)}},a=class{constructor(e){this.socket=e,this.cachedCoveredRanges=new Map,this.numberOfCachedPositions=0,this.flushCountdown=new d(m,()=>this.flush())}addRange(e,t){if(!t.start.line||!t.end.line)return;let o=this.cachedCoveredRanges.get(e);o||(o=new Set,this.cachedCoveredRanges.set(e,o)),o.add(t),this.numberOfCachedPositions+=1,this.flushCountdown.restartCountdown(),this.numberOfCachedPositions>=C&&this.flush()}flush(){this.numberOfCachedPositions!==0&&(this.flushCountdown.stopCountdown(),this.cachedCoveredRanges.forEach((e,t)=>{let o=Array.from(e).map(n=>`${n.start.line}:${n.start.column}:${n.end.line}:${n.end.column}`);this.socket.send(`${"c"} ${t} ${o.join(" ")}`),e.clear()}),this.cachedCoveredRanges.clear(),this.numberOfCachedPositions=0)}};console.log("Starting coverage forwarding worker.");var u=new r("ws://localhost:34203/socket"),h=new a(u),f=new Map;onmessage=s=>{if(Array.isArray(s.data))p(s.data);else{let e=s.data;if(e.startsWith("s"))u.send(e);else if(e.startsWith("i")){let t=JSON.parse(e.substring(2));f.set(t.hash,t),console.info(`Received coverage mapping information for "${t.hash}".`)}else e==="unload"?h.flush():console.error(`No handler for message: ${e}`)}};function p(s){var n;let e=s[0],t=s[1],o=f.get(e);if(!o){console.log(`No coverage mapping information for ${e} available!`);return}for(let[c,i]of t.branches.entries()){let l=(n=o.branchMap[c])==null?void 0:n.locations[i];l&&h.addRange(e,l)}for(let c of t.statements){let i=o.statementMap[c];i&&h.addRange(e,i)}}\n')}function c(){return g()}function g(){return window}function p(e,n){let t=c()[e];return t||(t=n,c()[e]=t),t}var l;(function(r){r.MESSAGE_TYPE_SOURCEMAP="s",r.MESSAGE_TYPE_COVERAGE="c",r.ISTANBUL_COV_OBJECT="i",r.UNRESOLVED_CODE_ENTITY="u"})(l||(l={}));function v(e,n){let t=new Map;function s(i){let o=t.get(i);return o||(o={branches:new Map,statements:new Set},t.set(i,o),o)}function r(i,o,w){s(i).branches.set(o,w)}function u(i,o){s(i).statements.add(o)}function a(){n(t),t.clear()}return setInterval(()=>a(),e),{putBranchCoverage:r,putStatementCoverage:u,flush:a}}var C=p("__TS_AGENT",{});function f(){return C._$BcWorker}function S(e){return C._$BcWorker=e,e}var m=v(250,e=>{for(let n of e.entries())f().postMessage(n)});c()._$stmtCov=m.putStatementCoverage;c()._$brCov=m.putBranchCoverage;var b=new Set;c()._$registerCoverageObject=function(e){let n=e.hash;if(b.has(n)){console.log(`Coverage interceptor added twice for ${n}. This seems to be a bug in the instrumentation.`);return}else b.add(n);if(!f()){let t=S(new h);(function(){let r=()=>{m.flush(),t.postMessage("unload")},u=function(i,o){!o||o.addEventListener(i,r,{capture:!0})},a=g();u("blur",a),u("unload",a),u("visibilitychange",a),u("beforeunload",a)})()}(function(){f().postMessage(`${l.ISTANBUL_COV_OBJECT} ${JSON.stringify(e)}`);let s=p("sentMaps",new Set);e.inputSourceMap&&(s.has(e.path)||(f().postMessage(`${l.MESSAGE_TYPE_SOURCEMAP} ${n}:${JSON.stringify(e.inputSourceMap)}`),s.add(e.path)))})()};})();
 const _$fd00rn39 = "385d9ab751a9b2c98fd57ce8fa318c005deacec7";
function cov_1192jcx60q() {
  var path = "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/app/plugins/panel/nodeGraph/layout.worker.js";
  var hash = "385d9ab751a9b2c98fd57ce8fa318c005deacec7";
  var global = typeof window === 'object' ? window : this;
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/johannes/Dev/teamscale-javascript-profiler/test/casestudies/grafana/public/app/plugins/panel/nodeGraph/layout.worker.js",
    statementMap: {
      "0": {
        start: {
          line: 3,
          column: 0
        },
        end: {
          line: 7,
          column: 3
        }
      },
      "1": {
        start: {
          line: 4,
          column: 35
        },
        end: {
          line: 4,
          column: 45
        }
      },
      "2": {
        start: {
          line: 5,
          column: 2
        },
        end: {
          line: 5,
          column: 31
        }
      },
      "3": {
        start: {
          line: 6,
          column: 2
        },
        end: {
          line: 6,
          column: 32
        }
      },
      "4": {
        start: {
          line: 15,
          column: 36
        },
        end: {
          line: 15,
          column: 69
        }
      },
      "5": {
        start: {
          line: 19,
          column: 2
        },
        end: {
          line: 21,
          column: 5
        }
      },
      "6": {
        start: {
          line: 20,
          column: 4
        },
        end: {
          line: 20,
          column: 15
        }
      },
      "7": {
        start: {
          line: 23,
          column: 21
        },
        end: {
          line: 35,
          column: 56
        }
      },
      "8": {
        start: {
          line: 27,
          column: 19
        },
        end: {
          line: 27,
          column: 23
        }
      },
      "9": {
        start: {
          line: 39,
          column: 2
        },
        end: {
          line: 39,
          column: 31
        }
      },
      "10": {
        start: {
          line: 40,
          column: 2
        },
        end: {
          line: 40,
          column: 20
        }
      },
      "11": {
        start: {
          line: 43,
          column: 2
        },
        end: {
          line: 43,
          column: 21
        }
      },
      "12": {
        start: {
          line: 64,
          column: 28
        },
        end: {
          line: 64,
          column: 30
        }
      },
      "13": {
        start: {
          line: 66,
          column: 19
        },
        end: {
          line: 69,
          column: 8
        }
      },
      "14": {
        start: {
          line: 67,
          column: 4
        },
        end: {
          line: 67,
          column: 24
        }
      },
      "15": {
        start: {
          line: 68,
          column: 4
        },
        end: {
          line: 68,
          column: 15
        }
      },
      "16": {
        start: {
          line: 70,
          column: 19
        },
        end: {
          line: 74,
          column: 8
        }
      },
      "17": {
        start: {
          line: 71,
          column: 21
        },
        end: {
          line: 71,
          column: 32
        }
      },
      "18": {
        start: {
          line: 72,
          column: 4
        },
        end: {
          line: 72,
          column: 53
        }
      },
      "19": {
        start: {
          line: 73,
          column: 4
        },
        end: {
          line: 73,
          column: 15
        }
      },
      "20": {
        start: {
          line: 76,
          column: 14
        },
        end: {
          line: 76,
          column: 51
        }
      },
      "21": {
        start: {
          line: 76,
          column: 34
        },
        end: {
          line: 76,
          column: 50
        }
      },
      "22": {
        start: {
          line: 80,
          column: 2
        },
        end: {
          line: 82,
          column: 3
        }
      },
      "23": {
        start: {
          line: 81,
          column: 4
        },
        end: {
          line: 81,
          column: 23
        }
      },
      "24": {
        start: {
          line: 84,
          column: 25
        },
        end: {
          line: 87,
          column: 8
        }
      },
      "25": {
        start: {
          line: 85,
          column: 4
        },
        end: {
          line: 85,
          column: 87
        }
      },
      "26": {
        start: {
          line: 85,
          column: 60
        },
        end: {
          line: 85,
          column: 78
        }
      },
      "27": {
        start: {
          line: 86,
          column: 4
        },
        end: {
          line: 86,
          column: 15
        }
      },
      "28": {
        start: {
          line: 89,
          column: 23
        },
        end: {
          line: 89,
          column: 26
        }
      },
      "29": {
        start: {
          line: 90,
          column: 23
        },
        end: {
          line: 90,
          column: 26
        }
      },
      "30": {
        start: {
          line: 91,
          column: 23
        },
        end: {
          line: 91,
          column: 26
        }
      },
      "31": {
        start: {
          line: 93,
          column: 14
        },
        end: {
          line: 93,
          column: 15
        }
      },
      "32": {
        start: {
          line: 94,
          column: 2
        },
        end: {
          line: 123,
          column: 3
        }
      },
      "33": {
        start: {
          line: 95,
          column: 21
        },
        end: {
          line: 95,
          column: 27
        }
      },
      "34": {
        start: {
          line: 96,
          column: 12
        },
        end: {
          line: 96,
          column: 13
        }
      },
      "35": {
        start: {
          line: 97,
          column: 4
        },
        end: {
          line: 121,
          column: 5
        }
      },
      "36": {
        start: {
          line: 98,
          column: 29
        },
        end: {
          line: 98,
          column: 31
        }
      },
      "37": {
        start: {
          line: 99,
          column: 14
        },
        end: {
          line: 99,
          column: 19
        }
      },
      "38": {
        start: {
          line: 100,
          column: 6
        },
        end: {
          line: 114,
          column: 7
        }
      },
      "39": {
        start: {
          line: 101,
          column: 8
        },
        end: {
          line: 103,
          column: 9
        }
      },
      "40": {
        start: {
          line: 102,
          column: 10
        },
        end: {
          line: 102,
          column: 19
        }
      },
      "41": {
        start: {
          line: 105,
          column: 8
        },
        end: {
          line: 105,
          column: 19
        }
      },
      "42": {
        start: {
          line: 106,
          column: 8
        },
        end: {
          line: 106,
          column: 19
        }
      },
      "43": {
        start: {
          line: 107,
          column: 8
        },
        end: {
          line: 107,
          column: 42
        }
      },
      "44": {
        start: {
          line: 110,
          column: 8
        },
        end: {
          line: 110,
          column: 26
        }
      },
      "45": {
        start: {
          line: 111,
          column: 8
        },
        end: {
          line: 113,
          column: 9
        }
      },
      "46": {
        start: {
          line: 112,
          column: 10
        },
        end: {
          line: 112,
          column: 89
        }
      },
      "47": {
        start: {
          line: 112,
          column: 65
        },
        end: {
          line: 112,
          column: 86
        }
      },
      "48": {
        start: {
          line: 116,
          column: 6
        },
        end: {
          line: 116,
          column: 34
        }
      },
      "49": {
        start: {
          line: 118,
          column: 6
        },
        end: {
          line: 118,
          column: 24
        }
      },
      "50": {
        start: {
          line: 120,
          column: 6
        },
        end: {
          line: 120,
          column: 16
        }
      },
      "51": {
        start: {
          line: 122,
          column: 4
        },
        end: {
          line: 122,
          column: 26
        }
      },
      "52": {
        start: {
          line: 124,
          column: 2
        },
        end: {
          line: 124,
          column: 37
        }
      },
      "53": {
        start: {
          line: 132,
          column: 17
        },
        end: {
          line: 132,
          column: 35
        }
      },
      "54": {
        start: {
          line: 133,
          column: 2
        },
        end: {
          line: 136,
          column: 3
        }
      },
      "55": {
        start: {
          line: 134,
          column: 4
        },
        end: {
          line: 134,
          column: 38
        }
      },
      "56": {
        start: {
          line: 135,
          column: 4
        },
        end: {
          line: 135,
          column: 38
        }
      },
      "57": {
        start: {
          line: 143,
          column: 2
        },
        end: {
          line: 145,
          column: 3
        }
      },
      "58": {
        start: {
          line: 144,
          column: 4
        },
        end: {
          line: 144,
          column: 76
        }
      },
      "59": {
        start: {
          line: 147,
          column: 17
        },
        end: {
          line: 164,
          column: 3
        }
      },
      "60": {
        start: {
          line: 149,
          column: 6
        },
        end: {
          line: 151,
          column: 7
        }
      },
      "61": {
        start: {
          line: 150,
          column: 8
        },
        end: {
          line: 150,
          column: 27
        }
      },
      "62": {
        start: {
          line: 152,
          column: 6
        },
        end: {
          line: 154,
          column: 7
        }
      },
      "63": {
        start: {
          line: 153,
          column: 8
        },
        end: {
          line: 153,
          column: 26
        }
      },
      "64": {
        start: {
          line: 155,
          column: 6
        },
        end: {
          line: 157,
          column: 7
        }
      },
      "65": {
        start: {
          line: 156,
          column: 8
        },
        end: {
          line: 156,
          column: 28
        }
      },
      "66": {
        start: {
          line: 158,
          column: 6
        },
        end: {
          line: 160,
          column: 7
        }
      },
      "67": {
        start: {
          line: 159,
          column: 8
        },
        end: {
          line: 159,
          column: 25
        }
      },
      "68": {
        start: {
          line: 161,
          column: 6
        },
        end: {
          line: 161,
          column: 17
        }
      },
      "69": {
        start: {
          line: 166,
          column: 12
        },
        end: {
          line: 166,
          column: 57
        }
      },
      "70": {
        start: {
          line: 167,
          column: 12
        },
        end: {
          line: 167,
          column: 58
        }
      },
      "71": {
        start: {
          line: 169,
          column: 2
        },
        end: {
          line: 175,
          column: 4
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 3,
            column: 28
          },
          end: {
            line: 3,
            column: 29
          }
        },
        loc: {
          start: {
            line: 3,
            column: 39
          },
          end: {
            line: 7,
            column: 1
          }
        },
        line: 3
      },
      "1": {
        name: "layout",
        decl: {
          start: {
            line: 13,
            column: 16
          },
          end: {
            line: 13,
            column: 22
          }
        },
        loc: {
          start: {
            line: 13,
            column: 45
          },
          end: {
            line: 44,
            column: 1
          }
        },
        line: 13
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 19,
            column: 42
          },
          end: {
            line: 19,
            column: 43
          }
        },
        loc: {
          start: {
            line: 19,
            column: 56
          },
          end: {
            line: 21,
            column: 3
          }
        },
        line: 19
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 27,
            column: 12
          },
          end: {
            line: 27,
            column: 13
          }
        },
        loc: {
          start: {
            line: 27,
            column: 19
          },
          end: {
            line: 27,
            column: 23
          }
        },
        line: 27
      },
      "4": {
        name: "initializePositions",
        decl: {
          start: {
            line: 62,
            column: 9
          },
          end: {
            line: 62,
            column: 28
          }
        },
        loc: {
          start: {
            line: 62,
            column: 43
          },
          end: {
            line: 125,
            column: 1
          }
        },
        line: 62
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 66,
            column: 32
          },
          end: {
            line: 66,
            column: 33
          }
        },
        loc: {
          start: {
            line: 66,
            column: 47
          },
          end: {
            line: 69,
            column: 3
          }
        },
        line: 66
      },
      "6": {
        name: "(anonymous_6)",
        decl: {
          start: {
            line: 70,
            column: 32
          },
          end: {
            line: 70,
            column: 33
          }
        },
        loc: {
          start: {
            line: 70,
            column: 47
          },
          end: {
            line: 74,
            column: 3
          }
        },
        line: 70
      },
      "7": {
        name: "(anonymous_7)",
        decl: {
          start: {
            line: 76,
            column: 27
          },
          end: {
            line: 76,
            column: 28
          }
        },
        loc: {
          start: {
            line: 76,
            column: 34
          },
          end: {
            line: 76,
            column: 50
          }
        },
        line: 76
      },
      "8": {
        name: "(anonymous_8)",
        decl: {
          start: {
            line: 84,
            column: 38
          },
          end: {
            line: 84,
            column: 39
          }
        },
        loc: {
          start: {
            line: 84,
            column: 50
          },
          end: {
            line: 87,
            column: 3
          }
        },
        line: 84
      },
      "9": {
        name: "(anonymous_9)",
        decl: {
          start: {
            line: 85,
            column: 53
          },
          end: {
            line: 85,
            column: 54
          }
        },
        loc: {
          start: {
            line: 85,
            column: 60
          },
          end: {
            line: 85,
            column: 78
          }
        },
        line: 85
      },
      "10": {
        name: "(anonymous_10)",
        decl: {
          start: {
            line: 112,
            column: 55
          },
          end: {
            line: 112,
            column: 56
          }
        },
        loc: {
          start: {
            line: 112,
            column: 65
          },
          end: {
            line: 112,
            column: 86
          }
        },
        line: 112
      },
      "11": {
        name: "centerNodes",
        decl: {
          start: {
            line: 131,
            column: 9
          },
          end: {
            line: 131,
            column: 20
          }
        },
        loc: {
          start: {
            line: 131,
            column: 28
          },
          end: {
            line: 137,
            column: 1
          }
        },
        line: 131
      },
      "12": {
        name: "graphBounds",
        decl: {
          start: {
            line: 142,
            column: 9
          },
          end: {
            line: 142,
            column: 20
          }
        },
        loc: {
          start: {
            line: 142,
            column: 28
          },
          end: {
            line: 176,
            column: 1
          }
        },
        line: 142
      },
      "13": {
        name: "(anonymous_13)",
        decl: {
          start: {
            line: 148,
            column: 4
          },
          end: {
            line: 148,
            column: 5
          }
        },
        loc: {
          start: {
            line: 148,
            column: 19
          },
          end: {
            line: 162,
            column: 5
          }
        },
        line: 148
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 72,
            column: 25
          },
          end: {
            line: 72,
            column: 44
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 72,
            column: 25
          },
          end: {
            line: 72,
            column: 38
          }
        }, {
          start: {
            line: 72,
            column: 42
          },
          end: {
            line: 72,
            column: 44
          }
        }],
        line: 72
      },
      "1": {
        loc: {
          start: {
            line: 80,
            column: 2
          },
          end: {
            line: 82,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 80,
            column: 2
          },
          end: {
            line: 82,
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
        line: 80
      },
      "2": {
        loc: {
          start: {
            line: 85,
            column: 17
          },
          end: {
            line: 85,
            column: 84
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 85,
            column: 34
          },
          end: {
            line: 85,
            column: 79
          }
        }, {
          start: {
            line: 85,
            column: 82
          },
          end: {
            line: 85,
            column: 84
          }
        }],
        line: 85
      },
      "3": {
        loc: {
          start: {
            line: 101,
            column: 8
          },
          end: {
            line: 103,
            column: 9
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 101,
            column: 8
          },
          end: {
            line: 103,
            column: 9
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
        line: 101
      },
      "4": {
        loc: {
          start: {
            line: 111,
            column: 8
          },
          end: {
            line: 113,
            column: 9
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 111,
            column: 8
          },
          end: {
            line: 113,
            column: 9
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
        line: 111
      },
      "5": {
        loc: {
          start: {
            line: 143,
            column: 2
          },
          end: {
            line: 145,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 143,
            column: 2
          },
          end: {
            line: 145,
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
        line: 143
      },
      "6": {
        loc: {
          start: {
            line: 149,
            column: 6
          },
          end: {
            line: 151,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 149,
            column: 6
          },
          end: {
            line: 151,
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
        line: 149
      },
      "7": {
        loc: {
          start: {
            line: 152,
            column: 6
          },
          end: {
            line: 154,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 152,
            column: 6
          },
          end: {
            line: 154,
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
        line: 152
      },
      "8": {
        loc: {
          start: {
            line: 155,
            column: 6
          },
          end: {
            line: 157,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 155,
            column: 6
          },
          end: {
            line: 157,
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
        line: 155
      },
      "9": {
        loc: {
          start: {
            line: 158,
            column: 6
          },
          end: {
            line: 160,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 158,
            column: 6
          },
          end: {
            line: 160,
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
        line: 158
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
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0,
      "34": 0,
      "35": 0,
      "36": 0,
      "37": 0,
      "38": 0,
      "39": 0,
      "40": 0,
      "41": 0,
      "42": 0,
      "43": 0,
      "44": 0,
      "45": 0,
      "46": 0,
      "47": 0,
      "48": 0,
      "49": 0,
      "50": 0,
      "51": 0,
      "52": 0,
      "53": 0,
      "54": 0,
      "55": 0,
      "56": 0,
      "57": 0,
      "58": 0,
      "59": 0,
      "60": 0,
      "61": 0,
      "62": 0,
      "63": 0,
      "64": 0,
      "65": 0,
      "66": 0,
      "67": 0,
      "68": 0,
      "69": 0,
      "70": 0,
      "71": 0
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
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0],
      "2": [0, 0],
      "3": [0, 0],
      "4": [0, 0],
      "5": [0, 0],
      "6": [0, 0],
      "7": [0, 0],
      "8": [0, 0],
      "9": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "385d9ab751a9b2c98fd57ce8fa318c005deacec7"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage=_$registerCoverageObject(coverage[path]);
  {
    // @ts-ignore
    cov_1192jcx60q = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1192jcx60q();
import { forceSimulation, forceLink, forceCollide, forceX } from 'd3-force';
addEventListener('message', event => {
  const {
    nodes,
    edges,
    config
  } = (event.data);
  layout(nodes, edges, config);
  postMessage({
    nodes,
    edges
  });
}); /**
    * Use d3 force layout to lay the nodes in a sensible way. This function modifies the nodes adding the x,y positions
    * and also fills in node references in edges instead of node ids.
    */
export function layout(nodes, edges, config) {
  // Start with some hardcoded positions so it starts laid out from left to right
  let {
    roots,
    secondLevelRoots
  } = (initializePositions(nodes, edges)); // There always seems to be one or more root nodes each with single edge and we want to have them static on the
  // left neatly in something like grid layout
  [...roots, ...secondLevelRoots].forEach((n, index) => {
    n.fx = n.x;
  });
  const simulation = (forceSimulation(nodes).force('link', forceLink(edges).id(d => {
    return d.id;
  }).distance(config.linkDistance).strength(config.linkStrength)) // to keep the left to right layout we add force that pulls all nodes to right but because roots are fixed it will
  // apply only to non root nodes
  .force('x', forceX(config.forceX).strength(config.forceXStrength)) // Make sure nodes don't overlap
  .force('collide', forceCollide(config.forceCollide))); // 300 ticks for the simulation are recommended but less would probably work too, most movement is done in first
  // few iterations and then all the forces gets smaller https://github.com/d3/d3-force#simulation_alphaDecay
  simulation.tick(config.tick);
  simulation.stop(); // We do centering here instead of using centering force to keep this more stable
  centerNodes(nodes);
} /**
  * This initializes positions of the graph by going from the root to its children and laying it out in a grid from left
  * to right. This works only so, so because service map graphs can have cycles and children levels are not ordered in a
  * way to minimize the edge lengths. Nevertheless this seems to make the graph easier to nudge with the forces later on
  * than with the d3 default initial positioning. Also we can fix the root positions later on for a bit more neat
  * organisation.
  *
  * This function directly modifies the nodes given and only returns references to root nodes so they do not have to be
  * found again later on.
  *
  * How the spacing could look like approximately:
  * 0 - 0 - 0 - 0
  *  \- 0 - 0   |
  *      \- 0 -/
  * 0 - 0 -/
  */
function initializePositions(nodes, edges) {
  // To prevent going in cycles
  const alreadyPositioned = ({});
  const nodesMap = (nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {}));
  const edgesMap = (edges.reduce((acc, edge) => {
    const sourceId = (edge.source);
    acc[sourceId] = [...((acc[sourceId]) || ([])), edge];
    return acc;
  }, {}));
  let roots = (nodes.filter(n => {
    return n.incoming === 0;
  })); // For things like service maps we assume there is some root (client) node but if there is none then selecting
  // any node as a starting point should work the same.
  if (!roots.length) {
    roots = [nodes[0]];
  } else {}
  let secondLevelRoots = (roots.reduce((acc, r) => {
    acc.push(...(edgesMap[r.id] ? (edgesMap[r.id].map(e => {
      return nodesMap[e.target];
    })) : ([])));
    return acc;
  }, []));
  const rootYSpacing = (300);
  const nodeYSpacing = (200);
  const nodeXSpacing = (200);
  let rootY = (0);
  for (const root of roots) {
    let graphLevel = ([root]);
    let x = (0);
    while (graphLevel.length > 0) {
      const nextGraphLevel = ([]);
      let y = (rootY);
      for (const node of graphLevel) {
        if (alreadyPositioned[node.id]) {
          continue;
        } else {} // Initialize positions based on the spacing in the grid
        node.x = x;
        node.y = y;
        alreadyPositioned[node.id] = true; // Move to next Y position for next node
        y += nodeYSpacing;
        if (edgesMap[node.id]) {
          nextGraphLevel.push(...edgesMap[node.id].map(edge => {
            return nodesMap[edge.target];
          }));
        } else {}
      }
      graphLevel = nextGraphLevel; // Move to next X position for next level
      x += nodeXSpacing; // Reset Y back to baseline for this root
      y = rootY;
    }
    rootY += rootYSpacing;
  }
  return {
    roots,
    secondLevelRoots
  };
} /**
  * Makes sure that the center of the graph based on its bound is in 0, 0 coordinates.
  * Modifies the nodes directly.
  */
function centerNodes(nodes) {
  const bounds = (graphBounds(nodes));
  for (let node of nodes) {
    node.x = node.x - bounds.center.x;
    node.y = node.y - bounds.center.y;
  }
} /**
  * Get bounds of the graph meaning the extent of the nodes in all directions.
  */
function graphBounds(nodes) {
  if (nodes.length === 0) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      center: {
        x: 0,
        y: 0
      }
    };
  } else {}
  const bounds = (nodes.reduce((acc, node) => {
    if (node.x > acc.right) {
      acc.right = node.x;
    } else {}
    if (node.x < acc.left) {
      acc.left = node.x;
    } else {}
    if (node.y > acc.bottom) {
      acc.bottom = node.y;
    } else {}
    if (node.y < acc.top) {
      acc.top = node.y;
    } else {}
    return acc;
  }, {
    top: Infinity,
    right: -Infinity,
    bottom: -Infinity,
    left: Infinity
  }));
  const y = (bounds.top + (bounds.bottom - bounds.top) / 2);
  const x = (bounds.left + (bounds.right - bounds.left) / 2);
  return {
    ...bounds,
    center: {
      x,
      y
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMTE5MmpjeDYwcSIsImFjdHVhbENvdmVyYWdlIiwiZm9yY2VTaW11bGF0aW9uIiwiZm9yY2VMaW5rIiwiZm9yY2VDb2xsaWRlIiwiZm9yY2VYIiwicyIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImYiLCJub2RlcyIsImVkZ2VzIiwiY29uZmlnIiwiZGF0YSIsImxheW91dCIsInBvc3RNZXNzYWdlIiwicm9vdHMiLCJzZWNvbmRMZXZlbFJvb3RzIiwiaW5pdGlhbGl6ZVBvc2l0aW9ucyIsImZvckVhY2giLCJuIiwiaW5kZXgiLCJmeCIsIngiLCJzaW11bGF0aW9uIiwiZm9yY2UiLCJpZCIsImQiLCJkaXN0YW5jZSIsImxpbmtEaXN0YW5jZSIsInN0cmVuZ3RoIiwibGlua1N0cmVuZ3RoIiwiZm9yY2VYU3RyZW5ndGgiLCJ0aWNrIiwic3RvcCIsImNlbnRlck5vZGVzIiwiYWxyZWFkeVBvc2l0aW9uZWQiLCJub2Rlc01hcCIsInJlZHVjZSIsImFjYyIsIm5vZGUiLCJlZGdlc01hcCIsImVkZ2UiLCJzb3VyY2VJZCIsInNvdXJjZSIsImIiLCJmaWx0ZXIiLCJpbmNvbWluZyIsImxlbmd0aCIsInIiLCJwdXNoIiwibWFwIiwiZSIsInRhcmdldCIsInJvb3RZU3BhY2luZyIsIm5vZGVZU3BhY2luZyIsIm5vZGVYU3BhY2luZyIsInJvb3RZIiwicm9vdCIsImdyYXBoTGV2ZWwiLCJuZXh0R3JhcGhMZXZlbCIsInkiLCJib3VuZHMiLCJncmFwaEJvdW5kcyIsImNlbnRlciIsInRvcCIsInJpZ2h0IiwiYm90dG9tIiwibGVmdCIsIkluZmluaXR5Il0sInNvdXJjZXMiOlsibGF5b3V0Lndvcmtlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmb3JjZVNpbXVsYXRpb24sIGZvcmNlTGluaywgZm9yY2VDb2xsaWRlLCBmb3JjZVggfSBmcm9tICdkMy1mb3JjZSc7XG5cbmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgY29uc3QgeyBub2RlcywgZWRnZXMsIGNvbmZpZyB9ID0gZXZlbnQuZGF0YTtcbiAgbGF5b3V0KG5vZGVzLCBlZGdlcywgY29uZmlnKTtcbiAgcG9zdE1lc3NhZ2UoeyBub2RlcywgZWRnZXMgfSk7XG59KTtcblxuLyoqXG4gKiBVc2UgZDMgZm9yY2UgbGF5b3V0IHRvIGxheSB0aGUgbm9kZXMgaW4gYSBzZW5zaWJsZSB3YXkuIFRoaXMgZnVuY3Rpb24gbW9kaWZpZXMgdGhlIG5vZGVzIGFkZGluZyB0aGUgeCx5IHBvc2l0aW9uc1xuICogYW5kIGFsc28gZmlsbHMgaW4gbm9kZSByZWZlcmVuY2VzIGluIGVkZ2VzIGluc3RlYWQgb2Ygbm9kZSBpZHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXlvdXQobm9kZXMsIGVkZ2VzLCBjb25maWcpIHtcbiAgLy8gU3RhcnQgd2l0aCBzb21lIGhhcmRjb2RlZCBwb3NpdGlvbnMgc28gaXQgc3RhcnRzIGxhaWQgb3V0IGZyb20gbGVmdCB0byByaWdodFxuICBsZXQgeyByb290cywgc2Vjb25kTGV2ZWxSb290cyB9ID0gaW5pdGlhbGl6ZVBvc2l0aW9ucyhub2RlcywgZWRnZXMpO1xuXG4gIC8vIFRoZXJlIGFsd2F5cyBzZWVtcyB0byBiZSBvbmUgb3IgbW9yZSByb290IG5vZGVzIGVhY2ggd2l0aCBzaW5nbGUgZWRnZSBhbmQgd2Ugd2FudCB0byBoYXZlIHRoZW0gc3RhdGljIG9uIHRoZVxuICAvLyBsZWZ0IG5lYXRseSBpbiBzb21ldGhpbmcgbGlrZSBncmlkIGxheW91dFxuICBbLi4ucm9vdHMsIC4uLnNlY29uZExldmVsUm9vdHNdLmZvckVhY2goKG4sIGluZGV4KSA9PiB7XG4gICAgbi5meCA9IG4ueDtcbiAgfSk7XG5cbiAgY29uc3Qgc2ltdWxhdGlvbiA9IGZvcmNlU2ltdWxhdGlvbihub2RlcylcbiAgICAuZm9yY2UoXG4gICAgICAnbGluaycsXG4gICAgICBmb3JjZUxpbmsoZWRnZXMpXG4gICAgICAgIC5pZCgoZCkgPT4gZC5pZClcbiAgICAgICAgLmRpc3RhbmNlKGNvbmZpZy5saW5rRGlzdGFuY2UpXG4gICAgICAgIC5zdHJlbmd0aChjb25maWcubGlua1N0cmVuZ3RoKVxuICAgIClcbiAgICAvLyB0byBrZWVwIHRoZSBsZWZ0IHRvIHJpZ2h0IGxheW91dCB3ZSBhZGQgZm9yY2UgdGhhdCBwdWxscyBhbGwgbm9kZXMgdG8gcmlnaHQgYnV0IGJlY2F1c2Ugcm9vdHMgYXJlIGZpeGVkIGl0IHdpbGxcbiAgICAvLyBhcHBseSBvbmx5IHRvIG5vbiByb290IG5vZGVzXG4gICAgLmZvcmNlKCd4JywgZm9yY2VYKGNvbmZpZy5mb3JjZVgpLnN0cmVuZ3RoKGNvbmZpZy5mb3JjZVhTdHJlbmd0aCkpXG4gICAgLy8gTWFrZSBzdXJlIG5vZGVzIGRvbid0IG92ZXJsYXBcbiAgICAuZm9yY2UoJ2NvbGxpZGUnLCBmb3JjZUNvbGxpZGUoY29uZmlnLmZvcmNlQ29sbGlkZSkpO1xuXG4gIC8vIDMwMCB0aWNrcyBmb3IgdGhlIHNpbXVsYXRpb24gYXJlIHJlY29tbWVuZGVkIGJ1dCBsZXNzIHdvdWxkIHByb2JhYmx5IHdvcmsgdG9vLCBtb3N0IG1vdmVtZW50IGlzIGRvbmUgaW4gZmlyc3RcbiAgLy8gZmV3IGl0ZXJhdGlvbnMgYW5kIHRoZW4gYWxsIHRoZSBmb3JjZXMgZ2V0cyBzbWFsbGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9kMy9kMy1mb3JjZSNzaW11bGF0aW9uX2FscGhhRGVjYXlcbiAgc2ltdWxhdGlvbi50aWNrKGNvbmZpZy50aWNrKTtcbiAgc2ltdWxhdGlvbi5zdG9wKCk7XG5cbiAgLy8gV2UgZG8gY2VudGVyaW5nIGhlcmUgaW5zdGVhZCBvZiB1c2luZyBjZW50ZXJpbmcgZm9yY2UgdG8ga2VlcCB0aGlzIG1vcmUgc3RhYmxlXG4gIGNlbnRlck5vZGVzKG5vZGVzKTtcbn1cblxuLyoqXG4gKiBUaGlzIGluaXRpYWxpemVzIHBvc2l0aW9ucyBvZiB0aGUgZ3JhcGggYnkgZ29pbmcgZnJvbSB0aGUgcm9vdCB0byBpdHMgY2hpbGRyZW4gYW5kIGxheWluZyBpdCBvdXQgaW4gYSBncmlkIGZyb20gbGVmdFxuICogdG8gcmlnaHQuIFRoaXMgd29ya3Mgb25seSBzbywgc28gYmVjYXVzZSBzZXJ2aWNlIG1hcCBncmFwaHMgY2FuIGhhdmUgY3ljbGVzIGFuZCBjaGlsZHJlbiBsZXZlbHMgYXJlIG5vdCBvcmRlcmVkIGluIGFcbiAqIHdheSB0byBtaW5pbWl6ZSB0aGUgZWRnZSBsZW5ndGhzLiBOZXZlcnRoZWxlc3MgdGhpcyBzZWVtcyB0byBtYWtlIHRoZSBncmFwaCBlYXNpZXIgdG8gbnVkZ2Ugd2l0aCB0aGUgZm9yY2VzIGxhdGVyIG9uXG4gKiB0aGFuIHdpdGggdGhlIGQzIGRlZmF1bHQgaW5pdGlhbCBwb3NpdGlvbmluZy4gQWxzbyB3ZSBjYW4gZml4IHRoZSByb290IHBvc2l0aW9ucyBsYXRlciBvbiBmb3IgYSBiaXQgbW9yZSBuZWF0XG4gKiBvcmdhbmlzYXRpb24uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBkaXJlY3RseSBtb2RpZmllcyB0aGUgbm9kZXMgZ2l2ZW4gYW5kIG9ubHkgcmV0dXJucyByZWZlcmVuY2VzIHRvIHJvb3Qgbm9kZXMgc28gdGhleSBkbyBub3QgaGF2ZSB0byBiZVxuICogZm91bmQgYWdhaW4gbGF0ZXIgb24uXG4gKlxuICogSG93IHRoZSBzcGFjaW5nIGNvdWxkIGxvb2sgbGlrZSBhcHByb3hpbWF0ZWx5OlxuICogMCAtIDAgLSAwIC0gMFxuICogIFxcLSAwIC0gMCAgIHxcbiAqICAgICAgXFwtIDAgLS9cbiAqIDAgLSAwIC0vXG4gKi9cbmZ1bmN0aW9uIGluaXRpYWxpemVQb3NpdGlvbnMobm9kZXMsIGVkZ2VzKSB7XG4gIC8vIFRvIHByZXZlbnQgZ29pbmcgaW4gY3ljbGVzXG4gIGNvbnN0IGFscmVhZHlQb3NpdGlvbmVkID0ge307XG5cbiAgY29uc3Qgbm9kZXNNYXAgPSBub2Rlcy5yZWR1Y2UoKGFjYywgbm9kZSkgPT4ge1xuICAgIGFjY1tub2RlLmlkXSA9IG5vZGU7XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuICBjb25zdCBlZGdlc01hcCA9IGVkZ2VzLnJlZHVjZSgoYWNjLCBlZGdlKSA9PiB7XG4gICAgY29uc3Qgc291cmNlSWQgPSBlZGdlLnNvdXJjZTtcbiAgICBhY2Nbc291cmNlSWRdID0gWy4uLihhY2Nbc291cmNlSWRdIHx8IFtdKSwgZWRnZV07XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuXG4gIGxldCByb290cyA9IG5vZGVzLmZpbHRlcigobikgPT4gbi5pbmNvbWluZyA9PT0gMCk7XG5cbiAgLy8gRm9yIHRoaW5ncyBsaWtlIHNlcnZpY2UgbWFwcyB3ZSBhc3N1bWUgdGhlcmUgaXMgc29tZSByb290IChjbGllbnQpIG5vZGUgYnV0IGlmIHRoZXJlIGlzIG5vbmUgdGhlbiBzZWxlY3RpbmdcbiAgLy8gYW55IG5vZGUgYXMgYSBzdGFydGluZyBwb2ludCBzaG91bGQgd29yayB0aGUgc2FtZS5cbiAgaWYgKCFyb290cy5sZW5ndGgpIHtcbiAgICByb290cyA9IFtub2Rlc1swXV07XG4gIH1cblxuICBsZXQgc2Vjb25kTGV2ZWxSb290cyA9IHJvb3RzLnJlZHVjZSgoYWNjLCByKSA9PiB7XG4gICAgYWNjLnB1c2goLi4uKGVkZ2VzTWFwW3IuaWRdID8gZWRnZXNNYXBbci5pZF0ubWFwKChlKSA9PiBub2Rlc01hcFtlLnRhcmdldF0pIDogW10pKTtcbiAgICByZXR1cm4gYWNjO1xuICB9LCBbXSk7XG5cbiAgY29uc3Qgcm9vdFlTcGFjaW5nID0gMzAwO1xuICBjb25zdCBub2RlWVNwYWNpbmcgPSAyMDA7XG4gIGNvbnN0IG5vZGVYU3BhY2luZyA9IDIwMDtcblxuICBsZXQgcm9vdFkgPSAwO1xuICBmb3IgKGNvbnN0IHJvb3Qgb2Ygcm9vdHMpIHtcbiAgICBsZXQgZ3JhcGhMZXZlbCA9IFtyb290XTtcbiAgICBsZXQgeCA9IDA7XG4gICAgd2hpbGUgKGdyYXBoTGV2ZWwubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgbmV4dEdyYXBoTGV2ZWwgPSBbXTtcbiAgICAgIGxldCB5ID0gcm9vdFk7XG4gICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgZ3JhcGhMZXZlbCkge1xuICAgICAgICBpZiAoYWxyZWFkeVBvc2l0aW9uZWRbbm9kZS5pZF0pIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJbml0aWFsaXplIHBvc2l0aW9ucyBiYXNlZCBvbiB0aGUgc3BhY2luZyBpbiB0aGUgZ3JpZFxuICAgICAgICBub2RlLnggPSB4O1xuICAgICAgICBub2RlLnkgPSB5O1xuICAgICAgICBhbHJlYWR5UG9zaXRpb25lZFtub2RlLmlkXSA9IHRydWU7XG5cbiAgICAgICAgLy8gTW92ZSB0byBuZXh0IFkgcG9zaXRpb24gZm9yIG5leHQgbm9kZVxuICAgICAgICB5ICs9IG5vZGVZU3BhY2luZztcbiAgICAgICAgaWYgKGVkZ2VzTWFwW25vZGUuaWRdKSB7XG4gICAgICAgICAgbmV4dEdyYXBoTGV2ZWwucHVzaCguLi5lZGdlc01hcFtub2RlLmlkXS5tYXAoKGVkZ2UpID0+IG5vZGVzTWFwW2VkZ2UudGFyZ2V0XSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGdyYXBoTGV2ZWwgPSBuZXh0R3JhcGhMZXZlbDtcbiAgICAgIC8vIE1vdmUgdG8gbmV4dCBYIHBvc2l0aW9uIGZvciBuZXh0IGxldmVsXG4gICAgICB4ICs9IG5vZGVYU3BhY2luZztcbiAgICAgIC8vIFJlc2V0IFkgYmFjayB0byBiYXNlbGluZSBmb3IgdGhpcyByb290XG4gICAgICB5ID0gcm9vdFk7XG4gICAgfVxuICAgIHJvb3RZICs9IHJvb3RZU3BhY2luZztcbiAgfVxuICByZXR1cm4geyByb290cywgc2Vjb25kTGV2ZWxSb290cyB9O1xufVxuXG4vKipcbiAqIE1ha2VzIHN1cmUgdGhhdCB0aGUgY2VudGVyIG9mIHRoZSBncmFwaCBiYXNlZCBvbiBpdHMgYm91bmQgaXMgaW4gMCwgMCBjb29yZGluYXRlcy5cbiAqIE1vZGlmaWVzIHRoZSBub2RlcyBkaXJlY3RseS5cbiAqL1xuZnVuY3Rpb24gY2VudGVyTm9kZXMobm9kZXMpIHtcbiAgY29uc3QgYm91bmRzID0gZ3JhcGhCb3VuZHMobm9kZXMpO1xuICBmb3IgKGxldCBub2RlIG9mIG5vZGVzKSB7XG4gICAgbm9kZS54ID0gbm9kZS54IC0gYm91bmRzLmNlbnRlci54O1xuICAgIG5vZGUueSA9IG5vZGUueSAtIGJvdW5kcy5jZW50ZXIueTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCBib3VuZHMgb2YgdGhlIGdyYXBoIG1lYW5pbmcgdGhlIGV4dGVudCBvZiB0aGUgbm9kZXMgaW4gYWxsIGRpcmVjdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIGdyYXBoQm91bmRzKG5vZGVzKSB7XG4gIGlmIChub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4geyB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAsIGxlZnQ6IDAsIGNlbnRlcjogeyB4OiAwLCB5OiAwIH0gfTtcbiAgfVxuXG4gIGNvbnN0IGJvdW5kcyA9IG5vZGVzLnJlZHVjZShcbiAgICAoYWNjLCBub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS54ID4gYWNjLnJpZ2h0KSB7XG4gICAgICAgIGFjYy5yaWdodCA9IG5vZGUueDtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLnggPCBhY2MubGVmdCkge1xuICAgICAgICBhY2MubGVmdCA9IG5vZGUueDtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLnkgPiBhY2MuYm90dG9tKSB7XG4gICAgICAgIGFjYy5ib3R0b20gPSBub2RlLnk7XG4gICAgICB9XG4gICAgICBpZiAobm9kZS55IDwgYWNjLnRvcCkge1xuICAgICAgICBhY2MudG9wID0gbm9kZS55O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LFxuICAgIHsgdG9wOiBJbmZpbml0eSwgcmlnaHQ6IC1JbmZpbml0eSwgYm90dG9tOiAtSW5maW5pdHksIGxlZnQ6IEluZmluaXR5IH1cbiAgKTtcblxuICBjb25zdCB5ID0gYm91bmRzLnRvcCArIChib3VuZHMuYm90dG9tIC0gYm91bmRzLnRvcCkgLyAyO1xuICBjb25zdCB4ID0gYm91bmRzLmxlZnQgKyAoYm91bmRzLnJpZ2h0IC0gYm91bmRzLmxlZnQpIC8gMjtcblxuICByZXR1cm4ge1xuICAgIC4uLmJvdW5kcyxcbiAgICBjZW50ZXI6IHtcbiAgICAgIHgsXG4gICAgICB5LFxuICAgIH0sXG4gIH07XG59XG4iXSwibWFwcGluZ3MiOiIralRBZVk7QUFBQUEsY0FBQSxTQUFBQSxDQUFBLFNBQUFDLGNBQUEsV0FBQUEsY0FBQSxFQUFBRCxjQUFBLEdBZlosT0FBU0UsZUFBZSxDQUFFQyxTQUFTLENBQUVDLFlBQVksQ0FBRUMsTUFBTSxLQUFRLFVBQVUsQ0FBQ0wsY0FBQSxHQUFBTSxDQUFBLE1BRTVFQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUdDLEtBQUssRUFBSyxDQUFBUixjQUFBLEdBQUFTLENBQUEsTUFDckMsS0FBTSxDQUFFQyxLQUFLLENBQUVDLEtBQUssQ0FBRUMsTUFBTyxDQUFDLEVBQUFaLGNBQUEsR0FBQU0sQ0FBQSxNQUFHRSxLQUFLLENBQUNLLElBQUksRUFBQ2IsY0FBQSxHQUFBTSxDQUFBLE1BQzVDUSxNQUFNLENBQUNKLEtBQUssQ0FBRUMsS0FBSyxDQUFFQyxNQUFNLENBQUMsQ0FBQ1osY0FBQSxHQUFBTSxDQUFBLE1BQzdCUyxXQUFXLENBQUMsQ0FBRUwsS0FBSyxDQUFFQyxLQUFNLENBQUMsQ0FBQyxDQUMvQixDQUFDLENBQUMsQ0FFRjtBQUNBO0FBQ0E7QUFDQSxHQUNBLE1BQU8sU0FBUyxDQUFBRyxNQUFNQSxDQUFDSixLQUFLLENBQUVDLEtBQUssQ0FBRUMsTUFBTSxDQUFFLENBQUFaLGNBQUEsR0FBQVMsQ0FBQSxNQUMzQztBQUNBLEdBQUksQ0FBRU8sS0FBSyxDQUFFQyxnQkFBaUIsQ0FBQyxFQUFBakIsY0FBQSxHQUFBTSxDQUFBLE1BQUdZLG1CQUFtQixDQUFDUixLQUFLLENBQUVDLEtBQUssQ0FBQyxFQUVuRTtBQUNBO0FBQUFYLGNBQUEsR0FBQU0sQ0FBQSxNQUNBLENBQUMsR0FBR1UsS0FB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 
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMTE5MmpjeDYwcSIsImFjdHVhbENvdmVyYWdlIiwiZm9yY2VTaW11bGF0aW9uIiwiZm9yY2VMaW5rIiwiZm9yY2VDb2xsaWRlIiwiZm9yY2VYIiwicyIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImYiLCJub2RlcyIsImVkZ2VzIiwiY29uZmlnIiwiZGF0YSIsImxheW91dCIsInBvc3RNZXNzYWdlIiwicm9vdHMiLCJzZWNvbmRMZXZlbFJvb3RzIiwiaW5pdGlhbGl6ZVBvc2l0aW9ucyIsImZvckVhY2giLCJuIiwiaW5kZXgiLCJmeCIsIngiLCJzaW11bGF0aW9uIiwiZm9yY2UiLCJpZCIsImQiLCJkaXN0YW5jZSIsImxpbmtEaXN0YW5jZSIsInN0cmVuZ3RoIiwibGlua1N0cmVuZ3RoIiwiZm9yY2VYU3RyZW5ndGgiLCJ0aWNrIiwic3RvcCIsImNlbnRlck5vZGVzIiwiYWxyZWFkeVBvc2l0aW9uZWQiLCJub2Rlc01hcCIsInJlZHVjZSIsImFjYyIsIm5vZGUiLCJlZGdlc01hcCIsImVkZ2UiLCJzb3VyY2VJZCIsInNvdXJjZSIsImIiLCJmaWx0ZXIiLCJpbmNvbWluZyIsImxlbmd0aCIsInIiLCJwdXNoIiwibWFwIiwiZSIsInRhcmdldCIsInJvb3RZU3BhY2luZyIsIm5vZGVZU3BhY2luZyIsIm5vZGVYU3BhY2luZyIsInJvb3RZIiwicm9vdCIsImdyYXBoTGV2ZWwiLCJuZXh0R3JhcGhMZXZlbCIsInkiLCJib3VuZHMiLCJncmFwaEJvdW5kcyIsImNlbnRlciIsInRvcCIsInJpZ2h0IiwiYm90dG9tIiwibGVmdCIsIkluZmluaXR5Il0sInNvdXJjZXMiOlsibGF5b3V0Lndvcmtlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmb3JjZVNpbXVsYXRpb24sIGZvcmNlTGluaywgZm9yY2VDb2xsaWRlLCBmb3JjZVggfSBmcm9tICdkMy1mb3JjZSc7XG5cbmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgY29uc3QgeyBub2RlcywgZWRnZXMsIGNvbmZpZyB9ID0gZXZlbnQuZGF0YTtcbiAgbGF5b3V0KG5vZGVzLCBlZGdlcywgY29uZmlnKTtcbiAgcG9zdE1lc3NhZ2UoeyBub2RlcywgZWRnZXMgfSk7XG59KTtcblxuLyoqXG4gKiBVc2UgZDMgZm9yY2UgbGF5b3V0IHRvIGxheSB0aGUgbm9kZXMgaW4gYSBzZW5zaWJsZSB3YXkuIFRoaXMgZnVuY3Rpb24gbW9kaWZpZXMgdGhlIG5vZGVzIGFkZGluZyB0aGUgeCx5IHBvc2l0aW9uc1xuICogYW5kIGFsc28gZmlsbHMgaW4gbm9kZSByZWZlcmVuY2VzIGluIGVkZ2VzIGluc3RlYWQgb2Ygbm9kZSBpZHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXlvdXQobm9kZXMsIGVkZ2VzLCBjb25maWcpIHtcbiAgLy8gU3RhcnQgd2l0aCBzb21lIGhhcmRjb2RlZCBwb3NpdGlvbnMgc28gaXQgc3RhcnRzIGxhaWQgb3V0IGZyb20gbGVmdCB0byByaWdodFxuICBsZXQgeyByb290cywgc2Vjb25kTGV2ZWxSb290cyB9ID0gaW5pdGlhbGl6ZVBvc2l0aW9ucyhub2RlcywgZWRnZXMpO1xuXG4gIC8vIFRoZXJlIGFsd2F5cyBzZWVtcyB0byBiZSBvbmUgb3IgbW9yZSByb290IG5vZGVzIGVhY2ggd2l0aCBzaW5nbGUgZWRnZSBhbmQgd2Ugd2FudCB0byBoYXZlIHRoZW0gc3RhdGljIG9uIHRoZVxuICAvLyBsZWZ0IG5lYXRseSBpbiBzb21ldGhpbmcgbGlrZSBncmlkIGxheW91dFxuICBbLi4ucm9vdHMsIC4uLnNlY29uZExldmVsUm9vdHNdLmZvckVhY2goKG4sIGluZGV4KSA9PiB7XG4gICAgbi5meCA9IG4ueDtcbiAgfSk7XG5cbiAgY29uc3Qgc2ltdWxhdGlvbiA9IGZvcmNlU2ltdWxhdGlvbihub2RlcylcbiAgICAuZm9yY2UoXG4gICAgICAnbGluaycsXG4gICAgICBmb3JjZUxpbmsoZWRnZXMpXG4gICAgICAgIC5pZCgoZCkgPT4gZC5pZClcbiAgICAgICAgLmRpc3RhbmNlKGNvbmZpZy5saW5rRGlzdGFuY2UpXG4gICAgICAgIC5zdHJlbmd0aChjb25maWcubGlua1N0cmVuZ3RoKVxuICAgIClcbiAgICAvLyB0byBrZWVwIHRoZSBsZWZ0IHRvIHJpZ2h0IGxheW91dCB3ZSBhZGQgZm9yY2UgdGhhdCBwdWxscyBhbGwgbm9kZXMgdG8gcmlnaHQgYnV0IGJlY2F1c2Ugcm9vdHMgYXJlIGZpeGVkIGl0IHdpbGxcbiAgICAvLyBhcHBseSBvbmx5IHRvIG5vbiByb290IG5vZGVzXG4gICAgLmZvcmNlKCd4JywgZm9yY2VYKGNvbmZpZy5mb3JjZVgpLnN0cmVuZ3RoKGNvbmZpZy5mb3JjZVhTdHJlbmd0aCkpXG4gICAgLy8gTWFrZSBzdXJlIG5vZGVzIGRvbid0IG92ZXJsYXBcbiAgICAuZm9yY2UoJ2NvbGxpZGUnLCBmb3JjZUNvbGxpZGUoY29uZmlnLmZvcmNlQ29sbGlkZSkpO1xuXG4gIC8vIDMwMCB0aWNrcyBmb3IgdGhlIHNpbXVsYXRpb24gYXJlIHJlY29tbWVuZGVkIGJ1dCBsZXNzIHdvdWxkIHByb2JhYmx5IHdvcmsgdG9vLCBtb3N0IG1vdmVtZW50IGlzIGRvbmUgaW4gZmlyc3RcbiAgLy8gZmV3IGl0ZXJhdGlvbnMgYW5kIHRoZW4gYWxsIHRoZSBmb3JjZXMgZ2V0cyBzbWFsbGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9kMy9kMy1mb3JjZSNzaW11bGF0aW9uX2FscGhhRGVjYXlcbiAgc2ltdWxhdGlvbi50aWNrKGNvbmZpZy50aWNrKTtcbiAgc2ltdWxhdGlvbi5zdG9wKCk7XG5cbiAgLy8gV2UgZG8gY2VudGVyaW5nIGhlcmUgaW5zdGVhZCBvZiB1c2luZyBjZW50ZXJpbmcgZm9yY2UgdG8ga2VlcCB0aGlzIG1vcmUgc3RhYmxlXG4gIGNlbnRlck5vZGVzKG5vZGVzKTtcbn1cblxuLyoqXG4gKiBUaGlzIGluaXRpYWxpemVzIHBvc2l0aW9ucyBvZiB0aGUgZ3JhcGggYnkgZ29pbmcgZnJvbSB0aGUgcm9vdCB0byBpdHMgY2hpbGRyZW4gYW5kIGxheWluZyBpdCBvdXQgaW4gYSBncmlkIGZyb20gbGVmdFxuICogdG8gcmlnaHQuIFRoaXMgd29ya3Mgb25seSBzbywgc28gYmVjYXVzZSBzZXJ2aWNlIG1hcCBncmFwaHMgY2FuIGhhdmUgY3ljbGVzIGFuZCBjaGlsZHJlbiBsZXZlbHMgYXJlIG5vdCBvcmRlcmVkIGluIGFcbiAqIHdheSB0byBtaW5pbWl6ZSB0aGUgZWRnZSBsZW5ndGhzLiBOZXZlcnRoZWxlc3MgdGhpcyBzZWVtcyB0byBtYWtlIHRoZSBncmFwaCBlYXNpZXIgdG8gbnVkZ2Ugd2l0aCB0aGUgZm9yY2VzIGxhdGVyIG9uXG4gKiB0aGFuIHdpdGggdGhlIGQzIGRlZmF1bHQgaW5pdGlhbCBwb3NpdGlvbmluZy4gQWxzbyB3ZSBjYW4gZml4IHRoZSByb290IHBvc2l0aW9ucyBsYXRlciBvbiBmb3IgYSBiaXQgbW9yZSBuZWF0XG4gKiBvcmdhbmlzYXRpb24uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBkaXJlY3RseSBtb2RpZmllcyB0aGUgbm9kZXMgZ2l2ZW4gYW5kIG9ubHkgcmV0dXJucyByZWZlcmVuY2VzIHRvIHJvb3Qgbm9kZXMgc28gdGhleSBkbyBub3QgaGF2ZSB0byBiZVxuICogZm91bmQgYWdhaW4gbGF0ZXIgb24uXG4gKlxuICogSG93IHRoZSBzcGFjaW5nIGNvdWxkIGxvb2sgbGlrZSBhcHByb3hpbWF0ZWx5OlxuICogMCAtIDAgLSAwIC0gMFxuICogIFxcLSAwIC0gMCAgIHxcbiAqICAgICAgXFwtIDAgLS9cbiAqIDAgLSAwIC0vXG4gKi9cbmZ1bmN0aW9uIGluaXRpYWxpemVQb3NpdGlvbnMobm9kZXMsIGVkZ2VzKSB7XG4gIC8vIFRvIHByZXZlbnQgZ29pbmcgaW4gY3ljbGVzXG4gIGNvbnN0IGFscmVhZHlQb3NpdGlvbmVkID0ge307XG5cbiAgY29uc3Qgbm9kZXNNYXAgPSBub2Rlcy5yZWR1Y2UoKGFjYywgbm9kZSkgPT4ge1xuICAgIGFjY1tub2RlLmlkXSA9IG5vZGU7XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuICBjb25zdCBlZGdlc01hcCA9IGVkZ2VzLnJlZHVjZSgoYWNjLCBlZGdlKSA9PiB7XG4gICAgY29uc3Qgc291cmNlSWQgPSBlZGdlLnNvdXJjZTtcbiAgICBhY2Nbc291cmNlSWRdID0gWy4uLihhY2Nbc291cmNlSWRdIHx8IFtdKSwgZWRnZV07XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuXG4gIGxldCByb290cyA9IG5vZGVzLmZpbHRlcigobikgPT4gbi5pbmNvbWluZyA9PT0gMCk7XG5cbiAgLy8gRm9yIHRoaW5ncyBsaWtlIHNlcnZpY2UgbWFwcyB3ZSBhc3N1bWUgdGhlcmUgaXMgc29tZSByb290IChjbGllbnQpIG5vZGUgYnV0IGlmIHRoZXJlIGlzIG5vbmUgdGhlbiBzZWxlY3RpbmdcbiAgLy8gYW55IG5vZGUgYXMgYSBzdGFydGluZyBwb2ludCBzaG91bGQgd29yayB0aGUgc2FtZS5cbiAgaWYgKCFyb290cy5sZW5ndGgpIHtcbiAgICByb290cyA9IFtub2Rlc1swXV07XG4gIH1cblxuICBsZXQgc2Vjb25kTGV2ZWxSb290cyA9IHJvb3RzLnJlZHVjZSgoYWNjLCByKSA9PiB7XG4gICAgYWNjLnB1c2goLi4uKGVkZ2VzTWFwW3IuaWRdID8gZWRnZXNNYXBbci5pZF0ubWFwKChlKSA9PiBub2Rlc01hcFtlLnRhcmdldF0pIDogW10pKTtcbiAgICByZXR1cm4gYWNjO1xuICB9LCBbXSk7XG5cbiAgY29uc3Qgcm9vdFlTcGFjaW5nID0gMzAwO1xuICBjb25zdCBub2RlWVNwYWNpbmcgPSAyMDA7XG4gIGNvbnN0IG5vZGVYU3BhY2luZyA9IDIwMDtcblxuICBsZXQgcm9vdFkgPSAwO1xuICBmb3IgKGNvbnN0IHJvb3Qgb2Ygcm9vdHMpIHtcbiAgICBsZXQgZ3JhcGhMZXZlbCA9IFtyb290XTtcbiAgICBsZXQgeCA9IDA7XG4gICAgd2hpbGUgKGdyYXBoTGV2ZWwubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgbmV4dEdyYXBoTGV2ZWwgPSBbXTtcbiAgICAgIGxldCB5ID0gcm9vdFk7XG4gICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgZ3JhcGhMZXZlbCkge1xuICAgICAgICBpZiAoYWxyZWFkeVBvc2l0aW9uZWRbbm9kZS5pZF0pIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJbml0aWFsaXplIHBvc2l0aW9ucyBiYXNlZCBvbiB0aGUgc3BhY2luZyBpbiB0aGUgZ3JpZFxuICAgICAgICBub2RlLnggPSB4O1xuICAgICAgICBub2RlLnkgPSB5O1xuICAgICAgICBhbHJlYWR5UG9zaXRpb25lZFtub2RlLmlkXSA9IHRydWU7XG5cbiAgICAgICAgLy8gTW92ZSB0byBuZXh0IFkgcG9zaXRpb24gZm9yIG5leHQgbm9kZVxuICAgICAgICB5ICs9IG5vZGVZU3BhY2luZztcbiAgICAgICAgaWYgKGVkZ2VzTWFwW25vZGUuaWRdKSB7XG4gICAgICAgICAgbmV4dEdyYXBoTGV2ZWwucHVzaCguLi5lZGdlc01hcFtub2RlLmlkXS5tYXAoKGVkZ2UpID0+IG5vZGVzTWFwW2VkZ2UudGFyZ2V0XSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGdyYXBoTGV2ZWwgPSBuZXh0R3JhcGhMZXZlbDtcbiAgICAgIC8vIE1vdmUgdG8gbmV4dCBYIHBvc2l0aW9uIGZvciBuZXh0IGxldmVsXG4gICAgICB4ICs9IG5vZGVYU3BhY2luZztcbiAgICAgIC8vIFJlc2V0IFkgYmFjayB0byBiYXNlbGluZSBmb3IgdGhpcyByb290XG4gICAgICB5ID0gcm9vdFk7XG4gICAgfVxuICAgIHJvb3RZICs9IHJvb3RZU3BhY2luZztcbiAgfVxuICByZXR1cm4geyByb290cywgc2Vjb25kTGV2ZWxSb290cyB9O1xufVxuXG4vKipcbiAqIE1ha2VzIHN1cmUgdGhhdCB0aGUgY2VudGVyIG9mIHRoZSBncmFwaCBiYXNlZCBvbiBpdHMgYm91bmQgaXMgaW4gMCwgMCBjb29yZGluYXRlcy5cbiAqIE1vZGlmaWVzIHRoZSBub2RlcyBkaXJlY3RseS5cbiAqL1xuZnVuY3Rpb24gY2VudGVyTm9kZXMobm9kZXMpIHtcbiAgY29uc3QgYm91bmRzID0gZ3JhcGhCb3VuZHMobm9kZXMpO1xuICBmb3IgKGxldCBub2RlIG9mIG5vZGVzKSB7XG4gICAgbm9kZS54ID0gbm9kZS54IC0gYm91bmRzLmNlbnRlci54O1xuICAgIG5vZGUueSA9IG5vZGUueSAtIGJvdW5kcy5jZW50ZXIueTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCBib3VuZHMgb2YgdGhlIGdyYXBoIG1lYW5pbmcgdGhlIGV4dGVudCBvZiB0aGUgbm9kZXMgaW4gYWxsIGRpcmVjdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIGdyYXBoQm91bmRzKG5vZGVzKSB7XG4gIGlmIChub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4geyB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAsIGxlZnQ6IDAsIGNlbnRlcjogeyB4OiAwLCB5OiAwIH0gfTtcbiAgfVxuXG4gIGNvbnN0IGJvdW5kcyA9IG5vZGVzLnJlZHVjZShcbiAgICAoYWNjLCBub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS54ID4gYWNjLnJpZ2h0KSB7XG4gICAgICAgIGFjYy5yaWdodCA9IG5vZGUueDtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLnggPCBhY2MubGVmdCkge1xuICAgICAgICBhY2MubGVmdCA9IG5vZGUueDtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLnkgPiBhY2MuYm90dG9tKSB7XG4gICAgICAgIGFjYy5ib3R0b20gPSBub2RlLnk7XG4gICAgICB9XG4gICAgICBpZiAobm9kZS55IDwgYWNjLnRvcCkge1xuICAgICAgICBhY2MudG9wID0gbm9kZS55O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LFxuICAgIHsgdG9wOiBJbmZpbml0eSwgcmlnaHQ6IC1JbmZpbml0eSwgYm90dG9tOiAtSW5maW5pdHksIGxlZnQ6IEluZmluaXR5IH1cbiAgKTtcblxuICBjb25zdCB5ID0gYm91bmRzLnRvcCArIChib3VuZHMuYm90dG9tIC0gYm91bmRzLnRvcCkgLyAyO1xuICBjb25zdCB4ID0gYm91bmRzLmxlZnQgKyAoYm91bmRzLnJpZ2h0IC0gYm91bmRzLmxlZnQpIC8gMjtcblxuICByZXR1cm4ge1xuICAgIC4uLmJvdW5kcyxcbiAgICBjZW50ZXI6IHtcbiAgICAgIHgsXG4gICAgICB5LFxuICAgIH0sXG4gIH07XG59XG4iXSwibWFwcGluZ3MiOiIralRBZVk7QUFBQUEsY0FBQSxTQUFBQSxDQUFBLFNBQUFDLGNBQUEsV0FBQUEsY0FBQSxFQUFBRCxjQUFBLEdBZlosT0FBU0UsZUFBZSxDQUFFQyxTQUFTLENBQUVDLFlBQVksQ0FBRUMsTUFBTSxLQUFRLFVBQVUsQ0FBQ0wsY0FBQSxHQUFBTSxDQUFBLE1BRTVFQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUdDLEtBQUssRUFBSyxDQUFBUixjQUFBLEdBQUFTLENBQUEsTUFDckMsS0FBTSxDQUFFQyxLQUFLLENBQUVDLEtBQUssQ0FBRUMsTUFBTyxDQUFDLEVBQUFaLGNBQUEsR0FBQU0sQ0FBQSxNQUFHRSxLQUFLLENBQUNLLElBQUksRUFBQ2IsY0FBQSxHQUFBTSxDQUFBLE1BQzVDUSxNQUFNLENBQUNKLEtBQUssQ0FBRUMsS0FBSyxDQUFFQyxNQUFNLENBQUMsQ0FBQ1osY0FBQSxHQUFBTSxDQUFBLE1BQzdCUyxXQUFXLENBQUMsQ0FBRUwsS0FBSyxDQUFFQyxLQUFNLENBQUMsQ0FBQyxDQUMvQixDQUFDLENBQUMsQ0FFRjtBQUNBO0FBQ0E7QUFDQSxHQUNBLE1BQU8sU0FBUyxDQUFBRyxNQUFNQSxDQUFDSixLQUFLLENBQUVDLEtBQUssQ0FBRUMsTUFBTSxDQUFFLENBQUFaLGNBQUEsR0FBQVMsQ0FBQSxNQUMzQztBQUNBLEdBQUksQ0FBRU8sS0FBSyxDQUFFQyxnQkFBaUIsQ0FBQyxFQUFBakIsY0FBQSxHQUFBTSxDQUFBLE1BQUdZLG1CQUFtQixDQUFDUixLQUFLLENBQUVDLEtBQUssQ0FBQyxFQUVuRTtBQUNBO0FBQUFYLGNBQUEsR0FBQU0sQ0FBQSxNQUNBLENBQUMsR0FBR1UsS0FB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