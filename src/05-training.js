const ago=d=>new Date(d).toLocaleDateString(undefined,{month:"short",day:"numeric"});

function barracks(){
  const wk=S.log.filter(l=>Date.now()-l.d<6048e5).length,md=logged().length;
  return `<h1>Barracks</h1><p class="mu">Welcome back, ${esc(S.name)}.</p>
  ${hpCard()}
  <div class="stats"><div class="stat"><b>${S.log.length}</b><span>Workouts</span></div><div class="stat"><b>${wk}</b><span>This week</span></div><div class="stat"><b>${md}</b><span>Medallions</span></div></div>
  <button class="btn" onclick="go('training')">Start training</button>
  <div class="card row" style="margin-top:12px">${coin(28)}<div class="sp"><b style="font:700 22px Cinzel,serif">${S.gold.toLocaleString()}</b><div class="mu" style="margin:0;font-size:13px">Gold${S.inv.length?" · "+S.inv.length+" item"+(S.inv.length==1?"":"s")+" owned":""}</div></div><button class="btn sm" onclick="store()">Store</button></div>
  <h2>Recent workouts</h2>${S.log.length?S.log.slice(-3).reverse().map(l=>`<div class="card row"><div class="sp">${esc(l.name)}</div><span class="mu" style="margin:0">${ago(l.d)}${l.dur?" · "+Math.max(1,Math.round(l.dur/6e4))+" min":""}</span></div>`).join(""):'<p class="mu">Nothing logged yet. Your finished workouts show up here.</p>'}`;
}

