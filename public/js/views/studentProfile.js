import { getCurrentUser, updateProfile } from '../auth.js';
import { getDB } from '../db.js';
import { showToast } from '../components/toast.js';

export function renderStudentProfileView() {
  const user = getCurrentUser() || {};
  const db = getDB();

  const userClubs = (user.clubs || []).map(id => db.clubs.find(c => c.id === id)).filter(Boolean);
  const userCerts = db.certificates.filter(c => c.studentId === user.id || c.rollNo === user.rollNo);
  const userProjects = db.projects.filter(p => p.teamLeader === user.name || p.teamMembers?.includes(user.name));

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Profile Header Card -->
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="h-32 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900"></div>
        <div class="p-6 sm:p-8 -mt-16 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div class="flex items-end space-x-4">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" class="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl bg-white shrink-0" />
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <h1 class="text-2xl font-black text-slate-900">${user.name}</h1>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800">${user.role}</span>
              </div>
              <div class="text-xs text-slate-500 font-mono font-bold">
                Roll No: ${user.rollNo || user.facultyId || '22CS101'} • Dept. of ${user.department || 'CSE'}
              </div>
              <div class="text-[11px] text-slate-400 font-mono">
                ${user.year || '3rd Year'} • ${user.semester || '5th Semester'} • CGPA: ${user.cgpa || '9.12'}
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <a href="#/membership-card" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors">
              Digital ID Card →
            </a>
            <button id="edit-profile-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all">
              Edit Profile
            </button>
          </div>
        </div>

        <!-- Skills & Badges Strip -->
        <div class="px-6 sm:px-8 pb-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs">
          <span class="font-bold text-slate-400 mr-2 uppercase text-[10px] tracking-wider">Skills:</span>
          ${(user.skills || ["Python", "Machine Learning", "System Design"]).map(skill => `
            <span class="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs">${skill}</span>
          `).join('')}
        </div>
      </div>

      <!-- Content Grid: Earned Certificates & Projects -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Accredited Certificates Section -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Accredited Certificates (${userCerts.length})</h2>
              <p class="text-xs text-slate-500">Tamper-proof credentials earned from workshops & hackathons</p>
            </div>
            <a href="#/certificates" class="text-xs font-bold text-blue-600 hover:text-blue-700">View All →</a>
          </div>

          <div class="space-y-3">
            ${userCerts.length === 0 ? `
              <div class="p-6 text-center text-slate-400 text-xs">No certificates issued yet. Complete events to receive credentials.</div>
            ` : userCerts.map(c => `
              <div class="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">${c.awardType}</span>
                  <div class="font-bold text-slate-900 text-xs mt-1">${c.eventName}</div>
                  <div class="text-[10px] text-slate-400 font-mono">Issued: ${c.issueDate} • ID: ${c.id}</div>
                </div>
                <a href="#/certificates?id=${c.id}" class="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors">
                  View / Print
                </a>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Enrolled Societies Section -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Technical Societies (${userClubs.length})</h2>
              <p class="text-xs text-slate-500">Active student chapters and domain specializations</p>
            </div>
            <a href="#/clubs" class="text-xs font-bold text-blue-600 hover:text-blue-700">Join More →</a>
          </div>

          <div class="space-y-3">
            ${userClubs.length === 0 ? `
              <div class="p-6 text-center text-slate-400 text-xs">Not enrolled in any societies yet. Explore clubs to join!</div>
            ` : userClubs.map(club => `
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <img src="${club.icon}" class="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div class="font-bold text-slate-900 text-xs">${club.name}</div>
                    <div class="text-[11px] text-blue-600 font-semibold">${club.domain}</div>
                  </div>
                </div>
                <a href="#/clubs?id=${club.id}" class="text-xs font-bold text-slate-600 hover:text-blue-600">
                  Society Portal →
                </a>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Innovation Projects Section -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">Submitted Engineering Projects (${userProjects.length})</h2>
            <p class="text-xs text-slate-500">Peer-reviewed innovation repositories and hackathon builds</p>
          </div>
          <a href="#/projects" class="text-xs font-bold text-blue-600 hover:text-blue-700">+ Submit Project →</a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${userProjects.length === 0 ? `
            <div class="col-span-2 p-6 text-center text-slate-400 text-xs">No projects submitted yet. Add your GitHub builds to your portfolio!</div>
          ` : userProjects.map(proj => `
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">${proj.domain}</span>
                <span class="text-xs font-bold text-amber-600">★ ${proj.facultyReview?.rating || 5}.0</span>
              </div>
              <h3 class="font-bold text-slate-900 text-xs">${proj.title}</h3>
              <p class="text-[11px] text-slate-600 line-clamp-2">${proj.description}</p>
              <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span class="text-slate-400 font-mono">Lead: ${proj.teamLeader}</span>
                <div class="flex items-center space-x-2">
                  ${proj.github ? `<a href="${proj.github}" target="_blank" class="font-bold text-slate-800 hover:text-black">GitHub</a>` : ''}
                  ${proj.demo ? `<a href="${proj.demo}" target="_blank" class="font-bold text-blue-600 hover:text-blue-800">Demo</a>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Edit Profile Modal -->
      <div id="edit-profile-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900">Update Student Profile</h3>
            <button id="close-profile-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="edit-profile-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input type="text" id="edit-name" value="${user.name}" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Roll No / ID</label>
                <input type="text" id="edit-roll" value="${user.rollNo || user.facultyId || ''}" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">CGPA</label>
                <input type="text" id="edit-cgpa" value="${user.cgpa || ''}" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Department</label>
                <input type="text" id="edit-dept" value="${user.department || 'CSE'}" required class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Year of Study</label>
                <input type="text" id="edit-year" value="${user.year || '3rd Year'}" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Technical Skills (Comma separated)</label>
              <input type="text" id="edit-skills" value="${(user.skills || []).join(', ')}" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Save Profile Changes
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function attachStudentProfileEvents() {
  const editBtn = document.getElementById("edit-profile-btn");
  const modal = document.getElementById("edit-profile-modal");
  const closeBtn = document.getElementById("close-profile-modal");
  const form = document.getElementById("edit-profile-form");

  if (editBtn && modal) {
    editBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const updated = {
          name: document.getElementById("edit-name").value,
          rollNo: document.getElementById("edit-roll").value,
          cgpa: document.getElementById("edit-cgpa").value,
          department: document.getElementById("edit-dept").value,
          year: document.getElementById("edit-year").value,
          skills: document.getElementById("edit-skills").value.split(",").map(s => s.trim()).filter(Boolean)
        };
        updateProfile(updated);
        showToast("Profile updated successfully!", "success");
        modal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
