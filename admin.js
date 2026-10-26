// ============================================================
// MO OLYMPIAD - COMPLETE ADMIN PANEL
// ============================================================

import {
  db,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "./firebase.js";


// ============================================================
// FIXED ADMIN LOGIN
// ============================================================
// Fixed username maps to the existing authorized Firebase admin email.
// Firebase Authentication must contain this email with password @131313.
const ADMIN_USERNAME = "Msadmin";
const ADMIN_EMAIL = "mangalamsoni70@gmail.com";
const ADMIN_PASSWORD = "@131313";

// ============================================================
// GLOBAL DATA
// ============================================================
let regs = [];

// ============================================================
// HELPERS
// ============================================================
const $ = id => document.getElementById(id);
const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));

// Google Forms results dashboard URL: paste the deployed Apps Script web-app URL here.
const GOOGLE_RESULTS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyZFYP6DaKfk3O1ukssdEfyxUATEjfTOwy_5ZYBZaghPvp56ol0IzUpGNzTs_HGCUL1wg/exec";

function setupGoogleFormResultsPanel() {
  const url = GOOGLE_RESULTS_WEB_APP_URL.trim();
  const message = $("googleResultsSetupMessage");
  const open = $("openGoogleResults");
  const wrap = $("googleResultsFrameWrap");
  const frame = $("googleResultsFrame");
  if (!url || url.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT")) {
    if (message) message.style.display = "block";
    if (open) { open.href = "#"; open.onclick = event => { event.preventDefault(); alert("First deploy google-form-results.gs as a web app, then paste its URL into GOOGLE_RESULTS_WEB_APP_URL in admin.js."); }; }
    if (wrap) wrap.style.display = "none";
    return;
  }
  if (message) message.style.display = "none";
  if (open) open.href = url;
  if (wrap) wrap.style.display = "block";
  if (frame && frame.src !== url) frame.src = url;
  const reload = $("reloadGoogleResults");
  if (reload) reload.onclick = () => { if (frame) frame.src = url + (url.includes("?") ? "&" : "?") + "refresh=" + Date.now(); };
}

function showAdmin() {
  $("loginBox").classList.add("hidden");
  $("adminPanel").classList.remove("hidden");
  $("adminUser").textContent = `Signed in as ${ADMIN_USERNAME}`;
  setupGoogleFormResultsPanel();
  renderAll();
}

function showLogin() {
  $("loginBox").classList.remove("hidden");
  $("adminPanel").classList.add("hidden");
}

$("adminLoginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const username = $("adminUsername").value.trim();
  const password = $("adminPassword").value;
  const button = $("adminLoginForm").querySelector('button[type="submit"]');
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    $("authMsg").innerHTML = '<div class="error">Incorrect username or password.</div>';
    return;
  }
  if (button) button.disabled = true;
  $("authMsg").textContent = "Signing in securely…";
  try {
    const credential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
    if (credential.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await signOut(auth);
      throw new Error("This account is not authorized to administer MO Olympiad.");
    }
    $("authMsg").innerHTML = '<div class="success">Login successful.</div>';
    showAdmin();
  } catch (error) {
    console.error("Admin sign-in failed:", error);
    const message = error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found"
      ? "Firebase Admin account is not set up with these credentials. In Firebase Console, enable Email/Password sign-in and create/ensure mangalamsoni70@gmail.com uses the password @131313."
      : (error.message || "Could not sign in. Check Firebase Authentication settings.");
    $("authMsg").innerHTML = `<div class="error">${esc(message)}</div>`;
  } finally {
    if (button) button.disabled = false;
  }
});

$("logoutBtn").onclick = async () => {
  try { await signOut(auth); } catch (error) { console.error("Sign-out failed:", error); }
  $("adminLoginForm").reset();
  $("authMsg").textContent = "You have signed out.";
  showLogin();
};

onAuthStateChanged(auth, user => {
  if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) showAdmin();
  else showLogin();
});


// ============================================================
// LOAD ALL ADMIN DATA
// ============================================================

