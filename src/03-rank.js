const val=(ex,b)=>EX[ex].t=="w"?b/S.bw:b;
const rk=ex=>{const b=S.best[ex];return b?EX[ex].th.filter(t=>val(ex,b)>=t).length:0};
const mixc=(h,t,a)=>{const n=parseInt(h.slice(1),16),T=t?255:0;return "#"+[16,8,0].map(k=>Math.round((n>>k&255)*(1-a)+T*a).toString(16).padStart(2,"0")).join("")};
const metal=c=>`linear-gradient(135deg,${mixc(c,1,.6)},${c} 28%,${mixc(c,0,.4)} 52%,${c} 74%,${mixc(c,1,.55)})`;
const logged=()=>Object.keys(EX).filter(e=>S.best[e]);
const lvl=()=>{let l=1,x=S.xp;while(x>=l*100){x-=l*100;l++}return[l,x,l*100]};

// Daily streak (one per calendar day the app is opened) and weekly Steps (reset every Monday).
const dkey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
function daily(){
  const n=new Date(),today=dkey(n),yest=dkey(new Date(n.getFullYear(),n.getMonth(),n.getDate()-1)),wk=dkey(new Date(n.getFullYear(),n.getMonth(),n.getDate()-(n.getDay()+6)%7));
  let ch=false,up=false;
  if(S.day!=today){up=S.day==yest;S.streak=up?(S.streak||0)+1:1;S.day=today;S.bestStreak=Math.max(S.bestStreak||0,S.streak);ch=true}
  if(S.wk!=wk){S.lost=S.wk?S.steps||0:0;S.steps=0;S.wk=wk;ch=true}
  if(ch)save(1);
  return ch?{up}:null;
}
const steps=()=>S.steps||0;
const kfmt=n=>n>=1e6?(n/1e6).toFixed(1).replace(".0","")+"M":n>=1e4?(n/1e3).toFixed(1).replace(".0","")+"k":n.toLocaleString();
const FLAME=(s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="#e2762a" d="M12.5 1.5c.8 4 5.5 6.200 5.500 11.800a6 6 0 0 1-12 0c0-2.400 1-4.200 2.400-5.500.100 2 1 3.200 2.100 3.400.600-3-.300-6.200 2-9.700z"/><path fill="#ffd23a" d="M12 12.500c1.700 1.600 2.600 2.900 2.600 4.400a2.600 2.600 0 0 1-5.200 0c0-1.500.900-2.800 2.600-4.400z"/></svg>`;
const BOOT=(s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="#3f9aa8" d="M7 2h7v9.500l5 2c1.800.700 3 2 3 4V19H5v-6z"/><path fill="#2a6d78" d="M4 20h18v2H4z"/><path fill="#fff" fill-opacity=".7" d="M7 5h7v1.600H7z"/></svg>`;
function drawHud(){
  const h=$("#hud");if(!h)return;const [L,x,n]=lvl(),k=S.streak||1;
  h.innerHTML=`<button onclick="hudGo('profile')" aria-label="Level ${L}. Open profile"><b>Lv ${L}</b><span class="hb"><i style="width:${x/n*100}%"></i></span></button>
  <button onclick="hudTip('streak')" aria-label="${k} day streak">${FLAME()}<span>${k}</span></button>
  <span class="sp"></span>
  <button onclick="hudTip('steps')" aria-label="${steps()} steps">${BOOT()}<span>${kfmt(steps())}</span></button>
  <button onclick="hudGo('store')" aria-label="${S.gold} Gold. Open store">${coin(18)}<span>${kfmt(S.gold)}</span></button>`;
}
function hudGo(w){if(battleOpen)return;if(w=="store"){store();return}closeInfo();go("profile")}
function hudTip(w){const k=S.streak||1;toast(w=="streak"?k+"-day streak. Open the app every day to keep it going."+((S.bestStreak||0)>k?" Best: "+S.bestStreak+" days.":""):steps().toLocaleString()+" Steps. Earn them from Cardio workouts and spend them on the Map to skip travel. They expire Sunday night.")}
