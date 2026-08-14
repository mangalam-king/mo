// ============================================================
// MO OLYMPIAD - ADMIN PANEL
// ============================================================

import {

  db,

  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,

  auth,
  googleProvider,

  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged

} from "./firebase.js";


// ============================================================
// ADMIN EMAIL
// ============================================================

const ADMIN_EMAIL =
  "mangalamsoni70@gmail.com";


// ============================================================
// HELPER
// ============================================================

function $(id) {

  return document.getElementById(id);

}


// ============================================================
// ELEMENTS
// ============================================================

const loginSection =
  $("adminLogin");

const dashboardSection =
  $("adminDashboard");

const googleLoginButton =
  $("googleLogin");

const logoutButton =
  $("logoutBtn");

const authMessage =
  $("authMsg");

const settingsForm =
  $("settingsForm");

const settingsMessage =
  $("settingsMsg");


// ============================================================
// GOOGLE LOGIN
// ============================================================

if (googleLoginButton) {

  googleLoginButton.addEventListener(
    "click",
    async () => {

      if (authMessage) {

        authMessage.innerHTML = `
          <div class="success">
            Opening Google sign-in...
          </div>
        `;

      }

      try {

        await signInWithPopup(
          auth,
          googleProvider
        );

      }

      catch (error) {

        console.error(
          "Google login error:",
          error
        );

        /*
          If popup is blocked, try redirect login.
        */

        if (

          error.code ===
          "auth/popup-blocked" ||

          error.code ===
          "auth/popup-closed-by-user" ||

          error.code ===
          "auth/cancelled-popup-request"

        ) {

          try {

            await signInWithRedirect(
              auth,
              googleProvider
            );

            return;

          }

          catch (redirectError) {

            console.error(
              "Redirect login error:",
              redirectError
            );

          }

        }


        let message =
          "Google sign-in failed.";


        if (
          error.code ===
          "auth/operation-not-allowed"
        ) {

          message =
            "Google Sign-In is not enabled in Firebase.";

        }


        else if (
          error.code ===
          "auth/unauthorized-domain"
        ) {

          message =
            "This website domain is not authorized in Firebase. Add your GitHub Pages domain under Firebase Authentication → Settings → Authorized domains.";

        }


        else if (
          error.code ===
          "auth/network-request-failed"
        ) {

          message =
            "Network error. Check your internet connection.";

        }


        if (authMessage) {

          authMessage.innerHTML = `

            <div class="error">

              <strong>Google sign-in failed.</strong>

              <br><br>

              ${message}

              <br>

              <small>
                Error:
                ${error.code || "unknown"}
              </small>

            </div>

          `;

        }

      }

    }
  );

}


// ============================================================
// GOOGLE REDIRECT RESULT
// ============================================================

getRedirectResult(auth)

  .then(result => {

    if (result && result.user) {

      console.log(
        "Google redirect login successful:",
        result.user.email
      );

    }

  })

  .catch(error => {

    console.error(
      "Redirect result error:",
      error
    );

  });


// ============================================================
// CHECK ADMIN USER
// ============================================================

onAuthStateChanged(
  auth,
  async user => {

    // --------------------------------------------------------
    // NOT LOGGED IN
    // --------------------------------------------------------

    if (!user) {

      if (loginSection)
        loginSection.style.display = "block";

      if (dashboardSection)
        dashboardSection.style.display = "none";

      return;

    }


    // --------------------------------------------------------
    // CHECK EMAIL
    // --------------------------------------------------------

    const email =
      (user.email || "").toLowerCase();


    if (
      email !==
      ADMIN_EMAIL.toLowerCase()
    ) {

      console.warn(
        "Unauthorized Google account:",
        user.email
      );


      if (authMessage) {

        authMessage.innerHTML = `

          <div class="error">

            <strong>Access denied.</strong>

            <br><br>

            This Google account is not authorized
            to access the MO Olympiad Admin Panel.

            <br><br>

            Authorized account:

            <strong>
              ${ADMIN_EMAIL}
            </strong>

          </div>

        `;

      }


      try {

        await signOut(auth);

      }

      catch (error) {

        console.error(error);

      }

      return;

    }


    // --------------------------------------------------------
    // ADMIN VERIFIED
    // --------------------------------------------------------

    console.log(
      "Admin verified:",
      user.email
    );


    if (loginSection)
      loginSection.style.display = "none";


    if (dashboardSection)
      dashboardSection.style.display = "block";


    if (authMessage)
      authMessage.innerHTML = "";


    // Load saved settings
    await loadSettings();

  }
);


// ============================================================
// LOGOUT
// ============================================================

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        location.reload();

      }

      catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }

    }
  );

}


