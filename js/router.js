import { renderNavbar, attachNavbarEvents } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderSearchModal } from './components/searchModal.js';
import { renderAuthModal, attachAuthModalEvents } from './components/authModal.js';

import { renderHomeView, attachHomeEvents } from './views/home.js';
import { renderClubsView, attachClubsEvents } from './views/clubs.js';
import { renderEventsView, attachEventsEvents } from './views/events.js';
import { renderAttendanceView, attachAttendanceEvents } from './views/attendance.js';
import { renderEventPosterView, attachEventPosterEvents } from './views/eventPoster.js';
import { renderCertificatesView, attachCertificatesEvents } from './views/certificates.js';
import { renderMembershipCardView, attachMembershipCardEvents } from './views/membershipCard.js';
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
import { renderClubDashboardView, attachClubDashboardEvents } from './views/clubDashboard.js';
import { renderAboutView, attachAboutEvents } from './views/about.js';
import { renderQuizzesView, attachQuizzesEvents } from './views/quizzes.js';
import { renderPracticeView, attachPracticeEvents } from './views/practice.js';
import { renderStudyCirclesView, attachStudyCirclesEvents } from './views/studyCircles.js';

// New Role-Specific Comprehensive Portals
import { renderLoginView, attachLoginEvents } from './views/login.js';
import { renderAuthCallbackView, attachAuthCallbackEvents } from './views/authCallback.js';
import { renderStudentDashboardView, attachStudentDashboardEvents } from './views/studentDashboard.js';
import { renderCoordinatorPortalView, attachCoordinatorPortalEvents } from './views/coordinatorPortal.js';
import { renderDepartmentPortalView, attachDepartmentPortalEvents } from './views/departmentPortal.js';
import { renderAdminPortalView, attachAdminPortalEvents } from './views/adminPortal.js';
import { renderGuestDashboardView, attachGuestDashboardEvents } from './views/guestDashboard.js';

export function parseHash() {
  let raw = window.location.hash || "";

  // If hash is empty, check query parameters (e.g. ?appParams=%2Fclub-dashboard or ?route=...)
  if (!raw || raw === "#" || raw === "#/") {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const appParams = urlParams.get("appParams") || urlParams.get("route") || urlParams.get("path");
      if (appParams) {
        let decoded = decodeURIComponent(appParams);
        if (decoded.includes("%")) {
          try { decoded = decodeURIComponent(decoded); } catch {}
        }
        raw = decoded;
      } else if (window.location.pathname && window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
        raw = window.location.pathname;
      }
    } catch {}
  }

  // Normalize string
  raw = (raw || "#/").trim();

  // Handle URL encodings
  try {
    if (raw.includes("%252F") || raw.includes("%2F") || raw.includes("%20")) {
      raw = decodeURIComponent(raw);
      if (raw.includes("%2F")) raw = decodeURIComponent(raw);
    }
  } catch {}

  // Strip leading slashes before # if present (e.g. /#/club-dashboard -> #/club-dashboard)
  if (raw.startsWith("/#")) {
    raw = raw.substring(1);
  } else if (raw.startsWith("/") && !raw.startsWith("/#")) {
    raw = "#" + raw;
  }

  if (!raw.startsWith("#")) {
    raw = "#/" + raw.replace(/^\/+/, "");
  }

  const [routePart, queryStr] = raw.split("?");
  const params = {};

  // Extract query parameters
  try {
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams.entries()) {
      if (key !== "appParams" && key !== "route") {
        params[key] = value;
      }
    }
  } catch {}

  if (queryStr) {
    try {
      const hashParams = new URLSearchParams(queryStr);
      for (const [key, value] of hashParams.entries()) {
        params[key] = value;
      }
    } catch {}
  }

  // Normalize clean route
  let cleanRoute = routePart.trim();
  if (cleanRoute.length > 2 && cleanRoute.endsWith("/")) {
    cleanRoute = cleanRoute.slice(0, -1);
  }

  return { route: cleanRoute || "#/", params };
}

