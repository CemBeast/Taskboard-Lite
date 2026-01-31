# Phase 2: Firestore Database Setup

**Goal:** Store user-specific tasks in Firebase Firestore with proper security rules.

---

## 🎯 Objectives

- Set up Firestore database structure
- Migrate from localStorage to Firestore
- Implement real-time task synchronization
- Configure security rules to protect user data

---

## 📋 Step-by-Step Implementation

### Step 2.1: Enable Firestore in Firebase Console

1. **Navigate to Firestore Database**
   - Firebase Console → Build → Firestore Database
   - Click "Create database"

2. **Choose Location**
   - Select a region close to your users (e.g., `us-central1`)
   - Note: Cannot change later!

3. **Start in Test Mode** (temporarily)
   - We'll add proper security rules in Step 2.5
   - Click "Enable"

---

### Step 2.2: Design Database Structure

**Collections and Documents:**

```
users (collection)
  └─ {userId} (document)
      ├─ email: string
      ├─ displayName: string
      ├─ createdAt: timestamp
      ├─ notificationPreferences: object
      │   ├─ email: boolean
      │   ├─ discord: boolean
      │   ├─ telegram: boolean
      │   └─ reminderThreshold: number (days before due date)
      └─ prioritySettings: object
          ├─ high: number
          └─ med: number

tasks (collection)
  └─ {taskId} (document)
      ├─ userId: string (owner)
      ├─ id: number (timestamp)
      ├─ text: string
      ├─ originalText: string
      ├─ status: string ("todo" | "progress" | "done")
      ├─ priority: string ("High" | "Medium" | "Low")
      ├─ dueDate: string (YYYY-MM-DD)
      ├─ daysUntilDue: number
      ├─ createdDate: string (YYYY-MM-DD)
      ├─ completedDate: string (YYYY-MM-DD, optional)
      ├─ priorityLocked: boolean
      ├─ manualPriority: boolean
      ├─ createdAt: timestamp
      ├─ updatedAt: timestamp
      └─ notificationSent: boolean (for reminder tracking)
```

**Why This Structure:**
- ✅ Each user has their own document with settings
- ✅ Tasks are in a shared collection but filtered by `userId`
- ✅ Easy to query: "Get all tasks for user X"
- ✅ Scalable: Supports millions of users and tasks
- ✅ Timestamps for sorting and auditing

---

### Step 2.3: Create Database Helper Functions

**File:** `database.js` (new file)

```javascript
// Database helper functions for Firestore

class TaskDatabase {
  constructor() {
    this.db = firebase.firestore();
    this.userId = null;
  }

  // Initialize with current user
  setUser(userId) {
    this.userId = userId;
    console.log('📦 Database initialized for user:', userId);
  }

  // ===== USER PROFILE =====
  
  async createUserProfile(user) {
    const userRef = this.db.collection('users').doc(user.uid);
    
    // Check if profile exists
    const doc = await userRef.get();
    if (doc.exists) {
      console.log('✅ User profile already exists');
      return;
    }
    
    // Create new profile
    await userRef.set({
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      notificationPreferences: {
        email: false,
        discord: false,
        telegram: false,
        reminderThreshold: 1 // days before due date
      },
      prioritySettings: {
        high: 3,
        med: 7
      }
    });
    
    console.log('✅ User profile created');
  }

  async getUserProfile() {
    const doc = await this.db.collection('users').doc(this.userId).get();
    return doc.exists ? doc.data() : null;
  }

  async updateUserProfile(updates) {
    await this.db.collection('users').doc(this.userId).update({
      ...updates,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ User profile updated');
  }

  // ===== TASKS =====
  
  async getTasks() {
    try {
      const snapshot = await this.db.collection('tasks')
        .where('userId', '==', this.userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const tasks = [];
      snapshot.forEach(doc => {
        tasks.push({
          firestoreId: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Loaded ${tasks.length} tasks from Firestore`);
      return tasks;
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      return [];
    }
  }

  async addTask(task) {
    try {
      const taskData = {
        ...task,
        userId: this.userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        notificationSent: false
      };
      
      const docRef = await this.db.collection('tasks').add(taskData);
      console.log('✅ Task added to Firestore:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding task:', error);
      throw error;
    }
  }

  async updateTask(firestoreId, updates) {
    try {
      await this.db.collection('tasks').doc(firestoreId).update({
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Task updated in Firestore:', firestoreId);
    } catch (error) {
      console.error('❌ Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(firestoreId) {
    try {
      await this.db.collection('tasks').doc(firestoreId).delete();
      console.log('✅ Task deleted from Firestore:', firestoreId);
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  }

  // ===== REAL-TIME LISTENER =====
  
  listenToTasks(callback) {
    return this.db.collection('tasks')
      .where('userId', '==', this.userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const tasks = [];
        snapshot.forEach(doc => {
          tasks.push({
            firestoreId: doc.id,
            ...doc.data()
          });
        });
        console.log(`🔄 Real-time update: ${tasks.length} tasks`);
        callback(tasks);
      }, error => {
        console.error('❌ Real-time listener error:', error);
      });
  }
}

// Global database instance
const taskDB = new TaskDatabase();
```

---

### Step 2.4: Update app.js to Use Firestore

**Replace localStorage functions with Firestore:**

```javascript
// OLD: localStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

// NEW: Firestore
async function saveTasks() {
  // Tasks are saved individually in addTask/updateTask/deleteTask
  console.log('✅ Tasks synced to Firestore');
}

async function loadTasks() {
  if (!currentUser) return [];
  taskDB.setUser(currentUser.uid);
  return await taskDB.getTasks();
}
```

**Update task operations:**

```javascript
// Add task
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // ... existing task creation logic ...
  
  // OLD: tasks.push(newTask);
  // NEW:
  const firestoreId = await taskDB.addTask(newTask);
  newTask.firestoreId = firestoreId;
  tasks.push(newTask);
  
  render();
});

// Update task
async function moveTask(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  
  task.status = newStatus;
  if (newStatus === "done") {
    task.completedDate = new Date().toISOString().slice(0, 10);
  }
  
  // Update in Firestore
  await taskDB.updateTask(task.firestoreId, {
    status: task.status,
    completedDate: task.completedDate
  });
  
  render();
}

// Delete task
async function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task && task.firestoreId) {
    await taskDB.deleteTask(task.firestoreId);
  }
  tasks = tasks.filter(t => t.id !== id);
  render();
}
```

---

### Step 2.5: Implement Security Rules

**Navigate to Firestore → Rules**

Replace default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function: Check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read and write their own profile
      allow read, write: if isSignedIn() && isOwner(userId);
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      // Users can only read their own tasks
      allow read: if isSignedIn() && 
                     resource.data.userId == request.auth.uid;
      
      // Users can only create tasks with their own userId
      allow create: if isSignedIn() && 
                       request.resource.data.userId == request.auth.uid;
      
      // Users can only update/delete their own tasks
      allow update, delete: if isSignedIn() && 
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

**Test Security Rules:**
- Click "Rules Playground" in Firebase Console
- Simulate read/write operations
- Verify unauthorized access is blocked

---

### Step 2.6: Migrate Existing localStorage Data

**Create migration script:**

```javascript
// Run once to migrate localStorage to Firestore
async function migrateLocalStorageToFirestore() {
  const localTasks = JSON.parse(localStorage.getItem('taskboard-lite-v1') || '[]');
  
  if (localTasks.length === 0) {
    console.log('ℹ️ No local tasks to migrate');
    return;
  }
  
  console.log(`📦 Migrating ${localTasks.length} tasks from localStorage...`);
  
  for (const task of localTasks) {
    try {
      await taskDB.addTask(task);
      console.log(`✅ Migrated task: ${task.text}`);
    } catch (error) {
      console.error(`❌ Failed to migrate task: ${task.text}`, error);
    }
  }
  
  console.log('✅ Migration complete!');
  // Optionally clear localStorage after successful migration
  // localStorage.removeItem('taskboard-lite-v1');
}

