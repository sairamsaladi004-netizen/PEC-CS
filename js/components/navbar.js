import { getCurrentUser, switchUser, getAllDemoAccounts } from '../auth.js';
import { getNotificationsForUser, getUnreadCount, markAsRead, markAllAsRead } from '../notifications.js';

export function renderNavbar() {
  const user = getCurrentUser() || {};
  const unreadCount = getUnreadCount();
  const accounts = getAllDemoAccounts();
  const currentHash = window.location.hash || "#/";

  return `
    <header class="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Logo & Brand -->
          <div class="flex items-center space-x-3">
            <a href="#/" class="flex items-center space-x-2.5 group">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-base shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                P
              </div>
              <div>
                <div class="text-sm font-black tracking-tight leading-none flex items-center space-x-1.5">
                  <span>PEC CampusTech</span>
                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">CSE</span>
                </div>
                <div class="text-[10px] text-slate-400 font-medium">Technical Societies Council</div>
              </div>
            </a>

            <!-- Desktop Nav Links -->
            <nav class="hidden xl:flex items-center space-x-1 ml-6 text-xs font-semibold">
              <a href="#/clubs" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/clubs') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">Clubs</a>
              <a href="#/events" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/events') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">Events</a>
              <a href="#/roadmaps" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/roadmaps') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">Roadmaps</a>
              <a href="#/projects" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/projects') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">Projects</a>
              <a href="#/lms" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/lms') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">LMS Hub</a>
              <a href="#/tools" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/tools') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">Tools</a>
              <a href="#/gallery" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/gallery') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">Gallery</a>
              <a href="#/announcements" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/announcements') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">Notices</a>
              <a href="#/analytics" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/analytics') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">Analytics</a>
              <a href="#/verify" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/verify') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">Verify</a>
              <a href="#/club-dashboard" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/club-dashboard') ? 'bg-amber-600 text-white' : 'text-amber-300 hover:text-white hover:bg-amber-900/40'}">Club Admin</a>
              ${user.role === 'Super Admin' || user.role === 'Department Admin' ? `
                <a href="#/admin" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/admin') ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white hover:bg-indigo-900/40'}">Admin</a>
              ` : ''}
            </nav>
          </div>

          <!-- Right Controls: Search, Notifications, Persona Switcher, Profile -->
          <div class="flex items-center space-x-2.5">
            
            <!-- Global Search Trigger -->
            <button id="nav-search-trigger" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5 border border-slate-700/60 transition-colors">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <span class="hidden sm:inline">Search</span>
              <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-900 text-slate-400 rounded font-mono">⌘K</kbd>
            </button>

            <!-- Notifications Bell -->
            <div class="relative">
              <button id="nav-notif-btn" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 relative border border-slate-700/60 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                ${unreadCount > 0 ? `
                  <span class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                    ${unreadCount}
                  </span>
                ` : ''}
              </button>

              <!-- Notifications Dropdown -->
              <div id="nav-notif-dropdown" class="hidden absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div class="p-3.5 border-b border-slate-800 flex items-center justify-between">
                  <div class="text-xs font-bold text-white">Notifications</div>
                  <button id="mark-all-read-btn" class="text-[10px] text-blue-400 hover:text-blue-300 font-semibold">Mark all read</button>
                </div>
                <div class="max-h-64 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                  ${renderNotifList()}
                </div>
              </div>
            </div>

            <!-- Auth / Single Sign-On Modal Trigger -->
            <button id="nav-auth-modal-btn" class="px-2.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-bold border border-blue-500/40 transition-colors flex items-center space-x-1" title="PEC Single Sign-On & Account Management">
              <span>🔐</span>
              <span class="hidden md:inline">Auth / Roles</span>
            </button>

            <!-- Role Persona Switcher -->
            <div class="hidden sm:flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700/60">
              <span class="text-[10px] uppercase font-bold text-slate-400 px-2">Role</span>
              <select id="persona-switcher-select" class="bg-slate-900 text-white text-xs font-semibold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                ${accounts.map(acc => `
                  <option value="${acc.id}" ${acc.id === user.id ? 'selected' : ''}>
                    ${acc.name} (${acc.role})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- User Avatar & Profile Quick Links -->
            <a href="#/student-profile" class="flex items-center space-x-2 pl-1 group" title="Open Student Profile">
              <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-8 h-8 rounded-xl object-cover border border-blue-500/50 group-hover:ring-2 group-hover:ring-blue-400 transition-all" />
            </a>

            <!-- Mobile Menu Toggle Button -->
            <button id="mobile-menu-toggle" class="xl:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <div id="mobile-menu" class="hidden xl:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2 text-xs font-semibold">
        <div class="grid grid-cols-2 gap-1.5 pb-2 border-b border-slate-800">
          <a href="#/clubs" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Clubs</a>
          <a href="#/events" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Events</a>
          <a href="#/roadmaps" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Roadmaps</a>
          <a href="#/projects" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Projects</a>
          <a href="#/lms" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">LMS Hub</a>
          <a href="#/tools" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Tools</a>
          <a href="#/gallery" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Gallery</a>
          <a href="#/announcements" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Notices</a>
          <a href="#/analytics" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Analytics</a>
          <a href="#/club-dashboard" class="px-3 py-2 rounded-lg bg-amber-600/30 text-amber-300 font-bold border border-amber-500/30">Club Admin Dashboard</a>
          <a href="#/membership-card" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Digital ID Card</a>
          <a href="#/attendance" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">QR Kiosk</a>
          <a href="#/event-poster" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Poster Studio</a>
          <a href="#/reports" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Accreditation</a>
          <a href="#/verify" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Verify QR</a>
          <a href="#/about" class="px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200">Secretariat</a>
        </div>
        
        <div class="pt-2 sm:hidden flex items-center justify-between">
          <span class="text-slate-400">Switch Persona:</span>
          <select id="mobile-persona-select" class="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 border border-slate-700">
            ${accounts.map(acc => `
              <option value="${acc.id}" ${acc.id === user.id ? 'selected' : ''}>${acc.name} (${acc.role})</option>
            `).join('')}
          </select>
        </div>
      </div>
    </header>
  `;
}

function renderNotifList() {
  const notifs = getNotificationsForUser();
  if (notifs.length === 0) {
    return `<div class="p-4 text-center text-slate-500 text-xs">No notifications yet.</div>`;
  }
  return notifs.map(n => `
    <div class="p-3 hover:bg-slate-800/60 transition-colors ${!n.read ? 'bg-blue-950/20' : ''}">
      <div class="flex items-start justify-between gap-2">
        <div class="font-bold text-slate-200 text-xs">${n.title}</div>
        <span class="text-[10px] text-slate-400 shrink-0 font-mono">${n.time}</span>
      </div>
      <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">${n.message}</p>
      ${n.link ? `
        <a href="${n.link}" class="notif-link inline-block mt-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-semibold" data-id="${n.id}">
          View details →
        </a>
      ` : ''}
    </div>
  `).join('');
}

export function attachNavbarEvents() {
  // Persona switcher
  const switcher = document.getElementById("persona-switcher-select");
  if (switcher) {
    switcher.addEventListener("change", (e) => {
      switchUser(e.target.value);
    });
  }

  const mobileSwitcher = document.getElementById("mobile-persona-select");
  if (mobileSwitcher) {
    mobileSwitcher.addEventListener("change", (e) => {
      switchUser(e.target.value);
    });
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Notifications dropdown toggle
  const notifBtn = document.getElementById("nav-notif-btn");
  const notifDropdown = document.getElementById("nav-notif-dropdown");
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
        notifDropdown.classList.add("hidden");
      }
    });
  }

  // Mark all notifications read
  const markAllBtn = document.getElementById("mark-all-read-btn");
  if (markAllBtn) {
    markAllBtn.addEventListener("click", () => {
      markAllAsRead();
      if (notifDropdown) notifDropdown.classList.add("hidden");
    });
  }

  // Notification link click
  document.querySelectorAll(".notif-link").forEach(link => {
    link.addEventListener("click", (e) => {
      const notifId = e.currentTarget.dataset.id;
      if (notifId) markAsRead(notifId);
      if (notifDropdown) notifDropdown.classList.add("hidden");
    });
  });

  // Global search trigger
  const searchTrigger = document.getElementById("nav-search-trigger");
  if (searchTrigger) {
    searchTrigger.addEventListener("click", () => {
      const modal = document.getElementById("global-search-modal");
      if (modal) {
        modal.classList.remove("hidden");
        const input = document.getElementById("global-search-input");
        if (input) input.focus();
      }
    });
  }

  // Auth modal trigger
  const authModalBtn = document.getElementById("nav-auth-modal-btn");
  if (authModalBtn) {
    authModalBtn.addEventListener("click", () => {
      const modal = document.getElementById("auth-modal");
      if (modal) modal.classList.remove("hidden");
    });
  }
}
