import { getDB } from '../db.js';
import { getCurrentUser } from '../auth.js';
export function renderHomeView() {
  const db = getDB();
  const user = getCurrentUser();
  const totalMembers = db.clubs.reduce((acc, c) => acc + c.memberCount, 0);
  const totalEvents = db.events.length;
  const totalProjects = db.projects.length;
  const totalCerts = db.certificates.length;
  const upcomingEvents = db.events.filter(e => e.status !== "Completed").slice(0, 3);
  const featuredProjects = db.projects.filter(p => p.featured).slice(0, 3);
  const pinnedAnnouncements = db.announcements.filter(a => a.pinned);
  return `
    <div class="space-y-8 pb-12">
      
      <!-- Critical Announcements Banner Ticker -->
      ${pinnedAnnouncements.length > 0 ? `
        <div class="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-white text-blue-800 rounded-full shrink-0 animate-pulse">Official Notice</span>
            <div class="text-xs sm:text-sm font-medium truncate">
              <span class="font-bold">${pinnedAnnouncements[0].title}</span> — ${pinnedAnnouncements[0].content}
            </div>
          </div>
          <a href="#/announcements" class="text-xs font-semibold underline hover:text-blue-200 shrink-0">Read Notice Board →</a>
        </div>
      ` : ''}
      <!-- Hero Banner Section -->
      <section class="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div class="relative z-10 max-w-3xl space-y-5">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span>Central Council of Technical Societies & Clubs (CCTSC)</span>
          </div>
          <h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            One Digital Ecosystem for <br class="hidden sm:block" />
            <span class="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Technical Innovation & Clubs
            </span>
          </h1>
          <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate fragmented spreadsheets and paper forms. Seamlessly discover technical societies, register for hackathons, earn verifiable QR certificates, showcase engineering projects, and build an accredited institutional portfolio.
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
