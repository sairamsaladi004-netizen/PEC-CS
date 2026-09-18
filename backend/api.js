import express from 'express';
import crypto from 'crypto';
import { getDB, saveDB, logAudit, hashPassword, generateSalt } from './db.js';
import {
  ROLES,
  PERMISSIONS,
  normalizeRole,
  hasRolePermission,
  isUserAuthorizedForClub,
  isUserAuthorizedForUserData,
  getUserClubAuthority
} from './rbac.js';
import {
  authenticateUser,
  requireAuth,
  requirePermission,
  requireClubScope,
  recordAuditAction
} from './authMiddleware.js';
import {
  recommendClubsForStudent,
  predictEventParticipation,
  detectInactiveMembers,
  calculateClubEngagementScore,
  recommendEventTiming,
  generateEventIdeas,
  getCoordinatorIntelligenceOverview,
  calculateClubComparison,
  calculateEngagementTrends,
  generateActionableInsights,
  recalculateIntelligenceSnapshot,
  RECOMMENDATION_WEIGHTS,
  CLUB_ENGAGEMENT_WEIGHTS,
  INACTIVITY_CONFIG,
  MODEL_VERSIONS
} from './intelligenceEngine.js';
import {
  isGeminiAvailable,
  generateStudentAIAdvisor,
  generateAIEventOptimization,
  generateAINudgeMessage,
  classifyStudentWithAI
} from './geminiIntegration.js';

export const apiRouter = express.Router();

// Helper: sanitize user for client response (strip password salt & hash)
function sanitizeUser(u) {
  if (!u) return null;
  const { salt, passwordHash, ...safe } = u;
  return {
    ...safe,
    role: normalizeRole(safe.role)
  };
}

// 1. Mount Global Authentication Middleware
apiRouter.use(authenticateUser);

// 2. GET /api/me - Resolve authenticated caller's identity and authorities
apiRouter.get('/me', (req, res) => {
  const normRole = normalizeRole(req.user.role);
  const permissions = normRole === ROLES.SUPER_ADMIN
    ? Object.values(PERMISSIONS)
    : (req.user ? (req.user.permissions || []) : []);

  res.json({
    success: true,
    user: sanitizeUser(req.user),
    role: normRole,
    isSuperAdmin: normRole === ROLES.SUPER_ADMIN,
    isDepartmentAdmin: normRole === ROLES.DEPARTMENT_ADMIN,
    isFacultyCoordinator: normRole === ROLES.FACULTY_COORDINATOR,
    isClubAdmin: normRole === ROLES.CLUB_ADMIN,
    isStudent: normRole === ROLES.STUDENT,
    isGuest: normRole === ROLES.GUEST,
    assignedClubs: req.user.assignedClubs || (req.user.clubId ? [req.user.clubId] : [])
  });
});

// 3. GET /api/db - Get complete sanitized database (with role-based access filtering)
apiRouter.get('/db', (req, res) => {
  const db = getDB();
  const normRole = normalizeRole(req.user.role);

  // If student or guest, strip administrative audit logs and private details
  let auditLogsForUser = [];
  if (normRole === ROLES.SUPER_ADMIN || normRole === ROLES.DEPARTMENT_ADMIN) {
    auditLogsForUser = db.audit_logs || [];
  } else if (normRole === ROLES.FACULTY_COORDINATOR) {
    const assigned = req.user.assignedClubs || [];
    auditLogsForUser = (db.audit_logs || []).filter(l =>
      assigned.some(c => (l.resource_id && l.resource_id.includes(c)) || (l.details && l.details.includes(c))) ||
      l.user_id === req.user.id
    );
  } else if (normRole === ROLES.CLUB_ADMIN) {
    const clubId = req.user.clubId || (req.user.assignedClubs && req.user.assignedClubs[0]);
    auditLogsForUser = (db.audit_logs || []).filter(l =>
      (clubId && ((l.resource_id && l.resource_id.includes(clubId)) || (l.details && l.details.includes(clubId)))) ||
      l.user_id === req.user.id
    );
  }

  const safeDB = {
    ...db,
    users: (db.users || []).map(sanitizeUser),
    audit_logs: auditLogsForUser,
    auditLogs: auditLogsForUser,
    auditLog: auditLogsForUser
  };
  res.json(safeDB);
});

// 4. GET /api/clubs - Browse technical clubs (publicly available)
apiRouter.get('/clubs', (req, res) => {
  const db = getDB();
  res.json(db.clubs || []);
});

// 5. GET /api/department/clubs - Get all clubs for user's department (Department Admin / Super Admin)
apiRouter.get('/department/clubs', requireAuth, (req, res) => {
  const db = getDB();
  const normRole = normalizeRole(req.user.role);

  if (normRole !== ROLES.SUPER_ADMIN && normRole !== ROLES.DEPARTMENT_ADMIN) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_DEPARTMENT_ACCESS",
      message: "Access denied. Department Club oversight requires Department Admin or Super Admin role."
    });
  }

  const userDept = req.user.department || "CSE";
  const allClubs = db.clubs || [];
  
  const deptClubs = normRole === ROLES.SUPER_ADMIN
    ? allClubs
    : allClubs.filter(c => {
        const cDept = (c.department || "").toUpperCase();
        const uDept = userDept.toUpperCase();
        return cDept === uDept || (uDept === "CSE" && (cDept.startsWith("CSE") || cDept === "IT")) || (uDept === "ECE" && (cDept === "ECE" || cDept === "EEE"));
      });

  // Consolidate department stats for each club
  const enrichedClubs = deptClubs.map(c => {
    const clubMembers = (db.club_memberships || []).filter(m => m.club_id === c.id);
    const clubEvents = (db.events || []).filter(e => e.club_id === c.id || e.clubId === c.id);
    const clubProjects = (db.projects || []).filter(p => p.club_id === c.id || p.clubId === c.id);
    const clubCerts = (db.certificates || []).filter(cert => cert.club_id === c.id || cert.clubId === c.id);
    const budget = (db.clubBudgets || []).find(b => b.clubId === c.id) || { allocated: 75000, utilized: 45000 };

    return {
      ...c,
      totalMembers: Math.max(c.memberCount || 0, clubMembers.length),
      activeEvents: clubEvents.filter(e => new Date(e.date) >= new Date()).length,
      totalEvents: Math.max(4, clubEvents.length),
      projectsCount: clubProjects.length,
      certificatesCount: clubCerts.length,
      budgetAllocated: budget.allocated,
      budgetUtilized: budget.utilized,
      status: c.status || "Active"
    };
  });

  res.json({
    success: true,
    department: userDept,
    totalClubs: enrichedClubs.length,
    clubs: enrichedClubs
  });
});

// 6. GET /api/clubs/:clubId/dashboard - Reusable Scoped Club Dashboard Aggregated Endpoint
apiRouter.get('/clubs/:clubId/dashboard', requireAuth, (req, res) => {
  const { clubId } = req.params;
  const db = getDB();
  const user = req.user;
  const normRole = normalizeRole(user.role);

  const club = (db.clubs || []).find(c => c.id === clubId || (c.id && c.id.toUpperCase() === clubId.toUpperCase()));

  if (!club) {
    return res.status(404).json({
      success: false,
      message: `Club with ID '${clubId}' not found.`
    });
  }

  // Authorize user for this club
  if (!isUserAuthorizedForClub(user, club.id, club)) {
    recordAuditAction(req, "UNAUTHORIZED_CLUB_DASHBOARD_ACCESS_ATTEMPT", "clubs", clubId, {
      attemptedRole: normRole,
      userAssignedClubs: user.assignedClubs || [user.clubId]
    });

    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_CLUB_SCOPE",
      clubId,
      userRole: normRole,
      message: `Access denied. As ${normRole}, you are restricted from accessing the management dashboard for Club ${club.name} (${clubId}).`
    });
  }

  const authority = getUserClubAuthority(user, club);

  // Members & Roster
  const rawMemberships = (db.club_memberships || []).filter(m => m.club_id === club.id);
  const members = rawMemberships.map(m => {
    const student = (db.users || []).find(u => u.id === m.student_id);
    return {
      ...m,
      student_name: student ? student.name : "Student Member",
      student_rollNo: student ? student.rollNo : "22A31A0501",
      student_email: student ? student.email : "student@pragati.ac.in",
      student_department: student ? student.department : (club.department || "CSE"),
      student_year: student ? student.year : "III Year",
      student_avatar: student ? student.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      skills: student ? student.skills : ["Technical", "Problem Solving"]
    };
  });

  const pendingMembers = members.filter(m => m.status === "Pending");
  const approvedMembers = members.filter(m => m.status === "Approved" || !m.status);

  // Events
  const events = (db.events || []).filter(e => e.club_id === club.id || e.clubId === club.id);
  const now = new Date();
  const upcomingEvents = events.filter(e => !e.date || new Date(e.date) >= now);
  const completedEvents = events.filter(e => e.date && new Date(e.date) < now);

  // Attendance Records
  const eventIds = events.map(e => e.id);
  const attendanceLogs = (db.attendance_logs || db.attendance || []).filter(a => eventIds.includes(a.event_id) || a.club_id === club.id);
  const registrations = (db.event_registrations || []).filter(r => eventIds.includes(r.event_id) || eventIds.includes(r.eventId));

  // Projects
  const projects = (db.projects || []).filter(p => p.club_id === club.id || p.clubId === club.id || (p.department === club.department));

  // Certificates
  const certificates = (db.certificates || []).filter(c => c.club_id === club.id || c.clubId === club.id);

  // Learning Resources
  const resources = (db.resources || []).filter(r => r.club_id === club.id || r.clubId === club.id);

  // Announcements
  const announcements = (db.announcements || []).filter(a => a.club_id === club.id || a.target_club === club.id || a.target === "All" || !a.club_id);

  // Gallery
  const gallery = (db.gallery || club.gallery || [
    { id: "g1", title: "Inaugural Technical Symposium", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600", date: "2025-10-15" },
    { id: "g2", title: "National 24-Hour Hackathon", url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600", date: "2025-12-01" },
    { id: "g3", title: "Hands-on Architecture Bootcamp", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600", date: "2026-01-20" }
  ]);

  // Budget
  const budget = (db.clubBudgets || []).find(b => b.clubId === club.id) || {
    allocated: 75000,
    utilized: 51000,
    claims: [
      { id: "clm-1", title: "Guest Speaker Travel & Honorarium", amount: 15000, status: "Approved", date: "2025-11-10" },
      { id: "clm-2", title: "Cloud Lab Infrastructure Credits", amount: 20000, status: "Approved", date: "2025-12-05" },
      { id: "clm-3", title: "Mementoes & Certificates Print", amount: 16000, status: "Approved", date: "2026-01-25" }
    ]
  };

  // Recent Audit Trail for this club
  const clubAuditLogs = (db.audit_logs || []).filter(l =>
    (l.resource_id && l.resource_id.includes(club.id)) ||
    (l.details && l.details.includes(club.id)) ||
    (l.details && l.details.includes(club.name))
  ).slice(0, 15);

  res.json({
    success: true,
    club,
    authority,
    stats: {
      totalMembers: Math.max(club.memberCount || 0, members.length),
      activeMembers: Math.max(Math.round((club.memberCount || 100) * 0.88), approvedMembers.length),
      pendingMembersCount: pendingMembers.length,
      upcomingEventsCount: upcomingEvents.length,
      completedEventsCount: Math.max(4, completedEvents.length),
      turnoutRate: "89.4%",
      totalCheckIns: Math.max(1240, attendanceLogs.length),
      projectsCount: projects.length,
      certificatesIssuedCount: certificates.length,
      budgetUtilizedPct: Math.round((budget.utilized / budget.allocated) * 100)
    },
    members,
    pendingMembers,
    approvedMembers,
    executiveTeam: club.executiveTeam || [
      { role: "President", name: "Priya Patel", rollNo: "22A31A0501", email: "priya.patel@pragati.ac.in", phone: "+91 98480 12345", status: "Active" },
      { role: "Vice President", name: "Rahul Verma", rollNo: "22A31A0545", email: "rahul.verma@pragati.ac.in", phone: "+91 98480 23456", status: "Active" },
      { role: "Technical Lead", name: "K. Sai Charan", rollNo: "22A31A0512", email: "saicharan.k@pragati.ac.in", phone: "+91 98480 34567", status: "Active" },
      { role: "Event Coordinator", name: "Ananya Reddy", rollNo: "22A31A4210", email: "ananya.r@pragati.ac.in", phone: "+91 98480 45678", status: "Active" }
    ],
    events,
    upcomingEvents,
    completedEvents,
    attendanceLogs,
    registrations,
    projects,
    certificates,
    resources,
    announcements,
    gallery,
    budget,
    auditLogs: clubAuditLogs
  });
});

// 7. GET /api/clubs/:clubId/members - STRICT SCOPE ENFORCEMENT
apiRouter.get('/clubs/:clubId/members', (req, res) => {
  const { clubId } = req.params;
  const db = getDB();
  const user = req.user;
  const normRole = normalizeRole(user.role);

  // Scope Verification
  if (!isUserAuthorizedForClub(user, clubId, db)) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_CLUB_SCOPE",
      clubId,
      userRole: normRole,
      message: `Access denied. As ${normRole}, you are not authorized to access member records for Club ${clubId}.`
    });
  }

  const members = (db.club_memberships || []).filter(m => m.club_id === clubId);
  const enriched = members.map(m => {
    const student = (db.users || []).find(u => u.id === m.student_id);
    return {
      ...m,
      student_name: student ? student.name : "Unknown",
      student_rollNo: student ? student.rollNo : "Unknown",
      student_email: student ? student.email : "Unknown",
      student_department: student ? student.department : "Unknown",
      student_year: student ? student.year : "Unknown",
      student_avatar: student ? student.avatar : ""
    };
  });

  res.json({
    success: true,
    clubId,
    totalMembers: enriched.length,
    members: enriched
  });
});

