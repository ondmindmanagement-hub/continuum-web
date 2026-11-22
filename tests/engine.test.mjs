import test from "node:test";
import assert from "node:assert/strict";
import {STREAMS,makeInitialState,summary,update} from "../engine.mjs";
const step=(s,a)=>update(s,a);
test("three explicit independent specialist streams",()=>assert.equal(Object.keys(STREAMS).length,3));
test("sample is synthetic and has at least one review",()=>{
 const s=makeInitialState();assert.equal(s.tasks.length,5);assert.equal(summary(s).review,1);
 assert.ok(s.tasks.every(t=>Object.hasOwn(STREAMS,t.engine)));
});
test("parallel cycle advances only eligible tasks",()=>{
 const a=makeInitialState(),b=step(a,{type:"cycle"});
 assert.equal(b.cycle,1);
 assert.equal(b.tasks.find(t=>t.id===1).status,"review");
 assert.equal(b.tasks.find(t=>t.id===2).status,"running");
 assert.equal(b.tasks.find(t=>t.id===3).status,"review");
 assert.equal(b.tasks.find(t=>t.id===4).status,"review");
 assert.equal(a.tasks.find(t=>t.id===1).status,"running");
});
test("review never auto-approves after repeated cycles",()=>{
 let s=makeInitialState();for(let i=0;i<12;i++)s=step(s,{type:"cycle"});
 for(const id of [1,3,4]) assert.equal(s.tasks.find(t=>t.id===id).status,"review");
});
test("human review simulation permits only reviewed items",()=>{
 const a=makeInitialState(),b=step(a,{type:"approve",id:4});
 assert.equal(b.tasks.find(t=>t.id===4).status,"done");
 assert.throws(()=>step(b,{type:"approve",id:4}),/Only an awaiting/);
 assert.throws(()=>step(a,{type:"approve",id:1}),/Only an awaiting/);
});
test("reject blocks, no automatic restart",()=>{
 let s=step(makeInitialState(),{type:"reject",id:4});
 for(let i=0;i<4;i++)s=step(s,{type:"cycle"});
 assert.equal(s.tasks.find(t=>t.id===4).status,"blocked");
});
test("paused global and individual engines cannot advance",()=>{
 let s=makeInitialState();s=step(s,{type:"pauseAll"});
 const b=step(s,{type:"cycle"});assert.equal(b.cycle,0);assert.deepEqual(b.tasks,s.tasks);
 let c=step(b,{type:"pauseAll"});c=step(c,{type:"toggleEngine",engine:"development"});
 c=step(c,{type:"cycle"});
 assert.equal(c.tasks.find(t=>t.id===1).status,"running");
 assert.equal(c.tasks.find(t=>t.id===2).status,"running");
});
test("valid new work is local and bounded",()=>{
 const a=makeInitialState(),b=step(a,{type:"add",title:"  Validate new pilot ",engine:"coordination",review:true});
 assert.equal(a.tasks.length,5);assert.equal(b.tasks.length,6);
 assert.equal(b.tasks[0].title,"Validate new pilot");
 assert.equal(b.tasks[0].status,"queued");
 assert.equal(b.tasks[0].review,true);
 assert.throws(()=>step(a,{type:"add",title:"",engine:"development"}),/1–65/);
 assert.throws(()=>step(a,{type:"add",title:"a".repeat(66),engine:"development"}),/1–65/);
 assert.throws(()=>step(a,{type:"add",title:"X",engine:"unknown"}),/Unknown stream/);
});
test("reset clears all browser sample modifications",()=>{
 const a=step(makeInitialState(),{type:"add",title:"Example",engine:"projects"});
 const b=step(a,{type:"reset"});
 assert.deepEqual(b,makeInitialState());
});
test("unknown actions fail closed",()=>assert.throws(()=>step(makeInitialState(),{type:"publish"}),/Unknown action/));
test("log is capped to avoid uncontrolled growth",()=>{
 let s=makeInitialState();
 for(let i=0;i<50;i++)s=step(s,{type:"cycle"});
 assert.equal(s.events.length,20);
});
