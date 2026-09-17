import { getDB, apiRequest, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';

export function renderLMSView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const activeTab = params.tab || "resources";

  // Ensure default practice sets & study circles exist in db
  if (!db.practiceProblems) {
    db.practiceProblems = [
      {
        id: "prob-1",
        title: "LRU Cache Implementation with O(1) Eviction",
        difficulty: "Medium",
        domain: "Data Structures & Systems",
        tags: ["Hash Map", "Doubly Linked List", "Memory"],
        solvedCount: 142,
        solution: "Utilize a doubly linked list coupled with an unordered hash map where the map values point directly to the list iterators, facilitating O(1) removals and front promotions."
      },
      {
        id: "prob-2",
        title: "Distributed Rate Limiter (Token Bucket Algorithm)",
        difficulty: "Hard",
        domain: "Distributed Systems & Cloud",
        tags: ["Redis", "Concurrency", "High Availability"],
        solvedCount: 89,
        solution: "Store bucket capacity and last refill timestamp in Redis. Execute an atomic Lua script to compute elapsed time, add regenerated tokens up to cap, and deduct request cost."
      },
      {
        id: "prob-3",
        title: "Convolutional Filter Math for Edge Detection",
        difficulty: "Easy",
        domain: "Artificial Intelligence & Vision",
        tags: ["Matrix", "Kernel", "Sobel Filter"],
        solvedCount: 310,
        solution: "Apply the horizontal Sobel kernel [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]] over grayscale intensity values via 2D spatial convolution."
      }
    ];
    saveDB(db);
  }

  if (!db.studyCircles) {
    db.studyCircles = [
      {
        id: "circle-1",
        name: "Kubernetes & Cloud Native Sprint Group",
        lead: "Sairam Saladi",
        membersCount: 18,
        meetSchedule: "Every Tuesday 5:00 PM • Lab Block 3",
        domain: "DevOps & Cloud",
        topic: "CKA Exam preparation, Helm charts, and container network interfaces"
      },
      {
        id: "circle-2",
        name: "Deep Learning Research & Paper Reading",
        lead: "Aarav Sharma",
        membersCount: 24,
        meetSchedule: "Thursdays 4:30 PM • Seminar Hall B",
        domain: "AI & ML",
        topic: "Attention Mechanisms, Diffusion Models, and LLM fine-tuning techniques"
      }
    ];
    saveDB(db);
  }

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Academic LMS & Technical Knowledge Base</h1>
          <p class="text-xs sm:text-sm text-slate-500">Curated notes, recorded sessions, timed self-assessments, practice problem sets, and peer learning circles</p>
        </div>
        <div class="flex items-center space-x-2">
          <button id="open-publish-lms-btn" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5">
            <span>+ Publish Learning Resource</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs font-bold">
        <a href="#/lms?tab=resources" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'resources' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          📚 Resource Repository (${db.lmsResources.length})
        </a>
        <a href="#/lms?tab=assessment" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'assessment' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          📝 Timed Quizzes & Auto-Certifications
        </a>
        <a href="#/lms?tab=practice" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'practice' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          ⚡ Practice Problem Sets (${db.practiceProblems.length})
        </a>
        <a href="#/lms?tab=circles" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'circles' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          👥 Peer Study Circles (${db.studyCircles.length})
        </a>
        <a href="#/roadmaps" class="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all ml-auto">
          🗺️ View Career Roadmaps →
        </a>
      </div>

      <!-- Active Tab Content -->
      ${
        activeTab === 'assessment' ? renderAssessmentSection() :
        activeTab === 'practice' ? renderPracticeSection(db.practiceProblems) :
        activeTab === 'circles' ? renderCirclesSection(db.studyCircles) :
        renderResourcesSection(db.lmsResources)
      }

      <!-- Publish Guide Modal -->
      <div id="publish-lms-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Publish Technical Learning Resource</h3>
              <p class="text-xs text-slate-500">Contribute peer-reviewed learning material to student repository</p>
            </div>
            <button id="close-lms-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="publish-lms-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Resource Title</label>
              <input type="text" id="lms-title" required placeholder="e.g. Zero-Knowledge Proofs in Rust & Cryptographic Primitives" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Resource Format</label>
                <select id="lms-type" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500">
                  <option value="Notes & Cheat Sheet">Notes & Cheat Sheet</option>
                  <option value="Session Recording">Recorded Workshop Video</option>
                  <option value="Code Repository">Jupyter Notebook / Code Repo</option>
                  <option value="Book / Reference PDF">Reference Guide / Book</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Domain</label>
                <select id="lms-domain" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                  <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                  <option value="Cybersecurity & Ethical Hacking">Cybersecurity & Ethical Hacking</option>
                  <option value="Full Stack Web Dev">Full Stack Web Dev</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Difficulty Level</label>
                <select id="lms-diff" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Target Semester</label>
                <input type="text" id="lms-sem" value="4th - 6th Semester" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Link URL (GitHub, Drive, or YouTube)</label>
              <input type="url" id="lms-link" required placeholder="https://github.com/..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Guide Summary & Outline</label>
              <textarea id="lms-desc" rows="3" required placeholder="Outline exercises, code snippets, prerequisite knowledge, and setup..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"></textarea>
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

function renderResourcesSection(resources) {
  return `
    <!-- Search & Filter Controls -->
    <div class="flex flex-col sm:flex-row items-center gap-3">
      <input 
        type="text" 
        id="lms-search-input" 
        placeholder="Search notes, recordings, cheat sheets (e.g. Docker, PyTorch, Blockchain)..." 
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
      ${resources.map(res => `
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
              Curator: <span class="font-bold text-slate-700">${res.author}</span> • Target: ${res.targetSemester}
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
  `;
}

function renderAssessmentSection() {
  return `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-mono font-bold">Official Technical Benchmark</span>
          <span class="text-xs font-mono text-slate-300">⏱️ Timed Test: 10 mins</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-black">Cloud Architecture & DevOps Readiness Assessment</h2>
        <p class="text-xs text-slate-300">Pass with score >= 80% to automatically mint an accredited Certificate of Technical Competence directly to your profile.</p>
      </div>

      <!-- Interactive Quiz Container -->
      <div id="quiz-box" class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="space-y-4">
          <!-- Question 1 -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <span class="font-bold text-slate-900 text-sm">1. In Kubernetes, which component is responsible for orchestrating container scheduling across nodes?</span>
            <div class="space-y-2">
              <label class="flex items-center space-x-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer">
                <input type="radio" name="q1" value="a" class="w-4 h-4 text-blue-600" />
                <span class="text-slate-700 font-medium">kube-scheduler</span>
              </label>
              <label class="flex items-center space-x-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer">
                <input type="radio" name="q1" value="b" class="w-4 h-4 text-blue-600" />
                <span class="text-slate-700 font-medium">kubelet</span>
              </label>
              <label class="flex items-center space-x-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer">
                <input type="radio" name="q1" value="c" class="w-4 h-4 text-blue-600" />
                <span class="text-slate-700 font-medium">etcd</span>
              </label>
            </div>
          </div>

          <!-- Question 2 -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <span class="font-bold text-slate-900 text-sm">2. What HTTP status code signifies that a client has exceeded its rate limit quota in a microservices gateway?</span>
            <div class="space-y-2">
              <label class="flex items-center space-x-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer">
                <input type="radio" name="q2" value="a" class="w-4 h-4 text-blue-600" />
                <span class="text-slate-700 font-medium">429 Too Many Requests</span>
              </label>
              <label class="flex items-center space-x-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer">
                <input type="radio" name="q2" value="b" class="w-4 h-4 text-blue-600" />
                <span class="text-slate-700 font-medium">403 Forbidden</span>
              </label>
              <label class="flex items-center space-x-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer">
                <input type="radio" name="q2" value="c" class="w-4 h-4 text-blue-600" />
                <span class="text-slate-700 font-medium">503 Service Unavailable</span>
              </label>
            </div>
          </div>
        </div>

        <button id="submit-quiz-btn" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors">
          Submit Assessment for Instant Auto-Grading & Certification
        </button>

        <div id="quiz-result-box" class="hidden p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
          <div class="font-bold text-sm">🎉 Assessment Passed: 100% Score!</div>
          <div class="text-xs">Your Certificate of Technical Competence has been minted and added to your credentials ledger.</div>
        </div>
      </div>
    </div>
  `;
}

function renderPracticeSection(problems) {
  return `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">Curated Practice Problem Sets</h2>
          <p class="text-xs text-slate-500">Interview challenges and distributed architecture drills with peer solution discussions</p>
        </div>
      </div>

      <div class="space-y-4">
        ${problems.map(prob => `
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                prob.difficulty === 'Hard' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                prob.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }">
                ${prob.difficulty}
              </span>
              <span class="text-xs font-mono text-slate-400">${prob.solvedCount} students solved</span>
            </div>

            <h3 class="text-base font-bold text-slate-900">${prob.title}</h3>
            <div class="flex flex-wrap gap-1">
              ${prob.tags.map(t => `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">${t}</span>`).join('')}
            </div>

            <div class="pt-2">
              <button data-probid="${prob.id}" class="reveal-solution-btn text-xs font-bold text-blue-600 hover:text-blue-800">
                💡 Reveal Architectural Solution & Discussion ↓
              </button>
              <div id="sol-${prob.id}" class="hidden mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono">
                ${prob.solution}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCirclesSection(circles) {
  return `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-slate-900">Peer Learning Circles & Study Squads</h2>
          <p class="text-xs text-slate-500">Form focused study cohorts, host weekly paper reviews, and collaborate</p>
        </div>
        <button id="open-circle-modal-btn" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all">
          + Create Study Circle
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${circles.map(circle => `
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div class="space-y-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">${circle.domain}</span>
              <h3 class="text-base font-bold text-slate-900">${circle.name}</h3>
              <p class="text-xs text-slate-600">${circle.topic}</p>
              <div class="text-[11px] text-slate-500 font-mono">📍 ${circle.meetSchedule}</div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500 font-mono">${circle.membersCount} Active Members</span>
              <button data-cname="${circle.name}" class="join-circle-btn px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors">
                Join Circle
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function attachLMSEvents(params = {}) {
  // Search & Filter Resources
  const searchInput = document.getElementById("lms-search-input");
  const diffBtns = document.querySelectorAll(".lms-diff-btn");

  const filterResources = () => {
    const q = searchInput?.value.toLowerCase() || "";
    const activeBtn = document.querySelector(".lms-diff-btn.bg-blue-600");
    const diff = activeBtn?.dataset.diff || "all";

    document.querySelectorAll(".lms-card").forEach(card => {
      const title = card.dataset.title || "";
      const domain = card.dataset.domain || "";
      const cardDiff = card.dataset.difficulty || "";

      const matchesSearch = title.includes(q) || domain.includes(q);
      const matchesDiff = diff === "all" || cardDiff === diff;

      card.style.display = (matchesSearch && matchesDiff) ? "flex" : "none";
    });
  };

  if (searchInput) searchInput.addEventListener("input", filterResources);

  diffBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      diffBtns.forEach(b => {
        b.className = "lms-diff-btn px-3 py-2 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors";
      });
      btn.className = "lms-diff-btn px-3 py-2 rounded-xl font-bold bg-blue-600 text-white transition-colors";
      filterResources();
    });
  });

  // Bookmark Button
  document.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lmsId = btn.dataset.lmsid;
      const db = getDB();
      const res = db.lmsResources.find(r => r.id === lmsId);
      if (res) {
        
        res.bookmarks = (res.bookmarks || 0) + 1;
        apiRequest(`/api/lms/resources/${lmsId}/bookmark`, 'POST').catch(console.error);

        const countSpan = btn.querySelector(".bookmark-count");
        if (countSpan) countSpan.innerText = res.bookmarks;
        showToast("Bookmarked", `Saved "${res.title}" to your library.`, "success");
      }
    });
  });

  // Reveal Solution Buttons
  document.querySelectorAll(".reveal-solution-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const probId = btn.dataset.probid;
      const sol = document.getElementById(`sol-${probId}`);
      if (sol) {
        sol.classList.toggle("hidden");
      }
    });
  });

  // Join Circle Buttons
  document.querySelectorAll(".join-circle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cname = btn.dataset.cname;
      showToast("Circle Enrolled", `You have successfully joined the "${cname}" squad!`, "success");
    });
  });

  // Auto-grading Assessment
  const submitQuizBtn = document.getElementById("submit-quiz-btn");
  if (submitQuizBtn) {
    submitQuizBtn.addEventListener("click", () => {
      const q1 = document.querySelector('input[name="q1"]:checked')?.value;
      const q2 = document.querySelector('input[name="q2"]:checked')?.value;

      if (!q1 || !q2) {
        showToast("Incomplete Quiz", "Please select answers for all questions before grading.", "warning");
        return;
      }

      const db = getDB();
      const user = getCurrentUser();
      const certId = `CERT-QUIZ-${Date.now().toString().slice(-4)}`;
      const certHash = `sha256:0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      
      apiRequest('/api/lms/quiz/complete', 'POST', {
        certId,
        verificationHash: certHash,
        eventName: quizEl.dataset.quiz || "Cloud DevOps CI/CD Technical Assessment"
      }).catch(console.error);


      const resultBox = document.getElementById("quiz-result-box");
      if (resultBox) resultBox.classList.remove("hidden");
      showToast("Assessment Passed", "100% score! Certificate of Technical Competence minted.", "success");
    });
  }

  // Publish Guide Modal
  const openBtn = document.getElementById("open-publish-lms-btn");
  const modal = document.getElementById("publish-lms-modal");
  const closeBtn = document.getElementById("close-lms-modal");
  const form = document.getElementById("publish-lms-form");

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

        const newRes = {
          id: "lms-" + (db.lmsResources.length + 1),
          title: document.getElementById("lms-title").value,
          domain: document.getElementById("lms-domain").value,
          difficulty: document.getElementById("lms-diff").value,
          targetSemester: document.getElementById("lms-sem").value,
          readTime: "45 mins lab",
          link: document.getElementById("lms-link").value,
          description: document.getElementById("lms-desc").value,
          author: user.name,
          bookmarks: 0
        };

        
        db.lmsResources.unshift(newRes);
        apiRequest('/api/lms/resources/create', 'POST', newRes).catch(console.error);

        showToast("Resource Published", "Material added to peer LMS repository!", "success");
        modal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
