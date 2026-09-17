import { getDB } from '../db.js';

export function renderSearchModal() {
  return `
    <div id="global-search-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Search Input -->
        <div class="p-4 border-b border-slate-800 flex items-center space-x-3">
          <svg class="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            id="global-search-input" 
            placeholder="Search clubs, hackathons, lab guides, projects, tools..." 
            class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd class="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded font-mono border border-slate-700">ESC</kbd>
        </div>

        <!-- Search Results Feed -->
        <div id="global-search-results" class="max-h-96 overflow-y-auto p-3 space-y-2 text-xs">
          <div class="p-6 text-center text-slate-500 text-xs">Type a keyword to explore the PEC ecosystem.</div>
        </div>

        <!-- Footer -->
        <div class="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>Search across 6 Societies • 4 Events • LMS Guides • Projects</span>
          <span>Press ESC to close</span>
        </div>

      </div>
    </div>
  `;
}

export function attachSearchModalEvents() {
  const modal = document.getElementById("global-search-modal");
  const input = document.getElementById("global-search-input");
  const resultsContainer = document.getElementById("global-search-results");

  const closeModal = () => {
    if (modal) modal.classList.add("hidden");
    if (input) input.value = "";
  };

  const openModal = () => {
    if (modal) {
      modal.classList.remove("hidden");
      if (input) {
        input.focus();
        input.select();
      }
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K and Escape
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (modal?.classList.contains("hidden")) {
        openModal();
      } else {
        closeModal();
      }
    }
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (input && resultsContainer) {
    input.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        resultsContainer.innerHTML = `<div class="p-6 text-center text-slate-500 text-xs">Type a keyword to explore the PEC ecosystem.</div>`;
        return;
      }

      const db = getDB();
      const results = [];

      // Search clubs
      db.clubs.forEach(c => {
        if (c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || c.department.toLowerCase().includes(q)) {
          results.push({
            title: c.name,
            subtitle: `${c.domain} • Dept. of ${c.department}`,
            category: "Club",
            link: `#/clubs?id=${c.id}`,
            badgeColor: "bg-blue-500/20 text-blue-300"
          });
        }
      });

      // Search events
      db.events.forEach(ev => {
        if (ev.title.toLowerCase().includes(q) || ev.category.toLowerCase().includes(q) || ev.venue.toLowerCase().includes(q)) {
          results.push({
            title: ev.title,
            subtitle: `${ev.date} • ${ev.venue} (${ev.category})`,
            category: "Event",
            link: `#/events`,
            badgeColor: "bg-purple-500/20 text-purple-300"
          });
        }
      });

      // Search projects
      db.projects.forEach(p => {
        if (p.title.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q) || p.teamLeader.toLowerCase().includes(q)) {
          results.push({
            title: p.title,
            subtitle: `Lead: ${p.teamLeader} • ${p.domain}`,
            category: "Project",
            link: `#/projects`,
            badgeColor: "bg-emerald-500/20 text-emerald-300"
          });
        }
      });

      // Search LMS
      db.lmsResources.forEach(res => {
        if (res.title.toLowerCase().includes(q) || res.domain.toLowerCase().includes(q)) {
          results.push({
            title: res.title,
            subtitle: `${res.domain} (${res.difficulty}) • ${res.readTime}`,
            category: "LMS Guide",
            link: `#/lms`,
            badgeColor: "bg-amber-500/20 text-amber-300"
          });
        }
      });

      // Search Tools
      db.tools.forEach(tool => {
        if (tool.name.toLowerCase().includes(q) || tool.category.toLowerCase().includes(q) || tool.purpose.toLowerCase().includes(q)) {
          results.push({
            title: tool.name,
            subtitle: `${tool.category} • ${tool.platform}`,
            category: "Tool",
            link: `#/tools`,
            badgeColor: "bg-cyan-500/20 text-cyan-300"
          });
        }
      });

      if (results.length === 0) {
        resultsContainer.innerHTML = `<div class="p-6 text-center text-slate-500 text-xs">No matching records found for "${q}".</div>`;
        return;
      }

      resultsContainer.innerHTML = results.slice(0, 10).map(r => `
        <a href="${r.link}" class="search-result-item flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 transition-colors group block">
          <div>
            <div class="font-bold text-white group-hover:text-blue-400 transition-colors">${r.title}</div>
            <div class="text-[11px] text-slate-400 mt-0.5">${r.subtitle}</div>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${r.badgeColor} shrink-0">${r.category}</span>
        </a>
      `).join('');

      resultsContainer.querySelectorAll(".search-result-item").forEach(item => {
        item.addEventListener("click", () => closeModal());
      });
    });
  }
}
