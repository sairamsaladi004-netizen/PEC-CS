import { getCurrentUser } from './auth.js';
import { renderNavbar, attachNavbarEvents } from './components/navbar.js';
import { renderSearchModal, attachSearchModalEvents } from './components/searchModal.js';
import { renderAuthModal, attachAuthModalEvents } from './components/authModal.js';

import { renderHomeView, attachHomeEvents } from './views/home.js';
import { renderClubsView, attachClubsEvents } from './views/clubs.js';
import { renderEventsView, attachEventsEvents } from './views/events.js';
import { renderAttendanceView, attachAttendanceEvents } from './views/attendance.js';
import { renderEventPosterView, attachEventPosterEvents } from './views/eventPoster.js';
import { renderCertificatesView, attachCertificatesEvents } from './views/certificates.js';
import { renderMembershipCardView, attachMembershipCardEvents } from './views/membershipCard.js';
import { renderAttendanceScannerView, attachAttendanceScannerEvents } from './views/attendanceScanner.js';
import { renderStudentProfileView, attachStudentProfileEvents } from './views/studentProfile.js';
import { renderProjectsView, attachProjectsEvents } from './views/projects.js';
import { renderLMSView, attachLMSEvents } from './views/lms.js';
import { renderRoadmapsView, attachRoadmapsEvents } from './views/roadmaps.js';
import { renderToolsDirectoryView, attachToolsDirectoryEvents } from './views/toolsDirectory.js';
import { renderGalleryView, attachGalleryEvents } from './views/gallery.js';
import { renderAnnouncementsView, attachAnnouncementsEvents } from './views/announcements.js';
import { renderAnalyticsView, attachAnalyticsEvents } from './views/analytics.js';
import { renderReportsView, attachReportsEvents } from './views/reports.js';
import { renderVerificationView, attachVerificationEvents } from './views/verification.js';
import { renderAdminView, attachAdminEvents } from './views/admin.js';
import { renderClubAdminDashboardView, attachClubAdminDashboardEvents } from './views/clubAdminDashboard.js';
import { renderAboutView, attachAboutEvents } from './views/about.js';
import { renderLeaderboardView, attachLeaderboardEvents } from './views/leaderboard.js';
import { renderCalendarView, attachCalendarViewEvents } from './views/calendar.js';
import { renderQuizzesView, attachQuizzesEvents } from './views/quizzes.js';
import { renderPracticeView, attachPracticeEvents } from './views/practice.js';
import { renderStudyCirclesView, attachStudyCirclesEvents } from './views/studyCircles.js';

// New Role-Specific Comprehensive Portals
import { renderLoginView, attachLoginEvents } from './views/login.js';
import { renderStudentDashboardView, attachStudentDashboardEvents } from './views/studentDashboard.js';
import { renderCoordinatorPortalView, attachCoordinatorPortalEvents } from './views/coordinatorPortal.js';
import { renderAdminPortalView, attachAdminPortalEvents } from './views/adminPortal.js';
import { renderGuestDashboardView, attachGuestDashboardEvents } from './views/guestDashboard.js';

export function parseHash() {
  const raw = window.location.hash || "#/";
  const [route, queryStr] = raw.split("?");
  const params = {};
  if (queryStr) {
    const searchParams = new URLSearchParams(queryStr);
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  }
  return { route: route || "#/", params };
}

