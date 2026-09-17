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
    const canManage = ["Club Admin", "Faculty Coordinator", "Department Admin", "Super Admin"].includes(user.role);

    return `
      <div class="space-y-6 pb-16">
        <!-- Back Navigation -->
        <div>
          <a href="#/clubs" class="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
            <span>← Back to All Societies</span>
          </a>
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
                <div class="text-xs text-slate-400 font-mono">Dept. of ${club.department} • ${club.memberCount} Active Members</div>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              ${isMember ? `
                <span class="px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                  <span>✓ Enrolled Member</span>
                </span>
              ` : `
                <button data-clubid="${club.id}" class="join-club-btn px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all">
                  + Join Technical Society
                </button>
              `}
              ${canManage ? `
                <button id="add-team-member-btn" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors">
                  + Appoint Executive
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Description & Executive Team -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h2 class="text-base font-bold text-slate-900">About the Society</h2>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">${club.description}</p>
            </div>

            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900">Executive Committee & Leads</h2>
                <span class="text-xs text-slate-400 font-mono">Academic Year 2025-2026</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${club.executiveTeam.map(exec => `
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div class="flex items-center justify-between">
                      <div class="font-bold text-slate-900 text-xs">${exec.name}</div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">${exec.role}</span>
                    </div>
                    <div class="text-[11px] text-slate-500 font-mono">${exec.year} • ${exec.tenure}</div>
                    <div class="text-[11px] text-blue-600 font-mono">${exec.email}</div>
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
                Endorsed by the Central Council of Technical Societies (CCTSC).
              </div>
            </div>
          </div>
        </div>

        <!-- Team Appointment Modal -->
        <div id="team-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 class="text-sm font-bold text-slate-900">Appoint Executive Committee Member</h3>
              <button id="close-team-modal" class="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form id="team-member-form" class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input type="text" id="member-name" required placeholder="e.g. Sneha Reddy" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Designated Role</label>
                <input type="text" id="member-role" required placeholder="e.g. Vice Chair / Technical Lead" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Year & Dept</label>
                  <input type="text" id="member-dept" required placeholder="3rd Year CSE" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Tenure</label>
                  <input type="text" id="member-tenure" value="2025-2026" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">College Email</label>
                <input type="email" id="member-email" required placeholder="name@apextech.edu" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
                Confirm Executive Appointment
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
                    <span>${club.executiveTeam.length} Leads</span>
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

  // Team Member Appointment Modal
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
        if (club) {
          const newMember = {
            name: document.getElementById("member-name").value,
            role: document.getElementById("member-role").value,
            year: document.getElementById("member-dept").value,
            tenure: document.getElementById("member-tenure").value,
            email: document.getElementById("member-email").value,
            status: "Approved"
          };
          club.executiveTeam.push(newMember);
          saveDB(db);
          logAudit("Faculty Advisor", "Appointed Executive", `${club.name} - ${newMember.name}`, `Assigned role: ${newMember.role}`);
          showToast(`Appointed ${newMember.name} as ${newMember.role}!`, "success");
          teamModal.classList.add("hidden");
          setTimeout(() => window.location.reload(), 300);
        }
      });
    }
  }
}