// ============================================================
// LOAD EXAM SETTINGS
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
      await getDoc(reference);


    // No schedule yet
    if (!snapshot.exists()) {

      console.log(
        "No exam schedule found."
      );

      return;

    }


    const data =
      snapshot.data();


    if (!settingsForm)
      return;


    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

    if (
      settingsForm.elements.examDate
    ) {

      settingsForm.elements.examDate.value =
        data.examDate || "";

    }


    // --------------------------------------------------------
    // START TIME
    // --------------------------------------------------------

    if (
      settingsForm.elements.startTime
    ) {

      settingsForm.elements.startTime.value =
        data.startTime || "";

    }


    // --------------------------------------------------------
    // END TIME
    // --------------------------------------------------------

    if (
      settingsForm.elements.endTime
    ) {

      settingsForm.elements.endTime.value =
        data.endTime || "";

    }


    // --------------------------------------------------------
    // DURATION
    // --------------------------------------------------------

    if (
      settingsForm.elements.duration
    ) {

      settingsForm.elements.duration.value =
        data.duration || "";

    }


    // --------------------------------------------------------
    // EXAM CENTRE
    // --------------------------------------------------------

    if (
      settingsForm.elements.examCentre
    ) {

      settingsForm.elements.examCentre.value =
        data.examCentre || "";

    }


    // --------------------------------------------------------
    // ADDRESS
    // --------------------------------------------------------

    if (
      settingsForm.elements.centreAddress
    ) {

      settingsForm.elements.centreAddress.value =
        data.centreAddress || "";

    }


    // --------------------------------------------------------
    // INSTRUCTIONS
    // --------------------------------------------------------

    if (
      settingsForm.elements.instructions
    ) {

      settingsForm.elements.instructions.value =
        data.instructions || "";

    }


    // --------------------------------------------------------
    // OFFICIAL NOTICE
    // --------------------------------------------------------

    if (
      settingsForm.elements.officialNotice
    ) {

      settingsForm.elements.officialNotice.value =
        data.officialNotice || "";

    }


    console.log(
      "Exam schedule loaded successfully."
    );

  }

  catch (error) {

    console.error(
      "Load settings error:",
      error
    );


    if (settingsMessage) {

      settingsMessage.innerHTML = `

        <div class="error">

          <strong>
            Could not load exam schedule.
          </strong>

          <br>

          ${error.message}

        </div>

      `;

    }

  }

}


// ============================================================
// SAVE / UPDATE EXAM SCHEDULE
// ============================================================

if (settingsForm) {

  settingsForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      // ------------------------------------------------------
      // BUTTON
      // ------------------------------------------------------

      const button =
        settingsForm.querySelector(
          'button[type="submit"]'
        );


      if (button) {

        button.disabled = true;

        button.textContent =
          "Saving...";

      }


      if (settingsMessage) {

        settingsMessage.innerHTML = "";

      }


      try {

        // ----------------------------------------------------
        // GET FORM DATA
        // ----------------------------------------------------

        const formData =
          new FormData(
            settingsForm
          );


        const examDate =
          String(
            formData.get("examDate") || ""
          ).trim();


        const startTime =
          String(
            formData.get("startTime") || ""
          ).trim();


        const endTime =
          String(
            formData.get("endTime") || ""
          ).trim();


        const duration =
          String(
            formData.get("duration") || ""
          ).trim();


        const examCentre =
          String(
            formData.get("examCentre") || ""
          ).trim();


        const centreAddress =
          String(
            formData.get("centreAddress") || ""
          ).trim();


        const instructions =
          String(
            formData.get("instructions") || ""
          ).trim();


        const officialNotice =
          String(
            formData.get("officialNotice") || ""
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
            "Please enter the exam place / centre."
          );

        }


        if (startTime >= endTime) {

          throw new Error(
            "End time must be later than start time."
          );

        }


        if (
          duration &&
          Number(duration) <= 0
        ) {

          throw new Error(
            "Exam duration must be greater than 0."
          );

        }


        // ----------------------------------------------------
        // SCHEDULE OBJECT
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
        // SAVE TO FIRESTORE
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

        if (settingsMessage) {

          settingsMessage.innerHTML = `

            <div class="success">

              <strong>
                ✓ Exam schedule saved successfully!
              </strong>

              <br><br>

              <b>Date:</b>
              ${examDate}

              <br>

              <b>Time:</b>
              ${startTime}
              –
              ${endTime}

              <br>

              <b>Centre:</b>
              ${examCentre}

              <br><br>

              The updated schedule will appear
              on approved students' admit cards.

            </div>

          `;

        }


        console.log(
          "Exam schedule saved:",
          schedule
        );

      }

      catch (error) {

        // ----------------------------------------------------
        // ERROR
        // ----------------------------------------------------

        console.error(
          "Schedule save error:",
          error
        );


        let message =
          error.message ||
          String(error);


        if (
          error.code ===
          "permission-denied"
        ) {

          message =
            "Firebase permission denied. " +
            "Make sure you are signed in with " +
            ADMIN_EMAIL +
            " and your Firestore rules allow authenticated admins to write settings.";

        }


        else if (
          error.code ===
          "unauthenticated"
        ) {

          message =
            "Your admin session has expired. " +
            "Please sign in with Google again.";

        }


        else if (
          error.code ===
          "failed-precondition"
        ) {

          message =
            "Firestore is not configured correctly. " +
            "Make sure Firestore Database is enabled.";

        }


        if (settingsMessage) {

          settingsMessage.innerHTML = `

            <div class="error">

              <strong>
                Schedule was not saved.
              </strong>

              <br><br>

              ${message}

              <br><br>

              <small>
                Firebase error:
                ${error.code || "unknown"}
              </small>

            </div>

          `;

        }

      }


      finally {

        if (button) {

          button.disabled = false;

          button.textContent =
            "💾 Save / Update Exam Schedule";

        }

      }

    }
  );

}
