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
      <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-bold">
        <a href="#/admin/dashboard" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📊 Executive Console
        </a>
        <a href="#/admin/users" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          👥 RBAC & Users (${totalUsers})
        </a>
        <a href="#/admin/clubs" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'clubs' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🏛️ 35 Official PEC Clubs
        </a>
        <a href="#/admin/departments" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'departments' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🏢 Departments (${(db.departments || []).length})
        </a>
        <a href="#/admin/events" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'events' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📅 Events & Hackathons (${totalEvents})
        </a>
        <a href="#/admin/attendance" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'attendance' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          ⏱️ Master Attendance (${totalAttendance})
        </a>
        <a href="#/admin/certificates" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'certificates' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🎓 Credential Ledger (${totalCertificates})
        </a>
        <a href="#/admin/audit-logs" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'audit-logs' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📜 Council Audit Logs (${totalAuditLogs})
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
              <h2 class="text-lg font-bold text-slate-900">User Identity & Access Management (IAM)</h2>
              <p class="text-xs text-slate-500">Configure role-based access control, promote student leaders, and assign faculty coordinators.</p>
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
              <h2 class="text-lg font-bold text-slate-900">35 Official Pragati Engineering College Clubs</h2>
              <p class="text-xs text-slate-500">Industry 4.0, Co-Curricular, and Cultural societies verified under Career Guidance Cell.</p>
            </div>
            <a href="https://pragati.ac.in/career-guidance-cell/industry-4-0-clubs/" target="_blank" rel="noopener" class="text-xs text-rose-600 hover:underline font-bold">
              Official College Portal ↗
            </a>
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
              <h2 class="text-lg font-bold text-slate-900">Academic Departments & Club Allocations</h2>
              <p class="text-xs text-slate-500">Autonomous engineering disciplines, student representations, and active society affiliations.</p>
            </div>
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
              <h2 class="text-lg font-bold text-slate-900">Institution-Wide Technical Events & Hackathons</h2>
              <p class="text-xs text-slate-500">Monitoring all co-curricular symposiums, coding challenges, and conference activities.</p>
            </div>
            <button onclick="window.print()" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs">
              Export Roster PDF
            </button>
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

    default: // Executive Overview
      return `
        <div class="space-y-6">
          
          <!-- Master KPI Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Official Clubs</div>
              <div class="text-2xl font-black text-slate-900 mt-1">35</div>
              <div class="text-[10px] text-emerald-600 mt-0.5">100% Chartered</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Students</div>
              <div class="text-2xl font-black text-rose-600 mt-1">${totalStudents}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Verified Pragati users</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">College Events</div>
              <div class="text-2xl font-black text-purple-600 mt-1">${totalEvents}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">${totalRegistrations} total passes</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Certificates Minted</div>
              <div class="text-2xl font-black text-blue-600 mt-1">${totalCertificates}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">SHA-256 verifiable</div>
            </div>
          </div>

          <!-- D3 Visualizations: Department Participation & System Activity Stream -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- D3 Department Participation & Attendance Chart -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center space-x-2">
                  <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold border border-blue-200">🏢</span>
                  <div>
                    <h3 class="text-sm font-black text-slate-900">Department-Wise Student Participation & Attendance</h3>
                    <p class="text-[11px] text-slate-500">Cross-department engagement across 35 technical chapters</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3 text-[10px] font-bold">
                  <span class="flex items-center space-x-1 text-blue-600"><span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span><span>Registered</span></span>
                  <span class="flex items-center space-x-1 text-emerald-600"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span><span>Attendance</span></span>
                </div>
              </div>

              <div id="admin-dept-participation-chart" class="w-full min-h-[220px]"></div>
            </div>

            <!-- D3 Real-Time System Activity & Audit Stream -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center space-x-2">
                  <span class="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center text-sm font-bold border border-rose-200">⚡</span>
                  <div>
                    <h3 class="text-sm font-black text-slate-900">Real-Time System Activity & Governance Telemetry</h3>
                    <p class="text-[11px] text-slate-500">Audit actions, QR check-ins, approvals, and credential minting</p>
                  </div>
                </div>
                <span class="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                  ${totalAuditLogs} Logged
                </span>
              </div>

              <div id="admin-system-activity-stream" class="w-full min-h-[180px]"></div>
            </div>

          </div>

          <!-- Institutional Governance Quick Links -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="#/admin/users" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-md transition-all group">
              <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg mb-3">
                👥
              </div>
              <h4 class="text-xs font-bold text-slate-900 group-hover:text-rose-600">RBAC Identity Management</h4>
              <p class="text-xs text-slate-500 mt-1">Assign club coordinators, promote student leaders, and enforce department authorities.</p>
            </a>

            <a href="#/admin/attendance" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-md transition-all group">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg mb-3">
                ⏱️
              </div>
              <h4 class="text-xs font-bold text-slate-900 group-hover:text-blue-600">Cross-Society Attendance</h4>
              <p class="text-xs text-slate-500 mt-1">Audit gate check-ins, percentage thresholds, and download official NAAC/NBA rosters.</p>
            </a>

            <a href="#/admin/audit-logs" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-md transition-all group">
              <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg mb-3">
                📜
              </div>
              <h4 class="text-xs font-bold text-slate-900 group-hover:text-slate-800">Council Audit Trails</h4>
              <p class="text-xs text-slate-500 mt-1">Tamper-evident logs of every approval, credential minting, and administrative action.</p>
            </a>
          </div>

        </div>
      `;
  }
}

export function attachAdminPortalEvents() {
  attachAccessDeniedEvents();

  // Initialize D3 Charts if containers are present
  const deptChartContainer = document.getElementById("admin-dept-participation-chart");
  const activityStreamContainer = document.getElementById("admin-system-activity-stream");

  if (deptChartContainer || activityStreamContainer) {
    const db = getDB();
    if (deptChartContainer) {
      renderDepartmentParticipationChart("admin-dept-participation-chart", db);
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
