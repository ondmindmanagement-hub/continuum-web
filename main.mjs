import {STREAMS,makeInitialState,summary,update} from "./engine.mjs";
let state=makeInitialState();
const $=id=>document.getElementById(id);
function node(tag,cls,text){
  const x=document.createElement(tag);
  if(cls)x.className=cls;
  if(text!==undefined)x.textContent=String(text);
  return x;
}
function render(){
  const s=summary(state);
  $("total").textContent=s.total;
  $("active").textContent=s.running;
  $("reviews").textContent=s.review;
  $("completed").textContent=s.done;
  $("pause").textContent=state.paused?"Resume all":"Pause all";
  $("advance").disabled=state.paused;
  $("advance").setAttribute("aria-disabled",String(state.paused));
  $("engines").replaceChildren();
  for(const [id,label] of Object.entries(STREAMS)){
    const d=node("section","engine");
    const title=node("span","engine-head");title.append(node("span","engine-dot"),document.createTextNode("Stream "+(Object.keys(STREAMS).indexOf(id)+1)));
    d.append(title,node("strong","",label));
    const count=state.tasks.filter(t=>t.engine===id && t.status!=="done" && t.status!=="blocked").length;
    d.append(node("small","",count+" open"));
    const btn=node("button","engine-switch",state.disabled.includes(id)?"Resume":"Pause");
    btn.type="button";btn.setAttribute("aria-label",(state.disabled.includes(id)?"Resume ":"Pause ")+label);
    btn.addEventListener("click",()=>act({type:"toggleEngine",engine:id}));
    d.append(btn);$("engines").append(d);
  }
  const shown=state.tasks.filter(t=>{
    const f=$("filter").value;
    return f==="all" || t.status===f || (f==="running" && t.status==="queued");
  });
  $("counter").textContent=shown.length+" visible · cycle "+state.cycle;
  $("empty").hidden=shown.length!==0;
  $("tasks").replaceChildren();
  const names={queued:"Queued",running:"In progress",review:"Needs review",done:"Completed",blocked:"Rejected"};
  for(const t of shown){
    const item=node("li","task"),symbol=node("div","task-icon",t.engine==="development"?"✦":t.engine==="projects"?"◈":"◎");
    symbol.setAttribute("aria-hidden","true");
    const main=node("div","task-main"),name=node("strong","",t.title);
    main.append(name,node("small","",STREAMS[t.engine]+(t.review?" · Human review gate":" · Automatic sample flow")));
    item.append(symbol,main);
    const controls=node("div","task-controls");
    controls.append(node("span","task-status "+t.status,names[t.status]));
    if(t.status==="review"){
      const a=node("button","","Approve sample");a.type="button";a.setAttribute("aria-label","Simulate approval for "+t.title);
      a.addEventListener("click",()=>act({type:"approve",id:t.id}));
      const r=node("button","reject","Reject");r.type="button";r.setAttribute("aria-label","Simulate rejection for "+t.title);
      r.addEventListener("click",()=>act({type:"reject",id:t.id}));
      controls.append(a,r);
    }
    item.append(controls);$("tasks").append(item);
  }
  $("events").replaceChildren();
  for(const e of state.events.slice(0,7)){
    const li=node("li");li.append(node("time","","CYCLE "+e.cycle),document.createTextNode(e.message));$("events").append(li);
  }
}
function act(a){
  try{state=update(state,a);render();$("message").textContent=state.events[0].message;}
  catch(error){$("message").textContent="No changes made: "+error.message;}
}
$("advance").addEventListener("click",()=>act({type:"cycle"}));
$("pause").addEventListener("click",()=>act({type:"pauseAll"}));
$("reset").addEventListener("click",()=>act({type:"reset"}));
$("filter").addEventListener("change",render);
$("new-task").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("task-name");
  const before=state;
  act({type:"add",title:name.value,engine:$("task-engine").value,review:$("task-review").checked});
  if(state!==before){name.value="";name.focus();}
});
$("export").addEventListener("click",()=>{
  // Explicit user gesture only: generate a local file. No server requests or upload.
  const payload={kind:"continuum-browser-fictional-workflow",researchOnly:true,exportedAt:new Date().toISOString(),
    ...state,notice:"This JSON contains synthetic local tasks only, not native Continuum data."};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="continuum-demo-export.json";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  $("message").textContent="Synthetic workflow exported locally as JSON.";
});
const live=node("p","demo-message","Interactive synthetic workflow ready.");
live.id="message";live.setAttribute("role","status");live.setAttribute("aria-live","polite");
$("tasks").after(live);
render();
// Expose non-mutating proof hooks for browser QA; never return private app data.
window.continuumDemo=Object.freeze({getSnapshot:()=>({cycle:state.cycle,paused:state.paused,...summary(state)}),version:"local-simulation-1"});