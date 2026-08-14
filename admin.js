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
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "./firebase.js";


// ============================================================
// ADMIN EMAILS
// ============================================================

const ADMIN_EMAILS = [
  "mangalamsoni70@gmail.com"
];


// ============================================================
// GLOBAL DATA
// ============================================================

let regs = [];


// ============================================================
// HELPERS
// ============================================================

const $ = id => document.getElementById(id);

const esc = value =>
  String(value ?? "").replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
  );


// ============================================================
// GOOGLE LOGIN
// ============================================================

$("googleLogin").onclick = async () => {

  $("authMsg").innerHTML =
    '<div class="success">Opening Google sign-in…</div>';

  try {

    await signInWithPopup(
      auth,
      googleProvider
    );

  } catch (e) {

    console.error(
      "Google sign-in:",
      e
    );

    const code = e?.code || "";

    // Popup blocked / closed
    if (
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {

      try {

        await signInWithRedirect(
          auth,
          googleProvider
        );

        return;

      } catch (redirectError) {

        console.error(
          "Redirect login error:",
          redirectError
        );

      }

    }


    let msg =
      "Google sign-in failed.";


    if (
      code === "auth/unauthorized-domain"
    ) {

      msg =
        "This website domain is not authorized in Firebase. " +
        "Add your GitHub Pages domain in Firebase Authentication → Settings → Authorized domains.";

    }

    else if (
      code === "auth/operation-not-allowed"
    ) {

      msg =
        "Google sign-in is not enabled. " +
        "Enable Google under Firebase Authentication → Sign-in method.";

    }

    else if (
      code === "auth/popup-blocked"
    ) {

      msg =
        "Your browser blocked the Google popup. " +
        "Allow popups for this website and try again.";

    }

    else if (
      code === "auth/network-request-failed"
    ) {

      msg =
        "Network error. Check your internet connection and try again.";

    }


    $("authMsg").innerHTML = `
      <div class="error">
        ${msg}
        <br>
        <small>
          Error: ${esc(code || e.message || "unknown")}
        </small>
      </div>
    `;

  }

};


// ============================================================
// LOGOUT
// ============================================================

$("logoutBtn").onclick = async () => {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }

};


// ============================================================
// GOOGLE REDIRECT RESULT
// ============================================================

getRedirectResult(auth).catch(error => {

  if (error) {

    console.error(
      "Google redirect result:",
      error
    );

  }

});


// ============================================================
// AUTH STATE
// ============================================================

onAuthStateChanged(
  auth,
  async user => {

    // --------------------------------------------------------
    // NOT LOGGED IN
    // --------------------------------------------------------

    if (!user) {

      $("loginBox")
        .classList
        .remove("hidden");

      $("adminPanel")
        .classList
        .add("hidden");

      return;

    }


    // --------------------------------------------------------
    // CHECK ADMIN EMAIL
    // --------------------------------------------------------

    const email =
      (user.email || "").toLowerCase();


    const allowed =
      ADMIN_EMAILS
        .map(x => x.toLowerCase())
        .includes(email);


    if (!allowed) {

      $("authMsg").innerHTML = `
        <div class="error">
          Access denied for
          <b>${esc(user.email)}</b>.
          <br><br>
          This Google account is not authorized
          to access the MO Olympiad Admin Panel.
        </div>
      `;

      await signOut(auth);

      return;

    }


    // --------------------------------------------------------
    // ADMIN VERIFIED
    // --------------------------------------------------------

    $("loginBox")
      .classList
      .add("hidden");

    $("adminPanel")
      .classList
      .remove("hidden");


    $("adminUser").textContent =
      `Signed in as ${user.email}`;


    await renderAll();

  }
);


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
            "Firebase permission denied. " +
            "Make sure you are signed in as " +
            "mangalamsoni70@gmail.com " +
            "and your Firestore rules allow the admin to write settings.";

        }


        else if (
          error?.code ===
          "unauthenticated"
        ) {

          errorMessage =
            "Your admin login session has expired. " +
            "Please sign in with Google again.";

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
