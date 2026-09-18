// Access Denied component for client-side RBAC guard enforcement
import { getCurrentUser, switchUser, getAllDemoAccounts } from '../auth.js';
import { ROLES } from '../rbac.js';

export function renderAccessDenied({
  requiredRole = "Super Admin",
  requiredPermission = null,
  attemptedRoute = "",
  clubId = null,
  message = null
}) {
  const user = getCurrentUser();
  const accounts = getAllDemoAccounts();
  const currentRole = user?.role || ROLES.GUEST;

  // Find a demo account that has the required role
  const targetDemo = accounts.find(a => a.role === requiredRole);

  const defaultMsg = clubId
    ? `Access denied. You are logged in as <strong>${currentRole}</strong> and do not have authority to manage or view records for <strong>Club ${clubId}</strong>.`
    : `Access to <code>${attemptedRoute || 'this section'}</code> requires the <strong>${requiredRole}</strong> role. Your current active persona is <strong>${user?.name || 'Guest'} (${currentRole})</strong>.`;

  return `
    <div class="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-200 shadow-xl space-y-6 text-center">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-3xl shadow-sm">
        🛡️
      </div>

      <div class="space-y-2">
        <span class="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
          RBAC Authorization Enforcement (403 Forbidden)
        </span>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
        <p class="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
          ${message || defaultMsg}
        </p>
      </div>

      <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
        <div class="font-bold text-slate-700 flex items-center justify-between">
          <span>Security & Scope Verification:</span>
          <span class="font-mono text-rose-600 font-bold">Policy Enforced</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
          <div>• Current User: <strong class="text-slate-800">${user?.name || 'Public Guest'}</strong></div>
          <div>• Current Role: <strong class="text-slate-800">${currentRole}</strong></div>
          <div>• Required Role: <strong class="text-rose-700">${requiredRole}</strong></div>
          ${clubId ? `<div>• Target Club: <strong class="text-rose-700">${clubId}</strong></div>` : `<div>• Permission: <strong class="text-rose-700">${requiredPermission || 'Strict RBAC'}</strong></div>`}
        </div>
      </div>

      <!-- Quick Persona Switch to Authorize -->
      ${targetDemo ? `
        <div class="pt-2 border-t border-slate-100 space-y-3">
          <p class="text-xs text-slate-500">
            For testing and demonstration, switch to the authorized demo persona:
          </p>
          <button id="quick-switch-authorized-role-btn" data-user-id="${targetDemo.id}" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all inline-flex items-center space-x-2">
            <span>Switch to ${targetDemo.name} (${targetDemo.role})</span>
            <span>→</span>
          </button>
        </div>
      ` : ''}

      <div class="pt-2 flex items-center justify-center space-x-3">
        <a href="#/" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all">
          ← Return to Home
        </a>
        <a href="#/login" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all">
          Sign In with Another Account
        </a>
      </div>
    </div>
  `;
}

export function attachAccessDeniedEvents() {
  const btn = document.getElementById("quick-switch-authorized-role-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const userId = btn.getAttribute("data-user-id");
      if (userId) {
        switchUser(userId);
        window.location.reload();
      }
    });
  }
}