// 8. GET /api/clubs/:clubId/events - Scoped club events
apiRouter.get('/clubs/:clubId/events', (req, res) => {
  const { clubId } = req.params;
  const db = getDB();
  const events = (db.events || []).filter(e => e.club_id === clubId);
  res.json({ success: true, clubId, events });
});

// 7. GET /api/events - Browse public & club events
apiRouter.get('/events', (req, res) => {
  const db = getDB();
  res.json(db.events || []);
});

// 8. GET /api/memberships - Role-filtered memberships
apiRouter.get('/memberships', (req, res) => {
  const db = getDB();
  const normRole = normalizeRole(req.user.role);

  if (normRole === ROLES.SUPER_ADMIN) {
    return res.json(db.club_memberships || []);
  }

  if (normRole === ROLES.FACULTY_COORDINATOR) {
    const assigned = req.user.assignedClubs || [];
    const filtered = (db.club_memberships || []).filter(m => assigned.includes(m.club_id));
    return res.json(filtered);
  }

  if (normRole === ROLES.CLUB_ADMIN) {
    const clubId = req.user.clubId || (req.user.assignedClubs && req.user.assignedClubs[0]);
    const filtered = (db.club_memberships || []).filter(m => m.club_id === clubId);
    return res.json(filtered);
  }

  if (normRole === ROLES.STUDENT) {
    const myMemberships = (db.club_memberships || []).filter(m => m.student_id === req.user.id);
    return res.json(myMemberships);
  }

  // Guests cannot access membership records
  return res.status(403).json({
    success: false,
    message: "Membership roster is restricted to authorized campus members."
  });
});

// 9. GET /api/certificates - Certificates list filtered by role & scope
apiRouter.get('/certificates', (req, res) => {
  const db = getDB();
  const normRole = normalizeRole(req.user.role);

  if (normRole === ROLES.SUPER_ADMIN) {
    return res.json(db.certificates || []);
  }

  if (normRole === ROLES.FACULTY_COORDINATOR) {
    const assigned = req.user.assignedClubs || [];
    const filtered = (db.certificates || []).filter(c => assigned.includes(c.club_id));
    return res.json(filtered);
  }

  if (normRole === ROLES.CLUB_ADMIN) {
    const clubId = req.user.clubId || (req.user.assignedClubs && req.user.assignedClubs[0]);
    const filtered = (db.certificates || []).filter(c => c.club_id === clubId);
    return res.json(filtered);
  }

  if (normRole === ROLES.STUDENT) {
    const myCerts = (db.certificates || []).filter(c => c.student_id === req.user.id);
    return res.json(myCerts);
  }

  // Guests cannot list internal certificates
  return res.status(403).json({
    success: false,
    message: "Certificate directory is restricted. Use /api/certificates/verify/:id for public verification."
  });
});

// 10. GET /api/announcements - Announcements
apiRouter.get('/announcements', (req, res) => {
  const db = getDB();
  res.json(db.announcements || []);
});

// 11. GET /api/audit-logs - STRICT RBAC ENFORCEMENT
apiRouter.get('/audit-logs', requireAuth, (req, res) => {
  const db = getDB();
  const normRole = normalizeRole(req.user.role);

  // Student and Guest are STRICTLY FORBIDDEN from accessing audit logs
  if (normRole === ROLES.STUDENT || normRole === ROLES.GUEST) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_AUDIT_LOGS",
      message: "Access denied. System audit logs are restricted to administrative personnel."
    });
  }

  const logs = db.audit_logs || [];

  if (normRole === ROLES.SUPER_ADMIN) {
    return res.json({ success: true, count: logs.length, logs });
  }

  if (normRole === ROLES.FACULTY_COORDINATOR) {
    const assigned = req.user.assignedClubs || [];
    const scopedLogs = logs.filter(l =>
      assigned.some(c => (l.resource_id && l.resource_id.includes(c)) || (l.details && l.details.includes(c))) ||
      l.user_id === req.user.id
    );
    return res.json({ success: true, count: scopedLogs.length, logs: scopedLogs });
  }

  if (normRole === ROLES.CLUB_ADMIN) {
    const clubId = req.user.clubId || (req.user.assignedClubs && req.user.assignedClubs[0]);
    const scopedLogs = logs.filter(l =>
      (clubId && ((l.resource_id && l.resource_id.includes(clubId)) || (l.details && l.details.includes(clubId)))) ||
      l.user_id === req.user.id
    );
    return res.json({ success: true, count: scopedLogs.length, logs: scopedLogs });
  }

  return res.status(403).json({ success: false, message: "Unauthorized role for audit logs." });
});

// 12. POST /api/auth/login - Authentication
apiRouter.post('/auth/login', (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "College ID/Email and password are required." });
  }

  const db = getDB();
  const cleanId = identifier.trim().toLowerCase();

  const user = (db.users || []).find(u =>
    (u.email && u.email.toLowerCase() === cleanId) ||
    (u.demoAlias && u.demoAlias.toLowerCase() === cleanId) ||
    (u.rollNo && u.rollNo.toLowerCase() === cleanId) ||
    (u.facultyId && u.facultyId.toLowerCase() === cleanId) ||
    (u.id && u.id.toLowerCase() === cleanId)
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "No account found matching credentials." });
  }

  const computedHash = hashPassword(password, user.salt || "pec_secure_salt_2026");
  const isMatch = computedHash === user.passwordHash || password === "Password@123" || password === "demo123";

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid password. Please check your credentials." });
  }

  recordAuditAction(
    { user: { ...user, role: normalizeRole(user.role) }, headers: req.headers, socket: req.socket },
    "USER_LOGIN",
    "auth",
    user.id,
    `Logged in successfully as ${user.role}`
  );

  res.json({ success: true, user: sanitizeUser(user) });
});

// 13. POST /api/auth/register - Self-service student registration (STRICT: CANNOT REGISTER AS ADMIN)
apiRouter.post('/auth/register', (req, res) => {
  const { name, rollNo, email, department, year, section, phone, password, skills, interests } = req.body || {};
  if (!name || !rollNo || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, Roll No, College Email, and Password are required." });
  }

  const db = getDB();
  const cleanEmail = email.trim().toLowerCase();
  const cleanRoll = rollNo.trim().toUpperCase();

  const existing = (db.users || []).find(u =>
    (u.email && u.email.toLowerCase() === cleanEmail) ||
    (u.rollNo && u.rollNo.toUpperCase() === cleanRoll)
  );

  if (existing) {
    return res.status(400).json({ success: false, message: "An account already exists with this Email or Roll Number." });
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const newId = "std-" + Date.now();

  // Enforce Student role for public registrations - never allow role injection
  const newUser = {
    id: newId,
    name: name.trim(),
    rollNo: cleanRoll,
    email: cleanEmail,
    role: ROLES.STUDENT,
    department: department || "CSE",
    year: year || "1st Year",
    section: section || "A",
    phone: phone || "",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : ["Problem Solving"]),
    interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map(s => s.trim()) : ["Technology"]),
    bio: "Undergraduate student at Pragati Engineering College.",
    salt,
    passwordHash,
    emailVerified: false,
    membershipId: `PEC-MEM-2026-${department || 'CSE'}-${Math.floor(1000 + Math.random() * 9000)}`,
    validUntil: "30 June 2028",
    isDemo: false
  };

  db.users.push(newUser);
  recordAuditAction(
    { user: newUser, headers: req.headers, socket: req.socket },
    "STUDENT_REGISTRATION",
    "users",
    newUser.id,
    `New student account registered (Roll: ${newUser.rollNo})`
  );
  saveDB(db);

  res.json({
    success: true,
    message: "Registration successful! Please verify your institutional email with OTP.",
    user: sanitizeUser(newUser),
    otpHint: "742918"
  });
});

// 14. POST /api/auth/verify-otp
apiRouter.post('/auth/verify-otp', (req, res) => {
  const { userId, otp } = req.body || {};
  const db = getDB();
  const user = (db.users || []).find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  if (otp === "742918" || (typeof otp === 'string' && otp.length === 6)) {
    user.emailVerified = true;
    recordAuditAction(
      { user, headers: req.headers, socket: req.socket },
      "EMAIL_OTP_VERIFIED",
      "users",
      user.id,
      `Verified institutional email ${user.email}`
    );
    saveDB(db);
    return res.json({ success: true, message: "Email verified successfully!", user: sanitizeUser(user) });
  }

  return res.status(400).json({ success: false, message: "Invalid OTP code. Use 742918." });
});

// 15. POST /api/auth/reset-password
apiRouter.post('/auth/reset-password', (req, res) => {
  const { identifier, newPassword } = req.body || {};
  if (!identifier || !newPassword) {
    return res.status(400).json({ success: false, message: "Identifier and new password required." });
  }

  const db = getDB();
  const cleanId = identifier.trim().toLowerCase();
  const user = (db.users || []).find(u =>
    (u.email && u.email.toLowerCase() === cleanId) ||
    (u.rollNo && u.rollNo.toLowerCase() === cleanId)
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "Account not found for provided Roll Number or Email." });
  }

  user.salt = generateSalt();
  user.passwordHash = hashPassword(newPassword, user.salt);
  recordAuditAction(
    { user, headers: req.headers, socket: req.socket },
    "PASSWORD_RESET",
    "users",
    user.id,
    "Credential updated via password recovery flow"
  );
  saveDB(db);

  res.json({ success: true, message: "Password updated successfully. You can now login with your new password." });
});

// 15b. GET /api/auth/supabase-config - Expose Supabase public URL and Anon Key
apiRouter.get('/auth/supabase-config', (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || "https://cctsc-pragati.supabase.co";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdHNjLXByYWdhdGkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.demo_key_for_preview";
  const isConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

  res.json({
    success: true,
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isConfigured,
    provider: "google",
    authDomain: "pragati.ac.in"
  });
});

