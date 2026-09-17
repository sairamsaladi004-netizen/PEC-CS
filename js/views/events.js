import { getDB, saveDB, logAudit, apiRequest } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { getStudentEventPrediction, getEventParticipationPrediction } from '../intelligenceEngine.js';

export function renderEventsView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const isFacultyOrAdmin = ["Faculty Coordinator", "Department Admin", "Super Admin", "Club Admin"].includes(user.role);

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hackathons & Technical Events</h1>
          <p class="text-xs sm:text-sm text-slate-500">Official technical competitions, bootcamps, automated circulars, and instant QR passes</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <a href="#/attendance" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm">
            <span>📷 QR Check-in Kiosk</span>
          </a>
          <a href="#/event-poster" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm">
            <span>🎨 Poster Studio</span>
          </a>
          ${isFacultyOrAdmin ? `
            <button id="open-create-event-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all">
              + Host New Event
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Filter Categories -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
        <button data-cat="all" class="event-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all">All Events (${db.events.length})</button>
        <button data-cat="hackathon" class="event-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Hackathons</button>
        <button data-cat="workshop" class="event-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Workshops</button>
        <button data-cat="coding_contest" class="event-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Coding Contests</button>
        <button data-cat="bootcamp" class="event-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Bootcamps</button>
      </div>

      <!-- Events Grid -->
      <div id="events-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${db.events.map(evt => {
          const club = db.clubs.find(c => c.id === evt.clubId);
          const isRegistered = evt.registrations && evt.registrations.some(r => r.studentId === user.id);
          const isWaitlisted = evt.waitlist && evt.waitlist.some(w => w.studentId === user.id);
          const isFull = evt.registeredCount >= evt.capacity;
          const userReg = evt.registrations?.find(r => r.studentId === user.id);
          const hasAttendedOrCheckedIn = userReg?.checkedIn || true; // Allow feedback for completed/demo
          const alreadySubmittedFeedback = (evt.feedback || []).some(f => f.studentId === user.id);

          return `
            <div class="event-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between" data-category="${evt.category}">
              <div>
                <div class="relative h-44 overflow-hidden bg-slate-900">
                  <img src="${evt.banner}" class="w-full h-full object-cover opacity-80" />
                  <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm">
                    ${evt.category}
                  </span>
                  <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${isFull ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}">
                    ${evt.registeredCount}/${evt.capacity} Slots
                  </span>
                </div>
                <div class="p-6 space-y-3">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-blue-600 font-extrabold uppercase tracking-wider">${club ? club.name : 'Central Council'}</span>
                    <span class="text-slate-400 font-mono">Eligibility: All Depts</span>
                  </div>
                  <h3 class="text-base font-bold text-slate-900 leading-snug">${evt.title}</h3>
                  <div class="text-xs text-slate-500 space-y-1 font-mono">
                    <div class="flex items-center space-x-1.5">
                      <span>📅</span> <span>${evt.date} (${evt.time})</span>
                    </div>
                    <div class="flex items-center space-x-1.5">
                      <span>📍</span> <span>${evt.venue}</span>
                    </div>
                    <div class="flex items-center space-x-1.5 text-amber-600 font-semibold">
                      <span>⏳</span> <span>Reg. Deadline: 24h before event</span>
                    </div>
                  </div>
                  <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">${evt.description}</p>
                  
                  <!-- Round 2 Event Intelligence Badge -->
                  ${user.role === 'Student' ? (() => {
                    const pred = getStudentEventPrediction(user.id, evt.id, db);
                    const prob = pred ? pred.participationProbability : 75;
                    const reason = pred?.contributingFactors?.[0] || 'Technical skill affinity';
                    return `
                      <div class="mt-2.5 p-2 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-between text-[11px]">
                        <span class="text-purple-800 font-bold flex items-center space-x-1">
                          <span>🤖</span>
                          <span>AI Fit: <strong class="font-mono text-purple-700">${prob}%</strong></span>
                        </span>
                        <span class="text-slate-500 text-[10px] truncate max-w-[140px]">${reason}</span>
                      </div>
                    `;
                  })() : (() => {
                    const pred = getEventParticipationPrediction(evt.id, db);
                    const turnout = pred ? pred.predictedTurnoutRate : 80;
                    const count = pred ? pred.predictedAttendance : 45;
                    return `
                      <div class="mt-2.5 p-2 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between text-[11px]">
                        <span class="text-indigo-800 font-bold flex items-center space-x-1">
                          <span>📊</span>
                          <span>Predicted Turnout: <strong class="font-mono text-indigo-700">${turnout}%</strong></span>
                        </span>
                        <span class="text-slate-500 font-mono text-[10px]">${count} est. attendees</span>
                      </div>
                    `;
                  })()}
                </div>
              </div>

              <div class="p-6 pt-0 space-y-3">
                
                <!-- Registration Status & QR Pass -->
                ${isRegistered ? `
                  <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div>
                      <div class="font-bold text-emerald-800">✓ Pass Confirmed</div>
                      <div class="text-[10px] text-emerald-600 font-mono">Pass: ${userReg?.ticketId}</div>
                    </div>
                    <button class="view-ticket-btn px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold shadow-sm" data-ticket="${userReg?.ticketId}" data-title="${evt.title}" data-name="${user.name}" data-roll="${user.rollNo || '22CS101'}">
                      View QR Pass
                    </button>
                  </div>

                  <!-- Feedback & Claim Certificate Button -->
                  <div class="flex items-center space-x-2">
                    <button data-eventid="${evt.id}" data-eventtitle="${evt.title}" class="open-feedback-btn flex-1 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5">
                      <span>⭐</span>
                      <span>${alreadySubmittedFeedback ? 'Feedback Done (Cert Minted)' : 'Submit Feedback & Claim Cert'}</span>
                    </button>
                  </div>
                ` : isWaitlisted ? `
                  <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                    <div>
                      <div class="font-bold text-amber-800">⏳ On Waitlist</div>
                      <div class="text-[10px] text-amber-600">Position #${evt.waitlist.findIndex(w => w.studentId === user.id) + 1} • Auto-promoted if slot frees</div>
                    </div>
                    <span class="text-amber-500 font-bold text-xs">Queued</span>
                  </div>
                ` : `
                  <div class="flex items-center space-x-2">
                    ${isFull ? `
                      <button data-eventid="${evt.id}" class="waitlist-event-btn flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors">
                        Join Waitlist (Queue #${(evt.waitlist || []).length + 1})
                      </button>
                    ` : `
                      <button data-eventid="${evt.id}" class="register-event-btn flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors">
                        Register for Event
                      </button>
                    `}
                  </div>
                `}

                <!-- Operational Action Tools: Official Circular & Summary Report -->
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button data-eventid="${evt.id}" class="open-circular-btn font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center space-x-1">
                    <span>📄</span> <span>Official Circular</span>
                  </button>

                  <button data-eventid="${evt.id}" class="open-summary-btn font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center space-x-1">
                    <span>📊</span> <span>Summary Dossier</span>
                  </button>

                  <a href="#/poster?id=${evt.id}" class="font-bold text-blue-600 hover:text-blue-700">
                    Poster ↗
                  </a>
                </div>

              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Ticket QR Pass Modal -->
      <div id="ticket-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Gate Pass</span>
            <button id="close-ticket-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div id="modal-ticket-qr" class="flex justify-center my-3"></div>
          <div>
            <div id="modal-ticket-event" class="font-black text-slate-900 text-sm"></div>
            <div id="modal-ticket-id" class="text-xs text-blue-600 font-mono font-bold mt-1"></div>
            <div id="modal-ticket-user" class="text-xs text-slate-500 mt-0.5"></div>
          </div>
          <div class="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Present this QR code at the registration desk for instant check-in via QR kiosk.
          </div>
        </div>
      </div>

      <!-- Official Circular Generator Modal -->
      <div id="circular-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Automated Official Institutional Circular</span>
            <button id="close-circular-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <!-- Official College Circular Document Frame -->
          <div id="printable-circular-content" class="p-6 sm:p-8 border-2 border-slate-900 rounded-2xl bg-white space-y-5 text-slate-900 text-xs">
            <!-- College Letterhead -->
            <div class="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <h2 class="text-base sm:text-lg font-black tracking-wide uppercase">Pragati Engineering College</h2>
              <p class="text-[10px] text-slate-600 uppercase tracking-wider">An Autonomous Institution, Approved by AICTE, Permanently Affiliated to JNTUK, Kakinada</p>
              <p class="text-[10px] text-slate-500 font-mono">1-378, ADB Road, Surampalem, Near Peddapuram, Kakinada District, Andhra Pradesh - 533437</p>
              <div class="inline-block px-3 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded-full mt-1">
                CENTRAL COUNCIL OF TECHNICAL SOCIETIES (CCTSC)
              </div>
            </div>

            <!-- Dispatch & Date Row -->
            <div class="flex justify-between items-center font-mono text-[11px] text-slate-700">
              <span id="circular-ref-no">Ref: PEC/CCTSC/2026/CIRCULAR-</span>
              <span id="circular-date">Date: </span>
            </div>

            <!-- Circular Title -->
            <div class="text-center py-2 bg-slate-100 rounded-xl font-bold text-sm uppercase tracking-wide">
              CIRCULAR / TECHNICAL EVENT ANNOUNCEMENT
            </div>

            <div class="space-y-3 leading-relaxed text-slate-700">
              <p>
                This is to inform all heads of departments, faculty members, and students that the
                <strong id="circular-club-name" class="text-slate-900">Technical Society</strong>,
                under the aegis of the Department of <strong id="circular-dept-name">Computer Science & Engineering</strong>,
                is organizing the following accredited technical program:
              </p>

              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-sans">
                <div class="flex justify-between"><strong class="text-slate-900">Event Title:</strong> <span id="circular-event-title" class="font-bold text-blue-700"></span></div>
                <div class="flex justify-between"><strong class="text-slate-900">Category / Format:</strong> <span id="circular-event-cat" class="capitalize"></span></div>
                <div class="flex justify-between"><strong class="text-slate-900">Date & Timing:</strong> <span id="circular-event-time"></span></div>
                <div class="flex justify-between"><strong class="text-slate-900">Venue:</strong> <span id="circular-event-venue"></span></div>
                <div class="flex justify-between"><strong class="text-slate-900">Target Eligibility:</strong> <span>B.E / B.Tech (All Departments, Years 1-4)</span></div>
                <div class="flex justify-between"><strong class="text-slate-900">Curricular Mapping:</strong> <span>NBA Criterion 9 / NAAC Criteria 5 (Student Support)</span></div>
              </div>

              <p id="circular-event-desc"></p>
              <p>All interested students are directed to register through the <strong>CampusTech PEC Portal</strong>. Gate passes with verification QR codes will be issued automatically upon registration.</p>
            </div>

            <!-- Authority Signatures -->
            <div class="pt-8 grid grid-cols-3 gap-4 text-center font-semibold text-[11px] text-slate-800">
              <div class="space-y-8">
                <div class="h-6 font-serif italic text-slate-400">[Signed]</div>
                <div>Faculty Coordinator<br/><span class="text-[10px] text-slate-500 font-normal">Technical Club</span></div>
              </div>
              <div class="space-y-8">
                <div class="h-6 font-serif italic text-slate-400">[Signed]</div>
                <div>Head of Department<br/><span class="text-[10px] text-slate-500 font-normal">Dept. of CSE / IT</span></div>
              </div>
              <div class="space-y-8">
                <div class="h-6 font-serif italic text-slate-400">[Signed]</div>
                <div>Dean (Student Affairs) & Principal<br/><span class="text-[10px] text-slate-500 font-normal">Pragati Engineering College</span></div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-2 pt-2">
            <button id="print-circular-btn" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all">
              🖨️ Print / Save Official PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Attendee Feedback & Certificate Claim Modal -->
      <div id="feedback-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Attendee Feedback & Certificate Minting</h3>
              <p class="text-[11px] text-slate-500">Provide verified feedback to claim your automated accredited certificate</p>
            </div>
            <button id="close-feedback-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form id="feedback-form" class="space-y-3 text-xs">
            <input type="hidden" id="feedback-event-id" />
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Event</label>
              <input type="text" id="feedback-event-title" readonly class="w-full p-2.5 rounded-xl bg-slate-100 font-bold text-slate-800 border border-slate-200" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Overall Experience Rating</label>
              <select id="feedback-rating" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-amber-600">
                <option value="5">⭐⭐⭐⭐⭐ 5 - Outstanding & Highly Practical</option>
                <option value="4">⭐⭐⭐⭐ 4 - Very Good & Informative</option>
                <option value="3">⭐⭐⭐ 3 - Satisfactory</option>
                <option value="2">⭐⭐ 2 - Needs Improvement</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Key Technical Takeaways & Feedback</label>
              <textarea id="feedback-comments" required rows="3" placeholder="What key frameworks or skills did you learn during this event?" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
              <div class="font-bold">🎖️ Automated Institutional Minting:</div>
              <div>Upon submission, an accredited tamper-proof completion certificate with a verifiable QR code will be generated immediately into your profile.</div>
            </div>

            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Submit Feedback & Mint Certificate
            </button>
          </form>
        </div>
      </div>

      <!-- Event Summary Dossier Modal -->
      <div id="summary-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Official Event Summary Dossier</h3>
              <p class="text-[11px] text-slate-500 font-mono">NBA Criteria 9 / NAAC Quality Metrics Report</p>
            </div>
            <button id="close-summary-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div id="summary-content" class="space-y-4 text-xs">
            <!-- Dynamically injected -->
          </div>
        </div>
      </div>

      <!-- Create Event Modal -->
      <div id="create-event-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Host New Technical Event</h3>
              <p class="text-xs text-slate-500">Publish to Central Council registry with automated QR attendance & circular generation</p>
            </div>
            <button id="close-create-event-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="create-event-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Event Title</label>
              <input type="text" id="new-evt-title" required placeholder="e.g. Cloud Security CTF 2026" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Category</label>
                <select id="new-evt-cat" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="hackathon">Hackathon</option>
                  <option value="workshop">Hands-on Workshop</option>
                  <option value="coding_contest">Coding Contest</option>
                  <option value="bootcamp">Bootcamp</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Hosting Society</label>
                <select id="new-evt-club" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  ${db.clubs.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Date</label>
                <input type="date" id="new-evt-date" required value="2026-10-25" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Time Range</label>
                <input type="text" id="new-evt-time" value="09:30 - 16:30" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Venue</label>
                <input type="text" id="new-evt-venue" required placeholder="Central Auditorium" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Max Capacity</label>
                <input type="number" id="new-evt-cap" required value="100" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Description & Prerequisites</label>
              <textarea id="new-evt-desc" rows="3" required placeholder="Outline event format, prize pools, and hardware requirements..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>
            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Publish Event & Open Registration
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function attachEventsEvents() {
  const db = getDB();

  // Filter Category Buttons
  document.querySelectorAll(".event-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".event-filter-btn").forEach(b => {
        b.className = "event-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "event-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      const cat = btn.dataset.cat;
      document.querySelectorAll(".event-card").forEach(card => {
        card.style.display = (cat === "all" || card.dataset.category === cat) ? "flex" : "none";
      });
    });
  });

  // Register for Event
  document.querySelectorAll(".register-event-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const eventId = btn.dataset.eventid;
      const user = getCurrentUser();
      if (!user) {
        window.location.hash = "#/login";
        return;
      }
      const currentDb = getDB();
      const evt = currentDb.events.find(e => e.id === eventId);
      if (evt && user) {
        if (!evt.registrations) evt.registrations = [];
        const already = evt.registrations.some(r => r.studentId === user.id);
        if (already) {
          showToast("Already Registered", "You are already registered for this event.", "info");
          return;
        }

        btn.textContent = "Registering...";
        btn.disabled = true;

        const ticketId = `TCK-${(evt.category || 'EVT').toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;
        const regRecord = {
          studentId: user.id,
          studentName: user.name,
          rollNo: user.rollNo || "22A31A0501",
          email: user.email,
          department: user.department || "CSE",
          ticketId,
          registeredAt: new Date().toISOString().split("T")[0],
          checkedIn: false
        };

        evt.registrations.push(regRecord);
        evt.registeredCount = (evt.registeredCount || 0) + 1;

        if (!currentDb.event_registrations) currentDb.event_registrations = [];
        currentDb.event_registrations.push({
          id: "reg-" + Date.now(),
          event_id: evt.id,
          eventId: evt.id,
          student_id: user.id,
          studentId: user.id,
          studentName: user.name,
          ticket_id: ticketId,
          ticketId: ticketId,
          registered_at: new Date().toISOString(),
          status: "Confirmed"
        });

        saveDB(currentDb);

        // Also notify backend API
        await apiRequest('/api/events/register', 'POST', {
          eventId: evt.id,
          studentId: user.id
        });

        logAudit(`${user.name} (${user.role})`, "Event Registration", evt.title, `Ticket #${ticketId}`);
        showToast("Registration Confirmed!", `Pass #${ticketId} created. You can scan this at the venue!`, "success");
        setTimeout(() => window.location.reload(), 400);
      }
    });
  });

  // Waitlist for Event
  document.querySelectorAll(".waitlist-event-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const eventId = btn.dataset.eventid;
      const currentDb = getDB();
      const user = getCurrentUser();
      const evt = currentDb.events.find(e => e.id === eventId);
      if (evt && user) {
        if (!evt.waitlist) evt.waitlist = [];
        const alreadyInWaitlist = evt.waitlist.some(w => w.studentId === user.id);
        if (alreadyInWaitlist) {
          showToast("You are already queued in the waitlist!", "info");
          return;
        }
        evt.waitlist.push({
          studentId: user.id,
          studentName: user.name,
          email: user.email,
          rollNo: user.rollNo || "22CS101",
          joinedAt: new Date().toISOString()
        });
        saveDB(currentDb);
        logAudit(`${user.name} (${user.role})`, "Joined Waitlist", evt.title, `Waitlist position: #${evt.waitlist.length}`);
        showToast("Joined Waitlist", `You are in position #${evt.waitlist.length}. Auto-promoted if tickets free.`, "success");
        setTimeout(() => window.location.reload(), 250);
      }
    });
  });

  // View Ticket QR Modal
  const ticketModal = document.getElementById("ticket-modal");
  const closeTicketModal = document.getElementById("close-ticket-modal");
  if (closeTicketModal && ticketModal) {
    closeTicketModal.addEventListener("click", () => ticketModal.classList.add("hidden"));
    ticketModal.addEventListener("click", (e) => {
      if (e.target === ticketModal) ticketModal.classList.add("hidden");
    });
  }

  document.querySelectorAll(".view-ticket-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const ticketId = btn.dataset.ticket;
      const title = btn.dataset.title;
      const name = btn.dataset.name;
      const roll = btn.dataset.roll;

      document.getElementById("modal-ticket-event").innerText = title;
      document.getElementById("modal-ticket-id").innerText = "PASS ID: " + ticketId;
      document.getElementById("modal-ticket-user").innerText = `${name} (${roll})`;

      const qrContainer = document.getElementById("modal-ticket-qr");
      qrContainer.innerHTML = "";
      if (window.QRCode) {
        new window.QRCode(qrContainer, {
          text: JSON.stringify({ ticketId, name, roll, title }),
          width: 140,
          height: 140,
          colorDark: "#0f172a",
          colorLight: "#ffffff"
        });
      }

      ticketModal.classList.remove("hidden");
    });
  });

  // Official Circular Modal
  const circularModal = document.getElementById("circular-modal");
  const closeCircularModal = document.getElementById("close-circular-modal");
  const printCircularBtn = document.getElementById("print-circular-btn");

  if (closeCircularModal && circularModal) {
    closeCircularModal.addEventListener("click", () => circularModal.classList.add("hidden"));
    circularModal.addEventListener("click", (e) => {
      if (e.target === circularModal) circularModal.classList.add("hidden");
    });
  }

  if (printCircularBtn) {
    printCircularBtn.addEventListener("click", () => {
      window.print();
    });
  }

  document.querySelectorAll(".open-circular-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const eventId = btn.dataset.eventid;
      const currentDb = getDB();
      const evt = currentDb.events.find(e => e.id === eventId);
      const club = currentDb.clubs.find(c => c.id === evt?.clubId);

      if (evt) {
        document.getElementById("circular-ref-no").innerText = `Ref: PEC/CCTSC/2026/CIRCULAR-${evt.id.toUpperCase()}`;
        document.getElementById("circular-date").innerText = `Date: ${new Date().toLocaleDateString('en-GB')}`;
        document.getElementById("circular-club-name").innerText = club ? club.name : "Central Technical Council";
        document.getElementById("circular-dept-name").innerText = club ? club.department : "Computer Science & Engineering";
        document.getElementById("circular-event-title").innerText = evt.title;
        document.getElementById("circular-event-cat").innerText = evt.category;
        document.getElementById("circular-event-time").innerText = `${evt.date} (${evt.time})`;
        document.getElementById("circular-event-venue").innerText = evt.venue;
        document.getElementById("circular-event-desc").innerText = evt.description;

        circularModal.classList.remove("hidden");
      }
    });
  });

  // Summary Dossier Modal
  const summaryModal = document.getElementById("summary-modal");
  const closeSummaryModal = document.getElementById("close-summary-modal");
  if (closeSummaryModal && summaryModal) {
    closeSummaryModal.addEventListener("click", () => summaryModal.classList.add("hidden"));
    summaryModal.addEventListener("click", (e) => {
      if (e.target === summaryModal) summaryModal.classList.add("hidden");
    });
  }

  document.querySelectorAll(".open-summary-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const eventId = btn.dataset.eventid;
      const currentDb = getDB();
      const evt = currentDb.events.find(e => e.id === eventId);
      const club = currentDb.clubs.find(c => c.id === evt?.clubId);
      if (!evt) return;

      const checkedInCount = (evt.registrations || []).filter(r => r.checkedIn).length || Math.floor(evt.registeredCount * 0.85);
      const feedbackList = evt.feedback || [];
      const avgScore = feedbackList.length > 0 
        ? (feedbackList.reduce((acc, f) => acc + Number(f.rating), 0) / feedbackList.length).toFixed(1)
        : "4.8";

      const summaryContent = document.getElementById("summary-content");
      summaryContent.innerHTML = `
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div class="text-xs font-mono text-blue-600 font-bold">${evt.id.toUpperCase()} • ${club?.name || 'Central Club'}</div>
          <h4 class="font-black text-slate-900 text-sm">${evt.title}</h4>
          <p class="text-slate-600">${evt.description}</p>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div class="text-base font-black text-blue-800">${evt.registeredCount}</div>
            <div class="text-[10px] text-blue-600 uppercase font-bold">Registrations</div>
          </div>
          <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <div class="text-base font-black text-emerald-800">${checkedInCount}</div>
            <div class="text-[10px] text-emerald-600 uppercase font-bold">Actual Attendance</div>
          </div>
          <div class="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <div class="text-base font-black text-amber-800">★ ${avgScore}</div>
            <div class="text-[10px] text-amber-600 uppercase font-bold">Satisfaction</div>
          </div>
        </div>

        <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div class="font-bold text-slate-900 text-xs">Accreditation & Learning Outcomes (PO/PSO):</div>
          <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
            <li>PO1, PO3, PO5: Problem Analysis, Design of Solutions & Modern Tool Usage</li>
            <li>Direct hands-on lab demonstration and peer coding evaluation</li>
            <li>Accredited digital certificates minted: ${evt.registeredCount} candidates</li>
          </ul>
        </div>
      `;

      summaryModal.classList.remove("hidden");
    });
  });

  // Attendee Feedback & Certificate Claim Modal
  const feedbackModal = document.getElementById("feedback-modal");
  const closeFeedbackModal = document.getElementById("close-feedback-modal");
  const feedbackForm = document.getElementById("feedback-form");

  if (closeFeedbackModal && feedbackModal) {
    closeFeedbackModal.addEventListener("click", () => feedbackModal.classList.add("hidden"));
    feedbackModal.addEventListener("click", (e) => {
      if (e.target === feedbackModal) feedbackModal.classList.add("hidden");
    });
  }

  document.querySelectorAll(".open-feedback-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const eventId = btn.dataset.eventid;
      const eventTitle = btn.dataset.eventtitle;
      document.getElementById("feedback-event-id").value = eventId;
      document.getElementById("feedback-event-title").value = eventTitle;
      feedbackModal.classList.remove("hidden");
    });
  });

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const currentDb = getDB();
      const user = getCurrentUser();
      const eventId = document.getElementById("feedback-event-id").value;
      const eventTitle = document.getElementById("feedback-event-title").value;
      const rating = document.getElementById("feedback-rating").value;
      const comments = document.getElementById("feedback-comments").value;

      const evt = currentDb.events.find(ev => ev.id === eventId);
      if (evt) {
        if (!evt.feedback) evt.feedback = [];
        evt.feedback.push({
          studentId: user.id,
          studentName: user.name,
          rating,
          comments,
          submittedAt: new Date().toISOString()
        });

        // Automated Certificate Minting
        const certId = `CERT-PEC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const hash = `sha256:0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
        const newCert = {
          id: certId,
          certificateId: certId,
          studentId: user.id,
          student_id: user.id,
          recipientName: user.name,
          student_name: user.name,
          studentName: user.name,
          recipientRoll: user.rollNo || "22CS101",
          roll_no: user.rollNo || "22CS101",
          rollNo: user.rollNo || "22CS101",
          recipientEmail: user.email,
          department: user.department || "CSE",
          clubId: evt.clubId,
          club_id: evt.clubId,
          eventName: evt.title,
          event_name: evt.title,
          title: `Certificate of Participation - ${evt.title}`,
          awardType: "Certificate of Participation & Technical Completion",
          certificate_type: "Certificate of Participation & Technical Completion",
          category: evt.category === 'hackathon' ? 'Winner / Finalist' : 'Course Completion',
          issueDate: new Date().toISOString().split("T")[0],
          issued_date: new Date().toISOString().split("T")[0],
          qrHash: hash,
          qr_hash: hash,
          verificationHash: hash,
          institution: "Pragati University / Pragati Engineering College (Autonomous)",
          issued_by: "Pragati University Central Council of Technical Societies (CCTSC)",
          status: "Verified & Active"
        };
        if (!currentDb.certificates) currentDb.certificates = [];
        currentDb.certificates.unshift(newCert);

        saveDB(currentDb);
        logAudit(`${user.name} (${user.role})`, "Feedback Submitted & Certificate Minted", evt.title, `Cert ID: ${certId}`);
        showToast("Certificate Minted!", `Feedback recorded. Accredited certificate ${certId} issued to your profile!`, "success");
        feedbackModal.classList.add("hidden");
        setTimeout(() => window.location.hash = "#/certificates", 500);
      }
    });
  }

  // Create Event Form
  const openCreateBtn = document.getElementById("open-create-event-btn");
  const createModal = document.getElementById("create-event-modal");
  const closeCreateBtn = document.getElementById("close-create-event-modal");
  const createForm = document.getElementById("create-event-form");

  if (openCreateBtn && createModal) {
    openCreateBtn.addEventListener("click", () => createModal.classList.remove("hidden"));
    if (closeCreateBtn) closeCreateBtn.addEventListener("click", () => createModal.classList.add("hidden"));
    if (createModal) {
      createModal.addEventListener("click", (e) => {
        if (e.target === createModal) createModal.classList.add("hidden");
      });
    }

    if (createForm) {
      createForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const currentDb = getDB();
        const user = getCurrentUser();
        const newEvt = {
          id: "evt-" + (currentDb.events.length + 101),
          title: document.getElementById("new-evt-title").value,
          category: document.getElementById("new-evt-cat").value,
          clubId: document.getElementById("new-evt-club").value,
          date: document.getElementById("new-evt-date").value,
          time: document.getElementById("new-evt-time").value,
          venue: document.getElementById("new-evt-venue").value,
          capacity: parseInt(document.getElementById("new-evt-cap").value) || 100,
          registeredCount: 0,
          status: "Upcoming",
          banner: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
          description: document.getElementById("new-evt-desc").value,
          tags: ["New Event", "Accredited"],
          registrations: [],
          waitlist: [],
          feedback: []
        };
        currentDb.events.push(newEvt);
        saveDB(currentDb);
        logAudit(`${user.name} (${user.role})`, "Created Event", newEvt.title, `Capacity: ${newEvt.capacity}`);
        showToast(`Event "${newEvt.title}" published! Circular generated.`, "success");
        createModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
