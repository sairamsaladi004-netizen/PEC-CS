-- ====================================================================
-- Pragati Engineering College (PEC Autonomous) - CampusTech
-- Supabase PostgreSQL Relational Database Schema & Security Layer
-- Migration: 001_initial_schema.sql
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. Core Campus Structure & Academic Departments
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.departments (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 3. Users & Institutional Profiles (Students, Faculty, Club Admins, Super Admins)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  roll_no TEXT UNIQUE,
  faculty_id TEXT,
  email TEXT UNIQUE NOT NULL,
  demo_alias TEXT,
  role TEXT NOT NULL DEFAULT 'Student' CHECK (role IN ('Student', 'Club Admin', 'Faculty Coordinator', 'Super Admin', 'Guest')),
  student_leader_role TEXT,
  club_id TEXT,
  assigned_clubs JSONB NOT NULL DEFAULT '[]'::jsonb,
  department TEXT REFERENCES public.departments(code) ON UPDATE CASCADE ON DELETE SET NULL,
  year TEXT,
  section TEXT,
  semester TEXT,
  cgpa TEXT,
  phone TEXT,
  avatar TEXT,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  bio TEXT,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  salt TEXT,
  password_hash TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  membership_id TEXT,
  valid_until TEXT,
  designation TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index frequently queried columns on users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_roll_no ON public.users(roll_no);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

-- Optional compatibility view for profile access
CREATE OR REPLACE VIEW public.profiles AS
  SELECT 
    id, auth_user_id, name, roll_no, faculty_id, email, role,
    student_leader_role, club_id, assigned_clubs, department,
    year, section, semester, cgpa, phone, avatar, skills, interests,
    bio, badges, membership_id, valid_until, designation, is_demo,
    created_at, updated_at
  FROM public.users;

-- ====================================================================
-- 4. Technical Societies & Clubs (35 Chartered PEC Clubs)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.clubs (
  id TEXT PRIMARY KEY, -- e.g. 'I4-08'
  code TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Industry 4.0', 'Co-Curricular', 'Extra-Curricular')),
  department TEXT REFERENCES public.departments(code) ON UPDATE CASCADE ON DELETE SET NULL,
  description TEXT,
  objective TEXT,
  faculty_coordinator TEXT,
  faculty_coordinator_phone TEXT,
  faculty_coordinator_email TEXT,
  student_coordinator TEXT,
  student_coordinator_roll TEXT,
  student_coordinator_phone TEXT,
  established_year INT DEFAULT 2024,
  active_members INT DEFAULT 0,
  meeting_schedule TEXT,
  venue TEXT,
  banner TEXT,
  logo TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Chartered', 'Probation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clubs_category ON public.clubs(category);
CREATE INDEX IF NOT EXISTS idx_clubs_department ON public.clubs(department);

-- ====================================================================
-- 5. Club Memberships (Student Applications & Approved Rosters)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.club_memberships (
  id TEXT PRIMARY KEY,
  membership_id TEXT,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON UPDATE CASCADE ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Member', 'Core Team', 'Lead', 'President', 'Vice President', 'Secretary', 'Treasurer')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Suspended')),
  statement TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_club UNIQUE (student_id, club_id)
);

