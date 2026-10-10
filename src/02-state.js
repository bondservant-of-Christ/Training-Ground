const KEY="barracks-v1";
let S={name:"Recruit",bw:180,routines:[],best:{},log:[],xp:0,rest:60,gold:0,inv:[],eq:{}};
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){}
if(!S.xp)S.xp=S.log.length*80;
if(S.gold==null)S.gold=S.log.length*50;
if(!S.inv)S.inv=[];
if(!S.eq)S.eq={};
if(S.theme)document.documentElement.dataset.theme=S.theme;
// save(1) is a quiet save: housekeeping (streak tick, migrations) that should not count as "this device has newer progress" when syncing.
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const save=q=>{if(q!==1)S.mt=Date.now();persist();if(typeof drawHud=="function")drawHud();if(typeof cloudTouch=="function")cloudTouch()};
if(!S.since){S.since=(S.log[0]&&S.log[0].d)||Date.now();save(1)}
if(!S.v2){const OP={w1:100,w2:250,w3:400,w4:600,w5:900,w6:1400,w7:3000,a1:100,a2:300,a3:500,a4:800,a5:1600,a6:3200};let r=0;(S.inv||[]).forEach(id=>{r+=OP[id]||0});S.gold=(S.gold||0)+r;S.inv=[];S.eq={};S.v2=1;if(r)S.refund=r;save(1)}
if(!S.v3){const PP=[50,150,350,700,1200,2000,3200,5000,7500,11000];let r=0;S.inv=(S.inv||[]).map(id=>{if(id.startsWith("back")){r+=Math.round(PP[+id.slice(4)]*1.1/10)*10;return null}return id.startsWith("feet")?"boots"+id.slice(4):id}).filter(Boolean);const e=S.eq||{};if(e.feet){e.boots="boots"+e.feet.slice(4);delete e.feet}delete e.back;S.eq=e;S.gold=(S.gold||0)+r;S.v3=1;if(r)S.refund3=r;save(1)}
// Renamed exercises: carries PRs, ranks and saved routines over to the new name. Runs at startup and whenever an online save is loaded.
const EXREN={"Outdoor Run":"Running","Brisk Walk":"Walking"};
function renameEx(o){let ch=false;
  ["best","pr"].forEach(k=>{const m=o[k];if(!m||typeof m!="object")return;Object.entries(EXREN).forEach(([a,b])=>{if(!(a in m))return;const x=m[a],y=m[b];if(y==null||(k=="best"?x>y:(x&&x.r)>(y&&y.r)))m[b]=x;delete m[a];ch=true})});
  (o.routines||[]).forEach(r=>{if(r&&Array.isArray(r.ex))r.ex=r.ex.map(e=>{if(EXREN[e]){ch=true;return EXREN[e]}return e}).filter((e,i,l)=>l.indexOf(e)==i)});
  return ch}
if(renameEx(S))save(1);
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let tab="barracks",sel=new Set(),gen=null,run=null,sure=false,mode="h",mm="all",build=null,prev=null,bg="Chest",bm="all",editing=false,bq="",aq="";

