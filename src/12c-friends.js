// Friends: public player cards and friend codes (needs a signed-in account).
// players/{uid} = {name, code, lv, rk, un, streak, day, best, wk, av, t}: the only data other players can read.
// S.fc = this account's friend code; S.friends = [uid] of players this account added (one-way, like following).
const FC_AB="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",FR_MAX=50;
let lastPub="",pubBusy=false,frData={},frLoading=false,frMsg="",frBusy=false,frEdit=false,thumbSrc=null,thumbOut="",pubErr="";
const fcNorm=s=>String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
const fcShow=c=>c?c.slice(0,3)+"-"+c.slice(3):"";
const frOpen=()=>!!$("#frs")&&$("#info").classList.contains("on");
const PEOPLE=(s=26)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c.6-3.600 3-5.500 6.500-5.500s5.900 1.900 6.500 5.500"/><circle cx="17" cy="9" r="2.700"/><path d="M17.500 14.200c2.300.3 3.700 1.900 4.100 4.300"/></svg>`;

// 96px copy of the profile picture, small enough to load for a whole friends list.
function thumb(){
  const src=S.avatar||"";
  if(!src)return Promise.resolve("");
  if(thumbSrc===src)return Promise.resolve(thumbOut);
  return new Promise(ok=>{const im=new Image(),done=v=>{thumbSrc=src;thumbOut=v;ok(v)};
    im.onload=()=>{try{const c=document.createElement("canvas");c.width=c.height=96;c.getContext("2d").drawImage(im,0,0,96,96);done(c.toDataURL("image/jpeg",.8))}catch(e){done("")}};
    im.onerror=()=>done("");im.src=src});
}
async function myCode(ref){
  if(S.fc)return S.fc;
  const d=await timed(ref.get(),15000);
  if(d.exists&&fcNorm(d.data().code).length==6){S.fc=fcNorm(d.data().code);persist();return S.fc}
  for(let i=0;i<6;i++){
    let c="";for(const b of crypto.getRandomValues(new Uint8Array(6)))c+=FC_AB[b%32];
    const q=await timed(DB.collection("players").where("code","==",c).limit(1).get(),15000);
    if(q.empty){S.fc=c;persist();return c}
  }
  throw{code:"unavailable"};
}
const myCard=code=>({name:S.name||"Recruit",code:code||S.fc||"",lv:lvl()[0],rk:profLv(),un:!logged().length,streak:S.streak||1,day:S.day||"",best:Math.max(S.bestStreak||0,S.streak||1),wk:S.log.length});
// Publishes this player's public card whenever something on it changed. Called after every successful sync.
async function pubProfile(){
  if(!USER||pubBusy||choice)return;pubBusy=true;const uid=USER.uid,had=!!S.fc;
  try{
    const ref=DB.collection("players").doc(uid),code=await myCode(ref),p=myCard(code);p.av=await thumb();
    const f=uid+JSON.stringify(p);
    if(f!==lastPub&&USER&&USER.uid===uid){await timed(ref.set(Object.assign({t:Date.now()},p)),20000);lastPub=f}
    pubErr="";
  }catch(e){pubErr=e&&e.code=="permission-denied"?"Friends aren't switched on yet for this app.":etxt(e)}
  pubBusy=false;
  if((!had&&S.fc||pubErr)&&frOpen())friendsSheet(1);
}

const yKey=()=>{const n=new Date();return dkey(new Date(n.getFullYear(),n.getMonth(),n.getDate()-1))};
// A streak only counts if the player was active today or yesterday; otherwise it has lapsed.
const liveStreak=p=>p&&String(p.day||"")>=yKey()?Math.max(0,p.streak|0):0;
const safeAv=s=>typeof s=="string"&&s.length<40000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(s)?s:"";
const favatar=(p,sz)=>{const k=Math.min(9,Math.max(0,(p.rk|0)/3|0)),c=COL[k],av=safeAv(p.av);return `<div style="width:${sz}px;height:${sz}px;border-radius:50%;border:3px solid transparent;background:linear-gradient(var(--panel),var(--panel)) padding-box,${metal(c)} border-box;flex:none;overflow:hidden;display:flex;align-items:center;justify-content:center;font:700 ${Math.round(sz/2.4)}px Cinzel,serif">${av?`<img src="${av}" alt="" style="width:100%;height:100%;object-fit:cover">`:esc(String(p.name||"R")[0].toUpperCase())}</div>`};

async function loadFriends(){
  if(!USER||frLoading)return;frLoading=true;const ids=(S.friends||[]).slice(0,FR_MAX);
  pubProfile();
  const res=await Promise.all(ids.map(id=>timed(DB.collection("players").doc(id).get(),15000).then(d=>[id,d.exists?d.data():null],()=>[id,frData[id]])));
  res.forEach(([id,v])=>{frData[id]=v});
  frLoading=false;if(frOpen())friendsSheet(1);
}
async function addFriend(){
  if(frBusy||!USER)return;const el=$("#fci"),c=fcNorm(el&&el.value),L=S.friends||[];
  const say=m=>{frMsg=m;friendsSheet(1)};
  if(c.length!=6)return say("Friend codes are 6 letters and numbers, like ABC-123.");
  if(c===S.fc)return say("That's your own code. Ask a friend for theirs.");
  if(L.length>=FR_MAX)return say("Your friends list is full ("+FR_MAX+").");
  frBusy=true;say("");
  try{
    const q=await timed(DB.collection("players").where("code","==",c).limit(1).get(),15000);
    if(q.empty)frMsg="No player has that code. Check it and try again.";
    else{const d=q.docs[0],p=d.data()||{};
      if(d.id===USER.uid)frMsg="That's your own code. Ask a friend for theirs.";
      else if(L.includes(d.id))frMsg=(p.name||"That player")+" is already on your list.";
      else{S.friends=L.concat(d.id);frData[d.id]=p;save();if($("#fci"))$("#fci").value="";toast("Added "+(p.name||"a friend"))}}
  }catch(e){frMsg=etxt(e)}
  frBusy=false;friendsSheet(1);
}
function dropFriend(id){S.friends=(S.friends||[]).filter(x=>x!==id);delete frData[id];if(!S.friends.length)frEdit=false;save();friendsSheet(1)}
function copyCode(){const t=()=>toast("Friend code copied");try{navigator.clipboard.writeText(fcShow(S.fc)).then(t,()=>toast("Your code is "+fcShow(S.fc)))}catch(e){toast("Your code is "+fcShow(S.fc))}}

