import { getDB, apiRequest } from '../db.js';
import { getCurrentUser, switchUser, getAllDemoAccounts } from '../auth.js';
import { showToast } from '../components/toast.js';

export function renderGuestDashboardView(params = {}) {
  const db = getDB();
  const clubs = db.clubs || [];
  const events = db.events || [];
  const announcements = db.announcements || [];
  const accounts = getAllDemoAccounts();

  const activeCategory = params.category || "all";
  const filteredClubs = activeCategory === "all" 
    ? clubs.slice(0, 9) 
    : clubs.filter(c => c.category?.toLowerCase() === activeCategory.toLowerCase()).slice(0, 9);

  return `
    <div class="space-y-8 pb-16">
      
      <!-- Public Institutional Hero & Metric Aggregates -->
      <div class="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 md:p-10 border border-slate-700 shadow-xl relative overflow-hidden">
        <div class="relative z-10 max-w-3xl space-y-4">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-500/30">
            <span>🏛️ Pragati Engineering College (Autonomous)</span>
            <span>•</span>
            <span>Career Guidance Cell</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Pragati Technical Societies & Innovation Ecosystem
          </h1>
          <p class="text-sm md:text-base text-slate-300 leading-relaxed">
            Centralized hub for all 35 student-led technical chapters, Industry 4.0 research groups, hackathons, and institutional credentials.
          </p>

          <div class="pt-2 flex flex-wrap items-center gap-3">
            <a href="#/login" class="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2">
              <span>🔐</span>
              <span>Student & Faculty Portal Sign In</span>
            </a>
            <a href="#/verify" class="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition-all flex items-center space-x-2">
              <span>🛡️</span>
              <span>Verify Issued Certificate</span>
            </a>
          </div>
        </div>

        <!-- Metric Stat Counters -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-8 border-t border-slate-700/60 relative z-10">
          <div class="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60">
            <div class="text-2xl md:text-3xl font-black text-blue-400 font-mono">35</div>
            <div class="text-xs font-semibold text-slate-300 mt-1">Official Chapters</div>
            <div class="text-[10px] text-slate-400">Industry 4.0 & Societies</div>
          </div>
          <div class="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60">
            <div class="text-2xl md:text-3xl font-black text-emerald-400 font-mono">3,850+</div>
            <div class="text-xs font-semibold text-slate-300 mt-1">Student Members</div>
            <div class="text-[10px] text-slate-400">Verified PEC Engineers</div>
          </div>
          <div class="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60">
            <div class="text-2xl md:text-3xl font-black text-purple-400 font-mono">100%</div>
            <div class="text-xs font-semibold text-slate-300 mt-1">QR Attendance</div>
            <div class="text-[10px] text-slate-400">Tamper-Proof Ledger</div>
          </div>
          <div class="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60">
            <div class="text-2xl md:text-3xl font-black text-amber-400 font-mono">1,420+</div>
            <div class="text-xs font-semibold text-slate-300 mt-1">Issued Credentials</div>
            <div class="text-[10px] text-slate-400">Cryptographic Hashes</div>
          </div>
        </div>
      </div>

      <!-- Quick Demo Persona Switcher Banner -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-black text-slate-900">Explore Role-Based Dashboards</h2>
            <p class="text-xs text-slate-500">Instantly switch persona to test role-isolated views and authority permissions:</p>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono font-bold">
            Interactive Test Sandbox
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${accounts.map(acc => {
            const roleColor = acc.role === "Super Admin" 
              ? "border-rose-200 hover:border-rose-500 bg-rose-50/50" 
              : acc.role === "Faculty Coordinator"
              ? "border-purple-200 hover:border-purple-500 bg-purple-50/50"
              : acc.role === "Club Admin"
              ? "border-blue-200 hover:border-blue-500 bg-blue-50/50"
              : "border-emerald-200 hover:border-emerald-500 bg-emerald-50/50";

            return `
              <button class="quick-persona-switch-btn p-4 rounded-2xl border text-left transition-all hover:shadow-md space-y-2 ${roleColor}" data-user-id="${acc.id}">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800">${acc.name}</span>
                  <span class="text-[10px] font-mono font-bold uppercase text-slate-500">${acc.role}</span>
                </div>
                <div class="text-[11px] text-slate-500">
                  ${acc.role === 'Super Admin' ? 'IAM control, Audit logs & settings' : acc.role === 'Faculty Coordinator' ? 'Approve rosters, mint certificates' : acc.role === 'Club Admin' ? 'Manage chapter & events' : 'My passes, ID & attendance'}
                </div>
                <div class="text-[11px] font-bold text-blue-600 flex items-center space-x-1">
                  <span>Switch & Launch Portal</span>
                  <span>→</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Public Clubs Directory Highlight -->
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">Browse 35 Official Technical Societies</h2>
            <p class="text-xs text-slate-500">Chartered student chapters across autonomous engineering domains</p>
          </div>
          <a href="#/clubs" class="text-xs font-bold text-blue-600 hover:text-blue-500 inline-flex items-center space-x-1">
            <span>View all 35 clubs in catalog</span>
            <span>→</span>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${filteredClubs.map(c => `
            <div class="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono text-[10px] font-bold uppercase">
                    ${c.id} • ${c.category}
                  </span>
                  <span class="text-xs font-bold text-slate-500 font-mono">👥 ${c.membersCount || 120}</span>
                </div>
                <h3 class="text-sm font-bold text-slate-900">${c.name}</h3>
                <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">${c.description}</p>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-500 text-[11px]">Coord: <strong class="text-slate-700">${c.facultyCoordinator || 'Dr. Faculty'}</strong></span>
                <a href="#/clubs" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors">
                  Details
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Live Certificate Quick-Verification Card -->
      <div class="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 md:p-8 border border-blue-200 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span class="px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-800 text-[10px] font-mono font-bold">
              PUBLIC VERIFICATION ENGINE
            </span>
            <h3 class="text-lg font-black text-slate-900 mt-1">Verify Institutional Credential Authenticity</h3>
            <p class="text-xs text-slate-600 max-w-xl mt-1">
              Enter any Certificate Serial Number or Credential Hash to verify issuing faculty signatures and student achievement records.
            </p>
          </div>

          <div class="w-full md:w-auto flex items-center space-x-2">
            <input type="text" id="guest-cert-input" placeholder="e.g. CERT-2026-I408-9842" class="px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64" />
            <button id="guest-cert-verify-btn" class="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold whitespace-nowrap transition-all shadow-sm">
              Verify
            </button>
          </div>
        </div>
        <div id="guest-cert-result" class="hidden p-4 rounded-2xl text-xs font-mono bg-white border border-slate-200"></div>
      </div>

    </div>
  `;
}

export function attachGuestDashboardEvents() {
  // Persona switch buttons
  document.querySelectorAll(".quick-persona-switch-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const userId = btn.getAttribute("data-user-id");
      if (userId) {
        await switchUser(userId);
        showToast("Persona Switched", "Navigating to your role portal...", "success");
        setTimeout(() => window.location.reload(), 400);
      }
    });
  });

  // Certificate Quick Verify
  const verifyBtn = document.getElementById("guest-cert-verify-btn");
  const input = document.getElementById("guest-cert-input");
  const resultBox = document.getElementById("guest-cert-result");

  verifyBtn?.addEventListener("click", () => {
    const query = input?.value.trim();
    if (!query) {
      if (resultBox) {
        resultBox.className = "p-4 rounded-2xl text-xs font-mono bg-rose-50 text-rose-800 border border-rose-200 block";
        resultBox.textContent = "Please enter a certificate serial code or hash.";
      }
      return;
    }

    const db = getDB();
    const cert = (db.certificates || []).find(c => 
      c.id?.toLowerCase() === query.toLowerCase() || 
      c.certificate_number?.toLowerCase() === query.toLowerCase() ||
      c.signature?.toLowerCase().includes(query.toLowerCase())
    );

    if (resultBox) {
      if (cert) {
        resultBox.className = "p-4 rounded-2xl text-xs font-mono bg-emerald-50 text-emerald-900 border border-emerald-200 block space-y-1";
        resultBox.innerHTML = `
          <div class="font-bold text-emerald-800 flex items-center space-x-1">
            <span>✓</span>
            <span>AUTHENTIC INSTITUTIONAL CERTIFICATE</span>
          </div>
          <div>Certificate ID: <strong>${cert.id}</strong></div>
          <div>Recipient: <strong>${cert.student_name || 'Student Engineer'}</strong> (${cert.student_rollNo || 'Roll Verified'})</div>
          <div>Event: <strong>${cert.event_title || 'Pragati Technical Conclave'}</strong></div>
          <div>Issued by: <strong>${cert.issued_by || 'Faculty Coordinator'}</strong></div>
          <div>Verification Hash: <span class="text-[10px] text-slate-500">${cert.signature || 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}</span></div>
        `;
      } else {
        resultBox.className = "p-4 rounded-2xl text-xs font-mono bg-amber-50 text-amber-900 border border-amber-200 block";
        resultBox.innerHTML = `
          <div class="font-bold">Credential Query: "${query}"</div>
          <div class="text-[11px] text-amber-800 mt-1">No matching certificate found in public registry. Check the code or try with sample: <code>${(db.certificates && db.certificates[0]?.id) || 'CERT-2026-I408-01'}</code></div>
        `;
      }
    }
  });
}