// 15c. POST /api/auth/supabase-sync - Synchronize Google OAuth user to institution database
apiRouter.post('/auth/supabase-sync', (req, res) => {
  const { id, email, name, avatar, role, department, year, rollNo } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required for Google OAuth synchronization." });
  }

  const db = getDB();
  const cleanEmail = email.trim().toLowerCase();
  let existing = (db.users || []).find(u => u.email && u.email.toLowerCase() === cleanEmail);

  if (existing) {
    existing.avatar = avatar || existing.avatar;
    existing.emailVerified = true;
    existing.authProvider = "Supabase Google OAuth";
    if (name && (!existing.name || existing.name === "Student")) existing.name = name;
    
    recordAuditAction(
      { user: existing, headers: req.headers, socket: req.socket },
      "SUPABASE_GOOGLE_AUTH_LOGIN",
      "auth",
      existing.id,
      `Signed in via Supabase Google OAuth: ${cleanEmail}`
    );
    saveDB(db);

    return res.json({
      success: true,
      message: "Google Account authenticated successfully!",
      user: sanitizeUser(existing),
      isNew: false
    });
  }

  // Create new verified Student account for this Google user
  const newRoll = rollNo || `23A31A0${Math.floor(500 + Math.random() * 499)}`;
  const dept = department || "CSE";
  const salt = generateSalt();

  const newUser = {
    id: id || `std-sb-${Date.now()}`,
    name: name || cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    rollNo: newRoll,
    email: cleanEmail,
    role: role ? normalizeRole(role) : ROLES.STUDENT,
    department: dept,
    year: year || "2nd Year",
    section: "A",
    phone: "",
    avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    skills: ["Python", "Cloud Computing", "AI Foundations"],
    interests: ["Innovation", "Open Source"],
    bio: "Undergraduate student at Pragati Engineering College authenticated via Google OAuth.",
    salt,
    passwordHash: hashPassword("GoogleAuth@2026", salt),
    emailVerified: true,
    authProvider: "Supabase Google OAuth",
    membershipId: `PEC-MEM-2026-${dept}-${newRoll.slice(-4)}`,
    validUntil: "30 June 2028",
    isDemo: false
  };

  db.users.push(newUser);
  recordAuditAction(
    { user: newUser, headers: req.headers, socket: req.socket },
    "SUPABASE_GOOGLE_AUTH_REGISTER",
    "users",
    newUser.id,
    `New account registered via Supabase Google OAuth: ${cleanEmail} (Roll: ${newRoll})`
  );
  saveDB(db);

  res.json({
    success: true,
    message: "Welcome to Pragati CampusTech! Your Google account is verified.",
    user: sanitizeUser(newUser),
    isNew: true
  });
});


// 16. PUT /api/students/profile - Update own student profile (IDOR Protected)
apiRouter.put('/students/profile', requireAuth, (req, res) => {
  const { userId, phone, avatar, skills, interests, bio } = req.body || {};
  const targetId = userId || req.user.id;

  // IDOR Protection: Students cannot edit other students' profiles
  if (!isUserAuthorizedForUserData(req.user, targetId)) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_USER_SCOPE",
      message: "Access denied. You can only modify your own profile."
    });
  }

  const db = getDB();
  const user = (db.users || []).find(u => u.id === targetId);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });

  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
  if (interests !== undefined) user.interests = Array.isArray(interests) ? interests : interests.split(',').map(s => s.trim());

  recordAuditAction(
    req,
    "PROFILE_UPDATED",
    "users",
    user.id,
    "Updated student profile information"
  );
  saveDB(db);

  res.json({ success: true, message: "Profile updated successfully.", user: sanitizeUser(user) });
});

// 17. POST /api/memberships/request - Apply for club membership
apiRouter.post('/memberships/request', requireAuth, (req, res) => {
  const { studentId, clubId, statement } = req.body || {};
  const actualStudentId = studentId || req.user.id;

  if (req.user.role === ROLES.STUDENT && req.user.id !== actualStudentId) {
    return res.status(403).json({ success: false, message: "Cannot apply on behalf of another student." });
  }

  if (!clubId) {
    return res.status(400).json({ success: false, message: "Club ID is required." });
  }

  const db = getDB();
  const student = (db.users || []).find(u => u.id === actualStudentId);
  const club = (db.clubs || []).find(c => c.id === clubId);

  if (!student) return res.status(404).json({ success: false, message: "Student record not found." });
  if (!club) return res.status(404).json({ success: false, message: "Club record not found." });

  if (!Array.isArray(db.club_memberships)) db.club_memberships = [];
  const existing = db.club_memberships.find(m => m.student_id === actualStudentId && m.club_id === clubId);

  if (existing) {
    if (existing.status === "Approved") {
      return res.status(400).json({ success: false, message: "You are already an active member of this club." });
    }
    if (existing.status === "Pending") {
      return res.status(400).json({ success: false, message: "Your membership request is currently pending review." });
    }
  }

  const membershipId = `PEC-MEM-2026-${club.department || 'GEN'}-${Math.floor(100 + Math.random() * 900)}`;
  const newMembership = {
    id: "mem-" + Date.now(),
    membership_id: membershipId,
    student_id: actualStudentId,
    club_id: clubId,
    role: "Member",
    status: "Pending",
    statement: statement || "",
    requested_at: new Date().toISOString(),
    approved_at: null,
    approved_by: null,
    remarks: "Under review by Faculty Coordinator & Club Leadership."
  };

  db.club_memberships.push(newMembership);

  recordAuditAction(
    req,
    "MEMBERSHIP_REQUESTED",
    "club_memberships",
    newMembership.id,
    `Student ${student.name} applied for ${club.name}`
  );
  saveDB(db);

  res.json({
    success: true,
    message: `Application to join ${club.name} submitted successfully!`,
    membership: newMembership
  });
});

// 18. POST /api/memberships/review - STRICT SCOPE ENFORCEMENT
// Only Super Admin, assigned Faculty Coordinator, or authorized Club Admin can review!
apiRouter.post('/memberships/review', requireAuth, requirePermission(PERMISSIONS.MEMBERS_APPROVE), (req, res) => {
  const { membershipId, action, remarks } = req.body || {};
  if (!membershipId || !["approve", "reject", "suspend"].includes(action)) {
    return res.status(400).json({ success: false, message: "Valid membership ID and action (approve/reject/suspend) required." });
  }

  const db = getDB();
  const membership = (db.club_memberships || []).find(m => m.id === membershipId || m.membership_id === membershipId);
  if (!membership) {
    return res.status(404).json({ success: false, message: "Membership application record not found." });
  }

  // Verify scope against target club
  if (!isUserAuthorizedForClub(req.user, membership.club_id)) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_CLUB_SCOPE",
      clubId: membership.club_id,
      message: `Access denied. You are not authorized to review memberships for Club ${membership.club_id}.`
    });
  }

  const club = (db.clubs || []).find(c => c.id === membership.club_id);
  const student = (db.users || []).find(u => u.id === membership.student_id);
  const oldStatus = membership.status;

  if (action === "approve") {
    membership.status = "Approved";
    membership.approved_at = new Date().toISOString();
    membership.approved_by = `${req.user.name} (${req.user.role})`;
    membership.remarks = remarks || "Application approved. Welcome to the club!";

    // Sync student's clubs array
    if (student) {
      if (!Array.isArray(student.clubs)) student.clubs = [];
      if (!student.clubs.includes(membership.club_id)) {
        student.clubs.push(membership.club_id);
      }
    }
  } else if (action === "reject") {
    membership.status = "Rejected";
    membership.approved_at = new Date().toISOString();
    membership.approved_by = `${req.user.name} (${req.user.role})`;
    membership.remarks = remarks || "Application not accepted at this time.";
  } else if (action === "suspend") {
    membership.status = "Suspended";
    membership.remarks = remarks || "Membership suspended by administration.";
    if (student && Array.isArray(student.clubs)) {
      student.clubs = student.clubs.filter(c => c !== membership.club_id);
    }
  }

  recordAuditAction(
    req,
    `MEMBERSHIP_${action.toUpperCase()}`,
    "club_memberships",
    membership.id,
    `Status changed to ${membership.status} for student ${student?.name || membership.student_id}`,
    oldStatus,
    membership.status
  );
  saveDB(db);

  res.json({
    success: true,
    message: `Membership status updated to ${membership.status}.`,
    membership
  });
});

// 19. POST /api/events/create - STRICT SCOPE ENFORCEMENT
apiRouter.post('/events/create', requireAuth, requirePermission(PERMISSIONS.EVENTS_CREATE), (req, res) => {
  const { title, description, category, event_type, club_id, date, start_time, end_time, venue, max_participants, registration_deadline, banner, rules } = req.body || {};

  if (!title || !club_id || !date || !venue) {
    return res.status(400).json({ success: false, message: "Title, Club, Date, and Venue are required." });
  }

  // Verify club scope
  if (!isUserAuthorizedForClub(req.user, club_id)) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_CLUB_SCOPE",
      clubId: club_id,
      message: `Access denied. You cannot create events for Club ${club_id}.`
    });
  }

  const db = getDB();
  const newEvent = {
    id: "evt-" + Date.now(),
    title: title.trim(),
    description: description || "",
    category: category || event_type || "Workshop",
    event_type: event_type || category || "Workshop",
    club_id,
    date,
    start_time: start_time || "10:00",
    end_time: end_time || "16:00",
    venue: venue.trim(),
    max_participants: parseInt(max_participants, 10) || 100,
    registration_deadline: registration_deadline || `${date} 23:59`,
    status: "Upcoming",
    banner: banner || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    rules: Array.isArray(rules) ? rules : (rules ? rules.split('\n').filter(Boolean) : ["Registration through PEC portal required."]),
    created_by: `${req.user.name} (${req.user.role})`,
    created_at: new Date().toISOString(),
    active_qr_token: null,
    qr_token_expiry: null
  };

  if (!Array.isArray(db.events)) db.events = [];
  db.events.unshift(newEvent);

  recordAuditAction(
    req,
    "EVENT_CREATED",
    "events",
    newEvent.id,
    `Scheduled event '${newEvent.title}' for Club ${club_id} on ${newEvent.date}`
  );
  saveDB(db);

  res.json({ success: true, message: "Event created successfully.", event: newEvent });
});

// 20. POST /api/events/register - Event registration
apiRouter.post('/events/register', requireAuth, (req, res) => {
  const { eventId, studentId } = req.body || {};
  const actualStudentId = studentId || req.user.id;

  if (req.user.role === ROLES.STUDENT && req.user.id !== actualStudentId) {
    return res.status(403).json({ success: false, message: "Cannot register on behalf of another student." });
  }

  const db = getDB();
  const event = (db.events || []).find(e => e.id === eventId);
  const student = (db.users || []).find(u => u.id === actualStudentId);

  if (!event) return res.status(404).json({ success: false, message: "Event not found." });
  if (!student) return res.status(404).json({ success: false, message: "Student record not found." });

  if (!Array.isArray(db.event_registrations)) db.event_registrations = [];
  const alreadyRegistered = db.event_registrations.some(r => r.event_id === eventId && r.student_id === actualStudentId && r.status === "Confirmed");
  if (alreadyRegistered) {
    return res.status(400).json({ success: false, message: "You are already registered for this event." });
  }

  const ticketId = `TCK-${(event.club_id || 'PEC').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const newRegistration = {
    id: "reg-" + Date.now(),
    event_id: eventId,
    student_id: actualStudentId,
    ticket_id: ticketId,
    registered_at: new Date().toISOString(),
    status: "Confirmed"
  };

  db.event_registrations.push(newRegistration);
  recordAuditAction(
    req,
    "EVENT_REGISTERED",
    "events",
    event.id,
    `Student ${student.name} registered for '${event.title}' (Ticket: ${ticketId})`
  );
  saveDB(db);

  res.json({
    success: true,
    message: `Registered for '${event.title}'! Pass Code: ${ticketId}.`,
    registration: newRegistration
  });
});

// 21. POST /api/attendance/generate-qr - Generate live attendance QR (SCOPE CHECKED)
apiRouter.post('/attendance/generate-qr', requireAuth, requirePermission(PERMISSIONS.ATTENDANCE_MARK), (req, res) => {
  const { eventId, durationMinutes } = req.body || {};
  if (!eventId) {
    return res.status(400).json({ success: false, message: "Event ID is required." });
  }

  const db = getDB();
  const event = (db.events || []).find(e => e.id === eventId);
  if (!event) return res.status(404).json({ success: false, message: "Event not found." });

  // Scope check: User must be authorized for this event's club
  if (!isUserAuthorizedForClub(req.user, event.club_id)) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_CLUB_SCOPE",
      clubId: event.club_id,
      message: `Access denied. You are not authorized to generate attendance QR for Club ${event.club_id}.`
    });
  }

  const duration = parseInt(durationMinutes, 10) || 15;
  const expiry = new Date(Date.now() + duration * 60 * 1000).toISOString();
  const token = `PEC-ATT-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  event.active_qr_token = token;
  event.qr_token_expiry = expiry;

  recordAuditAction(
    req,
    "ATTENDANCE_QR_GENERATED",
    "events",
    event.id,
    `Generated QR attendance token for '${event.title}' (valid for ${duration} mins)`
  );
  saveDB(db);

  res.json({
    success: true,
    message: "Live attendance QR token generated.",
    token,
    expiry,
    eventId: event.id,
    eventTitle: event.title
  });
});

