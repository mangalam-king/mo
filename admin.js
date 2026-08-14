import { db, collection, getDocs, getDoc, query, where, doc, setDoc, deleteDoc, addDoc, auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "./firebase.js";

const ADMIN_EMAILS = ["mangalamsoni70@gmail.com"];

let regs=[];
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

$("googleLogin").onclick=async()=>{
  $("authMsg").innerHTML='<div class="success">Opening Google sign-in…</div>';
  try{
    await signInWithPopup(auth,googleProvider);
  }catch(e){
    console.error("Google sign-in:",e);
    const code=e?.code||"";
    if(code==="auth/popup-blocked" || code==="auth/popup-closed-by-user" || code==="auth/cancelled-popup-request"){
      try{ await signInWithRedirect(auth,googleProvider); return; }catch(e2){ console.error(e2); }
    }
    let msg="Google sign-in failed.";
    if(code==="auth/unauthorized-domain") msg="This website domain is not authorized in Firebase. Add your GitHub Pages domain in Firebase Authentication → Settings → Authorized domains.";
    else if(code==="auth/operation-not-allowed") msg="Google sign-in is not enabled. Enable Google under Firebase Authentication → Sign-in method.";
    else if(code==="auth/popup-blocked") msg="Your browser blocked the Google popup. Allow popups for this site and try again.";
    else if(code==="auth/network-request-failed") msg="Network error. Check your internet connection and try again.";
    $("authMsg").innerHTML=`<div class="error">${msg}<br><small>Error: ${code||e.message||"unknown"}</small></div>`;
  }
};
$("logoutBtn").onclick=()=>signOut(auth);

getRedirectResult(auth).catch(e=>{
  if(e) console.error("Google redirect result:",e);
});

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

async function loadSettings(){
  try{
    const ref = doc(db, "settings", "olympiad");
    const snap = await getDoc(ref);
    if(!snap.exists()) return;
    const data = snap.data();
    const form = $("settingsForm");
    if(!form) return;
    for(const [key,value] of Object.entries(data)){
      const field = form.elements[key];
      if(field && key !== "updatedAt") field.value = value ?? "";
    }
  }catch(err){
    console.error("Could not load exam settings:", err);
  }
}

$("settingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const msg = $("settingsMsg");

  if (button) {
    button.disabled = true;
    button.textContent = "Saving...";
  }
  msg.innerHTML = "";

  try {
    const f = Object.fromEntries(new FormData(form));

    if (!f.examDate) throw new Error("Please select the exam date.");
    if (!f.startTime) throw new Error("Please select the exam start time.");
    if (!f.endTime) throw new Error("Please select the exam end time.");
    if (!f.examCentre.trim()) throw new Error("Please enter the exam place / centre.");

    if (f.startTime >= f.endTime) {
      throw new Error("End time must be later than start time.");
    }

    if (f.duration && Number(f.duration) <= 0) {
      throw new Error("Exam duration must be greater than 0.");
    }

    const settings = {
      examDate: f.examDate,
      startTime: f.startTime,
      endTime: f.endTime,
      duration: f.duration || "",
      examCentre: f.examCentre.trim(),
      centreAddress: (f.centreAddress || "").trim(),
      instructions: (f.instructions || "").trim(),
      officialNotice: (f.officialNotice || "").trim(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, "settings", "olympiad"), settings);

    msg.innerHTML = `
      <div class="success">
        <b>✓ Exam schedule saved successfully.</b><br>
        Students will see the updated date, time and centre on their admit cards.
      </div>`;

  } catch (err) {
    console.error("Exam schedule save error:", err);

    let text = err?.message || String(err);

    if (err?.code === "permission-denied") {
      text = "Permission denied. Make sure you are signed in with the authorized Google admin account and publish the latest Firestore rules.";
    } else if (err?.code === "unauthenticated") {
      text = "Admin session expired. Sign in with Google again.";
    } else if (err?.code === "failed-precondition") {
      text = "Firestore is not enabled/configured for this project.";
    }

    msg.innerHTML = `<div class="error"><b>Schedule was not saved.</b><br>${text}</div>`;
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "💾 Save / Update Exam Schedule";
    }
  }
});
