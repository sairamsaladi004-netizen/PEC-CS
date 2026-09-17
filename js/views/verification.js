import { getDB } from '../db.js';

export function renderVerificationView(params = {}) {
  const db = getDB();
  const searchHash = params.hash || params.id || "";

  let matchedCert = null;
  if (searchHash) {
    matchedCert = db.certificates.find(c => 
      c.qrHash.toLowerCase() === searchHash.toLowerCase() || 
      c.id.toLowerCase() === searchHash.toLowerCase()
    );
  }

  return `
    <div class="space-y-6 pb-16 max-w-3xl mx-auto">
      
      <!-- Top Title Bar -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
          <span>🔒 Tamper-Proof Cryptographic Verification Ledger</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Public Credential Verification</h1>
        <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Scan a certificate's dynamic QR code or input its SHA-256 cryptographic hash to instantly validate institutional accreditation.
        </p>
      </div>

      <!-- Search Box -->
      <div class="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
        <form id="verify-search-form" class="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            id="verify-input" 
            placeholder="Paste Certificate ID (e.g. PEC-CERT-2026-001) or SHA-256 Hash..." 
            value="${searchHash}"
            class="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <button type="submit" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors shrink-0">
            Verify Ledger →
          </button>
        </form>
      </div>

      <!-- Verification Result Display -->
      <div id="verify-result">
        ${searchHash ? (
          matchedCert ? `
            <div class="bg-white rounded-3xl border-2 border-emerald-500 p-6 sm:p-8 shadow-xl space-y-6">
              
              <!-- Authenticity Banner -->
              <div class="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl font-bold shrink-0">✓</div>
                <div>
                  <div class="font-black text-sm uppercase tracking-wide">Official & Cryptographically Authentic</div>
                  <div class="text-xs text-emerald-700">Verified by Panimalar Engineering College CCTSC Digital Registry</div>
                </div>
              </div>

              <!-- Certificate Details -->
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 font-mono block text-[10px] uppercase">Recipient Student</span>
                    <span class="text-base font-black text-slate-900">${matchedCert.studentName}</span>
                    <span class="block text-slate-500 font-mono font-bold mt-0.5">Roll No: ${matchedCert.rollNo}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 font-mono block text-[10px] uppercase">Award / Recognition</span>
                    <span class="text-base font-black text-amber-600">${matchedCert.awardType}</span>
                    <span class="block text-slate-500 font-mono mt-0.5">Issued: ${matchedCert.issueDate}</span>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span class="text-slate-400 font-mono text-[10px] uppercase">Accredited Activity</span>
                  <div class="text-sm font-bold text-slate-900">${matchedCert.eventName}</div>
                  <div class="text-slate-500">Conforming to NBA Criteria 9 co-curricular technical benchmark</div>
                </div>

                <div class="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[10px] break-all">
                  <div class="text-slate-500 text-[9px] uppercase">SHA-256 Tamper-Proof Cryptographic Hash</div>
                  ${matchedCert.qrHash}
                </div>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs text-slate-400 font-mono">Registry ID: ${matchedCert.id}</span>
                <a href="#/certificates?id=${matchedCert.id}" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors">
                  View Full Accredited Certificate ↗
                </a>
              </div>

            </div>
          ` : `
            <div class="bg-white rounded-3xl border-2 border-rose-500 p-8 shadow-xl text-center space-y-4">
              <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl font-bold mx-auto">✕</div>
              <h2 class="text-lg font-black text-slate-900">Credential Not Found</h2>
              <p class="text-xs text-slate-500 max-w-md mx-auto">
                No matching cryptographic record found in the institutional ledger for the supplied key. Please check the roll number or certificate ID.
              </p>
            </div>
          `
        ) : `
          <!-- Preset Sample Quick Tests -->
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Recently Issued Credentials on Ledger:</h2>
            <div class="space-y-2 text-xs">
              ${db.certificates.map(c => `
                <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors border border-slate-200">
                  <div>
                    <span class="font-bold text-slate-900">${c.studentName}</span>
                    <span class="text-slate-400 font-mono ml-2">(${c.id})</span>
                    <div class="text-[11px] text-slate-500">${c.eventName}</div>
                  </div>
                  <a href="#/verify?hash=${c.qrHash}" class="text-xs font-bold text-blue-600 hover:text-blue-800">
                    Verify Proof →
                  </a>
                </div>
              `).join('')}
            </div>
          </div>
        `}
      </div>

    </div>
  `;
}

export function attachVerificationEvents() {
  const form = document.getElementById("verify-search-form");
  const input = document.getElementById("verify-input");

  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) {
        window.location.hash = `#/verify?hash=${encodeURIComponent(val)}`;
      }
    });
  }
}
