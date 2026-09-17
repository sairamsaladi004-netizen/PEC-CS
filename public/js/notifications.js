import { getDB, saveDB } from './db.js';
import { getCurrentUser } from './auth.js';
import { showToast } from './components/toast.js';

export function getNotificationsForUser() {
  const db = getDB();
  const user = getCurrentUser();
  if (!user) return [];
  return db.notifications.filter(n => n.userId === user.id || n.userId === "all");
}

export function getUnreadCount() {
  const list = getNotificationsForUser();
  return list.filter(n => !n.read).length;
}

export function markAsRead(notificationId) {
  const db = getDB();
  const notif = db.notifications.find(n => n.id === notificationId);
  if (notif) {
    notif.read = true;
    saveDB(db);
    window.dispatchEvent(new CustomEvent("notifications-changed"));
  }
}

export function markAllAsRead() {
  const db = getDB();
  const user = getCurrentUser();
  db.notifications.forEach(n => {
    if (n.userId === user.id || n.userId === "all") {
      n.read = true;
    }
  });
  saveDB(db);
  window.dispatchEvent(new CustomEvent("notifications-changed"));
}

export function addNotification({ userId = "all", title, message, category = "General", link = "" }) {
  const db = getDB();
  const newNotif = {
    id: "notif-" + Date.now(),
    userId,
    title,
    message,
    category,
    time: "Just now",
    read: false,
    link
  };
  db.notifications.unshift(newNotif);
  saveDB(db);
  const currentUser = getCurrentUser();
  if (userId === "all" || (currentUser && currentUser.id === userId)) {
    showToast(`${title}: ${message}`, "info");
    window.dispatchEvent(new CustomEvent("notifications-changed"));
  }
}

export function initNotifications() {
  const db = getDB();
  return db.notifications || [];
}
