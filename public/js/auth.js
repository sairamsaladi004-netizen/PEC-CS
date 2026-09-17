import { getDB, saveDB, logAudit, apiRequest } from './db.js';
import { APP_CONFIG } from './config.js';

const ACTIVE_USER_KEY = "campustech_active_user_id";

export function getCurrentUser() {
  const db = getDB();
  const activeId = typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_USER_KEY) : null;
  if (activeId) {
    const found = (db.users || []).find(u => u.id === activeId);
    if (found) return found;
  }
  return (db.users && db.users[0]) || null;
}

export function setCurrentUser(userId) {
  const db = getDB();
  const user = (db.users || []).find(u => u.id === userId);
  if (user) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACTIVE_USER_KEY, user.id);
    }
    logAudit(`${user.name} (${user.role})`, "Role Switch / Session Start", user.role, "Switched active persona session.");
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: user }));
  }
}

export function switchUser(userId) {
  setCurrentUser(userId);
}

export function hasPermission(permission) {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === "Super Admin") return true;
  const permissions = APP_CONFIG.rolePermissions[user.role] || [];
  return permissions.includes(permission) || permissions.includes("all_permissions");
}

export function hasRole(role) {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === "Super Admin") return true;
  return user.role === role;
}

export function isCoordinatorForClub(clubId) {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === "Super Admin") return true;
  if (user.role === "Club Coordinator") {
    return Array.isArray(user.assignedClubs) && user.assignedClubs.includes(clubId);
  }
  if (user.role === "Club Student Leader") {
    return user.clubId === clubId;
  }
  return false;
}

export function getAllDemoAccounts() {
  const db = getDB();
  return (db.users || []).filter(u => u.isDemo !== false);
}

// Asynchronous Login against REST API with local state fallback
export async function loginUser(identifier, password) {
  const cleanId = (identifier || "").trim().toLowerCase();
  
  // Try server API first
  const res = await apiRequest('/api/auth/login', 'POST', { identifier: cleanId, password });
  if (res && res.success && res.user) {
    const db = getDB();
    const idx = (db.users || []).findIndex(u => u.id === res.user.id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...res.user };
    } else {
      db.users.push(res.user);
    }
    saveDB(db);
    setCurrentUser(res.user.id);
    return { success: true, user: res.user };
  }

  // Local fallback
  const db = getDB();
  const user = (db.users || []).find(u => 
    (u.rollNo && u.rollNo.toLowerCase() === cleanId) || 
    (u.email && u.email.toLowerCase() === cleanId) ||
    (u.demoAlias && u.demoAlias.toLowerCase() === cleanId) ||
    (u.facultyId && u.facultyId.toLowerCase() === cleanId) ||
    (u.id && u.id.toLowerCase() === cleanId)
  );

  if (!user) {
    return { success: false, message: res?.message || "No account found matching this College ID or Email." };
  }

  setCurrentUser(user.id);
  return { success: true, user };
}

// Register student
export async function registerStudent(userData) {
  const res = await apiRequest('/api/auth/register', 'POST', userData);
  if (res && res.success && res.user) {
    const db = getDB();
    db.users.push(res.user);
    saveDB(db);
    setCurrentUser(res.user.id);
    return { success: true, user: res.user, otpHint: res.otpHint };
  }

  // Local fallback
  const db = getDB();
  const newId = "std-" + Date.now();
  const newUser = {
    id: newId,
    name: userData.name,
    rollNo: userData.rollNo.toUpperCase(),
    email: userData.email.toLowerCase(),
    role: "Student",
    department: userData.department || "CSE",
    year: userData.year || "1st Year",
    section: userData.section || "A",
    phone: userData.phone || "",
    avatar: userData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    clubs: [],
    skills: userData.skills ? (Array.isArray(userData.skills) ? userData.skills : userData.skills.split(",").map(s => s.trim())) : ["Python"],
    badges: ["Verified PEC Student"],
    membershipId: `PEC-MEM-2026-${userData.department || 'CSE'}-${Math.floor(1000 + Math.random() * 9000)}`,
    validUntil: "30 June 2028",
    emailVerified: false,
    isDemo: false
  };
  db.users.push(newUser);
  saveDB(db);
  logAudit(newUser.name, "Registered New Account", newUser.role, `Roll No: ${newUser.rollNo}`);
  setCurrentUser(newUser.id);
  return { success: true, user: newUser, otpHint: "742918" };
}

// Reset password
export async function resetPassword(identifier, newPassword) {
  const res = await apiRequest('/api/auth/reset-password', 'POST', { identifier, newPassword });
  if (res && res.success) {
    return res;
  }
  return { success: true, message: "Password updated successfully. You may now login." };
}

// Verify OTP
export async function verifyEmailWithOTP(userId, otp) {
  const res = await apiRequest('/api/auth/verify-otp', 'POST', { userId, otp });
  if (res && res.success) {
    const db = getDB();
    const user = (db.users || []).find(u => u.id === userId);
    if (user) {
      user.emailVerified = true;
      saveDB(db);
    }
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: user }));
    return res;
  }

  // Fallback
  if (otp === "742918" || (otp && otp.length === 6)) {
    const db = getDB();
    const user = (db.users || []).find(u => u.id === userId);
    if (user) {
      user.emailVerified = true;
      saveDB(db);
      window.dispatchEvent(new CustomEvent("auth-changed", { detail: user }));
    }
    return { success: true, message: "Institutional email successfully verified!" };
  }
  return { success: false, message: "Invalid 6-digit OTP. Please enter 742918." };
}

// Logout
export function logoutUser() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
  window.dispatchEvent(new CustomEvent("auth-changed", { detail: null }));
  window.location.hash = "#/login";
}

// Update Profile
export async function updateProfile(updatedData) {
  const user = getCurrentUser();
  if (!user) return null;

  const res = await apiRequest('/api/students/profile', 'PUT', { userId: user.id, ...updatedData });
  const db = getDB();
  const idx = (db.users || []).findIndex(u => u.id === user.id);
  if (idx !== -1) {
    db.users[idx] = { ...db.users[idx], ...updatedData };
    if (res && res.user) {
      db.users[idx] = { ...db.users[idx], ...res.user };
    }
    saveDB(db);
    logAudit(`${user.name} (${user.role})`, "Updated Profile", "Self Profile", "Modified user profile attributes.");
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: db.users[idx] }));
    return db.users[idx];
  }
  return null;
}

export function initAuth() {
  const user = getCurrentUser();
  if (user && typeof localStorage !== 'undefined' && !localStorage.getItem(ACTIVE_USER_KEY)) {
    localStorage.setItem(ACTIVE_USER_KEY, user.id);
  }
  return user;
}
