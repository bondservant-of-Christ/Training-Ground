// Friends: friend codes, friend requests, and what friends can see of each other (needs a signed-in account).
// players/{uid}            public card {name, code, lv, rk, un, av, t}: any signed-in player can read it (shown on requests).
// stats/{uid}              friends-only {streak, day, best, gold, wk, eq, t}: readable only by the owner and accepted friends (enforced by firestore.rules).
// inbox/{to}/from/{from}   a friend request {st:"pending"|"accepted", t}. Sender creates, receiver accepts, either side deletes (decline / cancel / unfriend).
// outbox/{uid}/to/{to}     the sender's private index of requests they sent.
// S.fc = this account's friend code (source of truth is the players doc).
const FC_AB="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",FR_MAX=50;
let lastPub="",lastStat="",pubBusy=false,pubErr="",frL={inn:[],out:[],acc:[],ok:false},frCards={},frStats={},frLoading=false,frErr="",frMsg="",frBusy=false,frView=null,frSure=false,frChecked="",frSeq=0,thumbSrc=null,thumbOut="";
const fcNorm=s=>String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
const fcShow=c=>c?c.slice(0,3)+"-"+c.slice(3):"";
const okId=s=>typeof s=="string"&&/^[A-Za-z0-9]{1,128}$/.test(s);
const frOpen=()=>!!$("#frs")&&$("#info").classList.contains("on");
const frDenied=e=>e&&e.code=="permission-denied"?"Friends aren't switched on yet for this app.":etxt(e);
const PEOPLE=(s=26)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c.6-3.600 3-5.500 6.500-5.500s5.900 1.900 6.500 5.500"/><circle cx="17" cy="9" r="2.700"/><path d="M17.500 14.200c2.300.3 3.700 1.900 4.100 4.300"/></svg>`;
const CHEV=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mute)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`;
const inbox=(to,from)=>DB.collection("inbox").doc(to).collection("from").doc(from);
const outbox=(me,to)=>DB.collection("outbox").doc(me).collection("to").doc(to);

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
const myCard=()=>({name:S.name||"Recruit",code:S.fc||"",lv:lvl()[0],rk:profLv(),un:!logged().length});
const myStats=()=>({streak:S.streak||1,day:S.day||"",best:Math.max(S.bestStreak||0,S.streak||1),gold:S.gold|0,wk:S.log.length,eq:Object.assign({},S.eq||{}),bio:String(S.bio||"").slice(0,160)});
// Publishes the public card and the friends-only stats whenever either changed. Called after every successful sync.
async function pubProfile(){
  if(!USER||pubBusy||choice)return;pubBusy=true;const uid=USER.uid,had=!!S.fc;
  try{
    if(S.friends){delete S.friends;persist()}
    const ref=DB.collection("players").doc(uid);await myCode(ref);
    const p=myCard();p.av=await thumb();const st=myStats(),fp=uid+JSON.stringify(p),fs=uid+JSON.stringify(st);
    if(!USER||USER.uid!==uid)throw{code:"unavailable"};
    if(fp!==lastPub){await timed(ref.set(Object.assign({t:Date.now()},p)),20000);lastPub=fp}
    if(fs!==lastStat){await timed(DB.collection("stats").doc(uid).set(Object.assign({t:Date.now()},st)),20000);lastStat=fs}
    pubErr="";
    if(frChecked!==uid){frChecked=uid;frL={inn:[],out:[],acc:[],ok:false};frCards={};frStats={};loadFriends(1)}
  }catch(e){pubErr=frDenied(e)}
  pubBusy=false;
  if((!had&&S.fc||pubErr)&&frOpen())friendsSheet(1);
}

const yKey=()=>{const n=new Date();return dkey(new Date(n.getFullYear(),n.getMonth(),n.getDate()-1))};
// A streak only counts if the player was active today or yesterday; otherwise it has lapsed.
const liveStreak=s=>s&&String(s.day||"")>=yKey()?Math.max(0,s.streak|0):0;
const safeAv=s=>typeof s=="string"&&s.length<40000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(s)?s:"";
const favatar=(p,sz)=>{p=p||{};const k=Math.min(9,Math.max(0,(p.rk|0)/3|0)),c=COL[k],av=safeAv(p.av);return `<div style="width:${sz}px;height:${sz}px;border-radius:50%;border:3px solid transparent;background:linear-gradient(var(--panel),var(--panel)) padding-box,${metal(c)} border-box;flex:none;overflow:hidden;display:flex;align-items:center;justify-content:center;font:700 ${Math.round(sz/2.4)}px Cinzel,serif">${av?`<img src="${av}" alt="" style="width:100%;height:100%;object-fit:cover">`:esc(String(p.name||"R")[0].toUpperCase())}</div>`};
const rankLine=p=>{const rk=Math.min(29,Math.max(0,p.rk|0));return `<span style="color:${COL[rk/3|0]};font-weight:600">${p.un?"Unranked":rname(rk)}</span><span class="mu"> · Level ${Math.max(1,p.lv|0)}</span>`};
// Box Knight: a built-in friend every signed-in player has. Lives only in the app (nothing in Firestore), can't be removed,
// and is always "online": the streak was 132 on 9 Oct 2026 and goes up by one every day.
const BK="boxknight",BK_P={name:"Box Knight",lv:52,rk:29,un:false};
const bkStats=()=>{const n=new Date(),k=132+Math.max(0,Math.round((new Date(n.getFullYear(),n.getMonth(),n.getDate())-new Date(2026,9,9))/864e5)),eq={};SLOTS.forEach(([s])=>eq[s]=s+"9");return{streak:k,day:dkey(n),best:k,gold:27000,eq}};
const frP=id=>id==BK?BK_P:frCards[id]||{},frS=id=>id==BK?bkStats():frStats[id];
const rawName=id=>String((frCards[id]&&frCards[id].name)||"Recruit");

// Loads requests (both directions), friends, their public cards, and friends' stats.
async function loadFriends(first){
  if(!USER)return;frLoading=true;const uid=USER.uid,seq=++frSeq;
  try{
    const [a,b]=await Promise.all([timed(DB.collection("inbox").doc(uid).collection("from").get(),15000),timed(DB.collection("outbox").doc(uid).collection("to").get(),15000)]);
    const L={inn:[],out:[],acc:[],ok:true};
    a.docs.forEach(d=>{if(okId(d.id)&&d.id!==uid)((d.data()||{}).st=="accepted"?L.acc:L.inn).push(d.id)});
    // For each request I sent, the receiver's inbox says whether it is pending, accepted, or gone (declined or unfriended).
    await Promise.all(b.docs.map(d=>d.id).filter(id=>okId(id)&&id!==uid).map(id=>timed(inbox(id,uid).get(),15000).then(d=>{
      if(!d.exists){outbox(uid,id).delete().catch(()=>{});return}
      if(L.acc.includes(id))return;
      if((d.data()||{}).st=="accepted"){L.acc.push(id);L.inn=L.inn.filter(x=>x!==id)}else if(!L.inn.includes(id))L.out.push(id)},()=>{})));
    await Promise.all([...L.acc,...L.inn,...L.out].map(id=>timed(DB.collection("players").doc(id).get(),15000).then(d=>{frCards[id]=d.exists?d.data():null},()=>{})));
    await Promise.all(L.acc.map(id=>timed(DB.collection("stats").doc(id).get(),15000).then(d=>{frStats[id]=d.exists?d.data():null},()=>{})));
    if(seq!==frSeq)return;
    if(!USER||USER.uid!==uid)throw{code:"unavailable"};
    frL=L;frErr="";
    if(first&&L.inn.length&&!frOpen())toast(L.inn.length==1?rawName(L.inn[0])+" sent you a friend request. Open Profile, then Friends.":"You have "+L.inn.length+" friend requests. Open Profile, then Friends.");
  }catch(e){if(seq!==frSeq)return;frErr=frDenied(e)}
  frLoading=false;
  if(frOpen())friendsSheet(1);else if(tab=="profile"&&!editing&&!$("#info").classList.contains("on"))render();
}
async function frDo(fn,done){
  if(frBusy||!USER)return;frBusy=true;frMsg="";friendsSheet(1);
  try{await fn();if(done)toast(done)}catch(e){frMsg=frDenied(e)}
  frBusy=false;await loadFriends();if(frOpen())friendsSheet(1);
}
function sendReq(){
  if(frBusy||!USER)return;const el=$("#fci"),c=fcNorm(el&&el.value),uid=USER.uid;
  const say=m=>{frMsg=m;friendsSheet(1)};
  if(c.length!=6)return say("Friend codes are 6 letters and numbers, like ABC-123.");
  if(c===S.fc)return say("That's your own code. Ask a friend for theirs.");
  if(frL.acc.length>=FR_MAX)return say("Your friends list is full ("+FR_MAX+").");
  let note="";
  frDo(async()=>{
    const q=await timed(DB.collection("players").where("code","==",c).limit(1).get(),15000);
    if(q.empty){frMsg="No player has that code. Check it and try again.";return}
    const id=q.docs[0].id,nm=(q.docs[0].data()||{}).name||"that player";
    if(!okId(id)||id===uid){frMsg="That's your own code. Ask a friend for theirs.";return}
    if(frL.acc.includes(id)){frMsg="You and "+nm+" are already friends.";return}
    if(frL.out.includes(id)){frMsg="You already sent "+nm+" a request. It's waiting for them to accept.";return}
    if(frL.inn.includes(id)){await timed(inbox(uid,id).update({st:"accepted"}),15000);note="You and "+nm+" are now friends.";}
    else{
      await timed(outbox(uid,id).set({t:Date.now()}),15000);
      await timed(inbox(id,uid).set({st:"pending",t:Date.now()}),15000);
      note="Friend request sent to "+nm+".";
    }
    if($("#fci"))$("#fci").value="";toast(note);
  });
}
function frAccept(id){if(!okId(id))return;if(frL.acc.length>=FR_MAX){frMsg="Your friends list is full ("+FR_MAX+").";return friendsSheet(1)}frDo(()=>timed(inbox(USER.uid,id).update({st:"accepted"}),15000),"You and "+rawName(id)+" are now friends.")}
// Decline, cancel, and unfriend are the same thing: remove every trace of the link in both directions.
function frRemove(id,msg){if(!okId(id))return;const u=USER.uid;frView=null;frSure=false;frDo(()=>Promise.all([inbox(u,id).delete(),inbox(id,u).delete(),outbox(u,id).delete()].map(p=>timed(p,15000))).then(()=>{delete frStats[id]}),msg)}
function copyCode(){const t=()=>toast("Friend code copied");try{navigator.clipboard.writeText(fcShow(S.fc)).then(t,()=>toast("Your code is "+fcShow(S.fc)))}catch(e){toast("Your code is "+fcShow(S.fc))}}

function frCard(){
  const n=frL.acc.length+(USER?1:0),r=frL.inn.length;
  return `<button class="card row" style="width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer" onclick="friendsSheet()">${PEOPLE()}<div class="sp"><b>Friends</b><div class="mu" style="margin:0;font-size:13px">${USER?(n?n+" friend"+(n==1?"":"s")+". See their streaks, gold and gear.":"Add friends to see their streaks, gold and gear."):"Sign in to add friends."}</div>${USER&&r?`<div style="font-size:13px;font-weight:600;color:var(--acc);margin-top:2px">${r} friend request${r==1?"":"s"} waiting</div>`:""}</div>${CHEV}</button>`;
}
function friendView(id){
  const p=frP(id),s=frS(id),eq=s&&s.eq&&typeof s.eq=="object"?s.eq:{};
  const st=(v,l,ic)=>`<div class="stat"><b style="font-size:21px;display:flex;align-items:center;justify-content:center;gap:4px">${ic||""}${v}</b><span>${l}</span></div>`;
  return `<div class="sheet" id="frs"><div class="row"><h1 class="sp" style="margin:0;font-size:23px;overflow-wrap:anywhere">${esc(p.name||"Recruit")}</h1><button class="btn sm ghost" id="ic" onclick="frView=null;frSure=false;friendsSheet(1);$('#info').scrollTop=0">Back</button></div>
  <div class="card row" style="margin-top:12px;gap:14px">${favatar(p,84)}<div class="sp"><div style="font:700 17px Cinzel,serif;color:${COL[Math.min(9,Math.max(0,(p.rk|0)/3|0))]}">${p.un?"Unranked":rname(Math.min(29,Math.max(0,p.rk|0)))}</div><div style="font:700 26px/1.2 Cinzel,serif">Level ${Math.max(1,p.lv|0)}</div></div></div>
  ${s&&typeof s.bio=="string"&&s.bio.trim()?`<div class="card"><div class="mu" style="margin:0 0 4px;font-size:13px">Bio</div><p style="margin:0;white-space:pre-wrap;overflow-wrap:anywhere">${esc(s.bio.slice(0,160))}</p></div>`:""}
  ${s?`<div class="stats" style="margin:0 0 12px">${st(liveStreak(s),"Day streak",FLAME(20))}${st(Math.max(0,s.best|0),"Best streak")}${st(kfmt(Math.max(0,s.gold|0)),"Gold",coin(18))}</div>
  <h2>Gear</h2><div class="mg">${SLOTS.map(([k,l])=>{const gid=eq[k],x=typeof gid=="string"&&GEAR[gid]&&GEAR[gid].s==k?item(gid):null;return `<div class="card it"><div class="mu" style="margin:0 0 6px;font-weight:600">${l}</div><div style="display:flex;justify-content:center">${x?tile(x,72):'<div class="ic" style="width:72px;height:72px;margin:0;background:var(--bg);border:2px dashed var(--line)"></div>'}</div><b class="ti2" style="margin-top:6px;min-height:40px">${x?x.n:"Empty"}</b>${x?`<div class="mu" style="margin:0;font-size:12px"><span style="color:${COL[x.tier]};font-weight:600">${RANKS[x.tier]}</span> · ${gtxt(gid)}</div>`:""}</div>`}).join("")}</div>`
  :`<p class="mu">${esc(p.name||"This player")}'s streak, gold and gear will show here after they next open the app.</p>`}
  ${id==BK?"":`<button class="btn ghost" style="margin-top:16px" ${frBusy?"disabled":""} onclick="if(frSure)frRemove('${id}','Friend removed.');else{frSure=true;friendsSheet(1)}">${frSure?"Tap again to remove this friend":"Remove friend"}</button>`}</div>`;
}
function friendsSheet(keep){
  if(!USER){
    $("#info").innerHTML=`<div class="sheet" id="frs">${sheetHead("Friends")}<p class="mu" style="margin-top:4px">${S.uid&&!authReady?"Connecting to your account…":"Friends need an account. Sign in to get your friend code and send friend requests."}</p>${S.uid&&!authReady?"":'<button class="btn" onclick="account()">Sign in</button>'}</div>`;
    openSheet(keep);return;
  }
  const iv=$("#fci")?$("#fci").value:"";
  if(!keep){frMsg="";frView=null;frSure=false;loadFriends()}
  if(frView&&(frView==BK||frL.acc.includes(frView))){$("#info").innerHTML=friendView(frView);openSheet(keep);return}
  frView=null;
  const uid=USER.uid,rows=[{id:uid,me:1,p:Object.assign(myCard(),{av:S.avatar&&thumbSrc===S.avatar?thumbOut:""}),s:myStats()}].concat([BK,...frL.acc].map(id=>({id,p:frP(id),s:frS(id)})));
  rows.sort((a,b)=>liveStreak(b.s)-liveStreak(a.s)||(b.p.lv|0)-(a.p.lv|0));
  const row=(r,i)=>{const p=r.p,s=liveStreak(r.s),tag=r.me?"div":"button",act=r.me?"":` onclick="frView='${r.id}';friendsSheet(1);$('#info').scrollTop=0" aria-label="${esc(p.name||"Recruit")}, ${s} day streak. View profile"`;
    return `<${tag} class="card row" style="width:100%;text-align:left;font:inherit;color:inherit;${r.me?"border-color:var(--acc)":"cursor:pointer"}"${act}><span class="mu" style="margin:0;width:18px;text-align:center;font-weight:600">${i+1}</span>${favatar(p,50)}<div class="sp"><b style="overflow-wrap:anywhere">${esc(p.name||"Recruit")}</b>${r.me?' <span class="mu" style="font-size:13px">(you)</span>':""}<div style="font-size:13px">${rankLine(p)}</div></div><div style="flex:none;min-width:56px"><div class="row" style="gap:3px;justify-content:flex-end">${FLAME(18)}<b style="font:700 19px Cinzel,serif">${r.s?s:"–"}</b></div><div class="row" style="gap:4px;justify-content:flex-end;margin-top:2px">${coin(13)}<span class="mu" style="margin:0;font-size:13px">${r.s?kfmt(Math.max(0,r.s.gold|0)):"–"}</span></div></div>${r.me?"":CHEV}</${tag}>`};
  const req=(id,inc)=>{const p=frCards[id]||{};return `<div class="card"><div class="row">${favatar(p,46)}<div class="sp"><b style="overflow-wrap:anywhere">${esc(p.name||"Recruit")}</b><div style="font-size:13px">${inc?rankLine(p):'<span class="mu">Request sent. Waiting for them to accept.</span>'}</div></div>${inc?"":`<button class="btn sm ghost" ${frBusy?"disabled":""} onclick="frRemove('${id}','Request cancelled.')">Cancel</button>`}</div>${inc?`<div class="gap"><button class="btn sm" style="flex:1" ${frBusy?"disabled":""} onclick="frAccept('${id}')">Accept</button><button class="btn sm ghost" style="flex:1" ${frBusy?"disabled":""} onclick="frRemove('${id}','Request declined.')">Decline</button></div>`:""}</div>`};
  const err=frMsg||(!S.fc&&pubErr)||frErr;
  $("#info").innerHTML=`<div class="sheet" id="frs">${sheetHead("Friends")}
  <div class="card" style="margin-top:12px"><div class="row"><div class="sp"><div class="mu" style="margin:0;font-size:13px">Your friend code</div><b style="font:700 26px Cinzel,serif;letter-spacing:2px">${S.fc?fcShow(S.fc):"…"}</b></div><button class="btn sm" ${S.fc?"":"disabled"} onclick="copyCode()">Copy</button></div><div class="mu" style="margin:6px 0 0;font-size:13px">Share this code so people can send you a friend request. Only friends you accept can see your streak, gold and gear.</div></div>
  <form class="card" onsubmit="sendReq();return false"><label for="fci" style="display:block;font-weight:600;margin-bottom:6px">Add a friend</label><div class="row" style="gap:8px"><input id="fci" class="sp" maxlength="9" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Their code" value="${esc(iv)}" style="text-transform:uppercase;letter-spacing:1px"><button class="btn sm" type="submit" ${frBusy?"disabled":""}>${frBusy?"Sending…":"Send request"}</button></div>${err?`<p role="alert" style="color:var(--acc);font-weight:600;margin:10px 0 0;font-size:14px">${esc(err)}</p>`:""}</form>
  ${frL.inn.length?`<h2>Friend requests</h2>${frL.inn.map(id=>req(id,1)).join("")}`:""}
  ${frL.out.length?`<h2>Sent requests</h2>${frL.out.map(id=>req(id,0)).join("")}`:""}
  <h2>Streak leaderboard</h2>
  ${rows.map(row).join("")}
  ${frL.acc.length?"":`<p class="mu">${frLoading&&!frL.ok?"Loading…":"Send a request with someone's code, and they'll appear here once they accept."}</p>`}</div>`;
  openSheet(keep);
}
