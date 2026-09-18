import { getDB } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { computeLocalClubEngagementScore, computeLocalTimingOptimization, computeLocalEventIdeas } from '../intelligenceEngine.js';

export function renderHomeView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const totalMembers = db.clubs ? db.clubs.reduce((acc, c) => acc + (c.memberCount || 20), 0) : 0;
  const totalEvents = db.events ? db.events.length : 0;
  const totalProjects = db.projects ? db.projects.length : 0;
  const totalCerts = db.certificates ? db.certificates.length : 0;
  
  const upcomingEvents = (db.events || []).filter(e => e.status !== "Completed").slice(0, 3);
  const featuredProjects = (db.projects || []).filter(p => p.featured || p.status === "Completed").slice(0, 3);
  const pinnedAnnouncements = (db.announcements || []).filter(a => a.pinned || a.priority === "critical");
  const topClubs = (db.clubs || []).slice(0, 4);

  // Compute live intelligence for default club
  const sampleClubId = user.clubId || (user.assignedClubs && user.assignedClubs[0]) || "I4-08";
  const intelligenceScore = computeLocalClubEngagementScore(sampleClubId, db);
  const timingOpt = computeLocalTimingOptimization(sampleClubId, db);
  const bestSlot = timingOpt?.bestSlotOverall;
  const eventIdeas = computeLocalEventIdeas(sampleClubId, db);

  const announcement = pinnedAnnouncements[0] || (db.announcements && db.announcements[0]) || {
    title: "Official Pragati Engineering College Club Directory 2025-2026",
    content: "All 35 official college clubs across Industry 4.0, Co-Curricular, and Extra-Curricular categories are chartered under the Career Guidance Cell.",
    message: "All 35 official college clubs across Industry 4.0, Co-Curricular, and Extra-Curricular categories are chartered under the Career Guidance Cell."
  };

  const noticeText = announcement.content || announcement.message || announcement.description || "Official Pragati Engineering College Club Directory chartered for 2025-2026.";

  return `
    <div class="space-y-8 pb-16">
      
      <!-- Critical Announcements Banner Ticker -->
      <div class="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center space-x-3 overflow-hidden">
          <span class="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-white text-blue-800 rounded-full shrink-0 animate-pulse">Official Notice</span>
          <div class="text-xs sm:text-sm font-medium truncate">
            <span class="font-bold">${announcement.title || 'Official Notice'}</span> — ${noticeText}
          </div>
        </div>
        <a href="#/announcements" class="text-xs font-semibold underline hover:text-blue-200 shrink-0">Read Notice Board →</a>
      </div>

      <!-- Hero Banner Section -->
      <section class="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div class="relative z-10 max-w-4xl space-y-5">
          <div class="flex flex-wrap items-center gap-2">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span>Central Council of Technical Societies & Clubs (CCTSC)</span>
            </div>
            ${user.name ? `
              <span class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-bold">
                Logged in as: ${user.name} (${user.role || 'Member'})
              </span>
            ` : ''}
          </div>

          <h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            One Digital Ecosystem for <br class="hidden sm:block" />
            <span class="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Technical Innovation & Clubs
            </span>
          </h1>

          <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Eliminate fragmented spreadsheets and paper forms. Seamlessly discover technical societies, register for hackathons, earn verifiable QR certificates, showcase engineering projects, and build an accredited institutional portfolio.
          </p>

          <div class="flex flex-wrap gap-3 pt-2">
            <a href="#/clubs" class="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2">
              <span>Explore Technical Clubs (${db.clubs.length})</span>
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
            ${user.role === 'Club Coordinator' || user.role === 'Admin' || user.role === 'Faculty' ? `
              <a href="#/coordinator" class="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center space-x-2">
                <span>Faculty Coordinator Portal →</span>
              </a>
            ` : ''}
          </div>
        </div>
      </section>

      <!-- Institutional Metrics Dashboard -->
      <section class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-slate-500">Active Technical Societies</div>
          <div class="text-3xl font-black text-slate-900">${db.clubs.length}</div>
          <div class="text-[11px] text-emerald-600 font-bold">100% Accredited & Active</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-blue-600">Student Members Enrolled</div>
          <div class="text-3xl font-black text-blue-600">${totalMembers}</div>
          <div class="text-[11px] text-slate-400 font-medium">Across All 11 Departments</div>
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
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div class="text-xs font-semibold text-amber-600">Engineering Projects</div>
          <div class="text-3xl font-black text-amber-600">${totalProjects}</div>
          <div class="text-[11px] text-amber-700 font-bold">Peer & Faculty Reviewed</div>
        </div>
      </section>

      <!-- AI Intelligence & Live Analytics Overview -->
      ${intelligenceScore ? `
        <section class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/50 shadow-xl space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/40 pb-5">
            <div>
              <div class="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                🤖 Intelligence & Engagement Engine
              </div>
              <h2 class="text-xl font-bold">Campus Engagement & AI Analytics Snapshot</h2>
              <p class="text-xs text-slate-400">Live 5-pillar mathematical evaluation for ${intelligenceScore.clubName}</p>
            </div>
            <div class="flex items-center space-x-3">
              <div class="text-right">
                <div class="text-2xl font-black text-emerald-400">${intelligenceScore.totalScore} / 100</div>
                <div class="text-[11px] font-bold text-slate-300">${intelligenceScore.gradeTitle} (${intelligenceScore.grade})</div>
              </div>
              <a href="#/analytics" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shrink-0">
                Full Analytics Dashboard →
              </a>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Optimal Window -->
            <div class="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 space-y-2">
              <div class="text-xs font-bold text-indigo-400 uppercase tracking-wider">📅 Optimal Event Window</div>
              <div class="text-lg font-bold text-white">${bestSlot ? `${bestSlot.day}, ${bestSlot.timeWindow}` : 'Saturday Afternoon'}</div>
              <div class="text-xs text-emerald-400 font-bold">${bestSlot?.turnoutBoostText || '+28% Higher Turnout'}</div>
              <p class="text-[11px] text-slate-300 leading-relaxed">${bestSlot?.conflictExplanation || 'Zero academic lecture clashes. Peak student participation.'}</p>
            </div>

            <!-- Recommended Activity Idea -->
            <div class="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 space-y-2">
              <div class="text-xs font-bold text-sky-400 uppercase tracking-wider">💡 AI Event Recommendation</div>
              <div class="text-sm font-bold text-white">${eventIdeas[0]?.title || 'Hands-on Innovation Bootcamp'}</div>
              <div class="text-xs text-amber-300 font-bold">Expected Appeal Score: ${eventIdeas[0]?.expectedAppealScore || 94}%</div>
              <p class="text-[11px] text-slate-300 leading-relaxed">${eventIdeas[0]?.reason || 'Correlated with high historical Saturday attendance.'}</p>
            </div>

            <!-- 5-Pillars Quick Bar -->
            <div class="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 space-y-3">
              <div class="text-xs font-bold text-purple-400 uppercase tracking-wider">📊 5-Pillar Score Breakdown</div>
              <div class="space-y-1.5 text-xs">
                ${intelligenceScore.pillars.map(p => `
                  <div class="flex items-center justify-between">
                    <span class="text-slate-300 text-[11px]">${p.name}</span>
                    <span class="font-mono font-bold text-white">${p.contribution}/${p.max}</span>
                  </div>
                  <div class="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-blue-400 h-1.5 rounded-full" style="width: ${p.score}%"></div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </section>
      ` : ''}

      <!-- Featured Technical Clubs & Societies Directory -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Official Technical Societies & Clubs</h2>
            <p class="text-xs text-slate-500">Chartered under Industry 4.0 & Academic Co-Curricular Framework</p>
          </div>
          <a href="#/clubs" class="text-xs font-bold text-blue-600 hover:text-blue-700">View All 35 Clubs →</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          ${topClubs.map(c => `
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">${c.category || 'Industry 4.0'}</span>
                  <span class="text-[11px] font-bold text-slate-400 font-mono">${c.code || c.id}</span>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900 leading-snug">${c.name}</h3>
                  <div class="text-xs text-slate-500 mt-1 font-mono">Dept: ${c.department || 'Multidisciplinary'}</div>
                </div>
                <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${c.description || 'Official college technical society fostering hands-on engineering prototypes and hackathon teams.'}</p>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div class="text-[10px] text-slate-400">Coordinator</div>
                  <div class="font-bold text-slate-700 text-[11px] truncate max-w-[120px]">${c.facultyCoordinator || 'Faculty Lead'}</div>
                </div>
                <a href="#/clubs" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] transition-colors">
                  Details →
                </a>
              </div>
            </div>
          `).join('')}
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
            const club = db.clubs.find(c => c.id === evt.clubId || c.id === evt.club_id);
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
                    <div class="text-[11px] text-blue-600 font-bold uppercase tracking-wider">${club ? club.shortName || club.name : 'Technical Society'}</div>
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

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${featuredProjects.map(proj => `
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">${proj.domain || 'Engineering'}</span>
                    <h3 class="text-base font-bold text-slate-900 mt-2">${proj.title}</h3>
                    <div class="text-xs text-slate-500 mt-0.5 font-mono">Lead: ${proj.teamLeader} • Dept. of ${proj.department}</div>
                  </div>
                  <div class="flex items-center space-x-1 px-2 py-1 bg-amber-50 rounded-lg text-amber-700 text-xs font-bold shrink-0">
                    <span>★</span>
                    <span>${proj.facultyReview?.rating || 5}.0</span>
                  </div>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">${proj.description}</p>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-400 font-medium truncate max-w-[140px]">Mentor: ${proj.facultyMentor || proj.mentor || 'Faculty'}</span>
                <div class="flex items-center space-x-2 shrink-0">
                  ${proj.github ? `<a href="${proj.github}" target="_blank" class="text-slate-700 hover:text-black font-bold">GitHub →</a>` : ''}
                  ${proj.demo ? `<a href="${proj.demo}" target="_blank" class="text-blue-600 hover:text-blue-800 font-bold">Demo →</a>` : ''}
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

        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-left">
          <a href="#/lms" class="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-2 text-sm">📚</div>
            <div class="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">LMS Guides</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Docker & AI</div>
          </a>
          <a href="#/roadmaps" class="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-2 text-sm">🗺️</div>
            <div class="font-bold text-xs text-white group-hover:text-purple-400 transition-colors">Roadmaps</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Skill Track</div>
          </a>
          <a href="#/tools" class="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-2 text-sm">🛠️</div>
            <div class="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">Dev Tools</div>
            <div class="text-[10px] text-slate-400 mt-0.5">IDEs & CLIs</div>
          </a>
          <a href="#/event-poster" class="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-2 text-sm">🎨</div>
            <div class="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">Poster Studio</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Exporter</div>
          </a>
          <a href="#/analytics" class="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-2 text-sm">📈</div>
            <div class="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors">Analytics</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Trends</div>
          </a>
          <a href="#/verify" class="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold mb-2 text-sm">📜</div>
            <div class="font-bold text-xs text-white group-hover:text-teal-400 transition-colors">QR Certs</div>
            <div class="text-[10px] text-slate-400 mt-0.5">SHA-256</div>
          </a>
          <a href="#/announcements" class="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mb-2 text-sm">📋</div>
            <div class="font-bold text-xs text-white group-hover:text-rose-400 transition-colors">Notices</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Directives</div>
          </a>
          <a href="#/membership-card" class="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all group">
            <div class="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold mb-2 text-sm">🆔</div>
            <div class="font-bold text-xs text-white group-hover:text-sky-400 transition-colors">Digital ID</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Pass Card</div>
          </a>
        </div>
      </section>

    </div>
  `;
}

export function attachHomeEvents() {
  // Any home interaction listeners can be mounted here
}
