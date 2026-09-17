import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

const QUIZ_DATA = [
  {
    id: "quiz-ds-01",
    title: "Data Structures & Algorithms Sprint",
    category: "Computer Science",
    difficulty: "Intermediate",
    timeLimit: 10, // minutes
    passingScore: 70,
    club: "Coding & Algo Society (I4-01)",
    description: "Assess your mastery of Arrays, Linked Lists, Trees, Dynamic Programming, and Graph Traversals.",
    questions: [
      {
        q: "What is the worst-case time complexity of QuickSort algorithm?",
        options: ["O(N log N)", "O(N²)", "O(N)", "O(log N)"],
        correct: 1,
        explanation: "QuickSort has a worst-case time complexity of O(N²) when the pivot chosen is always the extreme element."
      },
      {
        q: "Which data structure follows the Last-In-First-Out (LIFO) order?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correct: 1,
        explanation: "Stack uses LIFO principles where push and pop occur at the top."
      },
      {
        q: "In a binary search tree, what is the in-order traversal result?",
        options: ["Random order", "Reverse sorted order", "Sorted ascending order", "Breadth-first order"],
        correct: 2,
        explanation: "In-order traversal (Left, Root, Right) yields elements in ascending sorted order."
      },
      {
        q: "What is the primary advantage of a Hash Table over a Binary Search Tree?",
        options: ["O(1) average time search", "Guaranteed O(log N) worst case", "Maintains sorted order", "Uses less memory"],
        correct: 0,
        explanation: "Hash Tables offer O(1) average time complexity for insertions and lookups."
      },
      {
        q: "Which algorithm is used to find the shortest path in a weighted graph without negative edges?",
        options: ["Kruskal's Algorithm", "Dijkstra's Algorithm", "Floyd-Warshall", "Prim's Algorithm"],
        correct: 1,
        explanation: "Dijkstra's algorithm efficiently computes single-source shortest paths for non-negative weights."
      }
    ]
  },
  {
    id: "quiz-py-02",
    title: "Python 3 & Data Science Essentials",
    category: "AI & Data Science",
    difficulty: "Beginner",
    timeLimit: 8,
    passingScore: 60,
    club: "AI & ML Turing Club (I4-08)",
    description: "Evaluate your core knowledge of Python syntax, List Comprehensions, NumPy arrays, and Pandas DataFrames.",
    questions: [
      {
        q: "Which keyword is used to define a function in Python?",
        options: ["function", "def", "func", "declare"],
        correct: 1,
        explanation: "The 'def' keyword introduces a function definition in Python."
      },
      {
        q: "What is the output of len(set([1, 2, 2, 3, 3, 3])) in Python?",
        options: ["6", "3", "1", "Error"],
        correct: 1,
        explanation: "A Python set automatically removes duplicate elements, yielding {1, 2, 3} with length 3."
      },
      {
        q: "Which library is the standard foundation for array computation in Python data science?",
        options: ["NumPy", "Flask", "PyGame", "BeautifulSoup"],
        correct: 0,
        explanation: "NumPy provides ndarray objects for high-performance vectorized linear algebra and math."
      },
      {
        q: "How do you create a shallow copy of list `a` in Python?",
        options: ["b = a", "b = a.copy()", "b = a.pointer()", "b = clone(a)"],
        correct: 1,
        explanation: "`a.copy()` or `a[:]` creates a shallow duplicate without pointing to the original reference."
      }
    ]
  },
  {
    id: "quiz-web-03",
    title: "Modern Full-Stack Web Development",
    category: "Web & Cloud",
    difficulty: "Intermediate",
    timeLimit: 10,
    passingScore: 70,
    club: "Web Innovation Society (I4-05)",
    description: "Test your skills in JavaScript ES6+, React Hooks, DOM events, and Async/Await REST API integration.",
    questions: [
      {
        q: "What does the 'flex-direction: column' CSS property do?",
        options: ["Aligns items horizontally", "Stacks items vertically top-to-bottom", "Distributes items with equal gaps", "Hides overflowing content"],
        correct: 1,
        explanation: "flex-direction: column sets the main axis vertically."
      },
      {
        q: "Which HTTP method is idempotent and used to retrieve server resources?",
        options: ["POST", "GET", "PATCH", "DELETE"],
        correct: 1,
        explanation: "GET requests retrieve data without altering server state and are idempotent."
      },
      {
        q: "What does Promise.all() return if any single promise rejects?",
        options: ["Array of settled promises", "Immediately rejects with that error", "Ignores the error", "Returns null"],
        correct: 1,
        explanation: "Promise.all fails fast and rejects immediately with the first encountered rejection."
      }
    ]
  },
  {
    id: "quiz-iot-04",
    title: "IoT & Embedded Systems Fundamentals",
    category: "Hardware & Electronics",
    difficulty: "Advanced",
    timeLimit: 12,
    passingScore: 75,
    club: "Robotics & Automation Society (I4-02)",
    description: "Questions covering ESP32 microcontrollers, MQTT protocol, sensor interfacing, and GPIO pinouts.",
    questions: [
      {
        q: "Which lightweight messaging protocol is widely used for IoT devices?",
        options: ["HTTP/2", "MQTT", "FTP", "SMTP"],
        correct: 1,
        explanation: "MQTT (Message Queuing Telemetry Transport) is lightweight publish-subscribe messaging for IoT."
      },
      {
        q: "What is the typical operating voltage for ESP32 and STM32 microcontrollers?",
        options: ["5.0V", "3.3V", "12.0V", "1.8V"],
        correct: 1,
        explanation: "Modern microcontrollers operate on 3.3V logic levels."
      }
    ]
  }
];

