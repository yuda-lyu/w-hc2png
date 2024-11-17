/*!
 * w-hc-2-png v1.0.29
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("fs"),require("path"),require("puppeteer")):"function"==typeof define&&define.amd?define(["fs","path","puppeteer"],e):(t="undefined"!=typeof globalThis?globalThis:t||self)["w-hc-2-png"]=e(t.fs,t.path,t.puppeteer)}(this,(function(t,e,r){"use strict";var n=Array.isArray,i="object"==typeof global&&global&&global.Object===Object&&global,o="object"==typeof self&&self&&self.Object===Object&&self,u=i||o||Function("return this")(),a=u.Symbol,c=Object.prototype,s=c.hasOwnProperty,f=c.toString,l=a?a.toStringTag:void 0;var h=Object.prototype.toString;var d="[object Null]",p="[object Undefined]",v=a?a.toStringTag:void 0;function y(t){return null==t?void 0===t?p:d:v&&v in Object(t)?function(t){var e=s.call(t,l),r=t[l];try{t[l]=void 0;var n=!0}catch(t){}var i=f.call(t);return n&&(e?t[l]=r:delete t[l]),i}(t):function(t){return h.call(t)}(t)}function b(t){return null!=t&&"object"==typeof t}var g="[object Symbol]";function _(t){return"symbol"==typeof t||b(t)&&y(t)==g}var m=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,j=/^\w*$/;function w(t,e){if(n(t))return!1;var r=typeof t;return!("number"!=r&&"symbol"!=r&&"boolean"!=r&&null!=t&&!_(t))||(j.test(t)||!m.test(t)||null!=e&&t in Object(e))}function $(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}var O="[object AsyncFunction]",S="[object Function]",M="[object GeneratorFunction]",x="[object Proxy]";function D(t){if(!$(t))return!1;var e=y(t);return e==S||e==M||e==O||e==x}var P,A=u["__core-js_shared__"],F=(P=/[^.]+$/.exec(A&&A.keys&&A.keys.IE_PROTO||""))?"Symbol(src)_1."+P:"";var k=Function.prototype.toString;function z(t){if(null!=t){try{return k.call(t)}catch(t){}try{return t+""}catch(t){}}return""}var T=/^\[object .+?Constructor\]$/,H=Function.prototype,E=Object.prototype,N=H.toString,Y=E.hasOwnProperty,L=RegExp("^"+N.call(Y).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function J(t){return!(!$(t)||(e=t,F&&F in e))&&(D(t)?L:T).test(z(t));var e}function C(t,e){var r=function(t,e){return null==t?void 0:t[e]}(t,e);return J(r)?r:void 0}var I=C(Object,"create");var U=Object.prototype.hasOwnProperty;var W=Object.prototype.hasOwnProperty;function B(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}function V(t,e){return t===e||t!=t&&e!=e}function q(t,e){for(var r=t.length;r--;)if(V(t[r][0],e))return r;return-1}B.prototype.clear=function(){this.__data__=I?I(null):{},this.size=0},B.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},B.prototype.get=function(t){var e=this.__data__;if(I){var r=e[t];return"__lodash_hash_undefined__"===r?void 0:r}return U.call(e,t)?e[t]:void 0},B.prototype.has=function(t){var e=this.__data__;return I?void 0!==e[t]:W.call(e,t)},B.prototype.set=function(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=I&&void 0===e?"__lodash_hash_undefined__":e,this};var R=Array.prototype.splice;function Z(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}Z.prototype.clear=function(){this.__data__=[],this.size=0},Z.prototype.delete=function(t){var e=this.__data__,r=q(e,t);return!(r<0)&&(r==e.length-1?e.pop():R.call(e,r,1),--this.size,!0)},Z.prototype.get=function(t){var e=this.__data__,r=q(e,t);return r<0?void 0:e[r][1]},Z.prototype.has=function(t){return q(this.__data__,t)>-1},Z.prototype.set=function(t,e){var r=this.__data__,n=q(r,t);return n<0?(++this.size,r.push([t,e])):r[n][1]=e,this};var G=C(u,"Map");function Q(t,e){var r,n,i=t.__data__;return("string"==(n=typeof(r=e))||"number"==n||"symbol"==n||"boolean"==n?"__proto__"!==r:null===r)?i["string"==typeof e?"string":"hash"]:i.map}function K(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}K.prototype.clear=function(){this.size=0,this.__data__={hash:new B,map:new(G||Z),string:new B}},K.prototype.delete=function(t){var e=Q(this,t).delete(t);return this.size-=e?1:0,e},K.prototype.get=function(t){return Q(this,t).get(t)},K.prototype.has=function(t){return Q(this,t).has(t)},K.prototype.set=function(t,e){var r=Q(this,t),n=r.size;return r.set(t,e),this.size+=r.size==n?0:1,this};var X="Expected a function";function tt(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError(X);var r=function(){var n=arguments,i=e?e.apply(this,n):n[0],o=r.cache;if(o.has(i))return o.get(i);var u=t.apply(this,n);return r.cache=o.set(i,u)||o,u};return r.cache=new(tt.Cache||K),r}tt.Cache=K;var et,rt,nt,it=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,ot=/\\(\\)?/g,ut=(et=function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(it,(function(t,r,n,i){e.push(n?i.replace(ot,"$1"):r||t)})),e},rt=tt(et,(function(t){return 500===nt.size&&nt.clear(),t})),nt=rt.cache,rt),at=ut;var ct=1/0,st=a?a.prototype:void 0,ft=st?st.toString:void 0;function lt(t){if("string"==typeof t)return t;if(n(t))return function(t,e){for(var r=-1,n=null==t?0:t.length,i=Array(n);++r<n;)i[r]=e(t[r],r,t);return i}(t,lt)+"";if(_(t))return ft?ft.call(t):"";var e=t+"";return"0"==e&&1/t==-ct?"-0":e}function ht(t){return null==t?"":lt(t)}function dt(t,e){return n(t)?t:w(t,e)?[t]:at(ht(t))}var pt=1/0;function vt(t){if("string"==typeof t||_(t))return t;var e=t+"";return"0"==e&&1/t==-pt?"-0":e}function yt(t,e){for(var r=0,n=(e=dt(e,t)).length;null!=t&&r<n;)t=t[vt(e[r++])];return r&&r==n?t:void 0}function bt(t,e,r){var n=null==t?void 0:yt(t,e);return void 0===n?r:n}function gt(t){return"[object String]"===Object.prototype.toString.call(t)}function _t(t){return!(!gt(t)||""===t)}function mt(t){return t!=t}function jt(t){let e=!1;if(_t(t))e=!isNaN(Number(t));else if(function(t){return"[object Number]"===Object.prototype.toString.call(t)}(t)){if(mt(t))return!1;e=!0}return e}function wt(t){return"[object Object]"===Object.prototype.toString.call(t)}function $t(t){if(wt(t)){for(let e in t)return!0;return!1}return!1}var Ot=/\s/;var St=/^\s+/;function Mt(t){return t?t.slice(0,function(t){for(var e=t.length;e--&&Ot.test(t.charAt(e)););return e}(t)+1).replace(St,""):t}var xt=NaN,Dt=/^[-+]0x[0-9a-f]+$/i,Pt=/^0b[01]+$/i,At=/^0o[0-7]+$/i,Ft=parseInt;function kt(t){if("number"==typeof t)return t;if(_(t))return xt;if($(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=$(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=Mt(t);var r=Pt.test(t);return r||At.test(t)?Ft(t.slice(2),r?2:8):Dt.test(t)?xt:+t}var zt=1/0,Tt=17976931348623157e292;function Ht(t){return t?(t=kt(t))===zt||t===-zt?(t<0?-1:1)*Tt:t==t?t:0:0===t?t:0}function Et(t){if(!jt(t))return 0;return Ht(t)}function Nt(t,e){for(var r=-1,n=null==t?0:t.length;++r<n&&!1!==e(t[r],r,t););return t}var Yt,Lt=function(t,e,r){for(var n=-1,i=Object(t),o=r(t),u=o.length;u--;){var a=o[Yt?u:++n];if(!1===e(i[a],a,i))break}return t};function Jt(t){return b(t)&&"[object Arguments]"==y(t)}var Ct=Object.prototype,It=Ct.hasOwnProperty,Ut=Ct.propertyIsEnumerable,Wt=Jt(function(){return arguments}())?Jt:function(t){return b(t)&&It.call(t,"callee")&&!Ut.call(t,"callee")},Bt=Wt;var Vt="object"==typeof exports&&exports&&!exports.nodeType&&exports,qt=Vt&&"object"==typeof module&&module&&!module.nodeType&&module,Rt=qt&&qt.exports===Vt?u.Buffer:void 0,Zt=(Rt?Rt.isBuffer:void 0)||function(){return!1},Gt=9007199254740991,Qt=/^(?:0|[1-9]\d*)$/;function Kt(t,e){var r=typeof t;return!!(e=null==e?Gt:e)&&("number"==r||"symbol"!=r&&Qt.test(t))&&t>-1&&t%1==0&&t<e}var Xt=9007199254740991;function te(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=Xt}var ee={};ee["[object Float32Array]"]=ee["[object Float64Array]"]=ee["[object Int8Array]"]=ee["[object Int16Array]"]=ee["[object Int32Array]"]=ee["[object Uint8Array]"]=ee["[object Uint8ClampedArray]"]=ee["[object Uint16Array]"]=ee["[object Uint32Array]"]=!0,ee["[object Arguments]"]=ee["[object Array]"]=ee["[object ArrayBuffer]"]=ee["[object Boolean]"]=ee["[object DataView]"]=ee["[object Date]"]=ee["[object Error]"]=ee["[object Function]"]=ee["[object Map]"]=ee["[object Number]"]=ee["[object Object]"]=ee["[object RegExp]"]=ee["[object Set]"]=ee["[object String]"]=ee["[object WeakMap]"]=!1;var re="object"==typeof exports&&exports&&!exports.nodeType&&exports,ne=re&&"object"==typeof module&&module&&!module.nodeType&&module,ie=ne&&ne.exports===re&&i.process,oe=function(){try{var t=ne&&ne.require&&ne.require("util").types;return t||ie&&ie.binding&&ie.binding("util")}catch(t){}}(),ue=oe&&oe.isTypedArray,ae=ue?function(t){return function(e){return t(e)}}(ue):function(t){return b(t)&&te(t.length)&&!!ee[y(t)]},ce=ae,se=Object.prototype.hasOwnProperty;function fe(t,e){var r=n(t),i=!r&&Bt(t),o=!r&&!i&&Zt(t),u=!r&&!i&&!o&&ce(t),a=r||i||o||u,c=a?function(t,e){for(var r=-1,n=Array(t);++r<t;)n[r]=e(r);return n}(t.length,String):[],s=c.length;for(var f in t)!e&&!se.call(t,f)||a&&("length"==f||o&&("offset"==f||"parent"==f)||u&&("buffer"==f||"byteLength"==f||"byteOffset"==f)||Kt(f,s))||c.push(f);return c}var le=Object.prototype;var he=function(t,e){return function(r){return t(e(r))}}(Object.keys,Object),de=he,pe=Object.prototype.hasOwnProperty;function ve(t){if(r=(e=t)&&e.constructor,e!==("function"==typeof r&&r.prototype||le))return de(t);var e,r,n=[];for(var i in Object(t))pe.call(t,i)&&"constructor"!=i&&n.push(i);return n}function ye(t){return null!=t&&te(t.length)&&!D(t)}function be(t){return ye(t)?fe(t):ve(t)}var ge=function(t,e){return function(r,n){if(null==r)return r;if(!ye(r))return t(r,n);for(var i=r.length,o=e?i:-1,u=Object(r);(e?o--:++o<i)&&!1!==n(u[o],o,u););return r}}((function(t,e){return t&&Lt(t,e,be)})),_e=ge;function me(t){return t}function je(t,e){var r;return(n(t)?Nt:_e)(t,"function"==typeof(r=e)?r:me)}function we(t){var e=this.__data__=new Z(t);this.size=e.size}we.prototype.clear=function(){this.__data__=new Z,this.size=0},we.prototype.delete=function(t){var e=this.__data__,r=e.delete(t);return this.size=e.size,r},we.prototype.get=function(t){return this.__data__.get(t)},we.prototype.has=function(t){return this.__data__.has(t)},we.prototype.set=function(t,e){var r=this.__data__;if(r instanceof Z){var n=r.__data__;if(!G||n.length<199)return n.push([t,e]),this.size=++r.size,this;r=this.__data__=new K(n)}return r.set(t,e),this.size=r.size,this};function $e(t){var e=-1,r=null==t?0:t.length;for(this.__data__=new K;++e<r;)this.add(t[e])}function Oe(t,e){for(var r=-1,n=null==t?0:t.length;++r<n;)if(e(t[r],r,t))return!0;return!1}function Se(t,e){return t.has(e)}$e.prototype.add=$e.prototype.push=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},$e.prototype.has=function(t){return this.__data__.has(t)};var Me=1,xe=2;function De(t,e,r,n,i,o){var u=r&Me,a=t.length,c=e.length;if(a!=c&&!(u&&c>a))return!1;var s=o.get(t),f=o.get(e);if(s&&f)return s==e&&f==t;var l=-1,h=!0,d=r&xe?new $e:void 0;for(o.set(t,e),o.set(e,t);++l<a;){var p=t[l],v=e[l];if(n)var y=u?n(v,p,l,e,t,o):n(p,v,l,t,e,o);if(void 0!==y){if(y)continue;h=!1;break}if(d){if(!Oe(e,(function(t,e){if(!Se(d,e)&&(p===t||i(p,t,r,n,o)))return d.push(e)}))){h=!1;break}}else if(p!==v&&!i(p,v,r,n,o)){h=!1;break}}return o.delete(t),o.delete(e),h}var Pe=u.Uint8Array;function Ae(t){var e=-1,r=Array(t.size);return t.forEach((function(t,n){r[++e]=[n,t]})),r}function Fe(t){var e=-1,r=Array(t.size);return t.forEach((function(t){r[++e]=t})),r}var ke=1,ze=2,Te="[object Boolean]",He="[object Date]",Ee="[object Error]",Ne="[object Map]",Ye="[object Number]",Le="[object RegExp]",Je="[object Set]",Ce="[object String]",Ie="[object Symbol]",Ue="[object ArrayBuffer]",We="[object DataView]",Be=a?a.prototype:void 0,Ve=Be?Be.valueOf:void 0;var qe=Object.prototype.propertyIsEnumerable,Re=Object.getOwnPropertySymbols,Ze=Re?function(t){return null==t?[]:(t=Object(t),function(t,e){for(var r=-1,n=null==t?0:t.length,i=0,o=[];++r<n;){var u=t[r];e(u,r,t)&&(o[i++]=u)}return o}(Re(t),(function(e){return qe.call(t,e)})))}:function(){return[]},Ge=Ze;function Qe(t){return function(t,e,r){var i=e(t);return n(t)?i:function(t,e){for(var r=-1,n=e.length,i=t.length;++r<n;)t[i+r]=e[r];return t}(i,r(t))}(t,be,Ge)}var Ke=1,Xe=Object.prototype.hasOwnProperty;var tr=C(u,"DataView"),er=C(u,"Promise"),rr=C(u,"Set"),nr=C(u,"WeakMap"),ir="[object Map]",or="[object Promise]",ur="[object Set]",ar="[object WeakMap]",cr="[object DataView]",sr=z(tr),fr=z(G),lr=z(er),hr=z(rr),dr=z(nr),pr=y;(tr&&pr(new tr(new ArrayBuffer(1)))!=cr||G&&pr(new G)!=ir||er&&pr(er.resolve())!=or||rr&&pr(new rr)!=ur||nr&&pr(new nr)!=ar)&&(pr=function(t){var e=y(t),r="[object Object]"==e?t.constructor:void 0,n=r?z(r):"";if(n)switch(n){case sr:return cr;case fr:return ir;case lr:return or;case hr:return ur;case dr:return ar}return e});var vr=pr,yr=1,br="[object Arguments]",gr="[object Array]",_r="[object Object]",mr=Object.prototype.hasOwnProperty;function jr(t,e,r,i,o,u){var a=n(t),c=n(e),s=a?gr:vr(t),f=c?gr:vr(e),l=(s=s==br?_r:s)==_r,h=(f=f==br?_r:f)==_r,d=s==f;if(d&&Zt(t)){if(!Zt(e))return!1;a=!0,l=!1}if(d&&!l)return u||(u=new we),a||ce(t)?De(t,e,r,i,o,u):function(t,e,r,n,i,o,u){switch(r){case We:if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return!1;t=t.buffer,e=e.buffer;case Ue:return!(t.byteLength!=e.byteLength||!o(new Pe(t),new Pe(e)));case Te:case He:case Ye:return V(+t,+e);case Ee:return t.name==e.name&&t.message==e.message;case Le:case Ce:return t==e+"";case Ne:var a=Ae;case Je:var c=n&ke;if(a||(a=Fe),t.size!=e.size&&!c)return!1;var s=u.get(t);if(s)return s==e;n|=ze,u.set(t,e);var f=De(a(t),a(e),n,i,o,u);return u.delete(t),f;case Ie:if(Ve)return Ve.call(t)==Ve.call(e)}return!1}(t,e,s,r,i,o,u);if(!(r&yr)){var p=l&&mr.call(t,"__wrapped__"),v=h&&mr.call(e,"__wrapped__");if(p||v){var y=p?t.value():t,b=v?e.value():e;return u||(u=new we),o(y,b,r,i,u)}}return!!d&&(u||(u=new we),function(t,e,r,n,i,o){var u=r&Ke,a=Qe(t),c=a.length;if(c!=Qe(e).length&&!u)return!1;for(var s=c;s--;){var f=a[s];if(!(u?f in e:Xe.call(e,f)))return!1}var l=o.get(t),h=o.get(e);if(l&&h)return l==e&&h==t;var d=!0;o.set(t,e),o.set(e,t);for(var p=u;++s<c;){var v=t[f=a[s]],y=e[f];if(n)var b=u?n(y,v,f,e,t,o):n(v,y,f,t,e,o);if(!(void 0===b?v===y||i(v,y,r,n,o):b)){d=!1;break}p||(p="constructor"==f)}if(d&&!p){var g=t.constructor,_=e.constructor;g==_||!("constructor"in t)||!("constructor"in e)||"function"==typeof g&&g instanceof g&&"function"==typeof _&&_ instanceof _||(d=!1)}return o.delete(t),o.delete(e),d}(t,e,r,i,o,u))}function wr(t,e,r,n,i){return t===e||(null==t||null==e||!b(t)&&!b(e)?t!=t&&e!=e:jr(t,e,r,n,wr,i))}var $r=1,Or=2;function Sr(t){return t==t&&!$(t)}function Mr(t,e){return function(r){return null!=r&&(r[t]===e&&(void 0!==e||t in Object(r)))}}function xr(t){var e=function(t){for(var e=be(t),r=e.length;r--;){var n=e[r],i=t[n];e[r]=[n,i,Sr(i)]}return e}(t);return 1==e.length&&e[0][2]?Mr(e[0][0],e[0][1]):function(r){return r===t||function(t,e,r,n){var i=r.length,o=i,u=!n;if(null==t)return!o;for(t=Object(t);i--;){var a=r[i];if(u&&a[2]?a[1]!==t[a[0]]:!(a[0]in t))return!1}for(;++i<o;){var c=(a=r[i])[0],s=t[c],f=a[1];if(u&&a[2]){if(void 0===s&&!(c in t))return!1}else{var l=new we;if(n)var h=n(s,f,c,t,e,l);if(!(void 0===h?wr(f,s,$r|Or,n,l):h))return!1}}return!0}(r,t,e)}}function Dr(t,e){return null!=t&&e in Object(t)}function Pr(t,e){return null!=t&&function(t,e,r){for(var i=-1,o=(e=dt(e,t)).length,u=!1;++i<o;){var a=vt(e[i]);if(!(u=null!=t&&r(t,a)))break;t=t[a]}return u||++i!=o?u:!!(o=null==t?0:t.length)&&te(o)&&Kt(a,o)&&(n(t)||Bt(t))}(t,e,Dr)}var Ar=1,Fr=2;function kr(t){return w(t)?(e=vt(t),function(t){return null==t?void 0:t[e]}):function(t){return function(e){return yt(e,t)}}(t);var e}function zr(t){return"function"==typeof t?t:null==t?me:"object"==typeof t?n(t)?function(t,e){return w(t)&&Sr(e)?Mr(vt(t),e):function(r){var n=bt(r,t);return void 0===n&&n===e?Pr(r,t):wr(e,n,Ar|Fr)}}(t[0],t[1]):xr(t):kr(t)}function Tr(t){var e=Ht(t),r=e%1;return e==e?r?e-r:e:0}var Hr=Math.max;var Er,Nr=(Er=function(t,e,r){var n=null==t?0:t.length;if(!n)return-1;var i=null==r?0:Tr(r);return i<0&&(i=Hr(n+i,0)),function(t,e,r,n){for(var i=t.length,o=r+(n?1:-1);n?o--:++o<i;)if(e(t[o],o,t))return o;return-1}(t,zr(e),i)},function(t,e,r){var n=Object(t);if(!ye(t)){var i=zr(e);t=be(t),e=function(t){return i(n[t],t,n)}}var o=Er(t,e,r);return o>-1?n[i?t[o]:o]:void 0}),Yr=Nr;function Lr(t){return"[object Array]"===Object.prototype.toString.call(t)}function Jr(t){return!!function(t){return"[object Undefined]"===Object.prototype.toString.call(t)}(t)||(!!function(t){return"[object Null]"===Object.prototype.toString.call(t)}(t)||(!!function(t){if(wt(t)){for(let e in t)return!1;return!0}return!1}(t)||(!!function(t){return!(!gt(t)||""!==t)}(t)||(!!function(t){return!!Lr(t)&&0===t.length}(t)||!!mt(t)))))}function Cr(t){return!!Lr(t)&&(0!==t.length&&(1!==t.length||!Jr(t[0])))}"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var Ir={};!function(t,e){t.exports=function(){var t=1e3,e=6e4,r=36e5,n="millisecond",i="second",o="minute",u="hour",a="day",c="week",s="month",f="quarter",l="year",h="date",d="Invalid Date",p=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,v=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,y={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],r=t%100;return"["+t+(e[(r-20)%10]||e[r]||e[0])+"]"}},b=function(t,e,r){var n=String(t);return!n||n.length>=e?t:""+Array(e+1-n.length).join(r)+t},g={s:b,z:function(t){var e=-t.utcOffset(),r=Math.abs(e),n=Math.floor(r/60),i=r%60;return(e<=0?"+":"-")+b(n,2,"0")+":"+b(i,2,"0")},m:function t(e,r){if(e.date()<r.date())return-t(r,e);var n=12*(r.year()-e.year())+(r.month()-e.month()),i=e.clone().add(n,s),o=r-i<0,u=e.clone().add(n+(o?-1:1),s);return+(-(n+(r-i)/(o?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:s,y:l,w:c,d:a,D:h,h:u,m:o,s:i,ms:n,Q:f}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},_="en",m={};m[_]=y;var j="$isDayjsObject",w=function(t){return t instanceof M||!(!t||!t[j])},$=function t(e,r,n){var i;if(!e)return _;if("string"==typeof e){var o=e.toLowerCase();m[o]&&(i=o),r&&(m[o]=r,i=o);var u=e.split("-");if(!i&&u.length>1)return t(u[0])}else{var a=e.name;m[a]=e,i=a}return!n&&i&&(_=i),i||!n&&_},O=function(t,e){if(w(t))return t.clone();var r="object"==typeof e?e:{};return r.date=t,r.args=arguments,new M(r)},S=g;S.l=$,S.i=w,S.w=function(t,e){return O(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var M=function(){function y(t){this.$L=$(t.locale,null,!0),this.parse(t),this.$x=this.$x||t.x||{},this[j]=!0}var b=y.prototype;return b.parse=function(t){this.$d=function(t){var e=t.date,r=t.utc;if(null===e)return new Date(NaN);if(S.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var n=e.match(p);if(n){var i=n[2]-1||0,o=(n[7]||"0").substring(0,3);return r?new Date(Date.UTC(n[1],i,n[3]||1,n[4]||0,n[5]||0,n[6]||0,o)):new Date(n[1],i,n[3]||1,n[4]||0,n[5]||0,n[6]||0,o)}}return new Date(e)}(t),this.init()},b.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},b.$utils=function(){return S},b.isValid=function(){return!(this.$d.toString()===d)},b.isSame=function(t,e){var r=O(t);return this.startOf(e)<=r&&r<=this.endOf(e)},b.isAfter=function(t,e){return O(t)<this.startOf(e)},b.isBefore=function(t,e){return this.endOf(e)<O(t)},b.$g=function(t,e,r){return S.u(t)?this[e]:this.set(r,t)},b.unix=function(){return Math.floor(this.valueOf()/1e3)},b.valueOf=function(){return this.$d.getTime()},b.startOf=function(t,e){var r=this,n=!!S.u(e)||e,f=S.p(t),d=function(t,e){var i=S.w(r.$u?Date.UTC(r.$y,e,t):new Date(r.$y,e,t),r);return n?i:i.endOf(a)},p=function(t,e){return S.w(r.toDate()[t].apply(r.toDate("s"),(n?[0,0,0,0]:[23,59,59,999]).slice(e)),r)},v=this.$W,y=this.$M,b=this.$D,g="set"+(this.$u?"UTC":"");switch(f){case l:return n?d(1,0):d(31,11);case s:return n?d(1,y):d(0,y+1);case c:var _=this.$locale().weekStart||0,m=(v<_?v+7:v)-_;return d(n?b-m:b+(6-m),y);case a:case h:return p(g+"Hours",0);case u:return p(g+"Minutes",1);case o:return p(g+"Seconds",2);case i:return p(g+"Milliseconds",3);default:return this.clone()}},b.endOf=function(t){return this.startOf(t,!1)},b.$set=function(t,e){var r,c=S.p(t),f="set"+(this.$u?"UTC":""),d=(r={},r[a]=f+"Date",r[h]=f+"Date",r[s]=f+"Month",r[l]=f+"FullYear",r[u]=f+"Hours",r[o]=f+"Minutes",r[i]=f+"Seconds",r[n]=f+"Milliseconds",r)[c],p=c===a?this.$D+(e-this.$W):e;if(c===s||c===l){var v=this.clone().set(h,1);v.$d[d](p),v.init(),this.$d=v.set(h,Math.min(this.$D,v.daysInMonth())).$d}else d&&this.$d[d](p);return this.init(),this},b.set=function(t,e){return this.clone().$set(t,e)},b.get=function(t){return this[S.p(t)]()},b.add=function(n,f){var h,d=this;n=Number(n);var p=S.p(f),v=function(t){var e=O(d);return S.w(e.date(e.date()+Math.round(t*n)),d)};if(p===s)return this.set(s,this.$M+n);if(p===l)return this.set(l,this.$y+n);if(p===a)return v(1);if(p===c)return v(7);var y=(h={},h[o]=e,h[u]=r,h[i]=t,h)[p]||1,b=this.$d.getTime()+n*y;return S.w(b,this)},b.subtract=function(t,e){return this.add(-1*t,e)},b.format=function(t){var e=this,r=this.$locale();if(!this.isValid())return r.invalidDate||d;var n=t||"YYYY-MM-DDTHH:mm:ssZ",i=S.z(this),o=this.$H,u=this.$m,a=this.$M,c=r.weekdays,s=r.months,f=r.meridiem,l=function(t,r,i,o){return t&&(t[r]||t(e,n))||i[r].slice(0,o)},h=function(t){return S.s(o%12||12,t,"0")},p=f||function(t,e,r){var n=t<12?"AM":"PM";return r?n.toLowerCase():n};return n.replace(v,(function(t,n){return n||function(t){switch(t){case"YY":return String(e.$y).slice(-2);case"YYYY":return S.s(e.$y,4,"0");case"M":return a+1;case"MM":return S.s(a+1,2,"0");case"MMM":return l(r.monthsShort,a,s,3);case"MMMM":return l(s,a);case"D":return e.$D;case"DD":return S.s(e.$D,2,"0");case"d":return String(e.$W);case"dd":return l(r.weekdaysMin,e.$W,c,2);case"ddd":return l(r.weekdaysShort,e.$W,c,3);case"dddd":return c[e.$W];case"H":return String(o);case"HH":return S.s(o,2,"0");case"h":return h(1);case"hh":return h(2);case"a":return p(o,u,!0);case"A":return p(o,u,!1);case"m":return String(u);case"mm":return S.s(u,2,"0");case"s":return String(e.$s);case"ss":return S.s(e.$s,2,"0");case"SSS":return S.s(e.$ms,3,"0");case"Z":return i}return null}(t)||i.replace(":","")}))},b.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},b.diff=function(n,h,d){var p,v=this,y=S.p(h),b=O(n),g=(b.utcOffset()-this.utcOffset())*e,_=this-b,m=function(){return S.m(v,b)};switch(y){case l:p=m()/12;break;case s:p=m();break;case f:p=m()/3;break;case c:p=(_-g)/6048e5;break;case a:p=(_-g)/864e5;break;case u:p=_/r;break;case o:p=_/e;break;case i:p=_/t;break;default:p=_}return d?p:S.a(p)},b.daysInMonth=function(){return this.endOf(s).$D},b.$locale=function(){return m[this.$L]},b.locale=function(t,e){if(!t)return this.$L;var r=this.clone(),n=$(t,e,!0);return n&&(r.$L=n),r},b.clone=function(){return S.w(this.$d,this)},b.toDate=function(){return new Date(this.valueOf())},b.toJSON=function(){return this.isValid()?this.toISOString():null},b.toISOString=function(){return this.$d.toISOString()},b.toString=function(){return this.$d.toUTCString()},y}(),x=M.prototype;return O.prototype=x,[["$ms",n],["$s",i],["$m",o],["$H",u],["$W",a],["$M",s],["$y",l],["$D",h]].forEach((function(t){x[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),O.extend=function(t,e){return t.$i||(t(e,M,O),t.$i=!0),O},O.locale=$,O.isDayjs=w,O.unix=function(t){return O(1e3*t)},O.en=m[_],O.Ls=m,O.p={},O}()}({get exports(){return Ir},set exports(t){Ir=t}});var Ur=Ir;function Wr(){if(!function(t){let e=Object.prototype.toString.call(t);return"[object Function]"===e||"[object AsyncFunction]"===e}(Ur))throw new Error("invalid dayjs");return Ur().format("YYYYMMDDHHmmss")}function Br(t){return!!jt(t)&&(t=Et(t),"number"==typeof(e=t)&&e==Tr(e));var e}var Vr=u.isFinite,qr=Math.min;var Rr=function(t){var e=Math[t];return function(t,r){if(t=kt(t),(r=null==r?0:qr(Tr(r),292))&&Vr(t)){var n=(ht(t)+"e").split("e");return+((n=(ht(e(n[0]+"e"+(+n[1]+r)))+"e").split("e"))[0]+"e"+(+n[1]-r))}return e(t)}}("round"),Zr=Rr;function Gr(t){if(!jt(t))return 0;t=Et(t);let e=Zr(t);return"0"===String(e)?0:e}let Qr="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),Kr=Qr.length;function Xr(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:32,e=[];var r;t=Br(r=t)&&Gr(r)>0?Gr(t):32;for(let r=0;r<t;r++)e[r]=Qr[0|Math.random()*Kr];return e.join("")}function tn(e){return!!t.existsSync(e)&&(!t.lstatSync(e).isFile()&&!t.lstatSync(e).isSymbolicLink())}function en(e){return!!t.existsSync(e)&&(!t.lstatSync(e).isDirectory()&&!t.lstatSync(e).isSymbolicLink())}let rn=process.cwd();async function nn(){let n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:700,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:400,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:3,u=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"",a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};if(!jt(n))return Promise.reject("width is not a number");if(n=Et(n),n<=0)return Promise.reject("width <= 0");if(!jt(i))return Promise.reject("height is not a number");if(i=Et(i),i<=0)return Promise.reject("height <= 0");if(!jt(o))return Promise.reject("scale is not a number");if(o=Et(o),o<=0)return Promise.reject("scale <= 0");if(!_t(u))return Promise.reject("html is not an effective string");let c=u,s=bt(a,"modeHeadless");!0!==s&&!1!==s&&"new"!==s&&"shell"!==s&&(s="shell");let f=bt(a,"scriptsHead");Cr(f)||(f=[]);let l="";je(f,(t=>{l+=`<script src="${t}"><\/script>\n`}));let h=bt(a,"execJsHead");_t(h)&&(h=[h]),Cr(h)||(h=[]);let d="";je(h,(t=>{d+=`<script>${t}<\/script>\n\n`}));let p=bt(a,"execJsPost");_t(p)&&(p=[p]),Cr(p)||(p=[]);let v="";je(p,(t=>{v+=`<script>${t}<\/script>\n\n`}));let y=bt(a,"executablePath",""),b=bt(a,"executableFolder","");if(_t(b)&&!_t(y)){let r=function(r){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,i=1;if(!tn(r))throw new Error(`fd[${r}] is not a folder`);return function r(o){let u=[];return tn(o)?(je(t.readdirSync(o),(function(a){let c=e.resolve(o,a),s=null;try{s=t.statSync(c)}catch(t){}s&&s.isDirectory()?(u.push({isFolder:!0,level:i,path:c,name:e.basename(c)}),i+=1,(i<=n||null===n)&&(u=u.concat(r(c))),i-=1):u.push({isFolder:!1,level:i,path:c,name:e.basename(c)})})),u):u}(r)}(b,null),n=Yr(r,(t=>"chrome.exe"===t.name));if(!$t(n))throw new Error(`can not find chrome.exe in executableFolder[${b}]`);y=n.path}let g=`./whpic-${Wr()}-${Xr()}.png`,_=e.resolve(rn,g),m=`./whweb-${Wr()}-${Xr()}.html`,j=e.resolve(rn,m),w='\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>highcharts to png</title>\n\n  <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"><\/script>\n\n  <script src="https://cdn.jsdelivr.net/npm/wsemi/dist/wsemi.umd.js"><\/script>\n  <script>\n      let w = wsemi\n  <\/script>\n\n  {cScriptsHead}\n\n  {cExecJsHead}\n\n</head>\n<body style="padding:0; margin:0;">\n\n    <div id="pl">\n        {cHtml}\n    </div>\n\n    {cExecJsPost}\n\n</body>\n</html>\n';w=w.replace("{cHtml}",c),w=w.replace("{cScriptsHead}",l),w=w.replace("{cExecJsHead}",d),w=w.replace("{cExecJsPost}",v),t.writeFileSync(j,w,"utf8");let $="";return await(async()=>{let e={headless:s,slowMo:20};_t(y)&&(e.executablePath=y);let u=await r.launch(e),a=await u.newPage(),c={x:0,y:0,width:Number(n),height:Number(i),deviceScaleFactor:Number(o)};await a.goto(j),await a.setViewport(c),await a.screenshot({path:_}),await u.close(),$=t.readFileSync(_,{encoding:"base64"})})().catch((t=>{console.log(t)})),en(j)&&t.unlinkSync(j),en(_)&&t.unlinkSync(_),$}let on=t.readFileSync("./node_modules/highcharts/highcharts.js","utf8"),un=t.readFileSync("./node_modules/highcharts/highcharts-more.js","utf8"),an=t.readFileSync("./node_modules/highcharts/modules/stock.js","utf8"),cn=t.readFileSync("./node_modules/highcharts/modules/annotations.js","utf8"),sn=t.readFileSync("./node_modules/highcharts/modules/heatmap.js","utf8"),fn=t.readFileSync("./node_modules/highcharts/modules/boost.js","utf8"),ln=t.readFileSync("./node_modules/highcharts/modules/boost-canvas.js","utf8");return async function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:700,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:400,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:3,n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};if(!jt(t))return Promise.reject("width is not a number");if(t=Et(t),t<=0)return Promise.reject("width <= 0");if(!jt(e))return Promise.reject("height is not a number");if(e=Et(e),e<=0)return Promise.reject("height <= 0");if(!jt(r))return Promise.reject("scale is not a number");if(r=Et(r),r<=0)return Promise.reject("scale <= 0");if(!$t(n)&&!_t(n))return Promise.reject("opt is not an effective object or string");let o=[on,un,an,cn,sn,fn,ln],u="";if(_t(n))u=n;else{u=`let opt=${JSON.stringify(n)};`}let a=`\n\n        ${u}\n\n        if(_.isObject(opt)){\n\n            //強制關閉動畫避免過慢顯示無法截到數據圖\n            _.set(opt, 'chart.animation', false)\n            _.set(opt, 'plotOptions.series.animation', false)\n            // console.log('opt', opt)\n        \n            //plot\n            Highcharts.chart('hc', opt)\n\n        }\n        else{\n            console.log('invalid opt')\n        }\n\n    `;a=[a];let c=`\n\n        <div id="hc" style="width:${t}px; height:${e}px;"></div>\n\n    `,s=bt(i,"execJsHead","");_t(s)&&(s=[s]),s=[...s,...o],i.execJsHead=s;let f=bt(i,"execJsPost","");return _t(f)&&(f=[f]),f=[...f,...a],i.execJsPost=f,await nn(t,e,r,c,i)}}));
//# sourceMappingURL=w-hc-2-png.umd.js.map
