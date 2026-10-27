# MO Olympiad — Firebase version

This version uses your `mo-olympiad` Firebase project and **does NOT use Firebase Authentication**.

## Student login
Students log in with:
- Registration ID
- Mobile number entered during registration

Successful login opens `dashboard.html`.

## Admin
Fixed admin login:
- Username: `Msadmin`
- Password: `@131313`

The admin panel reads/writes Firestore registrations, results and announcements.

**Important:** this fixed login is checked in browser JavaScript and does not create a Firebase Authentication session. The supplied `firestore.rules.txt` requires `request.auth != null` for most admin writes, so those writes will be denied under those rules. Do not make the database rules public to work around this on a public site; use a trusted server or Firebase Authentication with proper role checks for production.

## Firestore collections
- `registrations`
- `results`
- `announcements`

## Important security warning
Because you requested no Firebase Authentication, the demo cannot securely identify an admin in a public website. The included rules are open so the demo works, but they are NOT suitable for sensitive/public production use. Anyone who knows the project details could potentially access Firestore through the browser.

For a real public Olympiad, use proper server-side/admin protection or Firebase Authentication later.

## Firestore setup
Create a Firestore Database in the Firebase console and publish the supplied `firestore.rules.txt` rules for this demo.


## Exam Schedule controlled by Admin

Admin → Olympiad Settings now supports:
- Exam date
- Start time
- End time
- Exam duration
- Exam place/centre
- Centre address
- Exam instructions
- Official notice

After saving, approved applicants see the latest schedule automatically on their admit card. No manual editing of applicant admit cards is required.


### Schedule submission fix
The admin schedule form now validates the date/time/centre, saves directly to `settings/olympiad`, and displays the exact Firebase error if saving fails.


Built-in online exam: open exam-admin.html from the admin panel, create an exam, select student Registration IDs, click “Load built-in Class 3–9 bank (100 questions)”, and enable the exam. Student exams and results use Firestore, not Google Forms. Review ONLINE_EXAM_SETUP.md and firestore.exam.rules.example.txt before production use.


Built-in question library: the Online Exam Manager lets admins select Classes 3, 4, 5, 6, 7, 8 or 9 and load 100 mixed multiple-choice questions for that class. Review the questions and selected class before assigning the bank to students.
