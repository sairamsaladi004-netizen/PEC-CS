import { getCurrentUser, loginUser, registerStudent, resetPassword, verifyEmailWithOTP, getAllDemoAccounts, loginWithGoogle } from '../auth.js';

export function renderLoginView() {
  const user = getCurrentUser();
  const demoAccounts = getAllDemoAccounts();

  return `
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      <!-- Institutional Header Banner -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm mb-8 text-center relative overflow-hidden">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-lg shadow-blue-500/20 mb-4">
          P
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pragati Engineering College</h1>
        <p class="text-xs sm:text-sm font-semibold text-blue-600 uppercase tracking-widest mt-1">Autonomous • Career Guidance Cell & Central Council of Clubs</p>
        <p class="text-xs text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
          Unified campus portal for 35 official technical societies, event registrations, QR gate attendance, accredited credentials, and council governance.
        </p>
      </div>

      <!-- Direct Demo Login Banner for 4 Roles -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 border border-slate-700/80 mb-8 shadow-xl text-white space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider font-mono">
              DIRECT 1-CLICK DEMO LOGIN
            </span>
            <span class="text-xs font-bold text-slate-200">Select Any Institutional Persona</span>
          </div>
          <span class="text-[11px] text-emerald-400 font-mono font-bold">● Click card for instant portal access</span>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <!-- Student Role Direct Login -->
          <button type="button" class="demo-login-btn text-left p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 transition-all hover:scale-[1.02] cursor-pointer group shadow-md" data-user-id="std-101" data-demo-email="aarav.sharma@pragati.ac.in" data-role="Student">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🎓 Student Member</span>
              <span class="text-[10px] font-mono text-emerald-400 group-hover:underline">1-Click Login 🚀</span>
            </div>
            <div class="text-sm font-bold text-white">Aarav Sharma</div>
            <div class="text-[10px] font-mono text-slate-300 mt-0.5">aarav.sharma@pragati.ac.in</div>
            <div class="text-[10px] text-slate-400 font-mono mt-1">Roll No: <strong class="text-emerald-300">22CS101</strong></div>
            <div class="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
              <span class="text-slate-400">Target Portal:</span>
              <span class="font-bold text-emerald-400">Student Dashboard</span>
            </div>
          </button>

          <!-- Club Admin Role Direct Login -->
          <button type="button" class="demo-login-btn text-left p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-blue-500/40 hover:border-blue-400 transition-all hover:scale-[1.02] cursor-pointer group shadow-md" data-user-id="std-102" data-demo-email="priya.patel@pragati.ac.in" data-role="Club Admin">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">⚡ Club Admin</span>
              <span class="text-[10px] font-mono text-blue-400 group-hover:underline">1-Click Login 🚀</span>
            </div>
            <div class="text-sm font-bold text-white">Priya Patel</div>
            <div class="text-[10px] font-mono text-slate-300 mt-0.5">priya.patel@pragati.ac.in</div>
            <div class="text-[10px] text-slate-400 font-mono mt-1">Roll No: <strong class="text-blue-300">22CS142</strong></div>
            <div class="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
              <span class="text-slate-400">Target Portal:</span>
              <span class="font-bold text-blue-400">Club Admin Panel</span>
            </div>
          </button>

          <!-- Faculty Coordinator Role Direct Login -->
          <button type="button" class="demo-login-btn text-left p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-purple-500/40 hover:border-purple-400 transition-all hover:scale-[1.02] cursor-pointer group shadow-md" data-user-id="coord-201" data-demo-email="yamuna.l@pragati.ac.in" data-role="Faculty Coordinator">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">🏫 Faculty Coord</span>
              <span class="text-[10px] font-mono text-purple-400 group-hover:underline">1-Click Login 🚀</span>
            </div>
            <div class="text-sm font-bold text-white">Mrs. L. Yamuna</div>
            <div class="text-[10px] font-mono text-slate-300 mt-0.5">yamuna.l@pragati.ac.in</div>
            <div class="text-[10px] text-slate-400 font-mono mt-1">Faculty ID: <strong class="text-purple-300">FAC-CSE-AIML-01</strong></div>
            <div class="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
              <span class="text-slate-400">Target Portal:</span>
              <span class="font-bold text-purple-400">Faculty Coordinator</span>
            </div>
          </button>

          <!-- Director (Academics) Role Direct Login -->
          <button type="button" class="demo-login-btn text-left p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-rose-500/40 hover:border-rose-400 transition-all hover:scale-[1.02] cursor-pointer group shadow-md" data-user-id="admin-001" data-demo-email="principal@pragati.ac.in" data-role="Director(Academics)">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">🏛️ Director(Academics)</span>
              <span class="text-[10px] font-mono text-rose-400 group-hover:underline">1-Click Login 🚀</span>
            </div>
            <div class="text-sm font-bold text-white">Dr. K. Satyanarayana</div>
            <div class="text-[10px] font-mono text-slate-300 mt-0.5">principal@pragati.ac.in</div>
            <div class="text-[10px] text-slate-400 font-mono mt-1">Faculty ID: <strong class="text-rose-300">FAC-PEC-001</strong></div>
            <div class="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
              <span class="text-slate-400">Target Portal:</span>
              <span class="font-bold text-rose-400">Directorate & Academic Council</span>
            </div>
          </button>

        </div>
      </div>

      <!-- Main Login & Register Tabs Card -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="flex border-b border-slate-200">
          <button id="tab-login-btn" class="flex-1 py-4 text-center text-xs font-black uppercase tracking-wider transition-colors border-b-2 border-blue-600 text-blue-600 bg-blue-50/30">
            Sign In with College Credentials
          </button>
          <button id="tab-register-btn" class="flex-1 py-4 text-center text-xs font-black uppercase tracking-wider transition-colors border-b-2 border-transparent text-slate-400 hover:text-slate-700">
            Register New Student
          </button>
        </div>

        <div class="p-6 sm:p-8">
          
          <!-- LOGIN FORM -->
          <div id="login-form-section">
            <form id="login-form" class="space-y-4 max-w-md mx-auto">
              <div id="login-alert" class="hidden p-3 rounded-xl text-xs font-medium"></div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">College Roll Number or Email</label>
                <div class="relative">
                  <input type="text" id="login-identifier" required placeholder="e.g. 22CS101 or aarav.sharma@pragati.ac.in" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" value="22CS101" />
                </div>
                <p class="text-[10px] text-slate-400 mt-1">Accepts Roll Number, Faculty ID, or Pragati email.</p>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-bold text-slate-700">Password</label>
                  <button type="button" id="forgot-password-trigger" class="text-[11px] text-blue-600 hover:underline font-semibold">Forgot Password?</button>
                </div>
                <input type="password" id="login-password" required placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" value="Password@123" />
                <p class="text-[10px] text-slate-400 mt-1">Demo password is <code class="bg-slate-100 px-1 rounded font-mono">Password@123</code></p>
              </div>

              <button type="submit" id="login-submit-btn" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all">
                Sign In to Portal
              </button>

              <div class="relative flex py-2 items-center">
                <div class="flex-grow border-t border-slate-200"></div>
                <span class="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or Institutional SSO</span>
                <div class="flex-grow border-t border-slate-200"></div>
              </div>

              <button type="button" id="google-oauth-btn" class="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2.5 cursor-pointer">
                <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.15v3.15C3.15 21.32 7.21 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.15C.42 8.04 0 9.96 0 12s.42 3.96 1.15 5.42l4.13-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.21 0 3.15 2.68 1.15 6.58l4.13 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
                <span>Sign In / Register with Google (Supabase OAuth)</span>
              </button>
            </form>
          </div>

          <!-- REGISTRATION FORM WITH ROLE CLASSIFICATION -->
          <div id="register-form-section" class="hidden">
            <form id="register-form" class="space-y-4 max-w-lg mx-auto">
              <div id="register-alert" class="hidden p-3 rounded-xl text-xs font-medium"></div>

              <!-- Role Classification Dropdown -->
              <div class="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1.5 border border-slate-700">
                <label class="block text-xs font-black uppercase tracking-wider text-amber-400">Select Account Role Classification</label>
                <select id="reg-role" class="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold border border-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer">
                  <option value="Student">🎓 Student Member (Standard Portal Access)</option>
                  <option value="Club Admin">⚡ Club Admin / Student Leader (Club Management & Attendance)</option>
                  <option value="Faculty Coordinator">🏫 Faculty Coordinator (Council Approvals & Governance)</option>
                  <option value="Super Admin">🏛️ Director (Academics) / Super Admin (Full Institutional Control)</option>
                </select>
                <p id="reg-role-desc" class="text-[10px] text-slate-300">Classifies your account in Supabase database and grants role-appropriate permissions.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input type="text" id="reg-name" required placeholder="Full Name" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label id="reg-roll-label" class="block text-xs font-bold text-slate-700 mb-1">Roll Number / Registration ID</label>
                  <input type="text" id="reg-roll" required placeholder="e.g. 23CS204" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 uppercase" />
                </div>
              </div>

              <!-- Conditional Assigned Club for Club Admin -->
              <div id="reg-club-container" class="hidden">
                <label class="block text-xs font-bold text-slate-700 mb-1">Assigned Technical Society / Club</label>
                <select id="reg-assigned-club" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500">
                  <option value="I4-08">Turing AI & Data Science Society (I4-08)</option>
                  <option value="I4-07">Cyber Security & Forensics Guild (I4-07)</option>
                  <option value="I4-06">Robotics & Embedded Systems Lab (I4-06)</option>
                  <option value="I4-01">Aerospace & Drone Engineering Club (I4-01)</option>
                  <option value="I4-02">IoT & Smart Systems Society (I4-02)</option>
                </select>
              </div>

              <!-- Registration Pass Key / Security Code Field (Adaptive per Role) -->
              <div id="reg-passkey-container" class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                <label id="reg-passkey-label" class="block text-xs font-bold text-emerald-900">Student Member Access Code</label>
                <input type="password" id="reg-passkey" required placeholder="Enter Student Member Access Code" class="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 bg-white" value="PECSTUDENT2026" />
                <p id="reg-passkey-desc" class="text-[10px] text-emerald-700">Access code required to register as a verified Student Member. Default: <code class="font-bold font-mono">PECSTUDENT2026</code></p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">College Email Address</label>
                  <input type="email" id="reg-email" required placeholder="rollno@pragati.ac.in" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Mobile Contact</label>
                  <input type="tel" id="reg-phone" placeholder="+91 98765 43210" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select id="reg-dept" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500">
                    <option value="CSE">CSE</option>
                    <option value="AIDS">AIDS</option>
                    <option value="AIML">AIML</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">Mechanical</option>
                    <option value="CIVIL">Civil</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                  <select id="reg-year" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500">
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Section</label>
                  <select id="reg-section" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500">
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
                  <input type="password" id="reg-password" required minlength="6" placeholder="Min. 6 characters" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" value="Password@123" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Technical Skills</label>
                  <input type="text" id="reg-skills" placeholder="Python, React, Machine Learning" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <button type="submit" id="reg-submit-btn" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all">
                Register & Classify Account in Supabase
              </button>
            </form>
          </div>

        </div>
      </div>

      <!-- OTP Verification Modal (Initially Hidden) -->
      <div id="otp-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto">
            🎫
          </div>
          <div class="text-center">
            <h3 class="text-lg font-bold text-slate-900">Student Gate Pass & Verification</h3>
            <p class="text-xs text-slate-500 mt-1">
              Your official Digital Pass has been generated. Enter the 6-digit verification code sent to your Pragati email to activate your account.
            </p>
          </div>

          <div id="generated-pass-banner" class="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-center space-y-1">
            <div class="text-[10px] font-bold text-blue-600 uppercase tracking-wider font-mono">Assigned Digital Pass ID</div>
            <div id="assigned-pass-id-display" class="text-sm font-black text-slate-900 font-mono">PEC-PASS-2026-ACTIVE</div>
            <div class="text-[10px] text-slate-500">QR Gate Pass is ready and synced to your student profile.</div>
          </div>

          <div id="otp-alert" class="hidden p-2.5 rounded-xl text-xs font-medium"></div>
          <div>
            <input type="text" id="otp-input" maxlength="6" value="742918" placeholder="Enter 6-digit OTP (e.g. 742918)" class="w-full text-center tracking-widest text-lg font-mono font-bold py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500" />
            <p class="text-[11px] text-center text-slate-400 mt-1.5 font-mono">Demo evaluation OTP: <strong class="text-emerald-700 font-bold">742918</strong></p>
          </div>
          <div class="flex space-x-2">
            <button id="verify-otp-btn" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
              Verify & Open Pass Profile
            </button>
            <button id="cancel-otp-btn" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Forgot Password Modal -->
      <div id="forgot-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
          <div class="text-center">
            <h3 class="text-lg font-bold text-slate-900">Reset Account Password</h3>
            <p class="text-xs text-slate-500 mt-1">Enter your Roll Number or College Email to reset credentials.</p>
          </div>
          <div id="forgot-alert" class="hidden p-2.5 rounded-xl text-xs font-medium"></div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Roll Number or Email</label>
            <input type="text" id="forgot-identifier" placeholder="22CS101 or email" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">New Password</label>
            <input type="password" id="forgot-newpass" placeholder="Min. 6 characters" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
          </div>
          <div class="flex space-x-2">
            <button id="forgot-submit-btn" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all">
              Update Password
            </button>
            <button id="forgot-cancel-btn" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
              Close
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function attachLoginEvents() {
  const tabLogin = document.getElementById("tab-login-btn");
  const tabRegister = document.getElementById("tab-register-btn");
  const loginSec = document.getElementById("login-form-section");
  const regSec = document.getElementById("register-form-section");

  tabLogin?.addEventListener("click", () => {
    tabLogin.className = "flex-1 py-4 text-center text-xs font-black uppercase tracking-wider transition-colors border-b-2 border-blue-600 text-blue-600 bg-blue-50/30";
    tabRegister.className = "flex-1 py-4 text-center text-xs font-black uppercase tracking-wider transition-colors border-b-2 border-transparent text-slate-400 hover:text-slate-700";
    loginSec.classList.remove("hidden");
    regSec.classList.add("hidden");
  });

  tabRegister?.addEventListener("click", () => {
    tabRegister.className = "flex-1 py-4 text-center text-xs font-black uppercase tracking-wider transition-colors border-b-2 border-emerald-600 text-emerald-600 bg-emerald-50/30";
    tabLogin.className = "flex-1 py-4 text-center text-xs font-black uppercase tracking-wider transition-colors border-b-2 border-transparent text-slate-400 hover:text-slate-700";
    regSec.classList.remove("hidden");
    loginSec.classList.add("hidden");
  });

  // Demo Login Buttons (1-Click Direct Role Access)
  document.querySelectorAll(".demo-login-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const userId = btn.getAttribute("data-user-id") || btn.getAttribute("data-demo-id");
      const demoEmail = btn.getAttribute("data-demo-email");
      const role = btn.getAttribute("data-role");
      const alertBox = document.getElementById("login-alert");

      if (alertBox) {
        alertBox.className = "p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 block animate-pulse";
        alertBox.textContent = `Authenticating Direct Demo Access as ${role || 'User'}...`;
      }

      // 1. Try switchUser directly
      let user = await switchUser(userId);
      if (!user && demoEmail) {
        // 2. Try loginUser with email
        const res = await loginUser(demoEmail, "Password@123");
        if (res && res.success) user = res.user;
      }

      if (user) {
        redirectAfterLogin(user.role || role);
      } else {
        // Direct redirect fallback
        redirectAfterLogin(role);
      }
    });
  });

  // Regular Login
  const loginForm = document.getElementById("login-form");
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const idVal = document.getElementById("login-identifier").value.trim();
    const pwVal = document.getElementById("login-password").value;
    const alertBox = document.getElementById("login-alert");

    alertBox.className = "p-3 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 block";
    alertBox.textContent = "Verifying institutional credentials...";

    const res = await loginUser(idVal, pwVal);
    if (res.success) {
      alertBox.className = "p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 block";
      alertBox.textContent = "Login verified! Entering dashboard...";
      setTimeout(() => redirectAfterLogin(res.user.role), 400);
    } else {
      alertBox.className = "p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 block";
      alertBox.textContent = res.message || "Invalid credentials.";
    }
  });

  // Google OAuth button listener
  document.getElementById("google-oauth-btn")?.addEventListener("click", async () => {
    const alertBox = document.getElementById("login-alert");
    if (alertBox) {
      alertBox.className = "p-3 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 block animate-pulse";
      alertBox.textContent = "Redirecting to Supabase Google OAuth SSO...";
    }
    const res = await loginWithGoogle();
    if (!res.success) {
      if (alertBox) {
        alertBox.className = "p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 block";
        alertBox.textContent = res.message || "Google OAuth sign-in failed.";
      }
    }
  });

  // Role selector toggle logic
  const regRoleSelect = document.getElementById("reg-role");
  const regClubContainer = document.getElementById("reg-club-container");
  const regPasskeyLabel = document.getElementById("reg-passkey-label");
  const regPasskeyInput = document.getElementById("reg-passkey");
  const regPasskeyDesc = document.getElementById("reg-passkey-desc");
  const regPasskeyBox = document.getElementById("reg-passkey-container");
  const regRollLabel = document.getElementById("reg-roll-label");
  const regRollInput = document.getElementById("reg-roll");

  regRoleSelect?.addEventListener("change", () => {
    const roleVal = regRoleSelect.value;
    if (roleVal === "Club Admin") {
      regClubContainer?.classList.remove("hidden");
      if (regRollLabel) regRollLabel.textContent = "Roll Number / Student Leader ID";
      if (regRollInput) regRollInput.placeholder = "e.g. 22CS142";
      if (regPasskeyLabel) regPasskeyLabel.textContent = "Club Admin Pass Key / Code";
      if (regPasskeyInput) {
        regPasskeyInput.value = "CLUBADMIN2026";
        regPasskeyInput.placeholder = "Enter Club Admin Pass Key";
      }
      if (regPasskeyDesc) regPasskeyDesc.innerHTML = 'Security code required to register as Club Admin. Default: <code class="font-bold font-mono">CLUBADMIN2026</code>';
      if (regPasskeyBox) regPasskeyBox.className = "p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 space-y-1";
    } else if (roleVal === "Faculty Coordinator") {
      regClubContainer?.classList.add("hidden");
      if (regRollLabel) regRollLabel.textContent = "Faculty Employee ID";
      if (regRollInput) regRollInput.placeholder = "e.g. FAC-CSE-009";
      if (regPasskeyLabel) regPasskeyLabel.textContent = "Faculty Coordinator Pass Key";
      if (regPasskeyInput) {
        regPasskeyInput.value = "PECFAC2026";
        regPasskeyInput.placeholder = "Enter Faculty Security Pass Key";
      }
      if (regPasskeyDesc) regPasskeyDesc.innerHTML = 'Security key required to register as Faculty Coordinator. Default: <code class="font-bold font-mono">PECFAC2026</code>';
      if (regPasskeyBox) regPasskeyBox.className = "p-3.5 rounded-2xl bg-purple-50 border border-purple-200/80 space-y-1";
    } else if (roleVal === "Super Admin") {
      regClubContainer?.classList.add("hidden");
      if (regRollLabel) regRollLabel.textContent = "Admin Identification Code";
      if (regRollInput) regRollInput.placeholder = "e.g. ADM-HQ-2026";
      if (regPasskeyLabel) regPasskeyLabel.textContent = "Super Admin Pass Key";
      if (regPasskeyInput) {
        regPasskeyInput.value = "PEC2026ADMIN";
        regPasskeyInput.placeholder = "Enter Super Admin Pass Key";
      }
      if (regPasskeyDesc) regPasskeyDesc.innerHTML = 'Security key required for Super Admin classification. Default: <code class="font-bold font-mono">PEC2026ADMIN</code>';
      if (regPasskeyBox) regPasskeyBox.className = "p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 space-y-1";
    } else {
      regClubContainer?.classList.add("hidden");
      if (regRollLabel) regRollLabel.textContent = "Roll Number / Registration ID";
      if (regRollInput) regRollInput.placeholder = "e.g. 23CS204";
      if (regPasskeyLabel) regPasskeyLabel.textContent = "Student Member Access Code";
      if (regPasskeyInput) {
        regPasskeyInput.value = "PECSTUDENT2026";
        regPasskeyInput.placeholder = "Enter Student Member Access Code";
      }
      if (regPasskeyDesc) regPasskeyDesc.innerHTML = 'Access code required to register as a verified Student Member. Default: <code class="font-bold font-mono">PECSTUDENT2026</code>';
      if (regPasskeyBox) regPasskeyBox.className = "p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1";
    }
  });

  // Student / User Registration with Role Classification
  const regForm = document.getElementById("register-form");
  let pendingUserId = null;
  let pendingUserRole = "Student";

  regForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById("register-alert");
    const name = document.getElementById("reg-name").value.trim();
    const rollNo = document.getElementById("reg-roll").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const department = document.getElementById("reg-dept").value;
    const year = document.getElementById("reg-year").value;
    const section = document.getElementById("reg-section").value;
    const password = document.getElementById("reg-password").value;
    const skills = document.getElementById("reg-skills").value;
    const role = regRoleSelect ? regRoleSelect.value : "Student";
    const assignedClub = document.getElementById("reg-assigned-club")?.value || "I4-08";
    const passKey = document.getElementById("reg-passkey")?.value || "";

    alertBox.className = "p-3 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 block";
    alertBox.textContent = `Registering and classifying ${role} account in Supabase database...`;

    const res = await registerStudent({
      name,
      rollNo,
      email,
      phone,
      department,
      year,
      section,
      password,
      skills,
      role,
      assignedClub,
      facultyId: role === "Faculty Coordinator" ? rollNo : null,
      adminKey: passKey,
      passKey
    });

    if (res.success) {
      pendingUserId = res.user.id;
      pendingUserRole = res.user.role || role;
      const passDisplay = document.getElementById("assigned-pass-id-display");
      if (passDisplay) {
        passDisplay.textContent = res.passId || res.user.passId || `PEC-PASS-2026-${res.user.rollNo || 'VERIFIED'}`;
      }
      document.getElementById("otp-modal").classList.remove("hidden");
    } else {
      alertBox.className = "p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 block";
      alertBox.textContent = res.message || "Registration failed.";
    }
  });

  // OTP Verification
  document.getElementById("verify-otp-btn")?.addEventListener("click", async () => {
    const otp = document.getElementById("otp-input").value.trim();
    const alertBox = document.getElementById("otp-alert");
    if (!otp) return;

    const res = await verifyEmailWithOTP(pendingUserId, otp);
    if (res.success) {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 block";
      alertBox.textContent = `Account verified and classified as ${pendingUserRole}! Redirecting...`;
      setTimeout(() => {
        redirectAfterLogin(pendingUserRole);
      }, 500);
    } else {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 block";
      alertBox.textContent = res.message || "Invalid OTP.";
    }
  });

  document.getElementById("cancel-otp-btn")?.addEventListener("click", () => {
    document.getElementById("otp-modal").classList.add("hidden");
  });

  // Forgot password triggers
  const forgotModal = document.getElementById("forgot-modal");
  document.getElementById("forgot-password-trigger")?.addEventListener("click", () => {
    forgotModal.classList.remove("hidden");
  });
  document.getElementById("forgot-cancel-btn")?.addEventListener("click", () => {
    forgotModal.classList.add("hidden");
  });
  document.getElementById("forgot-submit-btn")?.addEventListener("click", async () => {
    const idVal = document.getElementById("forgot-identifier").value.trim();
    const newPass = document.getElementById("forgot-newpass").value;
    const alertBox = document.getElementById("forgot-alert");

    if (!idVal || !newPass) {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 block";
      alertBox.textContent = "Both fields are required.";
      return;
    }

    const res = await resetPassword(idVal, newPass);
    if (res.success) {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 block";
      alertBox.textContent = res.message;
      setTimeout(() => forgotModal.classList.add("hidden"), 1000);
    } else {
      alertBox.className = "p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 block";
      alertBox.textContent = res.message;
    }
  });
}

function redirectAfterLogin(role) {
  const normRole = (role || "").toLowerCase();
  if (normRole.includes("super admin")) {
    window.location.hash = "#/admin/dashboard";
  } else if (normRole.includes("faculty") || normRole.includes("coordinator")) {
    window.location.hash = "#/coordinator/dashboard";
  } else if (normRole.includes("club admin") || normRole.includes("leader")) {
    window.location.hash = "#/club-dashboard";
  } else {
    window.location.hash = "#/student/dashboard";
  }
}
