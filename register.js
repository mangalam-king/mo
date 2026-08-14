import { db, collection, addDoc, getDocs, query, where, doc, setDoc } from "./firebase.js";

const form=document.getElementById("registrationForm");
const success=document.getElementById("regSuccess");

form.addEventListener("submit", async e=>{
 e.preventDefault();
 const f=Object.fromEntries(new FormData(form));
 try{
   const snap=await getDocs(collection(db,"registrations"));
   const id="MO"+new Date().getFullYear()+String(snap.size+1).padStart(4,"0");
   const record={...f,id,status:"Pending",date:new Date().toLocaleDateString("en-IN")};
   await setDoc(doc(db,"registrations",id),record);
   success.innerHTML=`<div class="success"><b>Registration successful!</b><br>Your Registration ID is <strong>${id}</strong>.<br>Use this ID and your registered mobile number to log in.</div>`;
   form.reset();
 }catch(err){
   console.error(err);
   success.innerHTML='<div class="error">Could not save registration. Check Firestore setup and security rules.</div>';
 }
});
