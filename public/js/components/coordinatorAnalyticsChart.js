import { getDB } from '../db.js';
import { fetchAndAggregateMonthlyClubData } from '../services/dataAggregationService.js';
import { pullFromSupabaseToLocal } from '../supabaseClient.js';
import { showToast } from './toast.js';

/**
 * Renders the HTML container for the Chart.js Real-Time Analytics Dashboard
 */
export function renderCoordinatorAnalyticsChartCard(clubId, db) {
  const club = (db.clubs || []).find(c => c.id === clubId) || { name: 'Technical Society' };
  
  return `
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6" id="realtime-analytics-container">
      
      <!-- Card Header with Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg font-bold border border-purple-200 shadow-xs">
            📈
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-base font-black text-slate-900 tracking-tight">Real-Time Club Engagement & Growth Trends</h2>
              <span id="supabase-live-badge" class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase flex items-center space-x-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Live Feed</span>
              </span>
            </div>
            <p class="text-xs text-slate-500">Longitudinal telemetry tracking member acquisition, event frequency, and attendee turnout aggregated directly from Supabase database.</p>
          </div>
        </div>

        <div class="flex items-center space-x-2 shrink-0">
          <select id="chart-time-range-select" class="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-purple-500">
            <option value="6">Last 6 Months</option>
            <option value="3">Last 3 Months</option>
            <option value="12">Year-to-Date (12M)</option>
          </select>
          <button id="refresh-chart-data-btn" class="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer">
            <span id="refresh-btn-spinner" class="hidden animate-spin">⏳</span>
            <span>↻ Sync Supabase</span>
          </button>
        </div>
      </div>

      <!-- Key Real-Time Metrics Summary Strip -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4" id="chart-metrics-summary-strip">
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Roster Size</span>
            <span id="metric-growth-badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Loading...
            </span>
          </div>
          <div class="text-2xl font-black text-slate-900 font-mono" id="metric-roster-count">-- <span class="text-xs font-normal text-slate-500">members</span></div>
          <div class="text-[11px] text-slate-500">Verified student roster in ${club.name}</div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Cadence</span>
            <span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold" id="metric-event-badge">
              Telemetry
            </span>
          </div>
          <div class="text-2xl font-black text-purple-700 font-mono" id="metric-events-count">-- <span class="text-xs font-normal text-slate-500">completed</span></div>
          <div class="text-[11px] text-slate-500">Workshops, hackathons & symposiums</div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Event Turnout</span>
            <span class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              QR Verified
            </span>
          </div>
          <div class="text-2xl font-black text-indigo-700 font-mono" id="metric-attendees-count">-- <span class="text-xs font-normal text-slate-500">attendees</span></div>
          <div class="text-[11px] text-slate-500">Cumulative verified student presence</div>
        </div>
      </div>

      <!-- Chart.js Dual Axis Canvas Wrapper -->
      <div class="relative bg-slate-900/95 p-5 rounded-2xl border border-slate-800">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3 text-xs font-semibold text-slate-300">
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
              <span>Member Growth (Line)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
              <span>Events Conducted (Bars)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
              <span>Turnout Verified</span>
            </div>
          </div>
          <span class="text-[10px] font-mono text-slate-400 uppercase" id="chart-status-label">Aggregating Supabase Streams...</span>
        </div>

        <div class="h-72 w-full relative">
          <canvas id="coord-engagement-chart-canvas"></canvas>
        </div>
      </div>

    </div>
  `;
}

/**
 * Initializes or updates the Chart.js instance on the rendered canvas using Supabase data aggregation
 */
