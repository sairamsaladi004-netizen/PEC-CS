export function renderAboutView() {
  return `
    <div class="space-y-8 pb-16 max-w-5xl mx-auto">
      
      <!-- Hero Banner -->
      <div class="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div class="max-w-2xl space-y-3 relative z-10">
          <span class="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold uppercase">
            Official Institutional Charter
          </span>
          <h1 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Central Council of Technical Societies & Student Chapters (CCTSC)
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Pragati Engineering College & Pragati University's unified governing board synchronizing professional bodies, domain research chapters, hackathons, and cryptographic accreditation ledgers.
          </p>
        </div>
      </div>

      <!-- Core Institutional Pillars -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">🏛️</div>
          <h2 class="text-base font-bold text-slate-900">NBA Criteria 9 Benchmark</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            Direct institutional alignment with National Board of Accreditation parameters for co-curricular engineering design, student chapter activities, and professional society contributions.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">🔒</div>
          <h2 class="text-base font-bold text-slate-900">Tamper-Proof Credentialing</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            Cryptographically minted SHA-256 certificates with embedded verification hashes, protecting student portfolios against fraudulent claims and providing public ledger verification.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">🚀</div>
          <h2 class="text-base font-bold text-slate-900">Peer-Led Innovation</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            Open-source repositories, hands-on student lab guides, competitive coding leagues, and campus hackathons bridging academic theory with production software architecture.
          </p>
        </div>
      </div>

      <!-- Executive Leadership Directory -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <h2 class="text-lg font-black text-slate-900">Council Executive Leadership</h2>
          <p class="text-xs text-slate-500">Distinguished faculty advisors and student secretariat guiding the council</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" class="w-12 h-12 rounded-xl object-cover" />
            <div>
              <div class="text-xs font-black text-slate-900">Dr. K. Satyanarayana</div>
              <div class="text-[11px] text-blue-600 font-semibold">Principal & Council Patron</div>
              <div class="text-[10px] text-slate-400 font-mono">principal@pragati.ac.in</div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" class="w-12 h-12 rounded-xl object-cover" />
            <div>
              <div class="text-xs font-black text-slate-900">Mr. K. Siva Shankar</div>
              <div class="text-[11px] text-blue-600 font-semibold">Faculty Coordinator, CCTSC</div>
              <div class="text-[10px] text-slate-400 font-mono">coordinator.cctsc@pragati.ac.in</div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" class="w-12 h-12 rounded-xl object-cover" />
            <div>
              <div class="text-xs font-black text-slate-900">Prof. Ananya Iyer</div>
              <div class="text-[11px] text-blue-600 font-semibold">Faculty Advisor, ACM Chapter</div>
              <div class="text-[10px] text-slate-400 font-mono">ananya.iyer@pragati.ac.in</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Campus Contact & Secretariat Office -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="space-y-1">
          <h2 class="text-base font-bold text-slate-900">Council Secretariat Office</h2>
          <p class="text-xs text-slate-500">Innovation & R&D Pavilion, Pragati Engineering College (Autonomous), Surampalem, Near Kakinada, AP - 533437</p>
          <div class="text-xs font-mono text-blue-600 font-bold">Email: techcouncil@pragati.ac.in • Phone: +91 8852 252233 / 252234</div>
        </div>
        <a href="#/events" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-colors shrink-0">
          Browse Upcoming Events →
        </a>
      </div>

    </div>
  `;
}

export function attachAboutEvents() {
  // Static informative view
}
