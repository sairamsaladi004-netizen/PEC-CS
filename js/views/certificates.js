              </div>
              <!-- Right: Dean Signature & Dynamic QR Code -->
              <div class="flex flex-col items-center space-y-1">
                <div id="cert-qrcode-container" class="w-20 h-20 bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center"></div>
                <div class="font-mono text-[9px] text-slate-500 font-bold tracking-tight">${activeCert.id}</div>
                <div class="w-32 h-0.5 bg-slate-400 mt-1"></div>
                <div class="font-bold text-slate-800 text-[11px]">Dean of Student Affairs</div>
              </div>
            </div>
            <!-- Footer Cryptographic Proof -->
            <div class="pt-4 text-[9px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-100">
              <span>Security Hash: SHA-256:${activeCert.qrHash.substring(0, 24)}...</span>
              <span>Accreditation Ready • Verifiable via CampusTech Portal</span>
            </div>
          </div>
        </div>
      ` : `
        <div class="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-sm">
          No certificates available yet. Attend events and submit feedback to unlock accredited credentials!
        </div>
      `}
    </div>
  `;
}
export function attachCertificatesEvents(params = {}) {
  const db = getDB();
  const user = getCurrentUser();
  const selectedCertId = params.id;
  const myCertificates = db.certificates.filter(c => c.studentId === user.id);
  const activeCert = selectedCertId
    ? db.certificates.find(c => c.id === selectedCertId)
    : (myCertificates[0] || db.certificates[0]);
  if (activeCert && window.QRCode) {
    const qrContainer = document.getElementById("cert-qrcode-container");
    if (qrContainer) {
      qrContainer.innerHTML = "";
      const verificationUrl = `${window.location.origin}${window.location.pathname}#/verify?type=certificate&id=${activeCert.id}`;
      new QRCode(qrContainer, {
        text: verificationUrl,
        width: 72,
        height: 72,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }
}