function pool(g){return G[g].filter(e=>mode=="h"?e[3]=="h":mode=="d"?e[3]=="d":e[3]!="h").map(e=>e[0])}
const exRow=(e,r,sub)=>`<div class="row" style="padding:5px 0"><div class="sp">${e}${sub?`<div class="mu" style="margin:0;font-size:12px">${sub}</div>`:""}</div>${r||""}<button class="btn sm ghost" onclick="info('${e}')">Info</button></div>`;
const chipRow=(opts,cur,fn)=>`<div class="chips">${opts.map(([k,l])=>`<button class="chip ${cur==k?"on":""}" onclick="${fn}('${k}')">${l}</button>`).join("")}</div>`;
function training(){
  if(run)return runView();
  if(build)return builder();
  if(prev)return `<h1>${esc(prev.name)}</h1><p class="mu">Preview your exercises. Tap Info to see form and muscles worked.</p><div class="card">${prev.ex.map(e=>exRow(e)).join("")}</div><button class="btn" onclick="begin(prev.ex,prev.name);prev=null">Start workout</button><div class="gap"><button class="btn ghost" onclick="prev=null;render()">Back</button></div>`;
  const M0=MODES.find(m=>m[0]==mode);
  return `<h1>Training</h1><p class="mu">Build a workout or run a saved routine.</p>
  <div class="card"><h2>Generate a workout</h2>${chipRow(MODES.map(m=>[m[0],m[1]]),mode,"sm")}<p class="mu" style="font-size:13px">${M0[2]}</p>
  <div class="chips">${Object.keys(G).map(g=>`<button class="chip ${sel.has(g)?"on":""}" onclick="tg('${g}')">${g}</button>`).join("")}</div>
  <button class="btn" ${sel.size?"":"disabled"} onclick="mk()">${gen?"Regenerate":"Generate"} workout</button></div>
  <button class="btn ghost" style="margin-bottom:12px" onclick="build={name:'',ex:[]};bq='';render()">Create your own routine</button>
  ${gen?`<div class="card"><h2>Your ${M0[1].toLowerCase()} workout</h2>${gen.map(e=>exRow(e,`<span class="mu" style="margin:0">${EX[e].t=="r"?"3 × max":EX[e].t=="m"?"1 × time":"3 × 8–12"}</span>`)).join("")}
  <input id="rn" placeholder="Routine name" style="margin-top:10px"><div class="gap"><button class="btn sm" onclick="begin(gen,'${M0[1]} workout')">Start</button><button class="btn sm ghost" onclick="sv()">Save routine</button></div></div>`:""}
  <h2>Saved routines</h2>${S.routines.length?S.routines.map((r,i)=>`<div class="card"><div class="row"><div class="sp"><b>${esc(r.name)}</b><div class="mu" style="margin:0">${r.ex.length} exercises</div></div><button class="btn sm ghost" onclick="prev=S.routines[${i}];render()">Preview</button><button class="btn sm" onclick="begin(S.routines[${i}].ex,S.routines[${i}].name)">Start</button><button class="btn sm ghost" aria-label="Delete routine" onclick="S.routines.splice(${i},1);save();render()">Delete</button></div></div>`).join(""):'<p class="mu">No routines yet. Generate or create one.</p>'}`;
}
const EQS=[["all","All"],["h","Home"],["d","Dumbbells"],["g","Gym"]],norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const hit=(n,q)=>{const a=" "+norm(n);return norm(q).split(" ").every(w=>a.includes(" "+w))};
const sbar=(v,fn,lbl)=>`<input type="search" class="srch" enterkeyhint="search" autocomplete="off" aria-label="${lbl}" placeholder="${lbl}" value="${esc(v)}" oninput="${fn}(this.value)">`;
function blist(){
  const s=bq.trim(),l=(s?Object.values(G).flat().filter(e=>hit(e[0],s)):G[bg]).filter(e=>bm=="all"||e[3]==bm);
  return l.length?`<div class="card">${l.map(e=>exRow(e[0],build.ex.includes(e[0])?'<span class="mu" style="margin:0">Added</span>':`<button class="btn sm" onclick="build.ex.push('${e[0]}');render()">Add</button>`,s?EX[e[0]].g+" · "+EQ[e[3]]:"")).join("")}</div>`:`<p class="mu">No exercises match${s?" “"+esc(s)+"”":""}.</p>`;
}
function sbq(v){const was=!!bq.trim();bq=v;if(was!=!!v.trim()){const g=$("#bgc");if(g)g.hidden=!!v.trim()}$("#bl").innerHTML=blist()}
function builder(){
  return `<h1>New routine</h1><p class="mu">Name it, then add exercises from any muscle group.</p>
  <div class="card"><input aria-label="Routine name" placeholder="Routine name" value="${esc(build.name)}" oninput="build.name=this.value"><h2>Your exercises</h2>
  ${build.ex.length?build.ex.map((e,i)=>exRow(e,`<button class="btn sm ghost" onclick="build.ex.splice(${i},1);render()">Remove</button>`)).join(""):'<p class="mu">No exercises yet. Add some below.</p>'}
  <div class="gap"><button class="btn sm" onclick="bsave()">Save routine</button><button class="btn sm ghost" onclick="build=null;render()">Cancel</button></div></div>
  <h2>Add exercises</h2>${sbar(bq,"sbq","Search all exercises")}<div id="bgc" ${bq.trim()?"hidden":""}>${chipRow(Object.keys(G).map(g=>[g,g]),bg,"sbg")}</div>${chipRow(EQS,bm,"sbm")}
  <div id="bl">${blist()}</div>`;
}
const sm=k=>{mode=k;gen=null;render()},sbg=k=>{bg=k;render()},sbm=k=>{bm=k;render()};
function bsave(){if(!build.name.trim()||!build.ex.length){toast("Add a name and at least one exercise");return}S.routines.push({name:build.name.trim(),ex:[...build.ex]});save();build=null;render();toast("Routine saved")}

