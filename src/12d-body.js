// Body details (Profile > Body). PRIVATE BY DESIGN: everything here lives in its own localStorage key and is never
// put in S, so it is never uploaded with the online save, never published to players/ or stats/, and never exported.
// Only bodyweight (S.bw) is shared with the rest of the app, because ranks need it.
const BODY_KEY="barracks-body-v1";
const bodyKey=()=>BODY_KEY+":"+(S.uid||"local");
function bodyGet(){
  let o=null;try{o=JSON.parse(localStorage.getItem(bodyKey())||"null")}catch(e){}
  if(!o&&S.uid){
    // Details entered before signing in follow the player into their account's slot on this device.
    try{const l=localStorage.getItem(BODY_KEY+":local");if(l){o=JSON.parse(l);localStorage.setItem(bodyKey(),l);localStorage.removeItem(BODY_KEY+":local")}}catch(e){o=null}
  }
  return o&&typeof o=="object"?o:{};
}
function bodySet(o){try{localStorage.setItem(bodyKey(),JSON.stringify(o))}catch(e){}}
function bodyWipe(){try{localStorage.removeItem(bodyKey())}catch(e){}}
const numIn=v=>{const n=parseFloat(v);return n>0&&isFinite(n)?n:0};
// Bodyweight is the one value the rest of the app uses. Each change is also noted in the private weight log (one entry per day).
function setBw(v){
  const n=numIn(v);if(!n)return false;S.bw=Math.min(700,Math.max(50,Math.round(n*10)/10));save();
  const b=bodyGet(),d=dkey(new Date());b.log=(b.log||[]).filter(e=>e.d!=d);b.log.push({d,w:S.bw});b.log=b.log.slice(-200);bodySet(b);return true;
}
const ACT=[["1.2","Mostly sitting"],["1.375","Light (1-3 days)"],["1.55","Moderate (3-5 days)"],["1.725","Hard (6-7 days)"],["1.9","Very hard, physical job"]];
const BFC={m:[[6,"Essential fat"],[14,"Athlete range"],[18,"Fitness range"],[25,"Average range"],[1e9,"Above average range"]],f:[[14,"Essential fat"],[21,"Athlete range"],[25,"Fitness range"],[32,"Average range"],[1e9,"Above average range"]]};
function bodyCalc(){
  const b=bodyGet(),h=numIn(b.ft)*12+numIn(b.inch),w=S.bw,a=numIn(b.age),sx=b.sex,n=numIn(b.neck),wa=numIn(b.waist),hp=numIn(b.hips),o={h,w,need:[]};
  const kg=w*.45359237,cm=h*2.54,L=Math.log10;
  if(h)o.bmi=w*703/(h*h);
  if(sx&&h&&n&&wa&&(sx=="m"||hp)){
    // U.S. Navy circumference method (Hodgdon & Beckett), inches.
    const x=sx=="m"?wa-n:wa+hp-n;
    if(x>0){const v=sx=="m"?86.010*L(x)-70.041*L(h)+36.76:163.205*L(x)-97.684*L(h)-78.387;if(v>=2&&v<=65){o.bf=v;o.tape=true}else o.bad=true}else o.bad=true;
  }
  if(o.bf==null&&o.bmi&&a&&sx){
    // Fallback without a tape: Deurenberg estimate from BMI, age and sex. Much rougher.
    const v=1.2*o.bmi+.23*a-10.8*(sx=="m"?1:0)-5.4;if(v>=2&&v<=65)o.bf=v;
  }
  if(o.bf!=null){o.fat=w*o.bf/100;o.lean=w-o.fat;o.cat=BFC[sx].find(c=>o.bf<c[0])[1]}
  // Resting calories: Katch-McArdle when lean mass comes from tape measurements, otherwise Mifflin-St Jeor.
  if(o.tape)o.bmr=370+21.6*o.lean*.45359237;else if(sx&&a&&h)o.bmr=10*kg+6.25*cm-5*a+(sx=="m"?5:-161);
  if(o.bmr&&numIn(b.act))o.tdee=o.bmr*numIn(b.act);
  if(wa&&h)o.whtr=wa/h;
  if(!sx)o.need.push("sex");if(!h)o.need.push("height");if(!a)o.need.push("age");
  return o;
}
function bodyRes(){
  const b=bodyGet(),c=bodyCalc(),r=(l,v,h)=>`<div class="card"><div class="row"><b class="sp">${l}</b><b style="font:700 22px Cinzel,serif">${v}</b></div><div class="mu" style="margin:2px 0 0;font-size:13px">${h}</div></div>`,lb=v=>(Math.round(v*10)/10).toLocaleString()+" lb";
  let s="";
  if(c.bad)s+=`<p role="alert" style="color:var(--acc);font-weight:600;margin:0 0 12px">Those tape measurements don't add up. Check that each one is in inches and that your waist is larger than your neck.</p>`;
  if(c.bf!=null){
    s+=r("Body fat","about "+c.bf.toFixed(1)+"%",c.tape?c.cat+". Tape-measure (U.S. Navy) method, usually within 3 to 4 percentage points of a lab scan.":c.cat+". Rough estimate from height, weight and age only. It reads too high for muscular people. Add tape measurements below for a better number.");
    s+=r("Lean mass",lb(c.lean),"Everything that isn't fat: muscle, bone, organs and water.")+r("Fat mass",lb(c.fat),"Your bodyweight times your body fat estimate.");
  }
  if(c.bmi)s+=r("BMI",c.bmi.toFixed(1),"Weight for height only. It can't tell muscle from fat, so lifters often score high.");
  if(c.whtr)s+=r("Waist to height",c.whtr.toFixed(2),"Waist divided by height. Under 0.50 is the usual health guideline.");
  if(c.bmr)s+=r("Resting calories",Math.round(c.bmr/10)*10+" / day","What your body burns at complete rest"+(c.tape?", based on your lean mass.":"."));
  if(c.tdee)s+=r("Maintenance calories",Math.round(c.tdee/50)*50+" / day","Roughly what you burn in a normal day at your activity level. Eat less to lose weight, more to gain.");
  else if(c.bmr)s+=`<p class="mu" style="font-size:13px">Pick an activity level above to see maintenance calories.</p>`;
  if(!s)s=`<p class="mu">Fill in your ${c.need.join(", ").replace(/, ([^,]*)$/," and $1")||"details"} above to see your numbers.</p>`;
  else if(c.need.length&&c.bf==null)s+=`<p class="mu" style="font-size:13px">Add your ${c.need.join(", ").replace(/, ([^,]*)$/," and $1")} for more.</p>`;
  const lg=b.log||[];
  if(lg.length){
    const f=lg[0],l=lg[lg.length-1],df=Math.round((l.w-f.w)*10)/10,dt=d=>{const[y,m,x]=d.split("-");return new Date(+y,+m-1,+x).toLocaleDateString(undefined,{month:"short",day:"numeric"})};
    s+=`<h2>Weight log</h2><div class="card">${lg.slice(-6).reverse().map(e=>`<div class="row" style="padding:4px 0"><span class="sp">${dt(e.d)}</span><b>${e.w} lb</b></div>`).join("")}${lg.length>1?`<div class="mu" style="margin:8px 0 0;font-size:13px">${df==0?"No change":(df>0?"Up ":"Down ")+Math.abs(df)+" lb"} since ${dt(f.d)}.</div>`:`<div class="mu" style="margin:8px 0 0;font-size:13px">Update your bodyweight here whenever you weigh in to build a history.</div>`}</div>`;
  }
  return s;
}
function bodyIn(k,v){
  if(k=="bw"){if(setBw(v))$("#bres").innerHTML=bodyRes();return}
  const b=bodyGet();b[k]=String(v).slice(0,8);bodySet(b);$("#bres").innerHTML=bodyRes();
}
function bodyPick(k,v){const b=bodyGet();b[k]=v;bodySet(b);bodySheet(1)}
let bodySure=false;
function bodyClear(){if(!bodySure){bodySure=true;bodySheet(1);return}bodySure=false;bodyWipe();bodySheet(1);toast("Body details erased from this device.")}
function bodySheet(keep){
  if(!keep)bodySure=false;
  const b=bodyGet(),f=b.sex=="f",v=k=>esc(b[k]||"");
  const fld=(id,l,k,ph,val)=>`<div><label class="mu" for="${id}" style="display:block;margin:0 0 4px;font-size:13px">${l}</label><input id="${id}" type="number" inputmode="decimal" min="0" step="any" placeholder="${ph}" value="${val==null?v(k):val}" on${k=="bw"?"change":"input"}="bodyIn('${k}',this.value)"></div>`;
  const chips=(k,opts)=>`<div class="chips" style="margin-bottom:0">${opts.map(([x,l])=>`<button class="chip ${b[k]==x?"on":""}" aria-pressed="${b[k]==x}" onclick="bodyPick('${k}','${x}')">${l}</button>`).join("")}</div>`;
  $("#info").innerHTML=`<div class="sheet">${sheetHead("Body")}
  <div class="card row" style="margin-top:12px;align-items:flex-start"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><div class="sp"><b>Private to you</b><div class="mu" style="margin:2px 0 0;font-size:13px">Your details and results on this screen are stored only on this device. They are never uploaded, never part of your online save, and never shown on your profile, to friends, or on leaderboards. Your bodyweight is the one exception: ranks need it, so it is kept in your save, which only you can open.</div></div></div>
  <h2>About you</h2><div class="card">
  <div class="mu" style="margin:0 0 6px;font-size:13px">Sex (the formulas differ)</div>${chips("sex",[["m","Male"],["f","Female"]])}
  <div class="mg" style="margin-top:12px">${fld("b-age","Age","age","years")}${fld("b-bw","Bodyweight (lb)","bw","lb",S.bw)}${fld("b-ft","Height (ft)","ft","ft")}${fld("b-in","Height (in)","inch","in")}</div>
  <div class="mu" style="margin:12px 0 6px;font-size:13px">Activity level (for calories)</div>${chips("act",ACT)}</div>
  <h2>Tape measurements</h2><div class="card"><p class="mu" style="font-size:13px">Optional, but they make the body fat number far more accurate. Measure in inches, on bare skin, standing relaxed, with the tape level and snug but not digging in.</p>
  <div class="mg">${fld("b-nk","Neck (in)","neck","in")}${fld("b-ws","Waist (in)","waist","in")}${f?fld("b-hp","Hips (in)","hips","in"):""}</div>
  <ul class="mu" style="font-size:13px;margin:12px 0 0;padding-left:18px"><li>Neck: just below the Adam's apple, tape sloping slightly down toward the front.</li><li>Waist: ${f?"at the narrowest point, usually a little above the navel":"level with the navel"}, after a normal breath out. Don't suck in.</li>${f?"<li>Hips: around the widest part of your hips and glutes.</li>":""}</ul></div>
  <h2>Your numbers</h2><div id="bres">${bodyRes()}</div>
  <p class="mu" style="font-size:13px">These are estimates for tracking your own progress, not medical advice. Measure at the same time of day each time; the trend matters more than any single number.</p>
  <button class="btn ghost" onclick="bodyClear()">${bodySure?"Tap again to erase your body details":"Erase my body details"}</button></div>`;
  openSheet(keep);
}
