document.getElementById('year')&&(document.getElementById('year').textContent=new Date().getFullYear());
function getRegs(){return JSON.parse(localStorage.getItem('mo_regs')||'[]')}
function saveRegs(x){localStorage.setItem('mo_regs',JSON.stringify(x))}
function getResults(){return JSON.parse(localStorage.getItem('mo_results')||'[]')}
function saveResults(x){localStorage.setItem('mo_results',JSON.stringify(x))}
function getNotices(){return JSON.parse(localStorage.getItem('mo_notices')||'[]')}
function saveNotices(x){localStorage.setItem('mo_notices',JSON.stringify(x))}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function showHomeNotices(){let e=document.getElementById('announcements');if(!e)return;let n=getNotices();if(!n.length){e.innerHTML='<div class="notice">No announcements published yet.</div>';return}e.innerHTML=n.slice().reverse().map(x=>`<div class="notice"><b>${esc(x.type)}:</b> ${esc(x.text)}</div>`).join('')}
showHomeNotices();