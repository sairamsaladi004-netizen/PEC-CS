import { getDB, saveDB, logAudit, apiRequest } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';

let activeProblemForSandbox = null;

export function renderLMSView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const activeTab = params.tab || "resources";

  const userRole = (user.role || "").toLowerCase();
  const isClubAdmin = userRole.includes("admin") || userRole.includes("leader") || userRole === "club admin" || user.studentLeaderRole === "President";
  const isCoordinator = userRole.includes("coordinator") || userRole.includes("faculty");
  const isSuperAdmin = userRole.includes("super");
  const canManageLms = isClubAdmin || isCoordinator || isSuperAdmin;

  // Ensure default practice sets & study circles exist in db
  if (!db.practiceProblems || db.practiceProblems.length === 0) {
    db.practiceProblems = [
      {
        id: "prob-1",
        title: "LRU Cache Implementation with O(1) Eviction",
        difficulty: "Medium",
        domain: "Data Structures & Systems",
        tags: ["Hash Map", "Doubly Linked List", "Memory"],
        solvedCount: 142,
        clubId: "I4-08",
        createdBy: "AI & ML Turing Club Admin",
        description: "Design a Least Recently Used (LRU) Cache data structure supporting get and put operations in O(1) time.\n\nImplement the solve(commands, params) function where commands is an array of function calls [\"LRUCache\", \"put\", \"put\", \"get\", ...] and params contains method parameters.",
        starterCode: `function solve(commands, params) {\n  let capacity = params[0][0];\n  let map = new Map();\n  let results = [null];\n  \n  for (let i = 1; i < commands.length; i++) {\n    let cmd = commands[i];\n    let p = params[i];\n    if (cmd === "put") {\n      if (map.has(p[0])) map.delete(p[0]);\n      else if (map.size >= capacity) {\n        let firstKey = map.keys().next().value;\n        map.delete(firstKey);\n      }\n      map.set(p[0], p[1]);\n      results.push(null);\n    } else if (cmd === "get") {\n      if (!map.has(p[0])) {\n        results.push(-1);\n      } else {\n        let val = map.get(p[0]);\n        map.delete(p[0]);\n        map.set(p[0], val);\n        results.push(val);\n      }\n    }\n  }\n  return JSON.stringify(results);\n}`,
        testCases: [
          {
            id: 1,
            input: 'solve(["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]])',
            expectedOutput: '[null,null,null,1,null,-1,null,-1,3,4]',
            description: 'Capacity 2 LRU eviction sequence',
            hidden: false
          },
          {
            id: 2,
            input: 'solve(["LRUCache", "put", "get"], [[1], [2, 100], [2]])',
            expectedOutput: '[null,null,100]',
            description: 'Single element cache hit',
            hidden: false
          }
        ],
        solution: "Utilize a doubly linked list coupled with an unordered hash map where the map values point directly to the list iterators."
      },
      {
        id: "prob-2",
        title: "Max Sum Subarray of Size K (Sliding Window)",
        difficulty: "Easy",
        domain: "Data Structures & Algorithms",
        tags: ["Sliding Window", "Array", "Optimization"],
        solvedCount: 210,
        clubId: "I4-08",
        createdBy: "AI & ML Turing Club Admin",
        description: "Given an array of positive integers arr and integer k, return the maximum sum of any contiguous subarray of size k.",
        starterCode: `function solve(arr, k) {\n  let maxSum = 0, windowSum = 0;\n  for (let i = 0; i < k; i++) windowSum += arr[i];\n  maxSum = windowSum;\n  for (let i = k; i < arr.length; i++) {\n    windowSum += arr[i] - arr[i - k];\n    maxSum = Math.max(maxSum, windowSum);\n  }\n  return maxSum;\n}`,
        testCases: [
          {
            id: 1,
            input: 'solve([2, 1, 5, 1, 3, 2], 3)',
            expectedOutput: '9',
            description: 'Contiguous subarray [5, 1, 3] sum',
            hidden: false
          },
          {
            id: 2,
            input: 'solve([2, 3, 4, 1, 5], 2)',
            expectedOutput: '7',
            description: 'Contiguous subarray [3, 4] sum',
            hidden: false
          }
        ],
        solution: "Compute initial window of size k, then slide window by adding incoming element and subtracting outgoing element."
      }
    ];
    saveDB(db);
  }

  if (!db.quizzes || db.quizzes.length === 0) {
    db.quizzes = [
      {
        id: "quiz-1",
        title: "Cloud Architecture & DevOps Readiness Assessment",
        domain: "Cloud & DevOps",
        durationMinutes: 10,
        passingScorePercent: 80,
        clubId: "I4-07",
        createdBy: "Cloud Computing Club Admin",
        questions: [
          {
            id: "q1",
            questionText: "In Kubernetes, which component is responsible for orchestrating container scheduling across cluster nodes?",
            options: ["kube-scheduler", "kubelet", "etcd", "kube-proxy"],
            correctAnswerIndex: 0,
            explanation: "kube-scheduler watches for newly created Pods with no assigned node and selects a node for them to run on."
          },
          {
            id: "q2",
            questionText: "What HTTP status code signifies that a client has exceeded its rate limit quota in an API Gateway?",
            options: ["400 Bad Request", "429 Too Many Requests", "403 Forbidden", "503 Service Unavailable"],
            correctAnswerIndex: 1,
            explanation: "HTTP status 429 Too Many Requests indicates the user has sent too many requests in a given amount of time."
          },
          {
            id: "q3",
            questionText: "Which deployment strategy guarantees zero downtime by switching traffic between identical physical environments?",
            options: ["Canary Deployment", "Blue-Green Deployment", "Recreate Deployment", "Rolling Update"],
            correctAnswerIndex: 1,
            explanation: "Blue-Green deployment maintains two identical environments and routes router traffic instantly."
          }
        ]
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
        <div class="flex flex-wrap items-center gap-2">
          ${canManageLms ? `
            <button id="open-create-prob-btn" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5">
              <span>⚡ Admin: Create Problem Set</span>
            </button>
            <button id="open-create-quiz-btn" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-1.5">
              <span>📝 Admin: Create Quiz</span>
            </button>
          ` : ''}
          <button id="open-publish-lms-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5">
            <span>+ Publish Resource</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs font-bold">
        <a href="#/lms?tab=resources" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'resources' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          📚 Resource Repository (${(db.lmsResources || []).length})
        </a>
        <a href="#/lms?tab=assessment" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'assessment' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          📝 Timed Quizzes & Auto-Certifications (${(db.quizzes || []).length})
        </a>
        <a href="#/lms?tab=practice" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'practice' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          ⚡ Practice Problem Sets & Sandbox (${(db.practiceProblems || []).length})
        </a>
        <a href="#/lms?tab=circles" class="px-4 py-2 rounded-xl transition-all ${activeTab === 'circles' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          👥 Peer Study Circles (${(db.studyCircles || []).length})
        </a>
        <a href="#/roadmaps" class="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all ml-auto">
          🗺️ View Career Roadmaps →
        </a>
      </div>

      <!-- Active Tab Content -->
      ${
        activeTab === 'assessment' ? renderAssessmentSection(db.quizzes, canManageLms) :
        activeTab === 'practice' ? renderPracticeSection(db.practiceProblems, canManageLms) :
        activeTab === 'circles' ? renderCirclesSection(db.studyCircles) :
        renderResourcesSection(db.lmsResources)
      }

      <!-- Sandbox Modal (Compiler & Test Case Validator) -->
      <div id="sandbox-modal" class="hidden fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
        <div class="bg-slate-900 text-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto border border-slate-800">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div class="flex items-center space-x-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">REAL BACKEND SANDBOX</span>
                <span id="sandbox-domain-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Algorithms</span>
              </div>
              <h3 id="sandbox-problem-title" class="text-lg font-black text-white mt-1">Problem Sandbox</h3>
            </div>
            <button id="close-sandbox-modal" class="text-slate-400 hover:text-white text-xl font-bold p-2">✕</button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Panel: Problem Statement & Test Cases -->
            <div class="space-y-4 text-xs">
              <div class="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <h4 class="font-bold text-slate-200 text-sm">Problem Description</h4>
                <div id="sandbox-problem-desc" class="text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  Write solution logic below.
                </div>
              </div>

              <div class="space-y-2">
                <h4 class="font-bold text-slate-200">Validation Test Cases (Backend Assertions)</h4>
                <div id="sandbox-testcases-list" class="space-y-2 max-h-44 overflow-y-auto pr-1">
                  <!-- Dynamically inserted -->
                </div>
              </div>
            </div>

            <!-- Right Panel: Code Editor & Terminal Output -->
            <div class="space-y-4 flex flex-col justify-between text-xs">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="font-mono font-bold text-slate-300 text-[11px] flex items-center space-x-1.5">
                    <span>💻 JavaScript / Node.js Code Execution Editor</span>
                  </label>
                  <span class="text-[10px] font-mono text-slate-400">Node.js vm Execution</span>
                </div>
                <textarea id="sandbox-code-editor" rows="10" spellcheck="false" class="w-full p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs border border-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner leading-relaxed"></textarea>
              </div>

              <div class="flex items-center space-x-3">
                <button id="sandbox-run-btn" class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-1.5">
                  <span>▶ Run Code (Local Test)</span>
                </button>
                <button id="sandbox-submit-btn" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-1.5">
                  <span>🚀 Submit to Backend VM</span>
                </button>
              </div>

              <!-- Terminal Console Box -->
              <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 min-h-32">
                <div class="flex items-center justify-between border-b border-slate-800/80 pb-1 text-[10px] text-slate-400">
                  <span>SERVER TERMINAL / COMPILER CONSOLE</span>
                  <span id="sandbox-terminal-status" class="text-amber-400">STATUS: IDLE</span>
                </div>
                <div id="sandbox-terminal-output" class="text-slate-300 text-[11px] space-y-1 max-h-40 overflow-y-auto leading-relaxed">
                  <div class="text-slate-500">Ready to execute code in secure Node.js sandbox. Click "Submit to Backend VM" to trigger real server validation.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Problem Set Modal for Admins -->
      <div id="create-prob-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">⚡ Create Practice Problem Set</h3>
              <p class="text-xs text-slate-500">Define code compilation problem, starter template, and backend validation test cases</p>
            </div>
            <button id="close-create-prob-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="create-prob-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Problem Title</label>
              <input type="text" id="prob-title" required placeholder="e.g. Distributed Rate Limiter (Token Bucket Algorithm)" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Domain</label>
                <select id="prob-domain" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Distributed Systems & Cloud">Distributed Systems & Cloud</option>
                  <option value="Artificial Intelligence & Vision">Artificial Intelligence & Vision</option>
                  <option value="Cybersecurity & Cryptography">Cybersecurity & Cryptography</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Difficulty</label>
                <select id="prob-diff" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                  <option value="Easy">Easy</option>
                  <option value="Medium" selected>Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Problem Description</label>
              <textarea id="prob-desc" rows="3" required placeholder="Describe task requirement, parameters, and constraints..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Starter Code Template (JavaScript)</label>
              <textarea id="prob-starter" rows="4" required class="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500">function solve(arr, k) {\n  // Write logic here\n  return 0;\n}</textarea>
            </div>

            <div class="space-y-2 border-t border-slate-100 pt-2">
              <label class="block font-bold text-slate-800">Test Cases (Validation Assertions)</label>
              <div>
                <label class="block text-[11px] text-slate-600 mb-0.5">Test 1 Input Expression (e.g. solve([2,1,5,1,3,2], 3))</label>
                <input type="text" id="tc1-input" required value="solve([2, 1, 5, 1, 3, 2], 3)" class="w-full p-2 rounded-xl border border-slate-200 font-mono" />
              </div>
              <div>
                <label class="block text-[11px] text-slate-600 mb-0.5">Test 1 Expected Output (e.g. 9)</label>
                <input type="text" id="tc1-expected" required value="9" class="w-full p-2 rounded-xl border border-slate-200 font-mono" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Publish Problem Set
            </button>
          </form>
        </div>
      </div>

      <!-- Create Quiz Modal for Admins -->
      <div id="create-quiz-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">📝 Create Timed Assessment</h3>
              <p class="text-xs text-slate-500">Build benchmark quiz with automated score validation and certificate minting</p>
            </div>
            <button id="close-create-quiz-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="create-quiz-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Assessment Title</label>
              <input type="text" id="quiz-title" required placeholder="e.g. Full Stack Web Development & API Security Benchmark" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                <input type="number" id="quiz-duration" value="10" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Passing Threshold (%)</label>
                <input type="number" id="quiz-passing" value="80" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-800">Question 1</h4>
              <input type="text" id="q1-text" required placeholder="Question text..." class="w-full p-2 rounded-xl border border-slate-200" />
              <div class="grid grid-cols-2 gap-2">
                <input type="text" id="q1-opt0" required placeholder="Option 0" class="p-2 rounded-xl border border-slate-200" />
                <input type="text" id="q1-opt1" required placeholder="Option 1" class="p-2 rounded-xl border border-slate-200" />
                <input type="text" id="q1-opt2" required placeholder="Option 2" class="p-2 rounded-xl border border-slate-200" />
                <input type="text" id="q1-opt3" required placeholder="Option 3" class="p-2 rounded-xl border border-slate-200" />
              </div>
              <div>
                <label class="block text-[11px] text-slate-600 mb-0.5">Correct Option Index (0, 1, 2, or 3)</label>
                <input type="number" id="q1-correct" min="0" max="3" value="0" required class="w-full p-2 rounded-xl border border-slate-200" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Publish Assessment
            </button>
          </form>
        </div>
      </div>

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

function renderAssessmentSection(quizzes = [], canManage = false) {
  return `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-3">
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-mono font-bold">Official Technical Benchmark</span>
          <span class="text-xs font-mono text-slate-300">⏱️ Auto-Graded Assessments</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-black">Timed Quizzes & Technical Competence Benchmark</h2>
        <p class="text-xs text-slate-300">Score >= 80% on official quizzes to automatically mint an accredited Certificate of Technical Competence directly to your profile ledger.</p>
      </div>

      <div class="space-y-6">
        ${quizzes.map(quiz => `
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">${quiz.domain}</span>
                <h3 class="text-lg font-black text-slate-900 mt-1">${quiz.title}</h3>
                <p class="text-xs text-slate-500 font-mono">Created by: ${quiz.createdBy || 'Club Leader'} • ${quiz.questions.length} Questions • ${quiz.durationMinutes} Mins</p>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono">Pass: ${quiz.passingScorePercent}%</span>
                ${canManage ? `
                  <button data-quizid="${quiz.id}" class="delete-quiz-btn px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all">
                    🗑️ Delete
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Quiz Form -->
            <form data-quizid="${quiz.id}" class="quiz-submission-form space-y-4 text-xs">
              ${quiz.questions.map((q, idx) => `
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span class="font-bold text-slate-900 text-sm">${idx + 1}. ${q.questionText}</span>
                  <div class="space-y-2">
                    ${q.options.map((opt, optIdx) => `
                      <label class="flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 cursor-pointer transition-all">
                        <input type="radio" name="q_${quiz.id}_${q.id}" value="${optIdx}" required class="w-4 h-4 text-indigo-600" />
                        <span class="text-slate-700 font-medium">${opt}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              `).join('')}

              <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2">
                <span>Submit Assessment for Server Validation & Auto-Grading</span>
              </button>
            </form>

            <div id="quiz-result-${quiz.id}" class="hidden p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
              <!-- Dynamically populated result -->
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPracticeSection(problems = [], canManage = false) {
  return `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">Curated Practice Problem Sets & Backend Sandbox</h2>
          <p class="text-xs text-slate-500">Real code execution sandbox with hidden backend test cases and compilation assertions</p>
        </div>
      </div>

      <div class="space-y-4">
        ${problems.map(prob => `
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  prob.difficulty === 'Hard' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  prob.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }">
                  ${prob.difficulty}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">${prob.domain}</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-xs font-mono text-slate-500">Solved: <strong class="text-slate-800">${prob.solvedCount || 0}</strong></span>
                ${canManage ? `
                  <button data-probid="${prob.id}" class="delete-prob-btn px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors">
                    🗑️ Delete
                  </button>
                ` : ''}
              </div>
            </div>

            <h3 class="text-base font-bold text-slate-900">${prob.title}</h3>
            <p class="text-xs text-slate-600 leading-relaxed">${prob.description || ''}</p>

            <div class="flex flex-wrap gap-1">
              ${(prob.tags || []).map(t => `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">${t}</span>`).join('')}
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button data-probid="${prob.id}" class="reveal-solution-btn text-xs font-bold text-slate-600 hover:text-slate-800">
                💡 View Solution Guide ↓
              </button>

              <button data-probid="${prob.id}" class="open-sandbox-btn px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1">
                <span>⚡ Open Sandbox & Solve →</span>
              </button>
            </div>

            <div id="sol-${prob.id}" class="hidden mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono">
              ${prob.solution || 'Solution details available in sandbox.'}
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
  const db = getDB();

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
      const res = db.lmsResources.find(r => r.id === lmsId);
      if (res) {
        res.bookmarks = (res.bookmarks || 0) + 1;
        saveDB(db);
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

  // Open Sandbox Modal
  const sandboxModal = document.getElementById("sandbox-modal");
  const closeSandboxBtn = document.getElementById("close-sandbox-modal");
  const codeEditor = document.getElementById("sandbox-code-editor");
  const termOutput = document.getElementById("sandbox-terminal-output");
  const termStatus = document.getElementById("sandbox-terminal-status");

  document.querySelectorAll(".open-sandbox-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const probId = btn.dataset.probid;
      const prob = (db.practiceProblems || []).find(p => p.id === probId);
      if (!prob || !sandboxModal) return;

      activeProblemForSandbox = prob;

      document.getElementById("sandbox-problem-title").innerText = prob.title;
      document.getElementById("sandbox-domain-badge").innerText = prob.domain || "Algorithms";
      document.getElementById("sandbox-problem-desc").innerText = prob.description || "No description provided.";

      if (codeEditor) {
        codeEditor.value = prob.starterCode || `function solve() {\n  return 0;\n}`;
      }

      // Render test cases preview table
      const tcContainer = document.getElementById("sandbox-testcases-list");
      if (tcContainer) {
        tcContainer.innerHTML = (prob.testCases || []).map((tc, idx) => `
          <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
            <div class="flex items-center justify-between text-slate-400">
              <span class="font-bold text-emerald-400">Test Case #${idx + 1}: ${tc.description || ''}</span>
              <span>${tc.hidden ? '🔒 Hidden' : '👁️ Public'}</span>
            </div>
            <div class="text-slate-300"><span class="text-slate-500">Input:</span> ${tc.input || ''}</div>
            <div class="text-slate-300"><span class="text-slate-500">Expected:</span> ${tc.expectedOutput || ''}</div>
          </div>
        `).join('');
      }

      if (termOutput) {
        termOutput.innerHTML = `<div class="text-slate-500">Ready to execute code in secure Node.js sandbox. Click "Submit to Backend VM" to trigger real server validation.</div>`;
      }
      if (termStatus) {
        termStatus.innerText = "STATUS: IDLE";
        termStatus.className = "text-amber-400";
      }

      sandboxModal.classList.remove("hidden");
    });
  });

  if (closeSandboxBtn && sandboxModal) {
    closeSandboxBtn.addEventListener("click", () => sandboxModal.classList.add("hidden"));
  }

  // Sandbox Code Execution (Local Test Run)
  const runBtn = document.getElementById("sandbox-run-btn");
  if (runBtn) {
    runBtn.addEventListener("click", async () => {
      const code = codeEditor ? codeEditor.value : "";
      if (!code.trim()) return;

      if (termStatus) {
        termStatus.innerText = "STATUS: RUNNING LOCAL TEST...";
        termStatus.className = "text-blue-400 animate-pulse";
      }

      const res = await apiRequest('/api/sandbox/run', 'POST', {
        code,
        testCases: activeProblemForSandbox ? activeProblemForSandbox.testCases : []
      });

      if (termOutput) {
        if (res && res.success) {
          termOutput.innerHTML = `
            <div class="text-emerald-400 font-bold">✅ LOCAL TEST RUN COMPLETED (0.8 ms)</div>
            ${(res.consoleLogs || []).map(l => `<div class="text-slate-300">LOG: ${l}</div>`).join('')}
            ${(res.testResults || []).map(t => `
              <div class="p-1.5 rounded bg-slate-900 border ${t.passed ? 'border-emerald-800 text-emerald-300' : 'border-rose-800 text-rose-300'} text-[11px]">
                ${t.passed ? '✅ PASS' : '❌ FAIL'}: ${t.description} | Actual: "${t.actualOutput}"
              </div>
            `).join('')}
          `;
          if (termStatus) {
            termStatus.innerText = "STATUS: RUN COMPLETED";
            termStatus.className = "text-emerald-400";
          }
        } else {
          termOutput.innerHTML = `
            <div class="text-rose-400 font-bold">❌ EXECUTION ERROR: ${res ? res.error : 'Execution failed'}</div>
          `;
          if (termStatus) {
            termStatus.innerText = "STATUS: ERROR";
            termStatus.className = "text-rose-400";
          }
        }
      }
    });
  }

  // Sandbox Submit to Backend VM Endpoint (/api/problems/submit)
  const submitBtn = document.getElementById("sandbox-submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const code = codeEditor ? codeEditor.value : "";
      if (!code.trim()) return;

      if (termStatus) {
        termStatus.innerText = "STATUS: SUBMITTING TO BACKEND SERVER VM...";
        termStatus.className = "text-indigo-400 animate-pulse";
      }

      termOutput.innerHTML = `<div class="text-indigo-300">Sending code payload to backend VM for isolated test suite execution...</div>`;

      const res = await apiRequest('/api/problems/submit', 'POST', {
        problemId: activeProblemForSandbox ? activeProblemForSandbox.id : 'prob-1',
        code,
        language: 'javascript'
      });

      if (res && res.passed) {
        if (termStatus) {
          termStatus.innerText = "STATUS: SUBMISSION ACCEPTED (VERIFIED)";
          termStatus.className = "text-emerald-400 font-bold";
        }

        if (termOutput) {
          termOutput.innerHTML = `
            <div class="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 space-y-2">
              <div class="font-bold text-emerald-400 text-xs flex items-center justify-between">
                <span>🎉 SUBMISSION ACCEPTED BY BACKEND SERVER!</span>
                <span>Runtime: ${res.runtimeMs || 0.8} ms</span>
              </div>
              <div class="text-[11px]">${res.message || 'All test case assertions passed successfully!'}</div>
              <div class="space-y-1 mt-2 border-t border-emerald-800/80 pt-2">
                ${(res.testResults || []).map(t => `
                  <div class="flex items-center justify-between text-[10px] text-emerald-300">
                    <span>✅ ${t.description}</span>
                    <span>Expected: ${t.expectedOutput} | Actual: ${t.actualOutput}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

        showToast("Solution Accepted!", "🎉 Solution passed all backend test cases and was verified!", "success");
      } else {
        // REJECTED BY BACKEND
        if (termStatus) {
          termStatus.innerText = "STATUS: SUBMISSION REJECTED BY BACKEND";
          termStatus.className = "text-rose-400 font-bold";
        }

        if (termOutput) {
          termOutput.innerHTML = `
            <div class="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 space-y-2">
              <div class="font-bold text-rose-400 text-xs flex items-center justify-between">
                <span>❌ SUBMISSION REJECTED BY BACKEND ENGINE</span>
                <span>Runtime: ${res ? res.runtimeMs || 0 : 0} ms</span>
              </div>
              <div class="text-[11px]">${res ? res.message : 'Solution failed backend test case assertions.'}</div>
              <div class="space-y-1 mt-2 border-t border-rose-800/80 pt-2">
                ${(res && res.testResults ? res.testResults : []).map(t => `
                  <div class="p-1.5 rounded ${t.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-900/60 text-rose-200'} text-[10px] flex items-center justify-between font-mono">
                    <span>${t.passed ? '✅ PASS' : '❌ FAIL'}: ${t.description}</span>
                    <span>Exp: ${t.expectedOutput} | Rec: ${t.actualOutput}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

        showToast("Submission Rejected", "Backend rejected submission: Code failed required test cases.", "error");
      }
    });
  }

  // Quiz Form Submissions
  document.querySelectorAll(".quiz-submission-form").forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const quizId = form.dataset.quizid;
      const quiz = (db.quizzes || []).find(q => q.id === quizId);
      if (!quiz) return;

      const answers = {};
      quiz.questions.forEach(q => {
        const checked = form.querySelector(`input[name="q_${quiz.id}_${q.id}"]:checked`);
        if (checked) answers[q.id] = Number(checked.value);
      });

      const res = await apiRequest('/api/quizzes/submit', 'POST', { quizId, answers });

      const resultBox = document.getElementById(`quiz-result-${quizId}`);
      if (resultBox) {
        resultBox.classList.remove("hidden");
        if (res && res.passed) {
          resultBox.className = "p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs";
          resultBox.innerHTML = `
            <div class="font-bold text-sm text-emerald-800">🎉 Assessment Passed: ${res.scorePct}% Score!</div>
            <div>${res.message}</div>
            ${res.certificate ? `
              <div class="pt-2 border-t border-emerald-200 flex items-center justify-between">
                <span class="font-mono text-[11px]">Cert ID: ${res.certificate.id}</span>
                <a href="#/certificates" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors">
                  View & Download Certificate →
                </a>
              </div>
            ` : ''}
          `;
          showToast("Quiz Passed!", `You scored ${res.scorePct}%. Certificate minted!`, "success");
        } else {
          resultBox.className = "p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 text-xs";
          resultBox.innerHTML = `
            <div class="font-bold text-sm text-rose-800">❌ Score: ${res ? res.scorePct : 0}% (Required: ${quiz.passingScorePercent}%)</div>
            <div>Your score did not meet the passing threshold. Review materials and retake the assessment.</div>
          `;
          showToast("Assessment Failed", `Score: ${res ? res.scorePct : 0}%. Required: ${quiz.passingScorePercent}%.`, "warning");
        }
      }
    });
  });

  // Admin Modals Triggers
  const openProbBtn = document.getElementById("open-create-prob-btn");
  const createProbModal = document.getElementById("create-prob-modal");
  const closeProbModal = document.getElementById("close-create-prob-modal");
  const createProbForm = document.getElementById("create-prob-form");

  if (openProbBtn && createProbModal) {
    openProbBtn.addEventListener("click", () => createProbModal.classList.remove("hidden"));
    if (closeProbModal) closeProbModal.addEventListener("click", () => createProbModal.classList.add("hidden"));

    if (createProbForm) {
      createProbForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          title: document.getElementById("prob-title").value,
          domain: document.getElementById("prob-domain").value,
          difficulty: document.getElementById("prob-diff").value,
          description: document.getElementById("prob-desc").value,
          starterCode: document.getElementById("prob-starter").value,
          testCases: [
            {
              id: 1,
              input: document.getElementById("tc1-input").value,
              expectedOutput: document.getElementById("tc1-expected").value,
              description: "Primary Validation Assertion"
            }
          ]
        };

        const res = await apiRequest('/api/problems/create', 'POST', payload);
        if (res && res.success) {
          showToast("Problem Created", "New problem set published successfully!", "success");
          createProbModal.classList.add("hidden");
          setTimeout(() => window.location.reload(), 300);
        } else {
          showToast("Error", res ? res.message : "Failed to create problem set.", "error");
        }
      });
    }
  }

  const openQuizBtn = document.getElementById("open-create-quiz-btn");
  const createQuizModal = document.getElementById("create-quiz-modal");
  const closeQuizModal = document.getElementById("close-create-quiz-modal");
  const createQuizForm = document.getElementById("create-quiz-form");

  if (openQuizBtn && createQuizModal) {
    openQuizBtn.addEventListener("click", () => createQuizModal.classList.remove("hidden"));
    if (closeQuizModal) closeQuizModal.addEventListener("click", () => createQuizModal.classList.add("hidden"));

    if (createQuizForm) {
      createQuizForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          title: document.getElementById("quiz-title").value,
          durationMinutes: Number(document.getElementById("quiz-duration").value),
          passingScorePercent: Number(document.getElementById("quiz-passing").value),
          questions: [
            {
              questionText: document.getElementById("q1-text").value,
              options: [
                document.getElementById("q1-opt0").value,
                document.getElementById("q1-opt1").value,
                document.getElementById("q1-opt2").value,
                document.getElementById("q1-opt3").value
              ],
              correctAnswerIndex: Number(document.getElementById("q1-correct").value)
            }
          ]
        };

        const res = await apiRequest('/api/quizzes/create', 'POST', payload);
        if (res && res.success) {
          showToast("Quiz Created", "New timed assessment published successfully!", "success");
          createQuizModal.classList.add("hidden");
          setTimeout(() => window.location.reload(), 300);
        } else {
          showToast("Error", res ? res.message : "Failed to create quiz.", "error");
        }
      });
    }
  }

  // Delete Problem Sets
  document.querySelectorAll(".delete-prob-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const probId = btn.dataset.probid;
      if (confirm("Are you sure you want to delete this problem set?")) {
        const res = await apiRequest(`/api/problems/${probId}`, 'DELETE');
        if (res && res.success) {
          showToast("Problem Deleted", "Problem set removed.", "success");
          setTimeout(() => window.location.reload(), 300);
        }
      }
    });
  });

  // Delete Quizzes
  document.querySelectorAll(".delete-quiz-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const quizId = btn.dataset.quizid;
      if (confirm("Are you sure you want to delete this timed assessment?")) {
        const res = await apiRequest(`/api/quizzes/${quizId}`, 'DELETE');
        if (res && res.success) {
          showToast("Quiz Deleted", "Timed assessment removed.", "success");
          setTimeout(() => window.location.reload(), 300);
        }
      }
    });
  });

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
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Published LMS Resource", newRes.title, `Domain: ${newRes.domain}`);
        showToast("Resource Published", "Material added to peer LMS repository!", "success");
        modal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
