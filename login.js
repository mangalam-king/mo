import { db, collection, getDocs, query, where } from "./firebase.js";
document.getElementById("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const id=document.getElementById("loginId").value.trim().toUpperCase();
 const mobile=document.getElementById("loginMobile").value.trim();
 const msg=document.getElementById("loginMsg");
 try{
  const snap=await getDocs(query(collection(db,"registrations"),where("id","==",id),where("mobile","==",mobile)));
  if(snap.empty){msg.innerHTML='<div class="error">Invalid Registration ID or mobile number.</div>';return;}
  sessionStorage.setItem("moStudentId",id);
  location.href="dashboard.html";
 }catch(err){console.error(err);msg.innerHTML='<div class="error">Login failed. Check Firestore setup.</div>'}
});