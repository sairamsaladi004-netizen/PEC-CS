import { getCurrentUser } from '../auth.js';
import { getDB, logAudit } from '../db.js';
import { showToast } from '../components/toast.js';

export function renderQuizzesView() {
  const user = getCurrentUser() || {};
  const db = getDB();

  const quizList = [
    {
      id: "qz-101",
      title: "Turing AI & Deep Learning Benchmark 2026",
      club: "AI&ML Turing Club (I4-08)",
      category: "Artificial Intelligence",
      durationMins: 15,
      totalQuestions: 5,
      difficulty: "Intermediate",
      xpReward: 150,
      description: "Assess your knowledge of neural network architectures, backpropagation, transformers, and loss functions.",
      questions: [
        {
          id: "q1",
          question: "Which loss function is standard for multi-class classification tasks with softmax activation?",
          options: [
            "Mean Squared Error (MSE)",
            "Categorical Cross-Entropy",
            "Binary Cross-Entropy",
            "Mean Absolute Error (MAE)"
          ],
          correct: 1,
          explanation: "Categorical Cross-Entropy measures the performance of a classification model whose output is a probability value between 0 and 1."
        },
        {
          id: "q2",
          question: "In Transformer architectures, what is the purpose of Positional Encoding?",
          options: [
            "To reduce memory usage during self-attention",
            "To inject word order / sequence order information into input embeddings",
            "To prevent vanishing gradients in deep networks",
            "To normalize activation outputs"
          ],
          correct: 1,
          explanation: "Transformers process all tokens in parallel without recurrence, so positional encodings give the model information about the relative or absolute position of tokens."
        },
        {
          id: "q3",
          question: "What does the Learning Rate hyperparameter control in Gradient Descent?",
          options: [
            "The total number of training epochs",
            "The batch size per iteration",
            "The step size taken towards a minimum in loss space during optimization",
            "The regularization factor against overfitting"
          ],
          correct: 2,
          explanation: "Learning rate determines the step size at each iteration while moving toward a minimum of a loss function."
        },
        {
          id: "q4",
          question: "Which technique randomly drops neurons during training to prevent co-adaptation and overfitting?",
          options: [
            "Batch Normalization",
            "Dropout",
            "L2 Weight Decay",
            "Gradient Clipping"
          ],
          correct: 1,
          explanation: "Dropout sets input units to 0 with a frequency of rate at each step during training time, preventing overfitting."
        },
        {
          id: "q5",
          question: "What key advantage do Convolutional Neural Networks (CNNs) have over fully connected networks for images?",
          options: [
            "Parameter sharing & translation invariance",
            "No requirement for backpropagation",
            "Unbounded memory capacity",
            "Faster inference on non-matrix data"
          ],
          correct: 0,
          explanation: "CNNs exploit spatial structure using local receptive fields, shared weight matrices (filters), and spatial pooling."
        }
      ]
    },
    {
      id: "qz-102",
      title: "PEC CyberShield Web Vulnerabilities & Cryptography",
      club: "Cyber Security & Forensics Guild (I4-07)",
      category: "Cyber Security",
      durationMins: 10,
      totalQuestions: 4,
      difficulty: "Advanced",
      xpReward: 200,
      description: "Test your vulnerability assessment skills against SQL Injection, XSS, and RSA public-key encryption fundamentals.",
      questions: [
        {
          id: "q1",
          question: "Which HTTP header is specifically designed to mitigate Cross-Site Scripting (XSS) attacks?",
          options: [
            "Content-Security-Policy (CSP)",
            "Access-Control-Allow-Origin",
            "X-Frame-Options",
            "Strict-Transport-Security"
          ],
          correct: 0,
          explanation: "Content-Security-Policy (CSP) restricts the resources (such as JavaScript, CSS, Images) that the browser is allowed to load for a given page."
        },
        {
          id: "q2",
          question: "In SQL Injection prevention, what is the primary security defense?",
          options: [
            "Escaping single quotes manually",
            "Using Prepared Statements with Parameterized Queries",
            "Encrypting all database columns",
            "Hiding database error messages"
          ],
          correct: 1,
          explanation: "Parameterized queries ensure the database driver treats input as data rather than executable SQL code."
        },
        {
          id: "q3",
          question: "Which cryptographic hashing algorithm is currently considered secure for storing passwords when combined with salt?",
          options: [
            "MD5",
            "SHA-1",
            "Argon2 / bcrypt",
            "DES"
          ],
          correct: 2,
          explanation: "Argon2 and bcrypt are memory-hard adaptive key derivation functions designed to resist GPU/ASIC brute-force attacks."
        },
        {
          id: "q4",
          question: "What type of attack involves an adversary secretly relaying and possibly altering communication between two parties?",
          options: [
            "Man-in-the-Middle (MitM)",
            "Distributed Denial of Service (DDoS)",
            "Buffer Overflow",
            "DNS Spoofing"
          ],
          correct: 0,
          explanation: "MitM attacks occur when an attacker intercepts communication between two systems to eavesdrop or impersonate a node."
        }
      ]
    },
    {
      id: "qz-103",
      title: "Full-Stack Data Structures & Algorithmic Efficiency",
      club: "Pragsoft Developers Society (EC-04)",
      category: "Computer Science",
      durationMins: 12,
      totalQuestions: 4,
      difficulty: "Beginner/Intermediate",
      xpReward: 120,
      description: "Covers Big-O analysis, Hash Table collision resolution, and Queue/Stack traversal algorithms.",
      questions: [
        {
          id: "q1",
          question: "What is the average time complexity of searching for a key in a balanced Binary Search Tree (BST)?",
          options: [
            "O(1)",
            "O(log N)",
            "O(N)",
            "O(N log N)"
          ],
          correct: 1,
          explanation: "In a balanced BST, the height of the tree is log2(N), so search operations require O(log N) time."
        },
        {
          id: "q2",
          question: "Which Data Structure follows the Last-In, First-Out (LIFO) order?",
          options: [
            "Queue",
            "Stack",
            "Linked List",
            "Priority Queue"
          ],
          correct: 1,
          explanation: "A Stack inserts and removes elements from the top, obeying LIFO order."
        },
        {
          id: "q3",
          question: "How does a Hash Map achieve average O(1) time complexity for lookup operations?",
          options: [
            "By sorting all keys upon insertion",
            "By computing array memory indices directly via a hashing function",
            "By maintaining a linked list hierarchy",
            "By running parallel threads"
          ],
          correct: 1,
          explanation: "Hash maps use a hash function to map keys to array bucket indices, enabling direct constant-time access."
        },
        {
          id: "q4",
          question: "Which sorting algorithm guarantees O(N log N) time complexity even in its worst-case scenario?",
          options: [
            "Quick Sort",
            "Merge Sort",
            "Bubble Sort",
            "Insertion Sort"
          ],
          correct: 1,
          explanation: "Merge Sort recursively divides the array in half and merges sorted halves, strictly maintaining O(N log N) runtime."
        }
      ]
    }
  ];

  return `
    <div class="max-w-7xl mx-auto space-y-6 pb-12">
      
      <!-- Quiz Header Card -->
      <div class="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
              <span>⏱️ PEC Skill Verification Engine</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">Timed Technical Quizzes & Assessments</h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Complete timed multiple-choice assessments issued by official PEC technical societies to validate domain competency, earn leaderboard XP, and qualify for hackathon certificates.
            </p>
          </div>
          
          <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-center space-y-1 sm:w-56">
            <div class="text-[10px] uppercase font-bold text-purple-300">Your Quiz Account</div>
            <div class="font-bold text-white text-sm truncate">${user.name || 'Student'}</div>
            <div class="text-emerald-400 font-mono text-xs">Ready for Assessment</div>
          </div>
        </div>
      </div>

      <!-- Quiz List Grid -->
      <div id="quiz-list-container" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${quizList.map(q => `
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                  ${q.category}
                </span>
                <span class="text-xs font-mono font-bold text-amber-600 flex items-center space-x-1">
                  <span>✨</span><span>+${q.xpReward} XP</span>
                </span>
              </div>

              <h3 class="text-base font-black text-slate-900 leading-snug">${q.title}</h3>
              <p class="text-xs text-slate-500 leading-relaxed">${q.description}</p>

              <div class="pt-2 flex items-center space-x-4 text-xs text-slate-500 font-medium">
                <div>⏱️ <strong>${q.durationMins} Mins</strong></div>
                <div>❓ <strong>${q.totalQuestions} Questions</strong></div>
                <div class="text-purple-700 font-bold">🎯 ${q.difficulty}</div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[11px] text-slate-400 truncate max-w-32">${q.club}</span>
              <button data-start-quiz="${q.id}" class="start-quiz-btn px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1">
                <span>▶</span>
                <span>Start Assessment</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Active Quiz Execution Container (Hidden initially) -->
      <div id="active-quiz-modal" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 space-y-6 relative">
          <!-- Quiz Header with Timer -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span id="aq-category" class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase"></span>
              <h2 id="aq-title" class="text-lg font-black text-slate-900 mt-1"></h2>
            </div>
            <div class="bg-slate-900 text-white font-mono font-bold px-4 py-2 rounded-2xl text-sm flex items-center space-x-2 border border-slate-700 shadow-inner">
              <span class="text-rose-400 animate-pulse">⏱️</span>
              <span id="aq-timer">15:00</span>
            </div>
          </div>

          <!-- Question Content -->
          <div id="aq-question-box" class="space-y-4">
            <div class="flex items-center justify-between text-xs font-bold text-slate-400">
              <span id="aq-q-number">Question 1 of 5</span>
              <span id="aq-q-progress-pct" class="font-mono text-purple-600">20% Completed</span>
            </div>

            <h3 id="aq-q-text" class="text-sm sm:text-base font-bold text-slate-900 leading-relaxed"></h3>

            <div id="aq-options-container" class="space-y-2.5 pt-2">
              <!-- Rendered via JS -->
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button id="aq-cancel-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
              Exit Quiz
            </button>
            <button id="aq-next-btn" class="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
              Next Question →
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function attachQuizzesEvents() {
  const quizList = [
    {
      id: "qz-101",
      title: "Turing AI & Deep Learning Benchmark 2026",
      category: "Artificial Intelligence",
      durationMins: 15,
      questions: [
        {
          id: "q1",
          question: "Which loss function is standard for multi-class classification tasks with softmax activation?",
          options: ["Mean Squared Error (MSE)", "Categorical Cross-Entropy", "Binary Cross-Entropy", "Mean Absolute Error (MAE)"],
          correct: 1,
          explanation: "Categorical Cross-Entropy measures classification performance with probability outputs."
        },
        {
          id: "q2",
          question: "In Transformer architectures, what is the purpose of Positional Encoding?",
          options: ["To reduce memory usage", "To inject word order / sequence order information into input embeddings", "To prevent vanishing gradients", "To normalize activation outputs"],
          correct: 1,
          explanation: "Positional encodings provide sequence order context since Transformers operate in parallel."
        },
        {
          id: "q3",
          question: "What does the Learning Rate hyperparameter control in Gradient Descent?",
          options: ["The total number of epochs", "The batch size", "The step size taken towards a minimum in loss space during optimization", "The regularization factor"],
          correct: 2,
          explanation: "Learning rate determines the gradient step size at each optimization iteration."
        },
        {
          id: "q4",
          question: "Which technique randomly drops neurons during training to prevent co-adaptation and overfitting?",
          options: ["Batch Normalization", "Dropout", "L2 Weight Decay", "Gradient Clipping"],
          correct: 1,
          explanation: "Dropout sets input units to 0 randomly during training to prevent overfitting."
        },
        {
          id: "q5",
          question: "What key advantage do Convolutional Neural Networks (CNNs) have over fully connected networks for images?",
          options: ["Parameter sharing & translation invariance", "No requirement for backpropagation", "Unbounded memory capacity", "Faster inference on non-matrix data"],
          correct: 0,
          explanation: "CNNs leverage local receptive fields and parameter sharing for image processing."
        }
      ]
    },
    {
      id: "qz-102",
      title: "PEC CyberShield Web Vulnerabilities & Cryptography",
      category: "Cyber Security",
      durationMins: 10,
      questions: [
        {
          id: "q1",
          question: "Which HTTP header is specifically designed to mitigate Cross-Site Scripting (XSS) attacks?",
          options: ["Content-Security-Policy (CSP)", "Access-Control-Allow-Origin", "X-Frame-Options", "Strict-Transport-Security"],
          correct: 0,
          explanation: "CSP restricts executable resources loaded by the browser."
        },
        {
          id: "q2",
          question: "In SQL Injection prevention, what is the primary security defense?",
          options: ["Escaping single quotes manually", "Using Prepared Statements with Parameterized Queries", "Encrypting all database columns", "Hiding database error messages"],
          correct: 1,
          explanation: "Parameterized queries ensure input is treated purely as data."
        },
        {
          id: "q3",
          question: "Which cryptographic hashing algorithm is currently considered secure for storing passwords when combined with salt?",
          options: ["MD5", "SHA-1", "Argon2 / bcrypt", "DES"],
          correct: 2,
          explanation: "Argon2 and bcrypt are memory-hard adaptive hashing algorithms."
        },
        {
          id: "q4",
          question: "What type of attack involves an adversary secretly relaying and possibly altering communication between two parties?",
          options: ["Man-in-the-Middle (MitM)", "Distributed Denial of Service (DDoS)", "Buffer Overflow", "DNS Spoofing"],
          correct: 0,
          explanation: "MitM intercepts and alters communications between endpoint nodes."
        }
      ]
    },
    {
      id: "qz-103",
      title: "Full-Stack Data Structures & Algorithmic Efficiency",
      category: "Computer Science",
      durationMins: 12,
      questions: [
        {
          id: "q1",
          question: "What is the average time complexity of searching for a key in a balanced Binary Search Tree (BST)?",
          options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
          correct: 1,
          explanation: "A balanced BST search takes O(log N) time relative to tree height."
        },
        {
          id: "q2",
          question: "Which Data Structure follows the Last-In, First-Out (LIFO) order?",
          options: ["Queue", "Stack", "Linked List", "Priority Queue"],
          correct: 1,
          explanation: "Stacks insert and pop from the top following LIFO logic."
        },
        {
          id: "q3",
          question: "How does a Hash Map achieve average O(1) time complexity for lookup operations?",
          options: ["By sorting all keys upon insertion", "By computing array memory indices directly via a hashing function", "By maintaining a linked list hierarchy", "By running parallel threads"],
          correct: 1,
          explanation: "Hash functions compute direct array index addresses for keys."
        },
        {
          id: "q4",
          question: "Which sorting algorithm guarantees O(N log N) time complexity even in its worst-case scenario?",
          options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Insertion Sort"],
          correct: 1,
          explanation: "Merge sort guarantees O(N log N) time regardless of initial array ordering."
        }
      ]
    }
  ];

  let currentActiveQuiz = null;
  let currentQIndex = 0;
  let selectedAnswers = {};
  let quizTimerInterval = null;
  let remainingSeconds = 0;

  document.querySelectorAll('.start-quiz-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const qzId = btn.getAttribute('data-start-quiz');
      currentActiveQuiz = quizList.find(q => q.id === qzId);
      if (!currentActiveQuiz) return;

      currentQIndex = 0;
      selectedAnswers = {};
      remainingSeconds = currentActiveQuiz.durationMins * 60;

      // Update Modal UI
      document.getElementById('aq-category').textContent = currentActiveQuiz.category;
      document.getElementById('aq-title').textContent = currentActiveQuiz.title;

      renderCurrentQuestion();
      startTimer();

      document.getElementById('active-quiz-modal').classList.remove('hidden');
    });
  });

  function startTimer() {
    clearInterval(quizTimerInterval);
    updateTimerDisplay();

    quizTimerInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds <= 0) {
        clearInterval(quizTimerInterval);
        submitQuizResults();
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const timerElem = document.getElementById('aq-timer');
    if (timerElem) {
      timerElem.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  function renderCurrentQuestion() {
    if (!currentActiveQuiz) return;
    const q = currentActiveQuiz.questions[currentQIndex];
    const total = currentActiveQuiz.questions.length;

    document.getElementById('aq-q-number').textContent = `Question ${currentQIndex + 1} of ${total}`;
    document.getElementById('aq-q-progress-pct').textContent = `${Math.round(((currentQIndex + 1) / total) * 100)}% Completed`;
    document.getElementById('aq-q-text').textContent = q.question;

    const optBox = document.getElementById('aq-options-container');
    optBox.innerHTML = q.options.map((opt, idx) => {
      const isSelected = selectedAnswers[currentQIndex] === idx;
      return `
        <button data-opt-idx="${idx}" class="quiz-option-btn w-full p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
          isSelected ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-xs' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
        }">
          <div class="flex items-center space-x-3">
            <span class="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-mono font-bold ${isSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-100 text-slate-600'}">
              ${String.fromCharCode(65 + idx)}
            </span>
            <span>${opt}</span>
          </div>
          ${isSelected ? '<span class="text-purple-600 font-bold">✓</span>' : ''}
        </button>
      `;
    }).join('');

    // Attach option handlers
    optBox.querySelectorAll('.quiz-option-btn').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-opt-idx'));
        selectedAnswers[currentQIndex] = idx;
        renderCurrentQuestion();
      });
    });

    const nextBtn = document.getElementById('aq-next-btn');
    if (currentQIndex === total - 1) {
      nextBtn.textContent = "Submit & Complete Assessment ✓";
      nextBtn.className = "px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md";
    } else {
      nextBtn.textContent = "Next Question →";
      nextBtn.className = "px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md";
    }
  }

  const nextBtn = document.getElementById('aq-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (selectedAnswers[currentQIndex] === undefined) {
        showToast("Please select an answer option before proceeding.", "info");
        return;
      }

      if (currentQIndex < currentActiveQuiz.questions.length - 1) {
        currentQIndex++;
        renderCurrentQuestion();
      } else {
        submitQuizResults();
      }
    });
  }

  const cancelBtn = document.getElementById('aq-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      clearInterval(quizTimerInterval);
      document.getElementById('active-quiz-modal').classList.add('hidden');
    });
  }

  function submitQuizResults() {
    clearInterval(quizTimerInterval);
    let correctCount = 0;
    const total = currentActiveQuiz.questions.length;

    currentActiveQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / total) * 100);
    const passed = scorePct >= 60;

    logAudit(
      getCurrentUser().name || "Student",
      "Quiz Assessment Submitted",
      "Student",
      `Completed ${currentActiveQuiz.title}: Score ${scorePct}% (${correctCount}/${total})`
    );

    const qBox = document.getElementById('aq-question-box');
    qBox.innerHTML = `
      <div class="text-center py-6 space-y-4">
        <div class="w-16 h-16 rounded-3xl ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} flex items-center justify-center text-3xl mx-auto shadow-md">
          ${passed ? '🎉' : '⚠️'}
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-900">${passed ? 'Assessment Passed Successfully!' : 'Assessment Complete'}</h3>
          <p class="text-xs text-slate-500 mt-1">You answered ${correctCount} out of ${total} questions correctly.</p>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-slate-500 font-bold">Score Percentage:</span>
            <span class="font-mono font-bold text-slate-900 text-sm">${scorePct}%</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-500 font-bold">XP Awarded:</span>
            <span class="font-mono font-bold text-amber-600 text-sm">${passed ? `+${currentActiveQuiz.xpReward} XP` : '0 XP'}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-500 font-bold">Status Badge:</span>
            <span class="font-bold text-xs ${passed ? 'text-emerald-600' : 'text-rose-600'}">${passed ? 'PASSED ✓' : 'NEEDS REVISION'}</span>
          </div>
        </div>

        <button id="close-quiz-result-btn" class="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
          Return to Quizzes
        </button>
      </div>
    `;

    document.getElementById('aq-next-btn').classList.add('hidden');

    const closeResultBtn = document.getElementById('close-quiz-result-btn');
    if (closeResultBtn) {
      closeResultBtn.addEventListener('click', () => {
        document.getElementById('active-quiz-modal').classList.add('hidden');
        document.getElementById('aq-next-btn').classList.remove('hidden');
      });
    }
  }
}
