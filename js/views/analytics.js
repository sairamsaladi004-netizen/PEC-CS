import { getDB } from '../db.js';
export function renderAnalyticsView() {
  const db = getDB();
  const totalMembers = db.clubs.reduce((acc, c) => acc + c.memberCount, 0);
  const totalEvents = db.events.length;
  const totalProjects = db.projects.length;
  const totalCerts = db.certificates.length;
  return `
    <div class="space-y-8 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Institutional Analytics & Performance</h1>
          <p class="text-xs sm:text-sm text-slate-500">Real-time metrics on student participation, event attendance velocity, and research output</p>
        </div>
        <div class="flex items-center space-x-2">
          <a href="#/reports" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Generate NAAC / NBA Report</span>
          </a>
        </div>
      </div>
      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-slate-500">Total Active Societies</div>
          <div class="text-3xl font-black text-slate-900">${db.clubs.length}</div>
          <div class="text-[11px] text-emerald-600 font-bold">100% Operational</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-blue-600">Active Student Members</div>
          <div class="text-3xl font-black text-blue-600">${totalMembers}</div>
          <div class="text-[11px] text-slate-400 font-medium">Across 5 Departments</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-purple-600">Events & Hackathons</div>
          <div class="text-3xl font-black text-purple-600">${totalEvents}</div>
          <div class="text-[11px] text-purple-600 font-bold">Avg 88% Attendance</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-emerald-600">Issued QR Certificates</div>
          <div class="text-3xl font-black text-emerald-600">${totalCerts}</div>
