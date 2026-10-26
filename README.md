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


## Online test
The custom Online Exam Manager and custom online-exam pages have been removed. Logged-in students can open the Google Forms test from their student dashboard. The test is hosted by Google Forms; its quiz settings, responses, and grading are managed in Google Forms.

## Automatic marking and one response per student account
The Google Forms quiz can automatically grade multiple-choice questions when each question has its correct answer selected and point value set. To configure the existing form (without creating a duplicate), open `google-form-settings.gs`, copy its code into the Apps Script project, run `configureExistingMOOlympiadQuiz`, and approve the requested Google permissions. This enables quiz mode, collects respondent email, and limits responses to one per Google account.

**Important:** one response is enforced by Google account, not by the website's Registration ID. Students need to sign in to Google to submit. A student could still open the public form directly if they have its URL, so this is not a secure link tied to the website login. The dashboard only displays the test button to students whose registration status is `Approved`. Check all 100 questions in the form editor and confirm each answer key/point value before publishing.

## Automatic Google Forms results inside Admin

The admin page now includes an **Online Test Submissions** panel. To connect it to your existing quiz:

1. Sign into the Google account that owns the MO Olympiad form.
2. Open `https://script.google.com/` and create a new Apps Script project.
3. Copy all code from `google-form-results.gs` into `Code.gs` (or add a script file with that exact code).
4. Click **Deploy → New deployment → Web app**.
5. Set **Execute as: Me** and **Who has access: Only myself**. Deploy and approve permissions. Do not choose public/anyone access because student scores are private.
6. Copy the deployed web-app URL ending in `/exec`.
7. In `admin.js`, replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` in `GOOGLE_RESULTS_WEB_APP_URL` with the URL you copied.
8. Upload the changed `admin.js`, `admin.html`, and `google-form-results.gs` to the website repository. The `.gs` file is for Apps Script; it does not run from GitHub Pages.
9. Sign into the website admin panel and open **Online Test Submissions**. Use **Open Results Dashboard** if the browser blocks the embedded view. The Google account that owns the Apps Script must be signed in.

The dashboard reads responses directly from the existing Google Form, displays submission time, respondent email, automatic score, answer details, and CSV export. It refreshes when you press Refresh/Reload. Scores can only be fully automatic when question answer keys and points are set in Google Forms; manually graded questions may need grading in Forms first.

**Privacy note:** Keep the Apps Script deployment restricted to **Only myself**. A public deployment could expose student emails, answers, and scores. The admin site login is a separate login; the results dashboard also checks the Google account that owns the script.
