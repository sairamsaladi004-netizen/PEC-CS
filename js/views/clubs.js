import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

export function renderClubsView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const selectedClubId = params.id;

  if (selectedClubId) {
    const club = db.clubs.find(c => c.id === selectedClubId) || db.clubs[0];
    const isMember = user.clubs && user.clubs.includes(club.id);
    const isFaculty = ["Faculty Coordinator", "Department Admin", "Super Admin"].includes(user.role);
    const isClubAdmin = user.role === "Club Admin" || isFaculty;
    const clubEvents = (db.events || []).filter(e => e.clubId === club.id);

    // Selected tenure filter or default
    const selectedTenure = params.tenure || "2025-2026";
    const filteredTeam = (club.executiveTeam || []).filter(m => !m.tenure || m.tenure === selectedTenure || selectedTenure === 'All');

    return `
      <div class="space-y-6 pb-16">
        <!-- Back Navigation -->
        <div class="flex items-center justify-between">
          <a href="#/clubs" class="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
            <span>← Back to All Societies</span>
          </a>
          <div class="text-xs text-slate-400 font-mono">PEC Chapter ID: <span class="text-slate-800 font-bold">${club.id.toUpperCase()}</span></div>
        </div>

        <!-- Club Banner Header -->
        <div class="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl">
          <div class="h-48 sm:h-64 w-full relative">
            <img src="${club.banner}" class="w-full h-full object-cover opacity-60" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>
          <div class="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div class="flex items-end space-x-4">
              <img src="${club.icon}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-slate-900 shadow-xl object-cover bg-slate-800" />
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  ${club.domain}
                </span>
                <h1 class="text-2xl sm:text-3xl font-black mt-1 text-white">${club.name}</h1>
                <div class="text-xs text-slate-400 font-mono">Dept. of ${club.department} • ${club.memberCount} Active Enrolled Members</div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              ${isMember ? `
                <span class="px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                  <span>✓ Enrolled Member</span>
                </span>
              ` : `
                <button data-clubid="${club.id}" class="join-club-btn px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all">
                  + Join Technical Society
                </button>
              `}
              ${isClubAdmin ? `
                <a href="#/club-dashboard?club=${club.id}" class="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center space-x-1.5">
                  <span>📊 Admin Dashboard</span>
                </a>
                <button id="add-team-member-btn" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors">
                  + Nominate Executive
                </button>
              ` : `
                <a href="#/club-dashboard?club=${club.id}" class="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-1.5">
                  <span>📊 Analytics Dashboard</span>
                </a>
              `}
              <a href="#/reports" class="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors">
                Charter Dossier ↗
              </a>
            </div>
          </div>
        </div>

        <!-- Description, Objectives & Activities -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Society Objectives Card -->
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 class="text-base font-bold text-slate-900">Objectives & Institutional Charter</h2>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">${club.description}</p>
              
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div class="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
                  <div class="text-blue-700 font-bold text-xs">Research & Hackathons</div>
                  <p class="text-[11px] text-slate-600">Active participation in Smart India Hackathon and ACM ICPC regionals.</p>
                </div>
                <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <div class="text-emerald-700 font-bold text-xs">Skill Certification</div>
                  <p class="text-[11px] text-slate-600">Hands-on peer bootcamps aligned with Tier-1 engineering requirements.</p>
                </div>
                <div class="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
                  <div class="text-purple-700 font-bold text-xs">Open Source IP</div>
                  <p class="text-[11px] text-slate-600">Institutional code repositories with faculty peer review.</p>
                </div>
              </div>
            </div>

            <!-- Executive Committee & Leads with Tenure Filter & Approval Workflow -->
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                  <h2 class="text-base font-bold text-slate-900">Executive Committee & Leads</h2>
                  <p class="text-xs text-slate-500">Student chairs, leads and technical coordinators</p>
                </div>

                <!-- Academic Year Filter -->
                <div class="flex items-center space-x-2 text-xs">
                  <span class="font-bold text-slate-400">Tenure:</span>
                  <select id="tenure-filter-select" class="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                    <option value="2025-2026" ${selectedTenure === '2025-2026' ? 'selected' : ''}>2025-2026 (Current)</option>
                    <option value="2024-2025" ${selectedTenure === '2024-2025' ? 'selected' : ''}>2024-2025 (Historical)</option>
                    <option value="2023-2024" ${selectedTenure === '2023-2024' ? 'selected' : ''}>2023-2024 (Historical)</option>
                    <option value="All" ${selectedTenure === 'All' ? 'selected' : ''}>All Tenures</option>
                  </select>
                </div>
              </div>

              <!-- Executive Team Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${filteredTeam.length === 0 ? `
                  <div class="col-span-2 p-6 text-center text-slate-400 text-xs">No executive leads recorded for tenure ${selectedTenure}.</div>
                ` : filteredTeam.map((exec, idx) => `
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
                    <div class="flex items-start justify-between">
                      <div>
                        <div class="font-bold text-slate-900 text-xs">${exec.name}</div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">${exec.role}</span>
                      </div>
                      <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        exec.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        exec.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800 animate-pulse'
                      }">
                        ${exec.status || 'Approved'}
                      </span>
                    </div>

                    <div class="text-[11px] text-slate-500 font-mono">${exec.year} • Tenure: ${exec.tenure || '2025-2026'}</div>
                    <div class="text-[11px] text-blue-600 font-mono">${exec.email}</div>

                    <!-- Faculty Coordinator Approval Actions -->
                    ${(isFaculty && exec.status === 'Pending Faculty Approval') ? `
                      <div class="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
                        <button data-clubid="${club.id}" data-memberindex="${idx}" class="approve-exec-btn px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-colors">
                          ✓ Approve Appointment
                        </button>
                        <button data-clubid="${club.id}" data-memberindex="${idx}" class="reject-exec-btn px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold border border-rose-200 transition-colors">
                          ✕ Reject
                        </button>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Society Accredited Events & Activities -->
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-base font-bold text-slate-900">Events & Activities (${clubEvents.length})</h2>
                  <p class="text-xs text-slate-500">Workshops, hackathons and coding leagues organized by ${club.shortName}</p>
                </div>
                <a href="#/events" class="text-xs font-bold text-blue-600 hover:text-blue-700">All Events →</a>
              </div>

              <div class="space-y-3">
                ${clubEvents.length === 0 ? `
                  <div class="p-6 text-center text-slate-400 text-xs">No events scheduled for this society yet.</div>
                ` : clubEvents.map(evt => `
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="space-y-1">
                      <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800">${evt.category}</span>
                      <div class="font-bold text-slate-900 text-xs">${evt.title}</div>
                      <div class="text-[11px] text-slate-500 font-mono">📅 ${evt.date} • 📍 ${evt.venue}</div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <a href="#/poster?id=${evt.id}" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors">
                        View Poster
                      </a>
                      <a href="#/events" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors">
                        Register →
                      </a>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <!-- Faculty Advisory & Society Info -->
          <div class="space-y-6">
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty Coordinator</h3>
              <div class="space-y-1">
                <div class="text-sm font-black text-slate-900">${club.facultyCoordinator.name}</div>
                <div class="text-xs text-blue-600 font-mono">${club.facultyCoordinator.email}</div>
                <div class="text-xs text-slate-500 font-mono">${club.facultyCoordinator.phone || '+91 80 2345 6789'}</div>
              </div>
              <div class="pt-3 border-t border-slate-100 text-xs text-slate-500">
                Formally endorsed by the Central Council of Technical Societies (CCTSC) for NBA Criteria 9 compliance.
              </div>
            </div>

            <!-- Society Statistics -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 class="font-bold text-slate-900">Key Chapter Metrics</h3>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="text-slate-500">Status</span>
                <span class="font-bold text-emerald-600">Active Recognized</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="text-slate-500">Total Enrolled</span>
                <span class="font-bold font-mono">${club.memberCount} Members</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="text-slate-500">Accredited Events</span>
                <span class="font-bold font-mono">${clubEvents.length} Activities</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="text-slate-500">Constitution</span>
                <span class="font-bold text-blue-600 font-mono">v2.4 Ratified</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Appointment Modal -->
        <div id="team-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 class="text-sm font-bold text-slate-900">Nominate Executive Committee Member</h3>
              <button id="close-team-modal" class="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form id="team-member-form" class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input type="text" id="member-name" required placeholder="e.g. Sneha Reddy" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Designated Role / Position</label>
                <select id="member-role" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold">
                  <option value="Chairperson">Chairperson</option>
                  <option value="Vice Chair">Vice Chair</option>
                  <option value="Technical Head">Technical Head</option>
                  <option value="Event Lead">Event Lead</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Media & Design Lead">Media & Design Lead</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Year & Dept</label>
                  <input type="text" id="member-dept" required placeholder="3rd Year CSE" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Tenure Academic Year</label>
                  <select id="member-tenure" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold">
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">College Email</label>
                <input type="email" id="member-email" required placeholder="name@panimalar.edu" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
              </div>

              <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                ℹ️ Nominations from Club Admins are submitted to the Faculty Coordinator for formal endorsement.
              </div>

              <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
                Submit Nomination for Faculty Review
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  // Directory View
  return `
    <div class="space-y-6 pb-16">
      <!-- Title & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Technical Societies & Clubs</h1>
          <p class="text-xs sm:text-sm text-slate-500">Official student-led technology societies under the Central Technical Council</p>
        </div>
      </div>

      <!-- Domain Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
        <button data-domain="all" class="club-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all">All Societies (${db.clubs.length})</button>
        <button data-domain="Artificial Intelligence & ML" class="club-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">AI & ML</button>
        <button data-domain="Open Source & Systems" class="club-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Open Source</button>
        <button data-domain="Mobile & Cross-Platform" class="club-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Mobile & Google</button>
        <button data-domain="Cybersecurity & Ethical Hacking" class="club-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cybersecurity</button>
        <button data-domain="Web3 & Blockchain" class="club-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Web3</button>
      </div>

      <!-- Clubs Grid -->
      <div id="clubs-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${db.clubs.map(club => {
          const isMember = user.clubs && user.clubs.includes(club.id);
          return `
            <div class="club-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between" data-domain="${club.domain}">
              <div>
                <div class="relative h-36 overflow-hidden bg-slate-900">
                  <img src="${club.banner}" class="w-full h-full object-cover opacity-80" />
                  <span class="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm">
                    Dept. of ${club.department}
                  </span>
                </div>
                <div class="p-6 space-y-3">
                  <div class="flex items-center space-x-3 -mt-12 relative z-10">
                    <img src="${club.icon}" class="w-14 h-14 rounded-2xl border-2 border-white shadow-md object-cover bg-white" />
                    <div>
                      <h2 class="text-base font-black text-slate-900 leading-tight">${club.name}</h2>
                      <div class="text-[11px] text-blue-600 font-bold">${club.domain}</div>
                    </div>
                  </div>
                  <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">${club.description}</p>
                  <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>${club.memberCount} Members</span>
                    <span>${(club.executiveTeam || []).length} Leads</span>
                  </div>
                </div>
              </div>
              <div class="p-6 pt-0 flex items-center space-x-2">
                <a href="#/clubs?id=${club.id}" class="flex-1 text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors">
                  View Society
                </a>
                ${isMember ? `
                  <span class="px-3 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                    ✓ Joined
                  </span>
                ` : `
                  <button data-clubid="${club.id}" class="join-club-btn px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors">
                    Join
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function attachClubsEvents(params = {}) {
  // Filter Tabs
  document.querySelectorAll(".club-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".club-filter-btn").forEach(b => {
        b.className = "club-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "club-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      const domain = btn.dataset.domain;
      document.querySelectorAll(".club-card").forEach(card => {
        card.style.display = (domain === "all" || card.dataset.domain === domain) ? "flex" : "none";
      });
    });
  });

  // Join Club Buttons
  document.querySelectorAll(".join-club-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const clubId = btn.dataset.clubid;
      const db = getDB();
      const user = getCurrentUser();
      const club = db.clubs.find(c => c.id === clubId);
      if (club && user) {
        if (!user.clubs) user.clubs = [];
        if (!user.clubs.includes(clubId)) {
          user.clubs.push(clubId);
          club.memberCount += 1;
          const userIdx = db.users.findIndex(u => u.id === user.id);
          if (userIdx !== -1) db.users[userIdx] = user;
          saveDB(db);
          logAudit(`${user.name} (${user.role})`, "Joined Club", club.name, `New member of ${club.shortName}`);
          showToast(`Welcome to ${club.name}! Digital membership updated.`, "success");
          window.location.reload();
        }
      }
    });
  });

  // Tenure Filter Select
  const tenureSelect = document.getElementById("tenure-filter-select");
  if (tenureSelect && params.id) {
    tenureSelect.addEventListener("change", (e) => {
      window.location.hash = `#/clubs?id=${params.id}&tenure=${e.target.value}`;
    });
  }

  // Faculty Coordinator Approval for Executive Appointment
  document.querySelectorAll(".approve-exec-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const clubId = btn.dataset.clubid;
      const memberIdx = parseInt(btn.dataset.memberindex, 10);
      const db = getDB();
      const club = db.clubs.find(c => c.id === clubId);
      if (club && club.executiveTeam && club.executiveTeam[memberIdx]) {
        club.executiveTeam[memberIdx].status = "Approved";
        saveDB(db);
        logAudit("Faculty Coordinator", "Approved Executive Appointment", `${club.name} - ${club.executiveTeam[memberIdx].name}`, `Endorsed ${club.executiveTeam[memberIdx].role}`);
        showToast("Executive Approved", `${club.executiveTeam[memberIdx].name} appointment ratified.`, "success");
        setTimeout(() => window.location.reload(), 200);
      }
    });
  });

  document.querySelectorAll(".reject-exec-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const clubId = btn.dataset.clubid;
      const memberIdx = parseInt(btn.dataset.memberindex, 10);
      const db = getDB();
      const club = db.clubs.find(c => c.id === clubId);
      if (club && club.executiveTeam && club.executiveTeam[memberIdx]) {
        club.executiveTeam[memberIdx].status = "Rejected";
        saveDB(db);
        logAudit("Faculty Coordinator", "Rejected Executive Nomination", `${club.name} - ${club.executiveTeam[memberIdx].name}`, "Nomination declined with remarks.");
        showToast("Nomination Declined", "Executive nomination status updated.", "info");
        setTimeout(() => window.location.reload(), 200);
      }
    });
  });

  // Team Member Nomination Modal
  const addTeamBtn = document.getElementById("add-team-member-btn");
  const teamModal = document.getElementById("team-modal");
  const closeModal = document.getElementById("close-team-modal");
  const teamForm = document.getElementById("team-member-form");
  if (addTeamBtn && teamModal) {
    addTeamBtn.addEventListener("click", () => teamModal.classList.remove("hidden"));
    if (closeModal) closeModal.addEventListener("click", () => teamModal.classList.add("hidden"));
    if (teamForm) {
      teamForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const db = getDB();
        const club = db.clubs.find(c => c.id === params.id);
        const user = getCurrentUser() || {};
        const isFaculty = ["Faculty Coordinator", "Department Admin", "Super Admin"].includes(user.role);

        if (club) {
          const newMember = {
            name: document.getElementById("member-name").value,
            role: document.getElementById("member-role").value,
            year: document.getElementById("member-dept").value,
            tenure: document.getElementById("member-tenure").value,
            email: document.getElementById("member-email").value,
            status: isFaculty ? "Approved" : "Pending Faculty Approval"
          };
          if (!club.executiveTeam) club.executiveTeam = [];
          club.executiveTeam.push(newMember);
          saveDB(db);
          logAudit(`${user.name} (${user.role})`, "Nominated Executive", `${club.name} - ${newMember.name}`, `Assigned role: ${newMember.role}`);
          showToast(
            isFaculty ? "Executive Appointed" : "Nomination Submitted",
            isFaculty ? `Appointed ${newMember.name} as ${newMember.role}.` : `Nomination for ${newMember.name} sent to Faculty Coordinator.`,
            "success"
          );
          teamModal.classList.add("hidden");
          setTimeout(() => window.location.reload(), 300);
        }
      });
    }
  }
}
