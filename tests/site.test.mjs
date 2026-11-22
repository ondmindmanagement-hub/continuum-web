import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=async(name)=>readFile(new URL("../"+name,import.meta.url),"utf8");
test("product-first Continuum brand",async()=>{
 const html=await read("index.html");
 assert.match(html,/<title>Continuum — Make progress continuous<\/title>/);
 assert.match(html,/>continuum<small>by Unfire<\/small>/);
 assert.doesNotMatch(html,/<title>Unfire Continuum/);
});
test("real interactive workflow controls are present",async()=>{
 const html=await read("index.html");
 for(const id of ["advance","pause","reset","new-task","task-name","task-engine","task-review","filter","export","tasks","events"]){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
});
test("demonstration is clearly synthetic and private",async()=>{
 const html=await read("index.html");
 assert.match(html,/SYNTHETIC DATA ONLY/);
 assert.match(html,/Not a connection to Continuum's private macOS engines/);
 assert.match(html,/no backend calls|inside this page/i);
});
test("no third-party JavaScript or styles are loaded",async()=>{
 const html=await read("index.html");
 assert.match(html,/<script type="module" src="main.mjs"><\/script>/);
 assert.match(html,/<link rel="stylesheet" href="style.css">/);
 assert.doesNotMatch(html,/src="https?:\/\//);
 assert.doesNotMatch(html,/href="https?:\/\/[^"]+\.css/);
});
test("strict CSP and no-referrer policy",async()=>{
 const html=await read("index.html");
 assert.match(html,/Content-Security-Policy/);
 assert.match(html,/connect-src 'none'/);
 assert.match(html,/script-src 'self'/);
 assert.match(html,/form-action 'none'/);
 assert.match(html,/name="referrer" content="no-referrer"/);
});
test("no external API or tracking code in authored scripts",async()=>{
 const js=(await read("main.mjs"))+"\n"+(await read("engine.mjs"));
 assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|gtag|localStorage|sessionStorage/);
 assert.match(js,/Blob\(/);
 assert.match(js,/URL\.createObjectURL/);
 assert.match(js,/textContent/);
});
test("reduced-motion and narrow screen styling",async()=>{
 const css=await read("style.css");
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/max-width:510px/);
 assert.match(css,/:focus/);
});
test("contact is an optional email and no required phone",async()=>{
 const html=await read("index.html");
 assert.match(html,/mailto:hello@unfire\.technology/);
 assert.doesNotMatch(html,/tel:/);
});
test("source text does not embed local Mac home paths",async()=>{
 const text=[await read("index.html"),await read("main.mjs"),await read("engine.mjs"),await read("style.css")].join("\n");
 assert.doesNotMatch(text,/\/Users\/omarbaro\/|\/Library\/Application Support\//);
});
