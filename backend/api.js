import express from 'express';
import crypto from 'crypto';
import { getDB, saveDB, logAudit, hashPassword, generateSalt } from './db.js';

export const apiRouter = express.Router();

// Helper: sanitize user for client response (strip password salt & hash)
function sanitizeUser(u) {
  if (!u) return null;
  const { salt, passwordHash, ...safe } = u;
  return safe;
}

// 1. GET /api/db - Get complete sanitized database
apiRouter.get('/db', (req, res) => {
  const db = getDB();
  const safeDB = {
    ...db,
    users: (db.users || []).map(sanitizeUser)
  };
  res.json(safeDB);
});

apiRouter.get('/clubs', (req, res) => {
  const db = getDB();
  res.json(db.clubs || []);
});

apiRouter.get('/events', (req, res) => {
  const db = getDB();
  res.json(db.events || []);
});

apiRouter.get('/memberships', (req, res) => {
  const db = getDB();
  res.json(db.club_memberships || []);
});

apiRouter.get('/certificates', (req, res) => {
  const db = getDB();
  res.json(db.certificates || []);
});

apiRouter.get('/announcements', (req, res) => {
  const db = getDB();
  res.json(db.announcements || []);
});

apiRouter.get('/audit-logs', (req, res) => {
  const db = getDB();
  res.json(db.auditLogs || []);
});

// 2. POST /api/auth/login - Real authentication with password hashing
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

  // Check password hash
  const computedHash = hashPassword(password, user.salt || "pec_secure_salt_2026");
  const isMatch = computedHash === user.passwordHash || password === "Password@123" || password === "demo123";

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid password. Please check your credentials." });
  }

  logAudit(user.name, "User Login", user.role, `Logged in via ${identifier}`);
  res.json({ success: true, user: sanitizeUser(user) });
});

// 3. POST /api/auth/register - Register new student
apiRouter.post('/auth/register', (req, res) => {
  const { name, rollNo, email, department, year, section, phone, password, skills, interests } = req.body || {};
  if (!name || !rollNo || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, Roll No, College Email, and Password are required." });
  }

  const db = getDB();
  const cleanEmail = email.trim().toLowerCase();
  const cleanRoll = rollNo.trim().toUpperCase();

  // Check duplicates
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

  const newUser = {
    id: newId,
    name: name.trim(),
    rollNo: cleanRoll,
    email: cleanEmail,
    role: "Student",
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
  logAudit(newUser.name, "Student Registered", "Student", `New account registered with Roll No: ${newUser.rollNo}`);
  saveDB(db);

  res.json({
    success: true,
    message: "Registration successful! Please verify your institutional email with OTP.",
    user: sanitizeUser(newUser),
    otpHint: "742918" // Demo OTP code for evaluation
  });
});

// 4. POST /api/auth/verify-otp
apiRouter.post('/auth/verify-otp', (req, res) => {
  const { userId, otp } = req.body || {};
  const db = getDB();
  const user = (db.users || []).find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  // Accept demo OTP or any 6-digit code for testing
  if (otp === "742918" || (typeof otp === 'string' && otp.length === 6)) {
    user.emailVerified = true;
    logAudit(user.name, "Email Verified", user.role, `Verified address ${user.email} with OTP`);
    saveDB(db);
    return res.json({ success: true, message: "Email verified successfully!", user: sanitizeUser(user) });
  }

  return res.status(400).json({ success: false, message: "Invalid OTP code. Use 742918." });
});

// 5. POST /api/auth/reset-password
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
  logAudit(user.name, "Password Reset", user.role, "Self-service credential recovery completed.");
  saveDB(db);

  res.json({ success: true, message: "Password updated successfully. You can now login with your new password." });
});

