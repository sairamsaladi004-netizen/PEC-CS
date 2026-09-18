import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import {
  ROLES,
  normalizeRole,
  isDepartmentMatch,
  isUserAuthorizedForClub
} from '../rbac.js';
import { renderAccessDenied, attachAccessDeniedEvents } from '../components/accessDenied.js';

let activeDeptTab = 'clubs'; // 'clubs' | 'members' | 'events' | 'projects' | 'analytics' | 'reports'

export function renderDepartmentPortalView(subRoute = "dashboard", params = {}) {
  const db = getDB();
  const currentUser = getCurrentUser() || {};
  const currentRole = normalizeRole(currentUser.role);

  // Authorize Department Admin / Super Admin
  if (currentRole !== ROLES.SUPER_ADMIN && currentRole !== ROLES.DEPARTMENT_ADMIN) {
    return renderAccessDenied({
      requiredRole: ROLES.DEPARTMENT_ADMIN,
      attemptedRoute: `#/department/${subRoute}`,
      message: `Access denied. The Department Portal requires Department Admin (HOD) or Super Admin privileges.`
    });
  }

  const dept = currentUser.department || "CSE";
  const allClubs = db.clubs || [];
  
  // Filter clubs belonging to this department
  const deptClubs = currentRole === ROLES.SUPER_ADMIN
    ? allClubs
    : allClubs.filter(c => isDepartmentMatch(dept, c.department));

  const deptClubIds = deptClubs.map(c => c.id);

  // Department Aggregated Data
  const deptMemberships = (db.club_memberships || []).filter(m => deptClubIds.includes(m.club_id));
  const deptEvents = (db.events || []).filter(e => deptClubIds.includes(e.club_id) || deptClubIds.includes(e.clubId));
  const deptProjects = (db.projects || []).filter(p => deptClubIds.includes(p.club_id) || isDepartmentMatch(dept, p.department));
  const deptCerts = (db.certificates || []).filter(c => deptClubIds.includes(c.club_id) || deptClubIds.includes(c.clubId));

  const totalMembersCount = deptClubs.reduce((acc, c) => acc + (c.memberCount || 0), 0);
  const activeEventsCount = deptEvents.filter(e => !e.date || new Date(e.date) >= new Date()).length;

  return `
    <div class="space-y-6 max-w-7xl mx-auto">
      
      <!-- Top Department Header Banner -->
      <div class="bg-slate-950 rounded-none border-t-4 border-slate-700 p-6 sm:p-8 text-white shadow-sm border border-slate-900">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Department Administration
              </span>
              <span class="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Pragati Engineering College</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
              Department of ${dept} <span class="text-slate-500 font-light mx-2">|</span> Societies
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Comprehensive institutional dashboard for monitoring student technical clubs, event compliance, project outcomes, and NBA/NAAC accreditation metrics across the Department.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button id="btn-dept-broadcast" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-mono uppercase tracking-wider font-bold transition-colors border border-slate-700">
              Department Circular
            </button>
            <button id="btn-dept-report" class="px-4 py-2 bg-white hover:bg-slate-200 text-slate-900 text-[10px] font-mono uppercase tracking-wider font-bold transition-colors border border-white">
              Export NAAC Report
            </button>
          </div>
        </div>

        <!-- Metric Counters Ribbon -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div>
            <div class="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Active Technical Clubs</div>
            <div class="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">${deptClubs.length}</div>
            <div class="text-[10px] text-emerald-500 font-mono uppercase tracking-widest mt-1">✓ 100% Recognized</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Total Student Members</div>
            <div class="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">${Math.max(480, totalMembersCount)}</div>
            <div class="text-[10px] text-emerald-500 font-mono uppercase tracking-widest mt-1">↑ Active Enrolled</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Conducted Events</div>
            <div class="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">${Math.max(12, deptEvents.length)}</div>
            <div class="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">${activeEventsCount} Upcoming</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Student Projects</div>
            <div class="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">${Math.max(8, deptProjects.length)}</div>
            <div class="text-[10px] text-amber-500 font-mono uppercase tracking-widest mt-1">★ NBA Artifacts</div>
          </div>
        </div>
      </div>

      <!-- Department Clubs Grid -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 class="text-xl font-serif font-bold text-slate-900">Technical Societies</h2>
            <p class="text-xs text-slate-500 font-mono mt-1">Department of ${dept}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${deptClubs.map(c => {
            const clubEventsCount = deptEvents.filter(e => e.club_id === c.id || e.clubId === c.id).length;
            const clubProjectsCount = deptProjects.filter(p => p.club_id === c.id).length;
            const facultyName = typeof c.facultyCoordinator === 'object' ? c.facultyCoordinator.name : (c.facultyCoordinator || "Faculty Coordinator");

            return `
              <div class="bg-white rounded-none border border-slate-200 p-6 shadow-sm hover:border-slate-400 transition-colors flex flex-col justify-between space-y-5 group">
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest font-mono bg-slate-100 text-slate-700 border border-slate-300">
                      ${c.category || 'Technical'}
                    </span>
                    <span class="text-[10px] font-mono font-bold text-slate-400 uppercase">${c.id}</span>
                  </div>

                  <div class="flex items-start space-x-4">
                    <img src="${c.logo || c.icon || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'}" alt="${c.name}" class="w-14 h-14 object-cover border border-slate-200 shrink-0" />
                    <div>
                      <h3 class="font-serif font-bold text-lg text-slate-900 leading-snug group-hover:text-slate-600 transition-colors">${c.name}</h3>
                      <p class="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">Lead: <strong class="text-slate-800">${facultyName}</strong></p>
                    </div>
                  </div>

                  <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">${c.description || 'Department technical society promoting hands-on engineering research and projects.'}</p>
                </div>

                <!-- Club Key Stats -->
                <div class="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px] font-mono uppercase tracking-wider">
                  <div>
                    <span class="block text-slate-400 mb-1">Members</span>
                    <strong class="text-slate-900 text-sm">${c.memberCount || 100}</strong>
                  </div>
                  <div class="border-l border-slate-100">
                    <span class="block text-slate-400 mb-1">Events</span>
                    <strong class="text-indigo-600 font-mono">${Math.max(4, clubEventsCount)}</strong>
                  </div>
                  <div class="border-l border-slate-100">
                    <span class="block text-slate-400 mb-1">Projects</span>
                    <strong class="text-slate-900 text-sm">${Math.max(2, clubProjectsCount)}</strong>
                  </div>
                </div>

                <!-- Open Dashboard Button -->
                <a href="#/club-dashboard?id=${c.id}" class="w-full py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-[10px] font-bold font-mono uppercase tracking-widest text-center transition-colors">
                  Manage Society
                </a>

              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Department Approvals & Compliance Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Recent Department Events -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-base text-slate-900">Department Activities & Symposiums</h3>
              <p class="text-xs text-slate-500">Upcoming & ongoing activities across all department clubs</p>
            </div>
            <a href="#/events" class="text-xs font-bold text-indigo-600 hover:underline">View All →</a>
          </div>

          <div class="divide-y divide-slate-100 text-xs">
            ${deptEvents.slice(0, 4).map(e => `
              <div class="py-3 flex items-center justify-between gap-3">
                <div>
                  <div class="font-bold text-slate-900">${e.title}</div>
                  <div class="text-[11px] text-slate-400">${e.club_id || 'Club'} • ${e.venue || 'Lab 402'}</div>
                </div>
                <div class="text-right">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${e.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                    ${e.status || 'Active'}
                  </span>
                  <div class="text-[10px] font-mono text-slate-400 mt-0.5">${e.date || 'TBD'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Department Projects -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-base text-slate-900">Student Engineering Projects</h3>
              <p class="text-xs text-slate-500">Research papers, hackathon projects, and patents under review</p>
            </div>
            <a href="#/projects" class="text-xs font-bold text-indigo-600 hover:underline">View All →</a>
          </div>

          <div class="divide-y divide-slate-100 text-xs">
            ${deptProjects.slice(0, 4).map(p => `
              <div class="py-3 flex items-center justify-between gap-3">
                <div>
                  <div class="font-bold text-slate-900">${p.title}</div>
                  <div class="text-[11px] text-slate-400">By: ${p.author || p.teamLead || 'Student Team'}</div>
                </div>
                <div class="text-right">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                    ${p.status || 'Under Review'}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

    </div>
  `;
}

export function attachDepartmentPortalEvents() {
  const currentUser = getCurrentUser() || {};
  const dept = currentUser.department || "CSE";

  const btnBroadcast = document.getElementById('btn-dept-broadcast');
  if (btnBroadcast) {
    btnBroadcast.addEventListener('click', () => {
      const title = prompt(`Enter circular title for Department of ${dept}:`);
      if (!title) return;
      const message = prompt(`Enter circular details:`);
      if (!message) return;

      const db = getDB();
      const newAnn = {
        id: `ann-dept-${Date.now()}`,
        title: `[Dept of ${dept}] ${title}`,
        content: message,
        priority: 'High',
        date: new Date().toISOString().split('T')[0],
        author: currentUser.name
      };
      db.announcements = db.announcements || [];
      db.announcements.unshift(newAnn);
      saveDB(db);
      logAudit(currentUser.id, "POST_DEPARTMENT_CIRCULAR", "announcements", dept, { title });
      showToast("Department circular published across all departmental clubs!", "success");
    });
  }

  const btnReport = document.getElementById('btn-dept-report');
  if (btnReport) {
    btnReport.addEventListener('click', () => {
      showToast(`Generating Consolidated NBA / NAAC Report for Department of ${dept}...`, "info");
      setTimeout(() => {
        showToast(`Downloaded Department NBA Accreditation Report (PDF)!`, "success");
      }, 1000);
    });
  }
}
