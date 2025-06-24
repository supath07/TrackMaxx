// script.js

firebase.auth().onAuthStateChanged(user => {
  const currentPage = window.location.pathname;

  if (!user && !currentPage.includes("index.html")) {
    window.location.href = "index.html";
  } else if (user && currentPage.includes("index.html")) {
    if (user.email === "bhandarisupath199@gmail.com") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } else if (user && typeof loadDashboard === "function") {
    loadDashboard(user);
  }
});

function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      const user = firebase.auth().currentUser;
      firebase.firestore().collection("users").doc(user.uid).set({
        email: user.email
      }, { merge: true });
      window.location.href = "dashboard.html";
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
}

function logoutUser() {
  if (confirm("Are you sure you want to log out?")) {
    firebase.auth().signOut().then(() => {
      window.location.href = "index.html";
    });
  }
}

function loadDashboard(user) {
  const name = user.email.split('@')[0];
  document.getElementById("welcome-text").innerText = `Welcome, ${name}`;

  const db = firebase.firestore();
  const tasksRef = db.collection("users").doc(user.uid);

  tasksRef.get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      document.querySelectorAll("input[type='checkbox']").forEach(cb => {
        const category = cb.dataset.category;
        const task = cb.dataset.task;
        cb.checked = data[`${category}_${task}`] || false;
      });
    }
    updateProgress();
    updateStreak(user.uid);
  });

  document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", updateProgress);
  });
}

function saveTasks() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const db = firebase.firestore();
  const tasksRef = db.collection("users").doc(user.uid);

  let taskData = { email: user.email };

  document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    const category = cb.dataset.category;
    const task = cb.dataset.task;
    taskData[`${category}_${task}`] = cb.checked;
  });

  tasksRef.set(taskData, { merge: true })
    .then(() => alert("Progress saved!"));
}

function resetWeeklyTasks() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const db = firebase.firestore();
  const tasksRef = db.collection("users").doc(user.uid);

  const resetStreak = confirm("Do you also want to reset your streak?");
  const update = resetStreak
    ? { streak: 0, lastSavedDate: null }
    : {};

  document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.checked = false;
  });

  tasksRef.set(update, { merge: true }).then(() => {
    document.getElementById("progress-bar-fill").style.width = "0%";
    document.getElementById("progress-text").innerText = "0% Completed";
    showToast("🧹 Weekly reset complete" + (resetStreak ? " & streak reset." : "."));
  });
}

function updateProgress() {
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  const total = checkboxes.length;
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const percent = Math.round((checked / total) * 100);

  if (document.getElementById("progress-bar-fill")) {
    document.getElementById("progress-bar-fill").style.width = `${percent}%`;
    document.getElementById("progress-text").innerText = `${percent}% Completed`;
  }
}

function updateStreak(uid) {
  const db = firebase.firestore();
  const userRef = db.collection("users").doc(uid);

  userRef.get().then(doc => {
    if (doc.exists) {
      const lastSaved = doc.data().lastSavedDate;
      const today = new Date().toLocaleDateString();

      let streak = doc.data().streak || 0;
      if (lastSaved !== today) {
        streak += 1;
        userRef.set({ streak, lastSavedDate: today }, { merge: true });
      }

      document.getElementById("streak-count").innerText = `🔥 Current Streak: ${streak} days`;
    }
  });
}

function generateAIReport() {
  window.location.href = "report.html";
}

function loadAdminDashboard() {
  const db = firebase.firestore();
  const userStatsDiv = document.getElementById("user-stats");

  db.collection("users").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const userId = doc.id;
      const email = data.email || userId;
      const total = Object.keys(data).filter(k => k.includes("_")).length;
      const completed = Object.values(data).filter(val => val === true).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const streak = data.streak || 0;

      const block = document.createElement("div");
      block.className = "user-report";
      block.innerHTML = `
        <h2>👤 ${email}</h2>
        <p>✅ Tasks Completed: ${completed} / ${total}</p>
        <p>📊 Completion Rate: ${percent}%</p>
        <p>🔥 Streak: ${streak} days</p>
      `;

      userStatsDiv.appendChild(block);
    });
  }).catch(error => {
    console.error("Error loading admin data:", error);
    userStatsDiv.innerHTML = `<p style="color:red;">⚠️ Failed to load user data.</p>`;
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.visibility = "visible";
  toast.style.opacity = 1;
  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => {
      toast.style.visibility = "hidden";
    }, 500);
  }, 3000);
}