export function handleRoute() {
  const { route, params } = parseHash();
  const appContainer = document.getElementById("app");
  if (!appContainer) return;

  // Render Core Layout Shell
  appContainer.innerHTML = `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      ${renderNavbar()}
      <main id="main-content" class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div id="view-container"></div>
      </main>
      ${renderFooter()}
      <div id="search-modal-container">${renderSearchModal()}</div>
      <div id="auth-modal-container">${renderAuthModal()}</div>
    </div>
  `;

  attachNavbarEvents();
  attachAuthModalEvents();
  attachSearchModalEvents();

  const mountPoint = document.getElementById("view-container");
  if (!mountPoint) return;

  // Window scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // 1. Dedicated Login Route
  if (route === "#/login") {
    mountPoint.innerHTML = renderLoginView();
    attachLoginEvents();
    return;
  }

  // 2. Student Portal Routes
  if (route.startsWith("#/student")) {
    const sub = route.replace("#/student/", "").replace("#/student", "");
    mountPoint.innerHTML = renderStudentDashboardView(sub || "dashboard");
    attachStudentDashboardEvents();
    return;
  }

  // 3. Coordinator Portal Routes
  if (route.startsWith("#/coordinator")) {
    const sub = route.replace("#/coordinator/", "").replace("#/coordinator", "");
    mountPoint.innerHTML = renderCoordinatorPortalView(sub || "dashboard");
    attachCoordinatorPortalEvents();
    return;
  }

  // 4. Super Admin Portal Routes
  if (route.startsWith("#/admin")) {
    const sub = route.replace("#/admin/", "").replace("#/admin", "");
    mountPoint.innerHTML = renderAdminPortalView(sub || "dashboard");
    attachAdminPortalEvents();
    return;
  }

  // Standard Routes
  switch (route) {
    case "#/":
    case "":
      {
        const user = getCurrentUser();
        const isLoggedIn = user && !user.isGuest && user.id !== "guest-001";
        if (!isLoggedIn) {
          mountPoint.innerHTML = renderLoginView();
          attachLoginEvents();
        } else {
          const role = (user.role || "").toLowerCase();
          if (role.includes("super admin")) {
            mountPoint.innerHTML = renderAdminPortalView("dashboard");
            attachAdminPortalEvents();
          } else if (role.includes("faculty") || role.includes("coordinator")) {
            mountPoint.innerHTML = renderCoordinatorPortalView("dashboard");
            attachCoordinatorPortalEvents();
          } else if (role.includes("club admin") || role.includes("leader")) {
            mountPoint.innerHTML = renderClubAdminDashboardView(params);
            attachClubAdminDashboardEvents(params);
          } else {
            mountPoint.innerHTML = renderStudentDashboardView("dashboard");
            attachStudentDashboardEvents();
          }
        }
      }
      break;

    case "#/home":
      mountPoint.innerHTML = renderHomeView();
      attachHomeEvents();
      break;

    case "#/clubs":
      mountPoint.innerHTML = renderClubsView(params);
      attachClubsEvents(params);
      break;

    case "#/events":
    case "#/event-dashboard":
      mountPoint.innerHTML = renderEventsView(params);
      attachEventsEvents(params);
      break;

    case "#/calendar":
    case "#/event-calendar":
      mountPoint.innerHTML = renderCalendarView();
      attachCalendarViewEvents();
      break;

    case "#/attendance":
      mountPoint.innerHTML = renderAttendanceView(params);
      attachAttendanceEvents(params);
      break;

    case "#/scanner":
    case "#/attendance-scanner":
    case "#/badge-scanner":
    case "#/club-admin/scanner":
      mountPoint.innerHTML = renderAttendanceScannerView(params);
      attachAttendanceScannerEvents(params);
      break;

    case "#/poster":
    case "#/event-poster":
      mountPoint.innerHTML = renderEventPosterView(params);
      attachEventPosterEvents(params);
      break;

    case "#/certificates":
      mountPoint.innerHTML = renderCertificatesView(params);
      attachCertificatesEvents(params);
      break;

    case "#/membership-card":
    case "#/badges":
    case "#/badge-generator":
    case "#/member-badge":
      mountPoint.innerHTML = renderMembershipCardView(params);
      attachMembershipCardEvents(params);
      break;

    case "#/student-profile":
      mountPoint.innerHTML = renderStudentProfileView();
      attachStudentProfileEvents();
      break;

    case "#/projects":
    case "#/hackathon":
    case "#/hackathons":
      mountPoint.innerHTML = renderProjectsView(params);
      attachProjectsEvents(params);
      break;

    case "#/lms":
      mountPoint.innerHTML = renderLMSView();
      attachLMSEvents();
      break;

    case "#/roadmaps":
      mountPoint.innerHTML = renderRoadmapsView(params);
      attachRoadmapsEvents();
      break;

    case "#/tools":
      mountPoint.innerHTML = renderToolsDirectoryView();
      attachToolsDirectoryEvents();
      break;

    case "#/gallery":
      mountPoint.innerHTML = renderGalleryView();
      attachGalleryEvents();
      break;

    case "#/announcements":
      mountPoint.innerHTML = renderAnnouncementsView();
      attachAnnouncementsEvents();
      break;

    case "#/analytics":
      mountPoint.innerHTML = renderAnalyticsView();
      attachAnalyticsEvents();
      break;

    case "#/leaderboard":
    case "#/scores":
      mountPoint.innerHTML = renderLeaderboardView();
      attachLeaderboardEvents();
      break;

    case "#/club-dashboard":
    case "#/club-analytics":
      mountPoint.innerHTML = renderClubAdminDashboardView(params);
      attachClubAdminDashboardEvents(params);
      break;

    case "#/guest":
    case "#/guest-dashboard":
      mountPoint.innerHTML = renderGuestDashboardView(params);
      attachGuestDashboardEvents();
      break;

    case "#/reports":
      mountPoint.innerHTML = renderReportsView();
      attachReportsEvents();
      break;

    case "#/verify":
    case "#/verify-certificate":
      mountPoint.innerHTML = renderVerificationView(params);
      attachVerificationEvents();
      break;

    case "#/about":
      mountPoint.innerHTML = renderAboutView();
      attachAboutEvents();
      break;

    case "#/quizzes":
    case "#/timed-quizzes":
      mountPoint.innerHTML = renderQuizzesView();
      attachQuizzesEvents();
      break;

    case "#/practice":
    case "#/problem-sets":
    case "#/compiler":
      mountPoint.innerHTML = renderPracticeView();
      attachPracticeEvents();
      break;

    case "#/study-circles":
    case "#/peer-circles":
      mountPoint.innerHTML = renderStudyCirclesView();
      attachStudyCirclesEvents();
      break;

    default:
      mountPoint.innerHTML = `
        <div class="py-20 text-center space-y-4">
          <div class="text-4xl">🔍</div>
          <h1 class="text-xl font-bold text-slate-900">Page Not Found</h1>
          <p class="text-xs text-slate-500">The requested route '${route}' does not exist in the council portal.</p>
          <a href="#/" class="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-500 transition-colors">
            Return to Dashboard
          </a>
        </div>
      `;
      break;
  }
}

