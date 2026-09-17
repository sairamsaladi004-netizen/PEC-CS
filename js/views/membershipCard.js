// Pragati Engineering College (PEC Autonomous) - CampusTech
// Dynamic Digital Club Member Badge Studio with Holographic Foil & QR Generation

import { getCurrentUser } from '../auth.js';
import { getDB } from '../db.js';
import { showToast } from '../components/toast.js';

export function renderMembershipCardView(params = {}) {
  const user = getCurrentUser() || {};
  const db = getDB();
  const allClubs = db.clubs || [];
  
  // Resolve user clubs
  const userClubIds = user.clubs || (user.clubId ? [user.clubId] : ["I4-08"]);
  const userClubs = userClubIds.map(id => allClubs.find(c => c.id === id)).filter(Boolean);
  
  // Selected club from params or first club or default
  const selectedClubId = params.clubId || userClubIds[0] || "I4-08";
  const activeClub = allClubs.find(c => c.id === selectedClubId) || userClubs[0] || allClubs[0] || {
    id: "I4-08",
    name: "Google Developer Student Club",
    code: "GDSC-PEC",
    category: "Technical Society",
    department: "CSE",
    domain: "AI & Cloud Systems",
    icon: "🌐"
  };

  const rollNumber = user.rollNo || user.facultyId || "22A31A0501";
  const department = user.department || "Computer Science & Engineering";
  const memberId = user.membershipId || `PEC-MEM-2026-${(department.substring(0,3)).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const passId = user.passId || `PEC-PASS-2026-${rollNumber.replace(/[^A-Z0-9]/gi, '')}`;
  const validUntil = user.validUntil || "30 JUNE 2028";
  const userRole = user.role || "Student";
  const initialTier = params.tier || (user.role === "Club Admin" ? "Executive Lead" : "Student Member");

  return `
    <div class="space-y-8 pb-16 max-w-5xl mx-auto">
      
      <!-- Top Header & Action Controls -->
      <div class="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">CCTSC Accredited Credential</span>
            <span class="text-xs text-emerald-600 font-bold flex items-center">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5 inline-block"></span>
              Live Holographic Security Token
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Digital Club Member Badge Studio</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Tamper-evident holographic smart badge with dynamic QR pass for 35 Technical Societies, Hackathon Arena, & Innovation Labs</p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button id="flip-badge-btn" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer">
            <span>🔄</span>
            <span>Flip Badge</span>
          </button>
          <button id="download-badge-png-btn" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>📥</span>
            <span>Save Badge PNG</span>
          </button>
          <button id="download-qr-btn" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>📱</span>
            <span>Save QR Pass</span>
          </button>
          <button id="print-badge-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer">
            <span>🖨️</span>
            <span>Print Badge</span>
          </button>
        </div>
      </div>

      <!-- Interactive Customizer Studio Toolbar -->
      <div class="no-print bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <!-- Club Selector -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Technical Society / Club</span>
              <span class="text-[10px] text-blue-600 font-normal">${allClubs.length} Active Chapters</span>
            </label>
            <select id="badge-club-select" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
              <optgroup label="My Enrolled Societies">
                ${userClubs.map(c => `<option value="${c.id}" ${c.id === activeClub.id ? 'selected' : ''}>${c.name} (${c.department || 'CSE'})</option>`).join('')}
              </optgroup>
              <optgroup label="All 35 PEC Technical Societies">
                ${allClubs.map(c => `<option value="${c.id}" ${c.id === activeClub.id ? 'selected' : ''}>${c.name} [${c.category || 'Tech'}]</option>`).join('')}
              </optgroup>
            </select>
          </div>

          <!-- Role / Member Tier Selector -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Badge Tier / Designation</label>
            <select id="badge-tier-select" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
              <option value="Active Student Member" ${initialTier === 'Active Student Member' || initialTier === 'Student Member' ? 'selected' : ''}>Active Student Member</option>
              <option value="Executive Committee Lead" ${initialTier === 'Executive Committee Lead' || initialTier === 'Executive Lead' ? 'selected' : ''}>Executive Committee Lead</option>
              <option value="Hackathon Champion" ${initialTier === 'Hackathon Champion' ? 'selected' : ''}>Hackathon Champion / Gold Winner</option>
              <option value="Industry 4.0 Fellow" ${initialTier === 'Industry 4.0 Fellow' ? 'selected' : ''}>Industry 4.0 Tech Fellow</option>
              <option value="Technical Secretary" ${initialTier === 'Technical Secretary' ? 'selected' : ''}>Technical Secretary (CCTSC)</option>
              <option value="Faculty Advisor" ${userRole === 'Faculty Coordinator' ? 'selected' : ''}>Faculty Coordinator / Advisor</option>
            </select>
          </div>

          <!-- Holographic Foil Theme Selector -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Holographic Foil Spectrum</label>
            <div class="flex items-center space-x-1.5 pt-0.5">
              <button class="holo-theme-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] bg-blue-600 text-white shadow-xs transition-all" data-theme="sapphire" title="Celestial Sapphire">Sapphire</button>
              <button class="holo-theme-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" data-theme="obsidian" title="Obsidian Gold Foil">Gold</button>
              <button class="holo-theme-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" data-theme="emerald" title="Cyber Emerald">Emerald</button>
              <button class="holo-theme-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" data-theme="crimson" title="Crimson Council">Ruby</button>
              <button class="holo-theme-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" data-theme="nebula" title="Nebula Amethyst">Nebula</button>
              <button class="holo-theme-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" data-theme="prismatic" title="Full Prismatic Spectrum">Prism</button>
            </div>
          </div>

        </div>

        <!-- Secondary Controls: 3D Tilt, Glare, Token Copy -->
        <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-4">
            <label class="flex items-center space-x-2 text-slate-600 font-semibold cursor-pointer">
              <input type="checkbox" id="toggle-holo-shimmer" checked class="rounded text-blue-600 focus:ring-blue-500">
              <span class="text-[11px]">Dynamic Iridescent Shimmer</span>
            </label>
            <label class="flex items-center space-x-2 text-slate-600 font-semibold cursor-pointer">
              <input type="checkbox" id="toggle-3d-tilt" checked class="rounded text-blue-600 focus:ring-blue-500">
              <span class="text-[11px]">3D Gyro / Cursor Physics</span>
            </label>
          </div>

          <div class="flex items-center space-x-2">
            <span class="font-mono text-[11px] text-slate-500">Pass Token: <strong class="text-indigo-600 font-bold">${passId}</strong></span>
            <button id="copy-token-btn" data-token="${passId}" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-all">
              📋 Copy Token
            </button>
          </div>
        </div>
      </div>

      <!-- Holographic Interactive 3D Badge Stage -->
      <div class="flex flex-col items-center justify-center py-4">
        
        <div class="holo-badge-container w-full max-w-xl">
          
          <!-- Badge Outer Frame (Printable & Exportable Area) -->
          <div id="digital-badge-card" class="badge-card-printable holo-badge-foil theme-sapphire-holo holo-guilloche-pattern relative w-full h-[380px] rounded-3xl text-white p-6 shadow-2xl select-none flex flex-col justify-between overflow-hidden border border-white/25">
            
            <!-- Metallic Holographic Watermark Glows -->
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-blue-400/30 via-indigo-500/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>
            <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-gradient-to-tr from-amber-400/20 via-purple-500/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            <!-- CSS Holographic Iridescent Shimmer Overlay Layer -->
            <div id="badge-holo-shimmer-layer" class="holo-iridescent-overlay"></div>
            <!-- Metallic Gleam Bar -->
            <div id="badge-holo-gleam-layer" class="holo-light-gleam"></div>

            <!-- BADGE FRONT VIEW -->
            <div id="badge-front-view" class="h-full flex flex-col justify-between relative z-20 transition-opacity duration-300">
              
              <!-- Top Institutional Crest & Security Stamp -->
              <div class="flex items-center justify-between border-b border-white/20 pb-3">
                <div class="flex items-center space-x-3">
                  <!-- Rotating Holographic Seal -->
                  <div class="holo-seal-badge w-11 h-11 rounded-2xl flex items-center justify-center font-black text-slate-950 text-lg shadow-lg border border-amber-200 shrink-0">
                    🦅
                  </div>
                  <div>
                    <div class="text-[12px] font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                      <span>PRAGATI ENGINEERING COLLEGE</span>
                      <span class="text-[9px] font-bold px-1.5 py-0.2 bg-blue-500/40 text-blue-200 rounded font-mono">AUTONOMOUS</span>
                    </div>
                    <div class="text-[9px] text-amber-300 font-mono tracking-wide">CENTRAL COUNCIL OF TECHNICAL SOCIETIES (CCTSC)</div>
                  </div>
                </div>
                
                <div class="flex flex-col items-end">
                  <div id="badge-tier-pill" class="px-2.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-400/60 text-amber-300 text-[9px] font-extrabold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                    <span>✦ ${initialTier}</span>
                  </div>
                  <div class="text-[8px] font-mono text-slate-300 mt-0.5">NAAC 'A' GRADE • NBA TIER-1</div>
                </div>
              </div>

              <!-- Center Bio & Club Designation Grid -->
              <div class="flex items-center space-x-4 my-2">
                <div class="relative shrink-0">
                  <img id="badge-student-avatar" src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" class="w-22 h-26 rounded-2xl object-cover border-2 border-white/60 shadow-2xl bg-slate-900" alt="${user.name}" />
                  <div class="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-black shadow-md" title="Cryptographically Verified Active Token">✓</div>
                </div>

                <div class="space-y-1 overflow-hidden flex-1">
                  <div id="badge-student-name" class="text-xl sm:text-2xl font-black text-white tracking-tight truncate">${user.name || 'Pragati Student'}</div>
                  
                  <div class="text-xs text-amber-300 font-mono font-black tracking-wider flex items-center space-x-2">
                    <span id="badge-student-roll">ROLL: ${rollNumber}</span>
                    <span class="text-slate-400">•</span>
                    <span class="text-blue-300 font-sans">${user.year || '3rd Year'} (${user.section || 'A'})</span>
                  </div>
                  
                  <div class="text-[11px] text-slate-200 font-semibold truncate">
                    Department of <strong class="text-white">${department}</strong>
                  </div>

                  <!-- Active Club Badge Insignia -->
                  <div id="badge-club-pill" class="text-[11px] font-bold truncate bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 px-3 py-1 rounded-xl inline-flex items-center space-x-1.5 shadow-sm">
                    <span id="badge-club-icon">${activeClub.icon || '🏛️'}</span>
                    <span id="badge-club-name">${activeClub.name}</span>
                  </div>
                </div>
              </div>

              <!-- Holographic Microchip, QR Pass & Card Credentials Footer -->
              <div class="pt-3 border-t border-white/20 flex items-center justify-between">
                <div class="space-y-0.5">
                  <div class="flex items-center space-x-2">
                    <!-- EMV Gold Microchip Graphic with Circuit Traces -->
                    <div class="holo-chip-circuit w-10 h-8 rounded-lg bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 border border-yellow-200 flex items-center justify-center shadow-md relative overflow-hidden" title="Contactless Smart RFID/NFC Microchip">
                      <div class="w-full h-[1px] bg-amber-800/40 absolute top-2.5"></div>
                      <div class="w-full h-[1px] bg-amber-800/40 absolute bottom-2.5"></div>
                      <div class="w-[1px] h-full bg-amber-800/40 absolute left-3.5"></div>
                      <div class="w-[1px] h-full bg-amber-800/40 absolute right-3.5"></div>
                      <span class="text-[9px] relative z-10 font-bold text-slate-900">📶</span>
                    </div>
                    <div>
                      <div class="text-[8px] font-mono text-slate-300 uppercase tracking-wider">SMART AID PASS</div>
                      <div id="badge-memid-val" class="text-xs font-black font-mono tracking-wider text-white">${memberId}</div>
                    </div>
                  </div>
                  <div class="text-[8px] font-mono text-slate-300">VALID SESSION: <span class="text-amber-300 font-bold">${validUntil}</span></div>
                </div>

                <!-- Dynamic High-Resolution QR Code Container -->
                <div class="flex flex-col items-center justify-center bg-white p-1.5 rounded-2xl shadow-xl shrink-0 cursor-pointer hover:scale-105 transition-transform" id="badge-qr-wrapper" title="Click to view QR pass payload">
                  <div id="badge-qr-canvas-box" class="w-16 h-16 flex items-center justify-center"></div>
                </div>
              </div>

            </div>

            <!-- BADGE BACK VIEW (Shown on Flip) -->
            <div id="badge-back-view" class="hidden h-full flex flex-col justify-between text-xs relative z-20">
              
              <!-- Encrypted Magnetic Strip Header -->
              <div class="h-10 bg-slate-950 -mx-6 -mt-6 mb-2 flex items-center justify-between px-6 border-b border-slate-800">
                <span class="text-[9px] font-mono text-slate-400 tracking-widest uppercase">ENCRYPTED MAGNETIC STRIP • CCTSC-GATEWAY-AUTH-2026</span>
                <span class="text-[9px] font-mono text-emerald-400 flex items-center space-x-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>SYNCED</span>
                </span>
              </div>

              <div class="space-y-2">
                <div class="text-[11px] font-black text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Institutional Privileges & Chapter Regulations</span>
                  <span class="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">CLEARANCE: LEVEL-2 LABS</span>
                </div>
                <p class="text-[10px] text-slate-300 leading-relaxed">
                  This official biometric and cryptographic identity badge certifies active delegate status in <strong class="text-white" id="badge-back-club-name">${activeClub.name}</strong>, with autonomous access to High-Performance GPU clusters, IoT sensor testing benches, and hackathon arenas.
                </p>
                <div class="bg-slate-900/80 p-2.5 rounded-2xl border border-white/10 text-[9px] font-mono text-slate-300 space-y-1">
                  <div class="flex justify-between">
                    <span>Holder Role: <strong class="text-amber-300" id="badge-back-tier">${initialTier}</strong></span>
                    <span>Gate Pass: <strong class="text-emerald-400">${passId}</strong></span>
                  </div>
                  <div>Security Token: <span class="text-blue-300">sha256:0x${rollNumber}::PEC_CCTSC_AUTH</span></div>
                  <div>Issuing Authority: <span class="text-white font-bold">Office of Central Council Secretariat & Principal, PEC</span></div>
                </div>
              </div>

              <!-- Barcode & Seals Footer -->
              <div class="space-y-1.5 pt-2 border-t border-white/20">
                <div class="flex items-center justify-between">
                  <!-- Barcode Emulation -->
                  <div class="space-y-0.5">
                    <div class="font-mono text-slate-400 text-[8px] tracking-widest">||| | |||| | | |||| ||| || | ||| |||| | |</div>
                    <div class="font-mono text-slate-300 text-[9px]">${rollNumber} • ${memberId}</div>
                  </div>
                  <div class="text-right text-[8px] font-mono text-slate-400">
                    <div>Helpline: <strong class="text-white">+91 884 2383305</strong></div>
                    <div>Portal: <strong class="text-white">cgc@pragati.ac.in</strong></div>
                  </div>
                </div>
                <div class="text-center pt-0.5 text-[8px] text-blue-300 font-mono">
                  Pragati Engineering College (Autonomous) • Surampalem, ADB Road, AP 533437
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      <!-- Member Rights & Privileges Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-base font-bold">⚡</div>
          <h3 class="font-bold text-slate-900 text-sm">Instant QR Gate Check-in</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Contactless entry to technical symposiums, hackathons, and guest lectures via gate scanners reading the cryptographic token.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-base font-bold">🔬</div>
          <h3 class="font-bold text-slate-900 text-sm">Hardware & Cloud Labs</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Exclusive reservation rights for NVIDIA Jetson kits, 3D printers, IoT sensor benches, and cloud sandbox credits.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-base font-bold">📜</div>
          <h3 class="font-bold text-slate-900 text-sm">NAAC Tier-1 Accreditation</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Direct synchronization with accredited certificates, institutional transcripts, and NBA Tier-1 portfolio audits.
          </p>
        </div>

      </div>

      <!-- QR Code Inspection Modal -->
      <div id="qr-inspector-modal" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">📱</span>
              <h3 class="text-sm font-black text-slate-900">Cryptographic QR Pass Payload</h3>
            </div>
            <button id="close-qr-modal-btn" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">✕</button>
          </div>
          
          <div class="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div id="modal-large-qr-box" class="w-44 h-44 flex items-center justify-center bg-white p-2 rounded-xl shadow-md"></div>
            <p class="text-[11px] text-slate-500 font-mono mt-3 text-center">Scan with Campus Gate Kiosk or Mobile Camera</p>
          </div>

          <div class="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[10px] space-y-1 overflow-x-auto">
            <div><strong class="text-blue-400">ID:</strong> <span id="modal-payload-id">${passId}</span></div>
            <div><strong class="text-emerald-400">HOLDER:</strong> ${user.name} (${rollNumber})</div>
            <div><strong class="text-amber-400">CHAPTER:</strong> <span id="modal-payload-club">${activeClub.name}</span></div>
            <div><strong class="text-purple-400">HASH:</strong> sha256:0x${rollNumber}::PEC_CCTSC_AUTH</div>
          </div>

          <div class="flex items-center justify-end space-x-2 pt-2">
            <button id="modal-download-qr-btn" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md">
              Download QR Image
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function attachMembershipCardEvents(params = {}) {
  const user = getCurrentUser() || {};
  const db = getDB();
  const allClubs = db.clubs || [];
  
  const rollNumber = user.rollNo || user.facultyId || "22A31A0501";
  const department = user.department || "Computer Science & Engineering";
  const memberId = user.membershipId || `PEC-MEM-2026-${(department.substring(0,3)).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const passId = user.passId || `PEC-PASS-2026-${rollNumber.replace(/[^A-Z0-9]/gi, '')}`;

  const badgeCard = document.getElementById("digital-badge-card");
  const qrBox = document.getElementById("badge-qr-canvas-box");
  const clubSelect = document.getElementById("badge-club-select");
  const tierSelect = document.getElementById("badge-tier-select");

  // Helper to generate dynamic QR payload
  function generateBadgeQR(clubObj, tierTitle) {
    if (!qrBox || !window.QRCode) return;
    qrBox.innerHTML = "";

    const payload = JSON.stringify({
      institution: "Pragati Engineering College (Autonomous)",
      type: "DIGITAL_CLUB_MEMBER_BADGE",
      passId: passId,
      memberId: memberId,
      studentName: user.name || "Student",
      rollNo: rollNumber,
      department: department,
      clubId: clubObj.id,
      clubName: clubObj.name,
      badgeTier: tierTitle,
      validUntil: user.validUntil || "30 JUNE 2028",
      securitySignature: `sha256:0x${rollNumber}::PEC_CCTSC_2026`,
      verifyUrl: `${window.location.origin}/#/verify?token=${passId}`
    });

    new window.QRCode(qrBox, {
      text: payload,
      width: 64,
      height: 64,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel?.H || 2
    });

    // Also populate modal large QR
    const modalQr = document.getElementById("modal-large-qr-box");
    if (modalQr) {
      modalQr.innerHTML = "";
      new window.QRCode(modalQr, {
        text: payload,
        width: 160,
        height: 160,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel?.H || 2
      });
    }
  }

  // Initial QR render
  const initialClub = allClubs.find(c => c.id === clubSelect?.value) || allClubs[0] || { id: "I4-08", name: "Google Developer Student Club" };
  const initialTier = tierSelect?.value || "Active Student Member";
  generateBadgeQR(initialClub, initialTier);

  // 1. Interactive 3D Gyro / Cursor Physics for Holographic Card
  let enable3DTilt = true;
  const toggleTilt = document.getElementById("toggle-3d-tilt");
  if (toggleTilt) {
    toggleTilt.addEventListener("change", (e) => {
      enable3DTilt = e.target.checked;
      if (!enable3DTilt && badgeCard) {
        badgeCard.style.transform = "none";
      }
    });
  }

  if (badgeCard) {
    const handleMove = (clientX, clientY) => {
      if (!enable3DTilt) return;
      const rect = badgeCard.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -12; // -12deg to +12deg
      const rotateY = ((x - centerX) / centerX) * 12;

      badgeCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      // Move holographic gleam with cursor
      const gleam = document.getElementById("badge-holo-gleam-layer");
      if (gleam) {
        const percentX = (x / rect.width) * 100;
        gleam.style.transform = `translate(${percentX - 50}%, ${(y / rect.height) * 60 - 30}%) rotate(25deg)`;
      }
    };

    badgeCard.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
    badgeCard.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    badgeCard.addEventListener("mouseleave", () => {
      if (enable3DTilt) {
        badgeCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      }
    });
  }

  // 2. Shimmer & Iridescent Toggles
  const toggleShimmer = document.getElementById("toggle-holo-shimmer");
  if (toggleShimmer) {
    toggleShimmer.addEventListener("change", (e) => {
      const shimmerLayer = document.getElementById("badge-holo-shimmer-layer");
      const gleamLayer = document.getElementById("badge-holo-gleam-layer");
      if (shimmerLayer) shimmerLayer.style.display = e.target.checked ? "block" : "none";
      if (gleamLayer) gleamLayer.style.display = e.target.checked ? "block" : "none";
    });
  }

  // 3. Theme Selector
  document.querySelectorAll(".holo-theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      if (!badgeCard) return;

      document.querySelectorAll(".holo-theme-btn").forEach(b => {
        b.className = "holo-theme-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "holo-theme-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] bg-blue-600 text-white shadow-xs transition-all";

      // Reset theme classes
      badgeCard.classList.remove(
        "theme-sapphire-holo", "theme-obsidian-holo", "theme-emerald-holo",
        "theme-crimson-holo", "theme-nebula-holo", "theme-prismatic-holo"
      );

      badgeCard.classList.add(`theme-${theme}-holo`);
    });
  });

  // 4. Club Selector Dynamic Update
  if (clubSelect) {
    clubSelect.addEventListener("change", () => {
      const chosen = allClubs.find(c => c.id === clubSelect.value);
      if (!chosen) return;

      const nameEl = document.getElementById("badge-club-name");
      const iconEl = document.getElementById("badge-club-icon");
      const backClubEl = document.getElementById("badge-back-club-name");
      const modalClub = document.getElementById("modal-payload-club");

      if (nameEl) nameEl.textContent = chosen.name;
      if (iconEl) iconEl.textContent = chosen.icon || "🏛️";
      if (backClubEl) backClubEl.textContent = chosen.name;
      if (modalClub) modalClub.textContent = chosen.name;

      generateBadgeQR(chosen, tierSelect?.value || "Active Student Member");
      showToast("Badge Updated", `Loaded ${chosen.name} credentials.`, "info");
    });
  }

  // 5. Tier / Designation Dynamic Update
  if (tierSelect) {
    tierSelect.addEventListener("change", () => {
      const newTier = tierSelect.value;
      const tierPill = document.getElementById("badge-tier-pill");
      const backTier = document.getElementById("badge-back-tier");

      if (tierPill) tierPill.innerHTML = `<span>✦ ${newTier}</span>`;
      if (backTier) backTier.textContent = newTier;

      const currClub = allClubs.find(c => c.id === clubSelect?.value) || allClubs[0];
      generateBadgeQR(currClub, newTier);
      showToast("Designation Updated", `Badge set to ${newTier}.`, "success");
    });
  }

  // 6. Flip Badge Handler
  const flipBtn = document.getElementById("flip-badge-btn");
  const frontView = document.getElementById("badge-front-view");
  const backView = document.getElementById("badge-back-view");
  if (flipBtn && frontView && backView) {
    flipBtn.addEventListener("click", () => {
      const isFront = !frontView.classList.contains("hidden");
      if (isFront) {
        frontView.classList.add("hidden");
        backView.classList.remove("hidden");
      } else {
        backView.classList.add("hidden");
        frontView.classList.remove("hidden");
      }
    });
  }

  // 7. Save / Download Badge as High-Res PNG Image
  const downloadBtn = document.getElementById("download-badge-png-btn");
  if (downloadBtn && badgeCard) {
    downloadBtn.addEventListener("click", async () => {
      showToast("Generating Badge...", "Capturing holographic foil badge image...", "info");
      
      const currClub = allClubs.find(c => c.id === clubSelect?.value) || allClubs[0];
      const filename = `PEC-DIGITAL-BADGE-${rollNumber}-${(currClub.code || currClub.id || 'CCTSC').replace(/[^a-zA-Z0-9]/g, '')}.png`;

      // Use HTML2Canvas if available
      if (window.html2canvas) {
        try {
          // Temporarily ensure 3D transform is neutral during rasterization
          const prevTransform = badgeCard.style.transform;
          badgeCard.style.transform = "none";

          const canvas = await window.html2canvas(badgeCard, {
            scale: 2.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false
          });

          badgeCard.style.transform = prevTransform;

          const imageUri = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = filename;
          link.href = imageUri;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          showToast("Badge Saved!", `Downloaded ${filename} successfully.`, "success");
          return;
        } catch (err) {
          console.warn("[Badge Export] HTML2Canvas failed, falling back to QR pass:", err);
        }
      }

      // Fallback: Download QR Pass
      const qrCanvas = qrBox?.querySelector("canvas") || qrBox?.querySelector("img");
      if (qrCanvas) {
        const link = document.createElement("a");
        link.download = `PEC-QR-PASS-${rollNumber}.png`;
        link.href = qrCanvas.src || qrCanvas.toDataURL("image/png");
        link.click();
        showToast("QR Pass Saved", "Downloaded digital QR pass.", "success");
      }
    });
  }

  // 8. Download QR Pass Standalone
  const downloadQrBtn = document.getElementById("download-qr-btn");
  const modalDownloadQrBtn = document.getElementById("modal-download-qr-btn");
  const handleQrDownload = () => {
    const qrCanvas = qrBox?.querySelector("canvas") || qrBox?.querySelector("img");
    if (qrCanvas) {
      const link = document.createElement("a");
      link.download = `PEC-QR-GATE-PASS-${rollNumber}.png`;
      link.href = qrCanvas.src || qrCanvas.toDataURL("image/png");
      link.click();
      showToast("QR Pass Downloaded", "Saved high-resolution QR token.", "success");
    }
  };
  if (downloadQrBtn) downloadQrBtn.addEventListener("click", handleQrDownload);
  if (modalDownloadQrBtn) modalDownloadQrBtn.addEventListener("click", handleQrDownload);

  // 9. Print Official Badge
  const printBtn = document.getElementById("print-badge-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  // 10. Copy Token
  const copyBtn = document.getElementById("copy-token-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const token = copyBtn.dataset.token || passId;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(token).then(() => {
          showToast("Token Copied", `Gate Pass ID '${token}' copied to clipboard!`, "success");
        });
      } else {
        showToast("Gate Pass ID", token, "info");
      }
    });
  }

  // 11. QR Inspector Modal
  const qrWrapper = document.getElementById("badge-qr-wrapper");
  const qrModal = document.getElementById("qr-inspector-modal");
  const closeQrModalBtn = document.getElementById("close-qr-modal-btn");

  if (qrWrapper && qrModal) {
    qrWrapper.addEventListener("click", () => {
      qrModal.classList.remove("hidden");
    });
  }
  if (closeQrModalBtn && qrModal) {
    closeQrModalBtn.addEventListener("click", () => {
      qrModal.classList.add("hidden");
    });
  }
}
