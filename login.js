// Student login: verify the Registration ID and registered mobile number in Firestore.
// Keeps the existing login form and uses the existing student dashboard/session flow.
import { db, collection, getDocs, query, where } from "./firebase.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("loginMsg");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const id = document.getElementById("loginId")?.value.trim().toUpperCase();
  const mobile = String(document.getElementById("loginMobile")?.value || "").replace(/\D/g, "");
  message.textContent = "";

  if (!id || mobile.length !== 10) {
    message.innerHTML = '<div class="error">Enter your Registration ID and valid 10-digit registered mobile number.</div>';
    return;
  }

  if (button) { button.disabled = true; button.textContent = "Checking..."; }
  try {
    const result = await getDocs(query(collection(db, "registrations"), where("id", "==", id)));
    const matching = result.docs.find((item) => {
      const data = item.data();
      return String(data.mobile || "").replace(/\D/g, "") === mobile;
    });

    if (!matching) {
      message.innerHTML = '<div class="error">Login failed. Check your Registration ID and the mobile number used during registration.</div>';
      return;
    }

    sessionStorage.setItem("moStudentId", id);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Student login error:", error);
    const detail = error?.code === "permission-denied"
      ? "Firestore denied access. Publish rules that allow reading registration records for student login."
      : "Could not verify your details. Check your internet connection and try again.";
    message.innerHTML = `<div class="error">${detail}</div>`;
  } finally {
    if (button) { button.disabled = false; button.textContent = "Login"; }
  }
});
