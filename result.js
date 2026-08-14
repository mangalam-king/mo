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
// URL ID
// ============================================================

const params =
  new URLSearchParams(
    window.location.search
  );


const preset =
  params.get("id");


if (preset) {

  $("resultId").value =
    preset.toUpperCase();

}


// ============================================================
// RESULT SEARCH
// ============================================================

$("resultSearch")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const id =
        $("resultId")
          .value
          .trim()
          .toUpperCase();


      const output =
        $("resultOutput");


      if (!id) {

        output.innerHTML = `
          <div class="error">
            Please enter your Registration ID.
          </div>
        `;

        return;

      }


      output.innerHTML = `

        <div class="success">

          🔄 Loading result...

        </div>

      `;


      try {

        // ====================================================
        // GET RESULT DIRECTLY
        // ====================================================

        const resultRef =
          doc(
            db,
            "results",
            id
          );


        const resultSnap =
          await getDoc(
            resultRef
          );


        if (
          !resultSnap.exists()
        ) {

          output.innerHTML = `

            <div class="error">

              <b>
                Result not found.
              </b>

              <br><br>

              No published result was found
              for Registration ID:

              <strong>
                ${esc(id)}
              </strong>

            </div>

          `;

          return;

        }


        const result =
          resultSnap.data();


        // ====================================================
        // GET STUDENT DETAILS
        // ====================================================

        let student = {};


        try {

          const studentRef =
            doc(
              db,
              "registrations",
              id
            );


          const studentSnap =
            await getDoc(
              studentRef
            );


          if (
            studentSnap.exists()
          ) {

            student =
              studentSnap.data();

          }

        } catch (studentError) {

          console.warn(
            "Student information could not be loaded:",
            studentError
          );

        }


        // ====================================================
        // VALUES
        // ====================================================

        const marks =
          result.marks ?? "—";


        const total =
          result.total ?? "—";


        const rank =
          result.rank ||
          "—";


        const status =
          result.status ||
          "Not Published";


        const certificate =
          result.certificate ||
          "";


        const percentage =
          Number.isFinite(
            Number(marks)
          ) &&
          Number.isFinite(
            Number(total)
          ) &&
          Number(total) > 0

            ? (
                Number(marks) /
                Number(total) *
                100
              ).toFixed(2) + "%"

            : "—";


        const isQualified =
          status
            .toLowerCase()
            .includes(
              "qualified"
            ) &&
          !status
            .toLowerCase()
            .includes(
              "not qualified"
            );


        // ====================================================
        // RESULT CARD
        // ====================================================

        output.innerHTML = `

          <div
            class="student-card result-card"
            id="printResult"
          >


            <!-- HEADER -->

            <div class="result-header">

              <div class="logo"
                style="
                  margin:0 auto 10px;
                "
              >
                MO
              </div>


              <h2>
                MO OLYMPIAD
              </h2>


              <p class="muted">
                OFFICIAL RESULT
              </p>


              <div
                class="${
                  isQualified
                    ? "qualified"
                    : "not-qualified"
                }"
              >

                ${esc(status)}

              </div>

            </div>


            <hr>


            <!-- STUDENT -->

            <h3>
              👨‍🎓 Student Details
            </h3>


            <table class="result-table">

              <tr>

                <td>
                  Registration ID
                </td>

                <td>
                  <b>
                    ${esc(
                      result.id ||
                      student.id ||
                      id
                    )}
                  </b>
                </td>

              </tr>


              <tr>

                <td>
                  Student Name
                </td>

                <td>
                  ${esc(
                    student.name ||
                    result.name ||
                    "—"
                  )}
                </td>

              </tr>


              <tr>

                <td>
                  Class
                </td>

                <td>
                  ${esc(
                    student.class ||
                    result.class ||
                    "—"
                  )}
                </td>

              </tr>


              <tr>

                <td>
                  School
                </td>

                <td>
                  ${esc(
                    student.school ||
                    result.school ||
                    "—"
                  )}
                </td>

              </tr>

            </table>


            <!-- MARKS -->

            <h3 style="margin-top:25px">
              🏆 Result
            </h3>


            <div class="marks">

              ${esc(marks)}
              /
              ${esc(total)}

            </div>


            <table class="result-table">

              <tr>

                <td>
                  Marks Obtained
                </td>

                <td>
                  <b>
                    ${esc(marks)}
                  </b>
                </td>

              </tr>


              <tr>

                <td>
                  Total Marks
                </td>

                <td>
                  ${esc(total)}
                </td>

              </tr>


              <tr>

                <td>
                  Percentage
                </td>

                <td>
                  <b>
                    ${esc(percentage)}
                  </b>
                </td>

              </tr>


              <tr>

                <td>
                  Rank
                </td>

                <td>
                  <b>
                    ${esc(rank)}
                  </b>
                </td>

              </tr>


              <tr>

                <td>
                  Result Status
                </td>

                <td>
                  ${esc(status)}
                </td>

              </tr>

            </table>


            <!-- CERTIFICATE -->

            ${
              certificate
                ? `

                  <div class="certificate-box">

                    <h3>
                      🏅 Certificate
                    </h3>

                    <p class="muted">
                      Certificate Number
                    </p>


                    <div
                      class="certificate-number"
                    >
                      ${esc(
                        certificate
                      )}
                    </div>


                    ${
                      isQualified
                        ? `

                          <button
                            class="btn primary"
                            id="certificateBtn"
                            type="button"
                          >
                            📜 Download Certificate
                          </button>

                        `
                        : `

                          <p class="muted">
                            Certificate is available
                            for qualified students.
                          </p>

                        `
                    }

                  </div>

                `
                : ""
            }


            <!-- ACTIONS -->

            <div class="result-actions">

              <button
                class="btn primary"
                id="downloadResult"
                type="button"
              >
                ⬇ Download Result
              </button>


              <button
                class="btn ghost"
                id="printResultBtn"
                type="button"
              >
                🖨 Print Result
              </button>

            </div>


          </div>

        `;


        // ====================================================
        // PRINT RESULT
        // ====================================================

        $("printResultBtn")
          .onclick = () => {

            window.print();

          };


        // ====================================================
        // DOWNLOAD RESULT
        // ====================================================

        $("downloadResult")
          .onclick = () => {

            window.print();

          };


        // ====================================================
        // CERTIFICATE
        // ====================================================

        const certificateBtn =
          $("certificateBtn");


        if (certificateBtn) {

          certificateBtn.onclick =
            () => {

              createCertificate(
                student,
                result,
                id,
                certificate
              );

            };

        }


        // ====================================================
        // SCROLL
        // ====================================================

        output.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });


      } catch (error) {

        console.error(
          "Result error:",
          error
        );


        output.innerHTML = `

          <div class="error">

            <b>
              Unable to open result.
            </b>

            <br><br>

            ${esc(
              error.message ||
              error
            )}

            <br><br>

            <small>
              Error:
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


// ============================================================
// CERTIFICATE GENERATOR
// ============================================================

function createCertificate(
  student,
  result,
  id,
  certificateNumber
) {

  const name =
    student.name ||
    result.name ||
    "Student";


  const studentClass =
    student.class ||
    result.class ||
    "";


  const school =
    student.school ||
    result.school ||
    "";


  const marks =
    result.marks ??
    "";


  const total =
    result.total ??
    "";


  const rank =
    result.rank ||
    "";


  const certificateWindow =
    window.open(
      "",
      "_blank"
    );


  if (
    !certificateWindow
  ) {

    alert(
      "Please allow popups to download the certificate."
    );

    return;

  }


  certificateWindow.document.write(`

    <!DOCTYPE html>

    <html>

    <head>

      <title>
        MO Olympiad Certificate -
        ${esc(certificateNumber)}
      </title>


      <style>

        * {
          box-sizing:border-box;
        }


        body {

          margin:0;

          font-family:
            Arial,
            sans-serif;

          background:
            white;

        }


        .certificate {

          width:
            1000px;

          min-height:
            700px;

          margin:
            30px auto;

          padding:
            55px;

          border:
            12px solid #222;

          position:
            relative;

          text-align:
            center;

        }


        .inner {

          border:
            3px solid #222;

          min-height:
            580px;

          padding:
            45px;

        }


        .logo {

          width:
            70px;

          height:
            70px;

          margin:
            auto;

          border-radius:
            50%;

          background:
            #111;

          color:
            white;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          font-size:
            25px;

          font-weight:
            900;

        }


        h1 {

          font-size:
            44px;

          margin:
            18px 0 5px;

        }


        h2 {

          font-size:
            24px;

          margin:
            5px 0 35px;

        }


        .name {

          font-size:
            36px;

          font-weight:
            800;

          margin:
            25px 0;

          text-decoration:
            underline;

        }


        .text {

          font-size:
            18px;

          line-height:
            1.7;

        }


        .details {

          margin:
            25px auto;

          width:
            80%;

          border-collapse:
            collapse;

        }


        .details td {

          padding:
            9px;

          border-bottom:
            1px solid #ccc;

        }


        .details td:first-child {

          font-weight:
            bold;

          text-align:
            left;

        }


        .details td:last-child {

          text-align:
            right;

        }


        .cert-number {

          margin-top:
            25px;

          font-weight:
            bold;

        }


        .signatures {

          display:
            flex;

          justify-content:
            space-between;

          margin-top:
            55px;

        }


        .signature {

          width:
            200px;

          border-top:
            1px solid #222;

          padding-top:
            8px;

        }


        .actions {

          text-align:
            center;

          margin:
            20px;

        }


        button {

          padding:
            12px 22px;

          border:
            0;

          border-radius:
            8px;

          cursor:
            pointer;

          font-size:
            16px;

        }


        @media print {

          .actions {
            display:none;
          }

          .certificate {
            margin:0;
          }

          @page {
            size:A4 landscape;
            margin:0;
          }

        }

      </style>

    </head>


    <body>


      <div class="actions">

        <button
          onclick="window.print()"
        >
          🖨 Print / Save as PDF
        </button>

      </div>


      <div class="certificate">

        <div class="inner">


          <div class="logo">
            MO
          </div>


          <h1>
            CERTIFICATE OF ACHIEVEMENT
          </h1>


          <h2>
            MO OLYMPIAD
          </h2>


          <div class="text">

            This certificate is proudly presented to

          </div>


          <div class="name">
            ${esc(name)}
          </div>


          <div class="text">

            of Class
            <b>
              ${esc(studentClass)}
            </b>

            from

            <b>
              ${esc(school)}
            </b>

            for successfully participating in
            the MO Olympiad.

          </div>


          <table class="details">

            <tr>

              <td>
                Registration ID
              </td>

              <td>
                ${esc(id)}
              </td>

            </tr>


            <tr>

              <td>
                Marks
              </td>

              <td>
                ${esc(marks)}
                /
                ${esc(total)}
              </td>

            </tr>


            <tr>

              <td>
                Rank
              </td>

              <td>
                ${esc(rank || "—")}
              </td>

            </tr>

          </table>


          <div class="cert-number">

            Certificate No:
            ${esc(certificateNumber)}

          </div>


          <div class="signatures">

            <div class="signature">
              Olympiad Coordinator
            </div>

            <div class="signature">
              Authorized Signatory
            </div>

          </div>


        </div>

      </div>


    </body>

    </html>

  `);


  certificateWindow.document.close();

}
