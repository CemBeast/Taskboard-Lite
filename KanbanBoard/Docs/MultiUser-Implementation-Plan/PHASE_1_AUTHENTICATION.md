# Phase 1: Firebase Authentication Setup

**Goal:** Enable users to create accounts and log in to access their personal task boards.

---

## 🎯 Objectives

- Set up Firebase project and SDK integration
- Implement user authentication (email/password, Google OAuth)
- Create login/signup UI
- Protect routes and data per user

---

## 📋 Step-by-Step Implementation

### Step 1.1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit https://console.firebase.google.com/
   - Click "Add project"
   - Project name: `taskboard-lite` (or your preferred name)
   - Enable Google Analytics (optional but recommended)
   - Click "Create project"

2. **Register Web App**
   - In Project Overview → Click "Web" icon (`</>`)
   - App nickname: "TaskBoard Web App"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Firebase Config**
   - Save the config object shown:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

### Step 1.2: Enable Authentication Methods

1. **Navigate to Authentication**
   - In Firebase Console → Build → Authentication
   - Click "Get started"

2. **Enable Sign-in Methods**
   - **Email/Password:**
     - Click "Email/Password" → Enable → Save
   - **Google (Recommended):**
     - Click "Google" → Enable
     - Set public-facing name: "TaskBoard Lite"
     - Choose support email
     - Save

3. **Optional: Add More Providers**
   - GitHub, Twitter, Facebook (if desired)

---

### Step 1.3: Install Firebase SDK

**Option A: CDN (Simple, for current setup)**
```html
<!-- Add to index.html before closing </body> -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
```

**Option B: NPM (For future build system)**
```bash
npm install firebase
```

---

### Step 1.4: Create Firebase Configuration File

**File:** `firebase-config.js`

```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Auth and Firestore references
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase initialized');
```

**Security Note:** 
- Create `firebase-config.example.js` with placeholder values
- Add `firebase-config.js` to `.gitignore`
- Never commit real API keys to GitHub

---

### Step 1.5: Create Authentication UI

**File:** `auth.html` (new file)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskBoard - Login</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="auth-container">
    <div class="auth-box">
      <h1>🎯 TaskBoard Lite</h1>
      <p>Organize your tasks with AI-powered priorities</p>
      
      <!-- Login Form -->
      <div id="login-form" class="auth-form">
        <h2>Sign In</h2>
        <input type="email" id="login-email" placeholder="Email">
        <input type="password" id="login-password" placeholder="Password">
        <button onclick="login()">Sign In</button>
        <button onclick="loginWithGoogle()" class="google-btn">
          Sign in with Google
        </button>
        <p>Don't have an account? <a href="#" onclick="showSignup()">Sign Up</a></p>
      </div>
      
      <!-- Signup Form -->
      <div id="signup-form" class="auth-form" style="display:none;">
        <h2>Create Account</h2>
        <input type="email" id="signup-email" placeholder="Email">
        <input type="password" id="signup-password" placeholder="Password (min 6 chars)">
        <input type="password" id="signup-confirm" placeholder="Confirm Password">
        <button onclick="signup()">Create Account</button>
        <p>Already have an account? <a href="#" onclick="showLogin()">Sign In</a></p>
      </div>
      
      <div id="error-message" class="error"></div>
    </div>
  </div>

  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script src="auth.js"></script>
</body>
</html>
```

---

### Step 1.6: Create Authentication Logic

**File:** `auth.js` (new file)

```javascript
// Show/hide forms
function showSignup() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'block';
  document.getElementById('error-message').textContent = '';
}

function showLogin() {
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('error-message').textContent = '';
}

// Sign up with email/password
async function signup() {
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  
  if (password !== confirm) {
    showError('Passwords do not match');
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }
  
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('✅ User created:', userCredential.user.uid);
    window.location.href = 'index.html';
  } catch (error) {
    showError(error.message);
  }
}

// Login with email/password
async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('✅ User logged in:', userCredential.user.uid);
    window.location.href = 'index.html';
  } catch (error) {
    showError(error.message);
  }
}

// Login with Google
async function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  try {
    const result = await auth.signInWithPopup(provider);
    console.log('✅ Google login successful:', result.user.uid);
    window.location.href = 'index.html';
  } catch (error) {
    showError(error.message);
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}
```

---

### Step 1.7: Protect Main App (index.html)

**Add to beginning of `app.js`:**

```javascript
// Check authentication state
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log('✅ User authenticated:', user.uid, user.email);
    currentUser = user;
    loadUserTasks(user.uid);
  } else {
    // User is signed out - redirect to login
    console.log('❌ No user authenticated, redirecting to login');
    window.location.href = 'auth.html';
  }
});

let currentUser = null;
```

---

### Step 1.8: Add Logout Functionality

**Add to `index.html`:**

```html
<!-- Add to header/navigation -->
<div class="user-menu">
  <span id="user-email"></span>
  <button onclick="logout()">Logout</button>
</div>
```

**Add to `app.js`:**

```javascript
// Display user email
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('user-email').textContent = user.email;
    // ... rest of authentication logic
  }
});

// Logout function
window.logout = async function() {
  try {
    await auth.signOut();
    console.log('✅ User logged out');
    window.location.href = 'auth.html';
  } catch (error) {
    console.error('❌ Logout error:', error);
    alert('Failed to logout. Please try again.');
  }
};
```

---

## 🎨 Styling Recommendations

Add authentication-specific styles to `styles.css`:

```css
/* Authentication Page */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--bg);
}

.auth-box {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  max-width: 400px;
  width: 100%;
}

.auth-form input {
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}

.google-btn {
  background: #4285F4;
  color: white;
  margin-top: 1rem;
}

.error {
  color: var(--danger);
  margin-top: 1rem;
  display: none;
}
```

---

## ✅ Testing Checklist

- [ ] Firebase project created and configured
- [ ] Authentication methods enabled in Firebase Console
- [ ] Firebase SDK loaded in HTML
- [ ] `firebase-config.js` created with correct credentials
- [ ] Signup form creates new users successfully
- [ ] Login form authenticates existing users
- [ ] Google login works (popup appears and authenticates)
- [ ] Unauthenticated users redirected to login page
- [ ] Authenticated users can access main app
- [ ] Logout button signs user out and redirects to login
- [ ] Error messages display for invalid credentials
- [ ] User email displays in app header

---

## 🚨 Common Issues & Solutions

### Issue: "Firebase is not defined"
**Solution:** Ensure Firebase scripts load before your app scripts in HTML

### Issue: "Auth domain not authorized"
**Solution:** Add your domain to Authorized domains in Firebase Console → Authentication → Settings

### Issue: Google login popup blocked
**Solution:** Check browser popup settings, try `signInWithRedirect()` instead

### Issue: "Weak password" error
**Solution:** Ensure password is at least 6 characters

---

## 📊 Success Metrics

By end of Phase 1, you should have:
- ✅ Working signup and login system
- ✅ Google OAuth integration
- ✅ Protected routes (auth required)
- ✅ User session management
- ✅ Logout functionality

---

## 🔜 Next Steps

Once Phase 1 is complete, move to:
- **Phase 2:** Firestore database setup and user-specific task storage
- **Phase 3:** Notification system (email/Discord/Telegram)
- **Phase 4:** Cloud Functions for automated notifications

---

**Document Created:** Sprint 6  
**AI Assistant:** Claude Sonnet 4.5  
**Status:** Planning Phase

