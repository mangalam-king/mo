import { db, collection, getDocs, query, where } from "./firebase.js";
const id=sessionStorage.getItem("moStudentId");
if(!id) location.href="login.html";
async function load(){
 const el=document.getElementById("dashboard");
 try{
  const s=await getDocs(query(collection(db,"registrations"),where("id","==",id)));
  if(s.empty){sessionStorage.removeItem("moStudentId");location.href="login.html";return;}
  const r=s.docs[0].data();
  const rs=await getDocs(query(collection(db,"results"),where("id","==",id)));
  const result=rs.empty?null:rs.docs[0].data();
  el.innerHTML=`<div class="cards">
   <div class="card"><div class="icon">👤</div><h3>${esc(r.name)}</h3><p>Registration ID: <b>${esc(r.id)}</b></p><p>Class: ${esc(r.class)}</p><p>School: ${esc(r.school)}</p><p>Status: <span class="status ${r.status==='Approved'?'approved':''}">${esc(r.status)}</span></p></div>
   <div class="card"><div class="icon">🎫</div><h3>Admit Card</h3><p>View your examination details.</p><a class="btn primary" href="admit-card.html?id=${encodeURIComponent(r.id)}">Open Admit Card</a></div>
   <div class="card"><div class="icon">📊</div><h3>Result</h3>${result?`<p>Marks: <b>${esc(result.marks)} / ${esc(result.total)}</b></p><p>Rank: ${esc(result.rank||"—")}</p><p>Status: ${esc(result.status)}</p>`:"<p class='muted'>Result not published yet.</p>"}<a class="btn ghost" href="result.html?id=${encodeURIComponent(r.id)}">Open Result</a></div>
  </div>`;
 }catch(e){console.error(e);el.innerHTML='<div class="error">Unable to load dashboard. Check Firestore rules.</div>'}
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
window.studentLogout=()=>{sessionStorage.removeItem("moStudentId");location.href="login.html"};
load();