const restTxt=()=>{const m=run.rest.start+run.rest.dur*1e3-Date.now();return m>0?fmt(m+999):"Time to lift"};
function runView(){
  return `<h1>${esc(run.name)}</h1>
  <div class="card row"><span class="sp mu" style="margin:0">Workout time</span><b id="tm" style="font:700 24px Cinzel,serif">${fmt(Date.now()-run.t0)}</b></div>
  ${run.rest?`<div class="card" style="position:sticky;top:0;z-index:2;border-color:var(--acc)"><div class="row"><div class="sp"><span class="mu" style="margin:0">Rest</span><div id="rt" style="font:700 28px Cinzel,serif">${restTxt()}</div></div><button class="btn sm ghost" onclick="adj(-15)">−15s</button><button class="btn sm ghost" onclick="adj(15)">+15s</button><button class="btn sm" onclick="run.rest=null;render()">Skip</button></div><div class="mu" style="font-size:13px;margin:6px 0 0">Rest can range from 0:30 to 2:00. Default is set in Profile settings.</div></div>`:""}
  <p class="mu">Enter each set, then submit it to start your rest. Timed cardio is logged in minutes.</p>
  ${run.items.map((it,i)=>{const w=EX[it.ex].t=="w",u=UNIT(EX[it.ex].t);return `<div class="card"><div class="row"><b class="sp">${it.ex}</b><button class="btn sm ghost" onclick="info('${it.ex}')">Info</button>${medal(rk(it.ex),52,!!S.best[it.ex])}</div>
  ${it.rows.map((r,j)=>`<div class="set" style="grid-template-columns:28px ${w?"1fr 1fr":"1fr"} auto"><span>${j+1}</span>${w?`<input type="number" inputmode="decimal" placeholder="lb" aria-label="Weight" value="${r.w}" ${r.done?"disabled":""} oninput="run.items[${i}].rows[${j}].w=this.value">`:""}<input type="number" inputmode="numeric" placeholder="${u}" aria-label="${u=="min"?"Minutes":"Reps"}" value="${r.r}" ${r.done?"disabled":""} oninput="run.items[${i}].rows[${j}].r=this.value"><button class="btn sm ${r.done?"ghost":""}" onclick="subm(${i},${j})">${r.done?"Edit":"Submit"}</button></div>`).join("")}
  <div class="gap"><button class="btn sm ghost" onclick="run.items[${i}].rows.push({w:'',r:''});render()">Add set</button></div></div>`}).join("")}
  <button class="btn" onclick="fin()">Finish workout</button><div class="gap"><button class="btn ghost" onclick="run=null;render()">Cancel</button></div>`;
}
function subm(i,j){
  const r=run.items[i].rows[j],e=EX[run.items[i].ex];
  if(r.done){r.done=false;render();return}
  if(!(+r.r>0)||(e.t=="w"&&!(+r.w>0))){toast(e.t=="w"?"Enter weight and reps first":e.t=="m"?"Enter your minutes first":"Enter your reps first");return}
  r.done=true;run.rest={start:Date.now(),dur:Math.min(120,Math.max(30,S.rest||60)),done:false};render();
}
function adj(d){run.rest.dur=Math.min(120,Math.max(30,run.rest.dur+d));run.rest.done=false;render()}

function pinfo(ex){
  const i=rk(ex),b=S.best[ex],t=EX[ex].t,th=EX[ex].th,v=b?val(ex,b):0,nx=th[i],pv=i?th[i-1]:0;
  return{i,pr:b?(t!="w"?b+" "+UNIT(t):(S.pr&&S.pr[ex]?S.pr[ex].w+" lb × "+S.pr[ex].r:"not logged yet")):"",pct:i>=th.length?100:Math.max(0,Math.min(100,(v-pv)/(nx-pv)*100)),best:b?(t!="w"?b+" "+UNIT(t):Math.round(b)+" lb est. 1RM"):"",goal:i>=th.length?"Top rank reached":"Next: "+(t!="w"?nx+" "+UNIT(t):Math.round(nx*S.bw)+" lb")};
}
function pbox(ex){
  const P=S.pr&&S.pr[ex],bx=(v,u)=>`<div class="pbx"><b>${v}</b><span>${u}</span></div>`;
  return EX[ex].t!="w"?bx(S.best[ex],UNIT(EX[ex].t)):bx(P?P.w:"—","lb")+bx(P?P.r:"—","reps");
}
