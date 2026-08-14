import { db, collection, getDocs, doc, setDoc } from "./firebase.js";

const form=document.getElementById("registrationForm");
const success=document.getElementById("regSuccess");

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const button=form.querySelector('button[type="submit"]');
  if(button) button.disabled=true;
  success.innerHTML="";

  try{
    const data=Object.fromEntries(new FormData(form));
    const mobile=String(data.mobile||"").replace(/\D/g,"");
    if(mobile.length!==10) throw new Error("Please enter a valid 10-digit mobile number.");

    const existing=await getDocs(collection(db,"registrations"));
    const used=new Set(existing.docs.map(d=>d.id));
    let id;
    do {
      id="MO"+new Date().getFullYear()+String(Math.floor(1000+Math.random()*9000));
    } while(used.has(id));

    const record={
      ...data,
      mobile,
      id,
      status:"Pending",
      date:new Date().toLocaleDateString("en-IN")
    };

    await setDoc(doc(db,"registrations",id),record);

    success.innerHTML=`<div class="success"><b>Registration successful!</b><br>
      Your Registration ID is <strong style="font-size:20px">${id}</strong><br>
      Save this ID. You will need it for login, admit card and result.</div>`;
    form.reset();
  }catch(err){
    console.error("Registration error:",err);
    success.innerHTML=`<div class="error"><b>Registration failed.</b><br>${String(err.message||err)}<br><small>Make sure Firestore Database is created and the website is opened through GitHub Pages/localhost, not directly as a file.</small></div>`;
  }finally{
    if(button) button.disabled=false;
  }
});
