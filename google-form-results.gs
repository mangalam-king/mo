/**
 * MO Olympiad Google Forms results dashboard.
 * Deploy as a Web App with Execute as: Me and access: Only myself.
 * This protects student scores from public access. Open the dashboard while
 * signed into the Google account that owns this script/form.
 */
const MO_OLYMPIAD_FORM_ID = '1A3MXa8Dngb6LJady6PAytgttkkEEyhR5TEgNHIrWzEA';

function doGet() {
  const form = FormApp.openById(MO_OLYMPIAD_FORM_ID);
  const responses = form.getResponses().sort((a, b) => b.getTimestamp() - a.getTimestamp());
  const maxScore = form.getItems().reduce((sum, item) => {
    try { return sum + (item.asQuestionItem().getPoints() || 0); }
    catch (e) { return sum; }
  }, 0);
  const rows = responses.map((response, index) => {
    const itemResponses = response.getGradableItemResponses();
    let score = 0;
    let scoredCount = 0;
    itemResponses.forEach(ir => {
      const value = ir.getScore();
      if (value !== null && value !== undefined) { score += Number(value) || 0; scoredCount++; }
    });
    const answers = response.getItemResponses().map(ir => ({
      question: ir.getItem().getTitle(),
      answer: Array.isArray(ir.getResponse()) ? ir.getResponse().join(', ') : String(ir.getResponse() ?? ''),
      score: (() => { try { const v = ir.getScore(); return v == null ? '' : v; } catch (e) { return ''; } })()
    }));
    return { number: responses.length - index, timestamp: response.getTimestamp(), email: response.getRespondentEmail() || 'Email not collected', score, maxScore, answers };
  });
  const data = JSON.stringify({ title: form.getTitle(), total: rows.length, maxScore, rows }).replace(/</g, '\\u003c');
  const template = HtmlService.createTemplate(`
<!doctype html><html><head><base target="_top"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}body{font:14px Arial,sans-serif;margin:0;padding:18px;background:#f5f7fb;color:#172033}h1{font-size:22px;margin:0 0 6px}.muted{color:#667085}.stats{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0}.stat{background:#fff;border:1px solid #e4e7ec;border-radius:12px;padding:14px;min-width:130px;flex:1}.stat b{font-size:24px;display:block;margin-bottom:5px}.tools{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}input,button{padding:10px 12px;border:1px solid #d0d5dd;border-radius:8px;font:inherit}input{flex:1;min-width:190px}button{background:#6a3254;color:#fff;cursor:pointer;border:0} .tablewrap{overflow:auto;background:#fff;border:1px solid #e4e7ec;border-radius:12px}table{border-collapse:collapse;width:100%;min-width:600px}th,td{text-align:left;padding:12px;border-bottom:1px solid #eaecf0;vertical-align:top}th{background:#f9fafb;position:sticky;top:0}.score{font-weight:bold;color:#067647}.details{display:none;background:#fafafa}.details td{white-space:normal}.answer{padding:5px 0;border-bottom:1px dashed #ddd}.pill{display:inline-block;border-radius:20px;background:#ecfdf3;color:#027a48;padding:4px 8px} @media(max-width:600px){body{padding:10px}h1{font-size:19px}}
</style></head><body>
<h1>MO Olympiad — Test Submissions</h1><div class="muted">Live data read from the Google Form. Scores reflect Google's automatic grading for answer-key questions.</div>
<div class="stats"><div class="stat"><b id="total">0</b><span>Submissions</span></div><div class="stat"><b id="max">0</b><span>Maximum marks</span></div></div>
<div class="tools"><input id="search" placeholder="Search respondent email…"><button onclick="location.reload()">Refresh</button><button onclick="downloadCsv()">Export CSV</button></div>
<div class="tablewrap"><table><thead><tr><th>#</th><th>Submitted</th><th>Respondent email</th><th>Score</th><th>Answers</th></tr></thead><tbody id="body"></tbody></table></div>
<script>const DATA = <?!= data ?>;document.title=DATA.title+' — Results';document.getElementById('total').textContent=DATA.total;document.getElementById('max').textContent=DATA.maxScore;function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function render(){const q=document.getElementById('search').value.toLowerCase();const rows=DATA.rows.filter(r=>r.email.toLowerCase().includes(q));document.getElementById('body').innerHTML=rows.map((r,i)=>`<tr><td>${rows.length-i}</td><td>${esc(new Date(r.timestamp).toLocaleString())}</td><td>${esc(r.email)}</td><td class="score">${r.score} / ${r.maxScore}</td><td><button onclick="toggle(${r.number})">View answers</button></td></tr><tr class="details" id="d${r.number}"><td colspan="5">${r.answers.map((a,i)=>`<div class="answer"><b>${i+1}. ${esc(a.question)}</b><br>${esc(a.answer)}${a.score!==''?' <span class="pill">Marks: '+esc(a.score)+'</span>':''}</div>`).join('')}</td></tr>`).join('')||'<tr><td colspan="5">No matching submissions yet.</td></tr>'}function toggle(n){const el=document.getElementById('d'+n);el.style.display=el.style.display==='table-row'?'none':'table-row'}function downloadCsv(){const csv=[['Submitted','Email','Score','Maximum marks'],...DATA.rows.map(r=>[new Date(r.timestamp).toISOString(),r.email,r.score,r.maxScore])].map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='mo-olympiad-results.csv';a.click();URL.revokeObjectURL(a.href)}document.getElementById('search').addEventListener('input',render);render();</script>
</body></html>`);
  template.data = data;
  return template.evaluate().setTitle('MO Olympiad Results').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
