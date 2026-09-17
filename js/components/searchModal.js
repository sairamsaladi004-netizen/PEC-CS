import { getDB } from '../db.js';
import { escapeHtml } from '../utils.js';

export function renderSearchModal() {
  return `
    <div id="global-search-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center pt-12 sm:pt-20 p-4 transition-all">
      <div class="bg-slate-900 border border-slate-700/70 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        
        <!-- Search Input Header -->
        <div class="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-900/90">
          <svg class="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            id="global-search-input" 
            placeholder="Type a command, club name, event, student roll number, or notice..." 
            class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
            autocomplete="off"
            spellcheck="false"
          />
          <button id="close-search-btn" class="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono border border-slate-700 transition-colors">
            ESC
          </button>
        </div>

        <!-- Filter Chips Bar -->
        <div class="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto text-[11px] font-semibold scrollbar-none">
          <button data-search-filter="all" class="search-filter-chip px-2.5 py-1 rounded-lg bg-blue-600 text-white shadow-xs transition-colors shrink-0">
            All Results
          </button>
          <button data-search-filter="clubs" class="search-filter-chip px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0">
            🏛️ 35 Societies
          </button>
          <button data-search-filter="events" class="search-filter-chip px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0">
            📅 Events
          </button>
          <button data-search-filter="notices" class="search-filter-chip px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0">
            📢 Notices
          </button>
          <button data-search-filter="members" class="search-filter-chip px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0">
            👥 Members
          </button>
          <button data-search-filter="navigation" class="search-filter-chip px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0">
            ⚡ Quick Jumps
          </button>
        </div>

        <!-- Search Results Feed -->
        <div id="global-search-results" class="flex-1 overflow-y-auto p-3 space-y-1.5 text-xs divide-y divide-slate-800/40">
          <!-- Initial Quick Commands -->
          <div class="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions & Shortcuts</div>
          <div class="space-y-1">
            <a href="#/clubs" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-blue-900/30 border border-slate-800 hover:border-blue-500/40 transition-all group block">
              <div class="flex items-center space-x-3">
                <span class="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">🏛️</span>
                <div>
                  <div class="font-bold text-white group-hover:text-blue-300">Browse 35 Official Technical Societies</div>
                  <div class="text-[11px] text-slate-400">Industry 4.0 chapters, IEEE, ACM, CSI, ISTE, and technical hubs</div>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">Jump</span>
            </a>

            <a href="#/events" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-purple-900/30 border border-slate-800 hover:border-purple-500/40 transition-all group block">
              <div class="flex items-center space-x-3">
                <span class="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">📅</span>
                <div>
                  <div class="font-bold text-white group-hover:text-purple-300">Campus Events & Digital Passes</div>
                  <div class="text-[11px] text-slate-400">Hackathons, hands-on bootcamps, workshops, and symposiums</div>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">Jump</span>
            </a>

            <a href="#/announcements" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-rose-900/30 border border-slate-800 hover:border-rose-500/40 transition-all group block">
              <div class="flex items-center space-x-3">
                <span class="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">📢</span>
                <div>
                  <div class="font-bold text-white group-hover:text-rose-300">Official Notice Board & Circulars</div>
                  <div class="text-[11px] text-slate-400">Real-time council circulars, faculty notices, and urgent alerts</div>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300">Jump</span>
            </a>

            <a href="#/attendance" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-emerald-900/30 border border-slate-800 hover:border-emerald-500/40 transition-all group block">
              <div class="flex items-center space-x-3">
                <span class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">⏱️</span>
                <div>
                  <div class="font-bold text-white group-hover:text-emerald-300">Live Attendance & QR Scanner Kiosk</div>
                  <div class="text-[11px] text-slate-400">Fast check-in via student digital pass or event ticket QR</div>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">Jump</span>
            </a>

            <a href="#/verify" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-cyan-900/30 border border-slate-800 hover:border-cyan-500/40 transition-all group block">
              <div class="flex items-center space-x-3">
                <span class="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">🎓</span>
                <div>
                  <div class="font-bold text-white group-hover:text-cyan-300">Verify Accredited Certificate (SHA-256)</div>
                  <div class="text-[11px] text-slate-400">Instant cryptographic validation of Pragati University credentials</div>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300">Jump</span>
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div class="flex items-center space-x-3">
            <span><kbd class="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">↑↓</kbd> Navigate</span>
            <span><kbd class="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">↵</kbd> Select</span>
            <span><kbd class="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">ESC</kbd> Close</span>
          </div>
          <span class="hidden sm:inline text-[10px] text-slate-500">Pragati University • Global Search Engine</span>
        </div>

      </div>
    </div>
  `;
}

export function openGlobalSearch() {
  const modal = document.getElementById("global-search-modal");
  const input = document.getElementById("global-search-input");
  if (modal) {
    modal.classList.remove("hidden");
    if (input) {
      input.focus();
      input.select();
    }
  }
}

