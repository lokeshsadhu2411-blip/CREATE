// ===================================================================
// FITNEXA AI: Master Backend Server
// Express server with Google Gemini AI API, Supabase Cloud PostgreSQL,
// Local JSON store fallback, REST endpoints, and static asset delivery
// ===================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;

// Data directory for local fallback storage
const dataDir = path.join(__dirname, 'data');
const localStoreFile = path.join(dataDir, 'fitnexa_store.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper to get Google Gemini API Key
function getGoogleApiKey() {
  // Return the first non‑empty environment variable ending with _API_KEY.
  const candidates = Object.keys(process.env)
    .filter(k => /_API_KEY$/i.test(k))
    .map(k => process.env[k])
    .filter(v => v && v.trim());
  return candidates.length ? candidates[0].trim() : '';
}

// Local store helpers
function getLocalStore() {
  try {
    if (!fs.existsSync(localStoreFile)) {
      const initial = {
        profile: {
          name: 'Alex',
          goal: 'Build Muscle',
          fitnessLevel: 'Intermediate',
          trainingPreference: 'Gym',
          weightKg: 72.4,
          heightCm: 180,
          age: 26,
          gender: 'Male',
          weeklyDays: 5,
          workoutDurationMin: 45,
          xp: 1240,
          level: 12,
          streakDays: 7,
          todayCaloriesBurned: 420,
          todayWorkoutMinutes: 45,
          todayWaterLiters: 2.1,
          todaySleep: '7h 20m',
          todaySteps: 7842
        },
        customWorkouts: [],
        workoutLogs: [],
        measurements: [
          { id: 'm1', recordedAt: new Date(Date.now() - 30 * 86400000).toISOString(), weightKg: 73.6, chestCm: 101, waistCm: 84, armsCm: 36, thighsCm: 57, bodyFatPct: 16.5, notes: 'Baseline start' },
          { id: 'm2', recordedAt: new Date().toISOString(), weightKg: 72.4, chestCm: 102.5, waistCm: 82, armsCm: 37, thighsCm: 58, bodyFatPct: 15.2, notes: 'Lean hypertrophy progress' }
        ],
        prs: [
          { id: 'pr_bench', exerciseName: 'Bench Press', currentPr: 95, previousPr: 90, unit: 'kg' },
          { id: 'pr_squat', exerciseName: 'Squat', currentPr: 130, previousPr: 120, unit: 'kg' },
          { id: 'pr_deadlift', exerciseName: 'Deadlift', currentPr: 160, previousPr: 150, unit: 'kg' },
          { id: 'pr_pullups', exerciseName: 'Pull-ups', currentPr: 16, previousPr: 14, unit: 'reps' },
          { id: 'pr_pushups', exerciseName: 'Push-ups', currentPr: 45, previousPr: 40, unit: 'reps' },
          { id: 'pr_plank', exerciseName: 'Plank', currentPr: 180, previousPr: 150, unit: 'sec' }
        ],
        habits: [
          { id: 'h_workout', key: 'workout', title: 'Daily Workout', streak: 7, completed: true },
          { id: 'h_water', key: 'water', title: 'Drink 3L Water', streak: 5, completed: true },
          { id: 'h_steps', key: 'steps', title: 'Walk 8,000 Steps', streak: 4, completed: false },
          { id: 'h_sleep', key: 'sleep', title: 'Sleep 7+ Hours', streak: 6, completed: true },
          { id: 'h_stretch', key: 'stretch', title: 'Daily Stretching', streak: 3, completed: false },
          { id: 'h_meditate', key: 'meditate', title: '10 Min Meditation', streak: 2, completed: true }
        ],
        challenges: [
          { id: 'c1', title: '7-Day Push-up Challenge', totalDays: 7, daysCompleted: 5, isJoined: true, reward: '100 XP + Push-up Badge' },
          { id: 'c2', title: '30-Day Workout Challenge', totalDays: 30, daysCompleted: 14, isJoined: true, reward: '500 XP + Consistency Badge' },
          { id: 'c3', title: '10K Steps Challenge', totalDays: 14, daysCompleted: 8, isJoined: false, reward: '250 XP + Cardio King' },
          { id: 'c4', title: '30-Day Yoga Challenge', totalDays: 30, daysCompleted: 0, isJoined: false, reward: '400 XP + Zen Master' },
          { id: 'c5', title: 'Calisthenics Beast Challenge', totalDays: 21, daysCompleted: 0, isJoined: false, reward: '350 XP + Gravity Defier' }
        ],
        nutritionLogs: []
      };
      fs.writeFileSync(localStoreFile, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(localStoreFile, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local store:', err.message);
    return {};
  }
}

function saveLocalStore(data) {
  try {
    fs.writeFileSync(localStoreFile, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving local store:', err.message);
    return false;
  }
}

// ===================================================================
// AI COACH ENGINE: GOOGLE GEMINI + SMART RULE-BASED FALLBACK
// ===================================================================
async function callGoogleGemini(prompt, systemInstruction = '', customApiKey = null, forcedModel = null) {
  const apiKey = (customApiKey || getGoogleApiKey()).trim();
  if (!apiKey) return null;

  // Modern Gemini models prioritized, fully allowing any requested model
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest',
    'gemini-2.5-pro',
    'gemini-2.5-flash'
  ];

  // If a forced/selected model is provided, it takes highest precedence (all models allowed)
  const modelsToTry = forcedModel
    ? [forcedModel, ...candidateModels.filter(m => m !== forcedModel)]
    : candidateModels;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1400 }
      };

      if (systemInstruction) {
        payload.system_instruction = { parts: [{ text: systemInstruction }] };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Gemini model ${model} response status ${response.status}:`, errText);
        continue;
      }

      const resData = await response.json();
      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { text: text.trim(), model };
      }
    } catch (e) {
      console.warn(`Error calling Gemini model ${model}:`, e.message);
    }
  }

  return null;
}

// Fallback Rule-Based AI Engine
function generateRuleBasedCoachResponse(userMessage, profile = {}) {
  const msg = (userMessage || '').toLowerCase();
  const name = profile.name || 'Alex';
  const goal = profile.goal || 'Fitness';
  const level = profile.fitnessLevel || 'Intermediate';

  if (msg.includes('create my workout') || msg.includes('workout plan') || msg.includes('routine')) {
    return `Hey ${name}! 🔥 Based on your goal (**${goal}**) and **${level}** level, here is your customized training session:\n\n` +
      `### 💪 Recommended Routine: Upper Body Power & Hypertrophy\n` +
      `* **Warm-up:** 5 mins shoulder dislocations with band, dynamic arm circles, jumping jacks\n` +
      `* **1. Incline Dumbbell Bench Press:** 4 sets × 8–10 reps (Rest: 90s) • *Target: Upper Chest*\n` +
      `* **2. Weighted Pull-ups / Lat Pulldown:** 4 sets × 8 reps (Rest: 90s) • *Target: Lats & Upper Back*\n` +
      `* **3. Overhead Barbell Shoulder Press:** 3 sets × 8–10 reps (Rest: 75s) • *Target: Deltoids*\n` +
      `* **4. Barbell Chest-Supported Row:** 3 sets × 10–12 reps (Rest: 60s) • *Target: Rhomboids & Mid-Back*\n` +
      `* **5. Dips Superset with Incline Bicep Curls:** 3 sets × 12 reps (Rest: 60s) • *Target: Triceps & Biceps*\n\n` +
      `⚡ **Coach Tip:** Progressive overload is key—try adding 1 rep or 1 kg from your previous session while maintaining strict eccentric control! Click **"Create Workout Plan"** to customize or start right now!`;
  }

  if (msg.includes('lose weight') || msg.includes('fat loss') || msg.includes('cut')) {
    return `Great focus, ${name}! For sustainable fat loss without sacrificing muscle mass:\n\n` +
      `1. **Caloric Deficit:** Maintain a moderate 300–500 kcal deficit below your maintenance calories.\n` +
      `2. **High Protein Intake:** Target **1.8g to 2.2g of protein per kg of body weight** (~130g–160g for you) to protect lean tissue.\n` +
      `3. **Resistance Training First:** Keep lifting heavy 3–4 days/week to signal your body to retain muscle and oxidize fat.\n` +
      `4. **Daily Step Target:** Aim for 8,000–10,000 steps daily (Zone 2 NEAT cardio is the king of sustainable fat burn).\n` +
      `5. **Hydration & Sleep:** 3 Liters of water daily + 7.5 hours of sleep to regulate cortisol and hunger hormones.`;
  }

  if (msg.includes('build muscle') || msg.includes('hypertrophy') || msg.includes('bulk')) {
    return `Building clean lean muscle requires 3 golden pillars, ${name}:\n\n` +
      `1. **Mechanical Tension & Proximity to Failure:** Train each set within 1–2 reps in reserve (RIR). Rep range of 6–12 reps with progressive overload.\n` +
      `2. **Caloric Surplus:** A slight surplus of +250–350 kcal above maintenance prevents excessive fat gain while fueling muscle protein synthesis.\n` +
      `3. **Protein Timing:** 30–40g of quality protein spread across 4 meals every 3–4 hours.\n` +
      `4. **Recovery Window:** Muscles don't grow in the gym; they grow while you sleep. Target 8 hours nightly!`;
  }

  if (msg.includes('calisthenics') || msg.includes('bodyweight')) {
    return `Awesome choice, ${name}! Calisthenics builds unmatched relative strength, mobility, and core control.\n\n` +
      `### 🤸 Calisthenics Fundamental Path:\n` +
      `* **Push:** Wall Push-ups ➔ Knee Push-ups ➔ Standard Push-ups ➔ Diamond Push-ups ➔ Dips ➔ Handstand Push-ups\n` +
      `* **Pull:** Dead Hang ➔ Scapular Pulls ➔ Incline Australian Rows ➔ Negative Pull-ups ➔ Strict Pull-ups ➔ Muscle-Up\n` +
      `* **Core:** Hollow Body Hold ➔ Hanging Knee Raises ➔ Hanging Leg Raises ➔ L-Sit ➔ Dragon Flag\n\n` +
      `Check out our interactive **Calisthenics Progression Trees** in the Workouts tab to track your current milestone!`;
  }

  if (msg.includes('yoga') || msg.includes('flexibility') || msg.includes('mobility')) {
    return `Namaste, ${name}! Mobility and yoga keep your joints resilient and reduce injury risk by 40%.\n\n` +
      `### 🧘 Recommended 15-Min Flow:\n` +
      `1. **Child’s Pose (Balasana):** 2 mins deep diaphragmatic breathing\n` +
      `2. **Cat-Cow Transitions:** 10 cycles linking breath with spinal articulation\n` +
      `3. **Downward-Facing Dog (Adho Mukha Svanasana):** 90 seconds calf & hamstring opening\n` +
      `4. **Warrior I & II Sequences:** 1 min each side for hip flexor and quad strength\n` +
      `5. **Cobra to Bridge Pose:** 2 mins for lumbar thoracic extension\n\n` +
      `You can launch our guided **Yoga Sessions** with breathing timers directly in the Yoga tab!`;
  }

  if (msg.includes('progress') || msg.includes('check my progress') || msg.includes('stats')) {
    return `Here is your current standing, ${name}: 🏆\n\n` +
      `* **Level:** 12 (${profile.xp || 1240} XP)\n` +
      `* **Active Streak:** 7 Days 🔥\n` +
      `* **Recent Bench PR:** 95 kg (+5 kg improvement!)\n` +
      `* **Body Weight:** ${profile.weightKg || 72.4} kg (Targeting ${profile.goal || 'strength'})\n` +
      `* **Recovery Status:** Chest & Shoulders in recovery (82%), Back & Legs ready for peak performance!\n\n` +
      `Keep this momentum going—you are outperforming 85% of fitness beginners this week!`;
  }

  return `Hey ${name}! I'm your FITNEXA AI Coach. 🏋️‍♂️\n\n` +
    `I can help you build custom workout routines, optimize your nutrition, master calisthenics progressions, guide your yoga flows, or analyze your muscle recovery.\n\n` +
    `What would you like to focus on right now? Pick an action below or tell me your fitness goal!`;
}

// Generate structured workout plan
function generateStructuredPlan(params = {}) {
  const goal = params.goal || 'Build Muscle';
  const level = params.fitnessLevel || 'Intermediate';
  const duration = Number(params.duration || 45);
  const style = params.style || 'Gym';

  const workoutsMap = {
    'Build Muscle': {
      title: 'Hypertrophy Power Split',
      category: 'Gym',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 8, rest: 90, target: 'Chest', weight: 75 },
        { name: 'Incline Dumbbell Flyes', sets: 3, reps: 12, rest: 60, target: 'Chest', weight: 16 },
        { name: 'Overhead Barbell Press', sets: 4, reps: 8, rest: 90, target: 'Shoulders', weight: 45 },
        { name: 'Lateral Dumbbell Raises', sets: 4, reps: 15, rest: 45, target: 'Shoulders', weight: 10 },
        { name: 'Triceps Rope Pushdowns', sets: 3, reps: 12, rest: 60, target: 'Triceps', weight: 25 }
      ]
    },
    'Lose Fat': {
      title: 'High-Intensity MetCon Circuit',
      category: 'Gym',
      exercises: [
        { name: 'Goblet Squats', sets: 4, reps: 15, rest: 45, target: 'Quads & Glutes', weight: 20 },
        { name: 'Kettlebell Swings', sets: 4, reps: 20, rest: 45, target: 'Hamstrings & Core', weight: 16 },
        { name: 'Push-ups to Renegade Row', sets: 3, reps: 10, rest: 60, target: 'Full Body', weight: 12 },
        { name: 'Dumbbell Walking Lunges', sets: 3, reps: 12, rest: 45, target: 'Legs', weight: 14 },
        { name: 'Mountain Climbers / Plank Hold', sets: 3, reps: 30, rest: 30, target: 'Abs & Core', weight: 0 }
      ]
    },
    'Calisthenics': {
      title: 'Bodyweight Mastery Session',
      category: 'Calisthenics',
      exercises: [
        { name: 'Standard / Archer Push-ups', sets: 4, reps: 12, rest: 60, target: 'Chest & Triceps', weight: 0 },
        { name: 'Strict Pull-ups', sets: 4, reps: 8, rest: 90, target: 'Back & Biceps', weight: 0 },
        { name: 'Parallel Bar Dips', sets: 3, reps: 10, rest: 75, target: 'Chest & Shoulders', weight: 0 },
        { name: 'Hanging Leg Raises', sets: 3, reps: 12, rest: 60, target: 'Core & Abs', weight: 0 },
        { name: 'Pistol Squat Progression', sets: 3, reps: 8, rest: 60, target: 'Quads & Balance', weight: 0 }
      ]
    },
    'Flexibility': {
      title: 'Full Body Mobility & Vinyasa Flow',
      category: 'Yoga',
      exercises: [
        { name: 'Downward-Facing Dog', sets: 3, reps: 60, rest: 30, target: 'Hamstrings & Back', weight: 0 },
        { name: 'Warrior I & II Combo', sets: 3, reps: 45, rest: 30, target: 'Hips & Quads', weight: 0 },
        { name: 'Cobra to Child Pose Flow', sets: 3, reps: 60, rest: 30, target: 'Spine & Lumbar', weight: 0 },
        { name: 'Bridge Pose Hold', sets: 3, reps: 45, rest: 30, target: 'Glutes & Hip Flexors', weight: 0 },
        { name: 'Corpse Pose (Savasana)', sets: 1, reps: 180, rest: 0, target: 'Nervous System Recovery', weight: 0 }
      ]
    }
  };

  const selected = workoutsMap[style] || workoutsMap[goal] || workoutsMap['Build Muscle'];
  return {
    id: `plan_${Date.now()}`,
    title: selected.title,
    category: selected.category,
    difficulty: level,
    durationMin: duration,
    caloriesBurn: Math.round(duration * 7.5),
    exercises: selected.exercises,
    coachNotes: `Tailored for ${level} level. Focus on steady tempo (3 seconds eccentric down, 1 second explosion up). Hydrate well before and during!`
  };
}

