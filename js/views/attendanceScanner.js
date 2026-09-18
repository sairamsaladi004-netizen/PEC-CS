// Pragati Engineering College (PEC Autonomous) - CampusTech
// High-Speed html5-qrcode Attendance Scanner Module for Club Admins

import { getCurrentUser } from '../auth.js';
import { getDB, saveDB, logAudit, apiRequest } from '../db.js';
import { showToast } from '../components/toast.js';
import { ROLES, normalizeRole, isUserAuthorizedForClub } from '../rbac.js';
import { renderAccessDenied, attachAccessDeniedEvents } from '../components/accessDenied.js';

const OFFLINE_BADGE_SCANS_KEY = "campustech_offline_badge_scans_queue";
let activeHtml5QrCode = null;
let isScannerActive = false;
let lastScannedCode = null;
let lastScanTimestamp = 0;
let sessionScanHistory = [];

export function renderAttendanceScannerView(params = {}) {
  const currentUser = getCurrentUser() || {};
  const currentRole = normalizeRole(currentUser.role);
  const db = getDB();

  // Role Security Guard: Only Club Admins, Faculty Coordinators, Super Admins, and Dept Admins can scan
  const allowedRoles = [ROLES.CLUB_ADMIN, ROLES.FACULTY_COORDINATOR, ROLES.SUPER_ADMIN, ROLES.DEPARTMENT_ADMIN];
  if (!allowedRoles.includes(currentRole)) {
    return renderAccessDenied({
      requiredRole: ROLES.CLUB_ADMIN,
      attemptedRoute: "#/attendance-scanner",
      message: `Access restricted to Club Administrators and Coordinators. Students can view and generate their Digital Badges in the Badge Studio.`
    });
  }

  // Determine active club
  const userClub = currentUser.clubId || (currentUser.assignedClubs && currentUser.assignedClubs[0]) || "I4-08";
  const selectedClubId = params.clubId || params.id || userClub;

  if (!isUserAuthorizedForClub(currentUser, selectedClubId) && currentRole !== ROLES.SUPER_ADMIN) {
    return renderAccessDenied({
      requiredRole: ROLES.CLUB_ADMIN,
      attemptedRoute: `#/attendance-scanner?clubId=${selectedClubId}`,
      clubId: selectedClubId,
      message: `Access denied. You are only authorized to scan member badges for your assigned club.`
    });
  }

  const allClubs = db.clubs || [];
  const activeClub = allClubs.find(c => c.id === selectedClubId) || allClubs[0] || {
    id: "I4-08",
    name: "AI & ML Turing Club",
    department: "CSE(AIML)",
    category: "Technical Society"
  };

  // Club events for optional event linking
  const clubEvents = (db.events || []).filter(e => e.club_id === activeClub.id || e.clubId === activeClub.id);
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Today's existing scans for this club
  const todayClubScans = (db.badge_scans || []).filter(s => s.club_id === activeClub.id && s.date === todayDateStr);

  return `
    <div class="space-y-6 pb-20 max-w-7xl mx-auto">
      
      <!-- Top Header & Live Accreditation Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider font-mono">Real-Time Optical Badge Scanner</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Club Attendance & Badge Scanner</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">High-speed QR badge verification, duplicate prevention, and automated logging for <strong>${activeClub.name}</strong></p>
        </div>

        <!-- Quick Access Toolbar -->
        <div class="flex flex-wrap items-center gap-2.5">
          <a href="#/club-dashboard?id=${activeClub.id}" class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-all flex items-center space-x-1.5">
            <span>⚡</span>
            <span>Club Dashboard</span>
          </a>
          <a href="#/badges?clubId=${activeClub.id}" class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all flex items-center space-x-1.5">
            <span>✨</span>
            <span>Badge Studio</span>
          </a>
          <button id="scanner-sound-toggle-btn" class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer">
            <span id="sound-icon">🔊</span>
            <span id="sound-text">Audio On</span>
          </button>
        </div>
      </div>

      <!-- Live Session Config & Gate Controls Bar -->
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Club Selector (for multi-club coordinators / admins) -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Managing Technical Society</label>
            <select id="scanner-club-select" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
              ${allClubs.map(c => `
                <option value="${c.id}" ${c.id === activeClub.id ? 'selected' : ''}>
                  ${c.name} (${c.department || 'CSE'})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Session / Activity Type -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Session / Gate Scope</label>
            <select id="scanner-session-select" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
              <option value="General Club Meeting & Lab Entry">General Club Meeting & Lab Entry</option>
              <option value="Hackathon Arena & Code Sprint">Hackathon Arena & Code Sprint</option>
              <option value="Hands-on Technical Workshop">Hands-on Technical Workshop</option>
              <option value="Guest Lecture & Expert Keynote">Guest Lecture & Expert Keynote</option>
              <option value="Core Executive Committee Review">Core Executive Committee Review</option>
              ${clubEvents.map(e => `<option value="Event: ${e.title}">Event: ${e.title}</option>`).join('')}
            </select>
          </div>

          <!-- Gate Terminal ID -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Gate Scanner Terminal</label>
            <select id="scanner-gate-select" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
              <option value="GATE-01">Gate 1 • Main Department Lobby</option>
              <option value="GATE-02">Gate 2 • AI & Cloud Innovation Lab</option>
              <option value="GATE-03">Gate 3 • Central Seminar Hall A</option>
              <option value="GATE-04">Gate 4 • High Performance GPU Cluster</option>
              <option value="GATE-05">Gate 5 • Hardware & IoT Sensor Bench</option>
            </select>
          </div>

          <!-- Camera Device Selector -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Camera Hardware</label>
            <select id="scanner-camera-select" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
              <option value="environment">Rear / Environment Camera (Recommended)</option>
              <option value="user">Front Facing Camera</option>
            </select>
          </div>

        </div>

        <!-- Mode Switches: Continuous Auto-Scan & Supabase Status -->
        <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-4">
            <label class="flex items-center space-x-2 text-slate-700 font-semibold cursor-pointer">
              <input type="checkbox" id="toggle-continuous-scan" checked class="rounded text-blue-600 focus:ring-blue-500 w-4 h-4">
              <span>Continuous Queue Scan Mode</span>
            </label>
            <label class="flex items-center space-x-2 text-slate-700 font-semibold cursor-pointer">
              <input type="checkbox" id="toggle-beep-feedback" checked class="rounded text-blue-600 focus:ring-blue-500 w-4 h-4">
              <span>Acoustic Beep Feedback</span>
            </label>
          </div>

          <div class="flex items-center space-x-3">
            <div id="offline-scanner-badge" class="hidden px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
              <span>Offline Queue: <strong id="offline-scan-count">0</strong></span>
              <button id="sync-offline-scans-btn" class="ml-1 underline text-amber-900 font-black cursor-pointer">Sync</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Scanner HUD & Real-time Verification Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- LEFT COLUMN: Live Camera Viewfinder & Hardware Controls (5 Cols) -->
        <div class="lg:col-span-5 space-y-4">
          
          <div class="bg-slate-950 rounded-3xl p-5 border border-slate-800 shadow-2xl text-white space-y-4 relative overflow-hidden">
            
            <!-- Scanner Viewfinder Header -->
            <div class="flex items-center justify-between relative z-10">
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Optical Scanner Feed</span>
              </div>
              <span id="scanner-state-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                STANDBY
              </span>
            </div>

            <!-- html5-qrcode Video Container & Optical Overlay -->
            <div class="relative w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700/80 flex items-center justify-center">
              
              <!-- HTML5 QR Code Mount Node -->
              <div id="html5-scanner-video-region" class="w-full h-full object-cover"></div>

              <!-- Viewfinder Idle Placeholder -->
              <div id="scanner-idle-screen" class="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div class="w-24 h-24 rounded-3xl border-2 border-dashed border-blue-500/60 bg-blue-950/40 flex items-center justify-center text-4xl shadow-inner animate-pulse">
                  📷
                </div>
                <div>
                  <h3 class="text-sm font-bold text-white">Camera Offline</h3>
                  <p class="text-xs text-slate-400 mt-1 max-w-xs">Click "Start Optical Camera" to activate live html5-qrcode scanner</p>
                </div>
                <button id="activate-camera-btn" class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer">
                  <span>🎥</span>
                  <span>Start Optical Camera</span>
                </button>
              </div>

              <!-- Optical Targeting Reticle & Holographic Laser Scan Line -->
              <div id="scanner-targeting-overlay" class="hidden absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                <div class="flex justify-between">
                  <div class="w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg"></div>
                  <div class="w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg"></div>
                </div>
                
                <!-- Laser Sweep Line -->
                <div class="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse"></div>

                <div class="flex justify-between">
                  <div class="w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg"></div>
                  <div class="w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg"></div>
                </div>
              </div>

            </div>

            <!-- Hardware Action Controls -->
            <div class="space-y-2 relative z-10">
              <div class="grid grid-cols-2 gap-2">
                <button id="toggle-camera-feed-btn" class="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer">
                  <span>📹</span>
                  <span id="camera-feed-btn-label">Start Camera</span>
                </button>
                <label for="scanner-file-input" class="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-center">
                  <span>🖼️</span>
                  <span>Scan Badge File</span>
                  <input type="file" id="scanner-file-input" accept="image/*" class="hidden" />
                </label>
              </div>

              <!-- Quick Demo Simulation Buttons -->
              <div class="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div class="text-[10px] text-slate-400 font-mono uppercase font-bold">Fast Test Simulation</div>
                <div class="grid grid-cols-2 gap-2">
                  <button id="sim-aarav-scan-btn" class="py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold rounded-xl border border-slate-800 transition-all flex items-center justify-center space-x-1 cursor-pointer">
                    <span>⚡</span>
                    <span>Aarav (22CS101)</span>
                  </button>
                  <button id="sim-priya-scan-btn" class="py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold rounded-xl border border-slate-800 transition-all flex items-center justify-center space-x-1 cursor-pointer">
                    <span>⚡</span>
                    <span>Priya (22CS142)</span>
                  </button>
                </div>
                <button id="sim-dup-test-btn" class="w-full py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] font-bold rounded-xl border border-rose-900/50 transition-all flex items-center justify-center space-x-1 cursor-pointer">
                  <span>⚠️</span>
                  <span>Test Duplicate Entry Alert</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Manual Pass / Token Input Bar -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <label class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Manual Token / Roll No Check-in</label>
            <div class="flex items-center space-x-2">
              <input 
                type="text" 
                id="manual-scanner-input" 
                placeholder="Enter Pass ID (PEC-PASS-22CS101) or Roll (22CS101)..." 
                class="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button id="manual-scanner-submit-btn" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer">
                Verify
              </button>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: Real-Time Verified Attendee HUD & Entry Log (7 Cols) -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- Live Verified Attendee HUD Card -->
          <div id="verified-attendee-hud" class="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md space-y-4 transition-all duration-300">
            
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center space-x-2">
                <span id="hud-status-indicator" class="w-3 h-3 rounded-full bg-slate-400"></span>
                <h2 id="hud-status-title" class="text-xs font-black uppercase tracking-wider text-slate-500 font-mono">
                  Ready to Scan Member Badges
                </h2>
              </div>
              <span id="hud-timestamp" class="text-xs font-mono text-slate-400">Awaiting input...</span>
            </div>

            <!-- Attendee Bio HUD Layout -->
            <div id="hud-body-content" class="flex flex-col sm:flex-row items-center sm:items-start gap-4 py-2">
              <img id="hud-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" class="w-20 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm bg-slate-900 shrink-0" alt="Attendee" />
              
              <div class="space-y-1.5 text-center sm:text-left flex-1 overflow-hidden">
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 id="hud-name" class="text-xl font-black text-slate-900 tracking-tight">Point camera at QR Badge</h3>
                  <span id="hud-tier-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                    Standby
                  </span>
                </div>
                
                <div class="text-xs font-mono text-slate-600">
                  <span id="hud-roll">ROLL: ---</span> • <span id="hud-dept">DEPT: ---</span> • <span id="hud-year">YEAR: ---</span>
                </div>

                <div id="hud-notice-box" class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Align the holographic student badge QR code within the camera frame for instant recognition and Supabase entry logging.
                </div>
              </div>
            </div>

          </div>

          <!-- Session Scan Analytics Metrics -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Scans</div>
              <div id="stat-total-scans" class="text-2xl font-black text-slate-900 mt-0.5">${todayClubScans.length}</div>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Admitted Today</div>
              <div id="stat-admitted" class="text-2xl font-black text-emerald-700 mt-0.5">${todayClubScans.length}</div>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div class="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Duplicate Blocks</div>
              <div id="stat-duplicates" class="text-2xl font-black text-rose-700 mt-0.5">0</div>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <div class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Turnout Rate</div>
              <div id="stat-turnout-rate" class="text-2xl font-black text-blue-700 mt-0.5">94%</div>
            </div>
          </div>

          <!-- Live Session Scanned Attendees Roster -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
            
            <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-black text-slate-900">Live Scanned Attendees Stream</h3>
                <p class="text-xs text-slate-500">Real-time log synchronized with Supabase database</p>
              </div>

              <!-- Export Controls -->
              <div class="flex items-center space-x-2">
                <button id="export-scanner-csv-btn" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
                  📥 CSV
                </button>
                <button id="export-scanner-print-btn" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all">
                  🖨️ Print
                </button>
              </div>
            </div>

            <div class="overflow-x-auto max-h-80 overflow-y-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th class="p-3.5 pl-5">Delegate Name & Roll No</th>
                    <th class="p-3.5">Department</th>
                    <th class="p-3.5">Badge Tier</th>
                    <th class="p-3.5">Gate / Terminal</th>
                    <th class="p-3.5 text-right pr-5">Time</th>
                  </tr>
                </thead>
                <tbody id="scanner-stream-tbody" class="divide-y divide-slate-100 font-medium text-slate-700">
                  ${renderScannerRows(todayClubScans)}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

    </div>
  `;
}

function renderScannerRows(scans) {
  if (!scans || scans.length === 0) {
    return `
      <tr>
        <td colspan="5" class="p-8 text-center text-slate-400">
          <div class="text-2xl mb-1">📷</div>
          No badges scanned in this session yet. Activate camera to start recording entries.
        </td>
      </tr>
    `;
  }

  return scans.map(s => `
    <tr class="hover:bg-slate-50 transition-colors animate-fadeIn">
      <td class="p-3.5 pl-5">
        <div class="font-black text-slate-900">${s.student_name || 'Student Attendee'}</div>
        <div class="text-[10px] font-mono text-slate-400">${s.roll_no || '22CS101'}</div>
      </td>
      <td class="p-3.5 text-slate-600">${s.department || 'CSE'}</td>
      <td class="p-3.5">
        <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${s.badge_tier?.includes('Lead') || s.badge_tier?.includes('Champion') ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
          ${s.badge_tier || 'Student Member'}
        </span>
      </td>
      <td class="p-3.5 font-mono text-[11px] text-slate-500">${s.gate_id || 'GATE-01'}</td>
      <td class="p-3.5 text-right pr-5 font-mono text-emerald-700 font-bold">
        ${s.checkin_time || 'Just now'}
      </td>
    </tr>
  `).join('');
}

export function attachAttendanceScannerEvents(params = {}) {
  const currentUser = getCurrentUser() || {};
  const db = getDB();
  const allClubs = db.clubs || [];
  
  let soundEnabled = true;
  let continuousScan = true;
  let totalDuplicatesBlocked = 0;

  const clubSelect = document.getElementById("scanner-club-select");
  const sessionSelect = document.getElementById("scanner-session-select");
  const gateSelect = document.getElementById("scanner-gate-select");
  const cameraSelect = document.getElementById("scanner-camera-select");

  // Web Audio Synthesizer for High-Speed Gate Scans
  const playFeedbackSound = (type = "success") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        // High frequency double chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === "vip") {
        // Executive Fanfare chime
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else {
        // Error Buzz
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(140, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // Sound Toggle
  const soundToggleBtn = document.getElementById("scanner-sound-toggle-btn");
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      document.getElementById("sound-icon").textContent = soundEnabled ? "🔊" : "🔇";
      document.getElementById("sound-text").textContent = soundEnabled ? "Audio On" : "Audio Muted";
      showToast("Audio Feedback", soundEnabled ? "Chimes enabled." : "Audio muted.", "info");
    });
  }

  // Continuous Scan Checkbox
  const toggleContinuous = document.getElementById("toggle-continuous-scan");
  if (toggleContinuous) {
    toggleContinuous.addEventListener("change", (e) => {
      continuousScan = e.target.checked;
    });
  }

  // Core Badge Processing Engine
  async function processScannedBadge(decodedText) {
    if (!decodedText) return;
    const now = Date.now();

    // Debounce the exact same code within 2.5 seconds to prevent camera bounce
    if (lastScannedCode === decodedText && now - lastScanTimestamp < 2500) {
      return;
    }
    lastScannedCode = decodedText;
    lastScanTimestamp = now;

    const clubId = clubSelect?.value || currentUser.clubId || "I4-08";
    const sessionType = sessionSelect?.value || "General Club Meeting & Lab Entry";
    const gateId = gateSelect?.value || "GATE-01";

    const hudCard = document.getElementById("verified-attendee-hud");
    const hudIndicator = document.getElementById("hud-status-indicator");
    const hudTitle = document.getElementById("hud-status-title");
    const hudTime = document.getElementById("hud-timestamp");
    const hudAvatar = document.getElementById("hud-avatar");
    const hudName = document.getElementById("hud-name");
    const hudTier = document.getElementById("hud-tier-badge");
    const hudRoll = document.getElementById("hud-roll");
    const hudDept = document.getElementById("hud-dept");
    const hudYear = document.getElementById("hud-year");
    const hudNotice = document.getElementById("hud-notice-box");

    // Indicate processing
    if (hudIndicator) hudIndicator.className = "w-3 h-3 rounded-full bg-blue-500 animate-spin";
    if (hudTitle) hudTitle.textContent = "Verifying Holographic Cryptographic Signature...";

    try {
      // 1. Send to Backend API with Supabase persistence
      const res = await fetch('/api/attendance/scan-badge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('campustech_jwt_token') || ''}`
        },
        body: JSON.stringify({
          clubId,
          qrPayload: decodedText,
          sessionType,
          gateId
        })
      });

      const data = await res.json();

      // DUPLICATE ENTRY DETECTED (409 Conflict)
      if (res.status === 409 || data.isDuplicate) {
        totalDuplicatesBlocked++;
        playFeedbackSound("error");

        if (hudCard) hudCard.className = "bg-rose-50 rounded-3xl p-6 border-2 border-rose-400 shadow-lg space-y-4";
        if (hudIndicator) hudIndicator.className = "w-3 h-3 rounded-full bg-rose-500 animate-ping";
        if (hudTitle) {
          hudTitle.textContent = "⚠️ DUPLICATE ENTRY ATTEMPT BLOCKED!";
          hudTitle.className = "text-xs font-black uppercase tracking-wider text-rose-700 font-mono";
        }
        if (hudTime) hudTime.textContent = new Date().toLocaleTimeString();
        if (hudAvatar && data.attendee?.avatar) hudAvatar.src = data.attendee.avatar;
        if (hudName && data.attendee?.name) hudName.textContent = data.attendee.name;
        if (hudTier) {
          hudTier.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-200 text-rose-900 border border-rose-300";
          hudTier.textContent = "Duplicate Badge";
        }
        if (hudRoll) hudRoll.textContent = `ROLL: ${data.attendee?.rollNo || '---'}`;
        if (hudDept) hudDept.textContent = `DEPT: ${data.attendee?.department || 'CSE'}`;
        if (hudYear) hudYear.textContent = `YEAR: ${data.attendee?.year || '3rd Year'}`;
        if (hudNotice) {
          hudNotice.className = "p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-xs text-rose-900 font-bold";
          hudNotice.innerHTML = `⛔ ${data.message || 'Student was already admitted to this session. Badge sharing prevented!'}`;
        }

        const statDups = document.getElementById("stat-duplicates");
        if (statDups) statDups.textContent = totalDuplicatesBlocked;

        showToast("⚠️ Duplicate Badge Blocked", `${data.attendee?.name || 'Student'} is already marked Present!`, "error");
        return;
      }

      // SUCCESSFUL VERIFIED ENTRY (200 OK)
      if (res.ok && data.success) {
        const attendee = data.attendee || {};
        const isVipTier = attendee.badgeTier?.includes("Lead") || attendee.badgeTier?.includes("Champion") || attendee.badgeTier?.includes("Secretary");
        
        playFeedbackSound(isVipTier ? "vip" : "success");

        if (hudCard) hudCard.className = isVipTier ? "bg-amber-50 rounded-3xl p-6 border-2 border-amber-400 shadow-xl space-y-4" : "bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-400 shadow-xl space-y-4";
        if (hudIndicator) hudIndicator.className = "w-3 h-3 rounded-full bg-emerald-500 animate-pulse";
        if (hudTitle) {
          hudTitle.textContent = isVipTier ? "✨ CORE EXECUTIVE LEAD VERIFIED & LOGGED" : "✓ VALID MEMBER BADGE ADMITTED";
          hudTitle.className = isVipTier ? "text-xs font-black uppercase tracking-wider text-amber-800 font-mono" : "text-xs font-black uppercase tracking-wider text-emerald-800 font-mono";
        }
        if (hudTime) hudTime.textContent = attendee.checkinTime || new Date().toLocaleTimeString();
        if (hudAvatar && attendee.avatar) hudAvatar.src = attendee.avatar;
        if (hudName) hudName.textContent = attendee.name || "Student Delegate";
        if (hudTier) {
          hudTier.className = isVipTier ? "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900 border border-amber-400" : "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-900 border border-emerald-300";
          hudTier.textContent = attendee.badgeTier || "Active Member";
        }
        if (hudRoll) hudRoll.textContent = `ROLL: ${attendee.rollNo || '---'}`;
        if (hudDept) hudDept.textContent = `DEPT: ${attendee.department || 'CSE'}`;
        if (hudYear) hudYear.textContent = `YEAR: ${attendee.year || '3rd Year'}`;
        if (hudNotice) {
          hudNotice.className = isVipTier ? "p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-xs text-amber-950 font-semibold" : "p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-950 font-semibold";
          hudNotice.innerHTML = `✓ Admitted via ${gateId}. Cryptographic credentials validated.`;
        }

        // Also push directly to Supabase client if configured in browser
        // (Supabase integration removed)

        // Update Roster Table Stream
        const freshDb = getDB();
        const todayScans = (freshDb.badge_scans || []).filter(s => s.club_id === clubId && s.date === new Date().toISOString().split('T')[0]);
        const tbody = document.getElementById("scanner-stream-tbody");
        if (tbody) tbody.innerHTML = renderScannerRows(todayScans);

        // Update KPI Stats
        const statTotal = document.getElementById("stat-total-scans");
        const statAdmitted = document.getElementById("stat-admitted");
        if (statTotal) statTotal.textContent = todayScans.length;
        if (statAdmitted) statAdmitted.textContent = todayScans.length;

        showToast("Badge Verified ✓", `${attendee.name} (${attendee.rollNo}) admitted to ${clubSelect?.options[clubSelect.selectedIndex]?.text.split('(')[0] || 'Club'}!`, "success");
      } else {
        // Fallback error
        playFeedbackSound("error");
        showToast("Invalid Badge", data.message || "Unrecognized student badge.", "error");
      }

    } catch (err) {
      console.warn("API scan request notice:", err);
      // Offline fallback handling
      const queue = JSON.parse(localStorage.getItem(OFFLINE_BADGE_SCANS_KEY) || "[]");
      queue.push({ clubId, qrPayload: decodedText, gateId, sessionType, timestamp: new Date().toLocaleTimeString() });
      localStorage.setItem(OFFLINE_BADGE_SCANS_KEY, JSON.stringify(queue));
      
      const offlineBadge = document.getElementById("offline-scanner-badge");
      const offlineCount = document.getElementById("offline-scan-count");
      if (offlineBadge && offlineCount) {
        offlineBadge.classList.remove("hidden");
        offlineCount.textContent = queue.length;
      }
      playFeedbackSound("success");
      showToast("Offline Badge Cached", "Scan saved to local storage; will sync to Supabase when reconnected.", "info");
    }
  }

  // 1. html5-qrcode Camera Lifecycle
  async function startHtml5QrScanner() {
    if (activeHtml5QrCode) {
      try {
        await activeHtml5QrCode.stop();
        activeHtml5QrCode.clear();
      } catch (e) {}
    }

    const idleScreen = document.getElementById("scanner-idle-screen");
    const targetingOverlay = document.getElementById("scanner-targeting-overlay");
    const stateBadge = document.getElementById("scanner-state-badge");
    const feedBtnLabel = document.getElementById("camera-feed-btn-label");

    try {
      activeHtml5QrCode = new window.Html5Qrcode("html5-scanner-video-region");
      const selectedCamMode = cameraSelect?.value || "environment";

      const qrConfig = {
        fps: 15,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0
      };

      await activeHtml5QrCode.start(
        { facingMode: selectedCamMode },
        qrConfig,
        (decodedText) => {
          processScannedBadge(decodedText);
        },
        (error) => {
          // Frame read callback (silent)
        }
      );

      isScannerActive = true;
      if (idleScreen) idleScreen.classList.add("hidden");
      if (targetingOverlay) targetingOverlay.classList.remove("hidden");
      if (stateBadge) {
        stateBadge.textContent = "CAMERA LIVE";
        stateBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse";
      }
      if (feedBtnLabel) feedBtnLabel.textContent = "Stop Camera";
      showToast("Optical Scanner Active", "Aim at member QR badge or student ID.", "info");

    } catch (err) {
      console.warn("html5-qrcode camera initialization notice:", err);
      showToast("Camera Access Notice", "Unable to start webcam stream. You can scan badge image files or use manual input.", "warning");
      if (idleScreen) idleScreen.classList.remove("hidden");
      if (targetingOverlay) targetingOverlay.classList.add("hidden");
      if (feedBtnLabel) feedBtnLabel.textContent = "Start Camera";
    }
  }

  async function stopHtml5QrScanner() {
    if (activeHtml5QrCode) {
      try {
        await activeHtml5QrCode.stop();
        activeHtml5QrCode.clear();
      } catch (e) {}
    }
    isScannerActive = false;
    const idleScreen = document.getElementById("scanner-idle-screen");
    const targetingOverlay = document.getElementById("scanner-targeting-overlay");
    const stateBadge = document.getElementById("scanner-state-badge");
    const feedBtnLabel = document.getElementById("camera-feed-btn-label");

    if (idleScreen) idleScreen.classList.remove("hidden");
    if (targetingOverlay) targetingOverlay.classList.add("hidden");
    if (stateBadge) {
      stateBadge.textContent = "STANDBY";
      stateBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    }
    if (feedBtnLabel) feedBtnLabel.textContent = "Start Camera";
  }

  // Camera Buttons
  const activateBtn = document.getElementById("activate-camera-btn");
  const toggleFeedBtn = document.getElementById("toggle-camera-feed-btn");

  if (activateBtn) activateBtn.addEventListener("click", startHtml5QrScanner);
  if (toggleFeedBtn) {
    toggleFeedBtn.addEventListener("click", () => {
      if (isScannerActive) {
        stopHtml5QrScanner();
      } else {
        startHtml5QrScanner();
      }
    });
  }

  // 2. Scan Image File via html5-qrcode
  const fileInput = document.getElementById("scanner-file-input");
  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        try {
          const tempScanner = new window.Html5Qrcode("html5-scanner-video-region");
          const decoded = await tempScanner.scanFile(file, true);
          processScannedBadge(decoded);
          fileInput.value = "";
        } catch (err) {
          showToast("QR Scan Failed", "Could not detect a valid QR code in the image file.", "error");
          fileInput.value = "";
        }
      }
    });
  }

  // 3. Fast Demo Simulations
  const simAarav = document.getElementById("sim-aarav-scan-btn");
  if (simAarav) {
    simAarav.addEventListener("click", () => {
      const payload = JSON.stringify({
        institution: "Pragati Engineering College (Autonomous)",
        type: "DIGITAL_CLUB_MEMBER_BADGE",
        passId: "PEC-PASS-2026-22CS101",
        memberId: "PEC-MEM-2026-CSE-8492",
        studentName: "Aarav Sharma",
        rollNo: "22CS101",
        department: "Computer Science & Engineering",
        clubId: clubSelect?.value || "I4-08",
        badgeTier: "Active Student Member",
        validUntil: "30 JUNE 2028",
        securitySignature: "sha256:0x22CS101::PEC_CCTSC_2026"
      });
      processScannedBadge(payload);
    });
  }

  const simPriya = document.getElementById("sim-priya-scan-btn");
  if (simPriya) {
    simPriya.addEventListener("click", () => {
      const payload = JSON.stringify({
        institution: "Pragati Engineering College (Autonomous)",
        type: "DIGITAL_CLUB_MEMBER_BADGE",
        passId: "PEC-PASS-2026-22CS142",
        memberId: "PEC-MEM-2026-AIML-5120",
        studentName: "Priya Patel",
        rollNo: "22CS142",
        department: "CSE(AIML)",
        clubId: clubSelect?.value || "I4-08",
        badgeTier: "Executive Committee Lead",
        validUntil: "30 JUNE 2028",
        securitySignature: "sha256:0x22CS142::PEC_CCTSC_2026"
      });
      processScannedBadge(payload);
    });
  }

  const simDup = document.getElementById("sim-dup-test-btn");
  if (simDup) {
    simDup.addEventListener("click", () => {
      // Re-send Aarav to test duplicate
      const payload = JSON.stringify({
        institution: "Pragati Engineering College (Autonomous)",
        type: "DIGITAL_CLUB_MEMBER_BADGE",
        passId: "PEC-PASS-2026-22CS101",
        studentName: "Aarav Sharma",
        rollNo: "22CS101",
        clubId: clubSelect?.value || "I4-08"
      });
      processScannedBadge(payload);
    });
  }

  // 4. Manual Input Form
  const manualBtn = document.getElementById("manual-scanner-submit-btn");
  const manualInp = document.getElementById("manual-scanner-input");
  if (manualBtn && manualInp) {
    const handleManual = () => {
      const val = manualInp.value.trim();
      if (val) {
        processScannedBadge(val);
        manualInp.value = "";
      }
    };
    manualBtn.addEventListener("click", handleManual);
    manualInp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleManual();
    });
  }

  // 5. Club Selector Change
  if (clubSelect) {
    clubSelect.addEventListener("change", () => {
      const chosenId = clubSelect.value;
      const dbFresh = getDB();
      const scans = (dbFresh.badge_scans || []).filter(s => s.club_id === chosenId && s.date === new Date().toISOString().split('T')[0]);
      const tbody = document.getElementById("scanner-stream-tbody");
      if (tbody) tbody.innerHTML = renderScannerRows(scans);
      
      const statTotal = document.getElementById("stat-total-scans");
      const statAdmitted = document.getElementById("stat-admitted");
      if (statTotal) statTotal.textContent = scans.length;
      if (statAdmitted) statAdmitted.textContent = scans.length;

      showToast("Club Switched", `Scanner active for ${clubSelect.options[clubSelect.selectedIndex].text.split('(')[0]}`, "info");
    });
  }

  // 6. Exports: CSV & Print
  const exportCsv = document.getElementById("export-scanner-csv-btn");
  if (exportCsv) {
    exportCsv.addEventListener("click", () => {
      const dbFresh = getDB();
      const clubId = clubSelect?.value || "I4-08";
      const scans = (dbFresh.badge_scans || []).filter(s => s.club_id === clubId);

      if (scans.length === 0) {
        showToast("No Records", "No badge scans available to export.", "info");
        return;
      }

      let csv = "Student Name,Roll Number,Department,Badge Tier,Gate Terminal,Session,Date,Checkin Time,Scanned By\n";
      scans.forEach(s => {
        csv += `"${s.student_name}","${s.roll_no}","${s.department}","${s.badge_tier}","${s.gate_id}","${s.session_type}","${s.date}","${s.checkin_time}","${s.scanned_by}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PEC_Club_Attendance_${clubId}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      showToast("CSV Downloaded", "Attendance session roster exported.", "success");
    });
  }

  const exportPrint = document.getElementById("export-scanner-print-btn");
  if (exportPrint) {
    exportPrint.addEventListener("click", () => window.print());
  }
}
