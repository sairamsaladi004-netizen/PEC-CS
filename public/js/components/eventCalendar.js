// Pragati Engineering College (PEC Autonomous) - CampusTech
// Event Calendar Grid Component powered by Supabase DB & Local DB Fallback

import { getSupabaseClient } from '../supabaseClient.js';
import { getDB, apiRequest } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from './toast.js';

// Category Styling Metadata
export const CALENDAR_CATEGORIES = {
  ALL: {
    id: "ALL",
    name: "All Categories",
    icon: "⚡",
    colorClass: "bg-slate-900 text-white",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
    chipClass: "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200"
  },
  "Industry 4.0": {
    id: "Industry 4.0",
    name: "Industry 4.0",
    icon: "🚀",
    colorClass: "bg-blue-600 text-white",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    chipClass: "bg-blue-600 text-white hover:bg-blue-700"
  },
  "Co-Curricular": {
    id: "Co-Curricular",
    name: "Co-Curricular",
    icon: "🏛️",
    colorClass: "bg-emerald-600 text-white",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    chipClass: "bg-emerald-600 text-white hover:bg-emerald-700"
  },
  "Extra-Curricular": {
    id: "Extra-Curricular",
    name: "Extra-Curricular",
    icon: "🌐",
    colorClass: "bg-purple-600 text-white",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    chipClass: "bg-purple-600 text-white hover:bg-purple-700"
  }
};

// Internal Calendar State
let calendarState = {
  currentDate: new Date(), // Active month/year
  selectedDateStr: new Date().toISOString().split('T')[0], // Selected YYYY-MM-DD
  viewMode: 'month', // 'month', 'week', 'list'
  selectedCategory: 'ALL',
  selectedClubId: 'ALL',
  searchQuery: '',
  events: [],
  clubs: [],
  fetchedFromSupabase: false,
  isLoading: false
};

/**
 * Fetch events directly from Supabase with local fallback
 */
export async function fetchCalendarEvents() {
  calendarState.isLoading = true;
  const supabase = getSupabaseClient();
  let events = [];
  let clubs = [];
  let fetchedFromSupabase = false;

  const localDb = getDB();
  clubs = localDb.clubs || [];

  if (supabase) {
    try {
      const { data: supabaseEvents, error } = await supabase
        .from('events')
        .select('*');

      if (!error && supabaseEvents && supabaseEvents.length > 0) {
        events = supabaseEvents;
        fetchedFromSupabase = true;
      }
    } catch (err) {
      console.warn("[Calendar Component] Supabase fetch notice:", err.message);
    }
  }

  // Fallback to Express backend or local DB
  if (!events || events.length === 0) {
    events = localDb.events || [];
  }

  calendarState.events = events;
  calendarState.clubs = clubs;
  calendarState.fetchedFromSupabase = fetchedFromSupabase;
  calendarState.isLoading = false;

  return { events, clubs, fetchedFromSupabase };
}

/**
 * Render the Event Calendar Component Layout
 */
