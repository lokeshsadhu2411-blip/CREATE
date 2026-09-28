// ===================================================================
// FITNEXA AI: Supabase Client Adapter
// Handles PostgreSQL queries, profile sync, workout logging, PRs,
// habits, challenges, nutrition, and health checks across all tables.
// ===================================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

let supabaseInstance = null;
let currentSupabaseUrl = process.env.SUPABASE_URL || '';
let currentSupabaseKey = process.env.SUPABASE_ANON_KEY || '';

function initSupabase(url, key) {
  if (url && key) {
    try {
      currentSupabaseUrl = url.trim();
      currentSupabaseKey = key.trim();
      supabaseInstance = createClient(currentSupabaseUrl, currentSupabaseKey, {
        auth: { persistSession: false }
      });
      console.log(`⚡ Supabase client connected for: ${currentSupabaseUrl}`);
      return true;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err.message);
      supabaseInstance = null;
      return false;
    }
  }
  supabaseInstance = null;
  return false;
}

// Initial initialization if environment variables are set
if (currentSupabaseUrl && currentSupabaseKey) {
  initSupabase(currentSupabaseUrl, currentSupabaseKey);
}

function isSupabaseConfigured() {
  return !!supabaseInstance && !!currentSupabaseUrl && !!currentSupabaseKey;
}

function getSupabase() {
  return supabaseInstance;
}

// Test Connection & health check
async function testConnection(customUrl = null, customKey = null) {
  let client = supabaseInstance;
  if (customUrl && customKey) {
    try {
      client = createClient(customUrl.trim(), customKey.trim(), { auth: { persistSession: false } });
    } catch (err) {
      return { connected: false, message: `Invalid Supabase credentials: ${err.message}`, tables: {} };
    }
  }

  if (!client) {
    return {
      connected: false,
      message: 'Supabase credentials not configured. Local data store active.',
      tables: {}
    };
  }

  const expectedTables = [
    'fitnexa_profiles',
    'fitnexa_workouts',
    'fitnexa_workout_logs',
    'fitnexa_measurements',
    'fitnexa_prs',
    'fitnexa_habits',
    'fitnexa_challenges',
    'fitnexa_nutrition_logs'
  ];

  const tableStatus = {};
  let anySuccess = false;
  let firstError = null;

  for (const table of expectedTables) {
    try {
      const { data, error } = await client.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        tableStatus[table] = { ready: false, error: error.message };
        if (!firstError) firstError = error.message;
      } else {
        tableStatus[table] = { ready: true };
        anySuccess = true;
      }
    } catch (err) {
      tableStatus[table] = { ready: false, error: err.message };
      if (!firstError) firstError = err.message;
    }
  }

  if (anySuccess) {
    const readyCount = Object.values(tableStatus).filter(t => t.ready).length;
    return {
      connected: true,
      readyCount,
      totalCount: expectedTables.length,
      tables: tableStatus,
      message: readyCount === expectedTables.length
        ? 'Successfully connected to Supabase! All 8 tables are active.'
        : `Connected to Supabase (${readyCount}/${expectedTables.length} tables found). Run supabase_schema.sql to create missing tables.`
    };
  }

  return {
    connected: false,
    message: firstError
      ? `Supabase connection error: ${firstError}`
      : 'Could not access Supabase tables. Please verify URL, Anon key, and run supabase_schema.sql.',
    tables: tableStatus
  };
}

// 1. User Profile
async function getProfile(userId = 'alex_default') {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabaseInstance
      .from('fitnexa_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getProfile error:', err.message);
    return null;
  }
}

