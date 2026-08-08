/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getCredentials = () => {
  const env = (import.meta as any).env || {};
  const url = env.VITE_SUPABASE_URL || localStorage.getItem('vocal_vantage_supabase_url') || '';
  const key = env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('vocal_vantage_supabase_key') || '';
  return { url: url.trim(), key: key.trim() };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getCredentials();
  return Boolean(url && url.length > 0 && url.startsWith('http') && key && key.length > 0);
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { url, key } = getCredentials();
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
};

export const setSupabaseCredentials = (url: string, key: string) => {
  if (url && key) {
    localStorage.setItem('vocal_vantage_supabase_url', url.trim());
    localStorage.setItem('vocal_vantage_supabase_key', key.trim());
    const credentials = getCredentials();
    supabaseInstance = createClient(credentials.url, credentials.key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
};

export const SUPABASE_SETUP_SQL = `-- Vocal Vantage Supabase Database Setup Script
-- Paste and run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_code TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor')),
  email TEXT,
  instructor_name TEXT,
  course_program TEXT,
  accent_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  student_id_code TEXT NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  assigned_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  due_date_time_ms BIGINT,
  image_url TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id_code TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  file_type TEXT NOT NULL,
  submission_date TEXT NOT NULL,
  data_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) and Create Access Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public Insert Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public Update Profiles" ON public.profiles;
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Read Assignments" ON public.assignments;
DROP POLICY IF EXISTS "Public Insert Assignments" ON public.assignments;
DROP POLICY IF EXISTS "Public Update Assignments" ON public.assignments;
DROP POLICY IF EXISTS "Public Delete Assignments" ON public.assignments;
CREATE POLICY "Public Read Assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Public Insert Assignments" ON public.assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Assignments" ON public.assignments FOR UPDATE USING (true);
CREATE POLICY "Public Delete Assignments" ON public.assignments FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public Read Submissions" ON public.submissions;
DROP POLICY IF EXISTS "Public Insert Submissions" ON public.submissions;
DROP POLICY IF EXISTS "Public Update Submissions" ON public.submissions;
CREATE POLICY "Public Read Submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Public Insert Submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Submissions" ON public.submissions FOR UPDATE USING (true);

-- 5. Seed Default User Credentials
INSERT INTO public.profiles (user_id_code, password, name, role, email, instructor_name, course_program, accent_type)
VALUES 
  ('625H', '162111', 'Abdul REHMAN', 'student', 'abdulrehman@vocalvantage.edu', 'Mr. Abdulleh Hashmi', 'American Accent Program', 'American Accent'),
  ('123123', '1122', 'Mr. Abdulleh Hashmi', 'instructor', 'abdulleh.hashmi@vocalvantage.edu', 'Self', 'American Accent Program', 'American Accent')
ON CONFLICT (user_id_code) DO NOTHING;
`;
