/** $IS_JS_PROFILER_INSTRUMENTED=true **/ (()=>{function f(e){let n=new Blob([e],{type:"text/javascript"}),t=URL.createObjectURL(n),s=new Worker(t);return URL.revokeObjectURL(t),s}function h(){return f('var r=class{constructor(e){this.cachedMessages=[];this.url=e,this.socket=this.createSocket()}createSocket(){let e=new WebSocket(this.url);return e.onopen=()=>this.onopen(),e.onclose=()=>this.onclose(),e}onclose(){this.socket=this.createSocket()}onopen(){console.log("Connection to Coverage Collector established."),this.cachedMessages.forEach(e=>this.socket.send(e)),this.cachedMessages=[]}send(e){this.socket.readyState===WebSocket.OPEN?this.socket.send(e):(this.cachedMessages.push(e),this.cachedMessages.length%500===0&&console.log(`More than ${this.cachedMessages.length} messages are queued to be sent.`))}};var C=20,m=1e3,d=class{constructor(e,t){this.milliseconds=e;this.onCountedToZero=t;this.timerHandle=null}restartCountdown(){this.stopCountdown(),this.timerHandle=self.setTimeout(()=>{this.stopCountdown(),this.onCountedToZero()},this.milliseconds)}stopCountdown(){this.timerHandle!==null&&(self.clearTimeout(this.timerHandle),this.timerHandle=null)}},a=class{constructor(e){this.socket=e,this.cachedCoveredRanges=new Map,this.numberOfCachedPositions=0,this.flushCountdown=new d(m,()=>this.flush())}addRange(e,t){let o=this.cachedCoveredRanges.get(e);o||(o=new Set,this.cachedCoveredRanges.set(e,o)),o.add(t),this.numberOfCachedPositions+=1,this.flushCountdown.restartCountdown(),this.numberOfCachedPositions>=C&&this.flush()}flush(){this.numberOfCachedPositions!==0&&(this.flushCountdown.stopCountdown(),this.cachedCoveredRanges.forEach((e,t)=>{let o=Array.from(e).map(n=>`${n.start.line}:${n.start.column}:${n.end.line}:${n.end.column}`);this.socket.send(`${"c"} ${t} ${o.join(" ")}`),e.clear()}),this.cachedCoveredRanges.clear(),this.numberOfCachedPositions=0)}};console.log("Starting coverage forwarding worker.");var u=new r("ws://localhost:46225/socket"),h=new a(u),g=new Map;onmessage=s=>{if(Array.isArray(s.data))p(s.data);else{let e=s.data;if(e.startsWith("s"))u.send(e);else if(e.startsWith("i")){let t=JSON.parse(e.substring(2));g.set(t.hash,t),console.info(`Received coverage mapping information for "${t.hash}".`)}else e==="unload"?h.flush():console.error(`No handler for message: ${e}`)}};function p(s){var n;let e=s[0],t=s[1],o=g.get(e);if(!o){console.log(`No coverage mapping information for ${e} available!`);return}for(let[c,i]of t.branches.entries()){let l=(n=o.branchMap[c])==null?void 0:n.locations[i];l&&h.addRange(e,l)}for(let c of t.statements){let i=o.statementMap[c];i&&h.addRange(e,i)}}\n')}function c(){return g()}function g(){return window}function p(e,n){let t=c()[e];return t||(t=n,c()[e]=t),t}var l;(function(r){r.MESSAGE_TYPE_SOURCEMAP="s",r.MESSAGE_TYPE_COVERAGE="c",r.ISTANBUL_COV_OBJECT="i",r.UNRESOLVED_CODE_ENTITY="u"})(l||(l={}));function v(e,n){let t=new Map;function s(i){let o=t.get(i);return o||(o={branches:new Map,statements:new Set},t.set(i,o),o)}function r(i,o,w){s(i).branches.set(o,w)}function u(i,o){s(i).statements.add(o)}function a(){n(t),t.clear()}return setInterval(()=>a(),e),{putBranchCoverage:r,putStatementCoverage:u,flush:a}}var C=p("__TS_AGENT",{});function d(){return C._$BcWorker}function S(e){return C._$BcWorker=e,e}var m=v(250,e=>{for(let n of e.entries())d().postMessage(n)});c()._$stmtCov=m.putStatementCoverage;c()._$brCov=m.putBranchCoverage;var b=new Set;c()._$registerCoverageObject=function(e){let n=e.hash;if(b.has(n)){console.log(`Coverage interceptor added twice for ${n}. This seems to be a bug in the instrumentation.`);return}else b.add(n);if(!d()){let t=S(new h);(function(){let r=()=>{m.flush(),t.postMessage("unload")},u=function(i,o){!o||o.addEventListener(i,r,{capture:!0})},a=g();u("blur",a),u("unload",a),u("visibilitychange",a),u("beforeunload",a)})()}(function(){d().postMessage(`${l.ISTANBUL_COV_OBJECT} ${JSON.stringify(e)}`);let s=p("sentMaps",new Set);e.inputSourceMap&&(s.has(e.path)||(d().postMessage(`${l.MESSAGE_TYPE_SOURCEMAP} ${n}:${JSON.stringify(e.inputSourceMap)}`),s.add(e.path)))})()};})();
 "use strict";

const _$f168pdi = "1f5dae76684d5f9ae55974d371fc4bc8a5f251aa";

