const GEAR={};ITEMS.forEach(x=>GEAR[x.id]={s:x.slot,atk:x.atk,def:x.def,hp:x.hp});
const SLOTS=[["weapon","Weapon"],["head","Head"],["body","Body"],["legs","Legs"],["boots","Boots"],["hands","Hands"]];
const item=id=>ITEMS.find(x=>x.id==id);
const gtxt=id=>{const g=GEAR[id],o=[];if(g.atk)o.push("+"+g.atk+" Attack");if(g.def)o.push("+"+g.def+" Defense");if(g.hp)o.push("+"+g.hp+" Health");return o.join(" · ")};
const tile=(x,z)=>`<div class="ic" style="width:${z}px;height:${z}px;margin:0;flex:none;background:${mixc(x.c,1,.6)};--tn:${mixc(x.c,1,.6)};color:${mixc(x.c,0,.8)}"><svg viewBox="0 0 48 48" fill="currentColor" style="width:${Math.round(z*.75)}px;height:${Math.round(z*.75)}px" aria-hidden="true">${ICO[x.i]}</svg></div>`;
function calc(){
  const lg=logged(),W=lg.filter(e=>EX[e].t=="w"),R=lg.filter(e=>EX[e].t!="w"),sm=a=>a.reduce((n,e)=>n+rk(e)+1,0),L=lvl()[0],g={atk:0,def:0,hp:0};
  Object.values(S.eq||{}).forEach(id=>{const q=GEAR[id];if(q){g.atk+=q.atk||0;g.def+=q.def||0;g.hp+=q.hp||0}});
  const str=5+Math.round(sm(W)/2),end=5+Math.round(sm(R)/2),vit=5+L+Math.floor(S.log.length/5);
  return{L,str,end,vit,g,atk:str*2+g.atk,def:end+g.def,hp:50+vit*10+g.hp};
}
let eqv="eq",pslot=null;
const sheetHead=t=>`<div class="row"><h1 class="sp" style="margin:0;font-size:23px">${t}</h1><button class="btn sm ghost" id="ic" onclick="closeInfo()">Close</button></div>`;
function openSheet(keep){$("#info").classList.add("on");if(!keep){$("#info").scrollTop=0;$("#ic").focus()}}
function equipSheet(keep){
  eqv="eq";const c=calc(),eq=S.eq||{};
  $("#info").innerHTML=`<div class="sheet">${sheetHead("Equipment")}
  <div class="stats" style="margin:12px 0"><div class="stat"><b>+${c.g.atk}</b><span>Attack</span></div><div class="stat"><b>+${c.g.def}</b><span>Defense</span></div><div class="stat"><b>+${c.g.hp}</b><span>Health</span></div></div>
  ${pslot?pickView():`<div class="mg">${SLOTS.map(([k,l])=>{const id=eq[k],x=id&&item(id);return `<div class="card it"><div class="mu" style="margin:0 0 6px;font-weight:600">${l}</div><div style="display:flex;justify-content:center">${x?tile(x,72):'<div class="ic" style="width:72px;height:72px;margin:0;background:var(--bg);border:2px dashed var(--line)"></div>'}</div><b class="ti2" style="margin-top:6px;min-height:40px">${x?x.n:"Empty"}</b>${x?`<div class="mu" style="margin:0 0 6px;font-size:12px"><span style="color:${COL[x.tier]};font-weight:600">${RANKS[x.tier]}</span> · ${gtxt(id)}</div>`:""}<button class="btn sm ${x?"ghost":""}" style="width:100%" onclick="pslot='${k}';equipSheet()">${x?"Change":"Equip"}</button></div>`}).join("")}</div>`}</div>`;
  openSheet(keep);
}
function pickView(){
  const L=S.inv.map(item).filter(x=>GEAR[x.id].s==pslot),cur=(S.eq||{})[pslot],lab=SLOTS.find(s=>s[0]==pslot)[1];
  return `<div class="row" style="margin-bottom:8px"><h2 class="sp" style="margin:0">${lab}</h2><button class="btn sm ghost" onclick="pslot=null;equipSheet()">Back</button></div>
  ${L.length?L.map(x=>`<div class="card row">${tile(x,56)}<div class="sp"><b>${x.n}</b><div class="mu" style="margin:0;font-size:13px"><span style="color:${COL[x.tier]};font-weight:600">${RANKS[x.tier]}</span> · ${gtxt(x.id)}</div></div>${cur==x.id?`<button class="btn sm ghost" onclick="unequip('${pslot}')">Unequip</button>`:`<button class="btn sm" onclick="equip('${x.id}')">Equip</button>`}</div>`).join(""):'<p class="mu">You don\'t own anything for this slot yet. Buy some in the Store, found in Barracks.</p>'}`;
}
function invSheet(keep){
  eqv="inv";const eq=S.eq||{},L=S.inv.map(item);
  $("#info").innerHTML=`<div class="sheet">${sheetHead("Inventory")}${potSection()}
  ${L.length?`<p class="mu" style="margin-top:4px">${L.length} item${L.length==1?"":"s"} owned. Equip gear here or on the Equipment screen.</p><div class="mg">${L.map(x=>{const sl=GEAR[x.id].s,on=eq[sl]==x.id;return `<div class="card it"><div style="height:20px;font-weight:600;font-size:13px;color:var(--acc)">${on?"Equipped":""}</div><div style="display:flex;justify-content:center">${tile(x,84)}</div><b class="ti2" style="margin-top:8px">${x.n}</b><div class="mu" style="margin:0 0 8px;font-size:12px"><span style="color:${COL[x.tier]};font-weight:600">${RANKS[x.tier]}</span> · ${gtxt(x.id)}</div><button class="btn sm ${on?"ghost":""}" style="width:100%" onclick="${on?"unequip('"+sl+"')":"equip('"+x.id+"')"}">${on?"Unequip":"Equip"}</button></div>`}).join("")}</div>`:`<p class="mu" style="margin:12px 0">No gear yet. Buy weapons and armor in the Store.</p><button class="btn" onclick="store()">Open Store</button>`}</div>`;
  openSheet(keep);
}
function refreshGear(){if(eqv=="inv")invSheet(1);else equipSheet(1)}
function equip(id){if(!S.inv.includes(id))return;S.eq=S.eq||{};S.eq[GEAR[id].s]=id;pslot=null;save();refreshGear();toast("Equipped "+item(id).n)}
function unequip(sl){if(S.eq)delete S.eq[sl];pslot=null;save();refreshGear();toast("Unequipped")}
function statsSheet(){
  const c=calc(),lg=logged(),lv=profLv(),tot=S.log.reduce((a,l)=>a+(l.dur||0),0)/6e4;
  const row=(l,v,h,b)=>`<div class="card"><div class="row"><b class="sp">${l}</b>${b?`<span style="color:var(--acc);font-weight:600">+${b} gear</span>`:""}<b style="font:700 22px Cinzel,serif">${v}</b></div><div class="mu" style="margin:2px 0 0;font-size:13px">${h}</div></div>`;
  $("#info").innerHTML=`<div class="sheet">${sheetHead("Stats")}
  <div class="card row" style="margin-top:12px">${medal(lv,92,lg.length>0)}<div class="sp"><div style="color:${COL[lv/3|0]};font:700 18px Cinzel,serif">${rname(lv)}</div><div style="font:700 26px Cinzel,serif">Level ${c.L}</div><div class="mu" style="margin:0;font-size:13px">${S.xp.toLocaleString()} total XP</div></div></div>
  <h2>Attributes</h2>${row("Strength",c.str,"Grows as you rank up weighted lifts.")}${row("Endurance",c.end,"Grows as you rank up bodyweight and timed cardio exercises.")}${row("Vitality",c.vit,"Grows with your level and completed workouts.")}
  <h2>Combat</h2>${row("Attack",c.atk,"Strength × 2, plus your weapon.",c.g.atk)}${row("Defense",c.def,"Endurance, plus your armor.",c.g.def)}${row("Health",c.hp,"50, plus Vitality × 10, plus gear.",c.g.hp)}
  <h2>Journey</h2><div class="stats" style="margin-top:0"><div class="stat"><b>${S.log.length}</b><span>Workouts</span></div><div class="stat"><b>${Math.round(tot)}m</b><span>Training time</span></div><div class="stat"><b>${S.gold.toLocaleString()}</b><span>Gold</span></div></div></div>`;
  openSheet();
}
