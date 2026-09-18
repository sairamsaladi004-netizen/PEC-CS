/**
 * Pragati Engineering College - CampusTech
 * Role-Based Access Control (RBAC) Permission Guard Component
 * Enforces security policies across Student, Club Admin, Faculty Coordinator, and Super Admin personas.
 */

import { getCurrentUser } from '../auth.js';
import { ROLES, normalizeRole, hasPermission } from '../rbac.js';
import { renderAccessDenied } from './accessDenied.js';

export class PermissionGuard {
  /**
   * Evaluates if the current user possesses at least one of the required roles
   */
  static checkRole(allowedRoles = []) {
    const user = getCurrentUser();
    const role = normalizeRole(user?.role);
    return allowedRoles.includes(role);
  }

  /**
   * Evaluates if the current user possesses a specific fine-grained permission string
   */
  static checkPermission(permission) {
    const user = getCurrentUser();
    return hasPermission(user, permission);
  }

  /**
   * Functional guard: executes callback if authorized, otherwise returns renderAccessDenied() markup
   */
  static guard(allowedRoles, callback, fallbackMessage = null) {
    const user = getCurrentUser();
    const role = normalizeRole(user?.role);
    if (!allowedRoles.includes(role)) {
      return renderAccessDenied({
        requiredRole: allowedRoles[0] || ROLES.SUPER_ADMIN,
        message: fallbackMessage
      });
    }
    return callback();
  }
}

/**
 * Guard renderer for Director (Academics) & Principal Super Admin routes
 */
export function renderSuperAdminGuard({ attemptedRoute = "#/admin", message = null } = {}) {
  const user = getCurrentUser();
  const role = normalizeRole(user?.role);
  if (role !== ROLES.SUPER_ADMIN) {
    return renderAccessDenied({
      requiredRole: ROLES.SUPER_ADMIN,
      attemptedRoute,
      message: message || `Access denied. The Executive Admin Console is restricted to <strong>Director(Academics)</strong>. Your active role is <strong>${role}</strong>.`
    });
  }
  return null;
}

/**
 * Guard renderer for Faculty Coordinators & Department Admins
 */
export function renderApprovalsGuard({ attemptedRoute = "#/approvals", message = null } = {}) {
  const user = getCurrentUser();
  const role = normalizeRole(user?.role);
  const allowed = [ROLES.SUPER_ADMIN, ROLES.DEPARTMENT_ADMIN, ROLES.FACULTY_COORDINATOR];
  if (!allowed.includes(role)) {
    return renderAccessDenied({
      requiredRole: ROLES.FACULTY_COORDINATOR,
      attemptedRoute,
      message: message || `Access denied. Event and Certificate approvals require Faculty Coordinator or Administration authority. Your active role is <strong>${role}</strong>.`
    });
  }
  return null;
}

/**
 * Guard renderer for Institutional Analytics
 */
export function renderAnalyticsGuard({ attemptedRoute = "#/analytics", message = null } = {}) {
  const user = getCurrentUser();
  const role = normalizeRole(user?.role);
  const allowed = [ROLES.SUPER_ADMIN, ROLES.DEPARTMENT_ADMIN, ROLES.FACULTY_COORDINATOR, ROLES.CLUB_ADMIN];
  if (!allowed.includes(role)) {
    return renderAccessDenied({
      requiredRole: ROLES.CLUB_ADMIN,
      attemptedRoute,
      message: message || `Access denied. Analytics dashboards are restricted to verified Club Leaders and Faculty Coordinators.`
    });
  }
  return null;
}

export default PermissionGuard;
