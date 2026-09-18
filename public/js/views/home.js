import { getDB } from '../db.js';
import { getCurrentUser } from '../auth.js';

export function renderHomeView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const totalMembers = db.clubs.reduce((acc, c) => acc + c.memberCount, 0);
  const totalEvents = db.events.length;
  const totalProjects = db.projects.length;
  const totalCerts = db.certificates.length;
  const upcomingEvents = db.events.filter(e => e.status !== "Completed").slice(0, 3);
  const featuredProjects = db.projects.filter(p => p.featured).slice(0, 3);
  const pinnedAnnouncements = db.announcements.filter(a => a.pinned);

  return `
    <div class="space-y-8 pb-16">
      
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
            <a href="#/clubs" class="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2">
              <span>Explore Technical Clubs</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
            <a href="#/events" class="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all">
              Browse Hackathons
            </a>
            <a href="#/membership-card" class="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center space-x-2">
              <span>Digital ID Card</span>
            </a>
            <a href="#/verify" class="px-5 py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium transition-all">
              Verify QR Credential
            </a>
          </div>
        </div>
      </section>

      <!-- Institutional Metrics Dashboard -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-slate-500">Active Technical Societies</div>
          <div class="text-3xl font-black text-slate-900">${db.clubs.length}</div>
          <div class="text-[11px] text-emerald-600 font-bold">100% Accredited & Active</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-blue-600">Student Members Enrolled</div>
          <div class="text-3xl font-black text-blue-600">${totalMembers}</div>
          <div class="text-[11px] text-slate-400 font-medium">Across All Departments</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-purple-600">Events & Hackathons</div>
          <div class="text-3xl font-black text-purple-600">${totalEvents}</div>
          <div class="text-[11px] text-purple-600 font-bold">Real-time QR Attendance</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-emerald-600">Accredited QR Certificates</div>
          <div class="text-3xl font-black text-emerald-600">${totalCerts}</div>
          <div class="text-[11px] text-emerald-600 font-bold">SHA-256 Verifiable Proof</div>
        </div>
      </section>

      <!-- Upcoming Events & Hackathons -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Upcoming Events & Competitions</h2>
            <p class="text-xs text-slate-500">Official technical events with automated gate passes</p>
          </div>
          <a href="#/events" class="text-xs font-bold text-blue-600 hover:text-blue-700">View All Events →</a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${upcomingEvents.map(evt => {
            const isFull = evt.registeredCount >= evt.capacity;
            const club = db.clubs.find(c => c.id === evt.clubId);
            return `
              <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div class="relative h-40 overflow-hidden bg-slate-900">
                    <img src="${evt.banner}" alt="${evt.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 backdrop-blur-sm text-white">
                      ${evt.category}
                    </span>
                    <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${isFull ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}">
                      ${isFull ? 'Waitlist' : `${evt.registeredCount}/${evt.capacity} Registered`}
                    </span>
                  </div>
                  <div class="p-5 space-y-2">
                    <div class="text-[11px] text-blue-600 font-bold uppercase tracking-wider">${club ? club.shortName : 'Technical Society'}</div>
                    <h3 class="text-base font-bold text-slate-900 leading-snug">${evt.title}</h3>
                    <div class="text-xs text-slate-500 flex items-center space-x-1 font-mono">
                      <span>📅 ${evt.date}</span>
                      <span>•</span>
                      <span>📍 ${evt.venue}</span>
                    </div>
                  </div>
                </div>
                <div class="p-5 pt-0">
                  <a href="#/events" class="block w-full text-center py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors">
                    Register / View Details
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Featured Engineering Projects -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Featured Student Innovation</h2>
            <p class="text-xs text-slate-500">Peer-reviewed research and practical engineering prototypes</p>
          </div>
          <a href="#/projects" class="text-xs font-bold text-blue-600 hover:text-blue-700">Explore Projects Gallery →</a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${featuredProjects.map(proj => `
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div class="flex items-start justify-between">
                <div>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">${proj.domain}</span>
                  <h3 class="text-base font-bold text-slate-900 mt-2">${proj.title}</h3>
                  <div class="text-xs text-slate-500 mt-0.5 font-mono">Lead: ${proj.teamLeader} • Dept. of ${proj.department}</div>
                </div>
                <div class="flex items-center space-x-1 px-2 py-1 bg-amber-50 rounded-lg text-amber-700 text-xs font-bold">
                  <span>★</span>
                  <span>${proj.facultyReview?.rating || 5}.0</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">${proj.description}</p>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-400 font-medium">Reviewed by: ${proj.facultyReview?.reviewer || 'Faculty'}</span>
                <div class="flex items-center space-x-2">
                  ${proj.github ? `<a href="${proj.github}" target="_blank" class="text-slate-700 hover:text-black font-bold">GitHub Repo →</a>` : ''}
                  ${proj.demo ? `<a href="${proj.demo}" target="_blank" class="text-blue-600 hover:text-blue-800 font-bold">Live Demo →</a>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Quick Ecosystem Navigation Bento Grid -->
      <section class="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 class="text-xl font-black">Ecosystem Direct Access Hub</h2>
          <p class="text-xs text-slate-400">Jump directly into specialized platforms across the campus network</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <a href="#/lms" class="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-3 text-sm">📚</div>
            <div class="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">LMS Guides</div>
            <div class="text-[10px] text-slate-400 mt-1">Docker, Vision AI, Web3</div>
          </a>
          <a href="#/roadmaps" class="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3 text-sm">🗺️</div>
            <div class="font-bold text-xs text-white group-hover:text-purple-400 transition-colors">Career Roadmaps</div>
            <div class="text-[10px] text-slate-400 mt-1">Milestone checklist track</div>
          </a>
          <a href="#/tools" class="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3 text-sm">🛠️</div>
            <div class="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">Curated Tools</div>
            <div class="text-[10px] text-slate-400 mt-1">IDE, CLI, Dev software</div>
          </a>
          <a href="#/event-poster" class="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-3 text-sm">🎨</div>
            <div class="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">Poster Studio</div>
            <div class="text-[10px] text-slate-400 mt-1">Canvas dynamic exporter</div>
          </a>
        </div>
      </section>

    </div>
  `;
}

export function attachHomeEvents() {
  // Any home interaction listeners can be mounted here
}
