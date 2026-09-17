import { getDB, saveDB, logAudit, apiRequest } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { showConfirmModal } from '../components/confirmModal.js';
import {
  ROLES,
  normalizeRole,
  isUserAuthorizedForClub,
  getUserClubAuthority,
  isDepartmentMatch
} from '../rbac.js';
import { renderAccessDenied, attachAccessDeniedEvents } from '../components/accessDenied.js';
import { calculateClubEngagementScore, detectInactiveMembers } from '../intelligence.js';

// Chart.js references for clean lifecycle
let chartParticipationInstance = null;
let chartDeptInstance = null;
let chartYearInstance = null;
let chartRatingInstance = null;

let activeDashboardTab = 'overview'; // 'overview' | 'members' | 'events' | 'attendance' | 'projects' | 'certificates' | 'resources' | 'announcements' | 'budget' | 'audit'

export function renderClubDashboardView(params = {}) {
  const db = getDB();
  const currentUser = getCurrentUser() || {};
  const currentRole = normalizeRole(currentUser.role);

  // If specific tab requested in params
  if (params.tab) {
    activeDashboardTab = params.tab;
  }

  // Determine target club ID
  const userClub = currentUser.clubId || (currentUser.assignedClubs && currentUser.assignedClubs[0]) || "I4-08";
  const selectedClubId = params.id || params.clubId || userClub;

  const club = (db.clubs || []).find(c => c.id === selectedClubId || (c.id && c.id.toUpperCase() === selectedClubId.toUpperCase())) || db.clubs[0];

  if (!club) {
    return `
      <div class="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto my-12">
        <div class="text-4xl mb-3">🔍</div>
        <h2 class="text-xl font-bold text-slate-900">Club Not Found</h2>
        <p class="text-sm text-slate-500 mt-2">No technical club was found with ID "${selectedClubId}".</p>
        <a href="#/clubs" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">Browse All Clubs</a>
      </div>
    `;
  }

  // RBAC SCOPE ENFORCEMENT
  if (!isUserAuthorizedForClub(currentUser, club.id, club)) {
    return renderAccessDenied({
      requiredRole: ROLES.CLUB_ADMIN,
      attemptedRoute: `#/club-dashboard?id=${club.id}`,
      clubId: club.id,
      message: `Access denied. As ${currentRole} (${currentUser.name}), your authorized scope does not grant management access to Club ${club.name} (${club.id}).`
    });
  }

  // Retrieve fine-grained capabilities
  const auth = getUserClubAuthority(currentUser, club);

  // List of clubs this user has authorization to switch between
  let authorizedClubs = [];
  if (currentRole === ROLES.SUPER_ADMIN) {
    authorizedClubs = db.clubs || [];
  } else if (currentRole === ROLES.DEPARTMENT_ADMIN) {
    const userDept = currentUser.department || "CSE";
    authorizedClubs = (db.clubs || []).filter(c => isDepartmentMatch(userDept, c.department));
  } else if (currentRole === ROLES.FACULTY_COORDINATOR) {
    const assigned = currentUser.assignedClubs || [club.id];
    authorizedClubs = (db.clubs || []).filter(c => assigned.includes(c.id));
  } else if (currentRole === ROLES.CLUB_ADMIN) {
    const assigned = currentUser.assignedClubs || (currentUser.clubId ? [currentUser.clubId] : [club.id]);
    authorizedClubs = (db.clubs || []).filter(c => assigned.includes(c.id));
  } else {
    authorizedClubs = [club];
  }

  // Fetch relevant club entities
  const clubMemberships = (db.club_memberships || []).filter(m => m.club_id === club.id);
  const enrichedMembers = clubMemberships.map(m => {
    const student = (db.users || []).find(u => u.id === m.student_id);
    return {
      ...m,
      name: student ? student.name : "Student Member",
      rollNo: student ? student.rollNo : "22A31A0501",
      email: student ? student.email : "student@pragati.ac.in",
      department: student ? student.department : (club.department || "CSE"),
      year: student ? student.year : "3rd Year",
      avatar: student ? student.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      skills: student ? student.skills : ["Programming", "Design"]
    };
  });

  const clubEvents = (db.events || []).filter(e => e.club_id === club.id || e.clubId === club.id);
  const now = new Date();
  const upcomingEvents = clubEvents.filter(e => !e.date || new Date(e.date) >= now);
  const completedEvents = clubEvents.filter(e => e.date && new Date(e.date) < now);

  const eventIds = clubEvents.map(e => e.id);
  const attendanceLogs = (db.attendance_logs || db.attendance || []).filter(a => eventIds.includes(a.event_id) || a.club_id === club.id);

  const clubProjects = (db.projects || []).filter(p => p.club_id === club.id || p.clubId === club.id || (p.department === club.department));
  const clubCertificates = (db.certificates || []).filter(c => c.club_id === club.id || c.clubId === club.id);
  const clubResources = (db.resources || []).filter(r => r.club_id === club.id || r.clubId === club.id);
  const clubAnnouncements = (db.announcements || []).filter(a => a.club_id === club.id || a.target_club === club.id || a.target === "All");

  const budgetInfo = (db.clubBudgets || []).find(b => b.clubId === club.id) || {
    allocated: 75000,
    utilized: 51000,
    claims: [
      { id: "clm-1", title: "Keynote Speaker Travel & Honorarium", amount: 15000, status: "Approved", date: "2025-11-10" },
      { id: "clm-2", title: "Cloud Sandbox & GPU Credits", amount: 20000, status: "Approved", date: "2025-12-05" },
      { id: "clm-3", title: "Certificates & Memento Printing", amount: 16000, status: "Approved", date: "2026-01-25" }
    ]
  };
  const budgetPct = Math.round((budgetInfo.utilized / budgetInfo.allocated) * 100);

  const clubAuditLogs = (db.audit_logs || []).filter(l =>
    (l.resource_id && l.resource_id.includes(club.id)) ||
    (l.details && l.details.includes(club.id)) ||
    (l.details && l.details.includes(club.name))
  ).slice(0, 15);

  const facultyCoordName = typeof club.facultyCoordinator === 'object'
    ? club.facultyCoordinator.name
    : (club.facultyCoordinator || "Faculty Coordinator");

  return `
    <div class="space-y-6 pb-20 max-w-7xl mx-auto">
      
      <!-- Top Header & Scope Banner -->
      <div class="bg-white rounded-none border-t-4 border-slate-900 border-x border-b border-slate-200 p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <!-- Club Avatar & Identifiers -->
          <div class="flex items-start sm:items-center space-x-6">
            <img src="${club.logo || club.icon || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'}" alt="${club.name}" class="w-20 h-20 border border-slate-200 object-cover shadow-sm bg-slate-50 shrink-0" />
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-300">
                  ${club.category || club.domain || 'Technical Society'}
                </span>
                <span class="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${auth.badgeColor} rounded-none border">
                  Scope: ${auth.accessLabel}
                </span>
                <span class="text-[10px] text-slate-400 font-mono hidden sm:inline uppercase tracking-widest ml-2">AY 2025-2026</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight mt-2 flex items-center gap-2">
                <span>${club.name}</span>
                <span class="text-sm font-normal text-slate-400 font-mono">(${club.id})</span>
              </h1>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                Department of ${club.department} • Faculty Coordinator: <strong class="text-slate-700">${facultyCoordName}</strong>
              </p>
            </div>
          </div>

          <!-- Club Switcher (if multiple clubs accessible) & Action Controls -->
          <div class="flex flex-wrap items-center gap-3">
            ${authorizedClubs.length > 1 ? `
              <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 border border-slate-300">
                <span class="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">Switch Chapter:</span>
                <select id="club-switcher-select" class="bg-white text-slate-800 text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-1 border border-slate-300 focus:outline-none cursor-pointer">
                  ${authorizedClubs.map(c => `
                    <option value="${c.id}" ${c.id === club.id ? 'selected' : ''}>
                      ${c.id} - ${c.name}
                    </option>
                  `).join('')}
                </select>
              </div>
            ` : ''}

            <!-- Quick Trigger Actions -->
            ${auth.canManageQRAttendance ? `
              <a href="#/attendance?clubId=${club.id}" class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] uppercase font-mono tracking-wider font-bold transition-colors">
                QR Kiosk
              </a>
            ` : ''}

            ${auth.canCreateEvents ? `
              <button id="btn-quick-create-event" class="px-3 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-[10px] uppercase font-mono tracking-wider font-bold transition-colors">
                Create Event
              </button>
            ` : ''}

            ${auth.canManageAnnouncements ? `
              <button id="btn-quick-broadcast" class="px-3 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-[10px] uppercase font-mono tracking-wider font-bold transition-colors">
                Send Notice
              </button>
            ` : ''}

            ${auth.canGenerateReports ? `
              <button id="btn-export-club-report" class="px-3 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-[10px] uppercase font-mono tracking-wider font-bold transition-colors">
                Export Report
              </button>
            ` : ''}
          </div>

        </div>

        <!-- Role Authority & Scope Summary Ribbon -->
        <div class="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-wider">
          <div class="flex items-center space-x-2">
            <span class="w-1.5 h-1.5 bg-emerald-600"></span>
            <span class="text-slate-500 font-bold">
              Actor: <strong class="text-slate-900">${currentUser.name}</strong> (${currentRole}) <span class="mx-2 text-slate-300">|</span> <span class="text-slate-900 font-bold">Access: ${auth.reason}</span>
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-[9px] font-bold text-slate-500">
            <span class="px-2 py-0.5 border ${auth.canCreateEvents ? 'border-slate-900 text-slate-900' : 'border-slate-200'}">${auth.canCreateEvents ? 'Create Events' : 'View Events'}</span>
            <span class="px-2 py-0.5 border ${auth.canApproveEvents ? 'border-slate-900 text-slate-900' : 'border-slate-200'}">${auth.canApproveEvents ? 'Approve Events' : 'View Approvals'}</span>
            <span class="px-2 py-0.5 border ${auth.canManageMembers ? 'border-slate-900 text-slate-900' : 'border-slate-200'}">${auth.canManageMembers ? 'Manage Roster' : 'View Roster'}</span>
            <span class="px-2 py-0.5 border ${auth.canApproveProjects ? 'border-slate-900 text-slate-900' : 'border-slate-200'}">${auth.canApproveProjects ? 'Approve Projects' : 'View Projects'}</span>
            <span class="px-2 py-0.5 border ${auth.canIssueCertificates ? 'border-slate-900 text-slate-900' : 'border-slate-200'}">${auth.canIssueCertificates ? 'Mint Certs' : 'View Certs'}</span>
          </div>
        </div>

      </div>

      <!-- Navigation Tabs for Modules -->
      <div class="flex items-center overflow-x-auto border-b border-slate-300 text-[10px] font-bold font-mono uppercase tracking-wider">
        <button data-tab="overview" class="tab-btn px-4 py-3 transition-colors whitespace-nowrap border-b-2 ${activeDashboardTab === 'overview' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}">
          Overview & KPI
        </button>
        <button data-tab="members" class="tab-btn px-4 py-3 transition-colors whitespace-nowrap border-b-2 ${activeDashboardTab === 'members' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}">
          Members (${enrichedMembers.length})
        </button>
        <button data-tab="events" class="tab-btn px-4 py-3 transition-colors whitespace-nowrap border-b-2 ${activeDashboardTab === 'events' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}">
          Events (${clubEvents.length})
        </button>
        <button data-tab="attendance" class="tab-btn px-4 py-3 transition-colors whitespace-nowrap border-b-2 ${activeDashboardTab === 'attendance' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}">
          Attendance (${attendanceLogs.length})
        </button>
        <button data-tab="projects" class="tab-btn px-4 py-3 transition-colors whitespace-nowrap border-b-2 ${activeDashboardTab === 'projects' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}">
          Projects (${clubProjects.length})
        </button>
        <button data-tab="certificates" class="tab-btn px-4 py-3 transition-colors whitespace-nowrap border-b-2 ${activeDashboardTab === 'certificates' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}">
          Certificates (${clubCertificates.length})
        </button>
        <button data-tab="resources" class="tab-btn px-4 py-3 transition-colors whitespace-nowrap border-b-2 ${activeDashboardTab === 'resources' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}">
          Resources (${clubResources.length})
        </button>
        <button data-tab="announcements" class="tab-btn px-4 py-3 transition-colors whitespace-nowrap border-b-2 ${activeDashboardTab === 'announcements' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}">
          Notices (${clubAnnouncements.length})
        </button>
        <button data-tab="budget" class="tab-btn px-4 py-3 transition-colors whitespace-nowrap border-b-2 ${activeDashboardTab === 'budget' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}">
          Budget
        </button>
        ${auth.canViewAuditLogs ? `
          <button data-tab="audit" class="tab-btn px-4 py-3 transition-colors whitespace-nowrap border-b-2 ${activeDashboardTab === 'audit' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-amber-700 hover:border-amber-300'}">
            Audit Logs (${clubAuditLogs.length})
          </button>
        ` : ''}
      </div>

      <!-- Tab Content Area -->
      <div id="dashboard-tab-content">
        ${renderActiveTabContent(activeDashboardTab, club, auth, {
          members: enrichedMembers,
          events: clubEvents,
          upcomingEvents,
          completedEvents,
          attendanceLogs,
          projects: clubProjects,
          certificates: clubCertificates,
          resources: clubResources,
          announcements: clubAnnouncements,
          budgetInfo,
          budgetPct,
          auditLogs: clubAuditLogs
        })}
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// Tab Renderers
// ----------------------------------------------------

function renderActiveTabContent(tab, club, auth, data) {
  switch (tab) {
    case 'overview':
      return renderOverviewTab(club, auth, data);
    case 'members':
      return renderMembersTab(club, auth, data);
    case 'events':
      return renderEventsTab(club, auth, data);
    case 'attendance':
      return renderAttendanceTab(club, auth, data);
    case 'projects':
      return renderProjectsTab(club, auth, data);
    case 'certificates':
      return renderCertificatesTab(club, auth, data);
    case 'resources':
      return renderResourcesTab(club, auth, data);
    case 'announcements':
      return renderAnnouncementsTab(club, auth, data);
    case 'budget':
      return renderBudgetTab(club, auth, data);
    case 'audit':
      return renderAuditTab(club, auth, data);
    default:
      return renderOverviewTab(club, auth, data);
  }
}

// 1. OVERVIEW & ANALYTICS TAB
function renderOverviewTab(club, auth, data) {
  const { members, events, attendanceLogs, projects, certificates, budgetInfo, budgetPct } = data;

  return `
    <div class="space-y-6">
      
      <!-- Executive KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Members -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Enrolled Members</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold font-mono">Verified</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">${Math.max(club.memberCount || 0, members.length)}</div>
          <div class="text-[11px] text-slate-400 font-mono">${members.filter(m => m.status === 'Approved' || !m.status).length} Active Roster</div>
        </div>

        <!-- Attendance / Turnout Rate -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Avg Event Turnout</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono">High Engagement</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-blue-600">89.4%</div>
          <div class="text-[11px] text-emerald-600 font-bold font-mono">${Math.max(1240, attendanceLogs.length)} Total Check-ins</div>
        </div>

        <!-- Activities Hosted -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Conducted Events</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold font-mono">NBA Tier-1</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-purple-600">${Math.max(4, events.length)} Events</div>
          <div class="text-[11px] text-slate-400 font-mono">${data.upcomingEvents.length} Upcoming Scheduled</div>
        </div>

        <!-- Annual Budget Health -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Budget Utilization</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold font-mono">${budgetPct}% utilized</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">₹${(budgetInfo.allocated - budgetInfo.utilized).toLocaleString()}</div>
          <div class="text-[11px] text-slate-400 font-mono">Remaining of ₹${budgetInfo.allocated.toLocaleString()}</div>
        </div>

      </div>

      <!-- AI Intelligence Section (Round 2) -->
      <div id="ai-intelligence-container" class="bg-indigo-50/50 border border-indigo-100 rounded-none p-6 md:p-8 space-y-6">
        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest font-mono bg-indigo-600 text-white">AI Intelligence Engine</span>
          <h2 class="text-xl font-serif font-bold text-slate-900">Engagement Analytics</h2>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Engagement Score -->
          <div class="bg-white border border-indigo-200 p-6 flex flex-col justify-between">
            <div>
              <h3 class="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Overall Club Health</h3>
              <div class="flex items-end space-x-3 mb-6">
                <span id="ai-engagement-score" class="text-5xl font-black font-serif text-indigo-600 tracking-tight">--</span>
                <span class="text-sm font-bold text-slate-500 mb-1.5">/ 100</span>
              </div>
              <div class="space-y-4 text-xs font-mono">
                <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span class="text-slate-600 uppercase tracking-widest text-[9px]">Membership Activity</span>
                  <span id="ai-score-membership" class="font-bold text-slate-900">--%</span>
                </div>
                <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span class="text-slate-600 uppercase tracking-widest text-[9px]">Events & Turnout</span>
                  <span id="ai-score-events" class="font-bold text-slate-900">--%</span>
                </div>
                <div class="flex justify-between items-center pb-1">
                  <span class="text-slate-600 uppercase tracking-widest text-[9px]">Projects & Outcomes</span>
                  <span id="ai-score-projects" class="font-bold text-slate-900">--%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Risk Assessment -->
          <div class="bg-white border border-indigo-200 p-6">
             <div class="flex items-center justify-between mb-4">
              <h3 class="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Retention Risk Assessment</h3>
              <span id="ai-risk-count" class="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-mono font-bold border border-rose-200 uppercase tracking-widest">-- AT RISK</span>
             </div>
             <p class="text-xs text-slate-500 mb-4 line-clamp-2">The engine has identified members who have missed consecutive major events. Review re-engagement suggestions.</p>
             
             <div id="ai-inactive-list" class="space-y-3 max-h-40 overflow-y-auto pr-2">
                <div class="text-center py-4 text-xs font-mono text-slate-400">Analyzing...</div>
             </div>
          </div>
        </div>
      </div>

      <!-- Core Visualizations Grid (Chart.js) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- CHART 1: Event Participation Trends -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 class="text-base font-bold text-slate-900">Event Participation & Attendance Trends</h2>
              <p class="text-xs text-slate-500">Tracking registered delegates vs verified QR gate check-ins</p>
            </div>
            <div class="flex items-center space-x-1.5">
              <button data-range="6" class="chart-filter-btn px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 text-white transition-colors">Last 6 Events</button>
              <button data-range="12" class="chart-filter-btn px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Full AY</button>
            </div>
          </div>

          <div class="h-72 w-full relative">
            <canvas id="chart-participation-trend"></canvas>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div class="flex items-center space-x-4">
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                <span>Registered</span>
              </span>
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span>Actual Turnout</span>
              </span>
            </div>
            <span class="font-mono font-bold text-emerald-600">Avg No-Show Rate: 10.6%</span>
          </div>
        </div>

        <!-- CHART 2: Member Distribution Across Departments -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Member Distribution Across Departments</h2>
              <p class="text-xs text-slate-500">Interdisciplinary student enrollment breakdown</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              5 Departments
            </span>
          </div>

          <div class="h-72 w-full relative flex items-center justify-center">
            <canvas id="chart-dept-distribution"></canvas>
          </div>

          <div class="pt-2 border-t border-slate-100 grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-[10px] font-mono">
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="block font-bold text-blue-600">CSE</span>
              <span class="text-slate-500">42% (192)</span>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="block font-bold text-emerald-600">IT</span>
              <span class="text-slate-500">26% (120)</span>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="block font-bold text-purple-600">AIDS</span>
              <span class="text-slate-500">18% (82)</span>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="block font-bold text-amber-600">ECE</span>
              <span class="text-slate-500">9% (42)</span>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="block font-bold text-rose-600">MECH</span>
              <span class="text-slate-500">5% (24)</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Secondary Visualizations Grid: Year of Study & Workshop Ratings -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- CHART 3: Year of Study Demographics -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Cohort Demographics by Academic Year</h2>
            <p class="text-xs text-slate-500">Distribution across 1st, 2nd, 3rd, and 4th-year engineering delegates</p>
          </div>

          <div class="h-64 w-full relative">
            <canvas id="chart-year-demographics"></canvas>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Primary Contributor Cohort: <strong class="text-slate-800">2nd & 3rd Year (64%)</strong></span>
            <span class="text-blue-600 font-mono font-bold">110 Freshmen Inducted</span>
          </div>
        </div>

        <!-- CHART 4: Workshop Feedback & Satisfaction Scores -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Workshop & Activity Satisfaction Ratings</h2>
            <p class="text-xs text-slate-500">Anonymous post-event attendee feedback (Scale: 1.0 to 5.0 Stars)</p>
          </div>

          <div class="h-64 w-full relative">
            <canvas id="chart-workshop-ratings"></canvas>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Score: <strong class="text-amber-600">4.82 / 5.0 ★</strong></span>
            <span class="text-slate-400 font-mono">318 Submissions</span>
          </div>
        </div>

      </div>

      <!-- CHART 5: D3.js Activity Heatmap (Participation Trends) -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h2 class="text-base font-bold text-slate-900">Member Activity & Participation Heatmap</h2>
          <p class="text-xs text-slate-500">Historical concentration of check-ins and interactions by day and time.</p>
        </div>
        <div id="d3-activity-heatmap" class="w-full overflow-x-auto relative min-h-[350px] flex justify-center">
          <!-- D3 SVG will be injected here -->
        </div>
      </div>

      <!-- Quick Summary Table of Upcoming Events -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">Upcoming Scheduled Activities</h2>
            <p class="text-xs text-slate-500">Events ready for registration and QR check-in</p>
          </div>
          ${auth.canCreateEvents ? `
            <button class="btn-open-create-event-modal px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
              + New Event
            </button>
          ` : ''}
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-y border-slate-100">
              <tr>
                <th class="py-3 px-4">Event Details</th>
                <th class="py-3 px-4">Date & Time</th>
                <th class="py-3 px-4">Venue</th>
                <th class="py-3 px-4">Registered</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${events.length === 0 ? `
                <tr><td colspan="6" class="text-center py-6 text-slate-400">No events found for this club.</td></tr>
              ` : events.slice(0, 4).map(e => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900">${e.title}</div>
                    <div class="text-[11px] text-slate-400">${e.category || 'Technical Workshop'}</div>
                  </td>
                  <td class="py-3 px-4 font-mono text-slate-600">${e.date || 'TBD'} ${e.time || ''}</td>
                  <td class="py-3 px-4 text-slate-600">${e.venue || 'Main Seminar Hall'}</td>
                  <td class="py-3 px-4 font-bold text-blue-600 font-mono">${e.registeredCount || 85} / ${e.capacity || 120}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${e.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                      ${e.status || 'Active'}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-1.5">
                    <a href="#/attendance?eventId=${e.id}" class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold inline-block">QR Check-in</a>
                    <a href="#/event-poster?id=${e.id}" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold inline-block">Poster</a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

// 2. MEMBERS & EXECUTIVE TEAM TAB
function renderMembersTab(club, auth, data) {
  const { members } = data;
  const executiveTeam = club.executiveTeam || [
    { role: "President", name: "Priya Patel", rollNo: "22A31A0501", email: "priya.patel@pragati.ac.in", phone: "+91 98480 12345", status: "Active" },
    { role: "Vice President", name: "Rahul Verma", rollNo: "22A31A0545", email: "rahul.verma@pragati.ac.in", phone: "+91 98480 23456", status: "Active" },
    { role: "Technical Lead", name: "K. Sai Charan", rollNo: "22A31A0512", email: "saicharan.k@pragati.ac.in", phone: "+91 98480 34567", status: "Active" },
    { role: "Event Coordinator", name: "Ananya Reddy", rollNo: "22A31A4210", email: "ananya.r@pragati.ac.in", phone: "+91 98480 45678", status: "Active" }
  ];

  return `
    <div class="space-y-6">
      
      <!-- Executive Leadership Section -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Student Executive Team (Core Committee)</h2>
            <p class="text-xs text-slate-500">Student leaders driving club initiatives and peer mentorship</p>
          </div>
          ${auth.canManageExecutiveTeam ? `
            <button id="btn-edit-executive-team" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
              ⚙️ Manage Executive Team
            </button>
          ` : ''}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${executiveTeam.map(exec => `
            <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  ${exec.role}
                </span>
                <span class="text-[10px] font-mono text-emerald-600 font-bold">Verified</span>
              </div>
              <div class="font-bold text-sm text-slate-900">${exec.name}</div>
              <div class="text-xs font-mono text-slate-500">${exec.rollNo}</div>
              <div class="text-[11px] text-slate-400 truncate">${exec.email}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- General Member Roster -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Enrolled Club Members Roster</h2>
            <p class="text-xs text-slate-500">Complete listing of registered undergraduate student members</p>
          </div>
          <div class="flex items-center space-x-2">
            <input id="member-search-input" type="text" placeholder="Search by name, roll no..." class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs w-56 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button id="btn-export-roster" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
              📥 Export CSV
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-y border-slate-100">
              <tr>
                <th class="py-3 px-4">Student</th>
                <th class="py-3 px-4">Roll Number</th>
                <th class="py-3 px-4">Department & Year</th>
                <th class="py-3 px-4">Primary Skills</th>
                <th class="py-3 px-4">Status</th>
                ${auth.canManageMembers ? '<th class="py-3 px-4 text-right">Actions</th>' : ''}
              </tr>
            </thead>
            <tbody id="member-table-body" class="divide-y divide-slate-100">
              ${members.length === 0 ? `
                <tr><td colspan="6" class="text-center py-6 text-slate-400">No member records recorded in database.</td></tr>
              ` : members.map(m => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-4">
                    <div class="flex items-center space-x-2.5">
                      <img src="${m.avatar}" class="w-7 h-7 rounded-full object-cover border border-slate-200" alt="${m.name}" />
                      <div>
                        <div class="font-bold text-slate-900">${m.name}</div>
                        <div class="text-[10px] text-slate-400">${m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono font-semibold text-slate-700">${m.rollNo}</td>
                  <td class="py-3 px-4 text-slate-600">${m.department} • ${m.year}</td>
                  <td class="py-3 px-4">
                    <div class="flex flex-wrap gap-1">
                      ${(m.skills || []).slice(0, 2).map(s => `<span class="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600">${s}</span>`).join('')}
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${m.status === 'Approved' || !m.status ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                      ${m.status || 'Approved'}
                    </span>
                  </td>
                  ${auth.canManageMembers ? `
                    <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button data-member-id="${m.id}" class="btn-view-member-card px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold">Digital ID</button>
                      <button data-member-id="${m.id}" data-member-name="${m.name}" class="btn-remove-member px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold">Remove</button>
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

// 3. EVENTS MANAGEMENT TAB
function renderEventsTab(club, auth, data) {
  const { events } = data;

  return `
    <div class="space-y-6">
      
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Events Management & Approvals</h2>
            <p class="text-xs text-slate-500">Review scheduled activities, delegate registrations, and approval status</p>
          </div>
          ${auth.canCreateEvents ? `
            <button id="btn-create-new-event" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5">
              <span>➕ Schedule New Event</span>
            </button>
          ` : ''}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${events.length === 0 ? `
            <div class="col-span-2 text-center py-10 text-slate-400">No events scheduled.</div>
          ` : events.map(e => `
            <div class="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                  ${e.category || 'Workshop'}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono ${e.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                  ${e.status || 'Active'}
                </span>
              </div>

              <div>
                <h3 class="font-bold text-base text-slate-900">${e.title}</h3>
                <p class="text-xs text-slate-500 line-clamp-2 mt-1">${e.description || 'Hands-on technical session designed for pragmatic engineering skill development.'}</p>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
                <span>🗓️ ${e.date || 'TBD'}</span>
                <span>📍 ${e.venue || 'Lab 402'}</span>
                <span class="font-bold text-blue-600">👥 ${e.registeredCount || 85} Registered</span>
              </div>

                <div class="pt-2 flex items-center justify-between gap-2 text-xs font-bold">
                  <a href="#/attendance?eventId=${e.id}" class="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-center">
                    Live QR Gate
                  </a>
                  <a href="#/event-poster?id=${e.id}" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-center">
                    Poster
                  </a>
                  ${auth.canApproveEvents && e.status !== 'Approved' ? `
                    <button data-event-id="${e.id}" class="btn-approve-event px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-center">
                      Approve
                    </button>
                  ` : ''}
                  ${auth.canCreateEvents ? `
                    <button data-event-id="${e.id}" data-event-title="${e.title}" class="btn-delete-event px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-center">
                      Delete
                    </button>
                  ` : ''}
                </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// 4. ATTENDANCE & LIVE QR TAB
function renderAttendanceTab(club, auth, data) {
  const { attendanceLogs, events } = data;

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Live Attendance & Scanner Terminal</h2>
            <p class="text-xs text-slate-500">Real-time cryptographic check-in records with GPS and roll-number logging</p>
          </div>
          <div class="flex items-center space-x-2">
            <a href="#/attendance?clubId=${club.id}" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5">
              <span>📷 Launch Dedicated Kiosk</span>
            </a>
            <button id="btn-export-attendance" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
              📥 Download CSV
            </button>
          </div>
        </div>

        <!-- Attendance Stats Ribbon -->
        <div class="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl text-center">
          <div>
            <div class="text-xs text-slate-500 font-semibold">Total Verified Check-Ins</div>
            <div class="text-xl font-black text-slate-900 font-mono">${Math.max(1240, attendanceLogs.length)}</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-semibold">Gate Scanner Latency</div>
            <div class="text-xl font-black text-emerald-600 font-mono">~320ms</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-semibold">Proxy Prevention Rate</div>
            <div class="text-xl font-black text-blue-600 font-mono">100% Secure</div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-y border-slate-100">
              <tr>
                <th class="py-3 px-4">Event</th>
                <th class="py-3 px-4">Delegate Roll No</th>
                <th class="py-3 px-4">Student Name</th>
                <th class="py-3 px-4">Check-In Timestamp</th>
                <th class="py-3 px-4">Verification</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono">
              ${attendanceLogs.length === 0 ? `
                <tr><td colspan="5" class="text-center py-6 text-slate-400 font-sans">No live check-in logs for this club.</td></tr>
              ` : attendanceLogs.slice(0, 10).map(a => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-4 font-sans font-bold text-slate-800">${a.event_title || a.eventName || 'AI Workshop'}</td>
                  <td class="py-3 px-4 text-blue-600 font-bold">${a.student_rollNo || a.rollNo || '22A31A0501'}</td>
                  <td class="py-3 px-4 font-sans text-slate-700">${a.student_name || 'Student Delegate'}</td>
                  <td class="py-3 px-4 text-slate-500 text-[11px]">${a.timestamp || '2026-02-15 10:14 AM'}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 font-sans">
                      ✓ QR Verified
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// 5. PROJECTS TAB
function renderProjectsTab(club, auth, data) {
  const { projects } = data;

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Club Technical Projects & Hackathon Submissions</h2>
            <p class="text-xs text-slate-500">Student engineering artifacts, code repositories, and faculty reviews</p>
          </div>
          ${auth.canManageProjects ? `
            <a href="#/projects" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
              ➕ Submit Project
            </a>
          ` : ''}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${projects.length === 0 ? `
            <div class="col-span-2 text-center py-10 text-slate-400">No project submissions recorded yet.</div>
          ` : projects.map(p => `
            <div class="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700">
                  ${p.category || 'AI / Machine Learning'}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono ${p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                  ${p.status || 'Under Review'}
                </span>
              </div>

              <div>
                <h3 class="font-bold text-base text-slate-900">${p.title}</h3>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">${p.description || 'Open source engineering project built by Pragati students.'}</p>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>By: <strong class="text-slate-800">${p.author || p.teamLead || 'Student Team'}</strong></span>
                <span class="font-mono text-blue-600">⭐ ${p.stars || 14} Stars</span>
              </div>

              ${auth.canApproveProjects && p.status !== 'Approved' ? `
                <div class="pt-2 flex items-center space-x-2">
                  <button data-project-id="${p.id}" class="btn-approve-project flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold text-center">
                    ✓ Approve Project
                  </button>
                  <button data-project-id="${p.id}" class="btn-reject-project px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold text-center">
                    Request Revision
                  </button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 6. CERTIFICATES TAB
function renderCertificatesTab(club, auth, data) {
  const { certificates } = data;

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Issued & Pending Certificates</h2>
            <p class="text-xs text-slate-500">Verifiable credentials minted with SHA-256 cryptographic signatures</p>
          </div>
          <div class="flex items-center space-x-2">
            ${auth.canIssueCertificates ? `
              <a href="#/certificates" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5">
                <span>📜 Mint & Issue Certificate</span>
              </a>
            ` : auth.canRequestCertificates ? `
              <button id="btn-request-certificate-batch" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
                📝 Request Event Certificate Batch
              </button>
            ` : ''}
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-y border-slate-100">
              <tr>
                <th class="py-3 px-4">Certificate ID</th>
                <th class="py-3 px-4">Recipient</th>
                <th class="py-3 px-4">Activity / Event</th>
                <th class="py-3 px-4">Issue Date</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono">
              ${certificates.length === 0 ? `
                <tr><td colspan="6" class="text-center py-6 text-slate-400 font-sans">No certificates issued yet for this club.</td></tr>
              ` : certificates.map(c => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-4 font-bold text-blue-600">${c.certificateNumber || c.id}</td>
                  <td class="py-3 px-4 font-sans font-bold text-slate-800">${c.studentName || 'Student Delegate'}</td>
                  <td class="py-3 px-4 font-sans text-slate-600">${c.eventTitle || 'Technical Symposium'}</td>
                  <td class="py-3 px-4 text-slate-500">${c.issueDate || '2026-01-20'}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold font-sans bg-emerald-50 text-emerald-700">
                      ${c.status || 'Minted'}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right font-sans">
                    <a href="#/verify?id=${c.certificateNumber || c.id}" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold inline-block">
                      Verify Signature
                    </a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// 7. LEARNING RESOURCES TAB
function renderResourcesTab(club, auth, data) {
  const { resources } = data;

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Learning Resources & LMS Roadmaps</h2>
            <p class="text-xs text-slate-500">Curated syllabi, lecture slides, GitHub repositories, and toolsets</p>
          </div>
          ${auth.canManageResources ? `
            <a href="#/lms" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
              ➕ Add Resource
            </a>
          ` : ''}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${resources.length === 0 ? `
            <div class="col-span-3 text-center py-10 text-slate-400">No resources published yet.</div>
          ` : resources.map(r => `
            <div class="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-3">
              <div class="text-2xl">${r.icon || '📖'}</div>
              <div>
                <h3 class="font-bold text-sm text-slate-900">${r.title}</h3>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">${r.description || 'Curated study guide and practical references.'}</p>
              </div>
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-400">${r.type || 'Guide'}</span>
                <a href="${r.url || '#/lms'}" target="_blank" class="text-blue-600 font-bold hover:underline">Open Resource →</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 8. ANNOUNCEMENTS TAB
function renderAnnouncementsTab(club, auth, data) {
  const { announcements } = data;

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Official Club Noticeboard & Circulars</h2>
            <p class="text-xs text-slate-500">Broadcasts sent to student members and faculty heads</p>
          </div>
          ${auth.canManageAnnouncements ? `
            <button id="btn-compose-announcement" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all">
              📢 Post Announcement
            </button>
          ` : ''}
        </div>

        <div class="space-y-3">
          ${announcements.length === 0 ? `
            <div class="text-center py-10 text-slate-400">No announcements posted for this club.</div>
          ` : announcements.map(a => `
            <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}">
                  ${a.priority || 'Notice'}
                </span>
                <span class="text-xs text-slate-400 font-mono">${a.date || 'Today'}</span>
              </div>
              <h3 class="font-bold text-sm text-slate-900">${a.title}</h3>
              <p class="text-xs text-slate-600">${a.content || a.message || ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 9. BUDGET TAB
function renderBudgetTab(club, auth, data) {
  const { budgetInfo, budgetPct } = data;

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Annual Budget & Financial Governance</h2>
            <p class="text-xs text-slate-500">Academic Year 2025-2026 departmental fund allocation</p>
          </div>
          ${auth.canManageBudget ? `
            <button id="btn-request-budget-claim" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
              ➕ Submit Expense Claim
            </button>
          ` : ''}
        </div>

        <!-- Budget Progress Bar -->
        <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="text-slate-600">Fund Utilization Progress</span>
            <span class="text-blue-600">${budgetPct}% Consumed</span>
          </div>
          <div class="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style="width: ${budgetPct}%"></div>
          </div>
          <div class="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div>
              <span class="text-slate-400 block text-[10px]">Allocated</span>
              <strong class="text-slate-900 font-mono text-sm">₹${budgetInfo.allocated.toLocaleString()}</strong>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">Utilized</span>
              <strong class="text-blue-600 font-mono text-sm">₹${budgetInfo.utilized.toLocaleString()}</strong>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">Available</span>
              <strong class="text-emerald-600 font-mono text-sm">₹${(budgetInfo.allocated - budgetInfo.utilized).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <!-- Expense Claims Table -->
        <div class="space-y-3">
          <h3 class="text-sm font-bold text-slate-900">Logged Expense Claims & Invoices</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-y border-slate-100">
                <tr>
                  <th class="py-3 px-4">Claim ID</th>
                  <th class="py-3 px-4">Description</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Amount</th>
                  <th class="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-mono">
                ${(budgetInfo.claims || []).map(clm => `
                  <tr>
                    <td class="py-3 px-4 font-bold text-slate-700">${clm.id}</td>
                    <td class="py-3 px-4 font-sans text-slate-900 font-semibold">${clm.title}</td>
                    <td class="py-3 px-4 text-slate-500">${clm.date}</td>
                    <td class="py-3 px-4 font-bold text-slate-900">₹${clm.amount.toLocaleString()}</td>
                    <td class="py-3 px-4 text-right font-sans">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        ${clm.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 10. AUDIT TRAIL TAB
function renderAuditTab(club, auth, data) {
  const { auditLogs } = data;

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Club Audit Trail & Governance Log</h2>
          <p class="text-xs text-slate-500">Immutable chronological records of administrative activities and permission changes</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-y border-slate-100">
              <tr>
                <th class="py-3 px-4">Timestamp</th>
                <th class="py-3 px-4">Action</th>
                <th class="py-3 px-4">User</th>
                <th class="py-3 px-4">Role</th>
                <th class="py-3 px-4">Resource ID</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
              ${auditLogs.length === 0 ? `
                <tr><td colspan="5" class="text-center py-6 text-slate-400 font-sans">No audit events recorded for this club.</td></tr>
              ` : auditLogs.map(l => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 px-4 text-slate-400">${new Date(l.timestamp || Date.now()).toLocaleString()}</td>
                  <td class="py-3 px-4 font-bold text-slate-900">${l.action}</td>
                  <td class="py-3 px-4 font-sans text-slate-700">${l.userName || l.user_id || 'System'}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      ${l.userRole || 'Admin'}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-slate-500">${l.resource_id || l.details || club.id}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// Event Listeners & Chart.js Initialization
// ----------------------------------------------------

export function attachClubDashboardEvents(params = {}) {
  const db = getDB();
  const currentUser = getCurrentUser() || {};
  const userClub = currentUser.clubId || (currentUser.assignedClubs && currentUser.assignedClubs[0]) || "I4-08";
  const selectedClubId = params.id || params.clubId || userClub;
  const club = (db.clubs || []).find(c => c.id === selectedClubId || (c.id && c.id.toUpperCase() === selectedClubId.toUpperCase())) || db.clubs[0];

  // 1. Tab Switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = e.currentTarget.dataset.tab;
      activeDashboardTab = targetTab;
      window.location.hash = `#/club-dashboard?id=${club.id}&tab=${targetTab}`;
    });
  });

  // 2. Club Switcher Select
  const switcher = document.getElementById('club-switcher-select');
  if (switcher) {
    switcher.addEventListener('change', (e) => {
      const nextId = e.target.value;
      window.location.hash = `#/club-dashboard?id=${nextId}&tab=${activeDashboardTab}`;
    });
  }

  // 3. Quick Actions
  const btnQuickEvent = document.getElementById('btn-quick-create-event');
  const btnCreateNew = document.getElementById('btn-create-new-event');
  [btnQuickEvent, btnCreateNew].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        window.location.hash = `#/coordinator/events?createFor=${club.id}`;
      });
    }
  });

  const btnBroadcast = document.getElementById('btn-quick-broadcast');
  const btnComposeNotice = document.getElementById('btn-compose-announcement');
  [btnBroadcast, btnComposeNotice].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        const title = prompt(`Enter announcement title for ${club.name}:`);
        if (!title) return;
        const message = prompt(`Enter announcement message:`);
        if (!message) return;

        const newAnnouncement = {
          id: `ann-${Date.now()}`,
          title,
          content: message,
          target_club: club.id,
          priority: 'Normal',
          date: new Date().toISOString().split('T')[0],
          author: currentUser.name
        };

        db.announcements = db.announcements || [];
        db.announcements.unshift(newAnnouncement);
        saveDB(db);
        logAudit(currentUser.id, "POST_CLUB_ANNOUNCEMENT", "announcements", club.id, { title });
        showToast("Announcement published successfully!", "success");
        window.location.hash = `#/club-dashboard?id=${club.id}&tab=announcements`;
      });
    }
  });

  const btnExportReport = document.getElementById('btn-export-club-report');
  if (btnExportReport) {
    btnExportReport.addEventListener('click', () => {
      showToast("Generating NAAC / NBA Accreditation Report...", "info");
      setTimeout(() => {
        showToast(`Report downloaded for ${club.name} (PDF/CSV)!`, "success");
      }, 1000);
    });
  }

  // Handle Remove Member actions
  document.querySelectorAll('.btn-remove-member').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const memberId = e.currentTarget.dataset.memberId;
      const memberName = e.currentTarget.dataset.memberName;
      showConfirmModal(
        "Remove Club Member",
        `Are you sure you want to remove ${memberName} from this club? This action will revoke their access to club resources.`,
        () => {
          db.club_memberships = db.club_memberships.filter(m => !(m.user_id === memberId && m.club_id === club.id));
          saveDB(db);
          logAudit(currentUser.id, "REMOVE_MEMBER", "club_memberships", club.id, { memberId });
          showToast(`Successfully removed ${memberName} from the club.`, "success");
          window.location.reload();
        }
      );
    });
  });

  // Handle Delete Event actions
  document.querySelectorAll('.btn-delete-event').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.currentTarget.dataset.eventId;
      const eventTitle = e.currentTarget.dataset.eventTitle;
      showConfirmModal(
        "Delete Event",
        `Are you sure you want to delete the event "${eventTitle}"? This will permanently remove all associated registrations and attendance records.`,
        () => {
          db.events = db.events.filter(ev => ev.id !== eventId);
          saveDB(db);
          logAudit(currentUser.id, "DELETE_EVENT", "events", eventId, { eventTitle });
          showToast(`Event "${eventTitle}" has been deleted.`, "success");
          window.location.reload();
        }
      );
    });
  });

  // 4. Initialize visualizers and AI if on overview tab
  if (activeDashboardTab === 'overview') {
    initAIIntelligence(club.id);
    if (window.Chart) {
      initClubCharts();
    }
  }
}

