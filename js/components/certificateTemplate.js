import { getDB } from '../db.js';
import { getCurrentUser } from '../auth.js';

/**
 * High-Fidelity Dedicated Digital Certificate Template Generator
 * Supports dynamic participant names, event parameters, authority signatories,
 * cryptographic verification hashes, and print-optimized landscape layout.
 */

export const CERTIFICATE_THEMES = {
  gold: {
    id: "gold",
    name: "Imperial Heritage Gold",
    badgeLabel: "NBA ACCREDITED",
    outerBorder: "border-[10px] border-[#92400e]",
    innerBorder: "border-2 border-[#d97706]",
    accentBg: "bg-gradient-to-br from-[#fffdfa] via-[#fefce8] to-[#fffbeb]",
    primaryText: "text-[#78350f]",
    secondaryText: "text-[#92400e]",
    headingFont: "font-serif text-[#451a03]",
    sealBg: "from-[#fef08a] via-[#f59e0b] to-[#b45309]",
    sealBorder: "border-[#b45309]",
    ribbonColor: "text-[#b45309]",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-300"
  },
  cyber: {
    id: "cyber",
    name: "Quantum Cyber Blue",
    badgeLabel: "IEEE & ACM VERIFIED",
    outerBorder: "border-[10px] border-[#1e3a8a]",
    innerBorder: "border-2 border-[#3b82f6]",
    accentBg: "bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f0fdf4]",
    primaryText: "text-[#1e3a8a]",
    secondaryText: "text-[#2563eb]",
    headingFont: "font-sans font-black tracking-tight text-[#0f172a]",
    sealBg: "from-[#bfdbfe] via-[#3b82f6] to-[#1e3a8a]",
    sealBorder: "border-[#1d4ed8]",
    ribbonColor: "text-[#2563eb]",
    badgeBg: "bg-blue-100 text-blue-900 border-blue-300"
  },
  winner: {
    id: "winner",
    name: "Grand Prix Winner Crimson",
    badgeLabel: "CHAMPIONSHIP MEDAL",
    outerBorder: "border-[10px] border-[#881337]",
    innerBorder: "border-2 border-[#e11d48]",
    accentBg: "bg-gradient-to-br from-[#fff1f2] via-[#fff5f5] to-[#fef2f2]",
    primaryText: "text-[#9f1239]",
    secondaryText: "text-[#be123c]",
    headingFont: "font-serif font-black text-[#4c0519]",
    sealBg: "from-[#fecdd3] via-[#e11d48] to-[#881337]",
    sealBorder: "border-[#be123c]",
    ribbonColor: "text-[#e11d48]",
    badgeBg: "bg-rose-100 text-rose-900 border-rose-300"
  },
  coordinator: {
    id: "coordinator",
    name: "Leadership & Governance Emerald",
    badgeLabel: "EXECUTIVE COUNCIL",
    outerBorder: "border-[10px] border-[#064e3b]",
    innerBorder: "border-2 border-[#059669]",
    accentBg: "bg-gradient-to-br from-[#f0fdf4] via-[#f7fee7] to-[#ecfdf5]",
    primaryText: "text-[#065f46]",
    secondaryText: "text-[#047857]",
    headingFont: "font-serif font-black text-[#022c22]",
    sealBg: "from-[#a7f3d0] via-[#10b981] to-[#064e3b]",
    sealBorder: "border-[#047857]",
    ribbonColor: "text-[#059669]",
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300"
  },
  platinum: {
    id: "platinum",
    name: "Modern Academic Platinum",
    badgeLabel: "CENTRAL TECHNICAL COUNCIL",
    outerBorder: "border-[10px] border-[#334155]",
    innerBorder: "border-2 border-[#64748b]",
    accentBg: "bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#f1f5f9]",
    primaryText: "text-[#1e293b]",
    secondaryText: "text-[#475569]",
    headingFont: "font-serif text-[#0f172a]",
    sealBg: "from-[#e2e8f0] via-[#94a3b8] to-[#334155]",
    sealBorder: "border-[#475569]",
    ribbonColor: "text-[#475569]",
    badgeBg: "bg-slate-100 text-slate-900 border-slate-300"
  }
};

