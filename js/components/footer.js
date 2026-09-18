export function renderFooter() {
  return `
    <footer class="bg-slate-900 text-slate-400 border-t border-slate-800 mt-16 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <!-- Column 1: College Info -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                P
              </div>
              <span class="font-black text-white text-base tracking-tight">CampusTech PEC</span>
            </div>
            <p class="text-slate-400 text-xs leading-relaxed">
              Pragati Engineering College (Autonomous)<br/>
              Central Council of Technical Societies & Career Guidance Cell
            </p>
            <div class="text-[11px] text-slate-500 font-mono">
              Surampalem, Near Kakinada, AP - 533437
            </div>
          </div>

          <!-- Column 2: Portals -->
          <div class="space-y-2">
            <h4 class="text-white font-bold text-xs uppercase tracking-wider">Role Portals</h4>
            <ul class="space-y-1.5 text-xs">
              <li><a href="#/student/dashboard" class="hover:text-white transition-colors">Student Hub & ID</a></li>
              <li><a href="#/coordinator/dashboard" class="hover:text-white transition-colors">Club Coordinator Portal</a></li>
              <li><a href="#/department/dashboard" class="hover:text-white transition-colors">Faculty & HOD Portal</a></li>
              <li><a href="#/admin/dashboard" class="hover:text-white transition-colors">Central Admin Council</a></li>
              <li><a href="#/login" class="hover:text-white transition-colors">Login / Google SSO</a></li>
            </ul>
          </div>

          <!-- Column 3: Societies & Events -->
          <div class="space-y-2">
            <h4 class="text-white font-bold text-xs uppercase tracking-wider">Technical Hub</h4>
            <ul class="space-y-1.5 text-xs">
              <li><a href="#/clubs" class="hover:text-white transition-colors">35 Technical Societies</a></li>
              <li><a href="#/events" class="hover:text-white transition-colors">Workshops & Hackathons</a></li>
              <li><a href="#/quizzes" class="hover:text-white transition-colors">Technical Quizzes</a></li>
              <li><a href="#/practice" class="hover:text-white transition-colors">Coding Challenges</a></li>
              <li><a href="#/certificates" class="hover:text-white transition-colors">Verify Certificates</a></li>
            </ul>
          </div>

          <!-- Column 4: System & Security -->
          <div class="space-y-2">
            <h4 class="text-white font-bold text-xs uppercase tracking-wider">Identity & Trust</h4>
            <p class="text-slate-400 text-xs leading-relaxed">
              Powered by Pragati RBAC, Supabase Auth Gateway, QR Smart Attendance, and verified cryptographic credentials.
            </p>
            <div class="pt-2">
              <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium font-mono">
                ● System Status: Operational
              </span>
            </div>
          </div>

        </div>

        <div class="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © ${new Date().getFullYear()} Pragati Engineering College. All rights reserved.
          </div>
          <div class="flex items-center space-x-4">
            <a href="#/about" class="hover:text-slate-300">About Council</a>
            <span>•</span>
            <a href="#/verification" class="hover:text-slate-300">Credential Verification</a>
            <span>•</span>
            <a href="#/login" class="hover:text-slate-300">Staff Portal</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
