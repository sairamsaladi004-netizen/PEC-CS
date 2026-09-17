import { getCurrentUser, loginUser, registerStudent, resetPassword, verifyEmailWithOTP, getAllDemoAccounts } from '../auth.js';

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

      <!-- Role-Wise Login Credentials Quick Access Banner -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 border border-slate-700/80 mb-8 shadow-xl text-white space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider font-mono">
              ROLE CREDENTIALS REFERENCE
            </span>
            <span class="text-xs font-bold text-slate-200">Pre-Configured System Personas</span>
          </div>
          <span class="text-[11px] text-slate-400 font-mono">Select any role card to auto-fill credentials</span>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <!-- Student Credential -->
          <div class="demo-login-btn text-left p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 transition-all hover:scale-[1.02] cursor-pointer group" data-demo-id="demo-student">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🎓 Student</span>
              <span class="text-[10px] font-mono text-slate-400 group-hover:text-emerald-400">Fill & Login →</span>
            </div>
            <div class="text-xs font-bold text-white">Aarav Sharma</div>
            <div class="text-[10px] font-mono text-slate-300 mt-0.5">aarav.sharma@pragati.ac.in</div>
            <div class="text-[10px] text-slate-400 font-mono">Roll: <strong class="text-emerald-300">22CS101</strong></div>
            <div class="text-[9px] text-slate-400 mt-1">Pass: <code class="bg-slate-900 px-1 rounded text-emerald-400 font-mono">Password@123</code></div>
          </div>

          <!-- Club Admin Credential -->
          <div class="demo-login-btn text-left p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-blue-500/30 transition-all hover:scale-[1.02] cursor-pointer group" data-demo-id="demo-student-leader">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">⚡ Club Admin</span>
              <span class="text-[10px] font-mono text-slate-400 group-hover:text-blue-400">Fill & Login →</span>
            </div>
            <div class="text-xs font-bold text-white">Priya Patel</div>
            <div class="text-[10px] font-mono text-slate-300 mt-0.5">priya.patel@pragati.ac.in</div>
            <div class="text-[10px] text-slate-400 font-mono">Roll: <strong class="text-blue-300">22CS142</strong></div>
            <div class="text-[9px] text-slate-400 mt-1">Pass: <code class="bg-slate-900 px-1 rounded text-blue-400 font-mono">Password@123</code></div>
          </div>

          <!-- Faculty Coordinator Credential -->
          <div class="demo-login-btn text-left p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-purple-500/30 transition-all hover:scale-[1.02] cursor-pointer group" data-demo-id="demo-faculty">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">🏫 Faculty Coord</span>
              <span class="text-[10px] font-mono text-slate-400 group-hover:text-purple-400">Fill & Login →</span>
            </div>
            <div class="text-xs font-bold text-white">Dr. Ramesh Kumar</div>
            <div class="text-[10px] font-mono text-slate-300 mt-0.5">dr.ramesh.k@pragati.ac.in</div>
            <div class="text-[10px] text-slate-400 font-mono">ID: <strong class="text-purple-300">FAC-CSE-001</strong></div>
            <div class="text-[9px] text-slate-400 mt-1">Pass: <code class="bg-slate-900 px-1 rounded text-purple-400 font-mono">Password@123</code></div>
          </div>

          <!-- Super Admin Credential -->
          <div class="demo-login-btn text-left p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-rose-500/30 transition-all hover:scale-[1.02] cursor-pointer group" data-demo-id="demo-admin">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">👑 Super Admin</span>
              <span class="text-[10px] font-mono text-slate-400 group-hover:text-rose-400">Fill & Login →</span>
            </div>
            <div class="text-xs font-bold text-white">Pragati Council HQ</div>
            <div class="text-[10px] font-mono text-slate-300 mt-0.5">admin@pragati.ac.in</div>
            <div class="text-[10px] text-slate-400 font-mono">ID: <strong class="text-rose-300">SUPERADMIN-01</strong></div>
            <div class="text-[9px] text-slate-400 mt-1">Pass: <code class="bg-slate-900 px-1 rounded text-rose-400 font-mono">Password@123</code></div>
          </div>

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
                  <option value="Super Admin">👑 Super Admin (Full Institutional Control)</option>
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

              <!-- Conditional Admin Key for Super Admin -->
              <div id="reg-admin-key-container" class="hidden">
                <label class="block text-xs font-bold text-rose-700 mb-1">Super Admin Access Pass Key</label>
                <input type="password" id="reg-admin-key" placeholder="Enter Admin Security Pass Key (Default: PEC2026ADMIN)" class="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs focus:ring-2 focus:ring-rose-500 bg-rose-50/50" value="PEC2026ADMIN" />
                <p class="text-[10px] text-rose-500 mt-1">Authorized security key required for Super Admin classification.</p>
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

  // Demo Login Buttons
  document.querySelectorAll(".demo-login-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const demoId = btn.getAttribute("data-demo-id");
      const accounts = getAllDemoAccounts();
      const target = accounts.find(a => a.id === demoId);
      if (target) {
        await loginUser(target.email, "Password@123");
        redirectAfterLogin(target.role);
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

  // Role selector toggle logic
  const regRoleSelect = document.getElementById("reg-role");
  const regClubContainer = document.getElementById("reg-club-container");
  const regAdminKeyContainer = document.getElementById("reg-admin-key-container");
  const regRollLabel = document.getElementById("reg-roll-label");
  const regRollInput = document.getElementById("reg-roll");

  regRoleSelect?.addEventListener("change", () => {
    const roleVal = regRoleSelect.value;
    if (roleVal === "Club Admin") {
      regClubContainer?.classList.remove("hidden");
      regAdminKeyContainer?.classList.add("hidden");
      if (regRollLabel) regRollLabel.textContent = "Roll Number / Student Leader ID";
      if (regRollInput) regRollInput.placeholder = "e.g. 22CS142";
    } else if (roleVal === "Faculty Coordinator") {
      regClubContainer?.classList.add("hidden");
      regAdminKeyContainer?.classList.add("hidden");
      if (regRollLabel) regRollLabel.textContent = "Faculty Employee ID";
      if (regRollInput) regRollInput.placeholder = "e.g. FAC-CSE-009";
    } else if (roleVal === "Super Admin") {
      regClubContainer?.classList.add("hidden");
      regAdminKeyContainer?.classList.remove("hidden");
      if (regRollLabel) regRollLabel.textContent = "Admin Identification Code";
      if (regRollInput) regRollInput.placeholder = "e.g. ADM-HQ-2026";
    } else {
      regClubContainer?.classList.add("hidden");
      regAdminKeyContainer?.classList.add("hidden");
      if (regRollLabel) regRollLabel.textContent = "Roll Number / Registration ID";
      if (regRollInput) regRollInput.placeholder = "e.g. 23CS204";
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
    const adminKey = document.getElementById("reg-admin-key")?.value || "";

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
      adminKey
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
  if (role === "Super Admin") {
    window.location.hash = "#/admin/dashboard";
  } else if (role === "Club Coordinator" || role === "Club Student Leader") {
    window.location.hash = "#/coordinator/dashboard";
  } else {
    window.location.hash = "#/student/dashboard";
  }
}
