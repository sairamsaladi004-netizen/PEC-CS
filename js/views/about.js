              <div>
                <div class="font-semibold text-slate-800">Phone Hotline</div>
                <div>+91 80 2345 6789 (Mon-Fri 09:00 - 17:00 IST)</div>
              </div>
            </div>
          </div>
        </div>
        <form id="contact-council-form" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
            <input type="text" id="contact-name" required placeholder="e.g. Aarav Sharma" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
              <input type="email" id="contact-email" required placeholder="name@apextech.edu" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select id="contact-subject" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option>New Club Proposal</option>
                <option>Event Clearance Inquiry</option>
                <option>Certificate Verification Support</option>
                <option>Lab Equipment Requisition</option>
                <option>Other Feedback</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Your Message</label>
            <textarea id="contact-message" rows="3" required placeholder="Provide concise details regarding your inquiry..." class="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
          </div>
          <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20">
            Submit Inquiry to Secretariat
          </button>
        </form>
      </div>
    </div>
  `;
}
export function attachAboutEvents() {
  const form = document.getElementById("contact-council-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Thank you! Your inquiry has been logged with the Technical Council Secretariat.", "success");
      form.reset();
    });
  }
}
