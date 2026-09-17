                <h2 class="text-base font-bold text-slate-900 leading-snug">${tool.name}</h2>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">Platform: ${tool.platform}</div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">${tool.purpose}</p>
              <div class="flex flex-wrap gap-1 pt-1">
                ${tool.tags.map(t => `<span class="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-medium font-mono">${t}</span>`).join('')}
              </div>
            </div>
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
              <a href="#/roadmaps" class="text-xs text-slate-400 hover:text-blue-600 font-medium">View in Roadmap →</a>
              <a href="${tool.url}" target="_blank" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1 shadow-sm">
                <span>Official Site</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
export function attachToolsDirectoryEvents() {
  const searchInput = document.getElementById("tool-search-input");
  function filterCards() {
    const activeCatBtn = document.querySelector(".tool-filter-btn.bg-blue-600");
    const cat = activeCatBtn ? activeCatBtn.dataset.cat : "all";
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    document.querySelectorAll(".tool-card").forEach(card => {
      const matchCat = cat === "all" || card.dataset.category.includes(cat);
      const matchSearch = !q || card.dataset.name.includes(q) || card.textContent.toLowerCase().includes(q);
      card.style.display = (matchCat && matchSearch) ? "flex" : "none";
    });
  }
  document.querySelectorAll(".tool-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tool-filter-btn").forEach(b => {
        b.className = "tool-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "tool-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      filterCards();
    });
  });
  if (searchInput) {
    searchInput.addEventListener("input", filterCards);
  }
}
