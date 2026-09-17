import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { getStudentEventPrediction, getEventParticipationPrediction } from '../intelligenceEngine.js';

/**
 * Centralized Event Dashboard Component
 * Lists upcoming technical society events with robust filtering options by club category,
 * specific technical society, event format, timeline, and search keywords.
 */

// Category metadata for styling and contextual descriptions
export const CLUB_CATEGORIES = {
  ALL: {
    id: "ALL",
    name: "All Categories",
    icon: "⚡",
    description: "Displaying technical events across all 35 official technical societies and student clubs at Pragati Engineering College.",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300"
  },
  INDUSTRY_4_0: {
    id: "Industry 4.0",
    name: "Industry 4.0",
    icon: "🚀",
    description: "Cutting-edge technical societies dedicated to Autonomous Systems, AI/ML, Cloud Native, IoT, AR/VR, Cyber Security, and Green Infrastructure.",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200"
  },
  CO_CURRICULAR: {
    id: "Co-Curricular",
    name: "Co-Curricular",
    icon: "🏛️",
    description: "Departmental academic chapters, renewable energy networks, hydrological sensor groups, and digital community empowerment initiatives.",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  EXTRA_CURRICULAR: {
    id: "Extra-Curricular",
    name: "Extra-Curricular",
    icon: "🌐",
    description: "Professional societies, software development clubs (Pragsoft), Metaverse labs, IETE/IEI chapters, and autonomous automotive engineering.",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200"
  }
};

/**
 * Helper to normalize category strings
 */
export function normalizeCategory(cat) {
  if (!cat) return "ALL";
  const c = cat.toLowerCase().trim();
  if (c === "all") return "ALL";
  if (c.includes("industry") || c.includes("i4")) return "Industry 4.0";
  if (c.includes("co-curricular") || c.includes("cocurricular") || c.includes("co_curricular") || c === "cc") return "Co-Curricular";
  if (c.includes("extra") || c.includes("extracurricular") || c.includes("extra_curricular") || c === "ec") return "Extra-Curricular";
  return cat;
}

/**
 * Helper to escape HTML characters in user input strings
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Filter events based on criteria
 */
export function filterTechnicalEvents(events, clubs, filters = {}) {
  const {
    category = "ALL",
    clubId = "ALL",
    eventType = "ALL",
    searchQuery = "",
    timeline = "ALL",
    sortBy = "date-asc",
    onlyUpcoming = true
  } = filters;

  const todayStr = new Date().toISOString().split("T")[0];

  return events.filter(evt => {
    const club = clubs.find(c => c.id === (evt.club_id || evt.clubId));
    const clubCategory = club?.category || "Industry 4.0";

    // 1. Only upcoming events filter
    if (onlyUpcoming) {
      const isUpcoming = (evt.status === "Upcoming" || evt.date >= todayStr);
      if (!isUpcoming && evt.status === "Completed") return false;
    }

    // 2. Club Category filter (Core Requirement)
    if (category && category !== "ALL") {
      const normSelected = normalizeCategory(category);
      const normClubCat = normalizeCategory(clubCategory);
      if (normSelected !== "ALL" && normClubCat !== normSelected) {
        return false;
      }
    }

    // 3. Specific Club filter
    if (clubId && clubId !== "ALL") {
      const eClubId = evt.club_id || evt.clubId;
      if (eClubId !== clubId) return false;
    }

    // 4. Event Format / Type filter
    if (eventType && eventType !== "ALL") {
      const eType = (evt.event_type || evt.category || "").toLowerCase();
      if (!eType.includes(eventType.toLowerCase())) return false;
    }

    // 5. Timeline filter
    if (timeline === "week") {
      const eventDate = new Date(evt.date);
      const now = new Date();
      const in7Days = new Date();
      in7Days.setDate(now.getDate() + 7);
      if (eventDate < now || eventDate > in7Days) return false;
    } else if (timeline === "month") {
      const eventDate = new Date(evt.date);
      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(now.getDate() + 30);
      if (eventDate < now || eventDate > in30Days) return false;
    }

    // 6. Search query (matches event name or club organizer)
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const words = q.split(/\s+/).filter(Boolean);

      const eventTitle = (evt.title || evt.name || "").toLowerCase();
      const clubName = (club?.name || "").toLowerCase();
      const clubId = (club?.id || evt.club_id || evt.clubId || "").toLowerCase();
      const clubDept = (club?.department || "").toLowerCase();
      const clubCat = (club?.category || "").toLowerCase();
      const coordinator = (club?.facultyCoordinator || club?.faculty_coordinator || club?.lead || "").toLowerCase();
      const createdBy = (evt.created_by || evt.coordinator || evt.faculty_coordinator || evt.student_coordinator || evt.organizer || evt.club_name || "").toLowerCase();
      const venue = (evt.venue || "").toLowerCase();
      const desc = (evt.description || "").toLowerCase();
      const eventType = (evt.event_type || evt.category || "").toLowerCase();
      const tags = Array.isArray(evt.tags) ? evt.tags.join(" ").toLowerCase() : "";

      const searchableText = `${eventTitle} ${clubName} ${clubId} ${clubDept} ${clubCat} ${coordinator} ${createdBy} ${venue} ${desc} ${eventType} ${tags}`;

      const allWordsMatch = words.every(word => searchableText.includes(word));
      if (!allWordsMatch) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "date-asc") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === "date-desc") {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === "popularity") {
      const aSlots = a.registeredCount || a.registered_count || 0;
      const bSlots = b.registeredCount || b.registered_count || 0;
      return bSlots - aSlots;
    } else if (sortBy === "capacity") {
      const aCap = a.capacity || a.max_participants || 0;
      const bCap = b.capacity || b.max_participants || 0;
      return bCap - aCap;
    } else if (sortBy === "title") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return 0;
  });
}

/**
 * Render the Centralized Event Dashboard HTML
 */