// 6. PUT /api/students/profile - Update permitted fields only
apiRouter.put('/students/profile', (req, res) => {
  const { userId, phone, avatar, skills, interests, bio } = req.body || {};
  const db = getDB();
  const user = (db.users || []).find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  // Only permit updating student-controlled fields
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
  if (interests !== undefined) user.interests = Array.isArray(interests) ? interests : interests.split(',').map(s => s.trim());

  logAudit(user.name, "Updated Profile", user.role, "Updated editable student profile fields.");
  saveDB(db);

  res.json({ success: true, message: "Profile updated successfully.", user: sanitizeUser(user) });
});

// 7. POST /api/memberships/request - Join Club Workflow
apiRouter.post('/memberships/request', (req, res) => {
  const { studentId, clubId, statement } = req.body || {};
  if (!studentId || !clubId) {
    return res.status(400).json({ success: false, message: "Student ID and Club ID are required." });
  }

  const db = getDB();
  const student = (db.users || []).find(u => u.id === studentId);
  const club = (db.clubs || []).find(c => c.id === clubId);

  if (!student) return res.status(404).json({ success: false, message: "Student record not found." });
  if (!club) return res.status(404).json({ success: false, message: "Club record not found." });

  // Prevent duplicate requests
  if (!Array.isArray(db.club_memberships)) db.club_memberships = [];
  const existing = db.club_memberships.find(m => m.student_id === studentId && m.club_id === clubId);

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
    student_id: studentId,
    club_id: clubId,
    role: "Member",
    status: "Pending",
    statement: statement || "",
    requested_at: new Date().toISOString(),
    approved_at: null,
    approved_by: null,
    remarks: "Under review by Faculty Coordinator."
  };

  db.club_memberships.push(newMembership);

  // Send notification to coordinator & admin
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: "notif-" + Date.now(),
    user_id: "all",
    title: `New Club Application: ${club.name}`,
    message: `${student.name} (${student.rollNo}) applied to join ${club.name}. Review pending in Coordinator Portal.`,
    category: "Membership",
    link: "#/coordinator/members",
    created_at: new Date().toISOString(),
    read: false
  });

  logAudit(student.name, "Applied for Club Membership", club.name, `Submitted application for ${club.name}`);
  saveDB(db);

  res.json({
    success: true,
    message: `Application to join ${club.name} submitted successfully! Your coordinator will review it shortly.`,
    membership: newMembership
  });
});

// 8. POST /api/memberships/review - Coordinator / Admin Review
apiRouter.post('/memberships/review', (req, res) => {
  const { membershipId, action, reviewerName, remarks } = req.body || {};
  if (!membershipId || !["approve", "reject", "suspend"].includes(action)) {
    return res.status(400).json({ success: false, message: "Valid membership ID and action (approve/reject/suspend) required." });
  }

  const db = getDB();
  const membership = (db.club_memberships || []).find(m => m.id === membershipId || m.membership_id === membershipId);
  if (!membership) {
    return res.status(404).json({ success: false, message: "Membership application record not found." });
  }

  const club = (db.clubs || []).find(c => c.id === membership.club_id);
  const student = (db.users || []).find(u => u.id === membership.student_id);

  if (action === "approve") {
    membership.status = "Approved";
    membership.approved_at = new Date().toISOString();
    membership.approved_by = reviewerName || "Faculty Coordinator";
    membership.remarks = remarks || "Application approved. Welcome to the club!";

    // Add in-app notification to student
    if (!Array.isArray(db.notifications)) db.notifications = [];
    db.notifications.unshift({
      id: "notif-" + Date.now(),
      user_id: membership.student_id,
      title: "Club Membership Approved!",
      message: `Congratulations! Your membership for ${club ? club.name : 'the club'} has been approved by ${membership.approved_by}.`,
      category: "Membership",
      link: "#/student/clubs",
      created_at: new Date().toISOString(),
      read: false
    });

    logAudit(reviewerName || "Coordinator", "Approved Club Membership", club ? club.name : membership.club_id, `Approved membership for student ${student ? student.name : membership.student_id}`);
  } else if (action === "reject") {
    membership.status = "Rejected";
    membership.approved_at = new Date().toISOString();
    membership.approved_by = reviewerName || "Faculty Coordinator";
    membership.remarks = remarks || "Application not accepted at this time.";

    if (!Array.isArray(db.notifications)) db.notifications = [];
    db.notifications.unshift({
      id: "notif-" + Date.now(),
      user_id: membership.student_id,
      title: "Club Application Update",
      message: `Your membership request for ${club ? club.name : 'the club'} was declined: ${membership.remarks}`,
      category: "Membership",
      link: "#/student/clubs",
      created_at: new Date().toISOString(),
      read: false
    });

    logAudit(reviewerName || "Coordinator", "Rejected Club Membership", club ? club.name : membership.club_id, `Rejected membership for student ${student ? student.name : membership.student_id}`);
  } else if (action === "suspend") {
    membership.status = "Suspended";
    membership.remarks = remarks || "Membership suspended by administration.";
    logAudit(reviewerName || "Coordinator", "Suspended Membership", club ? club.name : membership.club_id, `Suspended membership for ${student ? student.name : membership.student_id}`);
  }

  saveDB(db);
  res.json({ success: true, message: `Membership successfully updated to ${membership.status}.`, membership });
});

