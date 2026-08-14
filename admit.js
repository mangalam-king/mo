import { db, collection, getDocs, query, where } from "./firebase.js";

const params = new URLSearchParams(location.search);
const preset = params.get("id");
if (preset) document.getElementById("admitId").value = preset;

const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[m]));

document.getElementById("admitSearch").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("admitId").value.trim().toUpperCase();
  const out = document.getElementById("admitOutput");
  out.innerHTML = '<div class="success">Loading admit card…</div>';

  try {
    const s = await getDocs(query(collection(db, "registrations"), where("id", "==", id)));

    if (s.empty) {
      out.innerHTML = '<div class="error">Registration ID not found. Please check your ID.</div>';
      return;
    }

    const r = s.docs[0].data();

    if (r.status !== "Approved") {
      out.innerHTML = `
        <div class="error">
          <b>Admit card is not available yet.</b><br>
          Your registration status is <strong>${esc(r.status || "Pending")}</strong>.<br>
          The admit card will become available after the registration is approved by the Olympiad admin.
        </div>`;
      return;
    }

    let settings = {};
    try {
      const ss = await getDocs(query(collection(db, "settings"), where("__name__", "==", "olympiad")));
      if (!ss.empty) settings = ss.docs[0].data();
    } catch (_) {}

    const examDate = settings.examDate || "To be announced";
    const examTime = settings.startTime && settings.endTime ? `${settings.startTime} – ${settings.endTime}` : (settings.examTime || "To be announced");
    const centre = settings.examCentre || "To be announced";
    const centreAddress = settings.centreAddress || "";
    const duration = settings.duration ? `${settings.duration} minutes` : "To be announced";

    out.innerHTML = `
      <div class="student-card admit-print" id="printCard">
        <div class="admit-top">
          <div class="admit-logo">MO</div>
          <div>
            <h2>MO OLYMPIAD</h2>
            <p>OFFICIAL EXAMINATION ADMIT CARD</p>
          </div>
          <div class="approved-badge">APPROVED</div>
        </div>
        <hr>
        <div class="admit-grid">
          <div><span>Registration ID</span><b>${esc(r.id)}</b></div>
          <div><span>Student Name</span><b>${esc(r.name)}</b></div>
          <div><span>Class</span><b>${esc(r.class)}</b></div>
          <div><span>School</span><b>${esc(r.school)}</b></div>
          <div><span>City</span><b>${esc(r.city)}</b></div>
          <div><span>Exam Date</span><b>${esc(examDate)}</b></div>
          <div><span>Exam Time</span><b>${esc(examTime)}</b></div>
          <div><span>Duration</span><b>${esc(duration)}</b></div>
          <div class="full"><span>Exam Centre / Place</span><b>${esc(centre)}</b></div>
          ${centreAddress ? `<div class="full"><span>Centre Address</span><b>${esc(centreAddress)}</b></div>` : ""}
        </div>
        <div class="admit-note">
          <b>Instructions:</b><br>
          ${esc(settings.instructions || "Bring this admit card to the examination centre and follow all instructions issued by MO Olympiad.")}
        </div>
        <div class="admit-actions">
          <button class="btn primary" id="downloadAdmit">⬇ Download / Save PDF</button>
          <button class="btn ghost" onclick="window.print()">🖨 Print</button>
        </div>
      </div>`;

    document.getElementById("downloadAdmit").onclick = () => window.print();

  } catch (x) {
    console.error(x);
    out.innerHTML = `<div class="error">Unable to load admit card.<br><small>${esc(x.message || x)}</small></div>`;
  }
});
