    { id: "log-3", timestamp: "2026-09-14 09:30:12", actor: "Dr. M. S. Swaminathan (Super Admin)", action: "Updated Role", target: "Priya Patel", details: "Assigned Club Admin role for GDSC." },
    { id: "log-4", timestamp: "2026-09-12 16:45:00", actor: "System Engine", action: "Generated Certificate", target: "Aarav Sharma (AIT-CERT-K8S-2026-104)", details: "Attendance & 5-star feedback verified." },
    { id: "log-5", timestamp: "2026-09-10 18:22:15", actor: "Aarav Sharma (Student)", action: "Submitted Project", target: "AeroShield AI Drone", details: "Uploaded GitHub repo & video demo URL." }
  ],
  notifications: [
    { id: "notif-1", userId: "std-101", title: "Certificate Ready for Download", message: "Your accredited certificate for 'Kubernetes in Production' is now available in your Student Profile.", category: "Certificates", time: "2 hours ago", read: false, link: "#/student-profile" },
    { id: "notif-2", userId: "std-101", title: "ApexHacks 2026 Registration Confirmed", message: "Your ticket #TCK-APEX-042 is verified. Check-in starts at 08:30 AM at the Central Auditorium.", category: "Events", time: "Yesterday", read: false, link: "#/events" },
    { id: "notif-3", userId: "all", title: "Executive Board Nominations Open", message: "Submit your nomination for technical club executive posts before October 15.", category: "Announcements", time: "2 days ago", read: true, link: "#/announcements" }
  ]
};
// Database Access & Persistence Layer
export function getDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      saveDB(INITIAL_SEED);
      return JSON.parse(JSON.stringify(INITIAL_SEED));
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database from localStorage:", err);
    return JSON.parse(JSON.stringify(INITIAL_SEED));
  }
}
export function saveDB(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Error saving database to localStorage:", err);
  }
}
export function resetDB() {
  localStorage.removeItem(DB_KEY);
  saveDB(INITIAL_SEED);
  return JSON.parse(JSON.stringify(INITIAL_SEED));
}
export function logAudit(actor, action, target, details) {
  const db = getDB();
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
  const logEntry = {
    id: "log-" + Date.now(),
    timestamp,
    actor,
    action,
    target,
    details
  };
  db.auditLogs.unshift(logEntry);
  saveDB(db);
}
