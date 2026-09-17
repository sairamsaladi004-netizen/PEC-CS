import { getDB, apiRequest, saveDB } from '../db.js';
import { showToast } from '../components/toast.js';

export function renderRoadmapsView() {
  const db = getDB();
  const roadmaps = db.roadmaps;
  const currentRm = roadmaps[0];

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Technical Career Roadmaps</h1>
          <p class="text-xs sm:text-sm text-slate-500">Structured competency milestones curated by faculty advisors and alumni</p>
        </div>
      </div>

      <!-- Roadmap Selection Tabs -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
        ${roadmaps.map((rm, idx) => `
          <button data-rmid="${rm.id}" class="roadmap-tab-btn px-4 py-2 rounded-xl font-bold transition-all ${idx === 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
            ${rm.title}
          </button>
        `).join('')}
      </div>

      <!-- Active Roadmap Container -->
      <div id="roadmap-content-container" class="space-y-6">
        ${renderActiveRoadmap(currentRm)}
      </div>

    </div>
  `;
}

function renderActiveRoadmap(roadmap) {
  const completedCount = roadmap.nodes.filter(n => n.completed).length;
  const totalCount = roadmap.nodes.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return `
    <!-- Header & Progress Card -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">${roadmap.domain}</span>
          <h2 class="text-xl font-black text-slate-900 mt-2">${roadmap.title}</h2>
          <p class="text-xs text-slate-500 mt-1">${roadmap.description}</p>
        </div>
        <div class="sm:text-right shrink-0">
          <div class="text-2xl font-black text-blue-600">${percent}%</div>
          <div class="text-[11px] text-slate-400 font-mono">${completedCount} of ${totalCount} Milestones Done</div>
        </div>
      </div>

      <!-- Progress Bar Track -->
      <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full bg-blue-600 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
      </div>
    </div>

    <!-- Interactive Node Timeline -->
    <div class="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      ${roadmap.nodes.map((node, index) => `
        <div class="roadmap-node relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex items-start justify-between gap-4">
          <div class="flex items-start space-x-3">
            <input 
              type="checkbox" 
              data-rmid="${roadmap.id}" 
              data-nodeid="${node.id}" 
              class="node-checkbox w-5 h-5 rounded-lg text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5 cursor-pointer" 
              ${node.completed ? 'checked' : ''}
            />
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-mono font-bold text-slate-400">#${index + 1}</span>
                <h3 class="text-sm font-bold text-slate-900 ${node.completed ? 'line-through text-slate-400' : ''}">${node.title}</h3>
              </div>
              <div class="flex items-center space-x-2 mt-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                  node.level === 'Advanced' ? 'bg-rose-50 text-rose-700' :
                  node.level === 'Intermediate' ? 'bg-amber-50 text-amber-700' :
                  'bg-emerald-50 text-emerald-700'
                }">${node.level}</span>
                <span class="text-[11px] text-slate-400">Accredited Domain Milestone</span>
              </div>
            </div>
          </div>
          <a href="#/lms" class="text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0">
            Study Guide →
          </a>
        </div>
      `).join('')}
    </div>
  `;
}

export function attachRoadmapsEvents() {
  const container = document.getElementById("roadmap-content-container");

  const attachCheckboxes = () => {
    document.querySelectorAll(".node-checkbox").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const rmId = chk.dataset.rmid;
        const nodeId = chk.dataset.nodeid;
        const db = getDB();
        const rm = db.roadmaps.find(r => r.id === rmId);
        if (rm) {
          const node = rm.nodes.find(n => n.id === nodeId);
          if (node) {
            node.completed = e.target.checked;
            
            apiRequest(`/api/roadmaps/${rmId}/toggle-node`, 'POST', {
                nodeId,
                completed: e.target.checked
            }).catch(console.error);

            saveDB(db);
            showToast(node.completed ?
 `Completed: ${node.title}!` : `Marked incomplete: ${node.title}`, "info");
            if (container) {
              container.innerHTML = renderActiveRoadmap(rm);
              attachCheckboxes();
            }
          }
        }
      });
    });
  };

  document.querySelectorAll(".roadmap-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".roadmap-tab-btn").forEach(b => {
        b.className = "roadmap-tab-btn px-4 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "roadmap-tab-btn px-4 py-2 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      const rmId = btn.dataset.rmid;
      const db = getDB();
      const rm = db.roadmaps.find(r => r.id === rmId);
      if (rm && container) {
        container.innerHTML = renderActiveRoadmap(rm);
        attachCheckboxes();
      }
    });
  });

  attachCheckboxes();
}