async function renderAll() {

  try {

    // --------------------------------------------------------
    // REGISTRATIONS
    // --------------------------------------------------------

    const registrationSnapshot =
      await getDocs(
        collection(
          db,
          "registrations"
        )
      );


    regs =
      registrationSnapshot.docs.map(
        d => ({
          ...d.data()
        })
      );


    // --------------------------------------------------------
    // RESULTS
    // --------------------------------------------------------

    const resultSnapshot =
      await getDocs(
        collection(
          db,
          "results"
        )
      );


    const results =
      resultSnapshot.docs.map(
        d => d.data()
      );


    // --------------------------------------------------------
    // STATISTICS
    // --------------------------------------------------------

    $("totalStudents").textContent =
      regs.length;


    $("approvedStudents").textContent =
      regs.filter(
        x => x.status === "Approved"
      ).length;


    $("pendingStudents").textContent =
      regs.filter(
        x => x.status !== "Approved"
      ).length;


    $("qualifiedStudents").textContent =
      results.filter(
        x => x.status === "Qualified"
      ).length;


    // --------------------------------------------------------
    // RENDER SECTIONS
    // --------------------------------------------------------

    renderRegistrations();

    await renderNotices();

    await loadSettings();


  } catch (error) {

    console.error(
      "Could not load admin data:",
      error
    );


    alert(
      "Could not read Firestore. Check your Firestore rules and Firebase configuration."
    );

  }

}


// ============================================================
// FILTER REGISTRATIONS
// ============================================================

function visibleRows() {

  const search =
    (
      $("adminSearch").value ||
      ""
    ).toLowerCase();


  const status =
    $("statusFilter").value;


  return regs.filter(
    registration => {

      const text = [

        registration.id,

        registration.name,

        registration.school,

        registration.mobile

      ]
        .join(" ")
        .toLowerCase();


      return (

        text.includes(search) &&

        (
          status === "" ||
          registration.status === status
        )

      );

    }
  );

}


// ============================================================
// RENDER REGISTRATION TABLE
// ============================================================

function renderRegistrations() {

  const rows =
    visibleRows();


  $("regTable").innerHTML =

    rows.map(
      registration => `

        <tr>

          <td>
            <input
              class="rowcheck"
              type="checkbox"
              value="${esc(registration.id)}"
            >
          </td>

          <td>
            ${esc(registration.id)}
          </td>

          <td>
            ${esc(registration.name)}
          </td>

          <td>
            ${esc(registration.class)}
          </td>

          <td>
            ${esc(registration.school)}
          </td>

          <td>
            ${esc(registration.mobile)}
          </td>

          <td>

            <span
              class="status ${
                registration.status === "Approved"
                  ? "approved"
                  : ""
              }"
            >
              ${esc(
                registration.status || "Pending"
              )}
            </span>

          </td>

          <td>

            <button
              class="smallbtn"
              onclick="editStudent('${esc(registration.id)}')"
            >
              Edit
            </button>

            <button
              class="smallbtn"
              onclick="toggleApproval('${esc(registration.id)}')"
            >
              ${
                registration.status === "Approved"
                  ? "Unapprove"
                  : "Approve"
              }
            </button>

            <button
              class="smallbtn"
              onclick="deleteReg('${esc(registration.id)}')"
            >
              Delete
            </button>

          </td>

        </tr>

      `
    ).join("")

    ||

    `
      <tr>
        <td colspan="8">
          No registrations found.
        </td>
      </tr>
    `;

}


window.renderRegistrations =
  renderRegistrations;


// ============================================================
// EDIT STUDENT
// ============================================================

window.editStudent = id => {

  const student =
    regs.find(
      x => x.id === id
    );


  if (!student)
    return;


  const form =
    $("editForm");


  const fields = [

    "id",
    "name",
    "class",
    "school",
    "mobile",
    "parent",
    "city",
    "email"

  ];


  for (const field of fields) {

    if (
      form.elements[field]
    ) {

      form.elements[field].value =
        student[field] || "";

    }

  }


  window.scrollTo({

    top:
      form.offsetTop - 100,

    behavior:
      "smooth"

  });

};


// ============================================================
// APPROVE / UNAPPROVE
// ============================================================