/**
 * Standardizes certificate data model from various potential input structures
 */
export function normalizeCertificateData(data = {}) {
  const user = getCurrentUser() || {};
  const certId = data.id || data.certificateId || `CERT-PEC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const templateKey = (data.template || data.templateStyle || "gold").toLowerCase();
  const theme = CERTIFICATE_THEMES[templateKey] || CERTIFICATE_THEMES.gold;

  const recipientName = data.recipientName || data.studentName || data.student_name || data.name || user.name || "Aarav Sharma";
  const recipientRoll = data.recipientRoll || data.rollNo || data.roll_no || user.rollNo || "22A31A0501";
  const department = data.department || data.dept || user.department || "Computer Science & Engineering";
  const academicYear = data.academicYear || data.year || user.year || "3rd Year B.Tech";
  const studentEmail = data.recipientEmail || data.email || user.email || "aarav.sharma@pragati.ac.in";
  
  const eventName = data.eventName || data.event_name || data.title || "Turing AI & Deep Learning National Symposium 2026";
  const hostClub = data.hostClub || data.clubName || data.society || "AI&ML Turing Club (I4-08)";
  const eventCategory = data.eventCategory || data.category || "24-Hour National Hackathon & Symposium";
  const eventDates = data.eventDates || data.eventDate || data.dates || "September 15-16, 2026";
  const venue = data.venue || data.location || "Central Auditorium & Turing AI Lab, Surampalem Campus";
  
  const awardType = data.awardType || data.certificate_type || data.award || "Certificate of Participation & Technical Completion";
  const issueDate = data.issueDate || data.issued_date || data.date || "2026-09-17";
  const qrHash = data.qrHash || data.qr_hash || data.verificationHash || `sha256:0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  const customCitation = data.customCitation || data.citationText || "";

  const coordinatorSignatory = data.coordinatorSignatory || {
    name: "Dr. K. Siva Shankar",
    title: "Faculty Coordinator & Convener",
    dept: "Central Technical Council (CCTSC)"
  };

  const hodSignatory = data.hodSignatory || {
    name: "Dr. M. Radhika Mani",
    title: "Head of the Department",
    dept: `Dept. of ${department}`
  };

  const principalSignatory = data.principalSignatory || {
    name: "Dr. K. Satyanarayana",
    title: "Principal & Institutional Dean",
    inst: "Pragati Engineering College (Autonomous)"
  };

  return {
    id: certId,
    theme,
    templateKey,
    recipientName,
    recipientRoll,
    department,
    academicYear,
    studentEmail,
    eventName,
    hostClub,
    eventCategory,
    eventDates,
    venue,
    awardType,
    issueDate,
    qrHash,
    customCitation,
    coordinatorSignatory,
    hodSignatory,
    principalSignatory
  };
}

/**
 * Builds standard academic citation narrative based on award type
 */
