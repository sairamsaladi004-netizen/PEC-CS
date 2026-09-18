import { getCurrentUser, switchUser, getAllDemoAccounts } from '../auth.js';
import { ROLES, normalizeRole } from '../rbac.js';
import { getNotificationsForUser, getUnreadCount } from '../notifications.js';
import { 
  isGmailConnected, 
  getConnectedGmailEmail, 
  connectGmailOAuth, 
  disconnectGmail, 
  dispatchDirectEmail, 
  promptGmailSendConfirmation 
} from '../services/gmailNotifier.js';
import { showToast } from './toast.js';

export function renderNavbar() {
  const user = getCurrentUser() || {};
  const currentRole = normalizeRole(user.role);
  const unreadCount = getUnreadCount();
  const accounts = getAllDemoAccounts();
  const currentHash = window.location.hash || "#/";
  const gmailConnected = isGmailConnected();
  const connectedEmail = getConnectedGmailEmail();

  // Badge styling per role
  const roleBadgeStyles = {
    [ROLES.SUPER_ADMIN]: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    [ROLES.FACULTY_COORDINATOR]: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    [ROLES.CLUB_ADMIN]: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    [ROLES.STUDENT]: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    [ROLES.GUEST]: "bg-slate-500/20 text-slate-300 border-slate-500/30"
  };

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
                  <span>Pragati University</span>
                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">PEC Autonomous</span>
                </div>
                ${!user.id || currentRole === ROLES.GUEST ? '<div class="text-[10px] text-slate-400 font-medium">Technical Club Management Platform</div>' : ''}
              </div>
            </a>

            <!-- Dynamic Role-Based Nav Links (Always Visible) -->
            <nav class="flex flex-wrap items-center space-x-1 ml-4 text-[10px] sm:text-xs font-semibold">
              ${renderDesktopNavForRole(currentRole, currentHash)}
            </nav>
          </div>

          <!-- Right Controls: Role Pill, Switcher, Notifs, Auth -->
          <div class="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            <!-- Active Role Indicator Pill -->
            <div class="hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded-xl border text-[11px] font-bold font-mono ${roleBadgeStyles[currentRole] || 'bg-slate-800 text-slate-300'}">
              <span class="w-1.5 h-1.5 rounded-full ${currentRole === ROLES.SUPER_ADMIN ? 'bg-rose-400' : currentRole === ROLES.FACULTY_COORDINATOR ? 'bg-purple-400' : currentRole === ROLES.CLUB_ADMIN ? 'bg-blue-400' : currentRole === ROLES.STUDENT ? 'bg-emerald-400' : 'bg-slate-400'}"></span>
              <span>${currentRole}</span>
            </div>

            <!-- Global Search Trigger -->
            <button id="nav-search-trigger" class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5 border border-slate-700/60 transition-colors">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <span class="hidden xl:inline">Search</span>
              <kbd class="hidden xl:inline-block px-1.5 py-0.5 text-[10px] bg-slate-900 text-slate-400 rounded font-mono">⌘K</kbd>
            </button>

            <!-- Notifications Bell -->
            <div class="relative">
              <button id="nav-notif-btn" class="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 relative border border-slate-700/60 transition-colors">
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

            <!-- Gmail Mail Hub Trigger -->
            <button id="nav-gmail-hub-btn" class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 relative border border-slate-700/60 transition-colors flex items-center space-x-1.5" title="${gmailConnected ? `Gmail Connected: ${connectedEmail}` : 'Connect Gmail to send real notifications'}">
              <span class="text-sm">✉️</span>
              <span class="w-2 h-2 rounded-full ${gmailConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}"></span>
              <span class="hidden xl:inline text-xs font-semibold ${gmailConnected ? 'text-emerald-300' : 'text-slate-400'}">
                ${gmailConnected ? 'Mail Live' : 'Gmail'}
              </span>
            </button>

            <!-- Role Persona Switcher (Compact Dropdown) -->
            <div class="hidden md:flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700/60 max-w-[150px] lg:max-w-xs">
              <select id="persona-switcher-select" class="bg-slate-900 text-white text-xs font-semibold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full truncate">
                ${accounts.map(acc => {
                  const accRole = normalizeRole(acc.role);
                  return `
                    <option value="${acc.id}" ${acc.id === user.id ? 'selected' : ''}>
                      ${acc.name} (${accRole})
                    </option>
                  `;
                }).join('')}
              </select>
            </div>

            <!-- Sign In / Switch Account / Profile Link -->
            ${currentRole === ROLES.GUEST ? `
              <a href="#/login" class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors flex items-center space-x-1 shrink-0">
                <span>🔐</span>
                <span class="inline">Sign In</span>
              </a>
            ` : `
              <div class="flex items-center space-x-1.5 shrink-0">
                <a href="#/login" class="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-1" title="Sign In or Switch Account">
                  <span>🔐</span>
                  <span class="hidden sm:inline">Sign In</span>
                </a>
                <a href="#/student-profile" class="flex items-center pl-0.5 group shrink-0" title="Open Profile (${user.name})">
                  <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-8 h-8 rounded-xl object-cover border border-blue-500/50 group-hover:ring-2 group-hover:ring-blue-400 transition-all" alt="${user.name}" />
                </a>
              </div>
            `}

            <!-- Mobile Menu Toggle Button -->
            <button id="mobile-menu-toggle" class="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <div id="mobile-menu" class="hidden lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-3 text-xs font-semibold">
        <div class="flex items-center justify-between py-1 border-b border-slate-800">
          <span class="text-slate-400">Current Role:</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${roleBadgeStyles[currentRole]}">${currentRole}</span>
        </div>

        <div class="grid grid-cols-2 gap-1.5 pb-2 border-b border-slate-800">
          ${renderMobileNavForRole(currentRole)}
        </div>
        
        <div class="pt-2 sm:hidden flex items-center justify-between">
          <span class="text-slate-400 text-xs">Switch Persona:</span>
          <select id="mobile-persona-select" class="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 border border-slate-700">
            ${accounts.map(acc => `
              <option value="${acc.id}" ${acc.id === user.id ? 'selected' : ''}>${acc.name} (${normalizeRole(acc.role)})</option>
            `).join('')}
          </select>
        </div>
      </div>
    </header>
  `;
}

// 1. Desktop Nav Generator per exact Role Specifications
function renderDesktopNavForRole(role, currentHash) {
  const norm = normalizeRole(role);

  if (norm === ROLES.SUPER_ADMIN) {
    return `
      <a href="#/admin/dashboard" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/admin') ? 'bg-rose-600 text-white' : 'text-rose-300 hover:text-white hover:bg-rose-900/40'}">👑 Admin Console</a>
      <a href="#/admin/dashboard?tab=users" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Users & Roles</a>
      <a href="#/clubs" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">All 35 Clubs</a>
      <a href="#/events" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Events</a>
      <a href="#/attendance" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Attendance</a>
      <a href="#/verify" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Certificates</a>
      <a href="#/reports" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Reports</a>
      <a href="#/admin/dashboard?tab=audit" class="px-2.5 py-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-900/30 font-mono text-[11px]">Audit Logs</a>
    `;
  }

  if (norm === ROLES.FACULTY_COORDINATOR) {
    return `
      <a href="#/coordinator/dashboard" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/coordinator') ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white hover:bg-purple-900/40'}">🎓 Faculty Portal</a>
      <a href="#/clubs" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">My Clubs</a>
      <a href="#/coordinator/dashboard?tab=members" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Members</a>
      <a href="#/coordinator/events" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Events & Approvals</a>
      <a href="#/attendance" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Attendance</a>
      <a href="#/coordinator/dashboard?tab=certificates" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Certificates</a>
      <a href="#/reports" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Reports</a>
      <a href="#/announcements" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Notices</a>
    `;
  }

  if (norm === ROLES.CLUB_ADMIN) {
    return `
      <a href="#/club-dashboard" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/club-dashboard') ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white hover:bg-blue-900/40'}">⚡ Club Dashboard</a>
      <a href="#/clubs" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">My Club</a>
      <a href="#/attendance" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">QR Kiosk</a>
      <a href="#/projects" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Projects</a>
      <a href="#/quizzes" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Quizzes</a>
      <a href="#/practice" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Practice</a>
      <a href="#/study-circles" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Study Circles</a>
      <a href="#/announcements" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Notices</a>
    `;
  }

  if (norm === ROLES.STUDENT) {
    return `
      <a href="#/student/dashboard" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/student') ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white hover:bg-emerald-900/40'}">🎒 Student Portal</a>
      <a href="#/clubs" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">35 Clubs</a>
      <a href="#/events" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Events & Passes</a>
      <a href="#/quizzes" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Timed Quizzes</a>
      <a href="#/practice" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Problem Sets</a>
      <a href="#/study-circles" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Peer Circles</a>
      <a href="#/student/certificates" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Certificates</a>
      <a href="#/membership-card" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Digital ID</a>
    `;
  }

  // GUEST / Public
  return `
    <a href="#/" class="px-2.5 py-1.5 rounded-lg text-white hover:bg-slate-800">Home</a>
    <a href="#/clubs" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">35 Official Clubs</a>
    <a href="#/events" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Public Events</a>
    <a href="#/announcements" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Public Notices</a>
    <a href="#/verify" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Verify Credential</a>
    <a href="#/about" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">About PEC</a>
  `;
}

// 2. Mobile Nav Generator
function renderMobileNavForRole(role) {
  const norm = normalizeRole(role);

  if (norm === ROLES.SUPER_ADMIN) {
    return `
      <a href="#/admin/dashboard" class="px-3 py-2 rounded-lg bg-rose-600 text-white font-bold">👑 Admin Console</a>
      <a href="#/admin/dashboard?tab=users" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Users & Roles</a>
      <a href="#/clubs" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">All 35 Clubs</a>
      <a href="#/events" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Events Management</a>
      <a href="#/attendance" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Attendance Hub</a>
      <a href="#/admin/dashboard?tab=audit" class="px-3 py-2 rounded-lg bg-slate-800 text-amber-300 font-mono">Audit Logs</a>
      <a href="#/reports" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">System Reports</a>
      <a href="#/admin/dashboard?tab=settings" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">System Settings</a>
    `;
  }

  if (norm === ROLES.FACULTY_COORDINATOR) {
    return `
      <a href="#/coordinator/dashboard" class="px-3 py-2 rounded-lg bg-purple-600 text-white font-bold">🎓 Faculty Portal</a>
      <a href="#/clubs" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">My Assigned Clubs</a>
      <a href="#/coordinator/dashboard?tab=members" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Review Members</a>
      <a href="#/coordinator/events" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Event Approvals</a>
      <a href="#/attendance" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Attendance Kiosk</a>
      <a href="#/coordinator/dashboard?tab=certificates" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Issue Certificates</a>
      <a href="#/reports" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Club Reports</a>
      <a href="#/announcements" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Announcements</a>
    `;
  }

  if (norm === ROLES.CLUB_ADMIN) {
    return `
      <a href="#/club-dashboard" class="px-3 py-2 rounded-lg bg-blue-600 text-white font-bold">⚡ Club Admin</a>
      <a href="#/clubs" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">My Club Chapter</a>
      <a href="#/club-dashboard" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Member Roster</a>
      <a href="#/coordinator/events" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Create Event</a>
      <a href="#/attendance" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Live QR Attendance</a>
      <a href="#/projects" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Club Projects</a>
      <a href="#/lms" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Resources</a>
      <a href="#/student-profile" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">My Profile</a>
    `;
  }

  if (norm === ROLES.STUDENT) {
    return `
      <a href="#/student/dashboard" class="px-3 py-2 rounded-lg bg-emerald-600 text-white font-bold">🎒 Student Portal</a>
      <a href="#/clubs" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">35 Clubs</a>
      <a href="#/events" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Events & Passes</a>
      <a href="#/student/attendance" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">My Attendance</a>
      <a href="#/student/certificates" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">My Certificates</a>
      <a href="#/membership-card" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Digital ID Card</a>
      <a href="#/projects" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Club Projects</a>
      <a href="#/student-profile" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Student Profile</a>
    `;
  }

  // GUEST
  return `
    <a href="#/login" class="px-3 py-2 rounded-lg bg-blue-600 text-white font-bold">🔐 Sign In / Register</a>
    <a href="#/" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Home</a>
    <a href="#/clubs" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">35 Official Clubs</a>
    <a href="#/events" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Public Events</a>
    <a href="#/verify" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">Verify Credential</a>
    <a href="#/about" class="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">About Pragati</a>
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
      window.location.reload();
    });
  }

  const mobileSwitcher = document.getElementById("mobile-persona-select");
  if (mobileSwitcher) {
    mobileSwitcher.addEventListener("change", (e) => {
      switchUser(e.target.value);
      window.location.reload();
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

  // Notifications toggle
  const notifBtn = document.getElementById("nav-notif-btn");
  const notifDropdown = document.getElementById("nav-notif-dropdown");
  const markAllBtn = document.getElementById("mark-all-read-btn");

  if (markAllBtn) {
    markAllBtn.addEventListener("click", () => {
      markAllAsRead();
      window.location.reload();
    });
  }

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.add("hidden");
      }
    });
  }

  // Search shortcut
  const searchTrigger = document.getElementById("nav-search-trigger");
  if (searchTrigger) {
    searchTrigger.addEventListener("click", () => {
      const searchModal = document.getElementById("search-modal");
      if (searchModal) {
        searchModal.classList.remove("hidden");
        const input = document.getElementById("search-input");
        if (input) input.focus();
      }
    });
  }

  // Gmail Mail Hub modal trigger
  const gmailHubBtn = document.getElementById("nav-gmail-hub-btn");
  if (gmailHubBtn) {
    gmailHubBtn.addEventListener("click", () => {
      openNavbarGmailHubModal();
    });
  }
}

