-- ===================================================================
-- FITNEXA AI: Supabase Database Schema
-- Run this script in your Supabase SQL Editor to set up all tables.
-- ===================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.fitnexa_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL DEFAULT 'alex_default',
  name TEXT NOT NULL DEFAULT 'Alex',
  email TEXT,
  goal TEXT DEFAULT 'Build Muscle',
  fitness_level TEXT DEFAULT 'Intermediate',
  training_preference TEXT DEFAULT 'Gym',
  weight_kg NUMERIC DEFAULT 72.0,
  height_cm NUMERIC DEFAULT 180.0,
  age INTEGER DEFAULT 26,
  gender TEXT DEFAULT 'Male',
  weekly_days INTEGER DEFAULT 5,
  workout_duration_min INTEGER DEFAULT 45,
  units TEXT DEFAULT 'metric',
  xp INTEGER DEFAULT 1240,
  level INTEGER DEFAULT 12,
  streak_days INTEGER DEFAULT 7,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Workout Plans / Custom Workouts
CREATE TABLE IF NOT EXISTS public.fitnexa_workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'alex_default',
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- Gym, Calisthenics, Yoga
  split TEXT,             -- Push, Pull, Legs, etc.
  difficulty TEXT DEFAULT 'Intermediate',
  duration_min INTEGER DEFAULT 45,
  calories_burn INTEGER DEFAULT 350,
  target_muscles TEXT[],
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Workout Completed Logs
CREATE TABLE IF NOT EXISTS public.fitnexa_workout_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL DEFAULT 'alex_default',
  workout_id TEXT,
  workout_title TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  volume_kg NUMERIC DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  sets_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 150,
  completed_at TIMESTAMPTZ DEFAULT now(),
  details JSONB DEFAULT '[]'::jsonb
);

-- 4. Body Measurements
CREATE TABLE IF NOT EXISTS public.fitnexa_measurements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL DEFAULT 'alex_default',
  weight_kg NUMERIC NOT NULL,
  chest_cm NUMERIC,
  waist_cm NUMERIC,
  arms_cm NUMERIC,
  thighs_cm NUMERIC,
  body_fat_pct NUMERIC,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Personal Records (PRs)
CREATE TABLE IF NOT EXISTS public.fitnexa_prs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL DEFAULT 'alex_default',
  exercise_name TEXT NOT NULL,
  current_pr NUMERIC NOT NULL,
  previous_pr NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'kg', -- kg or reps or sec
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Daily Habits & Check-ins
CREATE TABLE IF NOT EXISTS public.fitnexa_habits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL DEFAULT 'alex_default',
  habit_key TEXT NOT NULL,
  title TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  completed_dates DATE[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Active Challenges
CREATE TABLE IF NOT EXISTS public.fitnexa_challenges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'alex_default',
  title TEXT NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 30,
  days_completed INTEGER DEFAULT 0,
  is_joined BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Nutrition & Food Logs
CREATE TABLE IF NOT EXISTS public.fitnexa_nutrition_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL DEFAULT 'alex_default',
  meal_type TEXT NOT NULL, -- Breakfast, Lunch, Dinner, Snack
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein_g NUMERIC DEFAULT 0,
  carbs_g NUMERIC DEFAULT 0,
  fat_g NUMERIC DEFAULT 0,
  logged_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create sample profile row if not exists
INSERT INTO public.fitnexa_profiles (user_id, name, goal, fitness_level, weight_kg, height_cm, xp, level, streak_days)
VALUES ('alex_default', 'Alex', 'Build Muscle', 'Intermediate', 72.0, 180.0, 1240, 12, 7)
ON CONFLICT (user_id) DO NOTHING;

-- Enable Row Level Security (optional / standard setup)
ALTER TABLE public.fitnexa_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitnexa_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitnexa_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitnexa_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitnexa_prs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitnexa_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitnexa_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitnexa_nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Allow public access with anon key for this single-user / multi-user mode
CREATE POLICY "Public profiles access" ON public.fitnexa_profiles FOR ALL USING (true);
CREATE POLICY "Public workouts access" ON public.fitnexa_workouts FOR ALL USING (true);
CREATE POLICY "Public logs access" ON public.fitnexa_workout_logs FOR ALL USING (true);
CREATE POLICY "Public measurements access" ON public.fitnexa_measurements FOR ALL USING (true);
CREATE POLICY "Public prs access" ON public.fitnexa_prs FOR ALL USING (true);
CREATE POLICY "Public habits access" ON public.fitnexa_habits FOR ALL USING (true);
CREATE POLICY "Public challenges access" ON public.fitnexa_challenges FOR ALL USING (true);
CREATE POLICY "Public nutrition access" ON public.fitnexa_nutrition_logs FOR ALL USING (true);
