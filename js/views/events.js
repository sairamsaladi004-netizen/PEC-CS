import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';
export function renderEventsView(params = {}) {
  const db = getDB();
  const user = getCurrentUser();
  const isClubAdminOrFaculty = ["Club Admin", "Faculty Coordinator", "Department Admin", "Super Admin"].includes(user.role);
  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Technical Events & Hackathons</h1>
          <p class="text-xs sm:text-sm text-slate-500">Automated registration limits, live waitlists, QR tickets, and certificate workflows</p>
        </div>
        <div class="flex items-center space-x-2.5">
          <a href="#/event-poster" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>Poster Studio</span>
          </a>
          ${isClubAdminOrFaculty ? `
            <button id="open-create-event-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5">
              <span>+ Create Event</span>
            </button>
          ` : ''}
        </div>
      </div>
      <!-- Categories & Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
        <button data-cat="all" class="event-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all">All Events (${db.events.length})</button>
        <button data-cat="hackathon" class="event-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Hackathons</button>
        <button data-cat="workshop" class="event-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Workshops</button>
        <button data-cat="coding_contest" class="event-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Coding Contests</button>
        <button data-cat="bootcamp" class="event-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Bootcamps</button>
      </div>
      <!-- Events Grid -->
      <div id="events-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${db.events.map(evt => renderEventCard(evt, db, user)).join('')}
      </div>
      <!-- Create Event Modal (Hidden by default) -->
