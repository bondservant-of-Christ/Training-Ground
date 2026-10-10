// Accounts and online saves (Firebase Auth + Firestore).
// The app works fully signed out and offline; this layer only adds backup and cross-device sync.
// Cloud doc: saves/{uid} = {data: JSON string of S, rev: counter, updated: ms of the save's last real change}.
// Local bookkeeping in S: uid (account this save is linked to), rv (cloud rev last seen), mt (last real change), ms (mt at last sync).
const FB_CFG={apiKey:"AIzaSyB6K22kYMUmLOOht8KGcyPdyehzmtqWMtA",authDomain:"training-grounds-933e5.firebaseapp.com",projectId:"training-grounds-933e5",storageBucket:"training-grounds-933e5.firebasestorage.app",messagingSenderId:"59523322599",appId:"1:59523322599:web:8736adf3a822443f214842"};
const FB_SRC=n=>"https://cdn.jsdelivr.net/npm/firebase@10.12.2/firebase-"+n+"-compat.js";
let fbP=null,AU=null,DB=null,USER=null,authReady=false,syncSt="off",syncAt=0,syncErr="",pend=false,pushT=null,busy=false,again=false,choice=null,amsg="",abusy=false,outSure=false;

function fbLoad(){
  if(fbP)return fbP;
  const ld=n=>new Promise((ok,no)=>{const s=document.createElement("script");s.src=FB_SRC(n);s.onload=ok;s.onerror=()=>no({code:"app/load-failed"});document.head.appendChild(s)});
  fbP=(window.firebase&&firebase.auth?Promise.resolve():ld("app").then(()=>Promise.all([ld("auth"),ld("firestore")]))).then(()=>{
    if(!firebase.apps.length)firebase.initializeApp(FB_CFG);
    AU=firebase.auth();DB=firebase.firestore();
    AU.onAuthStateChanged(u=>{USER=u;authReady=true;choice=null;if(typeof frOpen=="function"&&frOpen())friendsSheet(1);if(u)sync();else syncSt="off";acctRefresh()});
  }).catch(e=>{fbP=null;throw e});
  return fbP;
}

const freshSave=()=>({name:"Recruit",bw:180,routines:[],best:{},log:[],xp:0,rest:60,gold:0,inv:[],eq:{},v2:1,v3:1,pot:{},bf:{},since:Date.now()});
const lvlOf=x=>{let l=1;x=x||0;while(x>=l*100){x-=l*100;l++}return l};
const hasProg=o=>!!((o.log||[]).length||o.xp>0||(o.inv||[]).length||(o.routines||[]).length||Object.keys(o.best||{}).length);
const timed=(p,ms)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no({code:"unavailable"}),ms))]);
const ERR={"auth/invalid-email":"That email address doesn't look right.","auth/missing-email":"Enter your email address first.","auth/missing-password":"Enter a password with at least 6 characters.","auth/weak-password":"Use a password with at least 6 characters.","auth/email-already-in-use":"An account with that email already exists. Tap Sign in instead.","auth/invalid-credential":"Wrong email or password.","auth/invalid-login-credentials":"Wrong email or password.","auth/wrong-password":"Wrong email or password.","auth/user-not-found":"Wrong email or password.","auth/too-many-requests":"Too many attempts. Wait a few minutes and try again.","auth/network-request-failed":"Can't reach the sign-in service. Check your connection and try again.","auth/popup-blocked":"Your browser blocked the Google window. Allow pop-ups for this site and try again.","auth/popup-closed-by-user":"","auth/cancelled-popup-request":"","auth/operation-not-allowed":"This sign-in method isn't turned on yet.","auth/unauthorized-domain":"This site isn't authorised for sign-in yet.","auth/account-exists-with-different-credential":"That email is already registered with a different sign-in method.","auth/operation-not-supported-in-this-environment":"Sign-in isn't available in this preview. Use the installed app or the live site.","app/load-failed":"Can't reach the sign-in service. Check your connection and try again.","permission-denied":"Online saves aren't switched on yet for this app.","unavailable":"Offline. Your progress is safe on this device and will sync when you're back online.","bad-save":"The online save couldn't be read. Your progress on this device is unchanged."};
const etxt=e=>{const c=e&&e.code||"";return c in ERR?ERR[c]:"Something went wrong. Try again."};

// Called by every save(). Batches changes into one upload a couple of seconds later.
function cloudTouch(){pend=true;if(!USER||choice)return;clearTimeout(pushT);pushT=setTimeout(sync,2500)}

