import { getCurrentUser } from '../auth.js';
import { getDB, apiRequest } from '../db.js';
import { ROLES, normalizeRole } from '../rbac.js';
import { renderAccessDenied, attachAccessDeniedEvents } from '../components/accessDenied.js';
import { renderDepartmentParticipationChart, renderSystemActivityStream } from '../components/d3Visualizers.js';
import { PermissionGuard, renderSuperAdminGuard, renderApprovalsGuard, renderAnalyticsGuard } from '../components/permissionGuard.js';

export function renderAdminPortalView(subSection = "dashboard") {
  const user = getCurrentUser() || {};
  const currentRole = normalizeRole(user.role);

  if (currentRole !== ROLES.SUPER_ADMIN) {
    return renderAccessDenied({
      requiredRole: ROLES.SUPER_ADMIN,
      attemptedRoute: `#/admin/${subSection || 'dashboard'}`,
      message: `Access denied. The Executive Admin Console is restricted to <strong>Director(Academics)</strong> (Central College Administration). Your active role is <strong>${currentRole}</strong>.`
    });
  }

  const db = getDB();

  const totalUsers = (db.users || []).length;
  const totalStudents = (db.users || []).filter(u => u.role === "Student" || u.role === "Club Student Leader").length;
  const totalClubs = (db.clubs || []).length;
  const totalEvents = (db.events || []).length;
  const totalRegistrations = (db.event_registrations || []).length;
  const totalAttendance = (db.attendance || []).length;
  const totalCertificates = (db.certificates || []).length;
  const totalAuditLogs = (db.audit_logs || []).length;

  const activeTab = subSection || "dashboard";

  return `
    <div class="space-y-6">
      
      <!-- Institutional Governance Header Card -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="flex items-center space-x-4">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'}" class="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500/30 shadow-md" alt="${user.name}" />
          <div>
            <div class="flex items-center space-x-2 flex-wrap">
              <h1 class="text-xl font-black text-slate-900 tracking-tight">${user.name}</h1>
              <span class="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
                Director (Academics)
              </span>
              ${user.isDemo ? '<span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">DEMO ACCOUNT</span>' : ''}
            </div>
            <div class="text-xs text-slate-500 font-medium mt-1">
              <span>Designation: <strong>${user.designation || 'Principal, Pragati Engineering College'}</strong></span>
              <span class="mx-2">•</span>
              <span>Council HQ: <strong class="font-mono text-slate-800">${user.facultyId || 'FAC-PEC-001'}</strong></span>
            </div>
            <div class="text-xs text-rose-700 font-semibold mt-1">
              Autonomous College Administration • Central Council of Technical Societies (CCTSC)
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-2 w-full md:w-auto">
          <button id="admin-publish-ann-btn" class="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5">
            <span>📢</span>
            <span>Issue Institutional Circular</span>
          </button>
          <button onclick="window.print()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all">
            Print Audit Dossier
          </button>
        </div>
      </div>

      <!-- Navigation Tabs for Director(Academics) Portal -->
      <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-bold hide-scrollbar">
        <a href="#/admin/dashboard" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📊 Dashboard
        </a>
        <a href="#/admin/users" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          👥 Users & Roles
        </a>
        <a href="#/admin/departments" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'departments' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🏢 Departments
        </a>
        <a href="#/admin/clubs" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'clubs' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🏛️ Clubs
        </a>
        <a href="#/admin/events" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'events' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📅 Events
        </a>
        <a href="#/admin/projects" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'projects' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🚀 Projects
        </a>
        <a href="#/admin/approvals" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'approvals' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          ✅ Approvals
        </a>
        <a href="#/admin/analytics" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📈 Analytics
        </a>
        <a href="#/admin/notifications" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'notifications' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📢 Notifications
        </a>
        <a href="#/admin/audit-logs" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'audit-logs' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📜 Audit Logs
        </a>
        <a href="#/admin/settings" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          ⚙️ System Settings
        </a>
      </div>

      <!-- MAIN TAB CONTENT -->
      ${renderAdminTabContent(activeTab, { user, db, totalUsers, totalStudents, totalClubs, totalEvents, totalRegistrations, totalAttendance, totalCertificates, totalAuditLogs })}

      <!-- Institutional Circular Modal -->
      <div id="admin-ann-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-bold text-slate-900">Issue Institutional Circular</h3>
            <button id="close-ann-modal-btn" class="text-slate-400 hover:text-slate-700 text-lg">✕</button>
          </div>
          <div id="admin-ann-alert" class="hidden p-2.5 rounded-xl text-xs font-medium"></div>

          <form id="admin-ann-form" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Circular Heading</label>
              <input type="text" id="ann-title" required placeholder="e.g. Annual Technical Festival Chartered Schedules" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                <select id="ann-target" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs">
                  <option value="All Students">All Students & Faculty</option>
                  <option value="CSE">CSE Department</option>
                  <option value="CSE(AIML)">CSE (AIML) Department</option>
                  <option value="IT">IT Department</option>
                  <option value="ECE">ECE Department</option>
                  <option value="EEE">EEE Department</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Priority Classification</label>
                <select id="ann-priority" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs">
                  <option value="critical">Critical / Mandatory</option>
                  <option value="important">Important Notification</option>
                  <option value="normal">General Information</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Circular Directive Content</label>
              <textarea id="ann-content" rows="3" required placeholder="Detailed message from the Principal & Academic Council..." class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"></textarea>
            </div>

            <div class="flex space-x-2 pt-2">
              <button type="submit" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                Publish Circular
              </button>
              <button type="button" id="cancel-ann-btn" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Role Promotion Modal -->
      <div id="role-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
          <h3 class="text-base font-bold text-slate-900">Manage User Role & Permissions</h3>
          <div id="role-alert" class="hidden p-2 rounded-xl text-xs font-medium"></div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">User Identifier</label>
            <input type="text" id="role-user-id" readonly class="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Assign Role</label>
            <select id="role-select" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold">
              <option value="Student">Student</option>
              <option value="Club Student Leader">Club Student Leader (President / VP)</option>
              <option value="Club Coordinator">Club Coordinator (Faculty)</option>
              <option value="Director(Academics)">Director(Academics) (Principal / Council)</option>
            </select>
          </div>

          <div id="club-assign-box">
            <label class="block text-xs font-bold text-slate-700 mb-1">Associated Club</label>
            <select id="role-club-select" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs">
              ${(db.clubs || []).map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('')}
            </select>
          </div>

          <div class="flex space-x-2 pt-2">
            <button id="save-role-btn" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all">
              Save Role Assignment
            </button>
            <button id="cancel-role-btn" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
              Cancel
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

function renderAdminTabContent(tab, ctx) {
  const { user, db, totalUsers, totalStudents, totalClubs, totalEvents, totalRegistrations, totalAttendance, totalCertificates, totalAuditLogs } = ctx;

  switch (tab) {
    case "users":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">User & Role Management</h2>
              <p class="text-xs text-slate-500">Add, edit, deactivate users and assign roles. Manage permissions across all hierarchy levels.</p>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="alert('Opening Role Manager...')" class="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors">
                Manage Roles
              </button>
              <button onclick="alert('Adding new user...')" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all">
                + Add User
              </button>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Registered Campus Accounts</h3>
              <span class="text-xs text-slate-500">${totalUsers} users</span>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">User</th>
                    <th class="p-3">Roll / Faculty ID</th>
                    <th class="p-3">Department</th>
                    <th class="p-3">Role</th>
                    <th class="p-3">Associated Club</th>
                    <th class="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${(db.users || []).map(u => {
                    let roleBadge = "bg-blue-100 text-blue-800";
                    if (u.role === "Club Coordinator") roleBadge = "bg-purple-100 text-purple-800";
                    if (u.role === "Club Student Leader") roleBadge = "bg-emerald-100 text-emerald-800";
                    if (u.role === "Super Admin" || u.role === "Director(Academics)") roleBadge = "bg-rose-100 text-rose-800";

                    return `
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3">
                          <div class="font-bold text-slate-900">${u.name}</div>
                          <div class="text-[10px] text-slate-400">${u.email}</div>
                        </td>
                        <td class="p-3 font-mono font-bold text-slate-700">${u.rollNo || u.facultyId || 'PEC HQ'}</td>
                        <td class="p-3 text-slate-600">${u.department || 'All'}</td>
                        <td class="p-3">
                          <span class="px-2 py-0.5 rounded-full ${roleBadge} text-[10px] font-bold">
                            ${u.role}
                          </span>
                        </td>
                        <td class="p-3 font-mono text-slate-600">${u.clubId || (u.assignedClubs ? u.assignedClubs.join(', ') : '—')}</td>
                        <td class="p-3 text-right">
                          <button data-edit-role="${u.id}" class="edit-role-btn px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 text-[11px] font-bold transition-all">
                            Configure Role
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

    case "clubs":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Club Management</h2>
              <p class="text-xs text-slate-500">Create, approve, edit, activate/deactivate, and manage all 35 official technical chapters.</p>
            </div>
            <div class="flex items-center space-x-2">
              <a href="https://pragati.ac.in/career-guidance-cell/industry-4-0-clubs/" target="_blank" rel="noopener" class="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors hidden sm:block">
                View Official Portal ↗
              </a>
              <button onclick="alert('Creating new club chapter...')" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all">
                + Create Club
              </button>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">Code</th>
                    <th class="p-3">Society Name</th>
                    <th class="p-3">Department</th>
                    <th class="p-3">Designated Faculty Coordinator</th>
                    <th class="p-3">Classification</th>
                    <th class="p-3 text-right">Charter</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${(db.clubs || []).map(c => `
                    <tr class="hover:bg-slate-50/60">
                      <td class="p-3 font-mono font-bold text-slate-700">${c.id}</td>
                      <td class="p-3 font-bold text-slate-900">${c.name}</td>
                      <td class="p-3 font-semibold text-blue-700">${c.department}</td>
                      <td class="p-3 text-slate-700 font-medium">${c.facultyCoordinator}</td>
                      <td class="p-3 text-slate-500">${c.category}</td>
                      <td class="p-3 text-right">
                        <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          CHARTERED
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

    case "departments":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Academic Departments</h2>
              <p class="text-xs text-slate-500">Manage departments, coordinators, and department information.</p>
            </div>
            <button onclick="alert('Managing Academic Departments...')" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all">
              + Add Department
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${(db.departments || [
              { id: "dept-1", code: "CSE", name: "Computer Science & Engineering", hod: "Dr. Rajesh Raman", studentsCount: 480, clubsCount: 6 },
              { id: "dept-2", code: "IT", name: "Information Technology", hod: "Dr. S. K. Murugan", studentsCount: 360, clubsCount: 4 },
              { id: "dept-3", code: "AIDS", name: "Artificial Intelligence & Data Science", hod: "Dr. P. V. Rao", studentsCount: 240, clubsCount: 4 },
              { id: "dept-4", code: "ECE", name: "Electronics & Communication", hod: "Dr. K. V. Sharma", studentsCount: 420, clubsCount: 5 },
              { id: "dept-5", code: "EEE", name: "Electrical & Electronics", hod: "Dr. T. Venkat", studentsCount: 300, clubsCount: 3 },
              { id: "dept-6", code: "MECH", name: "Mechanical Engineering", hod: "Dr. M. Narayanan", studentsCount: 280, clubsCount: 4 }
            ]).map(dept => `
              <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-mono font-bold text-xs">${dept.code}</span>
                  <span class="text-xs text-slate-400 font-mono">${dept.studentsCount || 300} Students</span>
                </div>
                <h3 class="text-sm font-bold text-slate-900">${dept.name}</h3>
                <div class="text-xs text-slate-500">
                  <span>HOD: <strong class="text-slate-700">${dept.hod}</strong></span>
                </div>
                <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span class="text-slate-600 font-medium">${(db.clubs || []).filter(c => c.department === dept.code).length || dept.clubsCount || 4} Chartered Clubs</span>
                  <a href="#/admin/clubs" class="text-rose-600 font-bold hover:underline">View Chapters ↗</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    case "events":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Event Management</h2>
              <p class="text-xs text-slate-500">Approve events, manage registrations, venues, capacity, and attendance.</p>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="alert('Opening Venue Manager...')" class="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors hidden sm:block">
                Manage Venues
              </button>
              <button onclick="window.print()" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all">
                Export Roster
              </button>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">Event Title</th>
                    <th class="p-3">Host Society</th>
                    <th class="p-3">Date</th>
                    <th class="p-3">Venue</th>
                    <th class="p-3">Registrations</th>
                    <th class="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${(db.events || []).map(e => `
                    <tr class="hover:bg-slate-50/60">
                      <td class="p-3 font-bold text-slate-900">${e.title}</td>
                      <td class="p-3 font-semibold text-rose-700">${e.club_name || e.organizer || 'Technical Society'}</td>
                      <td class="p-3 text-slate-600">${e.date}</td>
                      <td class="p-3 text-slate-500">${e.venue || 'Campus Auditorium'}</td>
                      <td class="p-3 font-mono font-bold text-slate-700">${e.registered_count || e.registrations?.length || 15} / ${e.max_seats || 80}</td>
                      <td class="p-3 text-right">
                        <span class="px-2 py-0.5 rounded-full ${e.status === 'Completed' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'} text-[10px] font-bold">
                          ${e.status || 'Active'}
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

    case "certificates":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Central Accredited Credential Ledger</h2>
              <p class="text-xs text-slate-500">Cryptographically verifiable certificates issued by Pragati University and PEC Technical Societies.</p>
            </div>
            <button onclick="window.print()" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs">
              Export Accredited Registry
            </button>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">Certificate ID</th>
                    <th class="p-3">Student Name</th>
                    <th class="p-3">Roll No</th>
                    <th class="p-3">Event / Society</th>
                    <th class="p-3">Award Classification</th>
                    <th class="p-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${(db.certificates || []).map(c => `
                    <tr class="hover:bg-slate-50/60 font-sans">
                      <td class="p-3 font-mono font-bold text-rose-700">${c.certificateId || c.id}</td>
                      <td class="p-3 font-bold text-slate-900">${c.student_name || c.studentName || c.recipientName}</td>
                      <td class="p-3 font-mono text-slate-600">${c.roll_no || c.rollNo || c.recipientRoll}</td>
                      <td class="p-3 text-slate-700">${c.event_name || c.eventName}</td>
                      <td class="p-3 text-slate-500 font-semibold">${c.certificate_type || c.awardType}</td>
                      <td class="p-3 text-right">
                        <a href="#/verify?id=${c.certificateId || c.id}" class="text-blue-600 hover:underline font-bold text-xs">
                          Audit Proof ↗
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

    case "attendance":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Master Institutional Attendance Ledger</h2>
              <p class="text-xs text-slate-500">Cross-society attendance verified through encrypted QR gate scans.</p>
            </div>
            <button onclick="window.print()" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs">
              Export Audit CSV
            </button>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">Record ID</th>
                    <th class="p-3">Student Name</th>
                    <th class="p-3">Roll No</th>
                    <th class="p-3">Event</th>
                    <th class="p-3">Timestamp</th>
                    <th class="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${(db.attendance || []).map(a => {
                    const student = (db.users || []).find(u => u.id === a.student_id);
                    const evt = (db.events || []).find(e => e.id === a.event_id);
                    return `
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-mono font-bold text-slate-700">${a.attendance_id || a.id}</td>
                        <td class="p-3 font-bold text-slate-900">${student ? student.name : a.student_id}</td>
                        <td class="p-3 font-mono text-slate-600">${student ? student.rollNo : '22CS101'}</td>
                        <td class="p-3 text-slate-700 font-medium">${evt ? evt.title : a.event_id}</td>
                        <td class="p-3 text-slate-400">${a.timestamp ? a.timestamp.replace('T', ' ').substring(0, 19) : 'Logged'}</td>
                        <td class="p-3 text-right">
                          <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            PRESENT
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

    case "audit-logs":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Immutable Council Audit Log</h2>
              <p class="text-xs text-slate-500">Cryptographic audit trails of administrative approvals, logins, and ledger modifications.</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">Timestamp</th>
                    <th class="p-3">Actor</th>
                    <th class="p-3">Action</th>
                    <th class="p-3">Target / Record</th>
                    <th class="p-3">Verification Details</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${(db.audit_logs || []).map(log => `
                    <tr class="hover:bg-slate-50/60 font-mono">
                      <td class="p-3 text-slate-400 whitespace-nowrap">${log.timestamp}</td>
                      <td class="p-3 font-bold text-slate-900 whitespace-nowrap">${log.actor || log.user}</td>
                      <td class="p-3 font-bold text-rose-700">${log.action}</td>
                      <td class="p-3 text-slate-700">${log.target || log.affected_record}</td>
                      <td class="p-3 text-slate-500 text-[11px] font-sans">${log.details}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

    case "projects":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Project Management</h2>
              <p class="text-xs text-slate-500">Review, approve, reject, and feature student projects.</p>
            </div>
          </div>
          <div class="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 shadow-xs">
            <span class="text-3xl mb-3 block">🚀</span>
            <p class="text-sm font-bold text-slate-700">Project Repository Operations</p>
            <p class="text-xs mt-1">Global view of all student projects across departments. (Implementation in next phase)</p>
          </div>
        </div>
      `;

    case "approvals":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Central Approvals Console</h2>
              <p class="text-xs text-slate-500">Central place for pending clubs, events, projects, achievements, and requests.</p>
            </div>
          </div>
          <div class="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 shadow-xs">
            <span class="text-3xl mb-3 block">✅</span>
            <p class="text-sm font-bold text-slate-700">Pending Authorization Queue</p>
            <p class="text-xs mt-1">Manage all pending approvals from a single queue. (Implementation in next phase)</p>
          </div>
        </div>
      `;

    case "analytics":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Overall Campus Engagement Analysis</h2>
              <p class="text-xs text-slate-500">Departmental participation compared against total student strength.</p>
            </div>
          </div>
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div id="d3-dept-engagement-chart" class="w-full min-h-[300px]"></div>
          </div>
        </div>
      `;

    case "notifications":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Global Notifications</h2>
              <p class="text-xs text-slate-500">Send announcements and important updates to students and clubs.</p>
            </div>
            <button onclick="alert('Creating global announcement...')" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
              + New Broadcast
            </button>
          </div>
          <div class="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 shadow-xs">
            <span class="text-3xl mb-3 block">📢</span>
            <p class="text-sm font-bold text-slate-700">Broadcast Center</p>
            <p class="text-xs mt-1">Institutional broadcast log and dispatch system. (Implementation in next phase)</p>
          </div>
        </div>
      `;

    case "settings":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">System Settings & Data Management</h2>
              <p class="text-xs text-slate-500">Manage institution settings, security, and database records.</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 class="text-sm font-bold text-slate-800 mb-2">⚙️ General Settings</h3>
              <p class="text-[11px] text-slate-500 mb-4">Manage academic years, branding, and platform configuration.</p>
              <button onclick="alert('Opening platform configuration...')" class="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors">Configure</button>
            </div>
            
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 class="text-sm font-bold text-slate-800 mb-2">💾 Data Management</h3>
              <p class="text-[11px] text-slate-500 mb-4">Export data, manage backups, and maintain database records.</p>
              <button onclick="alert('Initiating full system backup...')" class="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors">Export DB Snapshot</button>
            </div>
            
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 class="text-sm font-bold text-slate-800 mb-2">🛡️ Security</h3>
              <p class="text-[11px] text-slate-500 mb-4">Manage sessions, account verification, and sensitive permissions.</p>
              <button onclick="alert('Opening security center...')" class="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors">Security Center</button>
            </div>
          </div>
        </div>
      `;

    default: // Director(Academics) Overview
      const globalBudgetAllocated = 2500000;
      const globalBudgetUtilized = 1350000;
      const globalBudgetPct = Math.round((globalBudgetUtilized / globalBudgetAllocated) * 100);

      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Director of Academics Dashboard</h2>
              <p class="text-xs text-slate-500">High-level overview of college-wide analytics, departments, clubs, and overall event engagement.</p>
            </div>
          </div>
          
          <!-- God Mode KPI Row -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-rose-400 transition-colors">
              <div class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Depts & Clubs</div>
              <div class="text-xl font-black text-slate-900 mt-1">${(db.departments || []).length || 6} <span class="text-sm text-slate-400 font-medium">/ 35</span></div>
              <div class="text-[9px] text-emerald-600 mt-0.5">100% Chartered</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-rose-400 transition-colors">
              <div class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Students</div>
              <div class="text-xl font-black text-rose-600 mt-1">${totalStudents}</div>
              <div class="text-[9px] text-slate-500 mt-0.5">Verified Pragati users</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-rose-400 transition-colors">
              <div class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Global Events</div>
              <div class="text-xl font-black text-purple-600 mt-1">${totalEvents}</div>
              <div class="text-[9px] text-slate-500 mt-0.5">${totalRegistrations} total passes</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-rose-400 transition-colors">
              <div class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Projects</div>
              <div class="text-xl font-black text-indigo-600 mt-1">${(db.projects || []).length || 124}</div>
              <div class="text-[9px] text-slate-500 mt-0.5">Across all departments</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-rose-400 transition-colors">
              <div class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Budget Utilized</div>
              <div class="text-xl font-black text-amber-600 mt-1">${globalBudgetPct}%</div>
              <div class="text-[9px] text-slate-500 mt-0.5">₹${globalBudgetUtilized.toLocaleString()} used</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-rose-400 transition-colors">
              <div class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Certificates Minted</div>
              <div class="text-xl font-black text-blue-600 mt-1">${totalCertificates}</div>
              <div class="text-[9px] text-slate-500 mt-0.5">SHA-256 verifiable</div>
            </div>
          </div>

          <!-- Institutional Governance & Emergency Operations -->
          <div class="bg-rose-50/50 rounded-3xl p-6 border border-rose-200 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-rose-200/60 pb-3">
              <div class="flex items-center space-x-2">
                <span class="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-sm font-bold border border-rose-200">👑</span>
                <div>
                  <h3 class="text-sm font-black text-rose-950">Executive God Mode Control</h3>
                  <p class="text-[11px] text-rose-700">Top-level institutional overrides and accreditation modules</p>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- NAAC/NBA Compliance Matrix -->
              <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs space-y-3">
                <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Institutional Compliance Score</h4>
                
                <div class="space-y-3 pt-1">
                  <div class="flex items-center justify-between text-[11px] font-bold">
                    <span class="text-slate-700">NAAC Criteria 9 (Co-Curricular)</span>
                    <span class="text-emerald-600">A+ Status</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-emerald-500 h-1.5 rounded-full" style="width: 94%"></div>
                  </div>
                  
                  <div class="flex items-center justify-between text-[11px] font-bold mt-2">
                    <span class="text-slate-700">NBA Student Progression</span>
                    <span class="text-blue-600">92% Met</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-blue-500 h-1.5 rounded-full" style="width: 92%"></div>
                  </div>
                </div>
                
                <button type="button" onclick="alert('Exporting Institutional NBA/NAAC Dossier...')" class="w-full mt-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10px] font-bold transition-colors">
                  Export Master Compliance Report 📥
                </button>
              </div>
              
              <!-- Emergency Operations -->
              <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs space-y-3">
                <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Emergency Directives</h4>
                
                <div class="space-y-2 pt-1">
                  <button type="button" onclick="alert('System Alert: Initiating global halt on all pending events...')" class="w-full flex items-center justify-between p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer group">
                    <span class="text-xs font-bold text-rose-900">🚨 Halt All Club Events Globally</span>
                    <span class="text-[10px] px-2 py-0.5 bg-white rounded text-rose-700 shadow-sm font-mono group-hover:scale-105 transition-transform">EXECUTE</span>
                  </button>
                  
                  <button type="button" onclick="alert('Accessing master budget override panel...')" class="w-full flex items-center justify-between p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer group">
                    <span class="text-xs font-bold text-amber-900">💰 Override Chapter Budgets</span>
                    <span class="text-[10px] px-2 py-0.5 bg-white rounded text-amber-700 shadow-sm font-mono group-hover:scale-105 transition-transform">AUTHORIZE</span>
                  </button>
                  
                  <button type="button" onclick="alert('Forcing mandatory sync with University ERP...')" class="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer group">
                    <span class="text-xs font-bold text-slate-800">⚙️ Force ERP Data Synchronization</span>
                    <span class="text-[10px] px-2 py-0.5 bg-white rounded text-slate-600 shadow-sm font-mono group-hover:scale-105 transition-transform">SYNC</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Hierarchical Analytics Overview -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Hierarchical Management Tree (Departments -> Clubs) -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center space-x-2">
                  <span class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-sm font-bold border border-indigo-200">🏛️</span>
                  <div>
                    <h3 class="text-sm font-black text-slate-900">Institutional Hierarchy & Engagement</h3>
                    <p class="text-[11px] text-slate-500">Department-to-Club organizational mapping</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                ${(db.departments || [
                  { id: "dept-1", code: "CSE", name: "Computer Science & Engineering" },
                  { id: "dept-2", code: "IT", name: "Information Technology" },
                  { id: "dept-3", code: "ECE", name: "Electronics & Communication" }
                ]).map(dept => {
                  const deptClubs = (db.clubs || []).filter(c => c.department === dept.code);
                  const clubCount = deptClubs.length || 4;
                  return `
                  <div class="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                    <div class="p-3 bg-slate-100/80 border-b border-slate-100 flex justify-between items-center">
                      <div class="font-bold text-xs text-slate-800 flex items-center space-x-2">
                        <span class="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-mono">${dept.code}</span>
                        <span>${dept.name}</span>
                      </div>
                      <span class="text-[10px] font-bold text-slate-500">${clubCount} Chapters</span>
                    </div>
                    <div class="p-3 grid grid-cols-2 gap-2">
                      ${[...Array(clubCount)].map((_, i) => {
                        const club = deptClubs[i] || { name: `${dept.code} Tech Society ${i+1}`, members: Math.floor(Math.random()*50)+20 };
                        return `
                        <div class="flex flex-col p-2 bg-white rounded-lg border border-slate-200/60 shadow-sm">
                          <span class="text-[10px] font-bold text-slate-700 truncate">${club.name}</span>
                          <span class="text-[9px] text-slate-400 mt-0.5">${club.members || Math.floor(Math.random()*50)+20} Active Members</span>
                        </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `}).join('')}
              </div>
            </div>

            <!-- D3 Department Participation & Attendance Chart -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center space-x-2">
                  <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold border border-blue-200">📈</span>
                  <div>
                    <h3 class="text-sm font-black text-slate-900">Event Engagement Analytics</h3>
                    <p class="text-[11px] text-slate-500">Cross-department participation & check-ins</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3 text-[10px] font-bold">
                  <span class="flex items-center space-x-1 text-blue-600"><span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span><span>Registered</span></span>
                  <span class="flex items-center space-x-1 text-emerald-600"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span><span>Attendance</span></span>
                </div>
              </div>

              <div id="admin-dept-participation-chart" class="w-full min-h-[250px] flex items-center justify-center"></div>
            </div>

          </div>

          <!-- Global Monitoring & System Firehose -->
          <div class="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden mt-6">
            <!-- Decorative background elements -->
            <div class="absolute -right-8 -top-8 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div class="absolute -left-8 -bottom-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div class="flex items-center justify-between border-b border-slate-700/60 pb-3 relative z-10">
              <div class="flex items-center space-x-2">
                <span class="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center text-sm font-bold border border-slate-700">📡</span>
                <div>
                  <h3 class="text-sm font-black text-white">Global Telemetry & System Firehose</h3>
                  <p class="text-[11px] text-slate-400">Live monitoring of all activities across Pragati CampusTech</p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="flex flex-col items-end">
                  <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Sessions</span>
                  <span class="text-xs font-mono font-bold text-emerald-400">1,248</span>
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">API Latency</span>
                  <span class="text-xs font-mono font-bold text-blue-400">42ms</span>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
              <!-- Security & Access Events -->
              <div class="space-y-3">
                <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700/60 pb-1">Security & Access Events</h4>
                <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  ${(db.audit_logs || []).slice().reverse().slice(0, 10).map(log => `
                    <div class="flex flex-col bg-slate-800/50 p-2.5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-white truncate max-w-[150px]">${log.actor}</span>
                        <span class="text-[9px] font-mono text-slate-400">${new Date(log.timestamp).toLocaleString(undefined, {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                      </div>
                      <div class="flex items-center space-x-1.5 mt-1">
                        <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">${log.role || 'System'}</span>
                        <span class="text-[10px] text-blue-300 truncate">${log.action}</span>
                      </div>
                      <div class="text-[9px] text-slate-400 mt-1 truncate">${log.details || ''}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <!-- System Infrastructure Health -->
              <div class="space-y-4">
                <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700/60 pb-1">Core Infrastructure Health</h4>
                
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <div class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Database Load (Supabase)</div>
                    <div class="text-lg font-black text-white mt-0.5">24%</div>
                    <div class="w-full bg-slate-700 rounded-full h-1 mt-1.5 overflow-hidden">
                      <div class="bg-blue-500 h-1 rounded-full" style="width: 24%"></div>
                    </div>
                  </div>
                  
                  <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <div class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Storage Capacity</div>
                    <div class="text-lg font-black text-white mt-0.5">14.2 GB</div>
                    <div class="text-[9px] text-slate-500 mt-0.5">Used of 50GB allocated</div>
                  </div>
                  
                  <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <div class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Memory Usage</div>
                    <div class="text-lg font-black text-white mt-0.5">68%</div>
                    <div class="w-full bg-slate-700 rounded-full h-1 mt-1.5 overflow-hidden">
                      <div class="bg-amber-500 h-1 rounded-full" style="width: 68%"></div>
                    </div>
                  </div>
                  
                  <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <div class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">System Status</div>
                    <div class="text-sm font-black text-emerald-400 mt-1 flex items-center space-x-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>ALL SYSTEMS GO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      `;
  }
}

export function attachAdminPortalEvents() {
  attachAccessDeniedEvents();

  // Initialize D3 Charts if containers are present
  const deptChartContainer = document.getElementById("d3-dept-engagement-chart");
  const activityStreamContainer = document.getElementById("admin-system-activity-stream");

  if (deptChartContainer || activityStreamContainer) {
    const db = getDB();
    if (deptChartContainer) {
      renderDepartmentParticipationChart("d3-dept-engagement-chart", db);
    }
    if (activityStreamContainer) {
      renderSystemActivityStream("admin-system-activity-stream", db.audit_logs || []);
    }
  }

  // Circular modal
  const annModal = document.getElementById("admin-ann-modal");
  const openAnnBtn = document.getElementById("admin-publish-ann-btn");
  const closeAnnBtn = document.getElementById("close-ann-modal-btn");
  const cancelAnnBtn = document.getElementById("cancel-ann-btn");
  const annForm = document.getElementById("admin-ann-form");
  const annAlert = document.getElementById("admin-ann-alert");

  openAnnBtn?.addEventListener("click", () => annModal?.classList.remove("hidden"));
  closeAnnBtn?.addEventListener("click", () => annModal?.classList.add("hidden"));
  cancelAnnBtn?.addEventListener("click", () => annModal?.classList.add("hidden"));

  annForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("ann-title").value.trim();
    const target = document.getElementById("ann-target").value;
    const priority = document.getElementById("ann-priority").value;
    const content = document.getElementById("ann-content").value.trim();
    const user = getCurrentUser();

    annAlert.className = "p-2.5 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 block";
    annAlert.textContent = "Publishing circular to all student devices...";

    const res = await apiRequest('/api/announcements/create', 'POST', {
      title, content, target_audience: target, priority, author: `${user.name} (Director(Academics))`
    });

    if (res && res.success) {
      annAlert.className = "p-2.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 block";
      annAlert.textContent = "Circular successfully broadcasted!";
      setTimeout(() => {
        annModal?.classList.add("hidden");
        window.location.reload();
      }, 700);
    }
  });

  // Role Edit Modal
  const roleModal = document.getElementById("role-modal");
  const cancelRoleBtn = document.getElementById("cancel-role-btn");
  const saveRoleBtn = document.getElementById("save-role-btn");
  let selectedUserId = null;

  document.querySelectorAll(".edit-role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedUserId = btn.getAttribute("data-edit-role");
      document.getElementById("role-user-id").value = selectedUserId;
      roleModal?.classList.remove("hidden");
    });
  });

  cancelRoleBtn?.addEventListener("click", () => roleModal?.classList.add("hidden"));

  saveRoleBtn?.addEventListener("click", async () => {
    const newRole = document.getElementById("role-select").value;
    const newClub = document.getElementById("role-club-select").value;
    const alertBox = document.getElementById("role-alert");

    alertBox.className = "p-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 block";
    alertBox.textContent = "Saving IAM assignment...";

    const res = await apiRequest('/api/admin/roles/assign', 'POST', {
      userId: selectedUserId,
      role: newRole,
      clubId: newClub,
      assignedClubs: [newClub]
    });

    if (res && res.success) {
      alertBox.className = "p-2 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 block";
      alertBox.textContent = "Role updated successfully!";
      setTimeout(() => {
        roleModal?.classList.add("hidden");
        window.location.reload();
      }, 600);
    }
  });
}
