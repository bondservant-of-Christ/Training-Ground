// Camps, towns and quests. A zone's settlement is a section on the Map home, shown only while the player is in that zone.
// PLACES[zone] = {id, kind: label for the section ("Camp", later "Town" / "Tavern"), blurb, npcs: [npc id]}. Only the Training Yard has one so far.
// S.q[questId] = "active" | "done" (missing = not offered yet). Quest goals are checked live from the save, so progress can't get out of step.
const PLACES={0:{id:"camp",kind:"Camp",blurb:"Tents, a cook fire, and the people who keep the yard running.",npcs:["halvar"]}};
// A workout counts once at least one set was submitted. Entries from before workout details were recorded have no `ex` and count as done.
const didWorkout=()=>S.log.some(l=>!("ex" in l)||(l.ex&&l.ex.length>0));
const QUESTS={
  first:{npc:"halvar",title:"Earn Your Blade",goal:"Complete a workout",
    offer:"New to the yard? Every recruit starts the same way. Finish one workout, any routine you like, and come back to me. Do that and I'll put a sword in your hand.",
    wait:"The yard is waiting, recruit. Finish one workout and report back.",
    ready:"I heard you put the work in. Good. A recruit who trains has earned a blade.",
    done:"Keep that sword sharp and keep training. I'll have more work for you soon.",
    prog:()=>[didWorkout()?1:0,1],xp:150,item:"weapon0"}
};
const NPCS={halvar:{name:"Sergeant Halvar",role:"Master-at-Arms",quests:["first"]}};
const qState=id=>{const s=(S.q||{})[id];return s=="done"?"done":s!="active"?"new":QUESTS[id].prog()[0]>=QUESTS[id].prog()[1]?"ready":"active"};
// The quest an NPC currently cares about: the first one that isn't finished, else the last one.
const npcQuest=n=>{const q=NPCS[n].quests;return q.find(id=>qState(id)!="done")||q[q.length-1]};
const placeHere=()=>S.at!=null?PLACES[S.at]:null;
const placeNote=p=>{const st=p.npcs.map(n=>qState(npcQuest(n)));return st.includes("ready")?"Quest reward ready":st.includes("new")?"New quest available":st.includes("active")?"Quest in progress":""};
const TENT=s=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><path d="M12 4L3 20h18zM12 4v-2M12 20l-3-6h6zM10 3l2 1 2-1"/></svg>`;
// NPC portraits follow the enemy art rule: jagged, symmetrical silhouettes with accent eyes.
const NPCART={halvar:c=>{const h=`<path d="M60 6L53 10L49 2L50 16L42 20L36 32L35 50L39 62L47 70L60 74Z"/><path d="M60 78L46 76L34 80L24 74L26 86L12 92L6 108L8 120L60 120Z"/><path d="M26 86L14 76L16 90Z"/>`,
  n=`<path d="M40 42L58 45L58 50L40 47Z"/><path d="M60 54L56 58L56 68L60 70Z"/><path d="M60 92L50 96L52 110L60 116Z"/><path d="M22 100L34 96L36 100L22 104Z"/>`,
  e=`<path d="M43 43.500L52 45L43 46.500Z"/>`,m=x=>x+`<g transform="translate(120 0) scale(-1 1)">${x}</g>`;
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="npg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c313b"/><stop offset="1" stop-color="#0c0d11"/></linearGradient></defs><g fill="url(#npg)">${m(h)}</g><g fill="var(--tn)">${m(n)}</g><g fill="${c}">${m(e)}</g></svg>`}};
const npcArt=(n,z)=>`<div style="width:${z}px;height:${z}px;flex:none;border-radius:12px;overflow:hidden;--tn:color-mix(in srgb,var(--acc) 22%,var(--panel));background:radial-gradient(ellipse at 50% 80%,color-mix(in srgb,var(--acc) 38%,var(--panel)),var(--panel) 75%);border:1px solid var(--line)">${NPCART[n]("#ffb23a")}</div>`;