export function renderEventDashboard(options = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const isFacultyOrAdmin = ["Faculty Coordinator", "Department Admin", "Super Admin", "Club Admin"].includes(user.role);

  const activeCategory = normalizeCategory(options.defaultCategory || options.initialCategory || options.category || "ALL");
  const activeClubId = options.defaultClubId || options.initialClubId || options.clubId || "ALL";
  const activeFormat = options.defaultFormat || options.initialFormat || options.format || options.eventType || "ALL";
  const activeViewMode = options.viewMode || "grid"; // 'grid' or 'list'

  const allEvents = db.events || [];
  const allClubs = db.clubs || [];
  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate high-level summary metrics
  const upcomingEvents = allEvents.filter(e => e.status === "Upcoming" || e.date >= todayStr);
  const totalUpcomingCount = upcomingEvents.length;
  
  // Calculate counts per category
  const categoryCounts = {
    ALL: totalUpcomingCount,
    "Industry 4.0": 0,
    "Co-Curricular": 0,
    "Extra-Curricular": 0
  };

  upcomingEvents.forEach(e => {
    const club = allClubs.find(c => c.id === (e.club_id || e.clubId));
    const cat = club?.category;
    if (cat && categoryCounts[cat] !== undefined) {
      categoryCounts[cat]++;
    }
  });

  const participatingSocietiesCount = new Set(upcomingEvents.map(e => e.club_id || e.clubId)).size;
  const totalSlotsOpen = upcomingEvents.reduce((acc, e) => {
    const cap = e.capacity || e.max_participants || 100;
    const reg = e.registeredCount || e.registered_count || 0;
    return acc + Math.max(0, cap - reg);
  }, 0);

  const myRegisteredCount = upcomingEvents.filter(e => {
    return (e.registrations || []).some(r => r.studentId === user.id || r.student_id === user.id);
  }).length;

  // Filter events initially according to options
  const filteredEvents = filterTechnicalEvents(allEvents, allClubs, {
    category: activeCategory,
    onlyUpcoming: true,
    sortBy: "date-asc"
  });

  return `
    <div id="central-event-dashboard" class="space-y-6">

      <!-- Executive Header with Actions -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Pragati University CCTSC
              </span>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
                Accredited Student Technical Activities
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Technical Society Events Hub
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Centralized platform for official hackathons, hands-on bootcamps, coding leagues, and symposiums hosted by 35 recognized technical societies across Industry 4.0, Co-Curricular, and Extra-Curricular branches.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <a href="#/calendar" class="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-md shadow-indigo-600/30">
              <span>📅</span>
              <span>Interactive Calendar Grid</span>
            </a>
            <a href="#/attendance" class="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border border-slate-700 shadow-sm">
              <span>📷</span>
              <span>QR Attendance Kiosk</span>
            </a>
            <a href="#/event-poster" class="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm">
              <span>🎨</span>
              <span>Poster Studio</span>
            </a>
            ${isFacultyOrAdmin ? `
              <button id="dashboard-create-event-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5">
                <span>+</span>
                <span>Host Society Event</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Metric KPI Strip -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <div class="p-3 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/60">
            <div class="text-[11px] font-semibold text-slate-400">Upcoming Events</div>
            <div class="text-2xl font-black text-white mt-0.5" id="metric-upcoming-count">${totalUpcomingCount}</div>
            <div class="text-[10px] text-blue-400 font-medium mt-0.5">Across all departments</div>
          </div>
          <div class="p-3 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/60">
            <div class="text-[11px] font-semibold text-slate-400">Active Societies</div>
            <div class="text-2xl font-black text-white mt-0.5">${participatingSocietiesCount} / 35</div>
            <div class="text-[10px] text-emerald-400 font-medium mt-0.5">Official PEC chapters</div>
          </div>
          <div class="p-3 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/60">
            <div class="text-[11px] font-semibold text-slate-400">Available Slots</div>
            <div class="text-2xl font-black text-white mt-0.5">${totalSlotsOpen}</div>
            <div class="text-[10px] text-amber-400 font-medium mt-0.5">Open for registration</div>
          </div>
          <div class="p-3 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/60">
            <div class="text-[11px] font-semibold text-slate-400">My Confirmed Passes</div>
            <div class="text-2xl font-black text-emerald-400 mt-0.5">${myRegisteredCount}</div>
            <div class="text-[10px] text-slate-400 font-medium mt-0.5">Active QR tickets</div>
          </div>
        </div>
      </div>

      <!-- Centralized Search Bar: Find by Event Name or Club Organizer -->
      <div class="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3" id="dashboard-search-section">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">🔍</span>
              <span>Find Events & Technical Societies</span>
            </h2>
            <p class="text-xs text-slate-500">Search upcoming events by event title or club organizer (e.g. Robotics Club, AI Club, Pragsoft)</p>
          </div>
          <div id="search-results-pill" class="${options.searchQuery ? 'flex' : 'hidden'} text-xs font-medium text-slate-600 bg-blue-50/80 px-3 py-1.5 rounded-xl border border-blue-200/80 items-center space-x-1.5 self-start sm:self-auto">
            <span>Found</span>
            <strong id="search-match-count" class="font-mono font-bold text-blue-700">${filteredEvents.length}</strong>
            <span>matching events</span>
            <button id="quick-clear-search-btn" class="text-xs text-blue-400 hover:text-blue-800 ml-1 font-bold" title="Clear search">✕</button>
          </div>
        </div>

        <!-- Main Search Input Bar with Controls -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            type="text" 
            id="event-search-input" 
            placeholder="Search events by name (e.g., Turing AI, ROS Workshop) or club organizer (e.g., Robotics Club, AI Club, Pragsoft)..." 
            class="w-full pl-11 pr-24 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-inner"
            autocomplete="off"
            value="${escapeHtml(options.searchQuery || '')}"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1.5">
            <button 
              id="clear-search-btn" 
              type="button" 
              class="${options.searchQuery ? '' : 'hidden'} p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all text-xs" 
              title="Clear search query"
            >
              <span class="font-bold text-sm leading-none">✕</span>
            </button>
            <kbd class="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold bg-white text-slate-400 rounded-lg border border-slate-200 shadow-xs">
              / to focus
            </kbd>
          </div>
        </div>

        <!-- Quick Filter Presets / Suggested Club & Keyword Chips -->
        <div class="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
          <span class="font-bold text-slate-400 mr-1 text-[10px] uppercase tracking-wider">Quick search:</span>
          <button type="button" class="search-preset-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 font-medium transition-all" data-query="Robotics Club">
            🤖 Robotics Club
          </button>
          <button type="button" class="search-preset-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 font-medium transition-all" data-query="Artificial Intelligence Club">
            🧠 AI Club
          </button>
          <button type="button" class="search-preset-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 font-medium transition-all" data-query="Pragsoft">
            💻 Pragsoft
          </button>
          <button type="button" class="search-preset-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 font-medium transition-all" data-query="Cyber Security">
            🛡️ Cyber Security
          </button>
          <button type="button" class="search-preset-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 font-medium transition-all" data-query="Turing AI">
            ⚡ Turing AI
          </button>
          <button type="button" class="search-preset-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 font-medium transition-all" data-query="Clean Energy">
            🌱 Clean Energy
          </button>
        </div>
      </div>

      <!-- Core Club Category Filter Strip (Primary Requirement) -->
      <div class="space-y-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <span>🏛️</span>
              <span>Filter Events by Club Category</span>
            </h2>
            <p class="text-xs text-slate-500">Filter technical events by their official institutional classification</p>
          </div>
          <div class="text-[11px] font-mono text-slate-500">
            Showing <strong id="filter-result-count" class="text-blue-600 font-bold">${filteredEvents.length}</strong> events
          </div>
        </div>

        <!-- Category Filter Tabs -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold" id="category-filter-tabs">
          <button data-category="ALL" class="category-tab-btn px-3.5 py-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${activeCategory === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}">
            <div class="flex items-center justify-between">
              <span class="text-sm">⚡</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}">${categoryCounts.ALL}</span>
            </div>
            <div class="mt-2">
              <div class="font-bold text-xs leading-tight">All Categories</div>
              <div class="text-[10px] font-normal opacity-80 mt-0.5">All 35 PEC Clubs</div>
            </div>
          </button>

          <button data-category="Industry 4.0" class="category-tab-btn px-3.5 py-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${activeCategory === 'Industry 4.0' ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}">
            <div class="flex items-center justify-between">
              <span class="text-sm">🚀</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeCategory === 'Industry 4.0' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}">${categoryCounts['Industry 4.0']}</span>
            </div>
            <div class="mt-2">
              <div class="font-bold text-xs leading-tight">Industry 4.0</div>
              <div class="text-[10px] font-normal opacity-80 mt-0.5">AI, Cloud, Cyber, Robotics</div>
            </div>
          </button>

          <button data-category="Co-Curricular" class="category-tab-btn px-3.5 py-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${activeCategory === 'Co-Curricular' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}">
            <div class="flex items-center justify-between">
              <span class="text-sm">🏛️</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeCategory === 'Co-Curricular' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}">${categoryCounts['Co-Curricular']}</span>
            </div>
            <div class="mt-2">
              <div class="font-bold text-xs leading-tight">Co-Curricular</div>
              <div class="text-[10px] font-normal opacity-80 mt-0.5">Energy, Water, Social Impact</div>
            </div>
          </button>

          <button data-category="Extra-Curricular" class="category-tab-btn px-3.5 py-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${activeCategory === 'Extra-Curricular' ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-600/20' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}">
            <div class="flex items-center justify-between">
              <span class="text-sm">🌐</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeCategory === 'Extra-Curricular' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}">${categoryCounts['Extra-Curricular']}</span>
            </div>
            <div class="mt-2">
              <div class="font-bold text-xs leading-tight">Extra-Curricular</div>
              <div class="text-[10px] font-normal opacity-80 mt-0.5">Pragsoft, Metaverse, IETE</div>
            </div>
          </button>
        </div>

        <!-- Active Category Context Description Banner -->
        <div id="category-description-banner" class="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div class="flex items-center space-x-2">
            <span id="category-icon" class="text-base">${CLUB_CATEGORIES.ALL.icon}</span>
            <span id="category-desc-text" class="font-medium">${CLUB_CATEGORIES.ALL.description}</span>
          </div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Official PEC Categorization</span>
        </div>
      </div>

      <!-- Secondary Society & Granular Filter Toolbar -->
      <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">

          <!-- Specific Society / Club Selector (4 cols) -->
          <div class="lg:col-span-4">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Technical Society</label>
            <select 
              id="event-club-select" 
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">All Technical Societies</option>
              ${allClubs.map(c => `
                <option value="${c.id}" data-category="${c.category}">
                  [${c.category.substring(0, 3)}] ${c.name} (${c.department})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Event Type / Format Filter (3 cols) -->
          <div class="lg:col-span-3">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Event Format</label>
            <select 
              id="event-format-select" 
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">All Event Formats</option>
              <option value="Hackathon">Hackathons</option>
              <option value="Workshop">Workshops</option>
              <option value="Competition">Competitions / CTFs</option>
              <option value="Bootcamp">Bootcamps</option>
              <option value="Technical Session">Technical Symposia</option>
            </select>
          </div>

          <!-- Sort Order (3 cols) -->
          <div class="lg:col-span-3">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sort Order</label>
            <select 
              id="event-sort-select" 
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="date-asc">Date: Soonest First</option>
              <option value="date-desc">Date: Furthest First</option>
              <option value="popularity">Most Registered</option>
              <option value="capacity">Largest Capacity</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

          <!-- View Mode Toggle (2 cols) -->
          <div class="lg:col-span-2 flex flex-col justify-end">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">View Layout</label>
            <div class="flex items-center space-x-1.5">
              <button 
                id="toggle-view-grid" 
                class="flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1 ${activeViewMode === 'grid' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}" 
                title="Grid Cards View"
              >
                <span>⊞</span>
                <span class="text-[11px]">Grid</span>
              </button>
              <button 
                id="toggle-view-list" 
                class="flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1 ${activeViewMode === 'list' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}" 
                title="Timetable Table View"
              >
                <span>☰</span>
                <span class="text-[11px]">Table</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Active Filter Tags & Reset -->
        <div id="active-filters-row" class="hidden flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span class="text-slate-400 font-medium">Applied Filters:</span>
          <div id="active-filter-chips" class="flex flex-wrap items-center gap-1.5"></div>
          <button id="reset-filters-btn" class="text-blue-600 hover:text-blue-700 font-bold ml-auto text-[11px]">
            Reset All Filters
          </button>
        </div>
      </div>

      <!-- Events Presentation Container (Grid or List) -->
      <div id="events-display-container">
        ${renderEventsPresentation(filteredEvents, allClubs, user, activeViewMode, options)}
      </div>

      <!-- Modals for QR Passes, Circulars, and Dossiers -->
      ${renderEventDashboardModals(allClubs)}

    </div>
  `;
}

/**
 * Render Events Display: Grid or Timetable List
 */
export function renderEventsPresentation(events, clubs, user, viewMode = "grid", filters = {}) {
  const searchQuery = (filters.searchQuery || "").trim();

  if (!events || events.length === 0) {
    if (searchQuery) {
      return `
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-bold text-slate-800">No Events Found for "${escapeHtml(searchQuery)}"</h3>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find any events matching "<strong>${escapeHtml(searchQuery)}</strong>" by event name or club organizer. Try checking for spelling errors or clearing your search.
            </p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-2">
            <button id="empty-clear-search-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
              Clear Search Query
            </button>
            <button id="empty-reset-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all">
              Reset All Filters
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
        <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
          📅
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-bold text-slate-800">No Technical Events Found</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            No upcoming events match your selected club category and search criteria. Try choosing another category or resetting the filters.
          </p>
        </div>
        <button id="empty-reset-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
          Reset Filter Options
        </button>
      </div>
    `;
  }

  const content = (viewMode === "list")
    ? renderTimetableListView(events, clubs, user)
    : renderCardGridView(events, clubs, user);

  if (searchQuery) {
    return `
      <div class="space-y-4">
        <div class="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-900 shadow-xs">
          <div class="flex items-center space-x-2">
            <span class="text-base">🔍</span>
            <span>
              Showing <strong>${events.length}</strong> event${events.length === 1 ? '' : 's'} matching "<strong>${escapeHtml(searchQuery)}</strong>" by name or club organizer
            </span>
          </div>
          <button id="banner-clear-search-btn" class="text-blue-700 hover:text-blue-900 font-bold underline text-[11px] self-start sm:self-auto">
            Clear search
          </button>
        </div>
        ${content}
      </div>
    `;
  }

  return content;
}

/**
 * Card Grid View Renderer
 */
function renderCardGridView(events, clubs, user) {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${events.map(evt => {
        const club = clubs.find(c => c.id === (evt.club_id || evt.clubId));
        const clubCategory = club?.category || "Industry 4.0";
        const isRegistered = (evt.registrations || []).some(r => r.studentId === user.id || r.student_id === user.id);
        const isWaitlisted = (evt.waitlist || []).some(w => w.studentId === user.id);
        const cap = evt.capacity || evt.max_participants || 100;
        const regCount = evt.registeredCount || evt.registered_count || (evt.registrations || []).length;
        const isFull = regCount >= cap;
        const userReg = (evt.registrations || []).find(r => r.studentId === user.id || r.student_id === user.id);
        const pct = Math.min(100, Math.round((regCount / cap) * 100));

        // Category-specific pill styling
        const catConfig = CLUB_CATEGORIES[clubCategory.toUpperCase().replace(/[^A-Z0-9]/g, '_')] || CLUB_CATEGORIES.INDUSTRY_4_0;

        return `
          <div class="event-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between" data-event-id="${evt.id}" data-category="${clubCategory}">
            
            <!-- Card Header & Banner -->
            <div>
              <div class="relative h-44 overflow-hidden bg-slate-900">
                <img src="${evt.banner || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'}" class="w-full h-full object-cover opacity-85 transition-transform duration-300 hover:scale-105" alt="${evt.title}" />
                
                <!-- Category Badge -->
                <div class="absolute top-3 left-3 flex items-center space-x-1.5">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md bg-slate-900/80 text-white border border-white/10 shadow-sm flex items-center space-x-1">
                    <span>${catConfig.icon || '⚡'}</span>
                    <span>${clubCategory}</span>
                  </span>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                    ${evt.category || evt.event_type || 'Event'}
                  </span>
                </div>

                <!-- Slot Fill Status Badge -->
                <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${isFull ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}">
                  ${regCount}/${cap} Slots
                </span>

                <!-- Date Ribbon -->
                <div class="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white backdrop-blur-sm text-[11px] font-mono font-semibold flex items-center space-x-1.5">
                  <span>📅</span>
                  <span>${evt.date}</span>
                </div>
              </div>

              <!-- Card Content Details -->
              <div class="p-5 space-y-3">
                
                <!-- Organizing Society & Department -->
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-blue-700 font-extrabold tracking-tight truncate max-w-[190px]" title="${club ? club.name : 'Technical Society'}">
                    ${club ? club.name : 'Pragati Technical Society'}
                  </span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                    Dept: ${club?.department || 'PEC'}
                  </span>
                </div>

                <!-- Event Title -->
                <h3 class="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  ${evt.title}
                </h3>

                <!-- Key Logistics -->
                <div class="text-xs text-slate-500 space-y-1 font-mono">
                  <div class="flex items-center space-x-1.5">
                    <span>⏰</span>
                    <span>${evt.time || `${evt.start_time || '09:00'} - ${evt.end_time || '17:00'}`}</span>
                  </div>
                  <div class="flex items-center space-x-1.5 truncate">
                    <span>📍</span>
                    <span class="truncate">${evt.venue || 'PEC Central Auditorium'}</span>
                  </div>
                </div>

                <!-- Description -->
                <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                  ${evt.description || 'Hands-on technical session designed for student skill mastery.'}
                </p>

                <!-- Tags / Focus Areas -->
                ${Array.isArray(evt.tags) && evt.tags.length > 0 ? `
                  <div class="flex flex-wrap gap-1 pt-1">
                    ${evt.tags.slice(0, 3).map(tag => `
                      <span class="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                        #${tag}
                      </span>
                    `).join('')}
                  </div>
                ` : ''}

                <!-- Capacity Progress Bar -->
                <div class="space-y-1 pt-1">
                  <div class="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Capacity Fill</span>
                    <span class="font-mono font-bold ${pct >= 90 ? 'text-rose-600' : 'text-slate-700'}">${pct}% (${regCount}/${cap})</span>
                  </div>
                  <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500 ${pct >= 95 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${pct}%"></div>
                  </div>
                </div>

                <!-- AI Fit / Participation Prediction (Intelligence Engine) -->
                ${user.role === 'Student' ? (() => {
                  const pred = getStudentEventPrediction(user.id, evt.id, getDB());
                  const prob = pred ? pred.participationProbability : 82;
                  const reason = pred?.contributingFactors?.[0] || 'Technical skill alignment';
                  return `
                    <div class="p-2 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-between text-[11px]">
                      <span class="text-purple-900 font-bold flex items-center space-x-1">
                        <span>🤖</span>
                        <span>AI Match: <strong class="font-mono text-purple-700">${prob}%</strong></span>
                      </span>
                      <span class="text-slate-500 text-[10px] truncate max-w-[140px] font-medium" title="${reason}">${reason}</span>
                    </div>
                  `;
                })() : (() => {
                  const pred = getEventParticipationPrediction(evt.id, getDB());
                  const turnout = pred ? pred.predictedTurnoutRate : 85;
                  return `
                    <div class="p-2 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between text-[11px]">
                      <span class="text-indigo-900 font-bold flex items-center space-x-1">
                        <span>📊</span>
                        <span>Est. Turnout: <strong class="font-mono text-indigo-700">${turnout}%</strong></span>
                      </span>
                      <span class="text-slate-500 text-[10px] font-mono">CCTSC Intelligence</span>
                    </div>
                  `;
                })()}

              </div>
            </div>

            <!-- Card Bottom Interactive Controls -->
            <div class="p-5 pt-0 space-y-2.5">
              
              <!-- Registration / Pass Status Action -->
              ${isRegistered ? `
                <div class="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <div class="font-bold text-emerald-800 flex items-center space-x-1">
                      <span>✓</span>
                      <span>Pass Confirmed</span>
                    </div>
                    <div class="text-[10px] text-emerald-600 font-mono">Pass: ${userReg?.ticketId || userReg?.ticket_id || 'TCK-PEC-2026'}</div>
                  </div>
                  <button 
                    class="dashboard-view-ticket-btn px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-sm transition-colors"
                    data-ticket="${userReg?.ticketId || userReg?.ticket_id || 'TCK-PEC-2026'}"
                    data-title="${evt.title}"
                    data-name="${user.name || 'PEC Student'}"
                    data-roll="${user.rollNo || user.roll_no || '22CS101'}"
                    data-club="${club ? club.name : 'Technical Society'}"
                    data-date="${evt.date}"
                    data-venue="${evt.venue}"
                  >
                    View QR Pass
                  </button>
                </div>
              ` : isWaitlisted ? `
                <div class="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                  <div>
                    <div class="font-bold text-amber-800">⏳ Waitlist Position</div>
                    <div class="text-[10px] text-amber-600">Queue #${(evt.waitlist || []).findIndex(w => w.studentId === user.id) + 1} • Auto-promoted on drop</div>
                  </div>
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-200 text-amber-900 font-mono">Queued</span>
                </div>
              ` : `
                ${isFull ? `
                  <button data-eventid="${evt.id}" class="dashboard-waitlist-btn w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5">
                    <span>⏳</span>
                    <span>Join Waitlist (${cap} Capacity Filled)</span>
                  </button>
                ` : `
                  <button data-eventid="${evt.id}" class="dashboard-register-btn w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5">
                    <span>⚡</span>
                    <span>Register for Event</span>
                  </button>
                `}
              `}

              <!-- Secondary Utility Actions (Circular, Dossier, Calendar, Poster) -->
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <button data-eventid="${evt.id}" class="dashboard-open-circular-btn hover:text-blue-600 transition-colors flex items-center space-x-1" title="Generate Official College Circular Notice">
                  <span>📄</span>
                  <span class="text-[11px]">Circular</span>
                </button>

                <button data-eventid="${evt.id}" class="dashboard-open-dossier-btn hover:text-indigo-600 transition-colors flex items-center space-x-1" title="View Full Curriculum & Rules">
                  <span>📊</span>
                  <span class="text-[11px]">Dossier</span>
                </button>

                <button data-eventid="${evt.id}" class="dashboard-add-cal-btn hover:text-emerald-600 transition-colors flex items-center space-x-1" title="Export .ics Calendar Event">
                  <span>📅</span>
                  <span class="text-[11px]">Calendar</span>
                </button>

                <a href="#/poster?id=${evt.id}" class="text-blue-600 hover:text-blue-700 flex items-center space-x-0.5 font-bold" title="Generate and Download Promotional Poster">
                  <span class="text-[11px]">Poster</span>
                  <span>↗</span>
                </a>
              </div>

            </div>

          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Timetable List View Renderer
 */
function renderTimetableListView(events, clubs, user) {
  return `
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3 px-4">Date & Time</th>
              <th class="py-3 px-4">Technical Society</th>
              <th class="py-3 px-4">Event Details</th>
              <th class="py-3 px-4">Category</th>
              <th class="py-3 px-4">Slots</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${events.map(evt => {
              const club = clubs.find(c => c.id === (evt.club_id || evt.clubId));
              const clubCategory = club?.category || "Industry 4.0";
              const isRegistered = (evt.registrations || []).some(r => r.studentId === user.id || r.student_id === user.id);
              const cap = evt.capacity || evt.max_participants || 100;
              const regCount = evt.registeredCount || evt.registered_count || (evt.registrations || []).length;
              const isFull = regCount >= cap;
              const userReg = (evt.registrations || []).find(r => r.studentId === user.id || r.student_id === user.id);

              return `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <!-- Date & Time -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <div class="font-bold text-slate-900 font-mono">${evt.date}</div>
                    <div class="text-[11px] text-slate-500 font-mono">${evt.time || evt.start_time || '09:00'}</div>
                  </td>

                  <!-- Society & Dept -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <div class="font-bold text-slate-800">${club ? club.name : 'Technical Society'}</div>
                    <div class="text-[10px] text-slate-500 font-mono">Dept of ${club?.department || 'PEC'}</div>
                  </td>

                  <!-- Title & Venue -->
                  <td class="py-3.5 px-4 max-w-xs">
                    <div class="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer dashboard-open-dossier-btn" data-eventid="${evt.id}">
                      ${evt.title}
                    </div>
                    <div class="text-[11px] text-slate-500 truncate flex items-center space-x-1 mt-0.5">
                      <span>📍</span>
                      <span class="truncate">${evt.venue}</span>
                    </div>
                  </td>

                  <!-- Club Category -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${clubCategory === 'Industry 4.0' ? 'bg-blue-50 text-blue-700 border border-blue-200' : clubCategory === 'Co-Curricular' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}">
                      ${clubCategory}
                    </span>
                  </td>

                  <!-- Capacity Slots -->
                  <td class="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                    <span class="font-bold ${isFull ? 'text-rose-600' : 'text-slate-800'}">${regCount}/${cap}</span>
                    <div class="text-[10px] ${isFull ? 'text-rose-500' : 'text-emerald-600'} font-semibold">
                      ${isFull ? 'Waitlist' : `${cap - regCount} open`}
                    </div>
                  </td>

                  <!-- Action Buttons -->
                  <td class="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                    ${isRegistered ? `
                      <button 
                        class="dashboard-view-ticket-btn px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
                        data-ticket="${userReg?.ticketId || userReg?.ticket_id || 'TCK-PEC-2026'}"
                        data-title="${evt.title}"
                        data-name="${user.name || 'PEC Student'}"
                        data-roll="${user.rollNo || user.roll_no || '22CS101'}"
                        data-club="${club ? club.name : 'Technical Society'}"
                        data-date="${evt.date}"
                        data-venue="${evt.venue}"
                      >
                        QR Pass
                      </button>
                    ` : `
                      <button 
                        data-eventid="${evt.id}" 
                        class="${isFull ? 'dashboard-waitlist-btn bg-amber-600 hover:bg-amber-500' : 'dashboard-register-btn bg-blue-600 hover:bg-blue-500'} px-3 py-1.5 text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
                      >
                        ${isFull ? 'Waitlist' : 'Register'}
                      </button>
                    `}
                    <button data-eventid="${evt.id}" class="dashboard-open-circular-btn p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors" title="Official Circular">
                      📄
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Modals Template: QR Ticket Pass, Circular Notice, Dossier, and Host Event
 */
function renderEventDashboardModals(clubs) {
  return `
    <!-- Ticket QR Pass Modal -->
    <div id="dashboard-ticket-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Gate Pass</span>
          <button id="dashboard-close-ticket-modal" class="text-slate-400 hover:text-slate-600 p-1">✕</button>
        </div>
        
        <div id="dashboard-modal-qr-box" class="flex justify-center my-3 bg-white p-2 rounded-xl shadow-inner inline-block mx-auto"></div>
        
        <div>
          <div id="dashboard-ticket-event-title" class="font-black text-slate-900 text-sm"></div>
          <div id="dashboard-ticket-id-display" class="text-xs text-blue-600 font-mono font-bold mt-1"></div>
          <div id="dashboard-ticket-student-display" class="text-xs text-slate-500 mt-0.5"></div>
          <div id="dashboard-ticket-meta-display" class="text-[11px] text-slate-400 mt-1 font-mono"></div>
        </div>

        <div class="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          Present this barcode/QR at the venue entry kiosk for instant verified attendance recording.
        </div>
      </div>
    </div>

    <!-- Official Institutional Circular Modal -->
    <div id="dashboard-circular-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Institutional Circular Generator</span>
          <div class="flex items-center space-x-2">
            <button id="dashboard-print-circular-btn" class="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
              🖨️ Print Notice
            </button>
            <button id="dashboard-close-circular-modal" class="text-slate-400 hover:text-slate-600 p-1">✕</button>
          </div>
        </div>

        <!-- Printable Document Frame -->
        <div id="dashboard-circular-document" class="p-6 sm:p-8 border-2 border-slate-900 rounded-2xl bg-white space-y-5 text-slate-900 text-xs font-sans">
          
          <!-- Institutional Header -->
          <div class="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h2 class="text-base sm:text-lg font-black tracking-wide uppercase">Pragati Engineering College</h2>
            <p class="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">An Autonomous Institution, Approved by AICTE, Permanently Affiliated to JNTUK, Kakinada</p>
            <p class="text-[10px] text-slate-500 font-mono">1-378, ADB Road, Surampalem, Near Peddapuram, Kakinada District, Andhra Pradesh - 533437</p>
            <div class="inline-block px-3 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded-full mt-1">
              CENTRAL COUNCIL OF TECHNICAL SOCIETIES (CCTSC)
            </div>
          </div>

          <!-- Dispatch & Date Row -->
          <div class="flex justify-between items-center font-mono text-[11px] text-slate-700">
            <span id="dashboard-circ-ref">Ref: PEC/CCTSC/2026/CIRCULAR-</span>
            <span id="dashboard-circ-date">Date: </span>
          </div>

          <!-- Title Banner -->
          <div class="text-center py-2 bg-slate-100 rounded-xl font-bold text-sm uppercase tracking-wide">
            OFFICIAL CIRCULAR / TECHNICAL SYMPOSIUM ANNOUNCEMENT
          </div>

          <div class="space-y-3 leading-relaxed text-slate-700">
            <p>
              This is to inform all heads of departments, faculty members, and students that the
              <strong id="dashboard-circ-club" class="text-slate-900 font-bold">Technical Society</strong>,
              under the aegis of the Department of <strong id="dashboard-circ-dept" class="text-slate-900 font-bold">Computer Science</strong>,
              is organizing the following accredited technical program:
            </p>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-sans">
              <div class="flex justify-between"><strong class="text-slate-900">Event Title:</strong> <span id="dashboard-circ-title" class="font-bold text-blue-700"></span></div>
              <div class="flex justify-between"><strong class="text-slate-900">Category / Society Branch:</strong> <span id="dashboard-circ-category" class="font-semibold text-slate-800"></span></div>
              <div class="flex justify-between"><strong class="text-slate-900">Date & Timing:</strong> <span id="dashboard-circ-time"></span></div>
              <div class="flex justify-between"><strong class="text-slate-900">Venue:</strong> <span id="dashboard-circ-venue"></span></div>
              <div class="flex justify-between"><strong class="text-slate-900">Target Eligibility:</strong> <span>B.Tech Undergraduates (All Branches & Semesters)</span></div>
              <div class="flex justify-between"><strong class="text-slate-900">Accreditation Mapping:</strong> <span>NBA Criterion 9 / NAAC Criteria 5 (Student Support & Progression)</span></div>
            </div>

            <p id="dashboard-circ-desc" class="text-justify leading-relaxed"></p>
            <p>All interested students are directed to register through the <strong>CampusTech PEC Portal</strong>. Gate passes with verification QR codes will be generated automatically upon confirmed enrollment.</p>
          </div>

          <!-- Signatures -->
          <div class="pt-8 flex justify-between items-end border-t border-slate-200 text-center font-serif text-[11px]">
            <div>
              <div class="h-10"></div>
              <div class="font-bold text-slate-900" id="dashboard-circ-coordinator">Faculty Coordinator</div>
              <div class="text-[10px] text-slate-500 font-sans">Organizing Society Convener</div>
            </div>
            <div>
              <div class="h-10"></div>
              <div class="font-bold text-slate-900">Dr. K. Satyanarayana</div>
              <div class="text-[10px] text-slate-500 font-sans">Principal, Pragati Engineering College</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Event Summary Dossier Modal -->
    <div id="dashboard-dossier-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Technical Dossier & Guidelines</span>
          <button id="dashboard-close-dossier-modal" class="text-slate-400 hover:text-slate-600 p-1">✕</button>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <span id="dashboard-dossier-cat-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700"></span>
            <h2 id="dashboard-dossier-title" class="text-lg font-black text-slate-900 mt-2"></h2>
            <div id="dashboard-dossier-society" class="text-xs font-semibold text-slate-500 mt-0.5"></div>
          </div>

          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono text-[11px]">
            <div class="flex justify-between"><span>Date:</span> <strong id="dashboard-dossier-date" class="text-slate-800"></strong></div>
            <div class="flex justify-between"><span>Timing:</span> <strong id="dashboard-dossier-timing" class="text-slate-800"></strong></div>
            <div class="flex justify-between"><span>Venue:</span> <strong id="dashboard-dossier-venue" class="text-slate-800"></strong></div>
            <div class="flex justify-between"><span>Max Capacity:</span> <strong id="dashboard-dossier-capacity" class="text-slate-800"></strong></div>
          </div>

          <div>
            <h4 class="font-bold text-slate-800 mb-1">Executive Summary</h4>
            <p id="dashboard-dossier-desc" class="text-slate-600 leading-relaxed"></p>
          </div>

          <div>
            <h4 class="font-bold text-slate-800 mb-1">Official Participation Rules</h4>
            <ul id="dashboard-dossier-rules" class="list-disc list-inside text-slate-600 space-y-1"></ul>
          </div>

          <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button id="dashboard-dossier-close-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Host New Event Modal (Faculty/Admin) -->
    <div id="dashboard-create-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Host Technical Society Event</span>
          <button id="dashboard-close-create-modal" class="text-slate-400 hover:text-slate-600 p-1">✕</button>
        </div>

        <form id="dashboard-create-event-form" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Event Title</label>
            <input type="text" id="create-event-title" required placeholder="e.g. National Hackathon on Generative AI" class="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Organizing Technical Society</label>
              <select id="create-event-club" required class="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white">
                ${clubs.map(c => `<option value="${c.id}">[${c.category}] ${c.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Event Format</label>
              <select id="create-event-format" required class="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white">
                <option value="Hackathon">Hackathon</option>
                <option value="Workshop">Workshop</option>
                <option value="Competition">Competition / CTF</option>
                <option value="Bootcamp">Bootcamp</option>
                <option value="Technical Session">Technical Session</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Event Date</label>
              <input type="date" id="create-event-date" required class="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Timing Duration</label>
              <input type="text" id="create-event-time" required placeholder="09:00 - 17:00" class="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Venue Location</label>
              <input type="text" id="create-event-venue" required placeholder="Central Auditorium" class="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Seat Capacity</label>
              <input type="number" id="create-event-capacity" required min="10" max="500" value="100" class="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Description / Syllabus</label>
            <textarea id="create-event-desc" required rows="3" placeholder="Provide problem statements, topics covered, eligibility, and prize details..." class="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"></textarea>
          </div>

          <div class="pt-2 flex justify-end space-x-2">
            <button type="button" id="dashboard-cancel-create-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md">Publish Event & Circular</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * Generate and download an .ics iCalendar file for standard calendar integration
 */
export function downloadEventICS(evt, club) {
  const title = evt.title || "Technical Event";
  const desc = (evt.description || "").replace(/\n/g, "\\n");
  const venue = evt.venue || "Pragati Engineering College";
  const dateStr = (evt.date || "2026-10-18").replace(/-/g, "");
  
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pragati Engineering College//CampusTech Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:pec-event-${evt.id}@pragati.ac.in`,
    `DTSTAMP:${dateStr}T090000Z`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc} Hosted by ${club ? club.name : 'PEC Technical Society'}.`,
    `LOCATION:${venue}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Calendar Event Exported", "The .ics event pass has been downloaded to your device.", "success");
}

/**
 * Attach Event Listeners to the Centralized Event Dashboard
 */
export function attachEventDashboardEvents(options = {}) {
  const activeCategory = normalizeCategory(options.defaultCategory || options.initialCategory || options.category || "ALL");
  const activeClubId = options.defaultClubId || options.initialClubId || options.clubId || "ALL";
  const activeFormat = options.defaultFormat || options.initialFormat || options.format || options.eventType || "ALL";

  const currentFilters = {
    category: activeCategory,
    clubId: activeClubId,
    eventType: activeFormat,
    searchQuery: options.searchQuery || "",
    timeline: options.timeline || "ALL",
    sortBy: options.sortBy || "date-asc",
    onlyUpcoming: true,
    viewMode: options.viewMode || "grid"
  };

  const displayContainer = document.getElementById("events-display-container");
  const filterCountEl = document.getElementById("filter-result-count");
  const searchInput = document.getElementById("event-search-input");
  const clearSearchBtn = document.getElementById("clear-search-btn");
  const searchResultsPill = document.getElementById("search-results-pill");
  const searchMatchCount = document.getElementById("search-match-count");
  const quickClearSearchBtn = document.getElementById("quick-clear-search-btn");
  const clubSelect = document.getElementById("event-club-select");
  const formatSelect = document.getElementById("event-format-select");
  const sortSelect = document.getElementById("event-sort-select");
  const gridViewBtn = document.getElementById("toggle-view-grid");
  const listViewBtn = document.getElementById("toggle-view-list");
  const descBannerText = document.getElementById("category-desc-text");
  const descBannerIcon = document.getElementById("category-icon");
  const activeFiltersRow = document.getElementById("active-filters-row");
  const activeChipsContainer = document.getElementById("active-filter-chips");
  const resetBtn = document.getElementById("reset-filters-btn");

  // Centralized search clear function
  function clearSearch() {
    currentFilters.searchQuery = "";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    if (clearSearchBtn) {
      clearSearchBtn.classList.add("hidden");
    }
    updateDashboardView();
  }

  // Re-filter and update view
  function updateDashboardView() {
    const db = getDB();
    const user = getCurrentUser() || {};
    const filtered = filterTechnicalEvents(db.events || [], db.clubs || [], currentFilters);

    if (filterCountEl) {
      filterCountEl.textContent = filtered.length;
    }

    // Toggle live search results pill and clear button
    const q = (currentFilters.searchQuery || "").trim();
    if (clearSearchBtn) {
      clearSearchBtn.classList.toggle("hidden", q.length === 0);
    }
    if (searchResultsPill) {
      if (q.length > 0) {
        searchResultsPill.classList.remove("hidden");
        searchResultsPill.classList.add("flex");
        if (searchMatchCount) searchMatchCount.textContent = filtered.length;
      } else {
        searchResultsPill.classList.add("hidden");
        searchResultsPill.classList.remove("flex");
      }
    }

    if (displayContainer) {
      displayContainer.innerHTML = renderEventsPresentation(filtered, db.clubs || [], user, currentFilters.viewMode, currentFilters);
      attachCardAndRowActionListeners();

      // Bind dynamic search banner and empty state clear buttons
      const bannerClearBtn = document.getElementById("banner-clear-search-btn");
      if (bannerClearBtn) {
        bannerClearBtn.addEventListener("click", clearSearch);
      }
      const emptyClearBtn = document.getElementById("empty-clear-search-btn");
      if (emptyClearBtn) {
        emptyClearBtn.addEventListener("click", clearSearch);
      }
    }

    // Update active filter chips
    updateFilterChips();
  }

  // Update filter chips UI
  function updateFilterChips() {
    if (!activeFiltersRow || !activeChipsContainer) return;

    const chips = [];
    if (currentFilters.category !== "ALL") {
      chips.push({ label: `Category: ${currentFilters.category}`, key: "category", val: "ALL" });
    }
    if (currentFilters.clubId !== "ALL") {
      const db = getDB();
      const club = (db.clubs || []).find(c => c.id === currentFilters.clubId);
      chips.push({ label: `Society: ${club ? club.name : currentFilters.clubId}`, key: "clubId", val: "ALL" });
    }
    if (currentFilters.eventType !== "ALL") {
      chips.push({ label: `Format: ${currentFilters.eventType}`, key: "eventType", val: "ALL" });
    }
    if (currentFilters.searchQuery.trim().length > 0) {
      chips.push({ label: `Search: "${currentFilters.searchQuery}"`, key: "searchQuery", val: "" });
    }

    if (chips.length > 0) {
      activeFiltersRow.classList.remove("hidden");
      activeChipsContainer.innerHTML = chips.map(c => `
        <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span>${c.label}</span>
          <button data-chip-key="${c.key}" data-chip-val="${c.val}" class="remove-chip-btn text-blue-500 hover:text-blue-800 ml-1 font-bold">✕</button>
        </span>
      `).join('');

      activeChipsContainer.querySelectorAll(".remove-chip-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const k = btn.dataset.chipKey;
          const v = btn.dataset.chipVal;
          if (k === "searchQuery") {
            clearSearch();
            return;
          }
          currentFilters[k] = v;
          if (k === "category") {
            updateCategoryTabsUI(v);
          } else if (k === "clubId" && clubSelect) {
            clubSelect.value = v;
          } else if (k === "eventType" && formatSelect) {
            formatSelect.value = v;
          }
          updateDashboardView();
        });
      });
    } else {
      activeFiltersRow.classList.add("hidden");
      activeChipsContainer.innerHTML = "";
    }
  }

  // Update category tab UI styles
  function updateCategoryTabsUI(cat) {
    document.querySelectorAll(".category-tab-btn").forEach(btn => {
      const bCat = btn.dataset.category;
      if (bCat === cat) {
        if (cat === "ALL") {
          btn.className = "category-tab-btn px-3.5 py-3 rounded-2xl border transition-all text-left flex flex-col justify-between bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10";
        } else if (cat === "Industry 4.0") {
          btn.className = "category-tab-btn px-3.5 py-3 rounded-2xl border transition-all text-left flex flex-col justify-between bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20";
        } else if (cat === "Co-Curricular") {
          btn.className = "category-tab-btn px-3.5 py-3 rounded-2xl border transition-all text-left flex flex-col justify-between bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20";
        } else if (cat === "Extra-Curricular") {
          btn.className = "category-tab-btn px-3.5 py-3 rounded-2xl border transition-all text-left flex flex-col justify-between bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-600/20";
        }
      } else {
        btn.className = "category-tab-btn px-3.5 py-3 rounded-2xl border transition-all text-left flex flex-col justify-between bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
      }
    });

    // Update description banner
    const catConfig = Object.values(CLUB_CATEGORIES).find(c => c.id.toLowerCase() === cat.toLowerCase()) || CLUB_CATEGORIES.ALL;
    if (descBannerText) descBannerText.textContent = catConfig.description;
    if (descBannerIcon) descBannerIcon.textContent = catConfig.icon;

    // Filter the club dropdown options according to category
    if (clubSelect) {
      Array.from(clubSelect.options).forEach(opt => {
        if (opt.value === "ALL") return;
        const optCat = opt.dataset.category;
        if (cat === "ALL" || optCat === cat) {
          opt.style.display = "";
        } else {
          opt.style.display = "none";
        }
      });
      // If current selected club does not belong to active category, reset to ALL
      const selectedOpt = clubSelect.selectedOptions[0];
      if (selectedOpt && selectedOpt.value !== "ALL" && cat !== "ALL" && selectedOpt.dataset.category !== cat) {
        clubSelect.value = "ALL";
        currentFilters.clubId = "ALL";
      }
    }
  }

  // 1. Tab Button Click Listeners (Club Category Filter)
  document.querySelectorAll(".category-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      currentFilters.category = cat;
      updateCategoryTabsUI(cat);
      updateDashboardView();
    });
  });

  // 2. Search Input Listener (Debounced with instant clear toggle)
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle("hidden", val.trim().length === 0);
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentFilters.searchQuery = val;
        updateDashboardView();
      }, 180);
    });
  }

  // Clear search buttons
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", clearSearch);
  }
  if (quickClearSearchBtn) {
    quickClearSearchBtn.addEventListener("click", clearSearch);
  }

  // Quick Preset Search Suggestion Chips
  document.querySelectorAll(".search-preset-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const q = chip.dataset.query || "";
      if (searchInput) {
        searchInput.value = q;
        searchInput.focus();
      }
      currentFilters.searchQuery = q;
      updateDashboardView();
    });
  });

  // Keyboard shortcut: Press '/' to focus search input, 'Esc' to clear/blur
  const handleSearchShortcut = (e) => {
    if (e.key === "/" && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    } else if (e.key === "Escape" && document.activeElement === searchInput) {
      if (searchInput.value.trim().length > 0) {
        clearSearch();
      } else {
        searchInput.blur();
      }
    }
  };
  window.addEventListener("keydown", handleSearchShortcut);

  // 3. Society / Club Select Listener
  if (clubSelect) {
    clubSelect.addEventListener("change", (e) => {
      currentFilters.clubId = e.target.value;
      updateDashboardView();
    });
  }

  // 4. Format Select Listener
  if (formatSelect) {
    formatSelect.addEventListener("change", (e) => {
      currentFilters.eventType = e.target.value;
      updateDashboardView();
    });
  }

  // 5. Sort Select Listener
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentFilters.sortBy = e.target.value;
      updateDashboardView();
    });
  }

  // 6. View Mode Toggles
  if (gridViewBtn && listViewBtn) {
    gridViewBtn.addEventListener("click", () => {
      currentFilters.viewMode = "grid";
      gridViewBtn.className = "flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1 bg-slate-900 text-white border-slate-900";
      listViewBtn.className = "flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1 bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
      updateDashboardView();
    });

    listViewBtn.addEventListener("click", () => {
      currentFilters.viewMode = "list";
      listViewBtn.className = "flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1 bg-slate-900 text-white border-slate-900";
      gridViewBtn.className = "flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1 bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
      updateDashboardView();
    });
  }

  // 7. Reset Filters Button
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      currentFilters.category = "ALL";
      currentFilters.clubId = "ALL";
      currentFilters.eventType = "ALL";
      currentFilters.searchQuery = "";
      currentFilters.sortBy = "date-asc";
      if (searchInput) searchInput.value = "";
      if (clearSearchBtn) clearSearchBtn.classList.add("hidden");
      if (clubSelect) clubSelect.value = "ALL";
      if (formatSelect) formatSelect.value = "ALL";
      if (sortSelect) sortSelect.value = "date-asc";
      updateCategoryTabsUI("ALL");
      updateDashboardView();
    });
  }

  // Initialize UI controls with initial filter values
  if (activeCategory !== "ALL") {
    updateCategoryTabsUI(activeCategory);
  }
  if (activeClubId !== "ALL" && clubSelect) {
    clubSelect.value = activeClubId;
  }
  if (activeFormat !== "ALL" && formatSelect) {
    formatSelect.value = activeFormat;
  }

  // Attach card interactions
  attachCardAndRowActionListeners();

  // Attach modal handlers
  attachModalListeners();
}

