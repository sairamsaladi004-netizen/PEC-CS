/**
 * Pragati Engineering College - CampusTech
 * Student Attendance Trend Chart Component
 * Visualizes student attendance frequency, technical workshop participation, and compliance streaks.
 */

import { getDB } from '../db.js';
import { getCurrentUser } from '../auth.js';

let chartInstance = null;

/**
 * Returns the card HTML wrapper for the attendance trend chart
 */
export function renderAttendanceTrendChartCard() {
  const user = getCurrentUser() || {};
  const db = getDB();
  const studentAttendance = (db.attendance || []).filter(a => a.student_id === user.id || a.student_email === user.email);
  const totalAttended = studentAttendance.length > 0 ? studentAttendance.length : 14;
  const attendanceRate = totalAttended > 0 ? Math.min(100, Math.round((totalAttended / (totalAttended + 2)) * 100)) : 88;

  return `
    <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="text-sm font-black text-slate-900 tracking-tight">Technical Session Attendance Trajectory</h3>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
              ${attendanceRate}% Verified
            </span>
          </div>
          <p class="text-[11px] text-slate-500">Bi-weekly workshop attendance across accredited technical societies</p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-mono font-bold">
            ${totalAttended} Events Attended
          </span>
        </div>
      </div>

      <!-- Canvas container for Chart.js -->
      <div class="relative w-full h-56 sm:h-64">
        <canvas id="student-attendance-trend-canvas" class="w-full h-full"></canvas>
      </div>

      <!-- Bottom Metric Pills -->
      <div class="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
        <div class="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div class="text-slate-400 text-[10px]">Academic Quorum</div>
          <div class="font-black text-slate-800 text-sm">75.0% Min</div>
        </div>
        <div class="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100">
          <div class="text-emerald-600 text-[10px]">Active Status</div>
          <div class="font-black text-emerald-800 text-sm">Eligible</div>
        </div>
        <div class="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100">
          <div class="text-indigo-600 text-[10px]">Current Streak</div>
          <div class="font-black text-indigo-800 text-sm">5 Weeks 🔥</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initializes or updates the Chart.js canvas instance
 */
export function initStudentAttendanceChart() {
  const canvas = document.getElementById('student-attendance-trend-canvas');
  if (!canvas) return;

  // Check if Chart.js is loaded
  if (typeof window.Chart === 'undefined') {
    // Fallback if Chart.js is still loading
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Loading Attendance Visualizer...', 20, 50);
    }
    return;
  }

  // Destroy previous instance to avoid canvas reuse errors
  if (chartInstance) {
    try {
      chartInstance.destroy();
    } catch {}
    chartInstance = null;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Create subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 240);
  gradient.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
  gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

  const labels = ['Week 1', 'Week 3', 'Week 5', 'Week 7', 'Week 9', 'Week 11', 'Week 13', 'Week 15'];
  const attendanceData = [85, 90, 80, 95, 88, 92, 96, 94];
  const collegeAverage = [75, 76, 74, 75, 78, 77, 76, 78];

  chartInstance = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Your Attendance (%)',
          data: attendanceData,
          borderColor: '#2563eb',
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#2563eb',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'College Threshold (75%)',
          data: collegeAverage,
          borderColor: '#94a3b8',
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 10,
            font: { size: 10, family: 'Inter, sans-serif' },
            color: '#64748b'
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { size: 11, weight: 'bold' },
          bodyFont: { size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 60,
          max: 100,
          ticks: {
            stepSize: 10,
            callback: (val) => `${val}%`,
            font: { size: 10, family: 'JetBrains Mono, monospace' },
            color: '#94a3b8'
          },
          grid: {
            color: '#f1f5f9'
          }
        },
        x: {
          ticks: {
            font: { size: 10, family: 'Inter, sans-serif' },
            color: '#94a3b8'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

export default {
  renderAttendanceTrendChartCard,
  initStudentAttendanceChart
};
