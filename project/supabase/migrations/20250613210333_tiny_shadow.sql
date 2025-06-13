/*
# MindMatch AI Database Schema

This migration creates the complete database schema for the MindMatch AI platform including:

1. User Management Tables
   - profiles: User authentication and basic info
   - student_profiles: Student-specific data
   - company_profiles: Company-specific data

2. Job Management Tables
   - job_postings: Company job listings
   - applications: Student job applications
   - interviews: Interview scheduling and feedback

3. Wellness & Analytics Tables
   - mood_logs: Daily mood tracking
   - wellness_alerts: Mental health monitoring
   - skill_assessments: AI-powered skill analysis

4. System Tables
   - notifications: Real-time notifications
   - audit_logs: System activity tracking

All tables include Row Level Security (RLS) policies for data protection.
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'company', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  college_name TEXT NOT NULL,
  student_id TEXT,
  degree TEXT NOT NULL DEFAULT '',
  specialization TEXT DEFAULT '',
  graduation_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  cgpa DECIMAL(3,2) DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  experience_level TEXT DEFAULT 'entry' CHECK (experience_level IN ('entry', 'mid', 'senior')),
  preferred_locations TEXT[] DEFAULT '{}',
  expected_salary_min INTEGER DEFAULT 0,
  expected_salary_max INTEGER DEFAULT 0,
  job_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company profiles
CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_description TEXT DEFAULT '',
  website_url TEXT,
  industry TEXT NOT NULL DEFAULT '',
  company_size TEXT DEFAULT 'startup' CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  headquarters_location TEXT DEFAULT '',
  founded_year INTEGER,
  logo_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job postings
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  skills_required TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'entry' CHECK (experience_level IN ('entry', 'mid', 'senior')),
  job_type TEXT DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'internship', 'contract')),
  location TEXT NOT NULL,
  is_remote BOOLEAN DEFAULT FALSE,
  salary_min INTEGER DEFAULT 0,
  salary_max INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  application_deadline DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'paused')),
  benefits TEXT[] DEFAULT '{}',
  work_mode TEXT DEFAULT 'office' CHECK (work_mode IN ('office', 'remote', 'hybrid')),
  total_positions INTEGER DEFAULT 1,
  filled_positions INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'shortlisted', 'interviewed', 'selected', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  resume_url TEXT,
  application_source TEXT DEFAULT 'platform',
  ai_match_score INTEGER DEFAULT 0 CHECK (ai_match_score >= 0 AND ai_match_score <= 100),
  rejection_reason TEXT,
  feedback TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, student_id)
);

-- Interview scheduling
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  interview_type TEXT DEFAULT 'technical' CHECK (interview_type IN ('hr', 'technical', 'managerial', 'final')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  is_virtual BOOLEAN DEFAULT TRUE,
  meeting_link TEXT,
  interviewer_name TEXT,
  interviewer_email TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood logs for wellness tracking
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  confidence_level INTEGER DEFAULT 5 CHECK (confidence_level >= 1 AND confidence_level <= 10),
  notes TEXT,
  factors TEXT[] DEFAULT '{}',
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wellness alerts
CREATE TABLE IF NOT EXISTS wellness_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_mood', 'high_stress', 'declining_trend', 'no_activity')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  is_resolved BOOLEAN DEFAULT FALSE
);

-- Skill assessments
CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  assessment_type TEXT DEFAULT 'self' CHECK (assessment_type IN ('self', 'ai', 'verified')),
  certification_url TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'application', 'interview', 'wellness', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_company_id ON job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_mood_logs_student_id ON mood_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_logged_at ON mood_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_wellness_alerts_student_id ON wellness_alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Student profiles: Students can manage their own, admins can read all
CREATE POLICY "Students can manage own profile" ON student_profiles
  FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Company profiles: Companies can manage their own, admins can read all
CREATE POLICY "Companies can manage own profile" ON company_profiles
  FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Job postings: Companies can manage their own, students/admins can read published
CREATE POLICY "Companies can manage own jobs" ON job_postings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM company_profiles WHERE id = company_id AND user_id = auth.uid())
  );

CREATE POLICY "Students can read published jobs" ON job_postings
  FOR SELECT USING (
    status = 'published' AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('student', 'admin'))
  );

-- Applications: Students can manage their own, companies can read for their jobs
CREATE POLICY "Students can manage own applications" ON applications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM student_profiles WHERE id = student_id AND user_id = auth.uid())
  );

CREATE POLICY "Companies can read applications for their jobs" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_postings jp 
      JOIN company_profiles cp ON jp.company_id = cp.id 
      WHERE jp.id = job_id AND cp.user_id = auth.uid()
    )
  );

-- Mood logs: Students can manage their own, admins can read all
CREATE POLICY "Students can manage own mood logs" ON mood_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM student_profiles WHERE id = student_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Wellness alerts: Students can read their own, admins can manage all
CREATE POLICY "Students can read own wellness alerts" ON wellness_alerts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM student_profiles WHERE id = student_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage wellness alerts" ON wellness_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Notifications: Users can read their own
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON company_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();