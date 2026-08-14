# MO Olympiad Advanced Admin — Google Authentication

## 1. Enable Google sign-in
Firebase Console → Authentication → Sign-in method → Google → Enable.

## 2. Add authorized admin email
Open `admin.js` and change:
`mangalamsoni70@gmail.com`
The admin email is already configured as `mangalamsoni70@gmail.com`.

The site checks the signed-in Google email against `ADMIN_EMAILS`.

## 3. Firestore
Create/enable Firestore Database and publish `firestore.rules.txt`.

## 4. Advanced admin features
- Google sign-in/sign-out
- Admin email allowlist
- Dashboard statistics
- Search and status filtering
- Select-all and bulk approval
- Student editing
- Registration deletion
- CSV export
- Result publishing/updating
- Announcement management
- Olympiad exam settings
- Mobile responsive control center

## Security
Google authentication protects the admin UI. Keep the Firestore rules deployed and do not make admin access depend only on a hidden frontend password.
