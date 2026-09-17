import { getDB, logAudit, getSupabase } from './db.js';
import { ROLES, normalizeRole, hasRolePermission, isUserAuthorizedForClub } from './rbac.js';
import { resolveSession } from './sessions.js';

// Resolve caller authentication from Bearer header exclusively (valid cryptographically generated session tokens or Supabase JWTs)
export async function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const db = getDB();
  const supabase = getSupabase();

  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (token && token !== 'guest') {
    // 1. Check if token is a valid Supabase JWT (format: xxx.yyy.zzz)
    if (supabase && token.includes('.') && token.split('.').length === 3) {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
        if (authUser && !error) {
          let profile = (db.users || []).find(u =>
            (u.auth_user_id && u.auth_user_id === authUser.id) ||
            (u.id === authUser.id) ||
            (u.email && u.email.toLowerCase() === (authUser.email || '').toLowerCase())
          );

          if (!profile) {
            profile = {
              id: authUser.id,
              auth_user_id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
              role: authUser.user_metadata?.role || ROLES.STUDENT,
              emailVerified: !!authUser.email_confirmed_at,
              department: authUser.user_metadata?.department || "CSE"
            };
            if (!Array.isArray(db.users)) db.users = [];
            db.users.push(profile);
          }

          req.user = {
            ...profile,
            role: normalizeRole(profile.role),
            supabaseAuthUser: authUser
          };
          return next();
        }
      } catch (err) {
        console.warn("[Auth Middleware] Supabase JWT verification warning:", err.message);
      }
    }

    // 2. Resolve cryptographically generated session token via sessions table
    const activeSession = resolveSession(token);
    if (activeSession && activeSession.user_id) {
      const user = (db.users || []).find(u => u.id === activeSession.user_id);
      if (user) {
        req.user = {
          ...user,
          role: normalizeRole(user.role),
          sessionId: activeSession.token
        };
        return next();
      }
    }
  }

  // Default to unauthenticated Guest persona if no valid session token
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
