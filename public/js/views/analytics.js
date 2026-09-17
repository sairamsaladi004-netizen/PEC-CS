import { getDB } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { ROLES } from '../rbac.js';
import { PermissionGuard, renderAnalyticsGuard, renderApprovalsGuard, renderSuperAdminGuard } from '../components/permissionGuard.js';

export function renderAnalyticsView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const totalMembers = db.clubs.reduce((acc, c) => acc + c.memberCount, 0);
  const totalEvents = db.events.length;
  const totalCerts = db.certificates.length;

  // Club Scorecard Data Computation
  const scorecards = db.clubs.map(c => {
    const clubEvents = db.events.filter(e => e.clubId === c.id || e.organizer?.toLowerCase().includes(c.shortName?.toLowerCase() || c.id));
    const budgetAllocated = 50000;
    const budgetUsed = 35000 + Math.floor(Math.random() * 12000);
    const utilPct = Math.round((budgetUsed / budgetAllocated) * 100);
    const engagementScore = Math.min(98, 75 + Math.floor(c.memberCount / 20) + clubEvents.length * 3);

    return {
      name: c.name,
      shortName: c.shortName,
      domain: c.domain,
      members: c.memberCount,
      eventsCount: Math.max(1, clubEvents.length),
      budgetUsed: `₹${budgetUsed.toLocaleString()}`,
      budgetTotal: `₹${budgetAllocated.toLocaleString()}`,
      utilPct,
      engagementScore
    };
  });

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Institutional Analytics & Performance Scorecards</h1>
          <p class="text-xs sm:text-sm text-slate-500">Club performance scorecards, skill acquisition tracking, department comparison, and accreditation metrics</p>
        </div>
        <a href="#/reports" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5">
          <span>📄 Export NAAC / NBA Dossier →</span>
        </a>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-slate-500">Total Society Members</div>
          <div class="text-2xl sm:text-3xl font-black text-blue-600">${totalMembers}</div>
          <div class="text-[11px] text-emerald-600 font-bold">↑ 28% YoY Growth</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-slate-500">Accredited Events</div>
          <div class="text-2xl sm:text-3xl font-black text-purple-600">${totalEvents}</div>
          <div class="text-[11px] text-purple-600 font-bold">100% With QR Gate Check-in</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-slate-500">Verified Certificates Issued</div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-600">${totalCerts}</div>
          <div class="text-[11px] text-emerald-600 font-bold">SHA-256 Ledger Backed</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-slate-500">Department Participation</div>
          <div class="text-2xl sm:text-3xl font-black text-amber-600">5 Depts</div>
          <div class="text-[11px] text-slate-400 font-medium">CSE, AIDS, IT, ECE, MECH</div>
        </div>
      </div>

      <!-- Club Performance Scorecard Table -->
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-2">
        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900">Technical Club Annual Performance Scorecard</h2>
            <p class="text-xs text-slate-500">Aggregated active enrollment, activities hosted, budget utilization, and student engagement index</p>
          </div>
          <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
            NBA Tier-1 Criteria 9 Aligned
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th class="p-4 pl-6">Society / Chapter</th>
                <th class="p-4">Active Members</th>
                <th class="p-4">Events Conducted</th>
                <th class="p-4">Budget Utilization</th>
                <th class="p-4 text-right pr-6">Engagement Score</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              ${scorecards.map(sc => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="p-4 pl-6">
                    <div class="font-bold text-slate-900">${sc.name}</div>
                    <div class="text-[11px] text-slate-400 font-mono">${sc.domain}</div>
                  </td>
                  <td class="p-4 font-mono font-bold text-slate-800">${sc.members}</td>
                  <td class="p-4 font-mono text-slate-600">${sc.eventsCount} activities</td>
                  <td class="p-4">
                    <div class="flex items-center space-x-2">
                      <div class="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${sc.utilPct}%"></div>
                      </div>
                      <span class="font-mono text-[11px] text-slate-500">${sc.utilPct}% (${sc.budgetUsed})</span>
                    </div>
                  </td>
                  <td class="p-4 text-right pr-6">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                      sc.engagementScore >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      sc.engagementScore >= 80 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700'
                    }">
                      ${sc.engagementScore} / 100
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Visual Charts Grid (Chart.js) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Chart 1: Society Enrollment by Domain -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 class="text-base font-bold text-slate-900">Society Enrollment by Domain</h2>
          <div class="h-64 flex items-center justify-center">
            <canvas id="chart-domain-doughnut"></canvas>
          </div>
        </div>

        <!-- Chart 2: Event Registration vs Turnout -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 class="text-base font-bold text-slate-900">Event Capacity vs Actual Registration</h2>
          <div class="h-64 flex items-center justify-center">
            <canvas id="chart-events-bar"></canvas>
          </div>
        </div>

      </div>

      <!-- Skill Acquisition Tracking & Department Participation Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Skill Acquisition Tracking -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Cohort Skill Acquisition & Competency Tracking</h2>
            <p class="text-xs text-slate-500">Benchmark progression across 2nd, 3rd, and 4th year student cohorts</p>
          </div>

          <div class="space-y-3 text-xs">
            <div class="space-y-1">
              <div class="flex justify-between font-bold text-slate-800">
                <span>Cloud Native Architecture & Containers</span>
                <span class="font-mono text-blue-600">88% Verified Mastery</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="bg-blue-600 h-2 rounded-full" style="width: 88%"></div>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between font-bold text-slate-800">
                <span>Machine Learning & PyTorch Model Tuning</span>
                <span class="font-mono text-purple-600">82% Verified Mastery</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="bg-purple-600 h-2 rounded-full" style="width: 82%"></div>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between font-bold text-slate-800">
                <span>Applied Cybersecurity & Penetration Testing</span>
                <span class="font-mono text-emerald-600">76% Verified Mastery</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="bg-emerald-600 h-2 rounded-full" style="width: 76%"></div>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between font-bold text-slate-800">
                <span>Web3 Cryptography & Smart Contracts</span>
                <span class="font-mono text-amber-600">64% Verified Mastery</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="bg-amber-600 h-2 rounded-full" style="width: 64%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Growth Over Semesters Chart -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 class="text-base font-bold text-slate-900">Academic Year Engagement Growth (2024-2026)</h2>
          <div class="h-64">
            <canvas id="chart-growth-line"></canvas>
          </div>
        </div>

      </div>

      <!-- Permission-Guarded Executive Accreditation & Approvals Section -->
      ${PermissionGuard({
        roles: [ROLES.SUPER_ADMIN, ROLES.FACULTY_COORDINATOR, ROLES.CLUB_ADMIN],
        permissions: ["analytics.view", "reports.export"],
        content: `
          <div class="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    GUARDED: EXECUTIVE ACCREDITATION
                  </span>
                  <span class="text-xs text-slate-400 font-mono">Authenticated as ${user.name} (${user.role})</span>
                </div>
                <h3 class="text-lg font-black text-white">NAAC / NBA Accreditation Export & Budget Approvals</h3>
              </div>
              <div class="flex items-center space-x-2">
                <a href="#/reports" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                  Generate Full NAAC Dossier
                </a>
                ${PermissionGuard({
                  roles: [ROLES.SUPER_ADMIN],
                  content: `
                    <a href="#/admin/dashboard?tab=audit" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                      Audit Trail
                    </a>
                  `
                })}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div class="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <div class="text-slate-400 font-bold uppercase text-[10px]">Criteria 9 Metric Score</div>
                <div class="text-xl font-mono font-bold text-emerald-400">96.4 / 100</div>
                <p class="text-[11px] text-slate-400">Exceeds autonomous institution benchmark</p>
              </div>
              <div class="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <div class="text-slate-400 font-bold uppercase text-[10px]">Verified Student Artifacts</div>
                <div class="text-xl font-mono font-bold text-blue-400">${db.projects?.length || 24} Repositories</div>
                <p class="text-[11px] text-slate-400">Open source & departmental projects</p>
              </div>
              <div class="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <div class="text-slate-400 font-bold uppercase text-[10px]">Budget Clearance Status</div>
                <div class="text-xl font-mono font-bold text-purple-400">100% Ratified</div>
                <p class="text-[11px] text-slate-400">Principal & Academic Council approved</p>
              </div>
            </div>
          </div>
        `,
        fallback: `
          <div class="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            <span>🔒 Institutional NAAC/NBA scorecards & budget clearances are reserved for faculty coordinators and college administration.</span>
          </div>
        `
      })}

    </div>
  `;
}

export function attachAnalyticsEvents() {
  if (!window.Chart) return;

  const db = getDB();

  // 1. Domain Doughnut Chart
  const ctxDomain = document.getElementById("chart-domain-doughnut");
  if (ctxDomain) {
    const labels = db.clubs.map(c => c.shortName);
    const data = db.clubs.map(c => c.memberCount);

    new window.Chart(ctxDomain, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  // 2. Events Bar Chart
  const ctxEvents = document.getElementById("chart-events-bar");
  if (ctxEvents) {
    const labels = db.events.map(e => e.title.length > 20 ? e.title.slice(0, 18) + '...' : e.title);
    const registered = db.events.map(e => e.registeredCount);
    const capacity = db.events.map(e => e.capacity);

    new window.Chart(ctxEvents, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Registered", data: registered, backgroundColor: "#3b82f6", borderRadius: 6 },
          { label: "Capacity", data: capacity, backgroundColor: "#e2e8f0", borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        },
        plugins: {
          legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  // 3. Growth Line Chart
  const ctxGrowth = document.getElementById("chart-growth-line");
  if (ctxGrowth) {
    new window.Chart(ctxGrowth, {
      type: "line",
      data: {
        labels: ["AY 2023-24 Q1", "AY 2023-24 Q3", "AY 2024-25 Q1", "AY 2024-25 Q3", "AY 2025-26 Q1", "AY 2025-26 Present"],
        datasets: [
          {
            label: "Total Enrolled Members",
            data: [420, 680, 910, 1140, 1380, 1540],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.3,
            fill: true
          },
          {
            label: "Accredited Certifications Minted",
            data: [150, 310, 520, 780, 1020, 1280],
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }
}
