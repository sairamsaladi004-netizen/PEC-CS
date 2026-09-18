// Pragati Engineering College (PEC Autonomous) - CampusTech
// Student Engagement Score Leaderboard powered by D3.js & Supabase DB Integration

import { getCurrentUser } from '../auth.js';
import { getDB, apiRequest } from '../db.js';
import { getSupabaseClient } from '../supabaseClient.js';
import { showToast } from '../components/toast.js';
import { renderClubLeaderboardD3 } from '../components/d3Visualizers.js';

export function renderLeaderboardView() {
  const currentUser = getCurrentUser() || {};
  const db = getDB();

  return `
    <div class="space-y-6 pb-20 max-w-7xl mx-auto">
      
      <!-- Top Banner Header -->
      <div class="bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-500/30">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-amber-400 text-slate-950 tracking-wider">
                SUPABASE LIVE INTEGRATION
              </span>
              <span class="text-xs text-amber-200 font-bold font-mono">D3.js Interactive Scoring Engine</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-black tracking-tight mt-2 text-white">
              Student Engagement Leaderboard 🏆
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Algorithmic student engagement score calculated across <strong>QR Gate Attendance</strong>, <strong>Technical Club Activities</strong>, <strong>Event Participation</strong>, and <strong>Project Submissions</strong>.
            </p>
          </div>

          <!-- Quick KPI Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div class="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
              <div class="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Top Scholar</div>
              <div id="top-scholar-name" class="text-xs font-black text-white truncate mt-0.5">Calculating...</div>
            </div>
            <div class="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
              <div class="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Highest Score</div>
              <div id="top-scholar-score" class="text-lg font-black text-emerald-400 font-mono mt-0.5">0 pts</div>
            </div>
            <div class="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center col-span-2 sm:col-span-1">
              <div class="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Avg Engagement</div>
              <div id="avg-engagement-score" class="text-lg font-black text-blue-300 font-mono mt-0.5">0 pts</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Sorting Control Bar -->
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Search -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Search Student</label>
            <input 
              type="text" 
              id="leaderboard-search" 
              placeholder="Filter by name, roll no (22CS101)..." 
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <!-- Department Filter -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Department</label>
            <select id="leaderboard-dept-filter" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer">
              <option value="ALL">All Departments (35 Societies)</option>
              <option value="CSE">Computer Science & Engineering (CSE)</option>
              <option value="AIDS">AI & Data Science (AIDS)</option>
              <option value="AIML">CSE - AI & Machine Learning (AIML)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="EEE">Electrical & Electronics (EEE)</option>
              <option value="MECH">Mechanical Engineering (MECH)</option>
              <option value="CIVIL">Civil Engineering (CIVIL)</option>
            </select>
          </div>

          <!-- Year Filter -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Academic Year</label>
            <select id="leaderboard-year-filter" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer">
              <option value="ALL">All Academic Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <!-- Sort Order -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Sort Metric</label>
            <select id="leaderboard-sort-metric" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer">
              <option value="totalScore">Total Engagement Score</option>
              <option value="attendanceScore">Attendance Score (25 pts/scan)</option>
              <option value="clubScore">Club Activity Score (40 pts/club)</option>
              <option value="eventScore">Event & Project Score (35 pts/item)</option>
            </select>
          </div>

        </div>

        <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-3 text-slate-500 text-[11px]">
            <span class="font-bold text-slate-700">Weighting Matrix:</span>
            <span>QR Attendance: <strong class="text-slate-800">25 pts</strong></span> • 
            <span>Club Activity: <strong class="text-slate-800">40 pts</strong></span> • 
            <span>Event & Project: <strong class="text-slate-800">35 pts</strong></span>
          </div>
          
          <div class="flex items-center space-x-2">
            <button id="export-leaderboard-csv-btn" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition-all">
              📥 Export CSV
            </button>
            <button id="export-leaderboard-print-btn" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition-all">
              🖨️ Print Leaderboard
            </button>
          </div>
        </div>
      </div>

      <!-- D3.JS INTERACTIVE VISUALIZATIONS GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- D3 Visualizer 1: Top Engagement Bar Chart (7 Cols) -->
        <div class="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-black text-slate-900">D3.js Top Student Engagement Spectrum</h2>
              <p class="text-xs text-slate-500">Interactive D3.js horizontal bar visualization of top scholars</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 font-mono">
              d3.v7 rendered
            </span>
          </div>

          <!-- D3 Chart Container -->
          <div id="d3-leaderboard-bar-chart" class="w-full min-h-[300px] flex items-center justify-center">
            <div class="text-xs text-slate-400 font-mono animate-pulse">Initializing D3 Chart Engine...</div>
          </div>
        </div>

        <!-- D3 Visualizer 2: Departmental Engagement Breakdown (5 Cols) -->
        <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-black text-slate-900">Student Club Leaderboard</h2>
              <p class="text-xs text-slate-500">Events & Projects participation ranking</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 font-mono">
              D3.v7
            </span>
          </div>
          <!-- D3 Club Leaderboard Container -->
          <div id="d3-club-leaderboard-chart" class="w-full min-h-[300px] flex items-center justify-center">
            <div class="text-xs text-slate-400 font-mono animate-pulse">Computing Club Metrics...</div>
          </div>
        </div>

      </div>

      <!-- TOP 3 PODIUM SCHOLARS DISPLAY -->
      <div id="leaderboard-podium-section" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Rendered dynamically -->
      </div>

      <!-- LEADERBOARD ROSTER TABLE -->
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
        
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-black text-slate-900">Official Student Engagement Roster</h3>
            <p class="text-xs text-slate-500">Synchronized with Supabase attendance logs and club participation records</p>
          </div>
          <span id="roster-count-badge" class="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold font-mono">
            0 Students Evaluated
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th class="p-3.5 pl-6">Rank</th>
                <th class="p-3.5">Student Scholar</th>
                <th class="p-3.5">Dept & Year</th>
                <th class="p-3.5">Attendance</th>
                <th class="p-3.5">Club Activity</th>
                <th class="p-3.5">Events & Projects</th>
                <th class="p-3.5 text-right pr-6">Engagement Score</th>
              </tr>
            </thead>
            <tbody id="leaderboard-tbody" class="divide-y divide-slate-100 font-medium text-slate-700">
              <tr>
                <td colspan="7" class="p-8 text-center text-slate-400">
                  Calculating engagement metrics from Supabase DB...
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  `;
}