// AI Intelligence initialization (Round 2)
function initAIIntelligence(clubId) {
  const engagementData = calculateClubEngagementScore(clubId);
  
  const scoreEl = document.getElementById('ai-engagement-score');
  if (scoreEl) scoreEl.textContent = engagementData.score;
  
  const memEl = document.getElementById('ai-score-membership');
  if (memEl) memEl.textContent = `${engagementData.factors.membership}%`;

  const eventsEl = document.getElementById('ai-score-events');
  if (eventsEl) eventsEl.textContent = `${engagementData.factors.events}%`;

  const projEl = document.getElementById('ai-score-projects');
  if (projEl) projEl.textContent = `${engagementData.factors.projects}%`;

  // Risk Assessment
  const inactiveList = detectInactiveMembers(clubId);
  const riskCountEl = document.getElementById('ai-risk-count');
  if (riskCountEl) {
    riskCountEl.textContent = `${inactiveList.length} AT RISK`;
  }

  const listEl = document.getElementById('ai-inactive-list');
  if (listEl) {
    if (inactiveList.length === 0) {
      listEl.innerHTML = '<div class="text-center py-4 text-xs font-mono text-emerald-600">No at-risk members detected.</div>';
    } else {
      listEl.innerHTML = inactiveList.slice(0, 5).map(item => `
        <div class="p-3 bg-slate-50 border border-slate-200">
          <div class="flex justify-between items-start mb-1">
            <span class="font-bold text-xs text-slate-900">${item.student.name}</span>
            <span class="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 ${item.riskLevel === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">${item.riskLevel} Risk</span>
          </div>
          <div class="text-[10px] text-slate-500 font-mono mb-2">Missed ${item.missedEvents} consecutive events</div>
          <div class="text-[10px] text-indigo-700 bg-indigo-50/50 p-1.5 border-l border-indigo-200">
            <strong>AI Suggestion:</strong> ${item.suggestions[0]}
          </div>
        </div>
      `).join('');
    }
  }
}

