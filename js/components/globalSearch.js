// Global Search and Filter Component
// Provides a search bar and category selector for quick navigation across the platform.

export function renderGlobalSearchComponent() {
  return `
    <div class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 px-4">
      <div class="max-w-7xl mx-auto flex flex-wrap gap-4 items-center">
        <!-- Search Bar -->
        <div class="relative flex-1">
          <input 
            type="text" 
            id="global-search-input" 
            placeholder="Search events, projects, or members..." 
            class="w-full bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
          <span class="absolute right-3 top-2.5 text-slate-400">🔍</span>
        </div>

        <!-- Category Filter -->
        <select id="global-category-filter" class="bg-slate-100 border-none rounded-xl px-4 py-2 text-sm cursor-pointer">
          <option value="ALL">All Categories</option>
          <option value="CLUBS">Clubs</option>
          <option value="EVENTS">Events</option>
          <option value="PROJECTS">Projects</option>
        </select>
      </div>
    </div>
  `;
}

export function attachGlobalSearchEvents() {
  const searchInput = document.getElementById('global-search-input');
  const filterSelect = document.getElementById('global-category-filter');

  searchInput?.addEventListener('input', performSearch);
  filterSelect?.addEventListener('change', performSearch);
}

function performSearch() {
  const query = document.getElementById('global-search-input').value.toLowerCase();
  const category = document.getElementById('global-category-filter').value;
  
  // Custom event to signal search update to other components
  window.dispatchEvent(new CustomEvent('global-search', { 
    detail: { query, category } 
  }));
}
