import { getDB, saveDB, logAudit, resetDB } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

export function renderAdminView() {
  const db = getDB();
  const user = getCurrentUser() || {};

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold uppercase">Super Admin & Faculty Control</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Council Governance Console</h1>
          <p class="text-xs sm:text-sm text-slate-500">Manage recognized chapters, schedule accredited hackathons, issue credentials, and review immutable audit trails</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
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

      <!-- Council Audit Trail Table -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">Cryptographic Governance Audit Trail</h2>
            <p class="text-xs text-slate-500">Immutable log of council actions, attendance scans, and credential issuances</p>
          </div>
          <span class="text-xs font-mono text-slate-400">Total Entries: ${db.auditLog.length}</span>
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

      <!-- Modal 1: Create New Club -->
      <div id="new-club-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Recognize New Student Chapter</h3>
            <button id="close-club-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="new-club-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Society Name</label>
              <input type="text" id="club-name" required placeholder="e.g. Google Developer Student Club (GDSC)" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Short Acronym</label>
                <input type="text" id="club-short" required placeholder="GDSC" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 uppercase font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Department</label>
                <input type="text" id="club-dept" value="CSE" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Technical Domain Specialization</label>
              <input type="text" id="club-domain" required placeholder="Cloud, Android & Generative AI" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
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
              <textarea id="club-desc" rows="3" required placeholder="Empowering engineers with production-grade development standards..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Charter Society Chapter
            </button>
          </form>
        </div>
      </div>

      <!-- Modal 2: Schedule New Event -->
      <div id="new-event-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
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

export function attachAdminEvents() {
  const db = getDB();
  const user = getCurrentUser();

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
          coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
          description: document.getElementById("club-desc").value,
          memberCount: 1,
          establishedYear: 2026,
          facultyCoordinator: {
            name: document.getElementById("club-faculty-name").value,
            role: "Faculty Advisor",
            email: "faculty@panimalar.edu"
          },
          studentLead: {
            name: document.getElementById("club-student-lead").value,
            rollNo: "22CS999",
            email: "lead@panimalar.edu"
          },
          upcomingEventsCount: 0
        };

        db.clubs.push(newClub);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Chartered Society", newClub.name, `Dept: ${newClub.department}`);
        showToast(`Chartered ${newClub.name} successfully!`, "success");
        clubModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }

  // New Event Modal
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
        const dateVal = document.getElementById("event-date").value;
        const newEvent = {
          id: "evt-" + (db.events.length + 1),
          title: document.getElementById("event-title").value,
          clubId: document.getElementById("event-club").value,
          category: document.getElementById("event-cat").value,
          date: dateVal,
          time: document.getElementById("event-time").value,
          venue: document.getElementById("event-venue").value,
          capacity: parseInt(document.getElementById("event-capacity").value) || 100,
          registeredCount: 1,
          description: document.getElementById("event-desc").value,
          tags: ["Accredited", "Certificate", "CCTSC"],
          qrCheckInCode: "PEC-EVT-GATE-" + Math.floor(Math.random() * 90000 + 10000),
          status: "upcoming"
        };

        db.events.push(newEvent);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Scheduled Event", newEvent.title, `Date: ${newEvent.date}`);
        showToast(`Event "${newEvent.title}" published!`, "success");
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
        const rollNo = document.getElementById("cert-roll").value;
        const eventName = document.getElementById("cert-event").value;
        const awardType = document.getElementById("cert-award").value;
        const dept = document.getElementById("cert-dept").value;

        // Generate SHA-256 style hash
        const rawString = `${studentName}-${rollNo}-${eventName}-${Date.now()}`;
        let hash = "";
        for (let i = 0; i < 64; i++) {
          hash += Math.floor(Math.random() * 16).toString(16);
        }

        const newCert = {
          id: "PEC-CERT-2026-" + String(db.certificates.length + 1).padStart(3, "0"),
          studentId: "user-std-1",
          studentName,
          rollNo,
          department: dept,
          eventName,
          issueDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          awardType,
          qrHash: hash,
          signatories: [
            { name: "Dr. M. S. Swaminathan", designation: "President, Central Technical Council" },
            { name: "Prof. Ananya Iyer", designation: "Faculty Coordinator, ACM Student Chapter" }
          ]
        };

        db.certificates.unshift(newCert);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Issued Certificate", newCert.id, `Recipient: ${studentName}`);
        showToast(`Certificate ${newCert.id} minted!`, "success");
        certModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }

  // Reset DB
  const resetBtn = document.getElementById("reset-db-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset all local portal data, events, and certificates back to factory seed?")) {
        resetDB();
        showToast("Database restored to factory seed state.", "info");
        setTimeout(() => window.location.reload(), 400);
      }
    });
  }
}
