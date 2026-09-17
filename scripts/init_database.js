/**
 * Pragati Engineering College (PEC Autonomous) - CampusTech
 * Database Initialization Script
 * 
 * Checks if 'public.clubs' and 'public.users' tables exist in Supabase/Local storage.
 * If missing or empty, seeds them with mock data including the 35 clubs and 
 * 4 demo user credentials (Student, Club Admin, Faculty Coordinator, Director (Academics))
 * to ensure all dashboard portals are fully populated.
 *
 * Usage:
 *   node scripts/init_database.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_PEC_CLUBS } from '../js/officialClubs.js';
import { hashPassword, generateSalt, INITIAL_BACKEND_SEED } from '../backend/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const JSON_DB_PATH = path.join(DATA_DIR, 'pec_database.json');

const DEFAULT_SALT = "pec_secure_salt_2026";
const DEFAULT_PASSWORD = process.env.DEMO_PASSWORD || "Password@123";
const DEFAULT_PASSWORD_HASH = hashPassword(DEFAULT_PASSWORD, DEFAULT_SALT);

// 4 Primary Demo Credentials
export const DEMO_USERS = [
  {
    id: "std-101",
    name: "Aarav Sharma",
    rollNo: "22CS101",
    roll_no: "22CS101",
    email: "aarav.sharma@pragati.ac.in",
    demoAlias: "student.demo@pragati.ac.in",
    demo_alias: "student.demo@pragati.ac.in",
    role: "Student",
    department: "CSE",
    year: "3rd Year",
    section: "B",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    skills: ["Python", "PyTorch", "FastAPI", "Docker", "ROS"],
    interests: ["Artificial Intelligence", "Edge Computing", "Competitive Programming"],
    bio: "Undergraduate CSE student enthusiastic about practical deep learning and edge autonomy.",
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_PASSWORD_HASH,
    password_hash: DEFAULT_PASSWORD_HASH,
    emailVerified: true,
    email_verified: true,
    membershipId: "PEC-MEM-2026-CSE-8492",
    membership_id: "PEC-MEM-2026-CSE-8492",
    validUntil: "30 June 2027",
    valid_until: "30 June 2027",
    isDemo: true,
    is_demo: true
  },
  {
    id: "std-102",
    name: "Priya Patel",
    rollNo: "22CS142",
    roll_no: "22CS142",
    email: "priya.patel@pragati.ac.in",
    demoAlias: "leader.demo@pragati.ac.in",
    demo_alias: "leader.demo@pragati.ac.in",
    role: "Club Admin",
    studentLeaderRole: "President",
    student_leader_role: "President",
    clubId: "I4-08",
    club_id: "I4-08",
    assignedClubs: ["I4-08"],
    assigned_clubs: ["I4-08"],
    department: "CSE(AIML)",
    year: "3rd Year",
    section: "A",
    phone: "+91 98480 12345",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    skills: ["Machine Learning", "Event Management", "Python", "Leadership"],
    interests: ["Tech Hackathons", "Community Building"],
    bio: "Student President and Club Admin of AI&ML Turing Club organizing tech symposiums.",
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_PASSWORD_HASH,
    password_hash: DEFAULT_PASSWORD_HASH,
    emailVerified: true,
    email_verified: true,
    membershipId: "PEC-MEM-2026-AIML-5120",
    membership_id: "PEC-MEM-2026-AIML-5120",
    validUntil: "30 June 2027",
    valid_until: "30 June 2027",
    isDemo: true,
    is_demo: true
  },
  {
    id: "coord-201",
    name: "Mrs. L. Yamuna",
    facultyId: "FAC-CSE-AIML-01",
    faculty_id: "FAC-CSE-AIML-01",
    email: "yamuna.l@pragati.ac.in",
    demoAlias: "coordinator.demo@pragati.ac.in",
    demo_alias: "coordinator.demo@pragati.ac.in",
    role: "Faculty Coordinator",
    department: "CSE(AIML)",
    designation: "Assistant Professor & Faculty Coordinator",
    phone: "+91 884 2383305",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    assignedClubs: ["I4-08"],
    assigned_clubs: ["I4-08"],
    skills: ["Artificial Intelligence", "Machine Learning", "Research Mentorship"],
    interests: ["Deep Learning Models", "Curricular Innovations"],
    bio: "Faculty Coordinator for AI&ML Turing Club at Pragati Engineering College.",
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_PASSWORD_HASH,
    password_hash: DEFAULT_PASSWORD_HASH,
    emailVerified: true,
    email_verified: true,
    membershipId: "PEC-FAC-2026-AIML-01",
    membership_id: "PEC-FAC-2026-AIML-01",
    validUntil: "Permanent",
    valid_until: "Permanent",
    isDemo: true,
    is_demo: true
  },
  {
    id: "admin-001",
    name: "Dr. K. Satyanarayana",
    facultyId: "FAC-PEC-001",
    faculty_id: "FAC-PEC-001",
    email: "director.academics@pragati.ac.in",
    demoAlias: "admin.demo@pragati.ac.in",
    demo_alias: "admin.demo@pragati.ac.in",
    role: "Director (Academics)",
    department: "CSE",
    designation: "Director (Academics) & Head of Academic Council",
    phone: "+91 884 2383305",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
    skills: ["Academic Administration", "NBA / NAAC Accreditation", "Institutional Leadership"],
    interests: ["Higher Technical Education", "Outcome-Based Education"],
    bio: "Director (Academics), Pragati Engineering College (Autonomous), Surampalem.",
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_PASSWORD_HASH,
    password_hash: DEFAULT_PASSWORD_HASH,
    emailVerified: true,
    email_verified: true,
    membershipId: "PEC-ADMIN-2026-HQ-001",
    membership_id: "PEC-ADMIN-2026-HQ-001",
    validUntil: "Lifetime",
    valid_until: "Lifetime",
    isDemo: true,
    is_demo: true
  }
];

export async function initializeDatabase() {
  console.log("====================================================================");
  console.log("PEC CampusTech - Database Initialization & Verification Script");
  console.log("====================================================================");

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
      console.log(`[Database Init] Supabase Client Connected (${supabaseUrl})`);
    } catch (err) {
      console.warn("[Database Init] Supabase connection error:", err.message);
    }
  } else {
    console.log("[Database Init] Supabase env variables not configured; operating on local JSON database store.");
  }

  // Ensure data folder exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let localDB = {
    departments: INITIAL_BACKEND_SEED.departments,
    users: INITIAL_BACKEND_SEED.users,
    clubs: INITIAL_BACKEND_SEED.clubs,
    club_memberships: INITIAL_BACKEND_SEED.club_memberships,
    club_roles: INITIAL_BACKEND_SEED.club_roles || [],
    events: INITIAL_BACKEND_SEED.events,
    event_registrations: INITIAL_BACKEND_SEED.event_registrations,
    attendance: INITIAL_BACKEND_SEED.attendance,
    certificates: INITIAL_BACKEND_SEED.certificates,
    announcements: INITIAL_BACKEND_SEED.announcements,
    notifications: INITIAL_BACKEND_SEED.notifications || [],
    resources: INITIAL_BACKEND_SEED.resources,
    projects: INITIAL_BACKEND_SEED.projects,
    activity_reports: INITIAL_BACKEND_SEED.activity_reports || [],
    feedback: INITIAL_BACKEND_SEED.feedback || [],
    audit_logs: INITIAL_BACKEND_SEED.audit_logs || []
  };

  if (fs.existsSync(JSON_DB_PATH)) {
    try {
      const raw = fs.readFileSync(JSON_DB_PATH, 'utf8');
      const loaded = JSON.parse(raw);
      localDB = { ...localDB, ...loaded };
    } catch (err) {
      console.warn("[Database Init] Failed to parse existing local DB file, initializing fresh:", err.message);
    }
  }

  // Ensure any empty tables are loaded with the INITIAL_BACKEND_SEED data
  for (const key of Object.keys(INITIAL_BACKEND_SEED)) {
    if (!localDB[key] || !Array.isArray(localDB[key]) || localDB[key].length === 0) {
      localDB[key] = INITIAL_BACKEND_SEED[key];
    }
  }

  const collectionsToSeed = [
    { name: 'clubs', seedData: INITIAL_BACKEND_SEED.clubs, mapRow: c => ({
      id: c.id,
      code: c.code || c.id,
      name: c.name,
      category: c.category || 'Industry 4.0',
      department: c.department || null,
      description: c.description || null,
      objective: c.objective || null,
      faculty_coordinator: c.facultyCoordinator || c.faculty_coordinator || null,
      faculty_coordinator_phone: c.facultyCoordinatorPhone || c.faculty_coordinator_phone || null,
      faculty_coordinator_email: c.facultyCoordinatorEmail || c.faculty_coordinator_email || null,
      student_coordinator: c.studentCoordinator || c.student_coordinator || null,
      student_coordinator_roll: c.studentCoordinatorRoll || c.student_coordinator_roll || null,
      student_coordinator_phone: c.studentCoordinatorPhone || c.student_coordinator_phone || null,
      established_year: c.establishedYear || c.established_year || 2024,
      active_members: c.activeMembers || c.active_members || 25,
      meeting_schedule: c.meetingSchedule || c.meeting_schedule || null,
      venue: c.venue || null,
      banner: c.banner || null,
      logo: c.logo || null,
      tags: Array.isArray(c.tags) ? c.tags : [],
      status: c.status || 'Active'
    }) },
    { name: 'users', seedData: INITIAL_BACKEND_SEED.users, mapRow: u => ({
      id: u.id,
      name: u.name,
      roll_no: u.rollNo || u.roll_no || null,
      faculty_id: u.facultyId || u.faculty_id || null,
      email: (u.email || '').toLowerCase(),
      demo_alias: u.demoAlias || u.demo_alias || null,
      role: u.role || 'Student',
      student_leader_role: u.studentLeaderRole || u.student_leader_role || null,
      club_id: u.clubId || u.club_id || null,
      assigned_clubs: u.assignedClubs || u.assigned_clubs || [],
      department: u.department || null,
      year: u.year || null,
      section: u.section || null,
      semester: u.semester || null,
      cgpa: u.cgpa || null,
      phone: u.phone || null,
      avatar: u.avatar || null,
      skills: u.skills || [],
      interests: u.interests || [],
      bio: u.bio || null,
      badges: u.badges || [],
      salt: u.salt || null,
      password_hash: u.passwordHash || u.password_hash || null,
      email_verified: !!(u.emailVerified || u.email_verified),
      membership_id: u.membershipId || u.membership_id || null,
      valid_until: u.validUntil || u.valid_until || null,
      designation: u.designation || null,
      is_demo: !!(u.isDemo || u.is_demo)
    }) },
    { name: 'events', seedData: INITIAL_BACKEND_SEED.events, mapRow: e => ({
      id: e.id,
      title: e.title || e.name,
      name: e.name || e.title,
      category: e.category,
      event_type: e.event_type || e.eventType || e.category,
      club_id: e.club_id || e.clubId,
      date: e.date,
      start_time: e.start_time || e.startTime || null,
      end_time: e.end_time || e.endTime || null,
      time: e.time || `${e.start_time || ''} - ${e.end_time || ''}`,
      venue: e.venue || 'PEC Campus',
      max_participants: e.max_participants || e.maxParticipants || e.capacity || 100,
      capacity: e.capacity || e.max_participants || 100,
      registered_count: e.registered_count || e.registeredCount || 0,
      registration_deadline: e.registration_deadline || e.registrationDeadline || null,
      status: e.status || 'Upcoming',
      banner: e.banner || null,
      description: e.description || null,
      rules: e.rules || [],
      tags: e.tags || [],
      created_by: e.created_by || e.createdBy || null
    }) },
    { name: 'resources', seedData: INITIAL_BACKEND_SEED.resources, mapRow: r => ({
      id: r.id,
      title: r.title,
      description: r.description || null,
      club_id: r.club_id || r.clubId || null,
      category: r.category || 'Tutorial',
      uploaded_by: r.uploaded_by || r.uploadedBy || 'Faculty Coordinator',
      upload_date: r.upload_date || r.uploadDate || new Date().toISOString().split('T')[0],
      file_url: r.file_url || r.fileUrl || null,
      target_semester: r.target_semester || r.targetSemester || null
    }) },
    { name: 'club_memberships', seedData: INITIAL_BACKEND_SEED.club_memberships, mapRow: m => ({
      id: m.id,
      membership_id: m.membership_id || m.membershipId || null,
      student_id: m.student_id || m.studentId,
      club_id: m.club_id || m.clubId,
      role: m.role || 'Member',
      status: m.status || 'Pending',
      statement: m.statement || null,
      requested_at: m.requested_at || m.requestedAt || new Date().toISOString(),
      approved_at: m.approved_at || m.approvedAt || null,
      approved_by: m.approved_by || m.approvedBy || null,
      remarks: m.remarks || null
    }) },
    { name: 'event_registrations', seedData: INITIAL_BACKEND_SEED.event_registrations, mapRow: r => ({
      id: r.id,
      event_id: r.event_id || r.eventId,
      student_id: r.student_id || r.studentId,
      ticket_id: r.ticket_id || r.ticketId || `TCK-${Date.now()}`,
      registered_at: r.registered_at || r.registeredAt || new Date().toISOString(),
      status: r.status || 'Confirmed'
    }) },
    { name: 'attendance', seedData: INITIAL_BACKEND_SEED.attendance, mapRow: a => ({
      id: a.id,
      attendance_id: a.attendance_id || a.attendanceId || null,
      event_id: a.event_id || a.eventId,
      student_id: a.student_id || a.studentId,
      timestamp: a.timestamp || new Date().toISOString(),
      status: a.status || 'Present',
      verification_method: a.verification_method || a.verificationMethod || 'QR Scan'
    }) },
    { name: 'certificates', seedData: INITIAL_BACKEND_SEED.certificates, mapRow: c => ({
      id: c.id || c.certificateId || c.certificate_id,
      certificate_id: c.certificate_id || c.certificateId || c.id,
      student_id: c.student_id || c.studentId,
      student_name: c.student_name || c.studentName || c.recipientName || 'Student',
      roll_no: c.roll_no || c.rollNo || c.recipientRoll || null,
      department: c.department || null,
      event_id: c.event_id || c.eventId || null,
      event_name: c.event_name || c.eventName || 'Event',
      club_id: c.club_id || c.clubId || null,
      club_name: c.club_name || c.clubName || 'Club',
      date: c.date || c.issued_date || c.issueDate || '2026-09-02',
      award_type: c.award_type || c.awardType || c.certificate_type || 'Certificate of Participation',
      issued_date: c.issued_date || c.issueDate || '2026-09-02',
      institution: c.institution || 'Pragati University / Pragati Engineering College (Autonomous)',
      issued_by: c.issued_by || 'Pragati University CCTSC',
      recipient_email: c.recipient_email || c.recipientEmail || null,
      authorized_signature: c.authorized_signature || 'Authorized Signatory',
      qr_hash: c.qr_hash || c.qrHash || c.verificationHash || 'sha256:verified'
    }) },
    { name: 'announcements', seedData: INITIAL_BACKEND_SEED.announcements, mapRow: a => ({
      id: a.id,
      title: a.title,
      message: a.message,
      target_audience: a.target_audience || a.targetAudience || 'All Students',
      target_id: a.target_id || a.targetId || 'all',
      attachment_url: a.attachment_url || a.attachmentUrl || null,
      created_date: a.created_date || a.createdDate || new Date().toISOString(),
      created_by: a.created_by || a.createdBy || 'CCTSC',
      expiry_date: a.expiry_date || a.expiryDate || null,
      pinned: !!a.pinned
    }) },
    { name: 'projects', seedData: INITIAL_BACKEND_SEED.projects, mapRow: p => ({
      id: p.id,
      title: p.title,
      description: p.description || null,
      problem_statement: p.problem_statement || p.problemStatement || null,
      club_id: p.club_id || p.clubId || null,
      student_id: p.student_id || p.studentId || null,
      status: p.status || 'Pending',
      created_at: p.created_at || p.createdAt || new Date().toISOString()
    }) }
  ];

  for (const col of collectionsToSeed) {
    console.log(`\nChecking 'public.${col.name}' table...`);
    let tableOK = false;
    let recordsCount = 0;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from(col.name)
          .select('id');

        if (error) {
          console.warn(`  [Warning] Table 'public.${col.name}' query issue: ${error.message}`);
        } else {
          recordsCount = data ? data.length : 0;
          console.log(`  [OK] Table 'public.${col.name}' exists with ${recordsCount} records.`);
          if (recordsCount > 0) {
            tableOK = true;
          }
        }
      } catch (err) {
        console.warn(`  [Warning] Error checking 'public.${col.name}' in Supabase:`, err.message);
      }
    }

    if (!tableOK && localDB[col.name] && localDB[col.name].length > 0) {
      console.log(`  [OK] Local database cache contains ${localDB[col.name].length} records for '${col.name}'.`);
      tableOK = true;
    }

    if (!tableOK && col.seedData && col.seedData.length > 0) {
      console.log(`  [Seeding] Seeding ${col.seedData.length} records into '${col.name}'...`);
      localDB[col.name] = col.seedData;

      if (supabase) {
        try {
          const rowsToInsert = col.seedData.map(col.mapRow);
          for (let i = 0; i < rowsToInsert.length; i += 20) {
            const chunk = rowsToInsert.slice(i, i + 20);
            const { error } = await supabase.from(col.name).upsert(chunk, { onConflict: 'id' });
            if (error) {
              console.warn(`  [Supabase Seed Warning] ${col.name} chunk insert error:`, error.message);
            }
          }
          console.log(`  [Success] Seeded ${col.seedData.length} records into Supabase 'public.${col.name}'.`);
        } catch (err) {
          console.warn(`  [Supabase Seed Error] ${col.name} seeding failed:`, err.message);
        }
      }
    }
  }

  // Ensure local DB JSON file is saved and synchronized
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(localDB, null, 2), 'utf8');
  console.log(`\n[Database Init] Local cache successfully updated at: ${JSON_DB_PATH}`);

  console.log("\n====================================================================");
  console.log("DATABASE INITIALIZATION STATUS: SUCCESS");
  console.log("--------------------------------------------------------------------");
  console.log(`• Clubs Table Status: ${localDB.clubs.length} Technical Clubs Ready`);
  console.log(`• Users Table Status: ${localDB.users.length} Users Ready`);
  console.log(`• Events Table Status: ${localDB.events.length} Events Ready`);
  console.log(`• Resources Table Status: ${localDB.resources.length} Resources Ready`);
  console.log(`• Memberships Status: ${localDB.club_memberships.length} Club Memberships Ready`);
  console.log(`• Certificates Status: ${localDB.certificates.length} Digital Credentials Ready`);
  console.log("• Demo Credentials Populated:");
  console.log("  1. Student:               Aarav Sharma (aarav.sharma@pragati.ac.in)");
  console.log("  2. Club Admin:            Priya Patel (priya.patel@pragati.ac.in)");
  console.log("  3. Faculty Coordinator:   Mrs. L. Yamuna (yamuna.l@pragati.ac.in)");
  console.log("  4. Director (Academics):  Dr. K. Satyanarayana (director.academics@pragati.ac.in)");
  console.log("====================================================================\n");

  return {
    status: "ok",
    clubsCount: localDB.clubs ? localDB.clubs.length : 35,
    usersCount: localDB.users ? localDB.users.length : 4,
    eventsCount: localDB.events ? localDB.events.length : 0,
    resourcesCount: localDB.resources ? localDB.resources.length : 0,
    demoUsersReady: true
  };
}

// Execute directly if run via node CLI
if (process.argv[1] && process.argv[1].includes('init_database.js')) {
  initializeDatabase().catch(err => {
    console.error("[Database Init] Execution Error:", err);
    process.exit(1);
  });
}
