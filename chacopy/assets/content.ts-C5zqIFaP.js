(function(){function K(e){const t=e.cloneNode(!0);return X(t),J(t),Q(t),t}function X(e){var r,i;const t=Array.from(e.querySelectorAll("pre")),n=e.ownerDocument??document;for(const o of t){const l=o.querySelector("div.flex.items-center.text-token-text-primary"),s=((r=l==null?void 0:l.textContent)==null?void 0:r.trim())??"",a=o.querySelector(".cm-content");if(!a)continue;const c=a.cloneNode(!0),f=c.querySelectorAll(".cm-line");if(f.length>0)for(const m of Array.from(f))(i=m.textContent)!=null&&i.endsWith(`
`)||m.appendChild(n.createTextNode(`
`));else{const m=c.querySelectorAll("br");for(const G of Array.from(m))G.replaceWith(`
`)}const d=n.createElement("pre"),h=n.createElement("code");s&&(h.className=`language-${s}`),h.textContent=c.textContent,d.appendChild(h),o.replaceWith(d)}}function J(e){var r,i;const t=Array.from(e.querySelectorAll("span.katex-display"));for(const o of t){const l=o.querySelector('annotation[encoding="application/x-tex"]');if(!l)continue;const s=((r=l.textContent)==null?void 0:r.trim())??"",a=R(`

$$${s}$$

`,e);o.replaceWith(a)}const n=Array.from(e.querySelectorAll("span.katex"));for(const o of n){const l=o.querySelector('annotation[encoding="application/x-tex"]');if(!l)continue;const s=((i=l.textContent)==null?void 0:i.trim())??"",a=R(`$${s}$`,e);o.replaceWith(a)}}function R(e,t){const r=(t.ownerDocument??document).createElement("span");return r.setAttribute("data-chacopy-math","true"),r.textContent=e,r}function Q(e){for(const t of e.querySelectorAll("[data-footnotes], .citation, sup"))t.remove()}function Z(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}function b(e,t){return Array(t+1).join(e)}function I(e){return e.replace(/^\n*/,"")}function $(e){for(var t=e.length;t>0&&e[t-1]===`
`;)t--;return e.substring(0,t)}function H(e){return $(I(e))}var ee=["ADDRESS","ARTICLE","ASIDE","AUDIO","BLOCKQUOTE","BODY","CANVAS","CENTER","DD","DIR","DIV","DL","DT","FIELDSET","FIGCAPTION","FIGURE","FOOTER","FORM","FRAMESET","H1","H2","H3","H4","H5","H6","HEADER","HGROUP","HR","HTML","ISINDEX","LI","MAIN","MENU","NAV","NOFRAMES","NOSCRIPT","OL","OUTPUT","P","PRE","SECTION","TABLE","TBODY","TD","TFOOT","TH","THEAD","TR","UL"];function E(e){return T(e,ee)}var _=["AREA","BASE","BR","COL","COMMAND","EMBED","HR","IMG","INPUT","KEYGEN","LINK","META","PARAM","SOURCE","TRACK","WBR"];function q(e){return T(e,_)}function te(e){return W(e,_)}var F=["A","TABLE","THEAD","TBODY","TFOOT","TH","TD","IFRAME","SCRIPT","AUDIO","VIDEO"];function ne(e){return T(e,F)}function re(e){return W(e,F)}function T(e,t){return t.indexOf(e.nodeName)>=0}function W(e,t){return e.getElementsByTagName&&t.some(function(n){return e.getElementsByTagName(n).length})}var u={};u.paragraph={filter:"p",replacement:function(e){return`

`+e+`

`}};u.lineBreak={filter:"br",replacement:function(e,t,n){return n.br+`
`}};u.heading={filter:["h1","h2","h3","h4","h5","h6"],replacement:function(e,t,n){var r=Number(t.nodeName.charAt(1));if(n.headingStyle==="setext"&&r<3){var i=b(r===1?"=":"-",e.length);return`

`+e+`
`+i+`

`}else return`

`+b("#",r)+" "+e+`

`}};u.blockquote={filter:"blockquote",replacement:function(e){return e=H(e).replace(/^/gm,"> "),`

`+e+`

`}};u.list={filter:["ul","ol"],replacement:function(e,t){var n=t.parentNode;return n.nodeName==="LI"&&n.lastElementChild===t?`
`+e:`

`+e+`

`}};u.listItem={filter:"li",replacement:function(e,t,n){var r=n.bulletListMarker+"   ",i=t.parentNode;if(i.nodeName==="OL"){var o=i.getAttribute("start"),l=Array.prototype.indexOf.call(i.children,t);r=(o?Number(o)+l:l+1)+".  "}var s=/\n$/.test(e);return e=H(e)+(s?`
`:""),e=e.replace(/\n/gm,`
`+" ".repeat(r.length)),r+e+(t.nextSibling?`
`:"")}};u.indentedCodeBlock={filter:function(e,t){return t.codeBlockStyle==="indented"&&e.nodeName==="PRE"&&e.firstChild&&e.firstChild.nodeName==="CODE"},replacement:function(e,t,n){return`

    `+t.firstChild.textContent.replace(/\n/g,`
    `)+`

`}};u.fencedCodeBlock={filter:function(e,t){return t.codeBlockStyle==="fenced"&&e.nodeName==="PRE"&&e.firstChild&&e.firstChild.nodeName==="CODE"},replacement:function(e,t,n){for(var r=t.firstChild.getAttribute("class")||"",i=(r.match(/language-(\S+)/)||[null,""])[1],o=t.firstChild.textContent,l=n.fence.charAt(0),s=3,a=new RegExp("^"+l+"{3,}","gm"),c;c=a.exec(o);)c[0].length>=s&&(s=c[0].length+1);var f=b(l,s);return`

`+f+i+`
`+o.replace(/\n$/,"")+`
`+f+`

`}};u.horizontalRule={filter:"hr",replacement:function(e,t,n){return`

`+n.hr+`

`}};u.inlineLink={filter:function(e,t){return t.linkStyle==="inlined"&&e.nodeName==="A"&&e.getAttribute("href")},replacement:function(e,t){var n=t.getAttribute("href");n&&(n=n.replace(/([()])/g,"\\$1"));var r=g(t.getAttribute("title"));return r&&(r=' "'+r.replace(/"/g,'\\"')+'"'),"["+e+"]("+n+r+")"}};u.referenceLink={filter:function(e,t){return t.linkStyle==="referenced"&&e.nodeName==="A"&&e.getAttribute("href")},replacement:function(e,t,n){var r=t.getAttribute("href"),i=g(t.getAttribute("title"));i&&(i=' "'+i+'"');var o,l;switch(n.linkReferenceStyle){case"collapsed":o="["+e+"][]",l="["+e+"]: "+r+i;break;case"shortcut":o="["+e+"]",l="["+e+"]: "+r+i;break;default:var s=this.references.length+1;o="["+e+"]["+s+"]",l="["+s+"]: "+r+i}return this.references.push(l),o},references:[],append:function(e){var t="";return this.references.length&&(t=`

`+this.references.join(`
`)+`

`,this.references=[]),t}};u.emphasis={filter:["em","i"],replacement:function(e,t,n){return e.trim()?n.emDelimiter+e+n.emDelimiter:""}};u.strong={filter:["strong","b"],replacement:function(e,t,n){return e.trim()?n.strongDelimiter+e+n.strongDelimiter:""}};u.code={filter:function(e){var t=e.previousSibling||e.nextSibling,n=e.parentNode.nodeName==="PRE"&&!t;return e.nodeName==="CODE"&&!n},replacement:function(e){if(!e)return"";e=e.replace(/\r?\n|\r/g," ");for(var t=/^`|^ .*?[^ ].* $|`$/.test(e)?" ":"",n="`",r=e.match(/`+/gm)||[];r.indexOf(n)!==-1;)n=n+"`";return n+t+e+t+n}};u.image={filter:"img",replacement:function(e,t){var n=g(t.getAttribute("alt")),r=t.getAttribute("src")||"",i=g(t.getAttribute("title")),o=i?' "'+i+'"':"";return r?"!["+n+"]("+r+o+")":""}};function g(e){return e?e.replace(/(\n+\s*)+/g,`
`):""}function U(e){this.options=e,this._keep=[],this._remove=[],this.blankRule={replacement:e.blankReplacement},this.keepReplacement=e.keepReplacement,this.defaultRule={replacement:e.defaultReplacement},this.array=[];for(var t in e.rules)this.array.push(e.rules[t])}U.prototype={add:function(e,t){this.array.unshift(t)},keep:function(e){this._keep.unshift({filter:e,replacement:this.keepReplacement})},remove:function(e){this._remove.unshift({filter:e,replacement:function(){return""}})},forNode:function(e){if(e.isBlank)return this.blankRule;var t;return(t=y(this.array,e,this.options))||(t=y(this._keep,e,this.options))||(t=y(this._remove,e,this.options))?t:this.defaultRule},forEach:function(e){for(var t=0;t<this.array.length;t++)e(this.array[t],t)}};function y(e,t,n){for(var r=0;r<e.length;r++){var i=e[r];if(ie(i,t,n))return i}}function ie(e,t,n){var r=e.filter;if(typeof r=="string"){if(r===t.nodeName.toLowerCase())return!0}else if(Array.isArray(r)){if(r.indexOf(t.nodeName.toLowerCase())>-1)return!0}else if(typeof r=="function"){if(r.call(e,t,n))return!0}else throw new TypeError("`filter` needs to be a string, array, or function")}function oe(e){var t=e.element,n=e.isBlock,r=e.isVoid,i=e.isPre||function(d){return d.nodeName==="PRE"};if(!(!t.firstChild||i(t))){for(var o=null,l=!1,s=null,a=w(s,t,i);a!==t;){if(a.nodeType===3||a.nodeType===4){var c=a.data.replace(/[ \r\n\t]+/g," ");if((!o||/ $/.test(o.data))&&!l&&c[0]===" "&&(c=c.substr(1)),!c){a=C(a);continue}a.data=c,o=a}else if(a.nodeType===1)n(a)||a.nodeName==="BR"?(o&&(o.data=o.data.replace(/ $/,"")),o=null,l=!1):r(a)||i(a)?(o=null,l=!0):o&&(l=!1);else{a=C(a);continue}var f=w(s,a,i);s=a,a=f}o&&(o.data=o.data.replace(/ $/,""),o.data||C(o))}}function C(e){var t=e.nextSibling||e.parentNode;return e.parentNode.removeChild(e),t}function w(e,t,n){return e&&e.parentNode===t||n(t)?t.nextSibling||t.parentNode:t.firstChild||t.nextSibling||t.parentNode}var k=typeof window<"u"?window:{};function ae(){var e=k.DOMParser,t=!1;try{new e().parseFromString("","text/html")&&(t=!0)}catch{}return t}function le(){var e=function(){};return se()?e.prototype.parseFromString=function(t){var n=new window.ActiveXObject("htmlfile");return n.designMode="on",n.open(),n.write(t),n.close(),n}:e.prototype.parseFromString=function(t){var n=document.implementation.createHTMLDocument("");return n.open(),n.write(t),n.close(),n},e}function se(){var e=!1;try{document.implementation.createHTMLDocument("").open()}catch{k.ActiveXObject&&(e=!0)}return e}var ce=ae()?k.DOMParser:le();function ue(e,t){var n;if(typeof e=="string"){var r=fe().parseFromString('<x-turndown id="turndown-root">'+e+"</x-turndown>","text/html");n=r.getElementById("turndown-root")}else n=e.cloneNode(!0);return oe({element:n,isBlock:E,isVoid:q,isPre:t.preformattedCode?de:null}),n}var N;function fe(){return N=N||new ce,N}function de(e){return e.nodeName==="PRE"||e.nodeName==="CODE"}function he(e,t){return e.isBlock=E(e),e.isCode=e.nodeName==="CODE"||e.parentNode.isCode,e.isBlank=pe(e),e.flankingWhitespace=me(e,t),e}function pe(e){return!q(e)&&!ne(e)&&/^\s*$/i.test(e.textContent)&&!te(e)&&!re(e)}function me(e,t){if(e.isBlock||t.preformattedCode&&e.isCode)return{leading:"",trailing:""};var n=ge(e.textContent);return n.leadingAscii&&O("left",e,t)&&(n.leading=n.leadingNonAscii),n.trailingAscii&&O("right",e,t)&&(n.trailing=n.trailingNonAscii),{leading:n.leading,trailing:n.trailing}}function ge(e){var t=e.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);return{leading:t[1],leadingAscii:t[2],leadingNonAscii:t[3],trailing:t[4],trailingNonAscii:t[5],trailingAscii:t[6]}}function O(e,t,n){var r,i,o;return e==="left"?(r=t.previousSibling,i=/ $/):(r=t.nextSibling,i=/^ /),r&&(r.nodeType===3?o=i.test(r.nodeValue):n.preformattedCode&&r.nodeName==="CODE"?o=!1:r.nodeType===1&&!E(r)&&(o=i.test(r.textContent))),o}var ve=Array.prototype.reduce,ye=[[/\\/g,"\\\\"],[/\*/g,"\\*"],[/^-/g,"\\-"],[/^\+ /g,"\\+ "],[/^(=+)/g,"\\$1"],[/^(#{1,6}) /g,"\\$1 "],[/`/g,"\\`"],[/^~~~/g,"\\~~~"],[/\[/g,"\\["],[/\]/g,"\\]"],[/^>/g,"\\>"],[/_/g,"\\_"],[/^(\d+)\. /g,"$1\\. "]];function v(e){if(!(this instanceof v))return new v(e);var t={rules:u,headingStyle:"setext",hr:"* * *",bulletListMarker:"*",codeBlockStyle:"indented",fence:"```",emDelimiter:"_",strongDelimiter:"**",linkStyle:"inlined",linkReferenceStyle:"full",br:"  ",preformattedCode:!1,blankReplacement:function(n,r){return r.isBlock?`

`:""},keepReplacement:function(n,r){return r.isBlock?`

`+r.outerHTML+`

`:r.outerHTML},defaultReplacement:function(n,r){return r.isBlock?`

`+n+`

`:n}};this.options=Z({},t,e),this.rules=new U(this.options)}v.prototype={turndown:function(e){if(!Ae(e))throw new TypeError(e+" is not a string, or an element/document/fragment node.");if(e==="")return"";var t=V.call(this,new ue(e,this.options));return Ce.call(this,t)},use:function(e){if(Array.isArray(e))for(var t=0;t<e.length;t++)this.use(e[t]);else if(typeof e=="function")e(this);else throw new TypeError("plugin must be a Function or an Array of Functions");return this},addRule:function(e,t){return this.rules.add(e,t),this},keep:function(e){return this.rules.keep(e),this},remove:function(e){return this.rules.remove(e),this},escape:function(e){return ye.reduce(function(t,n){return t.replace(n[0],n[1])},e)}};function V(e){var t=this;return ve.call(e.childNodes,function(n,r){r=new he(r,t.options);var i="";return r.nodeType===3?i=r.isCode?r.nodeValue:t.escape(r.nodeValue):r.nodeType===1&&(i=Ne.call(t,r)),j(n,i)},"")}function Ce(e){var t=this;return this.rules.forEach(function(n){typeof n.append=="function"&&(e=j(e,n.append(t.options)))}),e.replace(/^[\t\r\n]+/,"").replace(/[\t\r\n\s]+$/,"")}function Ne(e){var t=this.rules.forNode(e),n=V.call(this,e),r=e.flankingWhitespace;return(r.leading||r.trailing)&&(n=n.trim()),r.leading+t.replacement(n,e,this.options)+r.trailing}function j(e,t){var n=$(e),r=I(t),i=Math.max(e.length-n.length,t.length-r.length),o=`

`.substring(0,i);return n+o+r}function Ae(e){return e!=null&&(typeof e=="string"||e.nodeType&&(e.nodeType===1||e.nodeType===9||e.nodeType===11))}var B=/highlight-(?:text|source)-([a-z0-9]+)/;function be(e){e.addRule("highlightedCodeBlock",{filter:function(t){var n=t.firstChild;return t.nodeName==="DIV"&&B.test(t.className)&&n&&n.nodeName==="PRE"},replacement:function(t,n,r){var i=n.className||"",o=(i.match(B)||[null,""])[1];return`

`+r.fence+o+`
`+n.firstChild.textContent+`
`+r.fence+`

`}})}function xe(e){e.addRule("strikethrough",{filter:["del","s","strike"],replacement:function(t){return"~"+t+"~"}})}var Ee=Array.prototype.indexOf,Te=Array.prototype.every,p={};p.tableCell={filter:["th","td"],replacement:function(e,t){return Y(e,t)}};p.tableRow={filter:"tr",replacement:function(e,t){var n="",r={left:":--",right:"--:",center:":-:"};if(S(t))for(var i=0;i<t.childNodes.length;i++){var o="---",l=(t.childNodes[i].getAttribute("align")||"").toLowerCase();l&&(o=r[l]||o),n+=Y(o,t.childNodes[i])}return`
`+e+(n?`
`+n:"")}};p.table={filter:function(e){return e.nodeName==="TABLE"&&S(e.rows[0])},replacement:function(e){return e=e.replace(`

`,`
`),`

`+e+`

`}};p.tableSection={filter:["thead","tbody","tfoot"],replacement:function(e){return e}};function S(e){var t=e.parentNode;return t.nodeName==="THEAD"||t.firstChild===e&&(t.nodeName==="TABLE"||ke(t))&&Te.call(e.childNodes,function(n){return n.nodeName==="TH"})}function ke(e){var t=e.previousSibling;return e.nodeName==="TBODY"&&(!t||t.nodeName==="THEAD"&&/^\s*$/i.test(t.textContent))}function Y(e,t){var n=Ee.call(t.parentNode.childNodes,t),r=" ";return n===0&&(r="| "),r+e+" |"}function Se(e){e.keep(function(n){return n.nodeName==="TABLE"&&!S(n.rows[0])});for(var t in p)e.addRule(t,p[t])}function Re(e){e.addRule("taskListItems",{filter:function(t){return t.type==="checkbox"&&t.parentNode.nodeName==="LI"},replacement:function(t,n){return(n.checked?"[x]":"[ ]")+" "}})}function we(e){e.use([be,xe,Se,Re])}let A=null;function Oe(){if(A)return A;const e=new v({headingStyle:"atx",hr:"---",bulletListMarker:"-",codeBlockStyle:"fenced",fence:"```",strongDelimiter:"**",emDelimiter:"_"});return e.use(we),e.addRule("chacopy-math",{filter(t){return t.nodeName==="SPAN"&&t.hasAttribute("data-chacopy-math")},replacement(t,n){return n.textContent??""}}),e.addRule("linebreak",{filter:["br"],replacement(){return`
`}}),e.addRule("strikethrough-double",{filter:["del","s"],replacement(t){return`~~${t}~~`}}),e.addRule("checkbox",{filter(t){return t.nodeName==="INPUT"&&t.type==="checkbox"},replacement(t,n){return n.checked?"[x] ":"[ ] "}}),e.escape=t=>t,A=e,e}function Be(e){return Le(e)}function Le(e){const t=De(e),n=/[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E\p{P}]/u;let r="",i=!1;for(const{text:o,protected:l}of t){if(l){r+=o;continue}const s=o.replace(/\\\*\\\*/g,"**").split("**");for(let a=0;a<s.length;a++){if(a===0){r+=s[a];continue}if(i){r+="**";const c=s[a-1],f=s[a],d=c.slice(-1),h=f[0]??"";c.length>0&&f.length>0&&n.test(d)&&!/\s/.test(h)&&!n.test(h)&&(r+=" "),i=!1}else{const c=s[a],f=r.slice(-1),d=c[0]??"";r.length>0&&c.length>0&&n.test(d)&&!/\s/.test(f)&&!n.test(f)&&(r+=" "),r+="**",i=!0}r+=s[a]}}return r}function De(e){const t=[];let n=0,r=0;for(;n<e.length;){if((n===0||e[n-1]===`
`)&&e.startsWith("```",n)){n>r&&t.push({text:e.slice(r,n),protected:!1});const i=e.indexOf("\n```",n+3),o=i===-1?e.length:i+4;t.push({text:e.slice(n,o),protected:!0}),n=o,r=n;continue}if((n===0||e[n-1]===`
`)&&e.startsWith("$$",n)){n>r&&t.push({text:e.slice(r,n),protected:!1});const i=e.indexOf("$$",n+2),o=i===-1?e.length:i+2;t.push({text:e.slice(n,o),protected:!0}),n=o,r=n;continue}if(e[n]==="`"&&e[n+1]!=="`"){n>r&&t.push({text:e.slice(r,n),protected:!1});const i=e.indexOf("`",n+1),o=i===-1?e.length:i+1;t.push({text:e.slice(n,o),protected:!0}),n=o,r=n;continue}if(e[n]==="$"&&e[n+1]!=="$"){n>r&&t.push({text:e.slice(r,n),protected:!1});const i=e.indexOf("$",n+1),o=i===-1?e.length:i+1;t.push({text:e.slice(n,o),protected:!0}),n=o,r=n;continue}n++}return r<e.length&&t.push({text:e.slice(r),protected:!1}),t}function Me(e){const t=K(e),r=Oe().turndown(t);return Be(r)}const L="data-chacopy-injected",z='[data-testid="copy-turn-action-button"]',Pe=".markdown.prose";function Ie(){const e=document.querySelectorAll('article[data-testid^="conversation-turn-"]');for(const t of e)t.querySelector('[data-message-author-role="assistant"]')&&t.querySelector(z)&&x(t)}function x(e){if(e.hasAttribute(L))return;const t=e.querySelector(z);if(!t)return;const n=$e(e);t.insertAdjacentElement("afterend",n),e.setAttribute(L,"true")}function $e(e){const t=document.createElement("button");t.setAttribute("aria-label","Copy as Markdown"),t.setAttribute("title","Copy as Markdown (ChaCopy)"),t.style.cssText=`
        font-size: 12px;
        font-weight: 600;
        padding: 6px 10px;
        cursor: pointer;
        border: 1px solid transparent;
        border-radius: 8px;
        background-color: transparent;
        color: #00ff7f;
        transition: all 150ms cubic-bezier(0.2, 0, 0.38, 0.9);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        position: relative;
        opacity: 0.8;
    `;const n=document.createElement("img");n.src=chrome.runtime.getURL("img/chacopy_icon48.png"),n.alt="Copy",n.style.cssText="width: 19px; height: 19px; object-fit: contain;",t.appendChild(n);const r=t.innerHTML;return t.addEventListener("mouseenter",()=>{t.style.backgroundColor="var(--hover-bg, rgba(0, 0, 0, 0.05))",t.style.borderColor="var(--hover-border, rgba(0, 0, 0, 0.08))",t.style.opacity="1"}),t.addEventListener("mouseleave",()=>{t.style.backgroundColor="transparent",t.style.borderColor="transparent",t.style.opacity="0.8"}),t.addEventListener("mousedown",()=>{t.style.transform="scale(0.95)"}),t.addEventListener("mouseup",()=>{t.style.transform="scale(1)"}),t.addEventListener("click",()=>void He(e,t,r)),t}async function He(e,t,n){const r=e.querySelector(Pe);if(!r){console.warn("[ChaCopy] メッセージ要素が見つかりません");return}console.log("[ChaCopy] コンテンツを Markdown に変換中..."),console.log(r);const i=Me(r);try{await navigator.clipboard.writeText(i),t.innerHTML="",t.textContent="Copied!",setTimeout(()=>{t.innerHTML=n},1500)}catch(o){console.error("[ChaCopy] クリップボード書き込み失敗:",o),t.innerHTML="",t.style.color="#ff4500",t.textContent="ERROR",setTimeout(()=>{t.innerHTML=n},1500)}}const D='article[data-testid^="conversation-turn-"]',M='[data-testid="copy-turn-action-button"]';function _e(){const e=document.querySelector("main")??document.body;new MutationObserver(n=>{for(const r of n)for(const i of r.addedNodes)if(i instanceof HTMLElement){if(i.matches(D)){P(i);continue}for(const o of i.querySelectorAll(D))P(o)}}).observe(e,{childList:!0,subtree:!0})}function P(e){qe(e)&&Fe(e)}function qe(e){return e.querySelector('[data-message-author-role="assistant"]')!==null}function Fe(e){if(e.querySelector(M)){x(e);return}new MutationObserver((n,r)=>{e.querySelector(M)&&(r.disconnect(),x(e))}).observe(e,{childList:!0,subtree:!0})}Ie();_e();
})()
