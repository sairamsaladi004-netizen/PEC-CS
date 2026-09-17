import { getCurrentUser, switchUser, getAllDemoAccounts, logoutUser } from '../auth.js';
import { ROLES, normalizeRole } from '../rbac.js';
import { getNotificationsForUser, getUnreadCount } from '../notifications.js';
import { escapeHtml, sanitizeUrl } from '../utils.js';

export function renderNavbar() {
  const user = getCurrentUser() || {};
  const currentRole = normalizeRole(user.role);
  const unreadCount = getUnreadCount();
  const accounts = getAllDemoAccounts();
  const currentHash = window.location.hash || "#/";

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
                <div class="text-[10px] text-slate-400 font-medium">Technical Club Management Platform</div>
              </div>
            </a>

            <!-- Dynamic Role-Based Desktop Nav Links -->
            <nav class="hidden lg:flex items-center space-x-1 ml-4 text-xs font-semibold">
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

            <!-- Sign In / Sign Out & Profile Link -->
            ${currentRole === ROLES.GUEST ? `
              <a href="#/login" class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors flex items-center space-x-1 shrink-0">
                <span>🔐</span>
                <span class="inline">Sign In</span>
              </a>
            ` : `
              <div class="flex items-center space-x-1.5 shrink-0">
                <button id="nav-logout-btn" class="px-2 sm:px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer" title="Sign Out from Portal">
                  <span>🚪</span>
                  <span class="hidden sm:inline">Sign Out</span>
                </button>
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

        ${currentRole !== ROLES.GUEST ? `
          <div class="pt-2 border-t border-slate-800">
            <button id="mobile-logout-btn" class="w-full py-2.5 rounded-xl bg-rose-600/25 border border-rose-500/40 text-rose-300 hover:text-white font-bold flex items-center justify-center space-x-2 cursor-pointer">
              <span>🚪</span>
              <span>Sign Out from System</span>
            </button>
          </div>
        ` : ''}
      </div>
    </header>
  `;
}

// 1. Desktop Nav Generator per exact Role Specifications
function renderDesktopNavForRole(role, currentHash) {
  const norm = normalizeRole(role);

  if (norm === ROLES.SUPER_ADMIN) {
    return `
      <a href="#/admin/dashboard" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/admin') ? 'bg-rose-600 text-white' : 'text-rose-300 hover:text-white hover:bg-rose-900/40'}">🏛️ Director Portal</a>
      <a href="#/admin/dashboard?tab=users" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Users & Roles</a>
      <a href="#/clubs" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">All 35 Clubs</a>
      <a href="#/events" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Events</a>
      <a href="#/attendance" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Attendance</a>
      <a href="#/verify" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Certificates</a>
      <a href="#/reports" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Reports</a>
      <a href="#/leaderboard" class="px-2.5 py-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-900/30 font-bold">🏆 Leaderboard</a>
      <a href="#/admin/dashboard?tab=audit" class="px-2.5 py-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-900/30 font-mono text-[11px]">Audit Logs</a>
    `;
  }

  if (norm === ROLES.FACULTY_COORDINATOR) {
    return `
      <a href="#/coordinator/dashboard" class="px-2 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/coordinator') ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white hover:bg-purple-900/40'}">🎓 Faculty Portal</a>
      <a href="#/clubs" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">My Clubs</a>
      <a href="#/calendar" class="px-2 py-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-900/30 font-bold">📅 Calendar</a>
      <a href="#/quizzes" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">⏱️ Quizzes</a>
      <a href="#/practice" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">💡 Problem Sets</a>
      <a href="#/study-circles" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">👥 Peer Circles</a>
      <a href="#/attendance" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Attendance</a>
      <a href="#/reports" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Reports</a>
    `;
  }

  if (norm === ROLES.CLUB_ADMIN) {
    return `
      <a href="#/club-dashboard" class="px-2 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/club-dashboard') ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white hover:bg-blue-900/40'}">⚡ Club Dashboard</a>
      <a href="#/clubs" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">My Club</a>
      <a href="#/calendar" class="px-2 py-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-900/30 font-bold">📅 Calendar</a>
      <a href="#/quizzes" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">⏱️ Quizzes</a>
      <a href="#/practice" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">💡 Problem Sets</a>
      <a href="#/study-circles" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">👥 Peer Circles</a>
      <a href="#/attendance" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">QR Kiosk</a>
      <a href="#/projects" class="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Projects</a>
    `;
  }

  if (norm === ROLES.STUDENT) {
    return `
      <a href="#/student/dashboard" class="px-2.5 py-1.5 rounded-lg transition-colors ${currentHash.startsWith('#/student') ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white hover:bg-emerald-900/40'}">🎒 Student Portal</a>
      <a href="#/clubs" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">35 Clubs</a>
      <a href="#/events" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Events & Passes</a>
      <a href="#/calendar" class="px-2.5 py-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-900/30 font-bold">📅 Calendar</a>
      <a href="#/quizzes" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Timed Quizzes</a>
      <a href="#/practice" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Problem Sets</a>
      <a href="#/study-circles" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Peer Circles</a>
      <a href="#/student/certificates" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Certificates</a>
      <a href="#/membership-card" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Digital ID</a>
      <a href="#/leaderboard" class="px-2.5 py-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-900/30 font-bold">🏆 Leaderboard</a>
    `;
  }

  // GUEST / Public
  return `
    <a href="#/" class="px-2.5 py-1.5 rounded-lg text-white hover:bg-slate-800">Home</a>
    <a href="#/clubs" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">35 Official Clubs</a>
    <a href="#/events" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">Public Events</a>
    <a href="#/calendar" class="px-2.5 py-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-900/30 font-bold">📅 Event Calendar</a>
    <a href="#/leaderboard" class="px-2.5 py-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-900/30 font-bold">🏆 Leaderboard</a>
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
        <div class="font-bold text-slate-200 text-xs">${escapeHtml(n.title)}</div>
        <span class="text-[10px] text-slate-400 shrink-0 font-mono">${escapeHtml(n.time)}</span>
      </div>
      <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">${escapeHtml(n.message)}</p>
      ${n.link ? `
        <a href="${sanitizeUrl(n.link)}" class="notif-link inline-block mt-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-semibold" data-id="${escapeHtml(n.id)}">
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
    switcher.addEventListener("change", async (e) => {
      await switchUser(e.target.value);
      window.location.reload();
    });
  }

  const mobileSwitcher = document.getElementById("mobile-persona-select");
  if (mobileSwitcher) {
    mobileSwitcher.addEventListener("change", async (e) => {
      await switchUser(e.target.value);
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
      if (typeof window.openGlobalSearch === 'function') {
        window.openGlobalSearch();
      } else {
        const modal = document.getElementById("global-search-modal");
        if (modal) {
          modal.classList.remove("hidden");
          const input = document.getElementById("global-search-input");
          if (input) input.focus();
        }
      }
    });
  }

  // Sign Out event handlers
  const logoutBtn = document.getElementById("nav-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logoutUser();
    });
  }

  const mobileLogoutBtn = document.getElementById("mobile-logout-btn");
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener("click", async () => {
      await logoutUser();
    });
  }
}