function renderFooter() {
  return `
    <footer class="no-print bg-white border-t border-slate-200 mt-auto text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div class="space-y-2 md:col-span-2">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">P</div>
              <span class="font-black text-slate-900 tracking-tight text-sm">Pragati Engineering College</span>
            </div>
            <p class="text-slate-500 text-xs max-w-sm leading-relaxed">
              Unified digital management ecosystem for 35 official technical societies, Industry 4.0 clubs, accredited hackathons, and cryptographic credentials at Pragati Engineering College (Autonomous), Surampalem.
            </p>
            <div class="text-[10px] text-slate-400 font-mono">
              Accredited by NBA & NAAC 'A' Grade • Approved by AICTE • Career Guidance Cell
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Campus Portals</h4>
            <ul class="space-y-1.5 text-xs">
              <li><a href="#/login" class="hover:text-blue-600 transition-colors">🔐 Sign In / Register</a></li>
              <li><a href="#/student/dashboard" class="hover:text-blue-600 transition-colors">Student Portal</a></li>
              <li><a href="#/coordinator/dashboard" class="hover:text-blue-600 transition-colors">Faculty Coordinator Portal</a></li>
              <li><a href="#/admin/dashboard" class="hover:text-blue-600 transition-colors">Admin Governance Console</a></li>
              <li><a href="#/clubs" class="hover:text-blue-600 transition-colors">35 Official PEC Clubs</a></li>
            </ul>
          </div>

          <div class="space-y-2">
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Credential Verification</h4>
            <ul class="space-y-1.5 text-xs">
              <li><a href="#/verify" class="hover:text-blue-600 transition-colors">Verify Certificate Ledger</a></li>
              <li><a href="#/attendance" class="hover:text-blue-600 transition-colors">Gate Attendance Kiosk</a></li>
              <li><a href="#/membership-card" class="hover:text-blue-600 transition-colors">Digital ID Verification</a></li>
              <li><a href="#/reports" class="hover:text-blue-600 transition-colors">Accreditation Audit Ledger</a></li>
              <li><a href="#/about" class="hover:text-blue-600 transition-colors">About College & Council</a></li>
            </ul>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Pragati Engineering College (Autonomous), Surampalem, Andhra Pradesh. All rights reserved.
          </div>
          <div class="flex items-center space-x-4">
            <a href="#/membership-card" class="hover:text-slate-600">Digital ID</a>
            <a href="#/verify" class="hover:text-slate-600">Cryptographic Ledger</a>
            <a href="#/admin/audit-logs" class="hover:text-slate-600">Council Audit Logs</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
