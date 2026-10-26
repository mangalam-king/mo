MO OLYMPIAD — BUILT-IN ONLINE EXAM SETUP
========================================

The exam is part of the website and uses Firebase/Firestore; it does not need Google Forms or Apps Script. The Online Exam Manager includes a built-in Class 7 mixed Olympiad bank of 100 multiple-choice questions.

ADMIN WORKFLOW
1. Sign in on admin.html with the authorized admin account.
2. Open Online Exam Manager. Create an exam, set start/end time, duration, marks, and choose Live now or Scheduled. Keep one attempt enabled (the code enforces singleAttempt=true for new exams).
3. In Assign Questions, select the exam and choose “One question set → selected students”.
4. Enter the exact student Registration ID(s), comma-separated for multiple students.
5. Click “Load built-in Class 7 bank (100 questions)”, then “Enable exam for selected student(s)”.
6. Student signs in as usual, opens Student Dashboard → Online Exam, and takes the assigned exam.
7. Submission and status appear in the admin exam manager; click Grade or Grade pending submissions to calculate marks, then Publish results to show results to students.

ONE-ATTEMPT BEHAVIOUR
The website uses a deterministic submission document per exam/student and blocks reopening submitted attempts in the student interface. An administrator can still use the explicit Reopen attempt control if a retake is intentionally authorized.


New files:
- exam-admin.html / exam-admin.js: exam creation, individual assignments, shared-set assignments, bulk per-student assignments, exam controls, attempt monitoring, grading, CSV export.
- online-exam.html / online-exam.js: student exam list, timer, question palette, previous/next, mark-for-review, autosave, recovery after refresh, auto-submit, tab-switch counter.

Firestore collections used:
- exams: exam settings and state
- examAssignments: per-student question text and options (no answer key)
- examKeys: correct option indexes and explanations; admin grading only
- examSubmissions: saved attempts and grades

Question JSON example (correctIndex is zero-based):
[
  {"text":"What is 2 + 2?","options":["2","3","4","5"],"correctIndex":2,"explanation":"2 + 2 = 4"}
]

Bulk assignment JSON example:
[
  {"studentId":"MO123","questions":[{"text":"2+2?","options":["2","3","4","5"],"correctIndex":2,"explanation":"2+2=4"}]},
  {"studentId":"MO124","questions":[{"text":"Capital of India?","options":["Mumbai","New Delhi","Kolkata","Chennai"],"correctIndex":1,"explanation":"New Delhi is India's capital."}]}
]

IMPORTANT SECURITY LIMITATION
----------------------------
The existing student login stores a Registration ID in sessionStorage; it does not create a verified Firebase Authentication identity. Firestore rules cannot securely distinguish students based on sessionStorage. Therefore, do NOT enable public reads on examAssignments or examSubmissions for a real live exam: a student could potentially enumerate another student's assignment/submission. This client-only version deliberately keeps answer keys separate, but secure per-student access and trusted automatic grading require a verified student auth/custom-token flow plus a trusted backend (for example, a callable Cloud Function). The exam UI and admin grading workflow are included, but do not describe this as anti-cheat-proof or production-secure until that backend is deployed.

The existing Firestore rules in firestore.rules.txt have broad reads/writes and are not suitable for a real exam. Review them before deployment; do not blindly replace rules without matching the rest of your app's collections and features.
