/*!
 * w-hc-2-png v1.0.2
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("fs"),require("path"),require("puppeteer")):"function"==typeof define&&define.amd?define(["fs","path","puppeteer"],e):(t="undefined"!=typeof globalThis?globalThis:t||self)["w-hc-2-png"]=e(t.fs,t.path,t.puppeteer)}(this,(function(t,e,r){"use strict";function n(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var i=n(t),o=n(e),a=n(r);function u(t,e,r,n,i,o,a){try{var u=t[o](a),c=u.value}catch(t){return void r(t)}u.done?e(c):Promise.resolve(c).then(n,i)}function c(t){return function(){var e=this,r=arguments;return new Promise((function(n,i){var o=t.apply(e,r);function a(t){u(o,n,i,a,c,"next",t)}function c(t){u(o,n,i,a,c,"throw",t)}a(void 0)}))}}function s(t){return(s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}var f="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function h(t){var e={exports:{}};return t(e,e.exports),e.exports}var l=h((function(t){var e=function(t){var e,r=Object.prototype,n=r.hasOwnProperty,i="function"==typeof Symbol?Symbol:{},o=i.iterator||"@@iterator",a=i.asyncIterator||"@@asyncIterator",u=i.toStringTag||"@@toStringTag";function c(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{c({},"")}catch(t){c=function(t,e,r){return t[e]=r}}function f(t,e,r,n){var i=e&&e.prototype instanceof g?e:g,o=Object.create(i.prototype),a=new L(n||[]);return o._invoke=function(t,e,r){var n=l;return function(i,o){if(n===p)throw new Error("Generator is already running");if(n===v){if("throw"===i)throw o;return E()}for(r.method=i,r.arg=o;;){var a=r.delegate;if(a){var u=j(a,r);if(u){if(u===y)continue;return u}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(n===l)throw n=v,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n=p;var c=h(t,e,r);if("normal"===c.type){if(n=r.done?v:d,c.arg===y)continue;return{value:c.arg,done:r.done}}"throw"===c.type&&(n=v,r.method="throw",r.arg=c.arg)}}}(t,r,a),o}function h(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}t.wrap=f;var l="suspendedStart",d="suspendedYield",p="executing",v="completed",y={};function g(){}function m(){}function _(){}var b={};b[o]=function(){return this};var w=Object.getPrototypeOf,$=w&&w(w(k([])));$&&$!==r&&n.call($,o)&&(b=$);var S=_.prototype=g.prototype=Object.create(b);function x(t){["next","throw","return"].forEach((function(e){c(t,e,(function(t){return this._invoke(e,t)}))}))}function O(t,e){function r(i,o,a,u){var c=h(t[i],t,o);if("throw"!==c.type){var f=c.arg,l=f.value;return l&&"object"===s(l)&&n.call(l,"__await")?e.resolve(l.__await).then((function(t){r("next",t,a,u)}),(function(t){r("throw",t,a,u)})):e.resolve(l).then((function(t){f.value=t,a(f)}),(function(t){return r("throw",t,a,u)}))}u(c.arg)}var i;this._invoke=function(t,n){function o(){return new e((function(e,i){r(t,n,e,i)}))}return i=i?i.then(o,o):o()}}function j(t,r){var n=t.iterator[r.method];if(n===e){if(r.delegate=null,"throw"===r.method){if(t.iterator.return&&(r.method="return",r.arg=e,j(t,r),"throw"===r.method))return y;r.method="throw",r.arg=new TypeError("The iterator does not provide a 'throw' method")}return y}var i=h(n,t.iterator,r.arg);if("throw"===i.type)return r.method="throw",r.arg=i.arg,r.delegate=null,y;var o=i.arg;return o?o.done?(r[t.resultName]=o.value,r.next=t.nextLoc,"return"!==r.method&&(r.method="next",r.arg=e),r.delegate=null,y):o:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,y)}function M(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function D(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function L(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(M,this),this.reset(!0)}function k(t){if(t){var r=t[o];if(r)return r.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var i=-1,a=function r(){for(;++i<t.length;)if(n.call(t,i))return r.value=t[i],r.done=!1,r;return r.value=e,r.done=!0,r};return a.next=a}}return{next:E}}function E(){return{value:e,done:!0}}return m.prototype=S.constructor=_,_.constructor=m,m.displayName=c(_,u,"GeneratorFunction"),t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===m||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,_):(t.__proto__=_,c(t,u,"GeneratorFunction")),t.prototype=Object.create(S),t},t.awrap=function(t){return{__await:t}},x(O.prototype),O.prototype[a]=function(){return this},t.AsyncIterator=O,t.async=function(e,r,n,i,o){void 0===o&&(o=Promise);var a=new O(f(e,r,n,i),o);return t.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},x(S),c(S,u,"Generator"),S[o]=function(){return this},S.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},t.values=k,L.prototype={constructor:L,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=e,this.done=!1,this.delegate=null,this.method="next",this.arg=e,this.tryEntries.forEach(D),!t)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=e)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var r=this;function i(n,i){return u.type="throw",u.arg=t,r.next=n,i&&(r.method="next",r.arg=e),!!i}for(var o=this.tryEntries.length-1;o>=0;--o){var a=this.tryEntries[o],u=a.completion;if("root"===a.tryLoc)return i("end");if(a.tryLoc<=this.prev){var c=n.call(a,"catchLoc"),s=n.call(a,"finallyLoc");if(c&&s){if(this.prev<a.catchLoc)return i(a.catchLoc,!0);if(this.prev<a.finallyLoc)return i(a.finallyLoc)}else if(c){if(this.prev<a.catchLoc)return i(a.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return i(a.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var i=this.tryEntries[r];if(i.tryLoc<=this.prev&&n.call(i,"finallyLoc")&&this.prev<i.finallyLoc){var o=i;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=t,a.arg=e,o?(this.method="next",this.next=o.finallyLoc,y):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),y},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),D(r),y}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var i=n.arg;D(r)}return i}}throw new Error("illegal catch attempt")},delegateYield:function(t,r,n){return this.delegate={iterator:k(t),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=e),y}},t}(t.exports);try{regeneratorRuntime=e}catch(t){Function("r","regeneratorRuntime = r")(e)}})),d="object"==s(f)&&f&&f.Object===Object&&f,p="object"==("undefined"==typeof self?"undefined":s(self))&&self&&self.Object===Object&&self,v=d||p||Function("return this")(),y=v.Symbol,g=Object.prototype,m=g.hasOwnProperty,_=g.toString,b=y?y.toStringTag:void 0;var w=function(t){var e=m.call(t,b),r=t[b];try{t[b]=void 0;var n=!0}catch(t){}var i=_.call(t);return n&&(e?t[b]=r:delete t[b]),i},$=Object.prototype.toString;var S=function(t){return $.call(t)},x=y?y.toStringTag:void 0;var O=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":x&&x in Object(t)?w(t):S(t)};var j=function(t){var e=s(t);return null!=t&&("object"==e||"function"==e)};var M,D=function(t){if(!j(t))return!1;var e=O(t);return"[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e},L=v["__core-js_shared__"],k=(M=/[^.]+$/.exec(L&&L.keys&&L.keys.IE_PROTO||""))?"Symbol(src)_1."+M:"";var E=function(t){return!!k&&k in t},F=Function.prototype.toString;var P=function(t){if(null!=t){try{return F.call(t)}catch(t){}try{return t+""}catch(t){}}return""},T=/^\[object .+?Constructor\]$/,N=Function.prototype,Y=Object.prototype,A=N.toString,z=Y.hasOwnProperty,H=RegExp("^"+A.call(z).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var I=function(t){return!(!j(t)||E(t))&&(D(t)?H:T).test(P(t))};var C=function(t,e){return null==t?void 0:t[e]};var G=function(t,e){var r=C(t,e);return I(r)?r:void 0},W=function(){try{var t=G(Object,"defineProperty");return t({},"",{}),t}catch(t){}}();var U=function(t,e,r){"__proto__"==e&&W?W(t,e,{configurable:!0,enumerable:!0,value:r,writable:!0}):t[e]=r};var J=function(t,e){return t===e||t!=t&&e!=e},q=Object.prototype.hasOwnProperty;var R=function(t,e,r){var n=t[e];q.call(t,e)&&J(n,r)&&(void 0!==r||e in t)||U(t,e,r)},V=Array.isArray;var Z=function(t){return null!=t&&"object"==s(t)};var B=function(t){return"symbol"==s(t)||Z(t)&&"[object Symbol]"==O(t)},Q=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,K=/^\w*$/;var X=function(t,e){if(V(t))return!1;var r=s(t);return!("number"!=r&&"symbol"!=r&&"boolean"!=r&&null!=t&&!B(t))||(K.test(t)||!Q.test(t)||null!=e&&t in Object(e))},tt=G(Object,"create");var et=function(){this.__data__=tt?tt(null):{},this.size=0};var rt=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},nt=Object.prototype.hasOwnProperty;var it=function(t){var e=this.__data__;if(tt){var r=e[t];return"__lodash_hash_undefined__"===r?void 0:r}return nt.call(e,t)?e[t]:void 0},ot=Object.prototype.hasOwnProperty;var at=function(t){var e=this.__data__;return tt?void 0!==e[t]:ot.call(e,t)};var ut=function(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=tt&&void 0===e?"__lodash_hash_undefined__":e,this};function ct(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}ct.prototype.clear=et,ct.prototype.delete=rt,ct.prototype.get=it,ct.prototype.has=at,ct.prototype.set=ut;var st=ct;var ft=function(){this.__data__=[],this.size=0};var ht=function(t,e){for(var r=t.length;r--;)if(J(t[r][0],e))return r;return-1},lt=Array.prototype.splice;var dt=function(t){var e=this.__data__,r=ht(e,t);return!(r<0)&&(r==e.length-1?e.pop():lt.call(e,r,1),--this.size,!0)};var pt=function(t){var e=this.__data__,r=ht(e,t);return r<0?void 0:e[r][1]};var vt=function(t){return ht(this.__data__,t)>-1};var yt=function(t,e){var r=this.__data__,n=ht(r,t);return n<0?(++this.size,r.push([t,e])):r[n][1]=e,this};function gt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}gt.prototype.clear=ft,gt.prototype.delete=dt,gt.prototype.get=pt,gt.prototype.has=vt,gt.prototype.set=yt;var mt=gt,_t=G(v,"Map");var bt=function(){this.size=0,this.__data__={hash:new st,map:new(_t||mt),string:new st}};var wt=function(t){var e=s(t);return"string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t};var $t=function(t,e){var r=t.__data__;return wt(e)?r["string"==typeof e?"string":"hash"]:r.map};var St=function(t){var e=$t(this,t).delete(t);return this.size-=e?1:0,e};var xt=function(t){return $t(this,t).get(t)};var Ot=function(t){return $t(this,t).has(t)};var jt=function(t,e){var r=$t(this,t),n=r.size;return r.set(t,e),this.size+=r.size==n?0:1,this};function Mt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}Mt.prototype.clear=bt,Mt.prototype.delete=St,Mt.prototype.get=xt,Mt.prototype.has=Ot,Mt.prototype.set=jt;var Dt=Mt;function Lt(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError("Expected a function");var r=function r(){var n=arguments,i=e?e.apply(this,n):n[0],o=r.cache;if(o.has(i))return o.get(i);var a=t.apply(this,n);return r.cache=o.set(i,a)||o,a};return r.cache=new(Lt.Cache||Dt),r}Lt.Cache=Dt;var kt=Lt;var Et=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Ft=/\\(\\)?/g,Pt=function(t){var e=kt(t,(function(t){return 500===r.size&&r.clear(),t})),r=e.cache;return e}((function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(Et,(function(t,r,n,i){e.push(n?i.replace(Ft,"$1"):r||t)})),e}));var Tt=function(t,e){for(var r=-1,n=null==t?0:t.length,i=Array(n);++r<n;)i[r]=e(t[r],r,t);return i},Nt=y?y.prototype:void 0,Yt=Nt?Nt.toString:void 0;var At=function t(e){if("string"==typeof e)return e;if(V(e))return Tt(e,t)+"";if(B(e))return Yt?Yt.call(e):"";var r=e+"";return"0"==r&&1/e==-Infinity?"-0":r};var zt=function(t){return null==t?"":At(t)};var Ht=function(t,e){return V(t)?t:X(t,e)?[t]:Pt(zt(t))},It=/^(?:0|[1-9]\d*)$/;var Ct=function(t,e){var r=s(t);return!!(e=null==e?9007199254740991:e)&&("number"==r||"symbol"!=r&&It.test(t))&&t>-1&&t%1==0&&t<e};var Gt=function(t){if("string"==typeof t||B(t))return t;var e=t+"";return"0"==e&&1/t==-Infinity?"-0":e};var Wt=function(t,e,r,n){if(!j(t))return t;for(var i=-1,o=(e=Ht(e,t)).length,a=o-1,u=t;null!=u&&++i<o;){var c=Gt(e[i]),s=r;if("__proto__"===c||"constructor"===c||"prototype"===c)return t;if(i!=a){var f=u[c];void 0===(s=n?n(f,c,u):void 0)&&(s=j(f)?f:Ct(e[i+1])?[]:{})}R(u,c,s),u=u[c]}return t};var Ut=function(t,e,r){return null==t?t:Wt(t,e,r)};function Jt(t){return!(!function(t){return"[object String]"===Object.prototype.toString.call(t)}(t)||""===t)}function qt(t){var e=!1;return Jt(t)?e=!isNaN(Number(t)):function(t){return"[object Number]"===Object.prototype.toString.call(t)}(t)&&(e=!0),e}var Rt=/\s/;var Vt=function(t){for(var e=t.length;e--&&Rt.test(t.charAt(e)););return e},Zt=/^\s+/;var Bt=function(t){return t?t.slice(0,Vt(t)+1).replace(Zt,""):t},Qt=/^[-+]0x[0-9a-f]+$/i,Kt=/^0b[01]+$/i,Xt=/^0o[0-7]+$/i,te=parseInt;var ee=function(t){if("number"==typeof t)return t;if(B(t))return NaN;if(j(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=j(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=Bt(t);var r=Kt.test(t);return r||Xt.test(t)?te(t.slice(2),r?2:8):Qt.test(t)?NaN:+t},re=1/0;var ne=function(t){return t?(t=ee(t))===re||t===-1/0?17976931348623157e292*(t<0?-1:1):t==t?t:0:0===t?t:0};function ie(t){return qt(t)?ne(t):0}var oe=h((function(t,e){t.exports=function(){var t=1e3,e=6e4,r=36e5,n="millisecond",i="second",o="minute",a="hour",u="day",c="week",f="month",h="quarter",l="year",d="date",p="Invalid Date",v=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,g={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},m=function(t,e,r){var n=String(t);return!n||n.length>=e?t:""+Array(e+1-n.length).join(r)+t},_={s:m,z:function(t){var e=-t.utcOffset(),r=Math.abs(e),n=Math.floor(r/60),i=r%60;return(e<=0?"+":"-")+m(n,2,"0")+":"+m(i,2,"0")},m:function t(e,r){if(e.date()<r.date())return-t(r,e);var n=12*(r.year()-e.year())+(r.month()-e.month()),i=e.clone().add(n,f),o=r-i<0,a=e.clone().add(n+(o?-1:1),f);return+(-(n+(r-i)/(o?i-a:a-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:f,y:l,w:c,d:u,D:d,h:a,m:o,s:i,ms:n,Q:h}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},b="en",w={};w[b]=g;var $=function(t){return t instanceof j},S=function(t,e,r){var n;if(!t)return b;if("string"==typeof t)w[t]&&(n=t),e&&(w[t]=e,n=t);else{var i=t.name;w[i]=t,n=i}return!r&&n&&(b=n),n||!r&&b},x=function(t,e){if($(t))return t.clone();var r="object"==s(e)?e:{};return r.date=t,r.args=arguments,new j(r)},O=_;O.l=S,O.i=$,O.w=function(t,e){return x(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var j=function(){function s(t){this.$L=S(t.locale,null,!0),this.parse(t)}var g=s.prototype;return g.parse=function(t){this.$d=function(t){var e=t.date,r=t.utc;if(null===e)return new Date(NaN);if(O.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var n=e.match(v);if(n){var i=n[2]-1||0,o=(n[7]||"0").substring(0,3);return r?new Date(Date.UTC(n[1],i,n[3]||1,n[4]||0,n[5]||0,n[6]||0,o)):new Date(n[1],i,n[3]||1,n[4]||0,n[5]||0,n[6]||0,o)}}return new Date(e)}(t),this.$x=t.x||{},this.init()},g.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},g.$utils=function(){return O},g.isValid=function(){return!(this.$d.toString()===p)},g.isSame=function(t,e){var r=x(t);return this.startOf(e)<=r&&r<=this.endOf(e)},g.isAfter=function(t,e){return x(t)<this.startOf(e)},g.isBefore=function(t,e){return this.endOf(e)<x(t)},g.$g=function(t,e,r){return O.u(t)?this[e]:this.set(r,t)},g.unix=function(){return Math.floor(this.valueOf()/1e3)},g.valueOf=function(){return this.$d.getTime()},g.startOf=function(t,e){var r=this,n=!!O.u(e)||e,s=O.p(t),h=function(t,e){var i=O.w(r.$u?Date.UTC(r.$y,e,t):new Date(r.$y,e,t),r);return n?i:i.endOf(u)},p=function(t,e){return O.w(r.toDate()[t].apply(r.toDate("s"),(n?[0,0,0,0]:[23,59,59,999]).slice(e)),r)},v=this.$W,y=this.$M,g=this.$D,m="set"+(this.$u?"UTC":"");switch(s){case l:return n?h(1,0):h(31,11);case f:return n?h(1,y):h(0,y+1);case c:var _=this.$locale().weekStart||0,b=(v<_?v+7:v)-_;return h(n?g-b:g+(6-b),y);case u:case d:return p(m+"Hours",0);case a:return p(m+"Minutes",1);case o:return p(m+"Seconds",2);case i:return p(m+"Milliseconds",3);default:return this.clone()}},g.endOf=function(t){return this.startOf(t,!1)},g.$set=function(t,e){var r,c=O.p(t),s="set"+(this.$u?"UTC":""),h=(r={},r[u]=s+"Date",r[d]=s+"Date",r[f]=s+"Month",r[l]=s+"FullYear",r[a]=s+"Hours",r[o]=s+"Minutes",r[i]=s+"Seconds",r[n]=s+"Milliseconds",r)[c],p=c===u?this.$D+(e-this.$W):e;if(c===f||c===l){var v=this.clone().set(d,1);v.$d[h](p),v.init(),this.$d=v.set(d,Math.min(this.$D,v.daysInMonth())).$d}else h&&this.$d[h](p);return this.init(),this},g.set=function(t,e){return this.clone().$set(t,e)},g.get=function(t){return this[O.p(t)]()},g.add=function(n,s){var h,d=this;n=Number(n);var p=O.p(s),v=function(t){var e=x(d);return O.w(e.date(e.date()+Math.round(t*n)),d)};if(p===f)return this.set(f,this.$M+n);if(p===l)return this.set(l,this.$y+n);if(p===u)return v(1);if(p===c)return v(7);var y=(h={},h[o]=e,h[a]=r,h[i]=t,h)[p]||1,g=this.$d.getTime()+n*y;return O.w(g,this)},g.subtract=function(t,e){return this.add(-1*t,e)},g.format=function(t){var e=this,r=this.$locale();if(!this.isValid())return r.invalidDate||p;var n=t||"YYYY-MM-DDTHH:mm:ssZ",i=O.z(this),o=this.$H,a=this.$m,u=this.$M,c=r.weekdays,s=r.months,f=function(t,r,i,o){return t&&(t[r]||t(e,n))||i[r].substr(0,o)},h=function(t){return O.s(o%12||12,t,"0")},l=r.meridiem||function(t,e,r){var n=t<12?"AM":"PM";return r?n.toLowerCase():n},d={YY:String(this.$y).slice(-2),YYYY:this.$y,M:u+1,MM:O.s(u+1,2,"0"),MMM:f(r.monthsShort,u,s,3),MMMM:f(s,u),D:this.$D,DD:O.s(this.$D,2,"0"),d:String(this.$W),dd:f(r.weekdaysMin,this.$W,c,2),ddd:f(r.weekdaysShort,this.$W,c,3),dddd:c[this.$W],H:String(o),HH:O.s(o,2,"0"),h:h(1),hh:h(2),a:l(o,a,!0),A:l(o,a,!1),m:String(a),mm:O.s(a,2,"0"),s:String(this.$s),ss:O.s(this.$s,2,"0"),SSS:O.s(this.$ms,3,"0"),Z:i};return n.replace(y,(function(t,e){return e||d[t]||i.replace(":","")}))},g.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},g.diff=function(n,s,d){var p,v=O.p(s),y=x(n),g=(y.utcOffset()-this.utcOffset())*e,m=this-y,_=O.m(this,y);return _=(p={},p[l]=_/12,p[f]=_,p[h]=_/3,p[c]=(m-g)/6048e5,p[u]=(m-g)/864e5,p[a]=m/r,p[o]=m/e,p[i]=m/t,p)[v]||m,d?_:O.a(_)},g.daysInMonth=function(){return this.endOf(f).$D},g.$locale=function(){return w[this.$L]},g.locale=function(t,e){if(!t)return this.$L;var r=this.clone(),n=S(t,e,!0);return n&&(r.$L=n),r},g.clone=function(){return O.w(this.$d,this)},g.toDate=function(){return new Date(this.valueOf())},g.toJSON=function(){return this.isValid()?this.toISOString():null},g.toISOString=function(){return this.$d.toISOString()},g.toString=function(){return this.$d.toUTCString()},s}(),M=j.prototype;return x.prototype=M,[["$ms",n],["$s",i],["$m",o],["$H",a],["$W",u],["$M",f],["$y",l],["$D",d]].forEach((function(t){M[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),x.extend=function(t,e){return t.$i||(t(e,j,x),t.$i=!0),x},x.locale=S,x.isDayjs=$,x.unix=function(t){return x(1e3*t)},x.en=w[b],x.Ls=w,x.p={},x}()}));function ae(){return oe().format("YYYYMMDDHHmmss")}var ue=function(t){var e=ne(t),r=e%1;return e==e?r?e-r:e:0};var ce=function(t){return"number"==typeof t&&t==ue(t)};var se=v.isFinite,fe=Math.min;var he=function(t){var e=Math[t];return function(t,r){if(t=ee(t),(r=null==r?0:fe(ue(r),292))&&se(t)){var n=(zt(t)+"e").split("e"),i=e(n[0]+"e"+(+n[1]+r));return+((n=(zt(i)+"e").split("e"))[0]+"e"+(+n[1]-r))}return e(t)}}("round");function le(t){if(!qt(t))return 0;t=ie(t);var e=he(t);return"0"===String(e)?0:e}function de(t){return!!function(t){return!!qt(t)&&(t=ie(t),ce(t))}(t)&&le(t)>0}var pe="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),ve=pe.length;function ye(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:32,e=[];t=de(t)?le(t):32;for(var r=0;r<t;r++)e[r]=pe[0|Math.random()*ve];var n=e.join("");return n}function ge(t){if(function(t){return!!i.default.existsSync(t)&&!i.default.lstatSync(t).isFile()&&!i.default.lstatSync(t).isSymbolicLink()}(t))return{success:"input folder is already exists: "+t};if(i.default.existsSync(t))return{error:"input path already exists: "+t};try{i.default.mkdirSync(t,{recursive:!0})}catch(t){return{error:t}}return{success:"done: "+t}}!function t(e,r){try{i.default.readdirSync(e).forEach((function(n){var a=e+"/"+n,u=r+"/"+n,c=i.default.lstatSync(a);if(c.isDirectory())ge(o.default.dirname(u)),t(a,u);else if(c.isSymbolicLink()){var s=i.default.readlinkSync(a);i.default.symlinkSync(s,u)}else ge(o.default.dirname(u)),i.default.copyFileSync(a,u)}))}catch(t){return{error:t}}return{success:"done: "+r}}("./node_modules/puppeteer/.local-chromium","./chromium");var me=i.default.readFileSync("./node_modules/highcharts/highcharts.js","utf8"),_e=i.default.readFileSync("./node_modules/highcharts/modules/stock.js","utf8"),be=i.default.readFileSync("./node_modules/highcharts/modules/heatmap.js","utf8"),we=i.default.readFileSync("./node_modules/highcharts/modules/annotations.js","utf8"),$e=i.default.readFileSync("./node_modules/highcharts/modules/boost.js","utf8"),Se=i.default.readFileSync("./node_modules/highcharts/modules/boost-canvas.js","utf8");function xe(){return(xe=c(l.mark((function t(){var e,r,n,u,c,s,f,h,d,p,v,y,g,m,_,b,w,$,S=arguments;return l.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(e=S.length>0&&void 0!==S[0]?S[0]:700,r=S.length>1&&void 0!==S[1]?S[1]:400,n=S.length>2&&void 0!==S[2]?S[2]:3,u=S.length>3&&void 0!==S[3]?S[3]:{},qt(e)){t.next=6;break}return t.abrupt("return",Promise.reject("width is not number"));case 6:if(!((e=ie(e))<=0)){t.next=9;break}return t.abrupt("return",Promise.reject("width <= 0"));case 9:if(qt(r)){t.next=11;break}return t.abrupt("return",Promise.reject("height is not number"));case 11:if(!((r=ie(r))<=0)){t.next=14;break}return t.abrupt("return",Promise.reject("height <= 0"));case 14:if(qt(n)){t.next=16;break}return t.abrupt("return",Promise.reject("scale is not number"));case 16:if(!((n=ie(n))<=0)){t.next=19;break}return t.abrupt("return",Promise.reject("scale <= 0"));case 19:return Ut(u,"chart.animation",!1),Ut(u,"plotOptions.series.animation",!1),c="".concat(ae(),"-").concat(ye(),".png"),s=a.default.executablePath(),f=s.split(".local-chromium"),h=o.default.resolve()+o.default.sep+"chromium"+f[1],d=JSON.stringify(u),p="./hc2png.html",v=(v=(v=(v=(v=(v=(v=(v=(v=(v='\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>highcharts to png</title>\n\n  <script>{code_highcharts}<\/script>\n  <script>{code_stock}<\/script>\n  <script>{code_heatmap}<\/script>\n  <script>{code_annotations}<\/script>\n  <script>{code_boost}<\/script>\n  <script>{code_boost_canvas}<\/script>\n\n</head>\n<body style="padding:0; margin:0;">\n\n  <div id="hc" style="width:{width}px; height:{height}px;"></div>\n\n  <script>\n      \n      let opt={opt}\n\n      let chart = Highcharts.chart(\'hc\', opt)\n\n  <\/script>\n\n</body>\n</html>\n').replace("{opt}",d)).replace("{width}",e)).replace("{height}",r)).replace("{code_highcharts}",me)).replace("{code_stock}",_e)).replace("{code_heatmap}",be)).replace("{code_annotations}",we)).replace("{code_boost}",$e)).replace("{code_boost_canvas}",Se),i.default.writeFileSync(p,v,"utf8"),y=process.cwd()+"\\",g=y+p,m={executablePath:h,headless:!0,slowMo:20},t.next=43,a.default.launch(m);case 43:return _=t.sent,t.next=46,_.newPage();case 46:return b=t.sent,w={x:0,y:0,width:Number(e),height:Number(r),deviceScaleFactor:Number(n)},t.next=50,b.goto(g);case 50:return t.next=52,b.setViewport(w);case 52:return t.next=54,b.screenshot({path:c});case 54:return t.next=56,_.close();case 56:return i.default.unlinkSync(p),$=i.default.readFileSync(c,{encoding:"base64"}),i.default.unlinkSync(c),t.abrupt("return",$);case 60:case"end":return t.stop()}}),t)})))).apply(this,arguments)}return function(){return xe.apply(this,arguments)}}));
//# sourceMappingURL=w-hc-2-png.umd.js.map