CREATE INDEX IF NOT EXISTS idx_club_memberships_student ON public.club_memberships(student_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_club ON public.club_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_status ON public.club_memberships(status);

-- ====================================================================
-- 6. Club Leadership Roles
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.club_roles (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON UPDATE CASCADE ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  assigned_by TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_club_roles_club ON public.club_roles(club_id);

-- ====================================================================
-- 7. Events (Symposiums, Workshops, Hackathons, Guest Lectures)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  name TEXT,
  category TEXT NOT NULL,
  event_type TEXT,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON UPDATE CASCADE ON DELETE CASCADE,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  time TEXT,
  venue TEXT NOT NULL,
  max_participants INT NOT NULL DEFAULT 100,
  capacity INT NOT NULL DEFAULT 100,
  registered_count INT NOT NULL DEFAULT 0,
  registration_deadline TEXT,
  status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
  banner TEXT,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by TEXT,
  active_qr_token TEXT,
  qr_token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_club_id ON public.events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- ====================================================================
-- 8. Event Registrations (Student Passports & Digital Tickets)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  ticket_id TEXT UNIQUE NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Cancelled', 'Waitlist')),
  CONSTRAINT uq_event_student UNIQUE (event_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_student ON public.event_registrations(student_id);

-- ====================================================================
-- 9. Attendance Logs (Dynamic QR & Offline Scans)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  attendance_id TEXT UNIQUE,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Excused')),
  verification_method TEXT NOT NULL DEFAULT 'QR Scan' CHECK (verification_method IN ('QR Scan', 'Manual', 'Offline Sync')),
  CONSTRAINT uq_event_attendance UNIQUE (event_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);

-- ====================================================================
-- 10. Digital Certificates & Cryptographic Verification
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  certificate_id TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  roll_no TEXT,
  department TEXT,
  event_id TEXT REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  club_id TEXT REFERENCES public.clubs(id) ON UPDATE CASCADE ON DELETE SET NULL,
  club_name TEXT NOT NULL,
  date TEXT,
  award_type TEXT NOT NULL DEFAULT 'Certificate of Participation',
  issued_date TEXT NOT NULL,
  institution TEXT NOT NULL DEFAULT 'Pragati University / Pragati Engineering College (Autonomous)',
  issued_by TEXT NOT NULL DEFAULT 'Pragati University Central Council of Technical Societies (CCTSC)',
  recipient_email TEXT,
  authorized_signature TEXT NOT NULL,
  qr_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_qr_hash ON public.certificates(qr_hash);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON public.certificates(certificate_id);

-- ====================================================================
-- 11. Announcements & Circulars
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'All Students',
  target_id TEXT NOT NULL DEFAULT 'all',
  attachment_url TEXT,
  created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL,
  expiry_date TEXT,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON public.announcements(pinned);

-- ====================================================================
-- 12. Real-Time Student & Faculty Notifications
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- ====================================================================
-- 13. Learning Resources & Workshop Materials
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON UPDATE CASCADE ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Tutorial',
  uploaded_by TEXT NOT NULL,
  upload_date TEXT NOT NULL,
  file_url TEXT NOT NULL,
  target_semester TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_club ON public.resources(club_id);

-- ====================================================================
-- 14. Projects & Innovation Showcases
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_statement TEXT,
  solution TEXT,
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
  team_members JSONB NOT NULL DEFAULT '[]'::jsonb,
  mentor TEXT,
  github_link TEXT,
  demo_link TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Ongoing', 'Completed', 'Archived')),
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON UPDATE CASCADE ON DELETE CASCADE,
  year TEXT DEFAULT '2025-2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_club ON public.projects(club_id);

-- ====================================================================
-- 15. Activity & Accreditation Reports (NAAC / NBA Evidence)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.activity_reports (
  id TEXT PRIMARY KEY,
  activity_title TEXT NOT NULL,
  date TEXT NOT NULL,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON UPDATE CASCADE ON DELETE CASCADE,
  description TEXT NOT NULL,
  participants_count INT NOT NULL DEFAULT 0,
  report_file_url TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by TEXT NOT NULL,
  official_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_reports_club ON public.activity_reports(club_id);

-- ====================================================================
-- 16. Event Feedback & Quality Surveys
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  content_rating INT CHECK (content_rating BETWEEN 1 AND 5),
  organization_rating INT CHECK (organization_rating BETWEEN 1 AND 5),
  speaker_rating INT CHECK (speaker_rating BETWEEN 1 AND 5),
  venue_rating INT CHECK (venue_rating BETWEEN 1 AND 5),
  overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
  written_feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_feedback_event_student UNIQUE (event_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_event ON public.feedback(event_id);

-- ====================================================================
-- 17. Security Audit Trail (Strict Non-Repudiation)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  user_id TEXT,
  user_role TEXT,
  user_name TEXT,
  actor TEXT,
  user_display TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  affected_record TEXT,
  ip_address TEXT DEFAULT '127.0.0.1',
  old_value JSONB,
  new_value JSONB,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ====================================================================
-- 18. Intelligence Engine Collections
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.intelligence_config (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id TEXT PRIMARY KEY,
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  average_engagement_score NUMERIC,
  total_clubs_evaluated INT,
  total_inactive_members_detected INT,
  comparison JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 19. Helper Functions for Role-Based Row Level Security
-- ====================================================================

CREATE OR REPLACE FUNCTION public.get_auth_user()
RETURNS public.users AS $$
  SELECT * FROM public.users
  WHERE auth_user_id = auth.uid() OR id = auth.uid()::text
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE auth_user_id = auth.uid() OR id = auth.uid()::text LIMIT 1),
    'Guest'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT id FROM public.users WHERE auth_user_id = auth.uid() OR id = auth.uid()::text LIMIT 1),
    auth.uid()::text
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_coordinator()
RETURNS BOOLEAN AS $$
  SELECT public.get_auth_role() IN ('Super Admin', 'Faculty Coordinator');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_auth_role() = 'Super Admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ====================================================================
-- 20. Supabase Auth Automatic Profile Creation Trigger
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    auth_user_id,
    email,
    name,
    role,
    avatar,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id::text,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    auth_user_id = EXCLUDED.auth_user_id,
    email_verified = CASE WHEN EXCLUDED.email_verified THEN TRUE ELSE public.users.email_verified END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ====================================================================
-- 21. Row Level Security (RLS) Policies
-- ====================================================================

-- Enable RLS across all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- Departments Policies
-- --------------------------------------------------------------------
CREATE POLICY "Anyone can read departments"
  ON public.departments FOR SELECT
  USING (true);

CREATE POLICY "Super Admins can manage departments"
  ON public.departments FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- --------------------------------------------------------------------
-- Users / Profiles Policies
-- --------------------------------------------------------------------
CREATE POLICY "Anyone can view basic public profile info"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND 
    (auth_user_id = auth.uid() OR id = auth.uid()::text)
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (auth_user_id = auth.uid() OR id = auth.uid()::text)
  );

CREATE POLICY "Super Admins can manage all user profiles"
  ON public.users FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- --------------------------------------------------------------------
-- Clubs Policies
-- --------------------------------------------------------------------
CREATE POLICY "Public can view active clubs"
  ON public.clubs FOR SELECT
  USING (true);

CREATE POLICY "Coordinators and Admins can update their clubs"
  ON public.clubs FOR UPDATE
  USING (
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  )
  WITH CHECK (
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  );

CREATE POLICY "Super Admins can insert or delete clubs"
  ON public.clubs FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- --------------------------------------------------------------------
-- Club Memberships Policies
-- --------------------------------------------------------------------
CREATE POLICY "Users can view memberships for permitted scope"
  ON public.club_memberships FOR SELECT
  USING (
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin' OR
    student_id = public.get_auth_user_id()
  );

CREATE POLICY "Students can submit own membership requests"
  ON public.club_memberships FOR INSERT
  WITH CHECK (
    student_id = public.get_auth_user_id()
  );

CREATE POLICY "Authorized personnel can update membership status"
  ON public.club_memberships FOR UPDATE
  USING (
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  )
  WITH CHECK (
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  );

-- --------------------------------------------------------------------
-- Events Policies
-- --------------------------------------------------------------------
CREATE POLICY "Public can view published events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Authorized coordinators and admins can manage events"
  ON public.events FOR ALL
  USING (
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  )
  WITH CHECK (
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  );

-- --------------------------------------------------------------------
-- Event Registrations Policies
-- --------------------------------------------------------------------
CREATE POLICY "Students view own registrations; Organizers view event registrations"
  ON public.event_registrations FOR SELECT
  USING (
    student_id = public.get_auth_user_id() OR
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  );

CREATE POLICY "Students can register themselves for events"
  ON public.event_registrations FOR INSERT
  WITH CHECK (
    student_id = public.get_auth_user_id()
  );

CREATE POLICY "Students can cancel own registration; Organizers can update status"
  ON public.event_registrations FOR UPDATE
  USING (
    student_id = public.get_auth_user_id() OR
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  )
  WITH CHECK (
    student_id = public.get_auth_user_id() OR
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  );

-- --------------------------------------------------------------------
-- Attendance Policies
-- --------------------------------------------------------------------
CREATE POLICY "Students view own attendance; Organizers view event attendance"
  ON public.attendance FOR SELECT
  USING (
    student_id = public.get_auth_user_id() OR
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  );

CREATE POLICY "Authorized personnel can mark attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  );

CREATE POLICY "Authorized personnel can modify attendance"
  ON public.attendance FOR UPDATE
  USING (
    public.is_admin_or_coordinator() OR
    public.get_auth_role() = 'Club Admin'
  );

-- --------------------------------------------------------------------
-- Certificates Policies
-- --------------------------------------------------------------------
CREATE POLICY "Anyone can verify valid certificates"
  ON public.certificates FOR SELECT
  USING (true);

CREATE POLICY "Coordinators and Super Admins can issue certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (public.is_admin_or_coordinator());

-- --------------------------------------------------------------------
-- Announcements Policies
-- --------------------------------------------------------------------
CREATE POLICY "Public can view announcements"
  ON public.announcements FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage announcements"
  ON public.announcements FOR ALL
  USING (public.is_admin_or_coordinator() OR public.get_auth_role() = 'Club Admin')
  WITH CHECK (public.is_admin_or_coordinator() OR public.get_auth_role() = 'Club Admin');

-- --------------------------------------------------------------------
-- Notifications Policies
-- --------------------------------------------------------------------
CREATE POLICY "Users can only view their own notifications or public broadcasts"
  ON public.notifications FOR SELECT
  USING (
    user_id = public.get_auth_user_id() OR
    user_id = 'all'
  );

CREATE POLICY "Users can update read status on their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = public.get_auth_user_id())
  WITH CHECK (user_id = public.get_auth_user_id());

-- --------------------------------------------------------------------
-- Resources Policies
-- --------------------------------------------------------------------
CREATE POLICY "Anyone authenticated can view resources"
  ON public.resources FOR SELECT
  USING (true);

CREATE POLICY "Admins and Coordinators can publish resources"
  ON public.resources FOR ALL
  USING (public.is_admin_or_coordinator() OR public.get_auth_role() = 'Club Admin')
  WITH CHECK (public.is_admin_or_coordinator() OR public.get_auth_role() = 'Club Admin');

-- --------------------------------------------------------------------
-- Projects Policies
-- --------------------------------------------------------------------
CREATE POLICY "Public can view approved projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Students and Admins can publish projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage projects"
  ON public.projects FOR UPDATE
  USING (public.is_admin_or_coordinator() OR public.get_auth_role() = 'Club Admin')
  WITH CHECK (public.is_admin_or_coordinator() OR public.get_auth_role() = 'Club Admin');

-- --------------------------------------------------------------------
-- Activity Reports Policies
-- --------------------------------------------------------------------
CREATE POLICY "Public can view activity reports"
  ON public.activity_reports FOR SELECT
  USING (true);

CREATE POLICY "Coordinators and Admins can manage activity reports"
  ON public.activity_reports FOR ALL
  USING (public.is_admin_or_coordinator())
  WITH CHECK (public.is_admin_or_coordinator());

-- --------------------------------------------------------------------
-- Feedback Policies
-- --------------------------------------------------------------------
CREATE POLICY "Students view own feedback; Organizers view event feedback"
  ON public.feedback FOR SELECT
  USING (
    student_id = public.get_auth_user_id() OR
    public.is_admin_or_coordinator()
  );

CREATE POLICY "Students can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (
    student_id = public.get_auth_user_id()
  );

-- --------------------------------------------------------------------
-- Audit Logs Policies (Strict Non-Repudiation)
-- --------------------------------------------------------------------
CREATE POLICY "Only Super Admins and Faculty Coordinators can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin_or_coordinator());

CREATE POLICY "Audit logs can be created by authenticated services"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- --------------------------------------------------------------------
-- Intelligence Configuration & Snapshots Policies
-- --------------------------------------------------------------------
CREATE POLICY "Anyone authenticated can view intelligence configuration"
  ON public.intelligence_config FOR SELECT
  USING (true);

CREATE POLICY "Only Super Admins can modify intelligence configuration"
  ON public.intelligence_config FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Coordinators and Super Admins can view analytics snapshots"
  ON public.analytics_snapshots FOR SELECT
  USING (public.is_admin_or_coordinator());

CREATE POLICY "System can record analytics snapshots"
  ON public.analytics_snapshots FOR INSERT
  WITH CHECK (public.is_admin_or_coordinator());