export function renderEventCalendarComponent() {
  const currentMonthYearStr = calendarState.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentUser = getCurrentUser() || {};

  return `
    <div id="event-calendar-container" class="space-y-6 max-w-7xl mx-auto">
      
      <!-- Top Calendar Banner & Supabase Connection Indicator -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div class="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2">
            <div class="flex items-center space-x-2 flex-wrap gap-2">
              <span id="supabase-calendar-badge" class="px-3 py-1 rounded-full text-[10px] font-black uppercase font-mono ${calendarState.fetchedFromSupabase ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950'}">
                ${calendarState.fetchedFromSupabase ? '🟢 SUPABASE LIVE DB CONNECTED' : '⚡ CAMPUS EXPRESS DB CONNECTED'}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/10">
                35 Technical Societies & Student Clubs
              </span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Campus Event Calendar 📅
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Explore upcoming workshops, hackathons, guest lectures, and symposiums across Industry 4.0, Co-Curricular, and Extra-Curricular societies at Pragati Engineering College.
            </p>
          </div>

          <!-- Quick Actions & View Switcher -->
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <div class="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 flex items-center space-x-1">
              <button id="cal-mode-month-btn" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${calendarState.viewMode === 'month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
                🗓️ Month
              </button>
              <button id="cal-mode-week-btn" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${calendarState.viewMode === 'week' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
                📊 Week
              </button>
              <button id="cal-mode-list-btn" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${calendarState.viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
                📋 Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar Controls & Category Filters -->
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        <!-- Category Pill Filters -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-slate-500 mr-1 uppercase tracking-wider text-[10px]">Filter Category:</span>
            
            <button data-cal-cat="ALL" class="cal-cat-btn px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${calendarState.selectedCategory === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}">
              ⚡ All Categories
            </button>
            <button data-cal-cat="Industry 4.0" class="cal-cat-btn px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${calendarState.selectedCategory === 'Industry 4.0' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}">
              🚀 Industry 4.0
            </button>
            <button data-cal-cat="Co-Curricular" class="cal-cat-btn px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${calendarState.selectedCategory === 'Co-Curricular' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}">
              🏛️ Co-Curricular
            </button>
            <button data-cal-cat="Extra-Curricular" class="cal-cat-btn px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${calendarState.selectedCategory === 'Extra-Curricular' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'}">
              🌐 Extra-Curricular
            </button>
          </div>

          <!-- Specific Society & Keyword Search -->
          <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div class="w-full sm:w-48">
              <select id="cal-club-select" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="ALL">All 35 Clubs</option>
                ${(calendarState.clubs || []).map(c => `<option value="${c.id}" ${calendarState.selectedClubId === c.id ? 'selected' : ''}>${c.name} (${c.id})</option>`).join('')}
              </select>
            </div>
            <div class="w-full sm:w-56">
              <input 
                type="text" 
                id="cal-search-input" 
                placeholder="Search events, topics..." 
                value="${calendarState.searchQuery}"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Date Header Navigation Bar -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center space-x-3">
            <button id="cal-prev-btn" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all">
              ◀ Prev
            </button>
            <button id="cal-today-btn" class="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black transition-all">
              Today
            </button>
            <button id="cal-next-btn" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all">
              Next ▶
            </button>
            <h2 id="cal-month-title" class="text-base sm:text-lg font-black text-slate-900 tracking-tight ml-2">
              ${currentMonthYearStr}
            </h2>
          </div>

          <div class="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span> Industry 4.0
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 ml-2"></span> Co-Curricular
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-purple-600 ml-2"></span> Extra-Curricular
          </div>
        </div>
      </div>

      <!-- MAIN CALENDAR GRID VIEW / CONTAINER -->
      <div id="cal-view-render-area" class="min-h-[450px]">
        <!-- Rendered dynamically -->
      </div>

      <!-- SELECTED DAY EVENTS DETAILED DRAWER / MODAL AREA -->
      <div id="cal-day-inspector" class="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-4">
        <!-- Rendered dynamically when a date is clicked -->
      </div>

    </div>
  `;
}

/**
 * Filter events based on active calendar state criteria
 */
