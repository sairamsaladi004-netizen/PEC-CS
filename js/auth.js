    logAudit(`${user.name} (${user.role})`, "Role Switch / Session Start", user.role, "Switched active persona session.");
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: user }));
  }
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
    role: "Student",
    department: userData.department,
    year: userData.year || "1st Year",
    semester: userData.semester || "1st Semester",
    cgpa: "0.00",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    clubs: [],
    skills: userData.skills ? userData.skills.split(",").map(s => s.trim()) : [],
    badges: ["New Member"],
    membershipId: `AIT-MEM-2026-${userData.department}-${Math.floor(1000 + Math.random() * 9000)}`,
    validUntil: "30 June 2028"
  };
  db.users.push(newUser);
  logAudit(`${newUser.name}`, "Registered New Account", newUser.role, `Roll No: ${newUser.rollNo}`);
  return newUser;
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
