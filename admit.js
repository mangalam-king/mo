import {
  db,
  doc,
  getDoc
} from "./firebase.js";


// ============================================================
// HELPERS
// ============================================================

const $ = id =>
  document.getElementById(id);


const esc = value =>
  String(value ?? "")
    .replace(
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
// URL REGISTRATION ID
// Example:
// admit-card.html?id=MO20260001
// ============================================================

const params =
  new URLSearchParams(
    window.location.search
  );


const preset =
  params.get("id");


if (preset) {

  $("admitId").value =
    preset.toUpperCase();

}


// ============================================================
// ADMIT CARD SEARCH
// ============================================================

$("admitSearch")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const input =
        $("admitId");


      const output =
        $("admitOutput");


      const id =
        input.value
          .trim()
          .toUpperCase();


      if (!id) {

        output.innerHTML = `
          <div class="error">
            Please enter your Registration ID.
          </div>
        `;

        return;

      }


      // ------------------------------------------------------
      // LOADING
      // ------------------------------------------------------

      output.innerHTML = `

        <div class="success">

          🔄 Searching for registration
          <b>${esc(id)}</b>...

        </div>

      `;


      try {

        // ----------------------------------------------------
        // FIND REGISTRATION
        // ----------------------------------------------------

        const registrationRef =
          doc(
            db,
            "registrations",
            id
          );


        const registrationSnap =
          await getDoc(
            registrationRef
          );


        // ----------------------------------------------------
        // NOT FOUND
        // ----------------------------------------------------

        if (
          !registrationSnap.exists()
        ) {

          output.innerHTML = `

            <div class="error">

              <b>
                Registration ID not found.
              </b>

              <br><br>

              Please check your Registration ID
              and try again.

              <br><br>

              Enter the exact ID given after
              registration.

            </div>

          `;

          return;

        }


        // ----------------------------------------------------
        // REGISTRATION DATA
        // ----------------------------------------------------

        const student =
          registrationSnap.data();


        // ----------------------------------------------------
        // CHECK APPROVAL
        // ----------------------------------------------------

        const status =
          String(
            student.status ||
            "Pending"
          );


        if (
          status.toLowerCase() !==
          "approved"
        ) {

          output.innerHTML = `

            <div class="error">

              <b>
                Admit Card is not available yet.
              </b>

              <br><br>

              Registration ID:
              <strong>
                ${esc(
                  student.id || id
                )}
              </strong>

              <br>

              Current status:
              <strong>
                ${esc(status)}
              </strong>

              <br><br>

              Your admit card will become
              available after your registration
              is approved by the Olympiad admin.

            </div>

          `;

          return;

        }


        // ====================================================
        // LOAD EXAM SETTINGS
        // ====================================================

        let settings = {};


        try {

          const settingsRef =
            doc(
              db,
              "settings",
              "olympiad"
            );


          const settingsSnap =
            await getDoc(
              settingsRef
            );


          if (
            settingsSnap.exists()
          ) {

            settings =
              settingsSnap.data();

          }

        } catch (settingsError) {

          console.warn(
            "Could not load exam settings:",
            settingsError
          );

        }


        // ====================================================
        // EXAM INFORMATION
        // ====================================================

        const examDate =
          settings.examDate ||
          "To be announced";


        let examTime =
          "To be announced";


        if (
          settings.startTime &&
          settings.endTime
        ) {

          examTime =
            `${settings.startTime} – ${settings.endTime}`;

        }

        else if (
          settings.startTime
        ) {

          examTime =
            settings.startTime;

        }

        else if (
          settings.examTime
        ) {

          examTime =
            settings.examTime;

        }


        const duration =
          settings.duration
            ? `${settings.duration} minutes`
            : "To be announced";


        const centre =
          settings.examCentre ||
          "To be announced";


        const centreAddress =
          settings.centreAddress ||
          "";


        const instructions =
          settings.instructions ||
          "Bring this admit card to the examination centre and follow all instructions issued by MO Olympiad.";


        const officialNotice =
          settings.officialNotice ||
          "";


        // ====================================================
        // DISPLAY ADMIT CARD
        // ====================================================

        output.innerHTML = `

          <div
            class="student-card admit-print"
            id="printCard"
          >


            <!-- TOP -->

            <div class="admit-top">

              <div class="admit-logo">
                MO
              </div>


              <div>

                <h2>
                  MO OLYMPIAD
                </h2>

                <p>
                  OFFICIAL EXAMINATION ADMIT CARD
                </p>

              </div>


              <div class="approved-badge">
                APPROVED
              </div>

            </div>


            <hr>


            <!-- STUDENT DETAILS -->

            <div class="admit-grid">


              <div>

                <span>
                  Registration ID
                </span>

                <b>
                  ${esc(
                    student.id || id
                  )}
                </b>

              </div>


              <div>

                <span>
                  Student Name
                </span>

                <b>
                  ${esc(
                    student.name
                  )}
                </b>

              </div>


              <div>

                <span>
                  Class
                </span>

                <b>
                  ${esc(
                    student.class
                  )}
                </b>

              </div>


              <div>

                <span>
                  School
                </span>

                <b>
                  ${esc(
                    student.school
                  )}
                </b>

              </div>


              <div>

                <span>
                  City
                </span>

                <b>
                  ${esc(
                    student.city ||
                    "—"
                  )}
                </b>

              </div>


              <div>

                <span>
                  Exam Date
                </span>

                <b>
                  ${esc(
                    examDate
                  )}
                </b>

              </div>


              <div>

                <span>
                  Exam Time
                </span>

                <b>
                  ${esc(
                    examTime
                  )}
                </b>

              </div>


              <div>

                <span>
                  Duration
                </span>

                <b>
                  ${esc(
                    duration
                  )}
                </b>

              </div>


              <div class="full">

                <span>
                  Exam Centre / Place
                </span>

                <b>
                  ${esc(
                    centre
                  )}
                </b>

              </div>


              ${
                centreAddress
                  ? `

                    <div class="full">

                      <span>
                        Centre Address
                      </span>

                      <b>
                        ${esc(
                          centreAddress
                        )}
                      </b>

                    </div>

                  `
                  : ""
              }


            </div>


            <!-- INSTRUCTIONS -->

            <div class="admit-note">

              <b>
                📋 Instructions
              </b>

              <br><br>

              ${esc(
                instructions
              )}

            </div>


            ${
              officialNotice
                ? `

                  <div class="admit-note">

                    <b>
                      📢 Official Notice
                    </b>

                    <br><br>

                    ${esc(
                      officialNotice
                    )}

                  </div>

                `
                : ""
            }


            <!-- ACTIONS -->

            <div class="admit-actions">

              <button
                class="btn primary"
                id="downloadAdmit"
                type="button"
              >
                ⬇ Download / Save PDF
              </button>


              <button
                class="btn ghost"
                id="printAdmit"
                type="button"
              >
                🖨 Print
              </button>

            </div>


          </div>

        `;


        // ====================================================
        // PRINT
        // ====================================================

        $("printAdmit")
          .onclick = () => {

            window.print();

          };


        // ====================================================
        // DOWNLOAD / SAVE PDF
        // ====================================================

        $("downloadAdmit")
          .onclick = () => {

            window.print();

          };


        // ====================================================
        // SUCCESS SCROLL
        // ====================================================

        output.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });


      } catch (error) {

        console.error(
          "Admit card error:",
          error
        );


        output.innerHTML = `

          <div class="error">

            <b>
              Unable to load admit card.
            </b>

            <br><br>

            ${esc(
              error.message ||
              error
            )}

            <br><br>

            <small>
              Error code:
              ${esc(
                error.code ||
                "unknown"
              )}
            </small>

          </div>

        `;

      }

    }
  );
