declare const __coverage__: any;

// @ts-ignore
window._$Bc = function (coveredLine: string, coveredColumn: string) {
    // if (!seen.has(coveredLine + ':' + coveredColumn)) {
    worker.postMessage(coveredLine + ":" + coveredColumn);
    // seen.add(coveredLine + ':' + coveredColumn);
    // }
};

const windowAny = window as any;
if (!windowAny._$BcWorker) {
    // this is the bundled code of the worker in ./worker. For the proof of concept we just copy-pasted this here. This needs an automated build process to generate this.
    // we didn't use a separate worker since we didn't know if that would work with CORS (worker loaded from a different origin)
    const workerCode = new Blob(
        [
            `!function(){"use strict";function e(e,r,c,h){return new(c=c||Promise)(function(n,t){function o(e){try{s(h.next(e))}catch(e){t(e)}}function i(e){try{s(h.throw(e))}catch(e){t(e)}}function s(e){var t;e.done?n(e.value):((t=e.value)instanceof c?t:new c(function(e){e(t)})).then(o,i)}s((h=h.apply(e,r||[])).next())})}function n(n,o){var i,s,r,c={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]},e={next:t(0),throw:t(1),return:t(2)};return"function"==typeof Symbol&&(e[Symbol.iterator]=function(){return this}),e;function t(t){return function(e){return function(t){if(i)throw new TypeError("Generator is already executing.");for(;c;)try{if(i=1,s&&(r=2&t[0]?s.return:t[0]?s.throw||((r=s.return)&&r.call(s),0):s.next)&&!(r=r.call(s,t[1])).done)return r;switch(s=0,r&&(t=[2&t[0],r.value]),t[0]){case 0:case 1:r=t;break;case 4:return c.label++,{value:t[1],done:!1};case 5:c.label++,s=t[1],t=[0];continue;case 7:t=c.ops.pop(),c.trys.pop();continue;default:if(!(r=0<(r=c.trys).length&&r[r.length-1])&&(6===t[0]||2===t[0])){c=0;continue}if(3===t[0]&&(!r||t[1]>r[0]&&t[1]<r[3])){c.label=t[1];break}if(6===t[0]&&c.label<r[1]){c.label=r[1],r=t;break}if(r&&c.label<r[2]){c.label=r[2],c.ops.push(t);break}r[2]&&c.ops.pop(),c.trys.pop();continue}t=o.call(n,c)}catch(e){t=[6,e],s=0}finally{i=r=0}if(5&t[0])throw t[1];return{value:t[0]?t[1]:void 0,done:!0}}([t,e])}}}var t=(o.prototype.createSocket=function(){var e=this,t=new WebSocket(this.url);return t.onopen=function(){return e.onopen()},t.onclose=function(){return e.onclose()},t},o.prototype.onclose=function(){this.shouldSendViaFetch=!0,this.socket=this.createSocket()},o.prototype.onopen=function(){this.shouldSendViaFetch=!1;for(var e=0,t=this.cache;e<t.length;e++){var n=t[e];this.socket.send(n)}this.cache=[]},o.prototype.send=function(e){this.shouldSendViaFetch?this.sendViaFetch(e):this.socket.readyState===WebSocket.OPEN?this.socket.send(e):this.cache.push(e)},o.prototype.sendViaFetch=function(t){return e(this,void 0,void 0,function(){return n(this,function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),[4,fetch(this.fallbackUrl,{method:"POST",keepalive:!0,body:t})];case 1:return e.sent(),[3,3];case 2:return e.sent(),this.cache.push(t),[3,3];case 3:return[2]}})})},o);function o(e,t){this.cache=[],this.shouldSendViaFetch=!1,this.fallbackUrl=t,this.url=e,this.socket=this.createSocket()}var i=(s.prototype.input=function(){var e=this;this.reset(),this.timerToken=self.setTimeout(function(){e.timerToken=null,e.onBounce()},this.milliseconds)},s.prototype.reset=function(){null!==this.timerToken&&(self.clearTimeout(this.timerToken),this.timerToken=null)},s);function s(e,t){this.milliseconds=e,this.onBounce=t,this.timerToken=null}var r=(c.prototype.add=function(e){this.cachedCoverage+=e+"\\n",this.numberOfCacheLines+=1,this.debounce.input(),20<=this.numberOfCacheLines&&this.flush()},c.prototype.flush=function(){0!=this.numberOfCacheLines&&(this.debounce.reset(),this.socket.send("c"+this.cachedCoverage),this.cachedCoverage="",this.numberOfCacheLines=0)},c);function c(e){var t=this;this.socket=e,this.cachedCoverage="",this.numberOfCacheLines=0,this.debounce=new i(1e3,function(){return t.flush()})}var h=new t("ws://localhost:8087/socket","http://"+location.host+":8087"),u=new r(h);self.onmessage=function(e){var t=e.data;t.startsWith("s")?h.send(t):"unload"===t?u.flush():u.add(t)}}()`,
        ],
        { type: "text/javascript" }
    );

    const worker = new Worker(URL.createObjectURL(workerCode));
    windowAny._$BcWorker = worker;
    for (const entry of Object.values(__coverage__)) {
        const entryAny: any = entry;
        const sourceMap = entryAny.inputSourceMap;
        worker.postMessage("s" + JSON.stringify(sourceMap));
    }

    const wrapWindowEvent = function (name: string) {
        let wrappedHandler = windowAny[name];

        windowAny[name] = function () {
            worker.postMessage("unload");
            if (wrappedHandler) {
                return wrappedHandler.apply(this, arguments);
            }
        };

        Object.defineProperty(window, name, {
            get: function () {
                return wrappedHandler;
            },
            set: function (newHandler: any) {
                wrappedHandler = newHandler;
            },
        });
    };

    wrapWindowEvent("onunload");
    wrapWindowEvent("onbeforeunload");
    window.addEventListener("unload", () => worker.postMessage("unload"));
    window.addEventListener("beforeunload", () => worker.postMessage("unload"));
}

const worker = windowAny._$BcWorker;
// const seen = new Set<string>();

