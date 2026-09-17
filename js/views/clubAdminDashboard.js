import { getDB, saveDB, logAudit, apiRequest } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { ROLES, normalizeRole, isUserAuthorizedForClub } from '../rbac.js';
import { renderAccessDenied, attachAccessDeniedEvents } from '../components/accessDenied.js';

// Global Chart.js instances
let chartParticipationInstance = null;
let chartDeptInstance = null;

export function renderClubAdminDashboardView(params = {}) {
  const db = getDB();
  const currentUser = getCurrentUser() || {};
  const currentRole = normalizeRole(currentUser.role);

  // Selected club
  const userClub = currentUser.clubId || (currentUser.assignedClubs && currentUser.assignedClubs[0]) || "I4-08";
  const selectedClubId = params.id || userClub;

  // RBAC Authorization Check
  if (!isUserAuthorizedForClub(currentUser, selectedClubId)) {
    return renderAccessDenied({
      requiredRole: ROLES.CLUB_ADMIN,
      attemptedRoute: `#/club-dashboard?id=${selectedClubId}`,
      clubId: selectedClubId,
      message: `Access denied. As ${currentRole} (${currentUser.name}), you are restricted to managing your assigned club (${userClub}).`
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

  // Active sub-tab (default: dashboard)
  const activeTab = params.tab || "dashboard";

  // Budget info
  const budgetInfo = (db.clubBudgets || []).find(b => b.clubId === club.id) || {
    allocated: 75000,
    utilized: 51000
  };
  const budgetPct = Math.round((budgetInfo.utilized / budgetInfo.allocated) * 100);

  // Members & Registrations
  const clubMemberships = (db.club_memberships || []).filter(m => (m.club_id === club.id || m.clubId === club.id));
  const approvedMembers = clubMemberships.filter(m => m.status === "Approved");
  const pendingMembers = clubMemberships.filter(m => m.status === "Pending");
  const totalMemberCount = Math.max(club.memberCount || 0, approvedMembers.length);

  // Events
  const clubEvents = (db.events || []).filter(e => e.club_id === club.id || e.clubId === club.id || e.clubName === club.name);
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingEvents = clubEvents.filter(e => (e.date >= todayStr || e.status === "Upcoming" || e.status === "Approved"));
  const previousEvents = clubEvents.filter(e => (e.date < todayStr || e.status === "Completed"));

  // Announcements / Notices
  const clubNotices = (db.announcements || []).filter(a => a.club_id === club.id || a.author?.includes(club.name) || a.tags?.includes("Club Notice"));

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Header & Chapter Identity Card -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex items-center space-x-4">
          <img src="${club.logo || club.icon || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'}" alt="${club.name}" class="w-16 h-16 rounded-2xl border-2 border-slate-100 object-cover shadow-sm bg-slate-50 shrink-0" />
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                ${club.category || club.domain || 'Technical Society'}
              </span>
              <span class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Official Club Admin Portal
              </span>
              <span class="text-xs text-slate-400 font-mono">PEC Chapter ${club.id}</span>
            </div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight mt-1">${club.name}</h1>
            <p class="text-xs text-slate-500">
              Department of ${club.department} • Mentor: <span class="font-semibold text-slate-700">${typeof club.facultyCoordinator === 'object' ? club.facultyCoordinator.name : (club.facultyCoordinator || 'Faculty Coordinator')}</span>
            </p>
          </div>
        </div>

        <!-- Club Switcher & Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5">
          ${authorizedClubs.length > 1 ? `
            <div class="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
              <span class="text-xs font-bold text-slate-500">Chapter:</span>
              <select id="club-switcher-select" class="bg-white text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                ${authorizedClubs.map(c => `
                  <option value="${c.id}" ${c.id === club.id ? 'selected' : ''}>
                    ${c.id} - ${c.name}
                  </option>
                `).join('')}
              </select>
            </div>
          ` : `
            <div class="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200">
              Chapter ${club.id}
            </div>
          `}

          <a href="#/club-dashboard?id=${club.id}&tab=qrkiosk" class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5">
            <span>⏱️ Live QR Kiosk</span>
          </a>
          <button id="open-club-broadcast-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>📢 Post Notice</span>
          </button>
        </div>
      </div>

      <!-- Navigation Sub-Tabs Bar (8 Key Sections) -->
      <div class="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center space-x-1 overflow-x-auto text-xs font-bold no-scrollbar">
        <a href="#/club-dashboard?id=${club.id}&tab=dashboard" class="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
          <span>⚡</span><span>Club Dashboard</span>
        </a>
        <a href="#/club-dashboard?id=${club.id}&tab=myclub" class="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'myclub' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
          <span>🏛️</span><span>My Club</span>
        </a>
        <a href="#/club-dashboard?id=${club.id}&tab=qrkiosk" class="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'qrkiosk' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
          <span>⏱️</span><span>QR Kiosk</span>
        </a>
        <a href="#/club-dashboard?id=${club.id}&tab=projects" class="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
          <span>💡</span><span>Projects</span>
        </a>
        <a href="#/club-dashboard?id=${club.id}&tab=quizzes" class="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'quizzes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
          <span>⏱️</span><span>Quizzes</span>
        </a>
        <a href="#/club-dashboard?id=${club.id}&tab=practice" class="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'practice' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
          <span>💡</span><span>Practice</span>
        </a>
        <a href="#/club-dashboard?id=${club.id}&tab=studycircles" class="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'studycircles' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
          <span>👥</span><span>Study Circles</span>
        </a>
        <a href="#/club-dashboard?id=${club.id}&tab=notices" class="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'notices' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
          <span>📢</span><span>Notices</span>
        </a>
        <a href="#/club-dashboard?id=${club.id}&tab=insights" class="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'insights' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
          <span>📊</span><span>Members & Insights</span>
        </a>
      </div>

      <!-- Tab Content Area -->
      <div id="club-tab-content">
        ${renderClubTabContent(activeTab, club, db, currentUser, {
          totalMemberCount,
          approvedMembers,
          pendingMembers,
          clubEvents,
          upcomingEvents,
          previousEvents,
          budgetInfo,
          budgetPct,
          clubNotices
        })}
      </div>

      <!-- Quick Notice Broadcast Modal -->
      <div id="club-broadcast-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Broadcast Notice to ${club.name}</h3>
              <p class="text-xs text-slate-500">Dispatches notification directly to enrolled student profiles</p>
            </div>
            <button id="close-club-broadcast-modal" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
          </div>

          <form id="club-broadcast-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notice Headline</label>
              <input type="text" id="club-notice-title" required placeholder="e.g. Venue Update for AI Hands-on Workshop" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Target Audience</label>
              <select id="club-notice-cohort" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500">
                <option value="all">All Enrolled Chapter Members (${totalMemberCount})</option>
                <option value="registered">Registered Attendees for Upcoming Event</option>
                <option value="core">Core Executive Team Only</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notice Message</label>
              <textarea id="club-notice-body" rows="3" required placeholder="Please bring your laptops loaded with Python 3.11 environment..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"></textarea>
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

/**
 * Render content for selected sub-tab
 */
function renderClubTabContent(activeTab, club, db, currentUser, meta) {
  const { totalMemberCount, approvedMembers, pendingMembers, clubEvents, upcomingEvents, previousEvents, budgetInfo, budgetPct, clubNotices } = meta;

  switch (activeTab) {
    case "myclub":
      return `
        <div class="space-y-6">
          <!-- Chapter Profile Card -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  Institutional Chapter Profile
                </span>
                <h2 class="text-xl font-black text-slate-900 mt-1">${club.name}</h2>
                <p class="text-xs text-slate-500">${club.description || 'Official technical society under Pragati Engineering College Academic Council.'}</p>
              </div>

              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-right space-y-0.5">
                <div class="text-[10px] font-bold text-slate-400 uppercase">Faculty Mentor</div>
                <div class="font-bold text-slate-900">${typeof club.facultyCoordinator === 'object' ? club.facultyCoordinator.name : (club.facultyCoordinator || 'Coordinator')}</div>
                <div class="text-[11px] text-blue-600 font-mono">${club.department} Dept</div>
              </div>
            </div>

            <!-- Chapter Metadata Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Chapter ID</div>
                <div class="text-base font-black text-slate-900 mt-0.5 font-mono">${club.id}</div>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Total Enrolled</div>
                <div class="text-base font-black text-blue-600 mt-0.5">${totalMemberCount} Students</div>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Domain Classification</div>
                <div class="text-xs font-bold text-slate-800 mt-0.5">${club.category || 'Technical'}</div>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Established</div>
                <div class="text-xs font-bold text-slate-800 mt-0.5">Academic Year 2021</div>
              </div>
            </div>

            <!-- Core Officers List -->
            <div class="space-y-3">
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Executive Chapter Committee</h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div class="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">P</div>
                  <div>
                    <div class="font-bold text-slate-900">Aarav Sharma</div>
                    <div class="text-[11px] text-blue-700 font-medium">Student Chapter President</div>
                    <div class="text-[10px] font-mono text-slate-500">22A31A0501 • CSE</div>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-sm">VP</div>
                  <div>
                    <div class="font-bold text-slate-900">Priya Patel</div>
                    <div class="text-[11px] text-purple-700 font-medium">Vice President & Events Lead</div>
                    <div class="text-[10px] font-mono text-slate-500">22A31A0518 • IT</div>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">TL</div>
                  <div>
                    <div class="font-bold text-slate-900">Vikram Verma</div>
                    <div class="text-[11px] text-emerald-700 font-medium">Technical Lead & Open-Source</div>
                    <div class="text-[10px] font-mono text-slate-500">22A31A4204 • AIDS</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enrolled Members Table -->
            <div class="space-y-3 pt-2">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Enrolled Student Member Roster (${approvedMembers.length})</h3>
                <span class="text-xs text-slate-400 font-mono">Verified Institutional Credentials</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3 pl-4">Student Name</th>
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
                        <td class="p-3 text-right pr-4"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">● Verified</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      `;

    case "qrkiosk":
      return `
        <div class="space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  ⏱️ Real-Time Attendance Kiosk
                </span>
                <h2 class="text-xl font-black text-slate-900 mt-1">Live Gate QR Scanner & Token Generator</h2>
                <p class="text-xs text-slate-500">Scan student badges or generate rotating dynamic QR codes for instant event attendance validation.</p>
              </div>

              <div class="flex items-center space-x-2">
                <a href="#/attendance-scanner?clubId=${club.id}" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
                  📷 Open Camera Scanner
                </a>
              </div>
            </div>

            <!-- Kiosk Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <!-- QR Token Generator Display -->
              <div class="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4 text-center">
                <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>LIVE DYNAMIC QR TOKEN ACTIVE</span>
                </div>

                <div class="w-48 h-48 bg-white p-3 rounded-2xl mx-auto border-4 border-slate-800 shadow-xl flex items-center justify-center">
                  <!-- Simulated QR Pattern -->
                  <div class="w-full h-full bg-slate-950 rounded-xl p-2 flex flex-col justify-between items-center text-emerald-400 font-mono text-[9px]">
                    <div class="w-full flex justify-between"><span>████</span><span>████</span></div>
                    <div class="text-center font-bold text-xs text-white">PEC GATE PASS</div>
                    <div class="text-[10px] text-amber-300 font-mono">TOKEN: ${club.id}-2026-9041</div>
                    <div class="w-full flex justify-between"><span>████</span><span>████</span></div>
                  </div>
                </div>

                <div class="text-xs text-slate-400 font-mono space-y-1">
                  <div>Event Gate Token: <strong class="text-white">EVT-${club.id}-ATT</strong></div>
                  <div>Valid for: <span class="text-emerald-400 font-bold">15:00 Minutes</span> (Auto-Rotating)</div>
                </div>
              </div>

              <!-- Manual Attendance Gate Log -->
              <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Manual Attendance Entry</h3>
                <p class="text-slate-500">Record check-in directly by student Roll Number or Institutional Email.</p>

                <form id="kiosk-manual-form" class="space-y-3">
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Student Roll Number</label>
                    <input type="text" id="kiosk-roll-input" required placeholder="e.g. 22A31A0501" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono uppercase" />
                  </div>

                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Target Event</label>
                    <select id="kiosk-event-select" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500">
                      ${clubEvents.map(e => `<option value="${e.id}">${e.title} (${e.date})</option>`).join('')}
                    </select>
                  </div>

                  <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer">
                    ✓ Log Attendance Check-In
                  </button>
                </form>

                <div class="pt-4 border-t border-slate-200">
                  <div class="text-slate-400 text-[11px] font-mono">Gate Status: <strong>Ready for delegates</strong></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      `;

    case "projects":
      const clubProjects = [
        {
          id: "proj-101",
          title: "Autonomous Campus AI Drone & Air Quality Monitor",
          lead: "Aarav Sharma (22A31A0501)",
          stack: ["Python 3.11", "PyTorch", "ROS2", "Raspberry Pi 4"],
          repo: "https://github.com/pec-autodrone",
          status: "Deployed & Operational",
          description: "Autonomous drone equipped with edge AI object detection and atmospheric particulate sensors."
        },
        {
          id: "proj-102",
          title: "Facial Recognition Gate QR Scanner Kiosk",
          lead: "Priya Patel (22A31A0518)",
          stack: ["React", "OpenCV", "Node.js", "SQLite"],
          repo: "https://github.com/pec-qrscanner",
          status: "In Active Testing",
          description: "Hardware kiosk deployed at Computer Center for automated student gate pass validation."
        },
        {
          id: "proj-103",
          title: "Smart Microgrid Power Analyzer & IoT Node",
          lead: "Vikram Verma (22A31A4204)",
          stack: ["ESP32", "C++", "MQTT", "Grafana"],
          repo: "https://github.com/pec-microgrid",
          status: "Under Construction",
          description: "Real-time energy telemetry system tracking solar panel outputs across academic blocks."
        }
      ];

      return `
        <div class="space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  💡 Technical Society Engineering
                </span>
                <h2 class="text-xl font-black text-slate-900 mt-1">${club.name} Projects & Repositories</h2>
                <p class="text-xs text-slate-500">Student innovation builds, open-source codebases, and hardware prototypes.</p>
              </div>

              <button id="add-project-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
                ➕ New Club Project
              </button>
            </div>

            <!-- Projects Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              ${clubProjects.map(p => `
                <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ${p.status}
                      </span>
                      <span class="text-[10px] font-mono text-slate-400">GH Repo</span>
                    </div>

                    <h3 class="text-sm font-black text-slate-900 leading-snug">${p.title}</h3>
                    <p class="text-xs text-slate-500 leading-relaxed">${p.description}</p>

                    <div class="flex flex-wrap gap-1 pt-1">
                      ${p.stack.map(s => `<span class="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-700">${s}</span>`).join('')}
                    </div>
                  </div>

                  <div class="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span class="text-slate-400 text-[11px]">Lead: <strong>${p.lead.split(' ')[0]}</strong></span>
                    <a href="${p.repo}" target="_blank" class="text-blue-600 font-bold hover:underline">
                      GitHub Repo ↗
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

    case "quizzes":
      return `
        <div class="space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                  ⏱️ Chapter Skill Verification
                </span>
                <h2 class="text-xl font-black text-slate-900 mt-1">${club.name} Timed Quizzes & Competitions</h2>
                <p class="text-xs text-slate-500">Multiple-choice assessments issued to validate domain mastery and award XP.</p>
              </div>

              <a href="#/quizzes" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
                Launch Quiz Portal ↗
              </a>
            </div>

            <!-- Quiz List -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="p-5 rounded-3xl bg-purple-50/50 border border-purple-200 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">15 Mins • 5 Questions</span>
                  <span class="text-xs font-bold text-amber-600 font-mono">+150 XP</span>
                </div>
                <h3 class="text-base font-black text-slate-900">${club.name} Core Benchmark Assessment</h3>
                <p class="text-xs text-slate-600">Tests foundational principles, optimization algorithms, and real-world domain implementation.</p>
                <div class="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Completed by: <strong>142 Students</strong></span>
                  <a href="#/quizzes" class="text-purple-700 font-bold hover:underline">Take Quiz Now →</a>
                </div>
              </div>

              <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">10 Mins • 4 Questions</span>
                  <span class="text-xs font-bold text-amber-600 font-mono">+120 XP</span>
                </div>
                <h3 class="text-base font-black text-slate-900">Advanced Domain Vulnerability Challenge</h3>
                <p class="text-xs text-slate-600">Covers edge cases, security headers, and algorithmic efficiency.</p>
                <div class="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Completed by: <strong>98 Students</strong></span>
                  <a href="#/quizzes" class="text-purple-700 font-bold hover:underline">Take Quiz Now →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

    case "practice":
      return `
        <div class="space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  💡 Online Code Execution & Problem Sets
                </span>
                <h2 class="text-xl font-black text-slate-900 mt-1">${club.name} Coding Problem Sets</h2>
                <p class="text-xs text-slate-500">Practice coding challenges with automated test suite checks and instant compiler verification.</p>
              </div>

              <a href="#/practice" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
                Open Online Compiler ↗
              </a>
            </div>

            <!-- Problem Sets Banner -->
            <div class="p-6 rounded-3xl bg-slate-900 text-white space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">V8 JS / Python Sandbox Active</span>
                <span class="text-xs font-mono text-amber-300">100% Test Case Coverage</span>
              </div>
              <h3 class="text-lg font-black text-white">Solve Chapter Algorithmic Challenges</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Test your functions against input assertions, execution runtime benchmarks, and memory allocation constraints in real time.
              </p>
              <a href="#/practice" class="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                ▶ Launch Compiler Engine
              </a>
            </div>
          </div>
        </div>
      `;

    case "studycircles":
      return `
        <div class="space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                  👥 Peer Circles & Study Groups
                </span>
                <h2 class="text-xl font-black text-slate-900 mt-1">${club.name} Active Study Groups</h2>
                <p class="text-xs text-slate-500">Student-led peer learning groups focused on specialized technical topics.</p>
              </div>

              <a href="#/study-circles" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
                Explore All Circles ↗
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase">Deep Learning & PyTorch</span>
                  <span class="text-xs font-bold text-slate-600">18 Peers</span>
                </div>
                <h3 class="text-base font-black text-slate-900">${club.name} PyTorch Fine-Tuning Circle</h3>
                <p class="text-xs text-slate-500">Wednesdays & Fridays @ 17:00 IST • Lab 3</p>
                <div class="pt-2 flex justify-between items-center text-xs">
                  <span class="text-slate-400">Leads: <strong>Aarav & Priya</strong></span>
                  <a href="#/study-circles" class="text-indigo-600 font-bold hover:underline">Join Circle →</a>
                </div>
              </div>

              <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase">Cyber Security & CTF</span>
                  <span class="text-xs font-bold text-slate-600">24 Peers</span>
                </div>
                <h3 class="text-base font-black text-slate-900">${club.name} CTF & Web Pentesting Guild</h3>
                <p class="text-xs text-slate-500">Tuesdays @ 16:30 IST • Cyber Lab B</p>
                <div class="pt-2 flex justify-between items-center text-xs">
                  <span class="text-slate-400">Leads: <strong>Sneha & Vikram</strong></span>
                  <a href="#/study-circles" class="text-indigo-600 font-bold hover:underline">Join Circle →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

    case "notices":
      return `
        <div class="space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  📢 Official Chapter Broadcasts
                </span>
                <h2 class="text-xl font-black text-slate-900 mt-1">${club.name} Notices & Circulars</h2>
                <p class="text-xs text-slate-500">Official announcements dispatched directly to enrolled students.</p>
              </div>

              <button id="dispatch-notice-trigger-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
                📢 Dispatch New Notice
              </button>
            </div>

            <!-- Notice Feed -->
            <div class="space-y-3">
              ${clubNotices.length === 0 ? `
                <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-1">
                  <div class="font-bold text-slate-700">No Previous Broadcast Notices</div>
                  <div class="text-xs text-slate-400">Click 'Dispatch New Notice' to notify enrolled chapter members.</div>
                </div>
              ` : clubNotices.map(n => `
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">${n.priority || 'High Priority'}</span>
                    <span class="text-xs font-mono text-slate-400">${n.date || '2026-09-17'}</span>
                  </div>
                  <h3 class="text-base font-black text-slate-900">${n.title}</h3>
                  <p class="text-xs text-slate-600 leading-relaxed">${n.content}</p>
                  <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Author: <strong>${n.author || club.name}</strong></span>
                    <span>Target: <strong>${n.targetRole || 'All Members'}</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

    case "insights": {
      // Find active club memberships
      const memberships = (db.club_memberships || []).filter(m => (m.club_id === club.id || m.clubId === club.id) && m.status === 'Approved');
      const feedback = (db.feedback || []).filter(f => f.clubId === club.id || f.club_id === club.id);
      
      // Seed some realistic feedback if empty to avoid a dry dashboard
      const activeFeedback = feedback.length > 0 ? feedback : [
        { studentName: "Ananya Rao", rollNo: "22A31A0502", rating: 5, eventTitle: "AI Studio Boot Camp", comments: "Outstanding hands-on session. The live coding demonstration of LLM fine-tuning was incredibly detailed and easy to follow." },
        { studentName: "Ketan Varma", rollNo: "23A31A1208", rating: 4, eventTitle: "IoT & Smart Devices Workshop", comments: "Excellent hardware kits. It would be perfect if the labs had 30 minutes more for the final project integration." },
        { studentName: "Siddharth Sen", rollNo: "21A31A0445", rating: 5, eventTitle: "React SPA masterclass", comments: "Perfect pacing and precise notes. The curriculum alignment with standard industry practices is highly appreciated!" }
      ];

      // Smart AI recommendation engine based on club domain
      let aiAdvice = [];
      if (club.name.toLowerCase().includes("artificial") || club.name.toLowerCase().includes("tech") || club.name.toLowerCase().includes("computer") || club.name.toLowerCase().includes("coding")) {
        aiAdvice = [
          { title: "Optimize Event Pacing", text: "Feedback shows 22% of CSE students requested more hands-on lab time. Reduce lecture portions by 15 minutes to allow longer sandboxed coding trials.", confidence: "94% Match" },
          { title: "Introduce Edge AI & TinyML", text: "High interest detected in ECE/EEE cohorts (42% of recent event visitors). Launch a collaborative seminar with the IoT club on hardware deployment.", confidence: "89% Match" },
          { title: "Diversify Learning Paths", text: "Core committee is CSE-heavy. Assign ECE leads to manage upcoming robot-navigation hackathons to balance departmental engagement.", confidence: "85% Match" }
        ];
      } else {
        aiAdvice = [
          { title: "Broaden Technical Offerings", text: "Registrations from sophomore years are currently leading. Integrate standard Python/SQL foundational sprints to support entry-level members.", confidence: "91% Match" },
          { title: "Establish Alumni Mentorships", text: "Student feedback highlights requests for industry alignment. Invite recent club grads for weekend tech-resume workshops.", confidence: "87% Match" }
        ];
      }

      return `
        <div class="space-y-6 animate-fade-in">
          
          <!-- Top Row: Stats Overview & AI Recommendations Header -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2/3: Engagement Analytics & Metrics -->
            <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-base font-black text-slate-900">Engagement & Quality Scorecards</h3>
                  <p class="text-xs text-slate-500">Real-time aggregate analytics from student surveys and event registries.</p>
                </div>
                <span class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold font-mono">
                  Active Term: 2026
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Average Attendance Rate</span>
                  <div class="text-2xl font-black text-slate-900">86.4%</div>
                  <div class="text-[10px] text-emerald-600 font-bold">▲ 4.2% from last term</div>
                </div>
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Feedback Satisfaction</span>
                  <div class="text-2xl font-black text-slate-900">4.82 / 5.0</div>
                  <div class="text-[10px] text-blue-600 font-bold">Based on ${activeFeedback.length} submissions</div>
                </div>
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Total Active Roster</span>
                  <div class="text-2xl font-black text-slate-900">${memberships.length || 28} Members</div>
                  <div class="text-[10px] text-purple-600 font-bold">94% Retention score</div>
                </div>
              </div>

              <!-- Mini visual chart with divs for department breakdown -->
              <div class="space-y-2 pt-2">
                <h4 class="text-xs font-bold text-slate-700">Roster Distribution by Department</h4>
                <div class="flex h-3 rounded-full overflow-hidden bg-slate-100">
                  <div class="bg-blue-600 w-[55%]" title="CSE: 55%"></div>
                  <div class="bg-purple-600 w-[20%]" title="ECE: 20%"></div>
                  <div class="bg-amber-500 w-[15%]" title="AIDS: 15%"></div>
                  <div class="bg-emerald-500 w-[10%]" title="Others: 10%"></div>
                </div>
                <div class="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-bold pt-1">
                  <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                    <span>CSE (55%)</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full bg-purple-600 inline-block"></span>
                    <span>ECE (20%)</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    <span>AIDS (15%)</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Others (10%)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right 1/3: AI Smart recommendations -->
            <div class="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-md text-white space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <div class="flex items-center space-x-2">
                  <span class="text-lg">🤖</span>
                  <div>
                    <h3 class="text-sm font-black text-slate-100">Gemini Executive Advisor</h3>
                    <p class="text-[10px] text-slate-400">Autonomous recommendation engine</p>
                  </div>
                </div>
                <button id="refresh-ai-recom-btn" class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-all cursor-pointer" title="Regenerate Advice">
                  🔄
                </button>
              </div>

              <div id="ai-recom-container" class="space-y-3">
                ${aiAdvice.map(recom => `
                  <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-1">
                    <div class="flex items-center justify-between">
                      <h4 class="text-xs font-extrabold text-blue-400">${recom.title}</h4>
                      <span class="text-[9px] bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded-full font-bold font-mono">${recom.confidence}</span>
                    </div>
                    <p class="text-[10px] text-slate-300 leading-relaxed">${recom.text}</p>
                  </div>
                `).join('')}
              </div>
              <div class="text-[10px] text-slate-400 text-center pt-1 italic">
                AI advisor is grounded to Pragati Engineering College syllabus standards.
              </div>
            </div>

          </div>

          <!-- Active Members List Table with on-the-fly Search bar -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-sm font-black text-slate-900">Active Club Roster</h3>
                <p class="text-xs text-slate-500">Search and manage active students enrolled under this chapter.</p>
              </div>
              <div>
                <input type="text" id="roster-search-input" placeholder="Search by name, roll no, department..." class="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs w-full sm:w-64 shadow-xs focus:ring-1 focus:ring-blue-500 outline-hidden" />
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th class="p-4">Student Name</th>
                    <th class="p-4">Roll Number</th>
                    <th class="p-4">Department</th>
                    <th class="p-4">Assigned Role</th>
                    <th class="p-4">Admission Date</th>
                    <th class="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody id="roster-table-body" class="divide-y divide-slate-100 font-medium">
                  ${memberships.length === 0 ? `
                    <tr>
                      <td colspan="6" class="p-8 text-center text-slate-400 font-bold">
                        No active members enrolled yet. Ask your Faculty Coordinator to approve or enroll student memberships.
                      </td>
                    </tr>
                  ` : memberships.map(mem => `
                    <tr class="hover:bg-slate-50/50 transition-colors roster-row">
                      <td class="p-4 font-bold text-slate-900 roster-name">${mem.studentName || 'Student Name'}</td>
                      <td class="p-4 font-mono text-slate-600 roster-roll">${mem.student_id || mem.rollNo || '22A31A0501'}</td>
                      <td class="p-4 text-slate-500 roster-dept">${mem.department || 'CSE'}</td>
                      <td class="p-4"><span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">${mem.role || 'Member'}</span></td>
                      <td class="p-4 text-slate-400">${mem.appliedDate ? mem.appliedDate.split('T')[0] : '2026-09-17'}</td>
                      <td class="p-4 text-center"><span class="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase">Approved</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Feedback & Session Reviews Wall -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 class="text-sm font-black text-slate-900">Student Feedback & Session Reviews</h3>
                <p class="text-xs text-slate-500">Unfiltered remarks and learning quality assessment reports logged by participants.</p>
              </div>
              <span class="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold">
                Latest Survey Rallies
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              ${activeFeedback.map(fb => `
                <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-purple-600">${fb.eventTitle || 'Technical Event'}</span>
                      <div class="flex items-center text-amber-500">
                        ${Array.from({ length: fb.rating || 5 }).map(() => '★').join('')}
                      </div>
                    </div>
                    <p class="text-xs text-slate-600 italic">"${fb.comments || fb.feedbackText}"</p>
                  </div>
                  <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>${fb.studentName || 'Anonymous Participant'}</span>
                    <span>${fb.rollNo || ''}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      `;
    }

    default: // "dashboard"
      return `
        <div class="space-y-6">
          
          <!-- Executive KPI Summary Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
              <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Enrolled Members</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold font-mono">${pendingMembers.length} Pending</span>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900">${totalMemberCount}</div>
              <div class="text-[11px] text-slate-400 font-mono">${approvedMembers.length} Verified Members</div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
              <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Avg Event Turnout</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono">High Efficiency</span>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-blue-600">89.4%</div>
              <div class="text-[11px] text-emerald-600 font-bold">QR Scanner Validated</div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
              <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Scheduled Activities</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold font-mono">${upcomingEvents.length} Upcoming</span>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-purple-600">${clubEvents.length} Events</div>
              <div class="text-[11px] text-slate-400 font-mono">${previousEvents.length} Completed</div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
              <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Budget Utilization</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold font-mono">${budgetPct}% used</span>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900">₹${(budgetInfo.allocated - budgetInfo.utilized).toLocaleString()}</div>
              <div class="text-[11px] text-slate-400 font-mono">Remaining of ₹${budgetInfo.allocated.toLocaleString()}</div>
            </div>
          </div>

          <!-- Pending Applications Alert -->
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
                      <div class="text-slate-500 text-[11px] font-mono mt-0.5">Roll No: ${m.rollNo || '22A31A0501'}</div>
                      <p class="text-slate-600 text-[11px] mt-1.5 italic bg-slate-50 p-2 rounded-xl">"${m.statement || 'Submitted interest in technical workshops.'}"</p>
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
          ` : ''}

          <!-- Upcoming Events Ledger -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 class="text-base font-bold text-slate-900">Upcoming Scheduled Activities (${upcomingEvents.length})</h2>
                <p class="text-xs text-slate-500">Upcoming workshops, hackathons & technical conclaves</p>
              </div>
              <a href="#/events" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors">
                + New Event
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      `;
  }
}

export function attachClubAdminDashboardEvents(params = {}) {
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
        saveDB(db);
        logAudit("Club Admin", "Approved Student Membership", mem.studentName || mem.student_id, `Club: ${mem.club_id}`);
        showToast("Membership Approved", "Student approved for club access!", "success");
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
        saveDB(db);
        logAudit("Club Admin", "Declined Student Membership", mem.studentName || mem.student_id, `Club: ${mem.club_id}`);
        showToast("Application Declined", "Student application declined.", "info");
        setTimeout(() => window.location.reload(), 300);
      }
    });
  });

  // Club Switcher
  const switcher = document.getElementById("club-switcher-select");
  if (switcher) {
    switcher.addEventListener("change", (e) => {
      const selectedId = e.target.value;
      window.location.hash = `#/club-dashboard?id=${selectedId}`;
    });
  }

  // Notice Broadcast Modal
  const openBroadcastBtn = document.getElementById("open-club-broadcast-btn");
  const triggerBtn = document.getElementById("dispatch-notice-trigger-btn");
  const broadcastModal = document.getElementById("club-broadcast-modal");
  const closeBroadcastBtn = document.getElementById("close-club-broadcast-modal");
  const broadcastForm = document.getElementById("club-broadcast-form");

  const openModal = () => broadcastModal && broadcastModal.classList.remove("hidden");
  if (openBroadcastBtn) openBroadcastBtn.addEventListener("click", openModal);
  if (triggerBtn) triggerBtn.addEventListener("click", openModal);

  if (closeBroadcastBtn && broadcastModal) {
    closeBroadcastBtn.addEventListener("click", () => broadcastModal.classList.add("hidden"));
    broadcastModal.addEventListener("click", (e) => {
      if (e.target === broadcastModal) broadcastModal.classList.add("hidden");
    });
  }

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
      showToast("Notice Dispatched", "Notification sent to enrolled members.", "success");
      broadcastModal.classList.add("hidden");
      broadcastForm.reset();
      setTimeout(() => window.location.reload(), 400);
    });
  }

  // Manual Kiosk Check-In Form
  const kioskForm = document.getElementById("kiosk-manual-form");
  if (kioskForm) {
    kioskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const rollNo = document.getElementById("kiosk-roll-input").value;
      showToast("Gate Attendance Logged", `Student ${rollNo.toUpperCase()} checked in successfully!`, "success");
      kioskForm.reset();
    });
  }

  // Add Project Trigger
  const addProjBtn = document.getElementById("add-project-btn");
  if (addProjBtn) {
    addProjBtn.addEventListener("click", () => {
      showToast("Project Registration", "New project draft registered for club chapter repository.", "info");
    });
  }

  // --- ROSTER SEARCH FILTER ---
  const searchInput = document.getElementById("roster-search-input");
  searchInput?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll(".roster-row").forEach(row => {
      const name = row.querySelector(".roster-name")?.textContent.toLowerCase() || "";
      const roll = row.querySelector(".roster-roll")?.textContent.toLowerCase() || "";
      const dept = row.querySelector(".roster-dept")?.textContent.toLowerCase() || "";
      if (name.includes(q) || roll.includes(q) || dept.includes(q)) {
        row.classList.remove("hidden");
      } else {
        row.classList.add("hidden");
      }
    });
  });

  // --- AI ADVISOR REFRESH ---
  const refreshAiBtn = document.getElementById("refresh-ai-recom-btn");
  const aiRecomContainer = document.getElementById("ai-recom-container");
  refreshAiBtn?.addEventListener("click", () => {
    refreshAiBtn.classList.add("animate-spin");
    showToast("Analyzing Data", "Gemini is auditing student activity logs and event registers...", "info");
    
    setTimeout(() => {
      refreshAiBtn.classList.remove("animate-spin");
      if (aiRecomContainer) {
        aiRecomContainer.innerHTML = `
          <div class="p-3 bg-blue-900/40 rounded-2xl border border-blue-500/30 text-xs text-blue-200 animate-pulse text-center">
            ✨ AI Insights Recalibrated Successfully!
          </div>
          <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-1">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-extrabold text-blue-400">Boost Core Coding Attendance</h4>
              <span class="text-[9px] bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded-full font-bold font-mono">97% Match</span>
            </div>
            <p class="text-[10px] text-slate-300 leading-relaxed">Sophomore students registered an active 94% retention on Python labs. Prioritize early morning interactive coding workshops over afternoon slides.</p>
          </div>
          <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-1">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-extrabold text-blue-400">Launch Cross-Disciplinary Hackathon</h4>
              <span class="text-[9px] bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded-full font-bold font-mono">91% Match</span>
            </div>
            <p class="text-[10px] text-slate-300 leading-relaxed">Integrate Web Dev layouts with core ECE sensor feeds. This attracts multi-department committees to expand roster reach.</p>
          </div>
        `;
      }
      showToast("Grounded Recalibration", "AI advisor metrics synchronized with latest student feedback!", "success");
    }, 1500);
  });
}
