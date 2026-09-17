import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

export function renderEventsView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const canCreate = ["Club Admin", "Faculty Coordinator", "Department Admin", "Super Admin"].includes(user.role);

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hackathons & Technical Events</h1>
          <p class="text-xs sm:text-sm text-slate-500">Official technical competitions, bootcamps, and workshops with QR passes</p>
        </div>
        <div class="flex items-center space-x-3">
          <a href="#/attendance" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5">
            <span>📷 QR Check-in Kiosk</span>
          </a>
          ${canCreate ? `
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
          const isFull = evt.registeredCount >= evt.capacity;
          const userReg = evt.registrations?.find(r => r.studentId === user.id);

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
                  <div class="text-[11px] text-blue-600 font-extrabold uppercase tracking-wider">${club ? club.name : 'Central Council'}</div>
                  <h3 class="text-base font-bold text-slate-900 leading-snug">${evt.title}</h3>
                  <div class="text-xs text-slate-500 space-y-1 font-mono">
                    <div class="flex items-center space-x-1.5">
                      <span>📅</span> <span>${evt.date} (${evt.time})</span>
                    </div>
                    <div class="flex items-center space-x-1.5">
                      <span>📍</span> <span>${evt.venue}</span>
                    </div>
                  </div>
                  <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">${evt.description}</p>
                </div>
              </div>

              <div class="p-6 pt-0 space-y-2">
                ${isRegistered ? `
                  <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div>
                      <div class="font-bold text-emerald-800">✓ Registered & Confirmed</div>
                      <div class="text-[10px] text-emerald-600 font-mono">Pass: ${userReg?.ticketId}</div>
                    </div>
                    <button class="view-ticket-btn text-[11px] font-bold text-emerald-700 underline" data-ticket="${userReg?.ticketId}" data-title="${evt.title}" data-name="${user.name}" data-roll="${user.rollNo || '22CS101'}">
                      View Pass
                    </button>
                  </div>
                ` : `
                  <button data-eventid="${evt.id}" class="register-event-btn w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors ${isFull ? 'opacity-50 cursor-not-allowed' : ''}" ${isFull ? 'disabled' : ''}>
                    ${isFull ? 'Event Full (Waitlist)' : 'Register for Event'}
                  </button>
                `}
                <div class="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                  <a href="#/event-poster" class="hover:text-blue-600">Generate Poster →</a>
                  <span>Instant QR Pass</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Ticket QR Modal -->
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
          <div class="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-xl">
            Present this QR code at the registration desk for instant check-in.
          </div>
        </div>
      </div>

      <!-- Create Event Modal -->
      <div id="create-event-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Host New Technical Event</h3>
              <p class="text-xs text-slate-500">Publish to Central Council registry with automated QR attendance</p>
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
    btn.addEventListener("click", () => {
      const eventId = btn.dataset.eventid;
      const db = getDB();
      const user = getCurrentUser();
      const evt = db.events.find(e => e.id === eventId);
      if (evt && user) {
        if (!evt.registrations) evt.registrations = [];
        const already = evt.registrations.some(r => r.studentId === user.id);
        if (already) {
          showToast("You are already registered for this event!", "warning");
          return;
        }
        const ticketId = `TCK-${evt.category.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;
        evt.registrations.push({
          studentId: user.id,
          studentName: user.name,
          rollNo: user.rollNo || "22CS101",
          email: user.email,
          department: user.department || "CSE",
          ticketId,
          registeredAt: new Date().toISOString().split("T")[0],
          checkedIn: false
        });
        evt.registeredCount += 1;
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Event Registration", evt.title, `Ticket #${ticketId}`);
        showToast(`Registration confirmed! Pass #${ticketId} created.`, "success");
        window.location.reload();
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

  // Create Event Modal
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
        const db = getDB();
        const user = getCurrentUser();
        const newEvt = {
          id: "evt-" + (db.events.length + 101),
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
          registrations: []
        };
        db.events.push(newEvt);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Created Event", newEvt.title, `Capacity: ${newEvt.capacity}`);
        showToast(`Event "${newEvt.title}" published to Central Council registry!`, "success");
        createModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
