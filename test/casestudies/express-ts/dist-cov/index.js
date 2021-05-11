"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Interceptor = (function () {
    function Interceptor(coverageObj, targetObj, path) {
        this.coverageObj = coverageObj;
        this.targetObj = targetObj;
        this.path = path;
    }
    Interceptor.prototype.get = function (target, prop, receiver) {
        var value = target[prop];
        if (value !== Object(value)) {
            return value;
        }
        return makeProxy(this.coverageObj, value, __spreadArray(__spreadArray([], this.path), [prop]));
    };
    Interceptor.prototype.set = function (obj, prop, value) {
        var fullPath = __spreadArray(__spreadArray([], this.path), [prop]);
        if (fullPath[0] === "s") {
            var start = this.coverageObj.statementMap[fullPath[1]].start;
            window['_$Bc']("" + start.line, "" + start.column);
        }
        return true;
    };
    return Interceptor;
}());
function makeProxy(coverage, target, path) {
    return new Proxy(target, new Interceptor(coverage, target, path));
}
window._$Bc = function (coveredLine, coveredColumn) {
    worker.postMessage(coveredLine + ":" + coveredColumn);
};
var windowAny = window;
if (!windowAny._$BcWorker) {
    var workerCode = new Blob([
        "!function(){\"use strict\";function e(e,r,c,h){return new(c=c||Promise)(function(n,t){function o(e){try{s(h.next(e))}catch(e){t(e)}}function i(e){try{s(h.throw(e))}catch(e){t(e)}}function s(e){var t;e.done?n(e.value):((t=e.value)instanceof c?t:new c(function(e){e(t)})).then(o,i)}s((h=h.apply(e,r||[])).next())})}function n(n,o){var i,s,r,c={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]},e={next:t(0),throw:t(1),return:t(2)};return\"function\"==typeof Symbol&&(e[Symbol.iterator]=function(){return this}),e;function t(t){return function(e){return function(t){if(i)throw new TypeError(\"Generator is already executing.\");for(;c;)try{if(i=1,s&&(r=2&t[0]?s.return:t[0]?s.throw||((r=s.return)&&r.call(s),0):s.next)&&!(r=r.call(s,t[1])).done)return r;switch(s=0,r&&(t=[2&t[0],r.value]),t[0]){case 0:case 1:r=t;break;case 4:return c.label++,{value:t[1],done:!1};case 5:c.label++,s=t[1],t=[0];continue;case 7:t=c.ops.pop(),c.trys.pop();continue;default:if(!(r=0<(r=c.trys).length&&r[r.length-1])&&(6===t[0]||2===t[0])){c=0;continue}if(3===t[0]&&(!r||t[1]>r[0]&&t[1]<r[3])){c.label=t[1];break}if(6===t[0]&&c.label<r[1]){c.label=r[1],r=t;break}if(r&&c.label<r[2]){c.label=r[2],c.ops.push(t);break}r[2]&&c.ops.pop(),c.trys.pop();continue}t=o.call(n,c)}catch(e){t=[6,e],s=0}finally{i=r=0}if(5&t[0])throw t[1];return{value:t[0]?t[1]:void 0,done:!0}}([t,e])}}}var t=(o.prototype.createSocket=function(){var e=this,t=new WebSocket(this.url);return t.onopen=function(){return e.onopen()},t.onclose=function(){return e.onclose()},t},o.prototype.onclose=function(){this.shouldSendViaFetch=!0,this.socket=this.createSocket()},o.prototype.onopen=function(){this.shouldSendViaFetch=!1;for(var e=0,t=this.cache;e<t.length;e++){var n=t[e];this.socket.send(n)}this.cache=[]},o.prototype.send=function(e){this.shouldSendViaFetch?this.sendViaFetch(e):this.socket.readyState===WebSocket.OPEN?this.socket.send(e):this.cache.push(e)},o.prototype.sendViaFetch=function(t){return e(this,void 0,void 0,function(){return n(this,function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),[4,fetch(this.fallbackUrl,{method:\"POST\",keepalive:!0,body:t})];case 1:return e.sent(),[3,3];case 2:return e.sent(),this.cache.push(t),[3,3];case 3:return[2]}})})},o);function o(e,t){this.cache=[],this.shouldSendViaFetch=!1,this.fallbackUrl=t,this.url=e,this.socket=this.createSocket()}var i=(s.prototype.input=function(){var e=this;this.reset(),this.timerToken=self.setTimeout(function(){e.timerToken=null,e.onBounce()},this.milliseconds)},s.prototype.reset=function(){null!==this.timerToken&&(self.clearTimeout(this.timerToken),this.timerToken=null)},s);function s(e,t){this.milliseconds=e,this.onBounce=t,this.timerToken=null}var r=(c.prototype.add=function(e){this.cachedCoverage+=e+\"\\n\",this.numberOfCacheLines+=1,this.debounce.input(),20<=this.numberOfCacheLines&&this.flush()},c.prototype.flush=function(){0!=this.numberOfCacheLines&&(this.debounce.reset(),this.socket.send(\"c\"+this.cachedCoverage),this.cachedCoverage=\"\",this.numberOfCacheLines=0)},c);function c(e){var t=this;this.socket=e,this.cachedCoverage=\"\",this.numberOfCacheLines=0,this.debounce=new i(1e3,function(){return t.flush()})}var h=new t(\"ws://localhost:8087/socket\",\"http://\"+location.host+\":8087\"),u=new r(h);self.onmessage=function(e){var t=e.data;t.startsWith(\"s\")?h.send(t):\"unload\"===t?u.flush():u.add(t)}}()",
    ], { type: "text/javascript" });
    var worker_1 = new Worker(URL.createObjectURL(workerCode));
    windowAny._$BcWorker = worker_1;
    for (var _i = 0, _a = Object.values(__coverage__); _i < _a.length; _i++) {
        var entry = _a[_i];
        var entryAny = entry;
        var sourceMap = entryAny.inputSourceMap;
        worker_1.postMessage("s" + JSON.stringify(sourceMap));
    }
    var wrapWindowEvent = function (name) {
        var wrappedHandler = windowAny[name];
        windowAny[name] = function () {
            worker_1.postMessage("unload");
            if (wrappedHandler) {
                return wrappedHandler.apply(this, arguments);
            }
        };
        Object.defineProperty(window, name, {
            get: function () {
                return wrappedHandler;
            },
            set: function (newHandler) {
                wrappedHandler = newHandler;
            },
        });
    };
    wrapWindowEvent("onunload");
    wrapWindowEvent("onbeforeunload");
    window.addEventListener("unload", function () { return worker_1.postMessage("unload"); });
    window.addEventListener("beforeunload", function () { return worker_1.postMessage("unload"); });
}
var worker = windowAny._$BcWorker;
define("vaccine/worker/CachingSocket", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachingSocket = void 0;
    var CachingSocket = (function () {
        function CachingSocket(url, fallbackUrl) {
            this.cache = [];
            this.shouldSendViaFetch = false;
            this.fallbackUrl = fallbackUrl;
            this.url = url;
            this.socket = this.createSocket();
        }
        CachingSocket.prototype.createSocket = function () {
            var _this = this;
            var socket = new WebSocket(this.url);
            socket.onopen = function () { return _this.onopen(); };
            socket.onclose = function () { return _this.onclose(); };
            return socket;
        };
        CachingSocket.prototype.onclose = function () {
            this.shouldSendViaFetch = true;
            this.socket = this.createSocket();
        };
        CachingSocket.prototype.onopen = function () {
            this.shouldSendViaFetch = false;
            for (var _i = 0, _a = this.cache; _i < _a.length; _i++) {
                var message = _a[_i];
                this.socket.send(message);
            }
            this.cache = [];
        };
        CachingSocket.prototype.send = function (message) {
            if (this.shouldSendViaFetch) {
                this.sendViaFetch(message);
            }
            else if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(message);
            }
            else {
                this.cache.push(message);
            }
        };
        CachingSocket.prototype.sendViaFetch = function (message) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4, fetch(this.fallbackUrl, {
                                    method: "POST",
                                    keepalive: true,
                                    body: message
                                })];
                        case 1:
                            _a.sent();
                            return [3, 3];
                        case 2:
                            e_1 = _a.sent();
                            this.cache.push(message);
                            return [3, 3];
                        case 3: return [2];
                    }
                });
            });
        };
        return CachingSocket;
    }());
    exports.CachingSocket = CachingSocket;
});
define("vaccine/worker/debounce", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Debounce = void 0;
    var Debounce = (function () {
        function Debounce(milliseconds, onBounce) {
            this.milliseconds = milliseconds;
            this.onBounce = onBounce;
            this.timerToken = null;
        }
        Debounce.prototype.input = function () {
            var _this = this;
            this.reset();
            this.timerToken = self.setTimeout(function () {
                _this.timerToken = null;
                _this.onBounce();
            }, this.milliseconds);
        };
        Debounce.prototype.reset = function () {
            if (this.timerToken === null) {
                return;
            }
            self.clearTimeout(this.timerToken);
            this.timerToken = null;
        };
        return Debounce;
    }());
    exports.Debounce = Debounce;
});
define("vaccine/worker/CoverageAggregator", ["require", "exports", "vaccine/worker/debounce"], function (require, exports, debounce_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CoverageAggregator = void 0;
    var CoverageAggregator = (function () {
        function CoverageAggregator(socket) {
            var _this = this;
            this.socket = socket;
            this.cachedCoverage = "";
            this.numberOfCacheLines = 0;
            this.debounce = new debounce_1.Debounce(1000, function () { return _this.flush(); });
        }
        CoverageAggregator.prototype.add = function (coveredLine) {
            this.cachedCoverage += coveredLine + "\n";
            this.numberOfCacheLines += 1;
            this.debounce.input();
            if (this.numberOfCacheLines >= 20) {
                this.flush();
            }
        };
        CoverageAggregator.prototype.flush = function () {
            if (this.numberOfCacheLines == 0) {
                return;
            }
            this.debounce.reset();
            this.socket.send('c' + this.cachedCoverage);
            this.cachedCoverage = "";
            this.numberOfCacheLines = 0;
        };
        return CoverageAggregator;
    }());
    exports.CoverageAggregator = CoverageAggregator;
});
define("vaccine/worker/worker", ["require", "exports", "vaccine/worker/CachingSocket", "vaccine/worker/CoverageAggregator"], function (require, exports, CachingSocket_1, CoverageAggregator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var socket = new CachingSocket_1.CachingSocket("ws://localhost:8087/socket", "http://" + location.host + ":8087");
    var aggregator = new CoverageAggregator_1.CoverageAggregator(socket);
    self.onmessage = function (event) {
        var message = event.data;
        if (message.startsWith('s')) {
            socket.send(message);
        }
        else if (message === "unload") {
            aggregator.flush();
        }
        else {
            aggregator.add(message);
        }
    };
});
 "use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Interceptor = (function () {
    function Interceptor(coverageObj, targetObj, path) {
        this.coverageObj = coverageObj;
        this.targetObj = targetObj;
        this.path = path;
    }
    Interceptor.prototype.get = function (target, prop, receiver) {
        var value = target[prop];
        if (value !== Object(value)) {
            return value;
        }
        return makeProxy(this.coverageObj, value, __spreadArray(__spreadArray([], this.path), [prop]));
    };
    Interceptor.prototype.set = function (obj, prop, value) {
        var fullPath = __spreadArray(__spreadArray([], this.path), [prop]);
        if (fullPath[0] === "s") {
            var start = this.coverageObj.statementMap[fullPath[1]].start;
            window['_$Bc']("" + start.line, "" + start.column);
        }
        return true;
    };
    return Interceptor;
}());
function makeProxy(coverage, target, path) {
    return new Proxy(target, new Interceptor(coverage, target, path));
}
window._$Bc = function (coveredLine, coveredColumn) {
    worker.postMessage(coveredLine + ":" + coveredColumn);
};
var windowAny = window;
if (!windowAny._$BcWorker) {
    var workerCode = new Blob([
        "!function(){\"use strict\";function e(e,r,c,h){return new(c=c||Promise)(function(n,t){function o(e){try{s(h.next(e))}catch(e){t(e)}}function i(e){try{s(h.throw(e))}catch(e){t(e)}}function s(e){var t;e.done?n(e.value):((t=e.value)instanceof c?t:new c(function(e){e(t)})).then(o,i)}s((h=h.apply(e,r||[])).next())})}function n(n,o){var i,s,r,c={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]},e={next:t(0),throw:t(1),return:t(2)};return\"function\"==typeof Symbol&&(e[Symbol.iterator]=function(){return this}),e;function t(t){return function(e){return function(t){if(i)throw new TypeError(\"Generator is already executing.\");for(;c;)try{if(i=1,s&&(r=2&t[0]?s.return:t[0]?s.throw||((r=s.return)&&r.call(s),0):s.next)&&!(r=r.call(s,t[1])).done)return r;switch(s=0,r&&(t=[2&t[0],r.value]),t[0]){case 0:case 1:r=t;break;case 4:return c.label++,{value:t[1],done:!1};case 5:c.label++,s=t[1],t=[0];continue;case 7:t=c.ops.pop(),c.trys.pop();continue;default:if(!(r=0<(r=c.trys).length&&r[r.length-1])&&(6===t[0]||2===t[0])){c=0;continue}if(3===t[0]&&(!r||t[1]>r[0]&&t[1]<r[3])){c.label=t[1];break}if(6===t[0]&&c.label<r[1]){c.label=r[1],r=t;break}if(r&&c.label<r[2]){c.label=r[2],c.ops.push(t);break}r[2]&&c.ops.pop(),c.trys.pop();continue}t=o.call(n,c)}catch(e){t=[6,e],s=0}finally{i=r=0}if(5&t[0])throw t[1];return{value:t[0]?t[1]:void 0,done:!0}}([t,e])}}}var t=(o.prototype.createSocket=function(){var e=this,t=new WebSocket(this.url);return t.onopen=function(){return e.onopen()},t.onclose=function(){return e.onclose()},t},o.prototype.onclose=function(){this.shouldSendViaFetch=!0,this.socket=this.createSocket()},o.prototype.onopen=function(){this.shouldSendViaFetch=!1;for(var e=0,t=this.cache;e<t.length;e++){var n=t[e];this.socket.send(n)}this.cache=[]},o.prototype.send=function(e){this.shouldSendViaFetch?this.sendViaFetch(e):this.socket.readyState===WebSocket.OPEN?this.socket.send(e):this.cache.push(e)},o.prototype.sendViaFetch=function(t){return e(this,void 0,void 0,function(){return n(this,function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),[4,fetch(this.fallbackUrl,{method:\"POST\",keepalive:!0,body:t})];case 1:return e.sent(),[3,3];case 2:return e.sent(),this.cache.push(t),[3,3];case 3:return[2]}})})},o);function o(e,t){this.cache=[],this.shouldSendViaFetch=!1,this.fallbackUrl=t,this.url=e,this.socket=this.createSocket()}var i=(s.prototype.input=function(){var e=this;this.reset(),this.timerToken=self.setTimeout(function(){e.timerToken=null,e.onBounce()},this.milliseconds)},s.prototype.reset=function(){null!==this.timerToken&&(self.clearTimeout(this.timerToken),this.timerToken=null)},s);function s(e,t){this.milliseconds=e,this.onBounce=t,this.timerToken=null}var r=(c.prototype.add=function(e){this.cachedCoverage+=e+\"\\n\",this.numberOfCacheLines+=1,this.debounce.input(),20<=this.numberOfCacheLines&&this.flush()},c.prototype.flush=function(){0!=this.numberOfCacheLines&&(this.debounce.reset(),this.socket.send(\"c\"+this.cachedCoverage),this.cachedCoverage=\"\",this.numberOfCacheLines=0)},c);function c(e){var t=this;this.socket=e,this.cachedCoverage=\"\",this.numberOfCacheLines=0,this.debounce=new i(1e3,function(){return t.flush()})}var h=new t(\"ws://localhost:8087/socket\",\"http://\"+location.host+\":8087\"),u=new r(h);self.onmessage=function(e){var t=e.data;t.startsWith(\"s\")?h.send(t):\"unload\"===t?u.flush():u.add(t)}}()",
    ], { type: "text/javascript" });
    var worker_1 = new Worker(URL.createObjectURL(workerCode));
    windowAny._$BcWorker = worker_1;
    for (var _i = 0, _a = Object.values(__coverage__); _i < _a.length; _i++) {
        var entry = _a[_i];
        var entryAny = entry;
        var sourceMap = entryAny.inputSourceMap;
        worker_1.postMessage("s" + JSON.stringify(sourceMap));
    }
    var wrapWindowEvent = function (name) {
        var wrappedHandler = windowAny[name];
        windowAny[name] = function () {
            worker_1.postMessage("unload");
            if (wrappedHandler) {
                return wrappedHandler.apply(this, arguments);
            }
        };
        Object.defineProperty(window, name, {
            get: function () {
                return wrappedHandler;
            },
            set: function (newHandler) {
                wrappedHandler = newHandler;
            },
        });
    };
    wrapWindowEvent("onunload");
    wrapWindowEvent("onbeforeunload");
    window.addEventListener("unload", function () { return worker_1.postMessage("unload"); });
    window.addEventListener("beforeunload", function () { return worker_1.postMessage("unload"); });
}
var worker = windowAny._$BcWorker;
define("vaccine/worker/CachingSocket", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachingSocket = void 0;
    var CachingSocket = (function () {
        function CachingSocket(url, fallbackUrl) {
            this.cache = [];
            this.shouldSendViaFetch = false;
            this.fallbackUrl = fallbackUrl;
            this.url = url;
            this.socket = this.createSocket();
        }
        CachingSocket.prototype.createSocket = function () {
            var _this = this;
            var socket = new WebSocket(this.url);
            socket.onopen = function () { return _this.onopen(); };
            socket.onclose = function () { return _this.onclose(); };
            return socket;
        };
        CachingSocket.prototype.onclose = function () {
            this.shouldSendViaFetch = true;
            this.socket = this.createSocket();
        };
        CachingSocket.prototype.onopen = function () {
            this.shouldSendViaFetch = false;
            for (var _i = 0, _a = this.cache; _i < _a.length; _i++) {
                var message = _a[_i];
                this.socket.send(message);
            }
            this.cache = [];
        };
        CachingSocket.prototype.send = function (message) {
            if (this.shouldSendViaFetch) {
                this.sendViaFetch(message);
            }
            else if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(message);
            }
            else {
                this.cache.push(message);
            }
        };
        CachingSocket.prototype.sendViaFetch = function (message) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4, fetch(this.fallbackUrl, {
                                    method: "POST",
                                    keepalive: true,
                                    body: message
                                })];
                        case 1:
                            _a.sent();
                            return [3, 3];
                        case 2:
                            e_1 = _a.sent();
                            this.cache.push(message);
                            return [3, 3];
                        case 3: return [2];
                    }
                });
            });
        };
        return CachingSocket;
    }());
    exports.CachingSocket = CachingSocket;
});
define("vaccine/worker/debounce", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Debounce = void 0;
    var Debounce = (function () {
        function Debounce(milliseconds, onBounce) {
            this.milliseconds = milliseconds;
            this.onBounce = onBounce;
            this.timerToken = null;
        }
        Debounce.prototype.input = function () {
            var _this = this;
            this.reset();
            this.timerToken = self.setTimeout(function () {
                _this.timerToken = null;
                _this.onBounce();
            }, this.milliseconds);
        };
        Debounce.prototype.reset = function () {
            if (this.timerToken === null) {
                return;
            }
            self.clearTimeout(this.timerToken);
            this.timerToken = null;
        };
        return Debounce;
    }());
    exports.Debounce = Debounce;
});
define("vaccine/worker/CoverageAggregator", ["require", "exports", "vaccine/worker/debounce"], function (require, exports, debounce_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CoverageAggregator = void 0;
    var CoverageAggregator = (function () {
        function CoverageAggregator(socket) {
            var _this = this;
            this.socket = socket;
            this.cachedCoverage = "";
            this.numberOfCacheLines = 0;
            this.debounce = new debounce_1.Debounce(1000, function () { return _this.flush(); });
        }
        CoverageAggregator.prototype.add = function (coveredLine) {
            this.cachedCoverage += coveredLine + "\n";
            this.numberOfCacheLines += 1;
            this.debounce.input();
            if (this.numberOfCacheLines >= 20) {
                this.flush();
            }
        };
        CoverageAggregator.prototype.flush = function () {
            if (this.numberOfCacheLines == 0) {
                return;
            }
            this.debounce.reset();
            this.socket.send('c' + this.cachedCoverage);
            this.cachedCoverage = "";
            this.numberOfCacheLines = 0;
        };
        return CoverageAggregator;
    }());
    exports.CoverageAggregator = CoverageAggregator;
});
define("vaccine/worker/worker", ["require", "exports", "vaccine/worker/CachingSocket", "vaccine/worker/CoverageAggregator"], function (require, exports, CachingSocket_1, CoverageAggregator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var socket = new CachingSocket_1.CachingSocket("ws://localhost:8087/socket", "http://" + location.host + ":8087");
    var aggregator = new CoverageAggregator_1.CoverageAggregator(socket);
    self.onmessage = function (event) {
        var message = event.data;
        if (message.startsWith('s')) {
            socket.send(message);
        }
        else if (message === "unload") {
            aggregator.flush();
        }
        else {
            aggregator.add(message);
        }
    };
});
 "use strict";function cov_l64748zwj(){var path="test/casestudies/express-ts/dist/index.js";var hash="9f2be4697cacacd19049a8964aee98a549cf8788";var global=new Function("return this")();var gcv="___COVERAGE___";var coverageData={path:"test/casestudies/express-ts/dist/index.js",statementMap:{"0":{start:{line:2,column:0},end:{line:2,column:62}},"1":{start:{line:3,column:14},end:{line:3,column:32}},"2":{start:{line:4,column:10},end:{line:4,column:19}},"3":{start:{line:5,column:0},end:{line:7,column:3}},"4":{start:{line:6,column:4},end:{line:6,column:29}},"5":{start:{line:8,column:0},end:{line:10,column:3}},"6":{start:{line:9,column:4},end:{line:9,column:30}}},fnMap:{"0":{name:"(anonymous_0)",decl:{start:{line:5,column:13},end:{line:5,column:14}},loc:{start:{line:5,column:33},end:{line:7,column:1}},line:5},"1":{name:"(anonymous_1)",decl:{start:{line:8,column:17},end:{line:8,column:18}},loc:{start:{line:8,column:29},end:{line:10,column:1}},line:8}},branchMap:{},s:{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0},f:{"0":0,"1":0},b:{},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"9f2be4697cacacd19049a8964aee98a549cf8788"};var coverage=global[gcv]||(global[gcv]={});if(!coverage[path]||coverage[path].hash!==hash){coverage[path]=coverageData;}var actualCoverage=coverage[path];{// @ts-ignore
cov_l64748zwj=function(){return makeProxy(actualCoverage, actualCoverage, []);};}return makeProxy(actualCoverage, actualCoverage, []);}cov_l64748zwj();cov_l64748zwj().s[0]++;Object.defineProperty(exports,"__esModule",{value:true});var express=(cov_l64748zwj().s[1]++,require("express"));var app=(cov_l64748zwj().s[2]++,express());cov_l64748zwj().s[3]++;app.get('/',function(req,res){cov_l64748zwj().f[0]++;cov_l64748zwj().s[4]++;res.send("Hello World!");});cov_l64748zwj().s[5]++;app.listen(3000,function(){cov_l64748zwj().f[1]++;cov_l64748zwj().s[6]++;console.log("Listening!");});