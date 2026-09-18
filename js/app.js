import { handleRoute } from './router.js';
import { attachSearchModalEvents } from './components/searchModal.js';
import { initDB } from './db.js';
import { initAuth } from './auth.js';
import { initNotifications } from './notifications.js';

// Initialize SPA
document.addEventListener("DOMContentLoaded", () => {
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
    handleRoute();
  });

  // Listen to Authentication / Persona Changes
  window.addEventListener("auth-changed", () => {
    handleRoute();
  });

  // Listen to Notifications updates
  window.addEventListener("notifications-changed", () => {
    handleRoute();
  });
});