async function saveProfile(profile) {
  if (!isSupabaseConfigured()) return null;
  try {
    const userId = profile.userId || profile.user_id || 'alex_default';
    const payload = {
      user_id: userId,
      name: profile.name || 'Alex',
      goal: profile.goal || 'Build Muscle',
      fitness_level: profile.fitnessLevel || profile.fitness_level || 'Intermediate',
      training_preference: profile.trainingPreference || profile.training_preference || 'Gym',
      weight_kg: Number(profile.weightKg || profile.weight_kg || 72),
      height_cm: Number(profile.heightCm || profile.height_cm || 180),
      age: Number(profile.age || 26),
      gender: profile.gender || 'Male',
      weekly_days: Number(profile.weeklyDays || profile.weekly_days || 5),
      workout_duration_min: Number(profile.workoutDurationMin || profile.workout_duration_min || 45),
      units: profile.units || 'metric',
      xp: Number(profile.xp || 1240),
      level: Number(profile.level || 12),
      streak_days: Number(profile.streakDays || profile.streak_days || 7),
      avatar_url: profile.avatarUrl || profile.avatar_url || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseInstance
      .from('fitnexa_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select();
    if (error) throw error;
    return data && data[0] ? data[0] : payload;
  } catch (err) {
    console.error('Supabase saveProfile error:', err.message);
    return null;
  }
}

// 2. Custom Workouts
async function getWorkouts(userId = 'alex_default') {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabaseInstance
      .from('fitnexa_workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getWorkouts error:', err.message);
    return null;
  }
}

async function saveWorkout(w) {
  if (!isSupabaseConfigured()) return null;
  try {
    const record = {
      id: w.id || `w_${Date.now()}`,
      user_id: w.userId || w.user_id || 'alex_default',
      title: w.title,
      category: w.category || 'Gym',
      split: w.split || null,
      difficulty: w.difficulty || 'Intermediate',
      duration_min: Number(w.durationMin || w.duration_min || 45),
      calories_burn: Number(w.caloriesBurn || w.calories_burn || 350),
      target_muscles: w.targetMuscles || w.target_muscles || [],
      exercises: w.exercises || [],
      is_favorite: !!w.isFavorite
    };
    const { data, error } = await supabaseInstance
      .from('fitnexa_workouts')
      .upsert(record, { onConflict: 'id' })
      .select();
    if (error) throw error;
    return data && data[0] ? data[0] : record;
  } catch (err) {
    console.error('Supabase saveWorkout error:', err.message);
    return null;
  }
}

async function deleteWorkout(workoutId, userId = 'alex_default') {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabaseInstance
      .from('fitnexa_workouts')
      .delete()
      .eq('id', workoutId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Supabase deleteWorkout error:', err.message);
    return null;
  }
}

// 3. Workout Completed Logs
async function getWorkoutLogs(userId = 'alex_default') {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabaseInstance
      .from('fitnexa_workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getWorkoutLogs error:', err.message);
    return null;
  }
}

async function insertWorkoutLog(log) {
  if (!isSupabaseConfigured()) return null;
  try {
    const record = {
      id: log.id || `log_${Date.now()}`,
      user_id: log.userId || log.user_id || 'alex_default',
      workout_id: log.workoutId || log.workout_id || null,
      workout_title: log.workoutTitle || log.title || 'Workout Session',
      category: log.category || 'Gym',
      duration_sec: Number(log.durationSec || log.duration_sec || 0),
      calories_burned: Number(log.caloriesBurned || log.calories_burned || 0),
      volume_kg: Number(log.volumeKg || log.volume_kg || 0),
      exercises_completed: Number(log.exercisesCompleted || log.exercises_completed || 0),
      sets_completed: Number(log.setsCompleted || log.sets_completed || 0),
      xp_earned: Number(log.xpEarned || log.xp_earned || 150),
      completed_at: log.completedAt || new Date().toISOString(),
      details: log.details || []
    };

    const { data, error } = await supabaseInstance
      .from('fitnexa_workout_logs')
      .upsert(record, { onConflict: 'id' })
      .select();
    if (error) throw error;
    return data && data[0] ? data[0] : record;
  } catch (err) {
    console.error('Supabase insertWorkoutLog error:', err.message);
    return null;
  }
}

// 4. Body Measurements
async function getMeasurements(userId = 'alex_default') {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabaseInstance
      .from('fitnexa_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getMeasurements error:', err.message);
    return null;
  }
}

async function insertMeasurement(m) {
  if (!isSupabaseConfigured()) return null;
  try {
    const record = {
      id: m.id || `m_${Date.now()}`,
      user_id: m.userId || m.user_id || 'alex_default',
      weight_kg: Number(m.weightKg || m.weight_kg),
      chest_cm: m.chestCm || m.chest_cm ? Number(m.chestCm || m.chest_cm) : null,
      waist_cm: m.waistCm || m.waist_cm ? Number(m.waistCm || m.waist_cm) : null,
      arms_cm: m.armsCm || m.arms_cm ? Number(m.armsCm || m.arms_cm) : null,
      thighs_cm: m.thighsCm || m.thighs_cm ? Number(m.thighsCm || m.thighs_cm) : null,
      body_fat_pct: m.bodyFatPct || m.body_fat_pct ? Number(m.bodyFatPct || m.body_fat_pct) : null,
      notes: m.notes || '',
      recorded_at: m.recordedAt || m.recorded_at || new Date().toISOString()
    };
    const { data, error } = await supabaseInstance
      .from('fitnexa_measurements')
      .upsert(record, { onConflict: 'id' })
      .select();
    if (error) throw error;
    return data && data[0] ? data[0] : record;
  } catch (err) {
    console.error('Supabase insertMeasurement error:', err.message);
    return null;
  }
}

// 5. Personal Records (PRs)
async function getPRs(userId = 'alex_default') {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabaseInstance
      .from('fitnexa_prs')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getPRs error:', err.message);
    return null;
  }
}

