import { getDB, saveDB, logAudit, apiRequest } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { APP_CONFIG } from '../config.js';
import { getClubCompatibilityBreakdown } from '../intelligenceEngine.js';

export function renderClubsView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const selectedClubId = params.id;

  // Single Club Detail View
  if (selectedClubId) {
    const club = db.clubs.find(c => c.id === selectedClubId) || db.clubs[0];
    const userMemberships = user.id ? (db.club_memberships || []).filter(m => m.student_id === user.id || m.studentId === user.id) : [];
    const isMember = (user.clubs && user.clubs.includes(club.id)) || userMemberships.some(m => (m.club_id === club.id || m.clubId === club.id) && m.status === "Approved");
    const isPending = userMemberships.some(m => (m.club_id === club.id || m.clubId === club.id) && m.status === "Pending");
    const isFaculty = ["Faculty Coordinator", "Department Admin", "Super Admin"].includes(user.role);
    const isClubAdmin = user.role === "Club Admin" || user.adminForClub === club.id || isFaculty;
    const clubEvents = (db.events || []).filter(e => e.clubId === club.id);
    const executiveTeam = club.executiveTeam || [];

    // Category badge color
    const categoryBadgeClass = 
      club.category === "Industry 4.0" ? "bg-purple-100 text-purple-800 border-purple-200" :
      club.category === "Co-Curricular" ? "bg-blue-100 text-blue-800 border-blue-200" :
      "bg-amber-100 text-amber-800 border-amber-200";

    const formattedCreatedDate = new Date(club.createdAt || "2024-01-15").toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formattedUpdatedDate = new Date(club.updatedAt || "2026-09-17").toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return `
      <div class="space-y-6 pb-16">
        <!-- Back Navigation & Meta -->
        <div class="flex items-center justify-between">
          <a href="#/clubs" class="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">
            <span>← Back to All College Clubs</span>
          </a>
          <div class="flex items-center space-x-2 text-xs font-mono">
            <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">ID: ${club.id}</span>
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">● ${club.status || 'Active'}</span>
          </div>
        </div>

        <!-- Club Banner & Identity Header -->
        <div class="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl">
          <div class="h-48 sm:h-60 w-full relative">
            <img src="${club.banner || club.logo}" class="w-full h-full object-cover opacity-50" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
          </div>
          <div class="p-6 sm:p-8 -mt-20 sm:-mt-24 relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div class="flex items-start sm:items-end space-x-4">
              <img src="${club.logo}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-slate-900 shadow-xl object-cover bg-slate-800 shrink-0" />
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${categoryBadgeClass}">
                    ${club.category}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-slate-200 border border-white/20">
                    Dept: ${club.department}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ✓ Official Recognized Club
                  </span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">${club.name}</h1>
                <p class="text-xs text-slate-300">
                  Pragati Engineering College • Faculty Coordinator: <span class="font-bold text-white">${club.facultyCoordinator}</span>
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              ${isMember ? `
                <span class="px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                  <span>✓ Enrolled Member</span>
                </span>
              ` : isPending ? `
                <span class="px-4 py-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm">
                  <span>⏳ Request Sent (Waiting for Coordinator Approval)</span>
                </span>
              ` : `
                <button data-clubid="${club.id}" class="join-club-btn px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer">
                  + Request to Join Club
                </button>
              `}
              <a href="#/club-dashboard?id=${club.id}" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-1.5">
                <span>📊 Club Dashboard</span>
              </a>
              <a href="${club.officialReportUrl || APP_CONFIG.officialClubReportsUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 bg-blue-900/50 hover:bg-blue-800/60 text-blue-200 rounded-xl text-xs font-bold border border-blue-700/40 transition-colors flex items-center space-x-1.5">
                <span>Official Report ↗</span>
              </a>
            </div>
          </div>
        </div>

        <!-- TWO MAIN TIERS: OFFICIAL COLLEGE INFO vs ADMIN-CREATED INFO -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- LEFT / MAIN COLUMN -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- TIER 1: OFFICIAL COLLEGE INFORMATION -->
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center space-x-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <h2 class="text-sm sm:text-base font-bold text-slate-900">Official College Information</h2>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  Institutional Record
                </span>
              </div>

              <!-- Official Description -->
              <div class="space-y-2">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Institutional Charter & Mandate</h3>
                <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${club.description}</p>
              </div>

              <!-- Official Focus Areas -->
              <div class="space-y-2">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Key Focus & Competency Domains</h3>
                <div class="flex flex-wrap gap-2">
                  ${(club.focusAreas || []).map(area => `
                    <span class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-colors">
                      ${area}
                    </span>
                  `).join('')}
                </div>
              </div>

              <!-- Official Department & Coordinator Verification Box -->
              <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-blue-700">Designated Faculty Coordinator</div>
                  <div class="text-sm font-black text-slate-900">${club.facultyCoordinator}</div>
                  <div class="text-xs text-slate-600">Department of ${club.department}, Pragati Engineering College</div>
                </div>
                <div class="shrink-0 text-left sm:text-right">
                  <span class="inline-block px-3 py-1 bg-white text-blue-700 font-bold text-[11px] rounded-lg shadow-sm border border-blue-200">
                    Officially Endorsed
                  </span>
                </div>
              </div>
            </div>

            <!-- TIER 2: ADMIN-CREATED INFORMATION -->
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div class="flex items-center space-x-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h2 class="text-sm sm:text-base font-bold text-slate-900">Admin-Managed Club Operations</h2>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Admin Managed Section
                </span>
              </div>
              
              <p class="text-xs text-slate-500">
                The content below is managed by student club administrators and subject to periodic faculty coordinator review.
              </p>

              <!-- Student Executive Committee & Presidents -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Student Executive Committee</h3>
                  ${isClubAdmin ? `
                    <button id="add-team-member-btn" class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors">
                      + Nominate Student
                    </button>
                  ` : ''}
                </div>

                ${executiveTeam.length === 0 ? `
                  <div class="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs space-y-1">
                    <div class="font-semibold text-slate-700">No Student Office Bearers Appointed</div>
                    <div class="text-slate-400">Information will be updated by the club administrator.</div>
                  </div>
                ` : `
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    ${executiveTeam.map((exec, idx) => `
                      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 relative">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-slate-900 text-xs">${exec.name}</span>
                          <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">${exec.role}</span>
                        </div>
                        <div class="text-[11px] text-slate-500 font-mono">${exec.year || 'Student Member'} • ${exec.email || 'Email on file'}</div>
                        ${(isFaculty && exec.status === 'Pending Faculty Approval') ? `
                          <div class="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
                            <button data-clubid="${club.id}" data-memberindex="${idx}" class="approve-exec-btn px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                              Approve
                            </button>
                            <button data-clubid="${club.id}" data-memberindex="${idx}" class="reject-exec-btn px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-bold border border-rose-200">
                              Decline
                            </button>
                          </div>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>

              <!-- Scheduled Events & Activities -->
              <div class="space-y-3 pt-2">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Admin-Scheduled Activities & Workshops</h3>
                
                ${clubEvents.length === 0 ? `
                  <div class="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs space-y-1">
                    <div class="font-semibold text-slate-700">No Scheduled Activities</div>
                    <div class="text-slate-400">Information will be updated by the club administrator.</div>
                  </div>
                ` : `
                  <div class="space-y-2.5">
                    ${clubEvents.map(evt => `
                      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="space-y-1">
                          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800">${evt.category}</span>
                          <div class="font-bold text-slate-900 text-xs sm:text-sm">${evt.title}</div>
                          <div class="text-[11px] text-slate-500 font-mono">📅 ${evt.date} • 📍 ${evt.venue}</div>
                        </div>
                        <a href="#/events" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0 text-center">
                          View Details →
                        </a>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>

            </div>

          </div>

          <!-- RIGHT SIDEBAR: METADATA & ACCREDITATION -->
          <div class="space-y-6">
            
            ${user.role === 'Student' ? (() => {
              const compat = getClubCompatibilityBreakdown(user.id, club.id, db);
              return `
                <!-- AI Fit & Skill Alignment Card -->
                <div class="bg-gradient-to-br from-purple-900 to-indigo-950 p-6 rounded-3xl text-white shadow-md space-y-3.5 border border-purple-800/60">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black tracking-wider uppercase text-purple-300">AI Compatibility Engine</span>
                    <span class="px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 text-[10px] font-mono font-bold">
                      ${compat.compatibilityScore}% Match
                    </span>
                  </div>
                  <div>
                    <div class="text-xs text-purple-300 font-medium">Top Match Reason (Skills & Activities):</div>
                    <div class="text-lg font-black text-emerald-400 mt-0.5 flex items-center space-x-2">
                      <span>✨</span>
                      <span>${compat.oneWordReason || 'Synergy'}</span>
                    </div>
                  </div>
                  <div class="p-2.5 rounded-xl bg-purple-950/60 border border-purple-700/50 text-[11px] text-purple-200 space-y-1">
                    <div class="font-bold text-white">${compat.activityEvidence || 'Continuous student activity profile'}</div>
                    ${compat.matchingSkills?.length ? `
                      <div class="text-[10px] text-purple-300">Synergistic skills: <strong>${compat.matchingSkills.join(', ')}</strong></div>
                    ` : ''}
                  </div>
                </div>
              `;
            })() : ''}

            <!-- Official Verification & Accreditation Card -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <span>🛡️ Verification Certificate</span>
              </div>
              
              <div class="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  This club is an officially recognized technical society of <strong>Pragati Engineering College (Autonomous), Andhra Pradesh</strong> under the Career Guidance Cell and Academic Council.
                </p>
                <div class="pt-2 border-t border-slate-100 space-y-1.5 font-mono text-[11px]">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Club Registry ID:</span>
                    <span class="font-bold text-slate-800">${club.id}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Category:</span>
                    <span class="font-bold text-slate-800">${club.category}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Host Department:</span>
                    <span class="font-bold text-slate-800">${club.department}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Charter Date:</span>
                    <span class="text-slate-700">${formattedCreatedDate}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Last Verified:</span>
                    <span class="text-slate-700">${formattedUpdatedDate}</span>
                  </div>
                </div>
              </div>

              <a href="${club.officialReportUrl || APP_CONFIG.officialClubReportsUrl}" target="_blank" rel="noopener noreferrer" class="block w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs text-center rounded-xl border border-slate-200 transition-colors">
                Pragati Official Club Reports ↗
              </a>
            </div>

            <!-- Quick Access Links -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 class="font-bold text-slate-900">Student & Member Portals</h3>
              <a href="#/club-dashboard?id=${club.id}" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors">
                <span>Club Metrics & Department Stats</span>
                <span>→</span>
              </a>
              <a href="#/membership-card" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors">
                <span>View Digital Student Membership</span>
                <span>→</span>
              </a>
              <a href="#/reports" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors">
                <span>Accreditation & Dossiers</span>
                <span>→</span>
              </a>
            </div>

          </div>

        </div>

        <!-- Team Member Nomination Modal -->
        <div id="team-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 class="text-sm font-bold text-slate-900">Nominate Student Executive</h3>
              <button id="close-team-modal" class="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form id="team-member-form" class="space-y-3 text-xs" data-clubid="${club.id}">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Student Full Name</label>
                <input type="text" id="nominee-name" required class="w-full p-2.5 border border-slate-200 rounded-xl" placeholder="e.g., Sai Kumar" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Designated Role</label>
                <select id="nominee-role" required class="w-full p-2.5 border border-slate-200 rounded-xl bg-white">
                  <option value="Student Coordinator">Student Coordinator</option>
                  <option value="Technical Lead">Technical Lead</option>
                  <option value="Events Lead">Events Lead</option>
                  <option value="Creative & Media Head">Creative & Media Head</option>
                  <option value="Student President">Student President</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Academic Year & Department</label>
                <input type="text" id="nominee-year" required class="w-full p-2.5 border border-slate-200 rounded-xl" placeholder="e.g., 3rd Year CSE" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Official Student Email</label>
                <input type="email" id="nominee-email" required class="w-full p-2.5 border border-slate-200 rounded-xl" placeholder="student@pragati.ac.in" />
              </div>
              <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
                Submit Nomination for Review
              </button>
            </form>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // MAIN CLUBS DIRECTORY VIEW (35 Pragati Engineering College Clubs)
  // =========================================================================
  const industry4Clubs = db.clubs.filter(c => c.category === "Industry 4.0");
  const coCurricularClubs = db.clubs.filter(c => c.category === "Co-Curricular");
  const extraCurricularClubs = db.clubs.filter(c => c.category === "Extra-Curricular");

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2 text-xs font-bold text-blue-600 mb-1">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Pragati Engineering College, Andhra Pradesh</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Student Clubs & Technical Societies</h1>
          <p class="text-xs sm:text-sm text-slate-500">
            Official directory of 35 sanctioned technical, co-curricular and extra-curricular societies under the Career Guidance Cell.
          </p>
        </div>

        <div class="flex items-center space-x-2">
          <a href="${APP_CONFIG.officialClubReportsUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-sm transition-colors flex items-center space-x-1.5">
            <span>Official PEC Reports ↗</span>
          </a>
        </div>
      </div>

      <!-- Search & Filters Container -->
      <div class="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row gap-3">
          
          <!-- Search Input -->
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" 
              id="club-search-input" 
              placeholder="Search by club name, faculty coordinator, or focus area (e.g., Drone, AI, Green Building)..." 
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <!-- Department Filter Select -->
          <div class="w-full md:w-56">
            <select id="department-filter-select" class="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option value="all">All Departments (11 Branches)</option>
              ${(APP_CONFIG.departments || []).map(dept => `
                <option value="${dept.code}">${dept.code} - ${dept.name}</option>
              `).join('')}
            </select>
          </div>

        </div>

        <!-- Category Filter Tabs -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <button data-category="all" class="club-category-btn px-3.5 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all">
            All Clubs (${db.clubs.length})
          </button>
          <button data-category="Industry 4.0" class="club-category-btn px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
            Industry 4.0 (${industry4Clubs.length})
          </button>
          <button data-category="Co-Curricular" class="club-category-btn px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
            Co-Curricular (${coCurricularClubs.length})
          </button>
          <button data-category="Extra-Curricular" class="club-category-btn px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
            Extra-Curricular (${extraCurricularClubs.length})
          </button>
        </div>
      </div>

      <!-- Clubs Count Indicator -->
      <div class="flex items-center justify-between text-xs text-slate-500 px-1">
        <span id="clubs-count-display">Showing all ${db.clubs.length} official college clubs</span>
        <span class="text-slate-400 font-mono">Pragati Engineering College (Autonomous)</span>
      </div>

      <!-- Clubs Grid -->
      <div id="clubs-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${db.clubs.map(club => {
          const userMemberships = user.id ? (db.club_memberships || []).filter(m => m.student_id === user.id || m.studentId === user.id) : [];
          const isMember = (user.clubs && user.clubs.includes(club.id)) || userMemberships.some(m => (m.club_id === club.id || m.clubId === club.id) && m.status === "Approved");
          const isPending = userMemberships.some(m => (m.club_id === club.id || m.clubId === club.id) && m.status === "Pending");
          
          const categoryBadgeClass = 
            club.category === "Industry 4.0" ? "bg-purple-100 text-purple-800 border-purple-200" :
            club.category === "Co-Curricular" ? "bg-blue-100 text-blue-800 border-blue-200" :
            "bg-amber-100 text-amber-800 border-amber-200";

          return `
            <div 
              class="club-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between" 
              data-category="${club.category}" 
              data-department="${club.department}"
              data-name="${club.name.toLowerCase()}"
              data-coordinator="${(club.facultyCoordinator || '').toLowerCase()}"
              data-focus="${(club.focusAreas || []).join(' ').toLowerCase()}"
              data-id="${club.id}"
            >
              <div>
                <!-- Card Header Banner -->
                <div class="relative h-32 overflow-hidden bg-slate-900">
                  <img src="${club.banner || club.logo}" alt="${club.name}" class="w-full h-full object-cover opacity-60" />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  
                  <div class="absolute top-3 left-3">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900/90 text-white backdrop-blur-sm border border-slate-700">
                      ${club.id}
                    </span>
                  </div>

                  <div class="absolute top-3 right-3 flex items-center space-x-1.5">
                    ${user.role === 'Student' ? (() => {
                      const compat = getClubCompatibilityBreakdown(user.id, club.id, db);
                      return `
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-900/90 text-purple-200 backdrop-blur-sm border border-purple-500/50 flex items-center space-x-1.5 shadow-sm" title="AI Match: ${compat.compatibilityScore}% based on ${compat.oneWordReason}">
                          <span>🤖</span>
                          <span>${compat.compatibilityScore}%</span>
                          <span class="text-[9px] px-1 bg-purple-800/80 rounded text-purple-300 font-sans">${compat.oneWordReason || 'Synergy'}</span>
                        </span>
                      `;
                    })() : ''}
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900/90 text-white backdrop-blur-sm border border-slate-700">
                      Dept: ${club.department}
                    </span>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="p-6 space-y-3">
                  <div class="flex items-start space-x-3 -mt-12 relative z-10">
                    <img src="${club.logo}" alt="${club.name}" class="w-14 h-14 rounded-2xl border-2 border-white shadow-md object-cover bg-slate-800 shrink-0" />
                    <div>
                      <span class="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${categoryBadgeClass}">
                        ${club.category}
                      </span>
                      <h2 class="text-base font-black text-slate-900 leading-snug mt-0.5">${club.name}</h2>
                    </div>
                  </div>

                  <!-- Coordinator -->
                  <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Faculty Coordinator</span>
                      <span class="font-bold text-slate-900">${club.facultyCoordinator}</span>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-600">
                      ${club.department}
                    </span>
                  </div>

                  <!-- Description -->
                  <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${club.description}</p>

                  <!-- Focus Areas -->
                  <div class="flex flex-wrap gap-1 pt-1">
                    ${(club.focusAreas || []).slice(0, 3).map(f => `
                      <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200">
                        ${f}
                      </span>
                    `).join('')}
                    ${(club.focusAreas || []).length > 3 ? `
                      <span class="px-1.5 py-0.5 text-slate-400 text-[10px]">+${(club.focusAreas || []).length - 3}</span>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- Card Action Footer -->
              <div class="p-6 pt-0 flex items-center space-x-2">
                <a href="#/clubs?id=${club.id}" class="flex-1 text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors">
                  View Details
                </a>
                ${isMember ? `
                  <span class="px-3 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                    ✓ Member
                  </span>
                ` : isPending ? `
                  <span class="px-3 py-2.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 flex items-center space-x-1" title="Waiting for coordinator & club access approval">
                    <span>⏳</span>
                    <span>Request Sent</span>
                  </span>
                ` : `
                  <button data-clubid="${club.id}" class="join-club-btn px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                    Join
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

export function attachClubsEvents(params = {}) {
  // Category Filter Tabs
  let activeCategory = "all";
  let activeDept = "all";
  let searchQuery = "";

  function filterCards() {
    let visibleCount = 0;
    const cards = document.querySelectorAll(".club-card");
    cards.forEach(card => {
      const cardCategory = card.dataset.category || "";
      const cardDept = card.dataset.department || "";
      const cardName = card.dataset.name || "";
      const cardCoordinator = card.dataset.coordinator || "";
      const cardFocus = card.dataset.focus || "";

      const matchesCategory = activeCategory === "all" || cardCategory === activeCategory;
      const matchesDept = activeDept === "all" || cardDept === activeDept;
      const matchesSearch = !searchQuery || 
        cardName.includes(searchQuery) || 
        cardCoordinator.includes(searchQuery) || 
        cardFocus.includes(searchQuery) ||
        cardDept.toLowerCase().includes(searchQuery);

      if (matchesCategory && matchesDept && matchesSearch) {
        card.style.display = "flex";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    const countDisplay = document.getElementById("clubs-count-display");
    if (countDisplay) {
      countDisplay.textContent = `Showing ${visibleCount} official college club${visibleCount === 1 ? '' : 's'}`;
    }
  }

  // Category buttons
  document.querySelectorAll(".club-category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".club-category-btn").forEach(b => {
        b.className = "club-category-btn px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "club-category-btn px-3.5 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      activeCategory = btn.dataset.category;
      filterCards();
    });
  });

  // Department Select
  const deptSelect = document.getElementById("department-filter-select");
  if (deptSelect) {
    deptSelect.addEventListener("change", (e) => {
      activeDept = e.target.value;
      filterCards();
    });
  }

  // Search Input
  const searchInput = document.getElementById("club-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterCards();
    });
  }

  // Join Club Buttons
  document.querySelectorAll(".join-club-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const clubId = btn.dataset.clubid;
      const user = getCurrentUser();
      if (!user) {
        window.location.hash = "#/login";
        return;
      }
      const db = getDB();
      const club = (db.clubs || []).find(c => c.id === clubId);
      if (!club) return;

      btn.textContent = "Submitting Request...";
      btn.disabled = true;

      // Create or update membership in local database with status 'Pending'
      if (!db.club_memberships) db.club_memberships = [];
      const existingMemIndex = db.club_memberships.findIndex(m => (m.student_id === user.id || m.studentId === user.id) && (m.club_id === club.id || m.clubId === club.id));
      
      const newMembership = {
        id: "mem-" + Date.now(),
        membership_id: `PEC-REQ-2026-${(club.shortName || club.code || club.id || 'ENG').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        student_id: user.id,
        studentId: user.id,
        club_id: club.id,
        clubId: club.id,
        role: "Member",
        status: "Pending",
        requested_at: new Date().toISOString(),
        appliedDate: new Date().toISOString().split("T")[0],
        approved_at: null,
        approved_by: null,
        remarks: "Request submitted. Waiting for club and faculty coordinator review.",
        statement: `Applicant interest submitted by ${user.name} (${user.rollNo || user.department || 'Student'}).`,
        studentName: user.name,
        studentEmail: user.email,
        rollNo: user.rollNo || "22A31A0501",
        department: user.department || "Computer Science & Engineering",
        skills: user.skills || []
      };

      if (existingMemIndex >= 0) {
        db.club_memberships[existingMemIndex] = { ...db.club_memberships[existingMemIndex], ...newMembership };
      } else {
        db.club_memberships.unshift(newMembership);
      }

      // Record notification for coordinator
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: "notif-" + Date.now(),
        user_id: club.facultyCoordinator || "coordinator",
        title: "New Club Membership Request",
        message: `${user.name} (${user.rollNo || 'Student'}) requested to join ${club.name}. Review application in Coordinator Portal.`,
        category: "Membership",
        link: "#/coordinator-portal",
        time: "Just now",
        created_at: new Date().toISOString(),
        read: false
      });

      saveDB(db);

      // Trigger backend API endpoint
      await apiRequest('/api/memberships/request', 'POST', {
        studentId: user.id,
        clubId: club.id,
        statement: `Applicant interest submitted by ${user.name} (${user.rollNo || 'Student'}).`
      });

      logAudit(`${user.name} (${user.role})`, "Requested Club Membership", club.name, "Membership status: Pending review by Faculty Coordinator");
      showToast(
        "Request Sent to Club & Faculty Coordinator",
        `Your request to join ${club.name} has been sent. Waiting for access approval from the club leadership and faculty coordinator.`,
        "info"
      );

      btn.outerHTML = `
        <span class="px-3.5 py-2.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 flex items-center space-x-1.5 shadow-sm">
          <span>⏳</span>
          <span>Request Sent (Waiting for Access)</span>
        </span>
      `;
    });
  });

  // Team Member Nomination Modal
  const addTeamBtn = document.getElementById("add-team-member-btn");
  const teamModal = document.getElementById("team-modal");
  const closeModal = document.getElementById("close-team-modal");
  const teamForm = document.getElementById("team-member-form");
  if (addTeamBtn && teamModal) {
    addTeamBtn.addEventListener("click", () => teamModal.classList.remove("hidden"));
    if (closeModal) closeModal.addEventListener("click", () => teamModal.classList.add("hidden"));
    if (teamForm) {
      teamForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const clubId = teamForm.dataset.clubid;
        const name = document.getElementById("nominee-name").value.trim();
        const role = document.getElementById("nominee-role").value;
        const year = document.getElementById("nominee-year").value.trim();
        const email = document.getElementById("nominee-email").value.trim();
        
        const db = getDB();
        const club = db.clubs.find(c => c.id === clubId);
        if (club) {
          if (!club.executiveTeam) club.executiveTeam = [];
          club.executiveTeam.push({
            name,
            role,
            year,
            email,
            tenure: "2025-2026",
            status: "Pending Faculty Approval"
          });
          saveDB(db);
          logAudit("Club Admin", "Nominated Student Executive", `${club.name} - ${name}`, `Proposed role: ${role}`);
          showToast("Nomination Submitted", `${name} nominated for ${role}. Pending review.`, "success");
          teamModal.classList.add("hidden");
          setTimeout(() => window.location.reload(), 300);
        }
      });
    }
  }

  // Faculty Approval for Executive
  document.querySelectorAll(".approve-exec-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const clubId = btn.dataset.clubid;
      const memberIdx = parseInt(btn.dataset.memberindex, 10);
      const db = getDB();
      const club = db.clubs.find(c => c.id === clubId);
      if (club && club.executiveTeam && club.executiveTeam[memberIdx]) {
        club.executiveTeam[memberIdx].status = "Approved";
        saveDB(db);
        logAudit("Faculty Coordinator", "Approved Executive Appointment", `${club.name} - ${club.executiveTeam[memberIdx].name}`, `Endorsed ${club.executiveTeam[memberIdx].role}`);
        showToast("Executive Approved", `${club.executiveTeam[memberIdx].name} appointment ratified.`, "success");
        setTimeout(() => window.location.reload(), 200);
      }
    });
  });

  document.querySelectorAll(".reject-exec-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const clubId = btn.dataset.clubid;
      const memberIdx = parseInt(btn.dataset.memberindex, 10);
      const db = getDB();
      const club = db.clubs.find(c => c.id === clubId);
      if (club && club.executiveTeam && club.executiveTeam[memberIdx]) {
        club.executiveTeam[memberIdx].status = "Rejected";
        saveDB(db);
        logAudit("Faculty Coordinator", "Rejected Executive Nomination", `${club.name} - ${club.executiveTeam[memberIdx].name}`, "Nomination declined.");
        showToast("Nomination Declined", "Executive nomination status updated.", "info");
        setTimeout(() => window.location.reload(), 200);
      }
    });
  });
}
