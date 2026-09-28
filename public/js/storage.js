// ===================================================================
// FITNEXA AI: Storage & Cloud Sync Engine
// LocalStorage caching with graceful Supabase cloud PostgreSQL synchronization
// ===================================================================

const FitnexaStorage = (function () {
  const STORAGE_KEYS = {
    PROFILE: 'fitnexa_profile',
    WORKOUT_LOGS: 'fitnexa_workout_logs',
    MEASUREMENTS: 'fitnexa_measurements',
    PRS: 'fitnexa_prs',
    HABITS: 'fitnexa_habits',
    CHALLENGES: 'fitnexa_challenges',
    NUTRITION: 'fitnexa_nutrition',
    SETTINGS: 'fitnexa_settings',
    NOTIFICATIONS: 'fitnexa_notifications',
    CUSTOM_WORKOUTS: 'fitnexa_custom_workouts'
  };

  // Initial user profile matching specifications (Alex)
  const defaultProfile = {
    userId: 'alex_default',
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
    units: 'metric',
    xp: 1240,
    level: 12,
    streakDays: 7,
    todayCaloriesBurned: 420,
    todayWorkoutMinutes: 45,
    todayWaterLiters: 2.1,
    todaySleep: '7h 20m',
    todaySteps: 7842
  };

  const defaultSettings = {
    theme: 'theme-dark',
    density: 'comfortable', // 'comfortable' or 'compact'
    reducedMotion: false,
    cursorEffects: true,
    soundEnabled: true,
    googleApiKey: '',
    supabaseUrl: '',
    supabaseAnonKey: ''
  };

  function getLocal(key, defaultVal) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      console.warn(`LocalStorage read error for ${key}:`, e);
      return defaultVal;
    }
  }

  function setLocal(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn(`LocalStorage write error for ${key}:`, e);
    }
  }

  return {
    getProfile: function () {
      return getLocal(STORAGE_KEYS.PROFILE, defaultProfile);
    },

    saveProfile: function (profile) {
      const merged = { ...this.getProfile(), ...profile };
      setLocal(STORAGE_KEYS.PROFILE, merged);
      this.syncToBackend();
      return merged;
    },

    getSettings: function () {
      return getLocal(STORAGE_KEYS.SETTINGS, defaultSettings);
    },

    saveSettings: function (newSettings) {
      const merged = { ...this.getSettings(), ...newSettings };
      setLocal(STORAGE_KEYS.SETTINGS, merged);

      // Notify server if backend keys changed
      if (newSettings.googleApiKey !== undefined || newSettings.supabaseUrl !== undefined) {
        fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleApiKey: newSettings.googleApiKey,
            supabaseUrl: newSettings.supabaseUrl,
            supabaseAnonKey: newSettings.supabaseAnonKey
          })
        }).catch(err => console.warn('Config push failed:', err.message));
      }

      return merged;
    },

    getWorkoutLogs: function () {
      return getLocal(STORAGE_KEYS.WORKOUT_LOGS, []);
    },

    recordWorkoutCompletion: function (log) {
      const logs = this.getWorkoutLogs();
      logs.unshift(log);
      setLocal(STORAGE_KEYS.WORKOUT_LOGS, logs);

      // Update profile XP & streak
      const prof = this.getProfile();
      prof.xp = (prof.xp || 1240) + (log.xpEarned || 150);
      prof.level = Math.floor(prof.xp / 100) + 1;
      prof.todayWorkoutMinutes += log.durationMin;
      prof.todayCaloriesBurned += log.caloriesBurned;
      this.saveProfile(prof);

      // Add to notification center
      this.addNotification({
        title: 'Workout Completed!',
        message: `Great job crushing ${log.workoutTitle}! You earned +${log.xpEarned} XP.`,
        icon: '🏆',
        time: 'Just now'
      });

      this.syncToBackend();
      return logs;
    },

    getMeasurements: function () {
      return getLocal(STORAGE_KEYS.MEASUREMENTS, window.FITNEXA_DATA.measurements);
    },

    addMeasurement: function (entry) {
      const list = this.getMeasurements();
      const record = {
        id: `m_${Date.now()}`,
        recordedAt: new Date().toISOString(),
        ...entry
      };
      list.push(record);
      setLocal(STORAGE_KEYS.MEASUREMENTS, list);

      // Also update current profile weight
      if (entry.weightKg) {
        const prof = this.getProfile();
        prof.weightKg = parseFloat(entry.weightKg);
        this.saveProfile(prof);
      }

      this.syncToBackend();
      return list;
    },

    getPRs: function () {
      return getLocal(STORAGE_KEYS.PRS, window.FITNEXA_DATA.prs);
    },

    savePR: function (pr) {
      const list = this.getPRs();
      const idx = list.findIndex(item => item.exerciseName.toLowerCase() === pr.exerciseName.toLowerCase());
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...pr, date: 'Just now' };
      } else {
        list.push({ id: `pr_${Date.now()}`, ...pr, date: 'Just now' });
      }
      setLocal(STORAGE_KEYS.PRS, list);

      // Add notification & XP
      this.addNotification({
        title: '🎉 NEW PERSONAL RECORD!',
        message: `You smashed your PR in ${pr.exerciseName}: ${pr.currentPr} ${pr.unit}!`,
        icon: '⚡',
        time: 'Just now'
      });

      this.syncToBackend();
      return list;
    },

    getHabits: function () {
      return getLocal(STORAGE_KEYS.HABITS, window.FITNEXA_DATA.habits);
    },

    toggleHabit: function (habitKey) {
      const list = this.getHabits();
      const item = list.find(h => h.key === habitKey);
      if (item) {
        item.completed = !item.completed;
        if (item.completed) {
          item.streak = (item.streak || 0) + 1;
        } else {
          item.streak = Math.max(0, (item.streak || 1) - 1);
        }
        setLocal(STORAGE_KEYS.HABITS, list);

        // Award XP on complete
        if (item.completed) {
          const prof = this.getProfile();
          prof.xp += 25;
          this.saveProfile(prof);
        }
      }
      return list;
    },

    getChallenges: function () {
      return getLocal(STORAGE_KEYS.CHALLENGES, window.FITNEXA_DATA.challenges);
    },

    joinChallenge: function (challengeId) {
      const list = this.getChallenges();
      const ch = list.find(c => c.id === challengeId);
      if (ch) {
        ch.isJoined = true;
        setLocal(STORAGE_KEYS.CHALLENGES, list);
        this.addNotification({
          title: 'Challenge Joined!',
          message: `You joined "${ch.title}". Give it your all!`,
          icon: '🎯',
          time: 'Just now'
        });
      }
      return list;
    },

    checkinChallengeDay: function (challengeId) {
      const list = this.getChallenges();
      const ch = list.find(c => c.id === challengeId);
      if (ch && ch.daysCompleted < ch.totalDays) {
        ch.daysCompleted++;
        setLocal(STORAGE_KEYS.CHALLENGES, list);
        const prof = this.getProfile();
        prof.xp += 50;
        this.saveProfile(prof);
      }
      return list;
    },

    getNutrition: function () {
      return getLocal(STORAGE_KEYS.NUTRITION, window.FITNEXA_DATA.nutrition);
    },

    addFoodItem: function (mealType, item) {
      const nutr = this.getNutrition();
      if (!nutr.meals[mealType]) nutr.meals[mealType] = [];
      nutr.meals[mealType].push(item);

      // Accumulate totals
      nutr.current.calories += Number(item.calories || 0);
      nutr.current.protein += Number(item.protein || 0);
      nutr.current.carbs += Number(item.carbs || 0);
      nutr.current.fats += Number(item.fat || 0);

      setLocal(STORAGE_KEYS.NUTRITION, nutr);
      return nutr;
    },

    addWater: function (liters = 0.25) {
      const prof = this.getProfile();
      prof.todayWaterLiters = parseFloat(((prof.todayWaterLiters || 2.1) + liters).toFixed(2));
      this.saveProfile(prof);

      const nutr = this.getNutrition();
      nutr.current.waterLiters = prof.todayWaterLiters;
      setLocal(STORAGE_KEYS.NUTRITION, nutr);
      return prof.todayWaterLiters;
    },

    getNotifications: function () {
      const defaults = [
        { id: 'n1', title: 'Workout Ready', message: 'Your Upper Body workout starts in 30 minutes.', icon: '💪', time: '10m ago', unread: true },
        { id: 'n2', title: '5-Day Streak Active', message: '🔥 You are on a 5-day streak! Keep the energy alive.', icon: '🔥', time: '1h ago', unread: true },
        { id: 'n3', title: 'New Challenge Open', message: 'The 30-Day Yoga Challenge is now live.', icon: '🎯', time: 'Yesterday', unread: false },
        { id: 'n4', title: 'Bench PR Broken', message: 'Your Bench Press increased by +5 kg. Outstanding!', icon: '⚡', time: '2 days ago', unread: false }
      ];
      return getLocal(STORAGE_KEYS.NOTIFICATIONS, defaults);
    },

    addNotification: function (notif) {
      const list = this.getNotifications();
      list.unshift({
        id: `n_${Date.now()}`,
        unread: true,
        time: 'Just now',
        ...notif
      });
      setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
      FitnexaApp.updateNotificationBadge();
    },

    markNotificationsAsRead: function () {
      const list = this.getNotifications();
      list.forEach(n => n.unread = false);
      setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
      FitnexaApp.updateNotificationBadge();
    },

    // Sync to backend & Supabase
    syncToBackend: async function () {
      try {
        const payload = {
          profile: this.getProfile(),
          workoutLogs: this.getWorkoutLogs().slice(0, 10),
          measurements: this.getMeasurements(),
          prs: this.getPRs(),
          habits: this.getHabits(),
          challenges: this.getChallenges()
        };

        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (err) {
        // Offline / server unreachable fallback
      }
    }
  };
})();

window.FitnexaStorage = FitnexaStorage;