async function upsertPR(pr) {
  if (!isSupabaseConfigured()) return null;
  try {
    const exerciseName = pr.exerciseName || pr.exercise_name;
    const record = {
      id: pr.id || `pr_${exerciseName.toLowerCase().replace(/\s+/g, '_')}`,
      user_id: pr.userId || pr.user_id || 'alex_default',
      exercise_name: exerciseName,
      current_pr: Number(pr.currentPr || pr.current_pr),
      previous_pr: Number(pr.previousPr || pr.previous_pr || 0),
      unit: pr.unit || 'kg',
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseInstance
      .from('fitnexa_prs')
      .upsert(record, { onConflict: 'id' })
      .select();
    if (error) throw error;
    return data && data[0] ? data[0] : record;
  } catch (err) {
    console.error('Supabase upsertPR error:', err.message);
    return null;
  }
}

// 6. Daily Habits
async function getHabits(userId = 'alex_default') {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabaseInstance
      .from('fitnexa_habits')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getHabits error:', err.message);
    return null;
  }
}

async function saveHabit(habit) {
  if (!isSupabaseConfigured()) return null;
  try {
    const key = habit.key || habit.habit_key;
    const record = {
      id: habit.id || `h_${key}`,
      user_id: habit.userId || habit.user_id || 'alex_default',
      habit_key: key,
      title: habit.title,
      streak: Number(habit.streak || 0),
      completed_dates: habit.completedDates || habit.completed_dates || [],
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseInstance
      .from('fitnexa_habits')
      .upsert(record, { onConflict: 'id' })
      .select();
    if (error) throw error;
    return data && data[0] ? data[0] : record;
  } catch (err) {
    console.error('Supabase saveHabit error:', err.message);
    return null;
  }
}

// 7. Active Challenges
async function getChallenges(userId = 'alex_default') {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabaseInstance
      .from('fitnexa_challenges')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getChallenges error:', err.message);
    return null;
  }
}

async function saveChallenge(ch) {
  if (!isSupabaseConfigured()) return null;
  try {
    const record = {
      id: ch.id,
      user_id: ch.userId || ch.user_id || 'alex_default',
      title: ch.title,
      total_days: Number(ch.totalDays || ch.total_days || 30),
      days_completed: Number(ch.daysCompleted || ch.days_completed || 0),
      is_joined: !!(ch.isJoined || ch.is_joined),
      is_completed: !!(ch.isCompleted || ch.is_completed),
      joined_at: ch.joinedAt || ch.joined_at || (ch.isJoined ? new Date().toISOString() : null),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseInstance
      .from('fitnexa_challenges')
      .upsert(record, { onConflict: 'id' })
      .select();
    if (error) throw error;
    return data && data[0] ? data[0] : record;
  } catch (err) {
    console.error('Supabase saveChallenge error:', err.message);
    return null;
  }
}

// 8. Nutrition Logs
async function getNutritionLogs(userId = 'alex_default', dateStr = null) {
  if (!isSupabaseConfigured()) return null;
  try {
    let q = supabaseInstance
      .from('fitnexa_nutrition_logs')
      .select('*')
      .eq('user_id', userId);
    if (dateStr) {
      q = q.eq('logged_date', dateStr);
    }
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getNutritionLogs error:', err.message);
    return null;
  }
}

async function insertNutritionLog(n) {
  if (!isSupabaseConfigured()) return null;
  try {
    const record = {
      id: n.id || `nutr_${Date.now()}`,
      user_id: n.userId || n.user_id || 'alex_default',
      meal_type: n.mealType || n.meal_type || 'Snack',
      food_name: n.foodName || n.food_name || n.name,
      calories: Number(n.calories || 0),
      protein_g: Number(n.proteinG || n.protein_g || n.protein || 0),
      carbs_g: Number(n.carbsG || n.carbs_g || n.carbs || 0),
      fat_g: Number(n.fatG || n.fat_g || n.fat || 0),
      logged_date: n.loggedDate || n.logged_date || new Date().toISOString().split('T')[0]
    };
    const { data, error } = await supabaseInstance
      .from('fitnexa_nutrition_logs')
      .insert([record])
      .select();
    if (error) throw error;
    return data && data[0] ? data[0] : record;
  } catch (err) {
    console.error('Supabase insertNutritionLog error:', err.message);
    return null;
  }
}

module.exports = {
  initSupabase,
  isSupabaseConfigured,
  getSupabase,
  testConnection,
  getProfile,
  saveProfile,
  getWorkouts,
  saveWorkout,
  deleteWorkout,
  getWorkoutLogs,
  insertWorkoutLog,
  getMeasurements,
  insertMeasurement,
  getPRs,
  upsertPR,
  getHabits,
  saveHabit,
  getChallenges,
  saveChallenge,
  getNutritionLogs,
  insertNutritionLog,
  getCurrentConfig: () => ({
    url: currentSupabaseUrl,
    keyProvided: !!currentSupabaseKey
  })
};
