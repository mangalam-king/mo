MO OLYMPIAD — ONLINE EXAM FEATURE SETUP
=======================================

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
