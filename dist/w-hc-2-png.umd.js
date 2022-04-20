/*!
 * w-hc-2-png v1.0.11
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r(require("fs"),require("path"),require("puppeteer")):"function"==typeof define&&define.amd?define(["fs","path","puppeteer"],r):(t="undefined"!=typeof globalThis?globalThis:t||self)["w-hc-2-png"]=r(t.fs,t.path,t.puppeteer)}(this,(function(t,r,e){"use strict";function n(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var o=n(t),i=n(r),a=n(e);function u(t,r,e,n,o,i,a){try{var u=t[i](a),c=u.value}catch(t){return void e(t)}u.done?r(c):Promise.resolve(c).then(n,o)}function c(t){return function(){var r=this,e=arguments;return new Promise((function(n,o){var i=t.apply(r,e);function a(t){u(i,n,o,a,c,"next",t)}function c(t){u(i,n,o,a,c,"throw",t)}a(void 0)}))}}function s(t){return s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},s(t)}var f="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function l(t){var r={exports:{}};return t(r,r.exports),r.exports}var h=l((function(t){var r=function(t){var r,e=Object.prototype,n=e.hasOwnProperty,o="function"==typeof Symbol?Symbol:{},i=o.iterator||"@@iterator",a=o.asyncIterator||"@@asyncIterator",u=o.toStringTag||"@@toStringTag";function c(t,r,e){return Object.defineProperty(t,r,{value:e,enumerable:!0,configurable:!0,writable:!0}),t[r]}try{c({},"")}catch(t){c=function(t,r,e){return t[r]=e}}function f(t,r,e,n){var o=r&&r.prototype instanceof g?r:g,i=Object.create(o.prototype),a=new L(n||[]);return i._invoke=function(t,r,e){var n=h;return function(o,i){if(n===d)throw new Error("Generator is already running");if(n===v){if("throw"===o)throw i;return E()}for(e.method=o,e.arg=i;;){var a=e.delegate;if(a){var u=x(a,e);if(u){if(u===y)continue;return u}}if("next"===e.method)e.sent=e._sent=e.arg;else if("throw"===e.method){if(n===h)throw n=v,e.arg;e.dispatchException(e.arg)}else"return"===e.method&&e.abrupt("return",e.arg);n=d;var c=l(t,r,e);if("normal"===c.type){if(n=e.done?v:p,c.arg===y)continue;return{value:c.arg,done:e.done}}"throw"===c.type&&(n=v,e.method="throw",e.arg=c.arg)}}}(t,e,a),i}function l(t,r,e){try{return{type:"normal",arg:t.call(r,e)}}catch(t){return{type:"throw",arg:t}}}t.wrap=f;var h="suspendedStart",p="suspendedYield",d="executing",v="completed",y={};function g(){}function b(){}function m(){}var _={};c(_,i,(function(){return this}));var w=Object.getPrototypeOf,j=w&&w(w(T([])));j&&j!==e&&n.call(j,i)&&(_=j);var $=m.prototype=g.prototype=Object.create(_);function O(t){["next","throw","return"].forEach((function(r){c(t,r,(function(t){return this._invoke(r,t)}))}))}function S(t,r){function e(o,i,a,u){var c=l(t[o],t,i);if("throw"!==c.type){var f=c.arg,h=f.value;return h&&"object"===s(h)&&n.call(h,"__await")?r.resolve(h.__await).then((function(t){e("next",t,a,u)}),(function(t){e("throw",t,a,u)})):r.resolve(h).then((function(t){f.value=t,a(f)}),(function(t){return e("throw",t,a,u)}))}u(c.arg)}var o;this._invoke=function(t,n){function i(){return new r((function(r,o){e(t,n,r,o)}))}return o=o?o.then(i,i):i()}}function x(t,e){var n=t.iterator[e.method];if(n===r){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=r,x(t,e),"throw"===e.method))return y;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return y}var o=l(n,t.iterator,e.arg);if("throw"===o.type)return e.method="throw",e.arg=o.arg,e.delegate=null,y;var i=o.arg;return i?i.done?(e[t.resultName]=i.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=r),e.delegate=null,y):i:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,y)}function M(t){var r={tryLoc:t[0]};1 in t&&(r.catchLoc=t[1]),2 in t&&(r.finallyLoc=t[2],r.afterLoc=t[3]),this.tryEntries.push(r)}function D(t){var r=t.completion||{};r.type="normal",delete r.arg,t.completion=r}function L(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(M,this),this.reset(!0)}function T(t){if(t){var e=t[i];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var o=-1,a=function e(){for(;++o<t.length;)if(n.call(t,o))return e.value=t[o],e.done=!1,e;return e.value=r,e.done=!0,e};return a.next=a}}return{next:E}}function E(){return{value:r,done:!0}}return b.prototype=m,c($,"constructor",m),c(m,"constructor",b),b.displayName=c(m,u,"GeneratorFunction"),t.isGeneratorFunction=function(t){var r="function"==typeof t&&t.constructor;return!!r&&(r===b||"GeneratorFunction"===(r.displayName||r.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,m):(t.__proto__=m,c(t,u,"GeneratorFunction")),t.prototype=Object.create($),t},t.awrap=function(t){return{__await:t}},O(S.prototype),c(S.prototype,a,(function(){return this})),t.AsyncIterator=S,t.async=function(r,e,n,o,i){void 0===i&&(i=Promise);var a=new S(f(r,e,n,o),i);return t.isGeneratorFunction(e)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},O($),c($,u,"Generator"),c($,i,(function(){return this})),c($,"toString",(function(){return"[object Generator]"})),t.keys=function(t){var r=[];for(var e in t)r.push(e);return r.reverse(),function e(){for(;r.length;){var n=r.pop();if(n in t)return e.value=n,e.done=!1,e}return e.done=!0,e}},t.values=T,L.prototype={constructor:L,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(D),!t)for(var e in this)"t"===e.charAt(0)&&n.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=r)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function o(n,o){return u.type="throw",u.arg=t,e.next=n,o&&(e.method="next",e.arg=r),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],u=a.completion;if("root"===a.tryLoc)return o("end");if(a.tryLoc<=this.prev){var c=n.call(a,"catchLoc"),s=n.call(a,"finallyLoc");if(c&&s){if(this.prev<a.catchLoc)return o(a.catchLoc,!0);if(this.prev<a.finallyLoc)return o(a.finallyLoc)}else if(c){if(this.prev<a.catchLoc)return o(a.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return o(a.finallyLoc)}}}},abrupt:function(t,r){for(var e=this.tryEntries.length-1;e>=0;--e){var o=this.tryEntries[e];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=r&&r<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=r,i?(this.method="next",this.next=i.finallyLoc,y):this.complete(a)},complete:function(t,r){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&r&&(this.next=r),y},finish:function(t){for(var r=this.tryEntries.length-1;r>=0;--r){var e=this.tryEntries[r];if(e.finallyLoc===t)return this.complete(e.completion,e.afterLoc),D(e),y}},catch:function(t){for(var r=this.tryEntries.length-1;r>=0;--r){var e=this.tryEntries[r];if(e.tryLoc===t){var n=e.completion;if("throw"===n.type){var o=n.arg;D(e)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:T(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=r),y}},t}(t.exports);try{regeneratorRuntime=r}catch(t){"object"===("undefined"==typeof globalThis?"undefined":s(globalThis))?globalThis.regeneratorRuntime=r:Function("r","regeneratorRuntime = r")(r)}})),p=h,d=Array.isArray,v="object"==s(f)&&f&&f.Object===Object&&f,y="object"==("undefined"==typeof self?"undefined":s(self))&&self&&self.Object===Object&&self,g=v||y||Function("return this")(),b=g.Symbol,m=Object.prototype,_=m.hasOwnProperty,w=m.toString,j=b?b.toStringTag:void 0;var $=function(t){var r=_.call(t,j),e=t[j];try{t[j]=void 0;var n=!0}catch(t){}var o=w.call(t);return n&&(r?t[j]=e:delete t[j]),o},O=Object.prototype.toString;var S=function(t){return O.call(t)},x=b?b.toStringTag:void 0;var M=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":x&&x in Object(t)?$(t):S(t)};var D=function(t){return null!=t&&"object"==s(t)};var L=function(t){return"symbol"==s(t)||D(t)&&"[object Symbol]"==M(t)},T=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,E=/^\w*$/;var k=function(t,r){if(d(t))return!1;var e=s(t);return!("number"!=e&&"symbol"!=e&&"boolean"!=e&&null!=t&&!L(t))||(E.test(t)||!T.test(t)||null!=r&&t in Object(r))};var A=function(t){var r=s(t);return null!=t&&("object"==r||"function"==r)};var F,N=function(t){if(!A(t))return!1;var r=M(t);return"[object Function]"==r||"[object GeneratorFunction]"==r||"[object AsyncFunction]"==r||"[object Proxy]"==r},P=g["__core-js_shared__"],Y=(F=/[^.]+$/.exec(P&&P.keys&&P.keys.IE_PROTO||""))?"Symbol(src)_1."+F:"";var I=function(t){return!!Y&&Y in t},z=Function.prototype.toString;var C=function(t){if(null!=t){try{return z.call(t)}catch(t){}try{return t+""}catch(t){}}return""},H=/^\[object .+?Constructor\]$/,U=Function.prototype,W=Object.prototype,G=U.toString,q=W.hasOwnProperty,B=RegExp("^"+G.call(q).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var R=function(t){return!(!A(t)||I(t))&&(N(t)?B:H).test(C(t))};var J=function(t,r){return null==t?void 0:t[r]};var V=function(t,r){var e=J(t,r);return R(e)?e:void 0},Z=V(Object,"create");var Q=function(){this.__data__=Z?Z(null):{},this.size=0};var K=function(t){var r=this.has(t)&&delete this.__data__[t];return this.size-=r?1:0,r},X=Object.prototype.hasOwnProperty;var tt=function(t){var r=this.__data__;if(Z){var e=r[t];return"__lodash_hash_undefined__"===e?void 0:e}return X.call(r,t)?r[t]:void 0},rt=Object.prototype.hasOwnProperty;var et=function(t){var r=this.__data__;return Z?void 0!==r[t]:rt.call(r,t)};var nt=function(t,r){var e=this.__data__;return this.size+=this.has(t)?0:1,e[t]=Z&&void 0===r?"__lodash_hash_undefined__":r,this};function ot(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}ot.prototype.clear=Q,ot.prototype.delete=K,ot.prototype.get=tt,ot.prototype.has=et,ot.prototype.set=nt;var it=ot;var at=function(){this.__data__=[],this.size=0};var ut=function(t,r){return t===r||t!=t&&r!=r};var ct=function(t,r){for(var e=t.length;e--;)if(ut(t[e][0],r))return e;return-1},st=Array.prototype.splice;var ft=function(t){var r=this.__data__,e=ct(r,t);return!(e<0)&&(e==r.length-1?r.pop():st.call(r,e,1),--this.size,!0)};var lt=function(t){var r=this.__data__,e=ct(r,t);return e<0?void 0:r[e][1]};var ht=function(t){return ct(this.__data__,t)>-1};var pt=function(t,r){var e=this.__data__,n=ct(e,t);return n<0?(++this.size,e.push([t,r])):e[n][1]=r,this};function dt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}dt.prototype.clear=at,dt.prototype.delete=ft,dt.prototype.get=lt,dt.prototype.has=ht,dt.prototype.set=pt;var vt=dt,yt=V(g,"Map");var gt=function(){this.size=0,this.__data__={hash:new it,map:new(yt||vt),string:new it}};var bt=function(t){var r=s(t);return"string"==r||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==t:null===t};var mt=function(t,r){var e=t.__data__;return bt(r)?e["string"==typeof r?"string":"hash"]:e.map};var _t=function(t){var r=mt(this,t).delete(t);return this.size-=r?1:0,r};var wt=function(t){return mt(this,t).get(t)};var jt=function(t){return mt(this,t).has(t)};var $t=function(t,r){var e=mt(this,t),n=e.size;return e.set(t,r),this.size+=e.size==n?0:1,this};function Ot(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}Ot.prototype.clear=gt,Ot.prototype.delete=_t,Ot.prototype.get=wt,Ot.prototype.has=jt,Ot.prototype.set=$t;var St=Ot;function xt(t,r){if("function"!=typeof t||null!=r&&"function"!=typeof r)throw new TypeError("Expected a function");var e=function e(){var n=arguments,o=r?r.apply(this,n):n[0],i=e.cache;if(i.has(o))return i.get(o);var a=t.apply(this,n);return e.cache=i.set(o,a)||i,a};return e.cache=new(xt.Cache||St),e}xt.Cache=St;var Mt=xt;var Dt=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Lt=/\\(\\)?/g,Tt=function(t){var r=Mt(t,(function(t){return 500===e.size&&e.clear(),t})),e=r.cache;return r}((function(t){var r=[];return 46===t.charCodeAt(0)&&r.push(""),t.replace(Dt,(function(t,e,n,o){r.push(n?o.replace(Lt,"$1"):e||t)})),r}));var Et=function(t,r){for(var e=-1,n=null==t?0:t.length,o=Array(n);++e<n;)o[e]=r(t[e],e,t);return o},kt=b?b.prototype:void 0,At=kt?kt.toString:void 0;var Ft=function t(r){if("string"==typeof r)return r;if(d(r))return Et(r,t)+"";if(L(r))return At?At.call(r):"";var e=r+"";return"0"==e&&1/r==-Infinity?"-0":e};var Nt=function(t){return null==t?"":Ft(t)};var Pt=function(t,r){return d(t)?t:k(t,r)?[t]:Tt(Nt(t))};var Yt=function(t){if("string"==typeof t||L(t))return t;var r=t+"";return"0"==r&&1/t==-Infinity?"-0":r};var It=function(t,r){for(var e=0,n=(r=Pt(r,t)).length;null!=t&&e<n;)t=t[Yt(r[e++])];return e&&e==n?t:void 0};var zt=function(t,r,e){var n=null==t?void 0:It(t,r);return void 0===n?e:n};var Ct=function(t,r){for(var e=-1,n=null==t?0:t.length;++e<n&&!1!==r(t[e],e,t););return t};var Ht=function(t){return function(r,e,n){for(var o=-1,i=Object(r),a=n(r),u=a.length;u--;){var c=a[t?u:++o];if(!1===e(i[c],c,i))break}return r}}();var Ut=function(t,r){for(var e=-1,n=Array(t);++e<t;)n[e]=r(e);return n};var Wt=function(t){return D(t)&&"[object Arguments]"==M(t)},Gt=Object.prototype,qt=Gt.hasOwnProperty,Bt=Gt.propertyIsEnumerable,Rt=Wt(function(){return arguments}())?Wt:function(t){return D(t)&&qt.call(t,"callee")&&!Bt.call(t,"callee")},Jt=Rt;var Vt=function(){return!1},Zt=l((function(t,r){var e=r&&!r.nodeType&&r,n=e&&t&&!t.nodeType&&t,o=n&&n.exports===e?g.Buffer:void 0,i=(o?o.isBuffer:void 0)||Vt;t.exports=i})),Qt=/^(?:0|[1-9]\d*)$/;var Kt=function(t,r){var e=s(t);return!!(r=null==r?9007199254740991:r)&&("number"==e||"symbol"!=e&&Qt.test(t))&&t>-1&&t%1==0&&t<r};var Xt=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991},tr={};tr["[object Float32Array]"]=tr["[object Float64Array]"]=tr["[object Int8Array]"]=tr["[object Int16Array]"]=tr["[object Int32Array]"]=tr["[object Uint8Array]"]=tr["[object Uint8ClampedArray]"]=tr["[object Uint16Array]"]=tr["[object Uint32Array]"]=!0,tr["[object Arguments]"]=tr["[object Array]"]=tr["[object ArrayBuffer]"]=tr["[object Boolean]"]=tr["[object DataView]"]=tr["[object Date]"]=tr["[object Error]"]=tr["[object Function]"]=tr["[object Map]"]=tr["[object Number]"]=tr["[object Object]"]=tr["[object RegExp]"]=tr["[object Set]"]=tr["[object String]"]=tr["[object WeakMap]"]=!1;var rr=function(t){return D(t)&&Xt(t.length)&&!!tr[M(t)]};var er=function(t){return function(r){return t(r)}},nr=l((function(t,r){var e=r&&!r.nodeType&&r,n=e&&t&&!t.nodeType&&t,o=n&&n.exports===e&&v.process,i=function(){try{var t=n&&n.require&&n.require("util").types;return t||o&&o.binding&&o.binding("util")}catch(t){}}();t.exports=i})),or=nr&&nr.isTypedArray,ir=or?er(or):rr,ar=Object.prototype.hasOwnProperty;var ur=function(t,r){var e=d(t),n=!e&&Jt(t),o=!e&&!n&&Zt(t),i=!e&&!n&&!o&&ir(t),a=e||n||o||i,u=a?Ut(t.length,String):[],c=u.length;for(var s in t)!r&&!ar.call(t,s)||a&&("length"==s||o&&("offset"==s||"parent"==s)||i&&("buffer"==s||"byteLength"==s||"byteOffset"==s)||Kt(s,c))||u.push(s);return u},cr=Object.prototype;var sr=function(t){var r=t&&t.constructor;return t===("function"==typeof r&&r.prototype||cr)};var fr=function(t,r){return function(e){return t(r(e))}}(Object.keys,Object),lr=Object.prototype.hasOwnProperty;var hr=function(t){if(!sr(t))return fr(t);var r=[];for(var e in Object(t))lr.call(t,e)&&"constructor"!=e&&r.push(e);return r};var pr=function(t){return null!=t&&Xt(t.length)&&!N(t)};var dr=function(t){return pr(t)?ur(t):hr(t)};var vr=function(t,r){return function(e,n){if(null==e)return e;if(!pr(e))return t(e,n);for(var o=e.length,i=r?o:-1,a=Object(e);(r?i--:++i<o)&&!1!==n(a[i],i,a););return e}}((function(t,r){return t&&Ht(t,r,dr)}));var yr=function(t){return t};var gr=function(t){return"function"==typeof t?t:yr};var br=function(t,r){return(d(t)?Ct:vr)(t,gr(r))};function mr(t){return"[object String]"===Object.prototype.toString.call(t)}function _r(t){return!(!mr(t)||""===t)}function wr(t){var r=!1;return _r(t)?r=!isNaN(Number(t)):function(t){return"[object Number]"===Object.prototype.toString.call(t)}(t)&&(r=!0),r}function jr(t){return"[object Array]"===Object.prototype.toString.call(t)}function $r(t){return"[object Object]"===Object.prototype.toString.call(t)}function Or(t){return!!function(t){return"[object Undefined]"===Object.prototype.toString.call(t)}(t)||(!!function(t){return"[object Null]"===Object.prototype.toString.call(t)}(t)||(!!function(t){if($r(t)){for(var r in t)return!1;return!0}return!1}(t)||(!!function(t){return!(!mr(t)||""!==t)}(t)||!!function(t){return!!jr(t)&&0===t.length}(t))))}function Sr(t){return!!jr(t)&&(0!==t.length&&(1!==t.length||!Or(t[0])))}function xr(t){if($r(t)){for(var r in t)return!0;return!1}return!1}var Mr=function(t){return!0===t||!1===t||D(t)&&"[object Boolean]"==M(t)};function Dr(t){return Mr(t)}var Lr=/\s/;var Tr=function(t){for(var r=t.length;r--&&Lr.test(t.charAt(r)););return r},Er=/^\s+/;var kr=function(t){return t?t.slice(0,Tr(t)+1).replace(Er,""):t},Ar=/^[-+]0x[0-9a-f]+$/i,Fr=/^0b[01]+$/i,Nr=/^0o[0-7]+$/i,Pr=parseInt;var Yr=function(t){if("number"==typeof t)return t;if(L(t))return NaN;if(A(t)){var r="function"==typeof t.valueOf?t.valueOf():t;t=A(r)?r+"":r}if("string"!=typeof t)return 0===t?t:+t;t=kr(t);var e=Fr.test(t);return e||Nr.test(t)?Pr(t.slice(2),e?2:8):Ar.test(t)?NaN:+t},Ir=1/0;var zr=function(t){return t?(t=Yr(t))===Ir||t===-1/0?17976931348623157e292*(t<0?-1:1):t==t?t:0:0===t?t:0};function Cr(t){return wr(t)?zr(t):0}var Hr=l((function(t,r){t.exports=function(){var t=1e3,r=6e4,e=36e5,n="millisecond",o="second",i="minute",a="hour",u="day",c="week",f="month",l="quarter",h="year",p="date",d="Invalid Date",v=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,g={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},b=function(t,r,e){var n=String(t);return!n||n.length>=r?t:""+Array(r+1-n.length).join(e)+t},m={s:b,z:function(t){var r=-t.utcOffset(),e=Math.abs(r),n=Math.floor(e/60),o=e%60;return(r<=0?"+":"-")+b(n,2,"0")+":"+b(o,2,"0")},m:function t(r,e){if(r.date()<e.date())return-t(e,r);var n=12*(e.year()-r.year())+(e.month()-r.month()),o=r.clone().add(n,f),i=e-o<0,a=r.clone().add(n+(i?-1:1),f);return+(-(n+(e-o)/(i?o-a:a-o))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:f,y:h,w:c,d:u,D:p,h:a,m:i,s:o,ms:n,Q:l}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},_="en",w={};w[_]=g;var j=function(t){return t instanceof x},$=function t(r,e,n){var o;if(!r)return _;if("string"==typeof r){var i=r.toLowerCase();w[i]&&(o=i),e&&(w[i]=e,o=i);var a=r.split("-");if(!o&&a.length>1)return t(a[0])}else{var u=r.name;w[u]=r,o=u}return!n&&o&&(_=o),o||!n&&_},O=function(t,r){if(j(t))return t.clone();var e="object"==s(r)?r:{};return e.date=t,e.args=arguments,new x(e)},S=m;S.l=$,S.i=j,S.w=function(t,r){return O(t,{locale:r.$L,utc:r.$u,x:r.$x,$offset:r.$offset})};var x=function(){function s(t){this.$L=$(t.locale,null,!0),this.parse(t)}var g=s.prototype;return g.parse=function(t){this.$d=function(t){var r=t.date,e=t.utc;if(null===r)return new Date(NaN);if(S.u(r))return new Date;if(r instanceof Date)return new Date(r);if("string"==typeof r&&!/Z$/i.test(r)){var n=r.match(v);if(n){var o=n[2]-1||0,i=(n[7]||"0").substring(0,3);return e?new Date(Date.UTC(n[1],o,n[3]||1,n[4]||0,n[5]||0,n[6]||0,i)):new Date(n[1],o,n[3]||1,n[4]||0,n[5]||0,n[6]||0,i)}}return new Date(r)}(t),this.$x=t.x||{},this.init()},g.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},g.$utils=function(){return S},g.isValid=function(){return!(this.$d.toString()===d)},g.isSame=function(t,r){var e=O(t);return this.startOf(r)<=e&&e<=this.endOf(r)},g.isAfter=function(t,r){return O(t)<this.startOf(r)},g.isBefore=function(t,r){return this.endOf(r)<O(t)},g.$g=function(t,r,e){return S.u(t)?this[r]:this.set(e,t)},g.unix=function(){return Math.floor(this.valueOf()/1e3)},g.valueOf=function(){return this.$d.getTime()},g.startOf=function(t,r){var e=this,n=!!S.u(r)||r,s=S.p(t),l=function(t,r){var o=S.w(e.$u?Date.UTC(e.$y,r,t):new Date(e.$y,r,t),e);return n?o:o.endOf(u)},d=function(t,r){return S.w(e.toDate()[t].apply(e.toDate("s"),(n?[0,0,0,0]:[23,59,59,999]).slice(r)),e)},v=this.$W,y=this.$M,g=this.$D,b="set"+(this.$u?"UTC":"");switch(s){case h:return n?l(1,0):l(31,11);case f:return n?l(1,y):l(0,y+1);case c:var m=this.$locale().weekStart||0,_=(v<m?v+7:v)-m;return l(n?g-_:g+(6-_),y);case u:case p:return d(b+"Hours",0);case a:return d(b+"Minutes",1);case i:return d(b+"Seconds",2);case o:return d(b+"Milliseconds",3);default:return this.clone()}},g.endOf=function(t){return this.startOf(t,!1)},g.$set=function(t,r){var e,c=S.p(t),s="set"+(this.$u?"UTC":""),l=(e={},e[u]=s+"Date",e[p]=s+"Date",e[f]=s+"Month",e[h]=s+"FullYear",e[a]=s+"Hours",e[i]=s+"Minutes",e[o]=s+"Seconds",e[n]=s+"Milliseconds",e)[c],d=c===u?this.$D+(r-this.$W):r;if(c===f||c===h){var v=this.clone().set(p,1);v.$d[l](d),v.init(),this.$d=v.set(p,Math.min(this.$D,v.daysInMonth())).$d}else l&&this.$d[l](d);return this.init(),this},g.set=function(t,r){return this.clone().$set(t,r)},g.get=function(t){return this[S.p(t)]()},g.add=function(n,s){var l,p=this;n=Number(n);var d=S.p(s),v=function(t){var r=O(p);return S.w(r.date(r.date()+Math.round(t*n)),p)};if(d===f)return this.set(f,this.$M+n);if(d===h)return this.set(h,this.$y+n);if(d===u)return v(1);if(d===c)return v(7);var y=(l={},l[i]=r,l[a]=e,l[o]=t,l)[d]||1,g=this.$d.getTime()+n*y;return S.w(g,this)},g.subtract=function(t,r){return this.add(-1*t,r)},g.format=function(t){var r=this,e=this.$locale();if(!this.isValid())return e.invalidDate||d;var n=t||"YYYY-MM-DDTHH:mm:ssZ",o=S.z(this),i=this.$H,a=this.$m,u=this.$M,c=e.weekdays,s=e.months,f=function(t,e,o,i){return t&&(t[e]||t(r,n))||o[e].substr(0,i)},l=function(t){return S.s(i%12||12,t,"0")},h=e.meridiem||function(t,r,e){var n=t<12?"AM":"PM";return e?n.toLowerCase():n},p={YY:String(this.$y).slice(-2),YYYY:this.$y,M:u+1,MM:S.s(u+1,2,"0"),MMM:f(e.monthsShort,u,s,3),MMMM:f(s,u),D:this.$D,DD:S.s(this.$D,2,"0"),d:String(this.$W),dd:f(e.weekdaysMin,this.$W,c,2),ddd:f(e.weekdaysShort,this.$W,c,3),dddd:c[this.$W],H:String(i),HH:S.s(i,2,"0"),h:l(1),hh:l(2),a:h(i,a,!0),A:h(i,a,!1),m:String(a),mm:S.s(a,2,"0"),s:String(this.$s),ss:S.s(this.$s,2,"0"),SSS:S.s(this.$ms,3,"0"),Z:o};return n.replace(y,(function(t,r){return r||p[t]||o.replace(":","")}))},g.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},g.diff=function(n,s,p){var d,v=S.p(s),y=O(n),g=(y.utcOffset()-this.utcOffset())*r,b=this-y,m=S.m(this,y);return m=(d={},d[h]=m/12,d[f]=m,d[l]=m/3,d[c]=(b-g)/6048e5,d[u]=(b-g)/864e5,d[a]=b/e,d[i]=b/r,d[o]=b/t,d)[v]||b,p?m:S.a(m)},g.daysInMonth=function(){return this.endOf(f).$D},g.$locale=function(){return w[this.$L]},g.locale=function(t,r){if(!t)return this.$L;var e=this.clone(),n=$(t,r,!0);return n&&(e.$L=n),e},g.clone=function(){return S.w(this.$d,this)},g.toDate=function(){return new Date(this.valueOf())},g.toJSON=function(){return this.isValid()?this.toISOString():null},g.toISOString=function(){return this.$d.toISOString()},g.toString=function(){return this.$d.toUTCString()},s}(),M=x.prototype;return O.prototype=M,[["$ms",n],["$s",o],["$m",i],["$H",a],["$W",u],["$M",f],["$y",h],["$D",p]].forEach((function(t){M[t[1]]=function(r){return this.$g(r,t[0],t[1])}})),O.extend=function(t,r){return t.$i||(t(r,x,O),t.$i=!0),O},O.locale=$,O.isDayjs=j,O.unix=function(t){return O(1e3*t)},O.en=w[_],O.Ls=w,O.p={},O}()}));function Ur(){return Hr().format("YYYYMMDDHHmmss")}var Wr=function(t){var r=zr(t),e=r%1;return r==r?e?r-e:r:0};var Gr=function(t){return"number"==typeof t&&t==Wr(t)};var qr=g.isFinite,Br=Math.min;var Rr=function(t){var r=Math[t];return function(t,e){if(t=Yr(t),(e=null==e?0:Br(Wr(e),292))&&qr(t)){var n=(Nt(t)+"e").split("e"),o=r(n[0]+"e"+(+n[1]+e));return+((n=(Nt(o)+"e").split("e"))[0]+"e"+(+n[1]-e))}return r(t)}}("round");function Jr(t){if(!wr(t))return 0;t=Cr(t);var r=Rr(t);return"0"===String(r)?0:r}function Vr(t){return!!function(t){return!!wr(t)&&(t=Cr(t),Gr(t))}(t)&&Jr(t)>0}var Zr="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),Qr=Zr.length;function Kr(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:32,r=[];t=Vr(t)?Jr(t):32;for(var e=0;e<t;e++)r[e]=Zr[0|Math.random()*Qr];var n=r.join("");return n}var Xr=o.default.readFileSync("./node_modules/highcharts/highcharts.js","utf8"),te=o.default.readFileSync("./node_modules/highcharts/modules/stock.js","utf8"),re=o.default.readFileSync("./node_modules/highcharts/modules/heatmap.js","utf8"),ee=o.default.readFileSync("./node_modules/highcharts/modules/annotations.js","utf8"),ne=o.default.readFileSync("./node_modules/highcharts/modules/boost.js","utf8"),oe=o.default.readFileSync("./node_modules/highcharts/modules/boost-canvas.js","utf8"),ie=process.cwd();function ae(){return ae=c(p.mark((function t(){var r,e,n,u,c,s,f,l,h,d,v,y,g,b,m,_,w,j,$,O,S,x,M=arguments;return p.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(r=M.length>0&&void 0!==M[0]?M[0]:700,e=M.length>1&&void 0!==M[1]?M[1]:400,n=M.length>2&&void 0!==M[2]?M[2]:3,u=M.length>3&&void 0!==M[3]?M[3]:{},c=M.length>4&&void 0!==M[4]?M[4]:{},wr(r)){t.next=7;break}return t.abrupt("return",Promise.reject("width is not a number"));case 7:if(!((r=Cr(r))<=0)){t.next=10;break}return t.abrupt("return",Promise.reject("width <= 0"));case 10:if(wr(e)){t.next=12;break}return t.abrupt("return",Promise.reject("height is not a number"));case 12:if(!((e=Cr(e))<=0)){t.next=15;break}return t.abrupt("return",Promise.reject("height <= 0"));case 15:if(wr(n)){t.next=17;break}return t.abrupt("return",Promise.reject("scale is not a number"));case 17:if(!((n=Cr(n))<=0)){t.next=20;break}return t.abrupt("return",Promise.reject("scale <= 0"));case 20:if(xr(u)||_r(u)){t.next=22;break}return t.abrupt("return",Promise.reject("opt is not an effective object or string"));case 22:return Sr(s=zt(c,"addScripts"))||(s=[]),Sr(f=zt(c,"addCode"))||(f=""),Dr(l=zt(c,"useWindowOpt"))||(l=!1),h="let _opt=",d="",l&&(h="",d="let _opt=window.opt;"),v=u,xr(u)&&(v=JSON.stringify(u)),y="./whpic-".concat(Ur(),"-").concat(Kr(),".png"),g=i.default.resolve(ie,y),b="./whweb-".concat(Ur(),"-").concat(Kr(),".html"),m=i.default.resolve(ie,b),_="",br(s,(function(t){var r='<script src="'.concat(t,'"><\/script>');_+=r})),w=(w=(w=(w=(w=(w=(w=(w=(w=(w=(w=(w=(w=(w='\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>highcharts to png</title>\n\n  <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"><\/script>\n\n  <script>{code_highcharts}<\/script>\n  <script>{code_stock}<\/script>\n  <script>{code_heatmap}<\/script>\n  <script>{code_annotations}<\/script>\n  <script>{code_boost}<\/script>\n  <script>{code_boost_canvas}<\/script>\n\n  {add_scripts}\n\n  <script>{add_code}<\/script>\n\n</head>\n<body style="padding:0; margin:0;">\n\n    <div id="hc" style="width:{width}px; height:{height}px;"></div>\n\n    <script>\n\n        {cLetOptStart}{cOpt}\n        {cLetOptEnd}\n\n        //opt若為物件時, 強制關閉動畫避免過慢顯示無法截到數據圖\n        _.set(_opt, \'chart.animation\', false)\n        _.set(_opt, \'plotOptions.series.animation\', false)\n        // console.log(\'_opt\', _opt)\n    \n        Highcharts.chart(\'hc\', _opt)\n\n    <\/script>\n\n</body>\n</html>\n').replace("{width}",r)).replace("{height}",e)).replace("{cLetOptStart}",h)).replace("{cLetOptEnd}",d)).replace("{cOpt}",v)).replace("{code_highcharts}",Xr)).replace("{code_stock}",te)).replace("{code_heatmap}",re)).replace("{code_annotations}",ee)).replace("{code_boost}",ne)).replace("{code_boost_canvas}",oe)).replace("{add_scripts}",_)).replace("{add_code}",f),o.default.writeFileSync(m,w,"utf8"),j={headless:!0,slowMo:20},t.next=57,a.default.launch(j);case 57:return $=t.sent,t.next=60,$.newPage();case 60:return O=t.sent,S={x:0,y:0,width:Number(r),height:Number(e),deviceScaleFactor:Number(n)},t.next=64,O.goto(m);case 64:return t.next=66,O.setViewport(S);case 66:return t.next=68,O.screenshot({path:g});case 68:return t.next=70,$.close();case 70:return o.default.unlinkSync(m),x=o.default.readFileSync(g,{encoding:"base64"}),o.default.unlinkSync(g),t.abrupt("return",x);case 74:case"end":return t.stop()}}),t)}))),ae.apply(this,arguments)}return function(){return ae.apply(this,arguments)}}));
//# sourceMappingURL=w-hc-2-png.umd.js.map