export function handleRoute() {
  const { route, params } = parseHash();
  const appContainer = document.getElementById("app");
  if (!appContainer) return;

  // Render Core Layout Shell
  try {
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
  } catch (layoutErr) {
    console.error("Layout rendering error:", layoutErr);
    appContainer.innerHTML = `
      <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800 p-6">
        <div class="max-w-4xl mx-auto my-auto text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl mx-auto flex items-center justify-center">P</div>
          <h1 class="text-xl font-black text-slate-900">CampusTech - Pragati Engineering College</h1>
          <p class="text-xs text-slate-500">Recovering portal view...</p>
          <a href="#/" class="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">Reload Portal Home</a>
        </div>
      </div>
    `;
  }

  const mountPoint = document.getElementById("view-container");
  if (!mountPoint) return;

  // Window scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Safe router execution helper
  const renderSafe = (renderFn, attachFn) => {
    try {
      mountPoint.innerHTML = renderFn();
    } catch (err) {
      console.error("View render error:", err);
      mountPoint.innerHTML = `
        <div class="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-3">
          <div class="text-3xl">⚠️</div>
          <h2 class="text-base font-bold text-slate-900">Portal View Initialization</h2>
          <p class="text-xs text-slate-500">Failed to render requested component. You can return to the central dashboard.</p>
          <div class="pt-2 flex justify-center space-x-2">
            <a href="#/" class="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">Portal Home</a>
            <a href="#/login" class="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl">Sign In</a>
          </div>
        </div>
      `;
      return;
    }

    if (attachFn) {
      try {
        attachFn();
      } catch (err) {
        console.error("View attach events error:", err);
      }
    }
  };

  // 1. Dedicated Login & OAuth Callback Routes
  if (route === "#/login") {
    renderSafe(() => renderLoginView(), () => attachLoginEvents());
    return;
  }

  if (route.startsWith("#/auth/callback") || route.startsWith("#/callback") || window.location.hash.includes("access_token=")) {
    renderSafe(() => renderAuthCallbackView(), () => attachAuthCallbackEvents());
    return;
  }

  // 2. Student Portal Routes
  if (route.startsWith("#/student")) {
    const sub = route.replace("#/student/", "").replace("#/student", "");
    if (sub === "membership-card" || sub === "smart-id" || sub === "qr-pass" || sub === "badges") {
      renderSafe(() => renderMembershipCardView(), () => attachMembershipCardEvents());
      return;
    }
    renderSafe(() => renderStudentDashboardView(sub || "dashboard"), () => attachStudentDashboardEvents());
    return;
  }

  // 3. Coordinator & Faculty Portal Routes
  if (
    route.startsWith("#/coordinator") || 
    route.startsWith("#/faculty") || 
    route.startsWith("#/faculty-portal") || 
    route.startsWith("#/faculty-dashboard") ||
    route.startsWith("#/faculty-coordinator")
  ) {
    let sub = route
      .replace("#/coordinator/", "")
      .replace("#/coordinator", "")
      .replace("#/faculty-portal/", "")
      .replace("#/faculty-portal", "")
      .replace("#/faculty-coordinator/", "")
      .replace("#/faculty-coordinator", "")
      .replace("#/faculty-dashboard/", "")
      .replace("#/faculty-dashboard", "")
      .replace("#/faculty/", "")
      .replace("#/faculty", "");
    renderSafe(() => renderCoordinatorPortalView(sub || "dashboard", params), () => attachCoordinatorPortalEvents());
    return;
  }

  // 4. Department Admin Portal Routes
  if (route.startsWith("#/department")) {
    const sub = route.replace("#/department/", "").replace("#/department", "");
    renderSafe(() => renderDepartmentPortalView(sub || "dashboard", params), () => attachDepartmentPortalEvents());
    return;
  }

  // 5. Super Admin Portal Routes
  if (route.startsWith("#/admin")) {
    const sub = route.replace("#/admin/", "").replace("#/admin", "");
    renderSafe(() => renderAdminPortalView(sub || "dashboard"), () => attachAdminPortalEvents());
    return;
  }

  // Standard Routes
  switch (route) {
    case "#/":
    case "":
      renderSafe(() => renderHomeView(), () => attachHomeEvents());
      break;

    case "#/clubs":
      renderSafe(() => renderClubsView(params), () => attachClubsEvents(params));
      break;

    case "#/events":
      renderSafe(() => renderEventsView(params), () => attachEventsEvents(params));
      break;

    case "#/attendance":
      renderSafe(() => renderAttendanceView(params), () => attachAttendanceEvents(params));
      break;

    case "#/poster":
    case "#/event-poster":
      renderSafe(() => renderEventPosterView(params), () => attachEventPosterEvents(params));
      break;

    case "#/certificates":
      renderSafe(() => renderCertificatesView(params), () => attachCertificatesEvents(params));
      break;

    case "#/membership-card":
    case "#/smart-id":
    case "#/digital-id":
    case "#/qr-pass":
    case "#/badges":
      renderSafe(() => renderMembershipCardView(), () => attachMembershipCardEvents());
      break;

    case "#/student-profile":
      renderSafe(() => renderStudentProfileView(), () => attachStudentProfileEvents());
      break;

    case "#/projects":
    case "#/hackathon":
    case "#/hackathons":
      renderSafe(() => renderProjectsView(params), () => attachProjectsEvents(params));
      break;

    case "#/lms":
      renderSafe(() => renderLMSView(), () => attachLMSEvents());
      break;

    case "#/roadmaps":
      renderSafe(() => renderRoadmapsView(params), () => attachRoadmapsEvents());
      break;

    case "#/tools":
      renderSafe(() => renderToolsDirectoryView(), () => attachToolsDirectoryEvents());
      break;

    case "#/gallery":
      renderSafe(() => renderGalleryView(), () => attachGalleryEvents());
      break;

    case "#/announcements":
      renderSafe(() => renderAnnouncementsView(), () => attachAnnouncementsEvents());
      break;

    case "#/analytics":
      renderSafe(() => renderAnalyticsView(), () => attachAnalyticsEvents());
      break;

    case "#/club-dashboard":
    case "#/club-analytics":
    case "#/club-management":
      renderSafe(() => renderClubDashboardView(params), () => attachClubDashboardEvents(params));
      break;

    case "#/guest":
    case "#/guest-dashboard":
      renderSafe(() => renderGuestDashboardView(params), () => attachGuestDashboardEvents());
      break;

    case "#/reports":
      renderSafe(() => renderReportsView(), () => attachReportsEvents());
      break;

    case "#/verify":
    case "#/verify-certificate":
      renderSafe(() => renderVerificationView(params), () => attachVerificationEvents());
      break;

    case "#/about":
      renderSafe(() => renderAboutView(), () => attachAboutEvents());
      break;

    case "#/quizzes":
      renderSafe(() => renderQuizzesView(params), () => attachQuizzesEvents());
      break;

    case "#/practice":
      renderSafe(() => renderPracticeView(params), () => attachPracticeEvents());
      break;

    case "#/study-circles":
      renderSafe(() => renderStudyCirclesView(params), () => attachStudyCirclesEvents());
      break;

    default:
      mountPoint.innerHTML = `
        <div class="py-20 text-center space-y-4">
          <div class="text-4xl">🔍</div>
          <h1 class="text-xl font-bold text-slate-900">Page Not Found</h1>
          <p class="text-xs text-slate-500">The requested route '${route}' does not exist in the council portal.</p>
          <div class="pt-2 flex justify-center space-x-2">
            <a href="#/" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-500 transition-colors">
              Return to Central Home
            </a>
            <a href="#/login" class="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-colors">
              Sign In
            </a>
          </div>
        </div>
      `;
      break;
  }
}
