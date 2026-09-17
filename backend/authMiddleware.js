import { getDB, logAudit } from './db.js';
import { ROLES, normalizeRole, hasRolePermission, isUserAuthorizedForClub } from './rbac.js';

// Resolve caller authentication from headers
export function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const xUserId = req.headers['x-user-id'];
  const db = getDB();

  let tokenOrId = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    tokenOrId = authHeader.substring(7).trim();
  } else if (xUserId) {
    tokenOrId = xUserId.trim();
  }

  if (tokenOrId && tokenOrId !== 'guest') {
    const user = (db.users || []).find(u =>
      u.id === tokenOrId ||
      (u.email && u.email.toLowerCase() === tokenOrId.toLowerCase()) ||
      (u.rollNo && u.rollNo.toUpperCase() === tokenOrId.toUpperCase())
    );

    if (user) {
      req.user = {
        ...user,
        role: normalizeRole(user.role)
      };
      return next();
    }
  }

  // Default to Guest persona if no valid token
  req.user = {
    id: "guest",
    name: "Public Visitor",
    role: ROLES.GUEST,
    email: "guest@pragati.ac.in",
    isGuest: true
  };
  next();
}

// Ensure the caller is authenticated (non-Guest)
export function requireAuth(req, res, next) {
  if (!req.user || req.user.role === ROLES.GUEST) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Authentication required. Please sign in with your college credentials."
    });
  }
  next();
}

// Check if user has specific granular permission
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication required."
      });
    }

    const normRole = normalizeRole(req.user.role);
    if (hasRolePermission(normRole, permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_PERMISSION",
      permission,
      userRole: req.user.role,
      message: `Access denied. Your role (${req.user.role}) does not have permission '${permission}'.`
    });
  };
}

// Enforce Club Scope: User must be Super Admin or authorized for the specific clubId
export function requireClubScope(getClubIdFn) {
  return (req, res, next) => {
    const clubId = typeof getClubIdFn === 'function' ? getClubIdFn(req) : (req.params.clubId || req.body.club_id || req.body.clubId);

    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: "Club ID parameter is required to verify authorization scope."
      });
    }

    if (!isUserAuthorizedForClub(req.user, clubId)) {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN_CLUB_SCOPE",
        clubId,
        userRole: req.user.role,
        message: `Cross-club access violation. You are not authorized to access or manage records for Club ${clubId}.`
      });
    }

    next();
  };
}

// Structured Audit Logger helper for security events
export function recordAuditAction(req, action, resource, resourceId, details = {}, oldValue = null, newValue = null) {
  const user = req.user || { id: "anonymous", role: "Unknown", name: "Anonymous" };
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || "127.0.0.1";

  logAudit({
    user_id: user.id,
    user_role: user.role,
    user_name: user.name,
    actor: `${user.name} (${user.role})`,
    action,
    resource,
    resource_id: resourceId,
    ip_address: ip,
    old_value: oldValue,
    new_value: newValue,
    affected_record: `${resource}: ${resourceId}`,
    details: typeof details === 'string' ? details : JSON.stringify(details)
  });
}
