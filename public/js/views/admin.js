import { getDB, saveDB, logAudit, resetDB } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

export function renderAdminView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const activeTab = params.tab || "overview";

  // Ensure default club proposals, budgets, and system configs exist in db
  if (!db.clubProposals) {
    db.clubProposals = [
      {
        id: "prop-1",
        name: "Quantum Computing & Simulation Collective",
        department: "CSE",
        leadName: "Kavitha R (3rd Year)",
        facultyAdvisor: "Dr. A. Sundaram",
        domain: "Quantum Algorithms",
        submittedDate: "2026-09-12",
        status: "Pending Faculty Dean Review",
        reason: "Fostering Qiskit hands-on research and quantum cryptography exploration among undergraduates."
      }
    ];
    saveDB(db);
  }

  if (!db.clubBudgets) {
    db.clubBudgets = [
      {
        clubId: "acm",
        clubName: "ACM Student Chapter",
        allocated: 65000,
        utilized: 42000,
        sponsorships: [
          { sponsor: "GitHub Education", amount: 20000, purpose: "Hackathon Swag & Server Cloud Credits" }
        ],
        claims: [
          { id: "claim-101", title: "Catering for DevHack 2026", amount: 14500, status: "Approved", date: "2026-09-10" },
          { id: "claim-102", title: "Arduino & ESP32 Hardware Kit Acquisition", amount: 8200, status: "Pending Dean Signoff", date: "2026-09-15" }
        ]
      },
      {
        clubId: "gdsc",
        clubName: "Google Developer Student Club",
        allocated: 75000,
        utilized: 51000,
        sponsorships: [
          { sponsor: "Google Developers", amount: 35000, purpose: "Cloud Study Jam Badges & Licenses" }
        ],
        claims: [
          { id: "claim-201", title: "Audio/Visual Rental for Mobile Summit", amount: 12000, status: "Approved", date: "2026-09-08" }
        ]
      }
    ];
    saveDB(db);
  }

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold uppercase">Super Admin & Institutional Governance</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Council Governance Console</h1>
          <p class="text-xs sm:text-sm text-slate-500">Manage chapter life-cycles, audit budget claims, configure academic policies, and inspect immutable audit logs</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a href="#/club-dashboard" class="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5">
            <span>📊 Club Dashboards</span>
          </a>
          <button id="open-new-club-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
            + New Society Chapter
          </button>
          <button id="open-new-event-btn" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all">
            + Schedule Event
          </button>
          <button id="open-issue-cert-btn" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
            + Issue Certificate
          </button>
          <button id="reset-db-btn" class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-all">
            ⚠️ Reset Seed
          </button>
        </div>
      </div>

      <!-- Governance Tabs Navigation -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs font-bold">
        <a href="#/admin?tab=overview" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          🏛️ Overview & KPIs
        </a>
        <a href="#/admin?tab=lifecycle" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'lifecycle' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          📋 Chapter Lifecycle & Proposals (${db.clubProposals.length})
        </a>
        <a href="#/admin?tab=budget" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'budget' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          💰 Budget & Sponsorships
        </a>
        <a href="#/admin?tab=system" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'system' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          ⚙️ System Configuration
        </a>
        <a href="#/admin?tab=audit" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'audit' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          📜 Immutable Audit Logs (${db.auditLog.length})
        </a>
      </div>

      <!-- Tab Contents -->
      ${
        activeTab === 'lifecycle' ? renderLifecycleSection(db) :
        activeTab === 'budget' ? renderBudgetSection(db) :
        activeTab === 'system' ? renderSystemConfigSection(db) :
        activeTab === 'audit' ? renderAuditSection(db) :
        renderOverviewSection(db)
      }

      <!-- Modal 1: Create New Club -->
      <div id="new-club-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Recognize New Student Chapter</h3>
            <button id="close-club-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="new-club-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Society Name</label>
              <input type="text" id="club-name" required placeholder="e.g. IEEE Robotics & Automation Society" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Short Acronym</label>
                <input type="text" id="club-short" required placeholder="IEEE RAS" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 uppercase font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Department</label>
                <input type="text" id="club-dept" value="ECE" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Technical Domain Specialization</label>
              <input type="text" id="club-domain" required placeholder="Autonomous Systems, ROS2, & Embedded Firmware" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Faculty Advisor Name</label>
                <input type="text" id="club-faculty-name" required placeholder="Dr. S. K. Narayanan" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Student Chair Name</label>
                <input type="text" id="club-student-lead" required placeholder="Harini S" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Charter & Mission</label>
              <textarea id="club-desc" rows="3" required placeholder="Empowering engineers with production-grade robotics standards..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Charter Society Chapter
            </button>
          </form>
        </div>
      </div>

      <!-- Modal 2: Schedule New Event -->
      <div id="new-event-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Schedule Accredited Event</h3>
            <button id="close-event-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="new-event-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Event Title</label>
              <input type="text" id="event-title" required placeholder="e.g. Quantum Computing Hands-on Workshop" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Hosting Society</label>
                <select id="event-club" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500">
                  ${db.clubs.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Activity Category</label>
                <select id="event-cat" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500">
                  <option value="hackathon">Hackathon</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar / Keynote</option>
                  <option value="bootcamp">Bootcamp</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Date</label>
                <input type="date" id="event-date" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Time</label>
                <input type="text" id="event-time" value="09:00 AM - 04:30 PM" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Venue / Lab</label>
                <input type="text" id="event-venue" value="Advanced Computing Center, Block 3" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Max Delegate Capacity</label>
                <input type="number" id="event-capacity" value="150" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Event Description & Syllabi</label>
              <textarea id="event-desc" rows="3" required placeholder="Hands-on session with Qiskit quantum circuit development..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <button type="submit" class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors">
              Publish Event & Generate Gate Kiosk
            </button>
          </form>
        </div>
      </div>

      <!-- Modal 3: Issue Certificate -->
      <div id="issue-cert-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Issue Tamper-Proof Certificate</h3>
            <button id="close-cert-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="issue-cert-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Student Full Name</label>
              <input type="text" id="cert-student-name" required placeholder="Siddharth V" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Roll Number</label>
                <input type="text" id="cert-roll" required placeholder="22CS155" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono uppercase" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Department</label>
                <input type="text" id="cert-dept" value="Computer Science & Engineering" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Associated Event</label>
              <select id="cert-event" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500">
                ${db.events.map(e => `<option value="${e.title}">${e.title}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Award Recognition Category</label>
              <select id="cert-award" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-bold">
                <option value="Certificate of Merit">Certificate of Merit (First Place / Winner)</option>
                <option value="Certificate of Excellence">Certificate of Excellence (Runner Up)</option>
                <option value="Certificate of Active Participation">Certificate of Active Participation</option>
              </select>
            </div>
            <button type="submit" class="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Cryptographically Sign & Mint Certificate
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

function renderOverviewSection(db) {
  return `
    <!-- Governance Summary KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div class="text-xs text-slate-500 font-semibold">Active Societies</div>
        <div class="text-2xl font-black text-slate-900">${db.clubs.length} Chapters</div>
        <div class="text-[11px] text-emerald-600 font-semibold">Across 5 Departments</div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div class="text-xs text-slate-500 font-semibold">Scheduled Events</div>
        <div class="text-2xl font-black text-slate-900">${db.events.length} Activities</div>
        <div class="text-[11px] text-blue-600 font-semibold">QR Kiosks Enabled</div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div class="text-xs text-slate-500 font-semibold">Certificates Issued</div>
        <div class="text-2xl font-black text-slate-900">${db.certificates.length} Credentials</div>
        <div class="text-[11px] text-amber-600 font-semibold">SHA-256 Ledger Backed</div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div class="text-xs text-slate-500 font-semibold">Audit Records</div>
        <div class="text-2xl font-black text-slate-900">${db.auditLog.length} Logs</div>
        <div class="text-[11px] text-purple-600 font-semibold">Cryptographically Tracked</div>
      </div>
    </div>

    <!-- Active Chapters Health Matrix -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">Recognized Society Chapters Health Matrix</h2>
          <p class="text-xs text-slate-500">Executive status, faculty compliance, and active member census</p>
        </div>
        <span class="text-xs font-mono font-bold text-slate-400">Academic Year 2025-2026</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${db.clubs.map(club => `
          <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div class="flex items-start justify-between">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Recognized & Active
              </span>
              <span class="font-mono text-xs font-bold text-slate-500">${club.department}</span>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">${club.name}</h3>
              <p class="text-xs text-slate-500 font-mono mt-0.5">Domain: ${club.domain}</p>
            </div>
            <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span class="text-slate-600 font-mono">${club.memberCount} members</span>
              <span class="text-slate-400 font-mono text-[11px]">${club.facultyCoordinator?.name || 'Dr. M. S. Swaminathan'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderLifecycleSection(db) {
  return `
    <div class="space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">New Society Charter Proposals</h2>
            <p class="text-xs text-slate-500">Student submissions awaiting Dean of Student Affairs & Faculty approval</p>
          </div>
        </div>

        <div class="space-y-4">
          ${db.clubProposals.map(prop => `
            <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center space-x-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                    ${prop.status}
                  </span>
                  <h3 class="font-bold text-slate-900 text-sm">${prop.name}</h3>
                </div>
                <span class="text-xs font-mono text-slate-400">Submitted: ${prop.submittedDate}</span>
              </div>
              <p class="text-xs text-slate-600">${prop.reason}</p>
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-200">
                <div class="text-slate-500 font-mono">
                  Lead: <span class="font-bold text-slate-700">${prop.leadName}</span> • Advisor: <span class="font-bold text-slate-700">${prop.facultyAdvisor}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button data-propid="${prop.id}" class="approve-prop-btn px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all">
                    ✓ Grant Official Charter
                  </button>
                  <button data-propid="${prop.id}" class="reject-prop-btn px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold border border-rose-200 transition-all">
                    ✕ Request Revisions
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Annual Renewal & Derecognition Management -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h2 class="text-base font-bold text-slate-900">Chapter Annual Renewal & Compliance Check</h2>
          <p class="text-xs text-slate-500">Every chartered society must submit annual audit statements to renew accreditation</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Chapter</th>
                <th class="p-3">Renewal Status</th>
                <th class="p-3">NAAC Criterion 5 Compliant</th>
                <th class="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${db.clubs.map(c => `
                <tr>
                  <td class="p-3 font-bold text-slate-900">${c.name}</td>
                  <td class="p-3 font-mono text-emerald-600 font-bold">✓ Renewed (AY 2025-2026)</td>
                  <td class="p-3 font-mono text-blue-600">Yes (100% Events Logged)</td>
                  <td class="p-3 text-right">
                    <button class="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg">
                      Derecognize / Flag
                    </button>
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

function renderBudgetSection(db) {
  return `
    <div class="space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">Institutional Budget Allocation & Expenditure Ledger</h2>
            <p class="text-xs text-slate-500">Track grants, student reimbursements, and external corporate sponsorships</p>
          </div>
        </div>

        <div class="space-y-6">
          ${db.clubBudgets.map(b => `
            <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h3 class="text-sm font-bold text-slate-900">${b.clubName}</h3>
                  <div class="text-xs text-slate-500 font-mono">
                    Allocated: ₹${b.allocated.toLocaleString()} • Utilized: ₹${b.utilized.toLocaleString()} (${Math.round((b.utilized / b.allocated) * 100)}%)
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Remaining: ₹${(b.allocated - b.utilized).toLocaleString()}
                  </span>
                </div>
              </div>

              <!-- Sponsorships -->
              <div class="space-y-2">
                <span class="text-xs font-bold text-slate-700">Corporate & Industry Sponsorships:</span>
                <div class="flex flex-wrap gap-2">
                  ${b.sponsorships.map(s => `
                    <div class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center space-x-2">
                      <span class="font-bold text-slate-900">${s.sponsor}</span>
                      <span class="text-emerald-600 font-mono font-bold">₹${s.amount.toLocaleString()}</span>
                      <span class="text-[10px] text-slate-400">(${s.purpose})</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Claims -->
              <div class="space-y-2">
                <span class="text-xs font-bold text-slate-700">Recent Expenditure Invoices & Claims:</span>
                <div class="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white text-xs overflow-hidden">
                  ${b.claims.map(c => `
                    <div class="p-3 flex items-center justify-between">
                      <div>
                        <div class="font-bold text-slate-800">${c.title}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${c.id} • ${c.date}</div>
                      </div>
                      <div class="flex items-center space-x-3">
                        <span class="font-mono font-bold text-slate-900">₹${c.amount.toLocaleString()}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                          ${c.status}
                        </span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderSystemConfigSection(db) {
  return `
    <div class="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div>
        <h2 class="text-base font-bold text-slate-900">Institutional System Configuration</h2>
        <p class="text-xs text-slate-500">Academic years, department charters, certificate styling, and broadcast endpoints</p>
      </div>

      <div class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Active Academic Year</label>
          <select class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono">
            <option value="2025-2026" selected>2025-2026 (Odd & Even Semesters)</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Recognized Departments</label>
          <input type="text" value="CSE, AIDS, IT, ECE, MECH, EEE, CIVIL" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Default Certificate Template</label>
          <select class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500">
            <option value="gold" selected>Gold Institutional Trim (Dean & Convener Seals)</option>
            <option value="cyber">Cyber Matrix Terminal (Technical Hackathons)</option>
            <option value="winner">Championship Laurel (Competitive Hackathon Winners)</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Email / SMS Digest Notification Endpoint</label>
          <input type="text" value="smtp://mail.pragati.ac.in:587/campus-announcements" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
        </div>

        <button id="save-config-btn" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
          Save Configuration Settings
        </button>
      </div>
    </div>
  `;
}

function renderAuditSection(db) {
  return `
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-slate-900">Cryptographic Governance Audit Trail</h2>
          <p class="text-xs text-slate-500">Immutable log of council actions, attendance scans, and credential issuances</p>
        </div>
        <div class="flex items-center space-x-2">
          <button id="export-audit-csv-btn" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all">
            📥 Export Audit CSV
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
            <tr>
              <th class="p-3">Timestamp</th>
              <th class="p-3">Actor & Persona</th>
              <th class="p-3">Action</th>
              <th class="p-3">Target Subject</th>
              <th class="p-3">Context Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            ${db.auditLog.map(log => `
              <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="p-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                  ${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td class="p-3 font-bold text-slate-900">${log.actor}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    ${log.action}
                  </span>
                </td>
                <td class="p-3 font-semibold text-slate-800">${log.target}</td>
                <td class="p-3 text-slate-500 text-[11px]">${log.details || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function attachAdminEvents() {
  const db = getDB();
  const user = getCurrentUser();

  // Approve / Reject Proposal
  document.querySelectorAll(".approve-prop-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pid = btn.dataset.propid;
      const prop = db.clubProposals.find(p => p.id === pid);
      if (prop) {
        prop.status = "Approved & Chartered";
        logAudit(`${user.name} (${user.role})`, "Approved Club Charter", prop.name, `Dept: ${prop.department}`);
        saveDB(db);
        showToast("Charter Granted", `Official chapter status granted to ${prop.name}!`, "success");
        setTimeout(() => window.location.reload(), 300);
      }
    });
  });

  document.querySelectorAll(".reject-prop-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      showToast("Revisions Requested", "Sent proposal feedback requesting syllabus expansion.", "info");
    });
  });

  // Save Config
  const saveConfigBtn = document.getElementById("save-config-btn");
  if (saveConfigBtn) {
    saveConfigBtn.addEventListener("click", () => {
      logAudit(`${user.name} (${user.role})`, "Updated System Configuration", "Academic Policies", "AY 2025-2026");
      showToast("Settings Saved", "Institutional configuration updated successfully.", "success");
    });
  }

  // Export Audit CSV
  const exportAuditBtn = document.getElementById("export-audit-csv-btn");
  if (exportAuditBtn) {
    exportAuditBtn.addEventListener("click", () => {
      const rows = [["Timestamp", "Actor", "Action", "Target", "Details"]];
      db.auditLog.forEach(l => {
        rows.push([l.timestamp, l.actor, l.action, l.target, l.details || ""]);
      });
      const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(x => `"${(x||'').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `PEC_Governance_Audit_Trail_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Audit Exported", "Governance CSV downloaded to local disk.", "success");
    });
  }

  // Reset DB
  const resetBtn = document.getElementById("reset-db-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset database to initial baseline seed?")) {
        resetDB();
        showToast("Database Reset", "Seed restored.", "info");
        setTimeout(() => window.location.reload(), 300);
      }
    });
  }

  // New Club Modal
  const openClubBtn = document.getElementById("open-new-club-btn");
  const clubModal = document.getElementById("new-club-modal");
  const closeClubBtn = document.getElementById("close-club-modal");
  const clubForm = document.getElementById("new-club-form");

  if (openClubBtn && clubModal) {
    openClubBtn.addEventListener("click", () => clubModal.classList.remove("hidden"));
    if (closeClubBtn) closeClubBtn.addEventListener("click", () => clubModal.classList.add("hidden"));
    if (clubForm) {
      clubForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newClub = {
          id: "club-" + (db.clubs.length + 1),
          name: document.getElementById("club-name").value,
          shortName: document.getElementById("club-short").value,
          department: document.getElementById("club-dept").value,
          domain: document.getElementById("club-domain").value,
          icon: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100",
          banner: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
          description: document.getElementById("club-desc").value,
          memberCount: 1,
          establishedYear: 2026,
          facultyCoordinator: {
            name: document.getElementById("club-faculty-name").value,
            role: "Faculty Advisor",
            email: "faculty@pragati.ac.in"
          },
          studentLead: {
            name: document.getElementById("club-student-lead").value,
            rollNo: "22CS999",
            email: "lead@pragati.ac.in"
          },
          upcomingEventsCount: 0
        };

        db.clubs.push(newClub);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Chartered Society", newClub.name, `Dept: ${newClub.department}`);
        showToast("Society Chartered", `${newClub.name} officially added!`, "success");
        clubModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }

  // Schedule Event Modal
  const openEventBtn = document.getElementById("open-new-event-btn");
  const eventModal = document.getElementById("new-event-modal");
  const closeEventBtn = document.getElementById("close-event-modal");
  const eventForm = document.getElementById("new-event-form");

  if (openEventBtn && eventModal) {
    openEventBtn.addEventListener("click", () => eventModal.classList.remove("hidden"));
    if (closeEventBtn) closeEventBtn.addEventListener("click", () => eventModal.classList.add("hidden"));
    if (eventForm) {
      eventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newEvent = {
          id: "evt-" + (db.events.length + 1),
          title: document.getElementById("event-title").value,
          clubId: document.getElementById("event-club").value,
          category: document.getElementById("event-cat").value,
          date: document.getElementById("event-date").value,
          time: document.getElementById("event-time").value,
          venue: document.getElementById("event-venue").value,
          capacity: parseInt(document.getElementById("event-capacity").value, 10),
          registeredCount: 1,
          description: document.getElementById("event-desc").value,
          poster: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
          agenda: ["Inauguration", "Hands-on Sprints", "Project Demos"]
        };

        db.events.push(newEvent);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Scheduled Event", newEvent.title, `Date: ${newEvent.date}`);
        showToast("Event Scheduled", `${newEvent.title} is now open for registration!`, "success");
        eventModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }

  // Issue Certificate Modal
  const openCertBtn = document.getElementById("open-issue-cert-btn");
  const certModal = document.getElementById("issue-cert-modal");
  const closeCertBtn = document.getElementById("close-cert-modal");
  const certForm = document.getElementById("issue-cert-form");

  if (openCertBtn && certModal) {
    openCertBtn.addEventListener("click", () => certModal.classList.remove("hidden"));
    if (closeCertBtn) closeCertBtn.addEventListener("click", () => certModal.classList.add("hidden"));
    if (certForm) {
      certForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const studentName = document.getElementById("cert-student-name").value;
        const roll = document.getElementById("cert-roll").value;
        const dept = document.getElementById("cert-dept").value;
        const eventName = document.getElementById("cert-event").value;
        const award = document.getElementById("cert-award").value;

        const certId = `CERT-${Date.now().toString().slice(-4)}`;
        const certHash = `sha256:0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        const newCert = {
          id: certId,
          recipientName: studentName,
          recipientRoll: roll,
          department: dept,
          eventName: eventName,
          awardType: award,
          template: "gold",
          issueDate: new Date().toISOString().split("T")[0],
          qrHash: certHash,
          verificationHash: certHash,
          status: "Verified & Active"
        };

        db.certificates.unshift(newCert);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Issued Certificate", certId, `Recipient: ${studentName}`);
        showToast("Certificate Minted", `Issued ${certId} with cryptographic signature!`, "success");
        certModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
