const TM={walk:[5,10,15,20,25,30,35,40,45,50],run:[3,6,9,12,15,18,21,24,27,30]};
const skipCost=t=>TM.walk[t]*100;
function skipTo(z){const c=skipCost(z);daily();if(steps()<c){toast("You need "+(c-steps()).toLocaleString()+" more Steps. Earn them from Cardio workouts.");return}S.steps=steps()-c;S.at=z;S.trip=null;save();render();toast("Spent "+c.toLocaleString()+" Steps. Arrived at "+ZN[z][0]+".")}
const skipBtn=(t,l)=>`<button class="btn sm ghost" style="display:inline-flex;align-items:center;gap:5px" ${steps()>=skipCost(t)?"":"disabled"} onclick="skipTo(${t})" aria-label="Skip travel for ${skipCost(t)} Steps">${BOOT(16)}${l} ${skipCost(t).toLocaleString()}</button>`;
const zoneOpen=t=>Math.floor(profLv()/3)>=t-1;
const swI=s=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><path d="M4 4l9 9M4 4h5M4 4v5M20 4l-9 9M20 4h-5M20 4v5M7 14l3 3M17 14l-3 3M6 18l-2 2M18 18l2 2"/></svg>`;
function tripLeft(){const tr=S.trip;if(!tr)return null;const need=TM[tr.k][tr.z],el=(Date.now()-tr.t0)/6e4;return{need,el}}
let msec=null;
const czTxt=()=>{const at=S.at,tr=S.trip;return tr?(tr.k=="run"?"Running":"Walking")+" to "+ZN[tr.z][0]:at==null?"Travel to your first zone":hpNow()<=0?"Too wounded to fight":cdLeft()>0?"Battle ready in "+cdTxt(cdLeft()):"Battle ready"};
setInterval(()=>{const el=$("#cz");if(el)el.textContent=czTxt()},500);
function mapSec(s){msec=s;render();$("#m").scrollTop=0}
// Map tab: a home screen (current location + sections) and the Combat Zone section (travel, zones, battles).
function mapView(){
  const at=S.at,tr=S.trip,wn=S.wins||{};
  if(msec!="combat"){
    const st=czTxt();
    return `<h1>Map</h1>
  <div class="row" style="gap:8px;margin:2px 0 16px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/></svg><div class="sp"><div class="mu" style="margin:0;font-size:13px">Current location</div><b style="font:700 19px Cinzel,serif">${at!=null?ZN[at][0]:"Nowhere yet"}</b></div></div>
  <button class="card row" style="width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer" onclick="mapSec('combat')" aria-label="Open Combat Zone">${swI(34)}<div class="sp"><b style="font:700 18px Cinzel,serif">Combat Zone</b><div class="mu" style="margin:0;font-size:13px">Travel between zones and battle what lives there.</div><div style="font-size:13px;font-weight:600;color:var(--acc);margin-top:2px" id="cz">${st}</div></div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mute)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>`;
  }
  const fmt=m=>Math.floor(m)+":"+String(Math.floor(m%1*60)).padStart(2,"0");
  const tc=tr?(()=>{const{need,el}=tripLeft(),z=ZN[tr.z];return `<div class="card"><b class="sp" style="font:700 17px Cinzel,serif">${tr.k=="run"?"Running":"Walking"} to ${z[0]}</b>
    <div class="row" style="margin-top:6px"><span class="mu" style="margin:0" id="tt">${fmt(Math.min(el,need))} / ${need}:00</span></div>
    <div class="bar" style="height:10px"><i id="tb" style="width:${Math.min(100,el/need*100)}%;background:var(--acc)"></i></div>
    <label class="mu" style="display:block;margin:10px 0 4px;font-size:13px" for="tm">Already done it? Enter the minutes you covered</label>
    <input id="tm" type="number" inputmode="numeric" min="0" placeholder="Minutes" aria-label="Minutes">
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn" onclick="arrive()">Arrive</button><button class="btn ghost" onclick="cancelTrip()">Cancel</button></div><div class="gap">${skipBtn(tr.z,"Skip the trip for")}</div></div>`})():"";
  return `<div class="row" style="margin-bottom:4px"><h1 class="sp" style="margin:0">Combat Zone</h1><button class="btn sm ghost" onclick="mapSec(null)">Back to Map</button></div><p class="mu">Walk or run to a zone and stay there. Fight what lives there, and travel again to move on. Steps from Cardio workouts can skip a trip.</p>
  <div class="card"><div class="row">${swI(30)}<div class="sp"><div class="mu" style="margin:0;font-size:13px">Current location</div><b style="font:700 20px Cinzel,serif">${at!=null?ZN[at][0]:"Nowhere yet"}</b></div></div>
  ${at!=null?`<div class="row" style="margin-top:12px"><div class="sp mu" style="margin:0;font-size:13px">${ZN[at][1]} · ${wn[at]||0} victories<br>You stay here until you travel elsewhere.</div><button class="btn sm" id="bb" style="width:auto" ${bOff()?"disabled":""} onclick="startBattle()">${bTxt("Battle")}</button></div>`:`<p class="mu" style="margin:10px 0 0;font-size:14px">Walk or run to a zone below. You'll stay there and can fight as often as you like.</p>`}</div>
  ${hpCard()}${tc}<h2>Zones</h2>
  ${ZN.map((z,t)=>{const open=zoneOpen(t),here=at==t;return `<div class="card"><div class="row" style="gap:12px;align-items:center">${medal(t*3,60,open)}<div class="sp"><b style="font:700 16px Cinzel,serif;color:${COL[t]}">${z[0]}</b><div class="mu" style="margin:0;font-size:13px">Recommended: ${RANKS[t]} · ${z[1]}</div><div class="mu" style="margin:0;font-size:13px">Walk ${TM.walk[t]} min · Run ${TM.run[t]} min</div></div></div>
  ${here?'<div class="mu" style="margin:8px 0 0;font-weight:600;color:var(--acc)">You are here</div>':open?`<div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn sm" onclick="trip(${t},'walk')">Walk there</button><button class="btn sm ghost" onclick="trip(${t},'run')">Run there</button>${skipBtn(t,"Skip")}</div>`:`<div class="mu" style="margin:8px 0 0;font-size:13px">Locked. Reach ${RANKS[t-1]} rank to travel here.</div>`}</div>`}).join("")}`;
}
function trip(z,k){S.trip={z,k,t0:Date.now()};save();render()}
function cancelTrip(){S.trip=null;save();render()}
function arrive(){const l=tripLeft();if(!l)return;const m=+($("#tm")&&$("#tm").value)||0,got=Math.max(l.el,m);if(got<l.need){toast("Keep going: "+Math.ceil(l.need-got)+" more minute"+(Math.ceil(l.need-got)==1?"":"s")+".");return}const z=S.trip.z;S.at=z;S.trip=null;save();render();toast("Arrived at "+ZN[z][0]+". You can battle here as often as you like.")}
setInterval(()=>{const l=tripLeft();if(tab!="map"||!l)return;const t=$("#tt"),b=$("#tb");if(t)t.textContent=Math.floor(Math.min(l.el,l.need))+":"+String(Math.floor(Math.min(l.el,l.need)%1*60)).padStart(2,"0")+" / "+l.need+":00";if(b)b.style.width=Math.min(100,l.el/l.need*100)+"%"},1000);
let B=null,battleOpen=false;
const ITM=[];
[["heal","Healing Potion","#c0564f",["Restores 30% of your health.","Restores 60% of your health.","Restores all of your health."],[90,220,500],[.3,.6,1]],
 ["str","Strength Potion","#d9822b",["+5% Attack for your next fight.","+7.5% Attack for your next 2 fights.","+10% Attack for your next 3 fights."],[120,300,650],[1,2,3],[5,7.5,10]],
 ["def","Fortitude Potion","#3f6fd0",["+5% Defense for your next fight.","+7.5% Defense for your next 2 fights.","+10% Defense for your next 3 fights."],[120,300,650],[1,2,3],[5,7.5,10]],
 ["mp","Mana Elixir","#8a4fc4",["+50% max MP for your next fight.","+75% max MP for your next 2 fights.","+100% max MP for your next 3 fights."],[100,250,550],[1,2,3],[50,75,100]]
].forEach(([k,n,c,d,p,v,pc])=>[0,1,2].forEach(t=>ITM.push({id:k+(t+1),k,t,n:n+" "+["I","II","III"][t],c,d:d[t],p:p[t],v:v[t],pct:pc?pc[t]:0})));
ITM.push({id:"tonic",k:"tonic",t:0,n:"Tonic of Haste",c:"#3f9a5a",d:"Ends your battle cooldown right away.",p:400,v:0});
const GLY={heal:"M22 28H26V32H30V36H26V40H22V36H18V32H22Z",str:"M24 27L31 35H27V42H21V35H17Z",def:"M24 27L32 30V36C32 40 28 42 24 43C20 42 16 40 16 36V30Z",mp:"M24 27L27 34L34 36L27 38L24 45L21 38L14 36L21 34Z",tonic:"M18 28H30L25 36L30 44H18L23 36Z"};
const PIC=x=>`<path d="M20 7H28V13L35 22C40 29 39 40 33 44H15C9 40 8 29 13 22L20 13Z"/><path d="M19 2H29V7H19Z"/>${x.t>0?'<path d="M17 12H31V15H17Z"/>':""}${x.t>1?'<path d="M41 5L42.5 9L46.5 10.5L42.5 12L41 16L39.5 12L35.5 10.5L39.5 9Z"/><path d="M6 8L7 11L10 12L7 13L6 16L5 13L2 12L5 11Z"/>':""}<path style="fill:var(--tn)" d="${GLY[x.k]}"/><path style="fill:var(--tn)" d="M13 24H35V26H13Z"/>`;
const pTile=(x,z)=>{const b=mixc(x.c,1,.6);return `<div class="ic" style="width:${z}px;height:${z}px;margin:0;flex:none;background:${b};--tn:${b};color:${mixc(x.c,0,.7)}"><svg viewBox="0 0 48 48" fill="currentColor" style="width:${Math.round(z*.75)}px;height:${Math.round(z*.75)}px" aria-hidden="true">${PIC(x)}</svg></div>`};
const have=id=>(S.pot||{})[id]||0;
function itemCard(x){const can=S.gold>=x.p;return `<div class="card it">${pTile(x,96)}<b class="ti2">${x.n}</b><div class="mu" style="margin:0;font-size:12px;min-height:34px">${x.d}</div><div class="mu" style="margin:2px 0 0;font-size:12px">Owned: ${have(x.id)}</div><div class="row" style="justify-content:center;gap:6px;margin:6px 0">${coin(16)}<b>${x.p.toLocaleString()}</b></div><button class="btn sm" style="width:100%" ${can?"":"disabled"} onclick="buyItem('${x.id}')">${can?"Buy":"Need "+(x.p-S.gold).toLocaleString()+" more"}</button></div>`}
function buyItem(id){const x=ITM.find(i=>i.id==id);if(!x||S.gold<x.p)return;S.gold-=x.p;S.pot=S.pot||{};S.pot[id]=have(id)+1;save();store(1);toast("Purchased "+x.n)}
const bfTxt=()=>{const b=S.bf||{},o=[];if(b.atk)o.push("Strength +"+b.atk.p+"% ("+b.atk.n+" fight"+(b.atk.n>1?"s":"")+")");if(b.def)o.push("Fortitude +"+b.def.p+"% ("+b.def.n+" fight"+(b.def.n>1?"s":"")+")");if(b.mp)o.push("Mana +"+b.mp.p+"% ("+b.mp.n+" fight"+(b.mp.n>1?"s":"")+")");return o.join(" · ")};
function usePot(id){
  const x=ITM.find(i=>i.id==id);if(!x||have(id)<1||(B&&!B.over))return;S.bf=S.bf||{};
  if(x.k=="heal"){const m=hpMax();if(hpNow()>=m){toast("You are already at full health.");return}S.hp=Math.min(m,hpNow()+Math.round(m*x.v))}
  else if(x.k=="tonic"){if(cdLeft()<=0){toast("You are not on cooldown.");return}S.cd=0}
  else{const key={str:"atk",def:"def",mp:"mp"}[x.k];S.bf[key]={p:x.pct,n:x.v}}
  S.pot[id]--;save();render();invSheet(1);toast("Used "+x.n)
}
const potSection=()=>{const o=ITM.filter(i=>have(i.id)>0),b=bfTxt();if(!o.length&&!b)return"";return `<h2 style="margin-top:14px">Potions</h2>${b?`<p class="mu" style="margin:0 0 8px;font-size:13px">Active: ${b}</p>`:""}${o.map(x=>`<div class="card row">${pTile(x,52)}<div class="sp"><b>${x.n} × ${have(x.id)}</b><div class="mu" style="margin:0;font-size:12px">${x.d}</div></div><button class="btn sm" style="width:auto" ${B&&!B.over?"disabled":""} onclick="usePot('${x.id}')">Use</button></div>`).join("")}`};

const CD=300;
const EP={a:[34,58,93,149,200,268,340,410,480,554],d:[12,20,47,85,130,181,240,300,360,418],h:[140,190,330,470,600,750,830,900,970,1030]};
const hpMax=()=>calc().hp,hpNow=()=>{const m=hpMax();return Math.max(0,Math.min(S.hp==null?m:S.hp,m))};
const cdLeft=()=>Math.max(0,((S.cd||0)-Date.now())/1000),cdTxt=s=>{s=Math.ceil(s);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const bTxt=l=>hpNow()<=0?"Too wounded":cdLeft()>0?"Ready in "+cdTxt(cdLeft()):l,bOff=()=>hpNow()<=0||cdLeft()>0;
const hpCard=()=>{const v=hpNow(),m=hpMax(),p=v/m*100;return `<div class="card"><div class="row"><b class="sp">Health</b><span style="font:700 16px Cinzel,serif">${v} / ${m}</span></div><div class="bar" style="height:12px;margin-top:8px" role="progressbar" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="${m}" aria-label="Health"><i style="width:${p}%;background:#4f9a5a"></i></div>${v<m?`<div class="mu" style="margin:6px 0 0;font-size:12px">Damage stays until you heal. Finish a workout to recover fully, or use a potion.</div>`:""}${bfTxt()?`<div class="mu" style="margin:6px 0 0;font-size:12px">Active: ${bfTxt()}</div>`:""}<button class="btn sm ghost" style="margin-top:8px;width:auto" onclick="invSheet()">Potions</button></div>`};
setInterval(()=>{[["bb","Battle"],["bf","Fight again"]].forEach(([i,t])=>{const el=$("#"+i);if(!el)return;el.disabled=bOff();el.textContent=bTxt(t)})},500);
const rr=(a,b)=>a+Math.random()*(b-a);
function startBattle(){
  const t=S.at;if(t==null)return;if(cdLeft()>0){toast("You are still catching your breath.");return}
  if(hpNow()<=0){toast("You are too wounded to fight. Finish a workout to recover.");return}
  S.cd=Date.now()+CD*1000;save();const en=ENM[t][Math.floor(Math.random()*ENM[t].length)],c=Object.assign({},calc()),m=Math.round(EP.a[t]*7*rr(.9,1.1)),bf=S.bf=S.bf||{},ap=[];
  [["atk","atk"],["def","def"]].forEach(([k,f])=>{if(bf[k]){c[f]=Math.round(c[f]*(1+bf[k].p/100));ap.push(k=='atk'?"Strength":"Fortitude");if(--bf[k].n<=0)delete bf[k]}});
  const mb=bf.mp?1+bf.mp.p/100:1;if(bf.mp){ap.push("Mana");if(--bf.mp.n<=0)delete bf.mp}save();
  B={t,en,c,e:{hp:m,m,atk:Math.round(EP.h[t]*.11+EP.d[t]*.5),def:Math.round(EP.a[t]*.15)},hp:hpNow(),mp:Math.round((20+c.L*2)*mb),mm:Math.round((20+c.L*2)*mb),log:["A "+en.n+" appears!"].concat(ap.length?[ap.join(", ")+" potion boost active."]:[]),sm:false,over:null,rw:null};
  battleOpen=true;bView();
}
function dmgTo(raw,def){return Math.max(1,Math.round(raw-def*.5))}
function act(a){
  if(!B||B.over)return;const e=B.e,c=B.c,L=[],hp0=B.hp,ehp0=e.hp;let blk=false,stun=false;
  const hit=(raw,ch,nm,ign)=>{if(Math.random()>ch){L.push("Your "+nm+" misses.");return}const d=ign?Math.max(1,Math.round(raw)):dmgTo(raw,e.def);e.hp-=d;L.push("Your "+nm+" hits for "+d+".")};
  if(a=="slash")hit(c.atk*rr(.9,1.2),.92,"slash");
  else if(a=="bash"){hit(c.atk*rr(1.5,1.9),.65,"bash");if(L[0].includes("hits")&&Math.random()<.35){stun=true;L.push("The "+B.en.n+" is stunned!")}}
  else if(a=="block"){blk=true;B.mp=Math.min(B.mm,B.mp+6);L.push("You raise your guard.")}
  else if(a=="fire"){if(B.mp<12)return;B.mp-=12;hit(c.atk*rr(1.9,2.3),1,"Fireball",1)}
  else if(a.startsWith("pot:")){const x=ITM.find(i=>i.id==a.slice(4));if(!x||have(x.id)<1||x.k!="heal")return;S.pot[x.id]--;const h2=Math.min(c.hp-B.hp,Math.round(c.hp*x.v));B.hp+=h2;L.push("You drink "+x.n+" and recover "+h2+" HP.")}
  else if(a=="mend"){if(B.mp<10)return;B.mp-=10;const h=Math.round(c.hp*.35);B.hp=Math.min(c.hp,B.hp+h);L.push("You mend "+h+" HP.")}
  B.sm=false;
  if(e.hp<=0){e.hp=0;B.over="win";const t=B.t,g=Math.round(15+t*15+rr(0,8)),x=12+t*8;S.gold+=g;S.xp+=x;S.wins=S.wins||{};S.wins[B.t]=(S.wins[B.t]||0)+1;B.rw=[g,x];L.push("Victory!");save()}
  else{
    if(stun)L.push("It cannot act this turn.");
    else if(Math.random()<.92){let d=dmgTo(e.atk*rr(.8,1.2)*(Math.random()<.15?1.6:1),c.def);if(blk)d=Math.max(1,Math.round(d*.25));B.hp-=d;L.push("The "+B.en.n+" hits you for "+d+(blk?" (blocked).":"."))}
    else L.push("The "+B.en.n+" misses.");
    B.mp=Math.min(B.mm,B.mp+2);
    if(B.hp<=0){B.hp=0;B.over="lose";L.push("You were defeated and retreat.")}
  }
  S.hp=B.hp;if(B.over)S.cd=Date.now()+CD*1000;save();B.log=B.log.concat(L).slice(-5);B.fx=B.hp<hp0?"hurt":(B.e.hp<ehp0?"hit":null);bView();
}
function bView(){
  const e=B.e,pc=(a,b)=>Math.max(0,a/b*100),z=ZN[B.t],gone=!!B.over,win=B.over=="win";
  const bar=(v,m,col,h=12)=>`<div class="bar" style="height:${h}px;margin-top:0"><i style="width:${pc(v,m)}%;background:${col}"></i></div>`;
  const fx=B.fx;B.fx=null;
  const sub=(l,s)=>`${l}<br><small>${s}</small>`;
  const ctl=gone?`<div class="card" style="text-align:center;margin:0"><b style="font:700 20px Cinzel,serif">${win?"Victory":"Defeat"}</b><div class="mu" style="margin:4px 0 10px">${win?"+"+B.rw[0]+" Gold · +"+B.rw[1]+" XP":"You earned nothing this time. Gear up and try again."}</div><div class="row" style="gap:8px"><button class="btn" id="bf" ${bOff()?"disabled":""} onclick="startBattle()">${bTxt("Fight again")}</button><button class="btn ghost" onclick="closeInfo()">Leave</button></div></div>`
  :B.sm===true?`<div class="bg6"><button class="btn" style="grid-column:span 3" ${B.mp>=12?"":"disabled"} onclick="act('fire')">${sub("Fireball","12 MP · ignores armor")}</button><button class="btn" style="grid-column:span 3" ${B.mp>=10?"":"disabled"} onclick="act('mend')">${sub("Mend","10 MP · heal 35%")}</button><button class="btn ghost" style="grid-column:span 6" onclick="B.sm=false;bView()">Back</button></div>`
  :B.sm=="items"?`<div class="bg6">${ITM.filter(i=>i.k=="heal"&&have(i.id)>0).map(x=>`<button class="btn" style="grid-column:span 6" onclick="act('pot:${x.id}')">${sub(x.n+" × "+have(x.id),x.d)}</button>`).join("")||'<p class="mu" style="grid-column:span 6;margin:0">You have no healing potions.</p>'}<button class="btn ghost" style="grid-column:span 6" onclick="B.sm=false;bView()">Back</button></div>`
  :`<div class="bg6"><button class="btn" style="grid-column:span 2" onclick="act('slash')">${sub("Slash","Reliable")}</button><button class="btn" style="grid-column:span 2" onclick="act('bash')">${sub("Bash","Heavy, may stun")}</button><button class="btn" style="grid-column:span 2" onclick="act('block')">${sub("Block","Less damage")}</button><button class="btn ghost" style="grid-column:span 3" onclick="B.sm=true;bView()">${sub("Spell","Uses MP")}</button><button class="btn ghost" style="grid-column:span 3" onclick="B.sm='items';bView()">${sub("Items","Healing potions")}</button></div>`;
  $("#info").innerHTML=`<div class="sheet bsh">
  <div class="row"><div class="sp"><b style="font:700 18px Cinzel,serif">${z[0]}</b></div>${gone?"":'<button class="btn sm ghost" id="ic" onclick="closeInfo()">Flee</button>'}</div>
  <div class="arena" style="--ac:${COL[B.t]}">
    <div class="en-nm" style="color:${mixc(COL[B.t],0,.25)}">${B.en.n}</div>
    <div class="en-hp" role="progressbar" aria-label="Enemy health" aria-valuenow="${e.hp}" aria-valuemin="0" aria-valuemax="${e.m}">${bar(e.hp,e.m,"#c0564f",14)}<div class="mu" style="margin:3px 0 0;font-size:12px;text-align:center">${e.hp} / ${e.m} HP</div></div>
    <div class="en-art ${fx=="hit"?"eshake":""}" style="${win?"opacity:.25;filter:grayscale(1)":""}"><svg viewBox="0 0 120 120" aria-hidden="true">${B.en.s}</svg></div>
    <div class="en-gr"></div>
    <div class="blog" aria-live="polite">${B.log.slice(-3).map(l=>`<div>${l}</div>`).join("")}</div>
  </div>
  <div class="card pstrip ${fx=="hurt"?"phurt":""}"><div><div class="mu" style="margin:0 0 2px;font-size:12px">HP ${B.hp} / ${B.c.hp}</div>${bar(B.hp,B.c.hp,"#4f9a5a",10)}</div><div><div class="mu" style="margin:0 0 2px;font-size:12px">MP ${B.mp} / ${B.mm}</div>${bar(B.mp,B.mm,"#3f6fd0",10)}</div></div>
  ${ctl}</div>`;
  openSheet(1);
}