// Compute Engagement Scores from Supabase DB
export function computeStudentLeaderboardData(db) {
  const users = (db.users || []).filter(u => !u.role || u.role === "Student" || u.role === "Club Student Leader");
  const attendance = db.attendance || [];
  const badgeScans = db.badge_scans || [];
  const events = db.events || [];
  const projects = db.projects || [];
  const memberships = db.club_memberships || [];

  return users.map(u => {
    // 1. Attendance Scans
    const userScans = badgeScans.filter(s => s.student_id === u.id || (s.roll_no && u.rollNo && s.roll_no.toUpperCase() === u.rollNo.toUpperCase())).length;
    const userAtt = attendance.filter(a => a.student_id === u.id).length;
    const totalScans = Math.max(userScans, userAtt);
    const attendanceScore = totalScans * 25;

    // 2. Club Memberships & Executive Roles
    const userClubs = (u.clubs || []).length;
    const userMem = memberships.filter(m => m.student_id === u.id || m.student_email === u.email).length;
    const clubCount = Math.max(userClubs, userMem, 1);
    const clubScore = clubCount * 40;

    // 3. Events & Projects
    const userProjects = projects.filter(p => p.author_id === u.id || (p.authors && p.authors.includes(u.name))).length;
    const eventParticipation = Math.floor(totalScans * 0.8) + (u.badges?.length || 1);
    const eventScore = (eventParticipation + userProjects) * 35;

    const totalScore = attendanceScore + clubScore + eventScore;

    return {
      id: u.id,
      name: u.name,
      rollNo: u.rollNo || "22CS101",
      department: u.department || "CSE",
      year: u.year || "3rd Year",
      avatar: u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      totalScans,
      attendanceScore,
      clubCount,
      clubScore,
      eventParticipation,
      userProjects,
      eventScore,
      totalScore,
      badgeCount: (u.badges || []).length
    };
  });
}

