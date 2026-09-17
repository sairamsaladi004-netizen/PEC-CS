import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

export function renderLMSView() {
  const db = getDB();
  const user = getCurrentUser() || {};

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Peer-to-Peer Technical LMS Hub</h1>
          <p class="text-xs sm:text-sm text-slate-500">Student-curated lab guides, Jupyter notebooks, architecture diagrams, and security briefs</p>
        </div>
        <button id="open-publish-lms-btn" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all">
          + Publish Guide / Notebook
        </button>
      </div>

      <!-- Search & Filter Controls -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <input 
          type="text" 
          id="lms-search-input" 
          placeholder="Search by topic, domain (e.g. Docker, PyTorch, Blockchain)..." 
          class="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <div class="flex items-center space-x-2 shrink-0 text-xs">
          <button data-diff="all" class="lms-diff-btn px-3 py-2 rounded-xl font-bold bg-blue-600 text-white transition-colors">All Difficulties</button>
          <button data-diff="Intermediate" class="lms-diff-btn px-3 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Intermediate</button>
          <button data-diff="Advanced" class="lms-diff-btn px-3 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Advanced</button>
        </div>
      </div>

      <!-- LMS Resources Grid -->
      <div id="lms-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${db.lmsResources.map(res => `
          <div class="lms-card bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between" data-difficulty="${res.difficulty}" data-title="${res.title.toLowerCase()}" data-domain="${res.domain.toLowerCase()}">
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ${res.domain}
                </span>
                <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  res.difficulty === 'Advanced' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  res.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }">
                  ${res.difficulty}
                </span>
              </div>

              <h2 class="text-base font-bold text-slate-900 leading-snug">${res.title}</h2>
              <div class="text-xs text-slate-500 font-mono">
                By <span class="font-bold text-slate-700">${res.author}</span> • Target: ${res.targetSemester}
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">${res.description}</p>
            </div>

            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div class="flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
                <span>⏱️ ${res.readTime}</span>
                <button data-lmsid="${res.id}" class="bookmark-btn hover:text-blue-600 font-bold flex items-center space-x-1">
                  <span>🔖</span>
                  <span class="bookmark-count">${res.bookmarks}</span>
                </button>
              </div>

              <a href="${res.link}" target="_blank" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors">
                Launch Lab →
              </a>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Publish Guide Modal -->
      <div id="publish-lms-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Publish Technical Resource</h3>
              <p class="text-xs text-slate-500">Contribute peer-reviewed learning material to student ecosystem</p>
            </div>
            <button id="close-lms-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="publish-lms-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Resource Title</label>
              <input type="text" id="lms-title" required placeholder="e.g. Zero-Knowledge Proofs in Rust" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Domain</label>
                <select id="lms-domain" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                  <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                  <option value="Cybersecurity & Ethical Hacking">Cybersecurity & Ethical Hacking</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Difficulty</label>
                <select id="lms-diff" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Target Semester</label>
                <input type="text" id="lms-sem" value="5th Semester" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Est. Duration</label>
                <input type="text" id="lms-duration" value="45 mins lab" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Repository / Notebook URL</label>
              <input type="url" id="lms-link" required placeholder="https://github.com/..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Guide Summary & Prerequisites</label>
              <textarea id="lms-desc" rows="3" required placeholder="Outline lab exercises, code outputs, and environment dependencies..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>
            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Publish to Campus LMS
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function attachLMSEvents() {
  const searchInput = document.getElementById("lms-search-input");
  let activeDiff = "all";

  const filterCards = () => {
    const q = searchInput?.value.toLowerCase().trim() || "";
    document.querySelectorAll(".lms-card").forEach(card => {
      const matchText = card.dataset.title.includes(q) || card.dataset.domain.includes(q);
      const matchDiff = activeDiff === "all" || card.dataset.difficulty === activeDiff;
      card.style.display = (matchText && matchDiff) ? "flex" : "none";
    });
  };

  if (searchInput) searchInput.addEventListener("input", filterCards);

  document.querySelectorAll(".lms-diff-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".lms-diff-btn").forEach(b => {
        b.className = "lms-diff-btn px-3 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors";
      });
      btn.className = "lms-diff-btn px-3 py-2 rounded-xl font-bold bg-blue-600 text-white transition-colors";
      activeDiff = btn.dataset.diff;
      filterCards();
    });
  });

  // Bookmark Toggle
  document.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lmsId = btn.dataset.lmsid;
      const db = getDB();
      const res = db.lmsResources.find(r => r.id === lmsId);
      if (res) {
        res.bookmarks += 1;
        saveDB(db);
        const countSpan = btn.querySelector(".bookmark-count");
        if (countSpan) countSpan.innerText = res.bookmarks;
        showToast(`Bookmarked "${res.title}"!`, "success");
      }
    });
  });

  // Publish Modal
  const openBtn = document.getElementById("open-publish-lms-btn");
  const modal = document.getElementById("publish-lms-modal");
  const closeBtn = document.getElementById("close-lms-modal");
  const form = document.getElementById("publish-lms-form");

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

        const newResource = {
          id: "lms-" + (db.lmsResources.length + 1),
          title: document.getElementById("lms-title").value,
          domain: document.getElementById("lms-domain").value,
          difficulty: document.getElementById("lms-diff").value,
          targetSemester: document.getElementById("lms-sem").value,
          author: user.name,
          dateAdded: new Date().toISOString().split("T")[0],
          description: document.getElementById("lms-desc").value,
          link: document.getElementById("lms-link").value,
          readTime: document.getElementById("lms-duration").value,
          bookmarks: 1,
          completions: 0
        };

        db.lmsResources.unshift(newResource);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Published LMS Resource", newResource.title, `Domain: ${newResource.domain}`);
        showToast("Learning guide published successfully!", "success");
        modal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
