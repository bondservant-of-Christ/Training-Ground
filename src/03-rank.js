const val=(ex,b)=>EX[ex].t=="r"?b:b/S.bw;
const rk=ex=>{const b=S.best[ex];return b?EX[ex].th.filter(t=>val(ex,b)>=t).length:0};
const mixc=(h,t,a)=>{const n=parseInt(h.slice(1),16),T=t?255:0;return "#"+[16,8,0].map(k=>Math.round((n>>k&255)*(1-a)+T*a).toString(16).padStart(2,"0")).join("")};
const metal=c=>`linear-gradient(135deg,${mixc(c,1,.6)},${c} 28%,${mixc(c,0,.4)} 52%,${c} 74%,${mixc(c,1,.55)})`;
const logged=()=>Object.keys(EX).filter(e=>S.best[e]);
const lvl=()=>{let l=1,x=S.xp;while(x>=l*100){x-=l*100;l++}return[l,x,l*100]};
