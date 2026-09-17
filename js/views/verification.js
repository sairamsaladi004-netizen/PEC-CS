                  <span class="text-slate-400 text-[10px] block font-mono">Digital Signature Hash:</span>
                  <code class="text-[10px] text-slate-500 font-mono break-all">${verificationResult.hash}</code>
                </div>
              </div>
            ` : `
              <div class="space-y-2">
                <div class="flex justify-between text-slate-600">
                  <span>Academic Department:</span>
                  <strong class="text-slate-900">${verificationResult.department}</strong>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Validity Status:</span>
                  <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Active until ${verificationResult.validity}</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Institutional Role:</span>
                  <strong class="text-slate-900">${verificationResult.role}</strong>
                </div>
              </div>
            `}
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Authority: ${APP_CONFIG.academicCouncil}</span>
              <span class="font-bold text-emerald-700">100% Verified</span>
            </div>
          </div>
        </div>
      ` : id ? `
        <div class="bg-white p-8 rounded-3xl border border-rose-200 text-center space-y-2 shadow-sm">
          <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center text-xl font-black">
            ✕
          </div>
          <h3 class="text-base font-bold text-slate-900">No Record Found</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to verify identifier "${id}" in the central institutional registry. Please check for typographical errors.
          </p>
        </div>
      ` : ''}
    </div>
  `;
}
export function attachVerificationEvents() {
  const form = document.getElementById("verify-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const type = document.getElementById("verify-type-select").value;
      const id = document.getElementById("verify-id-input").value.trim();
      window.location.hash = `#/verify?type=${type}&id=${encodeURIComponent(id)}`;
    });
  }
}