// ===================================================================
// API ROUTES
// ===================================================================

// Health & Backend Status
app.get('/api/status', async (req, res) => {
  const googleApiKey = getGoogleApiKey();
  const supabaseStatus = await supabase.testConnection();
  const supabaseConfig = supabase.getCurrentConfig();

  res.json({
    status: 'ok',
    app: 'FITNEXA AI',
    version: '1.0.0',
    googleAi: {
      configured: !!googleApiKey,
      maskedKey: googleApiKey ? `${googleApiKey.substring(0, 4)}...${googleApiKey.substring(googleApiKey.length - 4)}` : null,
      model: 'gemini-3.8-flash (all models supported)'
    },
    supabase: {
      configured: supabase.isSupabaseConfigured(),
      connected: supabaseStatus.connected,
      url: supabaseConfig.url || null,
      message: supabaseStatus.message,
      readyCount: supabaseStatus.readyCount || 0,
      totalCount: supabaseStatus.totalCount || 8,
      tables: supabaseStatus.tables || {}
    }
  });
});

// All Models Allowed: List available models endpoint
app.get('/api/ai/models', async (req, res) => {
  const apiKey = getGoogleApiKey();
  const defaultModels = [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Recommended)', default: true },
    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' },
    { id: 'gemini-pro-latest', name: 'Gemini Pro Latest' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview' }
  ];

  if (apiKey) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (resp.ok) {
        const data = await resp.json();
        const models = (data.models || [])
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => {
            const id = m.name.replace('models/', '');
            return {
              id,
              name: m.displayName || id,
              default: id === 'gemini-3.8-flash'
            };
          });
        if (models.length > 0) {
          return res.json({ success: true, allModelsAllowed: true, models });
        }
      }
    } catch (e) {
      console.warn('Error fetching dynamic models:', e.message);
    }
  }

  res.json({ success: true, allModelsAllowed: true, models: defaultModels });
});

