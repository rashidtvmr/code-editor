"use strict";(()=>{var e={};e.id=184,e.ids=[184],e.modules={5600:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6287:e=>{e.exports=import("socket.io")},6762:(e,t)=>{Object.defineProperty(t,"M",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},1637:(e,t,r)=>{r.a(e,async(e,o)=>{try{r.r(t),r.d(t,{config:()=>u,default:()=>l,routeModule:()=>d});var s=r(9947),i=r(2706),n=r(6762),c=r(7239),a=e([c]);c=(a.then?(await a)():a)[0];let l=(0,n.M)(c,"default"),u=(0,n.M)(c,"config"),d=new s.PagesAPIRouteModule({definition:{kind:i.A.PAGES_API,page:"/api/socketio",pathname:"/api/socketio",bundlePath:"",filename:""},userland:c});o()}catch(e){o(e)}})},7239:(e,t,r)=>{r.a(e,async(e,o)=>{try{r.r(t),r.d(t,{config:()=>l,default:()=>a});var s=r(6287),i=r(9722),n=r.n(i),c=e([s]);s=(c.then?(await c)():c)[0];let l={api:{bodyParser:!1}};function a(e,t){if(!t.socket.server.io){let e=new s.Server(t.socket.server,{path:"/api/socketio",addTrailingSlash:!1});e.on("connection",t=>{let r;let o="index.html";t.on("join",({name:s})=>{r=t.id,n().cursors[r]={name:s,file:o,cursor:{lineNumber:1,column:1}},t.emit("init",{files:Object.keys(n().files),content:n().files[o],file:o,cursors:n().cursors}),t.broadcast.emit("user-joined",{userId:r,name:s}),e.emit("cursor-update",n().cursors)}),t.on("create-file",(t,r)=>{n().files[t]?r({success:!1,message:"File already exists."}):(n().files[t]="",e.emit("file-created",t),r({success:!0}))}),t.on("change-file",s=>{o=s,n().cursors[r]&&(n().cursors[r].file=s),t.emit("file-content",{file:s,content:n().files[s]}),e.emit("cursor-update",n().cursors)}),t.on("editor-change",({file:e,code:r})=>{void 0!==n().files[e]&&(n().files[e]=r,t.broadcast.emit("editor-change",{file:e,code:r}))}),t.on("cursor-move",e=>{n().cursors[r]&&(n().cursors[r].cursor=e),t.broadcast.emit("cursor-update",n().cursors)}),t.on("disconnect",()=>{delete n().cursors[r],e.emit("cursor-update",n().cursors)})}),t.socket.server.io=e}t.end()}o()}catch(e){o(e)}})},9722:e=>{let t={files:{"index.html":`<!DOCTYPE html>
  <html>
  <head>
    <title>Example</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
  </html>`,"style.css":`body { 
    margin:0; 
    padding:0; 
    font-family: sans-serif; 
  }`,"script.js":"console.log('Hello, world!');","app.jsx":`import React from 'react';
  export default function App() {
    return <div>Hello JSX</div>;
  }`,"component.tsx":`import React from 'react';
  type Props = {};
  const Component: React.FC<Props> = () => <div>TSX Component</div>;
  export default Component;`},cursors:{}};e.exports=t},2706:(e,t)=>{var r;Object.defineProperty(t,"A",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE",e.IMAGE="IMAGE"}(r||(r={}))},9947:(e,t,r)=>{e.exports=r(5600)}};var t=require("../../webpack-api-runtime.js");t.C(e);var r=t(t.s=1637);module.exports=r})();