// Call once after user logs in
auth.onAuthStateChanged(async (user) => {
  if (user) {
    taskDB.setUser(user.uid);
    await migrateLocalStorageToFirestore();
    // ... rest of initialization
  }
});
```

---

### Step 2.7: Add Real-Time Synchronization (Optional)

**Enable live updates across devices:**

```javascript
let unsubscribe = null;

auth.onAuthStateChanged(async (user) => {
  if (user) {
    taskDB.setUser(user.uid);
    
    // Set up real-time listener
    unsubscribe = taskDB.listenToTasks((updatedTasks) => {
      tasks = updatedTasks;
      render();
    });
  } else {
    // Clean up listener on logout
    if (unsubscribe) {
      unsubscribe();
    }
  }
});
```

**Benefits:**
- ✅ Tasks update instantly across all devices
- ✅ Multiple browser tabs stay in sync
- ✅ Collaborative editing (future feature)

---

## 🧪 Testing Checklist

- [ ] Firestore database created and enabled
- [ ] Database structure matches design document
- [ ] `database.js` created with all helper functions
- [ ] app.js updated to use Firestore instead of localStorage
- [ ] Tasks save to Firestore successfully
- [ ] Tasks load from Firestore on page load
- [ ] Task updates sync to Firestore
- [ ] Task deletion removes from Firestore
- [ ] Security rules configured and tested
- [ ] Unauthorized users cannot access other users' data
- [ ] localStorage data migrated to Firestore
- [ ] Real-time sync works across browser tabs (optional)

---

## 🚨 Common Issues & Solutions

### Issue: "Missing or insufficient permissions"
**Solution:** Check security rules, ensure `userId` field is set correctly

### Issue: "Cannot query without index"
**Solution:** Click the link in error message to create required index in Firebase Console

### Issue: Tasks duplicating on page load
**Solution:** Ensure you're not mixing localStorage and Firestore - remove localStorage code completely

### Issue: Real-time updates causing infinite loop
**Solution:** Don't call `render()` inside listener if it triggers another Firestore write

---

## 📊 Database Performance Tips

1. **Batch Writes** (for future optimization):
   ```javascript
   const batch = db.batch();
   tasks.forEach(task => {
     const ref = db.collection('tasks').doc();
     batch.set(ref, task);
   });
   await batch.commit();
   ```

2. **Pagination** (when you have 100+ tasks):
   ```javascript
   .limit(50)
   .startAfter(lastVisible)
   ```

3. **Indexes** (for complex queries):
   - Firebase will prompt you to create indexes when needed
   - Click the link in console error to auto-generate

---

## 📈 Success Metrics

By end of Phase 2, you should have:
- ✅ All tasks stored in Firestore per user
- ✅ No more localStorage dependency
- ✅ Secure data access (users can only see their own tasks)
- ✅ Tasks persist across devices
- ✅ (Optional) Real-time synchronization working

---

## 🔜 Next Steps

Once Phase 2 is complete, move to:
- **Phase 3:** Notification system setup
- **Phase 4:** Cloud Functions for automated reminders

---

**Document Created:** Sprint 6  
**AI Assistant:** Claude Sonnet 4.5  
**Status:** Planning Phase

