import { getCurrentUser, switchUser, getAllDemoAccounts, loginUser, registerStudent, resetPassword, verifyEmailWithOTP } from '../auth.js';
import { signInWithGoogle, handleSimulatedGoogleSignIn } from '../services/supabaseAuth.js';
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
                <p class="text-[11px] text-slate-400 font-mono">Supabase Auth • Google SSO • RBAC</p>
              </div>
            </div>
            <button id="close-auth-modal" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition-colors cursor-pointer">✕</button>
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

          <!-- GOOGLE SUPABASE SSO BUTTON -->
          <div class="mb-5 pb-5 border-b border-slate-100">
            <button id="modal-google-auth-btn" class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-3 cursor-pointer group">
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google (Supabase Auth)</span>
              <span class="text-[10px] text-slate-400 font-mono group-hover:text-emerald-400">⚡ SSO</span>
            </button>
          </div>
          
          <!-- TAB 1: Fast Persona Switcher -->
          <div id="tab-content-personas" class="auth-tab-content space-y-4">
            <div>
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Demo Personas</h4>
              <p class="text-xs text-slate-500 mt-0.5">Switch instant identity to test role-based permissions and workflows:</p>
            </div>

            <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
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
                <input type="password" id="login-password" value="Password@123" required placeholder="••••••••" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
                <span class="text-[10px] text-slate-400 mt-1 block">Default demo password: <code class="font-mono font-bold text-slate-600">Password@123</code></span>
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
                    <option value="CSE(AIML)">CSE (AIML)</option>
                    <option value="CSE(DS)">CSE (Data Science)</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <select id="reg-year" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold">
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                <input type="email" id="reg-email" required placeholder="student@pragati.ac.in" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Password</label>
                <input type="password" id="reg-password" required value="Password@123" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Technical Skills & Interests (comma separated)</label>
                <input type="text" id="reg-skills" placeholder="React, Python, Cybersecurity, Cloud" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" />
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

  // Google SSO in Modal
  const modalGoogleBtn = document.getElementById("modal-google-auth-btn");
  modalGoogleBtn?.addEventListener("click", async () => {
    closeModal();
    showToast("Google Authentication", "Initiating Google Single Sign-On via Supabase...", "info");
    const res = await signInWithGoogle();
    if (res && res.success && res.user) {
      showToast("Signed In with Google", `Welcome ${res.user.name}!`, "success");
      if (res.user.role === "Faculty Coordinator" || res.user.role === "Club Coordinator") {
        window.location.hash = "#/coordinator/dashboard";
      } else {
        window.location.hash = "#/student/dashboard";
      }
    }
  });

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
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifier = document.getElementById("login-identifier")?.value;
      const password = document.getElementById("login-password")?.value;
      const res = await loginUser(identifier, password);
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
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name")?.value;
      const rollNo = document.getElementById("reg-roll")?.value;
      const department = document.getElementById("reg-dept")?.value;
      const year = document.getElementById("reg-year")?.value;
      const email = document.getElementById("reg-email")?.value;
      const password = document.getElementById("reg-password")?.value;
      const skills = document.getElementById("reg-skills")?.value;

      const res = await registerStudent({
        name,
        rollNo,
        department,
        year,
        email,
        password,
        skills,
        emailVerified: true
      });

      if (res.success) {
        showToast("Student ID Provisioned", `Welcome ${res.user.name}! ID Card ${res.user.membershipId} is active.`, "success");
        closeModal();
      } else {
        showToast("Registration Failed", res.message, "error");
      }
    });
  }

  // Recovery Form
  const recoveryForm = document.getElementById("account-recovery-form");
  if (recoveryForm) {
    recoveryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifier = document.getElementById("recovery-identifier")?.value;
      const otp = document.getElementById("recovery-otp")?.value;
      const newPass = document.getElementById("recovery-new-password")?.value;

      if (otp !== "742918" && otp.length !== 6) {
        showToast("Invalid OTP", "Please enter valid 6-digit verification code.", "error");
        return;
      }

      const res = await resetPassword(identifier, newPass);
      if (res.success) {
        showToast("Password Reset", res.message, "success");
        closeModal();
      } else {
        showToast("Recovery Failed", res.message, "error");
      }
    });
  }
}

