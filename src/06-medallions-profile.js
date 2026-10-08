function medallions(){
  const lg=logged().sort((a,b)=>rk(b)-rk(a)||a.localeCompare(b));
  return `<div class="row"><h1 class="sp">Medallions</h1><button class="btn ghost" aria-label="Medallion guide" onclick="guide()" style="width:38px;height:38px;padding:0;border-radius:50%;flex:none">?</button></div>
  ${lg.length?`<div class="mg" style="margin-top:12px">${lg.map(ex=>{const q=pinfo(ex),c=COL[q.i/3|0];return `<button class="mc" style="border:3px solid transparent;background:linear-gradient(var(--panel),var(--panel)) padding-box,${metal(c)} border-box;box-shadow:0 2px 10px ${c}40" onclick="info('${ex}')">${medal(q.i,168)}<b class="ti">${ex}</b><div class="pr">${pbox(ex)}</div><div class="pb"><div class="bar"><i style="width:${q.pct}%;background:${c}"></i></div><div style="color:${c};font-weight:600;font-size:13px;margin-top:6px">${rname(q.i)}</div><div class="mu" style="margin:0;font-size:12px">${q.goal}</div></div></button>`}).join("")}</div>`:`<p class="mu" style="margin-top:8px">You have not discovered any workouts.</p>`}
  <button class="btn ghost" style="margin-top:16px" onclick="allw()">View all Workouts</button>`;
}
function allw(keep){
  if(!keep)aq="";
  $("#info").innerHTML=`<div class="sheet"><div class="row"><h1 class="sp" style="margin:0;font-size:23px">All workouts</h1><button class="btn sm ghost" id="ic" onclick="closeInfo()">Close</button></div>
  <p class="mu" style="margin-top:4px">${logged().length} of ${Object.keys(EX).length} discovered. Lifts are ranked against your bodyweight (${S.bw} lb), bodyweight moves by reps, and timed cardio by minutes.</p>
  ${sbar(aq,"saq","Search workouts")}
  <div class="chips">${EQS.map(([k,l])=>`<button class="chip ${mm==k?"on":""}" onclick="mm='${k}';allw(1)">${l}</button>`).join("")}</div>
  <div id="al">${alist()}</div></div>`;
  $("#info").classList.add("on");if(!keep){$("#info").scrollTop=0;$("#ic").focus()}
}
function saq(v){aq=v;$("#al").innerHTML=alist()}
function alist(){
  const s=aq.trim();
  return Object.entries(G).map(([g,l])=>{const f=l.filter(e=>(mm=="all"||e[3]==mm)&&(!s||hit(e[0],s)));return f.length?`<h2>${g}</h2>`+f.map(e=>{const ex=e[0],q=pinfo(ex),b=S.best[ex],c=COL[q.i/3|0];return `<div class="card row">${medal(q.i,76,!!b)}<div class="sp"><div class="row"><b class="sp">${ex}</b><span style="font:600 14px Cinzel,serif;color:${c}">${rname(q.i)}</span></div><div class="mu" style="margin:0;font-size:13px">${b?"PR "+q.pr:"Not discovered yet"} · ${q.goal}</div><div class="bar"><i style="width:${q.pct}%;background:${c}"></i></div></div></div>`}).join(""):""}).join("")||`<p class="mu">No workouts match${s?" “"+esc(s)+"”":""}.</p>`;
}
function guide(){
  $("#info").innerHTML=`<div class="sheet"><div class="row"><h1 class="sp" style="margin:0;font-size:23px">Medallion guide</h1><button class="btn sm ghost" id="ic" onclick="closeInfo()">Close</button></div>
  <p class="mu" style="margin-top:4px">Ten ranks from lowest to highest, each with its own mythical creature. The shield sharpens and the wings grow as you rise. Each rank has three tiers, III, II, and I, with III the lowest.</p>
  <div class="card"><h2>Reading your medallions</h2><p>The boxes on each medallion show your personal record: weight on the left, reps on the right. Bodyweight exercises show reps only, and timed cardio shows minutes. Tap a card for exercise info.</p></div>
  ${RANKS.map((r,k)=>`<div class="card"><b style="font:600 17px Cinzel,serif;color:${COL[k]}">${r}</b><span class="mu" style="margin:0 0 0 8px;font-size:13px">${CRE[k]}</span><div style="display:flex;justify-content:space-around;margin-top:4px">${[0,1,2].map(t=>medal(k*3+t,118)).join("")}</div></div>`).join("")}</div>`;
  $("#info").classList.add("on");$("#info").scrollTop=0;$("#ic").focus();
}

