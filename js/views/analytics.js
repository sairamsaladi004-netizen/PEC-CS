import { getDB } from '../db.js';

export function renderAnalyticsView() {
  const db = getDB();
  const totalMembers = db.clubs.reduce((acc, c) => acc + c.memberCount, 0);
  const totalEvents = db.events.length;
  const totalCerts = db.certificates.length;

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Institutional Analytics & Metrics</h1>
          <p class="text-xs sm:text-sm text-slate-500">Live quantitative telemetry for NBA Criteria 9, NAAC SSR, and Student Engagement</p>
        </div>
        <a href="#/reports" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5">
          <span>📄 Export Accreditation Report →</span>
        </a>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div class="text-xs font-semibold text-slate-500">Total Society Members</div>
          <div class="text-2xl sm:text-3xl font-black text-blue-600">${totalMembers}</div>
          <div class="text-[11px] text-emerald-600 font-bold">↑ 24% YoY Growth</div>
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
          <h2 class="text-base font-bold text-slate-900">Event Registrations by Activity</h2>
          <div class="h-64 flex items-center justify-center">
            <canvas id="chart-events-bar"></canvas>
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
        labels: ["Spring 2024", "Fall 2024", "Spring 2025", "Fall 2025", "Spring 2026", "Fall 2026"],
        datasets: [
          {
            label: "Active Student Members",
            data: [640, 850, 1120, 1450, 1680, 1935],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.08)",
            fill: true,
            tension: 0.3,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: false, grid: { color: "#f1f5f9" } },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
