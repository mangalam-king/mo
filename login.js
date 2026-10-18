// login.js - Complete updated file with fixed admin login support

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form') || document.querySelector('form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Locate input fields dynamically to match existing UI without alterations
            const emailOrUserEl = document.getElementById('email') || document.getElementById('username') || document.querySelector('input[type="email"], input[type="text"]');
            const passwordEl = document.getElementById('password') || document.querySelector('input[type="password"]');
            
            if (!emailOrUserEl || !passwordEl) return;
            
            const identifier = emailOrUserEl.value.trim();
            const password = passwordEl.value;
            
            // ==========================================
            // FIXED ADMIN CREDENTIALS BYPASS
            // ==========================================
            if (identifier === 'Msadmin' && password === '@131313') {
                // Set session storage / local storage flags for admin access
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('user', JSON.stringify({
                    username: 'Msadmin',
                    role: 'admin'
                }));
                
                // Redirect directly to the admin panel without hitting the user database
                window.location.href = 'admin.html';
                return;
            }
            
            // ==========================================
            // EXISTING REGULAR USER AUTHENTICATION FLOW
            // ==========================================
            try {
                // If Firebase Auth is configured in your project
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    await firebase.auth().signInWithEmailAndPassword(identifier, password);
                    window.location.href = 'dashboard.html';
                } else {
                    // Fallback for custom backend authentication if present
                    const submitButton = loginForm.querySelector('button[type="submit"]');
                    if (submitButton) submitButton.disabled = true;
                    
                    // Trigger any existing submit handlers or standard flow
                    console.log('Processing standard user login...');
                }
            } catch (error) {
                console.error('Authentication error:', error);
                alert(error.message || 'Invalid login credentials. Please try again.');
                
                const submitButton = loginForm.querySelector('button[type="submit"]');
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
});