window.toggleApproval =
  async id => {

    try {

      const student =
        regs.find(
          x => x.id === id
        );


      if (!student)
        return;


      const newStatus =
        student.status === "Approved"
          ? "Pending"
          : "Approved";


      await setDoc(

        doc(
          db,
          "registrations",
          id
        ),

        {
          ...student,
          status: newStatus
        }

      );


      await renderAll();


    } catch (error) {

      console.error(
        "Approval error:",
        error
      );


      alert(
        "Could not update registration."
      );

    }

  };


// ============================================================
// DELETE REGISTRATION
// ============================================================

window.deleteReg =
  async id => {

    if (
      !confirm(
        "Delete this registration permanently?"
      )
    ) {

      return;

    }


    try {

      await deleteDoc(

        doc(
          db,
          "registrations",
          id
        )

      );


      await renderAll();


    } catch (error) {

      console.error(
        "Delete error:",
        error
      );


      alert(
        "Could not delete registration."
      );

    }

  };


// ============================================================
// SELECT ALL
// ============================================================

window.toggleAll =
  checkbox => {

    document
      .querySelectorAll(
        ".rowcheck"
      )
      .forEach(
        item =>
          item.checked =
            checkbox.checked
      );

  };


// ============================================================
// APPROVE VISIBLE
// ============================================================

window.approveVisible =
  async () => {

    const ids =
      [
        ...document.querySelectorAll(
          ".rowcheck:checked"
        )
      ].map(
        x => x.value
      );


    if (!ids.length) {

      alert(
        "Select students first."
      );

      return;

    }


    try {

      for (
        const id of ids
      ) {

        const student =
          regs.find(
            x => x.id === id
          );


        if (
          student &&
          student.status !== "Approved"
        ) {

          await setDoc(

            doc(
              db,
              "registrations",
              id
            ),

            {
              ...student,
              status: "Approved"
            }

          );

        }

      }


      await renderAll();


    } catch (error) {

      console.error(
        "Bulk approval error:",
        error
      );


      alert(
        "Could not approve selected students."
      );

    }

  };


// ============================================================
// EXPORT CSV
// ============================================================

window.exportRegistrations =
  () => {

    const rows =
      visibleRows();


    const headers = [

      "ID",
      "Name",
      "Class",
      "School",
      "Mobile",
      "Parent",
      "City",
      "Email",
      "Status",
      "Date"

    ];


    const csvRows = [

      headers,

      ...rows.map(
        r => [

          r.id,
          r.name,
          r.class,
          r.school,
          r.mobile,
          r.parent,
          r.city,
          r.email,
          r.status,
          r.date

        ]
      )

    ];


    const csv =
      csvRows

        .map(
          row =>
            row
              .map(
                value =>
                  `"${String(
                    value ?? ""
                  ).replaceAll(
                    '"',
                    '""'
                  )}"`
              )
              .join(",")
        )

        .join("\n");


    const url =
      URL.createObjectURL(

        new Blob(
          [csv],
          {
            type:
              "text/csv"
          }
        )

      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      "MO-Olympiad-registrations.csv";


    link.click();


    URL.revokeObjectURL(
      url
    );

  };


// ============================================================
// STUDENT EDIT FORM
// ============================================================

$("editForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      try {

        const form =
          Object.fromEntries(
            new FormData(
              event.target
            )
          );


        form.id =
          form.id.toUpperCase();


        const old =
          regs.find(
            x => x.id === form.id
          );


        if (!old) {

          $("editMsg").innerHTML = `
            <div class="error">
              Registration ID not found.
            </div>
          `;

          return;

        }


        await setDoc(

          doc(
            db,
            "registrations",
            form.id
          ),

          {
            ...old,
            ...form
          }

        );


        $("editMsg").innerHTML = `
          <div class="success">
            Student updated successfully.
          </div>
        `;


        await renderAll();


      } catch (error) {

        console.error(
          "Student update error:",
          error
        );


        $("editMsg").innerHTML = `
          <div class="error">
            Could not update student.
            <br>
            ${esc(error.message)}
          </div>
        `;

      }

    }
  );


