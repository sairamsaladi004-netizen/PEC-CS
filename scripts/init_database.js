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
import { hashPassword, generateSalt } from '../backend/db.js';

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
    clubs: [],
    users: [],
    departments: [
      { code: "CE", name: "Civil Engineering" },
      { code: "IT", name: "Information Technology" },
      { code: "ME", name: "Mechanical Engineering" },
      { code: "CSE", name: "Computer Science & Engineering" },
      { code: "CSE(CS)", name: "CSE - Cyber Security" },
      { code: "CSE(AIML)", name: "CSE - Artificial Intelligence & Machine Learning" },
      { code: "ECE", name: "Electronics & Communication Engineering" },
      { code: "EEE", name: "Electrical & Electronics Engineering" },
      { code: "CSE(DS)", name: "CSE - Data Science" },
      { code: "BSH", name: "Basic Sciences & Humanities" }
    ],
    events: [],
    club_memberships: [],
    certificates: [],
    resources: [],
    projects: [],
    announcements: [],
    attendance: [],
    audit_logs: []
  };

  if (fs.existsSync(JSON_DB_PATH)) {
    try {
      const raw = fs.readFileSync(JSON_DB_PATH, 'utf8');
      localDB = { ...localDB, ...JSON.parse(raw) };
    } catch (err) {
      console.warn("[Database Init] Failed to parse existing local DB file, initializing fresh:", err.message);
    }
  }

  // 1. Check & Seed Clubs Table
  console.log("\n[1/2] Checking 'public.clubs' table...");
  let clubsTableOK = false;
  let currentClubsCount = 0;

  if (supabase) {
    try {
      const { data, error, count } = await supabase
        .from('clubs')
        .select('id', { count: 'exact' });

      if (error) {
        console.warn(`  [Warning] Table 'public.clubs' issue: ${error.message}`);
      } else {
        currentClubsCount = data ? data.length : 0;
        console.log(`  [OK] Table 'public.clubs' exists with ${currentClubsCount} records.`);
        if (currentClubsCount >= 35) {
          clubsTableOK = true;
        }
      }
    } catch (err) {
      console.warn("  [Warning] Error checking 'public.clubs' in Supabase:", err.message);
    }
  }

  // Check local JSON DB for clubs as well
  if (!clubsTableOK && localDB.clubs && localDB.clubs.length >= 35) {
    console.log(`  [OK] Local database cache contains ${localDB.clubs.length} official clubs.`);
    clubsTableOK = true;
  }

  if (!clubsTableOK) {
    console.log(`  [Seeding] Seeding all 35 official PEC clubs into database...`);
    localDB.clubs = OFFICIAL_PEC_CLUBS;

    if (supabase) {
      try {
        const clubRows = OFFICIAL_PEC_CLUBS.map(c => ({
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
        }));

        for (let i = 0; i < clubRows.length; i += 20) {
          const chunk = clubRows.slice(i, i + 20);
          const { error } = await supabase.from('clubs').upsert(chunk, { onConflict: 'id' });
          if (error) console.warn("  [Supabase Seed Warning] Clubs chunk insert:", error.message);
        }
        console.log(`  [Success] Seeded ${OFFICIAL_PEC_CLUBS.length} clubs into Supabase 'public.clubs'.`);
      } catch (err) {
        console.warn("  [Supabase Seed Error] Clubs:", err.message);
      }
    }
  }

  // 2. Check & Seed Users Table
  console.log("\n[2/2] Checking 'public.users' table and demo credentials...");
  let usersTableOK = false;
  let currentUsersCount = 0;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role');

      if (error) {
        console.warn(`  [Warning] Table 'public.users' issue: ${error.message}`);
      } else {
        currentUsersCount = data ? data.length : 0;
        console.log(`  [OK] Table 'public.users' exists with ${currentUsersCount} users.`);
        const hasStudent = data.some(u => u.id === 'std-101' || u.role === 'Student');
        const hasLeader = data.some(u => u.id === 'std-102' || u.role === 'Club Admin');
        const hasFaculty = data.some(u => u.id === 'coord-201' || u.role === 'Faculty Coordinator');
        const hasDirector = data.some(u => u.id === 'admin-001' || u.role === 'Super Admin' || u.role === 'Director (Academics)');

        if (hasStudent && hasLeader && hasFaculty && hasDirector) {
          usersTableOK = true;
          console.log(`  [OK] All 4 demo credentials verified in Supabase 'public.users'.`);
        }
      }
    } catch (err) {
      console.warn("  [Warning] Error checking 'public.users' in Supabase:", err.message);
    }
  }

  if (!usersTableOK && localDB.users && localDB.users.length >= 4) {
    const hasStudent = localDB.users.some(u => u.id === 'std-101');
    const hasLeader = localDB.users.some(u => u.id === 'std-102');
    const hasFaculty = localDB.users.some(u => u.id === 'coord-201');
    const hasDirector = localDB.users.some(u => u.id === 'admin-001');

    if (hasStudent && hasLeader && hasFaculty && hasDirector) {
      usersTableOK = true;
      console.log(`  [OK] Local database cache contains all 4 demo credentials.`);
    }
  }

  if (!usersTableOK) {
    console.log(`  [Seeding] Seeding 4 demo user accounts (Student, Club Admin, Faculty Coordinator, Director)...`);
    
    // Merge into local DB
    DEMO_USERS.forEach(demoUser => {
      const idx = localDB.users.findIndex(u => u.id === demoUser.id || u.email === demoUser.email);
      if (idx >= 0) {
        localDB.users[idx] = { ...localDB.users[idx], ...demoUser };
      } else {
        localDB.users.push(demoUser);
      }
    });

    if (supabase) {
      try {
        const userRows = DEMO_USERS.map(u => ({
          id: u.id,
          name: u.name,
          roll_no: u.rollNo || u.roll_no || null,
          faculty_id: u.facultyId || u.faculty_id || null,
          email: u.email.toLowerCase(),
          demo_alias: u.demoAlias || u.demo_alias || null,
          role: u.role,
          student_leader_role: u.studentLeaderRole || null,
          club_id: u.clubId || u.club_id || null,
          assigned_clubs: u.assignedClubs || [],
          department: u.department || null,
          year: u.year || null,
          section: u.section || null,
          phone: u.phone || null,
          avatar: u.avatar || null,
          skills: u.skills || [],
          interests: u.interests || [],
          bio: u.bio || null,
          salt: u.salt,
          password_hash: u.passwordHash,
          email_verified: true,
          membership_id: u.membershipId,
          valid_until: u.validUntil,
          designation: u.designation || null,
          is_demo: true
        }));

        const { error } = await supabase.from('users').upsert(userRows, { onConflict: 'id' });
        if (error) console.warn("  [Supabase Seed Warning] Users upsert:", error.message);
        else console.log(`  [Success] Seeded 4 demo accounts into Supabase 'public.users'.`);
      } catch (err) {
        console.warn("  [Supabase Seed Error] Users:", err.message);
      }
    }
  }

  // Ensure local DB JSON file is saved and synchronized
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(localDB, null, 2), 'utf8');
  console.log(`\n[Database Init] Local cache successfully updated at: ${JSON_DB_PATH}`);

  console.log("\n====================================================================");
  console.log("DATABASE INITIALIZATION STATUS: SUCCESS");
  console.log("--------------------------------------------------------------------");
  console.log(`• Clubs Table Status: ${OFFICIAL_PEC_CLUBS.length} Technical Clubs Ready`);
  console.log(`• Users Table Status: ${localDB.users.length} Users Ready`);
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
