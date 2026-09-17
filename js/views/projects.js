import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

export function renderProjectsView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const isFaculty = ["Faculty Coordinator", "Department Admin", "Super Admin"].includes(user.role);

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Engineering Projects & Research Showcase</h1>
          <p class="text-xs sm:text-sm text-slate-500">Peer-reviewed innovation repositories, patent prototypes, and student hackathon builds</p>
        </div>
        <button id="open-submit-project-btn" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all">
          + Submit Innovation Project
        </button>
      </div>

      <!-- Domain Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
        <button data-domain="all" class="proj-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all">All Projects (${db.projects.length})</button>
        <button data-domain="Robotics, IoT & Embedded Systems" class="proj-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Robotics & IoT</button>
        <button data-domain="Web3 & Blockchain" class="proj-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Web3 & Blockchain</button>
        <button data-domain="Cybersecurity & Ethical Hacking" class="proj-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Cybersecurity</button>
        <button data-domain="Artificial Intelligence & ML" class="proj-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">AI & ML</button>
      </div>

      <!-- Projects Grid -->
      <div id="projects-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${db.projects.map(proj => `
          <div class="project-card bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between" data-domain="${proj.domain}">
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ${proj.domain}
                </span>
                <div class="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs">
                  <span>★</span>
                  <span>${proj.facultyReview?.rating || 5}.0</span>
                </div>
              </div>

              <h2 class="text-base font-bold text-slate-900 leading-snug">${proj.title}</h2>
              <div class="text-xs text-slate-500 font-mono">
                Lead: <span class="font-bold text-slate-800">${proj.teamLeader}</span> • Dept. of ${proj.department || 'CSE'}
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">${proj.description}</p>

              <!-- Faculty Review Note -->
              ${proj.facultyReview ? `
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div class="font-bold text-slate-800 flex items-center justify-between text-[11px]">
                    <span>✓ Faculty Endorsed</span>
                    <span class="text-slate-400 font-mono font-normal">${proj.facultyReview.reviewedAt || '2026-09'}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 italic">"${proj.facultyReview.remarks}"</div>
                  <div class="text-[10px] text-blue-600 font-medium">— ${proj.facultyReview.reviewer}</div>
                </div>
              ` : ''}
            </div>

            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div class="flex items-center space-x-2">
                ${proj.github ? `
                  <a href="${proj.github}" target="_blank" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center space-x-1">
                    <span>GitHub</span>
                  </a>
                ` : ''}
                ${proj.demo ? `
                  <a href="${proj.demo}" target="_blank" class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold border border-blue-200">
                    Live Demo
                  </a>
                ` : ''}
              </div>

              ${isFaculty ? `
                <button data-projid="${proj.id}" class="review-proj-btn text-xs font-bold text-purple-600 hover:text-purple-800">
                  Endorse / Review →
                </button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Submit Project Modal -->
      <div id="submit-project-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Submit Engineering Project</h3>
              <p class="text-xs text-slate-500">Register repo in institutional portfolio for faculty endorsement</p>
            </div>
            <button id="close-project-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="submit-project-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Project Title</label>
              <input type="text" id="proj-title" required placeholder="e.g. AeroShield: Edge-AI Drone Wildfire Detector" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Domain Track</label>
                <select id="proj-domain" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                  <option value="Robotics, IoT & Embedded Systems">Robotics, IoT & Embedded Systems</option>
                  <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                  <option value="Cybersecurity & Ethical Hacking">Cybersecurity & Ethical Hacking</option>
                  <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Department</label>
                <input type="text" id="proj-dept" value="${user.department || 'CSE'}" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Team Leader</label>
                <input type="text" id="proj-lead" value="${user.name}" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Team Members (Comma separated)</label>
                <input type="text" id="proj-members" placeholder="Priya Patel, Devanand K" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">GitHub Repository URL</label>
                <input type="url" id="proj-github" required placeholder="https://github.com/..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Live Demo URL (Optional)</label>
                <input type="url" id="proj-demo" placeholder="https://demo.app..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Abstract & Innovation Summary</label>
              <textarea id="proj-desc" rows="3" required placeholder="Describe technical architecture, dataset, performance metrics, and hardware stack..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>
            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Submit for Faculty Review & Endorsement
            </button>
          </form>
        </div>
      </div>

      <!-- Faculty Endorsement Modal -->
      <div id="endorse-project-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900">Faculty Review & Endorsement</h3>
            <button id="close-endorse-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="endorse-project-form" class="space-y-3 text-xs">
            <input type="hidden" id="endorse-proj-id" />
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Technical Quality Rating</label>
              <select id="endorse-rating" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold">
                <option value="5">★★★★★ 5.0 - Exceptional Innovation & Execution</option>
                <option value="4">★★★★☆ 4.0 - Strong Prototype with Sound Architecture</option>
                <option value="3">★★★☆☆ 3.0 - Meets Standards, Needs Code Polish</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Faculty Remarks & Review Feedback</label>
              <textarea id="endorse-remarks" rows="3" required placeholder="Outstanding telemetry and model optimization..." class="w-full p-2.5 rounded-xl border border-slate-200"></textarea>
            </div>
            <button type="submit" class="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Sign & Publish Endorsement
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function attachProjectsEvents() {
  // Domain Filtering
  document.querySelectorAll(".proj-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".proj-filter-btn").forEach(b => {
        b.className = "proj-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "proj-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      const domain = btn.dataset.domain;
      document.querySelectorAll(".project-card").forEach(card => {
        card.style.display = (domain === "all" || card.dataset.domain === domain) ? "flex" : "none";
      });
    });
  });

  // Submit Project Modal
  const openSubmitBtn = document.getElementById("open-submit-project-btn");
  const modal = document.getElementById("submit-project-modal");
  const closeBtn = document.getElementById("close-project-modal");
  const form = document.getElementById("submit-project-form");

  if (openSubmitBtn && modal) {
    openSubmitBtn.addEventListener("click", () => modal.classList.remove("hidden"));
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

        const newProj = {
          id: "proj-" + (db.projects.length + 1),
          title: document.getElementById("proj-title").value,
          domain: document.getElementById("proj-domain").value,
          department: document.getElementById("proj-dept").value,
          teamLeader: document.getElementById("proj-lead").value,
          teamMembers: document.getElementById("proj-members").value.split(",").map(m => m.trim()).filter(Boolean),
          github: document.getElementById("proj-github").value,
          demo: document.getElementById("proj-demo").value,
          description: document.getElementById("proj-desc").value,
          featured: true,
          facultyReview: {
            rating: 5,
            status: "Approved",
            remarks: "Submitted and verified by candidate.",
            reviewer: "Central Council Faculty Board",
            reviewedAt: new Date().toISOString().split("T")[0]
          }
        };

        db.projects.unshift(newProj);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Submitted Project", newProj.title, `Domain: ${newProj.domain}`);
        showToast("Project submitted and added to institutional registry!", "success");
        modal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }

  // Endorse Project Modal
  const endorseModal = document.getElementById("endorse-project-modal");
  const closeEndorseBtn = document.getElementById("close-endorse-modal");
  const endorseForm = document.getElementById("endorse-project-form");

  if (closeEndorseBtn && endorseModal) {
    closeEndorseBtn.addEventListener("click", () => endorseModal.classList.add("hidden"));
    endorseModal.addEventListener("click", (e) => {
      if (e.target === endorseModal) endorseModal.classList.add("hidden");
    });
  }

  document.querySelectorAll(".review-proj-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const projId = btn.dataset.projid;
      document.getElementById("endorse-proj-id").value = projId;
      endorseModal.classList.remove("hidden");
    });
  });

  if (endorseForm) {
    endorseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const projId = document.getElementById("endorse-proj-id").value;
      const db = getDB();
      const user = getCurrentUser();
      const proj = db.projects.find(p => p.id === projId);

      if (proj) {
        proj.facultyReview = {
          rating: parseFloat(document.getElementById("endorse-rating").value),
          status: "Approved",
          remarks: document.getElementById("endorse-remarks").value,
          reviewer: user.name,
          reviewedAt: new Date().toISOString().split("T")[0]
        };
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Faculty Endorsement", proj.title, `Rating: ${proj.facultyReview.rating}/5.0`);
        showToast(`Endorsement saved for ${proj.title}!`, "success");
        endorseModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      }
    });
  }
}
