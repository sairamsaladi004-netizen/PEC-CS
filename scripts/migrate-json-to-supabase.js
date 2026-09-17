/**
 * Pragati Engineering College (PEC Autonomous) - CampusTech
 * Database Migration Script: JSON (data/pec_database.json) -> Supabase PostgreSQL
 *
 * Usage:
 *   node scripts/migrate-json-to-supabase.js [--dry-run] [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_DB_PATH = path.join(__dirname, '../data/pec_database.json');

const isDryRun = process.argv.includes('--dry-run');
const isVerbose = process.argv.includes('--verbose');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log("====================================================================");
console.log("PEC CampusTech - JSON to Supabase Database Migration Tool");
console.log("====================================================================");

if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: Missing Supabase credentials.");
  console.error("Please ensure SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) are set.");
  console.error("Example:");
  console.error("  SUPABASE_URL=https://xyz.supabase.co SUPABASE_ANON_KEY=ey... node scripts/migrate-json-to-supabase.js");
  process.exit(1);
}

if (!fs.existsSync(JSON_DB_PATH)) {
  console.error(`ERROR: Source database file not found at: ${JSON_DB_PATH}`);
  process.exit(1);
}

const rawData = fs.readFileSync(JSON_DB_PATH, 'utf8');
let jsonDB;
try {
  jsonDB = JSON.parse(rawData);
} catch (err) {
  console.error("ERROR: Failed to parse JSON database:", err.message);
  process.exit(1);
}

console.log(`Loaded JSON database from: ${JSON_DB_PATH}`);
console.log(`Connecting to Supabase at: ${supabaseUrl}`);
if (isDryRun) {
  console.log("DRY RUN MODE ENABLED: No database writes will be executed.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const report = {
  departments: { read: 0, inserted: 0, errors: 0 },
  users: { read: 0, inserted: 0, errors: 0 },
  clubs: { read: 0, inserted: 0, errors: 0 },
  club_memberships: { read: 0, inserted: 0, errors: 0 },
  club_roles: { read: 0, inserted: 0, errors: 0 },
  events: { read: 0, inserted: 0, errors: 0 },
  event_registrations: { read: 0, inserted: 0, errors: 0 },
  attendance: { read: 0, inserted: 0, errors: 0 },
  certificates: { read: 0, inserted: 0, errors: 0 },
  announcements: { read: 0, inserted: 0, errors: 0 },
  notifications: { read: 0, inserted: 0, errors: 0 },
  resources: { read: 0, inserted: 0, errors: 0 },
  projects: { read: 0, inserted: 0, errors: 0 },
  activity_reports: { read: 0, inserted: 0, errors: 0 },
  feedback: { read: 0, inserted: 0, errors: 0 },
  audit_logs: { read: 0, inserted: 0, errors: 0 },
  intelligence_config: { read: 0, inserted: 0, errors: 0 }
};

// Generic batch upsert helper
async function upsertTable(tableName, records, transformFn, primaryKey = 'id') {
  if (!records || !Array.isArray(records) || records.length === 0) {
    if (isVerbose) console.log(`[${tableName}] No records found to migrate.`);
    return;
  }

  report[tableName].read = records.length;
  const transformed = records.map(transformFn).filter(Boolean);

  if (isDryRun) {
    console.log(`[DRY-RUN] Would upsert ${transformed.length} records into '${tableName}'`);
    report[tableName].inserted = transformed.length;
    return;
  }

  console.log(`[MIGRATING] '${tableName}' (${transformed.length} records)...`);

  // Batch in chunks of 50 to prevent payload limits
  const CHUNK_SIZE = 50;
  for (let i = 0; i < transformed.length; i += CHUNK_SIZE) {
    const chunk = transformed.slice(i, i + CHUNK_SIZE);
    const { data, error } = await supabase
      .from(tableName)
      .upsert(chunk, { onConflict: primaryKey });

    if (error) {
      console.error(`  [ERROR] Upserting chunk into '${tableName}':`, error.message);
      report[tableName].errors += chunk.length;
    } else {
      report[tableName].inserted += chunk.length;
      if (isVerbose) console.log(`  [OK] Batch ${i + 1}-${i + chunk.length} inserted into '${tableName}'`);
    }
  }
}

async function runMigration() {
  const startTime = Date.now();

  try {
    // 1. Departments (Root)
    await upsertTable('departments', jsonDB.departments || [], (d) => ({
      code: d.code,
      name: d.name
    }), 'code');

    // 2. Users (Profiles)
    await upsertTable('users', jsonDB.users || [], (u) => ({
      id: u.id,
      name: u.name || 'Unnamed User',
      roll_no: u.rollNo || u.roll_no || null,
      faculty_id: u.facultyId || u.faculty_id || null,
      email: (u.email || `${u.id}@pragati.ac.in`).toLowerCase(),
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
      skills: Array.isArray(u.skills) ? u.skills : (u.skills ? [u.skills] : []),
      interests: Array.isArray(u.interests) ? u.interests : (u.interests ? [u.interests] : []),
      bio: u.bio || null,
      badges: Array.isArray(u.badges) ? u.badges : [],
      salt: u.salt || null,
      password_hash: u.passwordHash || u.password_hash || null,
      email_verified: !!u.emailVerified,
      membership_id: u.membershipId || u.membership_id || null,
      valid_until: u.validUntil || u.valid_until || null,
      designation: u.designation || null,
      is_demo: !!u.isDemo
    }), 'id');

    // 3. Clubs (35 Official PEC Clubs)
    await upsertTable('clubs', jsonDB.clubs || [], (c) => ({
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
      active_members: c.activeMembers || c.active_members || 0,
      meeting_schedule: c.meetingSchedule || c.meeting_schedule || null,
      venue: c.venue || null,
      banner: c.banner || null,
      logo: c.logo || null,
      tags: Array.isArray(c.tags) ? c.tags : [],
      status: c.status || 'Active'
    }), 'id');

    // 4. Club Memberships
    await upsertTable('club_memberships', jsonDB.club_memberships || [], (m) => ({
      id: m.id,
      membership_id: m.membership_id || m.membershipId || null,
      student_id: m.student_id || m.studentId,
      club_id: m.club_id || m.clubId,
      role: m.role || 'Member',
      status: m.status || 'Approved',
      statement: m.statement || null,
      requested_at: m.requested_at || m.requestedAt || new Date().toISOString(),
      approved_at: m.approved_at || m.approvedAt || null,
      approved_by: m.approved_by || m.approvedBy || null,
      remarks: m.remarks || null
    }), 'id');

    // 5. Club Roles
    await upsertTable('club_roles', jsonDB.club_roles || [], (r) => ({
      id: r.id || `crole-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      club_id: r.club_id || r.clubId,
      student_id: r.student_id || r.studentId,
      role_title: r.role_title || r.roleTitle || 'Core Member',
      assigned_by: r.assigned_by || r.assignedBy || null,
      assigned_at: r.assigned_at || r.assignedAt || new Date().toISOString()
    }), 'id');

    // 6. Events
    await upsertTable('events', jsonDB.events || [], (e) => ({
      id: e.id,
      title: e.title || e.name,
      name: e.name || e.title,
      category: e.category || 'Workshop',
      event_type: e.event_type || e.eventType || e.category || 'Workshop',
      club_id: e.club_id || e.clubId,
      date: e.date,
      start_time: e.start_time || e.startTime || null,
      end_time: e.end_time || e.endTime || null,
      time: e.time || `${e.start_time || ''} - ${e.end_time || ''}`,
      venue: e.venue || 'PEC Campus',
      max_participants: e.max_participants || e.capacity || 100,
      capacity: e.capacity || e.max_participants || 100,
      registered_count: e.registeredCount || e.registered_count || 0,
      registration_deadline: e.registration_deadline || e.registrationDeadline || null,
      status: e.status || 'Upcoming',
      banner: e.banner || null,
      description: e.description || null,
      rules: Array.isArray(e.rules) ? e.rules : [],
      tags: Array.isArray(e.tags) ? e.tags : [],
      created_by: e.created_by || e.createdBy || null,
      active_qr_token: e.active_qr_token || null,
      qr_token_expiry: e.qr_token_expiry || null
    }), 'id');

    // 7. Event Registrations
    await upsertTable('event_registrations', jsonDB.event_registrations || [], (r) => ({
      id: r.id,
      event_id: r.event_id || r.eventId,
      student_id: r.student_id || r.studentId,
      ticket_id: r.ticket_id || r.ticketId || `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      registered_at: r.registered_at || r.registeredAt || new Date().toISOString(),
      status: r.status || 'Confirmed'
    }), 'id');

    // 8. Attendance
    await upsertTable('attendance', jsonDB.attendance || [], (a) => ({
      id: a.id,
      attendance_id: a.attendance_id || a.attendanceId || null,
      event_id: a.event_id || a.eventId,
      student_id: a.student_id || a.studentId,
      timestamp: a.timestamp || new Date().toISOString(),
      status: a.status || 'Present',
      verification_method: a.verification_method || a.verificationMethod || 'QR Scan'
    }), 'id');

    // 9. Certificates
    await upsertTable('certificates', jsonDB.certificates || [], (c) => ({
      id: c.id || c.certificateId || c.certificate_id,
      certificate_id: c.certificate_id || c.certificateId || c.id,
      student_id: c.student_id || c.studentId,
      student_name: c.student_name || c.studentName || c.recipientName || 'Student',
      roll_no: c.roll_no || c.rollNo || c.recipientRoll || null,
      department: c.department || null,
      event_id: c.event_id || c.eventId || null,
      event_name: c.event_name || c.eventName || 'Technical Event',
      club_id: c.club_id || c.clubId || null,
      club_name: c.club_name || c.clubName || 'Official PEC Club',
      date: c.date || c.issued_date || c.issueDate || '2026-09-02',
      award_type: c.award_type || c.awardType || c.certificate_type || 'Certificate of Participation',
      issued_date: c.issued_date || c.issueDate || '2026-09-02',
      institution: c.institution || 'Pragati University / Pragati Engineering College (Autonomous)',
      issued_by: c.issued_by || 'Pragati University Central Council of Technical Societies (CCTSC)',
      recipient_email: c.recipient_email || c.recipientEmail || null,
      authorized_signature: c.authorized_signature || 'Authorized Signatory',
      qr_hash: c.qr_hash || c.qrHash || c.verificationHash || 'sha256:verified'
    }), 'id');

    // 10. Announcements
    await upsertTable('announcements', jsonDB.announcements || [], (a) => ({
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
    }), 'id');

    // 11. Notifications
    await upsertTable('notifications', jsonDB.notifications || [], (n) => ({
      id: n.id,
      user_id: n.user_id || n.userId || 'all',
      title: n.title,
      message: n.message,
      category: n.category || 'General',
      link: n.link || null,
      read: !!n.read
    }), 'id');

    // 12. Resources
    await upsertTable('resources', jsonDB.resources || [], (r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      club_id: r.club_id || r.clubId,
      category: r.category || 'Tutorial',
      uploaded_by: r.uploaded_by || r.uploadedBy || 'Coordinator',
      upload_date: r.upload_date || r.uploadDate || '2026-09-01',
      file_url: r.file_url || r.fileUrl || '',
      target_semester: r.target_semester || r.targetSemester || null
    }), 'id');

    // 13. Projects
    await upsertTable('projects', jsonDB.projects || [], (p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      problem_statement: p.problem_statement || p.problemStatement || null,
      solution: p.solution || null,
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
      team_members: Array.isArray(p.team_members) ? p.team_members : (p.teamMembers || []),
      mentor: p.mentor || null,
      github_link: p.github_link || p.githubLink || null,
      demo_link: p.demo_link || p.demoLink || null,
      images: Array.isArray(p.images) ? p.images : [],
      status: p.status || 'Completed',
      club_id: p.club_id || p.clubId,
      year: p.year || '2025-2026'
    }), 'id');

    // 14. Activity Reports
    await upsertTable('activity_reports', jsonDB.activity_reports || [], (ar) => ({
      id: ar.id,
      activity_title: ar.activity_title || ar.activityTitle,
      date: ar.date,
      club_id: ar.club_id || ar.clubId,
      description: ar.description,
      participants_count: ar.participants_count || ar.participantsCount || 0,
      report_file_url: ar.report_file_url || ar.reportFileUrl || null,
      photos: Array.isArray(ar.photos) ? ar.photos : [],
      created_by: ar.created_by || ar.createdBy,
      official_url: ar.official_url || ar.officialUrl || null
    }), 'id');

    // 15. Feedback
    await upsertTable('feedback', jsonDB.feedback || [], (f) => ({
      id: f.id,
      event_id: f.event_id || f.eventId,
      student_id: f.student_id || f.studentId,
      content_rating: f.content_rating || f.contentRating || 5,
      organization_rating: f.organization_rating || f.organizationRating || 5,
      speaker_rating: f.speaker_rating || f.speakerRating || 5,
      venue_rating: f.venue_rating || f.venueRating || 5,
      overall_rating: f.overall_rating || f.overallRating || 5,
      written_feedback: f.written_feedback || f.writtenFeedback || null,
      submitted_at: f.submitted_at || f.submittedAt || new Date().toISOString()
    }), 'id');

    // 16. Audit Logs
    await upsertTable('audit_logs', jsonDB.audit_logs || [], (l) => ({
      id: l.id,
      timestamp: l.timestamp || new Date().toISOString(),
      user_id: l.user_id || null,
      user_role: l.user_role || null,
      user_name: l.user_name || null,
      actor: l.actor || l.user || 'System',
      user_display: l.user || l.actor || 'System',
      action: l.action || 'SYSTEM_ACTION',
      resource: l.resource || 'system',
      resource_id: l.resource_id || null,
      affected_record: l.affected_record || null,
      ip_address: l.ip_address || '127.0.0.1',
      old_value: l.old_value !== undefined ? l.old_value : null,
      new_value: l.new_value !== undefined ? l.new_value : null,
      details: l.details || ''
    }), 'id');

    // 17. Intelligence Config
    await upsertTable('intelligence_config', jsonDB.intelligence_config || [
      { id: "cfg-1", key: "inactive_event_days", value: 60, description: "Days without event attendance before flag" },
      { id: "cfg-2", key: "inactive_activity_days", value: 45, description: "Days without general activity before flag" },
      { id: "cfg-3", key: "inactive_project_days", value: 90, description: "Days without project participation before flag" }
    ], (c) => ({
      id: c.id,
      key: c.key,
      value: c.value,
      description: c.description
    }), 'id');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("====================================================================");
    console.log(`MIGRATION FINISHED in ${duration}s`);
    console.log("====================================================================");
    console.table(report);

  } catch (err) {
    console.error("CRITICAL MIGRATION ERROR:", err);
    process.exit(1);
  }
}

runMigration();
