# Quick Start Guide - Multi-User Implementation

**Goal:** Get Firebase authentication working in 30 minutes

---

## 🚀 Fastest Path to Multi-User App

### Step 1: Create Firebase Project (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name: `taskboard-lite`
4. Disable Google Analytics (optional)
5. Click "Create"

### Step 2: Enable Authentication (2 minutes)

1. In sidebar: Build → Authentication
2. Click "Get started"
3. Click "Email/Password" → Enable → Save
4. Click "Google" → Enable → Save

### Step 3: Register Web App (3 minutes)

1. Project Overview → Click Web icon `</>`
2. App nickname: "TaskBoard Web"
3. Click "Register app"
4. Copy the firebaseConfig object

### Step 4: Add Firebase to Your Project (10 minutes)

**Create:** `firebase-config.js`
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
```

**Update:** `index.html` (before `</body>`)
```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="firebase-config.js"></script>
```

### Step 5: Protect Your App (5 minutes)

**Update:** `app.js` (add at the very top)
```javascript
let currentUser = null;

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ Logged in:', user.email);
    currentUser = user;
    // Your existing code runs here
  } else {
    console.log('❌ Not logged in, redirecting...');
    window.location.href = 'auth.html';
  }
});
```

### Step 6: Create Login Page (5 minutes)

**Create:** `auth.html`
```html
<!DOCTYPE html>
<html>
<head>
  <title>Login - TaskBoard</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div style="max-width: 400px; margin: 100px auto; padding: 20px;">
    <h1>TaskBoard Login</h1>
    <input type="email" id="email" placeholder="Email" style="width: 100%; margin: 10px 0; padding: 10px;">
    <input type="password" id="password" placeholder="Password" style="width: 100%; margin: 10px 0; padding: 10px;">
    <button onclick="login()" style="width: 100%; padding: 10px;">Login</button>
    <button onclick="signup()" style="width: 100%; padding: 10px; margin-top: 10px;">Sign Up</button>
  </div>

  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script>
    async function login() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'index.html';
      } catch (error) {
        alert(error.message);
      }
    }

    async function signup() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        await auth.createUserWithEmailAndPassword(email, password);
        window.location.href = 'index.html';
      } catch (error) {
        alert(error.message);
      }
    }
  </script>
</body>
</html>
```

---

## ✅ Test It!

1. Open `index.html` → Should redirect to `auth.html`
2. Sign up with email and password
3. Get redirected to `index.html`
4. See your tasks!

**Boom! You now have multi-user authentication! 🎉**

---

## 🔜 What's Next?

Now that authentication works, you have two paths:

### Path A: Add Database (Recommended Next)
Follow **PHASE_2_DATABASE.md** to:
- Store tasks in Firestore
- Make tasks sync across devices
- Enable real-time updates

### Path B: Add Notifications (Advanced)
Follow **PHASE_3_NOTIFICATIONS.md** to:
- Set up Cloud Functions
- Send email reminders
- Add Discord/Telegram alerts

---

## 🚨 Quick Troubleshooting

**Problem:** "Firebase is not defined"
→ Check that Firebase scripts load BEFORE your app.js

**Problem:** "Cannot find module 'firebase'"
→ Using CDN links, not npm install

**Problem:** Still using localStorage
→ Normal! Phase 2 will migrate to Firestore

**Problem:** "Auth domain not authorized"
→ Add your domain in Firebase Console → Authentication → Settings → Authorized domains

---

## 📝 Security Note

Before committing to GitHub:

1. Create `.gitignore`:
   ```
   firebase-config.js
   functions/.env
   ```

2. Create `firebase-config.example.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     // ... rest of config
   };
   ```

3. Commit the `.example` file, not the real one!

---

**Time to Complete:** 30 minutes  
**Difficulty:** ⭐⭐⚪⚪⚪ Easy  
**Status:** Ready to implement!

**Questions?** Check the detailed [00_OVERVIEW.md](./00_OVERVIEW.md)

