import { db, doc, setDoc, getDoc } from "./firebase.js";

const form = document.getElementById("registrationForm");
const success = document.getElementById("regSuccess");

function makeRegistrationId() {
  const year = new Date().getFullYear();
  const number = Math.floor(1000 + Math.random() * 9000);
  return `MO${year}${number}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  if (button) {
    button.disabled = true;
    button.textContent = "Submitting...";
  }
  success.innerHTML = "";

  try {
    const data = Object.fromEntries(new FormData(form));
    const mobile = String(data.mobile || "").replace(/\D/g, "");

    if (mobile.length !== 10) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }

    let id = makeRegistrationId();
    let reference = doc(db, "registrations", id);
    let existing = await getDoc(reference);

    // Very unlikely collision protection.
    while (existing.exists()) {
      id = makeRegistrationId();
      reference = doc(db, "registrations", id);
      existing = await getDoc(reference);
    }

    const record = {
      ...data,
      mobile,
      id,
      status: "Pending",
      date: new Date().toLocaleDateString("en-IN")
    };

    await setDoc(reference, record);

    success.innerHTML = `
      <div class="success">
        <b>Registration successful!</b><br>
        Your Registration ID is
        <strong style="font-size:20px">${id}</strong><br>
        Save this ID. You will need it for login, admit card and result.
      </div>`;

    form.reset();

  } catch (err) {
    console.error("MO Olympiad registration error:", err);

    let message = err?.message || String(err);

    if (err?.code === "permission-denied") {
      message = "Firestore permission denied. Publish the included firestore.rules.txt rules in Firebase Console.";
    } else if (err?.code === "failed-precondition") {
      message = "Firestore is not enabled for this Firebase project. Create Firestore Database first.";
    } else if (err?.code === "unavailable") {
      message = "Firebase is temporarily unavailable. Check your internet connection and try again.";
    }

    success.innerHTML = `
      <div class="error">
        <b>Registration could not be submitted.</b><br>
        ${message}
      </div>`;
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Submit Registration";
    }
  }
});