const qReady=()=>Object.keys(QUESTS).filter(id=>qState(id)=="ready").length;
function placeCard(){
  const p=placeHere();if(!p)return"";const note=placeNote(p);
  return `<button class="card row" style="width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer" onclick="mapSec('${p.id}')" aria-label="Open ${p.kind}">${TENT(34)}<div class="sp"><b style="font:700 18px Cinzel,serif">${p.kind}</b><div class="mu" style="margin:0;font-size:13px">${p.blurb}</div>${note?`<div style="font-size:13px;font-weight:600;color:var(--acc);margin-top:2px">${note}</div>`:""}</div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mute)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>`;
}
function rewardLine(q){const x=q.item&&item(q.item);return `<div class="row" style="gap:10px;margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--bg)">${x?tile(x,44):""}<div class="sp"><div class="mu" style="margin:0;font-size:12px">Reward</div><b>${x?x.n+" · ":""}${q.xp} XP</b>${x?`<div class="mu" style="margin:0;font-size:12px">${gtxt(x.id)}</div>`:""}</div></div>`}
function npcCard(n){
  const np=NPCS[n],id=npcQuest(n),q=QUESTS[id],st=qState(id),[a,b]=q.prog();
  const say=st=="new"?q.offer:st=="active"?q.wait:st=="ready"?q.ready:q.done;
  return `<div class="card"><div class="row" style="align-items:flex-start;gap:12px">${npcArt(n,84)}<div class="sp"><b style="font:700 18px Cinzel,serif">${np.name}</b><div class="mu" style="margin:0 0 6px;font-size:13px">${np.role}</div><p style="font-size:14px">“${say}”</p></div></div>
  ${st=="done"?"":`<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)"><div class="row"><b class="sp" style="font:600 16px Cinzel,serif">Quest: ${q.title}</b>${st=="new"?"":`<span style="font-weight:600;font-size:13px;color:var(--acc)">${st=="ready"?"Complete":"In progress"}</span>`}</div>
  <div class="row" style="margin-top:6px"><span class="sp mu" style="margin:0;font-size:14px">${q.goal}</span><span class="mu" style="margin:0;font-size:14px">${Math.min(a,b)} / ${b}</span></div>
  ${st=="new"?"":`<div class="bar"><i style="width:${Math.min(100,a/b*100)}%;background:var(--acc)"></i></div>`}${rewardLine(q)}
  <div class="gap">${st=="new"?`<button class="btn" onclick="qAccept('${id}')">Accept quest</button>`:st=="ready"?`<button class="btn" onclick="qClaim('${id}')">Claim reward</button>`:`<button class="btn ghost" onclick="go('training')">Go to Training</button>`}</div></div>`}</div>`;
}
function placeView(){
  const p=placeHere();
  return `<div class="row" style="margin-bottom:4px"><h1 class="sp" style="margin:0">${p.kind}</h1><button class="btn sm ghost" onclick="mapSec(null)">Back to Map</button></div><p class="mu">${ZN[S.at][0]}. ${p.blurb}</p>${p.npcs.map(npcCard).join("")}`;
}
function qAccept(id){if(!QUESTS[id]||qState(id)!="new")return;S.q=S.q||{};S.q[id]="active";save();render();toast(qState(id)=="ready"?"Quest accepted, and you've already done it. Claim your reward.":"Quest accepted: "+QUESTS[id].title)}
function qClaim(id){
  const q=QUESTS[id];if(!q||qState(id)!="ready")return;const L0=lvl()[0],x=q.item&&item(q.item),out=["+"+q.xp+" XP"];
  S.q[id]="done";S.xp+=q.xp;
  if(x){
    // Already owning the reward item pays out its store price instead, so the quest is never worth nothing.
    if(S.inv.includes(x.id)){S.gold+=x.p;out.push("+"+x.p+" Gold (you already own a "+x.n+")")}
    else{S.inv.push(x.id);S.eq=S.eq||{};const free=!S.eq[x.slot];if(free)S.eq[x.slot]=x.id;out.push(x.n+(free?" (equipped)":" (in your Inventory)"))}
  }
  save();render();const L1=lvl()[0];toast("Quest complete! "+out.join(" · ")+(L1>L0?" · Level "+L1+"!":""));
}
