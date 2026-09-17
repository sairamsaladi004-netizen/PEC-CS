import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

// Global references to Chart.js instances to allow clean destruction and re-rendering
let chartParticipationInstance = null;
let chartDeptInstance = null;
let chartYearInstance = null;
let chartRatingInstance = null;

export function renderClubAdminDashboardView(params = {}) {
  const db = getDB();
  const currentUser = getCurrentUser() || {};
  
  // Determine selected club: from query params, or user's assigned club, or fallback to first club (I4-08)
  const defaultClubId = currentUser.adminForClub || (currentUser.clubs && currentUser.clubs[0]) || "I4-08";
  const selectedClubId = params.id || defaultClubId;
  const club = db.clubs.find(c => c.id === selectedClubId) || db.clubs[0];

  // Budget info from db or fallback
  const budgetInfo = (db.clubBudgets || []).find(b => b.clubId === club.id) || {
    allocated: 75000,
    utilized: 51000,
    claims: []
  };
  const budgetPct = Math.round((budgetInfo.utilized / budgetInfo.allocated) * 100);

  // Events related to this club
  const clubEvents = db.events.filter(e => e.clubId === club.id || e.organizer?.toLowerCase().includes(club.shortName?.toLowerCase() || club.id));

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Header & Club Switcher Bar -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex items-center space-x-4">
          <img src="${club.logo || club.icon || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'}" alt="${club.name}" class="w-16 h-16 rounded-2xl border-2 border-slate-100 object-cover shadow-sm bg-slate-50 shrink-0" />
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                ${club.category || club.domain || 'Technical Society'}
              </span>
              <span class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Club Admin Portal
              </span>
              <span class="text-xs text-slate-400 font-mono">Academic Year 2025-2026</span>
            </div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight mt-1">${club.name}</h1>
            <p class="text-xs text-slate-500">
              Department of ${club.department} • Faculty Coordinator: <span class="font-semibold text-slate-700">${typeof club.facultyCoordinator === 'object' ? club.facultyCoordinator.name : (club.facultyCoordinator || 'Coordinator')}</span>
            </p>
          </div>
        </div>

        <!-- Club Selector Dropdown & Quick Actions -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
            <span class="text-xs font-bold text-slate-500">Managing Chapter:</span>
            <select id="club-switcher-select" class="bg-white text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              ${db.clubs.map(c => `
                <option value="${c.id}" ${c.id === club.id ? 'selected' : ''}>
                  ${c.id} - ${c.name}
                </option>
              `).join('')}
            </select>
          </div>

          <a href="#/attendance" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5">
            <span>📷 QR Kiosk</span>
          </a>
          <button id="open-club-broadcast-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5">
            <span>📢 Send Notice</span>
          </button>
        </div>
      </div>

      <!-- High-Level Executive KPI Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Members -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Enrolled Members</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold font-mono">↑ 18% QoQ</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">${club.memberCount}</div>
          <div class="text-[11px] text-slate-400 font-mono">Across 5 Eng. Depts</div>
        </div>

        <!-- Attendance / Turnout Rate -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Avg Event Turnout</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono">High Engagement</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-blue-600">89.4%</div>
          <div class="text-[11px] text-emerald-600 font-bold">Verified via QR Scanner</div>
        </div>

        <!-- Activities Hosted -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Conducted Events</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold font-mono">NBA Tier-1</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-purple-600">${Math.max(4, clubEvents.length)} Events</div>
          <div class="text-[11px] text-slate-400 font-mono">1,240 Total Check-ins</div>
        </div>

        <!-- Annual Budget Health -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Budget Utilization</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold font-mono">${budgetPct}% used</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">₹${(budgetInfo.allocated - budgetInfo.utilized).toLocaleString()}</div>
          <div class="text-[11px] text-slate-400 font-mono">Remaining of ₹${budgetInfo.allocated.toLocaleString()}</div>
        </div>

      </div>

      <!-- Core Visualizations Grid (Chart.js) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- CHART 1: Event Participation Trends -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 class="text-base font-bold text-slate-900">Event Participation & Attendance Trends</h2>
              <p class="text-xs text-slate-500">Tracking registered delegates vs verified QR gate check-ins</p>
            </div>
            <div class="flex items-center space-x-1.5">
              <button data-range="6" class="chart-filter-btn px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 text-white transition-colors">Last 6 Events</button>
              <button data-range="12" class="chart-filter-btn px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Full AY</button>
            </div>
          </div>

          <div class="h-72 w-full relative">
            <canvas id="chart-participation-trend"></canvas>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div class="flex items-center space-x-4">
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                <span>Registered</span>
              </span>
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span>Actual Turnout</span>
              </span>
            </div>
            <span class="font-mono font-bold text-emerald-600">Avg No-Show Rate: 10.6%</span>
          </div>
        </div>

        <!-- CHART 2: Member Distribution Across Departments -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Member Distribution Across Departments</h2>
              <p class="text-xs text-slate-500">Interdisciplinary student enrollment breakdown</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              5 Departments
            </span>
          </div>

          <div class="h-72 w-full relative flex items-center justify-center">
            <canvas id="chart-dept-distribution"></canvas>
          </div>

          <div class="pt-2 border-t border-slate-100 grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-[10px] font-mono">
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="block font-bold text-blue-600">CSE</span>
              <span class="text-slate-500">42% (192)</span>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="block font-bold text-emerald-600">IT</span>
              <span class="text-slate-500">26% (120)</span>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="block font-bold text-purple-600">AIDS</span>
              <span class="text-slate-500">18% (82)</span>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="block font-bold text-amber-600">ECE</span>
              <span class="text-slate-500">9% (42)</span>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="block font-bold text-rose-600">MECH</span>
              <span class="text-slate-500">5% (24)</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Secondary Visualizations Grid: Year of Study & Workshop Ratings -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- CHART 3: Year of Study Demographics -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Cohort Demographics by Academic Year</h2>
            <p class="text-xs text-slate-500">Distribution across 1st, 2nd, 3rd, and 4th-year engineering delegates</p>
          </div>

          <div class="h-64 w-full relative">
            <canvas id="chart-year-demographics"></canvas>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Primary Contributor Cohort: <strong class="text-slate-800">2nd & 3rd Year (64%)</strong></span>
            <span class="text-blue-600 font-mono font-bold">110 Freshmen Inducted</span>
          </div>
        </div>

        <!-- CHART 4: Workshop Feedback & Satisfaction Scores -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Workshop & Activity Satisfaction Ratings</h2>
            <p class="text-xs text-slate-500">Anonymous post-event attendee feedback (Scale: 1.0 to 5.0 Stars)</p>
          </div>

          <div class="h-64 w-full relative">
            <canvas id="chart-ratings-bar"></canvas>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Chapter Rating: <strong class="text-amber-600 font-mono">4.82 / 5.0 ★</strong></span>
            <span class="text-emerald-600 font-bold font-mono">98.2% Positive Response</span>
          </div>
        </div>

      </div>

      <!-- Detailed Event Participation Ledger Table -->
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-2">
        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Recent Chapter Activities & Turnout Audit</h2>
            <p class="text-xs text-slate-500">Comprehensive attendance figures with QR scanner telemetry</p>
          </div>
          <div class="flex items-center space-x-2">
            <button id="export-club-metrics-btn" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5">
              <span>📥 Export CSV Report</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th class="p-4 pl-6">Event Activity</th>
                <th class="p-4">Category</th>
                <th class="p-4">Date & Time</th>
                <th class="p-4">Registered</th>
                <th class="p-4">Turnout Check-in</th>
                <th class="p-4">Turnout Ratio</th>
                <th class="p-4 text-right pr-6">Kiosk Roster</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              ${[
                { title: "Google Cloud & Docker Study Jam", cat: "workshop", date: "2026-09-18", time: "09:00 AM", reg: 220, attended: 198, venue: "Lab 3" },
                { title: "Cross-Platform Flutter Bootcamp", cat: "bootcamp", date: "2026-09-05", time: "10:00 AM", reg: 160, attended: 142, venue: "Hall A" },
                { title: "DevHack 2026: 36-Hour Hackathon", cat: "hackathon", date: "2026-08-22", time: "08:30 AM", reg: 310, attended: 285, venue: "Auditorium" },
                { title: "Android Jetpack Compose Sprints", cat: "workshop", date: "2026-08-10", time: "02:00 PM", reg: 180, attended: 156, venue: "Lab 2" },
                { title: "Git, GitHub & Open Source Kickoff", cat: "seminar", date: "2026-07-28", time: "11:00 AM", reg: 120, attended: 108, venue: "Seminar Hall" }
              ].map(evt => {
                const ratio = Math.round((evt.attended / evt.reg) * 100);
                return `
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-4 pl-6">
                      <div class="font-bold text-slate-900">${evt.title}</div>
                      <div class="text-[11px] text-slate-400 font-mono">📍 ${evt.venue}</div>
                    </td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-blue-50 text-blue-700">
                        ${evt.cat}
                      </span>
                    </td>
                    <td class="p-4 font-mono text-slate-600 text-[11px]">${evt.date}<br><span class="text-slate-400">${evt.time}</span></td>
                    <td class="p-4 font-mono font-bold text-slate-800">${evt.reg} delegates</td>
                    <td class="p-4 font-mono font-bold text-emerald-600">${evt.attended} checked-in</td>
                    <td class="p-4">
                      <div class="flex items-center space-x-2">
                        <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div class="bg-emerald-500 h-1.5 rounded-full" style="width: ${ratio}%"></div>
                        </div>
                        <span class="font-mono text-[11px] font-bold text-slate-700">${ratio}%</span>
                      </div>
                    </td>
                    <td class="p-4 text-right pr-6">
                      <a href="#/attendance" class="px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                        Launch Scanner →
                      </a>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Broadcast Announcement Modal -->
      <div id="club-broadcast-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Broadcast Notice to Club Delegates</h3>
              <p class="text-xs text-slate-500">Sends notification to all ${club.memberCount} registered ${club.shortName} members</p>
            </div>
            <button id="close-club-broadcast-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form id="club-broadcast-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notice Headline</label>
              <input type="text" id="club-notice-title" required placeholder="e.g. Lab 3 Venue Change for Cloud Study Jam" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Target Cohort</label>
              <select id="club-notice-cohort" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500">
                <option value="all">All Enrolled Members (${club.memberCount})</option>
                <option value="registered">Registered Attendees for Upcoming Event</option>
                <option value="core">Core Executive Team Only</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notice Details</label>
              <textarea id="club-notice-body" rows="3" required placeholder="Please arrive 15 minutes early with your student ID cards..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Dispatch Notice Broadcast
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function attachClubAdminDashboardEvents(params = {}) {
  // 1. Club Switcher Select
  const switcher = document.getElementById("club-switcher-select");
  if (switcher) {
    switcher.addEventListener("change", (e) => {
      const selectedId = e.target.value;
      window.location.hash = `#/club-dashboard?id=${selectedId}`;
    });
  }

  // 2. Broadcast Modal Controls
  const openBroadcastBtn = document.getElementById("open-club-broadcast-btn");
  const broadcastModal = document.getElementById("club-broadcast-modal");
  const closeBroadcastBtn = document.getElementById("close-club-broadcast-modal");
  const broadcastForm = document.getElementById("club-broadcast-form");

  if (openBroadcastBtn && broadcastModal) {
    openBroadcastBtn.addEventListener("click", () => broadcastModal.classList.remove("hidden"));
    if (closeBroadcastBtn) closeBroadcastBtn.addEventListener("click", () => broadcastModal.classList.add("hidden"));
    broadcastModal.addEventListener("click", (e) => {
      if (e.target === broadcastModal) broadcastModal.classList.add("hidden");
    });

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
        showToast("Notice Dispatched", "Broadcasting notification to club members.", "success");
        broadcastModal.classList.add("hidden");
        broadcastForm.reset();
      });
    }
  }

  // 3. Export CSV metrics
  const exportBtn = document.getElementById("export-club-metrics-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const db = getDB();
      const rows = [
        ["Event Title", "Category", "Date", "Registered Delegates", "Verified Attendance", "Turnout %", "Venue"],
        ["Google Cloud & Docker Study Jam", "workshop", "2026-09-18", "220", "198", "90%", "Lab 3"],
        ["Cross-Platform Flutter Bootcamp", "bootcamp", "2026-09-05", "160", "142", "88%", "Hall A"],
        ["DevHack 2026: 36-Hour Hackathon", "hackathon", "2026-08-22", "310", "285", "92%", "Auditorium"],
        ["Android Jetpack Compose Sprints", "workshop", "2026-08-10", "180", "156", "86%", "Lab 2"],
        ["Git, GitHub & Open Source Kickoff", "seminar", "2026-07-28", "120", "108", "90%", "Seminar Hall"]
      ];

      const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `PEC_Club_Participation_Metrics_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Metrics Exported", "Participation ledger CSV downloaded.", "success");
    });
  }

  // 4. Render Chart.js Visualizations
  renderClubAdminCharts(params);
}

function renderClubAdminCharts(params = {}) {
  if (!window.Chart) return;

  const db = getDB();
  const defaultClubId = "I4-08";
  const selectedClubId = params.id || defaultClubId;
  const club = db.clubs.find(c => c.id === selectedClubId) || db.clubs[0];

  // Dynamic values tailored to specific club characteristics
  const isAiml = club.id === 'I4-08';
  const isRobo = club.id === 'I4-03';
  const isCyber = club.id === 'I4-06';

  // Department proportions:
  const deptData = isAiml 
    ? [45, 20, 15, 12, 8] 
    : isCyber 
    ? [40, 30, 15, 10, 5]
    : isRobo
    ? [20, 15, 10, 35, 20]
    : [35, 25, 20, 12, 8];

  // Event titles tailored
  const eventLabels = isAiml 
    ? ["Deep Learning Summit", "PyTorch Hands-on Sprint", "Computer Vision Hack", "MLOps Edge Lab", "Turing AI Conclave"]
    : isCyber
    ? ["OWASP Top 10 Lab", "Wireshark Packet Hunt", "Reverse Engineering 101", "Active Directory Pentest", "Campus CTF 2026"]
    : isRobo
    ? ["Autonomous Line Rover", "ROS Gazebo Simulation", "Manipulator Kinematics", "Microcontroller Sprint", "RoboWars Exhibition"]
    : ["Technical Bootcamp", "Annual Symposia", "Hands-on Workshop", "Student Project Expo", "Department Conclave"];

  const registeredData = isAcm 
    ? [140, 180, 165, 190, 240]
    : isCyber
    ? [110, 150, 175, 160, 210]
    : [120, 160, 180, 220, 310];

  const attendedData = isAcm 
    ? [128, 162, 149, 172, 224]
    : isCyber
    ? [98, 136, 158, 144, 192]
    : [108, 142, 156, 198, 285];

  // Destroy previous charts if re-entering or switching
  if (chartParticipationInstance) chartParticipationInstance.destroy();
  if (chartDeptInstance) chartDeptInstance.destroy();
  if (chartYearInstance) chartYearInstance.destroy();
  if (chartRatingInstance) chartRatingInstance.destroy();

  // 1. Chart: Event Participation Trends (Combo Bar + Line)
  const ctxParticipation = document.getElementById("chart-participation-trend");
  if (ctxParticipation) {
    chartParticipationInstance = new window.Chart(ctxParticipation, {
      type: "bar",
      data: {
        labels: eventLabels,
        datasets: [
          {
            label: "Actual Verified Turnout",
            data: attendedData,
            type: "line",
            borderColor: "#10b981",
            backgroundColor: "#10b981",
            borderWidth: 3,
            pointBackgroundColor: "#10b981",
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3,
            order: 1
          },
          {
            label: "Registered Delegates",
            data: registeredData,
            backgroundColor: "rgba(59, 130, 246, 0.75)",
            borderRadius: 8,
            borderSkipped: false,
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: { font: { size: 10, family: 'Inter' } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, family: 'Inter' } }
          }
        },
        plugins: {
          legend: {
            position: "top",
            labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } }
          },
          tooltip: {
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              footer: (items) => {
                const reg = items.find(i => i.datasetIndex === 1)?.raw || 0;
                const att = items.find(i => i.datasetIndex === 0)?.raw || 0;
                const pct = reg > 0 ? Math.round((att / reg) * 100) : 0;
                return `Turnout Efficiency: ${pct}%`;
              }
            }
          }
        }
      }
    });
  }

  // 2. Chart: Member Distribution Across Departments (Doughnut)
  const ctxDept = document.getElementById("chart-dept-distribution");
  if (ctxDept) {
    chartDeptInstance = new window.Chart(ctxDept, {
      type: "doughnut",
      data: {
        labels: [
          "Computer Science (CSE)",
          "Information Tech (IT)",
          "AI & Data Science (AIDS)",
          "Electronics (ECE)",
          "Mechanical (MECH)"
        ],
        datasets: [{
          data: deptData,
          backgroundColor: [
            "#3b82f6", // Blue
            "#10b981", // Emerald
            "#8b5cf6", // Purple
            "#f59e0b", // Amber
            "#f43f5e"  // Rose
          ],
          borderWidth: 3,
          borderColor: "#ffffff",
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 10,
              padding: 12,
              font: { size: 10, family: 'Inter' }
            }
          },
          tooltip: {
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw}% of Members`
            }
          }
        }
      }
    });
  }

  // 3. Chart: Year-of-Study Demographics (Bar Chart)
  const ctxYear = document.getElementById("chart-year-demographics");
  if (ctxYear) {
    chartYearInstance = new window.Chart(ctxYear, {
      type: "bar",
      data: {
        labels: ["1st Year (Inductees)", "2nd Year (Core)", "3rd Year (Organizers)", "4th Year (Mentors)"],
        datasets: [{
          label: "Active Student Members",
          data: [110, 165, 145, 60],
          backgroundColor: ["#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: { font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // 4. Chart: Workshop Satisfaction Ratings (Horizontal Bar)
  const ctxRating = document.getElementById("chart-ratings-bar");
  if (ctxRating) {
    chartRatingInstance = new window.Chart(ctxRating, {
      type: "bar",
      data: {
        labels: eventLabels,
        datasets: [{
          label: "Participant Rating (out of 5.0)",
          data: [4.7, 4.8, 4.9, 4.75, 4.95],
          backgroundColor: "#f59e0b",
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 4.0,
            max: 5.0,
            grid: { color: "#f1f5f9" },
            ticks: { font: { size: 10 } }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => ` Average Rating: ${c.raw} ★`
            }
          }
        }
      }
    });
  }
}
