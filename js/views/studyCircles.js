import { getCurrentUser } from '../auth.js';
import { getDB, logAudit } from '../db.js';
import { showToast } from '../components/toast.js';

export function renderStudyCirclesView() {
  const user = getCurrentUser() || {};
  const db = getDB();

  const peerCircles = [
    {
      id: "pc-101",
      title: "Generative AI & LLM Fine-Tuning Peer Circle",
      club: "AI&ML Turing Club (I4-08)",
      topic: "Deep Learning & PyTorch",
      leads: "Aarav Sharma & Priya Patel",
      activeMembers: 18,
      meetingTime: "Wednesdays & Fridays @ 17:00 IST",
      venue: "CSE AI Research Lab 3",
      description: "Collaborative study group implementing LoRA fine-tuning, Quantization, and RAG pipelines on consumer GPUs.",
      activeProject: "Autonomous Campus Q&A Assistant"
    },
    {
      id: "pc-102",
      title: "Ethical Hashing & Capture-The-Flag (CTF) Guild",
      club: "Cyber Security & Forensics Guild (I4-07)",
      topic: "Cybersecurity & Cryptography",
      leads: "Sneha Reddy & Vikram Verma",
      activeMembers: 24,
      meetingTime: "Tuesdays @ 16:30 IST",
      venue: "Cyber Security Lab B",
      description: "Hands-on CTF challenge solving, web penetration testing walkthroughs, and vulnerability scanning.",
      activeProject: "PEC Intra-College CTF Portal"
    },
    {
      id: "pc-103",
      title: "Full-Stack Microservices & Cloud Systems Circle",
      club: "Pragsoft Developers Society (EC-04)",
      topic: "Full-Stack Web & Cloud",
      leads: "Ketan Mehta & Ananya Roy",
      activeMembers: 30,
      meetingTime: "Saturdays @ 10:00 IST",
      venue: "Computer Center Lab 1",
      description: "Building scalable distributed systems with Node.js, Docker containers, Redis caching, and PostgreSQL databases.",
      activeProject: "Distributed Event Ticket Booking System"
    }
  ];

  return `
    <div class="max-w-7xl mx-auto space-y-6 pb-12">
      
      <!-- Peer Circles Header -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <span>👥 Collaborative Learning Network</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">Peer Circles & Technical Study Groups</h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join peer-led study circles at Pragati Engineering College. Collaborate on open-source projects, conduct code reviews, prepare for hackathons, and accelerate domain skill mastery together.
            </p>
          </div>
          
          <button id="create-circle-btn" class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 shrink-0">
            <span>➕</span>
            <span>Form New Peer Circle</span>
          </button>
        </div>
      </div>

      <!-- Peer Circle Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${peerCircles.map(pc => `
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                  ${pc.topic}
                </span>
                <span class="text-xs font-bold text-slate-600 font-mono flex items-center space-x-1">
                  <span>👥</span><span>${pc.activeMembers} Peers</span>
                </span>
              </div>

              <h3 class="text-base font-black text-slate-900 leading-snug">${pc.title}</h3>
              <p class="text-xs text-slate-500 leading-relaxed">${pc.description}</p>

              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div>📌 <strong>Active Build:</strong> <span class="text-indigo-700 font-semibold">${pc.activeProject}</span></div>
                <div>⏰ <strong>Schedule:</strong> ${pc.meetingTime}</div>
                <div>📍 <strong>Venue:</strong> ${pc.venue}</div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[11px] text-slate-400">Leads: <strong>${pc.leads}</strong></span>
              <button data-join-circle="${pc.id}" class="join-circle-btn px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs">
                Join Circle
              </button>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

export function attachStudyCirclesEvents() {
  document.querySelectorAll('.join-circle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast("Successfully joined Peer Circle! Access link and group updates sent to your institutional email.", "success");
      btn.textContent = "Joined ✓";
      btn.className = "px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs";
    });
  });

  const createBtn = document.getElementById('create-circle-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      showToast("Peer Circle application submitted to Faculty Coordinator for review and venue allocation.", "info");
    });
  }
}
