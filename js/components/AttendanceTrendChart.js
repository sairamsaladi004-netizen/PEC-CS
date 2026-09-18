
export function renderAttendanceTrendChartCard() {
  return `
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6" id="attendance-trend-container">
      <h3 class="text-base font-black text-slate-900 tracking-tight">Semester Attendance Trends</h3>
      <div class="h-72 w-full relative">
        <canvas id="student-attendance-chart-canvas"></canvas>
      </div>
    </div>
  `;
}

export function initStudentAttendanceChart(data) {
  const canvas = document.getElementById("student-attendance-chart-canvas");
  if (!canvas || !window.Chart) return;

  const chartData = data || [
    { month: 'Aug', students: 120, events: 4 },
    { month: 'Sep', students: 150, events: 6 },
    { month: 'Oct', students: 200, events: 8 },
    { month: 'Nov', students: 180, events: 5 },
    { month: 'Dec', students: 250, events: 9 },
  ];

  const ctx = canvas.getContext("2d");
  new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.map(d => d.month),
      datasets: [
        { label: 'Students', data: chartData.map(d => d.students), backgroundColor: '#3b82f6', borderRadius: 6 },
        { label: 'Events', data: chartData.map(d => d.events), backgroundColor: '#10b981', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
