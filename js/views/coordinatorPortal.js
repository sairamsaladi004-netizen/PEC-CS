import { getCurrentUser } from '../auth.js';
import { getDB, apiRequest } from '../db.js';

export function renderCoordinatorPortalView(subSection = "dashboard") {
  const user = getCurrentUser() || {};
  const db = getDB();

  // Find coordinator's assigned club(s)
  const assignedClubIds = user.assignedClubs || (user.clubId ? [user.clubId] : ["I4-08"]);
  const myClubs = (db.clubs || []).filter(c => assignedClubIds.includes(c.id));
  const primaryClub = myClubs[0] || (db.clubs && db.clubs[0]);

  // Relational data for this coordinator
  const clubMemberships = (db.club_memberships || []).filter(m => assignedClubIds.includes(m.club_id));
  const pendingMemberships = clubMemberships.filter(m => m.status === "Pending");
  const approvedMemberships = clubMemberships.filter(m => m.status === "Approved");

  const clubEvents = (db.events || []).filter(e => assignedClubIds.includes(e.club_id) || assignedClubIds.includes(e.clubId));
  const clubResources = (db.resources || []).filter(r => assignedClubIds.includes(r.club_id) || assignedClubIds.includes(r.clubId));
  const clubReports = (db.activity_reports || []).filter(r => assignedClubIds.includes(r.club_id));
  const clubCertificates = (db.certificates || []).filter(c => assignedClubIds.includes(c.club_id));

  const activeTab = subSection || "dashboard";

  return `
    <div class="space-y-6">
      
      <!-- Coordinator Header Card -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="flex items-center space-x-4">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'}" class="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/30 shadow-md" alt="${user.name}" />
          <div>
            <div class="flex items-center space-x-2 flex-wrap">
              <h1 class="text-xl font-black text-slate-900 tracking-tight">${user.name}</h1>
              <span class="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                ${user.role}
              </span>
              ${user.isDemo ? '<span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">DEMO ACCOUNT</span>' : ''}
            </div>
            <div class="text-xs text-slate-500 font-medium mt-1">
              <span>Dept: <strong>${user.department || 'CSE(AIML)'}</strong></span>
              <span class="mx-2">•</span>
              <span>Faculty ID: <strong class="font-mono text-slate-800">${user.facultyId || 'FAC-CSE-AIML-01'}</strong></span>
            </div>
            <div class="text-xs text-purple-700 font-semibold mt-1">
              Assigned Society: <strong>${primaryClub ? primaryClub.name : 'AI&ML Turing Club'}</strong> (${primaryClub ? primaryClub.id : 'I4-08'})
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-2 w-full md:w-auto">
          <button id="coord-create-event-btn" class="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5">
            <span>➕</span>
            <span>Schedule New Event</span>
          </button>
          <a href="#/coordinator/attendance" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all">
            Live QR Kiosk
          </a>
        </div>
      </div>

      <!-- Navigation Tabs for Coordinator Portal -->
      <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-bold">
        <a href="#/coordinator/dashboard" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📊 Console
        </a>
        <a href="#/coordinator/members" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'members' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          👥 Members & Approvals (${pendingMemberships.length > 0 ? `<span class="px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-full text-[10px] ml-1">${pendingMemberships.length}</span>` : approvedMemberships.length})
        </a>
        <a href="#/coordinator/events" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'events' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📅 Events (${clubEvents.length})
        </a>
        <a href="#/coordinator/attendance" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'attendance' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          ⏱️ Attendance & QR Tokens
        </a>
        <a href="#/coordinator/certificates" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'certificates' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🎓 Issue Certificates (${clubCertificates.length})
        </a>
        <a href="#/coordinator/resources" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'resources' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📚 Resources (${clubResources.length})
        </a>
        <a href="#/coordinator/reports" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'reports' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📄 Activity Reports (${clubReports.length})
        </a>
        <a href="#/coordinator/announcements" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'announcements' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📢 Announcements
        </a>
      </div>

      <!-- MAIN TAB CONTENT -->
      ${renderCoordinatorTabContent(activeTab, { user, db, primaryClub, myClubs, clubMemberships, pendingMemberships, approvedMemberships, clubEvents, clubResources, clubReports, clubCertificates })}

      <!-- Create Event Modal -->
      <div id="create-event-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl my-8 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-bold text-slate-900">Schedule Official Society Event</h3>
            <button id="close-event-modal-btn" class="text-slate-400 hover:text-slate-700 text-lg">✕</button>
          </div>
          <div id="create-event-alert" class="hidden p-2.5 rounded-xl text-xs font-medium"></div>

          <form id="create-event-form" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
              <input type="text" id="ce-title" required placeholder="e.g. Generative AI & LLM Workshop 2026" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Society / Club</label>
                <select id="ce-club" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs">
                  ${myClubs.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Event Category</label>
                <select id="ce-category" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs">
                  <option value="Workshop">Workshop</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Technical Session">Technical Session</option>
                  <option value="Competition">Competition</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input type="date" id="ce-date" required class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                <input type="time" id="ce-start" value="10:00" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                <input type="time" id="ce-end" value="16:00" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Campus Venue</label>
                <input type="text" id="ce-venue" required placeholder="e.g. Central Auditorium, PEC" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Max Capacity (Seats)</label>
                <input type="number" id="ce-capacity" value="100" min="10" max="1000" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Registration Deadline</label>
              <input type="datetime-local" id="ce-deadline" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Description & Objectives</label>
              <textarea id="ce-desc" rows="2" placeholder="Summary of event curriculum, prerequisites, and takeaways..." class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"></textarea>
            </div>

            <div class="flex space-x-2 pt-2">
              <button type="submit" class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                Publish Event
              </button>
              <button type="button" id="cancel-event-create-btn" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `;
}

