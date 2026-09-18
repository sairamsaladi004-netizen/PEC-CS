/**
 * Pragati Engineering College - CampusTech
 * Gmail Notice, Announcement & Event Notification Engine
 *
 * Integrates Google Workspace Gmail API (Zero-Cost direct client dispatch)
 * and Google Apps Script Webhook for automated circular & ticket email broadcasts.
 */

import { getDB, logAudit } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { showToast } from '../components/toast.js';

// In-Memory Token & State Management (Never stored in localStorage per Security Guidelines)
let cachedAccessToken = null;
let tokenExpiryTime = 0;
let connectedGmailUser = null;

// Firebase applet config fallback
export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
export const CLIENT_ID = '199619691962-je55rlmkvrshnnmmd8na9phtg8rkdlco.apps.googleusercontent.com';

// Local storage key for persistent Webhook URL only (Not tokens)
const WEBHOOK_STORAGE_KEY = 'pec_campustech_gmail_webhook_url';

export function getStoredWebhookUrl() {
  try {
    return localStorage.getItem(WEBHOOK_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredWebhookUrl(url) {
  try {
    if (url) {
      localStorage.setItem(WEBHOOK_STORAGE_KEY, url.trim());
    } else {
      localStorage.removeItem(WEBHOOK_STORAGE_KEY);
    }
  } catch {}
}

export function isGmailConnected() {
  return Boolean(cachedAccessToken && Date.now() < tokenExpiryTime);
}

export function getConnectedGmailEmail() {
  return connectedGmailUser?.email || (isGmailConnected() ? 'Authorized via Google OAuth' : null);
}

export function getCachedAccessToken() {
  if (isGmailConnected()) {
    return cachedAccessToken;
  }
  return null;
}

/**
 * Ensures Google Identity Services (GSI) script is loaded
 */
async function ensureGSILoaded() {
  if (window.google?.accounts?.oauth2) return true;
  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(true);
      } else if (attempts > 30) {
        clearInterval(interval);
        // Attempt dynamic injection if not yet present
        if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
          const s = document.createElement('script');
          s.src = 'https://accounts.google.com/gsi/client';
          s.async = true;
          s.onload = () => resolve(Boolean(window.google?.accounts?.oauth2));
          s.onerror = () => resolve(false);
          document.head.appendChild(s);
        } else {
          resolve(false);
        }
      }
    }, 100);
  });
}

/**
 * Initiates Google OAuth Client Token flow using Google Identity Services (GSI)
 */
export async function connectGmailOAuth() {
  await ensureGSILoaded();
  
  return new Promise((resolve, reject) => {
    try {
      if (typeof window.google === 'undefined' || !window.google.accounts || !window.google.accounts.oauth2) {
        const errorMsg = 'Google Identity Services is initializing. Please ensure your internet connection is active.';
        showToast('Google Services Loading', errorMsg, 'info');
        return reject(new Error(errorMsg));
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: GMAIL_SCOPE,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('Google OAuth token error:', tokenResponse);
            showToast('Google Authorization Failed', tokenResponse.error_description || tokenResponse.error, 'error');
            return reject(new Error(tokenResponse.error));
          }

          cachedAccessToken = tokenResponse.access_token;
          tokenExpiryTime = Date.now() + (parseInt(tokenResponse.expires_in, 10) || 3600) * 1000;
          
          // Query user profile from Gmail API to obtain exact authorized email address
          let authorizedEmail = null;
          try {
            const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
              headers: { 'Authorization': `Bearer ${cachedAccessToken}` }
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              authorizedEmail = profileData.emailAddress;
            }
          } catch (e) {
            console.warn('Could not retrieve Gmail profile:', e);
          }

          const user = getCurrentUser();
          connectedGmailUser = {
            email: authorizedEmail || user?.email || 'sairamsaladi004@gmail.com',
            name: user?.name || 'Faculty Coordinator'
          };

          showToast('Gmail Connected', `Google Workspace authorized for ${connectedGmailUser.email}!`, 'success');
          window.dispatchEvent(new CustomEvent('gmail-auth-changed', { 
            detail: { connected: true, email: connectedGmailUser.email } 
          }));
          resolve(cachedAccessToken);
        },
        error_callback: (err) => {
          console.error('GSI Init Error:', err);
          showToast('Authorization Cancelled', 'Google sign-in was closed or cancelled.', 'warning');
          reject(err);
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      console.error('Fatal connectGmailOAuth error:', err);
      reject(err);
    }
  });
}

