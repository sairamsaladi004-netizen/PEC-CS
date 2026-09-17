import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';

export function renderAnnouncementsView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const canPost = ["Faculty Coordinator", "Department Admin", "Super Admin"].includes(user.role);

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Official Council Circulars & Notice Board</h1>
          <p class="text-xs sm:text-sm text-slate-500">Institutionally verified administrative guidelines, competition schedules, and elections</p>
        </div>
        ${canPost ? `
          <button id="open-post-ann-btn" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all">
            + Post Official Circular
          </button>
        ` : ''}
      </div>

      <!-- Announcements List -->
      <div class="space-y-4">
        ${db.announcements.map(ann => `
          <div class="bg-white rounded-3xl border ${ann.pinned ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200'} p-6 sm:p-8 shadow-sm space-y-3 relative overflow-hidden">
            ${ann.pinned ? `
              <span class="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl bg-blue-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider">
                📌 Pinned Circular
              </span>
            ` : ''}

            <div class="flex items-center space-x-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                ann.priority === 'critical' ? 'bg-rose-100 text-rose-800' :
                ann.priority === 'important' ? 'bg-amber-100 text-amber-800' :
                'bg-blue-100 text-blue-800'
              }">
                ${ann.priority.toUpperCase()}
              </span>
              <span class="text-xs font-mono text-slate-400">${ann.date}</span>
            </div>

            <h2 class="text-lg font-black text-slate-900 leading-snug">${ann.title}</h2>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${ann.content}</p>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Authority: <span class="font-bold text-slate-800">${ann.author}</span></span>
              <span>${ann.department}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Post Announcement Modal -->
      <div id="post-ann-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Issue Official Notice</h3>
              <p class="text-xs text-slate-500">Broadcast circular to students, leads, and faculty</p>
            </div>
            <button id="close-ann-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="post-ann-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Circular Title</label>
              <input type="text" id="ann-title" required placeholder="e.g. Schedule for Academic Project Reviews" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Priority</label>
                <select id="ann-prio" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="important">Important</option>
                  <option value="critical">Critical / Urgent</option>
                  <option value="normal">Normal Information</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Target Department</label>
                <input type="text" id="ann-dept" value="All Engineering Departments" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notice Body</label>
              <textarea id="ann-body" rows="4" required placeholder="Type full circular notice..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>
            <div class="flex items-center space-x-2">
              <input type="checkbox" id="ann-pin" class="w-4 h-4 rounded text-blue-600" />
              <label for="ann-pin" class="font-semibold text-slate-700">Pin to top of portal marquee</label>
            </div>
            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Dispatch Circular Across Campus
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function attachAnnouncementsEvents() {
  const openBtn = document.getElementById("open-post-ann-btn");
  const modal = document.getElementById("post-ann-modal");
  const closeBtn = document.getElementById("close-ann-modal");
  const form = document.getElementById("post-ann-form");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const db = getDB();
        const user = getCurrentUser();

        const newAnn = {
          id: "ann-" + (db.announcements.length + 1),
          title: document.getElementById("ann-title").value,
          content: document.getElementById("ann-body").value,
          priority: document.getElementById("ann-prio").value,
          date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          pinned: document.getElementById("ann-pin").checked,
          author: user.name + ` (${user.role})`,
          department: document.getElementById("ann-dept").value
        };

        db.announcements.unshift(newAnn);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Issued Circular", newAnn.title, `Priority: ${newAnn.priority}`);
        addNotification({
          userId: "all",
          title: "New Official Circular",
          message: newAnn.title,
          category: "Announcements",
          link: "#/announcements"
        });

        showToast("Circular dispatched to campus network!", "success");
        modal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
