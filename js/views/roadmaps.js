  `;
}
function renderNodeCard(node, roadmapId) {
  return `
    <div class="roadmap-node bg-white p-5 rounded-2xl border ${node.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'} shadow-sm space-y-3 flex flex-col justify-between">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
            node.level === 'Beginner' ? 'bg-emerald-50 text-emerald-700' :
            node.level === 'Intermediate' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
          }">${node.level}</span>
          
          <button data-rmid="${roadmapId}" data-nodeid="${node.id}" class="toggle-milestone-btn p-1 rounded-lg hover:bg-slate-100 transition-colors" title="Toggle Milestone Completion">
            ${node.completed ? `
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">✓</span>
            ` : `
              <span class="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs text-transparent hover:border-blue-500 hover:text-blue-500">○</span>
            `}
          </button>
        </div>
        <h3 class="text-xs sm:text-sm font-bold text-slate-900 leading-snug">${node.title}</h3>
      </div>
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>${node.completed ? '<span class="text-emerald-600 font-bold">Completed</span>' : 'Pending Milestone'}</span>
        <a href="#/lms" class="text-blue-600 hover:text-blue-800 font-medium">Find Lab Notes →</a>
      </div>
    </div>
  `;
}
export function attachRoadmapsEvents() {
  document.querySelectorAll(".toggle-milestone-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const rmid = btn.dataset.rmid;
      const nodeid = btn.dataset.nodeid;
      const db = getDB();
      const user = getCurrentUser();
      const roadmap = db.roadmaps.find(r => r.id === rmid);
      if (roadmap) {
        const node = roadmap.nodes.find(n => n.id === nodeid);
        if (node) {
          node.completed = !node.completed;
          saveDB(db);
          logAudit(`${user.name} (Student)`, "Roadmap Progress Update", `${roadmap.title} - ${node.title}`, `Milestone status: ${node.completed ? 'COMPLETED' : 'INCOMPLETE'}`);
          showToast(`Milestone updated: "${node.title}"!`, "success");
          setTimeout(() => window.location.reload(), 300);
        }
      }
    });
  });
}