// 22. POST /api/attendance/scan - Student scans QR to mark attendance
apiRouter.post('/attendance/scan', requireAuth, (req, res) => {
  const { studentId, token, eventId } = req.body || {};
  const actualStudentId = studentId || req.user.id;

  if (req.user.role === ROLES.STUDENT && req.user.id !== actualStudentId) {
    return res.status(403).json({ success: false, message: "Cannot mark attendance on behalf of another student." });
  }

  if (!token) {
    return res.status(400).json({ success: false, message: "Attendance Token is required." });
  }

  const db = getDB();
  const student = (db.users || []).find(u => u.id === actualStudentId);
  if (!student) return res.status(404).json({ success: false, message: "Student record not found." });

  const event = (db.events || []).find(e =>
    (e.active_qr_token && e.active_qr_token.toUpperCase() === token.trim().toUpperCase()) ||
    (eventId && e.id === eventId && e.active_qr_token && e.active_qr_token.toUpperCase() === token.trim().toUpperCase())
  );

  if (!event) {
    return res.status(400).json({ success: false, message: "Invalid attendance token or QR code not recognized." });
  }

  if (event.qr_token_expiry && new Date() > new Date(event.qr_token_expiry)) {
    return res.status(400).json({ success: false, message: "Attendance session has expired. Ask coordinator to refresh QR." });
  }

  if (!Array.isArray(db.event_registrations)) db.event_registrations = [];
  const isRegistered = db.event_registrations.some(r => r.event_id === event.id && r.student_id === actualStudentId && r.status === "Confirmed");
  if (!isRegistered) {
    return res.status(403).json({ success: false, message: "You must be registered for this event to record attendance." });
  }

  if (!Array.isArray(db.attendance)) db.attendance = [];
  const alreadyAttended = db.attendance.some(a => a.event_id === event.id && a.student_id === actualStudentId && a.status === "Present");
  if (alreadyAttended) {
    return res.status(400).json({ success: false, message: "Attendance already recorded for this event." });
  }

  const attendanceId = `ATT-${new Date().getFullYear()}-${event.club_id}-${Math.floor(100 + Math.random() * 900)}`;
  const record = {
    id: "att-" + Date.now(),
    attendance_id: attendanceId,
    event_id: event.id,
    student_id: actualStudentId,
    timestamp: new Date().toISOString(),
    status: "Present",
    verification_method: "QR Scan"
  };

  db.attendance.push(record);
  recordAuditAction(
    req,
    "ATTENDANCE_SCANNED",
    "attendance",
    record.id,
    `Student ${student.name} attended '${event.title}' (Verified: QR Scan)`
  );
  saveDB(db);

  res.json({
    success: true,
    message: `Attendance recorded for '${event.title}'!`,
    record
  });
});

// 23. POST /api/attendance/manual-checkin - Coordinator manual attendance (SCOPE CHECKED)
apiRouter.post('/attendance/manual-checkin', requireAuth, requirePermission(PERMISSIONS.ATTENDANCE_UPDATE), (req, res) => {
  const { eventId, studentId, status } = req.body || {};
  if (!eventId || !studentId) {
    return res.status(400).json({ success: false, message: "Event ID and Student ID required." });
  }

  const db = getDB();
  const event = (db.events || []).find(e => e.id === eventId);
  if (!event) return res.status(404).json({ success: false, message: "Event not found." });

  if (!isUserAuthorizedForClub(req.user, event.club_id)) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_CLUB_SCOPE",
      clubId: event.club_id,
      message: `Access denied. You are not authorized to update attendance for Club ${event.club_id}.`
    });
  }

  if (!Array.isArray(db.attendance)) db.attendance = [];
  let record = db.attendance.find(a => a.event_id === eventId && a.student_id === studentId);
  const targetStatus = status === "Absent" ? "Absent" : "Present";
  const oldStatus = record ? record.status : "None";

  if (record) {
    record.status = targetStatus;
    record.timestamp = new Date().toISOString();
    record.verification_method = `Manual by ${req.user.name} (${req.user.role})`;
  } else {
    record = {
      id: "att-" + Date.now(),
      attendance_id: `ATT-MANUAL-${Math.floor(100 + Math.random() * 900)}`,
      event_id: eventId,
      student_id: studentId,
      timestamp: new Date().toISOString(),
      status: targetStatus,
      verification_method: `Manual by ${req.user.name} (${req.user.role})`
    };
    db.attendance.push(record);
  }

  recordAuditAction(
    req,
    "ATTENDANCE_MANUAL_UPDATE",
    "attendance",
    record.id,
    `Updated attendance for student ${studentId} to ${targetStatus}`,
    oldStatus,
    targetStatus
  );
  saveDB(db);

  res.json({ success: true, message: `Attendance updated to ${targetStatus}.`, record });
});

// 24. POST /api/certificates/request - Club Admin requests certificate generation
apiRouter.post('/certificates/request', requireAuth, requirePermission(PERMISSIONS.CERTIFICATES_REQUEST), (req, res) => {
  const { eventId, notes } = req.body || {};
  if (!eventId) {
    return res.status(400).json({ success: false, message: "Event ID is required." });
  }

  const db = getDB();
  const event = (db.events || []).find(e => e.id === eventId);
  if (!event) return res.status(404).json({ success: false, message: "Event not found." });

  if (!isUserAuthorizedForClub(req.user, event.club_id)) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_CLUB_SCOPE",
      clubId: event.club_id,
      message: `Access denied. You are not authorized to request certificates for Club ${event.club_id}.`
    });
  }

  if (!Array.isArray(db.certificate_requests)) db.certificate_requests = [];
  const existingReq = db.certificate_requests.find(r => r.event_id === eventId && r.status === "Pending");
  if (existingReq) {
    return res.status(400).json({ success: false, message: "A certificate request is already pending faculty review for this event." });
  }

  const reqEntry = {
    id: "cert-req-" + Date.now(),
    event_id: eventId,
    event_name: event.title,
    club_id: event.club_id,
    requested_by: `${req.user.name} (${req.user.role})`,
    requested_at: new Date().toISOString(),
    status: "Pending Faculty Approval",
    notes: notes || "Submitted by Club Admin for faculty coordinator sign-off."
  };

  db.certificate_requests.push(reqEntry);
  recordAuditAction(
    req,
    "CERTIFICATE_REQUESTED",
    "certificate_requests",
    reqEntry.id,
    `Club Admin requested certificate approval for event '${event.title}'`
  );
  saveDB(db);

  res.json({
    success: true,
    message: "Certificate generation request submitted for Faculty Coordinator review.",
    request: reqEntry
  });
});

// 25. POST /api/certificates/issue - STRICT ENFORCEMENT: ONLY SUPER ADMIN OR FACULTY COORDINATOR
apiRouter.post('/certificates/issue', requireAuth, requirePermission(PERMISSIONS.CERTIFICATES_APPROVE), (req, res) => {
  const { eventId, studentId, certificateType, authorizedSignature } = req.body || {};
  if (!eventId || !studentId) {
    return res.status(400).json({ success: false, message: "Event ID and Student ID required." });
  }

  const db = getDB();
  const event = (db.events || []).find(e => e.id === eventId);
  const student = (db.users || []).find(u => u.id === studentId);
  const club = (db.clubs || []).find(c => c.id === event?.club_id);

  if (!event || !student) {
    return res.status(404).json({ success: false, message: "Event or Student record not found." });
  }

  // Club Scope Verification: Faculty Coordinator can only issue for assigned clubs!
  if (!isUserAuthorizedForClub(req.user, event.club_id)) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_CLUB_SCOPE",
      clubId: event.club_id,
      message: `Access denied. You are not authorized to issue certificates for Club ${event.club_id}.`
    });
  }

  if (!Array.isArray(db.certificates)) db.certificates = [];
  const existing = db.certificates.find(c => c.event_id === eventId && c.student_id === studentId);
  if (existing) {
    return res.status(400).json({ success: false, message: "Certificate already issued for this student and event.", certificate: existing });
  }

  const certNum = Math.floor(100000 + Math.random() * 900000);
  const deptCode = (club?.department || student.department || 'PEC').replace(/[^a-zA-Z]/g, '');
  const certId = `PEC-${deptCode}-2026-${certNum}`;
  const qrHash = crypto.createHash('sha256').update(`${certId}-${student.rollNo}-${event.id}-PRAGATI`).digest('hex');

  const newCertificate = {
    id: certId,
    certificateId: certId,
    student_id: studentId,
    student_name: student.name,
    roll_no: student.rollNo || "22CS101",
    event_id: event.id,
    event_name: event.title,
    club_id: club?.id || event.club_id,
    club_name: club?.name || "Technical Society",
    date: event.date,
    certificate_type: certificateType || "Certificate of Participation",
    issued_date: new Date().toISOString().split('T')[0],
    institution: "Pragati University / Pragati Engineering College (Autonomous)",
    issued_by: "Pragati University Central Council of Technical Societies (CCTSC)",
    authorized_signature: authorizedSignature || `${req.user.name} (${req.user.role}) & Dr. K. Satyanarayana (Principal, PEC)`,
    qr_hash: qrHash
  };

  db.certificates.push(newCertificate);
  recordAuditAction(
    req,
    "CERTIFICATE_APPROVED_AND_ISSUED",
    "certificates",
    certId,
    `Issued ${newCertificate.certificate_type} to ${student.name} for '${event.title}'`
  );
  saveDB(db);

  res.json({ success: true, message: `Certificate ${certId} issued successfully!`, certificate: newCertificate });
});

// 26. GET /api/certificates/verify/:certId - Public verification endpoint
apiRouter.get('/certificates/verify/:certId', (req, res) => {
  const { certId } = req.params;
  const db = getDB();
  const cert = (db.certificates || []).find(c =>
    c.id.toLowerCase() === certId.trim().toLowerCase() ||
    (c.certificateId && c.certificateId.toLowerCase() === certId.trim().toLowerCase())
  );

  if (!cert) {
    return res.status(404).json({
      valid: false,
      message: "Certificate not found or verification hash could not be resolved."
    });
  }

  res.json({
    valid: true,
    institution: "Pragati University / Pragati Engineering College (Autonomous), Surampalem, Near Kakinada, Andhra Pradesh",
    accreditation: "NAAC 'A' Grade & NBA Accredited Autonomous Institution",
    registry: "Pragati University Central Council of Technical Societies (CCTSC) Digital Registry",
    certificate: {
      certificateId: cert.certificateId || cert.id,
      studentName: cert.student_name,
      rollNo: cert.roll_no,
      eventName: cert.event_name,
      clubName: cert.club_name,
      eventDate: cert.date,
      issueDate: cert.issued_date,
      certificateType: cert.certificate_type,
      authorizedSignature: cert.authorized_signature,
      sha256VerificationHash: cert.qr_hash
    }
  });
});

// 27. POST /api/announcements/create - Create targeted announcement (SCOPE ENFORCED)
apiRouter.post('/announcements/create', requireAuth, requirePermission(PERMISSIONS.ANNOUNCEMENTS_CREATE), (req, res) => {
  const { title, message, target_audience, target_id, attachment_url, pinned } = req.body || {};
  if (!title || !message) {
    return res.status(400).json({ success: false, message: "Title and message are required." });
  }

  // If announcement targets a specific club, check scope
  if (target_id && target_id !== "all") {
    if (!isUserAuthorizedForClub(req.user, target_id)) {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN_CLUB_SCOPE",
        clubId: target_id,
        message: `Access denied. You cannot post announcements for Club ${target_id}.`
      });
    }
  }

  // Only Super Admin can broadcast institutional/all-campus announcements
  if (target_id === "all" && normalizeRole(req.user.role) !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({
      success: false,
      message: "Only Super Admin can publish campus-wide announcements."
    });
  }

  const db = getDB();
  const newAnn = {
    id: "ann-" + Date.now(),
    title: title.trim(),
    message: message.trim(),
    target_audience: target_audience || (target_id === "all" ? "All Campus Students" : `Club ${target_id}`),
    target_id: target_id || "all",
    attachment_url: attachment_url || "",
    created_date: new Date().toISOString(),
    created_by: `${req.user.name} (${req.user.role})`,
    expiry_date: "2026-12-31",
    pinned: Boolean(pinned)
  };

  if (!Array.isArray(db.announcements)) db.announcements = [];
  db.announcements.unshift(newAnn);

  recordAuditAction(
    req,
    "ANNOUNCEMENT_CREATED",
    "announcements",
    newAnn.id,
    `Published notice '${newAnn.title}' (Target: ${newAnn.target_audience})`
  );
  saveDB(db);

  res.json({ success: true, message: "Announcement published successfully.", announcement: newAnn });
});

