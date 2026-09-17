import { renderNavbar, attachNavbarEvents } from './components/navbar.js';
import { renderSearchModal } from './components/searchModal.js';

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
import { renderAboutView, attachAboutEvents } from './views/about.js';

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
    </div>
  `;

  attachNavbarEvents();

  const mountPoint = document.getElementById("view-container");
  if (!mountPoint) return;

  // Window scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Route Dispatch Table
  switch (route) {
    case "#/":
    case "":
      mountPoint.innerHTML = renderHomeView();
      attachHomeEvents();
      break;

    case "#/clubs":
      mountPoint.innerHTML = renderClubsView(params);
      attachClubsEvents(params);
      break;

    case "#/events":
      mountPoint.innerHTML = renderEventsView(params);
      attachEventsEvents(params);
      break;

    case "#/attendance":
      mountPoint.innerHTML = renderAttendanceView(params);
      attachAttendanceEvents(params);
      break;

    case "#/poster":
      mountPoint.innerHTML = renderEventPosterView(params);
      attachEventPosterEvents(params);
      break;

    case "#/certificates":
      mountPoint.innerHTML = renderCertificatesView(params);
      attachCertificatesEvents(params);
      break;

    case "#/membership-card":
      mountPoint.innerHTML = renderMembershipCardView();
      attachMembershipCardEvents();
      break;

    case "#/student-profile":
      mountPoint.innerHTML = renderStudentProfileView();
      attachStudentProfileEvents();
      break;

    case "#/projects":
      mountPoint.innerHTML = renderProjectsView();
      attachProjectsEvents();
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

    case "#/admin":
      mountPoint.innerHTML = renderAdminView();
      attachAdminEvents();
      break;

    case "#/reports":
      mountPoint.innerHTML = renderReportsView();
      attachReportsEvents();
      break;

    case "#/verify":
      mountPoint.innerHTML = renderVerificationView(params);
      attachVerificationEvents();
      break;

    case "#/about":
      mountPoint.innerHTML = renderAboutView();
      attachAboutEvents();
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
              <span class="font-black text-slate-900 tracking-tight text-sm">CampusTech PEC-CS</span>
            </div>
            <p class="text-slate-500 text-xs max-w-sm leading-relaxed">
              Unified digital ecosystem for technical societies, accredited hackathons, peer learning, and tamper-proof student credentials at Panimalar Engineering College.
            </p>
            <div class="text-[10px] text-slate-400 font-mono">
              Accredited by NBA & NAAC 'A++' Grade • Institution Innovation Council (IIC)
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Ecosystem</h4>
            <ul class="space-y-1.5 text-xs">
              <li><a href="#/clubs" class="hover:text-blue-600 transition-colors">Technical Societies</a></li>
              <li><a href="#/events" class="hover:text-blue-600 transition-colors">Hackathons & Bootcamps</a></li>
              <li><a href="#/lms" class="hover:text-blue-600 transition-colors">Peer Learning LMS</a></li>
              <li><a href="#/roadmaps" class="hover:text-blue-600 transition-colors">Career Roadmaps</a></li>
              <li><a href="#/tools" class="hover:text-blue-600 transition-colors">Dev Software Directory</a></li>
            </ul>
          </div>

          <div class="space-y-2">
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Governance</h4>
            <ul class="space-y-1.5 text-xs">
              <li><a href="#/verify" class="hover:text-blue-600 transition-colors">Verify Certificate Ledger</a></li>
              <li><a href="#/reports" class="hover:text-blue-600 transition-colors">NBA / NAAC Audit Reports</a></li>
              <li><a href="#/analytics" class="hover:text-blue-600 transition-colors">Ecosystem Analytics</a></li>
              <li><a href="#/about" class="hover:text-blue-600 transition-colors">Council Charter & Leadership</a></li>
              <li><a href="#/admin" class="hover:text-blue-600 transition-colors">Admin Governance Console</a></li>
            </ul>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Panimalar Engineering College — Central Council of Technical Societies. All rights reserved.
          </div>
          <div class="flex items-center space-x-4">
            <a href="#/membership-card" class="hover:text-slate-600">Digital ID Card</a>
            <a href="#/poster" class="hover:text-slate-600">Poster Studio</a>
            <a href="#/attendance" class="hover:text-slate-600">Gate Check-in</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