async function sync(){
  if(!USER||choice)return;
  if(busy){again=true;return}
  busy=true;clearTimeout(pushT);syncSt="busy";acctRefresh();
  const uid=USER.uid;
  try{
    const ref=DB.collection("saves").doc(uid),d=await timed(ref.get(),15000),c=d.exists?d.data():null;
    if(!USER||USER.uid!==uid)return;
    const dirty=(S.mt||0)>(S.ms||0);let adopt=false;
    if(S.uid!==uid){
      // First time this device's save meets this account.
      if(S.uid){
        // The save on this device belongs to a different account (shared phone): never mix them. Keep a local backup, then load or start this account's own save.
        if(hasProg(S)){try{localStorage.setItem(KEY+"-backup",JSON.stringify(S))}catch(e){}}
        if(c)adopt=true;else{const th=S.theme;S=freshSave();if(th)S.theme=th;S.mt=Date.now();persist();daily();drawHud();if(!run&&!build&&!B)render()}
      }
      else if(c&&!hasProg(S))adopt=true;
      else if(c){choice={cloud:c};syncSt="choose";chooseSheet();return}
    }else if(c&&c.rev!==S.rv){
      // The online save changed on another device. Newest real change wins.
      if(!(dirty&&(S.mt||0)>=(c.updated||0)))adopt=true;
    }else if(c&&!pend&&!dirty){syncSt="ok";syncAt=Date.now();return}
    if(adopt)adoptCloud(c);
    else{
      pend=false;
      const rev=((c&&c.rev)||0)+1,mt=S.mt||Date.now(),body=JSON.stringify(Object.assign({},S,{uid,rv:rev,ms:mt,mt}));
      await timed(ref.set({data:body,rev,updated:mt,v:1}),20000);
      S.uid=uid;S.rv=rev;S.ms=mt;if(!S.mt)S.mt=mt;persist();
    }
    syncSt="ok";syncAt=Date.now();
  }catch(e){pend=true;syncSt="err";syncErr=etxt(e)}
  finally{
    busy=false;acctRefresh();
    if(USER&&syncSt=="ok"&&typeof pubProfile=="function")pubProfile();
    const now=again;again=false;
    if(USER&&!choice&&syncSt=="ok"&&(now||pend||(S.mt||0)>(S.ms||0))){clearTimeout(pushT);pushT=setTimeout(sync,now?0:2500)}
  }
}

function adoptCloud(c){
  let o=null;try{o=JSON.parse(c.data)}catch(e){}
  if(!o||typeof o!="object"||!Array.isArray(o.log))throw{code:"bad-save"};
  if(hasProg(S)&&!S.uid){try{localStorage.setItem(KEY+"-backup",JSON.stringify(S))}catch(e){}}
  S=Object.assign({name:"Recruit",bw:180,routines:[],best:{},log:[],xp:0,rest:60,gold:0,inv:[],eq:{},v2:1,v3:1},o);
  renameEx(S);S.uid=USER.uid;S.rv=c.rev;S.ms=S.mt=c.updated||o.mt||Date.now();pend=false;persist();
  if(S.theme)document.documentElement.dataset.theme=S.theme;else delete document.documentElement.dataset.theme;
  daily();drawHud();
  if(!run&&!build&&!B)render();
}

function pick(w){
  if(!choice||!USER)return;const c=choice.cloud;choice=null;
  if(w=="cloud"){try{adoptCloud(c);syncSt="ok";syncAt=Date.now();toast("Loaded your online save.")}catch(e){syncSt="err";syncErr=etxt(e)}account();sync()}
  else{S.uid=USER.uid;S.rv=c.rev;S.mt=Date.now();persist();pend=true;account();sync();toast("Keeping this device's progress.")}
}
function chooseSheet(){
  const c=choice.cloud;let o={};try{o=JSON.parse(c.data)||{}}catch(e){}
  const box=(t,x,when,btn,w,cls)=>`<div class="card"><b style="font:700 17px Cinzel,serif">${t}</b><div class="mu" style="margin:4px 0 10px">${esc(x.name||"Recruit")} · Level ${lvlOf(x.xp)} · ${(x.log||[]).length} workout${(x.log||[]).length==1?"":"s"} · ${(x.gold||0).toLocaleString()} Gold${when?"<br>"+when:""}</div><button class="btn ${cls}" onclick="pick('${w}')">${btn}</button></div>`;
  $("#info").innerHTML=`<div class="sheet" id="acct">${sheetHead("Choose a save")}
  <p class="mu" style="margin-top:4px">This account already has progress saved online, and this device has different progress. Pick the one to keep. The other one is replaced.</p>
  ${box("Online save",o,c.updated?"Last saved "+new Date(c.updated).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}):"","Use the online save","cloud","")}
  ${box("This device",S,"","Keep this device's progress","local","ghost")}
  <button class="btn ghost" onclick="acctOut()">Decide later and sign out</button></div>`;
  openSheet();
}

