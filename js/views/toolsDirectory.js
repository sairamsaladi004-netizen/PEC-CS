import { getDB } from '../db.js';

export function renderToolsDirectoryView() {
  const db = getDB();

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Curated Developer Software Directory</h1>
          <p class="text-xs sm:text-sm text-slate-500">Standardized toolchain and developer runtimes recommended by engineering faculty</p>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
        <button data-cat="all" class="tool-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all">All Tools (${db.tools.length})</button>
        <button data-cat="DevOps & Cloud" class="tool-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">DevOps & Cloud</button>
        <button data-cat="Development" class="tool-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Development</button>
        <button data-cat="AI & Data Science" class="tool-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">AI & Data Science</button>
        <button data-cat="Cybersecurity" class="tool-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cybersecurity</button>
        <button data-cat="Web3 & Blockchain" class="tool-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Web3</button>
      </div>

      <!-- Tools Grid -->
      <div id="tools-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${db.tools.map(tool => `
          <div class="tool-card bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between" data-category="${tool.category}">
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ${tool.category}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">${tool.platform}</span>
              </div>

              <h2 class="text-base font-black text-slate-900">${tool.name}</h2>
              <p class="text-xs text-slate-600 leading-relaxed">${tool.purpose}</p>

              <div class="flex flex-wrap gap-1 pt-1">
                ${tool.tags.map(tag => `
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">${tag}</span>
                `).join('')}
              </div>
            </div>

            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-400 font-medium">Free / Open Source</span>
              <a href="${tool.url}" target="_blank" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors">
                Get Software ↗
              </a>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

export function attachToolsDirectoryEvents() {
  document.querySelectorAll(".tool-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tool-filter-btn").forEach(b => {
        b.className = "tool-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "tool-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      const cat = btn.dataset.cat;
      document.querySelectorAll(".tool-card").forEach(card => {
        card.style.display = (cat === "all" || card.dataset.category === cat) ? "flex" : "none";
      });
    });
  });
}
