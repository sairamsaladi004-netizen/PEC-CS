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
  getAllRegisteredUsers,
  dispatchNoticeViaGmailAPI,
  dispatchNoticeViaAppsScriptWebhook,
  dispatchRealBulkEmailToAllUsers,
  generateNoticeEmailHtml,
  promptNoticeGmailConfirmation,
  dispatchDirectEmail,
  promptGmailSendConfirmation,
  promptOriginMismatchResolutionModal
} from '../services/gmailNotifier.js';

export function renderAnnouncementsView() {
  const db = getDB();
  const user = getCurrentUser() || {};
  const canPost = ["Faculty Coordinator", "Department Admin", "Super Admin", "Club Admin"].includes(user.role);
  const gmailConnected = isGmailConnected();
  const connectedEmail = getConnectedGmailEmail();
  const webhookUrl = getStoredWebhookUrl();
  const allUsers = getAllRegisteredUsers();

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Official Council Circulars & Notice Board</h1>
            <span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">
              Real Bulk Mailer Active
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500">Institutionally verified circulars, real bulk email broadcasting to all registered mailboxes</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <!-- Main Action: Real Bulk Send to ALL Registered Users -->
          <button id="open-bulk-send-all-btn" class="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-500/25 transition-all flex items-center space-x-2 hover:scale-[1.02]">
            <span>🚀 SEND MAIL TO ALL REGISTERED USERS</span>
            <span class="px-1.5 py-0.5 rounded bg-white/20 text-white text-[10px] font-mono">${allUsers.length}</span>
          </button>
          
          <button id="toggle-gmail-hub-btn" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm">
            <span>✉️ Broadcast Center</span>
          </button>
          
          ${canPost ? `
            <button id="open-post-ann-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5">
              <span>+ New Notice</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Gmail Integration Control Center (Zero-Cost Setup & Live Status) -->
      <div id="gmail-hub-card" class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-800/60 relative overflow-hidden">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-xl">
            <div class="flex items-center space-x-2">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-[10px] font-mono font-bold">
                REAL BULK DISPATCH ENGINE
              </span>
              <span class="w-2 h-2 rounded-full ${gmailConnected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}"></span>
              <span class="text-xs font-bold text-slate-300">
                ${gmailConnected ? `Connected: ${connectedEmail}` : 'Institutional Direct & OAuth Relay Active'}
              </span>
            </div>
            <h2 class="text-lg sm:text-xl font-black text-white">CampusTech Institutional Email Broadcaster</h2>
            <p class="text-xs text-blue-100/80 leading-relaxed">
              Broadcast high-priority notifications, exam alerts, workshop passes, and accredited credentials to all <strong>${allUsers.length} registered students & faculty</strong> in real-time.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            ${gmailConnected ? `
              <div class="px-3.5 py-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs flex items-center justify-between sm:justify-start space-x-3">
                <div class="flex items-center space-x-2">
                  <span class="text-base text-emerald-400">✓</span>
                  <span class="font-mono text-emerald-200 truncate max-w-[160px]">${connectedEmail}</span>
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
                <span>Authorize Google Dispatch</span>
              </button>
            `}

            <button id="open-direct-email-btn" class="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5">
              <span>⚡ Send Real Test Email</span>
            </button>

            <button id="toggle-webhook-config-btn" class="px-3.5 py-2.5 bg-indigo-800/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 rounded-xl text-xs font-bold transition-all flex items-center justify-center">
              ⚙️ Webhook Settings
            </button>
          </div>
        </div>

        <!-- Collapsible Webhook Settings Panel -->
        <div id="webhook-config-drawer" class="hidden mt-6 pt-5 border-t border-indigo-800/80 space-y-4 text-xs">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block font-bold text-blue-200">Google Apps Script Webhook URL (Zero Cost)</label>
              <div class="flex items-center space-x-2">
                <input type="url" id="gmail-webhook-input" value="${webhookUrl}" placeholder="https://script.google.com/macros/s/.../exec" class="flex-1 p-2.5 rounded-xl bg-slate-950/60 border border-blue-700/60 text-white placeholder-slate-500 font-mono text-[11px] focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                <button id="save-webhook-btn" class="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl whitespace-nowrap">
                  Save URL
                </button>
              </div>
              <p class="text-[10px] text-blue-300/70">Enables automated headless email broadcasts without logging in each time.</p>
            </div>

            <div class="space-y-2 bg-slate-950/40 p-3.5 rounded-2xl border border-blue-800/60">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-200">Test Dispatching</span>
                <button id="test-webhook-btn" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold">
                  🧪 Send Test Notice
                </button>
              </div>
              <p class="text-[11px] text-slate-300 leading-relaxed">
                Sends a live test notification to <code class="text-amber-300">sairamsaladi3@gmail.com</code> / <code class="text-amber-300">sairamsaladi004@gmail.com</code> to verify instant delivery.
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
                ${(ann.priority || 'NORMAL').toUpperCase()}
              </span>
              <span class="text-xs font-mono text-slate-400">${ann.date}</span>
              <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
                Target: ${ann.targetRole || 'All Students & Faculty'}
              </span>
              ${ann.gmailSent ? `
                <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] flex items-center space-x-1">
                  <span>✉️</span>
                  <span>Real Bulk Dispatched (${ann.gmailSentCount || allUsers.length} Mailboxes)</span>
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
                  <span>Bulk Send This Notice</span>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- ======================================================== -->
      <!-- MODAL: REAL BULK SEND TO ALL REGISTERED USERS -->
      <!-- ======================================================== -->
      <div id="bulk-send-all-modal" class="hidden fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4">
        <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-slate-200">
          
          <!-- Modal Header -->
          <div class="flex items-start justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-rose-500/30">
                ✉️
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900">Real Bulk Email Dispatcher</h3>
                <p class="text-xs text-slate-500">Send verified Pragati Engineering College circulars to ALL registered users</p>
              </div>
            </div>
            <button id="close-bulk-modal-btn" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">✕</button>
          </div>

          <!-- Audience & Recipient Summary Bar -->
          <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Active Registered User Directory:</span>
              </div>
              <p class="text-[11px] text-blue-700/80 mt-0.5">Deduplicated from central student database & faculty roster.</p>
            </div>
            <div class="flex items-center space-x-2">
              <span id="bulk-target-count-badge" class="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-mono font-black text-xs shadow-xs">
                ${allUsers.length} Recipients
              </span>
              <button type="button" id="toggle-recipient-list-btn" class="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold">
                👥 View Roster
              </button>
            </div>
          </div>

          <!-- Collapsible Recipient Roster View -->
          <div id="recipient-roster-drawer" class="hidden p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 max-h-48 overflow-y-auto text-xs font-mono">
            <div class="flex items-center justify-between font-bold text-slate-600 text-[10px] pb-1 border-b border-slate-200">
              <span>NAME & ROLE</span>
              <span>EMAIL ADDRESS</span>
            </div>
            ${allUsers.map(u => `
              <div class="flex items-center justify-between py-1 border-b border-slate-100/60 text-[11px]">
                <div class="truncate max-w-[200px]">
                  <span class="font-bold text-slate-800">${u.name}</span>
                  <span class="text-[9px] text-slate-400">(${u.role})</span>
                </div>
                <div class="text-blue-600 font-semibold truncate max-w-[220px]">
                  ${u.email}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Quick Templates Bar -->
          <div class="space-y-1.5">
            <label class="block font-bold text-xs text-slate-700">Quick Announcement Templates:</label>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" data-tpl="hackathon" class="quick-tpl-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 text-[11px] font-semibold transition-colors">
                🏆 Hackathon Alert
              </button>
              <button type="button" data-tpl="workshop" class="quick-tpl-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 text-[11px] font-semibold transition-colors">
                🛠️ Hands-on Workshop
              </button>
              <button type="button" data-tpl="exam" class="quick-tpl-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 text-[11px] font-semibold transition-colors">
                📝 Academic Circular
              </button>
              <button type="button" data-tpl="cert" class="quick-tpl-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 text-[11px] font-semibold transition-colors">
                📜 Certificate Release
              </button>
            </div>
          </div>

          <!-- Bulk Email Form -->
          <form id="bulk-send-form" class="space-y-4 text-xs">
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label class="block font-bold text-slate-700 mb-1">Email Subject Line</label>
                <input type="text" id="bulk-email-subject" required value="[PEC Urgent Notice] Annual Technical Symposium & Industry 4.0 Club Induction" class="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Priority Badge</label>
                <select id="bulk-email-priority" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none">
                  <option value="critical">🚨 Critical / Urgent</option>
                  <option value="important" selected>⭐ Important Notice</option>
                  <option value="normal">ℹ️ General Circular</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Target Department</label>
                <select id="bulk-email-dept" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none">
                  <option value="All Engineering Departments" selected>All Engineering Departments (All)</option>
                  <option value="CSE">Computer Science & Engineering (CSE)</option>
                  <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="EEE">Electrical & Electronics (EEE)</option>
                  <option value="ME">Mechanical Engineering (ME)</option>
                  <option value="CE">Civil Engineering (CE)</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Target Role Audience</label>
                <select id="bulk-email-role" class="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none">
                  <option value="All Students & Faculty" selected>All Registered Students & Faculty</option>
                  <option value="Students">All Enrolled Students Only</option>
                  <option value="Club Members">Club Members Only</option>
                  <option value="Club Admins">Club Student Leaders & Admins</option>
                  <option value="Faculty Coordinators">Faculty Coordinators & HODs</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Additional / Specific Email Addresses (Comma Separated)</label>
              <input type="text" id="bulk-custom-emails" value="sairamsaladi3@gmail.com, sairamsaladi004@gmail.com" placeholder="sairamsaladi3@gmail.com, student@pragati.ac.in, ..." class="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] focus:ring-2 focus:ring-rose-500 focus:outline-none" />
              <p class="text-[10px] text-slate-400 mt-1">Include your personal inbox or test emails to receive live delivery verification.</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Notice Message Body</label>
              <textarea id="bulk-email-body" rows="4" required class="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 leading-relaxed text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none">Dear Students and Faculty,

Please be informed that the Central Council of Technical Societies & Clubs (CCTSC) has scheduled the mandatory Industry 4.0 Club Reviews and Project Sprint presentations.

All registered members must ensure their attendance is recorded via the CampusTech QR scanner. Digital accredited certificates will be issued upon completion.

Venue: Pragati Main Auditorium & Industry 4.0 Center
Date & Time: Saturday, 10:00 AM IST onwards

Regards,
Central Council of Technical Societies & Clubs (CCTSC)
Pragati Engineering College (Autonomous)</textarea>
            </div>

            <!-- Action Controls -->
            <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div class="flex items-center space-x-2 w-full sm:w-auto">
                <button type="button" id="preview-bulk-btn" class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-xs flex items-center space-x-1">
                  <span>👁️ HTML Preview</span>
                </button>
                <button type="button" id="send-test-bulk-btn" class="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl transition-colors text-xs flex items-center space-x-1">
                  <span>⚡ Test to Me</span>
                </button>
              </div>

              <div class="flex items-center space-x-2 w-full sm:w-auto">
                <button type="button" id="cancel-bulk-btn" class="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-xs">
                  Cancel
                </button>
                <button type="submit" id="start-bulk-dispatch-btn" class="flex-1 sm:flex-none px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center space-x-2">
                  <span>🚀 BROADCAST TO ALL USERS NOW</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL: LIVE BULK DISPATCH PROGRESS SCREEN -->
      <!-- ======================================================== -->
      <div id="bulk-progress-modal" class="hidden fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
          
          <div class="text-center space-y-2">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-rose-600 text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-rose-500/30 animate-pulse">
              ✉️
            </div>
            <h3 id="progress-title-text" class="text-lg font-black text-slate-900">Dispatching Real Bulk Emails...</h3>
            <p id="progress-subtitle-text" class="text-xs text-slate-500">Delivering verified institutional notices to recipient mailboxes</p>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-mono font-bold text-slate-700">
              <span id="progress-counter-text">Sending 0 of 0...</span>
              <span id="progress-percent-text">0%</span>
            </div>
            <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div id="progress-bar-fill" class="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-150" style="width: 0%"></div>
            </div>
          </div>

          <!-- Live Terminal Log -->
          <div class="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300 max-h-40 overflow-y-auto" id="progress-logs-container">
            <div class="text-slate-500">Initiating real bulk dispatch connection...</div>
          </div>

          <!-- Action when Complete -->
          <div id="progress-complete-actions" class="hidden pt-2">
            <button id="finish-bulk-progress-btn" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all">
              ✓ Done! Return to Circular Board
            </button>
          </div>

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
      hubCard.classList.add('ring-4', 'ring-rose-400/50');
      setTimeout(() => hubCard.classList.remove('ring-4', 'ring-rose-400/50'), 1500);
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
        if (connectGmailBtn) connectGmailBtn.disabled = false;
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

  // ========================================================
  // REAL BULK SEND TO ALL USERS MODAL CONTROLS
  // ========================================================
  const bulkModal = document.getElementById("bulk-send-all-modal");
  const openBulkBtn = document.getElementById("open-bulk-send-all-btn");
  const closeBulkBtn = document.getElementById("close-bulk-modal-btn");
  const cancelBulkBtn = document.getElementById("cancel-bulk-btn");
  const bulkForm = document.getElementById("bulk-send-form");
  const rosterDrawer = document.getElementById("recipient-roster-drawer");
  const toggleRosterBtn = document.getElementById("toggle-recipient-list-btn");
  const targetCountBadge = document.getElementById("bulk-target-count-badge");
  const deptSelect = document.getElementById("bulk-email-dept");
  const roleSelect = document.getElementById("bulk-email-role");
  const customEmailsInput = document.getElementById("bulk-custom-emails");

  function updateBulkRecipientBadge() {
    if (!targetCountBadge) return;
    const dept = deptSelect ? deptSelect.value : 'All Engineering Departments';
    const role = roleSelect ? roleSelect.value : 'All Students & Faculty';
    const list = getRecipientsForNotice(dept, role);
    const custom = (customEmailsInput?.value || '').split(',').map(e => e.trim()).filter(Boolean);
    const total = new Set([...list, ...custom]).size;
    targetCountBadge.innerText = `${total} Mailboxes Matched`;
  }

  deptSelect?.addEventListener("change", updateBulkRecipientBadge);
  roleSelect?.addEventListener("change", updateBulkRecipientBadge);
  customEmailsInput?.addEventListener("input", updateBulkRecipientBadge);

  toggleRosterBtn?.addEventListener("click", () => {
    rosterDrawer?.classList.toggle("hidden");
  });

  openBulkBtn?.addEventListener("click", () => {
    bulkModal?.classList.remove("hidden");
    updateBulkRecipientBadge();
  });

  closeBulkBtn?.addEventListener("click", () => bulkModal?.classList.add("hidden"));
  cancelBulkBtn?.addEventListener("click", () => bulkModal?.classList.add("hidden"));

  // Quick Template Injector
  document.querySelectorAll(".quick-tpl-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tpl = btn.getAttribute("data-tpl");
      const subjInput = document.getElementById("bulk-email-subject");
      const bodyInput = document.getElementById("bulk-email-body");
      const prioSelect = document.getElementById("bulk-email-priority");

      if (tpl === "hackathon") {
        if (subjInput) subjInput.value = "[PEC Hackathon Alert] 36-Hour National Smart India Hackathon Internal Ideation Call";
        if (prioSelect) prioSelect.value = "critical";
        if (bodyInput) bodyInput.value = `Dear Technocrats,\n\nThe Central Council invites problem statement submissions for the Smart India Hackathon (SIH 2026).\n\nAll club leads and developers from CSE, AIDS, IT, ECE, EEE, MECH, and CIVIL are eligible to participate. Teams will receive mentorship from Industry 4.0 Society faculty.\n\nRegistration Deadline: 28th of this month\nTeam Size: 6 Members (Mandatory 1 female member)\n\nSubmit your abstract through the CampusTech portal.`;
      } else if (tpl === "workshop") {
        if (subjInput) subjInput.value = "[PEC Workshop] Hands-On Generative AI & Autonomous Agent Engineering";
        if (prioSelect) prioSelect.value = "important";
        if (bodyInput) bodyInput.value = `Dear Students,\n\nThe AI&ML Turing Club and Google Developer Student Society are conducting an intensive hands-on workshop on Agentic AI and Edge Neural Architectures.\n\nPrerequisites: Basic Python & Git.\nLaptops with Google Colab access are required.\n\nRegister on the CampusTech Portal to receive your digital QR entry pass.`;
      } else if (tpl === "exam") {
        if (subjInput) subjInput.value = "[Academic Notice] Industry 4.0 Club Project Submission & Viva Schedule";
        if (prioSelect) prioSelect.value = "critical";
        if (bodyInput) bodyInput.value = `Official Notification from Head of Academic Council & Department Chairs:\n\nAll 3rd and 4th year student club members must submit their final project repositories and documentation for internal assessment.\n\nViva Dates: Commencing from next Monday\nVenue: Respective Departmental Labs.`;
      } else if (tpl === "cert") {
        if (subjInput) subjInput.value = "[Credentials Alert] Digital Accredited Certificates Released on CampusTech";
        if (prioSelect) prioSelect.value = "normal";
        if (bodyInput) bodyInput.value = `Congratulations!\n\nYour verified institutional certificate with cryptographic QR verification has been minted on the PEC digital ledger.\n\nYou can view, download, and share your accredited certificate from your student dashboard.`;
      }
      showToast("Template Applied", `Loaded "${btn.innerText.trim()}" template!`, "info");
    });
  });

  // Preview Bulk Email
  document.getElementById("preview-bulk-btn")?.addEventListener("click", () => {
    const title = document.getElementById("bulk-email-subject")?.value || "Official Circular";
    const priority = document.getElementById("bulk-email-priority")?.value || "important";
    const dept = document.getElementById("bulk-email-dept")?.value || "All Departments";
    const role = document.getElementById("bulk-email-role")?.value || "All Students";
    const content = document.getElementById("bulk-email-body")?.value || "";
    const user = getCurrentUser();

    const html = generateNoticeEmailHtml({
      title,
      category: priority,
      priority,
      department: dept,
      targetRole: role,
      message: content,
      author: user?.name || "Central Council",
      portalUrl: window.location.origin + window.location.pathname + "#/announcements"
    });

    const previewModal = document.getElementById("email-preview-modal");
    const previewBody = document.getElementById("email-preview-body");
    if (previewModal && previewBody) {
      previewBody.innerHTML = `<iframe srcdoc="${html.replace(/"/g, '&quot;')}" class="w-full h-96 rounded-xl bg-white border-0"></iframe>`;
      previewModal.classList.remove("hidden");
    }
  });

  // Send Test Bulk Email to Me
  document.getElementById("send-test-bulk-btn")?.addEventListener("click", async () => {
    const toEmail = prompt("Enter your destination test email address:", "sairamsaladi3@gmail.com");
    if (!toEmail) return;

    const subject = document.getElementById("bulk-email-subject")?.value || "Test Circular";
    const message = document.getElementById("bulk-email-body")?.value || "Test content.";

    try {
      showToast("Dispatching Test", `Sending test notice to ${toEmail}...`, "info");
      await dispatchDirectEmail({
        toEmail,
        subject,
        message,
        recipientName: "Administrator / Faculty"
      });
      showToast("Test Email Delivered!", `Delivered to ${toEmail} successfully.`, "success");
    } catch (err) {
      showToast("Test Failed", err.message, "error");
    }
  });

  // Real Bulk Form Submission & Progress Modal
  bulkForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("bulk-email-subject").value.trim();
    const priority = document.getElementById("bulk-email-priority").value;
    const department = document.getElementById("bulk-email-dept").value;
    const targetRole = document.getElementById("bulk-email-role").value;
    const customEmails = document.getElementById("bulk-custom-emails").value.trim();
    const message = document.getElementById("bulk-email-body").value.trim();

    bulkModal?.classList.add("hidden");

    // Launch Live Progress Modal
    const progressModal = document.getElementById("bulk-progress-modal");
    const barFill = document.getElementById("progress-bar-fill");
    const counterText = document.getElementById("progress-counter-text");
    const percentText = document.getElementById("progress-percent-text");
    const logsContainer = document.getElementById("progress-logs-container");
    const completeActions = document.getElementById("progress-complete-actions");

    if (progressModal) {
      progressModal.classList.remove("hidden");
      if (barFill) barFill.style.width = "5%";
      if (logsContainer) logsContainer.innerHTML = `<div class="text-blue-400">Initiating real bulk transmission for "${title}"...</div>`;
      if (completeActions) completeActions.classList.add("hidden");
    }

    try {
      const result = await dispatchRealBulkEmailToAllUsers({
        title,
        subject: title,
        message,
        priority,
        department,
        targetRole,
        customEmails,
        onProgress: (prog) => {
          const pct = Math.round((prog.current / Math.max(prog.total, 1)) * 100);
          if (barFill) barFill.style.width = `${pct}%`;
          if (counterText) counterText.innerText = `Sent ${prog.current} of ${prog.total} mailboxes`;
          if (percentText) percentText.innerText = `${pct}%`;

          if (logsContainer && prog.email) {
            const entry = document.createElement("div");
            entry.className = prog.status === "error" ? "text-rose-400" : "text-emerald-400";
            entry.innerHTML = `<span class="text-slate-500">${new Date().toLocaleTimeString()}</span> • ${prog.status === "error" ? "✗" : "✓"} <strong>${prog.email}</strong> ${prog.status === "error" ? "Failed" : "Delivered"}`;
            logsContainer.appendChild(entry);
            logsContainer.scrollTop = logsContainer.scrollHeight;
          }
        }
      });

      if (barFill) barFill.style.width = "100%";
      if (percentText) percentText.innerText = "100%";
      document.getElementById("progress-title-text").innerText = "🎉 Real Bulk Broadcast Completed!";
      document.getElementById("progress-subtitle-text").innerText = `Successfully delivered to ${result.sentCount} of ${result.totalRecipients} registered mailboxes.`;
      
      if (logsContainer) {
        const summary = document.createElement("div");
        summary.className = "text-emerald-300 font-bold pt-2 border-t border-slate-800";
        summary.innerHTML = `✓ Real bulk broadcast finished. Audit record created in central database.`;
        logsContainer.appendChild(summary);
      }

      if (completeActions) completeActions.classList.remove("hidden");
      showToast("Bulk Broadcast Finished", `Dispatched circular to ${result.sentCount} mailboxes!`, "success");

    } catch (err) {
      console.error("Bulk broadcast exception:", err);
      showToast("Bulk Send Exception", err.message || "Failed to complete bulk sending.", "error");
      if (completeActions) completeActions.classList.remove("hidden");
    }
  });

  document.getElementById("finish-bulk-progress-btn")?.addEventListener("click", () => {
    document.getElementById("bulk-progress-modal")?.classList.add("hidden");
    window.location.reload();
  });

  // Individual blast to Gmail button
  document.querySelectorAll(".send-gmail-notice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const annId = btn.dataset.id;
      const db = getDB();
      const ann = db.announcements.find(a => a.id === annId);
      if (!ann) return;

      const openBulkModal = () => {
        const subjInput = document.getElementById("bulk-email-subject");
        const bodyInput = document.getElementById("bulk-email-body");
        const prioSelect = document.getElementById("bulk-email-priority");
        const deptSelect = document.getElementById("bulk-email-dept");

        if (subjInput) subjInput.value = `[PEC Circular] ${ann.title}`;
        if (bodyInput) bodyInput.value = ann.content;
        if (prioSelect) prioSelect.value = ann.priority || 'important';
        if (deptSelect) deptSelect.value = ann.department || 'All Engineering Departments';

        bulkModal?.classList.remove("hidden");
        updateBulkRecipientBadge();
      };

      openBulkModal();
    });
  });

  // Close Email Preview Modal
  document.getElementById("close-email-preview")?.addEventListener("click", () => {
    document.getElementById("email-preview-modal")?.classList.add("hidden");
  });
}