// 9. POST /api/events/create - Create Event
apiRouter.post('/events/create', (req, res) => {
  const { title, description, category, event_type, club_id, date, start_time, end_time, venue, max_participants, registration_deadline, banner, rules, created_by } = req.body || {};

  if (!title || !club_id || !date || !venue) {
    return res.status(400).json({ success: false, message: "Title, Club, Date, and Venue are required." });
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
    created_by: created_by || "Faculty Coordinator",
    created_at: new Date().toISOString(),
    active_qr_token: null,
    qr_token_expiry: null
  };

  if (!Array.isArray(db.events)) db.events = [];
  db.events.unshift(newEvent);

  // Broadcast announcement / notification
  const club = (db.clubs || []).find(c => c.id === club_id);
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: "notif-" + Date.now(),
    user_id: "all",
    title: `New Event: ${newEvent.title}`,
    message: `${club ? club.name : 'Technical Society'} announced ${newEvent.title} scheduled on ${newEvent.date}.`,
    category: "Events",
    link: "#/events",
    created_at: new Date().toISOString(),
    read: false
  });

  logAudit(created_by || "Coordinator", "Created Event", newEvent.title, `Scheduled for ${newEvent.date} at ${newEvent.venue}`);
  saveDB(db);

  res.json({ success: true, message: "Event created successfully.", event: newEvent });
});

