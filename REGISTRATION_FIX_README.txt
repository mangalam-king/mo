REGISTRATION FINAL FIX
Edited files:
1. register.html - loads register.js as type=module
2. register.js - direct Firestore setDoc, no pre-read/query
3. firestore.rules.txt - allows unauthenticated registration create

After uploading:
- Firebase Console > Firestore Database > Rules: publish firestore.rules.txt
- Ensure Firestore Database exists
- GitHub Pages: wait for deployment, then Ctrl+Shift+R
- Open register.html via the GitHub Pages URL, not file://

If it fails, the page now displays the Firebase error code.
