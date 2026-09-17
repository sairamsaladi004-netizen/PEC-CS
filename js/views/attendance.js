import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';

export function renderAttendanceView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const activeEvents = db.events;
  const currentEvent = activeEvents[0];
  const registrations = currentEvent?.registrations || [];
  const checkedInCount = registrations.filter(r => r.checkedIn).length;

  return `
    <div class="space-y-6 pb-16">
      <!-- Title & Kiosk Mode Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider font-mono">Live Gate Kiosk</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">QR Attendance & Verification Kiosk</h1>
          <p class="text-xs sm:text-sm text-slate-500">Scan student gate passes for real-time validation and automated certificate entitlement</p>
        </div>

        <div class="flex items-center space-x-3">
          <select id="kiosk-event-select" class="p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500">
            ${activeEvents.map(e => `
              <option value="${e.id}">${e.title} (${e.date})</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Kiosk Scanner & Manual Input Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Interactive QR Scanner Simulation -->
        <div class="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Camera / Optical Scanner</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Ready</span>
          </div>
          
          <div class="relative h-48 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
            <div class="w-24 h-24 border-2 border-blue-500 rounded-xl relative flex items-center justify-center animate-pulse">
              <div class="w-full h-0.5 bg-blue-400 absolute top-1/2 -translate-y-1/2 shadow-[0_0_8px_#3b82f6]"></div>
              <span class="text-2xl">📷</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-3">Position student ticket QR pass in front of lens</p>
          </div>

          <div class="space-y-2">
            <button id="simulate-scan-btn" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2">
              <span>⚡ Simulate Quick QR Scan (Test)</span>
            </button>
          </div>
        </div>

        <!-- Manual Check-in Form & Stats -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 class="text-base font-bold text-slate-900">Manual Check-in & Gate Pass Search</h2>
            
            <div class="flex flex-col sm:flex-row items-center gap-3">
              <input 
                type="text" 
                id="manual-ticket-input" 
                placeholder="Enter Pass ID (e.g. TCK-APEX-042) or Roll No (22CS101)..." 
                class="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button id="manual-checkin-btn" class="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shrink-0 transition-colors">
                Check In Student
              </button>
            </div>

            <!-- Stats Bar -->
            <div class="grid grid-cols-3 gap-3 pt-2">
              <div class="p-3 bg-slate-50 rounded-xl text-center">
                <div class="text-[11px] text-slate-400 font-semibold">Registered</div>
                <div id="stat-registered" class="text-xl font-black text-slate-900">${registrations.length}</div>
              </div>
              <div class="p-3 bg-emerald-50 rounded-xl text-center">
                <div class="text-[11px] text-emerald-600 font-semibold">Checked In</div>
                <div id="stat-checkedin" class="text-xl font-black text-emerald-700">${checkedInCount}</div>
              </div>
              <div class="p-3 bg-blue-50 rounded-xl text-center">
                <div class="text-[11px] text-blue-600 font-semibold">Turnout Rate</div>
                <div id="stat-rate" class="text-xl font-black text-blue-700">${registrations.length > 0 ? Math.round((checkedInCount / registrations.length) * 100) : 0}%</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Live Roster of Attendees -->
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">Registered Delegates & Attendance Roster</h2>
            <p class="text-xs text-slate-500">Live synchronization with accreditation database</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th class="p-4 pl-6">Student Name & Roll No</th>
                <th class="p-4">Department</th>
                <th class="p-4">Pass ID</th>
                <th class="p-4">Gate Status</th>
                <th class="p-4 text-right pr-6">Accreditation Action</th>
              </tr>
            </thead>
            <tbody id="attendance-table-body" class="divide-y divide-slate-100 font-medium text-slate-700">
              ${renderAttendanceRows(registrations, currentEvent)}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

