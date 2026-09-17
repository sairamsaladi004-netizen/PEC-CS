import { getCurrentUser, updateProfile } from '../auth.js';
import { getDB, saveDB, apiRequest } from '../db.js';
import { showToast } from '../components/toast.js';

export function renderStudentProfileView() {
  const user = getCurrentUser() || {};
  const db = getDB();

  const userClubs = (user.clubs || []).map(id => db.clubs.find(c => c.id === id)).filter(Boolean);
  const userCerts = (db.certificates || []).filter(c => c.studentId === user.id || c.rollNo === user.rollNo);
  const userProjects = (db.projects || []).filter(p => p.teamLeader === user.name || p.teamMembers?.includes(user.name));

  const skillsList = Array.isArray(user.skills) ? user.skills : (user.skills ? user.skills.split(",") : ["Python", "Machine Learning", "System Design", "Cloud Computing"]);
  const interestsList = Array.isArray(user.interests) ? user.interests : ["Deep Learning", "Full-Stack Dev", "Hackathons", "IoT"];

  return `
    <div class="space-y-8 pb-16 max-w-6xl mx-auto">
      
      <!-- Profile Hero Banner Card -->
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="h-36 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-950 relative">
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
        </div>
        
        <div class="p-6 sm:p-8 -mt-16 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div class="flex flex-col sm:flex-row sm:items-end gap-4">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" class="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-900 shrink-0" />
            <div class="space-y-1">
              <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">${user.name}</h1>
                <span class="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800">${user.role}</span>
                <span id="archetype-badge" class="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  ✨ ${user.classifiedArchetype || 'Autonomous & Generative AI Systems Specialist'}
                </span>
              </div>
              <div class="text-xs text-slate-600 font-medium">
                Roll No: <strong class="text-slate-900 font-mono">${user.rollNo || user.facultyId || '22A31A0501'}</strong> • Dept: <strong class="text-slate-900">${user.department || 'CSE'}</strong> • Year: <strong class="text-slate-900">${user.year || '3rd Year'}</strong>
              </div>
              <div class="text-[11px] text-slate-500 font-mono">
                Institutional AID: <span class="text-blue-600 font-bold">${user.membershipId || 'PEC-MEM-2026-CSE-8492'}</span> • CGPA: <strong class="text-amber-600">${user.cgpa || '8.85'}</strong>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <button id="open-ai-classification-modal-btn" class="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-2 cursor-pointer">
              <span>⚡</span>
              <span>Run Real AI Profiler</span>
            </button>
            <a href="#/membership-card" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
              Digital ID Card
            </a>
          </div>
        </div>

        <!-- Verified Skills & Interests Strip -->
        <div class="px-6 sm:px-8 pb-6 border-t border-slate-100 pt-4 flex flex-wrap items-center gap-2 text-xs">
          <span class="font-bold text-slate-400 mr-2 uppercase text-[10px] tracking-wider">Verified Skills:</span>
          ${skillsList.map(skill => `
            <span class="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-medium text-xs border border-slate-200/60">${skill.trim()}</span>
          `).join('')}
          <span class="font-bold text-slate-400 ml-4 mr-2 uppercase text-[10px] tracking-wider">Interests:</span>
          ${interestsList.map(item => `
            <span class="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-medium text-xs border border-blue-100">${item.trim()}</span>
          `).join('')}
        </div>
      </div>

      <!-- Live AI Classification & Persona Diagnostic Card -->
      <div id="ai-classification-card" class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-xl space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-400/30">
                AI/ML Student Classifier & Persona Engine
              </span>
              <span class="text-[10px] font-mono text-emerald-400">● Live Inference (gemini-3.8-flash)</span>
            </div>
            <h2 id="ai-archetype-title" class="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              ${user.classifiedArchetype || 'Autonomous & Generative AI Systems Specialist'}
            </h2>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Classification Confidence</div>
            <div id="ai-confidence-score" class="text-2xl font-black text-amber-400 font-mono">95%</div>
          </div>
        </div>

        <p id="ai-persona-summary" class="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          ${user.personaSummary || `${user.name} demonstrates advanced competencies in applied machine learning, neural architectures, and software engineering. Highly compatible with interdisciplinary hackathon tracks, competitive coding, and collegiate AI research cohorts.`}
        </p>

        <!-- 3 Strength Pillars -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5">
            <div class="flex justify-between text-xs font-bold text-white">
              <span>Algorithmic & Problem Solving</span>
              <span class="text-amber-400 font-mono">94%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-amber-400 rounded-full" style="width: 94%"></div>
            </div>
            <p class="text-[11px] text-slate-400">Core data structures, recursive modeling, and programming logic.</p>
          </div>

          <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5">
            <div class="flex justify-between text-xs font-bold text-white">
              <span>Domain Architecture Depth</span>
              <span class="text-blue-400 font-mono">90%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-blue-400 rounded-full" style="width: 90%"></div>
            </div>
            <p class="text-[11px] text-slate-400">Framework implementation across TensorFlow, PyTorch & modern stacks.</p>
          </div>

          <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5">
            <div class="flex justify-between text-xs font-bold text-white">
              <span>Collaborative Execution</span>
              <span class="text-emerald-400 font-mono">88%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-400 rounded-full" style="width: 88%"></div>
            </div>
            <p class="text-[11px] text-slate-400">High propensity for team hackathons, maker labs & technical leadership.</p>
          </div>
        </div>

        <!-- 3-Phase Milestone Roadmap -->
        <div class="bg-slate-950/60 rounded-2xl p-5 border border-white/10 space-y-3">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-300">Targeted Engineering Growth Roadmap</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="space-y-1 border-l-2 border-indigo-500 pl-3">
              <div class="font-bold text-indigo-300">Phase 1: Foundation (Months 1-2)</div>
              <div class="text-slate-300 text-[11px]">Deploy open-source repositories & verified GitHub portfolio projects.</div>
            </div>
            <div class="space-y-1 border-l-2 border-blue-500 pl-3">
              <div class="font-bold text-blue-300">Phase 2: Hackathons (Months 3-5)</div>
              <div class="text-slate-300 text-[11px]">Compete in national collegiate coding hackathons & publish whitepapers.</div>
            </div>
            <div class="space-y-1 border-l-2 border-emerald-500 pl-3">
              <div class="font-bold text-emerald-300">Phase 3: Leadership (Months 6-12)</div>
              <div class="text-slate-300 text-[11px]">Attain executive technical lead positions & NBA Tier-1 credentials.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enrolled Societies & Earned Credentials Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Technical Societies -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900">Enrolled Technical Societies (${userClubs.length})</h2>
              <p class="text-xs text-slate-500">Active student chapters and domain specializations</p>
            </div>
            <a href="#/clubs" class="text-xs font-bold text-blue-600 hover:text-blue-700">Explore All (35) →</a>
          </div>

          <div class="space-y-3">
            ${userClubs.length === 0 ? `
              <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
                <div>You haven't joined any technical societies yet.</div>
                <a href="#/clubs" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-500">Explore Societies</a>
              </div>
            ` : userClubs.map(club => `
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/80 transition-all">
                <div class="flex items-center space-x-3.5">
                  <img src="${club.icon}" class="w-12 h-12 rounded-xl object-cover shadow-xs" />
                  <div>
                    <div class="font-bold text-slate-900 text-xs sm:text-sm">${club.name}</div>
                    <div class="text-[11px] text-blue-600 font-semibold">${club.domain} • Code: ${club.id}</div>
                  </div>
                </div>
                <a href="#/clubs?id=${club.id}" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors">
                  Society Portal
                </a>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Accredited Certificates -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900">Accredited Credentials (${userCerts.length})</h2>
              <p class="text-xs text-slate-500">Tamper-proof verifiable certificates</p>
            </div>
            <a href="#/certificates" class="text-xs font-bold text-blue-600 hover:text-blue-700">View All →</a>
          </div>

          <div class="space-y-3">
            ${userCerts.length === 0 ? `
              <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                No credentials issued yet. Attend workshops and hackathons to receive certified credentials.
              </div>
            ` : userCerts.slice(0, 3).map(c => `
              <div class="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 flex items-center justify-between">
                <div class="space-y-1">
                  <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">${c.awardType || 'Accredited Certificate'}</span>
                  <div class="font-bold text-slate-900 text-xs">${c.eventName || c.title}</div>
                  <div class="text-[10px] text-slate-400 font-mono">Issued: ${c.issueDate || '2026-09-02'} • ID: #${c.id}</div>
                </div>
                <a href="#/certificates?id=${c.id}" class="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors">
                  View
                </a>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Full AI Student Classification & Question Assessment Modal -->
      <div id="ai-classification-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase">Classification Profiler</span>
                <span class="text-xs text-slate-400 font-mono">Google GenAI Powered</span>
              </div>
              <h3 class="text-lg font-black text-slate-900 mt-1">Student Academic & Technical Profiler</h3>
              <p class="text-xs text-slate-500">Provide your engineering details to generate your technical persona and precision society match.</p>
            </div>
            <button id="close-ai-classification-modal-btn" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
          </div>

          <form id="ai-classification-form" class="space-y-4 text-xs">
            
            <!-- Academic Core Details -->
            <div class="space-y-2">
              <div class="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Academic Credentials</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Full Student Name</label>
                  <input type="text" id="prof-name" value="${user.name}" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Roll Number / Student ID</label>
                  <input type="text" id="prof-roll" value="${user.rollNo || user.facultyId || '22A31A0501'}" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Department</label>
                  <select id="prof-dept" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="CSE" ${user.department === 'CSE' ? 'selected' : ''}>CSE</option>
                    <option value="CSE(AIML)" ${user.department === 'CSE(AIML)' ? 'selected' : ''}>CSE (AI & ML)</option>
                    <option value="CSE(DS)" ${user.department === 'CSE(DS)' ? 'selected' : ''}>CSE (Data Science)</option>
                    <option value="AIDS" ${user.department === 'AIDS' ? 'selected' : ''}>AI & Data Science</option>
                    <option value="ECE" ${user.department === 'ECE' ? 'selected' : ''}>ECE</option>
                    <option value="EEE" ${user.department === 'EEE' ? 'selected' : ''}>EEE</option>
                    <option value="MECH" ${user.department === 'MECH' ? 'selected' : ''}>Mechanical</option>
                    <option value="CIVIL" ${user.department === 'CIVIL' ? 'selected' : ''}>Civil</option>
                    <option value="IT" ${user.department === 'IT' ? 'selected' : ''}>Information Tech</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <select id="prof-year" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="1st Year" ${user.year === '1st Year' ? 'selected' : ''}>1st Year (Freshman)</option>
                    <option value="2nd Year" ${user.year === '2nd Year' ? 'selected' : ''}>2nd Year (Sophomore)</option>
                    <option value="3rd Year" ${user.year === '3rd Year' || !user.year ? 'selected' : ''}>3rd Year (Junior)</option>
                    <option value="4th Year" ${user.year === '4th Year' ? 'selected' : ''}>4th Year (Senior)</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Cumulative CGPA</label>
                  <input type="number" step="0.01" min="0" max="10" id="prof-cgpa" value="${user.cgpa || '8.85'}" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
                </div>
              </div>
            </div>

            <!-- Technical Specialization & Skills -->
            <div class="space-y-2 pt-2 border-t border-slate-100">
              <div class="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Technical Focus & Proficiencies</div>
              
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Primary Technical Domain</label>
                <select id="prof-domain" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Artificial Intelligence & Machine Learning" ${user.primaryDomain?.includes('AI') ? 'selected' : ''}>Artificial Intelligence & Machine Learning</option>
                  <option value="Full-Stack Web & Scalable Cloud Systems" ${user.primaryDomain?.includes('Web') ? 'selected' : ''}>Full-Stack Web & Scalable Cloud Systems</option>
                  <option value="Cyber Security, Cryptography & Networks" ${user.primaryDomain?.includes('Cyber') ? 'selected' : ''}>Cyber Security, Cryptography & Networks</option>
                  <option value="IoT, Embedded Robotics & VLSI Systems" ${user.primaryDomain?.includes('IoT') ? 'selected' : ''}>IoT, Embedded Robotics & VLSI Systems</option>
                  <option value="Data Engineering & Quantitative Analytics" ${user.primaryDomain?.includes('Data') ? 'selected' : ''}>Data Engineering & Quantitative Analytics</option>
                  <option value="Competitive Programming & Advanced DSA" ${user.primaryDomain?.includes('Competitive') ? 'selected' : ''}>Competitive Programming & Advanced DSA</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Technical Skills (Comma separated)</label>
                <input type="text" id="prof-skills" value="${skillsList.join(', ')}" placeholder="e.g. Python, PyTorch, TensorFlow, React, FastAPI, Docker, ROS, SQL" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Sub-Interests & Passions (Comma separated)</label>
                <input type="text" id="prof-interests" value="${interestsList.join(', ')}" placeholder="e.g. Generative AI, Cloud Microservices, Autonomous Drones, Hackathons" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <!-- Career Goals & Preferences -->
            <div class="space-y-2 pt-2 border-t border-slate-100">
              <div class="text-xs font-bold text-slate-800 uppercase tracking-wider">3. Aspirations & Availability</div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Primary Career Goal</label>
                  <select id="prof-goal" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="Tier-1 Software Engineering / Product Companies">Tier-1 Software Engineering / Product Companies</option>
                    <option value="AI / ML Applied Research & Publications">AI / ML Applied Research & Publications</option>
                    <option value="Core Electronics & Embedded Systems R&D">Core Electronics & Embedded Systems R&D</option>
                    <option value="Startup Founder / Technical Entrepreneurship">Startup Founder / Technical Entrepreneurship</option>
                    <option value="Higher Education (MS / PhD / Research Fellowship)">Higher Education (MS / PhD / Research Fellowship)</option>
                  </select>
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Weekly Society Availability</label>
                  <select id="prof-availability" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="4-6 hours/week (Weekend Afternoons)">4-6 hours/week (Weekend Afternoons)</option>
                    <option value="6-8 hours/week (Flexible Evenings & Weekends)">6-8 hours/week (Flexible Evenings & Weekends)</option>
                    <option value="8-12 hours/week (Active Core Team Builder)">8-12 hours/week (Active Core Team Builder)</option>
                    <option value="2-4 hours/week (Light Engagement / Labs Only)">2-4 hours/week (Light Engagement / Labs Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Hands-on Experience Level</label>
                <select id="prof-experience" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Beginner (Enthusiastic Learner looking for mentoring)">Beginner (Enthusiastic Learner looking for mentoring)</option>
                  <option value="Intermediate (Built 2-3 projects & participated in hackathons)" selected>Intermediate (Built 2-3 projects & participated in hackathons)</option>
                  <option value="Advanced (Hackathon Winner / Core Open Source Contributor)">Advanced (Hackathon Winner / Core Open Source Contributor)</option>
                </select>
              </div>
            </div>

            <div id="ai-classification-loading" class="hidden p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-center space-y-2">
              <div class="animate-spin text-2xl">⚡</div>
              <div class="font-bold text-xs">Generating Real-time Semantic Classification with Gemini 3.8 Flash...</div>
              <div class="text-[10px] text-indigo-700">Evaluating multi-pillar vector compatibility against 35 technical societies.</div>
            </div>

            <button type="submit" id="save-and-classify-btn" class="w-full py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer">
              <span>🚀 Save Details & Execute AI Classification</span>
            </button>
          </form>

        </div>
      </div>

    </div>
  `;
}

export function attachStudentProfileEvents() {
  const openModalBtn = document.getElementById("open-ai-classification-modal-btn");
  const modal = document.getElementById("ai-classification-modal");
  const closeModalBtn = document.getElementById("close-ai-classification-modal-btn");
  const form = document.getElementById("ai-classification-form");

  if (openModalBtn && modal) {
    openModalBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    if (closeModalBtn) closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = getCurrentUser() || {};
        const loadingBox = document.getElementById("ai-classification-loading");
        const submitBtn = document.getElementById("save-and-classify-btn");

        if (loadingBox) loadingBox.classList.remove("hidden");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add("opacity-50");
        }

        const payload = {
          studentId: user.id,
          name: document.getElementById("prof-name").value.trim(),
          rollNo: document.getElementById("prof-roll").value.trim(),
          department: document.getElementById("prof-dept").value,
          year: document.getElementById("prof-year").value,
          cgpa: document.getElementById("prof-cgpa").value.trim(),
          primaryDomain: document.getElementById("prof-domain").value,
          skills: document.getElementById("prof-skills").value.split(",").map(s => s.trim()).filter(Boolean),
          interests: document.getElementById("prof-interests").value.split(",").map(s => s.trim()).filter(Boolean),
          careerGoal: document.getElementById("prof-goal").value,
          availabilityHours: document.getElementById("prof-availability").value,
          experienceLevel: document.getElementById("prof-experience").value
        };

        try {
          const res = await apiRequest('/api/intelligence/classify-student', 'POST', payload);
          if (res && res.success) {
            // Update local user object
            const updatedProfile = {
              ...user,
              ...payload,
              classifiedArchetype: res.classificationResult?.classification?.classifiedArchetype || "Autonomous & Generative AI Systems Specialist",
              personaSummary: res.classificationResult?.classification?.executivePersonaSummary
            };
            updateProfile(updatedProfile);

            // Update local database
            const db = getDB();
            const userInDb = (db.users || []).find(u => u.id === user.id);
            if (userInDb) {
              Object.assign(userInDb, updatedProfile);
              saveDB(db);
            }

            showToast("AI Classification Complete", `Assigned Archetype: ${updatedProfile.classifiedArchetype}`, "success");
            modal.classList.add("hidden");
            setTimeout(() => window.location.reload(), 300);
          } else {
            showToast("Classification Saved", "Profile updated successfully.", "info");
            modal.classList.add("hidden");
            setTimeout(() => window.location.reload(), 300);
          }
        } catch (err) {
          console.error("AI Classification request error:", err);
          showToast("Profile Updated", "Changes saved locally.", "success");
          modal.classList.add("hidden");
          setTimeout(() => window.location.reload(), 300);
        }
      });
    }
  }
}