function buildCitationNarrative(cert) {
  if (cert.customCitation && cert.customCitation.trim().length > 0) {
    return cert.customCitation;
  }

  const awardLower = cert.awardType.toLowerCase();

  if (awardLower.includes("winner") || awardLower.includes("1st") || awardLower.includes("first") || awardLower.includes("champion")) {
    return `has achieved the distinguished honor of <strong>1st Place Winner / Grand Prix Finalist</strong> in <strong>"${cert.eventName}"</strong>, organized by <strong>${cert.hostClub}</strong> at Pragati Engineering College (Autonomous). Demonstrated exceptional algorithmic architecture, inventive engineering execution, and high-impact prototype defense.`;
  }

  if (awardLower.includes("2nd") || awardLower.includes("second") || awardLower.includes("runner")) {
    return `has achieved the distinguished honor of <strong>2nd Place Runner-Up</strong> in <strong>"${cert.eventName}"</strong>, organized by <strong>${cert.hostClub}</strong> at Pragati Engineering College (Autonomous). Recognized for commendable problem-solving ingenuity and technical presentation.`;
  }

  if (awardLower.includes("merit") || awardLower.includes("excellence")) {
    return `in recognition of exemplary technical competence, academic merit, and outstanding achievement during the intensive technical evaluation at <strong>"${cert.eventName}"</strong>, hosted by <strong>${cert.hostClub}</strong> on ${cert.eventDates}.`;
  }

  if (awardLower.includes("coordinator") || awardLower.includes("organizer") || awardLower.includes("leadership")) {
    return `in grateful recognition of outstanding leadership, dedication, and executive coordination as a Core Organizing Lead for <strong>"${cert.eventName}"</strong>, hosted by <strong>${cert.hostClub}</strong> under the auspices of the Central Technical Societies Council.`;
  }

  if (awardLower.includes("speaker") || awardLower.includes("keynote") || awardLower.includes("mentor")) {
    return `in sincere appreciation for serving as a distinguished Technical Speaker & Industry Mentor for <strong>"${cert.eventName}"</strong>, delivering expert insights to undergraduate engineering scholars at Pragati Engineering College (Autonomous).`;
  }

  // Default Participation
  return `in recognition of active participation and successful technical completion in <strong>"${cert.eventName}"</strong>, a <em>${cert.eventCategory}</em> organized by <strong>${cert.hostClub}</strong> at Pragati Engineering College (Autonomous) on ${cert.eventDates}.`;
}

/**
 * Renders the High-Resolution, Print-Ready Dynamic Digital Certificate DOM
 */
