import { db, doc, setDoc } from "./firebase.js";

const form = document.getElementById("registrationForm");
const success = document.getElementById("regSuccess");

function makeId() {
  return "MO" + new Date().getFullYear() + Math.floor(10000 + Math.random() * 90000);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "Submitting...";
  success.innerHTML = "";

  try {
    const data = Object.fromEntries(new FormData(form));
    const mobile = String(data.mobile || "").replace(/\D/g, "");

    if (mobile.length !== 10) {
      throw new Error("Enter a valid 10-digit mobile number.");
    }

    const id = makeId();

    // Create the document directly. No read/query is needed.
    await setDoc(doc(db, "registrations", id), {
      id,
      name: data.name.trim(),
      class: data.class,
      school: data.school.trim(),
      mobile,
      parent: data.parent.trim(),
      city: data.city.trim(),
      email: data.email?.trim() || "",
      status: "Pending",
      date: new Date().toISOString()
    });

    success.innerHTML = `<div class="success">
      <b>Registration submitted successfully! 🎉</b><br>
      Registration ID: <strong style="font-size:22px">${id}</strong><br>
      Please save this ID for login, admit card and result.
    </div>`;
    form.reset();
  } catch (error) {
    console.error(error);
    let message = error.message || "Unknown Firebase error.";
    if (error.code === "permission-denied")
      message = "Firestore rejected the request. Publish firestore.rules.txt and make sure the registrations collection allows create.";
    else if (error.code === "failed-precondition")
      message = "Firestore is not enabled. Create Firestore Database in Firebase Console.";
    else if (error.code === "unavailable")
      message = "Firebase is unavailable. Check your internet connection.";

    success.innerHTML = `<div class="error">
      <b>Registration failed</b><br>${message}<br>
      <small>Firebase code: ${error.code || "unknown"}</small>
    </div>`;
  } finally {
    button.disabled = false;
    button.textContent = "Submit Registration";
  }
});
