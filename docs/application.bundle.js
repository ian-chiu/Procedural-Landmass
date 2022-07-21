(()=>{"use strict";var e,t={477:function(e,t,n){var i=this&&this.__awaiter||function(e,t,n,i){return new(n||(n=Promise))((function(r,a){function o(e){try{l(i.next(e))}catch(e){a(e)}}function s(e){try{l(i.throw(e))}catch(e){a(e)}}function l(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,s)}l((i=i.apply(e,t||[])).next())}))},r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const a=r(n(754));t.default=class{constructor(e=new a.default){this.renderer=e.renderer,this._canvas=e,this._lastFrameTime=0,this.init()}run(){this.load().catch((e=>{console.log(e)})).finally((()=>{this._canvas.setEventCallback(this.handleEvent.bind(this)),this.onReady(),requestAnimationFrame(this.loop.bind(this))}))}onLoad(){return i(this,void 0,void 0,(function*(){}))}onUpdate(e){}onEvent(e){}onReady(){}init(){}load(){return i(this,void 0,void 0,(function*(){yield this.onLoad()}))}loop(e){this._canvas.needResizeOnLoop()&&this.handleEvent(new Event("resize")),0===this._lastFrameTime&&(this._lastFrameTime=e);const t=e-this._lastFrameTime;this._lastFrameTime=e,this.onUpdate(t),requestAnimationFrame(this.loop.bind(this))}handleEvent(e){this.onEvent(e)}}},754:function(e,t,n){var i=this&&this.__createBinding||(Object.create?function(e,t,n,i){void 0===i&&(i=n);var r=Object.getOwnPropertyDescriptor(t,n);r&&!("get"in r?!t.__esModule:r.writable||r.configurable)||(r={enumerable:!0,get:function(){return t[n]}}),Object.defineProperty(e,i,r)}:function(e,t,n,i){void 0===i&&(i=n),e[i]=t[n]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)"default"!==n&&Object.prototype.hasOwnProperty.call(e,n)&&i(t,e,n);return r(t,e),t};Object.defineProperty(t,"__esModule",{value:!0}),t.Canvas=void 0;const o=a(n(232));class s{constructor(e={}){let t;if(this.eventCallback=()=>{},void 0!==e.elementId){if(t=document.getElementById(e.elementId),void 0===t)throw new Error("Cannot find a canvas element named: "+e.elementId)}else t=document.createElement("canvas"),document.body.appendChild(t);e.width&&e.height?(t.width=e.width,t.height=e.height):(t.width=t.parentElement?t.parentElement.clientWidth:300,t.height=t.parentElement?t.parentElement.clientHeight:150),this.renderer=new o.WebGLRenderer({canvas:t}),t.addEventListener("mousemove",(e=>{this.eventCallback(e)})),t.addEventListener("wheel",(e=>{this.eventCallback(e)})),this.domElement=t}setEventCallback(e){this.eventCallback=e}needResizeOnLoop(){var e,t;const n=this.renderer.domElement,i=null===(e=n.parentElement)||void 0===e?void 0:e.clientWidth,r=null===(t=n.parentElement)||void 0===t?void 0:t.clientHeight,a=n.width!==i||n.height!==r;return a&&void 0!==i&&void 0!==r&&this.renderer.setSize(i,r,!1),a}get aspect(){return this.domElement.width/this.domElement.height}}t.Canvas=s,t.default=s}},n={};function i(e){var r=n[e];if(void 0!==r)return r.exports;var a=n[e]={exports:{}};return t[e].call(a.exports,a,a.exports,i),a.exports}i.m=t,e=[],i.O=(t,n,r,a)=>{if(!n){var o=1/0;for(h=0;h<e.length;h++){for(var[n,r,a]=e[h],s=!0,l=0;l<n.length;l++)(!1&a||o>=a)&&Object.keys(i.O).every((e=>i.O[e](n[l])))?n.splice(l--,1):(s=!1,a<o&&(o=a));if(s){e.splice(h--,1);var d=r();void 0!==d&&(t=d)}}return t}a=a||0;for(var h=e.length;h>0&&e[h-1][2]>a;h--)e[h]=e[h-1];e[h]=[n,r,a]},i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e={34:0,519:0};i.O.j=t=>0===e[t];var t=(t,n)=>{var r,a,[o,s,l]=n,d=0;if(o.some((t=>0!==e[t]))){for(r in s)i.o(s,r)&&(i.m[r]=s[r]);if(l)var h=l(i)}for(t&&t(n);d<o.length;d++)a=o[d],i.o(e,a)&&e[a]&&e[a][0](),e[a]=0;return i.O(h)},n=self.webpackChunkts_engine=self.webpackChunkts_engine||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})();var r=i.O(void 0,[232],(()=>i(477)));r=i.O(r)})();