// ============================================================
// RESULT MANAGEMENT
// ============================================================

$("resultForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      try {

        const form =
          Object.fromEntries(
            new FormData(
              event.target
            )
          );


        form.id =
          form.id.toUpperCase();


        if (
          !regs.some(
            x => x.id === form.id
          )
        ) {

          $("resultMsg").innerHTML = `
            <div class="error">
              Registration ID not found.
            </div>
          `;

          return;

        }


        await setDoc(

          doc(
            db,
            "results",
            form.id
          ),

          form

        );


        $("resultMsg").innerHTML = `
          <div class="success">
            Result published successfully.
          </div>
        `;


        await renderAll();


      } catch (error) {

        console.error(
          "Result error:",
          error
        );


        $("resultMsg").innerHTML = `
          <div class="error">
            Could not publish result.
            <br>
            ${esc(error.message)}
          </div>
        `;

      }

    }
  );


// ============================================================
// ANNOUNCEMENT FORM
// ============================================================

$("noticeForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      try {

        const form =
          Object.fromEntries(
            new FormData(
              event.target
            )
          );


        await addDoc(

          collection(
            db,
            "announcements"
          ),

          {
            ...form,

            date:
              new Date()
                .toLocaleDateString(
                  "en-IN"
                ),

            createdAt:
              new Date().toISOString()

          }

        );


        event.target.reset();


        await renderNotices();


      } catch (error) {

        console.error(
          "Announcement error:",
          error
        );


        alert(
          "Could not publish announcement."
        );

      }

    }
  );


// ============================================================
// RENDER ANNOUNCEMENTS
// ============================================================

async function renderNotices() {

  try {

    const container =
      $("noticeAdmin");


    const snapshot =
      await getDocs(
        collection(
          db,
          "announcements"
        )
      );


    container.innerHTML =

      snapshot.docs

        .map(
          d => {

            const data =
              d.data();


            return `

              <div class="notice">

                <b>
                  ${esc(data.type)}:
                </b>

                ${esc(data.text)}

                <button
                  class="smallbtn"
                  onclick="deleteNotice('${esc(d.id)}')"
                >
                  Delete
                </button>

              </div>

            `;

          }
        )

        .join("")

      ||

      `
        <p class="muted">
          No announcements.
        </p>
      `;


  } catch (error) {

    console.error(
      "Announcement loading error:",
      error
    );

  }

}


window.deleteNotice =
  async id => {

    if (
      !confirm(
        "Delete this announcement?"
      )
    ) {

      return;

    }


    try {

      await deleteDoc(

        doc(
          db,
          "announcements",
          id
        )

      );


      await renderNotices();


    } catch (error) {

      console.error(
        "Delete notice error:",
        error
      );

    }

  };


// ============================================================
// LOAD EXAM SCHEDULE
// ============================================================

async function loadSettings() {

  try {

    const reference =
      doc(
        db,
        "settings",
        "olympiad"
      );


    const snapshot =
      await getDoc(
        reference
      );


    if (
      !snapshot.exists()
    ) {

      console.log(
        "No exam schedule saved yet."
      );

      return;

    }


    const data =
      snapshot.data();


    const form =
      $("settingsForm");


    if (!form)
      return;


    const fields = [

      "examDate",
      "startTime",
      "endTime",
      "duration",
      "examCentre",
      "centreAddress",
      "instructions",
      "officialNotice"

    ];


    fields.forEach(
      fieldName => {

        const field =
          form.elements[fieldName];


        if (field) {

          field.value =
            data[fieldName] ?? "";

        }

      }
    );


    console.log(
      "Exam schedule loaded successfully."
    );


  } catch (error) {

    console.error(
      "Could not load exam schedule:",
      error
    );


    const message =
      $("settingsMsg");


    if (message) {

      message.innerHTML = `
        <div class="error">

          Could not load exam schedule.

          <br>

          ${esc(error.message)}

        </div>
      `;

    }

  }

}


// ============================================================
// SAVE / UPDATE EXAM SCHEDULE
// ============================================================