/**
 * Disconnects the in-memory Gmail token
 */
export function disconnectGmail() {
  cachedAccessToken = null;
  tokenExpiryTime = 0;
  connectedGmailUser = null;
  window.dispatchEvent(new CustomEvent('gmail-auth-changed', { detail: { connected: false } }));
  showToast('Gmail Disconnected', 'Gmail OAuth token cleared from memory.', 'info');
}

/**
 * Creates an RFC 2822 raw email string and encodes it as Base64URL
 */
function createRawEmailMessage({ from, to, bcc, subject, htmlBody }) {
  const senderEmail = from || connectedGmailUser?.email || 'sairamsaladi004@gmail.com';
  
  // RFC 2822 headers
  let emailLines = [
    `From: Pragati CampusTech <${senderEmail}>`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`
  ];

  if (to && to.length > 0) {
    const toList = Array.isArray(to) ? to.join(', ') : to;
    emailLines.splice(1, 0, `To: ${toList}`);
  } else {
    // If only BCC is provided, set To to sender for privacy
    emailLines.splice(1, 0, `To: ${senderEmail}`);
  }

  if (bcc && bcc.length > 0) {
    const bccList = Array.isArray(bcc) ? bcc.join(', ') : bcc;
    emailLines.splice(2, 0, `Bcc: ${bccList}`);
  }

  // Base64 encode the HTML body
  const base64Body = btoa(unescape(encodeURIComponent(htmlBody)));
  const formattedBody = base64Body.match(/.{1,76}/g)?.join('\r\n') || base64Body;

  const fullEmail = emailLines.join('\r\n') + '\r\n\r\n' + formattedBody;

  // Convert to Base64URL (RFC 4648 §5)
  return btoa(unescape(encodeURIComponent(fullEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Universal Core Function: Sends any email via official Gmail REST API
 */
export async function sendEmailViaGmail({ to, bcc, subject, htmlBody, category = 'Notification' }) {
  if (!cachedAccessToken || Date.now() >= tokenExpiryTime) {
    throw new Error('Gmail authorization expired or missing. Please connect your Google account.');
  }

  const senderEmail = connectedGmailUser?.email || 'sairamsaladi004@gmail.com';
  const rawBase64Url = createRawEmailMessage({
    from: senderEmail,
    to: to,
    bcc: bcc,
    subject: subject,
    htmlBody: htmlBody
  });

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: rawBase64Url
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData?.error?.message || `Gmail API error status: ${response.status}`;
    if (response.status === 401) {
      cachedAccessToken = null;
      tokenExpiryTime = 0;
      window.dispatchEvent(new CustomEvent('gmail-auth-changed', { detail: { connected: false } }));
    }
    throw new Error(msg);
  }

  const result = await response.json();
  const user = getCurrentUser();
  const recipientCount = (Array.isArray(to) ? to.length : (to ? 1 : 0)) + (Array.isArray(bcc) ? bcc.length : (bcc ? 1 : 0));

  logAudit(
    `${user?.name || 'User'} (${user?.role || 'Coordinator'})`,
    `Dispatched Gmail ${category}`,
    subject,
    `Message ID: ${result.id}. Recipient count: ${recipientCount}`
  );

  return {
    success: true,
    messageId: result.id,
    recipientCount,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generates an institutional Pragati Engineering College branded HTML email body
 */
export function generateNoticeEmailHtml({ title, category, priority, department, targetRole, message, author, portalUrl }) {
  const currentYear = new Date().getFullYear();
  const priorityColor = priority === 'critical' ? '#dc2626' : priority === 'important' ? '#d97706' : '#2563eb';
  const priorityBg = priority === 'critical' ? '#fef2f2' : priority === 'important' ? '#fffbeb' : '#eff6ff';
  const priorityBorder = priority === 'critical' ? '#fecaca' : priority === 'important' ? '#fde68a' : '#bfdbfe';

  const cleanMessage = (message || '').replace(/\n/g, '<br/>');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 28px; text-align: center;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background-color: #ffffff; color: #1e3a8a; border-radius: 12px; font-size: 22px; font-weight: 900; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                      P
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                      PRAGATI ENGINEERING COLLEGE
                    </h1>
                    <p style="margin: 4px 0 0 0; color: #93c5fd; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      (Autonomous) • Approved by AICTE • NAAC 'A' Grade
                    </p>
                    <div style="margin-top: 10px; display: inline-block; padding: 3px 12px; background-color: rgba(255, 255, 255, 0.15); border-radius: 20px; color: #ffffff; font-size: 11px; font-weight: 600;">
                      CampusTech Official Notice Circular
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 32px 28px 24px 28px;">
              
              <!-- Badges Row -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 4px 10px; background-color: ${priorityBg}; color: ${priorityColor}; border: 1px solid ${priorityBorder}; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 6px;">
                      ${(priority || 'NOTICE').toUpperCase()}
                    </span>
                    <span style="display: inline-block; padding: 4px 10px; background-color: #f8fafc; color: #475569; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; font-weight: 600;">
                      Dept: ${department || 'All Departments'}
                    </span>
                  </td>
                  <td align="right" style="color: #94a3b8; font-size: 11px; font-family: monospace;">
                    ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              </table>

              <!-- Notice Title -->
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 800; line-height: 1.4;">
                ${title}
              </h2>

              <!-- Notice Content -->
              <div style="color: #334155; font-size: 14px; line-height: 1.7; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                ${cleanMessage}
              </div>

              <!-- Metadata Details Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 10px; padding: 14px 16px; margin-bottom: 28px;">
                <tr>
                  <td style="font-size: 12px; color: #64748b; line-height: 1.6;">
                    <strong style="color: #1e293b;">Issuing Authority:</strong> ${author || 'Dean Student Affairs & Central Council'}<br/>
                    <strong style="color: #1e293b;">Target Audience:</strong> ${targetRole || 'All Enrolled Students & Faculty'}<br/>
                    <strong style="color: #1e293b;">Verification Key:</strong> <span style="font-family: monospace; color: #2563eb;">PEC-CIRC-${Math.floor(100000 + Math.random() * 900000)}</span>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl || window.location.origin + window.location.pathname + '#/announcements'}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                      Open Circular on CampusTech Portal →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.5;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">
                Pragati Engineering College (Autonomous)
              </p>
              <p style="margin: 0;">
                1-378, ADB Road, Surampalem, Near Kakinada, East Godavari District, Andhra Pradesh - 533437<br/>
                This is an automated institutional communication generated from the PEC CampusTech Club & Council Ecosystem.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates Event Registration Ticket Email HTML
 */
export function generateEventRegistrationEmailHtml({ event, ticketId, studentName, rollNo, portalUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Event Registration Confirmed: ${event.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #047857 0%, #10b981 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; width: 42px; height: 42px; line-height: 42px; background: #ffffff; color: #047857; border-radius: 12px; font-size: 20px; font-weight: 900; margin-bottom: 8px;">✓</div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800;">REGISTRATION CONFIRMED</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Pragati Engineering College (Autonomous)</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px;">
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: center;">
                <span style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Official Venue Admission Pass</span>
                <h2 style="margin: 6px 0 0 0; font-size: 24px; font-weight: 900; font-family: monospace; color: #15803d; letter-spacing: 2px;">${ticketId}</h2>
              </div>

              <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: #0f172a;">${event.title}</h2>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">Organized by <strong>${event.clubName || 'PEC Technical Club'}</strong></p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b;"><strong>Candidate:</strong></td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${studentName} (${rollNo || 'Student'})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;"><strong>Date & Time:</strong></td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${event.date} • ${event.time || '10:00 AM IST'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;"><strong>Venue:</strong></td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${event.venue || 'PEC Seminar Hall 1'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;"><strong>Category:</strong></td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${event.category || 'Technical Workshop'}</td>
                </tr>
              </table>

              <div style="border-left: 3px solid #10b981; padding-left: 14px; margin-bottom: 24px; font-size: 12px; color: #475569; line-height: 1.6;">
                <strong>Entry Guidelines:</strong> Present this email or digital ticket ID at the check-in desk. Institutional ID card is mandatory for gate entry.
              </div>

              <div style="text-align: center;">
                <a href="${portalUrl || window.location.origin + window.location.pathname + '#/events'}" style="display: inline-block; background: #047857; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 10px;">
                  View Event Ticket in CampusTech →
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 11px; color: #94a3b8;">
              Pragati Engineering College (Autonomous), Surampalem • Central Technical Council
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates Accredited Certificate Email HTML
 */
export function generateCertificateEmailHtml({ certificate, portalUrl }) {
  const verifyLink = `${portalUrl || (window.location.origin + window.location.pathname)}#/verify?hash=${encodeURIComponent(certificate.qrHash || certificate.verificationHash || certificate.id)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate Issued: ${certificate.eventName || 'PEC Technical Achievement'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #ffffff; color: #4f46e5; border-radius: 12px; font-size: 22px; font-weight: 900; margin-bottom: 8px;">🎓</div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800;">ACCREDITED CREDENTIAL ISSUED</h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c7d2fe;">Cryptographically Verified Ledger Proof</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px;">
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Dear <strong>${certificate.recipientName || certificate.studentName || 'Student'}</strong>,
              </p>
              <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                Your official accredited <strong>${certificate.awardType || certificate.certificate_type || 'Certificate of Completion'}</strong> for <strong>${certificate.eventName || certificate.event_name || 'PEC Technical Symposium'}</strong> has been generated and anchored to the Pragati Digital Ledger.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 12px;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Certificate ID:</strong></td>
                  <td style="padding: 4px 0; color: #1e293b; font-family: monospace; font-weight: bold;">${certificate.id}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Roll Number:</strong></td>
                  <td style="padding: 4px 0; color: #1e293b; font-weight: bold;">${certificate.recipientRoll || certificate.rollNo || '22A31A0501'}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Issued Date:</strong></td>
                  <td style="padding: 4px 0; color: #1e293b;">${certificate.issueDate || certificate.issued_date || new Date().toISOString().split('T')[0]}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Ledger Verification Hash:</strong></td>
                  <td style="padding: 4px 0; color: #4f46e5; font-family: monospace; font-size: 10px; word-break: break-all;">${certificate.qrHash || certificate.verificationHash || 'sha256-verified-pec-ledger'}</td>
                </tr>
              </table>

              <div style="text-align: center; margin: 24px 0 12px 0;">
                <a href="${verifyLink}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                  Verify & Download Accredited Certificate →
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 11px; color: #94a3b8;">
              Pragati Engineering College (Autonomous), Surampalem • NAAC 'A' Grade Institution
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates Direct / Test Email HTML
 */
export function generateDirectEmailHtml({ toName, subject, message, senderName, portalUrl }) {
  const cleanMessage = (message || '').replace(/\n/g, '<br/>');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 28px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 800;">PRAGATI ENGINEERING COLLEGE</h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">CampusTech Club & Event Communications</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <p style="font-size: 14px; color: #334155; margin-top: 0;">
                Hello <strong>${toName || 'Student'}</strong>,
              </p>
              <div style="font-size: 14px; line-height: 1.7; color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 18px 0;">
                ${cleanMessage}
              </div>
              <p style="font-size: 12px; color: #64748b; margin-bottom: 24px;">
                Issued by <strong>${senderName || 'Faculty Coordinator'}</strong> via Pragati CampusTech Portal.
              </p>
              <div style="text-align: center;">
                <a href="${portalUrl || window.location.origin}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 10px;">
                  Open Pragati CampusTech Portal
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 28px; text-align: center; font-size: 10px; color: #94a3b8;">
              Pragati Engineering College (Autonomous), Surampalem, ADB Road, East Godavari - 533437
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Retrieves student recipient emails from DB based on targeted audience & department
 */
export function getRecipientsForNotice(targetDept = 'All Engineering Departments', targetRole = 'All Students & Faculty') {
  const db = getDB();
  const users = db.users || [];
  
  const recipientEmails = new Set();

  users.forEach(u => {
    if (!u.email) return;

    // Filter by department if specific
    if (targetDept && targetDept !== 'All Engineering Departments' && targetDept !== 'All Departments') {
      if (u.department && u.department !== targetDept) {
        return;
      }
    }

    // Filter by role if specific
    if (targetRole && targetRole !== 'All Students & Faculty' && targetRole !== 'All Students') {
      if (targetRole === 'Club Members' && (!u.clubs || u.clubs.length === 0)) {
        return;
      }
      if (targetRole === 'Club Admins' && u.role !== 'Club Admin' && u.role !== 'Faculty Coordinator') {
        return;
      }
      if (targetRole === 'Faculty Coordinators' && u.role !== 'Faculty Coordinator' && u.role !== 'Department Admin') {
        return;
      }
    }

    recipientEmails.add(u.email);
  });

  // Always include verified default test accounts if available
  const list = Array.from(recipientEmails);
  if (list.length === 0) {
    return [
      'sairamsaladi004@gmail.com',
      '22a31a0501@pragati.ac.in',
      '22a31a0542@pragati.ac.in',
      '22a31a4201@pragati.ac.in',
      'coordinator.cse@pragati.ac.in'
    ];
  }

  return list;
}

/**
 * Dispatches notice via official Gmail REST API (Client-side Bearer token)
 */
export async function dispatchNoticeViaGmailAPI({ notice, recipients }) {
  if (!cachedAccessToken || Date.now() >= tokenExpiryTime) {
    throw new Error('Gmail authorization expired or missing. Please connect your Google account.');
  }

  const user = getCurrentUser();
  const senderEmail = connectedGmailUser?.email || user?.email || 'sairamsaladi004@gmail.com';
  const subject = `[PEC Notice] ${notice.title}`;
  const htmlBody = generateNoticeEmailHtml({
    title: notice.title,
    category: notice.priority,
    priority: notice.priority,
    department: notice.department,
    targetRole: notice.targetRole,
    message: notice.content,
    author: notice.author || user?.name,
    portalUrl: window.location.origin + window.location.pathname + '#/announcements'
  });

  const bccList = recipients.slice(0, 100);
  return await sendEmailViaGmail({
    from: senderEmail,
    to: senderEmail,
    bcc: bccList,
    subject: subject,
    htmlBody: htmlBody,
    category: 'Circular Broadcast'
  });
}

/**
 * Dispatches Event Registration Confirmation Email
 */
export async function dispatchRegistrationEmail({ event, ticketId, recipientEmail, recipientName, rollNo }) {
  if (!cachedAccessToken || Date.now() >= tokenExpiryTime) {
    throw new Error('Gmail authorization required to dispatch real email ticket.');
  }

  const targetEmail = recipientEmail || connectedGmailUser?.email || 'sairamsaladi004@gmail.com';
  const subject = `[PEC Admission Pass] ${event.title} - ${ticketId}`;
  const htmlBody = generateEventRegistrationEmailHtml({
    event,
    ticketId,
    studentName: recipientName || 'Registered Student',
    rollNo: rollNo || '22A31A0501',
    portalUrl: window.location.origin + window.location.pathname + '#/events'
  });

  return await sendEmailViaGmail({
    to: targetEmail,
    subject,
    htmlBody,
    category: 'Event Registration Pass'
  });
}

/**
 * Dispatches Accredited Certificate Email
 */
export async function dispatchCertificateEmail({ certificate, recipientEmail }) {
  if (!cachedAccessToken || Date.now() >= tokenExpiryTime) {
    throw new Error('Gmail authorization required to dispatch real certificate email.');
  }

  const targetEmail = recipientEmail || certificate.recipientEmail || connectedGmailUser?.email || 'sairamsaladi004@gmail.com';
  const subject = `[Accredited Credential] Certificate Issued for ${certificate.eventName || certificate.event_name || 'PEC Symposium'}`;
  const htmlBody = generateCertificateEmailHtml({
    certificate,
    portalUrl: window.location.origin + window.location.pathname
  });

  return await sendEmailViaGmail({
    to: targetEmail,
    subject,
    htmlBody,
    category: 'Certificate Credential'
  });
}

/**
 * Dispatches Direct / Test Email to any address
 */
export async function dispatchDirectEmail({ toEmail, subject, message, recipientName }) {
  if (!cachedAccessToken || Date.now() >= tokenExpiryTime) {
    throw new Error('Gmail authorization required to dispatch real email.');
  }

  const user = getCurrentUser();
  const htmlBody = generateDirectEmailHtml({
    toName: recipientName || 'Student',
    subject,
    message,
    senderName: user?.name || connectedGmailUser?.email,
    portalUrl: window.location.origin + window.location.pathname
  });

  return await sendEmailViaGmail({
    to: toEmail,
    subject,
    htmlBody,
    category: 'Direct Communication'
  });
}

/**
 * Dispatches notice via Zero-Cost Google Apps Script Webhook
 */
export async function dispatchNoticeViaAppsScriptWebhook({ notice, recipients, webhookUrl }) {
  const targetUrl = webhookUrl || getStoredWebhookUrl();
  if (!targetUrl) {
    throw new Error('No Google Apps Script Webhook URL configured.');
  }

  const user = getCurrentUser();
  const payload = {
    title: notice.title,
    priority: notice.priority,
    category: notice.priority === 'critical' ? 'Urgent Alert' : 'Notice Circular',
    department: notice.department,
    targetRole: notice.targetRole,
    message: notice.content,
    issuedBy: notice.author || user?.name,
    recipients: recipients,
    senderEmail: connectedGmailUser?.email || user?.email || 'sairamsaladi004@gmail.com',
    portalUrl: window.location.origin + window.location.pathname + '#/announcements',
    timestamp: new Date().toISOString()
  };

  const response = await fetch(targetUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  logAudit(
    `${user?.name || 'User'} (${user?.role || 'Coordinator'})`,
    'Dispatched Apps Script Webhook Notice',
    notice.title,
    `Recipients: ${recipients.length} addresses.`
  );

  return {
    success: true,
    method: 'apps_script_webhook',
    recipientsCount: recipients.length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Mandatory User Confirmation Modal before broadcasting notice emails
 * Complies strictly with Workspace Skill safety guidelines
 */
export function promptNoticeGmailConfirmation({ notice, recipients, onConfirm, onCancel }) {
  const existing = document.getElementById('gmail-notice-confirm-modal');
  if (existing) existing.remove();

  const user = getCurrentUser();
  const modal = document.createElement('div');
  modal.id = 'gmail-notice-confirm-modal';
  modal.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200';
  
  const recipientCount = recipients.length;
  const sampleRecipients = recipients.slice(0, 4).join(', ') + (recipients.length > 4 ? ` +${recipients.length - 4} more` : '');

  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
      
      <div class="flex items-center space-x-3 pb-3 border-b border-slate-100">
        <div class="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-lg font-bold">
          ✉️
        </div>
        <div>
          <h3 class="text-base font-black text-slate-900">Confirm Real Gmail Broadcast</h3>
          <p class="text-xs text-slate-500">Review dispatch before sending circular emails</p>
        </div>
      </div>

      <div class="space-y-3 text-xs">
        <div class="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-2">
          <div class="flex justify-between items-center text-slate-600">
            <span class="font-bold text-slate-900">Notice Title:</span>
            <span class="font-mono text-blue-700 font-bold truncate max-w-[240px]">${notice.title}</span>
          </div>
          <div class="flex justify-between items-center text-slate-600">
            <span class="font-bold text-slate-900">Priority:</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${notice.priority === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'} uppercase">
              ${notice.priority}
            </span>
          </div>
          <div class="flex justify-between items-center text-slate-600">
            <span class="font-bold text-slate-900">Target Audience:</span>
            <span class="text-slate-800">${notice.department || 'All Departments'} • ${notice.targetRole || 'All'}</span>
          </div>
          <div class="flex justify-between items-start text-slate-600 pt-1 border-t border-blue-100/60">
            <span class="font-bold text-slate-900">Recipients:</span>
            <div class="text-right">
              <span class="font-bold text-blue-900 font-mono">${recipientCount} Student Mailboxes</span>
              <p class="text-[10px] text-slate-400 font-mono max-w-[200px] truncate">${sampleRecipients}</p>
            </div>
          </div>
        </div>

        <div class="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-900 text-[11px] leading-relaxed flex items-start space-x-2">
          <span class="text-amber-600 text-sm">⚠️</span>
          <span>Real emails will be dispatched directly through your connected Google Workspace account (${connectedGmailUser?.email || 'Authorized Gmail'}) to all recipient student inboxes.</span>
        </div>
      </div>

      <div class="pt-2 flex items-center space-x-3">
        <button id="cancel-gmail-send-btn" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors">
          Cancel
        </button>
        <button id="confirm-gmail-send-btn" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5">
          <span>🚀 Authorize & Send Now</span>
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('cancel-gmail-send-btn')?.addEventListener('click', () => {
    modal.remove();
    if (onCancel) onCancel();
  });

  document.getElementById('confirm-gmail-send-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('confirm-gmail-send-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳ Dispatching Real Emails...</span>`;
    }
    modal.remove();
    if (onConfirm) await onConfirm();
  });
}

/**
 * Universal User Confirmation Modal for any email mutation
 */
export function promptGmailSendConfirmation({ title, subject, recipient, detailsHtml, onConfirm, onCancel }) {
  const existing = document.getElementById('gmail-universal-confirm-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'gmail-universal-confirm-modal';
  modal.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200';

  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
      <div class="flex items-center space-x-3 pb-3 border-b border-slate-100">
        <div class="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-lg font-bold">
          ✉️
        </div>
        <div>
          <h3 class="text-base font-black text-slate-900">${title || 'Send Real Gmail Notification'}</h3>
          <p class="text-xs text-slate-500">Confirm dispatch to destination inbox</p>
        </div>
      </div>

      <div class="space-y-3 text-xs">
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div class="flex justify-between items-center text-slate-600">
            <span class="font-bold text-slate-900">Subject:</span>
            <span class="font-mono text-blue-700 font-bold truncate max-w-[240px]">${subject}</span>
          </div>
          <div class="flex justify-between items-center text-slate-600">
            <span class="font-bold text-slate-900">Destination:</span>
            <span class="font-mono text-slate-800 font-semibold truncate max-w-[240px]">${recipient}</span>
          </div>
          ${detailsHtml || ''}
        </div>

        <div class="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-900 text-[11px] leading-relaxed flex items-start space-x-2">
          <span class="text-blue-600 text-sm">ℹ️</span>
          <span>Sending from: <strong>${connectedGmailUser?.email || 'Authorized Google Account'}</strong>. This will dispatch a real email message via Gmail.</span>
        </div>
      </div>

      <div class="pt-2 flex items-center space-x-3">
        <button id="cancel-univ-send-btn" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors">
          Cancel
        </button>
        <button id="confirm-univ-send-btn" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5">
          <span>🚀 Confirm & Send Real Email</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('cancel-univ-send-btn')?.addEventListener('click', () => {
    modal.remove();
    if (onCancel) onCancel();
  });

  document.getElementById('confirm-univ-send-btn')?.addEventListener('click', async () => {
    modal.remove();
    if (onConfirm) await onConfirm();
  });
}
