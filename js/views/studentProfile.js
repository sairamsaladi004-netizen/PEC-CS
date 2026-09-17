import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser, updateProfile } from '../auth.js';
import { showToast } from '../components/toast.js';
export function renderStudentProfileView() {
  const db = getDB();
  const user = getCurrentUser();
  const joinedClubs = db.clubs.filter(c => user.clubs && user.clubs.includes(c.id));
  const myCertificates = db.certificates.filter(c => c.studentId === user.id);
  const myProjects = db.projects.filter(p => p.teamLeader === user.name || (p.teamMembers && p.teamMembers.some(m => m.includes(user.name))));
  const registeredEvents = [];
  db.events.forEach(e => {
    if (e.registrations) {
      const reg = e.registrations.find(r => r.studentId === user.id);
      if (reg) registeredEvents.push({ event: e, reg });
    }
  });
  return `
    <div class="space-y-8 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Central Student Portfolio</h1>
          <p class="text-xs sm:text-sm text-slate-500">Consolidated record of technical club leadership, events attended, verified certificates, and research projects</p>
        </div>
        <div class="flex items-center space-x-2.5">
          <a href="#/membership-card" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
            View Digital ID
          </a>
          <button id="edit-profile-toggle-btn" class="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors">
            Edit Credentials
          </button>
        </div>
      </div>
      <!-- Profile Overview Card -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div class="flex items-center space-x-4">
            <img src="${user.avatar}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md" />
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <h2 class="text-xl font-black text-slate-900">${user.name}</h2>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">${user.role}</span>
              </div>
              <div class="text-xs text-slate-500 font-mono">${user.rollNo || user.facultyId || user.adminId || 'AIT-STUDENT'} • Dept. of ${user.department || 'CSE'}</div>
              <div class="text-xs text-slate-600 font-medium">${user.year || '3rd Year'} • CGPA: <strong class="text-slate-900 font-bold">${user.cgpa || '9.0'}</strong></div>
            </div>