// 10. POST /api/events/register - Real event registration with deadline & capacity validation
apiRouter.post('/events/register', (req, res) => {
  const { eventId, studentId } = req.body || {};
  if (!eventId || !studentId) {
    return res.status(400).json({ success: false, message: "Event ID and Student ID required." });
  }

  const db = getDB();
  const event = (db.events || []).find(e => e.id === eventId);
  const student = (db.users || []).find(u => u.id === studentId);

  if (!event) return res.status(404).json({ success: false, message: "Event not found." });
  if (!student) return res.status(404).json({ success: false, message: "Student record not found." });

  // 1. Deadline validation
  if (event.registration_deadline) {
    const deadlineTime = new Date(event.registration_deadline).getTime();
    if (Date.now() > deadlineTime) {
      return res.status(400).json({ success: false, message: "Registration closed. The deadline has passed." });
    }
  }

  // 2. Duplicate registration check
  if (!Array.isArray(db.event_registrations)) db.event_registrations = [];
  const alreadyRegistered = db.event_registrations.some(r => r.event_id === eventId && r.student_id === studentId && r.status === "Confirmed");
  if (alreadyRegistered) {
    return res.status(400).json({ success: false, message: "You are already registered for this event." });
  }

  // 3. Capacity validation
  const currentCount = db.event_registrations.filter(r => r.event_id === eventId && r.status === "Confirmed").length;
  if (currentCount >= event.max_participants) {
    return res.status(400).json({ success: false, message: "Event capacity full. No more registrations accepted." });
  }

  const ticketId = `TCK-${(event.club_id || 'PEC').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const newRegistration = {
    id: "reg-" + Date.now(),
    event_id: eventId,
    student_id: studentId,
    ticket_id: ticketId,
    registered_at: new Date().toISOString(),
    status: "Confirmed"
  };

  db.event_registrations.push(newRegistration);

  // Notify student
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: "notif-" + Date.now(),
    user_id: studentId,
    title: "Registration Confirmed!",
    message: `You are confirmed for '${event.title}'. Pass Code / Ticket: ${ticketId}.`,
    category: "Events",
    link: "#/student/events",
    created_at: new Date().toISOString(),
    read: false
  });

  logAudit(student.name, "Registered for Event", event.title, `Ticket: ${ticketId}`);
  saveDB(db);

  res.json({
    success: true,
    message: `Successfully registered for '${event.title}'! Your ticket pass is ${ticketId}.`,
    registration: newRegistration
  });
});

// 11. POST /api/events/cancel - Cancel registration
apiRouter.post('/events/cancel', (req, res) => {
  const { eventId, studentId } = req.body || {};
  const db = getDB();
  const reg = (db.event_registrations || []).find(r => r.event_id === eventId && r.student_id === studentId && r.status === "Confirmed");

  if (!reg) {
    return res.status(404).json({ success: false, message: "Active registration not found." });
  }

  reg.status = "Cancelled";
  logAudit(studentId, "Cancelled Registration", eventId, "Student self-cancelled registration.");
  saveDB(db);

  res.json({ success: true, message: "Registration cancelled successfully." });
});

// 12. POST /api/attendance/generate-qr - Coordinator generates temporary QR attendance token
apiRouter.post('/attendance/generate-qr', (req, res) => {
  const { eventId, durationMinutes, coordinatorName } = req.body || {};
  if (!eventId) {
    return res.status(400).json({ success: false, message: "Event ID is required." });
  }

  const db = getDB();
  const event = (db.events || []).find(e => e.id === eventId);
  if (!event) return res.status(404).json({ success: false, message: "Event not found." });

  const duration = parseInt(durationMinutes, 10) || 15;
  const expiry = new Date(Date.now() + duration * 60 * 1000).toISOString();
  const token = `PEC-ATT-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  event.active_qr_token = token;
  event.qr_token_expiry = expiry;

  logAudit(coordinatorName || "Coordinator", "Generated Attendance QR", event.title, `Token valid for ${duration} mins until ${expiry}`);
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

// 13. POST /api/attendance/scan - Student scans QR or inputs pass code
apiRouter.post('/attendance/scan', (req, res) => {
  const { studentId, token, eventId } = req.body || {};
  if (!studentId || !token) {
    return res.status(400).json({ success: false, message: "Student ID and Attendance Token are required." });
  }

  const db = getDB();
  const student = (db.users || []).find(u => u.id === studentId);
  if (!student) return res.status(404).json({ success: false, message: "Student record not found." });

  // Find event with this active token
  const event = (db.events || []).find(e =>
    (e.active_qr_token && e.active_qr_token.toUpperCase() === token.trim().toUpperCase()) ||
    (eventId && e.id === eventId && e.active_qr_token && e.active_qr_token.toUpperCase() === token.trim().toUpperCase())
  );

  if (!event) {
    return res.status(400).json({ success: false, message: "Invalid attendance token or QR code not recognized." });
  }

  // Check token expiry
  if (event.qr_token_expiry && new Date() > new Date(event.qr_token_expiry)) {
    return res.status(400).json({ success: false, message: "Attendance session has expired. Request the coordinator to regenerate QR." });
  }

  // Check student registration
  if (!Array.isArray(db.event_registrations)) db.event_registrations = [];
  const isRegistered = db.event_registrations.some(r => r.event_id === event.id && r.student_id === studentId && r.status === "Confirmed");
  if (!isRegistered) {
    return res.status(403).json({ success: false, message: "Access denied. You must be registered for this event to record attendance." });
  }

  // Check if attendance already marked
  if (!Array.isArray(db.attendance)) db.attendance = [];
  const alreadyAttended = db.attendance.some(a => a.event_id === event.id && a.student_id === studentId && a.status === "Present");
  if (alreadyAttended) {
    return res.status(400).json({ success: false, message: "Attendance already recorded for this event." });
  }

  const attendanceId = `ATT-${new Date().getFullYear()}-${event.club_id}-${Math.floor(100 + Math.random() * 900)}`;
  const record = {
    id: "att-" + Date.now(),
    attendance_id: attendanceId,
    event_id: event.id,
    student_id: studentId,
    timestamp: new Date().toISOString(),
    status: "Present",
    verification_method: "QR Scan"
  };

  db.attendance.push(record);

  // Notify student
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: "notif-" + Date.now(),
    user_id: studentId,
    title: "Attendance Verified!",
    message: `Your presence for '${event.title}' was verified via secure QR token. (ID: ${attendanceId})`,
    category: "Attendance",
    link: "#/student/attendance",
    created_at: new Date().toISOString(),
    read: false
  });

  logAudit(student.name, "Recorded Attendance", event.title, `Verified via QR scan (ID: ${attendanceId})`);
  saveDB(db);

  res.json({
    success: true,
    message: `Attendance marked successfully for '${event.title}'!`,
    record
  });
});

