const MAT=["Wooden","Bronze","Iron","Gilded","Verdant","Frost","Royal","Crimson","Radiant","Dragonbone"];
const SLD=[["weapon","Sword",1.5],["head","Helm",1],["body","Chestplate",1.3],["legs","Leggings",1.1],["boots","Boots",.8],["hands","Gauntlets",.8]];
const PRC=[50,170,430,900,1700,3000,5000,8200,13000,20000],AT=[4,8,13,19,26,34,43,53,64,80],DF=[2,4,7,11,16,22,29,37,46,56],DW={head:1,body:1.6,legs:1.2,boots:.8,hands:.7},HW={body:3,legs:2};
const ITEMS=[];SLD.forEach(([sl,lb,pm])=>RANKS.forEach((r,t)=>{const o={id:sl+t,slot:sl,tier:t,n:MAT[t]+" "+lb,p:Math.round(PRC[t]*pm/10)*10,c:COL[t],i:sl+t};if(sl=="weapon")o.atk=AT[t];else{o.def=Math.round(DF[t]*DW[sl]);if(HW[sl])o.hp=Math.round(DF[t]*HW[sl])}ITEMS.push(o)}));
let stab="weapon",storeOpen=false;
function store(keep){
  storeOpen=true;const L=ITEMS.filter(x=>x.slot==stab);
  $("#info").innerHTML=`<div class="sheet"><div class="row"><h1 class="sp" style="margin:0;font-size:23px">Store</h1><button class="btn sm ghost" id="ic" onclick="closeInfo()">Close</button></div>
  <div class="card row" style="margin-top:12px">${coin(28)}<div class="sp"><b style="font:700 24px Cinzel,serif">${S.gold.toLocaleString()}</b><div class="mu" style="margin:0;font-size:13px">Gold. Earn more by finishing workouts.</div></div></div>
  <div class="chips">${[["weapon","Swords"],["head","Head"],["body","Body"],["legs","Legs"],["boots","Boots"],["hands","Hands"],["items","Items"]].map(([k,l])=>`<button class="chip ${stab==k?"on":""}" onclick="stab='${k}';store(1)">${l}</button>`).join("")}</div>
  <div class="mg">${stab=="items"?ITM.map(itemCard).join(""):L.map(x=>{const own=S.inv.includes(x.id),can=S.gold>=x.p,bgc=mixc(x.c,1,.6);return `<div class="card it"><div class="ic" style="background:${bgc};--tn:${bgc};color:${mixc(x.c,0,.8)}"><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">${ICO[x.i]}</svg></div><b class="ti2">${x.n}</b><div style="font:600 13px Cinzel,serif;color:${COL[x.tier]}">${RANKS[x.tier]}</div><div class="mu" style="margin:0;font-size:12px">${gtxt(x.id)}</div>${own?'<div class="mu" style="margin:6px 0 0;font-weight:600">Owned</div>':`<div class="row" style="justify-content:center;gap:6px;margin:6px 0">${coin(16)}<b>${x.p.toLocaleString()}</b></div><button class="btn sm" style="width:100%" ${can?"":"disabled"} onclick="buy('${x.id}')">${can?"Buy":"Need "+(x.p-S.gold).toLocaleString()+" more"}</button>`}</div>`}).join("")}</div></div>`;
  $("#info").classList.add("on");if(!keep){$("#info").scrollTop=0;$("#ic").focus()}
}
function buy(id){const x=ITEMS.find(i=>i.id==id);if(!x||S.inv.includes(id)||S.gold<x.p)return;S.gold-=x.p;S.inv.push(id);save();store(1);toast("Purchased "+x.n)}