let activeQuizState = null;
let activeTimerInterval = null;

export function renderQuizzesView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const selectedCat = params.category || "All";

  const categories = ["All", "Computer Science", "AI & Data Science", "Web & Cloud", "Hardware & Electronics"];

  const filteredQuizzes = selectedCat === "All" 
    ? QUIZ_DATA 
    : QUIZ_DATA.filter(q => q.category === selectedCat);

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Banner Header -->
      <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <span>⏱️ Real-Time Assessment Center</span>
              <span>•</span>
              <span>Pragati Engineering College</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Technical Society Timed Quizzes
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Test your algorithmic knowledge, domain mastery, and coding aptitude under strict timed conditions. Score ≥ 70% to claim accredited society skill badges.
            </p>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center shrink-0">
            <div class="text-2xl font-black text-amber-400 font-mono">PEC Badges</div>
            <div class="text-[11px] text-slate-300 font-medium mt-0.5">Automated Certificate Rewards</div>
          </div>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex items-center space-x-2 overflow-x-auto pb-2 text-xs font-bold border-b border-slate-200">
        ${categories.map(cat => `
          <a href="#/quizzes?category=${encodeURIComponent(cat)}" class="px-4 py-2 rounded-xl transition-all whitespace-nowrap ${selectedCat === cat ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            ${cat}
          </a>
        `).join('')}
      </div>

      <!-- Quizzes List Grid -->
      <div id="quizzes-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${filteredQuizzes.map(quiz => `
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] font-mono border border-blue-200/60">
                  ${quiz.category}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${quiz.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-800' : quiz.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">
                  ${quiz.difficulty}
                </span>
              </div>

              <div>
                <h2 class="text-base font-black text-slate-900 tracking-tight">${quiz.title}</h2>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">${quiz.description}</p>
              </div>

              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span class="text-[10px] text-slate-400 font-bold uppercase block">Questions</span>
                  <span class="font-bold text-slate-800 font-mono">${quiz.questions.length} Items</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-bold uppercase block">Timer</span>
                  <span class="font-bold text-blue-600 font-mono">${quiz.timeLimit} mins</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-bold uppercase block">Cut-Off</span>
                  <span class="font-bold text-emerald-600 font-mono">${quiz.passingScore}%</span>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-[11px] text-slate-400 font-medium">${quiz.club}</span>
              <button data-start-quiz="${quiz.id}" class="start-quiz-btn px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center space-x-1">
                <span>Start Timed Assessment</span>
                <span>→</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- ACTIVE QUIZ MODAL -->
      <div id="quiz-modal" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div id="quiz-modal-card" class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6">
          <!-- Rendered dynamically -->
        </div>
      </div>

    </div>
  `;
}

export function attachQuizzesEvents() {
  document.querySelectorAll(".start-quiz-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const quizId = btn.dataset.startQuiz;
      const quiz = QUIZ_DATA.find(q => q.id === quizId);
      if (quiz) {
        startQuizSession(quiz);
      }
    });
  });
}

function startQuizSession(quiz) {
  activeQuizState = {
    quiz,
    currentQuestionIndex: 0,
    answers: {},
    timeRemainingSeconds: quiz.timeLimit * 60,
    submitted: false
  };

  const modal = document.getElementById("quiz-modal");
  if (!modal) return;
  modal.classList.remove("hidden");

  // Start countdown timer
  if (activeTimerInterval) clearInterval(activeTimerInterval);
  activeTimerInterval = setInterval(() => {
    if (!activeQuizState || activeQuizState.submitted) {
      clearInterval(activeTimerInterval);
      return;
    }
    activeQuizState.timeRemainingSeconds--;
    if (activeQuizState.timeRemainingSeconds <= 0) {
      clearInterval(activeTimerInterval);
      submitQuizSession();
    } else {
      updateQuizTimerDisplay();
    }
  }, 1000);

  renderActiveQuizCard();
}

function updateQuizTimerDisplay() {
  const timerElem = document.getElementById("quiz-countdown-timer");
  if (!timerElem || !activeQuizState) return;
  const mins = Math.floor(activeQuizState.timeRemainingSeconds / 60);
  const secs = activeQuizState.timeRemainingSeconds % 60;
  timerElem.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  if (activeQuizState.timeRemainingSeconds < 60) {
    timerElem.classList.add("text-rose-600", "animate-pulse");
  }
}

function renderActiveQuizCard() {
  const modalCard = document.getElementById("quiz-modal-card");
  if (!modalCard || !activeQuizState) return;

  const { quiz, currentQuestionIndex, answers } = activeQuizState;
  const q = quiz.questions[currentQuestionIndex];
  const mins = Math.floor(activeQuizState.timeRemainingSeconds / 60);
  const secs = activeQuizState.timeRemainingSeconds % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  modalCard.innerHTML = `
    <!-- Quiz Session Header -->
    <div class="flex items-center justify-between pb-4 border-b border-slate-100">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">${quiz.category} • ${quiz.title}</span>
        <h2 class="text-base font-black text-slate-900 mt-0.5">Question ${currentQuestionIndex + 1} of ${quiz.questions.length}</h2>
      </div>
      <div class="flex items-center space-x-3">
        <div class="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center space-x-1.5">
          <span>⏱️</span>
          <span id="quiz-countdown-timer">${timeStr}</span>
        </div>
        <button id="close-quiz-btn" class="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer">✕</button>
      </div>
    </div>

    <!-- Question Body -->
    <div class="space-y-4">
      <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <p class="text-sm font-bold text-slate-900 leading-snug">${q.q}</p>
      </div>

      <!-- Multiple Choice Radio Cards -->
      <div class="space-y-2.5">
        ${q.options.map((opt, idx) => {
          const isSelected = answers[currentQuestionIndex] === idx;
          return `
            <label class="quiz-option-card flex items-center p-3.5 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-slate-300'}">
              <input type="radio" name="quiz-opt" value="${idx}" ${isSelected ? 'checked' : ''} class="w-4 h-4 text-blue-600 focus:ring-blue-500 mr-3" />
              <span class="text-xs font-semibold text-slate-800">${opt}</span>
            </label>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Stepper Footer -->
    <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
      <button id="prev-q-btn" ${currentQuestionIndex === 0 ? 'disabled' : ''} class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40 cursor-pointer">
        ← Previous
      </button>

      <div class="flex space-x-1">
        ${quiz.questions.map((_, i) => `
          <span class="w-2.5 h-2.5 rounded-full ${i === currentQuestionIndex ? 'bg-blue-600' : answers[i] !== undefined ? 'bg-emerald-500' : 'bg-slate-200'}"></span>
        `).join('')}
      </div>

      ${currentQuestionIndex === quiz.questions.length - 1 ? `
        <button id="submit-quiz-final-btn" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md cursor-pointer">
          Submit Test ✓
        </button>
      ` : `
        <button id="next-q-btn" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer">
          Next Question →
        </button>
      `}
    </div>
  `;

  // Attach session controls
  document.getElementById("close-quiz-btn")?.addEventListener("click", () => {
    if (confirm("Quit quiz session? Progress will be lost.")) {
      closeQuizSession();
    }
  });

  document.querySelectorAll("input[name='quiz-opt']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      activeQuizState.answers[currentQuestionIndex] = parseInt(e.target.value, 10);
      renderActiveQuizCard();
    });
  });

  document.getElementById("prev-q-btn")?.addEventListener("click", () => {
    if (activeQuizState.currentQuestionIndex > 0) {
      activeQuizState.currentQuestionIndex--;
      renderActiveQuizCard();
    }
  });

  document.getElementById("next-q-btn")?.addEventListener("click", () => {
    if (activeQuizState.currentQuestionIndex < activeQuizState.quiz.questions.length - 1) {
      activeQuizState.currentQuestionIndex++;
      renderActiveQuizCard();
    }
  });

  document.getElementById("submit-quiz-final-btn")?.addEventListener("click", () => {
    submitQuizSession();
  });
}