function renderAttendanceRows(registrations, event) {
  if (!registrations || registrations.length === 0) {
    return `<tr><td colspan="5" class="p-8 text-center text-slate-400">No registered students found for this event.</td></tr>`;
  }

  const db = getDB();

  return registrations.map(reg => {
    const cert = db.certificates.find(c => c.studentId === reg.studentId && c.eventName.toLowerCase().includes(event?.title.toLowerCase().slice(0, 10)));

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-4 pl-6">
          <div class="font-bold text-slate-900">${reg.studentName}</div>
          <div class="text-[11px] text-slate-400 font-mono">${reg.rollNo}</div>
        </td>
        <td class="p-4 text-slate-600 font-mono">${reg.department || 'CSE'}</td>
        <td class="p-4 font-mono font-bold text-blue-600">${reg.ticketId}</td>
        <td class="p-4">
          ${reg.checkedIn ? `
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center space-x-1">
              <span>● Checked In</span>
            </span>
          ` : `
            <button data-ticket="${reg.ticketId}" class="quick-checkin-btn px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              Mark Present
            </button>
          `}
        </td>
        <td class="p-4 text-right pr-6">
          ${cert ? `
            <a href="#/certificates?id=${cert.id}" class="text-blue-600 hover:text-blue-800 font-bold text-xs">
              View Certificate #${cert.id.slice(-6)} →
            </a>
          ` : reg.checkedIn ? `
            <button data-regid="${reg.studentId}" data-name="${reg.studentName}" data-roll="${reg.rollNo}" data-dept="${reg.department}" data-event="${event.title}" class="issue-cert-btn px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
              Issue Accredited Cert
            </button>
          ` : `
            <span class="text-slate-400 text-xs">Requires Check-in</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

export function attachAttendanceEvents() {
  const select = document.getElementById("kiosk-event-select");
  if (select) {
    select.addEventListener("change", (e) => {
      const db = getDB();
      const event = db.events.find(ev => ev.id === e.target.value);
      if (event) {
        const tbody = document.getElementById("attendance-table-body");
        if (tbody) tbody.innerHTML = renderAttendanceRows(event.registrations || [], event);
        updateStats(event.registrations || []);
        attachRowEvents();
      }
    });
  }

  const updateStats = (regs) => {
    const checked = regs.filter(r => r.checkedIn).length;
    const total = regs.length;
    const statReg = document.getElementById("stat-registered");
    const statChk = document.getElementById("stat-checkedin");
    const statRate = document.getElementById("stat-rate");
    if (statReg) statReg.innerText = total;
    if (statChk) statChk.innerText = checked;
    if (statRate) statRate.innerText = total > 0 ? `${Math.round((checked / total) * 100)}%` : '0%';
  };

  const checkinTicket = (query) => {
    if (!query) return;
    const db = getDB();
    const eventId = select?.value || db.events[0]?.id;
    const event = db.events.find(e => e.id === eventId);
    if (!event) return;

    const q = query.trim().toUpperCase();
    const reg = event.registrations?.find(r => r.ticketId?.toUpperCase() === q || r.rollNo?.toUpperCase() === q);

    if (reg) {
      if (reg.checkedIn) {
        showToast(`${reg.studentName} is ALREADY checked in!`, "warning");
      } else {
        reg.checkedIn = true;
        saveDB(db);
        logAudit("Gate Kiosk", "Attendee Checked-in", `${event.title} - ${reg.studentName}`, `Pass: ${reg.ticketId}`);
        showToast(`Checked in: ${reg.studentName} (${reg.rollNo})!`, "success");
        const tbody = document.getElementById("attendance-table-body");
        if (tbody) tbody.innerHTML = renderAttendanceRows(event.registrations, event);
        updateStats(event.registrations);
        attachRowEvents();
      }
    } else {
      showToast(`No ticket or student found for "${query}"!`, "error");
    }
  };

  const manualBtn = document.getElementById("manual-checkin-btn");
  const manualInput = document.getElementById("manual-ticket-input");
  if (manualBtn && manualInput) {
    manualBtn.addEventListener("click", () => {
      checkinTicket(manualInput.value);
      manualInput.value = "";
    });
    manualInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        checkinTicket(manualInput.value);
        manualInput.value = "";
      }
    });
  }

  const simulateScanBtn = document.getElementById("simulate-scan-btn");
  if (simulateScanBtn) {
    simulateScanBtn.addEventListener("click", () => {
      const db = getDB();
      const eventId = select?.value || db.events[0]?.id;
      const event = db.events.find(e => e.id === eventId);
      const pending = event?.registrations?.find(r => !r.checkedIn);
      if (pending) {
        checkinTicket(pending.ticketId);
      } else {
        showToast("All registered students are already checked in!", "info");
      }
    });
  }

  const attachRowEvents = () => {
    document.querySelectorAll(".quick-checkin-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        checkinTicket(btn.dataset.ticket);
      });
    });

    document.querySelectorAll(".issue-cert-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const studentId = btn.dataset.regid;
        const studentName = btn.dataset.name;
        const rollNo = btn.dataset.roll;
        const department = btn.dataset.dept || "CSE";
        const eventName = btn.dataset.event;
        const db = getDB();

        const certId = `PEC-CERT-${Math.floor(100 + Math.random() * 900)}-2026`;
        const qrHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        const newCert = {
          id: certId,
          studentId,
          studentName,
          rollNo,
          department,
          eventName,
          awardType: "Certificate of Participation & Technical Completion",
          issueDate: new Date().toISOString().split("T")[0],
          qrHash
        };

        db.certificates.push(newCert);
        saveDB(db);
        logAudit("Faculty Reviewer", "Issued Certificate", `${studentName} - ${certId}`, `Event: ${eventName}`);
        addNotification({
          userId: studentId,
          title: "Accredited Certificate Issued",
          message: `Your certificate for "${eventName}" is now available in your Student Profile.`,
          category: "Certificates",
          link: `#/certificates?id=${certId}`
        });

        showToast(`Certificate #${certId} issued to ${studentName}!`, "success");
        const eventId = select?.value || db.events[0]?.id;
        const event = db.events.find(e => e.id === eventId);
        const tbody = document.getElementById("attendance-table-body");
        if (tbody && event) tbody.innerHTML = renderAttendanceRows(event.registrations, event);
        attachRowEvents();
      });
    });
  };

  attachRowEvents();
}