/**
 * Attach Card & Row Specific Listeners: Registration, Waitlist, QR Pass, Circular, Dossier, Calendar
 */
function attachCardAndRowActionListeners() {
  const db = getDB();
  const user = getCurrentUser() || {};

  // Empty state reset button
  const emptyResetBtn = document.getElementById("empty-reset-btn");
  if (emptyResetBtn) {
    emptyResetBtn.addEventListener("click", () => {
      const resetBtn = document.getElementById("reset-filters-btn");
      if (resetBtn) resetBtn.click();
    });
  }

  // Register Buttons
  document.querySelectorAll(".dashboard-register-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const eventId = btn.dataset.eventid;
      const currentDb = getDB();
      const evt = (currentDb.events || []).find(ev => ev.id === eventId);
      if (!evt) return;

      if (!user.id) {
        showToast("Please sign in or select a student persona to register.", "warning");
        return;
      }

      if (!evt.registrations) evt.registrations = [];
      const already = evt.registrations.some(r => r.studentId === user.id || r.student_id === user.id);
      if (already) {
        showToast("You already have an active pass for this event!", "info");
        return;
      }

      const ticketId = `TCK-PEC-${Math.floor(10000 + Math.random() * 90000)}`;
      const newReg = {
        id: "reg-" + Date.now(),
        eventId: evt.id,
        event_id: evt.id,
        studentId: user.id,
        student_id: user.id,
        studentName: user.name || "Aarav Sharma",
        rollNo: user.rollNo || "22CS101",
        ticketId: ticketId,
        ticket_id: ticketId,
        registeredAt: new Date().toISOString(),
        checkedIn: false
      };

      evt.registrations.push(newReg);
      evt.registeredCount = (evt.registeredCount || 0) + 1;

      // Sync event_registrations relational table
      if (!currentDb.event_registrations) currentDb.event_registrations = [];
      currentDb.event_registrations.push(newReg);

      saveDB(currentDb);
      logAudit(`${user.name} (${user.role})`, "Registered for Technical Event", evt.title, `Ticket ID: ${ticketId}`);
      showToast(`Pass confirmed for "${evt.title}"! Gate Pass: ${ticketId}`, "success");

      // Auto-Pop QR Gate Pass Modal
      const modal = document.getElementById("dashboard-ticket-modal");
      const titleEl = document.getElementById("dashboard-ticket-event-title");
      const idEl = document.getElementById("dashboard-ticket-id-display");
      const studentEl = document.getElementById("dashboard-ticket-student-display");
      const metaEl = document.getElementById("dashboard-ticket-meta-display");
      const qrBox = document.getElementById("dashboard-modal-qr-box");

      if (modal) {
        if (titleEl) titleEl.textContent = evt.title;
        if (idEl) idEl.textContent = `PASS ID: ${ticketId}`;
        if (studentEl) studentEl.textContent = `${user.name || 'Aarav Sharma'} (${user.rollNo || '22CS101'})`;
        if (metaEl) metaEl.textContent = `${evt.date} • ${evt.venue || 'Central Seminar Complex'}`;

        if (qrBox) {
          qrBox.innerHTML = "";
          if (typeof QRCode !== 'undefined') {
            new QRCode(qrBox, {
              text: JSON.stringify({ ticketId, name: user.name, roll: user.rollNo || "22CS101", event: evt.title }),
              width: 140,
              height: 140,
              colorDark: "#0f172a",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H
            });
          } else {
            qrBox.innerHTML = `<div class="p-4 bg-slate-100 rounded-xl font-mono text-xs font-bold text-slate-700">${ticketId}</div>`;
          }
        }
        modal.classList.remove("hidden");
      }

      // Re-render dashboard view to reflect updated registered count and button state
      setTimeout(() => {
        const catBtn = document.querySelector(".category-tab-btn.bg-slate-900, .category-tab-btn.bg-blue-600, .category-tab-btn.bg-emerald-600, .category-tab-btn.bg-purple-600");
        const activeCat = catBtn?.dataset?.category || "ALL";
        attachEventDashboardEvents({ defaultCategory: activeCat });
      }, 500);
    });
  });

  // Waitlist Buttons
  document.querySelectorAll(".dashboard-waitlist-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const eventId = btn.dataset.eventid;
      const currentDb = getDB();
      const evt = (currentDb.events || []).find(ev => ev.id === eventId);
      if (!evt) return;

      if (!evt.waitlist) evt.waitlist = [];
      if (evt.waitlist.some(w => w.studentId === user.id)) {
        showToast("You are already queued on the waitlist for this event.", "info");
        return;
      }

      const waitEntry = {
        studentId: user.id,
        studentName: user.name,
        rollNo: user.rollNo || "22CS101",
        queuedAt: new Date().toISOString()
      };
      evt.waitlist.push(waitEntry);
      saveDB(currentDb);
      logAudit(`${user.name}`, "Joined Event Waitlist", evt.title, `Queue Pos: #${evt.waitlist.length}`);
      showToast(`Added to waitlist for "${evt.title}". Queue Position: #${evt.waitlist.length}`, "warning");

      setTimeout(() => {
        const catBtn = document.querySelector(".category-tab-btn.bg-slate-900, .category-tab-btn.bg-blue-600, .category-tab-btn.bg-emerald-600, .category-tab-btn.bg-purple-600");
        const activeCat = catBtn?.dataset?.category || "ALL";
        attachEventDashboardEvents({ defaultCategory: activeCat });
      }, 300);
    });
  });

  // View Ticket QR Pass Modal
  document.querySelectorAll(".dashboard-view-ticket-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const ticketId = btn.dataset.ticket;
      const title = btn.dataset.title;
      const name = btn.dataset.name;
      const roll = btn.dataset.roll;
      const club = btn.dataset.club;
      const date = btn.dataset.date;
      const venue = btn.dataset.venue;

      const modal = document.getElementById("dashboard-ticket-modal");
      const titleEl = document.getElementById("dashboard-ticket-event-title");
      const idEl = document.getElementById("dashboard-ticket-id-display");
      const studentEl = document.getElementById("dashboard-ticket-student-display");
      const metaEl = document.getElementById("dashboard-ticket-meta-display");
      const qrBox = document.getElementById("dashboard-modal-qr-box");

      if (!modal) return;

      if (titleEl) titleEl.textContent = title;
      if (idEl) idEl.textContent = `PASS ID: ${ticketId}`;
      if (studentEl) studentEl.textContent = `${name} (${roll})`;
      if (metaEl) metaEl.textContent = `${date} • ${venue || 'Campus Auditorium'}`;

      if (qrBox) {
        qrBox.innerHTML = "";
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrBox, {
            text: JSON.stringify({ ticketId, name, roll, event: title }),
            width: 140,
            height: 140,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });
        } else {
          qrBox.innerHTML = `<div class="p-4 bg-slate-100 rounded-xl font-mono text-xs font-bold text-slate-700">${ticketId}</div>`;
        }
      }

      modal.classList.remove("hidden");
    });
  });

  // Official Circular Generator Modal
  document.querySelectorAll(".dashboard-open-circular-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const eventId = btn.dataset.eventid;
      const currentDb = getDB();
      const evt = (currentDb.events || []).find(ev => ev.id === eventId);
      if (!evt) return;
      const club = (currentDb.clubs || []).find(c => c.id === (evt.club_id || evt.clubId));

      const modal = document.getElementById("dashboard-circular-modal");
      if (!modal) return;

      const refNo = `PEC/CCTSC/${new Date().getFullYear()}/${evt.id.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      document.getElementById("dashboard-circ-ref").textContent = `Ref: ${refNo}`;
      document.getElementById("dashboard-circ-date").textContent = `Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      document.getElementById("dashboard-circ-club").textContent = club ? club.name : 'Technical Society';
      document.getElementById("dashboard-circ-dept").textContent = club?.department || 'Computer Science & Engineering';
      document.getElementById("dashboard-circ-title").textContent = evt.title;
      document.getElementById("dashboard-circ-category").textContent = `${club?.category || 'Technical Society'} (${evt.category || evt.event_type || 'Accredited Event'})`;
      document.getElementById("dashboard-circ-time").textContent = `${evt.date} (${evt.time || '09:00 - 17:00'})`;
      document.getElementById("dashboard-circ-venue").textContent = evt.venue || 'Central Seminar Complex';
      document.getElementById("dashboard-circ-desc").textContent = evt.description || 'Hands-on technical initiative fostering core competency and industrial preparedness.';
      document.getElementById("dashboard-circ-coordinator").textContent = club?.facultyCoordinator || evt.created_by || 'Society Faculty In-charge';

      modal.classList.remove("hidden");
    });
  });

  // Dossier Modal
  document.querySelectorAll(".dashboard-open-dossier-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const eventId = btn.dataset.eventid;
      const currentDb = getDB();
      const evt = (currentDb.events || []).find(ev => ev.id === eventId);
      if (!evt) return;
      const club = (currentDb.clubs || []).find(c => c.id === (evt.club_id || evt.clubId));

      const modal = document.getElementById("dashboard-dossier-modal");
      if (!modal) return;

      document.getElementById("dashboard-dossier-cat-badge").textContent = `${club?.category || 'Technical Society'} • ${evt.category || 'Event'}`;
      document.getElementById("dashboard-dossier-title").textContent = evt.title;
      document.getElementById("dashboard-dossier-society").textContent = `Hosted by ${club ? club.name : 'Technical Society'} (Dept of ${club?.department || 'PEC'})`;
      document.getElementById("dashboard-dossier-date").textContent = evt.date;
      document.getElementById("dashboard-dossier-timing").textContent = evt.time || `${evt.start_time || '09:00'} - ${evt.end_time || '17:00'}`;
      document.getElementById("dashboard-dossier-venue").textContent = evt.venue || 'PEC Campus';
      document.getElementById("dashboard-dossier-capacity").textContent = `${evt.capacity || evt.max_participants || 100} Registered Delegates`;
      document.getElementById("dashboard-dossier-desc").textContent = evt.description || 'Comprehensive technical program.';

      const rulesList = document.getElementById("dashboard-dossier-rules");
      if (rulesList) {
        const rules = Array.isArray(evt.rules) && evt.rules.length > 0 
          ? evt.rules 
          : [
              "Open to all authorized Pragati Engineering College students.",
              "Mandatory gate pass check-in through QR scanner at venue entry desk.",
              "Accredited completion certificates will be minted to your digital wallet upon verified attendance."
            ];
        rulesList.innerHTML = rules.map(r => `<li>${r}</li>`).join('');
      }

      modal.classList.remove("hidden");
    });
  });

  // Add to Calendar .ics Download
  document.querySelectorAll(".dashboard-add-cal-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const eventId = btn.dataset.eventid;
      const currentDb = getDB();
      const evt = (currentDb.events || []).find(ev => ev.id === eventId);
      if (!evt) return;
      const club = (currentDb.clubs || []).find(c => c.id === (evt.club_id || evt.clubId));
      downloadEventICS(evt, club);
    });
  });
}

