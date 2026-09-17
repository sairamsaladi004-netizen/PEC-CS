// Frontend Role-Based Access Control (RBAC) Module

export const ROLES = {
  SUPER_ADMIN: "Director(Academics)",
  FACULTY_COORDINATOR: "Faculty Coordinator",
  CLUB_ADMIN: "Club Admin",
  STUDENT: "Student",
  GUEST: "Guest"
};

export function normalizeRole(role) {
  if (!role) return ROLES.GUEST;
  const r = role.trim();
  if (r === "Super Admin" || r === "SUPER_ADMIN" || r === "Director(Academics)" || r === "Director (Academics)" || r === "Director") return ROLES.SUPER_ADMIN;
  if (r === "Faculty Coordinator" || r === "Club Coordinator" || r === "FACULTY_COORD") return ROLES.FACULTY_COORDINATOR;
  if (r === "Club Admin" || r === "Club Student Leader" || r === "Club Lead" || r === "CLUB_ADMIN") return ROLES.CLUB_ADMIN;
  if (r === "Student" || r === "Club Member" || r === "STUDENT") return ROLES.STUDENT;
  if (r === "Guest" || r === "Public User") return ROLES.GUEST;
  return r;
}

export const PERMISSIONS = {
  // Users
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",

  // Roles
  ROLES_VIEW: "roles.view",
  ROLES_ASSIGN: "roles.assign",
  ROLES_UPDATE: "roles.update",

  // Clubs
  CLUBS_VIEW: "clubs.view",
  CLUBS_CREATE: "clubs.create",
  CLUBS_UPDATE: "clubs.update",
  CLUBS_DELETE: "clubs.delete",
  CLUBS_APPROVE: "clubs.approve",

  // Members
  MEMBERS_VIEW: "members.view",
  MEMBERS_APPROVE: "members.approve",
  MEMBERS_REMOVE: "members.remove",

  // Events
  EVENTS_VIEW: "events.view",
  EVENTS_CREATE: "events.create",
  EVENTS_UPDATE: "events.update",
  EVENTS_DELETE: "events.delete",
  EVENTS_APPROVE: "events.approve",

  // Attendance
  ATTENDANCE_VIEW: "attendance.view",
  ATTENDANCE_MARK: "attendance.mark",
  ATTENDANCE_UPDATE: "attendance.update",
  ATTENDANCE_APPROVE: "attendance.approve",

  // Certificates
  CERTIFICATES_VIEW: "certificates.view",
  CERTIFICATES_REQUEST: "certificates.request",
  CERTIFICATES_GENERATE: "certificates.generate",
  CERTIFICATES_APPROVE: "certificates.approve",

  // Projects
  PROJECTS_VIEW: "projects.view",
  PROJECTS_CREATE: "projects.create",
  PROJECTS_UPDATE: "projects.update",
  PROJECTS_APPROVE: "projects.approve",

  // Resources
  RESOURCES_VIEW: "resources.view",
  RESOURCES_CREATE: "resources.create",
  RESOURCES_UPDATE: "resources.update",
  RESOURCES_DELETE: "resources.delete",

  // Announcements
  ANNOUNCEMENTS_VIEW: "announcements.view",
  ANNOUNCEMENTS_CREATE: "announcements.create",
  ANNOUNCEMENTS_UPDATE: "announcements.update",
  ANNOUNCEMENTS_DELETE: "announcements.delete",

  // Reports
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",

  // Analytics & Logs
  ANALYTICS_VIEW: "analytics.view",
  AUDIT_LOGS_VIEW: "audit_logs.view",

  // Settings
  SETTINGS_MANAGE: "settings.manage"
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.FACULTY_COORDINATOR]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.CLUBS_VIEW,
    PERMISSIONS.CLUBS_UPDATE,
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.MEMBERS_APPROVE,
    PERMISSIONS.MEMBERS_REMOVE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_UPDATE,
    PERMISSIONS.EVENTS_APPROVE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.ATTENDANCE_UPDATE,
    PERMISSIONS.ATTENDANCE_APPROVE,
    PERMISSIONS.CERTIFICATES_VIEW,
    PERMISSIONS.CERTIFICATES_REQUEST,
    PERMISSIONS.CERTIFICATES_GENERATE,
    PERMISSIONS.CERTIFICATES_APPROVE,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.PROJECTS_APPROVE,
    PERMISSIONS.RESOURCES_VIEW,
    PERMISSIONS.RESOURCES_CREATE,
    PERMISSIONS.RESOURCES_UPDATE,
    PERMISSIONS.RESOURCES_DELETE,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_CREATE,
    PERMISSIONS.ANNOUNCEMENTS_UPDATE,
    PERMISSIONS.ANNOUNCEMENTS_DELETE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW
  ],

  [ROLES.CLUB_ADMIN]: [
    PERMISSIONS.CLUBS_VIEW,
    PERMISSIONS.CLUBS_UPDATE,
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.MEMBERS_APPROVE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_UPDATE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.CERTIFICATES_VIEW,
    PERMISSIONS.CERTIFICATES_REQUEST,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.RESOURCES_VIEW,
    PERMISSIONS.RESOURCES_CREATE,
    PERMISSIONS.RESOURCES_UPDATE,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_CREATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.CLUBS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.CERTIFICATES_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.RESOURCES_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.REPORTS_VIEW
  ],

  [ROLES.GUEST]: [
    PERMISSIONS.CLUBS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.RESOURCES_VIEW
  ]
};

export function hasRolePermission(role, permission) {
  const normRole = normalizeRole(role);
  if (normRole === ROLES.SUPER_ADMIN) return true;
  const list = ROLE_PERMISSIONS[normRole] || [];
  return list.includes(permission);
}

export function isUserAuthorizedForClub(user, clubId) {
  if (!user) return false;
  const normRole = normalizeRole(user.role);
  if (normRole === ROLES.SUPER_ADMIN) return true;
  if (!clubId) return false;
  const targetId = clubId.toString().trim().toUpperCase();

  if (normRole === ROLES.FACULTY_COORDINATOR) {
    const assigned = Array.isArray(user.assignedClubs) ? user.assignedClubs : [];
    return assigned.some(c => c.toUpperCase() === targetId);
  }

  if (normRole === ROLES.CLUB_ADMIN) {
    if (user.clubId && user.clubId.toUpperCase() === targetId) return true;
    if (Array.isArray(user.assignedClubs) && user.assignedClubs.some(c => c.toUpperCase() === targetId)) return true;
    if (Array.isArray(user.clubs) && user.clubs.some(c => c.toUpperCase() === targetId)) return true;
    return false;
  }

  return false;
}