// Test Google Gemini API Key live
app.post('/api/test-gemini', async (req, res) => {
  const { apiKey } = req.body;
  const keyToTest = (apiKey || getGoogleApiKey()).trim();

  if (!keyToTest) {
    return res.status(400).json({
      success: false,
      message: 'No Google Gemini API key provided. Get a free key at https://aistudio.google.com/app/apikey'
    });
  }

  const startTime = Date.now();
  const result = await callGoogleGemini('Respond with ONLY: "FITNEXA_ONLINE"', 'Respond with exact phrase requested.', keyToTest);
  const latencyMs = Date.now() - startTime;

  if (result && result.text) {
    return res.json({
      success: true,
      message: `Google Gemini API connected successfully using model: ${result.model}!`,
      model: result.model,
      latencyMs,
      responseSample: result.text
    });
  }

  res.status(401).json({
    success: false,
    message: 'Could not connect to Google Gemini API. Please check your API key, quotas, and internet connection.'
  });
});

// Test Supabase Connection live
app.post('/api/test-supabase', async (req, res) => {
  const { supabaseUrl, supabaseAnonKey } = req.body;
  const result = await supabase.testConnection(supabaseUrl, supabaseAnonKey);
  res.json({
    success: result.connected,
    message: result.message,
    tables: result.tables || {},
    readyCount: result.readyCount || 0,
    totalCount: result.totalCount || 8
  });
});

