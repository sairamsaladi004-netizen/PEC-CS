import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';
export function renderAnnouncementsView() {
  const db = getDB();
  const user = getCurrentUser();
  const canPublish = ["Club Admin", "Faculty Coordinator", "Department Admin", "Super Admin"].includes(user.role);
  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Notices & Council Circulars</h1>
          <p class="text-xs sm:text-sm text-slate-500">Official institutional communications, election calls, and emergency schedule shifts</p>
        </div>
        ${canPublish ? `
          <button id="open-publish-ann-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5">
            <span>+ Broadcast Announcement</span>
          </button>
        ` : ''}
      </div>
      <!-- Priority Filter Pills -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
        <button data-priority="all" class="ann-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm">All Notices (${db.announcements.length})</button>
        <button data-priority="critical" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100">Critical Priority</button>
        <button data-priority="important" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100">Important</button>
        <button data-priority="normal" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200">General</button>
      </div>
      <!-- Notices Feed List -->
      <div id="announcements-feed" class="space-y-4">
        ${db.announcements.map(ann => renderAnnouncementItem(ann)).join('')}
      </div>
      <!-- Broadcast Modal -->
      <div id="publish-ann-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Broadcast Campus Notice</h3>
            <button id="close-ann-modal" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
          </div>
          <form id="publish-ann-form" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notice Headline</label>
              <input type="text" id="new-ann-title" required placeholder="e.g. Schedule Revision: ApexHacks Mentorship Round" class="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
