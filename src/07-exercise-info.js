const ST="50,19;50,28 50,58;50,58 46,92;50,58 55,92",BH="74,36;66,40 36,56;36,56 44,74 46,92",LY="28,72 60,72;60,72 76,60 76,80",BAR="34,14 66,14";
const PO={
ohp:[ST+";50,28 58,42 53,30",ST+";50,28 57,16 53,3"],
raise:[ST+";50,30 42,46 40,60;50,30 58,46 60,60",ST+";50,30 36,30 20,30;50,30 64,30 80,30"],
curl:[ST+";50,28 52,44 54,60",ST+";50,28 52,44 62,32"],
tri:[ST+";50,28 52,12 42,22",ST+";50,28 52,12 53,0"],
squat:[ST+";50,29 70,31","54,32;36,68 51,41;36,68 62,68 50,92;51,41 70,43"],
lunge:[ST+";50,29 54,44 56,56","50,28;50,38 50,66;50,66 66,66 66,92;50,66 40,86 28,90;50,40 54,54 56,64"],
hinge:[BH+";66,40 64,56 62,74",ST+";50,28 52,44 52,58"],
row:[BH+";66,40 64,56 62,74",BH+";66,40 54,50 62,56"],
pull:["50,28;50,36 50,66;50,66 48,90;44,14 46,36;56,14 54,36;"+BAR,"50,8;50,22 50,52;50,52 48,76;44,14 42,24 48,24;56,14 58,24 52,24;"+BAR],
bench:["20,70;"+LY+";34,72 44,66 34,60;8,80 92,80","20,70;"+LY+";34,72 34,40;8,80 92,80"],
push:["18,52;26,58 88,88;26,90 26,58","18,72;26,76 88,90;26,90 38,84 26,76"],
core:["20,70;"+LY+";30,72 42,70;8,82 92,82","34,44;40,52 60,72;60,72 76,60 76,80;40,54 50,58;8,82 92,82"],
bridge:["20,70;"+LY+";8,82 92,82","20,72;28,72 58,54;58,54 76,62 76,82;8,84 92,84"],
calf:[ST+";50,28 52,44 54,58","50,12;50,22 50,52;50,52 48,82 52,92;50,52 54,82 58,92;50,24 52,40 54,54"]};
const PAT={};
Object.entries({ohp:"Overhead Press,Dumbbell Shoulder Press,Machine Shoulder Press",raise:"Lateral Raise,Front Raise,Rear Delt Fly,Face Pull,Prone Y Raise,Dumbbell Shrug",curl:"Barbell Curl,Dumbbell Curl,Hammer Curl",tri:"Overhead Triceps Extension,Triceps Pushdown,Skull Crusher,Dumbbell Kickback",squat:"Squat,Bodyweight Squat,Goblet Squat,Jump Squat,Leg Press",lunge:"Reverse Lunge,Walking Lunge",hinge:"Deadlift,Romanian Deadlift,Dumbbell Romanian Deadlift",row:"Barbell Row,One-Arm Dumbbell Row,Renegade Row",pull:"Pull-Up,Lat Pulldown",bench:"Bench Press,Dumbbell Bench Press,Incline Dumbbell Press,Dumbbell Fly,Cable Fly,Dumbbell Pullover",push:"Push-Up,Diamond Push-Up,Decline Push-Up,Close-Grip Push-Up,Pike Push-Up,Decline Pike Push-Up,Shoulder Taps,Plank Up-Down,Bench Dip,Dip",core:"Sit-Up,Leg Raise,Bicycle Crunch,Mountain Climber,Weighted Russian Twist,Dumbbell Side Bend,Weighted Sit-Up,Hanging Leg Raise,Cable Crunch,Ab Wheel",bridge:"Glute Bridge,Superman,Reverse Snow Angel",calf:"Bodyweight Calf Raise,Dumbbell Calf Raise,Calf Raise"}).forEach(([k,v])=>v.split(",").forEach(n=>PAT[n]=k));
const MU={ohp:{Shoulders:90,Triceps:60,"Upper chest":30,Core:25},raise:{Shoulders:90,Traps:35,Forearms:15},curl:{Biceps:90,Forearms:45,Shoulders:15},tri:{Triceps:90,Shoulders:20,Core:15},squat:{Quads:90,Glutes:75,Hamstrings:40,Core:35,Calves:20},lunge:{Quads:80,Glutes:80,Hamstrings:45,Core:30,Calves:25},hinge:{Hamstrings:85,Glutes:85,"Lower back":75,Traps:40,Forearms:40},row:{Back:90,Biceps:55,"Rear delts":45,"Lower back":40,Forearms:30},pull:{Back:90,Biceps:65,Forearms:45,Core:30,Shoulders:25},bench:{Chest:90,Triceps:60,Shoulders:55},push:{Chest:80,Triceps:65,Shoulders:55,Core:45},core:{Abs:90,Obliques:50,"Hip flexors":45},bridge:{Glutes:90,Hamstrings:55,"Lower back":40,Core:25},calf:{Calves:90,Core:15,Hamstrings:10}};
const DSC={
ohp:["Stand tall with your feet hip-width apart and the weight at shoulder height. Press straight overhead until your arms lock out, then lower under control.","Squeeze your glutes and keep your ribs down so you don't lean back."],
raise:["Stand with a slight bend in your elbows and the weight at your sides. Lift your arms out and up to about shoulder height, pause, then lower slowly. For rear delt, face pull, and Y raise variations, pull or lift toward your upper back instead.","Use a lighter weight and avoid swinging your torso."],
curl:["Stand tall with your elbows pinned to your sides. Curl the weight up toward your shoulders, squeeze at the top, and lower all the way down.","Keep your elbows still and don't rock your body."],
tri:["Keep your upper arm in place and straighten your elbow to extend the weight, then bend back under control. This covers overhead, pushdown, lying, and kickback versions.","Keep your elbows pointed forward and close to your body."],
squat:["Stand with your feet shoulder-width apart. Sit your hips back and down until your thighs are about parallel to the floor, then drive through your whole foot to stand. For jumps, explode upward and land softly.","Keep your chest up and your knees tracking over your toes."],
lunge:["Step into a long stride, lower until both knees bend to about 90 degrees, then push through your front foot to come back up. Reverse lunges step backward instead.","Keep your torso upright and your front knee over your ankle."],
hinge:["Push your hips back with a flat back and soft knees, lowering the weight along your legs. Drive your hips forward to stand tall. For a deadlift, start with the weight on the floor and stand up with it.","Keep the weight close to your legs and your spine neutral."],
row:["Hinge forward with a flat back and let your arms hang. Pull the weight toward your lower ribs by driving your elbows back, then lower with control. For one-arm and renegade rows, brace your other hand on a bench or the floor.","Squeeze your shoulder blades together at the top and avoid jerking."],
pull:["Grip the bar slightly wider than your shoulders and hang with your arms straight. Pull your chest toward the bar until your chin clears it, then lower fully. Pulldowns work the same way on a cable machine.","Lead with your elbows and don't swing."],
bench:["Lie on your back with your feet planted. Lower the weight to your chest with your elbows at about 45 degrees, then press it back up to full extension. Fly and pullover variations keep a slight elbow bend and move in a wide arc.","Keep your shoulder blades pinched together against the bench."],
push:["Start with your hands under your shoulders and your body in a straight line. Lower your chest toward the floor, then press back up. Dips, pike, and close-grip variations shift more work to the triceps and shoulders.","Brace your core and don't let your hips sag."],
core:["Move slowly through the full range, curling your ribs toward your hips instead of pulling with your neck. Leg raises and climbers keep your lower back steady while your legs move.","Exhale as you curl up and avoid yanking on your head."],
bridge:["Lie on your back with your knees bent, then squeeze your glutes to lift your hips until your body forms a straight line. Back extensions like Superman lift your chest and legs off the floor instead.","Pause at the top and don't arch your lower back."],
calf:["Stand tall and rise onto the balls of your feet as high as you can, pause, then lower your heels slowly. Hold weights at your sides to add resistance.","Use the full range of motion and keep your knees straight."]};
const EQ={h:"Bodyweight",d:"Dumbbells",g:"Gym equipment"};
const fmt=ms=>{const t=Math.floor(ms/1e3),h=Math.floor(t/3600),m=Math.floor(t%3600/60);return(h?h+":"+String(m).padStart(2,"0"):m)+":"+String(t%60).padStart(2,"0")};
function fig(st,l){const[h,...ps]=st.split(";"),[x,y]=h.split(",");return `<div style="flex:1;text-align:center"><svg viewBox="0 0 100 100" style="width:100%;color:var(--ink)" aria-hidden="true"><line x1="6" y1="93" x2="94" y2="93" stroke="var(--line)" stroke-width="2"/><circle cx="${x}" cy="${y}" r="6" fill="none" stroke="currentColor" stroke-width="3.5"/>${ps.filter(Boolean).map(q=>`<polyline points="${q}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</svg><div class="mu" style="margin:0;font-size:13px">${l}</div></div>`}
function info(n,keep){
  const e=EX[n],p=PAT[n]||"core",d=DSC[p];
  $("#info").innerHTML=`<div class="sheet"><div class="row"><h1 class="sp" style="margin:0;font-size:23px">${n}</h1><button class="btn sm ghost" onclick="closeInfo()" id="ic">Close</button></div>
  <p class="mu" style="margin-top:4px">${e.g} · ${EQ[e.m]} · ${e.t=="r"?"Logged in reps":"Logged in weight and reps"}</p>
  <div class="card row" style="gap:4px">${fig(PO[p][0],"Start")}${fig(PO[p][1],"Finish")}</div>
  <p class="mu" style="font-size:13px">Illustration shows the general movement pattern for this type of exercise.</p>
  <h2>How to perform</h2><p>${d[0]}</p><p class="mu" style="margin-top:8px">Tip: ${d[1]}</p>
  <h2>Muscles worked</h2><div class="card">${Object.entries(MU[p]).sort((a,b)=>b[1]-a[1]).map(([m,v])=>`<div class="row" style="margin:7px 0"><span style="width:94px">${m}</span><div class="bar sp" style="height:10px;margin:0"><i style="width:${v}%;background:${v>=60?"var(--acc)":"var(--mute)"}"></i></div><span class="mu" style="margin:0;width:40px;text-align:right">${v}%</span></div>`).join("")}<p class="mu" style="font-size:13px;margin:8px 0 0">Approximate share of effort. Darker bars are the main movers.</p></div></div>`;
  $("#info").classList.add("on");if(!keep){$("#info").scrollTop=0;$("#ic").focus()}
}
function closeInfo(){$("#info").classList.remove("on");sure=false;if(storeOpen||battleOpen){storeOpen=battleOpen=false;B=null;render()}}
document.addEventListener("keydown",e=>{if(e.key=="Escape")closeInfo()});
setInterval(()=>{if(!run)return;const e=$("#tm");if(e)e.textContent=fmt(Date.now()-run.t0);const r=run.rest,t=$("#rt");
  if(r&&t){t.textContent=restTxt();if(!r.done&&Date.now()>=r.start+r.dur*1e3){r.done=true;toast("Rest over. Time for your next set.");try{navigator.vibrate&&navigator.vibrate(200)}catch(x){}}}},1000);
function settings(){
  const t=S.theme||"";
  $("#info").innerHTML=`<div class="sheet"><div class="row"><h1 class="sp" style="margin:0;font-size:23px">Settings</h1><button class="btn sm ghost" id="ic" onclick="closeInfo()">Close</button></div>
  <h2>Rest between sets</h2><div class="card"><div class="row"><label for="rs" class="sp">Default rest</label><b id="rv">${fmt((S.rest||60)*1e3)}</b></div><input id="rs" type="range" min="30" max="120" step="15" value="${S.rest||60}" style="padding:0;margin-top:10px" oninput="S.rest=+this.value;save();$('#rv').textContent=fmt(S.rest*1e3)"><p class="mu" style="font-size:13px;margin:8px 0 0">Choose from 0:30 to 2:00. The timer starts when you submit a set, and you can adjust it during a workout.</p></div>
  <h2>Appearance</h2><div class="chips">${[["","System"],["light","Light"],["dark","Dark"]].map(([k,l])=>`<button class="chip ${t==k?"on":""}" onclick="theme('${k}')">${l}</button>`).join("")}</div>
  <h2>Data</h2><button class="btn" onclick="exportSave()">Export save</button><button class="btn ghost" style="margin-top:8px" onclick="$('#imp').click()">Import save</button><input id="imp" type="file" accept="application/json,.json" hidden onchange="importSave(this)"><p class="mu" style="font-size:13px;margin:8px 0">Your progress is saved on this device only. Export a backup before clearing browser data or switching phones.</p><button class="btn ghost" onclick="rs()">${sure?"Tap again to erase everything":"Reset all data"}</button></div>`;
  $("#info").classList.add("on");$("#ic").focus();
}
function theme(k){S.theme=k;save();if(k)document.documentElement.dataset.theme=k;else delete document.documentElement.dataset.theme;settings()}