function renderCoordinatorTabContent(tab, ctx) {
  const { user, db, primaryClub, myClubs, clubMemberships, pendingMemberships, approvedMemberships, clubEvents, clubResources, clubReports, clubCertificates } = ctx;

  switch (tab) {
    case "members":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Student Membership Management</h2>
              <p class="text-xs text-slate-500">Review pending admission applications and govern active club roster.</p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
                ${pendingMemberships.length} Pending Approvals
              </span>
              <span class="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                ${approvedMemberships.length} Active Members
              </span>
            </div>
          </div>

          <!-- Pending Applications Table -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between">
              <h3 class="text-xs font-bold text-amber-900 uppercase tracking-wider">Pending Student Applications</h3>
              <span class="text-xs text-amber-700">${pendingMemberships.length} awaiting decision</span>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">Student Name</th>
                    <th class="p-3">Roll No</th>
                    <th class="p-3">Department</th>
                    <th class="p-3">Application ID</th>
                    <th class="p-3">Requested At</th>
                    <th class="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${pendingMemberships.length > 0 ? pendingMemberships.map(m => {
                    const student = (db.users || []).find(u => u.id === m.student_id);
                    return `
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-bold text-slate-900">${student ? student.name : m.student_id}</td>
                        <td class="p-3 font-mono font-semibold text-slate-700">${student ? student.rollNo : 'PEC'}</td>
                        <td class="p-3 text-slate-600">${student ? student.department : 'CSE'}</td>
                        <td class="p-3 font-mono text-slate-400">${m.membership_id}</td>
                        <td class="p-3 text-slate-400">${m.requested_at ? m.requested_at.substring(0, 10) : 'Recent'}</td>
                        <td class="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button data-review-id="${m.id}" data-action="approve" class="review-membership-btn px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs">
                            ✓ Approve
                          </button>
                          <button data-review-id="${m.id}" data-action="reject" class="review-membership-btn px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold transition-all border border-slate-200">
                            ✕ Reject
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('') : `
                    <tr>
                      <td colspan="6" class="p-8 text-center text-slate-400">All membership requests have been reviewed. No pending applications.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Active Members List -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Chartered Society Roster</h3>
              <span class="text-xs text-slate-500">${approvedMemberships.length} members</span>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">Member Name</th>
                    <th class="p-3">Roll No</th>
                    <th class="p-3">Designation</th>
                    <th class="p-3">Membership ID</th>
                    <th class="p-3">Approved Date</th>
                    <th class="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${approvedMemberships.map(m => {
                    const student = (db.users || []).find(u => u.id === m.student_id);
                    return `
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-bold text-slate-900">${student ? student.name : m.student_id}</td>
                        <td class="p-3 font-mono font-semibold text-slate-700">${student ? student.rollNo : 'PEC'}</td>
                        <td class="p-3 text-slate-700 font-semibold">${m.role || 'Member'}</td>
                        <td class="p-3 font-mono text-slate-400">${m.membership_id}</td>
                        <td class="p-3 text-slate-500">${m.approved_at ? m.approved_at.substring(0, 10) : 'Chartered'}</td>
                        <td class="p-3 text-right">
                          <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ACTIVE
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

    case "attendance":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Attendance Kiosk & Dynamic QR Generator</h2>
              <p class="text-xs text-slate-500">Generate time-bounded cryptographic tokens for physical gate check-in.</p>
            </div>
          </div>

          <!-- QR Generator Control Card -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Session Token Controller</h3>
              
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Select Event</label>
                <select id="gen-event-select" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-500">
                  ${clubEvents.map(e => `<option value="${e.id}">${e.title} (${e.date})</option>`).join('')}
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Token Validity</label>
                  <select id="gen-duration-select" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs">
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="180">3 Hours</option>
                  </select>
                </div>
                <div class="flex items-end">
                  <button id="generate-live-token-btn" class="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                    Generate Live QR Code
                  </button>
                </div>
              </div>
            </div>

            <!-- Active Token Display Area -->
            <div id="live-qr-display-box" class="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-3">
              <div class="text-xs font-bold text-purple-400 uppercase tracking-widest">Active Gate Session Token</div>
              <div id="live-token-value" class="text-2xl sm:text-3xl font-mono font-black tracking-wider text-emerald-400">
                PEC-ATT-READY
              </div>
              <p id="live-token-expiry-text" class="text-xs text-slate-400">Select event and click generate to initiate real-time check-in window.</p>
            </div>
          </div>

          <!-- Attendance Ledger Table -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Attendance Register</h3>
              <button onclick="window.print()" class="text-xs text-purple-600 hover:underline font-bold">
                Export Session Ledger
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">Attendance ID</th>
                    <th class="p-3">Student Name</th>
                    <th class="p-3">Roll No</th>
                    <th class="p-3">Check-in Time</th>
                    <th class="p-3">Method</th>
                    <th class="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${(db.attendance || []).map(a => {
                    const student = (db.users || []).find(u => u.id === a.student_id);
                    return `
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-mono font-bold text-slate-700">${a.attendance_id || a.id}</td>
                        <td class="p-3 font-semibold text-slate-900">${student ? student.name : a.student_id}</td>
                        <td class="p-3 font-mono text-slate-600">${student ? student.rollNo : '22CS101'}</td>
                        <td class="p-3 text-slate-500">${a.timestamp ? a.timestamp.substring(11, 19) : 'Checked in'}</td>
                        <td class="p-3 text-slate-500">${a.verification_method || 'QR Scan'}</td>
                        <td class="p-3 text-right">
                          <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ${a.status}
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

    case "certificates":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Issue Accredited Certificates</h2>
              <p class="text-xs text-slate-500">Mint cryptographic digital certificates with verifiable SHA-256 hashes.</p>
            </div>
            <span class="text-xs text-purple-600 font-bold">${clubCertificates.length} Issued to Date</span>
          </div>

          <!-- Certificate Issuer Form Card -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm max-w-2xl space-y-4">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Mint New Credential</h3>
            <div id="cert-issue-alert" class="hidden p-2.5 rounded-xl text-xs font-medium"></div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Select Event</label>
                <select id="cert-event-select" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs">
                  ${clubEvents.map(e => `<option value="${e.id}">${e.title}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Select Attendee</label>
                <select id="cert-student-select" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs">
                  ${(db.users || []).filter(u => u.role === 'Student').map(s => `<option value="${s.id}">${s.name} (${s.rollNo})</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Certificate Classification</label>
                <select id="cert-type-select" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs">
                  <option value="Certificate of Participation">Certificate of Participation</option>
                  <option value="Certificate of Merit">Certificate of Merit (Winner / Top 3)</option>
                  <option value="Certificate of Excellence">Certificate of Excellence</option>
                  <option value="Organizer Certificate">Organizer Certificate</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Authorized Counter-Signature</label>
                <input type="text" id="cert-sign-input" value="${user.name} & Dr. K. Satyanarayana (Principal)" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium" />
              </div>
            </div>

            <button id="mint-cert-btn" class="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
              Mint & Sign Digital Certificate
            </button>
          </div>

          <!-- Issued Certificates Ledger -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Society Credential Ledger</h3>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">Certificate ID</th>
                    <th class="p-3">Recipient</th>
                    <th class="p-3">Award Type</th>
                    <th class="p-3">Event</th>
                    <th class="p-3">Date</th>
                    <th class="p-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${clubCertificates.map(c => `
                    <tr class="hover:bg-slate-50/60">
                      <td class="p-3 font-mono font-bold text-purple-700">${c.certificateId || c.id}</td>
                      <td class="p-3 font-bold text-slate-900">${c.student_name || c.studentName} (${c.roll_no || c.rollNo})</td>
                      <td class="p-3 font-semibold text-slate-700">${c.certificate_type || c.awardType}</td>
                      <td class="p-3 text-slate-500">${c.event_name || c.eventName}</td>
                      <td class="p-3 text-slate-400">${c.issued_date || c.issueDate || c.date}</td>
                      <td class="p-3 text-right">
                        <a href="#/verify?id=${c.certificateId || c.id}" target="_blank" class="text-blue-600 hover:underline font-bold text-xs">
                          Verify ↗
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

    default: // Dashboard Console Overview
      return `
        <div class="space-y-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Members</div>
              <div class="text-2xl font-black text-slate-900 mt-1">${approvedMemberships.length}</div>
              <div class="text-[10px] text-purple-600 mt-0.5">${pendingMemberships.length} pending review</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Events Conducted</div>
              <div class="text-2xl font-black text-purple-600 mt-1">${clubEvents.length}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Symposiums & workshops</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Credentials Minted</div>
              <div class="text-2xl font-black text-emerald-600 mt-1">${clubCertificates.length}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Verifiable on portal</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Resources</div>
              <div class="text-2xl font-black text-blue-600 mt-1">${clubResources.length}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Guides & materials</div>
            </div>
          </div>

          <!-- Pending Action Alert Box -->
          ${pendingMemberships.length > 0 ? `
            <div class="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <span class="text-xl">⚠️</span>
                <div>
                  <div class="text-xs font-bold text-amber-900">${pendingMemberships.length} Student Membership Applications Pending</div>
                  <div class="text-[11px] text-amber-700 mt-0.5">Review and approve candidates to confer active member status.</div>
                </div>
              </div>
              <a href="#/coordinator/members" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs">
                Review Applications →
              </a>
            </div>
          ` : ''}

          <!-- Society Profile & Chartered Details -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Chartered Club Dossier</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <span class="text-slate-400">Society Name:</span>
                <div class="font-bold text-slate-900 text-sm mt-0.5">${primaryClub ? primaryClub.name : 'AI&ML Turing Club'}</div>
              </div>
              <div>
                <span class="text-slate-400">Accredited Department:</span>
                <div class="font-bold text-slate-900 text-sm mt-0.5">${primaryClub ? primaryClub.department : 'CSE(AIML)'}</div>
              </div>
              <div class="md:col-span-2">
                <span class="text-slate-400">Official Charter & Focus:</span>
                <p class="text-slate-600 mt-1 leading-relaxed">${primaryClub ? primaryClub.description : 'Official student technical society chartered under Career Guidance Cell.'}</p>
              </div>
            </div>
          </div>

        </div>
      `;
  }
}

export function attachCoordinatorPortalEvents() {
  // Event Creation Modal
  const createModal = document.getElementById("create-event-modal");
  const openCreateBtn = document.getElementById("coord-create-event-btn");
  const closeCreateBtn = document.getElementById("close-event-modal-btn");
  const cancelCreateBtn = document.getElementById("cancel-event-create-btn");
  const createForm = document.getElementById("create-event-form");
  const alertBox = document.getElementById("create-event-alert");

  openCreateBtn?.addEventListener("click", () => createModal?.classList.remove("hidden"));
  closeCreateBtn?.addEventListener("click", () => createModal?.classList.add("hidden"));
  cancelCreateBtn?.addEventListener("click", () => createModal?.classList.add("hidden"));

  createForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("ce-title").value.trim();
    const club_id = document.getElementById("ce-club").value;
    const category = document.getElementById("ce-category").value;
    const date = document.getElementById("ce-date").value;
    const start_time = document.getElementById("ce-start").value;
    const end_time = document.getElementById("ce-end").value;
    const venue = document.getElementById("ce-venue").value.trim();
    const max_participants = document.getElementById("ce-capacity").value;
    const registration_deadline = document.getElementById("ce-deadline").value;
    const description = document.getElementById("ce-desc").value.trim();

    const user = getCurrentUser();
    alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 block";
    alertBox.textContent = "Publishing event to college portal...";

    const res = await apiRequest('/api/events/create', 'POST', {
      title, club_id, category, event_type: category, date, start_time, end_time, venue,
      max_participants, registration_deadline, description, created_by: user.name
    });

    if (res && res.success) {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 block";
      alertBox.textContent = "Event scheduled and published!";
      setTimeout(() => {
        createModal?.classList.add("hidden");
        window.location.reload();
      }, 700);
    } else {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 block";
      alertBox.textContent = res?.message || "Failed to create event.";
    }
  });

  // Membership Review Handlers (Approve / Reject)
  document.querySelectorAll(".review-membership-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const membershipId = btn.getAttribute("data-review-id");
      const action = btn.getAttribute("data-action");
      const user = getCurrentUser();

      const remarks = prompt(action === "approve" ? "Optional approval note for student:" : "Reason for decline:");
      const res = await apiRequest('/api/memberships/review', 'POST', {
        membershipId, action, reviewerName: user.name, remarks: remarks || undefined
      });

      if (res && res.success) {
        window.location.reload();
      } else {
        alert(res?.message || "Operation failed.");
      }
    });
  });

  // Live Token Generator
  const genTokenBtn = document.getElementById("generate-live-token-btn");
  genTokenBtn?.addEventListener("click", async () => {
    const eventId = document.getElementById("gen-event-select")?.value;
    const durationMinutes = document.getElementById("gen-duration-select")?.value;
    const user = getCurrentUser();

    if (!eventId) return;
    const res = await apiRequest('/api/attendance/generate-qr', 'POST', { eventId, durationMinutes, coordinatorName: user.name });
    if (res && res.success) {
      document.getElementById("live-token-value").textContent = res.token;
      document.getElementById("live-token-expiry-text").textContent = `Valid until ${res.expiry.replace('T', ' ').substring(0, 19)} UTC • Display this pass code on the lecture screen.`;
    }
  });

  // Mint Certificate Handler
  const mintBtn = document.getElementById("mint-cert-btn");
  mintBtn?.addEventListener("click", async () => {
    const eventId = document.getElementById("cert-event-select")?.value;
    const studentId = document.getElementById("cert-student-select")?.value;
    const certificateType = document.getElementById("cert-type-select")?.value;
    const authorizedSignature = document.getElementById("cert-sign-input")?.value;
    const alertBox = document.getElementById("cert-issue-alert");

    alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 block";
    alertBox.textContent = "Generating cryptographic certificate...";

    const res = await apiRequest('/api/certificates/issue', 'POST', {
      eventId, studentId, certificateType, authorizedSignature
    });

    if (res && res.success) {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 block";
      alertBox.textContent = `Certificate ${res.certificate.id} successfully minted!`;
      setTimeout(() => window.location.reload(), 800);
    } else {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 block";
      alertBox.textContent = res?.message || "Failed to mint certificate.";
    }
  });
}
