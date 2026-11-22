// Continuum — a deliberately synthetic, dependency-free browser simulator.
// Does not connect to native macOS engines, customers, accounts, or AI providers.
export const STREAMS = Object.freeze({
  development: "Development & quality",
  projects: "Projects & release",
  coordination: "Coordination & resources"
});
export const STATES = Object.freeze(["queued","running","review","done","blocked"]);
const seed = [
  ["Review release checks", "development", true, "running"],
  ["Coordinate launch milestones", "projects", false, "queued"],
  ["Assess resource pressure", "coordination", true, "running"],
  ["Prepare review handoff", "projects", true, "review"],
  ["Collect test evidence", "development", false, "done"]
];
export function makeInitialState() {
  return { cycle: 0, paused: false, disabled: [], nextId: 6,
    tasks: seed.map((v,i)=>({id:i+1,title:v[0],engine:v[1],review:v[2],status:v[3]})),
    events: [{cycle:0,message:"Sample processes loaded. Nothing has been sent or executed outside this browser."}] };
}
export function summary(state) {
  return {total:state.tasks.length,
    running:state.tasks.filter(t=>t.status==="running").length,
    review:state.tasks.filter(t=>t.status==="review").length,
    done:state.tasks.filter(t=>t.status==="done").length};
}
function note(state,message) {
  state.events.unshift({cycle:state.cycle,message});
  state.events=state.events.slice(0,20);
}
export function update(state,action) {
  if(!state || !action || typeof action.type!=="string") throw Error("Invalid state or action");
  if(action.type==="reset") return makeInitialState();
  const n={...state,tasks:state.tasks.map(t=>({...t})),disabled:[...state.disabled],events:[...state.events]};
  if(action.type==="add"){
    const title=typeof action.title==="string"?action.title.trim():"";
    if(!title || title.length>65) throw Error("Use a task description of 1–65 characters.");
    if(!Object.hasOwn(STREAMS,action.engine)) throw Error("Unknown stream.");
    const item={id:n.nextId++,title,engine:action.engine,review:action.review===true,status:"queued"};
    n.tasks.unshift(item); note(n,"Created fictional process: "+title+".");
    return n;
  }
  if(action.type==="pauseAll"){
    n.paused=!n.paused;note(n,n.paused?"All simulated streams paused.":"All simulated streams resumed.");
    return n;
  }
  if(action.type==="toggleEngine"){
    if(!Object.hasOwn(STREAMS,action.engine)) throw Error("Unknown stream.");
    const i=n.disabled.indexOf(action.engine);
    if(i<0){n.disabled.push(action.engine);note(n,STREAMS[action.engine]+" paused.");}
    else{n.disabled.splice(i,1);note(n,STREAMS[action.engine]+" resumed.");}
    return n;
  }
  if(action.type==="cycle"){
    if(n.paused){note(n,"Cycle not advanced: all streams are paused.");return n;}
    n.cycle++;
    let moved=0;
    for(const task of n.tasks){
      if(n.disabled.includes(task.engine)) continue;
      if(task.status==="queued"){task.status="running";moved++;}
      else if(task.status==="running"){task.status=task.review?"review":"done";moved++;}
    }
    note(n,"Cycle "+n.cycle+": "+moved+" fictional processes advanced across available streams.");
    return n;
  }
  if(action.type==="approve" || action.type==="reject"){
    const task=n.tasks.find(t=>t.id===action.id);
    if(!task || task.status!=="review") throw Error("Only an awaiting-review process can be decided.");
    task.status=action.type==="approve"?"done":"blocked";
    note(n,(action.type==="approve"?"Simulated human approval: ":"Simulated rejection: ")+task.title+".");
    return n;
  }
  throw Error("Unknown action.");
}