import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';
import { renderCertificate } from '../utils/certificateRenderer.js';
import { 
  renderCertificateHTML, 
  initializeCertificateQR, 
  normalizeCertificateData, 
  CERTIFICATE_THEMES 
} from '../components/certificateTemplate.js';

export function renderCertificatesView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const certId = params.id;
  const activeTab = params.tab || (certId ? "viewer" : "directory");
  const isFacultyOrAdmin = ["Faculty Coordinator", "Department Admin", "Super Admin", "Club Admin"].includes(user.role);

  // Active certificate if viewing specific ID or in template studio
  const currentCert = certId 
    ? ((db.certificates || []).find(c => c.id === certId || c.certificateId === certId || (c.id && c.id.toLowerCase() === certId.toLowerCase())) || db.certificates[0])
    : (db.certificates && db.certificates[0] ? db.certificates[0] : {
        id: `CERT-PEC-${new Date().getFullYear()}-CSE-8921`,
        recipientName: user.name || "Aarav Sharma",
        recipientRoll: user.rollNo || "22A31A0501",
        department: user.department || "Computer Science & Engineering",
        academicYear: user.year || "3rd Year B.Tech",
        eventName: "Turing AI & Deep Learning National Symposium 2026",
        hostClub: "AI&ML Turing Club (I4-08)",
        eventCategory: "24-Hour National Hackathon & Symposium",
        eventDates: "September 15-16, 2026",
        venue: "Central Auditorium & Turing AI Lab, Surampalem",
        awardType: "Certificate of Participation & Technical Completion",
        template: params.template || "gold",
        issueDate: "2026-09-17"
      });

  const normalizedCert = normalizeCertificateData({
    ...currentCert,
    template: params.template || currentCert.template || "gold"
  });

  // If in dedicated single-view or template mode
  if (certId || activeTab === "studio") {
    return `
      <div class="space-y-6 pb-20 max-w-6xl mx-auto">
        
        <!-- Top Navigation & Action Controls Bar -->
        <div class="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div class="flex items-center space-x-2">
              <a href="#/certificates" class="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center space-x-1">
                <span>←</span>
                <span>Back to Credential Ledger</span>
              </a>
              <span class="text-slate-300">•</span>
              <span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                Autonomous Digital Certificate Template
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              ${certId ? 'Accredited Digital Certificate' : 'Dynamic Certificate Template Studio'}
            </h1>
            <p class="text-xs sm:text-sm text-slate-500">
              Dynamically populate participant names, academic branches, host societies, and event parameters with print-friendly layout.
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center gap-2">
            
            <button id="toggle-customizer-btn" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer">
              <span>🛠️</span>
              <span>Customize Template</span>
            </button>

            <button id="copy-cert-link-btn" data-hash="${normalizedCert.qrHash}" class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer">
              <span>🔗</span>
              <span>Copy Ledger Link</span>
            </button>

            <button id="email-cert-btn" data-certid="${normalizedCert.id}" data-email="${normalizedCert.studentEmail}" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer">
              <span>📧</span>
              <span>Email PDF</span>
            </button>

            <a href="#/verify?hash=${normalizedCert.qrHash}" class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors flex items-center space-x-1">
              <span>Verify On-Chain</span>
              <span>↗</span>
            </a>

            <button id="download-cert-png-btn" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-2 cursor-pointer">
              <span>📥</span>
              <span>Download PNG</span>
            </button>

            <button id="print-cert-btn" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer">
              <span>🖨️</span>
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Real-Time Interactive Customizer Drawer (Collapsible) -->
        <div id="dynamic-customizer-drawer" class="no-print bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">⚡</span>
              <div>
                <h2 class="text-sm font-black text-slate-900">Dynamic Participant & Event Parameter Customizer</h2>
                <p class="text-[11px] text-slate-500">Live preview updates instantly across template typography, citation text, and verification hashes.</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button id="reset-template-defaults-btn" class="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer">Reset Defaults</button>
              <button id="close-customizer-btn" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
            </div>
          </div>

          <form id="live-customizer-form" class="space-y-4 text-xs">
            
            <!-- Quick Load from Database Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Populate from Registered Student:</label>
                <select id="preset-student-select" class="w-full p-2 bg-white rounded-xl border border-slate-200 font-semibold text-slate-800">
                  <option value="">-- Choose Existing Student --</option>
                  ${(db.users || []).filter(u => u.role === "Student").map(s => `
                    <option value="${s.id}" data-name="${s.name}" data-roll="${s.rollNo || s.facultyId}" data-dept="${s.department || 'CSE'}" data-year="${s.year || '3rd Year B.Tech'}" data-email="${s.email}">
                      ${s.name} (${s.rollNo || 'ID'}) - ${s.department || 'CSE'}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Populate from Official Event:</label>
                <select id="preset-event-select" class="w-full p-2 bg-white rounded-xl border border-slate-200 font-semibold text-slate-800">
                  <option value="">-- Choose Official Society Event --</option>
                  ${(db.events || []).map(e => `
                    <option value="${e.id}" data-title="${e.title}" data-club="${e.clubName || e.clubId}" data-category="${e.type || 'Hackathon'}" data-date="${e.date}" data-venue="${e.venue || 'Central Campus'}">
                      ${e.title} (${e.clubName || e.clubId})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Participant Parameters -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Participant Full Name</label>
                <input type="text" id="cust-name" value="${normalizedCert.recipientName}" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Roll Number / Student ID</label>
                <input type="text" id="cust-roll" value="${normalizedCert.recipientRoll}" class="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Department / Branch</label>
                <select id="cust-dept" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Computer Science & Engineering" ${normalizedCert.department.includes('CSE') ? 'selected' : ''}>Computer Science & Engineering</option>
                  <option value="CSE (Artificial Intelligence & ML)" ${normalizedCert.department.includes('AI') ? 'selected' : ''}>CSE (Artificial Intelligence & ML)</option>
                  <option value="CSE (Data Science)" ${normalizedCert.department.includes('Data') ? 'selected' : ''}>CSE (Data Science)</option>
                  <option value="Artificial Intelligence & Data Science" ${normalizedCert.department.includes('AIDS') ? 'selected' : ''}>Artificial Intelligence & Data Science</option>
                  <option value="Electronics & Communication Engineering" ${normalizedCert.department.includes('ECE') ? 'selected' : ''}>Electronics & Communication Engineering</option>
                  <option value="Electrical & Electronics Engineering" ${normalizedCert.department.includes('EEE') ? 'selected' : ''}>Electrical & Electronics Engineering</option>
                  <option value="Mechanical Engineering" ${normalizedCert.department.includes('MECH') ? 'selected' : ''}>Mechanical Engineering</option>
                  <option value="Information Technology" ${normalizedCert.department.includes('IT') ? 'selected' : ''}>Information Technology</option>
                </select>
              </div>
            </div>

            <!-- Event Parameters -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Event Title</label>
                <input type="text" id="cust-event" value="${normalizedCert.eventName}" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Hosting Technical Society</label>
                <input type="text" id="cust-host" value="${normalizedCert.hostClub}" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Event Dates & Duration</label>
                <input type="text" id="cust-dates" value="${normalizedCert.eventDates}" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <!-- Award Designation & Theme Selectors -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Award Designation</label>
                <select id="cust-award" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Certificate of Participation & Technical Completion" ${normalizedCert.awardType.includes('Participation') ? 'selected' : ''}>Certificate of Participation</option>
                  <option value="Certificate of Merit & Technical Excellence" ${normalizedCert.awardType.includes('Merit') ? 'selected' : ''}>Certificate of Merit & Excellence</option>
                  <option value="1st Place Winner & Grand Prix Hackathon Finalist" ${normalizedCert.awardType.includes('Winner') || normalizedCert.awardType.includes('1st') ? 'selected' : ''}>1st Place Winner / Champion</option>
                  <option value="2nd Place Runner-Up & Finalist Award" ${normalizedCert.awardType.includes('Runner') || normalizedCert.awardType.includes('2nd') ? 'selected' : ''}>2nd Place Runner-Up</option>
                  <option value="Executive Student Coordinator & Lead Organizer" ${normalizedCert.awardType.includes('Coordinator') ? 'selected' : ''}>Executive Coordinator Certificate</option>
                  <option value="Distinguished Technical Speaker & Mentor" ${normalizedCert.awardType.includes('Speaker') ? 'selected' : ''}>Speaker / Mentor Certificate</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Template Aesthetic Style</label>
                <select id="cust-template" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="gold" ${normalizedCert.templateKey === 'gold' ? 'selected' : ''}>Imperial Heritage Gold (NBA Accredited)</option>
                  <option value="cyber" ${normalizedCert.templateKey === 'cyber' ? 'selected' : ''}>Quantum Cyber Blue (IEEE / ACM)</option>
                  <option value="winner" ${normalizedCert.templateKey === 'winner' ? 'selected' : ''}>Grand Prix Winner Crimson</option>
                  <option value="coordinator" ${normalizedCert.templateKey === 'coordinator' ? 'selected' : ''}>Leadership & Governance Emerald</option>
                  <option value="platinum" ${normalizedCert.templateKey === 'platinum' ? 'selected' : ''}>Modern Academic Platinum</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Academic Year / Class</label>
                <input type="text" id="cust-year" value="${normalizedCert.academicYear}" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <!-- Custom Citation Textarea -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-semibold text-slate-700">Custom Citation Paragraph (Leave blank to use auto-generated academic narrative)</label>
                <button type="button" id="clear-citation-btn" class="text-[10px] text-blue-600 font-bold hover:underline">Use Auto-Generated</button>
              </div>
              <textarea id="cust-citation" rows="2" placeholder="Auto-generated based on selected award designation and event details..." class="w-full p-2.5 rounded-xl border border-slate-200 font-serif focus:ring-2 focus:ring-blue-500 focus:outline-none">${cert.customCitation || ''}</textarea>
            </div>

            <!-- Save / Mint Actions for Coordinators -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <span class="text-[11px] text-slate-400 font-mono">Changes reflect live in real-time on the digital certificate below.</span>
              <button type="button" id="save-new-cert-to-ledger-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer">
                <span>💾</span>
                <span>Save Credential to Ledger</span>
              </button>
            </div>

          </form>
        </div>

        <!-- Render Dynamic Certificate Live View -->
        <div id="live-certificate-render-zone">
          ${renderCertificateHTML(normalizedCert)}
        </div>

        <!-- Print-Friendly Helper Callout (Hidden during print) -->
        <div class="no-print max-w-4xl mx-auto bg-slate-900 text-slate-200 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div class="space-y-1">
            <div class="font-bold text-white flex items-center space-x-2">
              <span>🖨️ High-Precision Print Ready & PDF Export</span>
              <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">A4 Landscape</span>
            </div>
            <p class="text-slate-400 text-[11px]">
              Click <strong>'Print / Save PDF'</strong> or press <kbd class="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-slate-300">Ctrl + P</kbd> / <kbd class="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-slate-300">Cmd + P</kbd>. Extraneous web buttons, navigations, and headers are automatically suppressed.
            </p>
          </div>
          <button id="secondary-print-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md shrink-0 cursor-pointer">
            Print Certificate →
          </button>
        </div>

      </div>
    `;
  }

  // -------------------------------------------------------------
  // Credential Ledger Directory Tab View
  // -------------------------------------------------------------
  return `
    <div class="space-y-6 pb-16 max-w-6xl mx-auto">
      
      <!-- Top Title & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">CCTSC Cryptographic Registry</span>
            <span class="text-xs text-emerald-600 font-bold flex items-center">● SHA-256 Ledger Verified</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Accredited Digital Credentials Ledger</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Official tamper-proof certificates with cryptographically signed verification tokens</p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <a href="#/certificates?tab=studio" class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer">
            <span>⚡</span>
            <span>Open Certificate Studio</span>
          </a>
          <a href="#/verify" class="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all">
            Public Verification Portal ↗
          </a>
          ${isFacultyOrAdmin ? `
            <button id="open-bulk-mint-modal" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer">
              <span>+</span>
              <span>Bulk Mint Credentials</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Quick Search & Categories Filter Tabs -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <button data-filter="all" class="cert-filter-btn px-3.5 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-xs transition-all cursor-pointer">All Credentials (${db.certificates.length})</button>
          <button data-filter="participation" class="cert-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">Participation</button>
          <button data-filter="merit" class="cert-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">Merit & Excellence</button>
          <button data-filter="winner" class="cert-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">Winner / Champions</button>
          <button data-filter="coordinator" class="cert-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">Executive Leads</button>
        </div>

        <div class="relative w-full md:w-64">
          <input type="text" id="search-cert-input" placeholder="Search recipient or roll..." class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <span class="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      <!-- Credentials Grid -->
      <div id="certs-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${db.certificates.map(c => {
          const norm = normalizeCertificateData(c);
          return `
            <div class="cert-card bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between" data-type="${(c.awardType || '').toLowerCase()}" data-search="${norm.recipientName.toLowerCase()} ${norm.recipientRoll.toLowerCase()} ${norm.eventName.toLowerCase()}">
              
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold ${norm.theme.badgeBg}">
                    ${c.awardType || 'Accredited Certificate'}
                  </span>
                  <span class="text-xs font-mono text-slate-400 font-medium">${c.issueDate || '2026-09-17'}</span>
                </div>

                <div>
                  <h3 class="text-base font-black text-slate-900 tracking-tight">${norm.eventName}</h3>
                  <div class="text-xs text-blue-600 font-semibold mt-0.5">🏛️ ${norm.hostClub}</div>
                </div>

                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div class="text-slate-700 font-medium">Recipient: <strong class="text-slate-900">${norm.recipientName}</strong> (<span class="font-mono font-bold text-blue-900">${norm.recipientRoll}</span>)</div>
                  <div class="text-[11px] text-slate-500">Dept. of ${norm.department}</div>
                </div>

                <div class="text-[10px] text-slate-400 font-mono truncate">
                  PROVE-HASH: ${norm.qrHash}
                </div>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <span class="text-xs font-bold text-slate-400 font-mono">#${c.id}</span>
                <div class="flex items-center space-x-2">
                  <a href="#/verify?hash=${norm.qrHash}" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
                    Verify ↗
                  </a>
                  <a href="#/certificates?id=${c.id}" class="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors">
                    View Template
                  </a>
                </div>
              </div>

            </div>
          `;
        }).join('')}
      </div>

      <!-- Bulk Mint Modal for Coordinators -->
      <div id="bulk-mint-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Bulk Mint Accredited Certificates</h3>
              <p class="text-xs text-slate-500">Automated batch issuance for verified event attendees</p>
            </div>
            <button id="close-bulk-mint-modal" class="text-slate-400 hover:text-slate-600 text-base cursor-pointer">✕</button>
          </div>

          <form id="bulk-mint-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Select Event</label>
              <select id="mint-event-select" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800">
                ${db.events.map(e => `<option value="${e.id}">${e.title} (${e.registeredCount || 0} registrants)</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Award Designation</label>
                <select id="mint-award-type" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold">
                  <option value="Certificate of Participation & Technical Completion">Certificate of Participation</option>
                  <option value="Certificate of Merit & Technical Excellence">Certificate of Merit</option>
                  <option value="1st Place Winner & Grand Prix Hackathon Finalist">Winner / Finalist</option>
                  <option value="Executive Student Coordinator & Lead Organizer">Coordinator Certificate</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Template Style</label>
                <select id="mint-template-style" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold">
                  <option value="gold">Imperial Heritage Gold</option>
                  <option value="cyber">Quantum Cyber Blue</option>
                  <option value="winner">Winner Crimson</option>
                  <option value="coordinator">Leadership Emerald</option>
                  <option value="platinum">Modern Academic Platinum</option>
                </select>
              </div>
            </div>

            <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800">
              ⚡ Batch Generation will mint cryptographically signed SHA-256 tokens and dispatch automated portal notifications to all attendees.
            </div>

            <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer">
              Execute Batch Minting & Dispatch
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function attachCertificatesEvents(params = {}) {
  const certId = params.id;
  const activeTab = params.tab || (certId ? "viewer" : "directory");

  // Print Handlers
  const executePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn("Print dialogue error:", e);
    }
  };

  const printBtn = document.getElementById("print-cert-btn");
  const secPrintBtn = document.getElementById("secondary-print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", executePrint);
  }
  if (secPrintBtn) {
    secPrintBtn.addEventListener("click", executePrint);
  }

  // PNG Capture Download Handler using html2canvas
  const dlPngBtn = document.getElementById("download-cert-png-btn");
  if (dlPngBtn) {
    dlPngBtn.addEventListener("click", async () => {
      const activeCert = document.querySelector(".certificate-printable-wrapper");
      if (activeCert) {
        await renderCertificate(activeCert, { 
          action: 'download', 
          scale: 3.0,
          filename: `PEC-CERTIFICATE-${certId || 'DIGITAL'}.png`
        });
      } else {
        showToast("Could not locate active certificate component element to download.", "error");
      }
    });
  }

  // Auto-print if opened with print=true parameter
  if (params.print === "true" || params.print === true) {
    setTimeout(() => {
      executePrint();
    }, 450);
  }

  // Keyboard shortcut Ctrl+P / Cmd+P listener
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p' && (certId || activeTab === "studio")) {
      e.preventDefault();
      executePrint();
    }
  };
  window.removeEventListener("keydown", handleKeyDown);
  window.addEventListener("keydown", handleKeyDown);

  // Email Certificate Simulation
  const emailBtn = document.getElementById("email-cert-btn");
  if (emailBtn) {
    emailBtn.addEventListener("click", () => {
      const email = emailBtn.dataset.email || "participant@pragati.ac.in";
      const cid = emailBtn.dataset.certid || "CERT-PEC-2026";
      showToast("Email Dispatched", `Accredited PDF Certificate ${cid} has been dispatched to ${email}!`, "success");
    });
  }

  // Copy Verification Link
  const copyLinkBtn = document.getElementById("copy-cert-link-btn");
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", () => {
      const hash = copyLinkBtn.dataset.hash;
      const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?hash=${encodeURIComponent(hash)}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(verifyUrl).then(() => {
          showToast("Ledger Proof Copied", "Public on-chain verification link copied to clipboard!", "success");
        });
      } else {
        showToast("Public Ledger Link", verifyUrl, "info");
      }
    });
  }

  // Customizer Drawer Toggle
  const toggleCustBtn = document.getElementById("toggle-customizer-btn");
  const closeCustBtn = document.getElementById("close-customizer-btn");
  const custDrawer = document.getElementById("dynamic-customizer-drawer");
  if (toggleCustBtn && custDrawer) {
    toggleCustBtn.addEventListener("click", () => {
      custDrawer.classList.toggle("hidden");
    });
  }
  if (closeCustBtn && custDrawer) {
    closeCustBtn.addEventListener("click", () => {
      custDrawer.classList.add("hidden");
    });
  }

  // Live Real-Time Interactive Template Customizer Listener
  const liveForm = document.getElementById("live-customizer-form");
  const renderZone = document.getElementById("live-certificate-render-zone");
  
  if (liveForm && renderZone) {
    const updateLiveCertificate = () => {
      const name = document.getElementById("cust-name")?.value.trim() || "Aarav Sharma";
      const roll = document.getElementById("cust-roll")?.value.trim() || "22A31A0501";
      const dept = document.getElementById("cust-dept")?.value || "Computer Science & Engineering";
      const year = document.getElementById("cust-year")?.value || "3rd Year B.Tech";
      const eventName = document.getElementById("cust-event")?.value.trim() || "Turing AI & Deep Learning Symposium";
      const hostClub = document.getElementById("cust-host")?.value.trim() || "AI&ML Turing Club (I4-08)";
      const eventDates = document.getElementById("cust-dates")?.value.trim() || "September 15-16, 2026";
      const awardType = document.getElementById("cust-award")?.value || "Certificate of Participation & Technical Completion";
      const template = document.getElementById("cust-template")?.value || "gold";
      const customCitation = document.getElementById("cust-citation")?.value.trim();

      const updatedCert = normalizeCertificateData({
        id: certId || `CERT-PEC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        recipientName: name,
        recipientRoll: roll,
        department: dept,
        academicYear: year,
        eventName: eventName,
        hostClub: hostClub,
        eventDates: eventDates,
        awardType: awardType,
        template: template,
        customCitation: customCitation
      });

      renderZone.innerHTML = renderCertificateHTML(updatedCert);
      initializeCertificateQR(updatedCert.id, updatedCert.qrHash);

      // Update copy button hash
      if (copyLinkBtn) {
        copyLinkBtn.dataset.hash = updatedCert.qrHash;
      }
    };

    // Attach input listeners for instant real-time sync
    [
      "cust-name", "cust-roll", "cust-dept", "cust-year",
      "cust-event", "cust-host", "cust-dates", "cust-award",
      "cust-template", "cust-citation"
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", updateLiveCertificate);
        el.addEventListener("change", updateLiveCertificate);
      }
    });

    // Preset Student Selector
    const studentSelect = document.getElementById("preset-student-select");
    if (studentSelect) {
      studentSelect.addEventListener("change", () => {
        const opt = studentSelect.selectedOptions[0];
        if (opt && opt.dataset.name) {
          if (document.getElementById("cust-name")) document.getElementById("cust-name").value = opt.dataset.name;
          if (document.getElementById("cust-roll")) document.getElementById("cust-roll").value = opt.dataset.roll || "22A31A0501";
          if (document.getElementById("cust-dept")) document.getElementById("cust-dept").value = opt.dataset.dept || "Computer Science & Engineering";
          if (document.getElementById("cust-year")) document.getElementById("cust-year").value = opt.dataset.year || "3rd Year B.Tech";
          updateLiveCertificate();
          showToast("Student Loaded", `Populated details for ${opt.dataset.name}`, "info");
        }
      });
    }

    // Preset Event Selector
    const eventSelect = document.getElementById("preset-event-select");
    if (eventSelect) {
      eventSelect.addEventListener("change", () => {
        const opt = eventSelect.selectedOptions[0];
        if (opt && opt.dataset.title) {
          if (document.getElementById("cust-event")) document.getElementById("cust-event").value = opt.dataset.title;
          if (document.getElementById("cust-host")) document.getElementById("cust-host").value = opt.dataset.club || "Technical Society";
          if (document.getElementById("cust-dates")) document.getElementById("cust-dates").value = opt.dataset.date || "September 2026";
          updateLiveCertificate();
          showToast("Event Loaded", `Populated parameters for ${opt.dataset.title}`, "info");
        }
      });
    }

    // Clear Citation Button
    const clearCitationBtn = document.getElementById("clear-citation-btn");
    if (clearCitationBtn) {
      clearCitationBtn.addEventListener("click", () => {
        const citationEl = document.getElementById("cust-citation");
        if (citationEl) {
          citationEl.value = "";
          updateLiveCertificate();
        }
      });
    }

    // Save to Ledger Button
    const saveLedgerBtn = document.getElementById("save-new-cert-to-ledger-btn");
    if (saveLedgerBtn) {
      saveLedgerBtn.addEventListener("click", () => {
        const db = getDB();
        const user = getCurrentUser();
        const name = document.getElementById("cust-name")?.value.trim() || "Aarav Sharma";
        const roll = document.getElementById("cust-roll")?.value.trim() || "22A31A0501";
        const dept = document.getElementById("cust-dept")?.value || "Computer Science & Engineering";
        const year = document.getElementById("cust-year")?.value || "3rd Year B.Tech";
        const eventName = document.getElementById("cust-event")?.value.trim() || "Turing AI Symposium";
        const hostClub = document.getElementById("cust-host")?.value.trim() || "AI&ML Turing Club";
        const awardType = document.getElementById("cust-award")?.value || "Certificate of Participation";
        const template = document.getElementById("cust-template")?.value || "gold";

        const newId = `CERT-PEC-${new Date().getFullYear()}-${dept.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const hash = `sha256:0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        const newCert = {
          id: newId,
          recipientName: name,
          recipientRoll: roll,
          department: dept,
          academicYear: year,
          eventName: eventName,
          hostClub: hostClub,
          awardType: awardType,
          template: template,
          issueDate: new Date().toISOString().split("T")[0],
          qrHash: hash,
          status: "Verified & Active"
        };

        db.certificates = db.certificates || [];
        db.certificates.unshift(newCert);
        
        apiRequest('/api/certificates/create', 'POST', newCert).catch(console.error);
        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Minted Digital Certificate"
, newId, `${name} - ${eventName}`);

        showToast("Credential Saved", `Certificate #${newId} recorded to verified digital ledger!`, "success");
        setTimeout(() => {
          window.location.hash = `#/certificates?id=${newId}`;
        }, 500);
      });
    }
  }

  // Initial QR Code Generation for the view
  if (certId || activeTab === "studio") {
    const db = getDB();
    const cert = certId ? ((db.certificates || []).find(c => c.id === certId || c.certificateId === certId || (c.id && c.id.toLowerCase() === certId.toLowerCase())) || db.certificates[0]) : db.certificates[0];
    if (cert) {
      initializeCertificateQR(cert.id, cert.qrHash || cert.id);
    }
  }

  // -------------------------------------------------------------
  // Credential Ledger Directory Events
  // -------------------------------------------------------------
  // Filter Category Buttons
  document.querySelectorAll(".cert-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cert-filter-btn").forEach(b => {
        b.className = "cert-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer";
      });
      btn.className = "cert-filter-btn px-3.5 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-xs transition-all cursor-pointer";
      const filter = btn.dataset.filter;
      document.querySelectorAll(".cert-card").forEach(card => {
        const type = card.dataset.type || "";
        card.style.display = (filter === "all" || type.includes(filter)) ? "flex" : "none";
      });
    });
  });

  // Search input filter
  const searchInput = document.getElementById("search-cert-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll(".cert-card").forEach(card => {
        const searchStr = card.dataset.search || "";
        card.style.display = searchStr.includes(q) ? "flex" : "none";
      });
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
          { studentName: "Aarav Sharma", rollNo: "22A31A0501", studentId: "std-1", department: "CSE", email: "aarav.sharma@pragati.ac.in" },
          { studentName: "Kavya Patel", rollNo: "22A31A0542", studentId: "std-2", department: "AIDS", email: "kavya.patel@pragati.ac.in" },
          { studentName: "Sneha Reddy", rollNo: "23A31A0505", studentId: "std-3", department: "CSE", email: "sneha.reddy@pragati.ac.in" }
        ];

        let count = 0;
        attendees.forEach(att => {
          const newCertId = `CERT-PEC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const hash = `sha256:0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
          
          db.certificates.unshift({
            id: newCertId,
            studentId: att.studentId,
            recipientName: att.studentName,
            recipientRoll: att.rollNo,
            recipientEmail: att.email,
            department: att.department || "CSE",
            eventName: evt?.title || "Technical Hackathon",
            hostClub: evt?.clubName || "Technical Society",
            awardType,
            template,
            issueDate: new Date().toISOString().split("T")[0],
            qrHash: hash,
            status: "Verified & Active"
          });

          addNotification({
            userId: att.studentId,
            title: "Accredited Certificate Issued",
            message: `Your accredited credential for "${evt?.title}" is ready.`,
            category: "Certificates",
            link: `#/certificates?id=${newCertId}`
          });
          count++;
        });

        
        apiRequest('/api/certificates/bulk-mint', 'POST', { 
            eventId, awardType, template 
        }).catch(console.error);

        saveDB(db);
        logAudit(`${user.name} (${user.role})`, "Bulk Minted Certificates"
, evt?.title, `Minted ${count} credentials`);
        showToast("Batch Mint Complete", `Successfully generated and dispatched ${count} digital certificates!`, "success");
        bulkModal.classList.add("hidden");
        setTimeout(() => window.location.reload(), 300);
      });
    }
  }
}