export function closeGlobalSearch() {
  const modal = document.getElementById("global-search-modal");
  const input = document.getElementById("global-search-input");
  if (modal) modal.classList.add("hidden");
  if (input) input.value = "";
}

// Attach search modal events (re-invoked whenever view re-renders)
export function attachSearchModalEvents() {
  const modal = document.getElementById("global-search-modal");
  const input = document.getElementById("global-search-input");
  const closeBtn = document.getElementById("close-search-btn");
  const resultsContainer = document.getElementById("global-search-results");
  let activeFilter = "all";

  // Make open/close available globally on window
  window.openGlobalSearch = openGlobalSearch;
  window.closeGlobalSearch = closeGlobalSearch;

  // ESC and Click Backdrop
  closeBtn?.addEventListener("click", () => closeGlobalSearch());
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeGlobalSearch();
  });

  // Global Keydown Listener
  if (!window._hasGlobalSearchKeyListener) {
    window._hasGlobalSearchKeyListener = true;
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const m = document.getElementById("global-search-modal");
        if (m && m.classList.contains("hidden")) {
          openGlobalSearch();
        } else {
          closeGlobalSearch();
        }
      }
      if (e.key === "Escape") {
        closeGlobalSearch();
      }
    });
  }

  // Filter Chips Click
  const filterChips = document.querySelectorAll(".search-filter-chip");
  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      activeFilter = chip.getAttribute("data-search-filter") || "all";
      filterChips.forEach(c => {
        c.className = "search-filter-chip px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0";
      });
      chip.className = "search-filter-chip px-2.5 py-1 rounded-lg bg-blue-600 text-white shadow-xs transition-colors shrink-0";
      executeSearch();
    });
  });

  function executeSearch() {
    if (!input || !resultsContainer) return;
    const q = input.value.trim().toLowerCase();
    const db = getDB();

    if (!q && activeFilter === "all") {
      resultsContainer.innerHTML = `
        <div class="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions & Shortcuts</div>
        <div class="space-y-1">
          <a href="#/clubs" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-blue-900/30 border border-slate-800 hover:border-blue-500/40 transition-all group block">
            <div class="flex items-center space-x-3">
              <span class="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">🏛️</span>
              <div>
                <div class="font-bold text-white group-hover:text-blue-300">Browse 35 Official Technical Societies</div>
                <div class="text-[11px] text-slate-400">Industry 4.0 chapters, IEEE, ACM, CSI, ISTE, and technical hubs</div>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">Jump</span>
          </a>

          <a href="#/events" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-purple-900/30 border border-slate-800 hover:border-purple-500/40 transition-all group block">
            <div class="flex items-center space-x-3">
              <span class="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">📅</span>
              <div>
                <div class="font-bold text-white group-hover:text-purple-300">Campus Events & Digital Passes</div>
                <div class="text-[11px] text-slate-400">Hackathons, hands-on bootcamps, workshops, and symposiums</div>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">Jump</span>
          </a>

          <a href="#/announcements" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-rose-900/30 border border-slate-800 hover:border-rose-500/40 transition-all group block">
            <div class="flex items-center space-x-3">
              <span class="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">📢</span>
              <div>
                <div class="font-bold text-white group-hover:text-rose-300">Official Notice Board & Circulars</div>
                <div class="text-[11px] text-slate-400">Real-time council circulars, faculty notices, and urgent alerts</div>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300">Jump</span>
          </a>

          <a href="#/attendance" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-emerald-900/30 border border-slate-800 hover:border-emerald-500/40 transition-all group block">
            <div class="flex items-center space-x-3">
              <span class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">⏱️</span>
              <div>
                <div class="font-bold text-white group-hover:text-emerald-300">Live Attendance & QR Scanner Kiosk</div>
                <div class="text-[11px] text-slate-400">Fast check-in via student digital pass or event ticket QR</div>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">Jump</span>
          </a>
        </div>
      `;
      wireResultClickListeners();
      return;
    }

    const results = [];

    // 1. Search Clubs
    if (activeFilter === "all" || activeFilter === "clubs") {
      (db.clubs || []).forEach(c => {
        if (!q || c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || c.department.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) {
          results.push({
            title: c.name,
            subtitle: `${c.id} • ${c.domain} (Dept. of ${c.department})`,
            category: "Club",
            link: `#/clubs?id=${c.id}`,
            icon: "🏛️",
            badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-500/30"
          });
        }
      });
    }

    // 2. Search Events
    if (activeFilter === "all" || activeFilter === "events") {
      (db.events || []).forEach(ev => {
        if (!q || ev.title.toLowerCase().includes(q) || (ev.category && ev.category.toLowerCase().includes(q)) || (ev.venue && ev.venue.toLowerCase().includes(q)) || (ev.description && ev.description.toLowerCase().includes(q))) {
          results.push({
            title: ev.title,
            subtitle: `${ev.date} • ${ev.venue || 'Campus Auditorium'} (${ev.category || 'Workshop'})`,
            category: "Event",
            link: `#/events`,
            icon: "📅",
            badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/30"
          });
        }
      });
    }

    // 3. Search Notices / Announcements
    if (activeFilter === "all" || activeFilter === "notices") {
      (db.announcements || []).forEach(ann => {
        if (!q || ann.title.toLowerCase().includes(q) || (ann.content && ann.content.toLowerCase().includes(q)) || (ann.department && ann.department.toLowerCase().includes(q)) || (ann.priority && ann.priority.toLowerCase().includes(q))) {
          results.push({
            title: ann.title,
            subtitle: `${ann.date || 'Today'} • ${ann.department || 'All Departments'} (Priority: ${ann.priority || 'Normal'})`,
            category: "Notice",
            link: `#/announcements`,
            icon: "📢",
            badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          });
        }
      });
    }

    // 4. Search Members / Students / Coordinators
    if (activeFilter === "all" || activeFilter === "members") {
      (db.users || []).forEach(u => {
        if (!q || u.name.toLowerCase().includes(q) || (u.rollNo && u.rollNo.toLowerCase().includes(q)) || (u.facultyId && u.facultyId.toLowerCase().includes(q)) || u.role.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q))) {
          results.push({
            title: u.name,
            subtitle: `${u.role} • ${u.department || 'CSE'} (${u.rollNo || u.facultyId || 'PEC Member'})`,
            category: "Member",
            link: u.role === "Student" ? `#/student-profile` : `#/coordinator/dashboard`,
            icon: "👤",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          });
        }
      });
    }

    // 5. Search Quick Navigation Routes
    if (activeFilter === "all" || activeFilter === "navigation") {
      const routes = [
        { title: "Student Dashboard & Digital ID", subtitle: "Personalized dashboard, active memberships, digital ID pass", link: "#/student/dashboard", icon: "🎒" },
        { title: "Faculty Coordinator Portal", subtitle: "Society oversight, member approvals, event calendar, reports", link: "#/coordinator/dashboard", icon: "🎓" },
        { title: "Super Admin Console", subtitle: "Council governance, 35 clubs, IAM user permissions, audit logs", link: "#/admin/dashboard", icon: "👑" },
        { title: "Live QR Attendance Kiosk", subtitle: "Gate check-in, real-time ticket scanning, participation logs", link: "#/attendance", icon: "⏱️" },
        { title: "Accredited Certificate Ledger", subtitle: "Verify SHA-256 certificate hashes, view institutional seal", link: "#/verify", icon: "📜" },
        { title: "AI Event Poster Studio", subtitle: "Generate high-resolution multi-style posters for campus events", link: "#/poster", icon: "🎨" },
        { title: "Student Club Projects", subtitle: "Open-source campus repository, hackathon artifacts, showcases", link: "#/projects", icon: "💻" },
        { title: "LMS & Lab Guides", subtitle: "Self-paced study modules, curated engineering problem sets", link: "#/lms", icon: "📚" }
      ];

      routes.forEach(r => {
        if (!q || r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)) {
          results.push({
            title: r.title,
            subtitle: r.subtitle,
            category: "Navigation",
            link: r.link,
            icon: r.icon,
            badgeColor: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          });
        }
      });
    }

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="p-8 text-center space-y-2">
          <div class="text-3xl">🔍</div>
          <div class="text-sm font-bold text-slate-300">No matching records found</div>
          <div class="text-xs text-slate-500">We couldn't find any results for "${escapeHtml(q)}". Try searching for a club name, event title, or student roll number.</div>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = `
      <div class="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
        <span>Found ${results.length} result${results.length === 1 ? '' : 's'}</span>
        <span>Showing top matches</span>
      </div>
      <div class="space-y-1">
        ${results.slice(0, 15).map(r => `
          <a href="${r.link}" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group block">
            <div class="flex items-center space-x-3 overflow-hidden">
              <span class="w-8 h-8 rounded-xl bg-slate-800 text-base flex items-center justify-center shrink-0 border border-slate-700/60">${r.icon || '📌'}</span>
              <div class="truncate">
                <div class="font-bold text-white group-hover:text-blue-400 transition-colors truncate">${escapeHtml(r.title)}</div>
                <div class="text-[11px] text-slate-400 truncate">${escapeHtml(r.subtitle)}</div>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg ${r.badgeColor} shrink-0 ml-2">${escapeHtml(r.category)}</span>
          </a>
        `).join('')}
      </div>
    `;

    wireResultClickListeners();
  }

  function wireResultClickListeners() {
    resultsContainer.querySelectorAll(".search-result-item").forEach(item => {
      item.addEventListener("click", () => closeGlobalSearch());
    });
  }

  input?.addEventListener("input", () => executeSearch());
}
