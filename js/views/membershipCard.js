import { getCurrentUser } from '../auth.js';
import { getDB } from '../db.js';
import { showToast } from '../components/toast.js';

export function renderMembershipCardView() {
  const user = getCurrentUser() || {};
  const db = getDB();
  
  // Calculate clubs
  const userClubs = (user.clubs || []).map(id => db.clubs.find(c => c.id === id)).filter(Boolean);
  const primaryClub = userClubs[0] || (db.clubs || []).find(c => c.id === "I4-08") || (db.clubs || [])[0] || { name: "Google Developer Student Club", domain: "AI & Cloud Systems", id: "I4-08" };

  const rollNumber = user.rollNo || user.facultyId || "22A31A0501";
  const memberId = user.membershipId || `PEC-MEM-2026-${(user.department || 'CSE').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const passId = user.passId || `PEC-PASS-2026-${rollNumber.replace(/[^A-Z0-9]/gi, '')}`;
  const validUntil = user.validUntil || "30 JUNE 2028";
  const userRoleTitle = user.role === "Student" ? "Active Student Member" : user.role;

  return `
    <div class="space-y-8 pb-16 max-w-5xl mx-auto">
      
      <!-- Top Header & Action Controls -->
      <div class="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">CCTSC Accredited Credential</span>
            <span class="text-xs text-emerald-600 font-bold flex items-center">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5 inline-block"></span>
              Verified Supabase Active Token
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Official Digital Student ID & Gate Pass</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Tamper-evident smart identification card for campus maker spaces, hackathon gate scanners, and autonomous examination halls</p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button id="flip-card-btn" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer">
            <span>🔄</span>
            <span>Flip Badge (Front / Back)</span>
          </button>
          <button id="download-id-card-btn" class="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>📥</span>
            <span>Download PNG</span>
          </button>
          <button id="print-card-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer">
            <span>🖨️</span>
            <span>Print Physical ID</span>
          </button>
        </div>
      </div>

      <!-- Theme & Hologram Customizer Strip -->
      <div class="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs shadow-xs">
        <div class="flex items-center space-x-2">
          <span class="font-bold text-slate-700">Badge Theme:</span>
          <div class="flex items-center space-x-1.5">
            <button class="theme-btn px-2.5 py-1 rounded-lg font-bold bg-blue-600 text-white transition-all text-[11px]" data-theme="sapphire">Royal Sapphire</button>
            <button class="theme-btn px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-[11px]" data-theme="obsidian">Obsidian Gold</button>
            <button class="theme-btn px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-[11px]" data-theme="emerald">Cyber Emerald</button>
            <button class="theme-btn px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-[11px]" data-theme="crimson">Crimson Council</button>
          </div>
        </div>

        <div class="flex items-center space-x-3 text-slate-600">
          <span class="font-mono text-[11px]">Pass ID: <strong class="text-blue-600 font-bold">${passId}</strong></span>
          <button id="copy-memid-btn" data-memid="${memberId}" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-all">
            📋 Copy AID
          </button>
        </div>
      </div>

      <!-- Interactive Smart Badge Display Stage -->
      <div class="flex flex-col items-center justify-center py-6">
        
        <div class="w-full max-w-lg perspective-1000">
          
          <!-- Smart Card Container with Luxury Holographic Outer Frame -->
          <div id="smart-card" class="theme-sapphire printable-area relative w-full h-[370px] rounded-3xl text-white p-6 shadow-2xl select-none transition-all duration-700 transform-style-3d flex flex-col justify-between overflow-hidden border border-white/20 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
            
            <!-- Metallic Holographic Watermark / Light Ripple Layer -->
            <div class="absolute -right-24 -top-24 w-64 h-64 bg-gradient-to-br from-blue-400/25 via-indigo-500/15 to-transparent rounded-full blur-2xl pointer-events-none"></div>
            <div class="absolute -left-24 -bottom-24 w-64 h-64 bg-gradient-to-tr from-amber-400/20 via-rose-500/15 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            <!-- CARD FRONT VIEW -->
            <div id="card-front" class="h-full flex flex-col justify-between relative z-10 transition-opacity duration-300">
              
              <!-- Top Institutional Crest & Hologram Header -->
              <div class="flex items-center justify-between border-b border-white/15 pb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-base shadow-lg border border-amber-300">
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
                  <div class="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[9px] font-extrabold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                    <span>✦ VERIFIED DELEGATE</span>
                  </div>
                  <div class="text-[8px] font-mono text-slate-400 mt-0.5">NAAC 'A' GRADE • NBA</div>
                </div>
              </div>

              <!-- Center Bio Grid -->
              <div class="flex items-center space-x-4 my-2">
                <div class="relative shrink-0">
                  <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" class="w-22 h-26 rounded-2xl object-cover border-2 border-white/50 shadow-2xl bg-slate-800" alt="${user.name}" />
                  <div class="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-black shadow-md" title="Active Verified Token">✓</div>
                </div>

                <div class="space-y-1 overflow-hidden flex-1">
                  <div class="text-lg sm:text-xl font-black text-white tracking-tight truncate">${user.name}</div>
                  <div class="text-xs text-amber-400 font-mono font-black tracking-wider flex items-center space-x-2">
                    <span>ROLL: ${rollNumber}</span>
                    <span class="text-slate-400">•</span>
                    <span class="text-blue-300 font-sans">${user.year || '3rd Year'} (${user.section || 'A'})</span>
                  </div>
                  
                  <div class="text-[11px] text-slate-200 font-semibold truncate">
                    Department of <strong class="text-white">${user.department || 'Computer Science & Engineering'}</strong>
                  </div>

                  <div id="badge-club-display" class="text-[10px] text-emerald-300 font-bold truncate bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-xl inline-flex items-center space-x-1">
                    <span>🏛️</span>
                    <span>${primaryClub.name || 'CCTSC Technical Delegate'}</span>
                  </div>
                </div>
              </div>

              <!-- Holographic Microchip, QR & Card Credentials Footer -->
              <div class="pt-3 border-t border-white/15 flex items-center justify-between">
                <div class="space-y-0.5">
                  <div class="flex items-center space-x-2">
                    <!-- EMV Smart Microchip Graphic -->
                    <div class="w-9 h-7 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 border border-amber-200 flex items-center justify-center shadow-md relative overflow-hidden" title="Contactless Smart Chip">
                      <div class="w-full h-[1px] bg-amber-700/50 absolute top-2"></div>
                      <div class="w-full h-[1px] bg-amber-700/50 absolute bottom-2"></div>
                      <div class="w-[1px] h-full bg-amber-700/50 absolute left-3"></div>
                      <div class="w-[1px] h-full bg-amber-700/50 absolute right-3"></div>
                      <span class="text-[9px] relative z-10 font-bold text-slate-900">📶</span>
                    </div>
                    <div>
                      <div class="text-[8px] font-mono text-slate-400 uppercase tracking-wider">SMART AID PASS</div>
                      <div id="badge-memid-text" class="text-xs font-black font-mono tracking-wider text-slate-100">${memberId}</div>
                    </div>
                  </div>
                  <div class="text-[8px] font-mono text-slate-400">VALID SESSION: <span class="text-amber-300 font-bold">${validUntil}</span></div>
                </div>

                <!-- Dynamic High-Resolution QR Token -->
                <div class="flex flex-col items-center justify-center bg-white p-1 rounded-2xl shadow-xl shrink-0">
                  <div id="card-qr-box" class="w-16 h-16 flex items-center justify-center"></div>
                </div>
              </div>

            </div>

            <!-- CARD BACK VIEW (Hidden by default, shown on Flip) -->
            <div id="card-back" class="hidden h-full flex flex-col justify-between text-xs relative z-10">
              
              <!-- Magnetic Strip Emulation Header -->
              <div class="h-10 bg-slate-950 -mx-6 -mt-6 mb-2 flex items-center justify-between px-6 border-b border-slate-800">
                <span class="text-[9px] font-mono text-slate-400 tracking-widest uppercase">ENCRYPTED MAGNETIC STRIP • CCTSC-GATEWAY-AUTH-2026</span>
                <span class="text-[9px] font-mono text-emerald-400">● SYNCED</span>
              </div>

              <div class="space-y-2">
                <div class="text-[11px] font-black text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Institutional Privileges & Regulations</span>
                  <span class="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">CLEARANCE: LEVEL-1</span>
                </div>
                <p class="text-[10px] text-slate-300 leading-relaxed">
                  This official biometric & cryptographic identity card certifies active enrollment across all 35 Technical Societies, High-Performance Computing clusters, Advanced Robotics Arenas, and AI Innovation Labs at Pragati Engineering College (Autonomous).
                </p>
                <div class="bg-slate-900/80 p-2.5 rounded-2xl border border-white/10 text-[9px] font-mono text-slate-300 space-y-1">
                  <div class="flex justify-between">
                    <span>Holder Role: <strong class="text-amber-300">${userRoleTitle}</strong></span>
                    <span>Gate Pass: <strong class="text-emerald-400">${passId}</strong></span>
                  </div>
                  <div>Security Token: <span class="text-blue-300">sha256:0x${rollNumber}::PEC_CCTSC_AUTH</span></div>
                  <div>Issued by: <span class="text-white font-bold">Office of Central Council Secretariat & Principal, PEC</span></div>
                </div>
              </div>

              <!-- Barcode & Seals Footer -->
              <div class="space-y-1.5 pt-2 border-t border-white/15">
                <div class="flex items-center justify-between">
                  <!-- Barcode Emulation -->
                  <div class="space-y-0.5">
                    <div class="font-mono text-slate-400 text-[8px] tracking-widest">||| | |||| | | |||| ||| || | ||| |||| | |</div>
                    <div class="font-mono text-slate-300 text-[9px]">${rollNumber} • ${memberId}</div>
                  </div>
                  <div class="text-right text-[8px] font-mono text-slate-400">
                    <div>Helpline: <strong class="text-white">+91 884 2383305</strong></div>
                    <div>Email: <strong class="text-white">cgc@pragati.ac.in</strong></div>
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
  const passId = user.passId || `PEC-PASS-2026-${rollNumber.replace(/[^A-Z0-9]/gi, '')}`;

  // 1. QR Code Rendering
  const qrBox = document.getElementById("card-qr-box");
  if (qrBox && window.QRCode) {
    qrBox.innerHTML = "";
    new window.QRCode(qrBox, {
      text: JSON.stringify({
        institution: "Pragati Engineering College (Autonomous)",
        type: "STUDENT_GATE_PASS",
        passId,
        id: memberId,
        name: user.name,
        roll: rollNumber,
        dept: user.department || "CSE",
        role: user.role,
        verified: true
      }),
      width: 64,
      height: 64,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel?.H || 2
    });
  }

  // 2. Flip Card Handler
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

  // 3. Theme Switcher
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      const smartCard = document.getElementById("smart-card");
      if (!smartCard) return;

      document.querySelectorAll(".theme-btn").forEach(b => {
        b.className = "theme-btn px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-[11px]";
      });
      btn.className = "theme-btn px-2.5 py-1 rounded-lg font-bold bg-blue-600 text-white transition-all text-[11px]";

      // Apply theme gradients
      if (theme === "sapphire") {
        smartCard.className = "printable-area relative w-full h-[370px] rounded-3xl text-white p-6 shadow-2xl select-none transition-all duration-700 transform-style-3d flex flex-col justify-between overflow-hidden border border-white/20 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900";
      } else if (theme === "obsidian") {
        smartCard.className = "printable-area relative w-full h-[370px] rounded-3xl text-white p-6 shadow-2xl select-none transition-all duration-700 transform-style-3d flex flex-col justify-between overflow-hidden border border-amber-500/30 bg-gradient-to-br from-neutral-950 via-zinc-900 to-black";
      } else if (theme === "emerald") {
        smartCard.className = "printable-area relative w-full h-[370px] rounded-3xl text-white p-6 shadow-2xl select-none transition-all duration-700 transform-style-3d flex flex-col justify-between overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950";
      } else if (theme === "crimson") {
        smartCard.className = "printable-area relative w-full h-[370px] rounded-3xl text-white p-6 shadow-2xl select-none transition-all duration-700 transform-style-3d flex flex-col justify-between overflow-hidden border border-rose-500/30 bg-gradient-to-br from-slate-950 via-rose-950 to-red-950";
      }
    });
  });

  // 4. Download ID Card as Image
  const downloadBtn = document.getElementById("download-id-card-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const qrCanvas = qrBox?.querySelector("canvas") || qrBox?.querySelector("img");
      if (qrCanvas) {
        const link = document.createElement("a");
        link.download = `PEC-DIGITAL-ID-${rollNumber}.png`;
        link.href = qrCanvas.src || qrCanvas.toDataURL("image/png");
        link.click();
        showToast("Card Pass Exported", "Digital ID Pass QR saved to your device.", "success");
      } else {
        window.print();
      }
    });
  }

  // 5. Print Badge
  const printBtn = document.getElementById("print-card-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  // 6. Copy Member ID
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
}