const avatar=(sz,lv)=>{const c=COL[lv/3|0];return `<div style="width:${sz}px;height:${sz}px;border-radius:50%;border:4px solid transparent;background:linear-gradient(var(--panel),var(--panel)) padding-box,${metal(c)} border-box;flex:none;overflow:hidden;display:flex;align-items:center;justify-content:center;font:700 ${Math.round(sz/2.4)}px Cinzel,serif">${S.avatar?`<img src="${S.avatar}" alt="Profile picture" style="width:100%;height:100%;object-fit:cover">`:esc((S.name||"R")[0].toUpperCase())}</div>`};
const profLv=()=>{const l=logged();return l.length?Math.round(l.reduce((a,e)=>a+rk(e),0)/l.length):0};
function pickAvatar(inp){
  const f=inp.files&&inp.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas"),z=256,m=Math.min(im.width,im.height),cx=c.getContext("2d");c.width=c.height=z;cx.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,z,z);S.avatar=c.toDataURL("image/jpeg",.85);save();render()};im.onerror=()=>toast("Couldn't read that image");im.src=rd.result};
  rd.readAsDataURL(f);
}
function editProfile(){
  return `<h1>Edit profile</h1><p class="mu">Changes save automatically.</p>
  <div class="card" style="text-align:center"><div style="display:flex;justify-content:center">${avatar(112,profLv())}</div>
  <input id="af" type="file" accept="image/*" hidden onchange="pickAvatar(this)">
  <div class="gap" style="justify-content:center"><button class="btn sm" onclick="document.getElementById('af').click()">${S.avatar?"Change photo":"Choose photo"}</button>${S.avatar?'<button class="btn sm ghost" onclick="S.avatar=\'\';save();render()">Remove</button>':""}</div></div>
  <div class="card"><label class="mu" for="pn">Name</label><input id="pn" maxlength="24" value="${esc(S.name)}" oninput="S.name=this.value.trim()||'Recruit';save()">
  <label class="mu" for="pbio" style="display:block;margin-top:12px">Bio</label><textarea id="pbio" rows="4" maxlength="160" placeholder="Tell people about your training" oninput="S.bio=this.value;save();document.getElementById('bc').textContent=this.value.length+'/160'">${esc(S.bio||"")}</textarea><div id="bc" class="mu" style="margin:4px 0 0;font-size:13px;text-align:right">${(S.bio||"").length}/160</div>
  <label class="mu" for="pb" style="display:block;margin-top:12px">Bodyweight (lb)</label><input id="pb" type="number" inputmode="decimal" value="${S.bw}" onchange="S.bw=Math.max(50,+this.value||S.bw);save()"></div>
  <button class="btn" onclick="editing=false;render()">Done</button>`;
}
function profile(){
  if(editing)return editProfile();
  const [L,x,n]=lvl(),lg=logged(),lv=profLv(),c=COL[lv/3|0],av=lg.length?lg.reduce((a,e)=>a+rk(e),0)/lg.length:0;
  const mins=S.log.reduce((a,l)=>a+(l.dur||0),0)/6e4,tt=mins>=60?Math.floor(mins/60)+"h "+Math.round(mins%60)+"m":Math.round(mins)+"m";
  const top=[...lg].sort((a,b)=>rk(b)-rk(a)).slice(0,3),since=new Date(S.since||Date.now()).toLocaleDateString(undefined,{month:"short",year:"numeric"});
  const st=(v,l,z)=>`<div class="stat"><b style="font-size:${z||24}px">${v}</b><span>${l}</span></div>`;
  return `<div class="card" style="padding:18px 14px"><div class="row" style="gap:16px">
  <div style="text-align:center;flex:none">${avatar(104,lv)}<div style="font:700 18px Cinzel,serif;margin-top:8px;max-width:112px;overflow-wrap:anywhere">${esc(S.name)}</div></div>
  <div class="sp"><div style="color:${c};font:700 18px Cinzel,serif">${rname(lv)}</div><div style="font:700 32px/1.15 Cinzel,serif">Level ${L}</div>
  <div class="bar" style="height:12px;margin-top:8px"><i style="width:${x/n*100}%;background:var(--acc)"></i></div>
  <div class="mu" style="margin:4px 0 0;font-size:13px">${x} / ${n} XP</div>
  <div class="mu" style="margin:0;font-size:12px">${lg.length?`Average rank ${av.toFixed(1)} of 29`:"Log a workout to earn a rank"}</div></div></div>
  <p class="${S.bio?"":"mu"}" style="margin:14px 0 0;text-align:center;white-space:pre-wrap">${S.bio?esc(S.bio):"No bio yet. Tap Edit profile to add one."}</p>
  <div class="gap" style="justify-content:center"><button class="btn sm" onclick="editing=true;render()">Edit profile</button><button class="btn sm ghost" onclick="settings()">Settings</button></div></div>
  ${hpCard()}
  <div class="stats" style="margin:0 0 12px">${[["Equipment","pslot=null;equipSheet()",'<path d="M14.5 3H21v6.5l-9 9-3-3zM5 14l5 5M3 21l3-3"/>'],["Inventory","invSheet()",'<path d="M6 8h12l1 12H5zM9 8V6a3 3 0 0 1 6 0v2"/>'],["Stats","statsSheet()",'<path d="M5 20V10M12 20V4M19 20v-7"/>']].map(([l,f,pth])=>`<button class="btn ghost" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 4px" onclick="${f}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pth}</svg>${l}</button>`).join("")}</div>
  <div class="stats">${st(S.log.length,"Workouts")}${st(tt,"Training time",20)}${st(lg.length,"Medallions")}</div>
  <div class="stats" style="margin-top:0">${st(S.routines.length,"Routines")}${st(top.length?rname(rk(top[0])):"None","Top rank",15)}${st(since,"Member since",15)}</div>
  ${top.length?`<h2>Showcase</h2><div class="card row" style="justify-content:space-around;align-items:flex-start">${top.map(e=>`<div style="text-align:center;width:30%">${medal(rk(e),104)}<div style="font-size:13px;margin-top:4px">${e}</div></div>`).join("")}</div>`:""}`;
}

