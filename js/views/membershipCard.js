import { getCurrentUser } from '../auth.js';
import { getDB } from '../db.js';
import { showToast } from '../components/toast.js';

export function renderMembershipCardView() {
  const user = getCurrentUser() || {};
  const db = getDB();
  
  // Calculate clubs
  const userClubs = (user.clubs || []).map(id => db.clubs.find(c => c.id === id)).filter(Boolean);
  const primaryClub = userClubs[0] || db.clubs.find(c => c.id === "I4-08") || db.clubs[0];

  const rollNumber = user.rollNo || user.facultyId || "22A31A0501";
  const memberId = user.membershipId || `PEC-MEM-2026-${(user.department || 'CSE').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const validUntil = user.validUntil || "30 JUNE 2027";
  const userRoleTitle = user.role === "Student" ? "Active Student Member" : user.role;

  return `
    <div class="space-y-8 pb-16 max-w-5xl mx-auto">
      
      <!-- Top Header & Action Controls -->
      <div class="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">CCTSC Accredited Credential</span>
            <span class="text-xs text-emerald-600 font-bold flex items-center">✓ Verified Dynamic Token</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Institutional Society Membership AID / Smart ID</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Cryptographically signed digital student delegate badge for campus maker-spaces, hackathons & HPC labs</p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button id="flip-card-btn" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer">
            <span>🔄</span>
            <span>Flip Badge (Front / Back)</span>
          </button>
          <button id="copy-memid-btn" data-memid="${memberId}" class="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>📋</span>
            <span>Copy ID</span>
          </button>
          <button id="print-card-btn" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer">
            <span>🖨️</span>
            <span>Print Physical Badge</span>
          </button>
        </div>
      </div>

      <!-- Society Affiliation Selector (if student has multiple societies) -->
      ${userClubs.length > 1 ? `
        <div class="no-print flex items-center space-x-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
          <span class="font-bold text-slate-500">Active Society Badge:</span>
          <div class="flex flex-wrap gap-2">
            ${userClubs.map((c, idx) => `
              <button class="club-badge-select px-3 py-1.5 rounded-xl font-bold transition-all ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" data-clubname="${c.name}" data-clubcode="${c.id}" data-domain="${c.domain}">
                ${c.shortName || c.name}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Interactive Smart Badge Display Area -->
      <div class="flex flex-col items-center justify-center py-4">
        
        <div class="w-full max-w-md perspective-1000">
          
          <!-- Smart Card Container with Luxury Holographic Outer Frame -->
          <div id="smart-card" class="printable-area relative w-full h-[340px] rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 shadow-2xl border-2 border-indigo-500/40 select-none transition-all duration-700 transform-style-3d flex flex-col justify-between overflow-hidden">
            
            <!-- Metallic Holographic Watermark / Light Ripple -->
            <div class="absolute -right-20 -top-20 w-56 h-56 bg-gradient-to-br from-blue-400/20 via-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
            <div class="absolute -left-20 -bottom-20 w-56 h-56 bg-gradient-to-tr from-amber-400/15 via-rose-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            <!-- CARD FRONT VIEW -->
            <div id="card-front" class="h-full flex flex-col justify-between relative z-10 transition-opacity duration-300">
              
              <!-- Top Institutional Ribbon -->
              <div class="flex items-center justify-between border-b border-white/15 pb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md border border-white/20">
                    P
                  </div>
                  <div>
                    <div class="text-[11px] font-black uppercase tracking-wider text-white">PRAGATI ENGINEERING COLLEGE</div>
                    <div class="text-[9px] text-blue-300 font-mono tracking-wide">AUTONOMOUS • CENTRAL TECHNICAL COUNCIL (CCTSC)</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                  <span>✦ GOLD DELEGATE</span>
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
                </div>
              </div>

              <!-- Micro-strip & Card Credentials Footer -->
              <div class="pt-3 border-t border-white/15 flex items-center justify-between">
                <div class="space-y-0.5">
                  <div class="text-[8px] font-mono text-slate-400 uppercase tracking-wider">SMART AID CREDENTIAL ID</div>
                  <div id="badge-memid-text" class="text-xs font-black font-mono tracking-wider text-slate-100">${memberId}</div>
                  <div class="text-[8px] font-mono text-slate-400">VALID ACADEMIC SESSION: <span class="text-amber-300">${validUntil}</span></div>
                </div>

                <!-- Dynamic QR Token -->
                <div class="flex items-center space-x-2.5">
                  <div class="w-8 h-6 rounded-md bg-amber-300/30 border border-amber-300/60 flex items-center justify-center text-[10px] shadow-xs" title="Smart Chip Contactless Ready">
                    💳
                  </div>
                  <div id="card-qr-box" class="w-14 h-14 bg-white p-1 rounded-xl shadow-lg shrink-0 flex items-center justify-center"></div>
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
                  <div>• Verification Hash: <span class="text-blue-300">sha256:0x${rollNumber}::PEC2026</span></div>
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

      <!-- Member Rights & Privileges Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-base font-bold">⚡</div>
          <h3 class="font-bold text-slate-900 text-sm">Instant Gate Check-in</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Contactless entry to hackathons, workshops, and inter-collegiate technical symposiums using the dynamic QR token.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-base font-bold">🔬</div>
          <h3 class="font-bold text-slate-900 text-sm">Hardware & Cloud Labs</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Exclusive reservation rights for NVIDIA Jetson kits, 3D printers, IoT sensor benches, and cloud sandbox credits.
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

    </div>
  `;
}

export function attachMembershipCardEvents() {
  const user = getCurrentUser() || {};
  const rollNumber = user.rollNo || user.facultyId || "22A31A0501";
  const memberId = user.membershipId || `PEC-MEM-2026-${(user.department || 'CSE').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // QR Code Rendering
  const qrBox = document.getElementById("card-qr-box");
  if (qrBox && window.QRCode) {
    qrBox.innerHTML = "";
    new window.QRCode(qrBox, {
      text: JSON.stringify({
        institution: "Pragati Engineering College (Autonomous)",
        id: memberId,
        name: user.name,
        roll: rollNumber,
        dept: user.department || "CSE",
        role: user.role,
        verified: true
      }),
      width: 52,
      height: 52,
      colorDark: "#0f172a",
      colorLight: "#ffffff"
    });
  }

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
      const id = copyBtn.dataset.memid;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(id).then(() => {
          showToast("ID Copied", `Membership AID '${id}' copied to clipboard!`, "success");
        });
      } else {
        showToast("Membership AID", id, "info");
      }
    });
  }

  // Club Badge Switcher
  document.querySelectorAll(".club-badge-select").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".club-badge-select").forEach(b => {
        b.className = "club-badge-select px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "club-badge-select px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white transition-all";
      
      const clubName = btn.dataset.clubname;
      const displayElem = document.getElementById("badge-club-display");
      if (displayElem) {
        displayElem.innerText = `🏛️ ${clubName}`;
      }
    });
  });
}

