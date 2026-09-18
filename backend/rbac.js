// Role-Based Access Control (RBAC) System for Pragati University PEC CampusTech

export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  DEPARTMENT_ADMIN: "Department Admin",
  FACULTY_COORDINATOR: "Faculty Coordinator",
  CLUB_ADMIN: "Club Admin",
  STUDENT: "Student",
  GUEST: "Guest"
};

// Aliases for backwards compatibility with legacy user data
export function normalizeRole(role) {
  if (!role) return ROLES.GUEST;
  const r = role.trim();
  if (r === "Super Admin" || r === "SUPER_ADMIN" || r === "Principal" || r === "Admin") return ROLES.SUPER_ADMIN;
  if (r === "Department Admin" || r === "DEPARTMENT_ADMIN" || r === "Dept Admin" || r === "HOD" || r === "Dept Head") return ROLES.DEPARTMENT_ADMIN;
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

  [ROLES.DEPARTMENT_ADMIN]: [
    PERMISSIONS.CLUBS_VIEW,
    PERMISSIONS.CLUBS_UPDATE, // Departmental oversight
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.CERTIFICATES_VIEW,
    PERMISSIONS.CERTIFICATES_APPROVE,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_APPROVE,
    PERMISSIONS.RESOURCES_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW
  ],

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

// Normalize department string for comparison (e.g., "CSE" matches "CSE", "CSE(AIML)", etc. if departmental hierarchy)
export function isDepartmentMatch(userDept, clubDept) {
  if (!userDept || !clubDept) return false;
  const u = userDept.toString().trim().toUpperCase();
  const c = clubDept.toString().trim().toUpperCase();
  if (u === c) return true;
  // If user is HOD of CSE, also authorized for CSE sub-branches if designated
  if (u === "CSE" && (c.startsWith("CSE") || c === "IT")) return true;
  if (u === "ECE" && (c === "ECE" || c === "EEE")) return true;
  return false;
}

// Scope validation: verifies if the user is authorized for a specific club
export function isUserAuthorizedForClub(user, clubId, clubOrDb = null) {
  if (!user) return false;
  const normRole = normalizeRole(user.role);

  // 1. Super Admin has unrestricted scope across all clubs
  if (normRole === ROLES.SUPER_ADMIN) return true;

  if (!clubId) return false;
  const targetId = clubId.toString().trim().toUpperCase();

  // 2. Department Admin has scope over all clubs under their department
  if (normRole === ROLES.DEPARTMENT_ADMIN) {
    let club = null;
    if (clubOrDb) {
      if (clubOrDb.department) {
        club = clubOrDb;
      } else if (Array.isArray(clubOrDb.clubs)) {
        club = clubOrDb.clubs.find(c => c.id && c.id.toUpperCase() === targetId);
      } else if (Array.isArray(clubOrDb)) {
        club = clubOrDb.find(c => c.id && c.id.toUpperCase() === targetId);
      }
    }
    
    // If club object was resolved, test department match
    if (club && club.department) {
      return isDepartmentMatch(user.department, club.department) || (user.department_id && user.department_id === club.department_id);
    }
    
    // Fallback: If club is in assigned clubs or department matches
    if (Array.isArray(user.assignedClubs) && user.assignedClubs.some(c => c.toUpperCase() === targetId)) return true;
    
    // Default allow if user department is present and matching or let caller pass club
    return true;
  }

  // 3. Faculty Coordinator has scope over assigned clubs
  if (normRole === ROLES.FACULTY_COORDINATOR) {
    const assigned = Array.isArray(user.assignedClubs) ? user.assignedClubs : [];
    if (assigned.some(c => c.toUpperCase() === targetId)) return true;
    if (user.clubId && user.clubId.toUpperCase() === targetId) return true;
    return false;
  }

  // 4. Club Admin has scope over their specific club
  if (normRole === ROLES.CLUB_ADMIN) {
    if (user.clubId && user.clubId.toUpperCase() === targetId) return true;
    if (Array.isArray(user.assignedClubs) && user.assignedClubs.some(c => c.toUpperCase() === targetId)) return true;
    if (Array.isArray(user.clubs) && user.clubs.some(c => c.toUpperCase() === targetId)) return true;
    return false;
  }

  // 5. Student / Guest do not have management dashboard scope
  return false;
}

// Detailed Authority and Capability Descriptor for UI & Component logic
export function getUserClubAuthority(user, club) {
  if (!user) {
    return {
      isAuthorized: false,
      role: ROLES.GUEST,
      accessLabel: "Unauthorized Visitor",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
      reason: "Authentication required to access club management."
    };
  }

  const normRole = normalizeRole(user.role);
  const clubId = club ? (club.id || club.club_id) : null;
  const isAuth = isUserAuthorizedForClub(user, clubId, club);

  if (!isAuth) {
    return {
      isAuthorized: false,
      role: normRole,
      accessLabel: `Unauthorized (${normRole})`,
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
      reason: normRole === ROLES.STUDENT
        ? "Students can explore events and propose projects, but cannot access administrative club controls."
        : normRole === ROLES.CLUB_ADMIN
        ? `You are assigned to manage ${user.clubId || 'your own club'}, not ${club ? club.name : 'this club'}.`
        : normRole === ROLES.FACULTY_COORDINATOR
        ? "This club is not in your assigned faculty coordination portfolio."
        : normRole === ROLES.DEPARTMENT_ADMIN
        ? `This club belongs to another department (${club ? club.department : 'other'}). Your oversight is restricted to ${user.department}.`
        : "You do not have permission to view or manage this club dashboard."
    };
  }

  // Define granular authority flags based on the 4 roles
  switch (normRole) {
    case ROLES.SUPER_ADMIN:
      return {
        isAuthorized: true,
        role: normRole,
        accessLabel: "Super Admin",
        accessLevelName: "Super Admin (Full Administrative Access)",
        badgeColor: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20",
        pillClass: "bg-rose-600 text-white",
        authorityDescription: "System-wide authority with unrestricted access to all clubs, settings, approvals, and deletion controls.",
        canViewDashboard: true,
        canManageClubProfile: true,
        canManageMembers: true,
        canManageExecutiveTeam: true,
        canApproveTeamChanges: true,
        canCreateEvents: true,
        canManageEvents: true,
        canApproveEvents: true,
        canManageRegistrations: true,
        canManageAttendance: true,
        canReviewProjects: true,
        canApproveProjects: true,
        canSubmitProjects: true,
        canMintCertificates: true,
        canApproveCertificates: true,
        canRequestCertificates: true,
        canManageResources: true,
        canManageAnnouncements: true,
        canManageGallery: true,
        canViewAnalytics: true,
        canGenerateReports: true,
        canDeleteClub: true,
        canActivateDeactivate: true,
        canAssignAdmins: true,
        canAssignCoordinators: true,
        canManagePermissions: true,
        canViewAuditLogs: true
      };

    case ROLES.DEPARTMENT_ADMIN:
      return {
        isAuthorized: true,
        role: normRole,
        accessLabel: "Department Admin",
        accessLevelName: "Department Admin (Departmental Oversight & Reports)",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20",
        pillClass: "bg-indigo-600 text-white",
        authorityDescription: `Departmental oversight over all clubs under the Department of ${user.department || club.department}.`,
        canViewDashboard: true,
        canManageClubProfile: false,
        canManageMembers: false,
        canManageExecutiveTeam: false,
        canApproveTeamChanges: true,
        canCreateEvents: false,
        canManageEvents: false,
        canApproveEvents: true,
        canManageRegistrations: false,
        canManageAttendance: false,
        canReviewProjects: true,
        canApproveProjects: true,
        canSubmitProjects: false,
        canMintCertificates: true,
        canApproveCertificates: true,
        canRequestCertificates: false,
        canManageResources: false,
        canManageAnnouncements: false,
        canManageGallery: false,
        canViewAnalytics: true,
        canGenerateReports: true,
        canDeleteClub: false,
        canActivateDeactivate: false,
        canAssignAdmins: false,
        canAssignCoordinators: false,
        canManagePermissions: false,
        canViewAuditLogs: true
      };

    case ROLES.FACULTY_COORDINATOR:
      return {
        isAuthorized: true,
        role: normRole,
        accessLabel: "Faculty Coordinator",
        accessLevelName: "Faculty Coordinator (Supervisory & Approval Access)",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20",
        pillClass: "bg-purple-600 text-white",
        authorityDescription: "Supervisory and approval authority for assigned student technical societies, compliance, and accreditation records.",
        canViewDashboard: true,
        canManageClubProfile: false,
        canManageMembers: false,
        canManageExecutiveTeam: false,
        canApproveTeamChanges: true,
        canCreateEvents: false,
        canManageEvents: false,
        canApproveEvents: true,
        canManageRegistrations: false,
        canManageAttendance: false,
        canReviewProjects: true,
        canApproveProjects: true,
        canSubmitProjects: false,
        canMintCertificates: true,
        canApproveCertificates: true,
        canRequestCertificates: true,
        canManageResources: false,
        canManageAnnouncements: false,
        canManageGallery: false,
        canViewAnalytics: true,
        canGenerateReports: true,
        canDeleteClub: false,
        canActivateDeactivate: false,
        canAssignAdmins: false,
        canAssignCoordinators: false,
        canManagePermissions: false,
        canViewAuditLogs: true
      };

    case ROLES.CLUB_ADMIN:
      return {
        isAuthorized: true,
        role: normRole,
        accessLabel: "Club Admin",
        accessLevelName: "Club Admin (Club Operations & Management)",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20",
        pillClass: "bg-blue-600 text-white",
        authorityDescription: "Operational club administration, event planning, attendance tracking, member registration, and project proposals.",
        canViewDashboard: true,
        canManageClubProfile: true,
        canManageMembers: true,
        canManageExecutiveTeam: true,
        canApproveTeamChanges: false,
        canCreateEvents: true,
        canManageEvents: true,
        canApproveEvents: false,
        canManageRegistrations: true,
        canManageAttendance: true,
        canReviewProjects: false,
        canApproveProjects: false,
        canSubmitProjects: true,
        canMintCertificates: false,
        canApproveCertificates: false,
        canRequestCertificates: true,
        canManageResources: true,
        canManageAnnouncements: true,
        canManageGallery: true,
        canViewAnalytics: true,
        canGenerateReports: true,
        canDeleteClub: false,
        canActivateDeactivate: false,
        canAssignAdmins: false,
        canAssignCoordinators: false,
        canManagePermissions: false,
        canViewAuditLogs: true
      };

    default:
      return {
        isAuthorized: false,
        role: normRole,
        accessLabel: "Student / Member",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        reason: "Member access only."
      };
  }
}

// User-level scope check: can user A modify/view user B's sensitive data?
export function isUserAuthorizedForUserData(requestingUser, targetUserId) {
  if (!requestingUser) return false;
  const normRole = normalizeRole(requestingUser.role);

  if (normRole === ROLES.SUPER_ADMIN || normRole === ROLES.DEPARTMENT_ADMIN) return true;
  if (requestingUser.id === targetUserId) return true;

  return false;
}
