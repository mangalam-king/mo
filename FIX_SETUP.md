# MO Olympiad Firebase Fix

## A. Google Admin Login

Firebase Console:
1. Open project `mo-olympiad`.
2. Go to Authentication → Sign-in method.
3. Enable **Google**.
4. Go to Authentication → Settings → Authorized domains.
5. Add the exact domain where the website is hosted, for example:
   - `mangalam-king.github.io`
   - your custom domain, if you use one.
6. Do not test the Firebase Google popup by opening `admin.html` with `file:///...`. Use GitHub Pages or a local web server.

The allowed admin email is:
`mangalamsoni70@gmail.com`

The updated admin code tries a popup first and automatically falls back to redirect when the browser blocks/closes the popup.

## B. Registration not creating ID

The updated registration code creates an ID such as:
`MO20261234`

It writes the registration to:
`registrations/{id}`

Before testing:
1. Firebase Console → Firestore Database → Create database.
2. Make sure the website's Firestore rules allow registration creation.
3. Open the browser console if it still fails. The page now displays the actual Firebase error.

## C. Student Login

Login searches Firestore for:
- `id`
- `mobile`

The registration ID shown after successful registration must be saved by the student.

## D. Important

The previous demo Firestore rules may have been changed when Google Authentication was added. Make sure the current `firestore.rules.txt` is deployed, or use rules appropriate to your final architecture.