function getFilteredCalendarEvents() {
  const { events, clubs, selectedCategory, selectedClubId, searchQuery } = calendarState;

  return events.filter(evt => {
    // Find club metadata
    const club = clubs.find(c => c.id === (evt.club_id || evt.clubId)) || evt.clubs;
    const category = club?.category || evt.category || "Industry 4.0";

    // 1. Category Filter
    if (selectedCategory && selectedCategory !== "ALL") {
      if (category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // 2. Specific Club Filter
    if (selectedClubId && selectedClubId !== "ALL") {
      const eClubId = evt.club_id || evt.clubId;
      if (eClubId !== selectedClubId) return false;
    }

    // 3. Search Query Filter
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const title = (evt.title || evt.name || "").toLowerCase();
      const clubName = (club?.name || "").toLowerCase();
      const venue = (evt.venue || "").toLowerCase();
      const desc = (evt.description || "").toLowerCase();

      if (!title.includes(q) && !clubName.includes(q) && !venue.includes(q) && !desc.includes(q)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Render Month View Grid Matrix
 */
function renderMonthGridHTML() {
  const year = calendarState.currentDate.getFullYear();
  const month = calendarState.currentDate.getMonth();
  
  // First day of current month
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
  
  // Total days in current month
  const lastDay = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDay.getDate();

  // Total days in previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];
  const filteredEvents = getFilteredCalendarEvents();

  // Build grid day cells array
  let dayCells = [];

  // Padding days from previous month
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    dayCells.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  // Days of current month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const currDate = new Date(year, month, d);
    // Correct timezone offset format
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    dayCells.push({ dayNum: d, dateStr, isCurrentMonth: true });
  }

  // Padding days for next month to complete 35 or 42 grid cells
  const remainingCells = 35 - (dayCells.length % 35);
  if (remainingCells < 35 && remainingCells > 0) {
    for (let n = 1; n <= remainingCells; n++) {
      const nextMonthDate = new Date(year, month + 1, n);
      const dateStr = nextMonthDate.toISOString().split('T')[0];
      dayCells.push({ dayNum: n, dateStr, isCurrentMonth: false });
    }
  }

  return `
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      
      <!-- Day Headers (Sun-Sat) -->
      <div class="grid grid-cols-7 bg-slate-900 text-slate-300 font-bold text-[11px] uppercase tracking-wider text-center py-3 border-b border-slate-800">
        <div class="text-rose-400">Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <!-- Calendar Month Grid Matrix -->
      <div class="grid grid-cols-7 divide-x divide-y divide-slate-100">
        ${dayCells.map(cell => {
          const dayEvents = filteredEvents.filter(e => e.date === cell.dateStr);
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === calendarState.selectedDateStr;

          let cellBg = cell.isCurrentMonth ? "bg-white" : "bg-slate-50/60 text-slate-400";
          if (isSelected) cellBg += " ring-2 ring-indigo-600 bg-indigo-50/30";

          return `
            <div 
              data-cal-date="${cell.dateStr}" 
              class="cal-day-cell min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 cursor-pointer transition-all hover:bg-slate-50 relative group flex flex-col justify-between ${cellBg}"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-black font-mono px-1.5 py-0.5 rounded-md ${isToday ? 'bg-indigo-600 text-white' : (cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400')}">
                  ${cell.dayNum}
                </span>
                ${isToday ? `<span class="text-[9px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.2 rounded font-mono">TODAY</span>` : ''}
              </div>

              <!-- Day Events Chips -->
              <div class="space-y-1 flex-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                ${dayEvents.slice(0, 3).map(evt => {
                  const club = calendarState.clubs.find(c => c.id === (evt.club_id || evt.clubId)) || evt.clubs;
                  const cat = club?.category || evt.category || "Industry 4.0";
                  
                  let badgeBg = "bg-blue-600 text-white";
                  if (cat === "Co-Curricular") badgeBg = "bg-emerald-600 text-white";
                  if (cat === "Extra-Curricular") badgeBg = "bg-purple-600 text-white";

                  return `
                    <div class="p-1 rounded-lg text-[10px] font-bold ${badgeBg} truncate shadow-2xs hover:scale-[1.02] transition-transform">
                      <span class="font-mono text-[9px] opacity-80">${evt.start_time || '10:00'}</span>
                      <span class="truncate ml-1">${evt.title}</span>
                    </div>
                  `;
                }).join('')}

                ${dayEvents.length > 3 ? `
                  <div class="text-[9px] font-black text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded text-center">
                    +${dayEvents.length - 3} more
                  </div>
                ` : ''}
              </div>

              ${dayEvents.length > 0 ? `
                <div class="mt-1 pt-1 border-t border-slate-100 text-[9px] font-mono font-bold text-slate-500 text-right">
                  ${dayEvents.length} Event${dayEvents.length > 1 ? 's' : ''}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

/**
 * Render Week View Timeline Matrix
 */
function renderWeekGridHTML() {
  const filteredEvents = getFilteredCalendarEvents();
  const startOfWeek = new Date(calendarState.currentDate);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    weekDays.push({ dateStr, dayName, dayNum });
  }

  return `
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-4 sm:p-6 space-y-4">
      <h3 class="text-sm font-black text-slate-900 flex items-center justify-between">
        <span>7-Day Event Schedule</span>
        <span class="text-xs font-mono font-normal text-slate-500">Week of ${weekDays[0].dateStr}</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        ${weekDays.map(w => {
          const dayEvents = filteredEvents.filter(e => e.date === w.dateStr);
          const isToday = w.dateStr === new Date().toISOString().split('T')[0];

          return `
            <div data-cal-date="${w.dateStr}" class="cal-day-cell border border-slate-200 rounded-2xl p-3 space-y-2 cursor-pointer hover:border-indigo-500 transition-all ${isToday ? 'bg-indigo-50/50 border-indigo-300' : 'bg-slate-50/50'}">
              <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                <span class="text-xs font-black text-slate-900">${w.dayName}</span>
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${isToday ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'}">${w.dayNum}</span>
              </div>

              <div class="space-y-2 min-h-[120px]">
                ${dayEvents.length === 0 ? `
                  <div class="text-[10px] text-slate-400 font-medium py-4 text-center">No Events</div>
                ` : dayEvents.map(evt => {
                  const club = calendarState.clubs.find(c => c.id === (evt.club_id || evt.clubId)) || evt.clubs;
                  return `
                    <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div class="text-[10px] font-bold text-indigo-700 font-mono">${evt.start_time || '10:00 AM'}</div>
                      <div class="text-xs font-black text-slate-900 leading-tight">${evt.title}</div>
                      <div class="text-[10px] text-slate-500 truncate">${club?.name || evt.club_id}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Render List / Agenda View
 */
function renderListGridHTML() {
  const filteredEvents = getFilteredCalendarEvents();
  filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (filteredEvents.length === 0) {
    return `
      <div class="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
        <div class="text-4xl">📅</div>
        <h3 class="text-base font-black text-slate-900">No Events Found</h3>
        <p class="text-xs text-slate-500">There are no scheduled events matching the selected category filter.</p>
      </div>
    `;
  }

  return `
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
      <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span class="text-xs font-black text-slate-900">Agenda Timeline (${filteredEvents.length} Events)</span>
        <span class="text-[10px] font-mono text-slate-500">Sorted chronologically</span>
      </div>

      ${filteredEvents.map(evt => {
        const club = calendarState.clubs.find(c => c.id === (evt.club_id || evt.clubId)) || evt.clubs;
        const cat = club?.category || evt.category || "Industry 4.0";
        const meta = CALENDAR_CATEGORIES[cat] || CALENDAR_CATEGORIES["Industry 4.0"];

        return `
          <div class="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start space-x-4">
              <div class="bg-slate-900 text-white rounded-2xl p-3 text-center min-w-[70px] shrink-0 border border-slate-800">
                <div class="text-[10px] font-bold text-amber-400 font-mono uppercase">${new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                <div class="text-xl font-black font-mono leading-none">${new Date(evt.date).getDate()}</div>
                <div class="text-[9px] text-slate-400 font-mono mt-0.5">${new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
              </div>

              <div class="space-y-1">
                <div class="flex items-center space-x-2 flex-wrap gap-1">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${meta.badgeClass} border">${meta.name}</span>
                  <span class="text-xs font-bold text-indigo-700 font-mono">📍 ${evt.venue || 'PEC Auditorium'}</span>
                  <span class="text-xs font-bold text-slate-600 font-mono">🕒 ${evt.start_time || '10:00 AM'}</span>
                </div>
                <h4 class="text-base font-black text-slate-900">${evt.title}</h4>
                <p class="text-xs text-slate-500 line-clamp-1">${evt.description || 'Join us for this exciting technical event at Pragati Engineering College.'}</p>
                <div class="text-[11px] font-bold text-slate-700">Organized by: <strong class="text-indigo-900">${club?.name || evt.club_id}</strong></div>
              </div>
            </div>

            <button 
              data-cal-register="${evt.id}" 
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 shrink-0 self-start sm:self-center"
            >
              Register Event →
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Render Inspector Area for Selected Day
 */
function renderDayInspectorHTML(dateStr) {
  const dateObj = new Date(dateStr);
  const formattedDateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dayEvents = getFilteredCalendarEvents().filter(e => e.date === dateStr);

  return `
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
      <div>
        <div class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">Selected Calendar Date</div>
        <h3 class="text-base sm:text-lg font-black text-white">${formattedDateStr}</h3>
      </div>
      <span class="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono border border-indigo-500/30">
        ${dayEvents.length} Event${dayEvents.length !== 1 ? 's' : ''} Scheduled
      </span>
    </div>

    ${dayEvents.length === 0 ? `
      <div class="py-6 text-center text-slate-400 text-xs">
        No technical events scheduled for this date. Click another day on the calendar matrix to inspect events.
      </div>
    ` : `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        ${dayEvents.map(evt => {
          const club = calendarState.clubs.find(c => c.id === (evt.club_id || evt.clubId)) || evt.clubs;
          const maxCap = evt.max_participants || evt.capacity || 100;
          const regCount = evt.registered_count || evt.registeredCount || 12;

          return `
            <div class="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-3 relative overflow-hidden flex flex-col justify-between">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 font-mono">${evt.category || 'Workshop'}</span>
                  <span class="text-xs font-mono text-indigo-300 font-bold">🕒 ${evt.start_time || '10:00 AM'}</span>
                </div>
                <h4 class="text-sm font-black text-white leading-snug">${evt.title}</h4>
                <div class="text-[11px] text-slate-300 font-medium">Club: <strong class="text-white">${club?.name || evt.club_id}</strong></div>
                <div class="text-[11px] text-slate-400">Venue: <strong>${evt.venue || 'PEC Campus'}</strong></div>
                <p class="text-[11px] text-slate-400 line-clamp-2">${evt.description || 'Hands-on training session for Pragati students.'}</p>
              </div>

              <div class="pt-3 border-t border-slate-700 space-y-2">
                <div class="flex items-center justify-between text-[10px] text-slate-300 font-mono">
                  <span>Slots Filled:</span>
                  <span class="font-bold text-emerald-400">${regCount} / ${maxCap}</span>
                </div>

                <div class="flex items-center space-x-2">
                  <button 
                    data-cal-register="${evt.id}" 
                    class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all text-center"
                  >
                    Register Now
                  </button>
                  <button 
                    data-cal-export="${evt.id}" 
                    class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-all"
                    title="Export to iCal / Google Calendar"
                  >
                    📅 iCal
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

/**
 * Attach Events and Event Listeners to Calendar Component
 */
export async function attachEventCalendarEvents() {
  await fetchCalendarEvents();

  function updateCalendarUI() {
    // Update badge status
    const badge = document.getElementById("supabase-calendar-badge");
    if (badge) {
      badge.textContent = calendarState.fetchedFromSupabase ? "🟢 SUPABASE LIVE DB CONNECTED" : "⚡ CAMPUS EXPRESS DB CONNECTED";
      badge.className = `px-3 py-1 rounded-full text-[10px] font-black uppercase font-mono ${calendarState.fetchedFromSupabase ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950'}`;
    }

    // Render area
    const area = document.getElementById("cal-view-render-area");
    if (area) {
      if (calendarState.viewMode === 'month') {
        area.innerHTML = renderMonthGridHTML();
      } else if (calendarState.viewMode === 'week') {
        area.innerHTML = renderWeekGridHTML();
      } else {
        area.innerHTML = renderListGridHTML();
      }
    }

    // Render Inspector
    const inspector = document.getElementById("cal-day-inspector");
    if (inspector) {
      inspector.innerHTML = renderDayInspectorHTML(calendarState.selectedDateStr);
    }

    // Attach Cell Click Event Listeners
    document.querySelectorAll(".cal-day-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const dateStr = cell.getAttribute("data-cal-date");
        if (dateStr) {
          calendarState.selectedDateStr = dateStr;
          updateCalendarUI();
        }
      });
    });

    // Attach Register Buttons
    document.querySelectorAll("[data-cal-register]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const eventId = btn.getAttribute("data-cal-register");
        const user = getCurrentUser();

        if (!user) {
          showToast("Authentication Required", "Please login to register for campus events.", "warning");
          window.location.hash = "#/login";
          return;
        }

        try {
          btn.disabled = true;
          btn.textContent = "Registering...";
          const res = await apiRequest("/api/events/register", "POST", { eventId, studentId: user.id });
          if (res.success) {
            showToast("Registration Confirmed", res.message || "Event ticket generated!", "success");
            await fetchCalendarEvents();
            updateCalendarUI();
          } else {
            showToast("Registration Error", res.message || "Could not register.", "error");
          }
        } catch (err) {
          showToast("Registration Error", err.message, "error");
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Attach Export iCal Buttons
    document.querySelectorAll("[data-cal-export]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const eventId = btn.getAttribute("data-cal-export");
        const evt = calendarState.events.find(item => item.id === eventId);
        if (evt) {
          exportToICal(evt);
        }
      });
    });
  }

  // View Mode Switchers
  document.getElementById("cal-mode-month-btn")?.addEventListener("click", () => {
    calendarState.viewMode = 'month';
    updateCalendarUI();
  });
  document.getElementById("cal-mode-week-btn")?.addEventListener("click", () => {
    calendarState.viewMode = 'week';
    updateCalendarUI();
  });
  document.getElementById("cal-mode-list-btn")?.addEventListener("click", () => {
    calendarState.viewMode = 'list';
    updateCalendarUI();
  });

  // Month Navigation
  document.getElementById("cal-prev-btn")?.addEventListener("click", () => {
    calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() - 1);
    document.getElementById("cal-month-title").textContent = calendarState.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    updateCalendarUI();
  });

  document.getElementById("cal-next-btn")?.addEventListener("click", () => {
    calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() + 1);
    document.getElementById("cal-month-title").textContent = calendarState.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    updateCalendarUI();
  });

  document.getElementById("cal-today-btn")?.addEventListener("click", () => {
    calendarState.currentDate = new Date();
    calendarState.selectedDateStr = new Date().toISOString().split('T')[0];
    document.getElementById("cal-month-title").textContent = calendarState.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    updateCalendarUI();
  });

  // Category Filter Buttons
  document.querySelectorAll(".cal-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-cal-cat");
      calendarState.selectedCategory = cat;
      
      // Update button styling
      document.querySelectorAll(".cal-cat-btn").forEach(b => {
        const bCat = b.getAttribute("data-cal-cat");
        if (bCat === cat) {
          b.className = `cal-cat-btn px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all bg-slate-900 text-white border-slate-900 shadow-sm`;
        } else {
          b.className = `cal-cat-btn px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100`;
        }
      });

      updateCalendarUI();
    });
  });

  // Specific Club Dropdown
  document.getElementById("cal-club-select")?.addEventListener("change", (e) => {
    calendarState.selectedClubId = e.target.value;
    updateCalendarUI();
  });

  // Search Input
  document.getElementById("cal-search-input")?.addEventListener("input", (e) => {
    calendarState.searchQuery = e.target.value;
    updateCalendarUI();
  });

  // Initial Run
  updateCalendarUI();
}

/**
 * iCal (.ics) Download Helper
 */
function exportToICal(evt) {
  const startDateStr = (evt.date || '2026-10-01').replace(/-/g, '');
  const startTimeStr = (evt.start_time || '10:00').replace(':', '') + '00';
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pragati Engineering College//CampusTech Events//EN
BEGIN:VEVENT
SUMMARY:${evt.title}
DESCRIPTION:${evt.description || 'Pragati Technical Event'}
LOCATION:${evt.venue || 'Pragati Campus'}
DTSTART:${startDateStr}T${startTimeStr}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PEC_Event_${evt.id}.ics`;
  a.click();
  showToast("Calendar Exported", "iCal event file downloaded successfully.", "success");
}
