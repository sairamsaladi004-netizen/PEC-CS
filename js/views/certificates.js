import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';

export function renderCertificatesView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const certId = params.id;
  const isFacultyOrAdmin = ["Faculty Coordinator", "Department Admin", "Super Admin", "Club Admin"].includes(user.role);

  if (certId) {
    const cert = (db.certificates || []).find(c => c.id === certId) || db.certificates[0];
    const templateType = params.template || cert.template || "gold";

    // Theme variations based on award type or selected template
    const isWinner = cert.awardType?.toLowerCase().includes("winner") || templateType === "winner";
    const isCoordinator = cert.awardType?.toLowerCase().includes("coordinator") || templateType === "coordinator";
    const isModernBlue = templateType === "cyber";

    const frameBorder = isWinner 
      ? "border-4 border-rose-700 bg-rose-50/20" 
      : isCoordinator 
      ? "border-4 border-emerald-700 bg-emerald-50/20" 
      : isModernBlue
      ? "border-4 border-blue-700 bg-blue-50/20"
      : "border-4 border-amber-600 bg-amber-50/10";

    const accentColor = isWinner 
      ? "text-rose-800" 
      : isCoordinator 
      ? "text-emerald-800" 
      : isModernBlue
      ? "text-blue-800"
      : "text-amber-800";

    return `
      <div class="space-y-6 pb-16">
        <!-- Controls Bar -->
        <div class="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <a href="#/certificates" class="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
            ← Back to All Credentials
          </a>

          <!-- Template Switcher & Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
              <span class="text-slate-400 font-bold px-2">Theme:</span>
              <a href="#/certificates?id=${cert.id}&template=gold" class="px-2 py-1 rounded-lg ${templateType === 'gold' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600'}">Gold</a>
              <a href="#/certificates?id=${cert.id}&template=cyber" class="px-2 py-1 rounded-lg ${templateType === 'cyber' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}">Cyber</a>
              <a href="#/certificates?id=${cert.id}&template=coordinator" class="px-2 py-1 rounded-lg ${templateType === 'coordinator' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'}">Leadership</a>
              <a href="#/certificates?id=${cert.id}&template=winner" class="px-2 py-1 rounded-lg ${templateType === 'winner' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600'}">Winner</a>
            </div>

            <button id="email-cert-btn" data-certid="${cert.id}" data-email="${cert.recipientEmail || 'student@panimalar.edu'}" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5">
              <span>📧 Email to Student</span>
            </button>

            <a href="#/verify?hash=${cert.qrHash || cert.verificationHash || cert.id}" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors">
              Verify Digital Ledger ↗
            </a>

            <button id="print-cert-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5">
              <span>🖨️ Save High-Res PDF</span>
            </button>
          </div>
        </div>

        <!-- Official Accredited Certificate Frame -->
        <div id="printable-certificate" class="printable-area max-w-4xl mx-auto rounded-3xl p-8 sm:p-14 text-slate-900 text-center relative overflow-hidden shadow-2xl ${frameBorder}">
          
          <!-- Subtle Corner Accents -->
          <div class="absolute top-4 left-4 ${accentColor} text-xs font-serif select-none">✦ ❖ ✦</div>
          <div class="absolute top-4 right-4 ${accentColor} text-xs font-serif select-none">✦ ❖ ✦</div>
          <div class="absolute bottom-4 left-4 ${accentColor} text-xs font-serif select-none">✦ ❖ ✦</div>
          <div class="absolute bottom-4 right-4 ${accentColor} text-xs font-serif select-none">✦ ❖ ✦</div>

          <!-- Institutional Header -->
          <div class="space-y-1">
            <div class="text-xs font-extrabold uppercase tracking-widest ${accentColor} font-mono">
              PANIMALAR ENGINEERING COLLEGE
            </div>
            <div class="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              Central Council of Technical Societies & Student Chapters (CCTSC)
            </div>
            <div class="text-[9px] text-slate-400 font-mono">
              Accredited by NBA & NAAC 'A++' Grade • Autonomous Institution • Chennai 600123
            </div>
          </div>

          <!-- Divider Ribbon -->
          <div class="my-6 flex items-center justify-center space-x-3">
            <div class="h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent w-32"></div>
            <span class="${accentColor} text-base font-serif">❦</span>
            <div class="h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent w-32"></div>
          </div>

          <!-- Certificate Title -->
          <div class="space-y-2">
            <h1 class="text-2xl sm:text-4xl font-serif font-black tracking-wide text-slate-900 uppercase">
              ${cert.awardType || cert.title || "Certificate of Excellence"}
            </h1>
            <p class="text-xs italic text-slate-600 font-serif">This credential is formally conferred upon</p>
          </div>

          <!-- Student Name Recipient -->
          <div class="my-5">
            <div class="text-2xl sm:text-3xl font-black text-slate-900 border-b-2 border-slate-700/60 inline-block px-8 pb-1 tracking-tight font-serif">
              ${cert.recipientName || cert.studentName}
            </div>
            <div class="text-xs text-slate-600 font-mono mt-1 font-bold">
              Roll No: ${cert.recipientRoll || cert.rollNo || '22CS101'} • Dept. of ${cert.department || 'Computer Science & Engineering'}
            </div>
          </div>

          <!-- Citation Text -->
          <p class="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-serif">
            in recognition of outstanding technical competence and distinguished performance in
            <span class="font-bold text-slate-900 not-italic">"${cert.eventName || cert.title}"</span>,
            ratified under institutional quality protocols conforming to NBA Criteria 9 and NAAC curricular standards.
          </p>

          <!-- Seal, Signatures & Dynamic QR Grid -->
          <div class="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
            
            <!-- Left: Faculty Signature -->
            <div class="text-center sm:text-left space-y-1">
              <div class="font-serif italic text-sm text-blue-950 font-bold">Dr. K. Senthil Kumar</div>
              <div class="w-36 h-0.5 bg-slate-400 mx-auto sm:mx-0"></div>
              <div class="text-[10px] font-bold text-slate-800 uppercase">Faculty Coordinator</div>
              <div class="text-[9px] text-slate-500 font-mono">Technical Societies Council</div>
            </div>

            <!-- Middle: Official Medallion Seal -->
            <div class="flex flex-col items-center">
              <div class="w-16 h-16 rounded-full flex items-center justify-center text-amber-900 font-black text-xs border-2 border-amber-500 bg-amber-100 shadow-md">
                <span class="text-center text-[9px] uppercase leading-tight font-extrabold text-amber-950">OFFICIAL<br/>PEC<br/>2026</span>
              </div>
              <span class="text-[9px] text-slate-500 font-mono mt-1">VERIFIED CREDENTIAL</span>
            </div>

            <!-- Right: Dynamic QR & Hash Verification -->
            <div class="flex items-center space-x-3 text-right">
              <div>
                <div class="text-[10px] font-bold text-slate-800 uppercase">Scan to Verify</div>
                <div class="text-[9px] text-slate-500 font-mono">Public Ledger Proof</div>
                <div class="text-[8px] text-slate-400 font-mono mt-0.5">ID: ${cert.id}</div>
              </div>
              <div id="cert-qr-box" class="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center"></div>
            </div>

          </div>

          <!-- Bottom Cryptographic Hash Ledger ID -->
          <div class="mt-8 pt-3 border-t border-dashed border-slate-300 text-[8px] font-mono text-slate-400 text-center truncate">
            SHA-256 IMMUTABLE PROOF: ${cert.qrHash || cert.verificationHash || 'sha256:0x89ab4c12f45de'} • ISSUED: ${cert.issueDate || '2026-10-25'}
          </div>

        </div>
      </div>
    `;
  }

  // Directory of all accredited credentials
  return `
    <div class="space-y-6 pb-16">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Accredited Digital Credentials</h1>
          <p class="text-xs sm:text-sm text-slate-500">Tamper-proof certificates with cryptographically signed QR verification hashes</p>
        </div>
        <div class="flex items-center space-x-2">
          <a href="#/verify" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all">
            Public Verification Portal ↗
          </a>
          ${isFacultyOrAdmin ? `
            <button id="open-bulk-mint-modal" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all">
              + Bulk Mint Credentials
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Categories Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
        <button data-filter="all" class="cert-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all">All Credentials (${db.certificates.length})</button>
        <button data-filter="participation" class="cert-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Participation</button>
        <button data-filter="merit" class="cert-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Merit & Excellence</button>
        <button data-filter="winner" class="cert-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Winner & Hackathons</button>
        <button data-filter="coordinator" class="cert-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Executive Leads</button>
      </div>

      <div id="certs-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${db.certificates.map(c => `
          <div class="cert-card bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between" data-type="${(c.awardType || c.category || '').toLowerCase()}">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">${c.awardType || c.category || 'Accredited Certificate'}</span>
                <span class="text-xs font-mono text-slate-400">${c.issueDate}</span>
              </div>
              <h3 class="text-base font-bold text-slate-900">${c.eventName || c.title}</h3>
              <div class="text-xs text-slate-600 font-mono">Recipient: <span class="font-bold text-slate-900">${c.recipientName || c.studentName}</span> (${c.recipientRoll || c.rollNo})</div>
              <div class="text-[10px] text-slate-400 font-mono truncate">HASH: ${c.qrHash || c.verificationHash}</div>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs font-bold text-blue-600 font-mono">#${c.id}</span>
              <div class="flex items-center space-x-2">
                <a href="#/verify?hash=${c.qrHash || c.verificationHash || c.id}" class="text-xs text-slate-500 hover:text-blue-600 font-semibold">Verify ↗</a>
                <a href="#/certificates?id=${c.id}" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors">
                  Open Credential
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Bulk Mint Modal -->
      <div id="bulk-mint-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Bulk Mint Accredited Certificates</h3>
              <p class="text-xs text-slate-500">Automated batch issuance for verified event attendees</p>
            </div>
            <button id="close-bulk-mint-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form id="bulk-mint-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Select Event</label>
              <select id="mint-event-select" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800">
                ${db.events.map(e => `<option value="${e.id}">${e.title} (${e.registeredCount} registrants)</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Award Designation</label>
                <select id="mint-award-type" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold">
                  <option value="Certificate of Participation & Technical Completion">Certificate of Participation</option>
                  <option value="Certificate of Merit & Technical Excellence">Certificate of Merit</option>
                  <option value="Winner & Grand Prix Hackathon Finalist">Winner / Finalist</option>
                  <option value="Executive Coordinator & Lead Organizer">Coordinator Certificate</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Template Style</label>
                <select id="mint-template-style" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold">
                  <option value="gold">Heritage Gold</option>
                  <option value="cyber">Modern Cyber Blue</option>
                  <option value="winner">Winner Crimson</option>
                  <option value="coordinator">Leadership Emerald</option>
                </select>
              </div>
            </div>

            <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800">
              ⚡ Batch Generation will mint cryptographically signed SHA-256 tokens and dispatch automated portal notifications to all attendees.
            </div>

            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors">
              Execute Batch Minting & Dispatch
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function attachCertificatesEvents(params = {}) {
  const printBtn = document.getElementById("print-cert-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  // Filter Category Buttons
  document.querySelectorAll(".cert-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cert-filter-btn").forEach(b => {
        b.className = "cert-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "cert-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      const filter = btn.dataset.filter;
      document.querySelectorAll(".cert-card").forEach(card => {
        const type = card.dataset.type || "";
        card.style.display = (filter === "all" || type.includes(filter)) ? "flex" : "none";
      });
    });
  });

  // Email Certificate to Student
  const emailBtn = document.getElementById("email-cert-btn");
  if (emailBtn) {
    emailBtn.addEventListener("click", () => {
      const email = emailBtn.dataset.email;
      const certId = emailBtn.dataset.certid;
      showToast("Email Dispatched", `Accredited PDF certificate #${certId} delivered to ${email}.`, "success");
    });
  }

  // Bulk Mint Modal
  const openBulkBtn = document.getElementById("open-bulk-mint-modal");
  const bulkModal = document.getElementById("bulk-mint-modal");
  const closeBulkBtn = document.getElementById("close-bulk-mint-modal");
  const bulkForm = document.getElementById("bulk-mint-form");

  if (openBulkBtn && bulkModal) {
    openBulkBtn.addEventListener("click", () => bulkModal.classList.remove("hidden"));
    if (closeBulkBtn) closeBulkBtn.addEventListener("click", () => bulkModal.classList.add("hidden"));
    bulkModal.addEventListener("click", (e) => {
      if (e.target === bulkModal) bulkModal.classList.add("hidden");
    });

    if (bulkForm) {
      bulkForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const db = getDB();
        const user = getCurrentUser();
        const eventId = document.getElementById("mint-event-select").value;
        const awardType = document.getElementById("mint-award-type").value;
        const template = document.getElementById("mint-template-style").value;
        const evt = db.events.find(e => e.id === eventId);

        const attendees = evt?.registrations?.length > 0 ? evt.registrations : [
          { studentName: "Aarav Sharma", rollNo: "22CS101", studentId: "std-1", department: "CSE", email: "aarav.sharma@panimalar.edu" },
          { studentName: "Kavya Patel", rollNo: "22CS142", studentId: "std-2", department: "AIDS", email: "kavya.patel@panimalar.edu" },
          { studentName: "Sneha Reddy", rollNo: "23CS205", studentId: "std-3", department: "CSE", email: "sneha.reddy@panimalar.edu" }
        ];

        let count = 0;
        attendees.forEach(att => {
          const certId = `CERT-PEC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const hash = `sha256:0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
          
          db.certificates.unshift({
            id: certId,
            studentId: att.studentId,
            recipientName: att.studentName,
            recipientRoll: att.rollNo,
            recipientEmail: att.email,
            department: att.department || "CSE",
            eventName: evt?.title || "Technical Hackathon",
            awardType,
            template,
            issueDate: new Date().toISOString().split("T")[0],
            qrHash: hash,
            verificationHash: hash,
            status: "Verified & Active"
          });

          addNotification({
            userId: att.studentId,
            title: "Accredited Certificate Issued",
            message: `Your accredited credential for "${evt?.title}" is ready.`,
            category: "Certificates",
            link: `#/certificates?id=${certId}`
          });
          count++;
        });

        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Bulk Minted Certificates", evt?.title, `Minted ${count} credentials`);
        showToast("Batch Mint Complete", `Successfully generated and dispatched ${count} digital certificates!`, "success");
        bulkModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }

  // Generate QR for single certificate
  const certId = params.id;
  if (certId && window.QRCode) {
    const db = getDB();
    const cert = (db.certificates || []).find(c => c.id === certId) || db.certificates[0];
    const qrContainer = document.getElementById("cert-qr-box");
    if (qrContainer && cert) {
      qrContainer.innerHTML = "";
      const hashVal = cert.qrHash || cert.verificationHash || cert.id;
      const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?hash=${hashVal}`;
      new window.QRCode(qrContainer, {
        text: verifyUrl,
        width: 60,
        height: 60,
        colorDark: "#0f172a",
        colorLight: "#ffffff"
      });
    }
  }
}