// Serve Supabase SQL Schema for 1-click copy
app.get('/api/schema', (req, res) => {
  try {
    const schemaPath = path.join(__dirname, 'supabase_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      return res.type('text/plain').send(sql);
    }
    res.status(404).send('-- Schema file not found.');
  } catch (err) {
    res.status(500).send(`-- Error: ${err.message}`);
  }
});

// Update runtime config / API keys from settings
app.post('/api/config', async (req, res) => {
  const { googleApiKey, supabaseUrl, supabaseAnonKey } = req.body;

  if (googleApiKey !== undefined) {
    process.env.GOOGLE_API_KEY = googleApiKey.trim();
    process.env.GEMINI_API_KEY = googleApiKey.trim();
  }

  if (supabaseUrl !== undefined && supabaseAnonKey !== undefined) {
    process.env.SUPABASE_URL = supabaseUrl.trim();
    process.env.SUPABASE_ANON_KEY = supabaseAnonKey.trim();
    supabase.initSupabase(supabaseUrl.trim(), supabaseAnonKey.trim());
  }

  // Update .env file on disk
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    if (googleApiKey !== undefined) {
      if (/GOOGLE_API_KEY=.*/i.test(envContent)) {
        envContent = envContent.replace(/GOOGLE_API_KEY=.*/g, `GOOGLE_API_KEY=${googleApiKey.trim()}`);
      } else {
        envContent += `\nGOOGLE_API_KEY=${googleApiKey.trim()}`;
      }
      if (/GEMINI_API_KEY=.*/i.test(envContent)) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${googleApiKey.trim()}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${googleApiKey.trim()}`;
      }
    }

    if (supabaseUrl !== undefined) {
      if (/SUPABASE_URL=.*/i.test(envContent)) {
        envContent = envContent.replace(/SUPABASE_URL=.*/g, `SUPABASE_URL=${supabaseUrl.trim()}`);
      } else {
        envContent += `\nSUPABASE_URL=${supabaseUrl.trim()}`;
      }
    }

    if (supabaseAnonKey !== undefined) {
      if (/SUPABASE_ANON_KEY=.*/i.test(envContent)) {
        envContent = envContent.replace(/SUPABASE_ANON_KEY=.*/g, `SUPABASE_ANON_KEY=${supabaseAnonKey.trim()}`);
      } else {
        envContent += `\nSUPABASE_ANON_KEY=${supabaseAnonKey.trim()}`;
      }
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  } catch (err) {
    console.warn('Could not persist to .env file:', err.message);
  }

  const supabaseTest = await supabase.testConnection();

  res.json({
    success: true,
    message: 'Configuration updated and persisted successfully!',
    googleAiConfigured: !!getGoogleApiKey(),
    supabaseConnected: supabaseTest.connected,
    supabaseMessage: supabaseTest.message,
    supabaseTablesReady: supabaseTest.readyCount || 0
  });
});

// AI Chat Endpoint with AiCoche Mode and All Models Support
app.post('/api/ai/chat', async (req, res) => {
  const { message, profile = {}, history = [], model = null, mode = 'AiCoche', apiKey: customKey = null } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const isAiCoche = mode === 'AiCoche' || mode === 'aicoche' || mode === 'coach';
  const coachTitle = isAiCoche ? 'FITNEXA AiCoche (Pro AI Head Coach)' : 'FITNEXA AI Fitness Coach';

  const systemInstruction = `You are ${coachTitle}, a world-class elite personal trainer, biomechanics expert, and master sports nutritionist.
Mode: ${isAiCoche ? 'AiCoche Mode (Elite Personal Fitness & High-Performance Coaching)' : 'Fitness Coach'}
User Profile:
- Name: ${profile.name || 'Alex'}
- Goal: ${profile.goal || 'Build Muscle'}
- Fitness Level: ${profile.fitnessLevel || 'Intermediate'}
- Weight: ${profile.weightKg || 72.4} kg
- Height: ${profile.heightCm || 180} cm
- Preferred Training: ${profile.trainingPreference || 'Gym'}
- Weekly Frequency: ${profile.weeklyDays || 5} days/week

Guidelines:
1. Provide motivating, structured, scientifically sound, and actionable fitness advice with high energy and precision.
2. If suggesting workout routines, specify exercises with Sets × Reps, Rest times, and Target muscles.
3. Keep answers concise, direct, and visually clean with Markdown bolding, headers, and bullet points.
4. Always prioritize safety, proper warmup, progressive overload, biomechanical cues, and active recovery.`;

  // Format context history for prompt
  let contextPrompt = '';
  if (Array.isArray(history) && history.length > 0) {
    contextPrompt = 'Previous context:\n' + history.slice(-4).map(h => `${h.role === 'user' ? 'User' : 'AiCoche'}: ${h.text}`).join('\n') + '\n\n';
  }
  const fullPrompt = `${contextPrompt}User: ${message}\nAiCoche:`;

  // Try real Gemini AI with user requested model (all models allowed)
  let geminiResult = await callGoogleGemini(fullPrompt, systemInstruction, customKey, model);
  let reply = '';
  let isRealAi = false;
  let modelUsed = 'rule-based-fallback';

  if (geminiResult && geminiResult.text) {
    reply = geminiResult.text;
    isRealAi = true;
    modelUsed = geminiResult.model;
  } else {
    // Seamless fallback to intelligent local engine
    reply = generateRuleBasedCoachResponse(message, profile);
    isRealAi = false;
  }

  res.json({
    reply,
    isRealAi,
    mode: isAiCoche ? 'AiCoche' : mode,
    modelUsed,
    timestamp: new Date().toISOString(),
    suggestions: [
      'Create my workout',
      'Help me lose weight',
      'Build muscle',
      'Improve flexibility',
      'Start calisthenics',
      'Check my progress'
    ]
  });
});

// AI Structured Workout Generator Endpoint
app.post('/api/ai/workout-plan', async (req, res) => {
  const params = req.body || {};
  const apiKey = getGoogleApiKey();

  if (apiKey) {
    const prompt = `Generate a personalized fitness workout plan in JSON format based on:
Goal: ${params.goal || 'Build Muscle'}
Level: ${params.fitnessLevel || 'Intermediate'}
Duration: ${params.duration || 45} minutes
Available Equipment: ${params.equipment || 'Gym'}
Training Style: ${params.style || 'Gym'}
Age: ${params.age || 26}
Gender: ${params.gender || 'Not specified'}

Respond with ONLY valid JSON with this exact schema:
{
  "title": "Short catchy title",
  "category": "Gym" | "Calisthenics" | "Yoga",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "durationMin": number,
  "caloriesBurn": number,
  "coachNotes": "Motivational tip and focus cue",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": number,
      "reps": number,
      "rest": number,
      "target": "Target muscle group",
      "weight": number
    }
  ]
}`;
    const rawAiResponse = await callGoogleGemini(prompt, 'You are an API that outputs strictly valid JSON without code fences or extra text.', null, params.model || null);
    if (rawAiResponse && rawAiResponse.text) {
      try {
        const cleanJson = rawAiResponse.text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        parsed.id = `plan_${Date.now()}`;
        return res.json({ success: true, plan: parsed, isRealAi: true, model: rawAiResponse.model });
      } catch (err) {
        console.warn('Failed to parse Gemini workout JSON, using fallback:', err.message);
      }
    }
  }

  // Fallback plan generator
  const fallbackPlan = generateStructuredPlan(params);
  res.json({ success: true, plan: fallbackPlan, isRealAi: false });
});

// Full Sync endpoint (Pull / Push)
app.get('/api/sync', async (req, res) => {
  const userId = req.query.userId || 'alex_default';

  if (supabase.isSupabaseConfigured()) {
    try {
      const [profile, workouts, workoutLogs, measurements, prs, habits, challenges, nutrition] = await Promise.all([
        supabase.getProfile(userId),
        supabase.getWorkouts(userId),
        supabase.getWorkoutLogs(userId),
        supabase.getMeasurements(userId),
        supabase.getPRs(userId),
        supabase.getHabits(userId),
        supabase.getChallenges(userId),
        supabase.getNutritionLogs(userId)
      ]);

      return res.json({
        source: 'supabase',
        data: {
          profile: profile || null,
          customWorkouts: workouts || [],
          workoutLogs: workoutLogs || [],
          measurements: measurements || [],
          prs: prs || [],
          habits: habits || [],
          challenges: challenges || [],
          nutritionLogs: nutrition || []
        }
      });
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local file:', e.message);
    }
  }

  const localData = getLocalStore();
  res.json({
    source: 'local',
    data: localData
  });
});

app.post('/api/sync', async (req, res) => {
  const { profile, customWorkouts, workoutLogs, measurements, prs, habits, challenges, nutritionLogs } = req.body;
  const userId = (profile && (profile.userId || profile.user_id)) || 'alex_default';

  // Save to local store backup always
  const currentStore = getLocalStore();
  const updatedStore = {
    ...currentStore,
    profile: profile || currentStore.profile,
    customWorkouts: customWorkouts !== undefined ? customWorkouts : currentStore.customWorkouts,
    workoutLogs: workoutLogs !== undefined ? workoutLogs : currentStore.workoutLogs,
    measurements: measurements !== undefined ? measurements : currentStore.measurements,
    prs: prs !== undefined ? prs : currentStore.prs,
    habits: habits !== undefined ? habits : currentStore.habits,
    challenges: challenges !== undefined ? challenges : currentStore.challenges,
    nutritionLogs: nutritionLogs !== undefined ? nutritionLogs : currentStore.nutritionLogs,
    lastSynced: new Date().toISOString()
  };
  saveLocalStore(updatedStore);

  // If Supabase is connected, sync to cloud
  let supabaseSynced = false;
  if (supabase.isSupabaseConfigured()) {
    try {
      if (profile) await supabase.saveProfile(profile);
      if (Array.isArray(customWorkouts) && customWorkouts.length > 0) {
        for (const w of customWorkouts) await supabase.saveWorkout(w);
      }
      if (Array.isArray(workoutLogs) && workoutLogs.length > 0) {
        for (const log of workoutLogs.slice(0, 5)) await supabase.insertWorkoutLog(log);
      }
      if (Array.isArray(measurements) && measurements.length > 0) {
        for (const m of measurements.slice(0, 5)) await supabase.insertMeasurement(m);
      }
      if (Array.isArray(prs) && prs.length > 0) {
        for (const pr of prs) await supabase.upsertPR(pr);
      }
      if (Array.isArray(habits) && habits.length > 0) {
        for (const h of habits) await supabase.saveHabit(h);
      }
      if (Array.isArray(challenges) && challenges.length > 0) {
        for (const ch of challenges) await supabase.saveChallenge(ch);
      }
      supabaseSynced = true;
    } catch (e) {
      console.warn('Supabase sync write error:', e.message);
    }
  }

  res.json({
    success: true,
    supabaseSynced,
    localSaved: true,
    timestamp: new Date().toISOString()
  });
});

// Dedicated Routes
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/vesper', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 FITNEXA AI Server running at: http://localhost:${PORT}`);
  console.log(`  Google Gemini AI: ${getGoogleApiKey() ? 'API Key Active 🟢' : 'Using Local Smart Fallback 🟡'}`);
  console.log(`  Supabase Cloud:   ${supabase.isSupabaseConfigured() ? 'Configured 🟢' : 'Local JSON Storage Active 🟡'}`);
  console.log(`======================================================\n`);
});
