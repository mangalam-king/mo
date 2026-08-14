# MO Olympiad — Firebase version

This version uses your `mo-olympiad` Firebase project and **does NOT use Firebase Authentication**.

## Student login
Students log in with:
- Registration ID
- Mobile number entered during registration

Successful login opens `dashboard.html`.

## Admin
Demo admin login remains:
- Username: admin
- Password: admin123

The admin panel reads/writes Firestore registrations, results and announcements.

## Firestore collections
- `registrations`
- `results`
- `announcements`

## Important security warning
Because you requested no Firebase Authentication, the demo cannot securely identify an admin in a public website. The included rules are open so the demo works, but they are NOT suitable for sensitive/public production use. Anyone who knows the project details could potentially access Firestore through the browser.

For a real public Olympiad, use proper server-side/admin protection or Firebase Authentication later.

## Firestore setup
Create a Firestore Database in the Firebase console and publish the supplied `firestore.rules.txt` rules for this demo.