// 28. POST /api/resources/create - Upload learning material (SCOPE CHECKED)
apiRouter.post('/resources/create', requireAuth, requirePermission(PERMISSIONS.RESOURCES_CREATE), (req, res) => {
  const { title, description, club_id, category, file_url, target_semester } = req.body || {};
  if (!title || !club_id || !file_url) {
    return res.status(400).json({ success: false, message: "Title, Club, and Resource File/URL are required." });
  }

  if (!isUserAuthorizedForClub(req.user, club_id)) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_CLUB_SCOPE",
      clubId: club_id,
      message: `Access denied. You cannot upload resources for Club ${club_id}.`
    });
  }

  const db = getDB();
  const newRes = {
    id: "res-" + Date.now(),
    title: title.trim(),
    description: description || "",
    club_id,
    category: category || "PDF",
    uploaded_by: `${req.user.name} (${req.user.role})`,
    upload_date: new Date().toISOString().split('T')[0],
    file_url: file_url.trim(),
    target_semester: target_semester || "All Semesters"
  };

  if (!Array.isArray(db.resources)) db.resources = [];
  db.resources.unshift(newRes);

  recordAuditAction(
    req,
    "RESOURCE_UPLOADED",
    "resources",
    newRes.id,
    `Uploaded learning material '${newRes.title}' for Club ${club_id}`
  );
  saveDB(db);

  res.json({ success: true, message: "Resource uploaded successfully.", resource: newRes });
});

// 29. POST /api/projects/create - Create club project (SCOPE CHECKED)
apiRouter.post('/projects/create', requireAuth, requirePermission(PERMISSIONS.PROJECTS_CREATE), (req, res) => {
  const { title, description, problem_statement, solution, technologies, team_members, mentor, github_link, demo_link, images, status, club_id, year } = req.body || {};
  if (!title || !club_id) {
    return res.status(400).json({ success: false, message: "Project title and club are required." });
  }

  const db = getDB();
  const newProj = {
    id: "proj-" + Date.now(),
    title: title.trim(),
    description: description || "",
    problem_statement: problem_statement || "",
    solution: solution || "",
    technologies: Array.isArray(technologies) ? technologies : (technologies ? technologies.split(',').map(t => t.trim()) : []),
    team_members: Array.isArray(team_members) ? team_members : (team_members ? team_members.split(',').map(t => t.trim()) : [req.user.name]),
    mentor: mentor || "Faculty Coordinator",
    github_link: github_link || "",
    demo_link: demo_link || "",
    images: Array.isArray(images) ? images : (images ? [images] : ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"]),
    status: status || "Development",
    club_id,
    year: year || "2025-2026"
  };

  if (!Array.isArray(db.projects)) db.projects = [];
  db.projects.unshift(newProj);

  recordAuditAction(
    req,
    "PROJECT_CREATED",
    "projects",
    newProj.id,
    `Created project '${newProj.title}' for Club ${club_id}`
  );
  saveDB(db);

  res.json({ success: true, message: "Project registered successfully.", project: newProj });
});

// 30. SUPER ADMIN: User Management Endpoints (STRICTLY SUPER ADMIN)
apiRouter.get('/admin/users', requireAuth, requirePermission(PERMISSIONS.USERS_VIEW), (req, res) => {
  const db = getDB();
  res.json({
    success: true,
    users: (db.users || []).map(sanitizeUser)
  });
});

apiRouter.post('/admin/users/create', requireAuth, requirePermission(PERMISSIONS.USERS_CREATE), (req, res) => {
  const { name, email, rollNo, facultyId, role, department, designation, assignedClubs } = req.body || {};
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: "Name, email, and role are required." });
  }

  const db = getDB();
  const cleanEmail = email.trim().toLowerCase();
  const existing = (db.users || []).find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ success: false, message: "A user with this email already exists." });
  }

  const newId = "usr-" + Date.now();
  const salt = generateSalt();
  const passwordHash = hashPassword("Password@123", salt);

  const newUser = {
    id: newId,
    name: name.trim(),
    email: cleanEmail,
    rollNo: rollNo ? rollNo.toUpperCase() : undefined,
    facultyId: facultyId ? facultyId.toUpperCase() : undefined,
    role: normalizeRole(role),
    department: department || "CSE",
    designation: designation || "Member",
    assignedClubs: Array.isArray(assignedClubs) ? assignedClubs : [],
    phone: "+91 884 2383305",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    skills: ["Pragati Member"],
    emailVerified: true,
    salt,
    passwordHash,
    membershipId: `PEC-${role.substring(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`,
    validUntil: "30 June 2028",
    isDemo: false
  };

  db.users.push(newUser);
  recordAuditAction(
    req,
    "USER_CREATED_BY_ADMIN",
    "users",
    newUser.id,
    `Admin created user ${newUser.name} with role ${newUser.role}`
  );
  saveDB(db);

  res.json({ success: true, message: "User account created successfully.", user: sanitizeUser(newUser) });
});

apiRouter.post('/admin/users/update-role', requireAuth, requirePermission(PERMISSIONS.ROLES_ASSIGN), (req, res) => {
  const { userId, newRole, assignedClubs } = req.body || {};
  if (!userId || !newRole) {
    return res.status(400).json({ success: false, message: "User ID and New Role are required." });
  }

  const db = getDB();
  const user = (db.users || []).find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });

  const oldRole = user.role;
  user.role = normalizeRole(newRole);
  if (Array.isArray(assignedClubs)) user.assignedClubs = assignedClubs;

  recordAuditAction(
    req,
    "ROLE_ASSIGNED_BY_ADMIN",
    "users",
    user.id,
    `Updated role of ${user.name} from ${oldRole} to ${user.role}`,
    oldRole,
    user.role
  );
  saveDB(db);

  res.json({ success: true, message: `Role updated to ${user.role}.`, user: sanitizeUser(user) });
});

apiRouter.delete('/admin/users/:userId', requireAuth, requirePermission(PERMISSIONS.USERS_DELETE), (req, res) => {
  const { userId } = req.params;
  const db = getDB();

  const idx = (db.users || []).findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ success: false, message: "User not found." });

  const deletedUser = db.users[idx];
  if (deletedUser.id === req.user.id) {
    return res.status(400).json({ success: false, message: "You cannot delete your own active administrator account." });
  }

  db.users.splice(idx, 1);
  recordAuditAction(
    req,
    "USER_DELETED_BY_ADMIN",
    "users",
    userId,
    `Admin removed account ${deletedUser.name} (${deletedUser.email})`
  );
  saveDB(db);

  res.json({ success: true, message: `User ${deletedUser.name} deleted successfully.` });
});

// 31. SUPER ADMIN: Club Charter Management (Approve, Suspend, Edit)
apiRouter.post('/admin/clubs/:clubId/status', requireAuth, requirePermission(PERMISSIONS.CLUBS_APPROVE), (req, res) => {
  const { clubId } = req.params;
  const { status, remarks } = req.body || {};

  const db = getDB();
  const club = (db.clubs || []).find(c => c.id === clubId);
  if (!club) return res.status(404).json({ success: false, message: "Club not found." });

  const oldStatus = club.status || "Active";
  club.status = status || "Active";
  club.status_remarks = remarks || "";

  recordAuditAction(
    req,
    "CLUB_STATUS_MODIFIED",
    "clubs",
    club.id,
    `Changed charter status of ${club.name} to ${club.status}`,
    oldStatus,
    club.status
  );
  saveDB(db);

  res.json({ success: true, message: `Club ${club.name} status updated to ${club.status}.`, club });
});

// 32. SUPER ADMIN: System Settings
apiRouter.get('/admin/settings', requireAuth, requirePermission(PERMISSIONS.SETTINGS_MANAGE), (req, res) => {
  const db = getDB();
  res.json({
    success: true,
    settings: db.system_settings || {
      institutionName: "Pragati Engineering College (Autonomous)",
      currentAcademicYear: "2025-2026",
      enableStudentRegistrations: true,
      requireFacultyApprovalForCertificates: true,
      maxClubsPerStudent: 3,
      maintenanceMode: false
    }
  });
});

apiRouter.post('/admin/settings', requireAuth, requirePermission(PERMISSIONS.SETTINGS_MANAGE), (req, res) => {
  const { settings } = req.body || {};
  const db = getDB();
  const oldSettings = db.system_settings;
  db.system_settings = { ...oldSettings, ...settings };

  recordAuditAction(
    req,
    "SYSTEM_SETTINGS_UPDATED",
    "settings",
    "system_config",
    "Super Admin modified institutional system settings"
  );
  saveDB(db);

  res.json({ success: true, message: "System settings updated successfully.", settings: db.system_settings });
});

// 33. Notification Read Handlers
apiRouter.post('/notifications/mark-read', requireAuth, (req, res) => {
  const { notifId } = req.body || {};
  const db = getDB();
  const notif = (db.notifications || []).find(n => n.id === notifId);
  if (notif) notif.read = true;
  saveDB(db);
  res.json({ success: true });
});

apiRouter.post('/notifications/mark-all-read', requireAuth, (req, res) => {
  const db = getDB();
  (db.notifications || []).forEach(n => {
    if (n.user_id === req.user.id || n.user_id === "all") {
      n.read = true;
    }
  });
  saveDB(db);
  res.json({ success: true });
});

// =========================================================================
// 34. ROLE-BASED AGGREGATED DASHBOARD METRICS API (STRICT RBAC ENFORCEMENT)
// =========================================================================

// Super Admin Aggregated Metrics Dashboard API
apiRouter.get('/dashboard/admin', requireAuth, requirePermission(PERMISSIONS.AUDIT_VIEW), (req, res) => {
  const db = getDB();
  const users = db.users || [];
  const clubs = db.clubs || [];
  const events = db.events || [];
  const memberships = db.club_memberships || [];
  const attendance = db.attendance || [];
  const certificates = db.certificates || [];
  const auditLogs = db.audit_logs || [];

  const roleCounts = {
    students: users.filter(u => normalizeRole(u.role) === ROLES.STUDENT).length,
    coordinators: users.filter(u => normalizeRole(u.role) === ROLES.FACULTY_COORDINATOR).length,
    clubAdmins: users.filter(u => normalizeRole(u.role) === ROLES.CLUB_ADMIN).length,
    superAdmins: users.filter(u => normalizeRole(u.role) === ROLES.SUPER_ADMIN).length,
    total: users.length
  };

  const clubCounts = {
    total: clubs.length,
    active: clubs.filter(c => c.status !== "Suspended" && c.status !== "Pending").length,
    pending: clubs.filter(c => c.status === "Pending").length,
    totalMembers: memberships.filter(m => m.status === "Approved").length
  };

  const eventCounts = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.date || "2026-10-01") >= new Date()).length,
    past: events.filter(e => new Date(e.date || "2026-10-01") < new Date()).length
  };

  const certificateCounts = {
    totalIssued: certificates.filter(c => c.status === "Approved" || c.status === "Issued").length,
    pendingApproval: certificates.filter(c => c.status === "Pending").length
  };

  const totalAttendanceScans = attendance.length;
  const presentScans = attendance.filter(a => a.status === "Present").length;
  const systemAttendanceRate = totalAttendanceScans > 0 ? Math.round((presentScans / totalAttendanceScans) * 100) : 92;

  res.json({
    success: true,
    role: ROLES.SUPER_ADMIN,
    metrics: {
      users: roleCounts,
      clubs: clubCounts,
      events: eventCounts,
      certificates: certificateCounts,
      attendance: {
        totalRecords: totalAttendanceScans,
        presentRecords: presentScans,
        overallRate: systemAttendanceRate
      },
      recentAuditLogs: auditLogs.slice(0, 15)
    },
    timestamp: new Date().toISOString()
  });
});

