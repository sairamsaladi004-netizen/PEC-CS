// Role-Based Access Control (RBAC) System for Pragati University PEC CampusTech

export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  FACULTY_COORDINATOR: "Faculty Coordinator",
  CLUB_ADMIN: "Club Admin",
  STUDENT: "Student",
  GUEST: "Guest"
};

// Aliases for backwards compatibility with legacy user data
export function normalizeRole(role) {
  if (!role) return ROLES.GUEST;
  const r = role.trim();
  if (r === "Super Admin" || r === "SUPER_ADMIN") return ROLES.SUPER_ADMIN;
  if (r === "Faculty Coordinator" || r === "Club Coordinator" || r === "FACULTY_COORD") return ROLES.FACULTY_COORDINATOR;
  if (r === "Club Admin" || r === "Club Student Leader" || r === "Club Lead" || r === "CLUB_ADMIN") return ROLES.CLUB_ADMIN;
  if (r === "Student" || r === "Club Member" || r === "STUDENT") return ROLES.STUDENT;
  if (r === "Guest" || r === "Public User") return ROLES.GUEST;
  return r;
}

// Granular Permissions Dictionary
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

  // Intelligence & Engagement (Round 2)
  INTELLIGENCE_VIEW: "intelligence.view",
  INTELLIGENCE_ACTION: "intelligence.action",

  // Settings
  SETTINGS_MANAGE: "settings.manage"
};

// Complete Role-to-Permissions Mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.FACULTY_COORDINATOR]: [
    PERMISSIONS.USERS_VIEW, // Limited to students in assigned clubs
    PERMISSIONS.CLUBS_VIEW,
    PERMISSIONS.CLUBS_UPDATE, // Assigned clubs only
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
    PERMISSIONS.AUDIT_LOGS_VIEW, // Scoped to assigned clubs
    PERMISSIONS.INTELLIGENCE_VIEW,
    PERMISSIONS.INTELLIGENCE_ACTION
  ],

  [ROLES.CLUB_ADMIN]: [
    PERMISSIONS.CLUBS_VIEW,
    PERMISSIONS.CLUBS_UPDATE, // Own club profile only
    PERMISSIONS.MEMBERS_VIEW, // Own club
    PERMISSIONS.MEMBERS_APPROVE, // Own club
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_CREATE, // Own club
    PERMISSIONS.EVENTS_UPDATE, // Own club
    PERMISSIONS.ATTENDANCE_VIEW, // Own club
    PERMISSIONS.ATTENDANCE_MARK, // Generate QR / Mark attendance for own club events
    PERMISSIONS.CERTIFICATES_VIEW, // View certificates
    PERMISSIONS.CERTIFICATES_REQUEST, // Can ONLY request certificates, cannot approve/generate official certificates
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.RESOURCES_VIEW,
    PERMISSIONS.RESOURCES_CREATE,
    PERMISSIONS.RESOURCES_UPDATE,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_CREATE,
    PERMISSIONS.REPORTS_VIEW, // Basic club reports
    PERMISSIONS.ANALYTICS_VIEW, // Own club analytics
    PERMISSIONS.AUDIT_LOGS_VIEW, // Limited to own club
    PERMISSIONS.INTELLIGENCE_VIEW,
    PERMISSIONS.INTELLIGENCE_ACTION
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.CLUBS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW, // View own attendance
    PERMISSIONS.CERTIFICATES_VIEW, // View own certificates
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE, // Propose/submit student project
    PERMISSIONS.RESOURCES_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.REPORTS_VIEW, // View own performance/achievements
    PERMISSIONS.INTELLIGENCE_VIEW
  ],

  [ROLES.GUEST]: [
    PERMISSIONS.CLUBS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.RESOURCES_VIEW
  ]
};

// Check if a role has a given permission
export function hasRolePermission(role, permission) {
  const normRole = normalizeRole(role);
  if (normRole === ROLES.SUPER_ADMIN) return true;
  const list = ROLE_PERMISSIONS[normRole] || [];
  return list.includes(permission);
}

// Scope validation: verifies if the user is authorized for a specific club
export function isUserAuthorizedForClub(user, clubId) {
  if (!user) return false;
  const normRole = normalizeRole(user.role);

  // 1. Super Admin has unrestricted scope across all clubs
  if (normRole === ROLES.SUPER_ADMIN) return true;

  if (!clubId) return false;
  const targetId = clubId.toString().trim().toUpperCase();

  // 2. Faculty Coordinator has scope over assigned clubs
  if (normRole === ROLES.FACULTY_COORDINATOR) {
    const assigned = Array.isArray(user.assignedClubs) ? user.assignedClubs : [];
    return assigned.some(c => c.toUpperCase() === targetId);
  }

  // 3. Club Admin has scope over their specific club
  if (normRole === ROLES.CLUB_ADMIN) {
    if (user.clubId && user.clubId.toUpperCase() === targetId) return true;
    if (Array.isArray(user.assignedClubs) && user.assignedClubs.some(c => c.toUpperCase() === targetId)) return true;
    if (Array.isArray(user.clubs) && user.clubs.some(c => c.toUpperCase() === targetId)) return true;
    return false;
  }

  // 4. Student has member-level access if approved member, but not management scope
  return false;
}

// User-level scope check: can user A modify/view user B's sensitive data?
export function isUserAuthorizedForUserData(requestingUser, targetUserId) {
  if (!requestingUser) return false;
  const normRole = normalizeRole(requestingUser.role);

  if (normRole === ROLES.SUPER_ADMIN) return true;
  if (requestingUser.id === targetUserId) return true;

  return false;
}