/**
 * Attach Modals Close & Print Listeners
 */
function attachModalListeners() {
  // Ticket Modal Close
  const ticketModal = document.getElementById("dashboard-ticket-modal");
  const closeTicketBtn = document.getElementById("dashboard-close-ticket-modal");
  if (closeTicketBtn && ticketModal) {
    closeTicketBtn.addEventListener("click", () => ticketModal.classList.add("hidden"));
    ticketModal.addEventListener("click", (e) => {
      if (e.target === ticketModal) ticketModal.classList.add("hidden");
    });
  }

  // Circular Modal Close & Print
  const circularModal = document.getElementById("dashboard-circular-modal");
  const closeCircBtn = document.getElementById("dashboard-close-circular-modal");
  const printCircBtn = document.getElementById("dashboard-print-circular-btn");
  if (circularModal) {
    if (closeCircBtn) closeCircBtn.addEventListener("click", () => circularModal.classList.add("hidden"));
    circularModal.addEventListener("click", (e) => {
      if (e.target === circularModal) circularModal.classList.add("hidden");
    });
    if (printCircBtn) {
      printCircBtn.addEventListener("click", () => window.print());
    }
  }

  // Dossier Modal Close
  const dossierModal = document.getElementById("dashboard-dossier-modal");
  const closeDossierBtn = document.getElementById("dashboard-close-dossier-modal");
  const closeDossierBtn2 = document.getElementById("dashboard-dossier-close-btn");
  if (dossierModal) {
    if (closeDossierBtn) closeDossierBtn.addEventListener("click", () => dossierModal.classList.add("hidden"));
    if (closeDossierBtn2) closeDossierBtn2.addEventListener("click", () => dossierModal.classList.add("hidden"));
    dossierModal.addEventListener("click", (e) => {
      if (e.target === dossierModal) dossierModal.classList.add("hidden");
    });
  }

  // Create Event Modal (Faculty/Admin)
  const openCreateBtn = document.getElementById("dashboard-create-event-btn");
  const createModal = document.getElementById("dashboard-create-modal");
  const closeCreateBtn = document.getElementById("dashboard-close-create-modal");
  const cancelCreateBtn = document.getElementById("dashboard-cancel-create-btn");
  const createForm = document.getElementById("dashboard-create-event-form");

  if (createModal) {
    if (openCreateBtn) openCreateBtn.addEventListener("click", () => createModal.classList.remove("hidden"));
    if (closeCreateBtn) closeCreateBtn.addEventListener("click", () => createModal.classList.add("hidden"));
    if (cancelCreateBtn) cancelCreateBtn.addEventListener("click", () => createModal.classList.add("hidden"));
    createModal.addEventListener("click", (e) => {
      if (e.target === createModal) createModal.classList.add("hidden");
    });

    if (createForm) {
      createForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const currentDb = getDB();
        const user = getCurrentUser() || {};
        const title = document.getElementById("create-event-title").value;
        const clubId = document.getElementById("create-event-club").value;
        const format = document.getElementById("create-event-format").value;
        const date = document.getElementById("create-event-date").value;
        const time = document.getElementById("create-event-time").value;
        const venue = document.getElementById("create-event-venue").value;
        const cap = parseInt(document.getElementById("create-event-capacity").value) || 100;
        const desc = document.getElementById("create-event-desc").value;

        const newEvt = {
          id: "evt-" + (currentDb.events.length + 101),
          title,
          category: format,
          event_type: format,
          clubId,
          club_id: clubId,
          date,
          time,
          start_time: time.split("-")[0]?.trim() || "09:00",
          end_time: time.split("-")[1]?.trim() || "17:00",
          venue,
          capacity: cap,
          max_participants: cap,
          registeredCount: 0,
          status: "Upcoming",
          banner: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
          description: desc,
          tags: ["Accredited", format, "Technical Society"],
          rules: [
            "Teams or individual participants from authorized engineering departments.",
            "Valid identity card and digital gate pass required at entry."
          ],
          created_by: user.name || "Faculty Coordinator",
          created_at: new Date().toISOString(),
          registrations: [],
          waitlist: []
        };

        currentDb.events.unshift(newEvt);
        saveDB(currentDb);
        logAudit(`${user.name} (${user.role})`, "Created Society Event", newEvt.title, `Capacity: ${newEvt.capacity}`);
        showToast(`Event "${newEvt.title}" published! Official circular generated.`, "success");
        createModal.classList.add("hidden");
        createForm.reset();

        // Refresh dashboard
        attachEventDashboardEvents();
      });
    }
  }
}
