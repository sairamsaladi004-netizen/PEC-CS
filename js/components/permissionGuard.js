// Pragati Engineering College (PEC Autonomous) - CampusTech
// Centralized PermissionGuard Component for Dynamic UI Rendering

import { getCurrentUser } from '../auth.js';
import { ROLES, normalizeRole, hasRolePermission, isUserAuthorizedForClub } from '../rbac.js';
import { getSupabaseClient, isSupabaseReady } from '../supabaseClient.js';
import { getDB } from '../db.js';

/**
 * Standardizes role string inputs to match canonical ROLES enum values
 */
export function canonicalizeRole(roleInput) {
  if (!roleInput) return ROLES.GUEST;
  const str = String(roleInput).trim().toLowerCase();
  
  if (str.includes('super') || str === 'admin') return ROLES.SUPER_ADMIN;
  if (str.includes('faculty') || str.includes('coord') || str.includes('professor')) return ROLES.FACULTY_COORDINATOR;
  if (str.includes('club admin') || str.includes('lead') || str.includes('student leader') || str.includes('president')) return ROLES.CLUB_ADMIN;
  if (str.includes('student') || str.includes('member') || str.includes('scholar')) return ROLES.STUDENT;
  if (str.includes('guest') || str.includes('public')) return ROLES.GUEST;
  
  return normalizeRole(roleInput);
}

/**
 * Evaluates whether a user satisfies role, permission, and club criteria.
 * @param {Object} options
 * @param {Object} [options.user] - Optional user override (defaults to getCurrentUser())
 * @param {Array<string>|string} [options.roles] - Allowed roles (e.g., ['Student', 'Faculty', 'Club Admin', 'Super Admin'])
 * @param {Array<string>|string} [options.permissions] - Required permissions (e.g., ['events.approve', 'analytics.view'])
 * @param {string} [options.clubId] - Club ID for club-scoped checks
 * @param {boolean} [options.requireAllPermissions=false] - If true, requires all listed permissions instead of any
 * @returns {boolean} True if authorized
 */
export function checkUserAccess({
  user = null,
  roles = null,
  permissions = null,
  clubId = null,
  requireAllPermissions = false
} = {}) {
  const activeUser = user || getCurrentUser();
  if (!activeUser) return false;

  const currentRole = normalizeRole(activeUser.role);

  // Super Admin always bypasses all checks
  if (currentRole === ROLES.SUPER_ADMIN) {
    return true;
  }

  // 1. Role Check
  if (roles) {
    const roleList = (Array.isArray(roles) ? roles : [roles]).map(canonicalizeRole);
    if (!roleList.includes(currentRole)) {
      return false;
    }
  }

  // 2. Club Scope Check
  if (clubId) {
    if (!isUserAuthorizedForClub(activeUser, clubId)) {
      return false;
    }
  }

  // 3. Permission Check
  if (permissions) {
    const permList = Array.isArray(permissions) ? permissions : [permissions];
    if (permList.length > 0) {
      if (requireAllPermissions) {
        const hasAll = permList.every(p => hasRolePermission(currentRole, p));
        if (!hasAll) return false;
      } else {
        const hasAny = permList.some(p => hasRolePermission(currentRole, p));
        if (!hasAny) return false;
      }
    }
  }

  return true;
}

/**
 * PermissionGuard: Dynamically renders UI markup based on user permissions/roles.
 * If authorized, returns content. If unauthorized, returns fallback (or empty string).
 * 
 * @param {Object} options
 * @param {string} options.content - The HTML content to render when authorized
 * @param {string} [options.fallback=""] - Optional HTML content to render when unauthorized
 * @param {Array<string>|string} [options.roles] - Allowed roles (Student, Faculty, Club Admin, Super Admin)
 * @param {Array<string>|string} [options.permissions] - Required permissions
 * @param {string} [options.clubId] - Optional club ID for club-scoped checks
 * @param {Object} [options.user] - Optional user override
 * @returns {string} Rendered HTML string
 */
export function PermissionGuard({
  content = "",
  fallback = "",
  roles = null,
  permissions = null,
  clubId = null,
  user = null
} = {}) {
  const isAuthorized = checkUserAccess({ user, roles, permissions, clubId });
  return isAuthorized ? content : fallback;
}

/**
 * Shorthand helper for guarding Approvals UI section (e.g., Event/Member/Certificate approvals)
 */
export function renderApprovalsGuard(content, fallback = "") {
  return PermissionGuard({
    roles: [ROLES.SUPER_ADMIN, ROLES.FACULTY_COORDINATOR, ROLES.CLUB_ADMIN],
    permissions: ["events.approve", "members.approve", "certificates.approve"],
    content,
    fallback
  });
}

