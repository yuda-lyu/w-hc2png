/*!
 * w-hc-2-png v1.0.19
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("fs"),require("path"),require("puppeteer")):"function"==typeof define&&define.amd?define(["fs","path","puppeteer"],e):(t="undefined"!=typeof globalThis?globalThis:t||self)["w-hc-2-png"]=e(t.fs,t.path,t.puppeteer)}(this,(function(t,e,r){"use strict";var n="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function o(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var i=Array.isArray,a="object"==typeof n&&n&&n.Object===Object&&n,u=a,c="object"==typeof self&&self&&self.Object===Object&&self,s=u||c||Function("return this")(),f=s.Symbol,l=f,h=Object.prototype,p=h.hasOwnProperty,v=h.toString,d=l?l.toStringTag:void 0;var y=function(t){var e=p.call(t,d),r=t[d];try{t[d]=void 0;var n=!0}catch(t){}var o=v.call(t);return n&&(e?t[d]=r:delete t[d]),o},b=Object.prototype.toString;var _=y,g=function(t){return b.call(t)},j=f?f.toStringTag:void 0;var m=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":j&&j in Object(t)?_(t):g(t)};var w=function(t){return null!=t&&"object"==typeof t},$=m,O=w;var S=function(t){return"symbol"==typeof t||O(t)&&"[object Symbol]"==$(t)},M=i,D=S,x=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,A=/^\w*$/;var k=function(t,e){if(M(t))return!1;var r=typeof t;return!("number"!=r&&"symbol"!=r&&"boolean"!=r&&null!=t&&!D(t))||(A.test(t)||!x.test(t)||null!=e&&t in Object(e))};var z=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)},F=m,P=z;var T,N=function(t){if(!P(t))return!1;var e=F(t);return"[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e},L=s["__core-js_shared__"],Y=(T=/[^.]+$/.exec(L&&L.keys&&L.keys.IE_PROTO||""))?"Symbol(src)_1."+T:"";var E=function(t){return!!Y&&Y in t},C=Function.prototype.toString;var H=function(t){if(null!=t){try{return C.call(t)}catch(t){}try{return t+""}catch(t){}}return""},I=N,U=E,W=z,B=H,V=/^\[object .+?Constructor\]$/,q=Function.prototype,J=Object.prototype,R=q.toString,Z=J.hasOwnProperty,G=RegExp("^"+R.call(Z).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var Q=function(t){return!(!W(t)||U(t))&&(I(t)?G:V).test(B(t))},K=function(t,e){return null==t?void 0:t[e]};var X=function(t,e){var r=K(t,e);return Q(r)?r:void 0},tt=X(Object,"create"),et=tt;var rt=function(){this.__data__=et?et(null):{},this.size=0};var nt=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},ot=tt,it=Object.prototype.hasOwnProperty;var at=function(t){var e=this.__data__;if(ot){var r=e[t];return"__lodash_hash_undefined__"===r?void 0:r}return it.call(e,t)?e[t]:void 0},ut=tt,ct=Object.prototype.hasOwnProperty;var st=tt;var ft=rt,lt=nt,ht=at,pt=function(t){var e=this.__data__;return ut?void 0!==e[t]:ct.call(e,t)},vt=function(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=st&&void 0===e?"__lodash_hash_undefined__":e,this};function dt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}dt.prototype.clear=ft,dt.prototype.delete=lt,dt.prototype.get=ht,dt.prototype.has=pt,dt.prototype.set=vt;var yt=dt;var bt=function(){this.__data__=[],this.size=0};var _t=function(t,e){return t===e||t!=t&&e!=e},gt=_t;var jt=function(t,e){for(var r=t.length;r--;)if(gt(t[r][0],e))return r;return-1},mt=jt,wt=Array.prototype.splice;var $t=jt;var Ot=jt;var St=jt;var Mt=bt,Dt=function(t){var e=this.__data__,r=mt(e,t);return!(r<0)&&(r==e.length-1?e.pop():wt.call(e,r,1),--this.size,!0)},xt=function(t){var e=this.__data__,r=$t(e,t);return r<0?void 0:e[r][1]},At=function(t){return Ot(this.__data__,t)>-1},kt=function(t,e){var r=this.__data__,n=St(r,t);return n<0?(++this.size,r.push([t,e])):r[n][1]=e,this};function zt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}zt.prototype.clear=Mt,zt.prototype.delete=Dt,zt.prototype.get=xt,zt.prototype.has=At,zt.prototype.set=kt;var Ft=zt,Pt=X(s,"Map"),Tt=yt,Nt=Ft,Lt=Pt;var Yt=function(t){var e=typeof t;return"string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t};var Et=function(t,e){var r=t.__data__;return Yt(e)?r["string"==typeof e?"string":"hash"]:r.map},Ct=Et;var Ht=Et;var It=Et;var Ut=Et;var Wt=function(){this.size=0,this.__data__={hash:new Tt,map:new(Lt||Nt),string:new Tt}},Bt=function(t){var e=Ct(this,t).delete(t);return this.size-=e?1:0,e},Vt=function(t){return Ht(this,t).get(t)},qt=function(t){return It(this,t).has(t)},Jt=function(t,e){var r=Ut(this,t),n=r.size;return r.set(t,e),this.size+=r.size==n?0:1,this};function Rt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}Rt.prototype.clear=Wt,Rt.prototype.delete=Bt,Rt.prototype.get=Vt,Rt.prototype.has=qt,Rt.prototype.set=Jt;var Zt=Rt,Gt=Zt;function Qt(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError("Expected a function");var r=function(){var n=arguments,o=e?e.apply(this,n):n[0],i=r.cache;if(i.has(o))return i.get(o);var a=t.apply(this,n);return r.cache=i.set(o,a)||i,a};return r.cache=new(Qt.Cache||Gt),r}Qt.Cache=Gt;var Kt=Qt;var Xt=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,te=/\\(\\)?/g,ee=function(t){var e=Kt(t,(function(t){return 500===r.size&&r.clear(),t})),r=e.cache;return e}((function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(Xt,(function(t,r,n,o){e.push(n?o.replace(te,"$1"):r||t)})),e}));var re=function(t,e){for(var r=-1,n=null==t?0:t.length,o=Array(n);++r<n;)o[r]=e(t[r],r,t);return o},ne=i,oe=S,ie=f?f.prototype:void 0,ae=ie?ie.toString:void 0;var ue=function t(e){if("string"==typeof e)return e;if(ne(e))return re(e,t)+"";if(oe(e))return ae?ae.call(e):"";var r=e+"";return"0"==r&&1/e==-Infinity?"-0":r},ce=ue;var se=function(t){return null==t?"":ce(t)},fe=i,le=k,he=ee,pe=se;var ve=function(t,e){return fe(t)?t:le(t,e)?[t]:he(pe(t))},de=S;var ye=function(t){if("string"==typeof t||de(t))return t;var e=t+"";return"0"==e&&1/t==-Infinity?"-0":e},be=ve,_e=ye;var ge=function(t,e){for(var r=0,n=(e=be(e,t)).length;null!=t&&r<n;)t=t[_e(e[r++])];return r&&r==n?t:void 0},je=ge;var me=function(t,e,r){var n=null==t?void 0:je(t,e);return void 0===n?r:n},we={},$e={get exports(){return we},set exports(t){we=t}};var Oe=function(t,e){for(var r=-1,n=null==t?0:t.length;++r<n&&!1!==e(t[r],r,t););return t};var Se=function(t){return function(e,r,n){for(var o=-1,i=Object(e),a=n(e),u=a.length;u--;){var c=a[t?u:++o];if(!1===r(i[c],c,i))break}return e}}();var Me=function(t,e){for(var r=-1,n=Array(t);++r<t;)n[r]=e(r);return n},De=m,xe=w;var Ae=function(t){return xe(t)&&"[object Arguments]"==De(t)},ke=w,ze=Object.prototype,Fe=ze.hasOwnProperty,Pe=ze.propertyIsEnumerable,Te=Ae(function(){return arguments}())?Ae:function(t){return ke(t)&&Fe.call(t,"callee")&&!Pe.call(t,"callee")},Ne=Te,Le={};var Ye=function(){return!1};!function(t,e){var r=s,n=Ye,o=e&&!e.nodeType&&e,i=o&&t&&!t.nodeType&&t,a=i&&i.exports===o?r.Buffer:void 0,u=(a?a.isBuffer:void 0)||n;t.exports=u}({get exports(){return Le},set exports(t){Le=t}},Le);var Ee=/^(?:0|[1-9]\d*)$/;var Ce=function(t,e){var r=typeof t;return!!(e=null==e?9007199254740991:e)&&("number"==r||"symbol"!=r&&Ee.test(t))&&t>-1&&t%1==0&&t<e};var He=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991},Ie=m,Ue=He,We=w,Be={};Be["[object Float32Array]"]=Be["[object Float64Array]"]=Be["[object Int8Array]"]=Be["[object Int16Array]"]=Be["[object Int32Array]"]=Be["[object Uint8Array]"]=Be["[object Uint8ClampedArray]"]=Be["[object Uint16Array]"]=Be["[object Uint32Array]"]=!0,Be["[object Arguments]"]=Be["[object Array]"]=Be["[object ArrayBuffer]"]=Be["[object Boolean]"]=Be["[object DataView]"]=Be["[object Date]"]=Be["[object Error]"]=Be["[object Function]"]=Be["[object Map]"]=Be["[object Number]"]=Be["[object Object]"]=Be["[object RegExp]"]=Be["[object Set]"]=Be["[object String]"]=Be["[object WeakMap]"]=!1;var Ve=function(t){return We(t)&&Ue(t.length)&&!!Be[Ie(t)]};var qe=function(t){return function(e){return t(e)}},Je={};!function(t,e){var r=a,n=e&&!e.nodeType&&e,o=n&&t&&!t.nodeType&&t,i=o&&o.exports===n&&r.process,u=function(){try{var t=o&&o.require&&o.require("util").types;return t||i&&i.binding&&i.binding("util")}catch(t){}}();t.exports=u}({get exports(){return Je},set exports(t){Je=t}},Je);var Re=Ve,Ze=qe,Ge=Je&&Je.isTypedArray,Qe=Ge?Ze(Ge):Re,Ke=Me,Xe=Ne,tr=i,er=Le,rr=Ce,nr=Qe,or=Object.prototype.hasOwnProperty;var ir=function(t,e){var r=tr(t),n=!r&&Xe(t),o=!r&&!n&&er(t),i=!r&&!n&&!o&&nr(t),a=r||n||o||i,u=a?Ke(t.length,String):[],c=u.length;for(var s in t)!e&&!or.call(t,s)||a&&("length"==s||o&&("offset"==s||"parent"==s)||i&&("buffer"==s||"byteLength"==s||"byteOffset"==s)||rr(s,c))||u.push(s);return u},ar=Object.prototype;var ur=function(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||ar)};var cr=function(t,e){return function(r){return t(e(r))}}(Object.keys,Object),sr=ur,fr=cr,lr=Object.prototype.hasOwnProperty;var hr=N,pr=He;var vr=function(t){return null!=t&&pr(t.length)&&!hr(t)},dr=ir,yr=function(t){if(!sr(t))return fr(t);var e=[];for(var r in Object(t))lr.call(t,r)&&"constructor"!=r&&e.push(r);return e},br=vr;var _r=function(t){return br(t)?dr(t):yr(t)},gr=Se,jr=_r;var mr=vr;var wr=function(t,e){return function(r,n){if(null==r)return r;if(!mr(r))return t(r,n);for(var o=r.length,i=e?o:-1,a=Object(r);(e?i--:++i<o)&&!1!==n(a[i],i,a););return r}}((function(t,e){return t&&gr(t,e,jr)}));var $r=function(t){return t},Or=$r;var Sr=Oe,Mr=wr,Dr=function(t){return"function"==typeof t?t:Or},xr=i;var Ar=function(t,e){return(xr(t)?Sr:Mr)(t,Dr(e))};!function(t){t.exports=Ar}($e);var kr=o(we),zr=Ft;var Fr=Ft,Pr=Pt,Tr=Zt;var Nr=Ft,Lr=function(){this.__data__=new zr,this.size=0},Yr=function(t){var e=this.__data__,r=e.delete(t);return this.size=e.size,r},Er=function(t){return this.__data__.get(t)},Cr=function(t){return this.__data__.has(t)},Hr=function(t,e){var r=this.__data__;if(r instanceof Fr){var n=r.__data__;if(!Pr||n.length<199)return n.push([t,e]),this.size=++r.size,this;r=this.__data__=new Tr(n)}return r.set(t,e),this.size=r.size,this};function Ir(t){var e=this.__data__=new Nr(t);this.size=e.size}Ir.prototype.clear=Lr,Ir.prototype.delete=Yr,Ir.prototype.get=Er,Ir.prototype.has=Cr,Ir.prototype.set=Hr;var Ur=Ir;var Wr=Zt,Br=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},Vr=function(t){return this.__data__.has(t)};function qr(t){var e=-1,r=null==t?0:t.length;for(this.__data__=new Wr;++e<r;)this.add(t[e])}qr.prototype.add=qr.prototype.push=Br,qr.prototype.has=Vr;var Jr=qr,Rr=function(t,e){for(var r=-1,n=null==t?0:t.length;++r<n;)if(e(t[r],r,t))return!0;return!1},Zr=function(t,e){return t.has(e)};var Gr=function(t,e,r,n,o,i){var a=1&r,u=t.length,c=e.length;if(u!=c&&!(a&&c>u))return!1;var s=i.get(t),f=i.get(e);if(s&&f)return s==e&&f==t;var l=-1,h=!0,p=2&r?new Jr:void 0;for(i.set(t,e),i.set(e,t);++l<u;){var v=t[l],d=e[l];if(n)var y=a?n(d,v,l,e,t,i):n(v,d,l,t,e,i);if(void 0!==y){if(y)continue;h=!1;break}if(p){if(!Rr(e,(function(t,e){if(!Zr(p,e)&&(v===t||o(v,t,r,n,i)))return p.push(e)}))){h=!1;break}}else if(v!==d&&!o(v,d,r,n,i)){h=!1;break}}return i.delete(t),i.delete(e),h};var Qr=s.Uint8Array,Kr=_t,Xr=Gr,tn=function(t){var e=-1,r=Array(t.size);return t.forEach((function(t,n){r[++e]=[n,t]})),r},en=function(t){var e=-1,r=Array(t.size);return t.forEach((function(t){r[++e]=t})),r},rn=f?f.prototype:void 0,nn=rn?rn.valueOf:void 0;var on=function(t,e,r,n,o,i,a){switch(r){case"[object DataView]":if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return!1;t=t.buffer,e=e.buffer;case"[object ArrayBuffer]":return!(t.byteLength!=e.byteLength||!i(new Qr(t),new Qr(e)));case"[object Boolean]":case"[object Date]":case"[object Number]":return Kr(+t,+e);case"[object Error]":return t.name==e.name&&t.message==e.message;case"[object RegExp]":case"[object String]":return t==e+"";case"[object Map]":var u=tn;case"[object Set]":var c=1&n;if(u||(u=en),t.size!=e.size&&!c)return!1;var s=a.get(t);if(s)return s==e;n|=2,a.set(t,e);var f=Xr(u(t),u(e),n,o,i,a);return a.delete(t),f;case"[object Symbol]":if(nn)return nn.call(t)==nn.call(e)}return!1};var an=function(t,e){for(var r=-1,n=e.length,o=t.length;++r<n;)t[o+r]=e[r];return t},un=i;var cn=function(t,e,r){var n=e(t);return un(t)?n:an(n,r(t))};var sn=function(t,e){for(var r=-1,n=null==t?0:t.length,o=0,i=[];++r<n;){var a=t[r];e(a,r,t)&&(i[o++]=a)}return i},fn=function(){return[]},ln=Object.prototype.propertyIsEnumerable,hn=Object.getOwnPropertySymbols,pn=cn,vn=hn?function(t){return null==t?[]:(t=Object(t),sn(hn(t),(function(e){return ln.call(t,e)})))}:fn,dn=_r;var yn=function(t){return pn(t,dn,vn)},bn=Object.prototype.hasOwnProperty;var _n=function(t,e,r,n,o,i){var a=1&r,u=yn(t),c=u.length;if(c!=yn(e).length&&!a)return!1;for(var s=c;s--;){var f=u[s];if(!(a?f in e:bn.call(e,f)))return!1}var l=i.get(t),h=i.get(e);if(l&&h)return l==e&&h==t;var p=!0;i.set(t,e),i.set(e,t);for(var v=a;++s<c;){var d=t[f=u[s]],y=e[f];if(n)var b=a?n(y,d,f,e,t,i):n(d,y,f,t,e,i);if(!(void 0===b?d===y||o(d,y,r,n,i):b)){p=!1;break}v||(v="constructor"==f)}if(p&&!v){var _=t.constructor,g=e.constructor;_==g||!("constructor"in t)||!("constructor"in e)||"function"==typeof _&&_ instanceof _&&"function"==typeof g&&g instanceof g||(p=!1)}return i.delete(t),i.delete(e),p},gn=X(s,"DataView"),jn=Pt,mn=X(s,"Promise"),wn=X(s,"Set"),$n=X(s,"WeakMap"),On=m,Sn=H,Mn="[object Map]",Dn="[object Promise]",xn="[object Set]",An="[object WeakMap]",kn="[object DataView]",zn=Sn(gn),Fn=Sn(jn),Pn=Sn(mn),Tn=Sn(wn),Nn=Sn($n),Ln=On;(gn&&Ln(new gn(new ArrayBuffer(1)))!=kn||jn&&Ln(new jn)!=Mn||mn&&Ln(mn.resolve())!=Dn||wn&&Ln(new wn)!=xn||$n&&Ln(new $n)!=An)&&(Ln=function(t){var e=On(t),r="[object Object]"==e?t.constructor:void 0,n=r?Sn(r):"";if(n)switch(n){case zn:return kn;case Fn:return Mn;case Pn:return Dn;case Tn:return xn;case Nn:return An}return e});var Yn=Ur,En=Gr,Cn=on,Hn=_n,In=Ln,Un=i,Wn=Le,Bn=Qe,Vn="[object Arguments]",qn="[object Array]",Jn="[object Object]",Rn=Object.prototype.hasOwnProperty;var Zn=function(t,e,r,n,o,i){var a=Un(t),u=Un(e),c=a?qn:In(t),s=u?qn:In(e),f=(c=c==Vn?Jn:c)==Jn,l=(s=s==Vn?Jn:s)==Jn,h=c==s;if(h&&Wn(t)){if(!Wn(e))return!1;a=!0,f=!1}if(h&&!f)return i||(i=new Yn),a||Bn(t)?En(t,e,r,n,o,i):Cn(t,e,c,r,n,o,i);if(!(1&r)){var p=f&&Rn.call(t,"__wrapped__"),v=l&&Rn.call(e,"__wrapped__");if(p||v){var d=p?t.value():t,y=v?e.value():e;return i||(i=new Yn),o(d,y,r,n,i)}}return!!h&&(i||(i=new Yn),Hn(t,e,r,n,o,i))},Gn=w;var Qn=function t(e,r,n,o,i){return e===r||(null==e||null==r||!Gn(e)&&!Gn(r)?e!=e&&r!=r:Zn(e,r,n,o,t,i))},Kn=Ur,Xn=Qn;var to=z;var eo=function(t){return t==t&&!to(t)},ro=eo,no=_r;var oo=function(t,e){return function(r){return null!=r&&(r[t]===e&&(void 0!==e||t in Object(r)))}},io=function(t,e,r,n){var o=r.length,i=o,a=!n;if(null==t)return!i;for(t=Object(t);o--;){var u=r[o];if(a&&u[2]?u[1]!==t[u[0]]:!(u[0]in t))return!1}for(;++o<i;){var c=(u=r[o])[0],s=t[c],f=u[1];if(a&&u[2]){if(void 0===s&&!(c in t))return!1}else{var l=new Kn;if(n)var h=n(s,f,c,t,e,l);if(!(void 0===h?Xn(f,s,3,n,l):h))return!1}}return!0},ao=function(t){for(var e=no(t),r=e.length;r--;){var n=e[r],o=t[n];e[r]=[n,o,ro(o)]}return e},uo=oo;var co=ve,so=Ne,fo=i,lo=Ce,ho=He,po=ye;var vo=function(t,e,r){for(var n=-1,o=(e=co(e,t)).length,i=!1;++n<o;){var a=po(e[n]);if(!(i=null!=t&&r(t,a)))break;t=t[a]}return i||++n!=o?i:!!(o=null==t?0:t.length)&&ho(o)&&lo(a,o)&&(fo(t)||so(t))},yo=function(t,e){return null!=t&&e in Object(t)},bo=vo;var _o=function(t,e){return null!=t&&bo(t,e,yo)},go=Qn,jo=me,mo=_o,wo=k,$o=eo,Oo=oo,So=ye;var Mo=function(t,e){return wo(t)&&$o(e)?Oo(So(t),e):function(r){var n=jo(r,t);return void 0===n&&n===e?mo(r,t):go(e,n,3)}};var Do=ge;var xo=function(t){return function(e){return Do(e,t)}},Ao=function(t){return function(e){return null==e?void 0:e[t]}},ko=xo,zo=k,Fo=ye;var Po=function(t){return zo(t)?Ao(Fo(t)):ko(t)},To=function(t){var e=ao(t);return 1==e.length&&e[0][2]?uo(e[0][0],e[0][1]):function(r){return r===t||io(r,t,e)}},No=Mo,Lo=$r,Yo=i,Eo=Po;var Co=function(t){return"function"==typeof t?t:null==t?Lo:"object"==typeof t?Yo(t)?No(t[0],t[1]):To(t):Eo(t)},Ho=Co,Io=vr,Uo=_r;var Wo=function(t){return function(e,r,n){var o=Object(e);if(!Io(e)){var i=Ho(r);e=Uo(e),r=function(t){return i(o[t],t,o)}}var a=t(e,r,n);return a>-1?o[i?e[a]:a]:void 0}};var Bo=/\s/;var Vo=function(t){for(var e=t.length;e--&&Bo.test(t.charAt(e)););return e},qo=/^\s+/;var Jo=function(t){return t?t.slice(0,Vo(t)+1).replace(qo,""):t},Ro=z,Zo=S,Go=/^[-+]0x[0-9a-f]+$/i,Qo=/^0b[01]+$/i,Ko=/^0o[0-7]+$/i,Xo=parseInt;var ti=function(t){if("number"==typeof t)return t;if(Zo(t))return NaN;if(Ro(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=Ro(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=Jo(t);var r=Qo.test(t);return r||Ko.test(t)?Xo(t.slice(2),r?2:8):Go.test(t)?NaN:+t},ei=ti,ri=1/0;var ni=function(t){return t?(t=ei(t))===ri||t===-1/0?17976931348623157e292*(t<0?-1:1):t==t?t:0:0===t?t:0},oi=ni;var ii=function(t){var e=oi(t),r=e%1;return e==e?r?e-r:e:0},ai=function(t,e,r,n){for(var o=t.length,i=r+(n?1:-1);n?i--:++i<o;)if(e(t[i],i,t))return i;return-1},ui=Co,ci=ii,si=Math.max;var fi=Wo((function(t,e,r){var n=null==t?0:t.length;if(!n)return-1;var o=null==r?0:ci(r);return o<0&&(o=si(n+o,0)),ai(t,ui(e),o)}));function li(t){return"[object String]"===Object.prototype.toString.call(t)}function hi(t){return!(!li(t)||""===t)}function pi(t){return t!=t}function vi(t){let e=!1;if(hi(t))e=!isNaN(Number(t));else if(function(t){return"[object Number]"===Object.prototype.toString.call(t)}(t)){if(pi(t))return!1;e=!0}return e}function di(t){return"[object Array]"===Object.prototype.toString.call(t)}function yi(t){return"[object Object]"===Object.prototype.toString.call(t)}function bi(t){return!!function(t){return"[object Undefined]"===Object.prototype.toString.call(t)}(t)||(!!function(t){return"[object Null]"===Object.prototype.toString.call(t)}(t)||(!!function(t){if(yi(t)){for(let e in t)return!1;return!0}return!1}(t)||(!!function(t){return!(!li(t)||""!==t)}(t)||(!!function(t){return!!di(t)&&0===t.length}(t)||!!pi(t)))))}function _i(t){return!!di(t)&&(0!==t.length&&(1!==t.length||!bi(t[0])))}function gi(t){if(yi(t)){for(let e in t)return!0;return!1}return!1}var ji=m,mi=w;var wi=function(t){return!0===t||!1===t||mi(t)&&"[object Boolean]"==ji(t)};function $i(t){if(!vi(t))return 0;return ni(t)}var Oi={};!function(t,e){t.exports=function(){var t=1e3,e=6e4,r=36e5,n="millisecond",o="second",i="minute",a="hour",u="day",c="week",s="month",f="quarter",l="year",h="date",p="Invalid Date",v=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,d=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,y={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],r=t%100;return"["+t+(e[(r-20)%10]||e[r]||e[0])+"]"}},b=function(t,e,r){var n=String(t);return!n||n.length>=e?t:""+Array(e+1-n.length).join(r)+t},_={s:b,z:function(t){var e=-t.utcOffset(),r=Math.abs(e),n=Math.floor(r/60),o=r%60;return(e<=0?"+":"-")+b(n,2,"0")+":"+b(o,2,"0")},m:function t(e,r){if(e.date()<r.date())return-t(r,e);var n=12*(r.year()-e.year())+(r.month()-e.month()),o=e.clone().add(n,s),i=r-o<0,a=e.clone().add(n+(i?-1:1),s);return+(-(n+(r-o)/(i?o-a:a-o))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:s,y:l,w:c,d:u,D:h,h:a,m:i,s:o,ms:n,Q:f}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},g="en",j={};j[g]=y;var m=function(t){return t instanceof S},w=function t(e,r,n){var o;if(!e)return g;if("string"==typeof e){var i=e.toLowerCase();j[i]&&(o=i),r&&(j[i]=r,o=i);var a=e.split("-");if(!o&&a.length>1)return t(a[0])}else{var u=e.name;j[u]=e,o=u}return!n&&o&&(g=o),o||!n&&g},$=function(t,e){if(m(t))return t.clone();var r="object"==typeof e?e:{};return r.date=t,r.args=arguments,new S(r)},O=_;O.l=w,O.i=m,O.w=function(t,e){return $(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var S=function(){function y(t){this.$L=w(t.locale,null,!0),this.parse(t)}var b=y.prototype;return b.parse=function(t){this.$d=function(t){var e=t.date,r=t.utc;if(null===e)return new Date(NaN);if(O.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var n=e.match(v);if(n){var o=n[2]-1||0,i=(n[7]||"0").substring(0,3);return r?new Date(Date.UTC(n[1],o,n[3]||1,n[4]||0,n[5]||0,n[6]||0,i)):new Date(n[1],o,n[3]||1,n[4]||0,n[5]||0,n[6]||0,i)}}return new Date(e)}(t),this.$x=t.x||{},this.init()},b.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},b.$utils=function(){return O},b.isValid=function(){return!(this.$d.toString()===p)},b.isSame=function(t,e){var r=$(t);return this.startOf(e)<=r&&r<=this.endOf(e)},b.isAfter=function(t,e){return $(t)<this.startOf(e)},b.isBefore=function(t,e){return this.endOf(e)<$(t)},b.$g=function(t,e,r){return O.u(t)?this[e]:this.set(r,t)},b.unix=function(){return Math.floor(this.valueOf()/1e3)},b.valueOf=function(){return this.$d.getTime()},b.startOf=function(t,e){var r=this,n=!!O.u(e)||e,f=O.p(t),p=function(t,e){var o=O.w(r.$u?Date.UTC(r.$y,e,t):new Date(r.$y,e,t),r);return n?o:o.endOf(u)},v=function(t,e){return O.w(r.toDate()[t].apply(r.toDate("s"),(n?[0,0,0,0]:[23,59,59,999]).slice(e)),r)},d=this.$W,y=this.$M,b=this.$D,_="set"+(this.$u?"UTC":"");switch(f){case l:return n?p(1,0):p(31,11);case s:return n?p(1,y):p(0,y+1);case c:var g=this.$locale().weekStart||0,j=(d<g?d+7:d)-g;return p(n?b-j:b+(6-j),y);case u:case h:return v(_+"Hours",0);case a:return v(_+"Minutes",1);case i:return v(_+"Seconds",2);case o:return v(_+"Milliseconds",3);default:return this.clone()}},b.endOf=function(t){return this.startOf(t,!1)},b.$set=function(t,e){var r,c=O.p(t),f="set"+(this.$u?"UTC":""),p=(r={},r[u]=f+"Date",r[h]=f+"Date",r[s]=f+"Month",r[l]=f+"FullYear",r[a]=f+"Hours",r[i]=f+"Minutes",r[o]=f+"Seconds",r[n]=f+"Milliseconds",r)[c],v=c===u?this.$D+(e-this.$W):e;if(c===s||c===l){var d=this.clone().set(h,1);d.$d[p](v),d.init(),this.$d=d.set(h,Math.min(this.$D,d.daysInMonth())).$d}else p&&this.$d[p](v);return this.init(),this},b.set=function(t,e){return this.clone().$set(t,e)},b.get=function(t){return this[O.p(t)]()},b.add=function(n,f){var h,p=this;n=Number(n);var v=O.p(f),d=function(t){var e=$(p);return O.w(e.date(e.date()+Math.round(t*n)),p)};if(v===s)return this.set(s,this.$M+n);if(v===l)return this.set(l,this.$y+n);if(v===u)return d(1);if(v===c)return d(7);var y=(h={},h[i]=e,h[a]=r,h[o]=t,h)[v]||1,b=this.$d.getTime()+n*y;return O.w(b,this)},b.subtract=function(t,e){return this.add(-1*t,e)},b.format=function(t){var e=this,r=this.$locale();if(!this.isValid())return r.invalidDate||p;var n=t||"YYYY-MM-DDTHH:mm:ssZ",o=O.z(this),i=this.$H,a=this.$m,u=this.$M,c=r.weekdays,s=r.months,f=r.meridiem,l=function(t,r,o,i){return t&&(t[r]||t(e,n))||o[r].slice(0,i)},h=function(t){return O.s(i%12||12,t,"0")},v=f||function(t,e,r){var n=t<12?"AM":"PM";return r?n.toLowerCase():n};return n.replace(d,(function(t,n){return n||function(t){switch(t){case"YY":return String(e.$y).slice(-2);case"YYYY":return O.s(e.$y,4,"0");case"M":return u+1;case"MM":return O.s(u+1,2,"0");case"MMM":return l(r.monthsShort,u,s,3);case"MMMM":return l(s,u);case"D":return e.$D;case"DD":return O.s(e.$D,2,"0");case"d":return String(e.$W);case"dd":return l(r.weekdaysMin,e.$W,c,2);case"ddd":return l(r.weekdaysShort,e.$W,c,3);case"dddd":return c[e.$W];case"H":return String(i);case"HH":return O.s(i,2,"0");case"h":return h(1);case"hh":return h(2);case"a":return v(i,a,!0);case"A":return v(i,a,!1);case"m":return String(a);case"mm":return O.s(a,2,"0");case"s":return String(e.$s);case"ss":return O.s(e.$s,2,"0");case"SSS":return O.s(e.$ms,3,"0");case"Z":return o}return null}(t)||o.replace(":","")}))},b.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},b.diff=function(n,h,p){var v,d=this,y=O.p(h),b=$(n),_=(b.utcOffset()-this.utcOffset())*e,g=this-b,j=function(){return O.m(d,b)};switch(y){case l:v=j()/12;break;case s:v=j();break;case f:v=j()/3;break;case c:v=(g-_)/6048e5;break;case u:v=(g-_)/864e5;break;case a:v=g/r;break;case i:v=g/e;break;case o:v=g/t;break;default:v=g}return p?v:O.a(v)},b.daysInMonth=function(){return this.endOf(s).$D},b.$locale=function(){return j[this.$L]},b.locale=function(t,e){if(!t)return this.$L;var r=this.clone(),n=w(t,e,!0);return n&&(r.$L=n),r},b.clone=function(){return O.w(this.$d,this)},b.toDate=function(){return new Date(this.valueOf())},b.toJSON=function(){return this.isValid()?this.toISOString():null},b.toISOString=function(){return this.$d.toISOString()},b.toString=function(){return this.$d.toUTCString()},y}(),M=S.prototype;return $.prototype=M,[["$ms",n],["$s",o],["$m",i],["$H",a],["$W",u],["$M",s],["$y",l],["$D",h]].forEach((function(t){M[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),$.extend=function(t,e){return t.$i||(t(e,S,$),t.$i=!0),$},$.locale=w,$.isDayjs=m,$.unix=function(t){return $(1e3*t)},$.en=j[g],$.Ls=j,$.p={},$}()}({get exports(){return Oi},set exports(t){Oi=t}});var Si=Oi;function Mi(){return Si().format("YYYYMMDDHHmmss")}var Di=ii;var xi=function(t){return"number"==typeof t&&t==Di(t)};var Ai=ii,ki=ti,zi=se,Fi=s.isFinite,Pi=Math.min;var Ti=function(t){var e=Math[t];return function(t,r){if(t=ki(t),(r=null==r?0:Pi(Ai(r),292))&&Fi(t)){var n=(zi(t)+"e").split("e"),o=e(n[0]+"e"+(+n[1]+r));return+((n=(zi(o)+"e").split("e"))[0]+"e"+(+n[1]-r))}return e(t)}}("round");function Ni(t){if(!vi(t))return 0;t=$i(t);let e=Ti(t);return"0"===String(e)?0:e}function Li(t){if(!function(t){return!!vi(t)&&(t=$i(t),xi(t))}(t))return!1;return Ni(t)>0}let Yi="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),Ei=Yi.length;function Ci(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:32,e=[];t=Li(t)?Ni(t):32;for(let r=0;r<t;r++)e[r]=Yi[0|Math.random()*Ei];return e.join("")}function Hi(e){return!!t.existsSync(e)&&(!t.lstatSync(e).isDirectory()&&!t.lstatSync(e).isSymbolicLink())}let Ii=t.readFileSync("./node_modules/highcharts/highcharts.js","utf8"),Ui=t.readFileSync("./node_modules/highcharts/modules/stock.js","utf8"),Wi=t.readFileSync("./node_modules/highcharts/modules/heatmap.js","utf8"),Bi=t.readFileSync("./node_modules/highcharts/modules/annotations.js","utf8"),Vi=t.readFileSync("./node_modules/highcharts/modules/boost.js","utf8"),qi=t.readFileSync("./node_modules/highcharts/modules/boost-canvas.js","utf8"),Ji=process.cwd();return async function(){let n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:700,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:400,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:3,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},u=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};if(!vi(n))return Promise.reject("width is not a number");if(n=$i(n),n<=0)return Promise.reject("width <= 0");if(!vi(o))return Promise.reject("height is not a number");if(o=$i(o),o<=0)return Promise.reject("height <= 0");if(!vi(i))return Promise.reject("scale is not a number");if(i=$i(i),i<=0)return Promise.reject("scale <= 0");if(!gi(a)&&!hi(a))return Promise.reject("opt is not an effective object or string");let c=me(u,"addScripts");_i(c)||(c=[]);let s=me(u,"addCode");_i(s)||(s="");let f=me(u,"useWindowOpt");wi(f)||(f=!1);let l=me(u,"executablePath",""),h=me(u,"executableFolder","");if(hi(h)&&!hi(l)){let r=function(r){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,o=1;return function r(i){let a=[],u=t.readdirSync(i);return kr(u,(function(u){let c=e.resolve(i,u),s=null;try{s=t.statSync(c)}catch(t){}s&&s.isDirectory()?(a.push({isFolder:!0,level:o,path:c,name:e.basename(c)}),o+=1,(o<=n||null===n)&&(a=a.concat(r(c))),o-=1):a.push({isFolder:!1,level:o,path:c,name:e.basename(c)})})),a}(r)}(h,null),n=fi(r,(t=>"chrome.exe"===t.name));if(!gi(n))throw new Error(`can not find chrome.exe in executableFolder[${h}]`);l=n.path}let p="let _opt=",v="";f&&(p="",v="let _opt=window.opt;");let d=a;gi(a)&&(d=JSON.stringify(a));let y=`./whpic-${Mi()}-${Ci()}.png`,b=e.resolve(Ji,y),_=`./whweb-${Mi()}-${Ci()}.html`,g=e.resolve(Ji,_),j="";kr(c,(t=>{j+=`<script src="${t}"><\/script>`}));let m='\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>highcharts to png</title>\n\n  <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"><\/script>\n\n  <script>{code_highcharts}<\/script>\n  <script>{code_stock}<\/script>\n  <script>{code_heatmap}<\/script>\n  <script>{code_annotations}<\/script>\n  <script>{code_boost}<\/script>\n  <script>{code_boost_canvas}<\/script>\n\n  {add_scripts}\n\n  <script>{add_code}<\/script>\n\n</head>\n<body style="padding:0; margin:0;">\n\n    <div id="hc" style="width:{width}px; height:{height}px;"></div>\n\n    <script>\n\n        {cLetOptStart}{cOpt}\n        {cLetOptEnd}\n\n        //opt若為物件時, 強制關閉動畫避免過慢顯示無法截到數據圖\n        _.set(_opt, \'chart.animation\', false)\n        _.set(_opt, \'plotOptions.series.animation\', false)\n        // console.log(\'_opt\', _opt)\n    \n        Highcharts.chart(\'hc\', _opt)\n\n    <\/script>\n\n</body>\n</html>\n';m=m.replace("{width}",n),m=m.replace("{height}",o),m=m.replace("{cLetOptStart}",p),m=m.replace("{cLetOptEnd}",v),m=m.replace("{cOpt}",d),m=m.replace("{code_highcharts}",Ii),m=m.replace("{code_stock}",Ui),m=m.replace("{code_heatmap}",Wi),m=m.replace("{code_annotations}",Bi),m=m.replace("{code_boost}",Vi),m=m.replace("{code_boost_canvas}",qi),m=m.replace("{add_scripts}",j),m=m.replace("{add_code}",s),t.writeFileSync(g,m,"utf8");let w="";return await(async()=>{let e={headless:"new",slowMo:20};hi(l)&&(e.executablePath=l);let a=await r.launch(e),u=await a.newPage(),c={x:0,y:0,width:Number(n),height:Number(o),deviceScaleFactor:Number(i)};await u.goto(g),await u.setViewport(c),await u.screenshot({path:b}),await a.close(),w=t.readFileSync(b,{encoding:"base64"})})().catch((t=>{console.log(t)})),Hi(g)&&t.unlinkSync(g),Hi(b)&&t.unlinkSync(b),w}}));
//# sourceMappingURL=w-hc-2-png.umd.js.map