function cov_10zzbet73q() {
  var path = "/teamscale-javascript-profiler/test/casestudies/angular-realworld-example-app/dist/src_app_editor_editor_module_ts.js";
  var hash = "1f5dae76684d5f9ae55974d371fc4bc8a5f251aa";
  var global = typeof window === 'object' ? window : this;
  var gcv = "__coverage__";
  var coverageData = {
    path: "/teamscale-javascript-profiler/test/casestudies/angular-realworld-example-app/dist/src_app_editor_editor_module_ts.js",
    statementMap: {
      "0": {
        start: {
          line: 2,
          column: 0
        },
        end: {
          line: 300,
          column: 4
        }
      },
      "1": {
        start: {
          line: 10,
          column: 0
        },
        end: {
          line: 10,
          column: 43
        }
      },
      "2": {
        start: {
          line: 11,
          column: 21
        },
        end: {
          line: 13,
          column: 24
        }
      },
      "3": {
        start: {
          line: 12,
          column: 71
        },
        end: {
          line: 12,
          column: 94
        }
      },
      "4": {
        start: {
          line: 14,
          column: 71
        },
        end: {
          line: 14,
          column: 118
        }
      },
      "5": {
        start: {
          line: 15,
          column: 71
        },
        end: {
          line: 15,
          column: 118
        }
      },
      "6": {
        start: {
          line: 16,
          column: 70
        },
        end: {
          line: 16,
          column: 116
        }
      },
      "7": {
        start: {
          line: 17,
          column: 62
        },
        end: {
          line: 17,
          column: 102
        }
      },
      "8": {
        start: {
          line: 18,
          column: 72
        },
        end: {
          line: 18,
          column: 119
        }
      },
      "9": {
        start: {
          line: 25,
          column: 4
        },
        end: {
          line: 25,
          column: 43
        }
      },
      "10": {
        start: {
          line: 26,
          column: 4
        },
        end: {
          line: 26,
          column: 25
        }
      },
      "11": {
        start: {
          line: 27,
          column: 4
        },
        end: {
          line: 27,
          column: 35
        }
      },
      "12": {
        start: {
          line: 30,
          column: 4
        },
        end: {
          line: 36,
          column: 107
        }
      },
      "13": {
        start: {
          line: 31,
          column: 6
        },
        end: {
          line: 35,
          column: 7
        }
      },
      "14": {
        start: {
          line: 32,
          column: 8
        },
        end: {
          line: 32,
          column: 23
        }
      },
      "15": {
        start: {
          line: 34,
          column: 8
        },
        end: {
          line: 34,
          column: 39
        }
      },
      "16": {
        start: {
          line: 36,
          column: 74
        },
        end: {
          line: 36,
          column: 104
        }
      },
      "17": {
        start: {
          line: 39,
          column: 0
        },
        end: {
          line: 41,
          column: 2
        }
      },
      "18": {
        start: {
          line: 40,
          column: 2
        },
        end: {
          line: 40,
          column: 365
        }
      },
      "19": {
        start: {
          line: 42,
          column: 0
        },
        end: {
          line: 45,
          column: 3
        }
      },
      "20": {
        start: {
          line: 55,
          column: 0
        },
        end: {
          line: 55,
          column: 43
        }
      },
      "21": {
        start: {
          line: 56,
          column: 21
        },
        end: {
          line: 58,
          column: 24
        }
      },
      "22": {
        start: {
          line: 57,
          column: 67
        },
        end: {
          line: 57,
          column: 86
        }
      },
      "23": {
        start: {
          line: 59,
          column: 72
        },
        end: {
          line: 59,
          column: 119
        }
      },
      "24": {
        start: {
          line: 60,
          column: 74
        },
        end: {
          line: 60,
          column: 125
        }
      },
      "25": {
        start: {
          line: 61,
          column: 91
        },
        end: {
          line: 61,
          column: 159
        }
      },
      "26": {
        start: {
          line: 62,
          column: 62
        },
        end: {
          line: 62,
          column: 102
        }
      },
      "27": {
        start: {
          line: 63,
          column: 70
        },
        end: {
          line: 63,
          column: 116
        }
      },
      "28": {
        start: {
          line: 70,
          column: 15
        },
        end: {
          line: 81,
          column: 2
        }
      },
      "29": {
        start: {
          line: 83,
          column: 0
        },
        end: {
          line: 85,
          column: 2
        }
      },
      "30": {
        start: {
          line: 84,
          column: 2
        },
        end: {
          line: 84,
          column: 42
        }
      },
      "31": {
        start: {
          line: 86,
          column: 0
        },
        end: {
          line: 88,
          column: 3
        }
      },
      "32": {
        start: {
          line: 89,
          column: 0
        },
        end: {
          line: 91,
          column: 3
        }
      },
      "33": {
        start: {
          line: 92,
          column: 0
        },
        end: {
          line: 97,
          column: 5
        }
      },
      "34": {
        start: {
          line: 93,
          column: 2
        },
        end: {
          line: 96,
          column: 5
        }
      },
      "35": {
        start: {
          line: 107,
          column: 0
        },
        end: {
          line: 107,
          column: 43
        }
      },
      "36": {
        start: {
          line: 108,
          column: 21
        },
        end: {
          line: 110,
          column: 24
        }
      },
      "37": {
        start: {
          line: 109,
          column: 63
        },
        end: {
          line: 109,
          column: 78
        }
      },
      "38": {
        start: {
          line: 111,
          column: 71
        },
        end: {
          line: 111,
          column: 118
        }
      },
      "39": {
        start: {
          line: 112,
          column: 70
        },
        end: {
          line: 112,
          column: 116
        }
      },
      "40": {
        start: {
          line: 113,
          column: 62
        },
        end: {
          line: 113,
          column: 102
        }
      },
      "41": {
        start: {
          line: 114,
          column: 72
        },
        end: {
          line: 114,
          column: 119
        }
      },
      "42": {
        start: {
          line: 115,
          column: 72
        },
        end: {
          line: 115,
          column: 120
        }
      },
      "43": {
        start: {
          line: 116,
          column: 86
        },
        end: {
          line: 116,
          column: 150
        }
      },
      "44": {
        start: {
          line: 125,
          column: 2
        },
        end: {
          line: 137,
          column: 3
        }
      },
      "45": {
        start: {
          line: 126,
          column: 16
        },
        end: {
          line: 126,
          column: 80
        }
      },
      "46": {
        start: {
          line: 127,
          column: 4
        },
        end: {
          line: 127,
          column: 92
        }
      },
      "47": {
        start: {
          line: 128,
          column: 4
        },
        end: {
          line: 133,
          column: 7
        }
      },
      "48": {
        start: {
          line: 129,
          column: 26
        },
        end: {
          line: 129,
          column: 90
        }
      },
      "49": {
        start: {
          line: 130,
          column: 21
        },
        end: {
          line: 130,
          column: 42
        }
      },
      "50": {
        start: {
          line: 131,
          column: 21
        },
        end: {
          line: 131,
          column: 82
        }
      },
      "51": {
        start: {
          line: 132,
          column: 6
        },
        end: {
          line: 132,
          column: 97
        }
      },
      "52": {
        start: {
          line: 134,
          column: 4
        },
        end: {
          line: 134,
          column: 65
        }
      },
      "53": {
        start: {
          line: 135,
          column: 4
        },
        end: {
          line: 135,
          column: 60
        }
      },
      "54": {
        start: {
          line: 136,
          column: 4
        },
        end: {
          line: 136,
          column: 65
        }
      },
      "55": {
        start: {
          line: 138,
          column: 2
        },
        end: {
          line: 142,
          column: 3
        }
      },
      "56": {
        start: {
          line: 139,
          column: 19
        },
        end: {
          line: 139,
          column: 32
        }
      },
      "57": {
        start: {
          line: 140,
          column: 4
        },
        end: {
          line: 140,
          column: 63
        }
      },
      "58": {
        start: {
          line: 141,
          column: 4
        },
        end: {
          line: 141,
          column: 87
        }
      },
      "59": {
        start: {
          line: 146,
          column: 4
        },
        end: {
          line: 146,
          column: 43
        }
      },
      "60": {
        start: {
          line: 147,
          column: 4
        },
        end: {
          line: 147,
          column: 23
        }
      },
      "61": {
        start: {
          line: 148,
          column: 4
        },
        end: {
          line: 148,
          column: 25
        }
      },
      "62": {
        start: {
          line: 149,
          column: 4
        },
        end: {
          line: 149,
          column: 17
        }
      },
      "63": {
        start: {
          line: 150,
          column: 4
        },
        end: {
          line: 150,
          column: 22
        }
      },
      "64": {
        start: {
          line: 151,
          column: 4
        },
        end: {
          line: 151,
          column: 89
        }
      },
      "65": {
        start: {
          line: 152,
          column: 4
        },
        end: {
          line: 152,
          column: 21
        }
      },
      "66": {
        start: {
          line: 153,
          column: 4
        },
        end: {
          line: 153,
          column: 30
        }
      },
      "67": {
        start: {
          line: 155,
          column: 4
        },
        end: {
          line: 159,
          column: 7
        }
      },
      "68": {
        start: {
          line: 161,
          column: 4
        },
        end: {
          line: 161,
          column: 30
        }
      },
      "69": {
        start: {
          line: 168,
          column: 4
        },
        end: {
          line: 173,
          column: 7
        }
      },
      "70": {
        start: {
          line: 169,
          column: 6
        },
        end: {
          line: 172,
          column: 7
        }
      },
      "71": {
        start: {
          line: 170,
          column: 8
        },
        end: {
          line: 170,
          column: 36
        }
      },
      "72": {
        start: {
          line: 171,
          column: 8
        },
        end: {
          line: 171,
          column: 50
        }
      },
      "73": {
        start: {
          line: 177,
          column: 16
        },
        end: {
          line: 177,
          column: 35
        }
      },
      "74": {
        start: {
          line: 179,
          column: 4
        },
        end: {
          line: 181,
          column: 5
        }
      },
      "75": {
        start: {
          line: 180,
          column: 6
        },
        end: {
          line: 180,
          column: 37
        }
      },
      "76": {
        start: {
          line: 183,
          column: 4
        },
        end: {
          line: 183,
          column: 28
        }
      },
      "77": {
        start: {
          line: 186,
          column: 4
        },
        end: {
          line: 186,
          column: 79
        }
      },
      "78": {
        start: {
          line: 186,
          column: 62
        },
        end: {
          line: 186,
          column: 77
        }
      },
      "79": {
        start: {
          line: 189,
          column: 4
        },
        end: {
          line: 189,
          column: 29
        }
      },
      "80": {
        start: {
          line: 191,
          column: 4
        },
        end: {
          line: 191,
          column: 47
        }
      },
      "81": {
        start: {
          line: 193,
          column: 4
        },
        end: {
          line: 193,
          column: 18
        }
      },
      "82": {
        start: {
          line: 195,
          column: 4
        },
        end: {
          line: 198,
          column: 7
        }
      },
      "83": {
        start: {
          line: 195,
          column: 65
        },
        end: {
          line: 195,
          column: 118
        }
      },
      "84": {
        start: {
          line: 196,
          column: 6
        },
        end: {
          line: 196,
          column: 24
        }
      },
      "85": {
        start: {
          line: 197,
          column: 6
        },
        end: {
          line: 197,
          column: 32
        }
      },
      "86": {
        start: {
          line: 201,
          column: 4
        },
        end: {
          line: 201,
          column: 40
        }
      },
      "87": {
        start: {
          line: 204,
          column: 0
        },
        end: {
          line: 206,
          column: 2
        }
      },
      "88": {
        start: {
          line: 205,
          column: 2
        },
        end: {
          line: 205,
          column: 526
        }
      },
      "89": {
        start: {
          line: 207,
          column: 0
        },
        end: {
          line: 256,
          column: 3
        }
      },
      "90": {
        start: {
          line: 214,
          column: 4
        },
        end: {
          line: 240,
          column: 5
        }
      },
      "91": {
        start: {
          line: 215,
          column: 6
        },
        end: {
          line: 215,
          column: 119
        }
      },
      "92": {
        start: {
          line: 216,
          column: 6
        },
        end: {
          line: 216,
          column: 87
        }
      },
      "93": {
        start: {
          line: 217,
          column: 6
        },
        end: {
          line: 217,
          column: 117
        }
      },
      "94": {
        start: {
          line: 218,
          column: 6
        },
        end: {
          line: 218,
          column: 77
        }
      },
      "95": {
        start: {
          line: 219,
          column: 6
        },
        end: {
          line: 219,
          column: 67
        }
      },
      "96": {
        start: {
          line: 220,
          column: 6
        },
        end: {
          line: 220,
          column: 85
        }
      },
      "97": {
        start: {
          line: 221,
          column: 6
        },
        end: {
          line: 221,
          column: 78
        }
      },
      "98": {
        start: {
          line: 222,
          column: 6
        },
        end: {
          line: 222,
          column: 67
        }
      },
      "99": {
        start: {
          line: 223,
          column: 6
        },
        end: {
          line: 223,
          column: 106
        }
      },
      "100": {
        start: {
          line: 224,
          column: 6
        },
        end: {
          line: 224,
          column: 81
        }
      },
      "101": {
        start: {
          line: 225,
          column: 6
        },
        end: {
          line: 225,
          column: 69
        }
      },
      "102": {
        start: {
          line: 226,
          column: 6
        },
        end: {
          line: 226,
          column: 103
        }
      },
      "103": {
        start: {
          line: 227,
          column: 6
        },
        end: {
          line: 229,
          column: 9
        }
      },
      "104": {
        start: {
          line: 228,
          column: 8
        },
        end: {
          line: 228,
          column: 28
        }
      },
      "105": {
        start: {
          line: 230,
          column: 6
        },
        end: {
          line: 230,
          column: 67
        }
      },
      "106": {
        start: {
          line: 231,
          column: 6
        },
        end: {
          line: 231,
          column: 82
        }
      },
      "107": {
        start: {
          line: 232,
          column: 6
        },
        end: {
          line: 232,
          column: 119
        }
      },
      "108": {
        start: {
          line: 233,
          column: 6
        },
        end: {
          line: 233,
          column: 69
        }
      },
      "109": {
        start: {
          line: 234,
          column: 6
        },
        end: {
          line: 234,
          column: 85
        }
      },
      "110": {
        start: {
          line: 235,
          column: 6
        },
        end: {
          line: 237,
          column: 9
        }
      },
      "111": {
        start: {
          line: 236,
          column: 8
        },
        end: {
          line: 236,
          column: 32
        }
      },
      "112": {
        start: {
          line: 238,
          column: 6
        },
        end: {
          line: 238,
          column: 84
        }
      },
      "113": {
        start: {
          line: 239,
          column: 6
        },
        end: {
          line: 239,
          column: 79
        }
      },
      "114": {
        start: {
          line: 241,
          column: 4
        },
        end: {
          line: 252,
          column: 5
        }
      },
      "115": {
        start: {
          line: 242,
          column: 6
        },
        end: {
          line: 242,
          column: 65
        }
      },
      "116": {
        start: {
          line: 243,
          column: 6
        },
        end: {
          line: 243,
          column: 85
        }
      },
      "117": {
        start: {
          line: 244,
          column: 6
        },
        end: {
          line: 244,
          column: 65
        }
      },
      "118": {
        start: {
          line: 245,
          column: 6
        },
        end: {
          line: 245,
          column: 93
        }
      },
      "119": {
        start: {
          line: 246,
          column: 6
        },
        end: {
          line: 246,
          column: 65
        }
      },
      "120": {
        start: {
          line: 247,
          column: 6
        },
        end: {
          line: 247,
          column: 93
        }
      },
      "121": {
        start: {
          line: 248,
          column: 6
        },
        end: {
          line: 248,
          column: 65
        }
      },
      "122": {
        start: {
          line: 249,
          column: 6
        },
        end: {
          line: 249,
          column: 92
        }
      },
      "123": {
        start: {
          line: 250,
          column: 6
        },
        end: {
          line: 250,
          column: 65
        }
      },
      "124": {
        start: {
          line: 251,
          column: 6
        },
        end: {
          line: 251,
          column: 95
        }
      },
      "125": {
        start: {
          line: 266,
          column: 0
        },
        end: {
          line: 266,
          column: 43
        }
      },
      "126": {
        start: {
          line: 267,
          column: 21
        },
        end: {
          line: 269,
          column: 24
        }
      },
      "127": {
        start: {
          line: 268,
          column: 60
        },
        end: {
          line: 268,
          column: 72
        }
      },
      "128": {
        start: {
          line: 270,
          column: 74
        },
        end: {
          line: 270,
          column: 125
        }
      },
      "129": {
        start: {
          line: 271,
          column: 91
        },
        end: {
          line: 271,
          column: 159
        }
      },
      "130": {
        start: {
          line: 272,
          column: 64
        },
        end: {
          line: 272,
          column: 106
        }
      },
      "131": {
        start: {
          line: 273,
          column: 79
        },
        end: {
          line: 273,
          column: 135
        }
      },
      "132": {
        start: {
          line: 274,
          column: 70
        },
        end: {
          line: 274,
          column: 116
        }
      },
      "133": {
        start: {
          line: 281,
          column: 0
        },
        end: {
          line: 283,
          column: 2
        }
      },
      "134": {
        start: {
          line: 282,
          column: 2
        },
        end: {
          line: 282,
          column: 35
        }
      },
      "135": {
        start: {
          line: 284,
          column: 0
        },
        end: {
          line: 286,
          column: 3
        }
      },
      "136": {
        start: {
          line: 287,
          column: 0
        },
        end: {
          line: 290,
          column: 3
        }
      },
      "137": {
        start: {
          line: 291,
          column: 0
        },
        end: {
          line: 296,
          column: 5
        }
      },
      "138": {
        start: {
          line: 292,
          column: 2
        },
        end: {
          line: 295,
          column: 5
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 8,
            column: 7
          },
          end: {
            line: 8,
            column: 8
          }
        },
        loc: {
          start: {
            line: 8,
            column: 78
          },
          end: {
            line: 47,
            column: 7
          }
        },
        line: 8
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 12,
            column: 50
          },
          end: {
            line: 12,
            column: 51
          }
        },
        loc: {
          start: {
            line: 12,
            column: 71
          },
          end: {
            line: 12,
            column: 94
          }
        },
        line: 12
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 24,
            column: 2
          },
          end: {
            line: 24,
            column: 3
          }
        },
        loc: {
          start: {
            line: 24,
            column: 52
          },
          end: {
            line: 28,
            column: 3
          }
        },
        line: 24
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 29,
            column: 2
          },
          end: {
            line: 29,
            column: 3
          }
        },
        loc: {
          start: {
            line: 29,
            column: 24
          },
          end: {
            line: 37,
            column: 3
          }
        },
        line: 29
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 30,
            column: 115
          },
          end: {
            line: 30,
            column: 116
          }
        },
        loc: {
          start: {
            line: 30,
            column: 126
          },
          end: {
            line: 36,
            column: 5
          }
        },
        line: 30
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 36,
            column: 67
          },
          end: {
            line: 36,
            column: 68
          }
        },
        loc: {
          start: {
            line: 36,
            column: 74
          },
          end: {
            line: 36,
            column: 104
          }
        },
        line: 36
      },
      "6": {
        name: "EditableArticleResolver_Factory",
        decl: {
          start: {
            line: 39,
            column: 40
          },
          end: {
            line: 39,
            column: 71
          }
        },
        loc: {
          start: {
            line: 39,
            column: 75
          },
          end: {
            line: 41,
            column: 1
          }
        },
        line: 39
      },
      "7": {
        name: "(anonymous_7)",
        decl: {
          start: {
            line: 53,
            column: 7
          },
          end: {
            line: 53,
            column: 8
          }
        },
        loc: {
          start: {
            line: 53,
            column: 78
          },
          end: {
            line: 99,
            column: 7
          }
        },
        line: 53
      },
      "8": {
        name: "(anonymous_8)",
        decl: {
          start: {
            line: 57,
            column: 46
          },
          end: {
            line: 57,
            column: 47
          }
        },
        loc: {
          start: {
            line: 57,
            column: 67
          },
          end: {
            line: 57,
            column: 86
          }
        },
        line: 57
      },
      "9": {
        name: "EditorRoutingModule_Factory",
        decl: {
          start: {
            line: 83,
            column: 36
          },
          end: {
            line: 83,
            column: 63
          }
        },
        loc: {
          start: {
            line: 83,
            column: 67
          },
          end: {
            line: 85,
            column: 1
          }
        },
        line: 83
      },
      "10": {
        name: "(anonymous_10)",
        decl: {
          start: {
            line: 92,
            column: 1
          },
          end: {
            line: 92,
            column: 2
          }
        },
        loc: {
          start: {
            line: 92,
            column: 13
          },
          end: {
            line: 97,
            column: 1
          }
        },
        line: 92
      },
      "11": {
        name: "(anonymous_11)",
        decl: {
          start: {
            line: 105,
            column: 7
          },
          end: {
            line: 105,
            column: 8
          }
        },
        loc: {
          start: {
            line: 105,
            column: 78
          },
          end: {
            line: 258,
            column: 7
          }
        },
        line: 105
      },
      "12": {
        name: "(anonymous_12)",
        decl: {
          start: {
            line: 109,
            column: 42
          },
          end: {
            line: 109,
            column: 43
          }
        },
        loc: {
          start: {
            line: 109,
            column: 63
          },
          end: {
            line: 109,
            column: 78
          }
        },
        line: 109
      },
      "13": {
        name: "EditorComponent_span_17_Template",
        decl: {
          start: {
            line: 124,
            column: 9
          },
          end: {
            line: 124,
            column: 41
          }
        },
        loc: {
          start: {
            line: 124,
            column: 51
          },
          end: {
            line: 143,
            column: 1
          }
        },
        line: 124
      },
      "14": {
        name: "EditorComponent_span_17_Template_i_click_1_listener",
        decl: {
          start: {
            line: 128,
            column: 79
          },
          end: {
            line: 128,
            column: 130
          }
        },
        loc: {
          start: {
            line: 128,
            column: 133
          },
          end: {
            line: 133,
            column: 5
          }
        },
        line: 128
      },
      "15": {
        name: "(anonymous_15)",
        decl: {
          start: {
            line: 145,
            column: 2
          },
          end: {
            line: 145,
            column: 3
          }
        },
        loc: {
          start: {
            line: 145,
            column: 50
          },
          end: {
            line: 164,
            column: 3
          }
        },
        line: 145
      },
      "16": {
        name: "(anonymous_16)",
        decl: {
          start: {
            line: 166,
            column: 2
          },
          end: {
            line: 166,
            column: 3
          }
        },
        loc: {
          start: {
            line: 166,
            column: 13
          },
          end: {
            line: 174,
            column: 3
          }
        },
        line: 166
      },
      "17": {
        name: "(anonymous_17)",
        decl: {
          start: {
            line: 168,
            column: 30
          },
          end: {
            line: 168,
            column: 31
          }
        },
        loc: {
          start: {
            line: 168,
            column: 38
          },
          end: {
            line: 173,
            column: 5
          }
        },
        line: 168
      },
      "18": {
        name: "(anonymous_18)",
        decl: {
          start: {
            line: 175,
            column: 2
          },
          end: {
            line: 175,
            column: 3
          }
        },
        loc: {
          start: {
            line: 175,
            column: 11
          },
          end: {
            line: 184,
            column: 3
          }
        },
        line: 175
      },
      "19": {
        name: "(anonymous_19)",
        decl: {
          start: {
            line: 185,
            column: 2
          },
          end: {
            line: 185,
            column: 3
          }
        },
        loc: {
          start: {
            line: 185,
            column: 21
          },
          end: {
            line: 187,
            column: 3
          }
        },
        line: 185
      },
      "20": {
        name: "(anonymous_20)",
        decl: {
          start: {
            line: 186,
            column: 55
          },
          end: {
            line: 186,
            column: 56
          }
        },
        loc: {
          start: {
            line: 186,
            column: 62
          },
          end: {
            line: 186,
            column: 77
          }
        },
        line: 186
      },
      "21": {
        name: "(anonymous_21)",
        decl: {
          start: {
            line: 188,
            column: 2
          },
          end: {
            line: 188,
            column: 3
          }
        },
        loc: {
          start: {
            line: 188,
            column: 15
          },
          end: {
            line: 199,
            column: 3
          }
        },
        line: 188
      },
      "22": {
        name: "(anonymous_22)",
        decl: {
          start: {
            line: 195,
            column: 54
          },
          end: {
            line: 195,
            column: 55
          }
        },
        loc: {
          start: {
            line: 195,
            column: 65
          },
          end: {
            line: 195,
            column: 118
          }
        },
        line: 195
      },
      "23": {
        name: "(anonymous_23)",
        decl: {
          start: {
            line: 195,
            column: 120
          },
          end: {
            line: 195,
            column: 121
          }
        },
        loc: {
          start: {
            line: 195,
            column: 127
          },
          end: {
            line: 198,
            column: 5
          }
        },
        line: 195
      },
      "24": {
        name: "(anonymous_24)",
        decl: {
          start: {
            line: 200,
            column: 2
          },
          end: {
            line: 200,
            column: 3
          }
        },
        loc: {
          start: {
            line: 200,
            column: 24
          },
          end: {
            line: 202,
            column: 3
          }
        },
        line: 200
      },
      "25": {
        name: "EditorComponent_Factory",
        decl: {
          start: {
            line: 204,
            column: 32
          },
          end: {
            line: 204,
            column: 55
          }
        },
        loc: {
          start: {
            line: 204,
            column: 59
          },
          end: {
            line: 206,
            column: 1
          }
        },
        line: 204
      },
      "26": {
        name: "EditorComponent_Template",
        decl: {
          start: {
            line: 213,
            column: 21
          },
          end: {
            line: 213,
            column: 45
          }
        },
        loc: {
          start: {
            line: 213,
            column: 55
          },
          end: {
            line: 253,
            column: 3
          }
        },
        line: 213
      },
      "27": {
        name: "EditorComponent_Template_input_keyup_enter_15_listener",
        decl: {
          start: {
            line: 227,
            column: 87
          },
          end: {
            line: 227,
            column: 141
          }
        },
        loc: {
          start: {
            line: 227,
            column: 144
          },
          end: {
            line: 229,
            column: 7
          }
        },
        line: 227
      },
      "28": {
        name: "EditorComponent_Template_button_click_18_listener",
        decl: {
          start: {
            line: 235,
            column: 81
          },
          end: {
            line: 235,
            column: 130
          }
        },
        loc: {
          start: {
            line: 235,
            column: 133
          },
          end: {
            line: 237,
            column: 7
          }
        },
        line: 235
      },
      "29": {
        name: "(anonymous_29)",
        decl: {
          start: {
            line: 264,
            column: 7
          },
          end: {
            line: 264,
            column: 8
          }
        },
        loc: {
          start: {
            line: 264,
            column: 78
          },
          end: {
            line: 298,
            column: 7
          }
        },
        line: 264
      },
      "30": {
        name: "(anonymous_30)",
        decl: {
          start: {
            line: 268,
            column: 39
          },
          end: {
            line: 268,
            column: 40
          }
        },
        loc: {
          start: {
            line: 268,
            column: 60
          },
          end: {
            line: 268,
            column: 72
          }
        },
        line: 268
      },
      "31": {
        name: "EditorModule_Factory",
        decl: {
          start: {
            line: 281,
            column: 29
          },
          end: {
            line: 281,
            column: 49
          }
        },
        loc: {
          start: {
            line: 281,
            column: 53
          },
          end: {
            line: 283,
            column: 1
          }
        },
        line: 281
      },
      "32": {
        name: "(anonymous_32)",
        decl: {
          start: {
            line: 291,
            column: 1
          },
          end: {
            line: 291,
            column: 2
          }
        },
        loc: {
          start: {
            line: 291,
            column: 13
          },
          end: {
            line: 296,
            column: 1
          }
        },
        line: 291
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 2,
            column: 36
          },
          end: {
            line: 2,
            column: 74
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 2,
            column: 36
          },
          end: {
            line: 2,
            column: 68
          }
        }, {
          start: {
            line: 2,
            column: 72
          },
          end: {
            line: 2,
            column: 74
          }
        }],
        line: 2
      },
      "1": {
        loc: {
          start: {
            line: 31,
            column: 6
          },
          end: {
            line: 35,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 31,
            column: 6
          },
          end: {
            line: 35,
            column: 7
          }
        }, {
          start: {
            line: 33,
            column: 13
          },
          end: {
            line: 35,
            column: 7
          }
        }],
        line: 31
      },
      "2": {
        loc: {
          start: {
            line: 40,
            column: 14
          },
          end: {
            line: 40,
            column: 42
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 40,
            column: 14
          },
          end: {
            line: 40,
            column: 15
          }
        }, {
          start: {
            line: 40,
            column: 19
          },
          end: {
            line: 40,
            column: 42
          }
        }],
        line: 40
      },
      "3": {
        loc: {
          start: {
            line: 84,
            column: 14
          },
          end: {
            line: 84,
            column: 38
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 84,
            column: 14
          },
          end: {
            line: 84,
            column: 15
          }
        }, {
          start: {
            line: 84,
            column: 19
          },
          end: {
            line: 84,
            column: 38
          }
        }],
        line: 84
      },
      "4": {
        loc: {
          start: {
            line: 93,
            column: 2
          },
          end: {
            line: 96,
            column: 4
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 93,
            column: 3
          },
          end: {
            line: 93,
            column: 35
          }
        }, {
          start: {
            line: 93,
            column: 39
          },
          end: {
            line: 93,
            column: 48
          }
        }, {
          start: {
            line: 93,
            column: 53
          },
          end: {
            line: 96,
            column: 4
          }
        }],
        line: 93
      },
      "5": {
        loc: {
          start: {
            line: 125,
            column: 2
          },
          end: {
            line: 137,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 125,
            column: 2
          },
          end: {
            line: 137,
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
        line: 125
      },
      "6": {
        loc: {
          start: {
            line: 138,
            column: 2
          },
          end: {
            line: 142,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 138,
            column: 2
          },
          end: {
            line: 142,
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
        line: 138
      },
      "7": {
        loc: {
          start: {
            line: 169,
            column: 6
          },
          end: {
            line: 172,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 169,
            column: 6
          },
          end: {
            line: 172,
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
        line: 169
      },
      "8": {
        loc: {
          start: {
            line: 179,
            column: 4
          },
          end: {
            line: 181,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 179,
            column: 4
          },
          end: {
            line: 181,
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
        line: 179
      },
      "9": {
        loc: {
          start: {
            line: 205,
            column: 14
          },
          end: {
            line: 205,
            column: 34
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 205,
            column: 14
          },
          end: {
            line: 205,
            column: 15
          }
        }, {
          start: {
            line: 205,
            column: 19
          },
          end: {
            line: 205,
            column: 34
          }
        }],
        line: 205
      },
      "10": {
        loc: {
          start: {
            line: 214,
            column: 4
          },
          end: {
            line: 240,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 214,
            column: 4
          },
          end: {
            line: 240,
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
        line: 214
      },
      "11": {
        loc: {
          start: {
            line: 241,
            column: 4
          },
          end: {
            line: 252,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 241,
            column: 4
          },
          end: {
            line: 252,
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
        line: 241
      },
      "12": {
        loc: {
          start: {
            line: 282,
            column: 14
          },
          end: {
            line: 282,
            column: 31
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 282,
            column: 14
          },
          end: {
            line: 282,
            column: 15
          }
        }, {
          start: {
            line: 282,
            column: 19
          },
          end: {
            line: 282,
            column: 31
          }
        }],
        line: 282
      },
      "13": {
        loc: {
          start: {
            line: 292,
            column: 2
          },
          end: {
            line: 295,
            column: 4
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 292,
            column: 3
          },
          end: {
            line: 292,
            column: 35
          }
        }, {
          start: {
            line: 292,
            column: 39
          },
          end: {
            line: 292,
            column: 48
          }
        }, {
          start: {
            line: 292,
            column: 53
          },
          end: {
            line: 295,
            column: 4
          }
        }],
        line: 292
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
      "71": 0,
      "72": 0,
      "73": 0,
      "74": 0,
      "75": 0,
      "76": 0,
      "77": 0,
      "78": 0,
      "79": 0,
      "80": 0,
      "81": 0,
      "82": 0,
      "83": 0,
      "84": 0,
      "85": 0,
      "86": 0,
      "87": 0,
      "88": 0,
      "89": 0,
      "90": 0,
      "91": 0,
      "92": 0,
      "93": 0,
      "94": 0,
      "95": 0,
      "96": 0,
      "97": 0,
      "98": 0,
      "99": 0,
      "100": 0,
      "101": 0,
      "102": 0,
      "103": 0,
      "104": 0,
      "105": 0,
      "106": 0,
      "107": 0,
      "108": 0,
      "109": 0,
      "110": 0,
      "111": 0,
      "112": 0,
      "113": 0,
      "114": 0,
      "115": 0,
      "116": 0,
      "117": 0,
      "118": 0,
      "119": 0,
      "120": 0,
      "121": 0,
      "122": 0,
      "123": 0,
      "124": 0,
      "125": 0,
      "126": 0,
      "127": 0,
      "128": 0,
      "129": 0,
      "130": 0,
      "131": 0,
      "132": 0,
      "133": 0,
      "134": 0,
      "135": 0,
      "136": 0,
      "137": 0,
      "138": 0
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
      "32": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0],
      "2": [0, 0],
      "3": [0, 0],
      "4": [0, 0, 0],
      "5": [0, 0],
      "6": [0, 0],
      "7": [0, 0],
      "8": [0, 0],
      "9": [0, 0],
      "10": [0, 0],
      "11": [0, 0],
      "12": [0, 0],
      "13": [0, 0, 0]
    },
    inputSourceMap: {
      version: 3,
      file: "src_app_editor_editor_module_ts.js",
      mappings: "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",
      sources: ["./src/app/editor/editable-article-resolver.service.ts", "./src/app/editor/editor-routing.module.ts", "./src/app/editor/editor.component.ts", "./src/app/editor/editor.component.html", "./src/app/editor/editor.module.ts"],
      sourcesContent: ["import { Injectable } from '@angular/core';\r\nimport { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';\r\nimport { Observable } from 'rxjs';\r\n\r\nimport { Article, ArticlesService, UserService } from '../core';\r\nimport { catchError ,  map } from 'rxjs/operators';\r\n\r\n@Injectable()\r\nexport class EditableArticleResolver implements Resolve<Article> {\r\n  constructor(\r\n    private articlesService: ArticlesService,\r\n    private router: Router,\r\n    private userService: UserService\r\n  ) { }\r\n\r\n  resolve(\r\n    route: ActivatedRouteSnapshot,\r\n    state: RouterStateSnapshot\r\n  ): Observable<any> {\r\n\r\n    return this.articlesService.get(route.params['slug'])\r\n      .pipe(\r\n        map(\r\n          article => {\r\n            if (this.userService.getCurrentUser().username === article.author.username) {\r\n              return article;\r\n            } else {\r\n              this.router.navigateByUrl('/');\r\n            }\r\n          }\r\n        ),\r\n        catchError(err => this.router.navigateByUrl('/'))\r\n      );\r\n  }\r\n}\r\n", "import { NgModule } from '@angular/core';\r\nimport { Routes, RouterModule } from '@angular/router';\r\nimport { EditorComponent } from './editor.component';\r\nimport { EditableArticleResolver } from './editable-article-resolver.service';\r\nimport { AuthGuard } from '../core';\r\nimport { SharedModule } from '../shared';\r\n\r\nconst routes: Routes = [\r\n  {\r\n    path: '',\r\n    component: EditorComponent,\r\n    canActivate: [AuthGuard]\r\n  },\r\n  {\r\n    path: ':slug',\r\n    component: EditorComponent,\r\n    canActivate: [AuthGuard],\r\n    resolve: {\r\n      article: EditableArticleResolver\r\n    }\r\n  }\r\n];\r\n\r\n@NgModule({\r\n  imports: [RouterModule.forChild(routes)],\r\n  exports: [RouterModule]\r\n})\r\nexport class EditorRoutingModule {}\r\n", "import { Component, OnInit } from '@angular/core';\r\nimport { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl } from '@angular/forms';\r\nimport { ActivatedRoute, Router } from '@angular/router';\r\n\r\nimport { Article, ArticlesService } from '../core';\r\n\r\n@Component({\r\n  selector: 'app-editor-page',\r\n  templateUrl: './editor.component.html'\r\n})\r\nexport class EditorComponent implements OnInit {\r\n  article: Article = {} as Article;\r\n  articleForm: UntypedFormGroup;\r\n  tagField = new UntypedFormControl();\r\n  errors: Object = {};\r\n  isSubmitting = false;\r\n\r\n  constructor(\r\n    private articlesService: ArticlesService,\r\n    private route: ActivatedRoute,\r\n    private router: Router,\r\n    private fb: UntypedFormBuilder\r\n  ) {\r\n    // use the FormBuilder to create a form group\r\n    this.articleForm = this.fb.group({\r\n      title: '',\r\n      description: '',\r\n      body: ''\r\n    });\r\n\r\n    // Initialized tagList as empty array\r\n    this.article.tagList = [];\r\n\r\n    // Optional: subscribe to value changes on the form\r\n    // this.articleForm.valueChanges.subscribe(value => this.updateArticle(value));\r\n  }\r\n\r\n  ngOnInit() {\r\n    // If there's an article prefetched, load it\r\n    this.route.data.subscribe((data: { article: Article }) => {\r\n      if (data.article) {\r\n        this.article = data.article;\r\n        this.articleForm.patchValue(data.article);\r\n      }\r\n    });\r\n  }\r\n\r\n  addTag() {\r\n    // retrieve tag control\r\n    const tag = this.tagField.value;\r\n    // only add tag if it does not exist yet\r\n    if (this.article.tagList.indexOf(tag) < 0) {\r\n      this.article.tagList.push(tag);\r\n    }\r\n    // clear the input\r\n    this.tagField.reset('');\r\n  }\r\n\r\n  removeTag(tagName: string) {\r\n    this.article.tagList = this.article.tagList.filter(tag => tag !== tagName);\r\n  }\r\n\r\n  submitForm() {\r\n    this.isSubmitting = true;\r\n\r\n    // update the model\r\n    this.updateArticle(this.articleForm.value);\r\n\r\n    // update any single tag\r\n    this.addTag();\r\n\r\n    // post the changes\r\n    this.articlesService.save(this.article).subscribe(\r\n      article => this.router.navigateByUrl('/article/' + article.slug),\r\n      err => {\r\n        this.errors = err;\r\n        this.isSubmitting = false;\r\n      }\r\n    );\r\n  }\r\n\r\n  updateArticle(values: Object) {\r\n    Object.assign(this.article, values);\r\n  }\r\n}\r\n", "<div class=\"editor-page\">\r\n  <div class=\"container page\">\r\n    <div class=\"row\">\r\n      <div class=\"col-md-10 offset-md-1 col-xs-12\">\r\n\r\n        <app-list-errors [errors]=\"errors\"></app-list-errors>\r\n\r\n        <form [formGroup]=\"articleForm\">\r\n          <fieldset [disabled]=\"isSubmitting\">\r\n\r\n            <fieldset class=\"form-group\">\r\n              <input class=\"form-control form-control-lg\" formControlName=\"title\" type=\"text\" placeholder=\"Article Title\" />\r\n            </fieldset>\r\n\r\n            <fieldset class=\"form-group\">\r\n              <input class=\"form-control\" formControlName=\"description\" type=\"text\" placeholder=\"What's this article about?\" />\r\n            </fieldset>\r\n\r\n            <fieldset class=\"form-group\">\r\n              <textarea class=\"form-control\" formControlName=\"body\" rows=\"8\" placeholder=\"Write your article (in markdown)\">\r\n              </textarea>\r\n            </fieldset>\r\n\r\n            <fieldset class=\"form-group\">\r\n              <input class=\"form-control\" type=\"text\" placeholder=\"Enter tags\" [formControl]=\"tagField\" (keyup.enter)=\"addTag()\" />\r\n              <div class=\"tag-list\">\r\n                <span *ngFor=\"let tag of article.tagList\" class=\"tag-default tag-pill\">\r\n                  <i class=\"ion-close-round\" (click)=\"removeTag(tag)\"></i>\r\n                  {{ tag }}\r\n                </span>\r\n              </div>\r\n            </fieldset>\r\n\r\n            <button class=\"btn btn-lg pull-xs-right btn-primary\" type=\"button\" (click)=\"submitForm()\">\r\n              Publish Article\r\n            </button>\r\n\r\n          </fieldset>\r\n        </form>\r\n\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>", "import { NgModule } from '@angular/core';\r\n\r\nimport { EditorComponent } from './editor.component';\r\nimport { EditableArticleResolver } from './editable-article-resolver.service';\r\nimport { SharedModule } from '../shared';\r\nimport { EditorRoutingModule } from './editor-routing.module';\r\n\r\n@NgModule({\r\n  imports: [SharedModule, EditorRoutingModule],\r\n  declarations: [EditorComponent],\r\n  providers: [EditableArticleResolver]\r\n})\r\nexport class EditorModule {}\r\n"],
      names: ["catchError", "map", "EditableArticleResolver", "constructor", "articlesService", "router", "userService", "resolve", "route", "state", "get", "params", "pipe", "article", "getCurrentUser", "username", "author", "navigateByUrl", "err", "factory", "RouterModule", "EditorComponent", "AuthGuard", "routes", "path", "component", "canActivate", "EditorRoutingModule", "forChild", "imports", "exports", "UntypedFormControl", "i0", "fb", "articleForm", "group", "title", "description", "body", "tagList", "ngOnInit", "data", "subscribe", "patchValue", "addTag", "tag", "tagField", "value", "indexOf", "push", "reset", "removeTag", "tagName", "filter", "submitForm", "isSubmitting", "updateArticle", "save", "slug", "errors", "values", "Object", "assign", "selectors", "decls", "vars", "consts", "template", "ctx", "SharedModule", "EditorModule", "declarations"],
      sourceRoot: "webpack:///",
      x_google_ignoreList: []
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "1f5dae76684d5f9ae55974d371fc4bc8a5f251aa"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }

  var actualCoverage=_$registerCoverageObject(coverage[path]);
  {
    // @ts-ignore
    cov_10zzbet73q = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}

cov_10zzbet73q();
(self["webpackChunkang2_conduit"] = (self["webpackChunkang2_conduit"]) || ([])).push([["src_app_editor_editor_module_ts"], {
  /***/
  7732:
  /*!*************************************************************!*\
  !*** ./src/app/editor/editable-article-resolver.service.ts ***!
  \*************************************************************/

  /***/
  (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    __webpack_require__.r(__webpack_exports__);
    /* harmony export */


    __webpack_require__.d(__webpack_exports__, {
      /* harmony export */
      "EditableArticleResolver": () => {
        return (
          /* binding */
          EditableArticleResolver
        );
      }
      /* harmony export */

    });
    /* harmony import */


    var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_require__(
    /*! rxjs/operators */
    6942));
    /* harmony import */

    var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_require__(
    /*! rxjs/operators */
    7418));
    /* harmony import */

    var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_require__(
    /*! @angular/core */
    2560));
    /* harmony import */


    var _core__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_require__(
    /*! ../core */
    3825));
    /* harmony import */


    var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = (__webpack_require__(
    /*! @angular/router */
    124));

    class EditableArticleResolver {
      constructor(articlesService, router, userService) {
        _$stmtCov(_$f168pdi, 9);

        this.articlesService = articlesService;

        _$stmtCov(_$f168pdi, 10);

        this.router = router;

        _$stmtCov(_$f168pdi, 11);

        this.userService = userService;
      }

      resolve(route, state) {
        _$stmtCov(_$f168pdi, 12);

        return this.articlesService.get(route.params['slug']).pipe((0, rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.map)(article => {
          _$stmtCov(_$f168pdi, 13);

          if (this.userService.getCurrentUser().username === article.author.username) {
            _$brCov(_$f168pdi, 1, 0);

            _$stmtCov(_$f168pdi, 14);

            return article;
          } else {
            _$brCov(_$f168pdi, 1, 1);

            _$stmtCov(_$f168pdi, 15);

            this.router.navigateByUrl('/');
          }
        }), (0, rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.catchError)(err => {
          _$stmtCov(_$f168pdi, 16);

          return this.router.navigateByUrl('/');
        }));
      }

    }

    _$stmtCov(_$f168pdi, 17);

    EditableArticleResolver.ɵfac = function EditableArticleResolver_Factory(t) {
      _$stmtCov(_$f168pdi, 18);

      return new ((_$brCov(_$f168pdi, 2, 0), t) || (_$brCov(_$f168pdi, 2, 1), EditableArticleResolver))(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_core__WEBPACK_IMPORTED_MODULE_0__.ArticlesService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_core__WEBPACK_IMPORTED_MODULE_0__.UserService));
    };

    _$stmtCov(_$f168pdi, 19);

    EditableArticleResolver.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjectable"]({
      token: EditableArticleResolver,
      factory: EditableArticleResolver.ɵfac
    });
    /***/
  },

  /***/
  8243:
  /*!*************************************************!*\
  !*** ./src/app/editor/editor-routing.module.ts ***!
  \*************************************************/

  /***/
  (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    __webpack_require__.r(__webpack_exports__);
    /* harmony export */


    __webpack_require__.d(__webpack_exports__, {
      /* harmony export */
      "EditorRoutingModule": () => {
        return (
          /* binding */
          EditorRoutingModule
        );
      }
      /* harmony export */

    });
    /* harmony import */


    var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = (__webpack_require__(
    /*! @angular/router */
    124));
    /* harmony import */


    var _editor_component__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_require__(
    /*! ./editor.component */
    1486));
    /* harmony import */


    var _editable_article_resolver_service__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_require__(
    /*! ./editable-article-resolver.service */
    7732));
    /* harmony import */


    var _core__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_require__(
    /*! ../core */
    3825));
    /* harmony import */


    var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_require__(
    /*! @angular/core */
    2560));

    const routes = (_$stmtCov(_$f168pdi, 28), [{
      path: '',
      component: _editor_component__WEBPACK_IMPORTED_MODULE_0__.EditorComponent,
      canActivate: [_core__WEBPACK_IMPORTED_MODULE_2__.AuthGuard]
    }, {
      path: ':slug',
      component: _editor_component__WEBPACK_IMPORTED_MODULE_0__.EditorComponent,
      canActivate: [_core__WEBPACK_IMPORTED_MODULE_2__.AuthGuard],
      resolve: {
        article: _editable_article_resolver_service__WEBPACK_IMPORTED_MODULE_1__.EditableArticleResolver
      }
    }]);

    class EditorRoutingModule {}

    _$stmtCov(_$f168pdi, 29);

    EditorRoutingModule.ɵfac = function EditorRoutingModule_Factory(t) {
      _$stmtCov(_$f168pdi, 30);

      return new ((_$brCov(_$f168pdi, 3, 0), t) || (_$brCov(_$f168pdi, 3, 1), EditorRoutingModule))();
    };

    _$stmtCov(_$f168pdi, 31);

    EditorRoutingModule.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineNgModule"]({
      type: EditorRoutingModule
    });

    _$stmtCov(_$f168pdi, 32);

    EditorRoutingModule.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjector"]({
      imports: [_angular_router__WEBPACK_IMPORTED_MODULE_4__.RouterModule.forChild(routes), _angular_router__WEBPACK_IMPORTED_MODULE_4__.RouterModule]
    });

    _$stmtCov(_$f168pdi, 33);

    (function () {
      _$stmtCov(_$f168pdi, 34);

      ((_$brCov(_$f168pdi, 4, 0), typeof ngJitMode === "undefined") || (_$brCov(_$f168pdi, 4, 1), ngJitMode)) && (_$brCov(_$f168pdi, 4, 2), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsetNgModuleScope"](EditorRoutingModule, {
        imports: [_angular_router__WEBPACK_IMPORTED_MODULE_4__.RouterModule],
        exports: [_angular_router__WEBPACK_IMPORTED_MODULE_4__.RouterModule]
      }));
    })();
    /***/

  },

  /***/
  1486:
  /*!********************************************!*\
  !*** ./src/app/editor/editor.component.ts ***!
  \********************************************/

  /***/
  (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    __webpack_require__.r(__webpack_exports__);
    /* harmony export */


    __webpack_require__.d(__webpack_exports__, {
      /* harmony export */
      "EditorComponent": () => {
        return (
          /* binding */
          EditorComponent
        );
      }
      /* harmony export */

    });
    /* harmony import */


    var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_require__(
    /*! @angular/forms */
    2508));
    /* harmony import */


    var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_require__(
    /*! @angular/core */
    2560));
    /* harmony import */


    var _core__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_require__(
    /*! ../core */
    3825));
    /* harmony import */


    var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = (__webpack_require__(
    /*! @angular/router */
    124));
    /* harmony import */


    var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = (__webpack_require__(
    /*! @angular/common */
    4666));
    /* harmony import */


    var _shared_list_errors_component__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_require__(
    /*! ../shared/list-errors.component */
    6860));

    function EditorComponent_span_17_Template(rf, ctx) {
      if (rf & 1) {
        const _r3 = (_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]());

        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "span", 15)(1, "i", 16);

        _$stmtCov(_$f168pdi, 47);

        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function EditorComponent_span_17_Template_i_click_1_listener() {
          const restoredCtx = (_$stmtCov(_$f168pdi, 48), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r3));
          const tag_r1 = (_$stmtCov(_$f168pdi, 49), restoredCtx.$implicit);
          const ctx_r2 = (_$stmtCov(_$f168pdi, 50), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]());

          _$stmtCov(_$f168pdi, 51);

          return _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵresetView"](ctx_r2.removeTag(tag_r1));
        });

        _$stmtCov(_$f168pdi, 52);

        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();

        _$stmtCov(_$f168pdi, 53);

        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](2);

        _$stmtCov(_$f168pdi, 54);

        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
      } else {
        _$brCov(_$f168pdi, 5, 1);
      }

      _$stmtCov(_$f168pdi, 55);

      if (rf & 2) {
        _$brCov(_$f168pdi, 6, 0);

        const tag_r1 = (_$stmtCov(_$f168pdi, 56), ctx.$implicit);

        _$stmtCov(_$f168pdi, 57);

        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);

        _$stmtCov(_$f168pdi, 58);

        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", tag_r1, " ");
      } else {
        _$brCov(_$f168pdi, 6, 1);
      }
    }

    class EditorComponent {
      constructor(articlesService, route, router, fb) {
        _$stmtCov(_$f168pdi, 59);

        this.articlesService = articlesService;

        _$stmtCov(_$f168pdi, 60);

        this.route = route;

        _$stmtCov(_$f168pdi, 61);

        this.router = router;

        _$stmtCov(_$f168pdi, 62);

        this.fb = fb;

        _$stmtCov(_$f168pdi, 63);

        this.article = {};

        _$stmtCov(_$f168pdi, 64);

        this.tagField = new _angular_forms__WEBPACK_IMPORTED_MODULE_3__.UntypedFormControl();

        _$stmtCov(_$f168pdi, 65);

        this.errors = {};

        _$stmtCov(_$f168pdi, 66);

        this.isSubmitting = false; // use the FormBuilder to create a form group

        _$stmtCov(_$f168pdi, 67);

        this.articleForm = this.fb.group({
          title: '',
          description: '',
          body: ''
        }); // Initialized tagList as empty array

        _$stmtCov(_$f168pdi, 68);

        this.article.tagList = []; // Optional: subscribe to value changes on the form
        // this.articleForm.valueChanges.subscribe(value => this.updateArticle(value));
      }

      ngOnInit() {
        _$stmtCov(_$f168pdi, 69);

        // If there's an article prefetched, load it
        this.route.data.subscribe(data => {
          _$stmtCov(_$f168pdi, 70);

          if (data.article) {
            _$brCov(_$f168pdi, 7, 0);

            _$stmtCov(_$f168pdi, 71);

            this.article = data.article;

            _$stmtCov(_$f168pdi, 72);

            this.articleForm.patchValue(data.article);
          } else {
            _$brCov(_$f168pdi, 7, 1);
          }
        });
      }

      addTag() {
        // retrieve tag control
        const tag = (_$stmtCov(_$f168pdi, 73), this.tagField.value); // only add tag if it does not exist yet

        _$stmtCov(_$f168pdi, 74);

        if (this.article.tagList.indexOf(tag) < 0) {
          _$brCov(_$f168pdi, 8, 0);

          _$stmtCov(_$f168pdi, 75);

          this.article.tagList.push(tag);
        } else {
          _$brCov(_$f168pdi, 8, 1);
        } // clear the input


        _$stmtCov(_$f168pdi, 76);

        this.tagField.reset('');
      }

      removeTag(tagName) {
        _$stmtCov(_$f168pdi, 77);

        this.article.tagList = this.article.tagList.filter(tag => {
          _$stmtCov(_$f168pdi, 78);

          return tag !== tagName;
        });
      }

      submitForm() {
        _$stmtCov(_$f168pdi, 79);

        this.isSubmitting = true; // update the model

        _$stmtCov(_$f168pdi, 80);

        this.updateArticle(this.articleForm.value); // update any single tag

        _$stmtCov(_$f168pdi, 81);

        this.addTag(); // post the changes

        _$stmtCov(_$f168pdi, 82);

        this.articlesService.save(this.article).subscribe(article => {
          _$stmtCov(_$f168pdi, 83);

          return this.router.navigateByUrl('/article/' + article.slug);
        }, err => {
          _$stmtCov(_$f168pdi, 84);

          this.errors = err;

          _$stmtCov(_$f168pdi, 85);

          this.isSubmitting = false;
        });
      }

      updateArticle(values) {
        _$stmtCov(_$f168pdi, 86);

        Object.assign(this.article, values);
      }

    }

    _$stmtCov(_$f168pdi, 87);

    EditorComponent.ɵfac = function EditorComponent_Factory(t) {
      _$stmtCov(_$f168pdi, 88);

      return new ((_$brCov(_$f168pdi, 9, 0), t) || (_$brCov(_$f168pdi, 9, 1), EditorComponent))(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_core__WEBPACK_IMPORTED_MODULE_0__.ArticlesService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_3__.UntypedFormBuilder));
    };

    _$stmtCov(_$f168pdi, 89);

    EditorComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
      type: EditorComponent,
      selectors: [["app-editor-page"]],
      decls: 20,
      vars: 5,
      consts: [[1, "editor-page"], [1, "container", "page"], [1, "row"], [1, "col-md-10", "offset-md-1", "col-xs-12"], [3, "errors"], [3, "formGroup"], [3, "disabled"], [1, "form-group"], ["formControlName", "title", "type", "text", "placeholder", "Article Title", 1, "form-control", "form-control-lg"], ["formControlName", "description", "type", "text", "placeholder", "What's this article about?", 1, "form-control"], ["formControlName", "body", "rows", "8", "placeholder", "Write your article (in markdown)", 1, "form-control"], ["type", "text", "placeholder", "Enter tags", 1, "form-control", 3, "formControl", "keyup.enter"], [1, "tag-list"], ["class", "tag-default tag-pill", 4, "ngFor", "ngForOf"], ["type", "button", 1, "btn", "btn-lg", "pull-xs-right", "btn-primary", 3, "click"], [1, "tag-default", "tag-pill"], [1, "ion-close-round", 3, "click"]],
      template: function EditorComponent_Template(rf, ctx) {
        _$stmtCov(_$f168pdi, 90);

        if (rf & 1) {
          _$brCov(_$f168pdi, 10, 0);

          _$stmtCov(_$f168pdi, 91);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);

          _$stmtCov(_$f168pdi, 92);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](4, "app-list-errors", 4);

          _$stmtCov(_$f168pdi, 93);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "form", 5)(6, "fieldset", 6)(7, "fieldset", 7);

          _$stmtCov(_$f168pdi, 94);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](8, "input", 8);

          _$stmtCov(_$f168pdi, 95);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();

          _$stmtCov(_$f168pdi, 96);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "fieldset", 7);

          _$stmtCov(_$f168pdi, 97);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](10, "input", 9);

          _$stmtCov(_$f168pdi, 98);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();

          _$stmtCov(_$f168pdi, 99);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](11, "fieldset", 7)(12, "textarea", 10);

          _$stmtCov(_$f168pdi, 100);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](13, "              ");

          _$stmtCov(_$f168pdi, 101);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();

          _$stmtCov(_$f168pdi, 102);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](14, "fieldset", 7)(15, "input", 11);

          _$stmtCov(_$f168pdi, 103);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("keyup.enter", function EditorComponent_Template_input_keyup_enter_15_listener() {
            _$stmtCov(_$f168pdi, 104);

            return ctx.addTag();
          });

          _$stmtCov(_$f168pdi, 105);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();

          _$stmtCov(_$f168pdi, 106);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](16, "div", 12);

          _$stmtCov(_$f168pdi, 107);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](17, EditorComponent_span_17_Template, 3, 1, "span", 13);

          _$stmtCov(_$f168pdi, 108);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();

          _$stmtCov(_$f168pdi, 109);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](18, "button", 14);

          _$stmtCov(_$f168pdi, 110);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function EditorComponent_Template_button_click_18_listener() {
            _$stmtCov(_$f168pdi, 111);

            return ctx.submitForm();
          });

          _$stmtCov(_$f168pdi, 112);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](19, " Publish Article ");

          _$stmtCov(_$f168pdi, 113);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()()()()();
        } else {
          _$brCov(_$f168pdi, 10, 1);
        }

        _$stmtCov(_$f168pdi, 114);

        if (rf & 2) {
          _$brCov(_$f168pdi, 11, 0);

          _$stmtCov(_$f168pdi, 115);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](4);

          _$stmtCov(_$f168pdi, 116);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("errors", ctx.errors);

          _$stmtCov(_$f168pdi, 117);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);

          _$stmtCov(_$f168pdi, 118);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("formGroup", ctx.articleForm);

          _$stmtCov(_$f168pdi, 119);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);

          _$stmtCov(_$f168pdi, 120);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("disabled", ctx.isSubmitting);

          _$stmtCov(_$f168pdi, 121);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](9);

          _$stmtCov(_$f168pdi, 122);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("formControl", ctx.tagField);

          _$stmtCov(_$f168pdi, 123);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);

          _$stmtCov(_$f168pdi, 124);

          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx.article.tagList);
        } else {
          _$brCov(_$f168pdi, 11, 1);
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_5__.NgForOf, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_3__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormControlDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormControlName, _shared_list_errors_component__WEBPACK_IMPORTED_MODULE_1__.ListErrorsComponent],
      encapsulation: 2
    });
    /***/
  },

  /***/
  3164:
  /*!*****************************************!*\
  !*** ./src/app/editor/editor.module.ts ***!
  \*****************************************/

  /***/
  (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    __webpack_require__.r(__webpack_exports__);
    /* harmony export */


    __webpack_require__.d(__webpack_exports__, {
      /* harmony export */
      "EditorModule": () => {
        return (
          /* binding */
          EditorModule
        );
      }
      /* harmony export */

    });
    /* harmony import */


    var _editor_component__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_require__(
    /*! ./editor.component */
    1486));
    /* harmony import */


    var _editable_article_resolver_service__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_require__(
    /*! ./editable-article-resolver.service */
    7732));
    /* harmony import */


    var _shared__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_require__(
    /*! ../shared */
    1679));
    /* harmony import */


    var _editor_routing_module__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_require__(
    /*! ./editor-routing.module */
    8243));
    /* harmony import */


    var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = (__webpack_require__(
    /*! @angular/core */
    2560));

    class EditorModule {}

    _$stmtCov(_$f168pdi, 133);

    EditorModule.ɵfac = function EditorModule_Factory(t) {
      _$stmtCov(_$f168pdi, 134);

      return new ((_$brCov(_$f168pdi, 12, 0), t) || (_$brCov(_$f168pdi, 12, 1), EditorModule))();
    };

    _$stmtCov(_$f168pdi, 135);

    EditorModule.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineNgModule"]({
      type: EditorModule
    });

    _$stmtCov(_$f168pdi, 136);

    EditorModule.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjector"]({
      providers: [_editable_article_resolver_service__WEBPACK_IMPORTED_MODULE_1__.EditableArticleResolver],
      imports: [_shared__WEBPACK_IMPORTED_MODULE_2__.SharedModule, _editor_routing_module__WEBPACK_IMPORTED_MODULE_3__.EditorRoutingModule]
    });

    _$stmtCov(_$f168pdi, 137);

    (function () {
      _$stmtCov(_$f168pdi, 138);

      ((_$brCov(_$f168pdi, 13, 0), typeof ngJitMode === "undefined") || (_$brCov(_$f168pdi, 13, 1), ngJitMode)) && (_$brCov(_$f168pdi, 13, 2), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵsetNgModuleScope"](EditorModule, {
        declarations: [_editor_component__WEBPACK_IMPORTED_MODULE_0__.EditorComponent],
        imports: [_shared__WEBPACK_IMPORTED_MODULE_2__.SharedModule, _editor_routing_module__WEBPACK_IMPORTED_MODULE_3__.EditorRoutingModule]
      }));
    })();
    /***/

  }
}]); //# sourceMappingURL=src_app_editor_editor_module_ts.js.map
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LGlOQ2hCViw0bEJBQWZOOztpc0NDRVAsS0FBT3dDLGFBQVksNEJBQVpBLFlBQVksS0FBWkEsQ0FBWSw2SkFBWkEsaUJBQVksQ0FBWkEsdUNBQVksS0FBWkEsQ0FBWSxrRkFBWkEsWUFBWSxFQUFaQSx1Q0FBWSxLQUFaQSxDQUFZLHVGQUZaLENBQUMvRCx1RkFBRCxDQUVZLENBRmFnRSxTQUYxQkMsaURBRTBCRCxDQUZadEMsdUVBRVlzQyxDQUViLEVBQVpELDhTQUFZLGVBSFJ4Qyw4REFHUTJDLEVBSE9GLFNBRHBCQyxpREFDb0JELENBRE50Qyx1RUFDTXNDLENBR1AsSUFKb0IiLCJuYW1lcyI6WyJFZGl0YWJsZUFydGljbGVSZXNvbHZlciIsImNvbnN0cnVjdG9yIiwiYXJ0aWNsZXNTZXJ2aWNlIiwicm91dGVyIiwidXNlclNlcnZpY2UiLCJyZXNvbHZlIiwicm91dGUiLCJzdGF0ZSIsImdldCIsInBhcmFtcyIsInBpcGUiLCJtYXAiLCJhcnRpY2xlIiwiZ2V0Q3VycmVudFVzZXIiLCJ1c2VybmFtZSIsImF1dGhvciIsIm5hdmlnYXRlQnlVcmwiLCJjYXRjaEVycm9yIiwiZXJyIiwiX2FuZ3VsYXJfY29yZV9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fIiwicm91dGVzIiwicGF0aCIsImNvbXBvbmVudCIsIkVkaXRvckNvbXBvbmVudCIsImNhbkFjdGl2YXRlIiwiQXV0aEd1YXJkIiwiRWRpdG9yUm91dGluZ01vZHVsZSIsIlJvdXRlck1vZHVsZSIsImV4cG9ydHMiLCJpMCIsImZiIiwiVW50eXBlZEZvcm1Db250cm9sIiwiYXJ0aWNsZUZvcm0iLCJncm91cCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJib2R5IiwidGFnTGlzdCIsIm5nT25Jbml0IiwiZGF0YSIsInN1YnNjcmliZSIsInBhdGNoVmFsdWUiLCJhZGRUYWciLCJ0YWciLCJ0YWdGaWVsZCIsInZhbHVlIiwiaW5kZXhPZiIsInB1c2giLCJyZXNldCIsInJlbW92ZVRhZyIsInRhZ05hbWUiLCJmaWx0ZXIiLCJzdWJtaXRGb3JtIiwiaXNTdWJtaXR0aW5nIiwidXBkYXRlQXJ0aWNsZSIsInNhdmUiLCJzbHVnIiwiZXJyb3JzIiwidmFsdWVzIiwiT2JqZWN0IiwiYXNzaWduIiwiX2FuZ3VsYXJfY29yZV9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fIiwiY3R4IiwiRWRpdG9yTW9kdWxlIiwiaW1wb3J0cyIsIlNoYXJlZE1vZHVsZSIsImRlY2xhcmF0aW9ucyJdLCJzb3VyY2VSb290Ijoid2VicGFjazovLy8iLCJzb3VyY2VzIjpbIi4vc3JjL2FwcC9lZGl0b3IvZWRpdGFibGUtYXJ0aWNsZS1yZXNvbHZlci5zZXJ2aWNlLnRzIiwiLi9zcmMvYXBwL2VkaXRvci9lZGl0b3Itcm91dGluZy5tb2R1bGUudHMiLCIuL3NyYy9hcHAvZWRpdG9yL2VkaXRvci5jb21wb25lbnQuaHRtbCIsIi4vc3JjL2FwcC9lZGl0b3IvZWRpdG9yLmNvbXBvbmVudC50cyIsIi4vc3JjL2FwcC9lZGl0b3IvZWRpdG9yLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIFJlc29sdmUsIFJvdXRlciwgUm91dGVyU3RhdGVTbmFwc2hvdCB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XHJcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcclxuXHJcbmltcG9ydCB7IEFydGljbGUsIEFydGljbGVzU2VydmljZSwgVXNlclNlcnZpY2UgfSBmcm9tICcuLi9jb3JlJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciAsICBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBFZGl0YWJsZUFydGljbGVSZXNvbHZlciBpbXBsZW1lbnRzIFJlc29sdmU8QXJ0aWNsZT4ge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBhcnRpY2xlc1NlcnZpY2U6IEFydGljbGVzU2VydmljZSxcclxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXHJcbiAgICBwcml2YXRlIHVzZXJTZXJ2aWNlOiBVc2VyU2VydmljZVxyXG4gICkgeyB9XHJcblxyXG4gIHJlc29sdmUoXHJcbiAgICByb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcclxuICAgIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90XHJcbiAgKTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5hcnRpY2xlc1NlcnZpY2UuZ2V0KHJvdXRlLnBhcmFtc1snc2x1ZyddKVxyXG4gICAgICAucGlwZShcclxuICAgICAgICBtYXAoXHJcbiAgICAgICAgICBhcnRpY2xlID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudXNlclNlcnZpY2UuZ2V0Q3VycmVudFVzZXIoKS51c2VybmFtZSA9PT0gYXJ0aWNsZS5hdXRob3IudXNlcm5hbWUpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gYXJ0aWNsZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZUJ5VXJsKCcvJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICApLFxyXG4gICAgICAgIGNhdGNoRXJyb3IoZXJyID0+IHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoJy8nKSlcclxuICAgICAgKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgUm91dGVzLCBSb3V0ZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5pbXBvcnQgeyBFZGl0b3JDb21wb25lbnQgfSBmcm9tICcuL2VkaXRvci5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBFZGl0YWJsZUFydGljbGVSZXNvbHZlciB9IGZyb20gJy4vZWRpdGFibGUtYXJ0aWNsZS1yZXNvbHZlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXV0aEd1YXJkIH0gZnJvbSAnLi4vY29yZSc7XHJcbmltcG9ydCB7IFNoYXJlZE1vZHVsZSB9IGZyb20gJy4uL3NoYXJlZCc7XHJcblxyXG5jb25zdCByb3V0ZXM6IFJvdXRlcyA9IFtcclxuICB7XHJcbiAgICBwYXRoOiAnJyxcclxuICAgIGNvbXBvbmVudDogRWRpdG9yQ29tcG9uZW50LFxyXG4gICAgY2FuQWN0aXZhdGU6IFtBdXRoR3VhcmRdXHJcbiAgfSxcclxuICB7XHJcbiAgICBwYXRoOiAnOnNsdWcnLFxyXG4gICAgY29tcG9uZW50OiBFZGl0b3JDb21wb25lbnQsXHJcbiAgICBjYW5BY3RpdmF0ZTogW0F1dGhHdWFyZF0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFydGljbGU6IEVkaXRhYmxlQXJ0aWNsZVJlc29sdmVyXHJcbiAgICB9XHJcbiAgfVxyXG5dO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBpbXBvcnRzOiBbUm91dGVyTW9kdWxlLmZvckNoaWxkKHJvdXRlcyldLFxyXG4gIGV4cG9ydHM6IFtSb3V0ZXJNb2R1bGVdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBFZGl0b3JSb3V0aW5nTW9kdWxlIHt9XHJcbiIsIjxkaXYgY2xhc3M9XCJlZGl0b3ItcGFnZVwiPlxyXG4gIDxkaXYgY2xhc3M9XCJjb250YWluZXIgcGFnZVwiPlxyXG4gICAgPGRpdiBjbGFzcz1cInJvd1wiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiY29sLW1kLTEwIG9mZnNldC1tZC0xIGNvbC14cy0xMlwiPlxyXG5cclxuICAgICAgICA8YXBwLWxpc3QtZXJyb3JzIFtlcnJvcnNdPVwiZXJyb3JzXCI+PC9hcHAtbGlzdC1lcnJvcnM+XHJcblxyXG4gICAgICAgIDxmb3JtIFtmb3JtR3JvdXBdPVwiYXJ0aWNsZUZvcm1cIj5cclxuICAgICAgICAgIDxmaWVsZHNldCBbZGlzYWJsZWRdPVwiaXNTdWJtaXR0aW5nXCI+XHJcblxyXG4gICAgICAgICAgICA8ZmllbGRzZXQgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sIGZvcm0tY29udHJvbC1sZ1wiIGZvcm1Db250cm9sTmFtZT1cInRpdGxlXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIkFydGljbGUgVGl0bGVcIiAvPlxyXG4gICAgICAgICAgICA8L2ZpZWxkc2V0PlxyXG5cclxuICAgICAgICAgICAgPGZpZWxkc2V0IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxyXG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGZvcm1Db250cm9sTmFtZT1cImRlc2NyaXB0aW9uXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIldoYXQncyB0aGlzIGFydGljbGUgYWJvdXQ/XCIgLz5cclxuICAgICAgICAgICAgPC9maWVsZHNldD5cclxuXHJcbiAgICAgICAgICAgIDxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBmb3JtQ29udHJvbE5hbWU9XCJib2R5XCIgcm93cz1cIjhcIiBwbGFjZWhvbGRlcj1cIldyaXRlIHlvdXIgYXJ0aWNsZSAoaW4gbWFya2Rvd24pXCI+XHJcbiAgICAgICAgICAgICAgPC90ZXh0YXJlYT5cclxuICAgICAgICAgICAgPC9maWVsZHNldD5cclxuXHJcbiAgICAgICAgICAgIDxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiRW50ZXIgdGFnc1wiIFtmb3JtQ29udHJvbF09XCJ0YWdGaWVsZFwiIChrZXl1cC5lbnRlcik9XCJhZGRUYWcoKVwiIC8+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhZy1saXN0XCI+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiAqbmdGb3I9XCJsZXQgdGFnIG9mIGFydGljbGUudGFnTGlzdFwiIGNsYXNzPVwidGFnLWRlZmF1bHQgdGFnLXBpbGxcIj5cclxuICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJpb24tY2xvc2Utcm91bmRcIiAoY2xpY2spPVwicmVtb3ZlVGFnKHRhZylcIj48L2k+XHJcbiAgICAgICAgICAgICAgICAgIHt7IHRhZyB9fVxyXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2ZpZWxkc2V0PlxyXG5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tbGcgcHVsbC14cy1yaWdodCBidG4tcHJpbWFyeVwiIHR5cGU9XCJidXR0b25cIiAoY2xpY2spPVwic3VibWl0Rm9ybSgpXCI+XHJcbiAgICAgICAgICAgICAgUHVibGlzaCBBcnRpY2xlXHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgIDwvZmllbGRzZXQ+XHJcbiAgICAgICAgPC9mb3JtPlxyXG5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICA8L2Rpdj5cclxuPC9kaXY+IiwiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgVW50eXBlZEZvcm1CdWlsZGVyLCBVbnR5cGVkRm9ybUdyb3VwLCBVbnR5cGVkRm9ybUNvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlLCBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5cclxuaW1wb3J0IHsgQXJ0aWNsZSwgQXJ0aWNsZXNTZXJ2aWNlIH0gZnJvbSAnLi4vY29yZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2FwcC1lZGl0b3ItcGFnZScsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL2VkaXRvci5jb21wb25lbnQuaHRtbCdcclxufSlcclxuZXhwb3J0IGNsYXNzIEVkaXRvckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XHJcbiAgYXJ0aWNsZTogQXJ0aWNsZSA9IHt9IGFzIEFydGljbGU7XHJcbiAgYXJ0aWNsZUZvcm06IFVudHlwZWRGb3JtR3JvdXA7XHJcbiAgdGFnRmllbGQgPSBuZXcgVW50eXBlZEZvcm1Db250cm9sKCk7XHJcbiAgZXJyb3JzOiBPYmplY3QgPSB7fTtcclxuICBpc1N1Ym1pdHRpbmcgPSBmYWxzZTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIGFydGljbGVzU2VydmljZTogQXJ0aWNsZXNTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByb3V0ZTogQWN0aXZhdGVkUm91dGUsXHJcbiAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxyXG4gICAgcHJpdmF0ZSBmYjogVW50eXBlZEZvcm1CdWlsZGVyXHJcbiAgKSB7XHJcbiAgICAvLyB1c2UgdGhlIEZvcm1CdWlsZGVyIHRvIGNyZWF0ZSBhIGZvcm0gZ3JvdXBcclxuICAgIHRoaXMuYXJ0aWNsZUZvcm0gPSB0aGlzLmZiLmdyb3VwKHtcclxuICAgICAgdGl0bGU6ICcnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJycsXHJcbiAgICAgIGJvZHk6ICcnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplZCB0YWdMaXN0IGFzIGVtcHR5IGFycmF5XHJcbiAgICB0aGlzLmFydGljbGUudGFnTGlzdCA9IFtdO1xyXG5cclxuICAgIC8vIE9wdGlvbmFsOiBzdWJzY3JpYmUgdG8gdmFsdWUgY2hhbmdlcyBvbiB0aGUgZm9ybVxyXG4gICAgLy8gdGhpcy5hcnRpY2xlRm9ybS52YWx1ZUNoYW5nZXMuc3Vic2NyaWJlKHZhbHVlID0+IHRoaXMudXBkYXRlQXJ0aWNsZSh2YWx1ZSkpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICAvLyBJZiB0aGVyZSdzIGFuIGFydGljbGUgcHJlZmV0Y2hlZCwgbG9hZCBpdFxyXG4gICAgdGhpcy5yb3V0ZS5kYXRhLnN1YnNjcmliZSgoZGF0YTogeyBhcnRpY2xlOiBBcnRpY2xlIH0pID0+IHtcclxuICAgICAgaWYgKGRhdGEuYXJ0aWNsZSkge1xyXG4gICAgICAgIHRoaXMuYXJ0aWNsZSA9IGRhdGEuYXJ0aWNsZTtcclxuICAgICAgICB0aGlzLmFydGljbGVGb3JtLnBhdGNoVmFsdWUoZGF0YS5hcnRpY2xlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhZGRUYWcoKSB7XHJcbiAgICAvLyByZXRyaWV2ZSB0YWcgY29udHJvbFxyXG4gICAgY29uc3QgdGFnID0gdGhpcy50YWdGaWVsZC52YWx1ZTtcclxuICAgIC8vIG9ubHkgYWRkIHRhZyBpZiBpdCBkb2VzIG5vdCBleGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmFydGljbGUudGFnTGlzdC5pbmRleE9mKHRhZykgPCAwKSB7XHJcbiAgICAgIHRoaXMuYXJ0aWNsZS50YWdMaXN0LnB1c2godGFnKTtcclxuICAgIH1cclxuICAgIC8vIGNsZWFyIHRoZSBpbnB1dFxyXG4gICAgdGhpcy50YWdGaWVsZC5yZXNldCgnJyk7XHJcbiAgfVxyXG5cclxuICByZW1vdmVUYWcodGFnTmFtZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLmFydGljbGUudGFnTGlzdCA9IHRoaXMuYXJ0aWNsZS50YWdMaXN0LmZpbHRlcih0YWcgPT4gdGFnICE9PSB0YWdOYW1lKTtcclxuICB9XHJcblxyXG4gIHN1Ym1pdEZvcm0oKSB7XHJcbiAgICB0aGlzLmlzU3VibWl0dGluZyA9IHRydWU7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBtb2RlbFxyXG4gICAgdGhpcy51cGRhdGVBcnRpY2xlKHRoaXMuYXJ0aWNsZUZvcm0udmFsdWUpO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBhbnkgc2luZ2xlIHRhZ1xyXG4gICAgdGhpcy5hZGRUYWcoKTtcclxuXHJcbiAgICAvLyBwb3N0IHRoZSBjaGFuZ2VzXHJcbiAgICB0aGlzLmFydGljbGVzU2VydmljZS5zYXZlKHRoaXMuYXJ0aWNsZSkuc3Vic2NyaWJlKFxyXG4gICAgICBhcnRpY2xlID0+IHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoJy9hcnRpY2xlLycgKyBhcnRpY2xlLnNsdWcpLFxyXG4gICAgICBlcnIgPT4ge1xyXG4gICAgICAgIHRoaXMuZXJyb3JzID0gZXJyO1xyXG4gICAgICAgIHRoaXMuaXNTdWJtaXR0aW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVBcnRpY2xlKHZhbHVlczogT2JqZWN0KSB7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuYXJ0aWNsZSwgdmFsdWVzKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7IEVkaXRvckNvbXBvbmVudCB9IGZyb20gJy4vZWRpdG9yLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IEVkaXRhYmxlQXJ0aWNsZVJlc29sdmVyIH0gZnJvbSAnLi9lZGl0YWJsZS1hcnRpY2xlLXJlc29sdmVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTaGFyZWRNb2R1bGUgfSBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgeyBFZGl0b3JSb3V0aW5nTW9kdWxlIH0gZnJvbSAnLi9lZGl0b3Itcm91dGluZy5tb2R1bGUnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBpbXBvcnRzOiBbU2hhcmVkTW9kdWxlLCBFZGl0b3JSb3V0aW5nTW9kdWxlXSxcclxuICBkZWNsYXJhdGlvbnM6IFtFZGl0b3JDb21wb25lbnRdLFxyXG4gIHByb3ZpZGVyczogW0VkaXRhYmxlQXJ0aWNsZVJlc29sdmVyXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgRWRpdG9yTW9kdWxlIHt9XHJcbiJdfQ== 
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LGlOQ2hCViw0bEJBQWZOOztpc0NDRVAsS0FBT3dDLGFBQVksNEJBQVpBLFlBQVksS0FBWkEsQ0FBWSw2SkFBWkEsaUJBQVksQ0FBWkEsdUNBQVksS0FBWkEsQ0FBWSxrRkFBWkEsWUFBWSxFQUFaQSx1Q0FBWSxLQUFaQSxDQUFZLHVGQUZaLENBQUMvRCx1RkFBRCxDQUVZLENBRmFnRSxTQUYxQkMsaURBRTBCRCxDQUZadEMsdUVBRVlzQyxDQUViLEVBQVpELDhTQUFZLGVBSFJ4Qyw4REFHUTJDLEVBSE9GLFNBRHBCQyxpREFDb0JELENBRE50Qyx1RUFDTXNDLENBR1AsSUFKb0IiLCJuYW1lcyI6WyJFZGl0YWJsZUFydGljbGVSZXNvbHZlciIsImNvbnN0cnVjdG9yIiwiYXJ0aWNsZXNTZXJ2aWNlIiwicm91dGVyIiwidXNlclNlcnZpY2UiLCJyZXNvbHZlIiwicm91dGUiLCJzdGF0ZSIsImdldCIsInBhcmFtcyIsInBpcGUiLCJtYXAiLCJhcnRpY2xlIiwiZ2V0Q3VycmVudFVzZXIiLCJ1c2VybmFtZSIsImF1dGhvciIsIm5hdmlnYXRlQnlVcmwiLCJjYXRjaEVycm9yIiwiZXJyIiwiX2FuZ3VsYXJfY29yZV9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fIiwicm91dGVzIiwicGF0aCIsImNvbXBvbmVudCIsIkVkaXRvckNvbXBvbmVudCIsImNhbkFjdGl2YXRlIiwiQXV0aEd1YXJkIiwiRWRpdG9yUm91dGluZ01vZHVsZSIsIlJvdXRlck1vZHVsZSIsImV4cG9ydHMiLCJpMCIsImZiIiwiVW50eXBlZEZvcm1Db250cm9sIiwiYXJ0aWNsZUZvcm0iLCJncm91cCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJib2R5IiwidGFnTGlzdCIsIm5nT25Jbml0IiwiZGF0YSIsInN1YnNjcmliZSIsInBhdGNoVmFsdWUiLCJhZGRUYWciLCJ0YWciLCJ0YWdGaWVsZCIsInZhbHVlIiwiaW5kZXhPZiIsInB1c2giLCJyZXNldCIsInJlbW92ZVRhZyIsInRhZ05hbWUiLCJmaWx0ZXIiLCJzdWJtaXRGb3JtIiwiaXNTdWJtaXR0aW5nIiwidXBkYXRlQXJ0aWNsZSIsInNhdmUiLCJzbHVnIiwiZXJyb3JzIiwidmFsdWVzIiwiT2JqZWN0IiwiYXNzaWduIiwiX2FuZ3VsYXJfY29yZV9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fIiwiY3R4IiwiRWRpdG9yTW9kdWxlIiwiaW1wb3J0cyIsIlNoYXJlZE1vZHVsZSIsImRlY2xhcmF0aW9ucyJdLCJzb3VyY2VSb290Ijoid2VicGFjazovLy8iLCJzb3VyY2VzIjpbIi4vc3JjL2FwcC9lZGl0b3IvZWRpdGFibGUtYXJ0aWNsZS1yZXNvbHZlci5zZXJ2aWNlLnRzIiwiLi9zcmMvYXBwL2VkaXRvci9lZGl0b3Itcm91dGluZy5tb2R1bGUudHMiLCIuL3NyYy9hcHAvZWRpdG9yL2VkaXRvci5jb21wb25lbnQuaHRtbCIsIi4vc3JjL2FwcC9lZGl0b3IvZWRpdG9yLmNvbXBvbmVudC50cyIsIi4vc3JjL2FwcC9lZGl0b3IvZWRpdG9yLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIFJlc29sdmUsIFJvdXRlciwgUm91dGVyU3RhdGVTbmFwc2hvdCB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XHJcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcclxuXHJcbmltcG9ydCB7IEFydGljbGUsIEFydGljbGVzU2VydmljZSwgVXNlclNlcnZpY2UgfSBmcm9tICcuLi9jb3JlJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciAsICBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBFZGl0YWJsZUFydGljbGVSZXNvbHZlciBpbXBsZW1lbnRzIFJlc29sdmU8QXJ0aWNsZT4ge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBhcnRpY2xlc1NlcnZpY2U6IEFydGljbGVzU2VydmljZSxcclxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXHJcbiAgICBwcml2YXRlIHVzZXJTZXJ2aWNlOiBVc2VyU2VydmljZVxyXG4gICkgeyB9XHJcblxyXG4gIHJlc29sdmUoXHJcbiAgICByb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcclxuICAgIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90XHJcbiAgKTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5hcnRpY2xlc1NlcnZpY2UuZ2V0KHJvdXRlLnBhcmFtc1snc2x1ZyddKVxyXG4gICAgICAucGlwZShcclxuICAgICAgICBtYXAoXHJcbiAgICAgICAgICBhcnRpY2xlID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudXNlclNlcnZpY2UuZ2V0Q3VycmVudFVzZXIoKS51c2VybmFtZSA9PT0gYXJ0aWNsZS5hdXRob3IudXNlcm5hbWUpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gYXJ0aWNsZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZUJ5VXJsKCcvJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICApLFxyXG4gICAgICAgIGNhdGNoRXJyb3IoZXJyID0+IHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoJy8nKSlcclxuICAgICAgKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgUm91dGVzLCBSb3V0ZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5pbXBvcnQgeyBFZGl0b3JDb21wb25lbnQgfSBmcm9tICcuL2VkaXRvci5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBFZGl0YWJsZUFydGljbGVSZXNvbHZlciB9IGZyb20gJy4vZWRpdGFibGUtYXJ0aWNsZS1yZXNvbHZlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXV0aEd1YXJkIH0gZnJvbSAnLi4vY29yZSc7XHJcbmltcG9ydCB7IFNoYXJlZE1vZHVsZSB9IGZyb20gJy4uL3NoYXJlZCc7XHJcblxyXG5jb25zdCByb3V0ZXM6IFJvdXRlcyA9IFtcclxuICB7XHJcbiAgICBwYXRoOiAnJyxcclxuICAgIGNvbXBvbmVudDogRWRpdG9yQ29tcG9uZW50LFxyXG4gICAgY2FuQWN0aXZhdGU6IFtBdXRoR3VhcmRdXHJcbiAgfSxcclxuICB7XHJcbiAgICBwYXRoOiAnOnNsdWcnLFxyXG4gICAgY29tcG9uZW50OiBFZGl0b3JDb21wb25lbnQsXHJcbiAgICBjYW5BY3RpdmF0ZTogW0F1dGhHdWFyZF0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFydGljbGU6IEVkaXRhYmxlQXJ0aWNsZVJlc29sdmVyXHJcbiAgICB9XHJcbiAgfVxyXG5dO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBpbXBvcnRzOiBbUm91dGVyTW9kdWxlLmZvckNoaWxkKHJvdXRlcyldLFxyXG4gIGV4cG9ydHM6IFtSb3V0ZXJNb2R1bGVdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBFZGl0b3JSb3V0aW5nTW9kdWxlIHt9XHJcbiIsIjxkaXYgY2xhc3M9XCJlZGl0b3ItcGFnZVwiPlxyXG4gIDxkaXYgY2xhc3M9XCJjb250YWluZXIgcGFnZVwiPlxyXG4gICAgPGRpdiBjbGFzcz1cInJvd1wiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiY29sLW1kLTEwIG9mZnNldC1tZC0xIGNvbC14cy0xMlwiPlxyXG5cclxuICAgICAgICA8YXBwLWxpc3QtZXJyb3JzIFtlcnJvcnNdPVwiZXJyb3JzXCI+PC9hcHAtbGlzdC1lcnJvcnM+XHJcblxyXG4gICAgICAgIDxmb3JtIFtmb3JtR3JvdXBdPVwiYXJ0aWNsZUZvcm1cIj5cclxuICAgICAgICAgIDxmaWVsZHNldCBbZGlzYWJsZWRdPVwiaXNTdWJtaXR0aW5nXCI+XHJcblxyXG4gICAgICAgICAgICA8ZmllbGRzZXQgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sIGZvcm0tY29udHJvbC1sZ1wiIGZvcm1Db250cm9sTmFtZT1cInRpdGxlXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIkFydGljbGUgVGl0bGVcIiAvPlxyXG4gICAgICAgICAgICA8L2ZpZWxkc2V0PlxyXG5cclxuICAgICAgICAgICAgPGZpZWxkc2V0IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxyXG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGZvcm1Db250cm9sTmFtZT1cImRlc2NyaXB0aW9uXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIldoYXQncyB0aGlzIGFydGljbGUgYWJvdXQ/XCIgLz5cclxuICAgICAgICAgICAgPC9maWVsZHNldD5cclxuXHJcbiAgICAgICAgICAgIDxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBmb3JtQ29udHJvbE5hbWU9XCJib2R5XCIgcm93cz1cIjhcIiBwbGFjZWhvbGRlcj1cIldyaXRlIHlvdXIgYXJ0aWNsZSAoaW4gbWFya2Rvd24pXCI+XHJcbiAgICAgICAgICAgICAgPC90ZXh0YXJlYT5cclxuICAgICAgICAgICAgPC9maWVsZHNldD5cclxuXHJcbiAgICAgICAgICAgIDxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiRW50ZXIgdGFnc1wiIFtmb3JtQ29udHJvbF09XCJ0YWdGaWVsZFwiIChrZXl1cC5lbnRlcik9XCJhZGRUYWcoKVwiIC8+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhZy1saXN0XCI+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiAqbmdGb3I9XCJsZXQgdGFnIG9mIGFydGljbGUudGFnTGlzdFwiIGNsYXNzPVwidGFnLWRlZmF1bHQgdGFnLXBpbGxcIj5cclxuICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJpb24tY2xvc2Utcm91bmRcIiAoY2xpY2spPVwicmVtb3ZlVGFnKHRhZylcIj48L2k+XHJcbiAgICAgICAgICAgICAgICAgIHt7IHRhZyB9fVxyXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2ZpZWxkc2V0PlxyXG5cclxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tbGcgcHVsbC14cy1yaWdodCBidG4tcHJpbWFyeVwiIHR5cGU9XCJidXR0b25cIiAoY2xpY2spPVwic3VibWl0Rm9ybSgpXCI+XHJcbiAgICAgICAgICAgICAgUHVibGlzaCBBcnRpY2xlXHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgIDwvZmllbGRzZXQ+XHJcbiAgICAgICAgPC9mb3JtPlxyXG5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICA8L2Rpdj5cclxuPC9kaXY+IiwiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgVW50eXBlZEZvcm1CdWlsZGVyLCBVbnR5cGVkRm9ybUdyb3VwLCBVbnR5cGVkRm9ybUNvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlLCBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5cclxuaW1wb3J0IHsgQXJ0aWNsZSwgQXJ0aWNsZXNTZXJ2aWNlIH0gZnJvbSAnLi4vY29yZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2FwcC1lZGl0b3ItcGFnZScsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL2VkaXRvci5jb21wb25lbnQuaHRtbCdcclxufSlcclxuZXhwb3J0IGNsYXNzIEVkaXRvckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XHJcbiAgYXJ0aWNsZTogQXJ0aWNsZSA9IHt9IGFzIEFydGljbGU7XHJcbiAgYXJ0aWNsZUZvcm06IFVudHlwZWRGb3JtR3JvdXA7XHJcbiAgdGFnRmllbGQgPSBuZXcgVW50eXBlZEZvcm1Db250cm9sKCk7XHJcbiAgZXJyb3JzOiBPYmplY3QgPSB7fTtcclxuICBpc1N1Ym1pdHRpbmcgPSBmYWxzZTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIGFydGljbGVzU2VydmljZTogQXJ0aWNsZXNTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByb3V0ZTogQWN0aXZhdGVkUm91dGUsXHJcbiAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxyXG4gICAgcHJpdmF0ZSBmYjogVW50eXBlZEZvcm1CdWlsZGVyXHJcbiAgKSB7XHJcbiAgICAvLyB1c2UgdGhlIEZvcm1CdWlsZGVyIHRvIGNyZWF0ZSBhIGZvcm0gZ3JvdXBcclxuICAgIHRoaXMuYXJ0aWNsZUZvcm0gPSB0aGlzLmZiLmdyb3VwKHtcclxuICAgICAgdGl0bGU6ICcnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJycsXHJcbiAgICAgIGJvZHk6ICcnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplZCB0YWdMaXN0IGFzIGVtcHR5IGFycmF5XHJcbiAgICB0aGlzLmFydGljbGUudGFnTGlzdCA9IFtdO1xyXG5cclxuICAgIC8vIE9wdGlvbmFsOiBzdWJzY3JpYmUgdG8gdmFsdWUgY2hhbmdlcyBvbiB0aGUgZm9ybVxyXG4gICAgLy8gdGhpcy5hcnRpY2xlRm9ybS52YWx1ZUNoYW5nZXMuc3Vic2NyaWJlKHZhbHVlID0+IHRoaXMudXBkYXRlQXJ0aWNsZSh2YWx1ZSkpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICAvLyBJZiB0aGVyZSdzIGFuIGFydGljbGUgcHJlZmV0Y2hlZCwgbG9hZCBpdFxyXG4gICAgdGhpcy5yb3V0ZS5kYXRhLnN1YnNjcmliZSgoZGF0YTogeyBhcnRpY2xlOiBBcnRpY2xlIH0pID0+IHtcclxuICAgICAgaWYgKGRhdGEuYXJ0aWNsZSkge1xyXG4gICAgICAgIHRoaXMuYXJ0aWNsZSA9IGRhdGEuYXJ0aWNsZTtcclxuICAgICAgICB0aGlzLmFydGljbGVGb3JtLnBhdGNoVmFsdWUoZGF0YS5hcnRpY2xlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhZGRUYWcoKSB7XHJcbiAgICAvLyByZXRyaWV2ZSB0YWcgY29udHJvbFxyXG4gICAgY29uc3QgdGFnID0gdGhpcy50YWdGaWVsZC52YWx1ZTtcclxuICAgIC8vIG9ubHkgYWRkIHRhZyBpZiBpdCBkb2VzIG5vdCBleGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmFydGljbGUudGFnTGlzdC5pbmRleE9mKHRhZykgPCAwKSB7XHJcbiAgICAgIHRoaXMuYXJ0aWNsZS50YWdMaXN0LnB1c2godGFnKTtcclxuICAgIH1cclxuICAgIC8vIGNsZWFyIHRoZSBpbnB1dFxyXG4gICAgdGhpcy50YWdGaWVsZC5yZXNldCgnJyk7XHJcbiAgfVxyXG5cclxuICByZW1vdmVUYWcodGFnTmFtZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLmFydGljbGUudGFnTGlzdCA9IHRoaXMuYXJ0aWNsZS50YWdMaXN0LmZpbHRlcih0YWcgPT4gdGFnICE9PSB0YWdOYW1lKTtcclxuICB9XHJcblxyXG4gIHN1Ym1pdEZvcm0oKSB7XHJcbiAgICB0aGlzLmlzU3VibWl0dGluZyA9IHRydWU7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBtb2RlbFxyXG4gICAgdGhpcy51cGRhdGVBcnRpY2xlKHRoaXMuYXJ0aWNsZUZvcm0udmFsdWUpO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBhbnkgc2luZ2xlIHRhZ1xyXG4gICAgdGhpcy5hZGRUYWcoKTtcclxuXHJcbiAgICAvLyBwb3N0IHRoZSBjaGFuZ2VzXHJcbiAgICB0aGlzLmFydGljbGVzU2VydmljZS5zYXZlKHRoaXMuYXJ0aWNsZSkuc3Vic2NyaWJlKFxyXG4gICAgICBhcnRpY2xlID0+IHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoJy9hcnRpY2xlLycgKyBhcnRpY2xlLnNsdWcpLFxyXG4gICAgICBlcnIgPT4ge1xyXG4gICAgICAgIHRoaXMuZXJyb3JzID0gZXJyO1xyXG4gICAgICAgIHRoaXMuaXNTdWJtaXR0aW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVBcnRpY2xlKHZhbHVlczogT2JqZWN0KSB7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuYXJ0aWNsZSwgdmFsdWVzKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7IEVkaXRvckNvbXBvbmVudCB9IGZyb20gJy4vZWRpdG9yLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IEVkaXRhYmxlQXJ0aWNsZVJlc29sdmVyIH0gZnJvbSAnLi9lZGl0YWJsZS1hcnRpY2xlLXJlc29sdmVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTaGFyZWRNb2R1bGUgfSBmcm9tICcuLi9zaGFyZWQnO1xyXG5pbXBvcnQgeyBFZGl0b3JSb3V0aW5nTW9kdWxlIH0gZnJvbSAnLi9lZGl0b3Itcm91dGluZy5tb2R1bGUnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBpbXBvcnRzOiBbU2hhcmVkTW9kdWxlLCBFZGl0b3JSb3V0aW5nTW9kdWxlXSxcclxuICBkZWNsYXJhdGlvbnM6IFtFZGl0b3JDb21wb25lbnRdLFxyXG4gIHByb3ZpZGVyczogW0VkaXRhYmxlQXJ0aWNsZVJlc29sdmVyXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgRWRpdG9yTW9kdWxlIHt9XHJcbiJdfQ==