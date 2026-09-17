import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

const INITIAL_CIRCLES = [
  {
    id: "sc-01",
    title: "Data Structures & Dynamic Programming Peer Circle",
    subject: "CSE / Data Structures",
    lead: "Kavya Reddy (3rd Year CSE)",
    membersCount: 14,
    schedule: "Mondays & Wednesdays @ 04:30 PM",
    venue: "Turing AI Lab / Google Meet",
    status: "Active",
    description: "Collaborative problem solving on LeetCode Mediums, recursion trees, memoization, and graph algorithms."
  },
  {
    id: "sc-02",
    title: "ESP32 & Embedded Robotics Hardware Group",
    subject: "ECE & Robotics",
    lead: "Vikram Kumar (4th Year ECE)",
    membersCount: 19,
    schedule: "Tuesdays & Thursdays @ 05:00 PM",
    venue: "Robotics Innovation Lab 2",
    status: "Active",
    description: "Hands-on sensor calibration, STM32 microcontrollers, FreeRTOS tasks, and circuit soldering."
  },
  {
    id: "sc-03",
    title: "PyTorch & Computer Vision Study Group",
    subject: "AI & Data Science",
    lead: "Ananya Verma (3rd Year AIDS)",
    membersCount: 22,
    schedule: "Fridays @ 04:00 PM",
    venue: "Central Seminar Hall / Discord",
    status: "Active",
    description: "Deep learning paper reads, YOLO object detection models, CNN architectures, and GPU acceleration."
  }
];

export function renderStudyCirclesView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};

  // Hydrate from DB or defaults
  if (!db.study_circles || db.study_circles.length === 0) {
    db.study_circles = INITIAL_CIRCLES;
    saveDB(db);
  }

  const circles = db.study_circles;

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Banner Header -->
      <div class="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <span>🤝 Peer Learning & Collaboration Hub</span>
            <span>•</span>
            <span>Pragati Engineering College</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Peer Study Circles & Learning Groups
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Form or join student-led peer study circles for exam preparation, hackathon brainstorming, and technical skill acceleration under college societies.
          </p>
        </div>

        <button id="open-create-circle-btn" class="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0">
          + Form New Study Circle
        </button>
      </div>

      <!-- Circles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${circles.map(circle => `
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] font-mono border border-emerald-200/60">
                  ${circle.subject}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  ● ${circle.status}
                </span>
              </div>

              <div>
                <h3 class="text-base font-black text-slate-900 tracking-tight leading-snug">${circle.title}</h3>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">${circle.description}</p>
              </div>

              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs text-slate-600">
                <div>👑 Lead: <strong>${circle.lead}</strong></div>
                <div>🕒 Schedule: <strong>${circle.schedule}</strong></div>
                <div>📍 Location: <strong>${circle.venue}</strong></div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500 font-bold font-mono text-[11px]">${circle.membersCount} Members Joined</span>
              <button data-join-circle="${circle.id}" class="join-circle-btn px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer">
                Join Circle ✓
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- CREATE CIRCLE MODAL -->
      <div id="create-circle-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Form a New Peer Study Circle</h3>
            <button id="close-circle-modal-btn" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form id="create-circle-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Circle Title</label>
              <input type="text" id="circle-title-input" required placeholder="e.g. Advanced Operating Systems Study Group" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Academic Subject / Branch</label>
              <input type="text" id="circle-subject-input" required placeholder="e.g. CSE / Operating Systems" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Meeting Schedule & Venue</label>
              <input type="text" id="circle-schedule-input" required placeholder="e.g. Every Saturday @ 3:00 PM in Lab 4" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Description / Focus Areas</label>
              <textarea id="circle-desc-input" rows="3" required placeholder="Discussing memory management, process synchronization, and lab experiments..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>

            <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer">
              Create Peer Circle
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function attachStudyCirclesEvents() {
  const modal = document.getElementById("create-circle-modal");

  document.getElementById("open-create-circle-btn")?.addEventListener("click", () => {
    modal?.classList.remove("hidden");
  });

  document.getElementById("close-circle-modal-btn")?.addEventListener("click", () => {
    modal?.classList.add("hidden");
  });

  document.querySelectorAll(".join-circle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const user = getCurrentUser() || {};
      btn.textContent = "Joined ✓";
      btn.classList.remove("bg-slate-900", "hover:bg-slate-800");
      btn.classList.add("bg-emerald-600", "text-white");
      showToast("Joined Study Circle!", "You are now enrolled in this peer learning group.", "success");
      logAudit("Student", "Joined Study Circle", user.name, "Circle Enrolled");
    });
  });

  document.getElementById("create-circle-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const db = getDB();
    const user = getCurrentUser() || {};

    const newCircle = {
      id: `sc-${Date.now()}`,
      title: document.getElementById("circle-title-input").value,
      subject: document.getElementById("circle-subject-input").value,
      lead: `${user.name || 'Student'} (${user.year || 'Student'})`,
      membersCount: 1,
      schedule: document.getElementById("circle-schedule-input").value,
      venue: "Pragati Campus Lab",
      status: "Active",
      description: document.getElementById("circle-desc-input").value
    };

    db.study_circles = db.study_circles || [];
    db.study_circles.unshift(newCircle);
    saveDB(db);

    showToast("Study Circle Created!", "Your peer group is now active.", "success");
    logAudit("Student", "Created Study Circle", user.name, newCircle.title);

    modal?.classList.add("hidden");
    window.location.reload();
  });
}