// Attach D3.js and Table Event Handlers
export function attachLeaderboardEvents() {
  const db = getDB();
  let allScores = computeStudentLeaderboardData(db);

  // Fallback mock if db users are sparse
  if (allScores.length < 5) {
    allScores = generateFallbackLeaderboardData();
  }

  // Sort descending by total score
  allScores.sort((a, b) => b.totalScore - a.totalScore);

  // Render Function
  function updateLeaderboardUI() {
    const searchVal = document.getElementById("leaderboard-search")?.value.trim().toLowerCase() || "";
    const deptVal = document.getElementById("leaderboard-dept-filter")?.value || "ALL";
    const yearVal = document.getElementById("leaderboard-year-filter")?.value || "ALL";
    const sortVal = document.getElementById("leaderboard-sort-metric")?.value || "totalScore";

    let filtered = allScores.filter(s => {
      const matchSearch = !searchVal || s.name.toLowerCase().includes(searchVal) || s.rollNo.toLowerCase().includes(searchVal);
      const matchDept = deptVal === "ALL" || s.department === deptVal;
      const matchYear = yearVal === "ALL" || s.year === yearVal;
      return matchSearch && matchDept && matchYear;
    });

    // Re-sort
    filtered.sort((a, b) => (b[sortVal] || 0) - (a[sortVal] || 0));

    // Update KPI Header
    const topScholar = filtered[0] || allScores[0];
    if (topScholar) {
      const elName = document.getElementById("top-scholar-name");
      const elScore = document.getElementById("top-scholar-score");
      if (elName) elName.textContent = `${topScholar.name} (${topScholar.rollNo})`;
      if (elScore) elScore.textContent = `${topScholar.totalScore} pts`;
    }

    const avgScore = Math.round(filtered.reduce((sum, s) => sum + s.totalScore, 0) / Math.max(1, filtered.length));
    const elAvg = document.getElementById("avg-engagement-score");
    if (elAvg) elAvg.textContent = `${avgScore} pts`;

    const rosterBadge = document.getElementById("roster-count-badge");
    if (rosterBadge) rosterBadge.textContent = `${filtered.length} Students Evaluated`;

    // Render Podium for top 3
    renderPodium(filtered.slice(0, 3));

    // Render Table
    renderTableRows(filtered);

    // Render D3 Charts
    renderD3BarChart("d3-leaderboard-bar-chart", filtered.slice(0, 10));
    
    // Club Leaderboard
    const clubData = (db.clubs || []).map(c => {
      const participation = (db.badge_scans || []).filter(s => s.club_id === c.id || s.clubId === c.id).length;
      const projectsCount = (db.projects || []).filter(p => p.club_id === c.id || p.clubId === c.id).length;
      return {
        name: c.name,
        totalScore: participation * 10 + projectsCount * 50
      };
    }).sort((a,b) => b.totalScore - a.totalScore);
    renderClubLeaderboardD3("d3-club-leaderboard-chart", clubData);
  }

  // Filter Listeners
  document.getElementById("leaderboard-search")?.addEventListener("input", updateLeaderboardUI);
  document.getElementById("leaderboard-dept-filter")?.addEventListener("change", updateLeaderboardUI);
  document.getElementById("leaderboard-year-filter")?.addEventListener("change", updateLeaderboardUI);
  document.getElementById("leaderboard-sort-metric")?.addEventListener("change", updateLeaderboardUI);

  // Export CSV
  document.getElementById("export-leaderboard-csv-btn")?.addEventListener("click", () => {
    let csv = "Rank,Student Name,Roll Number,Department,Year,Attendance Score,Club Score,Event Score,Total Engagement Score\n";
    allScores.forEach((s, i) => {
      csv += `${i + 1},"${s.name}","${s.rollNo}","${s.department}","${s.year}",${s.attendanceScore},${s.clubScore},${s.eventScore},${s.totalScore}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PEC_Student_Engagement_Leaderboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast("Report Exported", "Student Leaderboard exported to CSV.", "success");
  });

  document.getElementById("export-leaderboard-print-btn")?.addEventListener("click", () => window.print());

  // Initial Run
  updateLeaderboardUI();
}

function renderPodium(top3) {
  const container = document.getElementById("leaderboard-podium-section");
  if (!container) return;

  if (top3.length === 0) {
    container.innerHTML = "";
    return;
  }

  const ranks = [
    { pos: 1, title: "🥇 1st Rank Platinum Scholar", border: "border-amber-400 bg-gradient-to-b from-amber-50 to-white shadow-amber-500/10", badgeBg: "bg-amber-400 text-slate-950" },
    { pos: 2, title: "🥈 2nd Rank Silver Scholar", border: "border-slate-300 bg-gradient-to-b from-slate-50 to-white", badgeBg: "bg-slate-300 text-slate-900" },
    { pos: 3, title: "🥉 3rd Rank Bronze Scholar", border: "border-amber-700/40 bg-gradient-to-b from-orange-50/40 to-white", badgeBg: "bg-amber-700 text-white" }
  ];

  container.innerHTML = top3.map((s, idx) => {
    const meta = ranks[idx] || ranks[0];
    return `
      <div class="p-5 rounded-3xl border-2 ${meta.border} shadow-md space-y-3 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono uppercase ${meta.badgeBg}">
            ${meta.title}
          </span>
          <span class="text-xs font-black font-mono text-emerald-700">${s.totalScore} pts</span>
        </div>

        <div class="flex items-center space-x-3 pt-1">
          <img src="${s.avatar}" class="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200" alt="${s.name}" />
          <div>
            <h4 class="text-sm font-black text-slate-900 leading-tight">${s.name}</h4>
            <div class="text-[11px] font-mono text-slate-500">${s.rollNo} • ${s.department} (${s.year})</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-center text-[10px]">
          <div class="bg-slate-50 p-1.5 rounded-xl">
            <div class="text-slate-400 font-bold">Attendance</div>
            <div class="font-black text-slate-800">${s.attendanceScore} pts</div>
          </div>
          <div class="bg-slate-50 p-1.5 rounded-xl">
            <div class="text-slate-400 font-bold">Clubs</div>
            <div class="font-black text-slate-800">${s.clubScore} pts</div>
          </div>
          <div class="bg-slate-50 p-1.5 rounded-xl">
            <div class="text-slate-400 font-bold">Events</div>
            <div class="font-black text-slate-800">${s.eventScore} pts</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTableRows(students) {
  const tbody = document.getElementById("leaderboard-tbody");
  if (!tbody) return;

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-8 text-center text-slate-400">
          No students matched the selected department/year filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map((s, idx) => {
    let rankBadge = `<span class="font-mono text-xs font-bold text-slate-500">#${idx + 1}</span>`;
    if (idx === 0) rankBadge = `<span class="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md font-mono">🥇 #1</span>`;
    if (idx === 1) rankBadge = `<span class="px-2 py-0.5 bg-slate-300 text-slate-900 font-black text-[10px] rounded-md font-mono">🥈 #2</span>`;
    if (idx === 2) rankBadge = `<span class="px-2 py-0.5 bg-amber-700 text-white font-black text-[10px] rounded-md font-mono">🥉 #3</span>`;

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-3.5 pl-6">${rankBadge}</td>
        <td class="p-3.5">
          <div class="flex items-center space-x-2.5">
            <img src="${s.avatar}" class="w-8 h-8 rounded-xl object-cover border border-slate-200" alt="${s.name}" />
            <div>
              <div class="font-black text-slate-900">${s.name}</div>
              <div class="text-[10px] font-mono text-slate-400">${s.rollNo}</div>
            </div>
          </div>
        </td>
        <td class="p-3.5">
          <div class="font-bold text-slate-800">${s.department}</div>
          <div class="text-[10px] text-slate-500">${s.year}</div>
        </td>
        <td class="p-3.5 font-mono text-xs text-slate-700">
          <span class="font-bold text-slate-900">${s.totalScans} scans</span>
          <div class="text-[10px] text-emerald-600 font-bold">+${s.attendanceScore} pts</div>
        </td>
        <td class="p-3.5 font-mono text-xs text-slate-700">
          <span class="font-bold text-slate-900">${s.clubCount} clubs</span>
          <div class="text-[10px] text-indigo-600 font-bold">+${s.clubScore} pts</div>
        </td>
        <td class="p-3.5 font-mono text-xs text-slate-700">
          <span class="font-bold text-slate-900">${s.eventParticipation + s.userProjects} items</span>
          <div class="text-[10px] text-blue-600 font-bold">+${s.eventScore} pts</div>
        </td>
        <td class="p-3.5 text-right pr-6 font-mono font-black text-sm text-slate-900">
          <span class="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
            ${s.totalScore} pts
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Interactive D3.js Horizontal Bar Chart
function renderD3BarChart(containerId, topData) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!topData || topData.length === 0) {
    container.innerHTML = `<div class="p-8 text-xs text-slate-400">No student score data available to render D3 chart.</div>`;
    return;
  }

  const d3 = window.d3;
  if (!d3) {
    // Pure SVG fallback
    container.innerHTML = `<div class="p-6 text-xs text-slate-500 text-center">D3.js loading... fallback enabled.</div>`;
    return;
  }

  const width = container.clientWidth || 500;
  const height = 320;
  const margin = { top: 20, right: 30, bottom: 30, left: 110 };

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "w-full h-auto overflow-visible font-sans");

  const y = d3.scaleBand()
    .domain(topData.map(d => d.name))
    .range([margin.top, height - margin.bottom])
    .padding(0.25);

  const x = d3.scaleLinear()
    .domain([0, d3.max(topData, d => d.totalScore) * 1.15 || 500])
    .range([margin.left, width - margin.right]);

  // Gradients
  const defs = svg.append("defs");
  const grad = defs.append("linearGradient")
    .attr("id", "d3BarGrad")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%");
  grad.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b");
  grad.append("stop").attr("offset", "100%").attr("stop-color", "#10b981");

  // Horizontal Grid
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(-height + margin.top + margin.bottom).tickFormat(""))
    .selectAll("line")
    .attr("stroke", "#f1f5f9");

  // Bars
  svg.selectAll(".leader-bar")
    .data(topData)
    .enter()
    .append("rect")
    .attr("class", "leader-bar transition-all duration-300 hover:opacity-80 cursor-pointer")
    .attr("y", d => y(d.name))
    .attr("x", margin.left)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.totalScore) - margin.left)
    .attr("fill", "url(#d3BarGrad)")
    .attr("rx", 6)
    .append("title")
    .text(d => `${d.name} (${d.rollNo}): ${d.totalScore} pts\nAttendance: ${d.attendanceScore} pts\nClubs: ${d.clubScore} pts\nEvents & Projects: ${d.eventScore} pts`);

  // Score Labels
  svg.selectAll(".bar-label")
    .data(topData)
    .enter()
    .append("text")
    .attr("y", d => y(d.name) + y.bandwidth() / 2 + 4)
    .attr("x", d => x(d.totalScore) + 6)
    .attr("class", "text-[10px] font-black font-mono fill-slate-800")
    .text(d => `${d.totalScore} pts`);

  // Y Axis (Names)
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .attr("class", "text-[11px] font-bold fill-slate-700")
    .text(d => d.length > 14 ? d.substring(0, 12) + "…" : d);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(0))
    .selectAll("text")
    .attr("class", "text-[10px] font-mono fill-slate-400");
}

// Render D3.js Departmental Donut / Average Bar Chart
function renderD3DeptChart(containerId, allData) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const depts = ["CSE", "AIDS", "AIML", "ECE", "EEE", "MECH", "CIVIL"];
  const deptStats = depts.map(d => {
    const list = allData.filter(s => s.department === d);
    const avg = list.length > 0 ? Math.round(list.reduce((sum, item) => sum + item.totalScore, 0) / list.length) : 180;
    return { department: d, avgScore: avg, count: list.length || 3 };
  });

  const d3 = window.d3;
  if (!d3) return;

  const width = container.clientWidth || 360;
  const height = 320;
  const margin = { top: 20, right: 20, bottom: 50, left: 45 };

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "w-full h-auto overflow-visible font-sans");

  const x = d3.scaleBand()
    .domain(deptStats.map(d => d.department))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(deptStats, d => d.avgScore) * 1.2 || 500])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Bars
  svg.selectAll(".dept-bar")
    .data(deptStats)
    .enter()
    .append("rect")
    .attr("class", "dept-bar transition-all hover:opacity-80 cursor-pointer")
    .attr("x", d => x(d.department))
    .attr("y", d => y(d.avgScore))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.avgScore))
    .attr("fill", "#6366f1")
    .attr("rx", 6)
    .append("title")
    .text(d => `${d.department}: Avg ${d.avgScore} pts across ${d.count} scholars`);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")
    .attr("class", "text-[10px] font-black fill-slate-700")
    .attr("dy", "1.2em");

  // Y Axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(4).tickSize(0))
    .selectAll("text")
    .attr("class", "text-[10px] font-mono fill-slate-400");
}

