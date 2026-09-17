import crypto from 'crypto';
import { getDB, saveDB } from './db.js';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours TTL

/**
 * Generate a cryptographically secure random session token
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create and persist a new session for a user
 * @param {string} userId
 * @returns {object} session object containing token, expires_at, etc.
 */
export function createSession(userId) {
  if (!userId) return null;
  const db = getDB();
  if (!Array.isArray(db.sessions)) {
    db.sessions = [];
  }

  // Purge any existing expired sessions for clean housekeeping
  sweepExpired();

  const now = new Date();
  const token = generateSessionToken();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

  const session = {
    token,
    user_id: userId,
    created_at: now.toISOString(),
    expires_at: expiresAt,
    last_seen: now.toISOString(),
    revoked: false
  };

  db.sessions.push(session);
  saveDB(db);

  return session;
}

/**
 * Resolve a session token to a valid session record with sliding refresh
 * @param {string} token
 * @returns {object|null} session object or null if invalid/expired/revoked
 */
export function resolveSession(token) {
  if (!token || typeof token !== 'string') return null;
  const db = getDB();
  if (!Array.isArray(db.sessions)) return null;

  const session = db.sessions.find(s => s.token === token && !s.revoked);
  if (!session) return null;

  const now = Date.now();
  const expires = new Date(session.expires_at).getTime();

  // Expired check
  if (now > expires) {
    session.revoked = true;
    saveDB(db);
    return null;
  }

  // Sliding window refresh on use
  session.last_seen = new Date(now).toISOString();
  session.expires_at = new Date(now + SESSION_TTL_MS).toISOString();
  // Debounced/asynchronous save or immediate save
  saveDB(db);

  return session;
}

/**
 * Revoke an active session token (Logout)
 * @param {string} token
 * @returns {boolean} true if revoked
 */
export function revokeSession(token) {
  if (!token) return false;
  const db = getDB();
  if (!Array.isArray(db.sessions)) return false;

  const session = db.sessions.find(s => s.token === token);
  if (session) {
    session.revoked = true;
    session.revoked_at = new Date().toISOString();
    saveDB(db);
    return true;
  }
  return false;
}

/**
 * Revoke all active sessions for a specific user ID
 * @param {string} userId
 */
export function revokeAllUserSessions(userId) {
  if (!userId) return;
  const db = getDB();
  if (!Array.isArray(db.sessions)) return;

  let changed = false;
  db.sessions.forEach(s => {
    if (s.user_id === userId && !s.revoked) {
      s.revoked = true;
      s.revoked_at = new Date().toISOString();
      changed = true;
    }
  });

  if (changed) saveDB(db);
}

/**
 * Sweep expired sessions from the database
 */
export function sweepExpired() {
  const db = getDB();
  if (!Array.isArray(db.sessions)) return;

  const now = Date.now();
  const initialLength = db.sessions.length;
  // Keep active, unexpired, unrevoked sessions (or revoked within last 24h for audit)
  db.sessions = db.sessions.filter(s => {
    if (s.revoked) {
      const revokedTime = s.revoked_at ? new Date(s.revoked_at).getTime() : 0;
      return (now - revokedTime) < 24 * 60 * 60 * 1000;
    }
    return new Date(s.expires_at).getTime() > now;
  });

  if (db.sessions.length !== initialLength) {
    saveDB(db);
  }
}