/**
 * Shorthand helper for guarding Analytics UI section
 */
export function renderAnalyticsGuard(content, fallback = "") {
  return PermissionGuard({
    roles: [ROLES.SUPER_ADMIN, ROLES.FACULTY_COORDINATOR, ROLES.CLUB_ADMIN],
    permissions: ["analytics.view"],
    content,
    fallback
  });
}

/**
 * Shorthand helper for guarding Super Admin governance sections
 */
export function renderSuperAdminGuard(content, fallback = "") {
  return PermissionGuard({
    roles: [ROLES.SUPER_ADMIN],
    content,
    fallback
  });
}

/**
 * Shorthand helper for guarding Faculty Coordinator sections
 */
export function renderFacultyGuard(content, fallback = "") {
  return PermissionGuard({
    roles: [ROLES.SUPER_ADMIN, ROLES.FACULTY_COORDINATOR],
    content,
    fallback
  });
}

/**
 * Shorthand helper for guarding Student-only or authenticated student sections
 */
export function renderStudentGuard(content, fallback = "") {
  return PermissionGuard({
    roles: [ROLES.STUDENT, ROLES.SUPER_ADMIN],
    content,
    fallback
  });
}

/**
 * Asynchronously synchronizes the authenticated user's role with Supabase profiles table.
 * Falls back to local session state if Supabase is offline or not configured.
 */
export async function syncUserRoleFromSupabase(userId) {
  if (!userId) return null;
  const db = getDB();
  const localUser = (db.users || []).find(u => u.id === userId);

  if (isSupabaseReady()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, department, assigned_clubs, is_active')
        .eq('id', userId)
        .single();

      if (!error && data && data.role) {
        const canonicalRole = canonicalizeRole(data.role);
        if (localUser) {
          localUser.role = canonicalRole;
          if (data.assigned_clubs) {
            localUser.assignedClubs = Array.isArray(data.assigned_clubs) ? data.assigned_clubs : [data.assigned_clubs];
          }
        }
        return {
          id: userId,
          role: canonicalRole,
          source: 'supabase',
          assignedClubs: data.assigned_clubs || localUser?.assignedClubs || []
        };
      }
    } catch (err) {
      console.warn("[PermissionGuard] Supabase role sync notice:", err.message);
    }
  }

  // Local state fallback
  return {
    id: userId,
    role: localUser ? normalizeRole(localUser.role) : ROLES.GUEST,
    source: 'local_session',
    assignedClubs: localUser?.assignedClubs || []
  };
}

/**
 * Scans DOM tree and dynamically hides/shows elements configured with declarative HTML guard attributes:
 * - data-guard-roles="Super Admin,Faculty Coordinator"
 * - data-guard-permissions="events.approve,analytics.view"
 * - data-guard-club="I4-08"
 * - data-guard-fallback="hidden" | "remove" | "lock-badge"
 */
export function applyDOMPermissionGuards(container = document) {
  const targetElements = container.querySelectorAll('[data-guard-roles], [data-guard-permissions], [data-guard-club]');
  const user = getCurrentUser();

  targetElements.forEach(el => {
    const rawRoles = el.getAttribute('data-guard-roles');
    const rawPerms = el.getAttribute('data-guard-permissions');
    const clubId = el.getAttribute('data-guard-club');
    const fallbackMode = el.getAttribute('data-guard-fallback') || 'hidden';

    const roles = rawRoles ? rawRoles.split(',').map(r => r.trim()) : null;
    const permissions = rawPerms ? rawPerms.split(',').map(p => p.trim()) : null;

    const isAllowed = checkUserAccess({ user, roles, permissions, clubId });

    if (!isAllowed) {
      if (fallbackMode === 'remove') {
        el.remove();
      } else if (fallbackMode === 'lock-badge') {
        el.classList.add('opacity-50', 'pointer-events-none');
        el.setAttribute('title', `Access restricted to ${rawRoles || 'authorized roles'}`);
      } else {
        el.classList.add('hidden');
      }
    } else {
      el.classList.remove('hidden', 'opacity-50', 'pointer-events-none');
    }
  });
}

// Auto-wire DOM guards when auth persona changes
if (typeof window !== 'undefined' && !window._hasDOMPermissionGuardListener) {
  window._hasDOMPermissionGuardListener = true;
  window.addEventListener('auth-changed', () => {
    applyDOMPermissionGuards(document);
  });
}