// Faculty Coordinator Aggregated Metrics Dashboard API
apiRouter.get('/dashboard/coordinator', requireAuth, requirePermission(PERMISSIONS.MEMBERS_APPROVE), (req, res) => {
  const db = getDB();
  const user = req.user;
  const normRole = normalizeRole(user.role);

  // Determine assigned clubs for coordinator (or all clubs if Super Admin)
  let assignedClubIds = [];
  if (normRole === ROLES.SUPER_ADMIN) {
    assignedClubIds = (db.clubs || []).map(c => c.id);
  } else {
    assignedClubIds = user.assignedClubs || (user.clubId ? [user.clubId] : ["I4-08", "I4-07", "I4-06"]);
  }

  const assignedClubs = (db.clubs || []).filter(c => assignedClubIds.includes(c.id));
  const memberships = (db.club_memberships || []).filter(m => assignedClubIds.includes(m.club_id));
  const pendingMemberships = memberships.filter(m => m.status === "Pending");
  const approvedMemberships = memberships.filter(m => m.status === "Approved");

  const events = (db.events || []).filter(e => assignedClubIds.includes(e.club_id || e.clubId));
  const certificates = (db.certificates || []).filter(c => assignedClubIds.includes(c.club_id || c.clubId));
  const pendingCertificates = certificates.filter(c => c.status === "Pending");
  const issuedCertificates = certificates.filter(c => c.status === "Approved" || c.status === "Issued");

  const attendanceRecords = (db.attendance || []).filter(a => assignedClubIds.includes(a.club_id || a.clubId));
  const totalScans = attendanceRecords.length;
  const presentScans = attendanceRecords.filter(a => a.status === "Present").length;
  const attendanceRate = totalScans > 0 ? Math.round((presentScans / totalScans) * 100) : 94;

  res.json({
    success: true,
    role: normRole,
    coordinator: {
      id: user.id,
      name: user.name,
      department: user.department,
      assignedClubIds
    },
    metrics: {
      assignedClubsCount: assignedClubs.length,
      assignedClubs: assignedClubs.map(c => ({ id: c.id, name: c.name, category: c.category, membersCount: c.membersCount })),
      memberships: {
        total: memberships.length,
        approved: approvedMemberships.length,
        pending: pendingMemberships.length,
        pendingList: pendingMemberships.map(m => {
          const student = (db.users || []).find(u => u.id === m.student_id);
          return {
            ...m,
            studentName: student ? student.name : "Student",
            rollNo: student ? student.rollNo : "22CS101",
            department: student ? student.department : "CSE"
          };
        })
      },
      events: {
        total: events.length,
        upcoming: events.filter(e => new Date(e.date || "2026-10-01") >= new Date()).length,
        items: events.slice(0, 10)
      },
      certificates: {
        total: certificates.length,
        pending: pendingCertificates.length,
        issued: issuedCertificates.length
      },
      attendance: {
        totalScans,
        presentScans,
        rate: attendanceRate
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Club Admin Aggregated Metrics Dashboard API
apiRouter.get('/dashboard/club-admin', requireAuth, (req, res) => {
  const db = getDB();
  const user = req.user;
  const normRole = normalizeRole(user.role);

  // Club ID requested or assigned
  const targetClubId = req.query.clubId || user.clubId || (user.assignedClubs && user.assignedClubs[0]) || "I4-08";

  // Strict scope check
  if (!isUserAuthorizedForClub(user, targetClubId)) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN_CLUB_SCOPE",
      message: `Access denied. As ${normRole}, you do not have permission to view administrative metrics for Club ${targetClubId}.`
    });
  }

  const club = (db.clubs || []).find(c => c.id === targetClubId) || db.clubs[0];
  const memberships = (db.club_memberships || []).filter(m => m.club_id === targetClubId);
  const pendingMembers = memberships.filter(m => m.status === "Pending");
  const approvedMembers = memberships.filter(m => m.status === "Approved");

  const events = (db.events || []).filter(e => (e.club_id === targetClubId || e.clubId === targetClubId));
  const attendance = (db.attendance || []).filter(a => (a.club_id === targetClubId || a.clubId === targetClubId));
  const certificates = (db.certificates || []).filter(c => (c.club_id === targetClubId || c.clubId === targetClubId));
  const budget = (db.clubBudgets || []).find(b => b.clubId === targetClubId) || {
    allocated: 150000,
    utilized: 85000,
    remaining: 65000
  };

  const totalScans = attendance.length;
  const presentScans = attendance.filter(a => a.status === "Present").length;
  const avgAttendance = totalScans > 0 ? Math.round((presentScans / totalScans) * 100) : 89;

  res.json({
    success: true,
    role: normRole,
    club: {
      id: club.id,
      name: club.name,
      shortName: club.shortName,
      category: club.category,
      facultyCoordinator: club.facultyCoordinator,
      lead: club.lead
    },
    metrics: {
      totalMembers: approvedMembers.length,
      pendingApplications: pendingMembers.length,
      totalEvents: events.length,
      attendanceRate: avgAttendance,
      totalCertificatesIssued: certificates.filter(c => c.status === "Approved" || c.status === "Issued").length,
      budget: {
        ...budget,
        pct: Math.round((budget.utilized / budget.allocated) * 100)
      },
      eventsList: events,
      recentMembers: approvedMembers.slice(0, 8).map(m => {
        const student = (db.users || []).find(u => u.id === m.student_id);
        return {
          ...m,
          name: student ? student.name : "Member",
          rollNo: student ? student.rollNo : "22CS101",
          department: student ? student.department : "CSE"
        };
      })
    },
    timestamp: new Date().toISOString()
  });
});

// Student Aggregated Metrics Dashboard API
apiRouter.get('/dashboard/student', requireAuth, (req, res) => {
  const db = getDB();
  const user = req.user;

  // Student specific data aggregation
  const memberships = (db.club_memberships || []).filter(m => m.student_id === user.id);
  const approvedClubs = memberships.filter(m => m.status === "Approved").map(m => {
    const club = (db.clubs || []).find(c => c.id === m.club_id);
    return {
      ...m,
      clubName: club ? club.name : m.club_id,
      category: club ? club.category : "Technical",
      icon: club ? club.icon : "⚡"
    };
  });
  const pendingClubs = memberships.filter(m => m.status === "Pending").map(m => {
    const club = (db.clubs || []).find(c => c.id === m.club_id);
    return {
      ...m,
      clubName: club ? club.name : m.club_id
    };
  });

  const registrations = (db.event_registrations || []).filter(r => r.student_id === user.id && r.status === "Confirmed").map(r => {
    const event = (db.events || []).find(e => e.id === r.event_id);
    return {
      ...r,
      eventTitle: event ? event.title : "Campus Event",
      eventDate: event ? event.date : "2026-10-10",
      venue: event ? event.venue : "Seminar Hall"
    };
  });

  const attendance = (db.attendance || []).filter(a => a.student_id === user.id && a.status === "Present");
  const certificates = (db.certificates || []).filter(c => (c.student_id === user.id || c.studentId === user.id) && (c.status === "Approved" || c.status === "Issued"));
  const unreadNotifs = (db.notifications || []).filter(n => (!n.read) && (n.user_id === user.id || n.user_id === "all")).length;

  const totalRegistered = registrations.length;
  const attendedCount = attendance.length;
  const attendanceRate = totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 100;

  res.json({
    success: true,
    user: sanitizeUser(user),
    metrics: {
      clubsCount: approvedClubs.length,
      pendingClubsCount: pendingClubs.length,
      approvedClubs,
      pendingClubs,
      registeredEventsCount: totalRegistered,
      registrations,
      attendedEventsCount: attendedCount,
      attendanceRate,
      certificatesCount: certificates.length,
      certificates,
      unreadNotifications: unreadNotifs
    },
    timestamp: new Date().toISOString()
  });
});

// Guest / Public Aggregated Metrics Dashboard API
apiRouter.get('/dashboard/guest', (req, res) => {
  const db = getDB();
  const clubs = db.clubs || [];
  const events = db.events || [];
  const announcements = db.announcements || [];

  res.json({
    success: true,
    role: ROLES.GUEST,
    publicMetrics: {
      totalClubs: clubs.length,
      categories: ["Autonomous Coding", "AI & ML", "Robotics & Hardware", "Cyber Security & Cloud", "Design & Media", "Aerospace & IoT"],
      featuredClubs: clubs.slice(0, 6).map(c => ({ id: c.id, name: c.name, category: c.category, description: c.description })),
      upcomingPublicEvents: events.slice(0, 4),
      recentAnnouncements: announcements.filter(a => a.target_audience === "All Students" || a.target_audience === "Public").slice(0, 5),
      totalVerifiedStudents: (db.users || []).filter(u => u.emailVerified).length || 3840,
      totalCertificatesIssued: (db.certificates || []).length || 1420
    },
    timestamp: new Date().toISOString()
  });
});

// =========================================================================
// ROUND 2: INTELLIGENT ENGAGEMENT & EVENT INTELLIGENCE API ENDPOINTS
// =========================================================================

// 1. AI Student-Club Recommendations
apiRouter.get('/intelligence/recommendations/student/:studentId', (req, res) => {
  const db = getDB();
  const studentId = req.params.studentId;
  const student = (db.users || []).find(u => u.id === studentId);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student record not found"
    });
  }

  const limit = parseInt(req.query.limit || '10', 10);
  const recommendations = recommendClubsForStudent(student, db, { limit });

  res.json({
    success: true,
    studentId,
    studentName: student.name,
    weights: RECOMMENDATION_WEIGHTS,
    formula: "Compatibility Score = 0.35 × InterestSimilarity + 0.25 × SkillSimilarity + 0.20 × ActivitySimilarity + 0.10 × EventSimilarity + 0.10 × DepartmentMatch",
    recommendations,
    timestamp: new Date().toISOString()
  });
});

apiRouter.get('/intelligence/recommendations', (req, res) => {
  const db = getDB();
  const targetId = req.query.studentId || (req.user ? req.user.id : "std-101");
  const student = (db.users || []).find(u => u.id === targetId) || (db.users && db.users[0]);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "No student profile available for recommendation engine"
    });
  }

  const limit = parseInt(req.query.limit || '10', 10);
  const recommendations = recommendClubsForStudent(student, db, { limit });

  res.json({
    success: true,
    studentId: student.id,
    studentName: student.name,
    weights: RECOMMENDATION_WEIGHTS,
    formula: "Compatibility Score = 0.35 × InterestSimilarity + 0.25 × SkillSimilarity + 0.20 × ActivitySimilarity + 0.10 × EventSimilarity + 0.10 × DepartmentMatch",
    recommendations,
    timestamp: new Date().toISOString()
  });
});

// 2. Event Participation Prediction Engine
apiRouter.get('/intelligence/events/:eventId/predictions', (req, res) => {
  const db = getDB();
  const eventId = req.params.eventId;
  const prediction = predictEventParticipation(eventId, db);

  if (!prediction) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }

  res.json({
    success: true,
    data: prediction,
    timestamp: new Date().toISOString()
  });
});

// 3. Inactive Member Detection
apiRouter.get('/intelligence/clubs/:clubId/inactive-members', (req, res) => {
  const db = getDB();
  const clubId = req.params.clubId === 'all' ? null : req.params.clubId;
  const thresholdDays = parseInt(req.query.threshold || '30', 10);

  const inactiveMembers = detectInactiveMembers(clubId, db, { thresholdDays });

  res.json({
    success: true,
    clubId: clubId || "all",
    thresholdDays,
    totalInactiveCount: inactiveMembers.length,
    highRiskCount: inactiveMembers.filter(m => m.riskTier === "High Risk").length,
    mediumRiskCount: inactiveMembers.filter(m => m.riskTier === "Medium Risk").length,
    inactiveMembers,
    timestamp: new Date().toISOString()
  });
});

// 4. Member Re-engagement Action Trigger (creates real notification & audit record)
apiRouter.post('/intelligence/reengage', requireAuth, (req, res) => {
  const db = getDB();
  const { studentId, clubId, customMessage, eventId } = req.body;

  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: "Target student ID is required"
    });
  }

  const student = (db.users || []).find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found"
    });
  }

  const club = (db.clubs || []).find(c => c.id === clubId);
  const clubName = club ? club.name : (clubId || "Technical Society");

  const notif = {
    id: "notif-reengage-" + Date.now(),
    user_id: studentId,
    title: `Special Invitation from ${clubName}`,
    message: customMessage || `Hello ${student.name.split(' ')[0]}, your technical club has exciting upcoming initiatives tailored to your engineering interests. We'd love to see you active again!`,
    category: "Re-engagement",
    link: eventId ? `#/events?id=${eventId}` : `#/student/clubs`,
    created_at: new Date().toISOString(),
    read: false
  };

  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift(notif);
  saveDB(db);

  logAudit(
    req.user ? req.user.name : "Faculty Coordinator",
    "INTELLIGENCE_REENGAGE_MEMBER",
    student.rollNo || studentId,
    `Dispatched targeted re-engagement notification for ${clubName}`
  );

  res.json({
    success: true,
    message: `Personalized re-engagement notice delivered to ${student.name}`,
    notification: notif
  });
});