function openNavbarGmailHubModal() {
  const existing = document.getElementById("navbar-gmail-hub-modal");
  if (existing) existing.remove();

  const connected = isGmailConnected();
  const email = getConnectedGmailEmail();

  const modal = document.createElement("div");
  modal.id = "navbar-gmail-hub-modal";
  modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-in fade-in duration-200";

  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-lg font-bold">
            ✉️
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900">Gmail Notification Dispatcher</h3>
            <p class="text-xs text-slate-500">Real email broadcasts via Google Workspace API</p>
          </div>
        </div>
        <button id="close-gmail-hub-btn" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">✕</button>
      </div>

      <!-- Live Connection Status Card -->
      <div class="p-4 rounded-2xl border ${connected ? 'bg-emerald-50/80 border-emerald-200' : 'bg-slate-50 border-slate-200'} space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}"></span>
            <span class="text-xs font-bold ${connected ? 'text-emerald-900' : 'text-slate-700'}">
              ${connected ? 'Gmail Workspace Connected' : 'Gmail Not Authorized'}
            </span>
          </div>
          ${connected ? `
            <button id="hub-disconnect-gmail-btn" class="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline">
              Disconnect
            </button>
          ` : ''}
        </div>

        ${connected ? `
          <div class="text-xs text-slate-600 space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-500">Authorized Account:</span>
              <span class="font-mono text-emerald-800 font-bold">${email}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Dispatch Permissions:</span>
              <span class="font-mono text-slate-700 text-[10px]">gmail.send (Direct API)</span>
            </div>
          </div>
        ` : `
          <p class="text-xs text-slate-600 leading-relaxed">
            Authorize your Google account to enable sending real email notifications for event registration tickets, accredited certificates, and official circular broadcasts.
          </p>
          <button id="hub-connect-gmail-btn" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span>Authorize Google Workspace Account</span>
          </button>
        `}
      </div>

      <!-- Quick Test / Direct Real Email Dispatch Form -->
      <form id="hub-quick-email-form" class="space-y-3.5 pt-1">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-black text-slate-800">🚀 Send Real Test Notification</label>
          <span class="text-[10px] text-blue-600 font-bold">Instant Delivery</span>
        </div>

        <div class="space-y-2.5 text-xs">
          <div>
            <label class="block text-slate-600 font-semibold mb-1">Recipient Email</label>
            <input type="email" id="hub-to-email" required value="sairamsaladi004@gmail.com" placeholder="student@pragati.ac.in" class="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">Subject</label>
            <input type="text" id="hub-subject" required value="[PEC CampusTech] Live Email Notification System Operational" class="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">Email Message Content</label>
            <textarea id="hub-message" rows="3" required class="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed">Greetings from Pragati Engineering College CampusTech! Real-time email notifications for technical events, official circulars, and accredited certificates are now live via Google Workspace Gmail API integration.</textarea>
          </div>
        </div>

        <button type="submit" id="hub-send-email-btn" class="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2">
          <span>📨 Send Real Email via Gmail</span>
        </button>
      </form>

      <!-- Quick Shortcuts -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <a href="#/announcements" class="text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1">
          <span>📢 Notice Circulars Hub →</span>
        </a>
        <a href="#/certificates" class="text-purple-600 hover:text-purple-700 font-bold flex items-center space-x-1">
          <span>🎓 Certificates Ledger →</span>
        </a>
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  const closeBtn = document.getElementById("close-gmail-hub-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => modal.remove());
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  // Connect button handler
  const connectBtn = document.getElementById("hub-connect-gmail-btn");
  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      try {
        connectBtn.disabled = true;
        connectBtn.textContent = "Connecting to Google...";
        await connectGmailOAuth();
        modal.remove();
        openNavbarGmailHubModal();
      } catch (err) {
        connectBtn.disabled = false;
        connectBtn.textContent = "Authorize Google Workspace Account";
      }
    });
  }

  // Disconnect button handler
  const disconnectBtn = document.getElementById("hub-disconnect-gmail-btn");
  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", () => {
      disconnectGmail();
      modal.remove();
      openNavbarGmailHubModal();
    });
  }

  // Send form handler
  const form = document.getElementById("hub-quick-email-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const toEmail = document.getElementById("hub-to-email").value.trim();
      const subject = document.getElementById("hub-subject").value.trim();
      const message = document.getElementById("hub-message").value.trim();

      if (!toEmail || !subject || !message) {
        showToast("Missing Fields", "Please complete all email fields.", "warning");
        return;
      }

      // If not connected, connect first
      if (!isGmailConnected()) {
        showToast("Authorization Required", "Please authorize your Google account first.", "info");
        try {
          await connectGmailOAuth();
        } catch {
          return;
        }
      }

      // Workspace safety confirmation dialog
      promptGmailSendConfirmation({
        title: "Confirm Real Gmail Send",
        subject: subject,
        recipient: toEmail,
        detailsHtml: `
          <div class="flex justify-between items-start text-slate-600 pt-1 border-t border-slate-200">
            <span class="font-bold text-slate-900">Message Preview:</span>
            <span class="text-slate-700 italic max-w-[200px] truncate text-[11px]">${message}</span>
          </div>
        `,
        onConfirm: async () => {
          try {
            const sendBtn = document.getElementById("hub-send-email-btn");
            if (sendBtn) {
              sendBtn.disabled = true;
              sendBtn.textContent = "Dispatching via Gmail API...";
            }
            const res = await dispatchDirectEmail({
              toEmail,
              subject,
              message,
              recipientName: toEmail.split("@")[0]
            });
            showToast("Real Email Sent!", `Message delivered to ${toEmail} (ID: ${res.messageId.slice(0, 10)}...)`, "success");
            modal.remove();
          } catch (err) {
            showToast("Send Failed", err.message, "error");
          }
        }
      });
    });
  }
}

