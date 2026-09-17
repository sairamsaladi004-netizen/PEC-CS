import { getDB, saveDB, logAudit, apiRequest } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { ROLES, normalizeRole, isUserAuthorizedForClub } from '../rbac.js';
import { renderAccessDenied, attachAccessDeniedEvents } from '../components/accessDenied.js';

// Global references to Chart.js instances to allow clean destruction and re-rendering
let chartParticipationInstance = null;
let chartDeptInstance = null;
let chartYearInstance = null;
let chartRatingInstance = null;

export function renderClubAdminDashboardView(params = {}) {
  const db = getDB();
  const currentUser = getCurrentUser() || {};
  const currentRole = normalizeRole(currentUser.role);
  
  // Determine selected club: from query params, or user's assigned club, or fallback
  const userClub = currentUser.clubId || (currentUser.assignedClubs && currentUser.assignedClubs[0]) || "I4-08";
  const selectedClubId = params.id || userClub;

  // SCOPE ENFORCEMENT: Is this user authorized for the requested club?
  if (!isUserAuthorizedForClub(currentUser, selectedClubId)) {
    return renderAccessDenied({
      requiredRole: ROLES.CLUB_ADMIN,
      attemptedRoute: `#/club-dashboard?id=${selectedClubId}`,
      clubId: selectedClubId,
      message: `Access denied. As ${currentRole} (${currentUser.name}), you are restricted to managing your assigned club (${userClub}). You cannot access administrative records for Club ${selectedClubId}.`
    });
  }

  const club = (db.clubs || []).find(c => c.id === selectedClubId) || db.clubs[0];

  // Authorized clubs for switcher dropdown
  let authorizedClubs = [];
  if (currentRole === ROLES.SUPER_ADMIN) {
    authorizedClubs = db.clubs || [];
  } else if (currentRole === ROLES.FACULTY_COORDINATOR) {
    const assigned = currentUser.assignedClubs || [selectedClubId];
    authorizedClubs = (db.clubs || []).filter(c => assigned.includes(c.id));
  } else {
    authorizedClubs = (db.clubs || []).filter(c => c.id === selectedClubId);
  }

  // Budget info from db or fallback
  const budgetInfo = (db.clubBudgets || []).find(b => b.clubId === club.id) || {
    allocated: 75000,
    utilized: 51000,
    claims: []
  };
  const budgetPct = Math.round((budgetInfo.utilized / budgetInfo.allocated) * 100);

  // Events related to this club
  const clubEvents = (db.events || []).filter(e => e.club_id === club.id || e.clubId === club.id);

  // Compute dynamic members and events for selected club
  const clubMemberships = (db.club_memberships || []).filter(m => (m.club_id === club.id || m.clubId === club.id));
  const approvedMembers = clubMemberships.filter(m => m.status === "Approved");
  const pendingMembers = clubMemberships.filter(m => m.status === "Pending");
  const totalMemberCount = Math.max(club.memberCount || 0, approvedMembers.length);

  // Events related to this club
  const clubEvents = (db.events || []).filter(e => e.club_id === club.id || e.clubId === club.id || e.clubName === club.name);
  const todayStr = new Date().toISOString().split("T")[0];
  
  const upcomingEvents = clubEvents.filter(e => (e.date >= todayStr || e.status === "Upcoming" || e.status === "Approved"));
  const previousEvents = clubEvents.filter(e => (e.date < todayStr || e.status === "Completed"));

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Header & Club Switcher Bar -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex items-center space-x-4">
          <img src="${club.logo || club.icon || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'}" alt="${club.name}" class="w-16 h-16 rounded-2xl border-2 border-slate-100 object-cover shadow-sm bg-slate-50 shrink-0" />
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                ${club.category || club.domain || 'Technical Society'}
              </span>
              <span class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Club Admin Portal
              </span>
              <span class="text-xs text-slate-400 font-mono">Academic Year 2025-2026</span>
            </div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight mt-1">${club.name}</h1>
            <p class="text-xs text-slate-500">
              Department of ${club.department} • Faculty Coordinator: <span class="font-semibold text-slate-700">${typeof club.facultyCoordinator === 'object' ? club.facultyCoordinator.name : (club.facultyCoordinator || 'Coordinator')}</span>
            </p>
          </div>
        </div>

        <!-- Club Selector Dropdown & Quick Actions -->
        <div class="flex flex-wrap items-center gap-3">
          ${authorizedClubs.length > 1 ? `
            <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
              <span class="text-xs font-bold text-slate-500">Managing Chapter:</span>
              <select id="club-switcher-select" class="bg-white text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                ${authorizedClubs.map(c => `
                  <option value="${c.id}" ${c.id === club.id ? 'selected' : ''}>
                    ${c.id} - ${c.name}
                  </option>
                `).join('')}
              </select>
            </div>
          ` : `
            <div class="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200">
              Official Admin • ${club.id}
            </div>
          `}

          <a href="#/attendance" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5">
            <span>📷 QR Kiosk</span>
          </a>
          <button id="open-club-broadcast-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>📢 Send Notice</span>
          </button>
        </div>
      </div>

      <!-- High-Level Executive KPI Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Members -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Enrolled Members</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold font-mono">${pendingMembers.length} Pending</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">${totalMemberCount}</div>
          <div class="text-[11px] text-slate-400 font-mono">${approvedMembers.length} Verified Applications</div>
        </div>

        <!-- Attendance / Turnout Rate -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Avg Event Turnout</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono">High Engagement</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-blue-600">89.4%</div>
          <div class="text-[11px] text-emerald-600 font-bold">Verified via QR Scanner</div>
        </div>

        <!-- Activities Hosted -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Scheduled Activities</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold font-mono">${upcomingEvents.length} Upcoming</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-purple-600">${clubEvents.length} Events</div>
          <div class="text-[11px] text-slate-400 font-mono">${previousEvents.length} Conducted</div>
        </div>

        <!-- Annual Budget Health -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Budget Utilization</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold font-mono">${budgetPct}% used</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">₹${(budgetInfo.allocated - budgetInfo.utilized).toLocaleString()}</div>
          <div class="text-[11px] text-slate-400 font-mono">Remaining of ₹${budgetInfo.allocated.toLocaleString()}</div>
        </div>

      </div>

      <!-- Real-Time Student Registration & Pending Membership Requests Alert Banner -->
      ${pendingMembers.length > 0 ? `
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
              <h2 class="text-sm font-black text-amber-900">⚡ Real-Time Membership Alerts (${pendingMembers.length} Pending Application${pendingMembers.length === 1 ? '' : 's'})</h2>
            </div>
            <span class="text-xs text-amber-700 font-mono font-bold">Action Required</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            ${pendingMembers.map(m => `
              <div class="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between space-y-2">
                <div>
                  <div class="flex items-center justify-between font-bold text-slate-900">
                    <span>${m.studentName || m.student_id}</span>
                    <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">${m.department || 'Engineering'}</span>
                  </div>
                  <div class="text-slate-500 text-[11px] font-mono mt-0.5">Roll No: ${m.rollNo || '22A31A0501'} • ID: ${m.membership_id || m.id}</div>
                  <p class="text-slate-600 text-[11px] mt-1.5 italic bg-slate-50 p-2 rounded-xl">"${m.statement || 'Submitted interest in joining technical society workshops.'}"</p>
                </div>
                <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button data-memid="${m.id}" class="approve-mem-btn px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] transition-colors cursor-pointer">
                    ✓ Approve Access
                  </button>
                  <button data-memid="${m.id}" class="reject-mem-btn px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-[11px] border border-rose-200 transition-colors cursor-pointer">
                    ✕ Decline
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div class="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div class="flex items-center space-x-2">
            <span class="text-emerald-500 font-bold">✓</span>
            <span>Real-Time Student Application Stream: All student membership applications are up to date.</span>
          </div>
          <span class="text-slate-400 font-mono text-[11px]">${approvedMembers.length} Active Members Enrolled</span>
        </div>
      `}

      <!-- CLUB DETAILS & ENROLLED MEMBERSHIP ROSTER -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 class="text-base font-bold text-slate-900">Club Details & Member Roster (${approvedMembers.length} Verified)</h2>
            </div>
            <p class="text-xs text-slate-500">Institutional record of enrolled students, roles, and academic departments</p>
          </div>
          <a href="#/clubs?id=${club.id}" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors">
            View Public Page ↗
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
            <div class="font-bold text-slate-900 text-sm">${club.department}</div>
            <p class="text-slate-500 text-[11px]">Primary host branch under Academic Council</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty Coordinator</span>
            <div class="font-bold text-slate-900 text-sm">${typeof club.facultyCoordinator === 'object' ? club.facultyCoordinator.name : (club.facultyCoordinator || 'Designated Coordinator')}</div>
            <p class="text-slate-500 text-[11px]">Official mentor & budget signatory</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Core Focus Areas</span>
            <div class="flex flex-wrap gap-1 mt-1">
              ${(club.focusAreas || ['Technology', 'Skills']).map(f => `
                <span class="px-2 py-0.5 bg-white text-slate-800 font-bold rounded border border-slate-200 text-[10px]">${f}</span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Enrolled Members Table -->
        <div class="overflow-x-auto pt-2">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th class="p-3 pl-4">Member Name</th>
                <th class="p-3">Roll Number</th>
                <th class="p-3">Department</th>
                <th class="p-3">Role</th>
                <th class="p-3">Joined Date</th>
                <th class="p-3 text-right pr-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              ${approvedMembers.length === 0 ? `
                <tr>
                  <td colspan="6" class="p-6 text-center text-slate-400">No student members registered yet.</td>
                </tr>
              ` : approvedMembers.map(m => `
                <tr class="hover:bg-slate-50">
                  <td class="p-3 pl-4 font-bold text-slate-900">${m.studentName || m.student_id}</td>
                  <td class="p-3 font-mono text-slate-500">${m.rollNo || '22A31A0501'}</td>
                  <td class="p-3">${m.department || club.department}</td>
                  <td class="p-3"><span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold text-[10px]">${m.role || 'Member'}</span></td>
                  <td class="p-3 font-mono text-slate-400 text-[11px]">${(m.appliedDate || m.requested_at || '2026-08-15').split('T')[0]}</td>
                  <td class="p-3 text-right pr-4"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">● Active</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- UPCOMING & PREVIOUS EVENTS DETAILS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- UPCOMING EVENTS SECTION -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-base font-bold text-slate-900">Upcoming Scheduled Events (${upcomingEvents.length})</h2>
              <p class="text-xs text-slate-500">Upcoming workshops, hackathons & technical conclaves</p>
            </div>
            <a href="#/events" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors">
              + New Event
            </a>
          </div>

          ${upcomingEvents.length === 0 ? `
            <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-1">
              <div class="font-bold text-slate-700">No Upcoming Events Scheduled</div>
              <div class="text-xs text-slate-400">Click '+ New Event' to schedule workshops for delegates.</div>
            </div>
          ` : `
            <div class="space-y-3">
              ${upcomingEvents.map(evt => `
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div class="flex items-start justify-between">
                    <div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800">${evt.category || evt.type || 'Workshop'}</span>
                      <h3 class="font-black text-slate-900 text-sm mt-1">${evt.title}</h3>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ${evt.status || 'Scheduled'}
                    </span>
                  </div>

                  <div class="text-xs text-slate-600 font-mono space-y-0.5">
                    <div>📅 Date: <strong>${evt.date}</strong> • 🕒 Time: <strong>${evt.time || '10:00 AM'}</strong></div>
                    <div>📍 Venue: <strong>${evt.venue || 'Central Lab'}</strong></div>
                    <div>👥 Registered: <strong>${evt.registeredCount || evt.registered || 140} delegates</strong></div>
                  </div>

                  <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <a href="#/attendance" class="text-blue-600 hover:underline font-bold">
                      Launch Gate QR Scanner →
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- PREVIOUS (PAST) EVENTS DETAILS -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-base font-bold text-slate-900">Previous Events & Turnout Ledger (${previousEvents.length})</h2>
              <p class="text-xs text-slate-500">Completed activities with verified QR attendance numbers</p>
            </div>
            <span class="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold font-mono text-[10px] rounded-full">
              Historical Record
            </span>
          </div>

          ${previousEvents.length === 0 ? `
            <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
              No historical events recorded yet.
            </div>
          ` : `
            <div class="space-y-3">
              ${previousEvents.map(evt => {
                const reg = evt.registeredCount || evt.registered || 180;
                const att = evt.attendedCount || evt.attended || 162;
                const ratio = Math.round((att / reg) * 100);
                return `
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div class="flex items-start justify-between">
                      <div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-800">${evt.category || evt.type || 'Conducted'}</span>
                        <h3 class="font-black text-slate-900 text-sm mt-1">${evt.title}</h3>
                      </div>
                      <span class="text-xs font-bold text-emerald-600 font-mono">${ratio}% Turnout</span>
                    </div>

                    <div class="text-xs text-slate-600 font-mono space-y-0.5">
                      <div>📅 Conducted: <strong>${evt.date}</strong> • 📍 ${evt.venue || 'Lab 3'}</div>
                      <div>Check-ins: <strong>${att} / ${reg} delegates</strong> verified</div>
                    </div>

                    <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div class="bg-emerald-500 h-1.5 rounded-full" style="width: ${ratio}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
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
          </div>

          <div class="h-72 w-full relative">
            <canvas id="chart-participation-trend"></canvas>
          </div>
        </div>

        <!-- CHART 2: Member Distribution Across Departments -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Member Distribution Across Departments</h2>
              <p class="text-xs text-slate-500">Interdisciplinary student enrollment breakdown</p>
            </div>
          </div>

          <div class="h-72 w-full relative flex items-center justify-center">
            <canvas id="chart-dept-distribution"></canvas>
          </div>
        </div>

      </div>

      <!-- Quick Broadcast Announcement Modal -->
      <div id="club-broadcast-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Broadcast Notice to Club Delegates</h3>
              <p class="text-xs text-slate-500">Sends notification to all registered ${club.name} members</p>
            </div>
            <button id="close-club-broadcast-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form id="club-broadcast-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notice Headline</label>
              <input type="text" id="club-notice-title" required placeholder="e.g. Lab 3 Venue Change for Cloud Study Jam" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Target Cohort</label>
              <select id="club-notice-cohort" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500">
                <option value="all">All Enrolled Members (${totalMemberCount})</option>
                <option value="registered">Registered Attendees for Upcoming Event</option>
                <option value="core">Core Executive Team Only</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notice Details</label>
              <textarea id="club-notice-body" rows="3" required placeholder="Please arrive 15 minutes early with your student ID cards..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer">
              Dispatch Notice Broadcast
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function attachClubAdminDashboardEvents(params = {}) {
  // If access denied was rendered
  attachAccessDeniedEvents();

  // Approve pending student membership
  document.querySelectorAll(".approve-mem-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const memId = btn.dataset.memid;
      const db = getDB();
      const mem = (db.club_memberships || []).find(m => m.id === memId);
      if (mem) {
        mem.status = "Approved";
        mem.approved_at = new Date().toISOString();
        mem.remarks = "Approved by Club Admin";
        saveDB(db);
        logAudit("Club Admin", "Approved Student Membership", mem.studentName || mem.student_id, `Club: ${mem.club_id}`);
        showToast("Membership Approved", `Student ${mem.studentName || 'applicant'} approved for club access!`, "success");
        setTimeout(() => window.location.reload(), 300);
      }
    });
  });

  // Reject pending student membership
  document.querySelectorAll(".reject-mem-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const memId = btn.dataset.memid;
      const db = getDB();
      const mem = (db.club_memberships || []).find(m => m.id === memId);
      if (mem) {
        mem.status = "Rejected";
        mem.remarks = "Declined by Club Admin";
        saveDB(db);
        logAudit("Club Admin", "Declined Student Membership", mem.studentName || mem.student_id, `Club: ${mem.club_id}`);
        showToast("Application Status Updated", "Student application was declined.", "info");
        setTimeout(() => window.location.reload(), 300);
      }
    });
  });

  // 1. Club Switcher Select
  const switcher = document.getElementById("club-switcher-select");
  if (switcher) {
    switcher.addEventListener("change", (e) => {
      const selectedId = e.target.value;
      window.location.hash = `#/club-dashboard?id=${selectedId}`;
    });
  }

  // 2. Broadcast Modal Controls
  const openBroadcastBtn = document.getElementById("open-club-broadcast-btn");
  const broadcastModal = document.getElementById("club-broadcast-modal");
  const closeBroadcastBtn = document.getElementById("close-club-broadcast-modal");
  const broadcastForm = document.getElementById("club-broadcast-form");

  if (openBroadcastBtn && broadcastModal) {
    openBroadcastBtn.addEventListener("click", () => broadcastModal.classList.remove("hidden"));
    if (closeBroadcastBtn) closeBroadcastBtn.addEventListener("click", () => broadcastModal.classList.add("hidden"));
    broadcastModal.addEventListener("click", (e) => {
      if (e.target === broadcastModal) broadcastModal.classList.add("hidden");
    });

    if (broadcastForm) {
      broadcastForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("club-notice-title").value;
        const body = document.getElementById("club-notice-body").value;
        const db = getDB();
        const user = getCurrentUser();

        db.announcements.unshift({
          id: `ann-${Date.now().toString().slice(-4)}`,
          title,
          content: body,
          author: `${user.name} (Club Admin)`,
          date: new Date().toISOString().split("T")[0],
          targetRole: "Club Member",
          priority: "High",
          tags: ["Club Notice", "Delegates"]
        });
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Dispatched Club Notice", title, `Target: Members`);
        showToast("Notice Dispatched", "Broadcasting notification to club members.", "success");
        broadcastModal.classList.add("hidden");
        broadcastForm.reset();
      });
    }
  }

  // 3. Export CSV metrics
  const exportBtn = document.getElementById("export-club-metrics-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const db = getDB();
      const rows = [
        ["Event Title", "Category", "Date", "Registered Delegates", "Verified Attendance", "Turnout %", "Venue"],
        ["Google Cloud & Docker Study Jam", "workshop", "2026-09-18", "220", "198", "90%", "Lab 3"],
        ["Cross-Platform Flutter Bootcamp", "bootcamp", "2026-09-05", "160", "142", "88%", "Hall A"],
        ["DevHack 2026: 36-Hour Hackathon", "hackathon", "2026-08-22", "310", "285", "92%", "Auditorium"],
        ["Android Jetpack Compose Sprints", "workshop", "2026-08-10", "180", "156", "86%", "Lab 2"],
        ["Git, GitHub & Open Source Kickoff", "seminar", "2026-07-28", "120", "108", "90%", "Seminar Hall"]
      ];

      const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `PEC_Club_Participation_Metrics_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Metrics Exported", "Participation ledger CSV downloaded.", "success");
    });
  }

  // 4. Render Chart.js Visualizations
  renderClubAdminCharts(params);
}

function renderClubAdminCharts(params = {}) {
  if (!window.Chart) return;

  const db = getDB();
  const defaultClubId = "I4-08";
  const selectedClubId = params.id || defaultClubId;
  const club = db.clubs.find(c => c.id === selectedClubId) || db.clubs[0];

  // Dynamic values tailored to specific club characteristics
  const isAiml = club.id === 'I4-08';
  const isRobo = club.id === 'I4-03';
  const isCyber = club.id === 'I4-06';

  // Department proportions:
  const deptData = isAiml 
    ? [45, 20, 15, 12, 8] 
    : isCyber 
    ? [40, 30, 15, 10, 5]
    : isRobo
    ? [20, 15, 10, 35, 20]
    : [35, 25, 20, 12, 8];

  // Event titles tailored
  const eventLabels = isAiml 
    ? ["Deep Learning Summit", "PyTorch Hands-on Sprint", "Computer Vision Hack", "MLOps Edge Lab", "Turing AI Conclave"]
    : isCyber
    ? ["OWASP Top 10 Lab", "Wireshark Packet Hunt", "Reverse Engineering 101", "Active Directory Pentest", "Campus CTF 2026"]
    : isRobo
    ? ["Autonomous Line Rover", "ROS Gazebo Simulation", "Manipulator Kinematics", "Microcontroller Sprint", "RoboWars Exhibition"]
    : ["Technical Bootcamp", "Annual Symposia", "Hands-on Workshop", "Student Project Expo", "Department Conclave"];

  const registeredData = isAiml 
    ? [140, 180, 165, 190, 240]
    : isCyber
    ? [110, 150, 175, 160, 210]
    : [120, 160, 180, 220, 310];

  const attendedData = isAiml 
    ? [128, 162, 149, 172, 224]
    : isCyber
    ? [98, 136, 158, 144, 192]
    : [108, 142, 156, 198, 285];

  // Destroy previous charts if re-entering or switching
  if (chartParticipationInstance) chartParticipationInstance.destroy();
  if (chartDeptInstance) chartDeptInstance.destroy();
  if (chartYearInstance) chartYearInstance.destroy();
  if (chartRatingInstance) chartRatingInstance.destroy();

  // 1. Chart: Event Participation Trends (Combo Bar + Line)
  const ctxParticipation = document.getElementById("chart-participation-trend");
  if (ctxParticipation) {
    chartParticipationInstance = new window.Chart(ctxParticipation, {
      type: "bar",
      data: {
        labels: eventLabels,
        datasets: [
          {
            label: "Actual Verified Turnout",
            data: attendedData,
            type: "line",
            borderColor: "#10b981",
            backgroundColor: "#10b981",
            borderWidth: 3,
            pointBackgroundColor: "#10b981",
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3,
            order: 1
          },
          {
            label: "Registered Delegates",
            data: registeredData,
            backgroundColor: "rgba(59, 130, 246, 0.75)",
            borderRadius: 8,
            borderSkipped: false,
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: { font: { size: 10, family: 'Inter' } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, family: 'Inter' } }
          }
        },
        plugins: {
          legend: {
            position: "top",
            labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } }
          },
          tooltip: {
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              footer: (items) => {
                const reg = items.find(i => i.datasetIndex === 1)?.raw || 0;
                const att = items.find(i => i.datasetIndex === 0)?.raw || 0;
                const pct = reg > 0 ? Math.round((att / reg) * 100) : 0;
                return `Turnout Efficiency: ${pct}%`;
              }
            }
          }
        }
      }
    });
  }

  // 2. Chart: Member Distribution Across Departments (Doughnut)
  const ctxDept = document.getElementById("chart-dept-distribution");
  if (ctxDept) {
    chartDeptInstance = new window.Chart(ctxDept, {
      type: "doughnut",
      data: {
        labels: [
          "Computer Science (CSE)",
          "Information Tech (IT)",
          "AI & Data Science (AIDS)",
          "Electronics (ECE)",
          "Mechanical (MECH)"
        ],
        datasets: [{
          data: deptData,
          backgroundColor: [
            "#3b82f6", // Blue
            "#10b981", // Emerald
            "#8b5cf6", // Purple
            "#f59e0b", // Amber
            "#f43f5e"  // Rose
          ],
          borderWidth: 3,
          borderColor: "#ffffff",
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 10,
              padding: 12,
              font: { size: 10, family: 'Inter' }
            }
          },
          tooltip: {
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw}% of Members`
            }
          }
        }
      }
    });
  }

  // 3. Chart: Year-of-Study Demographics (Bar Chart)
  const ctxYear = document.getElementById("chart-year-demographics");
  if (ctxYear) {
    chartYearInstance = new window.Chart(ctxYear, {
      type: "bar",
      data: {
        labels: ["1st Year (Inductees)", "2nd Year (Core)", "3rd Year (Organizers)", "4th Year (Mentors)"],
        datasets: [{
          label: "Active Student Members",
          data: [110, 165, 145, 60],
          backgroundColor: ["#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: { font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // 4. Chart: Workshop Satisfaction Ratings (Horizontal Bar)
  const ctxRating = document.getElementById("chart-ratings-bar");
  if (ctxRating) {
    chartRatingInstance = new window.Chart(ctxRating, {
      type: "bar",
      data: {
        labels: eventLabels,
        datasets: [{
          label: "Participant Rating (out of 5.0)",
          data: [4.7, 4.8, 4.9, 4.75, 4.95],
          backgroundColor: "#f59e0b",
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 4.0,
            max: 5.0,
            grid: { color: "#f1f5f9" },
            ticks: { font: { size: 10 } }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => ` Average Rating: ${c.raw} ★`
            }
          }
        }
      }
    });
  }
}
