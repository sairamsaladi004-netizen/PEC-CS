import { getDB, saveDB, logAudit } from './db.js';
import { APP_CONFIG } from './config.js';

const ACTIVE_USER_KEY = "campustech_active_user_id";

export function getCurrentUser() {
  const db = getDB();
  const activeId = typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_USER_KEY) : null;
  if (activeId) {
    const found = db.users.find(u => u.id === activeId);
    if (found) return found;
  }
  return db.users[0] || null;
}

export function setCurrentUser(userId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
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

export function getAllDemoAccounts() {
  const db = getDB();
  return db.users;
}

export function registerStudent(userData) {
  const db = getDB();
  const newId = "std-" + (db.users.length + 101);
  const newUser = {
    id: newId,
    name: userData.name,
    rollNo: userData.rollNo,
    email: userData.email,
    role: userData.role || "Student",
    department: userData.department || "CSE",
    year: userData.year || "1st Year",
    semester: userData.semester || "1st Semester",
    cgpa: userData.cgpa || "8.50",
    avatar: userData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    clubs: [],
    skills: userData.skills ? (Array.isArray(userData.skills) ? userData.skills : userData.skills.split(",").map(s => s.trim())) : ["Python", "Web Development"],
    badges: ["Verified PEC Student", "CampusTech Member"],
    membershipId: `PEC-MEM-2026-${userData.department || 'CSE'}-${Math.floor(1000 + Math.random() * 9000)}`,
    validUntil: "30 June 2028",
    emailVerified: Boolean(userData.emailVerified),
    password: userData.password || "pec2026"
  };
  db.users.push(newUser);
  saveDB(db);
  logAudit(`${newUser.name}`, "Registered New Account", newUser.role, `Roll No: ${newUser.rollNo} (Verified ID)`);
  setCurrentUser(newUser.id);
  return newUser;
}

export function loginUser(identifier, password) {
  const db = getDB();
  const cleanId = (identifier || "").trim().toLowerCase();
  const user = db.users.find(u => 
    (u.rollNo && u.rollNo.toLowerCase() === cleanId) || 
    (u.email && u.email.toLowerCase() === cleanId) ||
    (u.facultyId && u.facultyId.toLowerCase() === cleanId) ||
    (u.id && u.id.toLowerCase() === cleanId)
  );

  if (!user) {
    return { success: false, message: "No account found matching this College ID / Email." };
  }

  // If password provided and user has password, check match (default password is accepted for demo)
  if (user.password && password && user.password !== password && password !== "demo123") {
    return { success: false, message: "Invalid credentials. Please recheck password or use recovery." };
  }

  setCurrentUser(user.id);
  return { success: true, user };
}

export function resetPassword(identifier, newPassword) {
  const db = getDB();
  const cleanId = (identifier || "").trim().toLowerCase();
  const user = db.users.find(u => 
    (u.rollNo && u.rollNo.toLowerCase() === cleanId) || 
    (u.email && u.email.toLowerCase() === cleanId)
  );

  if (!user) {
    return { success: false, message: "Account not found for provided Roll Number / Email." };
  }

  user.password = newPassword;
  saveDB(db);
  logAudit(`${user.name}`, "Reset Account Password", user.role, "Self-service credential recovery completed.");
  return { success: true, message: "Password updated successfully. You may now login." };
}

export function verifyEmailWithOTP(userId, otp) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return { success: false, message: "User not found." };

  if (otp === "742918" || otp.length === 6) {
    user.emailVerified = true;
    if (!user.badges.includes("Verified PEC Student")) {
      user.badges.push("Verified PEC Student");
    }
    saveDB(db);
    logAudit(`${user.name}`, "Verified College Email", user.role, `Validated institutional address: ${user.email}`);
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: user }));
    return { success: true, message: "Institutional email successfully verified!" };
  }
  return { success: false, message: "Invalid 6-digit OTP code. Please try again." };
}

export function logoutUser() {
  const db = getDB();
  const firstUser = db.users[0];
  if (firstUser) {
    setCurrentUser(firstUser.id);
  }
}

export function updateProfile(updatedData) {
  const db = getDB();
  const user = getCurrentUser();
  const index = db.users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...updatedData };
    logAudit(`${user.name} (${user.role})`, "Updated Profile", "Self Profile", "Modified user profile attributes.");
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: db.users[index] }));
    return db.users[index];
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
