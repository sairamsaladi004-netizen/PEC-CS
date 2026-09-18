import { handleRoute } from './router.js';
import { attachSearchModalEvents } from './components/searchModal.js';
import { initDB } from './db.js';
import { initAuth } from './auth.js';
import { initNotifications } from './notifications.js';

function bootstrapApp() {
  try {
    // Initialize state layers
    initDB();
    initAuth();
    initNotifications();

    // Initial Route Render
    handleRoute();

    // Attach persistent search modal events
    attachSearchModalEvents();

    // Listen to Hash Changes
    window.addEventListener("hashchange", () => {
      try {
        handleRoute();
      } catch (err) {
        console.error("Hash change error:", err);
      }
    });

    // Listen to Authentication / Persona Changes
    window.addEventListener("auth-changed", () => {
      try {
        handleRoute();
      } catch (err) {
        console.error("Auth change error:", err);
      }
    });

    // Listen to Notifications updates
    window.addEventListener("notifications-changed", () => {
      try {
        handleRoute();
      } catch (err) {
        console.error("Notification change error:", err);
      }
    });
  } catch (err) {
    console.error("Fatal initialization error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapApp);
} else {
  bootstrapApp();
}

