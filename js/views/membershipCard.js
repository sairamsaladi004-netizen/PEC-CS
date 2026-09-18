import { getCurrentUser } from '../auth.js';
import { getDB, saveDB, logAudit } from '../db.js';
import { showToast } from '../components/toast.js';
import { 
  generateMembershipQRPayload, 
  renderQRCodeToElement, 
  downloadQRCodeAsImage 
} from '../utils/qrHelper.js';

export function renderMembershipCardView() {
  const user = getCurrentUser() || {};
  const db = getDB();
  
  // Calculate affiliated clubs
  const userClubs = (user.clubs || []).map(id => db.clubs.find(c => c.id === id)).filter(Boolean);
  if (userClubs.length === 0) {
    const defaultClub = db.clubs.find(c => c.id === "I4-08") || db.clubs[0] || {
      id: "I4-08",
      name: "AI&ML Turing Club",
      shortName: "Turing AI",
      domain: "Artificial Intelligence & Robotics",
      department: "CSE"
    };
    userClubs.push(defaultClub);
  }

  const primaryClub = userClubs[0];
  const rollNumber = user.rollNo || user.facultyId || "22A31A0501";
  const memberId = user.membershipId || `PEC-MEM-2026-${(user.department || 'CSE').toUpperCase()}-${rollNumber.slice(-4) || '8492'}`;
  const validUntil = user.validUntil || "30 JUNE 2027";
  const userRoleTitle = user.role === "Student" ? "Active Student Member" : (user.role || "Student Delegate");
  const upcomingEvents = db.events || [];

  return `
    <div class="space-y-8 pb-16 max-w-5xl mx-auto">
      
      <!-- Top Header & Action Controls -->
      <div class="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">CCTSC Accredited Credential</span>
            <span class="text-xs text-emerald-600 font-bold flex items-center">
              <span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
              Verified Unique Dynamic QR Pass
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Student Smart Membership Card & Event Check-in QR</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Cryptographically signed digital student delegate badge and optical QR pass for campus hackathons, society workshops & maker labs</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button id="flip-card-btn" class="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer">
            <span>🔄</span>
            <span>Flip Badge (3D)</span>
          </button>
          
          <button id="open-qr-modal-btn" class="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>🔍</span>
            <span>Enlarge QR / Kiosk Mode</span>
          </button>

          <button id="download-qr-btn" class="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>📥</span>
            <span>Download QR PNG</span>
          </button>

          <button id="copy-memid-btn" data-memid="${memberId}" class="px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>📋</span>
            <span>Copy ID</span>
          </button>
          
          <button id="print-card-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>🖨️</span>
            <span>Print Badge</span>
          </button>
        </div>
      </div>

      <!-- Society Affiliation & Check-in Pass Customizer Bar -->
      <div class="no-print bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-slate-900">QR Pass Configuration & Gate Routing</h3>
            <p class="text-xs text-slate-500">Configure your unique QR code for universal campus access or bind it to a specific active symposium.</p>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-slate-500">Pass Mode:</span>
            <div class="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button id="mode-universal-btn" class="px-3 py-1 rounded-lg bg-white text-blue-700 shadow-xs transition-all">Universal Gate Pass</button>
              <button id="mode-event-btn" class="px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all">Event Fast Pass</button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
          <!-- Society Selector -->
          <div class="space-y-1.5">
            <label class="block font-bold text-slate-700">Active Society Affiliation Badge:</label>
            <div class="flex flex-wrap gap-2" id="society-button-group">
              ${userClubs.map((c, idx) => `
                <button 
                  class="club-badge-select px-3 py-1.5 rounded-xl font-bold transition-all ${idx === 0 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" 
                  data-clubid="${c.id}" 
                  data-clubname="${c.name}" 
                  data-domain="${c.domain || 'Industry 4.0'}"
                >
                  ${c.shortName || c.name}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Event Binding Selector (for Event Fast Pass Mode) -->
          <div class="space-y-1.5" id="event-selector-container">
            <label class="block font-bold text-slate-700">Target Event for Fast Gate Check-in:</label>
            <select id="pass-target-event-select" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500">
              <option value="">-- Universal Access (All Campus Gates) --</option>
              ${upcomingEvents.map(e => `
                <option value="${e.id}">${e.title} (${e.date} • ${e.venue})</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Interactive Smart Badge Display Area -->
      <div class="flex flex-col items-center justify-center py-2">
        
        <div class="w-full max-w-md perspective-1000">
          
          <!-- Smart Card Container with Luxury Holographic Outer Frame -->
          <div id="smart-card" class="printable-area relative w-full h-[350px] rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 shadow-2xl border-2 border-indigo-500/40 select-none transition-all duration-700 transform-style-3d flex flex-col justify-between overflow-hidden">
            
            <!-- Metallic Holographic Watermark / Light Ripple -->
            <div class="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-blue-400/20 via-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
            <div class="absolute -left-20 -bottom-20 w-60 h-60 bg-gradient-to-tr from-amber-400/15 via-rose-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            <!-- CARD FRONT VIEW -->
            <div id="card-front" class="h-full flex flex-col justify-between relative z-10 transition-opacity duration-300">
              
              <!-- Top Institutional Ribbon -->
              <div class="flex items-center justify-between border-b border-white/15 pb-2.5">
                <div class="flex items-center space-x-2.5">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md border border-white/20">
                    P
                  </div>
                  <div>
                    <div class="text-[10px] font-black uppercase tracking-wider text-white">PRAGATI ENGINEERING COLLEGE</div>
                    <div class="text-[8px] text-blue-300 font-mono tracking-wide">AUTONOMOUS • CENTRAL TECHNICAL COUNCIL (CCTSC)</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                  <span>✦ SMART AID</span>
                </div>
              </div>

              <!-- Center Bio Grid -->
              <div class="flex items-center space-x-4 my-2">
                <div class="relative shrink-0">
                  <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" class="w-20 h-24 rounded-2xl object-cover border-2 border-white/40 shadow-xl bg-slate-800" alt="${user.name}" />
                  <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white" title="Active Verified Token">✓</div>
                </div>

                <div class="space-y-1 overflow-hidden flex-1">
                  <div class="text-base sm:text-lg font-black text-white tracking-tight truncate">${user.name}</div>
                  <div class="text-xs text-blue-400 font-mono font-black tracking-wider">${rollNumber}</div>
                  
                  <div class="text-[11px] text-slate-300 font-medium">
                    Dept. of ${user.department || 'CSE'} • <span class="text-slate-400">${user.year || '3rd Year'}</span>
                  </div>

                  <div id="badge-club-display" class="text-[10px] text-emerald-300 font-bold truncate bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md inline-block">
                    🏛️ ${primaryClub.name || 'Technical Society Member'}
                  </div>

                  <div id="badge-pass-mode-indicator" class="text-[9px] text-indigo-300 font-mono block">
                    ⚡ Pass: Universal Gate Access
                  </div>
                </div>
              </div>

              <!-- Micro-strip & Unique Dynamic QR Code Token Footer -->
              <div class="pt-2.5 border-t border-white/15 flex items-center justify-between">
                <div class="space-y-0.5">
                  <div class="text-[8px] font-mono text-slate-400 uppercase tracking-wider">SMART AID CREDENTIAL ID</div>
                  <div id="badge-memid-text" class="text-xs font-black font-mono tracking-wider text-slate-100">${memberId}</div>
                  <div class="text-[8px] font-mono text-slate-400">VALID SESSION: <span class="text-amber-300">${validUntil}</span></div>
                </div>

                <!-- Unique Dynamic QR Code Pass Container -->
                <div class="flex items-center space-x-2">
                  <div class="w-7 h-6 rounded-md bg-amber-300/30 border border-amber-300/60 flex items-center justify-center text-[9px] shadow-xs" title="Smart Chip Contactless Ready">
                    💳
                  </div>
                  <!-- Renders high-contrast scannable QR Code -->
                  <div 
                    id="card-qr-box" 
                    class="w-16 h-16 bg-white p-1 rounded-xl shadow-lg shrink-0 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    title="Click to Enlarge QR for Gate Kiosks"
                  ></div>
                </div>
              </div>

            </div>

            <!-- CARD BACK VIEW (Hidden by default, shown on Flip) -->
            <div id="card-back" class="hidden h-full flex flex-col justify-between text-xs relative z-10">
              
              <!-- Magnetic Strip Emulation Header -->
              <div class="h-9 bg-slate-950 -mx-6 -mt-6 mb-2 flex items-center px-6 border-b border-slate-800">
                <span class="text-[9px] font-mono text-slate-500 tracking-widest uppercase">ENCRYPTED MAGNETIC STRIP • CCTSC-PEC-GATEWAY-AUTH</span>
              </div>

              <div class="space-y-2">
                <div class="text-[11px] font-black text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Campus Privileges & Regulations</span>
                  <span class="text-[9px] font-mono text-blue-400">SEC-LEVEL: A</span>
                </div>
                <p class="text-[10px] text-slate-300 leading-relaxed">
                  This official institutional credential is valid across all 35 Technical Societies, Innovation & Maker Labs, IEEE/ACM Student Chapters, and High-Performance Compute Facilities at Pragati Engineering College (Autonomous).
                </p>
                <div class="bg-slate-900/80 p-2 rounded-xl border border-white/10 text-[9px] font-mono text-slate-300 space-y-1">
                  <div>• Holder Role: <span class="text-amber-300 font-bold">${userRoleTitle}</span></div>
                  <div class="truncate">• Verification Hash: <span id="back-hash-display" class="text-blue-300">sha256:0x${rollNumber}::PEC2026</span></div>
                  <div>• Authority: <span class="text-white">Dean of Technical Council, PEC</span></div>
                </div>
              </div>

              <!-- Footer Helplines & Return Notice -->
              <div class="space-y-1 pt-2 border-t border-white/15">
                <div class="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Secretariat Contact:</span>
                  <span class="text-white font-bold">cgc@pragati.ac.in</span>
                </div>
                <div class="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Emergency Helpline:</span>
                  <span class="text-white font-bold">+91 884 2383305</span>
                </div>
                <div class="text-center pt-1 text-[8px] text-blue-300 font-mono">
                  Click 'Flip Badge' to return to credential front
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      <!-- Dedicated Event Check-in QR Pass & Gate Hub Section -->
      <div class="no-print bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div class="space-y-1">
            <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              <span>Live Gate Check-in Engine</span>
            </div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">Optical QR Check-in & Gate Pass Hub</h2>
            <p class="text-xs text-slate-500">Present this high-resolution QR token at campus event entrance kiosks or mobile check-in scanners.</p>
          </div>

          <!-- Test Check-in Simulator Trigger -->
          <div class="flex items-center space-x-2">
            <button id="test-checkin-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer">
              <span>⚡</span>
              <span>Simulate Gate Check-in Test</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <!-- High-Contrast QR Token Showcase -->
          <div class="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
            <div id="hub-qr-container" class="w-40 h-40 bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-center"></div>
            <div>
              <div class="text-xs font-bold text-slate-900 font-mono" id="hub-qr-roll">${rollNumber}</div>
              <div class="text-[10px] text-slate-500 font-mono" id="hub-qr-memid">${memberId}</div>
            </div>
            <div class="flex items-center space-x-2">
              <button id="hub-download-qr-btn" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors">
                Save QR Image
              </button>
              <button id="hub-enlarge-qr-btn" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-bold transition-colors">
                Enlarge
              </button>
            </div>
          </div>

          <!-- Payload & Verification Details -->
          <div class="md:col-span-2 space-y-3 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cryptographic Signature</span>
                <div id="hub-token-hash" class="font-mono text-slate-800 font-bold truncate">0x8f4a3c19...</div>
                <div class="text-[10px] text-emerald-600 font-semibold">✓ Signed by CCTSC Key Infrastructure</div>
              </div>

              <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gate Verification Scope</span>
                <div id="hub-pass-scope" class="font-bold text-slate-800">Universal Access (35 Societies)</div>
                <div class="text-[10px] text-blue-600 font-semibold">Automatic Attendance Ledger Sync</div>
              </div>
            </div>

            <!-- JSON Payload Inspection Viewer (Collapsible) -->
            <div class="p-4 bg-slate-900 text-slate-300 rounded-2xl font-mono text-[11px] space-y-2 overflow-hidden border border-slate-800">
              <div class="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider pb-1 border-b border-slate-800">
                <span>Decoded QR Scannable JSON Payload</span>
                <button id="copy-json-payload-btn" class="text-blue-400 hover:text-blue-300 underline font-normal">Copy JSON</button>
              </div>
              <pre id="json-payload-display" class="overflow-x-auto text-[10px] text-emerald-400 leading-relaxed max-h-32">Loading payload...</pre>
            </div>
          </div>

        </div>

      </div>

      <!-- Member Rights & Privileges Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-base font-bold">⚡</div>
          <h3 class="font-bold text-slate-900 text-sm">Instant Gate Check-in</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Contactless optical entry to hackathons, workshops, and inter-collegiate technical symposiums with anti-duplicate validation.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-base font-bold">🔬</div>
          <h3 class="font-bold text-slate-900 text-sm">Hardware & Cloud Labs</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Exclusive reservation rights for NVIDIA Jetson kits, 3D printers, IoT sensor benches, and compute cluster sandboxes.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-base font-bold">📜</div>
          <h3 class="font-bold text-slate-900 text-sm">Verified Credentials</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Direct synchronization with accredited certificates, institutional transcripts, and NBA Tier-1 portfolio audits.
          </p>
        </div>

      </div>

      <!-- Full-screen Enlarge QR Modal for Kiosk Scanners -->
      <div id="enlarge-qr-modal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl text-center space-y-5 border border-slate-200">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div class="text-left">
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">KIOSK SCANNER MODE</span>
              <h3 class="text-base font-black text-slate-900">Student Gate Pass QR</h3>
            </div>
            <button id="close-enlarge-modal-btn" class="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
          </div>

          <!-- Maximum Brightness & Contrast Display Area -->
          <div class="bg-white p-4 rounded-2xl border-4 border-slate-900 shadow-md inline-block mx-auto">
            <div id="modal-qr-container" class="w-56 h-56 flex items-center justify-center"></div>
          </div>

          <div class="space-y-1">
            <div class="text-base font-black text-slate-900">${user.name}</div>
            <div class="text-xs font-mono font-bold text-blue-600">${rollNumber} • Dept. of ${user.department || 'CSE'}</div>
            <div class="text-[10px] text-slate-500 font-mono">${memberId}</div>
          </div>

          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed text-left flex items-start space-x-2">
            <span>💡</span>
            <span>Hold your screen steadily facing the entrance camera scanner or turn up display brightness for optimal capture.</span>
          </div>

          <div class="flex space-x-2">
            <button id="modal-download-btn" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors">
              Download PNG
            </button>
            <button id="modal-close-btn" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Live Gate Check-in Simulator Modal -->
      <div id="checkin-test-modal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-slate-200">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono">GATE KIOSK TEST SIMULATOR</span>
              <h3 class="text-base font-black text-slate-900">Simulate Event Entrance Scan</h3>
            </div>
            <button id="close-test-modal-btn" class="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
          </div>

          <p class="text-xs text-slate-500 leading-relaxed">
            Test scanning this membership card QR code against the live gate accreditation database for any active symposium or workshop.
          </p>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Select Event to Check In To:</label>
              <select id="sim-event-select" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800">
                ${upcomingEvents.map(e => `
                  <option value="${e.id}">${e.title} (${e.date})</option>
                `).join('')}
              </select>
            </div>

            <div id="sim-result-box" class="hidden p-3.5 rounded-2xl text-xs space-y-1"></div>

            <button id="execute-sim-checkin-btn" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5">
              <span>📷</span>
              <span>Execute Gate Scan & Verify Roster</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function attachMembershipCardEvents() {
  const user = getCurrentUser() || {};
  const db = getDB();
  const rollNumber = user.rollNo || user.facultyId || "22A31A0501";
  const memberId = user.membershipId || `PEC-MEM-2026-${(user.department || 'CSE').toUpperCase()}-${rollNumber.slice(-4) || '8492'}`;

  let selectedClub = (user.clubs || []).map(id => db.clubs.find(c => c.id === id)).filter(Boolean)[0] || db.clubs[0] || {
    id: "I4-08",
    name: "AI&ML Turing Club",
    shortName: "Turing AI",
    domain: "Artificial Intelligence & Robotics"
  };

  let selectedEvent = null;
  let passMode = "UNIVERSAL"; // UNIVERSAL or EVENT

  // Master Function: Regenerates and synchronizes all QR elements on page
  const refreshAllQRCodes = () => {
    const payload = generateMembershipQRPayload(user, selectedClub, selectedEvent);
    const jsonString = JSON.stringify(payload, null, 2);

    // 1. Render on Card Front QR Box
    const cardQrBox = document.getElementById("card-qr-box");
    if (cardQrBox) {
      renderQRCodeToElement(cardQrBox, payload, { width: 56, height: 56 });
    }

    // 2. Render on Hub Section QR Box
    const hubQrBox = document.getElementById("hub-qr-container");
    if (hubQrBox) {
      renderQRCodeToElement(hubQrBox, payload, { width: 140, height: 140 });
    }

    // 3. Render on Enlarge Modal QR Box
    const modalQrBox = document.getElementById("modal-qr-container");
    if (modalQrBox) {
      renderQRCodeToElement(modalQrBox, payload, { width: 220, height: 220 });
    }

    // 4. Update JSON Display
    const jsonDisplay = document.getElementById("json-payload-display");
    if (jsonDisplay) {
      jsonDisplay.textContent = jsonString;
    }

    // 5. Update Hash Display
    const hubHash = document.getElementById("hub-token-hash");
    if (hubHash) {
      hubHash.textContent = payload.verificationHash;
    }
    const backHash = document.getElementById("back-hash-display");
    if (backHash) {
      backHash.textContent = payload.verificationHash;
    }

    // 6. Update Pass Scope Display
    const passScopeDisplay = document.getElementById("hub-pass-scope");
    const badgePassMode = document.getElementById("badge-pass-mode-indicator");
    if (selectedEvent) {
      if (passScopeDisplay) passScopeDisplay.textContent = `Event Pass: ${selectedEvent.title}`;
      if (badgePassMode) badgePassMode.textContent = `⚡ Fast Pass: ${selectedEvent.title.slice(0, 24)}...`;
    } else {
      if (passScopeDisplay) passScopeDisplay.textContent = "Universal Access (All 35 Societies)";
      if (badgePassMode) badgePassMode.textContent = "⚡ Pass: Universal Gate Access";
    }
  };

  // Initial render
  refreshAllQRCodes();

  // Flip Card Handler
  const flipBtn = document.getElementById("flip-card-btn");
  const cardFront = document.getElementById("card-front");
  const cardBack = document.getElementById("card-back");
  if (flipBtn && cardFront && cardBack) {
    flipBtn.addEventListener("click", () => {
      const isFront = !cardFront.classList.contains("hidden");
      if (isFront) {
        cardFront.classList.add("hidden");
        cardBack.classList.remove("hidden");
      } else {
        cardBack.classList.add("hidden");
        cardFront.classList.remove("hidden");
      }
    });
  }

  // Print Badge
  const printBtn = document.getElementById("print-card-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  // Copy Member ID
  const copyBtn = document.getElementById("copy-memid-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const id = copyBtn.dataset.memid || memberId;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(id).then(() => {
          showToast("ID Copied", `Membership AID '${id}' copied to clipboard!`, "success");
        });
      } else {
        showToast("Membership AID", id, "info");
      }
    });
  }

  // Copy JSON Payload
  const copyJsonBtn = document.getElementById("copy-json-payload-btn");
  if (copyJsonBtn) {
    copyJsonBtn.addEventListener("click", () => {
      const payload = generateMembershipQRPayload(user, selectedClub, selectedEvent);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
          showToast("Payload Copied", "Scannable QR payload JSON copied to clipboard.", "success");
        });
      }
    });
  }

  // Club Badge Switcher
  document.querySelectorAll(".club-badge-select").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".club-badge-select").forEach(b => {
        b.className = "club-badge-select px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "club-badge-select px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-xs transition-all";
      
      const clubId = btn.dataset.clubid;
      const clubName = btn.dataset.clubname;
      const domain = btn.dataset.domain;
      
      selectedClub = {
        id: clubId,
        name: clubName,
        shortName: clubName.slice(0, 14),
        domain: domain
      };

      const displayElem = document.getElementById("badge-club-display");
      if (displayElem) {
        displayElem.innerText = `🏛️ ${clubName}`;
      }

      refreshAllQRCodes();
      showToast("Society Affiliation Updated", `Smart QR Pass updated for ${clubName}`, "info");
    });
  });

  // Pass Mode Switcher
  const modeUniversalBtn = document.getElementById("mode-universal-btn");
  const modeEventBtn = document.getElementById("mode-event-btn");
  const eventSelect = document.getElementById("pass-target-event-select");

  if (modeUniversalBtn && modeEventBtn) {
    modeUniversalBtn.addEventListener("click", () => {
      passMode = "UNIVERSAL";
      selectedEvent = null;
      if (eventSelect) eventSelect.value = "";
      modeUniversalBtn.className = "px-3 py-1 rounded-lg bg-white text-blue-700 shadow-xs transition-all";
      modeEventBtn.className = "px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all";
      refreshAllQRCodes();
      showToast("Universal Pass Active", "QR code is set for unrestricted entry across all 35 societies.", "info");
    });

    modeEventBtn.addEventListener("click", () => {
      passMode = "EVENT";
      modeEventBtn.className = "px-3 py-1 rounded-lg bg-white text-blue-700 shadow-xs transition-all";
      modeUniversalBtn.className = "px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all";
      if (eventSelect && db.events && db.events.length > 0) {
        eventSelect.value = db.events[0].id;
        selectedEvent = db.events[0];
      }
      refreshAllQRCodes();
      showToast("Event Fast Pass Active", `QR code bound to ${selectedEvent?.title || 'Selected Event'}.`, "info");
    });
  }

  // Event Target Selector Change
  if (eventSelect) {
    eventSelect.addEventListener("change", () => {
      const evtId = eventSelect.value;
      if (evtId) {
        selectedEvent = db.events.find(e => e.id === evtId);
        passMode = "EVENT";
        if (modeEventBtn && modeUniversalBtn) {
          modeEventBtn.className = "px-3 py-1 rounded-lg bg-white text-blue-700 shadow-xs transition-all";
          modeUniversalBtn.className = "px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all";
        }
      } else {
        selectedEvent = null;
        passMode = "UNIVERSAL";
        if (modeEventBtn && modeUniversalBtn) {
          modeUniversalBtn.className = "px-3 py-1 rounded-lg bg-white text-blue-700 shadow-xs transition-all";
          modeEventBtn.className = "px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all";
        }
      }
      refreshAllQRCodes();
    });
  }

  // Enlarge QR Modal Handlers
  const enlargeModal = document.getElementById("enlarge-qr-modal");
  const openEnlargeBtn = document.getElementById("open-qr-modal-btn");
  const hubEnlargeBtn = document.getElementById("hub-enlarge-qr-btn");
  const cardQrBox = document.getElementById("card-qr-box");
  const closeEnlargeBtn = document.getElementById("close-enlarge-modal-btn");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  const openEnlarge = () => {
    if (enlargeModal) {
      enlargeModal.classList.remove("hidden");
      refreshAllQRCodes();
    }
  };

  const closeEnlarge = () => {
    if (enlargeModal) enlargeModal.classList.add("hidden");
  };

  if (openEnlargeBtn) openEnlargeBtn.addEventListener("click", openEnlarge);
  if (hubEnlargeBtn) hubEnlargeBtn.addEventListener("click", openEnlarge);
  if (cardQrBox) cardQrBox.addEventListener("click", openEnlarge);
  if (closeEnlargeBtn) closeEnlargeBtn.addEventListener("click", closeEnlarge);
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeEnlarge);
  if (enlargeModal) {
    enlargeModal.addEventListener("click", (e) => {
      if (e.target === enlargeModal) closeEnlarge();
    });
  }

  // Download QR Code Handlers
  const downloadBtn = document.getElementById("download-qr-btn");
  const hubDownloadBtn = document.getElementById("hub-download-qr-btn");
  const modalDownloadBtn = document.getElementById("modal-download-btn");

  const handleDownload = () => {
    const hubContainer = document.getElementById("hub-qr-container") || document.getElementById("modal-qr-container");
    const success = downloadQRCodeAsImage(hubContainer, `PEC-MEMBERSHIP-QR-${rollNumber}.png`);
    if (success) {
      showToast("Download Complete", `Student Membership QR saved as PEC-MEMBERSHIP-QR-${rollNumber}.png`, "success");
    } else {
      showToast("Download Initialized", "QR image downloaded to your device.", "info");
    }
  };

  if (downloadBtn) downloadBtn.addEventListener("click", handleDownload);
  if (hubDownloadBtn) hubDownloadBtn.addEventListener("click", handleDownload);
  if (modalDownloadBtn) modalDownloadBtn.addEventListener("click", handleDownload);

  // Live Gate Check-in Simulator Handlers
  const testModal = document.getElementById("checkin-test-modal");
  const openTestBtn = document.getElementById("test-checkin-btn");
  const closeTestBtn = document.getElementById("close-test-modal-btn");
  const executeSimBtn = document.getElementById("execute-sim-checkin-btn");
  const simSelect = document.getElementById("sim-event-select");
  const simResultBox = document.getElementById("sim-result-box");

  if (openTestBtn && testModal) {
    openTestBtn.addEventListener("click", () => {
      if (simResultBox) {
        simResultBox.classList.add("hidden");
        simResultBox.innerHTML = "";
      }
      testModal.classList.remove("hidden");
    });

    if (closeTestBtn) {
      closeTestBtn.addEventListener("click", () => testModal.classList.add("hidden"));
    }

    testModal.addEventListener("click", (e) => {
      if (e.target === testModal) testModal.classList.add("hidden");
    });

    if (executeSimBtn && simSelect) {
      executeSimBtn.addEventListener("click", () => {
        const freshDb = getDB();
        const eventId = simSelect.value;
        const targetEvent = freshDb.events.find(e => e.id === eventId);
        if (!targetEvent) return;

        if (!targetEvent.registrations) targetEvent.registrations = [];
        let reg = targetEvent.registrations.find(r => 
          r.rollNo?.toUpperCase() === rollNumber.toUpperCase() || 
          r.studentId === user.id
        );

        if (reg && reg.checkedIn) {
          simResultBox.className = "p-3.5 rounded-2xl text-xs space-y-1 bg-amber-50 border border-amber-200 text-amber-900";
          simResultBox.innerHTML = `
            <div class="font-bold flex items-center space-x-1">
              <span>⚠️</span>
              <span>Duplicate Gate Scan Detected!</span>
            </div>
            <p class="text-[11px]">Student <strong>${user.name}</strong> (${rollNumber}) was already checked in at <strong>${reg.checkinTime || '09:30 AM'}</strong>.</p>
          `;
          simResultBox.classList.remove("hidden");
          showToast("Duplicate Gate Scan", "Student is already checked in for this event.", "warning");
          return;
        }

        const checkinTime = new Date().toLocaleTimeString();

        if (reg) {
          reg.checkedIn = true;
          reg.checkinTime = checkinTime;
          reg.verificationMethod = "Student Membership Card QR Scan";
        } else {
          // Auto-register walk-in student member
          reg = {
            studentId: user.id || "std-101",
            studentName: user.name,
            rollNo: rollNumber,
            department: user.department || "CSE",
            ticketId: `TCK-MEM-${rollNumber.slice(-4) || '8492'}`,
            registeredAt: new Date().toISOString().split("T")[0],
            checkedIn: true,
            checkinTime: checkinTime,
            verificationMethod: "Student Membership Card QR Scan"
          };
          targetEvent.registrations.push(reg);
        }

        saveDB(freshDb);
        logAudit("Gate Kiosk", "Attendee Checked-in (QR Scan)", `${targetEvent.title} - ${user.name}`, `Membership: ${memberId}`);

        simResultBox.className = "p-3.5 rounded-2xl text-xs space-y-1 bg-emerald-50 border border-emerald-200 text-emerald-900";
        simResultBox.innerHTML = `
          <div class="font-bold flex items-center space-x-1">
            <span>✓</span>
            <span>Gate Access Granted & Verified!</span>
          </div>
          <p class="text-[11px]">Delegate <strong>${user.name}</strong> (${rollNumber}) verified via Student Membership Card QR code for <strong>${targetEvent.title}</strong> at <strong>${checkinTime}</strong>.</p>
        `;
        simResultBox.classList.remove("hidden");
        showToast("Gate Verified ✓", `${user.name} checked in successfully to ${targetEvent.title}!`, "success");
      });
    }
  }
}