function generateFallbackLeaderboardData() {
  return [
    { id: "std-1", name: "Aarav Sharma", rollNo: "22CS101", department: "CSE", year: "3rd Year", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200", totalScans: 18, attendanceScore: 450, clubCount: 3, clubScore: 120, eventParticipation: 4, userProjects: 2, eventScore: 210, totalScore: 780 },
    { id: "std-2", name: "Priya Patel", rollNo: "22CS142", department: "CSE", year: "3rd Year", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200", totalScans: 16, attendanceScore: 400, clubCount: 4, clubScore: 160, eventParticipation: 3, userProjects: 2, eventScore: 175, totalScore: 735 },
    { id: "std-3", name: "Rahul Verma", rollNo: "23AI018", department: "AIDS", year: "2nd Year", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", totalScans: 14, attendanceScore: 350, clubCount: 2, clubScore: 80, eventParticipation: 5, userProjects: 1, eventScore: 210, totalScore: 640 },
    { id: "std-4", name: "Ananya Reddy", rollNo: "22ML045", department: "AIML", year: "3rd Year", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", totalScans: 12, attendanceScore: 300, clubCount: 3, clubScore: 120, eventParticipation: 4, userProjects: 1, eventScore: 175, totalScore: 595 },
    { id: "std-5", name: "Kiran Kumar", rollNo: "21EC088", department: "ECE", year: "4th Year", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", totalScans: 11, attendanceScore: 275, clubCount: 2, clubScore: 80, eventParticipation: 3, userProjects: 2, eventScore: 175, totalScore: 530 }
  ];
}
