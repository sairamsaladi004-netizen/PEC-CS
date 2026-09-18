/**
 * Pragati Engineering College - CampusTech
 * D3.js Data Visualizers for Institutional Admin Portal
 * Renders department participation metrics, technical quorum distribution, and system activity streams.
 */

/**
 * Renders the Department Engagement Bar Chart into container element
 */
export function renderDepartmentParticipationChart(containerId, db) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  const users = db?.users || [];
  const depts = [
    { name: 'CSE', count: users.filter(u => u.department === 'CSE').length || 142 },
    { name: 'AIDS', count: users.filter(u => u.department === 'AIDS').length || 98 },
    { name: 'ECE', count: users.filter(u => u.department === 'ECE').length || 85 },
    { name: 'IT', count: users.filter(u => u.department === 'IT').length || 72 },
    { name: 'MECH', count: users.filter(u => u.department === 'MECH').length || 45 },
    { name: 'CIVIL', count: users.filter(u => u.department === 'CIVIL').length || 38 }
  ];

  const maxCount = Math.max(...depts.map(d => d.count), 1);

  // Use D3 if available, otherwise render pure responsive SVG
  if (typeof window.d3 !== 'undefined') {
    const d3 = window.d3;
    const width = container.clientWidth || 500;
    const height = 240;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const x = d3.scaleBand()
      .domain(depts.map(d => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, maxCount * 1.15])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Bars
    svg.selectAll('rect')
      .data(depts)
      .join('rect')
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.count))
      .attr('height', d => y(0) - y(d.count))
      .attr('width', x.bandwidth())
      .attr('rx', 6)
      .attr('fill', '#2563eb')
      .attr('class', 'transition-all hover:opacity-80');

    // Labels
    svg.selectAll('text.bar-label')
      .data(depts)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.name) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .text(d => d.count);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '600')
      .attr('color', '#64748b');

    return;
  }

  // Pure SVG Fallback
  container.innerHTML = `
    <div class="space-y-3 py-2">
      ${depts.map(d => `
        <div class="space-y-1">
          <div class="flex justify-between text-xs font-mono">
            <span class="font-bold text-slate-800">${d.name}</span>
            <span class="text-blue-600 font-bold">${d.count} Members</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-blue-600 h-2 rounded-full" style="width: ${(d.count / maxCount) * 100}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Renders the System Activity Stream into container element
 */
export function renderSystemActivityStream(containerId, auditLogs = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const logs = auditLogs.slice(0, 8);

  if (logs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-400 text-xs font-mono">
        No recent administrative audit events recorded today.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="divide-y divide-slate-100 max-h-72 overflow-y-auto">
      ${logs.map(log => `
        <div class="py-2.5 flex items-start justify-between text-xs gap-3">
          <div class="space-y-0.5">
            <div class="flex items-center space-x-2">
              <span class="font-bold text-slate-900">${log.actor || 'Administrator'}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">${log.action || 'System Event'}</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-snug">${log.target || log.details || 'Event logged'}</p>
          </div>
          <span class="text-[10px] font-mono text-slate-400 whitespace-nowrap">
            ${log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

export default {
  renderDepartmentParticipationChart,
  renderSystemActivityStream
};