const CLOUD=(s=26)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><path d="M7 18a4.500 4.500 0 0 1-.6-8.960A6 6 0 0 1 18 10.500 3.800 3.800 0 0 1 17.500 18z"/><path d="M12 16v-5M9.800 13l2.200-2.200 2.200 2.200"/></svg>`;
const GLOGO=`<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style="flex:none"><path fill="#EA4335" d="M24 9.500c3.540 0 6.710 1.220 9.210 3.600l6.850-6.850C35.900 2.380 30.470 0 24 0 14.620 0 6.510 5.380 2.560 13.220l7.980 6.190C12.430 13.720 17.740 9.500 24 9.500z"/><path fill="#4285F4" d="M46.980 24.550c0-1.570-.150-3.090-.380-4.550H24v9.020h12.940c-.580 2.960-2.260 5.480-4.780 7.180l7.730 6c4.510-4.180 7.090-10.360 7.090-17.650z"/><path fill="#FBBC05" d="M10.530 28.590c-.480-1.450-.760-2.990-.760-4.590s.270-3.140.760-4.590l-7.980-6.190C.920 16.460 0 20.120 0 24c0 3.880.920 7.540 2.560 10.780l7.970-6.190z"/><path fill="#34A853" d="M24 48c6.480 0 11.930-2.130 15.890-5.810l-7.730-6c-2.150 1.450-4.920 2.300-8.160 2.300-6.260 0-11.570-4.220-13.470-9.910l-7.980 6.190C6.510 42.620 14.620 48 24 48z"/></svg>`;
const syncLine=()=>syncSt=="busy"?"Syncing…":syncSt=="err"?syncErr:syncSt=="choose"?"Choose which save to keep.":syncSt=="ok"?"Saved online at "+new Date(syncAt).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"Not synced yet";

// Card for Barracks (home=1, dismissible, signed-out only) and Profile (always shown).
function acctCard(home){
  if(USER)return home?"":`<div class="card row">${CLOUD()}<div class="sp"><b>${esc(USER.email||"Signed in")}</b><div class="mu" style="margin:0;font-size:13px">${syncLine()}</div></div><button class="btn sm ghost" onclick="account()">Account</button></div>`;
  if(S.uid&&!authReady)return home?"":`<div class="card row">${CLOUD()}<div class="sp mu" style="margin:0;font-size:13px">Connecting to your account…</div><button class="btn sm ghost" onclick="account()">Account</button></div>`;
  if(home&&S.noAcct)return"";
  return `<div class="card"><div class="row">${CLOUD()}<div class="sp"><b>Save your progress online</b><div class="mu" style="margin:0;font-size:13px">Sign in to back it up and use it on any device.</div></div></div><div class="gap"><button class="btn sm" onclick="account()">Sign in</button>${home?'<button class="btn sm ghost" onclick="S.noAcct=1;save(1);render()">Not now</button>':""}</div></div>`;
}

function account(keep){
  const ev=$("#ae")?$("#ae").value:"",pv=$("#ap")?$("#ap").value:"";
  // Only a user-initiated open (keep falsy) tries to load the sign-in service, so a failed load can't retry in a loop.
  if(!keep){amsg="";fbLoad().catch(e=>{amsg=etxt(e);if($("#acct")&&$("#info").classList.contains("on"))account(1)})}
  if(choice&&USER){chooseSheet();return}
  const msg=amsg?`<p role="alert" style="color:var(--acc);font-weight:600;margin:12px 0 0">${esc(amsg)}</p>`:"";
  const body=USER?`<div class="card row" style="margin-top:12px">${CLOUD(30)}<div class="sp"><div class="mu" style="margin:0;font-size:13px">Signed in as</div><b style="overflow-wrap:anywhere">${esc(USER.email||"Your account")}</b><div class="mu" style="margin:2px 0 0;font-size:13px" id="asl">${syncLine()}</div></div></div>
  <p class="mu" style="font-size:13px">Your progress saves to your account automatically. Sign in on another phone or browser to pick up where you left off.</p>
  <button class="btn" ${syncSt=="busy"?"disabled":""} onclick="sync()">Sync now</button>
  <button class="btn ghost" style="margin-top:8px" ${abusy?"disabled":""} onclick="acctOut(${outSure?1:0})">${abusy?"Saving…":outSure?"Sign out anyway":"Sign out"}</button>
  <p class="mu" style="font-size:13px;margin:8px 0 0">Signing out removes your progress from this device. It stays saved in your account and comes back when you sign in again.</p>${msg}`
  :`<p class="mu" style="margin-top:4px">Sign in to save your progress online and use it on any device. The progress already on this device is kept and uploaded to your account.</p>
  <button class="btn ghost" style="display:flex;align-items:center;justify-content:center;gap:10px" ${abusy?"disabled":""} onclick="acctGoogle()">${GLOGO}Continue with Google</button>
  <div class="row" style="margin:14px 0"><div class="sp" style="height:1px;background:var(--line)"></div><span class="mu" style="margin:0;font-size:13px">or use email</span><div class="sp" style="height:1px;background:var(--line)"></div></div>
  <form onsubmit="acctEmail(0);return false"><label class="mu" for="ae" style="display:block;margin-bottom:4px;font-size:13px">Email</label><input id="ae" type="email" autocomplete="email" inputmode="email" autocapitalize="off" value="${esc(ev)}">
  <label class="mu" for="ap" style="display:block;margin:10px 0 4px;font-size:13px">Password</label><input id="ap" type="password" autocomplete="current-password" value="${esc(pv)}">
  <div class="gap" style="margin-top:12px"><button class="btn" type="submit" ${abusy?"disabled":""}>Sign in</button><button class="btn ghost" type="button" ${abusy?"disabled":""} onclick="acctEmail(1)">Create account</button></div></form>
  ${msg}<button class="btn sm ghost" style="margin-top:12px;border:0;padding-left:0;color:var(--acc)" onclick="acctReset()">Forgot your password?</button>`;
  $("#info").innerHTML=`<div class="sheet" id="acct">${sheetHead("Account")}${body}</div>`;
  openSheet(keep);
}
function acctRefresh(){
  const a=$("#acct");
  if(a&&$("#info").classList.contains("on")&&!(choice&&USER&&a.querySelector("[onclick*=pick]")))account(1);
  if((tab=="profile"||tab=="barracks")&&!editing&&typeof render=="function"&&$("#n")&&$("#n").children.length)render();
}
async function acctDo(fn){
  if(abusy)return;abusy=true;amsg="";account(1);
  try{await fbLoad();await fn();amsg=""}catch(e){amsg=etxt(e)}
  abusy=false;account(1);
}
function acctEmail(make){
  const e=($("#ae").value||"").trim(),p=$("#ap").value||"";
  if(!e||!p){amsg="Enter your email and password first.";account(1);return}
  acctDo(()=>make?AU.createUserWithEmailAndPassword(e,p):AU.signInWithEmailAndPassword(e,p));
}
function acctGoogle(){acctDo(()=>AU.signInWithPopup(new firebase.auth.GoogleAuthProvider()))}
function acctReset(){
  const e=($("#ae").value||"").trim();
  if(!e){amsg="Enter your email address above, then tap Forgot your password.";account(1);return}
  acctDo(async()=>{await AU.sendPasswordResetEmail(e);toast("Password reset email sent to "+e)});
}
// Uploads anything not yet saved online. Resolves true once the account has this device's latest progress.
const unsaved=()=>(S.mt||0)>(S.ms||0);
async function flush(){
  for(let i=0;i<3&&USER;i++){
    while(busy)await new Promise(r=>setTimeout(r,100));
    if(S.uid===USER.uid&&!unsaved())return true;
    await sync();
    if(syncSt=="err"||syncSt=="choose")break;
  }
  return !!USER&&S.uid===USER.uid&&!unsaved();
}
// Signing out really signs this device out: the account's progress is uploaded first, then removed from the device,
// so a signed-out device can never push an empty or reset save over the account's online save.
// A device save that was never linked (still on the "Choose a save" screen) is left alone.
async function acctOut(force){
  if(abusy)return;
  if(!USER||!AU){choice=null;account(1);return}
  if(run||build||(B&&!B.over)){toast("Finish what you're doing before signing out.");return}
  const picking=!!choice;choice=null;clearTimeout(pushT);amsg="";
  if(!picking){
    abusy=true;account(1);
    const ok=await flush();
    abusy=false;
    if(!USER){account(1);return}
    if(!ok&&S.uid===USER.uid&&!force){outSure=true;amsg="Your latest progress isn't saved online yet. Check your connection and try again. If you sign out anyway, anything not saved online is lost.";account(1);return}
  }
  const mine=S.uid===USER.uid;
  outSure=false;
  try{await AU.signOut()}catch(e){amsg=etxt(e);account(1);return}
  if(mine){
    const th=S.theme;S=freshSave();if(th)S.theme=th;pend=false;persist();daily();drawHud();gen=null;B=null;
  }
  account(1);if(typeof render=="function")render();
  toast(mine?"Signed out. Your progress is saved in your account.":"Signed out. Your progress is still on this device.");
}

addEventListener("online",()=>{if(USER)sync()});
document.addEventListener("visibilitychange",()=>{if(USER&&!choice)sync()});
// Returning players reconnect in the background; everyone else loads the sign-in service only when they open Account.
if(S.uid)setTimeout(()=>fbLoad().catch(()=>{}),0);
