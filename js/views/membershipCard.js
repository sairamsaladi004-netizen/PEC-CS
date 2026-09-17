      <!-- Action Panel & Verification Info -->
      <div class="max-w-lg mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 class="text-sm font-bold text-slate-900">Card Features & Lab Privileges</h3>
        
        <ul class="space-y-2 text-slate-600">
          <li class="flex items-center space-x-2">
            <span class="text-emerald-500 font-bold">✓</span>
            <span>Automated RFID / QR gate access for Specialized Technology Labs 101-404.</span>
          </li>
          <li class="flex items-center space-x-2">
            <span class="text-emerald-500 font-bold">✓</span>
            <span>Direct verification proof for regional hackathon eligibility and student discounts.</span>
          </li>
          <li class="flex items-center space-x-2">
            <span class="text-emerald-500 font-bold">✓</span>
            <span>Microcontroller & drone telemetry sensor borrowing clearance at the hardware inventory.</span>
          </li>
        </ul>
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button id="request-renewal-btn" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
            Request Validity Extension
          </button>
          <span class="text-[11px] text-slate-400 font-mono">Status: Verified Official</span>
        </div>
      </div>
    </div>
  `;
}
export function attachMembershipCardEvents() {
  const user = getCurrentUser();
  const qrContainer = document.getElementById("membership-qrcode");
  if (qrContainer && window.QRCode) {
    qrContainer.innerHTML = "";
    const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?type=membership&id=${user.membershipId || user.id}`;
    new QRCode(qrContainer, {
      text: verifyUrl,
      width: 80,
      height: 80,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }
  const renewalBtn = document.getElementById("request-renewal-btn");
  if (renewalBtn) {
    renewalBtn.addEventListener("click", () => {
      showToast("Membership validity extension request submitted to Faculty Coordinator!", "success");
    });
  }
}
