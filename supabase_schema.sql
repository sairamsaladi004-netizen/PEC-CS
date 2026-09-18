-- ====================================================================
-- Pragati Engineering College (PEC Autonomous) - CampusTech Portal
-- Supabase PostgreSQL Relational Schema & Realtime Setup Script
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  roll_no TEXT,
  faculty_id TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Student',
  department TEXT,
  year TEXT,
  section TEXT,
  semester TEXT,
  cgpa TEXT,
  phone TEXT,
  avatar TEXT,
  bio TEXT,
  membership_id TEXT,
  skills TEXT[],
  interests TEXT[],
  badges TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. OFFICIAL CLUBS TABLE
CREATE TABLE IF NOT EXISTS public.clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  category TEXT,
  department TEXT,
  faculty_coordinator TEXT,
  description TEXT,
  logo TEXT,
  banner TEXT,
  status TEXT DEFAULT 'Active',
  member_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLUB MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.club_memberships (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  membership_id TEXT UNIQUE,
  student_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  club_id TEXT REFERENCES public.clubs(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member',
  status TEXT DEFAULT 'Pending',
  remarks TEXT,
  approved_by TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- 4. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Workshop',
  event_type TEXT,
  club_id TEXT REFERENCES public.clubs(id) ON DELETE CASCADE,
  date DATE,
  start_time TEXT,
  end_time TEXT,
  venue TEXT,
  capacity INT DEFAULT 100,
  registered_count INT DEFAULT 0,
  registration_deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'Upcoming',
  banner TEXT,
  description TEXT,
  rules TEXT[],
  tags TEXT[],
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENT REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  ticket_id TEXT UNIQUE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Confirmed'
);

-- 6. ATTENDANCE SCAN LOGS TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  attendance_id TEXT UNIQUE,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  verification_method TEXT DEFAULT 'QR Scan',
  status TEXT DEFAULT 'Present',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACCREDITED CERTIFICATES LEDGER
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  certificate_id TEXT UNIQUE,
  student_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  roll_no TEXT,
  department TEXT,
  event_id TEXT,
  event_name TEXT NOT NULL,
  club_id TEXT,
  award_type TEXT,
  issued_date DATE DEFAULT CURRENT_DATE,
  issued_by TEXT,
  qr_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ANNOUNCEMENTS & CIRCULARS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT DEFAULT 'All Students',
  priority TEXT DEFAULT 'normal',
  attachment_url TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  pinned BOOLEAN DEFAULT FALSE
);

-- 9. PROJECTS & INNOVATION SHOWCASE TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  problem_statement TEXT,
  solution TEXT,
  technologies TEXT[],
  team_members TEXT[],
  team_leader TEXT,
  faculty_mentor TEXT,
  github_link TEXT,
  demo_link TEXT,
  images TEXT[],
  status TEXT DEFAULT 'Pending',
  club_id TEXT REFERENCES public.clubs(id),
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for live updates across browser sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.certificates;
