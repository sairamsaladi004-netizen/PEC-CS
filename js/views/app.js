
import { handleRoute } from './router.js';
// Initialize SPA
document.addEventListener("DOMContentLoaded", () => {
  handleRoute();
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
