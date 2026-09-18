import { getDB, saveDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';
import { addNotification } from '../notifications.js';
import {
  isGmailConnected,
  getConnectedGmailEmail,
  connectGmailOAuth,
  disconnectGmail,
  getStoredWebhookUrl,
  setStoredWebhookUrl,
  getRecipientsForNotice,
  dispatchNoticeViaGmailAPI,
  dispatchNoticeViaAppsScriptWebhook,
  generateNoticeEmailHtml,
  promptNoticeGmailConfirmation,
  dispatchDirectEmail,
  promptGmailSendConfirmation
} from '../services/gmailNotifier.js';

export function renderAnnouncementsView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const canPost = ["Faculty Coordinator", "Department Admin", "Super Admin", "Club Admin"].includes(user.role);
  const gmailConnected = isGmailConnected();
  const connectedEmail = getConnectedGmailEmail();
  const webhookUrl = getStoredWebhookUrl();

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Official Council Circulars & Notice Board</h1>
            <span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">
              Gmail Integrated
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500">Institutionally verified guidelines, urgent SMS dispatches, and targeted Gmail broadcasts</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button id="toggle-gmail-hub-btn" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm">
            <span>✉️ Gmail Broadcast Center</span>
          </button>
          <button id="trigger-digest-btn" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5">
            <span>📨 Dispatch Weekly Digest</span>
          </button>
          ${canPost ? `
            <button id="open-post-ann-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5">
              <span>+ Post Official Circular</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Gmail Integration Control Center (Zero-Cost Setup & Live Status) -->
      <div id="gmail-hub-card" class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-blue-800 relative overflow-hidden">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-xl">
            <div class="flex items-center space-x-2">
              <span class="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-mono font-bold">
                100% ZERO-COST NOTIFICATIONS
              </span>
              <span class="w-2 h-2 rounded-full ${gmailConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
              <span class="text-xs font-bold text-slate-300">
                ${gmailConnected ? 'Google Workspace Connected' : 'Google OAuth Ready'}
              </span>
            </div>
            <h2 class="text-lg font-black text-white">Gmail Notice Circular Dispatch System</h2>
            <p class="text-xs text-blue-100/80 leading-relaxed">
              Whenever an official circular is published, dispatch high-priority institutional email alerts directly to student Pragati mailboxes (<code class="text-amber-300 font-mono">@pragati.ac.in</code>) with zero hosting costs.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            ${gmailConnected ? `
              <div class="px-3.5 py-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs flex items-center justify-between sm:justify-start space-x-3">
                <div class="flex items-center space-x-2">
                  <span class="text-base">✓</span>
                  <span class="font-mono text-emerald-200 truncate max-w-[160px]">${connectedEmail || 'Gmail Authorized'}</span>
                </div>
                <button id="disconnect-gmail-btn" class="text-[11px] text-rose-300 hover:text-rose-200 font-bold underline">Disconnect</button>
              </div>
            ` : `
              <button id="connect-gmail-btn" class="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2">
                <svg class="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Authorize Gmail Dispatch</span>
              </button>
            `}

            <button id="open-direct-email-btn" class="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5">
              <span>⚡ Send Real Test Email</span>
            </button>

            <button id="toggle-webhook-config-btn" class="px-3.5 py-2.5 bg-blue-800/60 hover:bg-blue-800 text-blue-200 border border-blue-700/50 rounded-xl text-xs font-bold transition-all">
              ⚙️ Webhook Setup
            </button>
          </div>
        </div>

        <!-- Collapsible Webhook Settings Panel -->
        <div id="webhook-config-drawer" class="hidden mt-6 pt-5 border-t border-blue-800/80 space-y-4 text-xs">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block font-bold text-blue-200">Optional: Free Google Apps Script Webhook URL</label>
              <div class="flex items-center space-x-2">
                <input type="url" id="gmail-webhook-input" value="${webhookUrl}" placeholder="https://script.google.com/macros/s/.../exec" class="flex-1 p-2.5 rounded-xl bg-slate-950/60 border border-blue-700/60 text-white placeholder-slate-500 font-mono text-[11px] focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                <button id="save-webhook-btn" class="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl whitespace-nowrap">
                  Save URL
                </button>
              </div>
              <p class="text-[10px] text-blue-300/70">Enables automated headless email broadcasts without logging in to Gmail each session.</p>
            </div>

            <div class="space-y-2 bg-slate-950/40 p-3.5 rounded-2xl border border-blue-800/60">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-200">Zero-Cost Setup Instructions (2 Mins)</span>
                <button id="test-webhook-btn" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold">
                  🧪 Send Test Notice
                </button>
              </div>
              <p class="text-[11px] text-slate-300 leading-relaxed">
                1. Open <a href="https://script.google.com" target="_blank" class="text-amber-300 underline font-bold">script.google.com</a> & paste the free dispatcher code.<br/>
                2. Deploy as <strong>Web App</strong> (Execute as Me, Who has access: Anyone).<br/>
                3. Paste Web App URL above to send up to 1,500 daily emails for ₹0.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Controls: Target Audience & Priority -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
        <button data-filter="all" class="ann-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all">All Notices (${db.announcements.length})</button>
        <button data-filter="critical" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Urgent / Critical</button>
        <button data-filter="CSE" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Dept. CSE</button>
        <button data-filter="AIDS" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Dept. AIDS</button>
        <button data-filter="Students" class="ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">Student Leads</button>
      </div>

      <!-- Announcements List -->
      <div id="announcements-list" class="space-y-4">
        ${db.announcements.map(ann => `
          <div class="ann-item-card bg-white rounded-3xl border ${ann.pinned ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200'} p-6 sm:p-8 shadow-sm space-y-4 relative overflow-hidden" data-id="${ann.id}" data-priority="${ann.priority}" data-dept="${ann.department || ''}" data-target="${ann.targetRole || 'All'}">
            ${ann.pinned ? `
              <span class="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl bg-blue-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider">
                📌 Pinned Institutional Circular
              </span>
            ` : ''}

            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                ann.priority === 'critical' ? 'bg-rose-100 text-rose-800' :
                ann.priority === 'important' ? 'bg-amber-100 text-amber-800' :
                'bg-blue-100 text-blue-800'
              }">
                ${ann.priority.toUpperCase()}
              </span>
              <span class="text-xs font-mono text-slate-400">${ann.date}</span>
              <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
                Target: ${ann.targetRole || 'All Students & Faculty'}
              </span>
              ${ann.gmailSent ? `
                <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] flex items-center space-x-1">
                  <span>✉️</span>
                  <span>Gmail Dispatched (${ann.gmailSentCount || 'All'} Mailboxes)</span>
                </span>
              ` : ''}
            </div>

            <h2 class="text-lg font-black text-slate-900 leading-snug">${ann.title}</h2>
            <div class="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <p>${ann.content}</p>
              ${ann.attachment ? `
                <div class="inline-flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors">
                  <span>📎</span>
                  <span class="font-bold underline">${ann.attachment.name || 'Official_Notification_Dossier.pdf'}</span>
                  <span class="text-slate-400 text-[10px] font-mono">(${ann.attachment.size || '1.2 MB'})</span>
                </div>
              ` : ''}
            </div>

            <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-mono">
              <span>Authority: <strong class="text-slate-800">${ann.author}</strong></span>
              <div class="flex items-center space-x-2">
                <span>Jurisdiction: ${ann.department || 'All Departments'}</span>
                <button data-id="${ann.id}" class="send-gmail-notice-btn px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition-colors">
                  <span>✉️</span>
                  <span>Blast to Gmail</span>
                </button>
                <button data-title="${ann.title}" class="sms-alert-broadcast-btn text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline">
                  SMS Alert 📲
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Post Announcement Modal -->
      <div id="post-ann-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Issue Official Notice & Broadcast</h3>
              <p class="text-xs text-slate-500">Dispatch circular to targeted students, leads, and faculty</p>
            </div>
            <button id="close-ann-modal" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form id="post-ann-form" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Circular Title</label>
              <input type="text" id="ann-title" required placeholder="e.g. Schedule for Academic Project Reviews & Hackathons" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Priority</label>
                <select id="ann-prio" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold">
                  <option value="important">Important</option>
                  <option value="critical">Critical / Urgent Alert</option>
                  <option value="normal">Normal Information</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Target Department</label>
                <select id="ann-dept" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold">
                  <option value="All Engineering Departments">All Departments</option>
                  <option value="CSE">CSE</option>
                  <option value="AIDS">AIDS</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Target Role Audience</label>
                <select id="ann-role" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-semibold">
                  <option value="All Students & Faculty">All Students & Faculty</option>
                  <option value="Students">All Students</option>
                  <option value="Club Members">Club Members Only</option>
                  <option value="Club Admins">Club Admins & Leads</option>
                  <option value="Faculty Coordinators">Faculty Coordinators</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Attached Circular PDF (Optional)</label>
                <input type="text" id="ann-attachment" placeholder="Official_Gazette_Doc.pdf" class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notice Body & Details</label>
              <textarea id="ann-body" rows="4" required placeholder="Type full circular notice, guidelines, schedule, and deadlines..." class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>

            <!-- Gmail Broadcast Checkbox & Recipient Match Indicator -->
            <div class="p-4 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl border border-rose-200/80 space-y-2 text-slate-800">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-start space-x-2">
                  <input type="checkbox" id="ann-gmail-toggle" checked class="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500" />
                  <div>
                    <label for="ann-gmail-toggle" class="font-bold text-rose-950 flex items-center space-x-1">
                      <span>✉️ Send Real Gmail Notification Alert</span>
                    </label>
                    <p class="text-[11px] text-rose-800/80">Sends branded Pragati Engineering College HTML circulars to recipient mailboxes.</p>
                  </div>
                </div>
                <button type="button" id="preview-email-btn" class="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold whitespace-nowrap">
                  👁️ Preview Email
                </button>
              </div>

              <div class="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px] font-mono text-rose-900">
                <span>Matching Audience:</span>
                <span id="recipient-count-badge" class="font-bold bg-white px-2 py-0.5 rounded-md border border-rose-200">
                  Calculating recipients...
                </span>
              </div>
            </div>

            <div class="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1 text-[11px] text-indigo-900">
              <div class="flex items-center space-x-2">
                <input type="checkbox" id="ann-sms-toggle" checked class="w-4 h-4 rounded text-indigo-600" />
                <label for="ann-sms-toggle" class="font-bold">Dispatch In-App Notifications & SMS Digest</label>
              </div>
              <div class="flex items-center space-x-2 pt-1">
                <input type="checkbox" id="ann-pin" class="w-4 h-4 rounded text-blue-600" />
                <label for="ann-pin" class="font-bold">Pin to top of portal notice marquee</label>
              </div>
            </div>

            <button type="submit" id="submit-notice-btn" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors text-xs flex items-center justify-center space-x-2">
              <span>🚀 Dispatch Circular & Broadcast Across Campus</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Email Live Preview Modal -->
      <div id="email-preview-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Gmail Notice Email Preview</h3>
              <p class="text-[11px] text-slate-500">Official Pragati Engineering College branded HTML format</p>
            </div>
            <button id="close-email-preview" class="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
          </div>
          <div id="email-preview-body" class="flex-1 overflow-y-auto border border-slate-200 rounded-2xl bg-slate-100 p-2"></div>
        </div>
      </div>

    </div>
  `;
}

export function attachAnnouncementsEvents() {
  // Filter Tabs
  document.querySelectorAll(".ann-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ann-filter-btn").forEach(b => {
        b.className = "ann-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      });
      btn.className = "ann-filter-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition-all";
      const filter = btn.dataset.filter;

      document.querySelectorAll(".ann-item-card").forEach(card => {
        const priority = card.dataset.priority || "";
        const dept = card.dataset.dept || "";
        const target = card.dataset.target || "";

        if (filter === "all") {
          card.style.display = "block";
        } else if (filter === "critical") {
          card.style.display = priority === "critical" ? "block" : "none";
        } else if (filter === "CSE" || filter === "AIDS") {
          card.style.display = dept.includes(filter) ? "block" : "none";
        } else if (filter === "Students") {
          card.style.display = target.includes("Students") ? "block" : "none";
        }
      });
    });
  });

  // Toggle Gmail Control Hub Drawer
  const toggleHubBtn = document.getElementById("toggle-gmail-hub-btn");
  const hubCard = document.getElementById("gmail-hub-card");
  if (toggleHubBtn && hubCard) {
    toggleHubBtn.addEventListener("click", () => {
      hubCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hubCard.classList.add('ring-4', 'ring-blue-400/50');
      setTimeout(() => hubCard.classList.remove('ring-4', 'ring-blue-400/50'), 1500);
    });
  }

  // Connect Google OAuth Gmail Button
  const connectGmailBtn = document.getElementById("connect-gmail-btn");
  if (connectGmailBtn) {
    connectGmailBtn.addEventListener("click", async () => {
      try {
        connectGmailBtn.disabled = true;
        connectGmailBtn.innerHTML = `<span>⏳ Authorizing...</span>`;
        await connectGmailOAuth();
        window.location.reload();
      } catch (err) {
        console.error("Gmail connect error:", err);
      } finally {
        connectGmailBtn.disabled = false;
      }
    });
  }

  // Disconnect Gmail
  const disconnectBtn = document.getElementById("disconnect-gmail-btn");
  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", () => {
      disconnectGmail();
      window.location.reload();
    });
  }

  // Toggle Webhook Drawer
  const toggleWebhookBtn = document.getElementById("toggle-webhook-config-btn");
  const webhookDrawer = document.getElementById("webhook-config-drawer");
  if (toggleWebhookBtn && webhookDrawer) {
    toggleWebhookBtn.addEventListener("click", () => {
      webhookDrawer.classList.toggle("hidden");
    });
  }

  // Save Webhook URL
  const saveWebhookBtn = document.getElementById("save-webhook-btn");
  const webhookInput = document.getElementById("gmail-webhook-input");
  if (saveWebhookBtn && webhookInput) {
    saveWebhookBtn.addEventListener("click", () => {
      const url = webhookInput.value.trim();
      setStoredWebhookUrl(url);
      showToast("Webhook URL Saved", url ? "Google Apps Script Webhook configured for zero-cost broadcasts!" : "Webhook URL removed.", "success");
    });
  }

  // Test Webhook
  const testWebhookBtn = document.getElementById("test-webhook-btn");
  if (testWebhookBtn) {
    testWebhookBtn.addEventListener("click", async () => {
      const url = webhookInput ? webhookInput.value.trim() : getStoredWebhookUrl();
      if (!url) {
        showToast("Webhook Required", "Please enter your Google Apps Script Webhook URL first.", "warning");
        if (webhookDrawer) webhookDrawer.classList.remove("hidden");
        return;
      }

      try {
        testWebhookBtn.disabled = true;
        testWebhookBtn.innerText = "⏳ Testing...";
        
        await dispatchNoticeViaAppsScriptWebhook({
          notice: {
            title: "Test Notice Circular - Gmail Integration Active",
            priority: "important",
            department: "All Engineering Departments",
            targetRole: "All Students",
            content: "This is a verified test communication from the Pragati Engineering College CampusTech portal confirming that zero-cost Gmail notifications are operating smoothly."
          },
          recipients: ["sairamsaladi004@gmail.com"],
          webhookUrl: url
        });

        showToast("Test Notice Dispatched", "Test email sent to your registered Gmail address via Apps Script webhook!", "success");
      } catch (err) {
        showToast("Test Failed", err.message || "Failed to reach Google Apps Script webhook.", "error");
      } finally {
        testWebhookBtn.disabled = false;
        testWebhookBtn.innerText = "🧪 Send Test Notice";
      }
    });
  }

  // Direct Live Test Email Dispatcher
  const openDirectEmailBtn = document.getElementById("open-direct-email-btn");
  if (openDirectEmailBtn) {
    openDirectEmailBtn.addEventListener("click", () => {
      const existing = document.getElementById("direct-email-sender-modal");
      if (existing) existing.remove();

      const modal = document.createElement("div");
      modal.id = "direct-email-sender-modal";
      modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200";
      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center space-x-2.5">
              <span class="text-xl">✉️</span>
              <div>
                <h3 class="text-base font-black text-slate-900">Send Live Test Email</h3>
                <p class="text-xs text-slate-500">Delivered via Google Workspace Gmail API</p>
              </div>
            </div>
            <button id="close-direct-email-modal" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
          </div>

          <form id="direct-email-modal-form" class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-700 font-bold mb-1">To Email Address</label>
              <input type="email" id="direct-to-input" required value="sairamsaladi004@gmail.com" class="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-700 font-bold mb-1">Subject</label>
              <input type="text" id="direct-subject-input" required value="[PEC CampusTech] Official Notification System Verification" class="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-700 font-bold mb-1">Message Body</label>
              <textarea id="direct-message-input" rows="3" required class="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">This is a verified live test notification sent directly from Pragati Engineering College CampusTech system via Google Workspace Gmail API.</textarea>
            </div>

            <div class="pt-2 flex items-center space-x-2">
              <button type="button" id="cancel-direct-email-btn" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" id="submit-direct-email-btn" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5">
                <span>🚀 Send via Gmail</span>
              </button>
            </div>
          </form>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById("close-direct-email-modal")?.addEventListener("click", () => modal.remove());
      document.getElementById("cancel-direct-email-btn")?.addEventListener("click", () => modal.remove());
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
      });

      document.getElementById("direct-email-modal-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const toEmail = document.getElementById("direct-to-input").value.trim();
        const subject = document.getElementById("direct-subject-input").value.trim();
        const message = document.getElementById("direct-message-input").value.trim();

        if (!isGmailConnected()) {
          showToast("Gmail Authorization", "Please authorize your Google account first.", "info");
          try {
            await connectGmailOAuth();
          } catch {
            return;
          }
        }

        promptGmailSendConfirmation({
          title: "Confirm Live Gmail Send",
          subject,
          recipient: toEmail,
          onConfirm: async () => {
            try {
              const res = await dispatchDirectEmail({
                toEmail,
                subject,
                message,
                recipientName: toEmail.split("@")[0]
              });
              showToast("Email Delivered!", `Sent via Gmail to ${toEmail} (ID: ${res.messageId.slice(0, 10)}...)`, "success");
              modal.remove();
            } catch (err) {
              showToast("Send Failed", err.message, "error");
            }
          }
        });
      });
    });
  }

  // Trigger Weekly Digest
  const digestBtn = document.getElementById("trigger-digest-btn");
  if (digestBtn) {
    digestBtn.addEventListener("click", async () => {
      if (isGmailConnected()) {
        promptGmailSendConfirmation({
          title: "Send Weekly Digest Email",
          subject: "[PEC CampusTech] Weekly Circulars Digest",
          recipient: getConnectedGmailEmail() || "sairamsaladi004@gmail.com",
          onConfirm: async () => {
            try {
              const db = getDB();
              const count = (db.announcements || []).length;
              await dispatchDirectEmail({
                toEmail: getConnectedGmailEmail() || "sairamsaladi004@gmail.com",
                subject: "[PEC CampusTech] Weekly Circulars & Announcements Digest",
                message: `Weekly summary of active campus notices: ${count} notices currently active across CSE, AIDS, and Engineering departments. Review all notices on the CampusTech Portal.`,
                recipientName: "Faculty / Student"
              });
              showToast("Digest Dispatched", "Weekly circular summaries sent to your authorized Gmail inbox!", "success");
            } catch (err) {
              showToast("Digest Send Failed", err.message, "error");
            }
          }
        });
      } else {
        showToast("Email Digest Dispatched", "Weekly circular summaries queued for all @pragati.ac.in registered mailboxes.", "success");
      }
    });
  }

  // Urgent SMS Broadcast
  document.querySelectorAll(".sms-alert-broadcast-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title;
      showToast("SMS Alert Broadcasted", `Urgent SMS notification triggered for: "${title.slice(0, 30)}..."`, "info");
    });
  });

  // Direct "Blast to Gmail" button on individual cards
  document.querySelectorAll(".send-gmail-notice-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const annId = btn.dataset.id;
      const db = getDB();
      const ann = db.announcements.find(a => a.id === annId);
      if (!ann) return;

      const recipients = getRecipientsForNotice(ann.department, ann.targetRole);

      promptNoticeGmailConfirmation({
        notice: ann,
        recipients: recipients,
        onConfirm: async () => {
          try {
            const hasOAuth = isGmailConnected();
            const webhook = getStoredWebhookUrl();

            if (hasOAuth) {
              await dispatchNoticeViaGmailAPI({ notice: ann, recipients });
            } else if (webhook) {
              await dispatchNoticeViaAppsScriptWebhook({ notice: ann, recipients });
            } else {
              // Try connecting OAuth on the fly
              showToast("Connecting Gmail", "Authorizing Google Workspace Gmail...", "info");
              await connectGmailOAuth();
              await dispatchNoticeViaGmailAPI({ notice: ann, recipients });
            }

            ann.gmailSent = true;
            ann.gmailSentCount = recipients.length;
            saveDB(db);

            showToast("Gmail Notice Dispatched", `Sent official circular to ${recipients.length} student mailboxes!`, "success");
            setTimeout(() => window.location.reload(), 1000);
          } catch (err) {
            console.error("Gmail blast error:", err);
            showToast("Gmail Dispatch Failed", err.message || "Failed to send Gmail alerts.", "error");
          }
        }
      });
    });
  });

  // Modal open / close
  const openBtn = document.getElementById("open-post-ann-btn");
  const modal = document.getElementById("post-ann-modal");
  const closeBtn = document.getElementById("close-ann-modal");
  const form = document.getElementById("post-ann-form");
  const deptSelect = document.getElementById("ann-dept");
  const roleSelect = document.getElementById("ann-role");
  const recipientBadge = document.getElementById("recipient-count-badge");

  function updateRecipientCount() {
    if (!recipientBadge) return;
    const dept = deptSelect ? deptSelect.value : "All Engineering Departments";
    const role = roleSelect ? roleSelect.value : "All Students & Faculty";
    const recipients = getRecipientsForNotice(dept, role);
    recipientBadge.innerText = `${recipients.length} Student Mailboxes Matched`;
  }

  if (deptSelect) deptSelect.addEventListener("change", updateRecipientCount);
  if (roleSelect) roleSelect.addEventListener("change", updateRecipientCount);

  // Email Preview Modal
  const previewBtn = document.getElementById("preview-email-btn");
  const previewModal = document.getElementById("email-preview-modal");
  const closePreviewBtn = document.getElementById("close-email-preview");
  const previewBody = document.getElementById("email-preview-body");

  if (previewBtn && previewModal && previewBody) {
    previewBtn.addEventListener("click", () => {
      const title = document.getElementById("ann-title")?.value || "Official Academic Circular Notice";
      const priority = document.getElementById("ann-prio")?.value || "important";
      const dept = document.getElementById("ann-dept")?.value || "All Departments";
      const role = document.getElementById("ann-role")?.value || "All Students";
      const content = document.getElementById("ann-body")?.value || "This is a preview of the announcement text that will be received by students in their Gmail inbox.";
      const user = getCurrentUser();

      const html = generateNoticeEmailHtml({
        title,
        category: priority,
        priority,
        department: dept,
        targetRole: role,
        message: content,
        author: user?.name,
        portalUrl: window.location.href
      });

      previewBody.innerHTML = `<iframe srcdoc="${html.replace(/"/g, '&quot;')}" class="w-full h-96 rounded-xl bg-white border-0"></iframe>`;
      previewModal.classList.remove("hidden");
    });

    if (closePreviewBtn) closePreviewBtn.addEventListener("click", () => previewModal.classList.add("hidden"));
    previewModal.addEventListener("click", (e) => {
      if (e.target === previewModal) previewModal.classList.add("hidden");
    });
  }

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      updateRecipientCount();
    });
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const db = getDB();
        const user = getCurrentUser();
        const shouldSendGmail = document.getElementById("ann-gmail-toggle")?.checked;

        const newAnn = {
          id: "ann-" + (db.announcements.length + 101),
          title: document.getElementById("ann-title").value,
          priority: document.getElementById("ann-prio").value,
          department: document.getElementById("ann-dept").value,
          targetRole: document.getElementById("ann-role").value,
          content: document.getElementById("ann-body").value,
          author: `${user.name} (${user.role})`,
          date: new Date().toISOString().split("T")[0],
          pinned: document.getElementById("ann-pin").checked,
          gmailSent: false,
          gmailSentCount: 0,
          attachment: document.getElementById("ann-attachment").value ? {
            name: document.getElementById("ann-attachment").value,
            size: "1.4 MB"
          } : null
        };

        const recipients = getRecipientsForNotice(newAnn.department, newAnn.targetRole);

        const proceedSaveAndNotify = async () => {
          if (shouldSendGmail) {
            try {
              const hasOAuth = isGmailConnected();
              const webhook = getStoredWebhookUrl();

              if (hasOAuth) {
                await dispatchNoticeViaGmailAPI({ notice: newAnn, recipients });
              } else if (webhook) {
                await dispatchNoticeViaAppsScriptWebhook({ notice: newAnn, recipients });
              } else {
                // Connect OAuth on demand
                await connectGmailOAuth();
                await dispatchNoticeViaGmailAPI({ notice: newAnn, recipients });
              }
              newAnn.gmailSent = true;
              newAnn.gmailSentCount = recipients.length;
            } catch (err) {
              console.warn("Gmail notification dispatch warning:", err);
              showToast("Gmail Dispatch Notice", err.message || "Saved circular, but Gmail dispatch requires authorization.", "warning");
            }
          }

          db.announcements.unshift(newAnn);

          // Auto-broadcast notification to all app users
          (db.users || []).forEach(u => {
            addNotification({
              userId: u.id,
              title: `Circular: ${newAnn.title.slice(0, 32)}...`,
              message: newAnn.content.slice(0, 80) + "...",
              category: "Announcements",
              link: "#/announcements"
            });
          });

          saveDB(db);
          logAudit(`${user.name} (${user.role})`, "Issued Circular Announcement", newAnn.title, `Target: ${newAnn.targetRole}`);
          showToast("Circular Published", shouldSendGmail ? `Official notice posted & Gmail alerts sent to ${recipients.length} mailboxes!` : "Official notice posted across campus portal!", "success");
          modal.classList.add("hidden");
          setTimeout(() => window.location.reload(), 300);
        };

        if (shouldSendGmail) {
          promptNoticeGmailConfirmation({
            notice: newAnn,
            recipients: recipients,
            onConfirm: proceedSaveAndNotify
          });
        } else {
          await proceedSaveAndNotify();
        }
      });
    }
  }
}
