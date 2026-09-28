# ⚡ FITNEXA AI - Your AI Coach. Your Workout. Your Progress.

![FITNEXA AI Platform](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80)

**FITNEXA AI** is a modern, highly interactive, responsive personal fitness coach web application engineered to combine the experience of an elite personal trainer, dynamic workout planner, interactive recovery visualizer, and gamified progress platform.

---

## 🌟 Key Application Features

### 1. 🤖 AI Fitness Coach (Google Gemini + Smart Engine)
- **Conversational Chat Assistant**: Sports science advice tailored to your biological profile, goals, and training experience.
- **Interactive Workout Planner Wizard**: Generate structured routines based on age, gender, fitness level, available equipment, days per week, and duration.
- **Multi-Model Google Gemini Integration**: Supports `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-2.5-flash`, and `gemini-1.5-pro` via backend API with seamless local rule-based fallback.

### 2. 🏋️ Three Major Fitness Modes
- **Gym Training**: Chest, Back, Shoulders, Arms, Legs, Glutes, Abs, Full Body. Includes pre-built splits: Push Day, Pull Day, Leg Day, Upper Body, Lower Body, Bro Split.
- **Calisthenics Progression Trees**: Visual milestone pathways from beginner to master (e.g. Wall Push-up ➔ Knee ➔ Standard ➔ Diamond ➔ Archer ➔ One-Arm; Dead Hang ➔ Pull-up ➔ Muscle-Up; L-Sit; Handstand).
- **Restorative Yoga Sessions**: Morning Flow, Flexibility, Stress Relief, Back Relief, Mobility, Strength Yoga, and Sleep Yoga with pose guides and breathing instructions.

### 3. ⏱️ Active Workout Player & Dedicated Rest Timer
- Real-time exercise stepper with animated exercise previews, weight, sets, and rep tracking.
- Circular countdown progress ring with audio countdown beeps and completion chimes.
- Presets: 30s, 45s, 60s, 90s, 2m, 3m, plus custom intervals.
- Post-workout celebratory completion modal calculating duration, sets, volume lifted, calories burned, and XP earned.

### 4. 🧬 Interactive 3D Muscle Recovery Map
- Anatomical human muscle map (Chest, Back, Shoulders, Biceps, Triceps, Abs, Glutes, Quads, Hamstrings, Calves).
- Real-time readiness percentages (Ready, Recovering, Fatigued) based on workout history.
- Click any muscle group to view recovery status and recommended target exercises.

### 5. 🥗 Nutrition & Hydration Tracker
- Daily caloric budget with macro distribution bars (Protein, Carbohydrates, Healthy Fats).
- Meal logging for Breakfast, Lunch, Dinner, and Snacks with quick-add popular fitness foods.
- 1-click hydration logger (+250ml / +500ml).

### 6. 📈 Progress Analytics & Charts
- Interactive charts: Weight over time, workout consistency & duration, calories burned, and strength progression (Bench Press vs Squat).
- Timeframe filters: 7 Days, 30 Days, 90 Days, 1 Year.
- Detailed body circumference measurement logs (Chest, Waist, Arms, Thighs, Body Fat %).

### 7. ⚖️ BMI & Caloric Needs Calculator
- Calculates BMI index, BMI classification, Basal Metabolic Rate (BMR), and daily maintenance / fat loss / muscle building caloric targets using the Mifflin-St Jeor formula.

### 8. 🏆 Gamification, XP, Streaks & Badges
- Athlete XP and Level progression system (e.g. Level 12 • 1,240 XP).
- Unlockable achievement badges: *First Workout*, *7 Day Streak*, *10 Workouts*, *100 Push-ups*, *Yoga Beginner*, *Calisthenics Starter*, *Consistency King*.
- Personal Records (PR) tracker with celebratory animations on new milestone PRs.

### 9. 🎨 5 Premium Color Themes
1. **Dark Mode** (Emerald & Obsidian Glass)
2. **Light Mode** (Clean Royal Blue)
3. **Midnight Mode** (Electric Cyan & Neon Magenta)
4. **Energy Mode** (High-voltage Amber & Crimson)
5. **Minimal Mode** (Monochrome Slate & Pure White)
- UI Density switch: **Comfortable** vs **Compact**.
- Desktop subtle interactive cursor glow follower (auto-disabled on mobile).
- Reduced motion toggle for accessibility.

---

## ⚡ Backend Architecture: Google Gemini & Supabase

FITNEXA AI is designed with a **dual-engine architecture**:
1. **Works 100% out of the box** using intelligent local state and responsive sports-science heuristics.
2. **Seamless Cloud Expansion** when you provide your Google Gemini API key and Supabase project credentials.

### Google Gemini AI Studio Setup
1. Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Enter the key into `.env` as `GOOGLE_API_KEY=AIzaSy...` or open **Settings ⚙️** inside the web app and click **Test Key**.

### Supabase Cloud PostgreSQL Setup
1. Create a free database at [Supabase](https://supabase.com/dashboard).
2. Open your project's **SQL Editor**, click **"📋 Copy SQL Schema"** from the in-app Settings modal (or copy the contents of `supabase_schema.sql`), and click **Run**.
3. Copy your **Project URL** and **Anon Public Key** (found in Project Settings ➔ API).
4. Enter them into `.env` or paste them into the in-app Settings modal and click **Test Supabase Connection**.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)

### Installation & Launch

1. Open your terminal in the project directory:
   ```bash
   cd "c:\Users\balanagu lokesh\OneDrive\Desktop\New folder"
   ```

2. Install dependencies (already included in `package.json`):
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/status` | GET | Check health, Gemini AI key state, and Supabase database connection |
| `/api/test-gemini` | POST | Live probe test of a Google Gemini API key with latency measurement |
| `/api/test-supabase` | POST | Live test of Supabase URL and Anon Key verifying all 8 tables |
| `/api/schema` | GET | Returns the complete `supabase_schema.sql` database migration script |
| `/api/config` | POST | Updates and persists API credentials to `.env` and server runtime |
| `/api/ai/chat` | POST | Conversational AI coach message processing (Gemini with smart fallback) |
| `/api/ai/workout-plan` | POST | Generates structured JSON workout routine tailored to user parameters |
| `/api/sync` | GET / POST | Bidirectional data synchronization between client, local storage, and Supabase |

---

## 📱 Keyboard Shortcuts & Navigation
- **`Ctrl + K`** (or `Cmd + K`): Launch Global Search across exercises, workouts, and challenges.
- **`Esc`**: Dismiss any open modal dialog.
- **Top Theme Bar**: 1-click theme switching between Dark, Light, Midnight, Energy, and Minimal.
- **Bottom Navigation Bar**: Seamless touch navigation for mobile and tablet devices.

---

*FITNEXA AI — "Your AI Coach. Your Workout. Your Progress."*
