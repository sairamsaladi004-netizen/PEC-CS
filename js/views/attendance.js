import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';

const OFFLINE_QUEUE_KEY = "campustech_offline_attendance_queue";

export function renderAttendanceView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const activeEvents = db.events;
  const currentEvent = activeEvents[0];
  const registrations = currentEvent?.registrations || [];
  const checkedInCount = registrations.filter(r => r.checkedIn).length;
  const isFacultyOrAdmin = ["Faculty Coordinator", "Department Admin", "Director (Academics)", "Club Admin"].includes(user.role);

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Title & Kiosk Mode Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider font-mono">Live Gate Kiosk & Accreditation Hub</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">QR Attendance & Verification Kiosk</h1>
          <p class="text-xs sm:text-sm text-slate-500">Fast optical QR check-in, duplicate prevention, offline queuing, and attendance analytics</p>
        </div>

        <!-- Event Selector & Online / Offline Toggle -->
        <div class="flex flex-wrap items-center gap-2">
          <a href="#/attendance-scanner" class="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5">
            <span>📷 Club Badge Scanner</span>
          </a>

          <div class="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
            <span id="network-status-indicator" class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span id="network-status-text" class="font-bold text-slate-700">Online Mode</span>
            <button id="toggle-network-mode-btn" class="text-[10px] text-blue-600 underline font-semibold">Toggle Offline</button>
          </div>

          <select id="kiosk-event-select" class="p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500">
            ${activeEvents.map(e => `
              <option value="${e.id}">${e.title} (${e.date})</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Kiosk Scanner & Manual Input Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Interactive QR Scanner Simulation & Live Camera Viewfinder -->
        <div class="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Optical QR Scanner</span>
            <span id="scanner-live-badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Ready</span>
          </div>
          
          <!-- Live Camera Video Mount / Visual Target -->
          <div class="relative min-h-[200px] rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/80 flex flex-col items-center justify-center p-3 text-center overflow-hidden">
            <div id="qr-camera-reader" class="w-full h-full rounded-xl overflow-hidden hidden"></div>
            
            <div id="camera-idle-placeholder" class="flex flex-col items-center justify-center py-4">
              <div class="w-20 h-20 border-2 border-blue-500/80 rounded-2xl relative flex items-center justify-center animate-pulse bg-blue-950/30">
                <div class="w-full h-0.5 bg-blue-400 absolute top-1/2 -translate-y-1/2 shadow-[0_0_8px_#3b82f6]"></div>
                <span class="text-3xl">📷</span>
              </div>
              <p class="text-[11px] text-slate-300 font-medium mt-3">Aim camera at Student Digital ID or Pass QR</p>
              <p class="text-[9px] text-slate-500 font-mono">Supports Digital ID, Pass ID, and JSON Payloads</p>
            </div>
          </div>

          <!-- Controls for Camera / Image / Simulation -->
          <div class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <button id="start-camera-scan-btn" class="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer">
                <span>🎥</span>
                <span id="camera-btn-text">Start Camera</span>
              </button>
              <label for="qr-file-input" class="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-center">
                <span>📁</span>
                <span>Scan Image File</span>
                <input type="file" id="qr-file-input" accept="image/*" class="hidden" />
              </label>
            </div>

            <button id="simulate-scan-btn" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer">
              <span>⚡ Simulate Quick Scan (Unchecked Attendee)</span>
            </button>
            <button id="simulate-dup-scan-btn" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2 cursor-pointer">
              <span>⚠️ Test Duplicate Scan Detection</span>
            </button>
          </div>

          <div id="offline-queue-badge" class="hidden p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-[11px] text-amber-300 flex items-center justify-between">
            <span>Offline Scans in Queue: <strong id="queue-count">0</strong></span>
            <button id="sync-offline-queue-btn" class="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded text-[10px]">Sync Now</button>
          </div>
        </div>

        <!-- Manual Check-in Form, Manual Add, & Stats -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-bold text-slate-900">Manual Check-in & Gate Pass Search</h2>
              ${isFacultyOrAdmin ? `
                <button id="open-walkin-modal-btn" class="text-xs font-bold text-blue-600 hover:text-blue-700">
                  + Add Walk-in Delegate
                </button>
              ` : ''}
            </div>
            
            <div class="flex flex-col sm:flex-row items-center gap-3">
              <input 
                type="text" 
                id="manual-ticket-input" 
                placeholder="Enter Pass ID (e.g. TCK-HAC-101) or Roll No (22CS101)..." 
                class="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button id="manual-checkin-btn" class="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shrink-0 transition-colors">
                Validate & Check In
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

          <!-- Quick Action Bar: Visual Analytics & Export Reports -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center space-x-2">
              <button id="open-analytics-modal-btn" class="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition-colors flex items-center space-x-1.5">
                <span>📈</span> <span>Visual Analytics (Branches & Arrival)</span>
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-slate-400 font-bold">Export:</span>
              <button id="export-csv-btn" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">
                CSV
              </button>
              <button id="export-excel-btn" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">
                Excel
              </button>
              <button id="export-pdf-btn" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors">
                PDF Sheet
              </button>
            </div>
          </div>

        </div>

      </div>

      <!-- Live Roster of Attendees -->
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900">Registered Delegates & Attendance Roster</h2>
            <p class="text-xs text-slate-500">Live synchronization with accreditation database and certificate minting engine</p>
          </div>
          <div class="text-xs text-slate-400 font-mono">
            Showing <span id="table-count">${registrations.length}</span> registered records
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th class="p-4 pl-6">Student Name & Roll No</th>
                <th class="p-4">Department</th>
                <th class="p-4">Pass ID</th>
                <th class="p-4">Gate Status & Timestamp</th>
                <th class="p-4 text-right pr-6">Coordinator Correction</th>
              </tr>
            </thead>
            <tbody id="attendance-table-body" class="divide-y divide-slate-100 font-medium text-slate-700">
              ${renderAttendanceRows(registrations, currentEvent)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Visual Attendance Analytics Modal -->
      <div id="analytics-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Visual Attendance & Turnout Analytics</h3>
              <p class="text-xs text-slate-500 font-mono" id="analytics-event-name">Event Analytics</p>
            </div>
            <button id="close-analytics-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div class="space-y-4 text-xs">
            <!-- Branch Distribution -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div class="font-bold text-slate-900 text-xs">Department & Branch Distribution</div>
              <div class="space-y-1.5">
                <div>
                  <div class="flex justify-between text-[11px] text-slate-600 mb-0.5"><span>Computer Science (CSE)</span> <span class="font-bold">52%</span></div>
                  <div class="w-full bg-slate-200 rounded-full h-2"><div class="bg-blue-600 h-2 rounded-full" style="width: 52%"></div></div>
                </div>
                <div>
                  <div class="flex justify-between text-[11px] text-slate-600 mb-0.5"><span>AI & Data Science (AIDS)</span> <span class="font-bold">28%</span></div>
                  <div class="w-full bg-slate-200 rounded-full h-2"><div class="bg-purple-600 h-2 rounded-full" style="width: 28%"></div></div>
                </div>
                <div>
                  <div class="flex justify-between text-[11px] text-slate-600 mb-0.5"><span>Information Technology (IT)</span> <span class="font-bold">14%</span></div>
                  <div class="w-full bg-slate-200 rounded-full h-2"><div class="bg-emerald-600 h-2 rounded-full" style="width: 14%"></div></div>
                </div>
                <div>
                  <div class="flex justify-between text-[11px] text-slate-600 mb-0.5"><span>Electronics (ECE)</span> <span class="font-bold">6%</span></div>
                  <div class="w-full bg-slate-200 rounded-full h-2"><div class="bg-amber-600 h-2 rounded-full" style="width: 6%"></div></div>
                </div>
              </div>
            </div>

            <!-- Peak Arrival Times -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div class="font-bold text-slate-900 text-xs">Peak Arrival & Check-in Wave</div>
              <div class="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div class="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div class="text-slate-400 font-mono">09:00 - 09:30</div>
                  <div class="font-black text-slate-900 text-sm mt-0.5">62% (Peak)</div>
                </div>
                <div class="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div class="text-slate-400 font-mono">09:30 - 10:00</div>
                  <div class="font-black text-slate-900 text-sm mt-0.5">26%</div>
                </div>
                <div class="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div class="text-slate-400 font-mono">After 10:00</div>
                  <div class="font-black text-slate-900 text-sm mt-0.5">12% (Late)</div>
                </div>
              </div>
            </div>

            <!-- Year Distribution -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-[11px]">
              <div class="font-bold text-slate-900 text-xs mb-1">Academic Year Demographics</div>
              <div class="flex justify-between py-1 border-b border-slate-200"><span>2nd Year Undergraduates</span> <span class="font-bold font-mono">48 Delegates</span></div>
              <div class="flex justify-between py-1 border-b border-slate-200"><span>3rd Year Undergraduates</span> <span class="font-bold font-mono">34 Delegates</span></div>
              <div class="flex justify-between py-1"><span>4th Year / Final Year</span> <span class="font-bold font-mono">18 Delegates</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Walk-in Delegate Modal -->
      <div id="walkin-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Add Spot Walk-in Delegate</h3>
              <p class="text-[11px] text-slate-500">Register off-roster candidate directly at the gate</p>
            </div>
            <button id="close-walkin-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form id="walkin-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Full Student Name</label>
              <input type="text" id="walkin-name" required placeholder="e.g. Rahul Verma" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Roll Number</label>
                <input type="text" id="walkin-roll" required placeholder="23CS112" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 uppercase font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Department</label>
                <select id="walkin-dept" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500">
                  <option value="CSE">CSE</option>
                  <option value="AIDS">AIDS</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">College Email</label>
              <input type="email" id="walkin-email" required placeholder="student@pragati.ac.in" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Confirm & Check In Immediately
            </button>
          </form>
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
    const cert = (db.certificates || []).find(c => c.recipientRoll === reg.rollNo && c.eventName?.toLowerCase().includes(event?.title.toLowerCase().slice(0, 8)));

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-4 pl-6">
          <div class="font-bold text-slate-900">${reg.studentName}</div>
          <div class="text-[11px] text-slate-400 font-mono">${reg.rollNo}</div>
        </td>
        <td class="p-4 text-slate-600">${reg.department || 'CSE'}</td>
        <td class="p-4 font-mono text-slate-500">${reg.ticketId}</td>
        <td class="p-4">
          ${reg.checkedIn ? `
            <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Checked In (${reg.checkinTime || '09:42 AM'})</span>
            </span>
          ` : `
            <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-500">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span>Absent / Pending</span>
            </span>
          `}
        </td>
        <td class="p-4 text-right pr-6 space-x-2">
          ${reg.checkedIn ? `
            <button data-ticket="${reg.ticketId}" class="undo-checkin-btn px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold transition-colors" title="Mark back to absent">
              Undo
            </button>
            ${cert ? `
              <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                ✓ Cert Minted
              </span>
            ` : `
              <button 
                data-regid="${reg.studentId}" 
                data-name="${reg.studentName}" 
                data-roll="${reg.rollNo}" 
                data-dept="${reg.department || 'CSE'}"
                data-event="${event?.title || 'Workshop'}"
                class="issue-cert-btn px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors"
              >
                + Mint Certificate
              </button>
            `}
          ` : `
            <button data-ticket="${reg.ticketId}" class="quick-checkin-btn px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors">
              Mark Present
            </button>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

export function attachAttendanceEvents() {
  const select = document.getElementById("kiosk-event-select");
  let isOffline = false;
  let html5QrScanner = null;
  let isCameraScanning = false;

  // Sound feedback synthesizer
  const playSound = (type = "success") => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  const updateStats = (registrations) => {
    const checked = (registrations || []).filter(r => r.checkedIn).length;
    const total = registrations?.length || 0;
    const rate = total > 0 ? Math.round((checked / total) * 100) : 0;

    const elReg = document.getElementById("stat-registered");
    const elChecked = document.getElementById("stat-checkedin");
    const elRate = document.getElementById("stat-rate");
    const elCount = document.getElementById("table-count");

    if (elReg) elReg.innerText = total;
    if (elChecked) elChecked.innerText = checked;
    if (elRate) elRate.innerText = rate + "%";
    if (elCount) elCount.innerText = total;
  };

  const checkinTicket = async (query) => {
    if (!query) return;
    const db = getDB();
    const eventId = select?.value || db.events[0]?.id;
    const event = db.events.find(e => e.id === eventId);
    if (!event) return;

    // Try backend organizer-checkin API first if online
    let backendResult = null;
    if (!isOffline) {
      try {
        const res = await fetch("/api/attendance/organizer-checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            qrData: query,
            organizerEmail: getCurrentUser()?.email || "admin@pragati.ac.in",
            gateId: "GATE-01"
          })
        });
        backendResult = await res.json();
      } catch (err) {
        console.warn("Backend checkin request failed, falling back to local DB sync:", err);
      }
    }

    // If backend returned duplicate
    if (backendResult && backendResult.duplicate) {
      playSound("error");
      showToast(
        "⚠️ DUPLICATE SCAN ALERT!", 
        backendResult.message || `Student was ALREADY checked in! Double entry prevented!`, 
        "error"
      );
      return;
    }

    // Local DB resolution & state management
    let q = query.trim();
    let parsedData = null;
    try {
      if (q.startsWith("{")) {
        parsedData = JSON.parse(q);
      }
    } catch (e) {}

    const rollQuery = (parsedData?.roll || parsedData?.rollNo || parsedData?.studentRoll || parsedData?.passId || q).toUpperCase();
    const ticketQuery = (parsedData?.ticketId || parsedData?.id || parsedData?.passId || q).toUpperCase();

    const reg = event.registrations?.find(r => 
      r.ticketId?.toUpperCase() === ticketQuery || 
      r.rollNo?.toUpperCase() === rollQuery ||
      r.rollNo?.toUpperCase() === q.toUpperCase() ||
      r.ticketId?.toUpperCase() === q.toUpperCase()
    );

    if (reg) {
      if (reg.checkedIn && (!backendResult || !backendResult.success)) {
        playSound("error");
        showToast(
          "⚠️ DUPLICATE SCAN ALERT!", 
          `Student ${reg.studentName} (${reg.rollNo}) was ALREADY checked in at ${reg.checkinTime || 'Gate 1'}. Double entry prevented!`, 
          "error"
        );
        return;
      }

      if (isOffline) {
        // Queue in offline storage
        const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
        queue.push({ eventId, ticketId: reg.ticketId, studentName: reg.studentName, timestamp: new Date().toLocaleTimeString() });
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        reg.checkedIn = true;
        reg.checkinTime = new Date().toLocaleTimeString();
        playSound("success");
        showToast("Offline Check-in Cached", `${reg.studentName} logged to local storage queue.`, "info");
        updateQueueDisplay();
      } else {
        reg.checkedIn = true;
        reg.checkinTime = backendResult?.record?.checkin_time || new Date().toLocaleTimeString();
        saveDB(db);
        logAudit("Gate Kiosk", "Attendee Checked-in", `${event.title} - ${reg.studentName}`, `Pass: ${reg.ticketId}`);
        playSound("success");
        showToast("Gate Verified ✓", `${reg.studentName} (${reg.rollNo}) checked in successfully!`, "success");
      }

      const tbody = document.getElementById("attendance-table-body");
      if (tbody) tbody.innerHTML = renderAttendanceRows(event.registrations, event);
      updateStats(event.registrations);
      attachRowEvents();
    } else {
      // If student is found in general DB users but not in this event yet, add them as walk-in / verified
      const userInDb = (db.users || []).find(u => u.rollNo?.toUpperCase() === rollQuery || u.rollNo?.toUpperCase() === q.toUpperCase());
      if (userInDb) {
        if (!event.registrations) event.registrations = [];
        const newReg = {
          studentId: userInDb.id || "gen-" + Date.now(),
          studentName: userInDb.name,
          rollNo: userInDb.rollNo,
          email: userInDb.email,
          department: userInDb.department || "CSE",
          ticketId: `TCK-${(userInDb.department || 'CSE').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          registeredAt: new Date().toISOString().split("T")[0],
          checkedIn: true,
          checkinTime: new Date().toLocaleTimeString()
        };
        event.registrations.push(newReg);
        event.registeredCount = (event.registeredCount || 0) + 1;
        saveDB(db);
        playSound("success");
        showToast("Student Verified & Checked In ✓", `${userInDb.name} (${userInDb.rollNo}) auto-admitted to event!`, "success");
        const tbody = document.getElementById("attendance-table-body");
        if (tbody) tbody.innerHTML = renderAttendanceRows(event.registrations, event);
        updateStats(event.registrations);
        attachRowEvents();
      } else {
        playSound("error");
        showToast("Access Denied", `No registered ticket or student found for "${query}"!`, "error");
      }
    }
  };

  const updateQueueDisplay = () => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    const badge = document.getElementById("offline-queue-badge");
    const count = document.getElementById("queue-count");
    if (badge && count) {
      count.innerText = queue.length;
      if (queue.length > 0) {
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }
  };

  // 1. Live Camera Scanner initialization
  const startCameraBtn = document.getElementById("start-camera-scan-btn");
  const cameraReader = document.getElementById("qr-camera-reader");
  const cameraPlaceholder = document.getElementById("camera-idle-placeholder");
  const cameraBtnText = document.getElementById("camera-btn-text");
  const scannerLiveBadge = document.getElementById("scanner-live-badge");

  if (startCameraBtn && window.Html5Qrcode) {
    startCameraBtn.addEventListener("click", async () => {
      if (isCameraScanning) {
        // Stop Camera
        if (html5QrScanner) {
          try {
            await html5QrScanner.stop();
            html5QrScanner.clear();
          } catch (e) {}
        }
        isCameraScanning = false;
        if (cameraReader) cameraReader.classList.add("hidden");
        if (cameraPlaceholder) cameraPlaceholder.classList.remove("hidden");
        if (cameraBtnText) cameraBtnText.innerText = "Start Camera";
        if (scannerLiveBadge) {
          scannerLiveBadge.innerText = "Ready";
          scannerLiveBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
        }
      } else {
        // Start Camera
        try {
          if (!html5QrScanner) {
            html5QrScanner = new window.Html5Qrcode("qr-camera-reader");
          }
          if (cameraReader) cameraReader.classList.remove("hidden");
          if (cameraPlaceholder) cameraPlaceholder.classList.add("hidden");

          const qrCodeSuccessCallback = (decodedText) => {
            checkinTicket(decodedText);
          };

          const config = { fps: 10, qrbox: { width: 200, height: 200 } };
          await html5QrScanner.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);

          isCameraScanning = true;
          if (cameraBtnText) cameraBtnText.innerText = "Stop Camera";
          if (scannerLiveBadge) {
            scannerLiveBadge.innerText = "Camera Live";
            scannerLiveBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse";
          }
          showToast("Camera Active", "Point at student QR badge or pass to scan.", "info");
        } catch (err) {
          console.error("Camera scanner error:", err);
          showToast("Camera Notice", "Unable to access camera or permission denied. You can use 'Scan Image File' or simulation buttons.", "warning");
          if (cameraReader) cameraReader.classList.add("hidden");
          if (cameraPlaceholder) cameraPlaceholder.classList.remove("hidden");
        }
      }
    });
  }

  // 2. Scan Image File via Html5Qrcode
  const fileInput = document.getElementById("qr-file-input");
  if (fileInput && window.Html5Qrcode) {
    fileInput.addEventListener("change", async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const imageFile = e.target.files[0];
        try {
          const qrScanner = new window.Html5Qrcode("qr-camera-reader");
          const decodedText = await qrScanner.scanFile(imageFile, true);
          checkinTicket(decodedText);
          fileInput.value = "";
        } catch (err) {
          showToast("QR Scan Failed", "Could not detect a valid QR code in the selected image.", "error");
          fileInput.value = "";
        }
      }
    });
  }

  // Event Change
  if (select) {
    select.addEventListener("change", () => {
      const db = getDB();
      const event = db.events.find(e => e.id === select.value);
      if (event) {
        const tbody = document.getElementById("attendance-table-body");
        if (tbody) tbody.innerHTML = renderAttendanceRows(event.registrations, event);
        updateStats(event.registrations);
        attachRowEvents();
      }
    });
  }

  // Network Toggle (Online / Offline simulation)
  const toggleNetBtn = document.getElementById("toggle-network-mode-btn");
  const netIndicator = document.getElementById("network-status-indicator");
  const netText = document.getElementById("network-status-text");

  if (toggleNetBtn) {
    toggleNetBtn.addEventListener("click", () => {
      isOffline = !isOffline;
      if (isOffline) {
        netIndicator.className = "w-2.5 h-2.5 rounded-full bg-amber-500";
        netText.innerText = "Offline Mode (Cached)";
        toggleNetBtn.innerText = "Switch to Online";
        showToast("Offline Mode Enabled", "Check-ins will cache to local storage without network drops.", "warning");
      } else {
        netIndicator.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
        netText.innerText = "Online Mode";
        toggleNetBtn.innerText = "Toggle Offline";
        showToast("Online Restored", "Connected to central accreditation server.", "success");
      }
      updateQueueDisplay();
    });
  }

  // Sync Offline Queue Button
  const syncBtn = document.getElementById("sync-offline-queue-btn");
  if (syncBtn) {
    syncBtn.addEventListener("click", () => {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
      if (queue.length === 0) {
        showToast("Queue Empty", "No offline scans pending sync.", "info");
        return;
      }
      const db = getDB();
      queue.forEach(item => {
        const evt = db.events.find(e => e.id === item.eventId);
        const reg = evt?.registrations?.find(r => r.ticketId === item.ticketId);
        if (reg) {
          reg.checkedIn = true;
          reg.checkinTime = item.timestamp;
        }
      });
      saveDB(db);
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      updateQueueDisplay();
      showToast("Sync Successful", `Synchronized ${queue.length} offline scans to central database!`, "success");
    });
  }

  // Manual Check-in
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

  // Simulate Optical Scan
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
        showToast("All registered students for this event are already checked in!", "info");
      }
    });
  }

  // Simulate Duplicate Scan
  const simulateDupBtn = document.getElementById("simulate-dup-scan-btn");
  if (simulateDupBtn) {
    simulateDupBtn.addEventListener("click", () => {
      const db = getDB();
      const eventId = select?.value || db.events[0]?.id;
      const event = db.events.find(e => e.id === eventId);
      const already = event?.registrations?.find(r => r.checkedIn);
      if (already) {
        checkinTicket(already.ticketId);
      } else {
        showToast("Check in at least one student first to test duplicate alert.", "info");
      }
    });
  }

  // Visual Analytics Modal
  const analyticsModal = document.getElementById("analytics-modal");
  const openAnalyticsBtn = document.getElementById("open-analytics-modal-btn");
  const closeAnalyticsBtn = document.getElementById("close-analytics-modal");

  if (openAnalyticsBtn && analyticsModal) {
    openAnalyticsBtn.addEventListener("click", () => {
      const db = getDB();
      const eventId = select?.value || db.events[0]?.id;
      const event = db.events.find(e => e.id === eventId);
      if (event) {
        document.getElementById("analytics-event-name").innerText = `${event.title} • Turnout & Branch Metrics`;
      }
      analyticsModal.classList.remove("hidden");
    });
    if (closeAnalyticsBtn) closeAnalyticsBtn.addEventListener("click", () => analyticsModal.classList.add("hidden"));
    analyticsModal.addEventListener("click", (e) => {
      if (e.target === analyticsModal) analyticsModal.classList.add("hidden");
    });
  }

  // Walk-in Modal
  const walkinModal = document.getElementById("walkin-modal");
  const openWalkinBtn = document.getElementById("open-walkin-modal-btn");
  const closeWalkinBtn = document.getElementById("close-walkin-modal");
  const walkinForm = document.getElementById("walkin-form");

  if (openWalkinBtn && walkinModal) {
    openWalkinBtn.addEventListener("click", () => walkinModal.classList.remove("hidden"));
    if (closeWalkinBtn) closeWalkinBtn.addEventListener("click", () => walkinModal.classList.add("hidden"));
    walkinModal.addEventListener("click", (e) => {
      if (e.target === walkinModal) walkinModal.classList.add("hidden");
    });

    if (walkinForm) {
      walkinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const db = getDB();
        const eventId = select?.value || db.events[0]?.id;
        const event = db.events.find(e => e.id === eventId);
        if (event) {
          const name = document.getElementById("walkin-name").value;
          const rollNo = document.getElementById("walkin-roll").value;
          const department = document.getElementById("walkin-dept").value;
          const email = document.getElementById("walkin-email").value;
          const ticketId = `TCK-WALK-${Math.floor(100 + Math.random() * 900)}`;

          if (!event.registrations) event.registrations = [];
          event.registrations.push({
            studentId: "walkin-" + Date.now(),
            studentName: name,
            rollNo,
            email,
            department,
            ticketId,
            registeredAt: new Date().toISOString().split("T")[0],
            checkedIn: true,
            checkinTime: new Date().toLocaleTimeString()
          });
          event.registeredCount += 1;
          saveDB(db);
          logAudit("Gate Coordinator", "Added Walk-in Delegate", `${event.title} - ${name}`, `Roll No: ${rollNo}`);
          showToast("Walk-in Checked In", `${name} added to roster and verified!`, "success");
          walkinModal.classList.add("hidden");
          const tbody = document.getElementById("attendance-table-body");
          if (tbody) tbody.innerHTML = renderAttendanceRows(event.registrations, event);
          updateStats(event.registrations);
          attachRowEvents();
        }
      });
    }
  }

  // Exports: CSV, Excel, PDF
  const exportCsvBtn = document.getElementById("export-csv-btn");
  const exportExcelBtn = document.getElementById("export-excel-btn");
  const exportPdfBtn = document.getElementById("export-pdf-btn");

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      const db = getDB();
      const eventId = select?.value || db.events[0]?.id;
      const event = db.events.find(e => e.id === eventId);
      if (!event) return;

      let csv = "Student Name,Roll No,Department,Email,Pass ID,Attendance Status,Checkin Time\n";
      (event.registrations || []).forEach(r => {
        csv += `"${r.studentName}","${r.rollNo}","${r.department || 'CSE'}","${r.email || ''}","${r.ticketId}","${r.checkedIn ? 'Checked In' : 'Absent'}","${r.checkinTime || 'N/A'}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PEC_Attendance_${event.id}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      showToast("CSV Downloaded", "Attendance log exported successfully.", "success");
    });
  }

  if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", () => {
      const db = getDB();
      const eventId = select?.value || db.events[0]?.id;
      const event = db.events.find(e => e.id === eventId);
      if (!event) return;

      let tsv = "Student Name\tRoll No\tDepartment\tPass ID\tStatus\tTime\n";
      (event.registrations || []).forEach(r => {
        tsv += `${r.studentName}\t${r.rollNo}\t${r.department || 'CSE'}\t${r.ticketId}\t${r.checkedIn ? 'Checked In' : 'Absent'}\t${r.checkinTime || 'N/A'}\n`;
      });

      const blob = new Blob([tsv], { type: "application/vnd.ms-excel;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PEC_Attendance_${event.id}.xls`;
      a.click();
      showToast("Excel Export Ready", "Exported formatted spreadsheet.", "success");
    });
  }

  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
      window.print();
    });
  }

  const attachRowEvents = () => {
    document.querySelectorAll(".quick-checkin-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        checkinTicket(btn.dataset.ticket);
      });
    });

    // Undo Check-in
    document.querySelectorAll(".undo-checkin-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const ticketId = btn.dataset.ticket;
        const db = getDB();
        const eventId = select?.value || db.events[0]?.id;
        const event = db.events.find(e => e.id === eventId);
        const reg = event?.registrations?.find(r => r.ticketId === ticketId);
        if (reg) {
          reg.checkedIn = false;
          reg.checkinTime = null;
          saveDB(db);
          logAudit("Gate Coordinator", "Corrected Attendance (Undo)", `${event.title} - ${reg.studentName}`, "Marked back to absent");
          showToast("Correction Applied", `Attendance undone for ${reg.studentName}.`, "info");
          const tbody = document.getElementById("attendance-table-body");
          if (tbody) tbody.innerHTML = renderAttendanceRows(event.registrations, event);
          updateStats(event.registrations);
          attachRowEvents();
        }
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

        const certId = `CERT-PEC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const verificationHash = `sha256:0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        const newCert = {
          id: certId,
          title: `Certificate of Participation - ${eventName}`,
          recipientName: studentName,
          recipientRoll: rollNo,
          recipientEmail: `${rollNo.toLowerCase()}@pragati.ac.in`,
          department,
          eventName,
          category: "Course Completion",
          institution: "Pragati University / Pragati Engineering College (Autonomous)",
          issued_by: "Pragati University Central Council of Technical Societies (CCTSC)",
          issueDate: new Date().toISOString().split("T")[0],
          verificationHash,
          status: "Verified & Active"
        };

        if (!db.certificates) db.certificates = [];
        db.certificates.unshift(newCert);
        saveDB(db);
        logAudit("Faculty Reviewer", "Issued Certificate", `${studentName} - ${certId}`, `Event: ${eventName}`);
        addNotification({
          userId: studentId,
          title: "Accredited Certificate Issued",
          message: `Your certificate for "${eventName}" is now available in your Student Profile.`,
          category: "Certificates",
          link: `#/certificates`
        });

        showToast(`Certificate #${certId} minted for ${studentName}!`, "success");
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
