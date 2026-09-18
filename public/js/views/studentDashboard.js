import { getCurrentUser } from '../auth.js';
import { getDB, apiRequest } from '../db.js';

export function renderStudentDashboardView(subSection = "dashboard") {
  const user = getCurrentUser() || {};
  const db = getDB();

  // Relational data calculations
  const myMemberships = (db.club_memberships || []).filter(m => m.student_id === user.id);
  const myApprovedClubs = myMemberships.filter(m => m.status === "Approved");
  const myPendingClubs = myMemberships.filter(m => m.status === "Pending");
  
  const myRegistrations = (db.event_registrations || []).filter(r => r.student_id === user.id && r.status === "Confirmed");
  const myAttendance = (db.attendance || []).filter(a => a.student_id === user.id && a.status === "Present");
  const myCertificates = (db.certificates || []).filter(c => c.student_id === user.id || c.studentId === user.id);
  const myAnnouncements = (db.announcements || []).filter(a => a.target_audience === "All Students" || a.target_id === "all" || (user.department && a.target_id === user.department));

  const totalRegistered = myRegistrations.length;
  const attendedCount = myAttendance.length;
  const attendanceRate = totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 100;

  // Active sub-tab
  const activeTab = subSection || "dashboard";

  return `
    <div class="space-y-6">
      
      <!-- Student Identity & Status Card -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div class="flex items-center space-x-4">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}" class="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/30 shadow-md" alt="${user.name}" />
          <div>
            <div class="flex items-center space-x-2 flex-wrap">
              <h1 class="text-xl font-black text-slate-900 tracking-tight">${user.name}</h1>
              <span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                ${user.role}
              </span>
              ${user.isDemo ? '<span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">DEMO ACCOUNT</span>' : ''}
              ${user.emailVerified ? '<span class="text-emerald-600 text-xs font-semibold flex items-center">✓ Verified Email</span>' : '<span class="text-rose-600 text-xs font-semibold">⚠ Email Unverified</span>'}
            </div>
            <div class="text-xs text-slate-500 font-medium mt-1 flex items-center space-x-3 flex-wrap">
              <span>Roll No: <strong class="text-slate-800 font-mono">${user.rollNo || '22CS101'}</strong></span>
              <span>•</span>
              <span>Dept: <strong class="text-slate-800">${user.department || 'CSE'}</strong></span>
              <span>•</span>
              <span>Year: <strong class="text-slate-800">${user.year || '3rd Year'}</strong> (${user.section ? `Sec ${user.section}` : ''})</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-1 font-mono">Institutional ID: ${user.membershipId || 'PEC-MEM-2026-CSE-8492'}</div>
          </div>
        </div>

        <!-- Quick Top Action Buttons -->
        <div class="flex items-center space-x-2 w-full md:w-auto">
          <button id="open-scan-qr-btn" class="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 transition-all">
            <span>📷</span>
            <span>Scan Attendance QR</span>
          </button>
          <a href="#/membership-card" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all">
            Digital ID
          </a>
          <a href="#/student-profile" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all">
            Edit Profile
          </a>
        </div>
      </div>

      <!-- Navigation Tabs for Student Portal -->
      <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-bold">
        <a href="#/student/dashboard" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📊 Overview
        </a>
        <a href="#/student/clubs" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'clubs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🏛️ My Clubs & Applications (${myMemberships.length})
        </a>
        <a href="#/student/events" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'events' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🎟️ Events & Passes (${myRegistrations.length})
        </a>
        <a href="#/student/attendance" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          ⏱️ Attendance Record (${attendanceRate}%)
        </a>
        <a href="#/student/certificates" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'certificates' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🎓 Certificates (${myCertificates.length})
        </a>
        <a href="#/student/resources" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'resources' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          📚 Learning Resources
        </a>
        <a href="#/student/projects" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          💡 Projects
        </a>
      </div>

      <!-- MAIN TAB CONTENT SWITCHER -->
      ${renderSubSectionContent(activeTab, { user, db, myMemberships, myApprovedClubs, myPendingClubs, myRegistrations, myAttendance, myCertificates, myAnnouncements, attendanceRate })}

      <!-- Scan Attendance QR Modal -->
      <div id="scan-qr-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl mx-auto">
            📷
          </div>
          <div class="text-center">
            <h3 class="text-lg font-bold text-slate-900">Record Event Attendance</h3>
            <p class="text-xs text-slate-500 mt-1">
              Scan the session QR displayed by your Faculty Coordinator or input the live attendance pass code.
            </p>
          </div>
          <div id="scan-alert" class="hidden p-2.5 rounded-xl text-xs font-medium"></div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Live Attendance Token / Pass Code</label>
            <input type="text" id="attendance-token-input" placeholder="e.g. PEC-ATT-XXXX or Token from screen" class="w-full text-center tracking-wider text-sm font-mono font-bold py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500" />
            <p class="text-[10px] text-slate-400 mt-1 text-center">Tokens are generated during active event sessions by coordinators.</p>
          </div>

          <div class="flex space-x-2">
            <button id="submit-scan-token-btn" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all">
              Verify Attendance
            </button>
            <button id="close-scan-modal-btn" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
              Cancel
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

function renderSubSectionContent(tab, ctx) {
  const { user, db, myMemberships, myApprovedClubs, myPendingClubs, myRegistrations, myAttendance, myCertificates, myAnnouncements, attendanceRate } = ctx;

  switch (tab) {
    case "clubs":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">My Society Memberships</h2>
              <p class="text-xs text-slate-500">Track application statuses across Industry 4.0, Co-Curricular, and Extra-Curricular clubs.</p>
            </div>
            <a href="#/clubs" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs">
              Explore All 35 Clubs →
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${myMemberships.length > 0 ? myMemberships.map(m => {
              const club = (db.clubs || []).find(c => c.id === m.club_id);
              let statusBadge = "bg-amber-100 text-amber-800";
              if (m.status === "Approved") statusBadge = "bg-emerald-100 text-emerald-800";
              if (m.status === "Rejected") statusBadge = "bg-rose-100 text-rose-800";

              return `
                <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge}">
                        ${m.status.toUpperCase()}
                      </span>
                      <span class="text-[10px] text-slate-400 font-mono">${m.membership_id || 'PENDING'}</span>
                    </div>
                    <h3 class="text-sm font-bold text-slate-900">${club ? club.name : m.club_id}</h3>
                    <p class="text-xs text-slate-500 mt-1">Department: <strong>${club ? club.department : 'PEC'}</strong> • Coordinator: ${club ? club.facultyCoordinator : 'Faculty'}</p>
                    ${m.remarks ? `<p class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-3 border border-slate-100">💬 <strong>Coordinator Note:</strong> ${m.remarks}</p>` : ''}
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span class="text-[11px] text-slate-400">Role: <strong class="text-slate-700">${m.role || 'Member'}</strong></span>
                    <a href="#/clubs?id=${m.club_id}" class="text-blue-600 hover:underline font-semibold text-xs">View Club Info →</a>
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="col-span-2 p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <div class="text-3xl mb-2">🏛️</div>
                <h3 class="text-sm font-bold text-slate-800">No Club Applications Yet</h3>
                <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Browse the 35 verified technical and cultural clubs of Pragati Engineering College and submit your application.</p>
                <a href="#/clubs" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs">Browse Official Clubs</a>
              </div>
            `}
          </div>
        </div>
      `;

    case "events":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">My Registered Events</h2>
              <p class="text-xs text-slate-500">Access ticket passes, event schedules, and check-in codes.</p>
            </div>
            <a href="#/events" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs">
              Browse Upcoming Events →
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${myRegistrations.length > 0 ? myRegistrations.map(r => {
              const evt = (db.events || []).find(e => e.id === r.event_id);
              if (!evt) return '';
              const attended = myAttendance.some(a => a.event_id === evt.id);

              return `
                <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div class="p-5">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${attended ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                        ${attended ? 'ATTENDED (PRESENT)' : 'CONFIRMED PASS'}
                      </span>
                      <span class="text-[10px] font-mono text-slate-500 font-bold">${r.ticket_id}</span>
                    </div>
                    <h3 class="text-sm font-bold text-slate-900 line-clamp-2">${evt.title}</h3>
                    <div class="text-xs text-slate-500 mt-2 space-y-1">
                      <div>📅 <strong>${evt.date}</strong> (${evt.start_time || evt.time || '09:00'})</div>
                      <div class="truncate">📍 ${evt.venue}</div>
                    </div>
                  </div>
                  
                  <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button data-cancel-reg="${evt.id}" class="cancel-reg-btn text-[11px] text-rose-600 hover:underline font-semibold">
                      Cancel Pass
                    </button>
                    <button data-pass-code="${r.ticket_id}" data-event-title="${evt.title}" class="show-ticket-btn px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px] font-bold hover:bg-slate-100">
                      View QR Ticket
                    </button>
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="col-span-3 p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <div class="text-3xl mb-2">🎟️</div>
                <h3 class="text-sm font-bold text-slate-800">No Event Passes Found</h3>
                <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">You have not registered for any upcoming symposiums or workshops yet.</p>
                <a href="#/events" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs">View College Events Calendar</a>
              </div>
            `}
          </div>
        </div>
      `;

    case "attendance":
      return `
        <div class="space-y-6">
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Institutional Standing</span>
              <h2 class="text-2xl font-black text-slate-900 mt-1">Official Society Attendance Ledger</h2>
              <p class="text-xs text-slate-500 mt-1">All check-ins verified via cryptographic QR gate scan and faculty counter-signature.</p>
            </div>
            <div class="text-center px-6 py-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div class="text-3xl font-black text-blue-700 font-mono">${attendanceRate}%</div>
              <div class="text-[10px] uppercase font-bold text-blue-600 tracking-wider mt-0.5">Overall Attendance Rate</div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Attendance Verification Log</h3>
              <span class="text-xs text-slate-500">${myAttendance.length} events logged</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="p-3">Attendance ID</th>
                    <th class="p-3">Event Title</th>
                    <th class="p-3">Timestamp</th>
                    <th class="p-3">Method</th>
                    <th class="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${myAttendance.length > 0 ? myAttendance.map(a => {
                    const evt = (db.events || []).find(e => e.id === a.event_id);
                    return `
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-mono font-bold text-slate-700">${a.attendance_id || a.id}</td>
                        <td class="p-3 font-semibold text-slate-900">${evt ? evt.title : a.event_id}</td>
                        <td class="p-3 text-slate-500">${a.timestamp ? a.timestamp.replace('T', ' ').substring(0, 16) : 'Verified'}</td>
                        <td class="p-3 text-slate-600">${a.verification_method || 'QR Scan'}</td>
                        <td class="p-3 text-right">
                          <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            PRESENT
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('') : `
                    <tr>
                      <td colspan="5" class="p-8 text-center text-slate-400">No attendance records found yet. Attend an event and scan the session QR code.</td>
                    </tr>
                  `}
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
              <h2 class="text-lg font-bold text-slate-900">Accredited Certificates</h2>
              <p class="text-xs text-slate-500">Official digital credentials with SHA-256 tamper-proof verification hashes.</p>
            </div>
            <span class="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200">
              ${myCertificates.length} Validated Credentials
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${myCertificates.length > 0 ? myCertificates.map(c => `
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
                <div class="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold font-mono">
                      ${c.certificateId || c.id}
                    </span>
                    <span class="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                      <span>✓</span><span>Authentic</span>
                    </span>
                  </div>
                  <h3 class="text-sm font-black text-slate-900">${c.certificate_type || c.awardType}</h3>
                  <p class="text-xs text-slate-600 mt-1">${c.event_name || c.eventName}</p>
                  <div class="text-[11px] text-slate-400 mt-2 space-y-0.5">
                    <div>Issued to: <strong class="text-slate-700">${c.student_name || c.studentName} (${c.roll_no || c.rollNo})</strong></div>
                    <div>Date: <strong>${c.issued_date || c.issueDate || c.date}</strong></div>
                    <div class="text-[10px] font-mono truncate">SHA256: ${c.qr_hash || c.qrHash || 'VERIFIED'}</div>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a href="#/verify?id=${c.certificateId || c.id}" class="text-blue-600 hover:underline font-bold text-[11px]">
                    Public Verification Link →
                  </a>
                  <button onclick="window.print()" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[11px]">
                    Print / PDF
                  </button>
                </div>
              </div>
            `).join('') : `
              <div class="col-span-2 p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <div class="text-3xl mb-2">🎓</div>
                <h3 class="text-sm font-bold text-slate-800">No Certificates Earned Yet</h3>
                <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Attend technical workshops, hackathons, and conclaves. Your verified attendance will qualify you for institutional certificates.</p>
              </div>
            `}
          </div>
        </div>
      `;

    case "resources":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Learning Resources & Lab Guides</h2>
              <p class="text-xs text-slate-500">Official technical society guides, lab manuals, code notebooks, and presentation decks.</p>
            </div>
            <a href="#/lms" class="text-xs text-blue-600 hover:underline font-bold">Open Full LMS Hub →</a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${(db.resources || []).map(r => {
              const club = (db.clubs || []).find(c => c.id === r.club_id);
              return `
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        ${r.category || 'PDF'}
                      </span>
                      <span class="text-[10px] text-slate-400">${r.target_semester || 'All Semesters'}</span>
                    </div>
                    <h3 class="text-sm font-bold text-slate-900">${r.title}</h3>
                    <p class="text-xs text-slate-500 mt-1 line-clamp-2">${r.description}</p>
                    <div class="text-[11px] text-slate-400 mt-2">
                      Club: <strong class="text-slate-700">${club ? club.name : r.club_id}</strong> • Author: ${r.uploaded_by || r.author}
                    </div>
                  </div>

                  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span class="text-[10px] text-slate-400">${r.upload_date || r.dateAdded}</span>
                    <a href="${r.file_url || r.link}" target="_blank" rel="noopener" class="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold">
                      Open Resource ↗
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

    case "projects":
      return `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Student Innovation & Project Showcase</h2>
              <p class="text-xs text-slate-500">Peer engineering projects built under Pragati technical clubs.</p>
            </div>
            <a href="#/projects" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs">
              View All Showcase Projects →
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${(db.projects || []).map(p => `
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ${p.status}
                    </span>
                    <span class="text-[10px] text-slate-400">${p.year || '2025-2026'}</span>
                  </div>
                  <h3 class="text-sm font-bold text-slate-900">${p.title}</h3>
                  <p class="text-xs text-slate-600 mt-1 line-clamp-2">${p.description}</p>
                  
                  <div class="flex flex-wrap gap-1 mt-3">
                    ${(p.technologies || []).map(t => `<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">${t}</span>`).join('')}
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span class="text-[11px] text-slate-500">Mentor: <strong>${p.mentor}</strong></span>
                  <div class="space-x-2">
                    ${p.github_link || p.github ? `<a href="${p.github_link || p.github}" target="_blank" class="text-slate-700 hover:underline font-bold text-[11px]">GitHub ↗</a>` : ''}
                    ${p.demo_link || p.demo ? `<a href="${p.demo_link || p.demo}" target="_blank" class="text-blue-600 hover:underline font-bold text-[11px]">Live Demo ↗</a>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    default: // Overview Dashboard
      return `
        <div class="space-y-6">
          
          <!-- Key Metrics Bento Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">My Clubs</div>
              <div class="text-2xl font-black text-slate-900 mt-1">${myApprovedClubs.length}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">${myPendingClubs.length} pending approval</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Registered Events</div>
              <div class="text-2xl font-black text-blue-600 mt-1">${myRegistrations.length}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Active passes</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Attendance</div>
              <div class="text-2xl font-black text-emerald-600 mt-1">${attendanceRate}%</div>
              <div class="text-[10px] text-slate-500 mt-0.5">${myAttendance.length} verified sessions</div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div class="text-slate-400 text-xs font-bold uppercase tracking-wider">Certificates</div>
              <div class="text-2xl font-black text-purple-600 mt-1">${myCertificates.length}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Accredited credentials</div>
            </div>
          </div>

          <!-- Notices & Circulars -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <span>📢</span>
                <span>Council Notices & Circulars</span>
              </h3>
              <a href="#/announcements" class="text-blue-600 hover:underline text-xs font-semibold">View All Notices →</a>
            </div>

            <div class="divide-y divide-slate-100">
              ${myAnnouncements.map(ann => `
                <div class="py-3 first:pt-0 last:pb-0">
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold text-slate-900">${ann.title}</h4>
                    <span class="text-[10px] text-slate-400">${ann.date || 'Recent'}</span>
                  </div>
                  <p class="text-xs text-slate-600 mt-1 leading-relaxed">${ann.content || ann.message}</p>
                  <div class="text-[10px] text-slate-400 mt-1">Issued by: ${ann.author || ann.created_by}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Quick Navigation Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="#/clubs" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg mb-3">
                🏛️
              </div>
              <h4 class="text-xs font-bold text-slate-900 group-hover:text-blue-600">35 Official PEC Clubs</h4>
              <p class="text-xs text-slate-500 mt-1">Explore Industry 4.0, Co-Curricular, and Cultural societies chartered under Career Guidance Cell.</p>
            </a>

            <a href="#/events" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group">
              <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg mb-3">
                📅
              </div>
              <h4 class="text-xs font-bold text-slate-900 group-hover:text-purple-600">Events & Hackathons</h4>
              <p class="text-xs text-slate-500 mt-1">Register with automated deadline checks, ticket pass generation, and capacity alerts.</p>
            </a>

            <a href="#/verify" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-3">
                🔐
              </div>
              <h4 class="text-xs font-bold text-slate-900 group-hover:text-emerald-600">Certificate Verification</h4>
              <p class="text-xs text-slate-500 mt-1">Cryptographic credential ledger ensuring authentic institutional verification.</p>
            </a>
          </div>

        </div>
      `;
  }
}

export function attachStudentDashboardEvents() {
  const modal = document.getElementById("scan-qr-modal");
  const openBtn = document.getElementById("open-scan-qr-btn");
  const closeBtn = document.getElementById("close-scan-modal-btn");
  const submitBtn = document.getElementById("submit-scan-token-btn");
  const tokenInput = document.getElementById("attendance-token-input");
  const alertBox = document.getElementById("scan-alert");

  openBtn?.addEventListener("click", () => {
    modal?.classList.remove("hidden");
  });

  closeBtn?.addEventListener("click", () => {
    modal?.classList.add("hidden");
  });

  submitBtn?.addEventListener("click", async () => {
    const token = tokenInput?.value.trim();
    if (!token) {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 block";
      alertBox.textContent = "Please enter an attendance token.";
      return;
    }

    const user = getCurrentUser();
    alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 block";
    alertBox.textContent = "Verifying attendance credentials...";

    const res = await apiRequest('/api/attendance/scan', 'POST', { studentId: user.id, token });
    if (res && res.success) {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 block";
      alertBox.textContent = res.message;
      setTimeout(() => {
        modal?.classList.add("hidden");
        window.location.reload();
      }, 800);
    } else {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 block";
      alertBox.textContent = res?.message || "Verification failed. Invalid or expired token.";
    }
  });

  // Cancel Registration Handlers
  document.querySelectorAll(".cancel-reg-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const eventId = btn.getAttribute("data-cancel-reg");
      const user = getCurrentUser();
      if (confirm("Are you sure you want to cancel your registration pass for this event?")) {
        const res = await apiRequest('/api/events/cancel', 'POST', { eventId, studentId: user.id });
        if (res && res.success) {
          window.location.reload();
        } else {
          alert("Cancellation could not be processed.");
        }
      }
    });
  });

  // View Ticket Pass Alert Modal
  document.querySelectorAll(".show-ticket-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-pass-code");
      const title = btn.getAttribute("data-event-title");
      alert(`PASS TICKET CONFIRMATION\n\nEvent: ${title}\nPass Code: ${code}\nStatus: Verified\n\nPlease present this ticket code at the entrance kiosk.`);
    });
  });
}