$("settingsForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const form =
        event.currentTarget;


      const button =
        form.querySelector(
          'button[type="submit"]'
        );


      const message =
        $("settingsMsg");


      if (button) {

        button.disabled =
          true;

        button.textContent =
          "Saving...";

      }


      message.innerHTML =
        "";


      try {

        // ----------------------------------------------------
        // FORM DATA
        // ----------------------------------------------------

        const data =
          Object.fromEntries(
            new FormData(
              form
            )
          );


        const examDate =
          String(
            data.examDate || ""
          ).trim();


        const startTime =
          String(
            data.startTime || ""
          ).trim();


        const endTime =
          String(
            data.endTime || ""
          ).trim();


        const duration =
          String(
            data.duration || ""
          ).trim();


        const examCentre =
          String(
            data.examCentre || ""
          ).trim();


        const centreAddress =
          String(
            data.centreAddress || ""
          ).trim();


        const instructions =
          String(
            data.instructions || ""
          ).trim();


        const officialNotice =
          String(
            data.officialNotice || ""
          ).trim();


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!examDate) {

          throw new Error(
            "Please select the exam date."
          );

        }


        if (!startTime) {

          throw new Error(
            "Please select the exam start time."
          );

        }


        if (!endTime) {

          throw new Error(
            "Please select the exam end time."
          );

        }


        if (!examCentre) {

          throw new Error(
            "Please enter the examination centre/place."
          );

        }


        if (
          startTime >= endTime
        ) {

          throw new Error(
            "End time must be later than start time."
          );

        }


        if (
          duration &&
          (
            Number(duration) <= 0 ||
            !Number.isFinite(
              Number(duration)
            )
          )
        ) {

          throw new Error(
            "Exam duration must be a valid number greater than 0."
          );

        }


        // ----------------------------------------------------
        // FIRESTORE DATA
        // ----------------------------------------------------

        const schedule = {

          examDate:
            examDate,

          startTime:
            startTime,

          endTime:
            endTime,

          duration:
            duration,

          examCentre:
            examCentre,

          centreAddress:
            centreAddress,

          instructions:
            instructions,

          officialNotice:
            officialNotice,

          updatedAt:
            new Date().toISOString()

        };


        // ----------------------------------------------------
        // SAVE
        // ----------------------------------------------------

        await setDoc(

          doc(
            db,
            "settings",
            "olympiad"
          ),

          schedule,

          {
            merge: true
          }

        );


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        message.innerHTML = `

          <div class="success">

            <b>
              ✓ Exam schedule saved successfully.
            </b>

            <br><br>

            <b>Date:</b>
            ${esc(examDate)}

            <br>

            <b>Time:</b>
            ${esc(startTime)}
            –
            ${esc(endTime)}

            <br>

            <b>Centre:</b>
            ${esc(examCentre)}

            <br><br>

            Students will see the updated
            examination information on their
            admit cards.

          </div>

        `;


        console.log(
          "Exam schedule saved:",
          schedule
        );


      } catch (error) {

        console.error(
          "Exam schedule save error:",
          error
        );


        let errorMessage =
          error?.message ||
          String(error);


        if (
          error?.code ===
          "permission-denied"
        ) {

          errorMessage =
            "Firebase denied the write. Confirm you are signed in to Firebase Authentication as " +
            "mangalamsoni70@gmail.com and that Firestore rules permit this admin account to write settings/olympiad.";

        }


        else if (
          error?.code ===
          "unauthenticated"
        ) {

          errorMessage =
            "Your Firebase admin session has expired. Please sign in again.";

        }


        else if (
          error?.code ===
          "failed-precondition"
        ) {

          errorMessage =
            "Firestore is not configured correctly.";

        }


        message.innerHTML = `

          <div class="error">

            <b>
              Schedule was not saved.
            </b>

            <br><br>

            ${esc(errorMessage)}

            <br><br>

            <small>
              Firebase error:
              ${esc(
                error?.code ||
                "unknown"
              )}
            </small>

          </div>

        `;


      } finally {

        if (button) {

          button.disabled =
            false;

          button.textContent =
            "💾 Save / Update Exam Schedule";

        }

      }

    }
  );