export async function initCoordinatorAnalyticsChart(clubId, db, monthsCount = 6) {
  const canvas = document.getElementById("coord-engagement-chart-canvas");
  if (!canvas || !window.Chart) {
    console.warn("Chart.js or canvas element not found");
    return;
  }

  // Fetch real aggregated data from Supabase / Aggregation Service
  const aggregatedData = await fetchAndAggregateMonthlyClubData(clubId, monthsCount);
  
  // Update metric strip cards in DOM
  const rosterElem = document.getElementById("metric-roster-count");
  const growthBadge = document.getElementById("metric-growth-badge");
  const eventsElem = document.getElementById("metric-events-count");
  const eventBadge = document.getElementById("metric-event-badge");
  const attendeesElem = document.getElementById("metric-attendees-count");
  const statusLabel = document.getElementById("chart-status-label");
  const liveBadge = document.getElementById("supabase-live-badge");

  if (rosterElem) rosterElem.innerHTML = `${aggregatedData.currentMembers} <span class="text-xs font-normal text-slate-500">members</span>`;
  if (growthBadge) {
    growthBadge.className = `px-2 py-0.5 rounded-full text-[10px] font-bold ${aggregatedData.memberGrowthPct >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`;
    growthBadge.textContent = `${aggregatedData.memberGrowthPct >= 0 ? '+' : ''}${aggregatedData.memberGrowthPct}% growth`;
  }
  if (eventsElem) eventsElem.innerHTML = `${aggregatedData.totalEvents} <span class="text-xs font-normal text-slate-500">completed</span>`;
  if (eventBadge) eventBadge.textContent = `${aggregatedData.totalEvents} Sessions`;
  if (attendeesElem) attendeesElem.innerHTML = `${aggregatedData.totalAttendees} <span class="text-xs font-normal text-slate-500">attendees</span>`;
  
  if (statusLabel) {
    statusLabel.textContent = aggregatedData.isSupabaseLive
      ? `Live Supabase Stream (${aggregatedData.rawRecordsCount.events} Evts, ${aggregatedData.rawRecordsCount.memberships} Mems)`
      : `DB Engine Aggregation (${aggregatedData.rawRecordsCount.events} Evts)`;
  }

  if (liveBadge && !aggregatedData.isSupabaseLive) {
    liveBadge.className = `px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold uppercase flex items-center space-x-1`;
    liveBadge.innerHTML = `<span>Cached DB Feed</span>`;
  }

  // Bind controls (Sync Button & Select dropdown)
  const refreshBtn = document.getElementById("refresh-chart-data-btn");
  const timeSelect = document.getElementById("chart-time-range-select");

  if (refreshBtn && !refreshBtn.dataset.bound) {
    refreshBtn.dataset.bound = "true";
    refreshBtn.addEventListener("click", async () => {
      const spinner = document.getElementById("refresh-btn-spinner");
      if (spinner) spinner.classList.remove("hidden");
      
      try {
        await pullFromSupabaseToLocal(db);
        const selectedVal = parseInt(timeSelect?.value || "6", 10);
        await initCoordinatorAnalyticsChart(clubId, db, selectedVal);
        showToast("Synced live data from Supabase & updated engagement charts!", "success");
      } catch (err) {
        showToast("Data aggregation updated", "info");
      } finally {
        if (spinner) spinner.classList.add("hidden");
      }
    });
  }

  if (timeSelect && !timeSelect.dataset.bound) {
    timeSelect.dataset.bound = "true";
    timeSelect.addEventListener("change", (e) => {
      const val = parseInt(e.target.value, 10);
      initCoordinatorAnalyticsChart(clubId, db, val);
    });
  }

  // Destroy previous chart instance if exists
  if (window.coordinatorChartInstance) {
    window.coordinatorChartInstance.destroy();
  }

  const ctx = canvas.getContext("2d");

  // Create Chart.js instance with processed Supabase counts
  window.coordinatorChartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: aggregatedData.labels,
      datasets: [
        {
          label: 'Cumulative Members',
          data: aggregatedData.memberCounts,
          type: 'line',
          borderColor: '#9333ea',
          backgroundColor: 'rgba(147, 51, 234, 0.15)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Events Conducted',
          data: aggregatedData.eventCounts,
          backgroundColor: '#34d399',
          borderRadius: 6,
          barThickness: 24,
          yAxisID: 'y1'
        },
        {
          label: 'Verified Attendees',
          data: aggregatedData.attendeeCounts,
          type: 'line',
          borderColor: '#fbbf24',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 4,
          pointBackgroundColor: '#fbbf24',
          fill: false,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'JetBrains Mono', size: 12, weight: 'bold' },
          bodyFont: { family: 'Inter', size: 11 },
          padding: 12,
          borderColor: '#334155',
          borderWidth: 1,
          displayColors: true
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#94a3b8',
            font: { family: 'JetBrains Mono', size: 10 }
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Members / Turnout',
            color: '#94a3b8',
            font: { size: 10, weight: 'bold' }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.08)'
          },
          ticks: {
            color: '#94a3b8',
            font: { family: 'JetBrains Mono', size: 10 }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Events Conducted',
            color: '#34d399',
            font: { size: 10, weight: 'bold' }
          },
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#34d399',
            stepSize: 1,
            font: { family: 'JetBrains Mono', size: 10 }
          }
        }
      }
    }
  });
}

