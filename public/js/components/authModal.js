import { getCurrentUser, switchUser, getAllDemoAccounts, loginUser, registerStudent, resetPassword, verifyEmailWithOTP } from '../auth.js';
import { showToast } from './toast.js';

export function renderAuthModal() {
  const user = getCurrentUser() || {};
  const accounts = getAllDemoAccounts();

  return `
    <div id="auth-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="bg-slate-900 text-white p-6 relative">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">P</div>
              <div>
                <h3 class="font-black text-base leading-tight">PEC Central Identity Gateway</h3>
                <p class="text-[11px] text-slate-400 font-mono">Role-Based Access Control • Single Sign-On</p>
              </div>
            </div>
            <button id="close-auth-modal" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition-colors">✕</button>
          </div>

          <!-- Auth Tabs -->
          <div class="flex items-center space-x-2 mt-5 border-b border-slate-800 pb-2 text-xs">
            <button data-tab="personas" class="auth-tab-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white transition-all">Quick Roles</button>
            <button data-tab="login" class="auth-tab-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-800 text-slate-300 hover:text-white transition-all">Sign In</button>
            <button data-tab="register" class="auth-tab-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-800 text-slate-300 hover:text-white transition-all">Register</button>
            <button data-tab="recovery" class="auth-tab-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-800 text-slate-300 hover:text-white transition-all">Recovery</button>
          </div>
        </div>

        <div class="p-6">
          
          <!-- TAB 1: Fast Persona Switcher -->
          <div id="tab-content-personas" class="auth-tab-content space-y-4">
            <div>
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Demo Personas</h4>
              <p class="text-xs text-slate-500 mt-0.5">Switch instant identity to test role-based permissions and workflows:</p>
            </div>

            <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
              ${accounts.map(acc => `
                <div class="p-3.5 rounded-2xl border ${acc.id === user.id ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300 bg-white'} flex items-center justify-between transition-all">
                  <div class="flex items-center space-x-3">
                    <img src="${acc.avatar}" class="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <div class="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                        <span>${acc.name}</span>
                        ${acc.id === user.id ? '<span class="text-[9px] font-mono px-1.5 py-0.2 bg-blue-600 text-white rounded">ACTIVE</span>' : ''}
                      </div>
                      <div class="text-[11px] text-blue-600 font-semibold">${acc.role} • ${acc.department || 'CSE'}</div>
                      <div class="text-[10px] text-slate-400 font-mono">${acc.rollNo || acc.facultyId || acc.adminId || 'PEC-ID'}</div>
                    </div>
                  </div>
                  <button data-userid="${acc.id}" class="switch-persona-action-btn px-3 py-1.5 text-xs font-bold rounded-xl ${acc.id === user.id ? 'bg-blue-600 text-white cursor-default' : 'bg-slate-900 hover:bg-slate-800 text-white'} transition-colors">
                    ${acc.id === user.id ? 'Selected' : 'Switch →'}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- TAB 2: College Sign In Form -->
          <div id="tab-content-login" class="auth-tab-content hidden space-y-4">
            <div>
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Institutional Sign In</h4>
              <p class="text-xs text-slate-500 mt-0.5">Login with your Pragati Roll Number or official college email</p>
            </div>

            <form id="college-login-form" class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Roll No / Faculty ID / College Email</label>
                <input type="text" id="login-identifier" required placeholder="e.g. 22CS101 or aarav.sharma@pragati.ac.in" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Password</label>
                <input type="password" id="login-password" value="pec2026" required placeholder="••••••••" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
                <span class="text-[10px] text-slate-400 mt-1 block">Default demo password: <code class="font-mono font-bold text-slate-600">pec2026</code></span>
              </div>
              <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
                Sign In to CampusTech
              </button>
            </form>
          </div>

          <!-- TAB 3: New Student Registration -->
          <div id="tab-content-register" class="auth-tab-content hidden space-y-4">
            <div>
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Student Digital ID Registration</h4>
              <p class="text-xs text-slate-500 mt-0.5">Register your verified profile for technical society memberships & hackathons</p>
            </div>

            <form id="student-register-form" class="space-y-3 text-xs">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input type="text" id="reg-name" required placeholder="e.g. Meera Krishnan" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">College Roll No</label>
                  <input type="text" id="reg-roll" required placeholder="e.g. 23CS205" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 uppercase font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Department</label>
                  <select id="reg-dept" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold">
                    <option value="CSE">CSE</option>
                    <option value="AIDS">AIDS</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <select id="reg-year" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold">
                    <option value="1st Year">1st Year (2025-2029)</option>
                    <option value="2nd Year">2nd Year (2024-2028)</option>
                    <option value="3rd Year">3rd Year (2023-2027)</option>
                    <option value="4th Year">4th Year (2022-2026)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                <input type="email" id="reg-email" required placeholder="student@pragati.ac.in" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Password</label>
                <input type="password" id="reg-password" required value="pec2026" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Technical Skills & Interests (comma separated)</label>
                <input type="text" id="reg-skills" placeholder="React, Python, Cybersecurity, Cloud" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>

              <div class="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-[11px] text-blue-800">
                ⚡ Instant College OTP Simulation: A verification code will be simulated for automatic verification.
              </div>

              <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
                Generate Digital Student Identity
              </button>
            </form>
          </div>

          <!-- TAB 4: Password Recovery & OTP -->
          <div id="tab-content-recovery" class="auth-tab-content hidden space-y-4">
            <div>
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Credential Self-Service Recovery</h4>
              <p class="text-xs text-slate-500 mt-0.5">Reset your password using your college Roll Number or Email</p>
            </div>

            <form id="account-recovery-form" class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">College Roll No / Email</label>
                <input type="text" id="recovery-identifier" required placeholder="e.g. 22CS101" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Recovery OTP</label>
                  <input type="text" id="recovery-otp" required value="742918" placeholder="6-digit OTP" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono text-center font-bold tracking-widest" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">New Password</label>
                  <input type="password" id="recovery-new-password" required placeholder="New password" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <p class="text-[10px] text-slate-400 font-mono">Demo OTP is pre-filled: <code class="font-bold text-blue-600">742918</code></p>
              <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors">
                Verify OTP & Reset Password
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  `;
}

export function attachAuthModalEvents() {
  const modal = document.getElementById("auth-modal");
  const closeBtn = document.getElementById("close-auth-modal");

  const closeModal = () => {
    if (modal) modal.classList.add("hidden");
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Tab switching
  document.querySelectorAll(".auth-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab-btn").forEach(b => {
        b.className = "auth-tab-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-800 text-slate-300 hover:text-white transition-all";
      });
      btn.className = "auth-tab-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white transition-all";

      const targetTab = btn.dataset.tab;
      document.querySelectorAll(".auth-tab-content").forEach(content => {
        content.classList.add("hidden");
      });
      const activeContent = document.getElementById(`tab-content-${targetTab}`);
      if (activeContent) activeContent.classList.remove("hidden");
    });
  });

  // Persona Switcher Buttons
  document.querySelectorAll(".switch-persona-action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.userid;
      switchUser(userId);
      showToast("Identity Switched", "Active session switched successfully.", "success");
      closeModal();
    });
  });

  // Sign In Form
  const loginForm = document.getElementById("college-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const identifier = document.getElementById("login-identifier")?.value;
      const password = document.getElementById("login-password")?.value;
      const res = loginUser(identifier, password);
      if (res.success) {
        showToast("Signed In", `Welcome back, ${res.user.name} (${res.user.role})`, "success");
        closeModal();
      } else {
        showToast("Authentication Failed", res.message, "error");
      }
    });
  }

  // Register Form
  const regForm = document.getElementById("student-register-form");
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name")?.value;
      const rollNo = document.getElementById("reg-roll")?.value;
      const department = document.getElementById("reg-dept")?.value;
      const year = document.getElementById("reg-year")?.value;
      const email = document.getElementById("reg-email")?.value;
      const password = document.getElementById("reg-password")?.value;
      const skills = document.getElementById("reg-skills")?.value;

      const newUser = registerStudent({
        name,
        rollNo,
        department,
        year,
        email,
        password,
        skills,
        emailVerified: true
      });

      showToast("Student ID Provisioned", `Welcome ${newUser.name}! ID Card ${newUser.membershipId} is active.`, "success");
      closeModal();
    });
  }

  // Recovery Form
  const recoveryForm = document.getElementById("account-recovery-form");
  if (recoveryForm) {
    recoveryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const identifier = document.getElementById("recovery-identifier")?.value;
      const otp = document.getElementById("recovery-otp")?.value;
      const newPass = document.getElementById("recovery-new-password")?.value;

      if (otp !== "742918" && otp.length !== 6) {
        showToast("Invalid OTP", "Please enter valid 6-digit verification code.", "error");
        return;
      }

      const res = resetPassword(identifier, newPass);
      if (res.success) {
        showToast("Password Reset", res.message, "success");
        closeModal();
      } else {
        showToast("Recovery Failed", res.message, "error");
      }
    });
  }
}
