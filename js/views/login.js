import { getCurrentUser, loginUser, registerStudent, resetPassword, verifyEmailWithOTP, getAllDemoAccounts } from '../auth.js';
import { signInWithGoogle, handleSimulatedGoogleSignIn, isSupabaseLiveConfigured } from '../services/supabaseAuth.js';

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

      <!-- GOOGLE OAUTH & SUPABASE AUTHENTICATION HERO CARD -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-xl mb-8 relative overflow-hidden">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Supabase Authentication • Google OAuth 2.0</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">Institutional Single Sign-On (SSO)</h2>
            <p class="text-xs text-slate-300 max-w-md leading-relaxed">
              Sign in instantly with your Pragati Google Workspace account (<code>@pragati.ac.in</code>) or standard Google account. Auto-provisions your verified student profile and digital ID.
            </p>
          </div>

          <div class="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <!-- Google Sign-In Action Button -->
            <button id="google-login-btn" class="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-3 cursor-pointer">
              <!-- Official Google Multi-Color SVG -->
              <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
              <span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">Fast</span>
            </button>

            <!-- Quick Select Campus Google Account Dropdown -->
            <button id="google-quick-accounts-trigger" class="w-full sm:w-auto px-4 py-2.5 bg-indigo-900/60 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-700/60 rounded-xl text-[11px] font-medium transition-all flex items-center justify-center space-x-2">
              <span>⚡</span>
              <span>Select Campus Google Account</span>
              <span class="text-[9px]">▼</span>
            </button>
          </div>
        </div>

        <!-- Hidden Quick Account Selector Sheet -->
        <div id="google-quick-accounts-panel" class="hidden mt-6 pt-6 border-t border-indigo-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button data-google-email="aarav.sharma@pragati.ac.in" class="google-instant-account-btn text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center space-x-3">
            <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80" class="w-8 h-8 rounded-full object-cover shrink-0" />
            <div class="truncate">
              <div class="text-xs font-bold text-white truncate">Aarav Sharma</div>
              <div class="text-[10px] text-slate-400 font-mono truncate">aarav.sharma@pragati.ac.in</div>
              <div class="text-[9px] text-emerald-400 font-semibold">Student (CSE)</div>
            </div>
          </button>

          <button data-google-email="srikar.v@pragati.ac.in" class="google-instant-account-btn text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center space-x-3">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" class="w-8 h-8 rounded-full object-cover shrink-0" />
            <div class="truncate">
              <div class="text-xs font-bold text-white truncate">Srikar Varma</div>
              <div class="text-[10px] text-slate-400 font-mono truncate">srikar.v@pragati.ac.in</div>
              <div class="text-[9px] text-purple-400 font-semibold">Leader (AIML Club)</div>
            </div>
          </button>

          <button data-google-email="faculty.coord@pragati.ac.in" class="google-instant-account-btn text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center space-x-3">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" class="w-8 h-8 rounded-full object-cover shrink-0" />
            <div class="truncate">
              <div class="text-xs font-bold text-white truncate">Dr. Radhika Sharma</div>
              <div class="text-[10px] text-slate-400 font-mono truncate">faculty.coord@pragati.ac.in</div>
              <div class="text-[9px] text-blue-400 font-semibold">Faculty Coordinator</div>
            </div>
          </button>
        </div>

        <div id="google-auth-status" class="hidden mt-4 p-3 rounded-xl bg-blue-900/60 border border-blue-500/40 text-xs text-blue-200"></div>
      </div>

      <!-- Demo Accounts Quick Access Banner -->
      <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200/80 mb-8 shadow-sm">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider">Demo Evaluation Mode</span>
            <span class="text-xs font-bold text-amber-900">One-Click Demo Personas</span>
          </div>
          <span class="text-[11px] text-amber-700 font-medium">Safe evaluation accounts • Pre-loaded data</span>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${demoAccounts.map(acc => {
            let roleBadge = "bg-blue-100 text-blue-800";
            let roleTitle = "Student";
            if (acc.role === "Club Coordinator") {
              roleBadge = "bg-purple-100 text-purple-800";
              roleTitle = "Coordinator";
            } else if (acc.role === "Club Student Leader") {
              roleBadge = "bg-emerald-100 text-emerald-800";
              roleTitle = "Student Leader";
            } else if (acc.role === "Super Admin") {
              roleBadge = "bg-rose-100 text-rose-800";
              roleTitle = "Super Admin";
            }

            return `
              <button data-demo-id="${acc.id}" class="demo-login-btn text-left p-3 rounded-xl bg-white hover:bg-amber-100/50 border border-amber-200 transition-all hover:scale-[1.02] shadow-xs group">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${roleBadge}">${roleTitle}</span>
                  <span class="text-[10px] font-mono text-slate-400 group-hover:text-amber-700">Login →</span>
                </div>
                <div class="text-xs font-bold text-slate-900 truncate">${acc.name}</div>
                <div class="text-[10px] text-slate-500 truncate">${acc.email}</div>
                <div class="text-[9px] text-slate-400 mt-1 font-mono">${acc.rollNo || acc.facultyId || 'PEC HQ'}</div>
              </button>
            `;
          }).join('')}
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

          <!-- REGISTRATION FORM -->
          <div id="register-form-section" class="hidden">
            <form id="register-form" class="space-y-4 max-w-lg mx-auto">
              <div id="register-alert" class="hidden p-3 rounded-xl text-xs font-medium"></div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input type="text" id="reg-name" required placeholder="Full Name" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
                  <input type="text" id="reg-roll" required placeholder="e.g. 23CS204" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 uppercase" />
                </div>
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
                    <option value="CSE(AIML)">CSE (AIML)</option>
                    <option value="CSE(DS)">CSE (Data Science)</option>
                    <option value="CSE(CS)">CSE (Cyber Security)</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="ME">Mechanical</option>
                    <option value="CE">Civil</option>
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
                  <input type="password" id="reg-password" required minlength="6" placeholder="Min. 6 characters" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Technical Skills</label>
                  <input type="text" id="reg-skills" placeholder="Python, React, Machine Learning" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <button type="submit" id="reg-submit-btn" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all">
                Create Verified Student Account
              </button>
            </form>
          </div>

        </div>
      </div>

      <!-- OTP Verification Modal (Initially Hidden) -->
      <div id="otp-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto">
            ✉️
          </div>
          <div class="text-center">
            <h3 class="text-lg font-bold text-slate-900">Institutional Email Verification</h3>
            <p class="text-xs text-slate-500 mt-1">
              A 6-digit verification code has been dispatched to your Pragati institutional email address.
            </p>
          </div>
          <div id="otp-alert" class="hidden p-2.5 rounded-xl text-xs font-medium"></div>
          <div>
            <input type="text" id="otp-input" maxlength="6" placeholder="Enter 6-digit OTP (e.g. 742918)" class="w-full text-center tracking-widest text-lg font-mono font-bold py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500" />
            <p class="text-[11px] text-center text-slate-400 mt-1.5 font-mono">Demo evaluation OTP: <strong class="text-emerald-700">742918</strong></p>
          </div>
          <div class="flex space-x-2">
            <button id="verify-otp-btn" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all">
              Verify & Enter Portal
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

  // Google OAuth with Supabase Trigger
  const googleLoginBtn = document.getElementById("google-login-btn");
  const googleStatus = document.getElementById("google-auth-status");
  const quickAccountsTrigger = document.getElementById("google-quick-accounts-trigger");
  const quickAccountsPanel = document.getElementById("google-quick-accounts-panel");

  quickAccountsTrigger?.addEventListener("click", () => {
    quickAccountsPanel?.classList.toggle("hidden");
  });

  googleLoginBtn?.addEventListener("click", async () => {
    if (googleStatus) {
      googleStatus.className = "mt-4 p-3 rounded-xl bg-blue-900/60 border border-blue-500/40 text-xs text-blue-200 block";
      googleStatus.innerHTML = `
        <div class="flex items-center space-x-2">
          <span class="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
          <span>Connecting to Supabase Google OAuth Gateway...</span>
        </div>
      `;
    }

    try {
      const isLive = await isSupabaseLiveConfigured();
      if (isLive) {
        // Real Supabase Google OAuth redirect
        await signInWithGoogle();
      } else {
        // Instant campus Google identity selector
        if (googleStatus) {
          googleStatus.innerHTML = `
            <div class="space-y-1.5">
              <div class="font-bold text-emerald-300">✓ Supabase Google Auth Initialized</div>
              <div>Select your institutional Pragati Google profile or enter email below:</div>
            </div>
          `;
        }
        quickAccountsPanel?.classList.remove("hidden");
      }
    } catch (err) {
      console.error(err);
      if (googleStatus) {
        googleStatus.className = "mt-4 p-3 rounded-xl bg-rose-900/60 border border-rose-500/40 text-xs text-rose-200 block";
        googleStatus.textContent = "Google OAuth error. Please select account from quick picker.";
      }
      quickAccountsPanel?.classList.remove("hidden");
    }
  });

  // Google Instant Account Buttons
  document.querySelectorAll(".google-instant-account-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const email = btn.getAttribute("data-google-email");
      if (googleStatus) {
        googleStatus.className = "mt-4 p-3 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-xs text-emerald-200 block";
        googleStatus.innerHTML = `
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full border-2 border-emerald-300/40 border-t-emerald-300 animate-spin"></span>
            <span>Verifying Google token for <strong>${email}</strong> via Supabase...</span>
          </div>
        `;
      }

      const res = await handleSimulatedGoogleSignIn(email);
      if (res.success) {
        if (googleStatus) {
          googleStatus.innerHTML = `<span>✓ Verified! Welcome, <strong>${res.user.name}</strong>. Entering portal...</span>`;
        }
        setTimeout(() => redirectAfterLogin(res.user.role), 500);
      } else {
        if (googleStatus) {
          googleStatus.className = "mt-4 p-3 rounded-xl bg-rose-900/60 border border-rose-500/40 text-xs text-rose-200 block";
          googleStatus.textContent = res.message || "Failed to authenticate Google user.";
        }
      }
    });
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

  // Student Registration
  const regForm = document.getElementById("register-form");
  let pendingUserId = null;

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

    alertBox.className = "p-3 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 block";
    alertBox.textContent = "Submitting registration to council database...";

    const res = await registerStudent({ name, rollNo, email, phone, department, year, section, password, skills });
    if (res.success) {
      pendingUserId = res.user.id;
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
      alertBox.textContent = "Email verified! Launching student dashboard...";
      setTimeout(() => {
        window.location.hash = "#/student/dashboard";
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
