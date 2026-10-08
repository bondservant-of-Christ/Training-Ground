const TABS=[["barracks","Barracks",'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'],["training","Training",'<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>'],["map","Map",'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>'],["medallions","Medallions",'<circle cx="12" cy="15" r="6"/><path d="M8.5 9.5L7 3h4l1 4M15.5 9.5L17 3h-4l-1 4"/>'],["profile","Profile",'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-6 8-6s7 1.5 8 6"/>']];
function render(){
  $("#m").innerHTML={barracks,training,map:mapView,medallions,profile}[tab]();
  $("#n").innerHTML=TABS.map(([id,l,p])=>`<button ${tab==id?'aria-current="page"':""} onclick="go('${id}')"><svg viewBox="0 0 24 24">${p}</svg>${l}</button>`).join("");
}
function go(t){tab=t;sure=false;editing=false;msec=null;render();$("#m").scrollTop=0}
function toast(s){const t=$("#t");t.textContent=s;t.classList.add("on");setTimeout(()=>t.classList.remove("on"),3200)}
function tg(g){sel.has(g)?sel.delete(g):sel.add(g);render()}
function mk(){
  const gs=[...sel],per=Math.max(1,Math.floor(6/gs.length));
  gen=gs.flatMap(g=>pool(g).sort(()=>Math.random()-.5).slice(0,per));render();
}
function sv(){const n=$("#rn").value.trim();if(!n){$("#rn").focus();return}S.routines.push({name:n,ex:[...gen]});save();render();toast("Routine saved")}
function begin(ex,name){run={name,t0:Date.now(),items:ex.map(e=>({ex:e,rows:EX[e].t=="m"?[{w:"",r:""}]:[{w:"",r:""},{w:"",r:""},{w:"",r:""}]}))};render();$("#m").scrollTop=0}
function fin(){
  const ups=[];let sets=0,stp=0;const L0=lvl()[0];daily();
  run.items.forEach(it=>{const e=EX[it.ex],b=rk(it.ex);
    it.rows.forEach(r=>{const w=+r.w,n=+r.r;if(!r.done||!(n>0)||(e.t=="w"&&!(w>0)))return;if(e.g=="Cardio")stp+=e.t=="m"?Math.round(Math.min(120,n)*100):Math.round(n*2);sets+=e.t=="m"?Math.min(6,Math.max(1,Math.round(n/5))):1;const v=e.t!="w"?n:w*(1+n/30);S.pr=S.pr||{};const pp=S.pr[it.ex],pv=pp?(e.t!="w"?pp.r:pp.w*(1+pp.r/30)):0;if(v>pv)S.pr[it.ex]={w:e.t=="w"?w:0,r:n};if(v>(S.best[it.ex]||0))S.best[it.ex]=Math.round(v*10)/10});
    if(rk(it.ex)>b)ups.push(it.ex+" "+rname(rk(it.ex)));});
  const gain=7*sets+25*ups.length,gold=6*sets+25*ups.length;S.xp+=gain;S.gold+=gold;S.steps=steps()+stp;const hurt=hpNow()<hpMax();S.hp=null;const L1=lvl()[0];
  S.log.push({d:Date.now(),name:run.name,dur:Date.now()-run.t0});save();run=null;go("barracks");
  toast("+"+gain+" XP · +"+gold+" Gold"+(stp?" · +"+stp.toLocaleString()+" Steps":"")+(L1>L0?" · Level "+L1+"!":"")+(hurt?" · Fully healed":"")+(ups.length?" · Rank up: "+ups.join(", "):""));
}
function rs(){if(!sure){sure=true;settings();return}const ac=S.uid?{uid:S.uid,rv:S.rv,ms:S.ms,fc:S.fc,friends:S.friends||[]}:{};S=Object.assign({name:"Recruit",bw:180,routines:[],best:{},log:[],xp:0,rest:60,gold:0,inv:[],eq:{},v2:1,v3:1,pot:{},bf:{},since:Date.now()},ac);daily();save();delete document.documentElement.dataset.theme;sure=false;gen=null;closeInfo();render()}
function exportSave(){const b=new Blob([JSON.stringify(S)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="barracks-save-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Save exported")}
function importSave(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||typeof o!="object"||!Array.isArray(o.log)||typeof o.best!="object"||typeof o.xp!="number")throw 0;o.mt=Date.now();localStorage.setItem(KEY,JSON.stringify(o));location.reload()}catch(e){toast("That file is not a Barracks save.")}};r.readAsText(f)}
const D0=daily();
render();drawHud();
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&daily())render()});
if(D0&&S.lost){toast("A new week has begun. Your "+S.lost.toLocaleString()+" unused Steps expired.")}else if(D0&&D0.up){toast(S.streak+"-day streak! Keep it going.")}
if(S.lost){delete S.lost;save(1)}
if(S.refund3){toast("Armor slots changed. Your old Cloak was refunded as "+S.refund3.toLocaleString()+" Gold.");delete S.refund3;save(1)}else if(S.refund){toast("Store updated. Your old gear was refunded as "+S.refund.toLocaleString()+" Gold.");delete S.refund;save(1)}