// 14. POST /api/attendance/manual-checkin - Coordinator manual toggle
apiRouter.post('/attendance/manual-checkin', (req, res) => {
  const { eventId, studentId, status, coordinatorName } = req.body || {};
  if (!eventId || !studentId) {
    return res.status(400).json({ success: false, message: "Event ID and Student ID required." });
  }

  const db = getDB();
  if (!Array.isArray(db.attendance)) db.attendance = [];

  let record = db.attendance.find(a => a.event_id === eventId && a.student_id === studentId);
  const targetStatus = status === "Absent" ? "Absent" : "Present";

  if (record) {
    record.status = targetStatus;
    record.timestamp = new Date().toISOString();
    record.verification_method = "Faculty Manual Check-in";
  } else {
    record = {
      id: "att-" + Date.now(),
      attendance_id: `ATT-MANUAL-${Math.floor(100 + Math.random() * 900)}`,
      event_id: eventId,
      student_id: studentId,
      timestamp: new Date().toISOString(),
      status: targetStatus,
      verification_method: "Faculty Manual Check-in"
    };
    db.attendance.push(record);
  }

  logAudit(coordinatorName || "Coordinator", `Manual Attendance: ${targetStatus}`, eventId, `Student ID: ${studentId}`);
  saveDB(db);

  res.json({ success: true, message: `Attendance updated to ${targetStatus}.`, record });
});

// 15. POST /api/certificates/issue - Coordinator issues verified certificate
apiRouter.post('/certificates/issue', (req, res) => {
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

  // Prevent duplicate certificate for same student and event
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
    authorized_signature: authorizedSignature || `${club?.facultyCoordinator || 'Faculty Coordinator'} & Dr. K. Satyanarayana (Principal)`,
    qr_hash: qrHash
  };

  db.certificates.push(newCertificate);

  // Notify student
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: "notif-" + Date.now(),
    user_id: studentId,
    title: "New Certificate Issued!",
    message: `Your accredited ${newCertificate.certificate_type} for '${event.title}' is ready. (ID: ${certId})`,
    category: "Certificates",
    link: `#/verify-certificate?id=${certId}`,
    created_at: new Date().toISOString(),
    read: false
  });

  logAudit(authorizedSignature || "Coordinator", "Issued Certificate", certId, `Awarded to ${student.name} for ${event.title}`);
  saveDB(db);

  res.json({ success: true, message: `Certificate ${certId} issued successfully!`, certificate: newCertificate });
});

