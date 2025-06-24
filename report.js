// report.js

firebase.auth().onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const db = firebase.firestore();
  const tasksRef = db.collection("users").doc(user.uid);

  try {
    const doc = await tasksRef.get();

    if (!doc.exists) {
      showError("No report data found.");
      return;
    }

    const data = doc.data();
    let completed = Object.values(data).filter(val => val === true).length;
    let total = Object.values(data).length;
    let percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    let summary = `**Weekly Summary for ${user.email}**\n\n`;
    summary += `✅ Tasks completed: ${completed} / ${total}\n`;
    summary += `📈 Completion rate: ${percent}%\n\n`;

    summary += `### 🔍 Breakdown by Category\n`;
    const categories = {};

    for (let key in data) {
      if (!key.includes("_")) continue;
      const [cat] = key.split("_");
      if (!categories[cat]) categories[cat] = { total: 0, done: 0 };
      categories[cat].total++;
      if (data[key] === true) categories[cat].done++;
    }

    for (let cat in categories) {
      const { total, done } = categories[cat];
      summary += `- **${cat.toUpperCase()}**: ${done}/${total} ✅\n`;
    }

    summary += `\n---\n\n`;
    if (percent >= 80) {
      summary += `🔥 Excellent work this week! Keep the momentum going.`;
    } else if (percent >= 50) {
      summary += `⚠️ You're halfway there — let's push harder next week.`;
    } else {
      summary += `📉 Time to reset and rebuild. You’ve got this!`;
    }

    renderReport(summary);
  } catch (error) {
    showError("An error occurred while generating your report.");
    console.error("Report generation error:", error);
  }
});

function renderReport(markdown) {
  const loading = document.getElementById("loading-text");
  const output = document.getElementById("report-output");

  if (loading) loading.style.display = "none";
  if (output) {
    output.style.display = "block";
    output.innerHTML = marked.parse(markdown);
  }
}

function showError(message) {
  const loading = document.getElementById("loading-text");
  const output = document.getElementById("report-output");

  if (loading) loading.style.display = "none";
  if (output) {
    output.style.display = "block";
    output.innerHTML = `<p style="color: red;">${message}</p>`;
  }
}