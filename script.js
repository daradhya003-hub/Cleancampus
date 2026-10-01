const LOCS=["Main Gate","Academic Block","Library","Hostel Area","Canteen","Parking Area","Sports Ground","Washroom","Classroom Block","Other"];
const TYPES=["Overflowing Dustbin","Littered Area","Plastic Waste","Water Leakage","Dirty Washroom","Damaged Dustbin","Other"];
const STAT=["Pending","In Progress","Resolved"];
// Editable baseline so the home page matches earlier semester data (128 / 84 / 44 / 12)
const CONFIG={baseTotal:0,baseResolved:0,basePending:0,locations:12};
const $=s=>document.querySelector(s),KEY="cleancampus_v2";
const cls=s=>s.replace(" ","");
function ph(t){const c={"Overflowing Dustbin":"#f59e0b","Littered Area":"#84cc16","Plastic Waste":"#38bdf8","Water Leakage":"#3b82f6","Dirty Washroom":"#a78bfa","Damaged Dustbin":"#f87171"}[t]||"#94a3b8";
return "data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${c}"/><text x="200" y="150" font-size="26" font-family="sans-serif" fill="#fff" text-anchor="middle">${t}</text><text x="200" y="185" font-size="16" font-family="sans-serif" fill="#fff" text-anchor="middle">demo photo</text></svg>`)}
function demo(){const d=(n)=>{const x=new Date(2026,8,30-n);return x.toISOString().slice(0,10)};
const r=[["Overflowing Dustbin","Canteen","Pending",0,"High","Aman Verma","25BCE10101","Dustbin near the food counter is overflowing and attracting flies."],
["Littered Area","Sports Ground","Pending",1,"Medium","Riya Shah","25BAI10222","Wrappers and bottles left after the evening match."],
["Plastic Waste","Hostel Area","In Progress",2,"Medium","Kabir Singh","25BCY10333","Plastic bags piled behind Hostel Block B."],
["Water Leakage","Washroom","Pending",3,"High","Neha Jain","25MEI10444","Tap leaking continuously, floor is slippery."],
["Dirty Washroom","Academic Block","Resolved",4,"High","Rohit Das","25BCE10555","Second-floor washroom not cleaned for two days."],
["Damaged Dustbin","Main Gate","In Progress",5,"Low","Isha Gupta","25MIB10666","Dustbin lid broken near security cabin."],
["Overflowing Dustbin","Library","Resolved",6,"Medium","Tarun Mehta","25BAI10777","Bin outside reading hall full."],
["Littered Area","Parking Area","Pending",8,"Low","Sana Khan","25BCE10888","Paper cups scattered near the two-wheeler stand."],
["Plastic Waste","Canteen","Resolved",10,"Medium","Dev Patel","25BCY10999","Plastic plates left on tables and ground."],
["Water Leakage","Hostel Area","Resolved",12,"High","Pooja Rao","25MIM10123","Pipe leakage near the hostel water cooler."],
["Dirty Washroom","Classroom Block","Pending",14,"Medium","Yash Kulkarni","25BAI10234","Washroom smells bad, soap dispenser empty."],
["Overflowing Dustbin","Academic Block","Pending",16,"Low","Meera Nair","25MEI10345","Corridor dustbin overflowing after lunch."]];
return r.map((x,i)=>({id:"CLN-2026-"+String(116+i).padStart(5,"0"),type:x[0],loc:x[1],status:x[2],date:d(x[3]),pri:x[4],name:x[5],sid:x[6],desc:x[7],img:ph(x[0])}))}
// ===== Supabase connection: paste your Project URL below (Project Settings > API) =====
const SB="https://twtpuroziifmphblwmne.supabase.co";
const SB_KEY="sb_publishable_6Su1H5vcP8O1eiY0_MB1Pg_53nt3Ba7";
const H=(x={})=>({apikey:SB_KEY,...x});
let DB=[];
// ===== Admin login (Supabase Auth) =====
let TOKEN="";try{TOKEN=sessionStorage.getItem("cc_t")||""}catch(e){}
const HA=()=>H({Authorization:"Bearer "+TOKEN,"Content-Type":"application/json",Prefer:"return=representation"});
function adminUI(){$("#adm").textContent=TOKEN?"Admin Logout":"Admin Login"}
function lock(){TOKEN="";try{sessionStorage.removeItem("cc_t")}catch(e){}adminUI();refresh()}
function adminBtn(){if(TOKEN){lock();closeM();toast("Logged out")}else showLogin()}
function showLogin(){$("#mc").innerHTML=`<h2>Admin login</h2><p style="color:var(--mut)">Only admins can update status or delete complaints.</p><label style="display:block;margin:12px 0 6px;font-weight:600">Email</label><input class="in" id="ae" type="email"><label style="display:block;margin:12px 0 6px;font-weight:600">Password</label><input class="in" id="ap" type="password" onkeydown="if(event.key=='Enter')login()"><div class="err" id="aerr"></div><button class="btn" style="width:100%;margin-top:14px" onclick="login()">Log in</button>`;$("#modal").classList.add("open")}
async function login(){try{const r=await fetch(`${SB}/auth/v1/token?grant_type=password`,{method:"POST",headers:H({"Content-Type":"application/json"}),body:JSON.stringify({email:$("#ae").value.trim(),password:$("#ap").value})});const j=await r.json();if(!r.ok||!j.access_token)throw 0;TOKEN=j.access_token;try{sessionStorage.setItem("cc_t",TOKEN)}catch(e){}closeM();adminUI();refresh();toast("Logged in as admin")}catch(e){$("#aerr").textContent="Wrong email or password."}}
async function del(id){if(!TOKEN)return toast("Admin login required","w");if(!confirm("Delete "+id+" permanently?"))return;
try{const r=await fetch(`${SB}/rest/v1/complaints?id=eq.${id}`,{method:"DELETE",headers:HA()});if(!r.ok)throw 0;if(!(await r.json()).length)throw 0;DB=DB.filter(x=>x.id!=id);closeM();toast(id+" deleted");refresh()}catch(e){toast("Could not delete. Log in again.","w");lock()}}

async function load(){try{const r=await fetch(`${SB}/rest/v1/complaints?select=*&order=created_at.desc`,{headers:H()});if(!r.ok)throw 0;
DB=(await r.json()).map(x=>({id:x.id,name:x.name,sid:x.sid,loc:x.loc,type:x.type,desc:x.description,img:x.img_url,pri:x.priority,status:x.status,date:x.date}))}
catch(e){if(!load.w){load.w=1;toast("Cannot reach the database. Check the Project URL and your internet.","w")}}}
async function add(c){await load();const mx=Math.max(0,...DB.map(x=>+x.id.slice(-5)||0));const blob=await(await fetch(c.img)).blob(),fn=Date.now()+".jpg";
let r=await fetch(`${SB}/storage/v1/object/photos/${fn}`,{method:"POST",headers:H({"Content-Type":"image/jpeg"}),body:blob});if(!r.ok)throw 0;
c.img=`${SB}/storage/v1/object/public/photos/${fn}`;
for(let i=0;i<5;i++){c.id="CLN-2026-"+String(mx+1+i).padStart(5,"0");
r=await fetch(`${SB}/rest/v1/complaints`,{method:"POST",headers:H({"Content-Type":"application/json"}),body:JSON.stringify({id:c.id,name:c.name,sid:c.sid,loc:c.loc,type:c.type,description:c.desc,img_url:c.img,priority:c.pri,status:"Pending",date:c.date})});
if(r.ok)return;if(r.status!=409)throw 0}throw 0}
function toast(m,w){const e=document.createElement("div");e.className="t "+(w||"");e.textContent=m;$("#toast").append(e);setTimeout(()=>e.remove(),3200)}
const fmt=d=>new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const cnt=s=>DB.filter(c=>c.status==s).length;
// navigation
function go(p){document.querySelectorAll(".page").forEach(e=>e.classList.toggle("on",e.id==p));document.querySelectorAll(".links a").forEach(a=>a.classList.toggle("on",a.dataset.p==p));
$("#links").classList.remove("open");location.hash=p;scrollTo(0,0);
if(p=="report")resetForm();load().then(refresh)}
document.querySelectorAll(".links a").forEach(a=>a.onclick=()=>go(a.dataset.p));
const opts=(a,all)=>(all?`<option value="">${all}</option>`:"")+a.map(x=>`<option>${x}</option>`).join("");
$("#floc").innerHTML=opts(LOCS,"Select location");$("#ftype").innerHTML=opts(TYPES,"Select problem type");
$("#fl").innerHTML=opts(LOCS,"All locations");$("#ft").innerHTML=opts(TYPES,"All problems");$("#fs").innerHTML=opts(STAT,"All statuses");
const sc=(l,v)=>`<div class="card stat"><b>${v}</b><span>${l}</span></div>`;
function home(){const t=CONFIG.baseTotal+DB.length,r=CONFIG.baseResolved+cnt("Resolved"),p=CONFIG.basePending+cnt("Pending")+cnt("In Progress");
$("#hstats").innerHTML=sc("Total Reports",t)+sc("Resolved",r)+sc("Pending",p)+sc("Locations Covered",CONFIG.locations)}
// form
let photo=null;
const drop=$("#drop"),file=$("#file");
drop.onclick=()=>file.click();file.onchange=()=>take(file.files[0]);
drop.ondragover=e=>{e.preventDefault();drop.classList.add("over")};drop.ondragleave=()=>drop.classList.remove("over");
drop.ondrop=e=>{e.preventDefault();drop.classList.remove("over");take(e.dataTransfer.files[0])};
function take(f){$("#ferr").textContent="";if(!f)return;
if(!/^image\/(png|jpe?g)$/.test(f.type)){$("#ferr").textContent="Please choose a PNG, JPG or JPEG image.";return}
const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{const s=Math.min(1,640/im.width),c=document.createElement("canvas");c.width=im.width*s;c.height=im.height*s;
c.getContext("2d").drawImage(im,0,0,c.width,c.height);photo=c.toDataURL("image/jpeg",.7);$("#dp").innerHTML=`<img src="${photo}" alt="Preview"><br><small>Click to change photo</small>`;URL.revokeObjectURL(u)};im.src=u}
function resetForm(){$("#f").reset();photo=null;$("#dp").innerHTML=`<div style="font-size:2rem">📷</div><b>Upload a photo of the problem</b><br><small>PNG, JPG or JPEG – click or drag here</small>`;
$("#rform").style.display="";$("#rok").style.display="none";document.querySelectorAll(".err").forEach(e=>e.textContent="");document.querySelectorAll(".bad").forEach(e=>e.classList.remove("bad"))}
$("#f").onsubmit=async e=>{e.preventDefault();const f=e.target,v=n=>f.elements[n].value.trim();let ok=true;
const chk=(n,m)=>{const el=f.elements[n],bad=!v(n);el.classList.toggle("bad",bad);el.parentElement.querySelector(".err").textContent=bad?m:"";if(bad)ok=false};
chk("name","Enter your name.");chk("sid","Enter your student ID.");chk("loc","Select a campus location.");chk("type","Select a problem type.");chk("desc","Describe the problem so staff can find it.");
if(v("sid")&&!/^[A-Za-z0-9]{6,}$/.test(v("sid"))){ok=false;f.elements.sid.classList.add("bad");f.elements.sid.parentElement.querySelector(".err").textContent="Student ID needs at least 6 letters or digits."}
if(v("desc")&&v("desc").length<10){ok=false;f.elements.desc.classList.add("bad");f.elements.desc.nextElementSibling.textContent="Please add at least 10 characters."}
if(!photo){ok=false;$("#ferr").textContent="Upload a photo as evidence."}
if(!ok){toast("Please fix the highlighted fields","w");return}
const n=DB.length+1;const c={id:"CLN-2026-"+String(n).padStart(5,"0"),name:v("name"),sid:v("sid"),loc:v("loc"),type:v("type"),desc:v("desc"),img:photo,pri:f.elements.pri.value,status:"Pending",date:new Date().toISOString().slice(0,10)};
toast("Submitting…");try{await add(c)}catch(err){toast("Could not submit. Check the Supabase setup and internet.","w");return}DB.unshift(c);toast("Report submitted");
$("#rform").style.display="none";const o=$("#rok");o.style.display="";
o.innerHTML=`<div class="big">✅</div><h2>Report Submitted Successfully!</h2><div class="cid">Complaint ID: ${c.id}</div>
<dl class="dl" style="text-align:left;max-width:320px;margin:14px auto"><dt>Location</dt><dd>${esc(c.loc)}</dd><dt>Problem Type</dt><dd>${esc(c.type)}</dd><dt>Date</dt><dd>${fmt(c.date)}</dd><dt>Status</dt><dd><span class="badge Pending">Pending</span></dd></dl>
<div class="row" style="justify-content:center"><button class="btn" onclick="openC('${c.id}')">View My Report</button><button class="btn alt" onclick="resetForm()">Submit Another Report</button></div>`}
function esc(s){return String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}
// complaints
const bd=s=>`<span class="badge ${cls(s)}">${s}</span>`;
function list(){const q=$("#q").value.toLowerCase(),l=$("#fl").value,t=$("#ft").value,s=$("#fs").value,d=$("#fd").value;
const r=DB.filter(c=>(!l||c.loc==l)&&(!t||c.type==t)&&(!s||c.status==s)&&(!d||c.date==d)&&(!q||[c.id,c.type,c.loc,c.desc,c.name].join(" ").toLowerCase().includes(q)));
$("#clist").innerHTML=r.length?r.map(c=>`<div class="card cc" onclick="openC('${c.id}')"><img src="${c.img}" alt=""><div><small>${c.id}</small><h3>${esc(c.type)}</h3><small>${esc(c.loc)} · ${fmt(c.date)}</small><div style="margin-top:6px">${bd(c.status)}</div></div></div>`).join(""):`<div class="card empty" style="grid-column:1/-1"><div style="font-size:2.4rem">🍃</div>${DB.length?"No complaints match your search. Try clearing a filter.":"No complaints yet. Report the first issue to get started."}</div>`}
["q","fl","ft","fs","fd"].forEach(i=>$("#"+i).oninput=list);
// modal
function openC(id){const c=DB.find(x=>x.id==id);if(!c)return;
$("#mc").innerHTML=`<div style="display:flex;justify-content:space-between;align-items:start"><h2>${c.id}</h2><button class="btn alt sm" onclick="closeM()">✕</button></div>
<img src="${c.img}" alt="Evidence" style="width:100%;max-height:260px;object-fit:cover;border-radius:14px;margin:8px 0 14px">
<dl class="dl"><dt>Student Name</dt><dd>${esc(c.name)}</dd><dt>Student ID</dt><dd>${esc(c.sid)}</dd><dt>Location</dt><dd>${esc(c.loc)}</dd><dt>Problem Type</dt><dd>${esc(c.type)}</dd><dt>Description</dt><dd>${esc(c.desc)}</dd><dt>Date</dt><dd>${fmt(c.date)}</dd><dt>Priority</dt><dd>${c.pri}</dd><dt>Status</dt><dd>${bd(c.status)}</dd></dl>
${TOKEN?`<label style="display:block;margin:18px 0 6px;font-weight:600">Admin: update status</label><select class="in" onchange="setS('${c.id}',this.value)">${STAT.map(s=>`<option ${s==c.status?"selected":""}>${s}</option>`).join("")}</select><button class="btn sm" style="background:var(--or);margin-top:12px" onclick="del('${c.id}')">Delete complaint</button>`:`<p style="color:var(--mut);margin-top:16px;font-size:.9rem">🔒 Only admins can update status or delete complaints.</p>`}`;
$("#modal").classList.add("open")}
function closeM(){$("#modal").classList.remove("open")}
$("#modal").onclick=e=>{if(e.target.id=="modal")closeM()};addEventListener("keydown",e=>{if(e.key=="Escape")closeM()});
async function setS(id,s){const c=DB.find(x=>x.id==id);if(!TOKEN){toast("Admin login required","w");return}try{const r=await fetch(`${SB}/rest/v1/complaints?id=eq.${id}`,{method:"PATCH",headers:HA(),body:JSON.stringify({status:s})});if(!r.ok||!(await r.json()).length)throw 0}catch(e){toast("Could not update. Please log in again.","w");lock();return}c.status=s;toast(`${id} marked ${s}`);refresh();if($("#modal").classList.contains("open"))openC(id)}
function refresh(){const p=document.querySelector(".page.on").id;if(p=="dashboard")dash();if(p=="complaints")list();if(p=="home")home()}
// dashboard
let CH=[];
function dash(){$("#dstats").innerHTML=sc("Total Complaints",DB.length)+sc("Pending",cnt("Pending"))+sc("In Progress",cnt("In Progress"))+sc("Resolved",cnt("Resolved"));
CH.forEach(c=>c.destroy());CH=[];
const by=(k,a)=>a.map(x=>DB.filter(c=>c[k]==x).length),G=["#16a34a","#84cc16","#38bdf8","#f59e0b","#a78bfa","#f87171","#94a3b8","#14532d","#fb923c","#2dd4bf"];
const o=(t,x={})=>({responsive:true,maintainAspectRatio:false,plugins:{title:{display:true,text:t,font:{size:15}},legend:{display:false}},...x});
const ty=TYPES.slice(0,6);
CH.push(new Chart($("#c1"),{type:"bar",data:{labels:ty,datasets:[{data:by("type",ty),backgroundColor:G}]},options:o("Complaints by problem type",{scales:{y:{ticks:{precision:0}}}})}));
CH.push(new Chart($("#c2"),{type:"doughnut",data:{labels:LOCS,datasets:[{data:by("loc",LOCS),backgroundColor:G}]},options:{...o("Complaints by location"),plugins:{title:{display:true,text:"Complaints by location"},legend:{display:true,position:"right",labels:{boxWidth:10}}}}}));
CH.push(new Chart($("#c3"),{type:"pie",data:{labels:STAT,datasets:[{data:by("status",STAT),backgroundColor:["#ea580c","#2563eb","#16a34a"]}]},options:{...o("Complaint status"),plugins:{title:{display:true,text:"Complaint status"},legend:{display:true,position:"bottom"}}}}));
const days=[...new Set(DB.map(c=>c.date))].sort();
CH.push(new Chart($("#c4"),{type:"line",data:{labels:days.map(fmt),datasets:[{data:days.map(d=>DB.filter(c=>c.date==d).length),borderColor:"#16a34a",backgroundColor:"#dcfce7",fill:true,tension:.3}]},options:o("Reports over time",{scales:{y:{ticks:{precision:0},beginAtZero:true}}})}));
$("#dtb").innerHTML=DB.slice(0,10).map(c=>`<tr><td>${c.id}</td><td>${esc(c.loc)}</td><td>${esc(c.type)}</td><td>${fmt(c.date)}</td><td>${bd(c.status)}</td><td><button class="btn alt sm" onclick="openC('${c.id}')">View</button> ${c.status=="Resolved"||!TOKEN?"":`<button class="btn sm" onclick="setS('${c.id}','${STAT[STAT.indexOf(c.status)+1]}')">${c.status=="Pending"?"Start work":"Mark resolved"}</button>`} ${TOKEN?`<button class="btn sm" style="background:var(--or)" onclick="del('${c.id}')">Delete</button>`:""}</td></tr>`).join("")||`<tr><td colspan="6" class="empty">No reports yet.</td></tr>`}
adminUI();
go((location.hash||"#home").slice(1).replace(/[^a-z]/g,"")||"home");