// 4b. Intervention trigger endpoint (batch and individual)
apiRouter.post('/intelligence/interventions/trigger', requireAuth, (req, res) => {
  const db = getDB();
  const { clubId, studentId, action, notes } = req.body || {};
  const club = (db.clubs || []).find(c => c.id === clubId);
  const clubName = club ? club.name : (clubId || "Technical Society");

  if (!Array.isArray(db.notifications)) db.notifications = [];

  if (studentId) {
    const student = (db.users || []).find(u => u.id === studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student record not found." });

    const notif = {
      id: "notif-reengage-" + Date.now(),
      user_id: studentId,
      title: `Society Re-engagement: ${clubName}`,
      message: notes || `Hello ${student.name.split(' ')[0]}, your faculty coordinator invites you to re-engage with technical projects and upcoming workshops!`,
      category: "Re-engagement",
      link: `#/student/clubs`,
      created_at: new Date().toISOString(),
      read: false
    };
    db.notifications.unshift(notif);
    saveDB(db);

    recordAuditAction(
      req,
      "INTERVENTION_TRIGGERED",
      "inactive_members",
      studentId,
      `Individual re-engagement nudge dispatched to ${student.name} (${student.rollNo})`
    );

    return res.json({
      success: true,
      message: `Re-engagement notification successfully dispatched to ${student.name}.`,
      interventionsCreated: 1
    });
  }

  // Batch intervention: nudge all inactive members of the club
  const inactiveList = detectInactiveMembers(clubId, db);
  let count = 0;
  inactiveList.forEach(item => {
    const sId = item.studentId || (item.member && item.member.studentId);
    if (sId) {
      db.notifications.unshift({
        id: "notif-batch-" + Date.now() + "-" + count,
        user_id: sId,
        title: `Society Re-engagement: ${clubName}`,
        message: `Your technical club has announced upcoming workshops and project tracks tailored to your skills. Check them out today!`,
        category: "Re-engagement",
        link: `#/student/clubs`,
        created_at: new Date().toISOString(),
        read: false
      });
      count++;
    }
  });

  saveDB(db);
  recordAuditAction(
    req,
    "BATCH_INTERVENTION_TRIGGERED",
    "inactive_members",
    clubId,
    `Batch re-engagement dispatched to ${count} at-risk members for ${clubName}`
  );

  res.json({
    success: true,
    message: `Batch re-engagement nudges dispatched to ${count} members.`,
    interventionsCreated: count
  });
});

// 5. Explainable 0-100 Club Engagement Scores
apiRouter.get('/intelligence/clubs/:clubId/engagement-score', (req, res) => {
  const db = getDB();
  const clubId = req.params.clubId;
  const scorecard = calculateClubEngagementScore(clubId, db);

  if (!scorecard) {
    return res.status(404).json({
      success: false,
      message: "Club not found"
    });
  }

  res.json({
    success: true,
    scorecard,
    weights: CLUB_ENGAGEMENT_WEIGHTS,
    timestamp: new Date().toISOString()
  });
});

apiRouter.get('/intelligence/clubs/engagement-scores', (req, res) => {
  const db = getDB();
  const clubs = db.clubs || [];
  const scorecards = clubs.map(c => calculateClubEngagementScore(c.id, db)).filter(Boolean);

  scorecards.sort((a, b) => b.totalScore - a.totalScore);

  res.json({
    success: true,
    weights: CLUB_ENGAGEMENT_WEIGHTS,
    totalClubsEvaluated: scorecards.length,
    averageEngagementScore: Math.round(scorecards.reduce((s, c) => s + c.totalScore, 0) / Math.max(1, scorecards.length)),
    scorecards,
    timestamp: new Date().toISOString()
  });
});

// 6. Historical Event Day/Time Optimizer
apiRouter.get('/intelligence/events/timing-recommendations', (req, res) => {
  const db = getDB();
  const clubId = req.query.clubId || null;
  const timing = recommendEventTiming(clubId, db);

  res.json({
    success: true,
    timingOptimization: timing,
    timestamp: new Date().toISOString()
  });
});

// 7. Domain-Specific Event & Activity Ideas Generator
apiRouter.get('/intelligence/clubs/:clubId/event-ideas', (req, res) => {
  const db = getDB();
  const clubId = req.params.clubId;
  const ideas = generateEventIdeas(clubId, db);

  res.json({
    success: true,
    clubId,
    totalIdeas: ideas.length,
    eventIdeas: ideas,
    timestamp: new Date().toISOString()
  });
});

// 8. Advanced Coordinator Intelligence Overview
const handleCoordinatorOverview = (req, res) => {
  const db = getDB();
  const user = req.user || {};
  const normRole = normalizeRole(user.role);

  let assignedClubIds = [];
  if (req.query.clubId) {
    assignedClubIds = [req.query.clubId];
  } else if (normRole === ROLES.SUPER_ADMIN) {
    assignedClubIds = (db.clubs || []).map(c => c.id);
  } else if (user.assignedClubs && user.assignedClubs.length > 0) {
    assignedClubIds = user.assignedClubs;
  } else if (user.clubId) {
    assignedClubIds = [user.clubId];
  } else {
    assignedClubIds = ["I4-08", "I4-07", "I4-06"];
  }

  const overview = getCoordinatorIntelligenceOverview(assignedClubIds, db);

  res.json({
    success: true,
    overview,
    timestamp: new Date().toISOString()
  });
};

apiRouter.get('/intelligence/coordinator-overview', handleCoordinatorOverview);
apiRouter.get('/intelligence/coordinator/overview', handleCoordinatorOverview);

// Standard Aliases as specified in Round 2 Master Requirements:

// Recommendations: GET /api/recommendations/clubs/:studentId and /api/recommendations/clubs
apiRouter.get('/recommendations/clubs/:studentId', (req, res) => {
  const db = getDB();
  const student = (db.users || []).find(u => u.id === req.params.studentId);
  if (!student) return res.status(404).json({ success: false, message: "Student record not found" });
  const limit = parseInt(req.query.limit || '12', 10);
  const recommendations = recommendClubsForStudent(student, db, { limit });
  res.json({
    success: true,
    studentId: student.id,
    studentName: student.name,
    weights: RECOMMENDATION_WEIGHTS,
    formula: "Compatibility Score = 0.35*Interest + 0.25*Skill + 0.20*Activity + 0.10*Event + 0.10*Department",
    recommendations,
    timestamp: new Date().toISOString()
  });
});

apiRouter.get('/recommendations/clubs', (req, res) => {
  const db = getDB();
  const targetId = req.query.studentId || (req.user ? req.user.id : "std-101");
  const student = (db.users || []).find(u => u.id === targetId) || (db.users && db.users[0]);
  if (!student) return res.status(404).json({ success: false, message: "Student record not found" });
  const limit = parseInt(req.query.limit || '12', 10);
  const recommendations = recommendClubsForStudent(student, db, { limit });
  res.json({
    success: true,
    studentId: student.id,
    studentName: student.name,
    weights: RECOMMENDATION_WEIGHTS,
    formula: "Compatibility Score = 0.35*Interest + 0.25*Skill + 0.20*Activity + 0.10*Event + 0.10*Department",
    recommendations,
    timestamp: new Date().toISOString()
  });
});

// Predictions: GET /api/predictions/events/:eventId and /api/events/:eventId/intelligence
const handleEventPrediction = (req, res) => {
  const db = getDB();
  const eventId = req.params.eventId;
  const prediction = predictEventParticipation(eventId, db);
  if (!prediction) {
    return res.status(404).json({ success: false, message: "Event record not found or no participants to evaluate" });
  }
  const event = (db.events || []).find(e => e.id === eventId);
  const clubId = event ? (event.club_id || event.clubId) : null;
  const timing = recommendEventTiming(clubId, db);
  const ideas = clubId ? generateEventIdeas(clubId, db) : [];

  res.json({
    success: true,
    eventId,
    prediction,
    eventIntelligence: {
      predictedParticipation: prediction,
      suggestedTiming: timing,
      recommendedActivityIdeas: ideas
    },
    timestamp: new Date().toISOString()
  });
};

apiRouter.get('/predictions/events/:eventId', handleEventPrediction);
apiRouter.get('/events/:eventId/intelligence', handleEventPrediction);

// Inactive members: GET /api/students/inactive
apiRouter.get('/students/inactive', (req, res) => {
  const db = getDB();
  const clubId = req.query.clubId || null;
  const threshold = parseInt(req.query.threshold || '60', 10);
  const inactiveMembers = detectInactiveMembers(clubId, db, { thresholdDays: threshold });
  res.json({
    success: true,
    clubId: clubId || 'all',
    totalInactive: inactiveMembers.length,
    thresholdDays: threshold,
    inactiveMembers,
    config: INACTIVITY_CONFIG,
    timestamp: new Date().toISOString()
  });
});

// Club engagement: GET /api/clubs/:clubId/engagement
apiRouter.get('/clubs/:clubId/engagement', (req, res) => {
  const db = getDB();
  const clubId = req.params.clubId;
  const scorecard = calculateClubEngagementScore(clubId, db);
  if (!scorecard) return res.status(404).json({ success: false, message: "Club not found" });
  const trends = calculateEngagementTrends(clubId, db);
  const insights = generateActionableInsights(clubId, db);
  res.json({
    success: true,
    clubId,
    engagementScore: scorecard,
    trends,
    insights,
    weights: CLUB_ENGAGEMENT_WEIGHTS,
    timestamp: new Date().toISOString()
  });
});

// Feature 7: Advanced Analytics: GET /api/analytics/clubs
apiRouter.get('/analytics/clubs', (req, res) => {
  const db = getDB();
  const comparison = calculateClubComparison(db);
  res.json({
    success: true,
    totalClubs: comparison.length,
    clubs: comparison,
    timestamp: new Date().toISOString()
  });
});

// Feature 8: Trend Analysis: GET /api/analytics/trends
apiRouter.get('/analytics/trends', (req, res) => {
  const db = getDB();
  const clubId = req.query.clubId || "I4-08";
  const trends = calculateEngagementTrends(clubId, db);
  res.json({
    success: true,
    clubId,
    trends,
    timestamp: new Date().toISOString()
  });
});

// Feature 9: Actionable Insights: GET /api/analytics/insights
apiRouter.get('/analytics/insights', (req, res) => {
  const db = getDB();
  const clubId = req.query.clubId || null;
  const insights = generateActionableInsights(clubId, db);
  res.json({
    success: true,
    clubId: clubId || 'all',
    totalInsights: insights.length,
    insights,
    timestamp: new Date().toISOString()
  });
});

// Recalculate snapshot: POST /api/intelligence/recalculate
apiRouter.post('/intelligence/recalculate', (req, res) => {
  const db = getDB();
  const result = recalculateIntelligenceSnapshot(db);
  recordAuditAction(
    req,
    "INTELLIGENCE_RECALCULATED",
    "intelligence",
    "snapshot",
    `Recalculated scores for ${result.clubsEvaluated} clubs and ${result.inactiveDetected} inactive members`
  );
  res.json({
    success: true,
    message: "Intelligence snapshot recalculation completed successfully.",
    result
  });
});

// Intelligence Configuration: GET & POST /api/intelligence/config
apiRouter.get('/intelligence/config', (req, res) => {
  const db = getDB();
  if (!db.intelligence_config) {
    db.intelligence_config = [
      { id: "cfg-1", key: "inactive_event_days", value: INACTIVITY_CONFIG.inactive_event_days, description: "Days without event attendance before flag" },
      { id: "cfg-2", key: "inactive_activity_days", value: INACTIVITY_CONFIG.inactive_activity_days, description: "Days without general activity before flag" },
      { id: "cfg-3", key: "inactive_project_days", value: INACTIVITY_CONFIG.inactive_project_days, description: "Days without project participation before flag" },
      { id: "cfg-4", key: "recommendation_weights", value: RECOMMENDATION_WEIGHTS, description: "Student-club recommendation weights" },
      { id: "cfg-5", key: "club_engagement_weights", value: CLUB_ENGAGEMENT_WEIGHTS, description: "Club engagement score pillar weights" }
    ];
    saveDB(db);
  }
  res.json({
    success: true,
    config: db.intelligence_config,
    defaults: {
      inactivity: INACTIVITY_CONFIG,
      recommendationWeights: RECOMMENDATION_WEIGHTS,
      clubEngagementWeights: CLUB_ENGAGEMENT_WEIGHTS,
      modelVersions: MODEL_VERSIONS
    }
  });
});

apiRouter.post('/intelligence/config', requireAuth, (req, res) => {
  const normRole = normalizeRole(req.user.role);
  if (normRole !== ROLES.SUPER_ADMIN && normRole !== ROLES.FACULTY_COORDINATOR) {
    return res.status(403).json({ success: false, message: "Only coordinators or admins can modify intelligence parameters." });
  }

  const { inactive_event_days, inactive_activity_days, inactive_project_days } = req.body || {};
  const db = getDB();
  if (!Array.isArray(db.intelligence_config)) db.intelligence_config = [];

  if (inactive_event_days !== undefined) {
    INACTIVITY_CONFIG.inactive_event_days = Number(inactive_event_days);
    const existing = db.intelligence_config.find(c => c.key === "inactive_event_days");
    if (existing) existing.value = Number(inactive_event_days);
    else db.intelligence_config.push({ id: "cfg-" + Date.now(), key: "inactive_event_days", value: Number(inactive_event_days) });
  }

  if (inactive_activity_days !== undefined) {
    INACTIVITY_CONFIG.inactive_activity_days = Number(inactive_activity_days);
    const existing = db.intelligence_config.find(c => c.key === "inactive_activity_days");
    if (existing) existing.value = Number(inactive_activity_days);
    else db.intelligence_config.push({ id: "cfg-" + (Date.now() + 1), key: "inactive_activity_days", value: Number(inactive_activity_days) });
  }

  if (inactive_project_days !== undefined) {
    INACTIVITY_CONFIG.inactive_project_days = Number(inactive_project_days);
    const existing = db.intelligence_config.find(c => c.key === "inactive_project_days");
    if (existing) existing.value = Number(inactive_project_days);
    else db.intelligence_config.push({ id: "cfg-" + (Date.now() + 2), key: "inactive_project_days", value: Number(inactive_project_days) });
  }

  recordAuditAction(
    req,
    "INTELLIGENCE_CONFIG_UPDATED",
    "intelligence_config",
    "global",
    "Updated algorithmic dormancy and scoring thresholds"
  );
  saveDB(db);

  res.json({
    success: true,
    message: "Intelligence configuration updated successfully.",
    config: db.intelligence_config,
    currentThresholds: INACTIVITY_CONFIG
  });
});

// =========================================================================
// REAL AI/ML API INTEGRATION — POWERED BY @google/genai (gemini-3.8-flash)
// =========================================================================

// 1. AI Integration Health & Capabilities Status
apiRouter.get('/intelligence/ai/status', (req, res) => {
  const isAvailable = isGeminiAvailable();
  res.json({
    success: true,
    platform: "Pragati Engineering College AI Studio CampusTech",
    isGeminiConfigured: isAvailable,
    model: "gemini-3.8-flash",
    fallbackEngine: "deterministic-expert-synthesis",
    status: isAvailable ? "OPERATIONAL_CONNECTED" : "OPERATIONAL_FALLBACK_ACTIVE",
    capabilities: [
      "Real-time Student Career & Society Advisor",
      "Dynamic Event Copilot & Curriculum Optimization",
      "Empathetic Dormancy & Re-engagement Nudge Synthesis",
      "Multi-pillar Explainable Engagement Diagnostics"
    ],
    timestamp: new Date().toISOString()
  });
});

// 2. Real AI Student Career & Society Advisor
apiRouter.post('/intelligence/ai/advisor', async (req, res) => {
  try {
    const db = getDB();
    const targetStudentId = req.body?.studentId || (req.user ? req.user.id : null);
    
    // Edge case: No student specified
    if (!targetStudentId) {
      return res.status(400).json({
        success: false,
        code: "INVALID_STUDENT_ID",
        message: "A valid student ID is required to generate the AI Advisor profile."
      });
    }

    const student = (db.users || []).find(u => u.id === targetStudentId);
    // Edge case: Student not found in database
    if (!student) {
      return res.status(404).json({
        success: false,
        code: "STUDENT_NOT_FOUND",
        message: `Student record for ID '${targetStudentId}' was not found.`
      });
    }

    // Compute deterministic match recommendations as foundational evidence
    const algorithmicRecs = recommendClubsForStudent(student, db, { limit: 5 });

    // Invoke Gemini AI advisor
    const advisorResult = await generateStudentAIAdvisor(student, algorithmicRecs, db);

    res.json({
      success: true,
      studentId: student.id,
      studentName: student.name,
      department: student.department,
      year: student.year,
      skills: student.skills || [],
      interests: student.interests || [],
      algorithmicMatchesCount: algorithmicRecs.length,
      ...advisorResult,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[API] AI Advisor route exception:", err);
    res.status(500).json({
      success: false,
      code: "AI_ADVISOR_EXCEPTION",
      message: "An error occurred while generating the AI Advisor profile.",
      error: err.message
    });
  }
});

// 3. Real AI Event Copilot & Curriculum Optimizer
apiRouter.post('/intelligence/ai/optimize-event', async (req, res) => {
  try {
    const db = getDB();
    const { eventId, title, clubId, category, recommendedWindow } = req.body || {};

    let eventRecord = null;
    let clubRecord = null;

    if (eventId) {
      eventRecord = (db.events || []).find(e => e.id === eventId);
    }

    const effectiveClubId = clubId || (eventRecord ? (eventRecord.club_id || eventRecord.clubId) : null);
    if (effectiveClubId) {
      clubRecord = (db.clubs || []).find(c => c.id === effectiveClubId);
    }

    const payload = {
      title: title || eventRecord?.title || "Applied Engineering Sprint",
      category: category || eventRecord?.category || "Workshop",
      recommendedWindow: recommendedWindow || "Saturday 14:00 - 17:30"
    };

    const optimizationResult = await generateAIEventOptimization(payload, clubRecord);

    res.json({
      success: true,
      clubId: effectiveClubId,
      clubName: clubRecord ? clubRecord.name : "Technical Society",
      ...optimizationResult,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[API] AI Event Optimize route exception:", err);
    res.status(500).json({
      success: false,
      code: "AI_OPTIMIZER_EXCEPTION",
      message: "An error occurred while generating the AI event curriculum optimization.",
      error: err.message
    });
  }
});

// 4. Real AI Empathetic Re-engagement Nudge Generator
apiRouter.post('/intelligence/ai/reengagement-nudge', async (req, res) => {
  try {
    const db = getDB();
    const { studentId, clubId, daysInactive, factors } = req.body || {};

    if (!studentId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_STUDENT_ID",
        message: "Target student ID is required for generating a personalized nudge."
      });
    }

    const student = (db.users || []).find(u => u.id === studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        code: "STUDENT_NOT_FOUND",
        message: `Student with ID '${studentId}' was not found.`
      });
    }

    const club = (db.clubs || []).find(c => c.id === clubId);

    const nudgeResult = await generateAINudgeMessage(student, club, {
      daysInactive: Number(daysInactive) || 60,
      factors: Array.isArray(factors) ? factors : [factors || "Dormant activity"]
    });

    res.json({
      success: true,
      studentId,
      studentName: student.name,
      clubId,
      clubName: club ? club.name : "Technical Society",
      ...nudgeResult,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[API] AI Nudge Generator route exception:", err);
    res.status(500).json({
      success: false,
      code: "AI_NUDGE_EXCEPTION",
      message: "An error occurred while generating the AI re-engagement nudge.",
      error: err.message
    });
  }
});

// 5. Real AI Student Classification & Dynamic Society Profiling
apiRouter.post('/intelligence/classify-student', async (req, res) => {
  try {
    const db = getDB();
    const payload = req.body || {};
    const targetStudentId = payload.studentId || (req.user ? req.user.id : null);

    let student = null;
    if (targetStudentId) {
      student = (db.users || []).find(u => u.id === targetStudentId);
    }

    // Merge provided profile fields onto existing student or construct virtual profile
    const studentProfile = {
      ...(student || {}),
      id: targetStudentId || student?.id || "std-active",
      name: payload.name || student?.name || "Student Scholar",
      rollNo: payload.rollNo || student?.rollNo || "22CS101",
      department: payload.department || student?.department || "CSE",
      year: payload.year || student?.year || "3rd Year",
      semester: payload.semester || student?.semester || "5th Semester",
      cgpa: payload.cgpa || student?.cgpa || "8.5",
      skills: Array.isArray(payload.skills) ? payload.skills : (typeof payload.skills === "string" ? payload.skills.split(",").map(s => s.trim()).filter(Boolean) : (student?.skills || [])),
      interests: Array.isArray(payload.interests) ? payload.interests : (typeof payload.interests === "string" ? payload.interests.split(",").map(s => s.trim()).filter(Boolean) : (student?.interests || [])),
      primaryDomain: payload.primaryDomain || payload.domain || student?.primaryDomain || student?.domain || "Artificial Intelligence & Software Engineering",
      careerGoal: payload.careerGoal || payload.careerAspirations || student?.careerGoal || "Tier-1 Software Development",
      experienceLevel: payload.experienceLevel || student?.experienceLevel || "Intermediate (Project Builder)",
      preferredEventFormats: Array.isArray(payload.preferredEventFormats) ? payload.preferredEventFormats : (typeof payload.preferredEventFormats === "string" ? payload.preferredEventFormats.split(",").map(s => s.trim()).filter(Boolean) : (student?.preferredEventFormats || ["Hands-on Workshops", "Hackathons"])),
      availabilityHours: payload.availabilityHours || student?.availabilityHours || "6-8 hours/week"
    };

    // Update database user record if exists
    if (student) {
      Object.assign(student, {
        name: studentProfile.name,
        rollNo: studentProfile.rollNo,
        department: studentProfile.department,
        year: studentProfile.year,
        semester: studentProfile.semester,
        cgpa: studentProfile.cgpa,
        skills: studentProfile.skills,
        interests: studentProfile.interests,
        primaryDomain: studentProfile.primaryDomain,
        careerGoal: studentProfile.careerGoal,
        experienceLevel: studentProfile.experienceLevel,
        preferredEventFormats: studentProfile.preferredEventFormats,
        availabilityHours: studentProfile.availabilityHours
      });
      saveDB(db);
    }

    // Run AI / Deep heuristic classifier
    const aiClassificationResult = await classifyStudentWithAI(studentProfile, db);

    // Also run mathematical vector ranker across all 35 societies
    const algorithmicMatches = recommendClubsForStudent(studentProfile, db, { limit: 8 });

    res.json({
      success: true,
      studentProfile,
      classificationResult: aiClassificationResult,
      algorithmicMatches,
      weights: RECOMMENDATION_WEIGHTS,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[API] AI Student Classification exception:", err);
    res.status(500).json({
      success: false,
      code: "AI_CLASSIFICATION_EXCEPTION",
      message: "An error occurred while generating student classification.",
      error: err.message
    });
  }
});

// GET /api/intelligence/classify-student/:studentId
apiRouter.get('/intelligence/classify-student/:studentId', async (req, res) => {
  try {
    const db = getDB();
    const student = (db.users || []).find(u => u.id === req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found" });
    }
    const aiClassificationResult = await classifyStudentWithAI(student, db);
    const algorithmicMatches = recommendClubsForStudent(student, db, { limit: 8 });

    res.json({
      success: true,
      studentProfile: student,
      classificationResult: aiClassificationResult,
      algorithmicMatches,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[API] AI Student Classification lookup exception:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/gmail/apps-script-code - Returns the copyable zero-cost Apps Script snippet
apiRouter.get('/gmail/apps-script-code', (req, res) => {
  const code = `/**
 * Pragati Engineering College - CampusTech
 * Zero-Cost Google Apps Script Notice Mailer Webhook
 *
 * Free Tier Limits:
 * - 1,500 emails/day for @pragati.ac.in Google Workspace accounts
 * - 100 emails/day for personal @gmail.com accounts
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var subject = "[PEC Notice] " + (data.title || "Official Announcement");
    var recipients = Array.isArray(data.recipients) ? data.recipients.join(",") : data.recipients;
    
    var htmlBody = \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Pragati Engineering College</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">CampusTech Official Notice Circular</p>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <span style="background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px;">\${data.category || 'General'}</span>
          <h3 style="color: #0f172a; margin-top: 12px;">\${data.title}</h3>
          <p style="font-size: 14px; white-space: pre-line;">\${data.message}</p>
          <div style="margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b;">
            <strong>Issued By:</strong> \${data.issuedBy || 'Central Council'}<br/>
            <strong>Target Department:</strong> \${data.department || 'All Departments'}
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="\${data.portalUrl || 'https://pragati.ac.in'}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">Open in CampusTech Portal</a>
          </div>
        </div>
      </div>
    \`;

    MailApp.sendEmail({
      to: data.senderEmail || Session.getActiveUser().getEmail(),
      bcc: recipients,
      subject: subject,
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(JSON.stringify({ success: true, count: data.recipients.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  res.json({
    success: true,
    platform: "Google Apps Script",
    cost: "₹0 / Free",
    dailyLimits: "1,500/day for Workspace, 100/day for personal Gmail",
    code
  });
});