function frCard(){
  const n=(S.friends||[]).length;
  return `<button class="card row" style="width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer" onclick="friendsSheet()">${PEOPLE()}<div class="sp"><b>Friends</b><div class="mu" style="margin:0;font-size:13px">${USER?(n?n+" friend"+(n==1?"":"s")+". See their streaks.":"Add friends and compare streaks."):"Sign in to add friends and see their streaks."}</div></div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mute)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>`;
}
function friendsSheet(keep){
  if(!USER){
    $("#info").innerHTML=`<div class="sheet" id="frs">${sheetHead("Friends")}<p class="mu" style="margin-top:4px">${S.uid&&!authReady?"Connecting to your account…":"Friends need an account. Sign in to get your friend code, add friends, and see their streaks."}</p>${S.uid&&!authReady?"":'<button class="btn" onclick="account()">Sign in</button>'}</div>`;
    openSheet(keep);return;
  }
  const iv=$("#fci")?$("#fci").value:"";
  if(!keep){frMsg="";frEdit=false;loadFriends()}
  const ids=(S.friends||[]).slice(0,FR_MAX),rows=[{id:USER.uid,me:1,p:Object.assign(myCard(),{av:S.avatar&&thumbSrc===S.avatar?thumbOut:""})}].concat(ids.map(id=>({id,p:frData[id]})));
  rows.sort((a,b)=>liveStreak(b.p)-liveStreak(a.p)||((b.p&&b.p.lv)|0)-((a.p&&a.p.lv)|0));
  const row=(r,i)=>{const p=r.p;
    if(!p)return `<div class="card row"><span class="mu" style="margin:0;width:18px;text-align:center">${i+1}</span><div class="sp mu" style="margin:0">${frLoading?"Loading…":"This player is no longer available."}</div>${frLoading?"":`<button class="btn sm ghost" onclick="dropFriend('${esc(r.id)}')">Remove</button>`}</div>`;
    const rk=Math.min(29,Math.max(0,p.rk|0)),s=liveStreak(p);
    return `<div class="card row" ${r.me?'style="border-color:var(--acc)"':""}><span class="mu" style="margin:0;width:18px;text-align:center;font-weight:600">${i+1}</span>${favatar(p,50)}<div class="sp"><b style="overflow-wrap:anywhere">${esc(p.name||"Recruit")}</b>${r.me?' <span class="mu" style="font-size:13px">(you)</span>':""}<div style="font-size:13px"><span style="color:${COL[rk/3|0]};font-weight:600">${p.un?"Unranked":rname(rk)}</span><span class="mu"> · Level ${Math.max(1,p.lv|0)}</span></div></div>${frEdit&&!r.me?`<button class="btn sm ghost" onclick="dropFriend('${esc(r.id)}')">Remove</button>`:`<div style="text-align:center;flex:none;min-width:54px" aria-label="${s} day streak"><div class="row" style="gap:3px;justify-content:center">${FLAME(18)}<b style="font:700 19px Cinzel,serif">${s}</b></div><div class="mu" style="margin:0;font-size:11px">${s?"day streak":"no streak"}</div></div>`}</div>`};
  $("#info").innerHTML=`<div class="sheet" id="frs">${sheetHead("Friends")}
  <div class="card" style="margin-top:12px"><div class="row"><div class="sp"><div class="mu" style="margin:0;font-size:13px">Your friend code</div><b style="font:700 26px Cinzel,serif;letter-spacing:2px">${S.fc?fcShow(S.fc):"…"}</b></div><button class="btn sm" ${S.fc?"":"disabled"} onclick="copyCode()">Copy</button></div>${!S.fc&&pubErr?`<p role="alert" style="color:var(--acc);font-weight:600;margin:8px 0 0;font-size:14px">${esc(pubErr)}</p>`:""}<div class="mu" style="margin:6px 0 0;font-size:13px">Share this code. Anyone who adds it can see your name, picture, rank, level and streak.</div></div>
  <form class="card" onsubmit="addFriend();return false"><label for="fci" style="display:block;font-weight:600;margin-bottom:6px">Add a friend</label><div class="row" style="gap:8px"><input id="fci" class="sp" maxlength="9" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Their code" value="${esc(iv)}" style="text-transform:uppercase;letter-spacing:1px"><button class="btn sm" type="submit" ${frBusy?"disabled":""}>${frBusy?"Adding…":"Add"}</button></div>${frMsg?`<p role="alert" style="color:var(--acc);font-weight:600;margin:10px 0 0;font-size:14px">${esc(frMsg)}</p>`:""}</form>
  <div class="row" style="margin:18px 0 8px"><h2 class="sp" style="margin:0">Streak leaderboard</h2>${ids.length?`<button class="btn sm ghost" onclick="frEdit=!frEdit;friendsSheet(1)">${frEdit?"Done":"Edit"}</button>`:""}</div>
  ${rows.map(row).join("")}
  ${ids.length?"":'<p class="mu">No friends yet. Trade codes with someone to see their streak here.</p>'}</div>`;
  openSheet(keep);
}