function submitQuizSession() {
  if (!activeQuizState) return;
  activeQuizState.submitted = true;
  if (activeTimerInterval) clearInterval(activeTimerInterval);

  const { quiz, answers } = activeQuizState;
  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (answers[idx] === q.correct) {
      correctCount++;
    }
  });

  const total = quiz.questions.length;
  const scorePct = Math.round((correctCount / total) * 100);
  const passed = scorePct >= quiz.passingScore;

  const modalCard = document.getElementById("quiz-modal-card");
  if (!modalCard) return;

  const user = getCurrentUser() || {};
  if (passed && user.id) {
    const db = getDB();
    db.certificates = db.certificates || [];
    const newCert = {
      id: `CERT-QUIZ-${Date.now().toString().slice(-6)}`,
      student_id: user.id,
      studentName: user.name || "Student Delegate",
      rollNo: user.rollNo || "22A31A0501",
      awardType: `Certificate of Quiz Excellence (${quiz.title})`,
      eventName: quiz.title,
      issued_date: new Date().toISOString().split("T")[0],
      qrHash: `HASH-QUIZ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    };
    db.certificates.push(newCert);
    saveDB(db);
    logAudit("Student", "Passed Assessment Quiz", user.name, `Quiz: ${quiz.title}`);
  }

  modalCard.innerHTML = `
    <div class="text-center space-y-4 py-4">
      <div class="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}">
        ${passed ? '🏆' : '📚'}
      </div>

      <div>
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
          ${passed ? 'Assessment Passed' : 'Needs Practice'}
        </span>
        <h2 class="text-2xl font-black text-slate-900 mt-2">Your Score: ${scorePct}%</h2>
        <p class="text-xs text-slate-500 mt-1">Answered ${correctCount} of ${total} questions correctly. Cut-off score is ${quiz.passingScore}%.</p>
      </div>

      ${passed ? `
        <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
          <div class="font-bold">🎉 Society Skill Certificate Issued!</div>
          <p class="text-[11px] text-emerald-700">Your accomplishment has been saved to your digital credential wallet.</p>
        </div>
      ` : `
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
          Review the course resources or re-attempt the quiz to earn your society badge.
        </div>
      `}

      <div class="pt-4 border-t border-slate-100 flex items-center justify-center space-x-3 text-xs">
        ${passed ? `
          <a href="#/student/certificates" class="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md">
            View Certificate Ledger →
          </a>
        ` : ''}
        <button id="close-quiz-result-btn" class="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl cursor-pointer">
          Close Window
        </button>
      </div>
    </div>
  `;

  document.getElementById("close-quiz-result-btn")?.addEventListener("click", () => {
    closeQuizSession();
  });
}

function closeQuizSession() {
  if (activeTimerInterval) clearInterval(activeTimerInterval);
  activeQuizState = null;
  const modal = document.getElementById("quiz-modal");
  if (modal) modal.classList.add("hidden");
}