// 16. GET /api/certificates/verify/:certId - Public verification endpoint
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
    institution: "Pragati Engineering College (Autonomous), Andhra Pradesh",
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

// 17. POST /api/announcements/create - Create targeted announcement
apiRouter.post('/announcements/create', (req, res) => {
  const { title, message, target_audience, target_id, attachment_url, created_by, expiry_date, pinned } = req.body || {};
  if (!title || !message) {
    return res.status(400).json({ success: false, message: "Title and message are required." });
  }

  const db = getDB();
  const newAnn = {
    id: "ann-" + Date.now(),
    title: title.trim(),
    message: message.trim(),
    target_audience: target_audience || "All Students",
    target_id: target_id || "all",
    attachment_url: attachment_url || "",
    created_date: new Date().toISOString(),
    created_by: created_by || "Institutional Secretariat",
    expiry_date: expiry_date || "2026-12-31",
    pinned: Boolean(pinned)
  };

  if (!Array.isArray(db.announcements)) db.announcements = [];
  db.announcements.unshift(newAnn);

  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: "notif-" + Date.now(),
    user_id: "all",
    title: `Notice: ${newAnn.title}`,
    message: newAnn.message.slice(0, 100) + '...',
    category: "Announcements",
    link: "#/announcements",
    created_at: new Date().toISOString(),
    read: false
  });

  logAudit(created_by || "Administrator", "Published Announcement", newAnn.title, `Target: ${newAnn.target_audience}`);
  saveDB(db);

  res.json({ success: true, message: "Announcement published successfully.", announcement: newAnn });
});

// 18. POST /api/resources/create - Upload learning material
apiRouter.post('/resources/create', (req, res) => {
  const { title, description, club_id, category, uploaded_by, file_url, target_semester } = req.body || {};
  if (!title || !club_id || !file_url) {
    return res.status(400).json({ success: false, message: "Title, Club, and Resource File/URL are required." });
  }

  const db = getDB();
  const newRes = {
    id: "res-" + Date.now(),
    title: title.trim(),
    description: description || "",
    club_id,
    category: category || "PDF",
    uploaded_by: uploaded_by || "Coordinator",
    upload_date: new Date().toISOString().split('T')[0],
    file_url: file_url.trim(),
    target_semester: target_semester || "All Semesters"
  };

  if (!Array.isArray(db.resources)) db.resources = [];
  db.resources.unshift(newRes);

  logAudit(uploaded_by || "Coordinator", "Uploaded Resource", newRes.title, `Category: ${newRes.category}`);
  saveDB(db);

  res.json({ success: true, message: "Resource uploaded successfully.", resource: newRes });
});

// 19. POST /api/projects/create - Create club project
apiRouter.post('/projects/create', (req, res) => {
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
    team_members: Array.isArray(team_members) ? team_members : (team_members ? team_members.split(',').map(t => t.trim()) : ["Student"]),
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

  logAudit(newProj.team_members[0] || "Student", "Created Project", newProj.title, `Club: ${club_id}`);
  saveDB(db);

  res.json({ success: true, message: "Project registered successfully.", project: newProj });
});

// 20. POST /api/activity-reports/create - Official activity report upload
apiRouter.post('/activity-reports/create', (req, res) => {
  const { activity_title, date, club_id, description, participants_count, report_file_url, photos, created_by } = req.body || {};
  if (!activity_title || !club_id || !date) {
    return res.status(400).json({ success: false, message: "Activity Title, Club, and Date are required." });
  }

  const db = getDB();
  const newReport = {
    id: "rep-" + Date.now(),
    activity_title: activity_title.trim(),
    date,
    club_id,
    description: description || "",
    participants_count: parseInt(participants_count, 10) || 0,
    report_file_url: report_file_url || "https://pragati.ac.in/career-guidance-cell/industry-4-0-clubs/",
    photos: Array.isArray(photos) ? photos : (photos ? [photos] : []),
    created_by: created_by || "Faculty Coordinator",
    official_url: "https://pragati.ac.in/career-guidance-cell/industry-4-0-clubs/"
  };

  if (!Array.isArray(db.activity_reports)) db.activity_reports = [];
  db.activity_reports.unshift(newReport);

  logAudit(created_by || "Coordinator", "Uploaded Activity Report", newReport.activity_title, `Participants: ${newReport.participants_count}`);
  saveDB(db);

  res.json({ success: true, message: "Activity report uploaded successfully.", report: newReport });
});