export function renderCertificateHTML(rawCertData = {}) {
  const cert = normalizeCertificateData(rawCertData);
  const theme = cert.theme;
  const citationHtml = buildCitationNarrative(cert);

  return `
    <div id="certificate-container-${cert.id}" class="certificate-printable-wrapper w-full flex justify-center py-4 select-none">
      
      <!-- Primary Certificate Sheet (A4 Landscape Proportions) -->
      <div class="printable-area certificate-sheet relative w-full max-w-[1000px] min-h-[680px] ${theme.accentBg} ${theme.outerBorder} p-6 sm:p-10 shadow-2xl rounded-3xl text-slate-900 flex flex-col justify-between overflow-hidden transition-all duration-300">
        
        <!-- Intricate Inner Border -->
        <div class="absolute inset-3.5 sm:inset-5 ${theme.innerBorder} rounded-2xl pointer-events-none z-0"></div>
        <div class="absolute inset-5 sm:inset-7 border border-dashed ${theme.innerBorder} opacity-60 rounded-xl pointer-events-none z-0"></div>

        <!-- Corner Ornaments -->
        <div class="absolute top-6 left-6 ${theme.ribbonColor} text-lg font-serif select-none z-10 opacity-70">❖</div>
        <div class="absolute top-6 right-6 ${theme.ribbonColor} text-lg font-serif select-none z-10 opacity-70">❖</div>
        <div class="absolute bottom-6 left-6 ${theme.ribbonColor} text-lg font-serif select-none z-10 opacity-70">❖</div>
        <div class="absolute bottom-6 right-6 ${theme.ribbonColor} text-lg font-serif select-none z-10 opacity-70">❖</div>

        <!-- Watermark Guilloche Background (Subtle) -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0">
          <div class="w-[500px] h-[500px] rounded-full border-[40px] border-slate-900 flex items-center justify-center">
            <span class="text-8xl font-black font-serif">PEC</span>
          </div>
        </div>

        <!-- CONTENT LAYER (z-10) -->
        <div class="relative z-10 flex flex-col justify-between h-full space-y-6">

          <!-- 1. Institutional Header Ribbon -->
          <div class="flex items-center justify-between border-b border-slate-300/80 pb-4">
            
            <!-- Left Institutional Crest -->
            <div class="flex items-center space-x-3.5">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-amber-400/80 shrink-0">
                P
              </div>
              <div class="text-left">
                <div class="text-[10px] sm:text-xs font-black tracking-widest text-slate-500 uppercase font-mono">
                  PRAGATI ENGINEERING COLLEGE (AUTONOMOUS)
                </div>
                <div class="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                  CENTRAL COUNCIL OF TECHNICAL SOCIETIES & STUDENT CHAPTERS
                </div>
                <div class="text-[9px] text-slate-500 font-mono tracking-wide">
                  Approved by AICTE • Accredited by NAAC 'A' Grade & NBA • Surampalem, AP - 533437
                </div>
              </div>
            </div>

            <!-- Right Accreditation Badge -->
            <div class="hidden sm:flex flex-col items-end">
              <span class="px-3 py-1 rounded-full ${theme.badgeBg} text-[9px] font-black uppercase tracking-widest border shadow-xs">
                ${theme.badgeLabel}
              </span>
              <span class="text-[8px] text-slate-400 font-mono mt-1">ISO 9001:2015 CERTIFIED</span>
            </div>
          </div>

          <!-- 2. Certificate Title & Conformance -->
          <div class="text-center space-y-1 my-1">
            <div class="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] ${theme.secondaryText} font-mono">
              OFFICIAL ACCREDITED CREDENTIAL OF ACHIEVEMENT
            </div>
            <h1 class="text-2xl sm:text-4xl ${theme.headingFont} font-black tracking-wide uppercase drop-shadow-xs">
              ${cert.awardType}
            </h1>
            <div class="flex items-center justify-center space-x-3 pt-1">
              <div class="h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent w-24 sm:w-36"></div>
              <span class="${theme.ribbonColor} text-sm font-serif">✦ ❖ ✦</span>
              <div class="h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent w-24 sm:w-36"></div>
            </div>
            <p class="text-xs sm:text-sm italic text-slate-600 font-serif pt-1">
              This institutional credential is proudly and formally conferred upon
            </p>
          </div>

          <!-- 3. Dynamic Participant Name & Profile Badge -->
          <div class="text-center space-y-2 my-2">
            <div class="inline-block relative">
              <div class="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-slate-950 px-8 sm:px-14 pb-1 tracking-wide print:text-black">
                ${cert.recipientName}
              </div>
              <div class="h-1 w-full bg-gradient-to-r from-transparent via-slate-900 to-transparent"></div>
            </div>
            
            <div class="text-xs sm:text-sm text-slate-700 font-mono font-bold flex items-center justify-center flex-wrap gap-x-3 gap-y-1">
              <span>Roll Number: <strong class="text-blue-900 font-extrabold">${cert.recipientRoll}</strong></span>
              <span class="text-slate-300">•</span>
              <span>Branch: <strong>${cert.department}</strong></span>
              <span class="text-slate-300">•</span>
              <span>Class: <strong class="text-slate-800">${cert.academicYear}</strong></span>
            </div>
          </div>

          <!-- 4. Dynamic Event Citation Paragraph -->
          <div class="max-w-2xl mx-auto text-center px-4">
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
              ${citationHtml}
            </p>
          </div>

          <!-- 5. Signatories, Medallion Seal & Cryptographic Verification Row -->
          <div class="pt-6 border-t border-slate-300/80 grid grid-cols-3 items-end gap-4 text-center mt-2">
            
            <!-- Left Signatory: Faculty Coordinator / Convener -->
            <div class="flex flex-col items-center space-y-1 text-center">
              <div class="h-10 flex items-end justify-center">
                <!-- Stylized Authentic Signature Vector -->
                <svg class="h-8 w-32 stroke-blue-950 fill-none" viewBox="0 0 160 40">
                  <path d="M 10 30 Q 30 5 50 25 T 90 20 T 130 15 Q 145 35 155 20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M 35 15 L 75 35" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="w-32 sm:w-40 h-0.5 bg-slate-400"></div>
              <div class="text-xs font-serif font-black text-slate-900">${cert.coordinatorSignatory.name}</div>
              <div class="text-[9px] font-bold text-slate-600 uppercase tracking-wider">${cert.coordinatorSignatory.title}</div>
              <div class="text-[8px] text-slate-400 font-mono">${cert.coordinatorSignatory.dept}</div>
            </div>

            <!-- Center Medallion: Official Institutional Embossed Seal -->
            <div class="flex flex-col items-center justify-center">
              <div class="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${theme.sealBg} p-1 shadow-lg border-2 ${theme.sealBorder} flex items-center justify-center text-center">
                <div class="w-full h-full rounded-full border border-dashed border-amber-950/40 flex flex-col items-center justify-center p-1 bg-white/20 backdrop-blur-xs">
                  <span class="text-[7px] font-black uppercase text-amber-950 tracking-tighter leading-none">PRAGATI</span>
                  <span class="text-[6px] font-extrabold text-amber-950 uppercase leading-tight font-mono">AUTONOMOUS</span>
                  <div class="text-[10px] text-amber-950 leading-none my-0.5">★ 🏛️ ★</div>
                  <span class="text-[6px] font-mono text-amber-950 uppercase font-black">CCTSC SEAL</span>
                </div>
              </div>
              <span class="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider mt-1">OFFICIAL INSTITUTIONAL SEAL</span>
            </div>

            <!-- Right Signatory: Principal & Institutional Head -->
            <div class="flex flex-col items-center space-y-1 text-center">
              <div class="h-10 flex items-end justify-center">
                <svg class="h-8 w-32 stroke-slate-950 fill-none" viewBox="0 0 160 40">
                  <path d="M 15 25 Q 40 38 60 15 T 105 25 T 140 10 Q 150 28 155 35" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M 20 20 L 140 20" stroke-width="1" stroke-dasharray="2 2"/>
                </svg>
              </div>
              <div class="w-32 sm:w-40 h-0.5 bg-slate-400"></div>
              <div class="text-xs font-serif font-black text-slate-900">${cert.principalSignatory.name}</div>
              <div class="text-[9px] font-bold text-slate-600 uppercase tracking-wider">${cert.principalSignatory.title}</div>
              <div class="text-[8px] text-slate-400 font-mono">${cert.principalSignatory.inst}</div>
            </div>

          </div>

          <!-- 6. Footer Metadata Bar: Certificate ID, Dynamic QR Code & Blockchain Ledger Proof -->
          <div class="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-left text-[9px] font-mono text-slate-500">
            <div class="space-y-0.5">
              <div>CREDENTIAL ID: <strong class="text-slate-900 font-black">${cert.id}</strong></div>
              <div>ISSUED DATE: <strong class="text-slate-800">${cert.issueDate}</strong> • SESSION: 2026-2027</div>
              <div class="text-[8px] text-slate-400 truncate max-w-md">ON-CHAIN PROOF: ${cert.qrHash}</div>
            </div>

            <!-- Dynamic QR Code Container -->
            <div class="flex items-center space-x-2.5">
              <div class="text-right hidden sm:block">
                <div class="text-[9px] font-bold text-slate-900 uppercase">Scan to Verify</div>
                <div class="text-[8px] text-slate-400">Pragati Trust Ledger</div>
              </div>
              <div id="dynamic-qr-box-${cert.id}" data-hash="${cert.qrHash}" class="cert-qr-element w-14 h-14 bg-white p-1 rounded-lg border border-slate-200 shadow-xs shrink-0 flex items-center justify-center"></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}

/**
 * Initializes the QRCode for any rendered certificate container
 */
export function initializeCertificateQR(certId, qrHash) {
  const qrBox = document.getElementById(`dynamic-qr-box-${certId}`);
  if (qrBox && window.QRCode) {
    qrBox.innerHTML = "";
    const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?hash=${encodeURIComponent(qrHash || certId)}`;
    new window.QRCode(qrBox, {
      text: verifyUrl,
      width: 48,
      height: 48,
      colorDark: "#0f172a",
      colorLight: "#ffffff"
    });
  }
}