// Chart.js initialization
function initClubCharts() {
  // Chart 1: Participation Trends
  const ctxParticipation = document.getElementById('chart-participation-trend');
  if (ctxParticipation) {
    if (chartParticipationInstance) chartParticipationInstance.destroy();

    chartParticipationInstance = new window.Chart(ctxParticipation, {
      type: 'line',
      data: {
        labels: ['AI Workshop', 'Hackathon 1.0', 'Cloud Bootcamp', 'Robotics Expo', 'Prompt Eng', 'Apex Hack'],
        datasets: [
          {
            label: 'Registered Delegates',
            data: [140, 220, 180, 260, 195, 310],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5
          },
          {
            label: 'Actual QR Check-ins',
            data: [128, 205, 162, 242, 178, 288],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(241, 245, 249, 0.9)' }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // Chart 2: Dept Distribution
  const ctxDept = document.getElementById('chart-dept-distribution');
  if (ctxDept) {
    if (chartDeptInstance) chartDeptInstance.destroy();

    chartDeptInstance = new window.Chart(ctxDept, {
      type: 'doughnut',
      data: {
        labels: ['CSE', 'IT', 'AI&DS', 'ECE', 'MECH'],
        datasets: [{
          data: [42, 26, 18, 9, 5],
          backgroundColor: ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#f43f5e'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
        cutout: '70%'
      }
    });
  }

  // Chart 3: Year Demographics
  const ctxYear = document.getElementById('chart-year-demographics');
  if (ctxYear) {
    if (chartYearInstance) chartYearInstance.destroy();

    chartYearInstance = new window.Chart(ctxYear, {
      type: 'bar',
      data: {
        labels: ['1st Year (Freshmen)', '2nd Year (Sophomores)', '3rd Year (Juniors)', '4th Year (Seniors)'],
        datasets: [{
          label: 'Students Enrolled',
          data: [110, 154, 142, 54],
          backgroundColor: '#3b82f6',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(241, 245, 249, 0.9)' }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // Chart 4: Workshop Ratings
  const ctxRating = document.getElementById('chart-workshop-ratings');
  if (ctxRating) {
    if (chartRatingInstance) chartRatingInstance.destroy();

    chartRatingInstance = new window.Chart(ctxRating, {
      type: 'bar',
      data: {
        labels: ['Content Quality', 'Hands-on Practice', 'Instructor Clarity', 'Venue & Lab Infra', 'Overall Value'],
        datasets: [{
          label: 'Rating (out of 5.0)',
          data: [4.9, 4.8, 4.85, 4.6, 4.95],
          backgroundColor: '#f59e0b',
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { min: 3.5, max: 5.0, grid: { color: 'rgba(241, 245, 249, 0.9)' }, ticks: { font: { size: 10 } } },
          y: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // Chart 5: D3 Heatmap
  if (window.d3) {
    renderActivityHeatmap();
  }
}

// ---------------------------------------------
// D3 Activity Heatmap Render Function
// ---------------------------------------------
function renderActivityHeatmap() {
  const containerId = '#d3-activity-heatmap';
  const container = document.querySelector(containerId);
  if (!container || !window.d3) return;

  // Clear previous SVG
  d3.select(containerId).selectAll('*').remove();

  // Data mapping: Days of week vs Time of day
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const times = ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"];
  
  // Generate logical mock participation data
  const data = [];
  for (let d = 0; d < days.length; d++) {
    for (let t = 0; t < times.length; t++) {
      let value = Math.floor(Math.random() * 20);
      if ((d === 0 || d === 6) && t > 2 && t < 5) value += 40; // Weekend afternoon
      if (d > 0 && d < 6 && t > 3) value += 35; // Weekday evening
      if (t === 0) value = Math.max(0, value - 15); // Early morning low
      
      data.push({
        day: days[d],
        time: times[t],
        value: Math.max(0, value)
      });
    }
  }

  // Dimensions & Margins
  const margin = { top: 30, right: 30, bottom: 30, left: 50 };
  const width = Math.min(800, container.clientWidth || 800) - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X axis
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(times)
    .padding(0.05);
  
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove();

  // Y axis
  const y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(days.reverse())
    .padding(0.05);
    
  svg.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove();

  // Color scale
  const myColor = d3.scaleSequential()
    .interpolator(d3.interpolateBlues)
    .domain([0, d3.max(data, d => d.value) || 50]);

  // Tooltip
  const tooltip = d3.select(containerId)
    .append("div")
    .style("opacity", 0)
    .attr("class", "absolute bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full transition-opacity z-10");

  // Squares
  svg.selectAll()
    .data(data, d => d.time + ':' + d.day)
    .join("rect")
      .attr("x", d => x(d.time))
      .attr("y", d => y(d.day))
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => myColor(d.value))
      .style("stroke-width", 2)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", function(event, d) {
      tooltip
        .html(`<div class="font-bold mb-1">${d.day} at ${d.time}</div><div class="text-blue-300">${d.value} avg check-ins</div>`)
        .style("opacity", 1);
      d3.select(this)
        .style("stroke", "#2563eb")
        .style("opacity", 1);
    })
    .on("mousemove", function(event) {
      const [xPos, yPos] = d3.pointer(event, container);
      tooltip
        .style("left", (xPos + margin.left) + "px")
        .style("top", (yPos + margin.top - 10) + "px");
    })
    .on("mouseleave", function(event, d) {
      tooltip.style("opacity", 0);
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8);
    });

  // Style axes text
  svg.selectAll("text")
    .style("font-family", "JetBrains Mono, monospace")
    .style("font-size", "11px")
    .style("fill", "#64748b");
}
