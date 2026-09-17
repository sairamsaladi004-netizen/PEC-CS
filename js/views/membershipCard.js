import { getCurrentUser } from '../auth.js';
import { getDB } from '../db.js';

export function renderMembershipCardView() {
  const user = getCurrentUser() || {};
  const db = getDB();
  const enrolledClubs = (user.clubs || []).map(id => db.clubs.find(c => c.id === id)?.shortName).filter(Boolean);

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Action Bar -->
      <div class="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Institutional Digital ID Card</h1>
          <p class="text-xs sm:text-sm text-slate-500">Accredited student smart credential with dynamic gate check-in & holographic security layer</p>
        </div>
        <div class="flex items-center space-x-3">
          <button id="flip-card-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors">
            🔄 Flip Card (Front / Back)
          </button>
          <button id="print-card-btn" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all">
            🖨️ Print Physical Badge
          </button>
        </div>
      </div>

      <!-- Card Container Section -->
      <div class="flex justify-center py-6">
        <div class="relative w-full max-w-md perspective-1000">
          
          <!-- Card Outer with Holographic Shimmer -->
          <div id="smart-card" class="printable-area holo-card w-full h-[320px] rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-2xl border border-blue-500/30 flex flex-col justify-between relative select-none transition-all duration-500">
            
            <!-- Card Front Content -->
            <div id="card-front" class="h-full flex flex-col justify-between">
              
              <!-- Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm">P</div>
                  <div>
                    <div class="text-[11px] font-black uppercase tracking-wider text-white">PANIMALAR ENGG COLLEGE</div>
                    <div class="text-[9px] text-blue-300 font-mono">Central Technical Council (CCTSC)</div>
                  </div>
                </div>
                <div class="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold">
                  <span>★ GOLD DELEGATE</span>
                </div>
              </div>

              <!-- Main Details Grid -->
              <div class="flex items-center space-x-4 my-2">
                <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" class="w-20 h-24 rounded-2xl object-cover border-2 border-white/40 shadow-lg shrink-0" />
                <div class="space-y-1 overflow-hidden">
                  <div class="text-lg font-black text-white truncate">${user.name}</div>
                  <div class="text-xs text-blue-400 font-mono font-bold">${user.rollNo || user.facultyId || '22CS101'}</div>
                  <div class="text-[11px] text-slate-300">Dept. of ${user.department || 'CSE'} (${user.year || '3rd Year'})</div>
                  <div class="text-[10px] text-emerald-400 font-semibold truncate">
                    ${enrolledClubs.length > 0 ? `Clubs: ${enrolledClubs.join(', ')}` : 'Tech Societies Member'}
                  </div>
                </div>
              </div>

              <!-- Bottom Chip & Dynamic QR Code -->
              <div class="pt-3 border-t border-white/10 flex items-center justify-between">
                <div class="space-y-0.5">
                  <div class="text-[9px] text-slate-400 font-mono uppercase tracking-wider">MEMBER ID</div>
                  <div class="text-xs font-black font-mono tracking-wider text-slate-200">${user.membershipId || 'PEC-MEM-2026-CSE-8492'}</div>
                  <div class="text-[8px] text-slate-400 font-mono">VALID THRU: ${user.validUntil || '30 JUNE 2027'}</div>
                </div>

                <div class="flex items-center space-x-2">
                  <div class="w-8 h-6 rounded bg-amber-300/30 border border-amber-300/60 flex items-center justify-center text-[10px]">💳</div>
                  <div id="card-qr-box" class="w-14 h-14 bg-white p-1 rounded-xl shadow-md shrink-0"></div>
                </div>
              </div>

            </div>

            <!-- Card Back Content (Hidden initially) -->
            <div id="card-back" class="hidden h-full flex flex-col justify-between text-xs">
              <div class="space-y-2">
                <div class="h-9 bg-slate-950 -mx-6 -mt-6 mb-3 flex items-center px-6">
                  <span class="text-[10px] font-mono text-slate-500">MAGNETIC STRIP SIMULATION • CCTSC-PEC-GATEWAY</span>
                </div>
                <div class="text-[11px] font-bold text-white uppercase tracking-wider">Terms & Gate Privileges</div>
                <p class="text-[10px] text-slate-300 leading-relaxed">
                  This non-transferable digital identity token grants physical admission to high-performance computing centers, campus maker-labs, hackathons, and IEEE/ACM society meetings.
                </p>
              </div>

              <div class="space-y-1.5 pt-3 border-t border-white/10">
                <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Emergency Campus Hotline:</span>
                  <span class="text-white">+91 44 2649 0404</span>
                </div>
                <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Council Secretariat Email:</span>
                  <span class="text-white">techcouncil@panimalar.edu</span>
                </div>
                <div class="text-center pt-2 text-[9px] text-blue-300 font-mono">
                  Click 'Flip Card' to return to credential front
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- Perks & Information -->
      <div class="max-w-2xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 class="font-bold text-slate-900 text-sm">Digital Member Privileges & Perks</h3>
        <ul class="space-y-2 text-slate-600 list-disc pl-4">
          <li>Automated contactless check-in at official hackathons via embedded QR token.</li>
          <li>Access to high-spec computing labs, NVIDIA Jetson hardware kits, and robotics arenas.</li>
          <li>Institutional discount codes for cloud certifications (AWS, Google Cloud, Docker).</li>
          <li>Official digital transcripts and auto-syncing portfolio verification.</li>
        </ul>
      </div>

    </div>
  `;
}

export function attachMembershipCardEvents() {
  const user = getCurrentUser() || {};
  const qrBox = document.getElementById("card-qr-box");
  if (qrBox && window.QRCode) {
    qrBox.innerHTML = "";
    new window.QRCode(qrBox, {
      text: JSON.stringify({
        id: user.membershipId || "PEC-MEM-2026-CSE-8492",
        name: user.name,
        roll: user.rollNo || "22CS101",
        role: user.role
      }),
      width: 48,
      height: 48,
      colorDark: "#0f172a",
      colorLight: "#ffffff"
    });
  }

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

  const printBtn = document.getElementById("print-card-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }
}
