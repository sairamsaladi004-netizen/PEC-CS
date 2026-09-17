import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
export function renderAttendanceView(params = {}) {
  const db = getDB();
  const user = getCurrentUser();
  const selectedEventId = params.id || (db.events[0] ? db.events[0].id : "");
  const currentEvent = db.events.find(e => e.id === selectedEventId) || db.events[0];
  const registrations = currentEvent?.registrations || [];
  const checkedInCount = registrations.filter(r => r.checkedIn).length;
  const attendanceRate = registrations.length > 0 ? Math.round((checkedInCount / registrations.length) * 100) : 0;
  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">QR Attendance & Check-In Kiosk</h1>
          <p class="text-xs sm:text-sm text-slate-500">Real-time QR barcode validation, gate pass check-in, and authorized audit overrides</p>
        </div>
        <div class="flex items-center space-x-2">
          <select id="attendance-event-select" class="p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            ${db.events.map(ev => `
              <option value="${ev.id}" ${ev.id === currentEvent?.id ? 'selected' : ''}>${ev.title}</option>
            `).join('')}
          </select>
        </div>
      </div>
      <!-- Stats Metrics Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="text-xs font-semibold text-slate-500">Total Registered</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${registrations.length}</div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="text-xs font-semibold text-emerald-600">Checked In (Present)</div>
          <div class="text-2xl font-black text-emerald-600 mt-1">${checkedInCount}</div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="text-xs font-semibold text-rose-500">Pending Check-in</div>
          <div class="text-2xl font-black text-rose-500 mt-1">${registrations.length - checkedInCount}</div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="text-xs font-semibold text-blue-600">Attendance Rate</div>
          <div class="text-2xl font-black text-blue-600 mt-1">${attendanceRate}%</div>
        </div>
      </div>
