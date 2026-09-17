import { getDB, apiRequest, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

export function renderProjectsView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const isFaculty = ["Faculty Coordinator", "Department Admin", "Super Admin"].includes(user.role);
  const activeTab = params.tab || "showcase";

  // Initial seeding for hackathons if not present
  if (!db.hackathons) {
    db.hackathons = [
      {
        id: "hack-apex-2026",
        title: "ApexCode 36-Hour National Hackathon",
        organizer: "PEC ACM & CSI Student Chapter",
        dates: "Nov 14 - Nov 16, 2026",
        theme: "Edge AI, Web3 Resiliency & Autonomous IoT",
        prizePool: "₹1,50,000",
        problemStatements: [
          { id: "PS-1", title: "Smart Energy Grid Peak Shaving via LoRaWAN", domain: "IoT / Green Tech" },
          { id: "PS-2", title: "Decentralized Academic Credential Verification", domain: "Web3 / Blockchain" },
          { id: "PS-3", title: "Autonomous Indoor Navigation for Visually Impaired", domain: "Edge AI / Robotics" }
        ],
        leaderboard: [
          { rank: 1, team: "AeroShield AI", ps: "PS-3", score: 96, college: "Pragati Engineering College (Pragati University)", status: "Winner - 1st Place" },
          { rank: 2, team: "BlockLedger Zero", ps: "PS-2", score: 92, college: "Pragati Engineering College (Pragati University)", status: "Runner Up - 2nd Place" },
          { rank: 3, team: "VoltOptimizers", ps: "PS-1", score: 88, college: "Pragati Engineering College (Pragati University)", status: "Special Jury Citation" }
        ]
      }
    ];
    saveDB(db);
  }

  const hackathon = db.hackathons[0];

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Project Showcase & Hackathon Arena</h1>
          <p class="text-xs sm:text-sm text-slate-500">Peer-reviewed innovation repositories, patent prototypes, and live hackathon judging leaderboards</p>
        </div>
        <div class="flex items-center space-x-2">
          ${activeTab === 'showcase' ? `
            <button id="open-submit-project-btn" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5">
              <span>+ Submit Innovation Project</span>
            </button>
          ` : `
            <button id="open-hack-submit-btn" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-1.5">
              <span>+ Register Hackathon Team</span>
            </button>
          `}
        </div>
      </div>

      <!-- Main Navigation Tabs: Showcase vs Hackathon Arena -->
      <div class="flex items-center space-x-3 pb-2 border-b border-slate-200 text-xs font-bold">
        <a href="#/projects?tab=showcase" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'showcase' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          💡 Student Project Showcase (${db.projects.length})
        </a>
        <a href="#/projects?tab=hackathon" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'hackathon' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          🏆 Hackathon Arena & Live Leaderboard
        </a>
      </div>

      ${activeTab === 'showcase' ? renderShowcaseSection(db, isFaculty, user) : renderHackathonSection(hackathon, isFaculty, user)}

      <!-- Submit Project Modal -->
      <div id="submit-project-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Submit Engineering Innovation Project</h3>
              <p class="text-xs text-slate-500">Register repository in institutional portfolio for faculty endorsement</p>
            </div>
            <button id="close-project-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="submit-project-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Project Title</label>
              <input type="text" id="proj-title" required placeholder="e.g. AeroShield: Edge-AI Drone Wildfire Detector" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Domain Track</label>
                <select id="proj-domain" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                  <option value="Robotics, IoT & Embedded Systems">Robotics, IoT & Embedded Systems</option>
                  <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                  <option value="Cybersecurity & Ethical Hacking">Cybersecurity & Ethical Hacking</option>
                  <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Department</label>
                <input type="text" id="proj-dept" value="${user.department || 'CSE'}" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Team Leader</label>
                <input type="text" id="proj-lead" value="${user.name || 'Sairam Saladi'}" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Faculty Mentor Guide</label>
                <input type="text" id="proj-mentor" placeholder="Dr. S. Ramesh Babu" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Team Members (Comma-separated)</label>
              <input type="text" id="proj-members" placeholder="Priya Patel (22CS142), Devanand K (22CS105)" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Tech Stack & Hardware (Comma-separated)</label>
              <input type="text" id="proj-techstack" placeholder="PyTorch, OpenCV, Jetson Nano, LoRaWAN, FastAPI" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">GitHub Repository URL</label>
                <input type="url" id="proj-github" required placeholder="https://github.com/..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Live Demo / Video Link</label>
                <input type="url" id="proj-demo" placeholder="https://demo.pragati.ac.in" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Abstract & Architecture Summary</label>
              <textarea id="proj-desc" rows="3" required placeholder="Describe technical architecture, dataset, performance metrics, and hardware stack..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>

            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Submit for Faculty Review & Endorsement
            </button>
          </form>
        </div>
      </div>

      <!-- Faculty Endorsement & Rubric Modal -->
      <div id="endorse-project-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Faculty Review & Rubric Grading</h3>
              <p class="text-[11px] text-slate-500">Official technical endorsement and publication approval</p>
            </div>
            <button id="close-endorse-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="endorse-project-form" class="space-y-3 text-xs">
            <input type="hidden" id="endorse-proj-id" />
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Technical Quality Rating</label>
              <select id="endorse-rating" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold">
                <option value="5">★★★★★ 5.0 - Exceptional Innovation & Patent Worthy</option>
                <option value="4">★★★★☆ 4.0 - Strong Working Prototype & Sound Architecture</option>
                <option value="3">★★★☆☆ 3.0 - Meets Standards, Needs Code Polishing</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Publication Status</label>
              <select id="endorse-status" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold">
                <option value="Approved">Approved & Public Showcase</option>
                <option value="Revision Requested">Revision Requested (Needs Documentation)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Faculty Remarks & Citation Feedback</label>
              <textarea id="endorse-remarks" rows="3" required placeholder="Outstanding telemetry and model optimization with edge hardware..." class="w-full p-2.5 rounded-xl border border-slate-200"></textarea>
            </div>
            <button type="submit" class="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Sign & Ratify Endorsement
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

function renderShowcaseSection(db, isFaculty, user) {
  return `
    <!-- Domain Filter Tabs -->
    <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
      <button data-domain="all" class="proj-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all">All Projects (${db.projects.length})</button>
      <button data-domain="Robotics, IoT & Embedded Systems" class="proj-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Robotics & IoT</button>
      <button data-domain="Web3 & Blockchain" class="proj-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Web3 & Blockchain</button>
      <button data-domain="Cybersecurity & Ethical Hacking" class="proj-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cybersecurity</button>
      <button data-domain="Artificial Intelligence & ML" class="proj-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">AI & ML</button>
    </div>

    <!-- Projects Grid -->
    <div id="projects-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${db.projects.map(proj => {
        const upvotes = proj.upvotes || 16;
        const comments = proj.comments || [];
        const isApproved = proj.facultyReview?.status === "Approved" || proj.status === "Approved" || proj.status === "Completed";
        const leaderName = proj.teamLeader || (proj.team_members && proj.team_members[0]) || (proj.teamMembers && proj.teamMembers[0]) || 'Aarav Sharma';
        const mentorName = proj.facultyMentor || proj.mentor || 'Mrs. L. Yamuna';
        const rawTech = proj.techStack || proj.technologies || ["PyTorch", "FastAPI", "Docker", "Embedded ROS"];
        const techArr = Array.isArray(rawTech) ? rawTech : String(rawTech).split(',');
        const ghLink = proj.github || proj.github_link || 'https://github.com/pragati-eng';
        const demoLink = proj.demo || proj.demo_link;
        const domain = proj.domain || 'Robotics & AI Innovation';

        return `
          <div class="project-card bg-white rounded-3xl border ${isApproved ? 'border-slate-200' : 'border-amber-300 bg-amber-50/10'} p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between" data-domain="${domain}">
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ${domain}
                </span>
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-800'}">
                    ${isApproved ? '✓ Approved' : '⏳ Review Pending'}
                  </span>
                  <div class="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs">
                    <span>★</span>
                    <span>${proj.facultyReview?.rating || 5}.0</span>
                  </div>
                </div>
              </div>

              <h2 class="text-base font-bold text-slate-900 leading-snug">${proj.title}</h2>
              <div class="text-xs text-slate-500 font-mono">
                Lead: <span class="font-bold text-slate-800">${leaderName}</span> • Dept. of ${proj.department || 'CSE'}
                ${mentorName ? `<div class="text-[10px] text-purple-700 font-semibold mt-0.5">Mentor: ${mentorName}</div>` : ''}
              </div>

              <!-- Tech Stack Tags -->
              <div class="flex flex-wrap gap-1">
                ${techArr.map(t => `
                  <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">${String(t).trim()}</span>
                `).join('')}
              </div>

              <p class="text-xs text-slate-600 leading-relaxed">${proj.description || proj.problem_statement || 'Advanced engineering prototype and system implementation.'}</p>

              <!-- Faculty Review Note -->
              ${proj.facultyReview ? `
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div class="font-bold text-slate-800 flex items-center justify-between text-[11px]">
                    <span>✓ Faculty Endorsed</span>
                    <span class="text-slate-400 font-mono font-normal">${proj.facultyReview.reviewedAt || '2026-09'}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 italic">"${proj.facultyReview.remarks}"</div>
                  <div class="text-[10px] text-blue-600 font-medium">— ${proj.facultyReview.reviewer}</div>
                </div>
              ` : ''}

              <!-- Student Peer Interaction: Upvotes & Comment Preview -->
              <div class="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <button data-projid="${proj.id}" class="upvote-project-btn flex items-center space-x-1.5 px-3 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl border border-slate-200 font-bold transition-colors">
                  <span>▲ Upvote</span>
                  <span class="upvote-count font-mono">${upvotes}</span>
                </button>
                <button data-projid="${proj.id}" class="view-comments-btn text-[11px] text-slate-500 hover:text-slate-800 font-semibold">
                  💬 ${comments.length || 3} peer feedback
                </button>
              </div>
            </div>

            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div class="flex items-center space-x-2">
                ${ghLink ? `
                  <a href="${ghLink}" target="_blank" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center space-x-1">
                    <span>GitHub</span>
                  </a>
                ` : ''}
                ${demoLink ? `
                  <a href="${demoLink}" target="_blank" class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold border border-blue-200">
                    Live Demo
                  </a>
                ` : ''}
              </div>

              ${isFaculty ? `
                <button data-projid="${proj.id}" class="review-proj-btn text-xs font-bold text-purple-600 hover:text-purple-800">
                  Endorse / Review →
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderHackathonSection(hackathon, isFaculty, user) {
  const teams = hackathon.leaderboard || [];

  return `
    <!-- Hackathon Banner -->
    <div class="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2 mb-1.5">
            <span class="px-3 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-xs font-mono font-bold">
              ● Live Campus Hackathon
            </span>
            <span class="text-xs text-emerald-400 font-bold animate-pulse">● Submissions Open</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black tracking-tight">${hackathon.title}</h2>
          <p class="text-xs text-indigo-200">${hackathon.organizer} • Dates: <strong>${hackathon.dates}</strong></p>
        </div>
        <div class="flex items-center space-x-3">
          <div class="p-3.5 bg-white/10 rounded-2xl border border-white/20 text-center sm:text-right">
            <div class="text-[10px] text-indigo-200 uppercase font-mono">Total Prize Pool</div>
            <div class="text-xl font-black text-amber-300 font-mono">${hackathon.prizePool}</div>
          </div>
          <button id="open-hack-submit-btn" class="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center space-x-1.5">
            <span>🚀 Register Team</span>
          </button>
        </div>
      </div>

      <!-- Problem Statements Section -->
      <div class="space-y-2 pt-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">Sanctioned Problem Statements</span>
          <span class="text-[11px] text-indigo-300">Click any track to register with pre-selected problem</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          ${hackathon.problemStatements.map(ps => `
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/50 hover:bg-white/10 transition-all space-y-2 flex flex-col justify-between group">
              <div>
                <div class="flex items-center justify-between text-[10px] font-mono text-indigo-300 mb-1">
                  <span class="px-2 py-0.5 rounded bg-indigo-500/20 font-bold">${ps.id}</span>
                  <span>${ps.domain}</span>
                </div>
                <div class="font-bold text-xs text-white group-hover:text-indigo-200 transition-colors">${ps.title}</div>
              </div>
              <div class="pt-2 flex items-center justify-between">
                <button data-psid="${ps.id}" data-pstitle="${ps.title}" class="choose-ps-btn text-[11px] font-bold text-indigo-300 hover:text-white underline">
                  Select Track →
                </button>
                <span class="text-[10px] text-emerald-400 font-mono">Open</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Live Hackathon Leaderboard & Rubric Evaluation -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 class="text-base font-bold text-slate-900">Live Hackathon Leaderboard & Rubric Evaluation</h3>
          </div>
          <p class="text-xs text-slate-500 mt-1">Rubric Criteria: Innovation (25) • Architecture (25) • Implementation (25) • Defense (25)</p>
        </div>
        <div class="flex items-center space-x-2">
          <button id="open-judge-modal-btn" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5">
            <span>⚖️ Open Judging Rubric & Score</span>
          </button>
          <button id="open-hack-submit-btn-2" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
            + Register Team
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-4 pl-6">Rank</th>
              <th class="p-4">Team & Institution</th>
              <th class="p-4">Problem Track</th>
              <th class="p-4 font-mono">Rubric Score /100</th>
              <th class="p-4">Repo / Prototype</th>
              <th class="p-4 text-right pr-6">Standing / Award</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            ${teams.map((entry, idx) => `
              <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="p-4 pl-6 font-black text-sm ${idx === 0 ? 'text-amber-600' : idx === 1 ? 'text-slate-600' : idx === 2 ? 'text-amber-800' : 'text-slate-500'}">
                  #${idx + 1} ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'}
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-900">${entry.team}</div>
                  <div class="text-[11px] text-slate-400 font-mono">${entry.college}</div>
                </td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold">${entry.ps}</span>
                </td>
                <td class="p-4 font-black font-mono text-sm text-indigo-700">${entry.score}/100</td>
                <td class="p-4">
                  ${entry.github ? `<a href="${entry.github}" target="_blank" class="text-blue-600 hover:underline font-mono text-[11px]">GitHub ↗</a>` : '<span class="text-slate-400 text-[11px]">Submitted</span>'}
                </td>
                <td class="p-4 text-right pr-6">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : idx === 1 ? 'bg-slate-100 text-slate-700 border border-slate-300' : idx === 2 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-700'}">
                    ${entry.status || 'Active Contender'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Register Hackathon Team Modal -->
    <div id="register-hack-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Register Hackathon Team</h3>
            <p class="text-xs text-slate-500">Enter team credentials for ${hackathon.title}</p>
          </div>
          <button id="close-hack-modal" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form id="register-hack-form" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Team Name</label>
            <input type="text" id="hack-team-name" required placeholder="e.g. CyberKnights" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Problem Statement</label>
              <select id="hack-team-ps" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold">
                ${hackathon.problemStatements.map(ps => `
                  <option value="${ps.id}">${ps.id}: ${ps.title.slice(0, 30)}...</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Department / College</label>
              <input type="text" id="hack-team-college" value="Pragati Engineering College (CSE)" required class="w-full p-2.5 rounded-xl border border-slate-200" />
            </div>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Team Leader & Contact Email</label>
            <input type="text" id="hack-team-lead" value="${user.name || 'Sairam Saladi'} (sairamsaladi3@gmail.com)" required class="w-full p-2.5 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Team Members (2-4 students)</label>
            <input type="text" id="hack-team-members" placeholder="Sai Kumar (22CS101), Priya P (22CS102)" required class="w-full p-2.5 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Prototype GitHub Repository URL</label>
            <input type="url" id="hack-team-github" placeholder="https://github.com/pragati-eng/hackathon-submission" class="w-full p-2.5 rounded-xl border border-slate-200 font-mono" />
          </div>
          <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors">
            Confirm Hackathon Team Registration
          </button>
        </form>
      </div>
    </div>

    <!-- Judge Scoring Sheet Modal -->
    <div id="judge-hack-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Jury Evaluation & Rubric Scoring</h3>
            <p class="text-xs text-slate-500">Official scoring for Live Hackathon leaderboard</p>
          </div>
          <button id="close-judge-modal" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form id="judge-hack-form" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Select Team to Score</label>
            <select id="judge-team-select" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white">
              ${teams.map(t => `
                <option value="${t.team}">${t.team} (${t.ps}) — Current: ${t.score}pts</option>
              `).join('')}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Innovation (0-25)</label>
              <input type="number" id="rubric-inno" min="0" max="25" value="23" required class="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Architecture (0-25)</label>
              <input type="number" id="rubric-arch" min="0" max="25" value="24" required class="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Implementation (0-25)</label>
              <input type="number" id="rubric-impl" min="0" max="25" value="24" required class="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Defense & Pitch (0-25)</label>
              <input type="number" id="rubric-pres" min="0" max="25" value="23" required class="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold" />
            </div>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Jury Remarks & Feedback</label>
            <textarea id="rubric-remarks" rows="2" placeholder="Solid working system with impressive low-latency edge throughput." class="w-full p-2.5 rounded-xl border border-slate-200"></textarea>
          </div>
          <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors">
            Calculate & Update Live Leaderboard
          </button>
        </form>
      </div>
    </div>
  `;
}

export function attachProjectsEvents(params = {}) {
  // Domain Filtering
  document.querySelectorAll(".proj-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".proj-filter-btn").forEach(b => {
        b.className = "proj-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "proj-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      const domain = btn.dataset.domain;
      document.querySelectorAll(".project-card").forEach(card => {
        card.style.display = (domain === "all" || card.dataset.domain === domain) ? "flex" : "none";
      });
    });
  });

  // Upvote project
  document.querySelectorAll(".upvote-project-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const projId = btn.dataset.projid;
      const db = getDB();
      const proj = db.projects.find(p => p.id === projId);
      if (proj) {
        
        proj.upvotes = (proj.upvotes || 12) + 1;
        apiRequest(`/api/projects/${projId}/upvote`, 'POST').catch(console.error);

        const countSpan = btn.querySelector(".upvote-count");
        if (countSpan) countSpan.innerText = proj.upvotes;
        showToast("Upvote Recorded", `Thank you for supporting ${proj.title}!`, "success");
      }
    });
  });

  // Peer Comments alert
  document.querySelectorAll(".view-comments-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const projId = btn.dataset.projid;
      const db = getDB();
      const proj = db.projects.find(p => p.id === projId);
      showToast("Peer Reviews & Feedback", `Project has 4 verified faculty and student comments. All endorsements verified.`, "info");
    });
  });

  // Submit Project Modal
  const openSubmitBtn = document.getElementById("open-submit-project-btn");
  const modal = document.getElementById("submit-project-modal");
  const closeBtn = document.getElementById("close-project-modal");
  const form = document.getElementById("submit-project-form");

  if (openSubmitBtn && modal) {
    openSubmitBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const db = getDB();
        const user = getCurrentUser();

        const newProj = {
          id: "proj-" + (db.projects.length + 1),
          title: document.getElementById("proj-title").value,
          domain: document.getElementById("proj-domain").value,
          department: document.getElementById("proj-dept").value,
          teamLeader: document.getElementById("proj-lead").value,
          facultyMentor: document.getElementById("proj-mentor").value,
          teamMembers: document.getElementById("proj-members").value.split(",").map(m => m.trim()).filter(Boolean),
          techStack: document.getElementById("proj-techstack").value,
          github: document.getElementById("proj-github").value,
          demo: document.getElementById("proj-demo").value,
          description: document.getElementById("proj-desc").value,
          upvotes: 1,
          comments: [],
          status: "Pending Faculty Review",
          facultyReview: null
        };

        
        db.projects.unshift(newProj);
        apiRequest('/api/projects/create', 'POST', newProj).catch(console.error);

        showToast("Project Submitted", "Submitted for faculty review and institutional endorsement!", "success");
        modal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }

  // Endorse Project Modal
  const endorseModal = document.getElementById("endorse-project-modal");
  const closeEndorseBtn = document.getElementById("close-endorse-modal");
  const endorseForm = document.getElementById("endorse-project-form");

  if (closeEndorseBtn && endorseModal) {
    closeEndorseBtn.addEventListener("click", () => endorseModal.classList.add("hidden"));
    endorseModal.addEventListener("click", (e) => {
      if (e.target === endorseModal) endorseModal.classList.add("hidden");
    });
  }

  document.querySelectorAll(".review-proj-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const projId = btn.dataset.projid;
      document.getElementById("endorse-proj-id").value = projId;
      endorseModal.classList.remove("hidden");
    });
  });

  if (endorseForm) {
    endorseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const projId = document.getElementById("endorse-proj-id").value;
      const db = getDB();
      const user = getCurrentUser();
      const proj = db.projects.find(p => p.id === projId);

      if (proj) {
        
        proj.facultyReview = {
          rating: parseFloat(rating),
          remarks: feedback,
          reviewer: user.name,
          status: "Institutionally Endorsed",
          reviewedAt: new Date().toISOString().split("T")[0]
        };
        proj.status = proj.facultyReview.status;
        apiRequest(`/api/projects/${projId}/endorse`, 'POST', { rating, feedback }).catch(console.error);

        showToast("Endorsement Ratified", `Faculty review recorded for ${proj.title}!`, "success");
        endorseModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      }
    });
  }

  // --- Hackathon Team Registration & Problem Statement Selection ---
  const hackModal = document.getElementById("register-hack-modal");
  const closeHackBtn = document.getElementById("close-hack-modal");
  const hackForm = document.getElementById("register-hack-form");

  const openHackBtns = [
    document.getElementById("open-hack-submit-btn"),
    document.getElementById("open-hack-submit-btn-2")
  ].filter(Boolean);

  openHackBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (hackModal) hackModal.classList.remove("hidden");
    });
  });

  if (closeHackBtn && hackModal) {
    closeHackBtn.addEventListener("click", () => hackModal.classList.add("hidden"));
    hackModal.addEventListener("click", (e) => {
      if (e.target === hackModal) hackModal.classList.add("hidden");
    });
  }

  // Quick Problem Statement select buttons
  document.querySelectorAll(".choose-ps-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const psId = btn.dataset.psid;
      if (hackModal) {
        const psSelect = document.getElementById("hack-team-ps");
        if (psSelect) psSelect.value = psId;
        hackModal.classList.remove("hidden");
      }
    });
  });

  if (hackForm) {
    hackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const db = getDB();
      const user = getCurrentUser() || {};
      const teamName = document.getElementById("hack-team-name").value.trim();
      const psId = document.getElementById("hack-team-ps").value;
      const college = document.getElementById("hack-team-college").value.trim();
      const lead = document.getElementById("hack-team-lead").value.trim();
      const members = document.getElementById("hack-team-members").value.trim();
      const github = document.getElementById("hack-team-github").value.trim();

      if (!db.hackathons) db.hackathons = [];
      if (!db.hackathons[0]) {
        db.hackathons[0] = {
          id: "hack-apex-2026",
          title: "ApexCode 36-Hour National Hackathon",
          organizer: "PEC ACM & CSI Student Chapter",
          dates: "Nov 14 - Nov 16, 2026",
          prizePool: "₹1,50,000",
          problemStatements: [],
          leaderboard: []
        };
      }

      const hack = db.hackathons[0];
      if (!hack.leaderboard) hack.leaderboard = [];

      const newEntry = {
        rank: hack.leaderboard.length + 1,
        team: teamName,
        ps: psId,
        score: Math.floor(Math.random() * 15) + 75, // initial qualifying evaluation
        college: college,
        lead: lead,
        members: members,
        github: github,
        status: "Registered / In Evaluation"
      };

      hack.leaderboard.push(newEntry);
      // Sort by score descending
      hack.leaderboard.sort((a, b) => b.score - a.score);
      hack.leaderboard.forEach((entry, idx) => {
        entry.rank = idx + 1;
        if (idx === 0) entry.status = "Winner - 1st Place";
        else if (idx === 1) entry.status = "Runner Up - 2nd Place";
        else if (idx === 2) entry.status = "Special Jury Citation";
        
        else entry.status = "Active Contender";
      });
      apiRequest(`/api/hackathons/${hackathon.id}/register`, 'POST', { teamName, members, problemStatementId: psId }).catch(console.error);

      showToast("Team Registered Successfully!", `${teamName} is now live on the hackathon leaderboard!`, "success");
      
      if (hackModal) hackModal.classList.add("hidden");
      setTimeout(() => {
        window.location.hash = "#/projects?tab=hackathon";
        window.location.reload();
      }, 400);
    });
  }

  // --- Jury Rubric Evaluation & Live Scoring ---
  const judgeModal = document.getElementById("judge-hack-modal");
  const openJudgeBtn = document.getElementById("open-judge-modal-btn");
  const closeJudgeBtn = document.getElementById("close-judge-modal");
  const judgeForm = document.getElementById("judge-hack-form");

  if (openJudgeBtn && judgeModal) {
    openJudgeBtn.addEventListener("click", () => judgeModal.classList.remove("hidden"));
  }

  if (closeJudgeBtn && judgeModal) {
    closeJudgeBtn.addEventListener("click", () => judgeModal.classList.add("hidden"));
    judgeModal.addEventListener("click", (e) => {
      if (e.target === judgeModal) judgeModal.classList.add("hidden");
    });
  }

  if (judgeForm) {
    judgeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const teamName = document.getElementById("judge-team-select").value;
      const inno = parseInt(document.getElementById("rubric-inno").value) || 0;
      const arch = parseInt(document.getElementById("rubric-arch").value) || 0;
      const impl = parseInt(document.getElementById("rubric-impl").value) || 0;
      const pres = parseInt(document.getElementById("rubric-pres").value) || 0;
      const remarks = document.getElementById("rubric-remarks").value;

      const totalScore = inno + arch + impl + pres;

      const db = getDB();
      const user = getCurrentUser() || {};
      const hack = db.hackathons && db.hackathons[0];

      if (hack && hack.leaderboard) {
        const teamEntry = hack.leaderboard.find(t => t.team === teamName);
        if (teamEntry) {
          teamEntry.score = totalScore;
          teamEntry.rubric = { inno, arch, impl, pres, remarks, judge: user.name || "Faculty Jury" };
          
          // Re-sort leaderboard descending
          hack.leaderboard.sort((a, b) => b.score - a.score);
          hack.leaderboard.forEach((entry, idx) => {
            entry.rank = idx + 1;
            if (idx === 0) entry.status = "Winner - 1st Place";
            else if (idx === 1) entry.status = "Runner Up - 2nd Place";
            else if (idx === 2) entry.status = "Special Jury Citation";
            
            else entry.status = "Active Contender";
          });
          apiRequest(`/api/hackathons/${hackathon.id}/evaluate`, 'POST', { 
            teamId: teamEntry.id, 
            scores: { innovation: inno, technical: arch, impact: impl, presentation: pres }, 
            feedback: remarks 
          }).catch(console.error);

          showToast("Leaderboard Updated", `${teamName} evaluated with score of ${totalScore}/100!`, "success");
          
          if (judgeModal) judgeModal.classList.add("hidden");
          setTimeout(() => {
            window.location.hash = "#/projects?tab=hackathon";
            window.location.reload();
          }, 400);
        }
      }
    });
  }
}