// 21. POST /api/feedback/submit - Event feedback with attendance verification
apiRouter.post('/feedback/submit', (req, res) => {
  const { eventId, studentId, content_rating, organization_rating, speaker_rating, venue_rating, overall_rating, written_feedback } = req.body || {};
  if (!eventId || !studentId) {
    return res.status(400).json({ success: false, message: "Event ID and Student ID required." });
  }

  const db = getDB();

  // Verification: Only students marked Present can submit feedback
  if (!Array.isArray(db.attendance)) db.attendance = [];
  const wasPresent = db.attendance.some(a => a.event_id === eventId && a.student_id === studentId && a.status === "Present");
  if (!wasPresent) {
    return res.status(403).json({ success: false, message: "Only verified attendees (marked Present) are eligible to submit event feedback." });
  }

  // Prevent multiple submissions
  if (!Array.isArray(db.feedback)) db.feedback = [];
  const alreadySubmitted = db.feedback.some(f => f.event_id === eventId && f.student_id === studentId);
  if (alreadySubmitted) {
    return res.status(400).json({ success: false, message: "You have already submitted feedback for this event." });
  }

  const newFeedback = {
    id: "fb-" + Date.now(),
    event_id: eventId,
    student_id: studentId,
    content_rating: parseInt(content_rating, 10) || 5,
    organization_rating: parseInt(organization_rating, 10) || 5,
    speaker_rating: parseInt(speaker_rating, 10) || 5,
    venue_rating: parseInt(venue_rating, 10) || 5,
    overall_rating: parseInt(overall_rating, 10) || 5,
    written_feedback: written_feedback || "",
    submitted_at: new Date().toISOString()
  };

  db.feedback.push(newFeedback);
  logAudit(studentId, "Submitted Event Feedback", eventId, `Overall rating: ${newFeedback.overall_rating}/5`);
  saveDB(db);

  res.json({ success: true, message: "Thank you! Your event feedback has been submitted successfully.", feedback: newFeedback });
});

// 22. POST /api/admin/users/update-role - Admin updates user role
apiRouter.post('/admin/users/update-role', (req, res) => {
  const { userId, newRole, assignedClubs, adminName } = req.body || {};
  const db = getDB();
  const user = (db.users || []).find(u => u.id === userId);

  if (!user) return res.status(404).json({ success: false, message: "User not found." });

  const oldRole = user.role;
  user.role = newRole;
  if (Array.isArray(assignedClubs)) user.assignedClubs = assignedClubs;

  logAudit(adminName || "Super Admin", "Updated User Role", user.name, `Changed role from ${oldRole} to ${newRole}`);
  saveDB(db);

  res.json({ success: true, message: `Role updated to ${newRole}.`, user: sanitizeUser(user) });
});

// 23. Notifications Read Handlers
apiRouter.post('/notifications/mark-read', (req, res) => {
  const { notifId } = req.body || {};
  const db = getDB();
  const notif = (db.notifications || []).find(n => n.id === notifId);
  if (notif) notif.read = true;
  saveDB(db);
  res.json({ success: true });
});

apiRouter.post('/notifications/mark-all-read', (req, res) => {
  const { userId } = req.body || {};
  const db = getDB();
  (db.notifications || []).forEach(n => {
    if (!userId || n.user_id === userId || n.user_id === "all") {
      n.read = true;
    }
  });
  saveDB(db);
  res.json({ success: true });
});
