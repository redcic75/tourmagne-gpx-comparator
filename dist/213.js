(self.webpackChunktourmagne_gpx_comparator=self.webpackChunktourmagne_gpx_comparator||[]).push([[213],{95:function(t){"undefined"!=typeof self&&self,t.exports=function(t){var n={};function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}return e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:r})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,n){if(1&n&&(t=e(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var o in t)e.d(r,o,function(n){return t[n]}.bind(null,o));return r},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},e.p="",e(e.s=0)}([function(t,n,e){"use strict";e.r(n),e.d(n,"computeDestinationPoint",(function(){return W})),e.d(n,"convertArea",(function(){return k})),e.d(n,"convertDistance",(function(){return C})),e.d(n,"convertSpeed",(function(){return T})),e.d(n,"decimalToSexagesimal",(function(){return $})),e.d(n,"findNearest",(function(){return B})),e.d(n,"getAreaOfPolygon",(function(){return K})),e.d(n,"getBounds",(function(){return G})),e.d(n,"getBoundsOfDistance",(function(){return Y})),e.d(n,"getCenter",(function(){return Z})),e.d(n,"getCenterOfBounds",(function(){return V})),e.d(n,"getCompassDirection",(function(){return z})),e.d(n,"getCoordinateKey",(function(){return m})),e.d(n,"getCoordinateKeys",(function(){return S})),e.d(n,"getDistance",(function(){return R})),e.d(n,"getDistanceFromLine",(function(){return H})),e.d(n,"getGreatCircleBearing",(function(){return J})),e.d(n,"getLatitude",(function(){return E})),e.d(n,"getLongitude",(function(){return L})),e.d(n,"getPathLength",(function(){return tt})),e.d(n,"getPreciseDistance",(function(){return nt})),e.d(n,"getRhumbLineBearing",(function(){return U})),e.d(n,"getRoughCompassDirection",(function(){return et})),e.d(n,"getSpeed",(function(){return rt})),e.d(n,"isDecimal",(function(){return p})),e.d(n,"isPointInLine",(function(){return ot})),e.d(n,"isPointInPolygon",(function(){return it})),e.d(n,"isPointNearLine",(function(){return at})),e.d(n,"isPointWithinRadius",(function(){return ut})),e.d(n,"isSexagesimal",(function(){return v})),e.d(n,"isValidCoordinate",(function(){return P})),e.d(n,"isValidLatitude",(function(){return O})),e.d(n,"isValidLongitude",(function(){return w})),e.d(n,"orderByDistance",(function(){return X})),e.d(n,"sexagesimalToDecimal",(function(){return y})),e.d(n,"toDecimal",(function(){return j})),e.d(n,"toRad",(function(){return I})),e.d(n,"toDeg",(function(){return A})),e.d(n,"wktToPolygon",(function(){return st})),e.d(n,"sexagesimalPattern",(function(){return r})),e.d(n,"earthRadius",(function(){return o})),e.d(n,"MINLAT",(function(){return i})),e.d(n,"MAXLAT",(function(){return a})),e.d(n,"MINLON",(function(){return u})),e.d(n,"MAXLON",(function(){return c})),e.d(n,"longitudeKeys",(function(){return s})),e.d(n,"latitudeKeys",(function(){return l})),e.d(n,"altitudeKeys",(function(){return f})),e.d(n,"distanceConversion",(function(){return d})),e.d(n,"timeConversion",(function(){return g})),e.d(n,"areaConversion",(function(){return h}));var r=/^([0-9]{1,3})°\s*([0-9]{1,3}(?:\.(?:[0-9]{1,}))?)['′]\s*(([0-9]{1,3}(\.([0-9]{1,}))?)["″]\s*)?([NEOSW]?)$/,o=6378137,i=-90,a=90,u=-180,c=180,s=["lng","lon","longitude",0],l=["lat","latitude",1],f=["alt","altitude","elevation","elev",2],d={m:1,km:.001,cm:100,mm:1e3,mi:1/1609.344,sm:1/1852.216,ft:100/30.48,in:100/2.54,yd:1/.9144},g={m:60,h:3600,d:86400},h={m2:1,km2:1e-6,ha:1e-4,a:.01,ft2:10.763911,yd2:1.19599,in2:1550.0031};h.sqm=h.m2,h.sqkm=h.km2,h.sqft=h.ft2,h.sqyd=h.yd2,h.sqin=h.in2;var m=function(t,n){return n.reduce((function(n,e){if(null==t)throw new Error("'".concat(t,"' is no valid coordinate."));return Object.prototype.hasOwnProperty.call(t,e)&&void 0!==e&&void 0===n?(n=e,e):n}),void 0)},p=function(t){var n=t.toString().trim();return!isNaN(parseFloat(n))&&parseFloat(n)===Number(n)},v=function(t){return r.test(t.toString().trim())},y=function(t){var n=new RegExp(r).exec(t.toString().trim());if(null==n)throw new Error("Given value is not in sexagesimal format");var e=Number(n[2])/60||0,o=Number(n[4])/3600||0,i=parseFloat(n[1])+e+o;return["S","W"].includes(n[7])?-i:i};function b(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),e.push.apply(e,r)}return e}function M(t,n,e){return n in t?Object.defineProperty(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t}var S=function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{longitude:s,latitude:l,altitude:f},e=m(t,n.longitude),r=m(t,n.latitude),o=m(t,n.altitude);return function(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?b(Object(e),!0).forEach((function(n){M(t,n,e[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):b(Object(e)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))}))}return t}({latitude:r,longitude:e},o?{altitude:o}:{})},O=function t(n){return p(n)?!(parseFloat(n)>a||n<i):!!v(n)&&t(y(n))},w=function t(n){return p(n)?!(parseFloat(n)>c||n<u):!!v(n)&&t(y(n))},P=function(t){var n=S(t),e=n.latitude,r=n.longitude;if(Array.isArray(t)&&t.length>=2)return w(t[0])&&O(t[1]);if(void 0===e||void 0===r)return!1;var o=t[r],i=t[e];return void 0!==i&&void 0!==o&&!1!==O(i)&&!1!==w(o)};function D(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),e.push.apply(e,r)}return e}function N(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?D(Object(e),!0).forEach((function(n){x(t,n,e[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):D(Object(e)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))}))}return t}function x(t,n,e){return n in t?Object.defineProperty(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t}var j=function t(n){if(p(n))return Number(n);if(v(n))return y(n);if(P(n)){var e=S(n);return Array.isArray(n)?n.map((function(n,e){return[0,1].includes(e)?t(n):n})):N(N(N({},n),e.latitude&&x({},e.latitude,t(n[e.latitude]))),e.longitude&&x({},e.longitude,t(n[e.longitude])))}return Array.isArray(n)?n.map((function(n){return P(n)?t(n):n})):n},E=function(t,n){var e=m(t,l);if(null!=e){var r=t[e];return!0===n?r:j(r)}},L=function(t,n){var e=m(t,s);if(null!=e){var r=t[e];return!0===n?r:j(r)}},I=function(t){return t*Math.PI/180},A=function(t){return 180*t/Math.PI},W=function(t,n,e){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:6371e3,o=E(t),i=L(t),a=n/r,s=I(e),l=I(o),f=I(i),d=Math.asin(Math.sin(l)*Math.cos(a)+Math.cos(l)*Math.sin(a)*Math.cos(s)),g=f+Math.atan2(Math.sin(s)*Math.sin(a)*Math.cos(l),Math.cos(a)-Math.sin(l)*Math.sin(d)),h=A(g);return(h<u||h>c)&&(g=(g+3*Math.PI)%(2*Math.PI)-Math.PI,h=A(g)),{latitude:A(d),longitude:h}},k=function(t){var n=h[arguments.length>1&&void 0!==arguments[1]?arguments[1]:"m"];if(n)return t*n;throw new Error("Invalid unit used for area conversion.")},C=function(t){var n=d[arguments.length>1&&void 0!==arguments[1]?arguments[1]:"m"];if(n)return t*n;throw new Error("Invalid unit used for distance conversion.")},T=function(t){switch(arguments.length>1&&void 0!==arguments[1]?arguments[1]:"kmh"){case"kmh":return t*g.h*d.km;case"mph":return t*g.h*d.mi;default:return t}};function F(t,n){return function(t){if(Array.isArray(t))return t}(t)||function(t,n){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var e=[],r=!0,o=!1,i=void 0;try{for(var a,u=t[Symbol.iterator]();!(r=(a=u.next()).done)&&(e.push(a.value),!n||e.length!==n);r=!0);}catch(t){o=!0,i=t}finally{try{r||null==u.return||u.return()}finally{if(o)throw i}}return e}}(t,n)||function(t,n){if(t){if("string"==typeof t)return _(t,n);var e=Object.prototype.toString.call(t).slice(8,-1);return"Object"===e&&t.constructor&&(e=t.constructor.name),"Map"===e||"Set"===e?Array.from(t):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?_(t,n):void 0}}(t,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=new Array(n);e<n;e++)r[e]=t[e];return r}var $=function(t){var n=F(t.toString().split("."),2),e=n[0],r=n[1],o=Math.abs(Number(e)),i=60*Number("0."+(r||0)),a=i.toString().split("."),u=Math.floor(i),c=F(function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:4,e=Math.pow(10,n);return Math.round(t*e)/e}(60*Number("0."+(a[1]||0))).toString().split("."),2),s=c[0],l=c[1],f=void 0===l?"0":l;return o+"° "+u.toString().padStart(2,"0")+"' "+s.padStart(2,"0")+"."+f.padEnd(1,"0")+'"'},q=function(t){return t>1?1:t<-1?-1:t},R=function(t,n){var e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;e=void 0===e||isNaN(e)?1:e;var r=E(t),i=L(t),a=E(n),u=L(n),c=Math.acos(q(Math.sin(I(a))*Math.sin(I(r))+Math.cos(I(a))*Math.cos(I(r))*Math.cos(I(i)-I(u))))*o;return Math.round(c/e)*e},X=function(t,n){var e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:R;return e="function"==typeof e?e:R,n.slice().sort((function(n,r){return e(t,n)-e(t,r)}))},B=function(t,n){return X(t,n)[0]},K=function(t){var n=0;if(t.length>2){for(var e,r,i,a=0;a<t.length;a++){a===t.length-2?(e=t.length-2,r=t.length-1,i=0):a===t.length-1?(e=t.length-1,r=0,i=1):(e=a,r=a+1,i=a+2);var u=L(t[e]),c=E(t[r]),s=L(t[i]);n+=(I(s)-I(u))*Math.sin(I(c))}n=n*o*o/2}return Math.abs(n)},G=function(t){if(!1===Array.isArray(t)||0===t.length)throw new Error("No points were given.");return t.reduce((function(t,n){var e=E(n),r=L(n);return{maxLat:Math.max(e,t.maxLat),minLat:Math.min(e,t.minLat),maxLng:Math.max(r,t.maxLng),minLng:Math.min(r,t.minLng)}}),{maxLat:-1/0,minLat:1/0,maxLng:-1/0,minLng:1/0})},Y=function(t,n){var e,r,s=E(t),l=L(t),f=I(s),d=I(l),g=n/o,h=f-g,m=f+g,p=I(a),v=I(i),y=I(c),b=I(u);if(h>v&&m<p){var M=Math.asin(Math.sin(g)/Math.cos(f));(e=d-M)<b&&(e+=2*Math.PI),(r=d+M)>y&&(r-=2*Math.PI)}else h=Math.max(h,v),m=Math.min(m,p),e=b,r=y;return[{latitude:A(h),longitude:A(e)},{latitude:A(m),longitude:A(r)}]},Z=function(t){if(!1===Array.isArray(t)||0===t.length)return!1;var n=t.length,e=t.reduce((function(t,n){var e=I(E(n)),r=I(L(n));return{X:t.X+Math.cos(e)*Math.cos(r),Y:t.Y+Math.cos(e)*Math.sin(r),Z:t.Z+Math.sin(e)}}),{X:0,Y:0,Z:0}),r=e.X/n,o=e.Y/n,i=e.Z/n;return{longitude:A(Math.atan2(o,r)),latitude:A(Math.atan2(i,Math.sqrt(r*r+o*o)))}},V=function(t){var n=G(t),e=n.minLat+(n.maxLat-n.minLat)/2,r=n.minLng+(n.maxLng-n.minLng)/2;return{latitude:parseFloat(e.toFixed(6)),longitude:parseFloat(r.toFixed(6))}},U=function(t,n){var e=I(L(n))-I(L(t)),r=Math.log(Math.tan(I(E(n))/2+Math.PI/4)/Math.tan(I(E(t))/2+Math.PI/4));return Math.abs(e)>Math.PI&&(e=e>0?-1*(2*Math.PI-e):2*Math.PI+e),(A(Math.atan2(e,r))+360)%360},z=function(t,n){var e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:U,r="function"==typeof e?e(t,n):U(t,n);if(isNaN(r))throw new Error("Could not calculate bearing for given points. Check your bearing function");switch(Math.round(r/22.5)){case 1:return"NNE";case 2:return"NE";case 3:return"ENE";case 4:return"E";case 5:return"ESE";case 6:return"SE";case 7:return"SSE";case 8:return"S";case 9:return"SSW";case 10:return"SW";case 11:return"WSW";case 12:return"W";case 13:return"WNW";case 14:return"NW";case 15:return"NNW";default:return"N"}},H=function(t,n,e){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1,o=R(n,t,r),i=R(t,e,r),a=R(n,e,r),u=Math.acos(q((o*o+a*a-i*i)/(2*o*a))),c=Math.acos(q((i*i+a*a-o*o)/(2*i*a)));return u>Math.PI/2?o:c>Math.PI/2?i:Math.sin(u)*o},J=function(t,n){var e=E(n),r=L(n),o=E(t),i=L(t);return(A(Math.atan2(Math.sin(I(r)-I(i))*Math.cos(I(e)),Math.cos(I(o))*Math.sin(I(e))-Math.sin(I(o))*Math.cos(I(e))*Math.cos(I(r)-I(i))))+360)%360};function Q(t){return(Q="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}var tt=function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:R;return t.reduce((function(t,e){return"object"===Q(t)&&null!==t.last&&(t.distance+=n(e,t.last)),t.last=e,t}),{last:null,distance:0}).distance},nt=function(t,n){var e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;e=void 0===e||isNaN(e)?1:e;var r,i,a,u,c,s,l,f=E(t),d=L(t),g=E(n),h=L(n),m=6356752.314245,p=1/298.257223563,v=I(h-d),y=Math.atan((1-p)*Math.tan(I(parseFloat(f)))),b=Math.atan((1-p)*Math.tan(I(parseFloat(g)))),M=Math.sin(y),S=Math.cos(y),O=Math.sin(b),w=Math.cos(b),P=v,D=100;do{var N=Math.sin(P),x=Math.cos(P);if(0===(s=Math.sqrt(w*N*(w*N)+(S*O-M*w*x)*(S*O-M*w*x))))return 0;r=M*O+S*w*x,i=Math.atan2(s,r),c=r-2*M*O/(u=1-(a=S*w*N/s)*a),isNaN(c)&&(c=0);var j=p/16*u*(4+p*(4-3*u));l=P,P=v+(1-j)*p*a*(i+j*s*(c+j*r*(2*c*c-1)))}while(Math.abs(P-l)>1e-12&&--D>0);if(0===D)return NaN;var A=u*(o*o-m*m)/(m*m),W=A/1024*(256+A*(A*(74-47*A)-128)),k=m*(1+A/16384*(4096+A*(A*(320-175*A)-768)))*(i-W*s*(c+W/4*(r*(2*c*c-1)-W/6*c*(4*s*s-3)*(4*c*c-3))));return Math.round(k/e)*e},et=function(t){return/^NNE|NE|NNW|N$/.test(t)?"N":/^ENE|E|ESE|SE$/.test(t)?"E":/^SSE|S|SSW|SW$/.test(t)?"S":/^WSW|W|WNW|NW$/.test(t)?"W":void 0},rt=function(t,n){return(arguments.length>2&&void 0!==arguments[2]?arguments[2]:R)(t,n)/(Number(n.time)-Number(t.time))*1e3},ot=function(t,n,e){return R(n,t)+R(t,e)===R(n,e)},it=function(t,n){for(var e=!1,r=n.length,o=-1,i=r-1;++o<r;i=o)(L(n[o])<=L(t)&&L(t)<L(n[i])||L(n[i])<=L(t)&&L(t)<L(n[o]))&&E(t)<(E(n[i])-E(n[o]))*(L(t)-L(n[o]))/(L(n[i])-L(n[o]))+E(n[o])&&(e=!e);return e},at=function(t,n,e,r){return H(t,n,e)<r},ut=function(t,n,e){return R(t,n)<e};function ct(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=new Array(n);e<n;e++)r[e]=t[e];return r}var st=function(t){if(!t.startsWith("POLYGON"))throw new Error("Invalid wkt.");return t.slice(t.indexOf("(")+2,t.indexOf(")")).split(", ").map((function(t){var n=function(t,n){return function(t){if(Array.isArray(t))return t}(t)||function(t,n){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var e=[],r=!0,o=!1,i=void 0;try{for(var a,u=t[Symbol.iterator]();!(r=(a=u.next()).done)&&(e.push(a.value),!n||e.length!==n);r=!0);}catch(t){o=!0,i=t}finally{try{r||null==u.return||u.return()}finally{if(o)throw i}}return e}}(t,n)||function(t,n){if(t){if("string"==typeof t)return ct(t,n);var e=Object.prototype.toString.call(t).slice(8,-1);return"Object"===e&&t.constructor&&(e=t.constructor.name),"Map"===e||"Set"===e?Array.from(t):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?ct(t,n):void 0}}(t,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}(t.split(" "),2),e=n[0],r=n[1];return{longitude:parseFloat(e),latitude:parseFloat(r)}}))}}])},213:(t,n,e)=>{const r=e(95),o=(t,n,e)=>{(t=>{const{tolerance:n,trigger:e}=t;if(n<e)throw new Error("La tolérance d'écart doit être supérieure ou égale au seuil de déclenchement.")})(e),console.log("  - Calculating closest challenger points to each reference points...");const o=((t,n,e)=>{const{trigger:o,maxDetour:i,maxSegLength:a}=e,u=new Date(n[0].time).valueOf(),c=(t,n,e,o=1)=>{const i=r.getDistance(n,t,o),a=r.getDistance(t,e,o),u=r.getDistance(n,e,o);return 0===i||0===a?0:0===u?i:r.getDistanceFromLine(t,n,e)};let s=0,l=!1;return t.map(((e,f)=>{const d=(Math.round(f/t.length*1e4)/100).toFixed(2);"object"!=typeof process&&(console.log("posting"),postMessage({name:"progress",progress:d})),console.log(`    - Progress: ${d} %`);let g,h,m,p=s,v=0;for(m=l?i:1/0;p+1<n.length&&v<=m;){let t;if(t=r.getDistance(n[p],n[p+1])<a?c(e,n[p],n[p+1]):r.getDistance(e,n[p]),(!h||t<h)&&(h=t,g=p),h<=o){s=p,l=!0;break}v+=r.getDistance(n[p],n[p+1]),p+=1}return{lat:e.lat,lon:e.lon,time:new Date(n[g].time).valueOf()-u,closestDistance:h}}))})(t,n,e);console.log("  - Calculating closest missed reference points...");const i=((t,n)=>{const{trigger:e,tolerance:r}=n,o=new Array(t.length);let i=1,a=0;for(;a<t.length;)if(t[a].closestDistance<=e)o[a]=null,a+=1;else{const n=a;let u=a,c=!1;for(;u<t.length&&t[u].closestDistance>e;)t[u].closestDistance>r&&(c=!0),u+=1;c?(o.fill(i,n,u),i+=1):o.fill(null,n,u),a=u}return t.map(((t,n)=>({...t,missedSegmentNb:o[n]})))})(o,e);console.log("  - Generating missed segments GPX file and challenger accuracy...");const a=(t=>{const n=[],e=Math.max(...t.map((t=>t.missedSegmentNb)).filter((t=>null!==t)));for(let r=1;r<=e;r+=1){const e=t.filter((t=>t.missedSegmentNb===r)).map((t=>({lat:t.lat,lon:t.lon})));n.push(e)}return n})(i),u=((t,n)=>{const e=r.getPathLength(t),o=n.reduce(((t,n)=>t+r.getPathLength(n)),0);return{refDistance:e,missedDistance:o,offTrackRatio:o/e}})(t,a);console.log("  - Calculating Kpis...");const c=((t,n)=>{const{rollingDuration:e}=n,o=(t=>{let n=0,e=0;return t.map(((t,o,i)=>{let a;if(0===o)a=0;else{const u=r.getDistance(t,i[o-1]);null===t.missedSegmentNb&&null===i[o-1].missedSegmentNb?(a=t.time,n=e+u,e=n):(a=null,n=null)}return{elapsedTime:a,cumulatedDistance:n}}))})(t),i=((t,n)=>{const e=3600*n*1e3;let r=0;return t.map(((t,n,o)=>{let i,a;if(null===t.elapsedTime)return{rollingDurationDistance:null,rollingDurationEndIndex:null};const u=t.elapsedTime+e;for(;r<o.length&&!(null!==o[r].elapsedTime&&o[r].elapsedTime>u);)r+=1;return r===o.length?(i=null,a=null):(i=o[r].cumulatedDistance-o[n].cumulatedDistance,a=r),{rollingDurationDistance:i,rollingDurationEndIndex:a}}))})(o,e),a=i.map((t=>t.rollingDurationDistance)),u=Math.min(...a.filter((t=>null!=t))),c=a.indexOf(u),s=i[c]?.rollingDurationEndIndex,l=o[c]?.elapsedTime,f=o[s]?.elapsedTime,d=o[c]?.cumulatedDistance,g=o[s]?.cumulatedDistance,h={index:c,elapsedTime:l,distance:d},m={index:s,elapsedTime:f,distance:g},p=m.distance-h.distance;return{rollingDuration:e,slowestSegmentStart:h,slowestSegmentEnd:m,distance:p,meanSpeed:p/1e3/e}})(i,e),s=t.slice(c.slowestSegmentStart.index,c.slowestSegmentEnd.index+1);return{tracks:{missedSegments:a,ref:[t],chall:[n],worst:[s]},accuracy:u,kpi:c}};onmessage=t=>{console.log("Starting compareTracks worker");const n=o(t.data.refPoints,t.data.challPoints,t.data.options);postMessage({name:"results",results:n})},t.exports=o}}]);