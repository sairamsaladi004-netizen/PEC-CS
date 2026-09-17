import { getDB } from '../db.js';
import { getCurrentUser } from '../auth.js';

export function renderCertificatesView(params = {}) {
  const db = getDB();
  const user = getCurrentUser() || {};
  const certId = params.id;

  if (certId) {
    const cert = db.certificates.find(c => c.id === certId) || db.certificates[0];

    return `
      <div class="space-y-6 pb-16">
        <!-- Controls Bar -->
        <div class="no-print flex items-center justify-between">
          <a href="#/certificates" class="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
            ← Back to All Credentials
          </a>
          <div class="flex items-center space-x-3">
            <a href="#/verify?hash=${cert.qrHash}" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors">
              Verify Digital Ledger
            </a>
            <button id="print-cert-btn" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5">
              <span>🖨️ Print / Save PDF</span>
            </button>
          </div>
        </div>

        <!-- Official Accredited Certificate Frame -->
        <div class="printable-area max-w-4xl mx-auto cert-frame rounded-2xl p-8 sm:p-14 bg-amber-50/10 text-slate-900 text-center relative overflow-hidden shadow-2xl">
          
          <!-- Subtle Corner Accents -->
          <div class="absolute top-4 left-4 text-amber-700 text-xs font-serif select-none">✦ ❖ ✦</div>
          <div class="absolute top-4 right-4 text-amber-700 text-xs font-serif select-none">✦ ❖ ✦</div>
          <div class="absolute bottom-4 left-4 text-amber-700 text-xs font-serif select-none">✦ ❖ ✦</div>
          <div class="absolute bottom-4 right-4 text-amber-700 text-xs font-serif select-none">✦ ❖ ✦</div>

          <!-- Institutional Header -->
          <div class="space-y-1">
            <div class="text-xs font-extrabold uppercase tracking-widest text-amber-800 font-mono">
              PANIMALAR ENGINEERING COLLEGE
            </div>
            <div class="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              Central Council of Technical Societies & Student Chapters (CCTSC)
            </div>
            <div class="text-[9px] text-slate-400 font-mono">
              Accredited by NBA & NAAC 'A++' Grade • Institution Innovation Council
            </div>
          </div>

          <!-- Divider Ribbon -->
          <div class="my-6 flex items-center justify-center space-x-3">
            <div class="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-32"></div>
            <span class="text-amber-800 text-base font-serif">❦</span>
            <div class="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-32"></div>
          </div>

          <!-- Certificate Title -->
          <div class="space-y-2">
            <h1 class="text-2xl sm:text-4xl font-serif font-black tracking-wide text-slate-900 uppercase">
              ${cert.awardType || "Certificate of Excellence"}
            </h1>
            <p class="text-xs italic text-slate-600 font-serif">This credential certifies that</p>
          </div>

          <!-- Student Name Recipient -->
          <div class="my-5">
            <div class="text-2xl sm:text-3xl font-black text-blue-900 border-b-2 border-amber-700/60 inline-block px-8 pb-1 tracking-tight font-serif">
              ${cert.studentName}
            </div>
            <div class="text-xs text-slate-600 font-mono mt-1 font-bold">
              Roll No: ${cert.rollNo} • Dept. of ${cert.department || 'Computer Science & Engineering'}
            </div>
          </div>

          <!-- Citation Text -->
          <p class="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-serif">
            has successfully demonstrated superior technical aptitude and active participation in
            <span class="font-bold text-slate-900 not-italic">"${cert.eventName}"</span>,
            conforming to rigorous institutional standards for accredited co-curricular technology credit.
          </p>

          <!-- Seal, Signatures & Dynamic QR Grid -->
          <div class="mt-12 pt-6 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
            
            <!-- Left: Digital Signature 1 -->
            <div class="text-center sm:text-left space-y-1">
              <div class="font-serif italic text-sm text-blue-950 font-bold">M. S. Swaminathan</div>
              <div class="w-36 h-0.5 bg-slate-300 mx-auto sm:mx-0"></div>
              <div class="text-[10px] font-bold text-slate-800 uppercase">Dr. M. S. Swaminathan</div>
              <div class="text-[9px] text-slate-500 font-mono">President, Central Technical Council</div>
            </div>

            <!-- Middle: Golden Medallion Seal -->
            <div class="flex flex-col items-center">
              <div class="w-16 h-16 rounded-full cert-seal flex items-center justify-center text-amber-900 font-black text-xs border-2 border-amber-400/80 shadow-md">
                <span class="text-center text-[9px] uppercase leading-tight font-extrabold text-amber-950">OFFICIAL<br/>SEAL<br/>2026</span>
              </div>
              <span class="text-[9px] text-amber-900 font-mono mt-1">VERIFIED LEDGER</span>
            </div>

            <!-- Right: Dynamic QR & Hash Verification -->
            <div class="flex items-center space-x-3 text-right">
              <div>
                <div class="text-[10px] font-bold text-slate-800 uppercase">Tamper-Proof QR Proof</div>
                <div class="text-[9px] text-slate-500 font-mono">Scan for Instant Verification</div>
                <div class="text-[8px] text-slate-400 font-mono mt-0.5">ID: ${cert.id}</div>
              </div>
              <div id="cert-qr-box" class="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 shadow-sm"></div>
            </div>

          </div>

          <!-- Bottom Cryptographic Hash Ledger ID -->
          <div class="mt-8 pt-3 border-t border-dashed border-amber-200/60 text-[8px] font-mono text-slate-400 text-center truncate">
            SHA-256 IMMUTABLE PROOF: ${cert.qrHash} • ISSUED: ${cert.issueDate}
          </div>

        </div>
      </div>
    `;
  }

  // List of all certificates
  return `
    <div class="space-y-6 pb-16">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Accredited Digital Credentials</h1>
          <p class="text-xs sm:text-sm text-slate-500">Tamper-proof certificates with cryptographically signed QR verification hashes</p>
        </div>
        <a href="#/verify" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all">
          Verify External Certificate →
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${db.certificates.map(c => `
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">${c.awardType}</span>
                <span class="text-xs font-mono text-slate-400">${c.issueDate}</span>
              </div>
              <h3 class="text-base font-bold text-slate-900">${c.eventName}</h3>
              <div class="text-xs text-slate-600 font-mono">Issued to: <span class="font-bold text-slate-900">${c.studentName}</span> (${c.rollNo})</div>
              <div class="text-[10px] text-slate-400 font-mono truncate">HASH: ${c.qrHash}</div>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs font-bold text-blue-600 font-mono">#${c.id}</span>
              <a href="#/certificates?id=${c.id}" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors">
                View & Print Certificate
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function attachCertificatesEvents(params = {}) {
  const printBtn = document.getElementById("print-cert-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  const certId = params.id;
  if (certId && window.QRCode) {
    const db = getDB();
    const cert = db.certificates.find(c => c.id === certId) || db.certificates[0];
    const qrContainer = document.getElementById("cert-qr-box");
    if (qrContainer && cert) {
      qrContainer.innerHTML = "";
      const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?hash=${cert.qrHash}`;
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
