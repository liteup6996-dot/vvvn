-- ==============================================================================
-- VOCAL VANTAGE CENTRALIZED DATABASE SETUP (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Run these commands in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- This sets up centralized authentication, student profiles, homework tasks,
-- submissions, and learning resources across all devices in real-time.
-- ==============================================================================

-- 1. PROFILES TABLE (Students & Instructors)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_code TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
  instructor_name TEXT,
  course_program TEXT,
  accent_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS & Allow public/authenticated read & write
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read access" ON profiles;
CREATE POLICY "Public profiles read access" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public profiles write access" ON profiles;
CREATE POLICY "Public profiles write access" ON profiles FOR ALL USING (true);

-- 2. ASSIGNMENTS TABLE (Homework Tasks)
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  student_id_code TEXT NOT NULL, -- 'VV-LC-7K42', '625H', 'ALL', etc.
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  assigned_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  due_date_time_ms BIGINT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Submitted', 'Closed'
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public assignments read access" ON assignments;
CREATE POLICY "Public assignments read access" ON assignments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public assignments write access" ON assignments;
CREATE POLICY "Public assignments write access" ON assignments FOR ALL USING (true);

-- 3. SUBMISSIONS TABLE (Homework Submissions)
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id_code TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  file_type TEXT NOT NULL,
  submission_date TEXT NOT NULL,
  data_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public submissions read access" ON submissions;
CREATE POLICY "Public submissions read access" ON submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public submissions write access" ON submissions;
CREATE POLICY "Public submissions write access" ON submissions FOR ALL USING (true);

-- 4. RESOURCES TABLE (Study Materials & Lecture Guides)
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  student_id_code TEXT NOT NULL DEFAULT 'ALL',
  target_student_name TEXT,
  instructor_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Phonetics & Pronunciation',
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  file_name TEXT,
  file_size TEXT,
  file_type TEXT,
  data_url TEXT,
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public resources read access" ON resources;
CREATE POLICY "Public resources read access" ON resources FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public resources write access" ON resources FOR ALL USING (true);

-- ==============================================================================
-- SEED DATA: HARIS AHMED, MISS MAHEEN, ABDUL REHMAN
-- ==============================================================================

-- A. Insert Student: Haris Ahmed (Login ID: 190132, Password: 2989)
INSERT INTO profiles (user_id_code, password, name, email, role, instructor_name, course_program, accent_type)
VALUES (
  '190132',
  '2989',
  'Haris Ahmed',
  'haris.ahmed@vocalvantage.online',
  'student',
  'Miss Maheen',
  'Core Language Program',
  'Core Language'
)
ON CONFLICT (user_id_code) 
DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  instructor_name = EXCLUDED.instructor_name,
  course_program = EXCLUDED.course_program,
  accent_type = EXCLUDED.accent_type;

-- Also register by Student ID code (VV-LC-7K42) so both login formats work:
INSERT INTO profiles (user_id_code, password, name, email, role, instructor_name, course_program, accent_type)
VALUES (
  'VV-LC-7K42',
  '2989',
  'Haris Ahmed',
  'haris.ahmed@vocalvantage.online',
  'student',
  'Miss Maheen',
  'Core Language Program',
  'Core Language'
)
ON CONFLICT (user_id_code) 
DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  instructor_name = EXCLUDED.instructor_name,
  course_program = EXCLUDED.course_program,
  accent_type = EXCLUDED.accent_type;

-- B. Insert Instructor: Miss Maheen
INSERT INTO profiles (user_id_code, password, name, email, role)
VALUES (
  'MAHEEN',
  '1122',
  'Miss Maheen',
  'miss.maheen@vocalvantage.online',
  'instructor'
)
ON CONFLICT (user_id_code) 
DO UPDATE SET 
  name = EXCLUDED.name,
  password = EXCLUDED.password;

-- Also keep backward compatibility for MAHA & 123123:
INSERT INTO profiles (user_id_code, password, name, email, role)
VALUES (
  'MAHA',
  '1122',
  'Miss Maheen',
  'miss.maheen@vocalvantage.online',
  'instructor'
)
ON CONFLICT (user_id_code) 
DO UPDATE SET 
  name = EXCLUDED.name,
  password = EXCLUDED.password;

INSERT INTO profiles (user_id_code, password, name, email, role)
VALUES (
  '123123',
  '1122',
  'Miss Maheen',
  'miss.maheen@vocalvantage.online',
  'instructor'
)
ON CONFLICT (user_id_code) 
DO UPDATE SET 
  name = EXCLUDED.name,
  password = EXCLUDED.password;

-- C. Insert Student: Abdul REHMAN (625H / 162111)
INSERT INTO profiles (user_id_code, password, name, email, role, instructor_name, course_program, accent_type)
VALUES (
  '625H',
  '162111',
  'Abdul REHMAN',
  'abdul.rehman@vocalvantage.online',
  'student',
  'Miss Maheen',
  'Core Language Program',
  'Core Language'
)
ON CONFLICT (user_id_code) 
DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  instructor_name = EXCLUDED.instructor_name;

-- D. Insert Student: Hafsa Ghumman (690H / 162123)
INSERT INTO profiles (user_id_code, password, name, email, role, instructor_name, course_program, accent_type)
VALUES (
  '690H',
  '162123',
  'Hafsa Ghumman',
  'hafsa.ghumman@vocalvantage.online',
  'student',
  'Mr. Hash',
  'American Accent Program',
  'American Accent'
)
ON CONFLICT (user_id_code) 
DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name;

-- E. Optional: Seed Initial Homework Task for Haris Ahmed (VV-LC-7K42)
INSERT INTO assignments (id, student_id_code, title, instructions, assigned_date, due_date, status)
VALUES (
  'asg-haris-01',
  'VV-LC-7K42',
  'Core Articulation & Vowel Distinction Drill',
  'Record a 60-second audio sample reading the provided phonetic word list focusing on clear plosive release and open vowels. Submit your audio file or written phonetics worksheet here.',
  '24 October 2026',
  '31 October 2026 at 23:59',
  'Pending'
)
ON CONFLICT (id) DO NOTHING;
