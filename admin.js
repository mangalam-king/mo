import { db, collection, getDocs, query, where, doc, setDoc, deleteDoc, addDoc, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";

const ADMIN_EMAILS = [
  "mangalamsoni70@gmail.com"
];

let regs=[];
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

$("googleLogin").onclick=async()=>{
  $("authMsg").innerHTML='<div class="success">Opening Google sign-in…</div>';
  try{await signInWithPopup(auth,googleProvider)}catch(e){console.error(e);$("authMsg").innerHTML='<div class="error">Google sign-in failed or was cancelled.</div>'}
};
$("logoutBtn").onclick=()=>signOut(auth);

onAuthStateChanged(auth,async user=>{
  if(!user){$("loginBox").classList.remove("hidden");$("adminPanel").classList.add("hidden");return}
  if(!ADMIN_EMAILS.map(x=>x.toLowerCase()).includes((user.email||"").toLowerCase())){
    $("authMsg").innerHTML=`<div class="error">Access denied for <b>${esc(user.email)}</b>. Add this email to ADMIN_EMAILS in admin.js.</div>`;
    await signOut(auth);return;
  }
  $("loginBox").classList.add("hidden");$("adminPanel").classList.remove("hidden");
  $("adminUser").textContent=`Signed in as ${user.email}`;
  await renderAll();
});

async function renderAll(){
 try{
  const s=await getDocs(collection(db,"registrations")); regs=s.docs.map(d=>d.data());
  const rs=await getDocs(collection(db,"results")); const results=rs.docs.map(d=>d.data());
  $("totalStudents").textContent=regs.length;
  $("approvedStudents").textContent=regs.filter(x=>x.status==="Approved").length;
  $("pendingStudents").textContent=regs.filter(x=>x.status!=="Approved").length;
  $("qualifiedStudents").textContent=results.filter(x=>x.status==="Qualified").length;
  renderRegistrations(); renderNotices(); loadSettings();
 }catch(e){console.error(e);alert("Could not read Firestore. Check your Firestore rules.")}
}
function visibleRows(){
 let q=($("adminSearch").value||"").toLowerCase(),st=$("statusFilter").value;
 return regs.filter(r=>[r.id,r.name,r.school,r.mobile].join(" ").toLowerCase().includes(q)&&(st===""||r.status===st));
}
function renderRegistrations(){
 let rows=visibleRows();
 $("regTable").innerHTML=rows.map(r=>`<tr><td><input class="rowcheck" type="checkbox" value="${esc(r.id)}"></td><td>${esc(r.id)}</td><td>${esc(r.name)}</td><td>${esc(r.class)}</td><td>${esc(r.school)}</td><td>${esc(r.mobile)}</td><td><span class="status ${r.status==="Approved"?"approved":""}">${esc(r.status)}</span></td><td><button class="smallbtn" onclick="editStudent('${r.id}')">Edit</button><button class="smallbtn" onclick="toggleApproval('${r.id}')">${r.status==="Approved"?"Unapprove":"Approve"}</button><button class="smallbtn" onclick="deleteReg('${r.id}')">Delete</button></td></tr>`).join("")||'<tr><td colspan="8">No registrations found.</td></tr>';
}
window.renderRegistrations=renderRegistrations;
window.editStudent=id=>{let r=regs.find(x=>x.id===id);if(!r)return;let f=$("editForm");for(const k of ["id","name","class","school","mobile","parent","city","email"])if(f.elements[k])f.elements[k].value=r[k]||"";scrollTo({top:f.offsetTop-100,behavior:"smooth"})};
window.toggleApproval=async id=>{let r=regs.find(x=>x.id===id);if(!r)return;await setDoc(doc(db,"registrations",id),{...r,status:r.status==="Approved"?"Pending":"Approved"});await renderAll()};
window.deleteReg=async id=>{if(confirm("Delete this registration permanently?")){await deleteDoc(doc(db,"registrations",id));await renderAll()}};
window.toggleAll=box=>document.querySelectorAll(".rowcheck").forEach(x=>x.checked=box.checked);
window.approveVisible=async()=>{let ids=[...document.querySelectorAll(".rowcheck:checked")].map(x=>x.value);if(!ids.length){alert("Select students first.");return}for(const id of ids){let r=regs.find(x=>x.id===id);if(r&&r.status!=="Approved")await setDoc(doc(db,"registrations",id),{...r,status:"Approved"})}await renderAll()};
window.exportRegistrations=()=>{let rows=visibleRows();let headers=["ID","Name","Class","School","Mobile","Parent","City","Email","Status","Date"];let csv=[headers,...rows.map(r=>headers.map(h=>r[h.toLowerCase().replace(" ","")]??""))].map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\\n");let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="MO-Olympiad-registrations.csv";a.click();URL.revokeObjectURL(a.href)};

$("editForm").addEventListener("submit",async e=>{e.preventDefault();let f=Object.fromEntries(new FormData(e.target));f.id=f.id.toUpperCase();let old=regs.find(x=>x.id===f.id);if(!old){$("editMsg").innerHTML='<div class="error">Registration ID not found.</div>';return}await setDoc(doc(db,"registrations",f.id),{...old,...f});$("editMsg").innerHTML='<div class="success">Student updated.</div>';await renderAll()});
$("resultForm").addEventListener("submit",async e=>{e.preventDefault();let f=Object.fromEntries(new FormData(e.target));f.id=f.id.toUpperCase();if(!regs.some(x=>x.id===f.id)){$("resultMsg").innerHTML='<div class="error">Registration ID not found.</div>';return}await setDoc(doc(db,"results",f.id),f);$("resultMsg").innerHTML='<div class="success">Result published successfully.</div>';await renderAll()});
$("noticeForm").addEventListener("submit",async e=>{e.preventDefault();let f=Object.fromEntries(new FormData(e.target));await addDoc(collection(db,"announcements"),{...f,date:new Date().toLocaleDateString("en-IN")});e.target.reset();renderNotices()});
async function renderNotices(){let e=$("noticeAdmin"),s=await getDocs(collection(db,"announcements"));e.innerHTML=s.docs.map(d=>{let x=d.data();return `<div class="notice"><b>${esc(x.type)}:</b> ${esc(x.text)} <button class="smallbtn" onclick="deleteNotice('${d.id}')">Delete</button></div>`}).join("")||'<p class="muted">No announcements.</p>'}
window.deleteNotice=async id=>{await deleteDoc(doc(db,"announcements",id));renderNotices()};
$("settingsForm").addEventListener("submit",async e=>{e.preventDefault();let f=Object.fromEntries(new FormData(e.target));await setDoc(doc(db,"settings","olympiad"),f);$("settingsMsg").innerHTML='<div class="success">Olympiad settings saved.</div>'});
async function loadSettings(){let s=await getDocs(query(collection(db,"settings"),where("__name__","==","olympiad")));if(!s.empty){let x=s.docs[0].data(),f=$("settingsForm");for(const k in x)if(f.elements[k])f.elements[k].value=x[k]||""}}
