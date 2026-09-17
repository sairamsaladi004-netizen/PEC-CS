import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';

export function renderAnnouncementsView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const canPost = ["Faculty Coordinator", "Department Admin", "Super Admin", "Club Admin"].includes(user.role);

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Official Council Circulars & Notice Board</h1>
          <p class="text-xs sm:text-sm text-slate-500">Institutionally verified guidelines, urgent SMS dispatches, and targeted broadcasts</p>
        </div>
        <div class="flex items-center space-x-2">
          <button id="trigger-digest-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5">
            <span>📨 Dispatch Weekly Digest</span>
          </button>
          ${canPost ? `
            <button id="open-post-ann-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5">
              <span>+ Post Official Circular</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Filter Controls: Target Audience & Priority -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
        <button data-filter="all" class="ann-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all">All Notices (${db.announcements.length})</button>
        <button data-filter="critical" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Urgent / Critical</button>
        <button data-filter="CSE" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Dept. CSE</button>
        <button data-filter="AIDS" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Dept. AIDS</button>
        <button data-filter="Students" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Student Leads</button>
      </div>

      <!-- Announcements List -->
      <div id="announcements-list" class="space-y-4">
        ${db.announcements.map(ann => `
          <div class="ann-item-card bg-white rounded-3xl border ${ann.pinned ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200'} p-6 sm:p-8 shadow-sm space-y-4 relative overflow-hidden" data-priority="${ann.priority}" data-dept="${ann.department || ''}" data-target="${ann.targetRole || 'All'}">
            ${ann.pinned ? `
              <span class="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl bg-blue-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider">
                📌 Pinned Institutional Circular
              </span>
            ` : ''}

            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                ann.priority === 'critical' ? 'bg-rose-100 text-rose-800' :
                ann.priority === 'important' ? 'bg-amber-100 text-amber-800' :
                'bg-blue-100 text-blue-800'
              }">
                ${ann.priority.toUpperCase()}
              </span>
              <span class="text-xs font-mono text-slate-400">${ann.date}</span>
              <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
                Target: ${ann.targetRole || 'All Students & Faculty'}
              </span>
            </div>

            <h2 class="text-lg font-black text-slate-900 leading-snug">${ann.title}</h2>
            <div class="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <p>${ann.content}</p>
              ${ann.attachment ? `
                <div class="inline-flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors">
                  <span>📎</span>
                  <span class="font-bold underline">${ann.attachment.name || 'Official_Notification_Dossier.pdf'}</span>
                  <span class="text-slate-400 text-[10px] font-mono">(${ann.attachment.size || '1.2 MB'})</span>
                </div>
              ` : ''}
            </div>

            <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-mono">
              <span>Authority: <strong class="text-slate-800">${ann.author}</strong></span>
              <div class="flex items-center space-x-3">
                <span>Jurisdiction: ${ann.department || 'All Departments'}</span>
                <button data-title="${ann.title}" class="sms-alert-broadcast-btn text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline">
                  Send SMS Alert 📲
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Post Announcement Modal -->
      <div id="post-ann-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Issue Official Notice & Broadcast</h3>
              <p class="text-xs text-slate-500">Dispatch circular to targeted students, leads, and faculty</p>
            </div>
            <button id="close-ann-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="post-ann-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Circular Title</label>
              <input type="text" id="ann-title" required placeholder="e.g. Schedule for Academic Project Reviews & Hackathons" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Priority</label>
                <select id="ann-prio" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold">
                  <option value="important">Important</option>
                  <option value="critical">Critical / Urgent Alert</option>
                  <option value="normal">Normal Information</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Target Department</label>
                <select id="ann-dept" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold">
                  <option value="All Engineering Departments">All Departments</option>
                  <option value="CSE">CSE</option>
                  <option value="AIDS">AIDS</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Target Role Audience</label>
                <select id="ann-role" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold">
                  <option value="All Students & Faculty">All Students & Faculty</option>
                  <option value="Students">All Students</option>
                  <option value="Club Members">Club Members Only</option>
                  <option value="Club Admins">Club Admins & Leads</option>
                  <option value="Faculty Coordinators">Faculty Coordinators</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Attached Circular PDF (Optional)</label>
                <input type="text" id="ann-attachment" placeholder="Official_Gazette_Doc.pdf" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notice Body & Details</label>
              <textarea id="ann-body" rows="4" required placeholder="Type full circular notice, rules, and deadlines..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>

            <div class="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1 text-[11px] text-indigo-900">
              <div class="flex items-center space-x-2">
                <input type="checkbox" id="ann-sms-toggle" checked class="w-4 h-4 rounded text-indigo-600" />
                <label for="ann-sms-toggle" class="font-bold">Simulate Instant Urgent SMS & Automated Email Digest</label>
              </div>
              <div class="flex items-center space-x-2 pt-1">
                <input type="checkbox" id="ann-pin" class="w-4 h-4 rounded text-blue-600" />
                <label for="ann-pin" class="font-bold">Pin to top of portal notice marquee</label>
              </div>
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
  // Filter Tabs
  document.querySelectorAll(".ann-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ann-filter-btn").forEach(b => {
        b.className = "ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "ann-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      const filter = btn.dataset.filter;

      document.querySelectorAll(".ann-item-card").forEach(card => {
        const priority = card.dataset.priority || "";
        const dept = card.dataset.dept || "";
        const target = card.dataset.target || "";

        if (filter === "all") {
          card.style.display = "block";
        } else if (filter === "critical") {
          card.style.display = priority === "critical" ? "block" : "none";
        } else if (filter === "CSE" || filter === "AIDS") {
          card.style.display = dept.includes(filter) ? "block" : "none";
        } else if (filter === "Students") {
          card.style.display = target.includes("Students") ? "block" : "none";
        }
      });
    });
  });

  // Trigger Weekly Digest
  const digestBtn = document.getElementById("trigger-digest-btn");
  if (digestBtn) {
    digestBtn.addEventListener("click", () => {
      showToast("Email Digest Dispatched", "Weekly circular summaries sent to all @panimalar.edu registered mailboxes.", "success");
    });
  }

  // Urgent SMS Broadcast
  document.querySelectorAll(".sms-alert-broadcast-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title;
      showToast("SMS Alert Broadcasted", `Urgent SMS notification triggered for: "${title.slice(0, 30)}..."`, "info");
    });
  });

  // Modal open / close
  const openBtn = document.getElementById("open-post-ann-btn");
  const modal = document.getElementById("post-ann-modal");
  const closeBtn = document.getElementById("close-ann-modal");
  const form = document.getElementById("post-ann-form");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const db = getDB();
        const user = getCurrentUser();

        const newAnn = {
          id: "ann-" + (db.announcements.length + 101),
          title: document.getElementById("ann-title").value,
          priority: document.getElementById("ann-prio").value,
          department: document.getElementById("ann-dept").value,
          targetRole: document.getElementById("ann-role").value,
          content: document.getElementById("ann-body").value,
          author: `${user.name} (${user.role})`,
          date: new Date().toISOString().split("T")[0],
          pinned: document.getElementById("ann-pin").checked,
          attachment: document.getElementById("ann-attachment").value ? {
            name: document.getElementById("ann-attachment").value,
            size: "1.4 MB"
          } : null
        };

        db.announcements.unshift(newAnn);

        // Auto-broadcast notification to all app users
        db.users.forEach(u => {
          addNotification({
            userId: u.id,
            title: `Circular: ${newAnn.title.slice(0, 32)}...`,
            message: newAnn.content.slice(0, 80) + "...",
            category: "Announcements",
            link: "#/announcements"
          });
        });

        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Issued Circular Announcement", newAnn.title, `Target: ${newAnn.targetRole}`);
        showToast("Circular Published", "Official notice posted and in-app alerts dispatched!", "success");
        modal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
