import { initSupabaseClient, getSupabaseClient, isSupabaseReady, supabaseSignInWithGoogle, supabaseSignIn, supabaseSignUp, supabaseSignOut } from '../supabaseClient.js';
import { getDB, saveDB, logAudit, apiRequest } from '../db.js';
import { ROLES, normalizeRole, hasRolePermission, isUserAuthorizedForClub } from '../rbac.js';

const ACTIVE_USER_KEY = "campustech_active_user_id";
const SESSION_TOKEN_KEY = "campustech_session_token";

/**
 * Auth Service integrating Supabase Client, Google OAuth, and Local State Management.
 */

export async function initializeAuthService() {
  try {
    await initSupabaseClient();
    await checkSupabaseOAuthSession();
    const user = getCurrentUser();
    console.log("[AuthService] Initialized. Current user:", user?.name, user?.role);
    return user;
  } catch (err) {
    console.warn("[AuthService] Initialization notice:", err.message);
    return getCurrentUser();
  }
}

export async function loginWithGoogle() {
  try {
    const client = await initSupabaseClient();
    if (!client) {
      throw new Error("Supabase client is not configured. Please supply Supabase credentials.");
    }
    const res = await supabaseSignInWithGoogle();
    return { success: true, data: res };
  } catch (err) {
    console.error("[AuthService] Google OAuth Error:", err);
    return { success: false, message: err.message || "Google OAuth sign-in failed." };
  }
}

export async function checkSupabaseOAuthSession() {
  const client = await initSupabaseClient();
  if (!client) return null;
  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (error) throw error;
    if (session && session.user) {
      const sbUser = session.user;
      const email = sbUser.email?.toLowerCase() || "";
      const name = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email.split('@')[0];
      const avatar = sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || "";

      const db = getDB();
      let existing = (db.users || []).find(u => u.email?.toLowerCase() === email);
      if (!existing) {
        let role = "Student";
        let dept = "CSE";
        if (email.includes("admin") || email.includes("director")) role = "Super Admin";
        else if (email.includes("faculty") || email.includes("coord") || email.includes("yamuna")) role = "Faculty Coordinator";
        else if (email.includes("leader") || email.includes("club")) role = "Club Admin";

        const newUser = {
          id: "usr-google-" + sbUser.id,
          name: name,
          email: email,
          role: role,
          department: dept,
          avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
          rollNo: (role === "Student" || role === "Club Admin") ? "PEC2026" + Math.floor(100 + Math.random() * 900) : undefined,
          facultyId: (role === "Super Admin" || role === "Director(Academics)" || role === "Faculty Coordinator") ? "FAC-PEC-" + Math.floor(100 + Math.random() * 900) : undefined,
          membershipId: "PEC-MEM-2026-" + Math.floor(1000 + Math.random() * 9000),
          emailVerified: true,
          isGoogleOAuth: true
        };
        db.users.push(newUser);
        saveDB(db);
        existing = newUser;
        logAudit(`${existing.name} (${existing.role})`, "Google OAuth Sign Up", existing.role, "Registered new user via Supabase Google OAuth SSO.");
      }
      setCurrentUser(existing.id, session.access_token);
      return existing;
    }
  } catch (err) {
    console.warn("[AuthService] Supabase OAuth session check notice:", err.message);
  }
  return null;
}

export function getCurrentUser() {
  const db = getDB();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_TOKEN_KEY) : null;
  const activeId = typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_USER_KEY) : null;

  if (token && activeId) {
    const found = (db.users || []).find(u => u.id === activeId);
    if (found) {
      return {
        ...found,
        role: normalizeRole ? normalizeRole(found.role) : found.role
      };
    }
  }

  return {
    id: "guest-001",
    name: "Public Guest",
    role: "Guest",
    isGuest: true
  };
}

export function setCurrentUser(userId, token = null) {
  const db = getDB();
  const user = (db.users || []).find(u => u.id === userId);
  if (user) {
    if (typeof normalizeRole === 'function') {
      user.role = normalizeRole(user.role);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACTIVE_USER_KEY, user.id);
      if (token) {
        localStorage.setItem(SESSION_TOKEN_KEY, token);
      }
    }
    logAudit(`${user.name} (${user.role})`, "Session State Update", user.role, "Updated active user session state for dashboard.");
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: user }));
  }
}

export async function logoutUser() {
  try {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
  } catch (e) {
    console.warn("[AuthService] Supabase sign out notice:", e.message);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(ACTIVE_USER_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
  }
  window.dispatchEvent(new CustomEvent("auth-changed", { detail: null }));
  window.location.hash = "#/login";
}
