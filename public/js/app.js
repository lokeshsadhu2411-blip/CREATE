// ===================================================================
// FITNEXA AI: Main Application Controller & UI Orchestrator
// SPA routing, Theme Engine, Dynamic Views, Modals, Search, Habits,
// BMI/BMR Calculators, and Gamification
// ===================================================================

const FitnexaApp = (function () {
  let currentRoute = 'dashboard';
  let cursorFollower = null;

  // --- THEME ENGINE ---
  function initTheme() {
    const settings = FitnexaStorage.getSettings();
    applyTheme(settings.theme || 'theme-dark');
    applyDensity(settings.density || 'comfortable');
    applyReducedMotion(settings.reducedMotion);
    initCursorEffects(settings.cursorEffects);
  }

  function applyTheme(themeName) {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-midnight', 'theme-energy', 'theme-minimal');
    root.classList.add(themeName);
    FitnexaStorage.saveSettings({ theme: themeName });

    // Update active state in theme buttons
    document.querySelectorAll('.btn-theme-choice').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-theme') === themeName);
    });

    // Re-render charts with new theme palette if in progress view
    if (currentRoute === 'progress' && window.FitnexaCharts) {
      setTimeout(() => window.FitnexaCharts.renderAll(), 150);
    }
  }

  function applyDensity(density) {
    const root = document.documentElement;
    root.classList.remove('density-comfortable', 'density-compact');
    root.classList.add(`density-${density}`);
    FitnexaStorage.saveSettings({ density });
  }

  function applyReducedMotion(isReduced) {
    const root = document.documentElement;
    root.classList.toggle('reduced-motion', !!isReduced);
    FitnexaStorage.saveSettings({ reducedMotion: !!isReduced });
  }

  // --- CURSOR EFFECT (Desktop subtle glow follower) ---
  function initCursorEffects(enabled) {
    // Disable on touch devices automatically
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    if (!cursorFollower) {
      cursorFollower = document.createElement('div');
      cursorFollower.id = 'fitnexa-cursor-follower';
      cursorFollower.className = 'cursor-glow';
      document.body.appendChild(cursorFollower);

      let mouseX = -100, mouseY = -100;
      let curX = -100, curY = -100;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function loop() {
        curX += (mouseX - curX) * 0.15;
        curY += (mouseY - curY) * 0.15;
        if (cursorFollower) {
          cursorFollower.style.transform = `translate3d(${curX - 15}px, ${curY - 15}px, 0)`;
        }
        requestAnimationFrame(loop);
      }
      loop();
    }

    if (cursorFollower) {
      cursorFollower.style.display = enabled ? 'block' : 'none';
    }
  }

  // --- SPA ROUTING ---
  function navigateTo(routeId) {
    currentRoute = routeId;
    window.location.hash = `#${routeId}`;

    // Hide all view panels
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

    // Show selected panel
    const target = document.getElementById(`view-${routeId}`);
    if (target) {
      target.classList.add('active');
    }

    // Update navigation active states
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(el => {
      const r = el.getAttribute('data-route');
      el.classList.toggle('active', r === routeId);
    });

    // Close mobile drawer if open
    closeMobileMenu();

    // Trigger route-specific initializers
    if (routeId === 'dashboard') renderDashboardView();
    if (routeId === 'coach') FitnexaCoach.init();
    if (routeId === 'workouts') renderWorkoutsView();
    if (routeId === 'exercises') renderExercisesView();
    if (routeId === 'nutrition') renderNutritionView();
    if (routeId === 'progress') {
      renderProgressView();
      setTimeout(() => window.FitnexaCharts.renderAll(), 100);
    }
    if (routeId === 'challenges') renderChallengesView();
    if (routeId === 'recovery') FitnexaMuscleMap.init();
    if (routeId === 'profile') renderProfileView();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- DASHBOARD VIEW ---
  function renderDashboardView() {
    const profile = FitnexaStorage.getProfile();

    // Greeting
    const greetingEl = document.getElementById('dash-greeting');
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon';
    else if (hour >= 17) timeGreeting = 'Good Evening';

    if (greetingEl) {
      greetingEl.innerHTML = `${timeGreeting}, <span class="text-gradient">${profile.name}</span> 👋`;
    }

    // Summary Cards
    const elCal = document.getElementById('dash-cal-val');
    const elWork = document.getElementById('dash-workout-val');
    const elWater = document.getElementById('dash-water-val');
    const elSleep = document.getElementById('dash-sleep-val');
    const elSteps = document.getElementById('dash-steps-val');

    if (elCal) elCal.textContent = `${profile.todayCaloriesBurned || 420} kcal`;
    if (elWork) elWork.textContent = `${profile.todayWorkoutMinutes || 45} min`;
    if (elWater) elWater.textContent = `${profile.todayWaterLiters || 2.1} L / 3.0 L`;
    if (elSleep) elSleep.textContent = profile.todaySleep || '7h 20m';
    if (elSteps) elSteps.textContent = (profile.todaySteps || 7842).toLocaleString();

    // Gamification level & streak
    const elLvl = document.getElementById('dash-level-val');
    const elXp = document.getElementById('dash-xp-val');
    const elStreak = document.getElementById('dash-streak-val');

    if (elLvl) elLvl.textContent = `Level ${profile.level || 12}`;
    if (elXp) elXp.textContent = `${profile.xp || 1240} XP`;
    if (elStreak) elStreak.textContent = `🔥 ${profile.streakDays || 7} Day Streak`;

    // Render Daily Habits list in Dashboard
    renderHabitsList();
  }

  // --- HABIT TRACKER ---
  function renderHabitsList() {
    const list = FitnexaStorage.getHabits();
    const container = document.getElementById('dash-habits-container');
    if (!container) return;

    container.innerHTML = list.map(h => `
      <div class="habit-item-card card-glass ${h.completed ? 'completed' : ''}" onclick="FitnexaApp.toggleHabit('${h.key}')">
        <div class="flex items-center gap-3">
          <div class="habit-checkbox ${h.completed ? 'checked' : ''}">
            ${h.completed ? '✓' : ''}
          </div>
          <div>
            <div class="font-bold text-sm ${h.completed ? 'line-through text-muted' : ''}">${h.icon} ${h.title}</div>
            <div class="text-xs text-muted">Streak: ${h.streak || 0} days</div>
          </div>
        </div>
        <span class="badge-mini ${h.completed ? 'text-primary' : 'text-muted'}">${h.completed ? 'Done' : '+25 XP'}</span>
      </div>
    `).join('');
  }

  function toggleHabit(habitKey) {
    FitnexaStorage.toggleHabit(habitKey);
    FitnexaAudio.playSetComplete();
    renderHabitsList();
    renderDashboardView();
  }

  // --- WORKOUTS VIEW ---
  function renderWorkoutsView(filterCategory = 'all') {
    const list = window.FITNEXA_DATA.workouts;
    const container = document.getElementById('workouts-cards-grid');
    if (!container) return;

    const filtered = filterCategory === 'all' ? list : list.filter(w => w.category.toLowerCase() === filterCategory.toLowerCase());

    container.innerHTML = filtered.map(w => `
      <div class="workout-card card-glass animate-fade-in">
        <div class="flex justify-between items-start mb-2">
          <span class="badge-mini uppercase tracking-wider">${w.category} • ${w.difficulty}</span>
          ${w.badge ? `<span class="badge-status status-ready">${w.badge}</span>` : ''}
        </div>
        <h3 class="text-xl font-bold mt-1">${w.title}</h3>
        <p class="text-xs text-muted mt-1 leading-relaxed">${w.description}</p>

        <div class="workout-metrics-row my-3">
          <span>⏱️ ${w.durationMin} mins</span>
          <span>🔥 ~${w.caloriesBurn} kcal</span>
          <span>💪 ${w.exercises.length} Exercises</span>
        </div>

        <div class="exercise-preview-chips">
          ${w.exercises.slice(0, 3).map(ex => `<span class="chip-sm">${ex.name}</span>`).join('')}
          ${w.exercises.length > 3 ? `<span class="chip-sm">+${w.exercises.length - 3} more</span>` : ''}
        </div>

        <div class="mt-4 pt-3 border-t border-glass flex gap-2">
          <button type="button" class="btn-primary flex-1 font-bold" onclick="FitnexaPlayer.startWorkout(FITNEXA_DATA.workouts.find(i => i.id === '${w.id}'))">
            🚀 Start Workout
          </button>
          <button type="button" class="btn-secondary btn-icon" onclick="FitnexaApp.previewWorkout('${w.id}')" title="View details">
            👁️
          </button>
        </div>
      </div>
    `).join('');

    // Also render Calisthenics Progression Trees in workouts tab
    renderCalisthenicsTrees();
  }

  function filterWorkouts(cat, btn) {
    document.querySelectorAll('.btn-workout-filter').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderWorkoutsView(cat);
  }

  function previewWorkout(workoutId) {
    const w = window.FITNEXA_DATA.workouts.find(i => i.id === workoutId);
    if (!w) return;

    const modal = document.getElementById('generic-detail-modal');
    const body = document.getElementById('generic-detail-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div>
        <span class="badge-mini uppercase">${w.category} • ${w.difficulty}</span>
        <h2 class="text-2xl font-bold mt-1">${w.title}</h2>
        <p class="text-xs text-muted mt-1">${w.description}</p>

        <div class="summary-stats-grid my-4">
          <div class="stat-card card-glass">
            <span class="text-xs text-muted">Duration</span>
            <span class="font-bold text-accent">${w.durationMin} mins</span>
          </div>
          <div class="stat-card card-glass">
            <span class="text-xs text-muted">Est. Calories</span>
            <span class="font-bold text-primary">${w.caloriesBurn} kcal</span>
          </div>
        </div>

        <h4 class="text-sm font-bold uppercase text-muted tracking-wider mb-2">Exercise Lineup (${w.exercises.length})</h4>
        <div class="plan-exercise-list">
          ${w.exercises.map((ex, i) => `
            <div class="plan-exercise-item card-glass">
              <div>
                <span class="font-bold">${i + 1}. ${ex.name}</span>
                <div class="text-xs text-muted">Target: ${ex.target || 'General'}</div>
              </div>
              <div class="text-right font-mono font-bold text-sm">
                ${ex.sets} × ${ex.reps} reps (Rest: ${ex.rest || 60}s)
              </div>
            </div>
          `).join('')}
        </div>

        <button type="button" class="btn-primary w-full mt-6 btn-lg font-bold" onclick="FitnexaApp.closeGenericModal(); FitnexaPlayer.startWorkout(FITNEXA_DATA.workouts.find(i => i.id === '${w.id}'))">
          🚀 Launch Workout Session
        </button>
      </div>
    `;

    modal.classList.add('open');
  }

  // --- CALISTHENICS PROGRESSION TREES ---
  function renderCalisthenicsTrees() {
    const container = document.getElementById('calisthenics-trees-container');
    if (!container) return;

    const trees = window.FITNEXA_DATA.calisthenicsTrees;
    container.innerHTML = trees.map(tree => `
      <div class="calisthenics-tree-card card-glass mt-4">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-bold">${tree.name}</h3>
          <span class="badge-mini text-primary uppercase">${tree.category} Mastery</span>
        </div>
        <div class="progression-steps-track">
          ${tree.steps.map(step => `
            <div class="progression-step-node ${step.unlocked ? 'unlocked' : 'locked'} ${step.current ? 'current-step' : ''}" onclick="FitnexaApp.openExerciseById('${step.exerciseId}')">
              <div class="step-circle">
                ${step.unlocked ? (step.current ? '📍' : '✓') : '🔒'}
              </div>
              <div class="step-info">
                <div class="step-title">${step.name}</div>
                <div class="step-sub">${step.reps}</div>
                ${step.milestone ? `<span class="badge-milestone">${step.milestone}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // --- EXERCISES VIEW ---
  function renderExercisesView() {
    const searchInput = document.getElementById('exercise-search-input');
    const muscleSelect = document.getElementById('exercise-filter-muscle');
    const equipSelect = document.getElementById('exercise-filter-equip');
    const diffSelect = document.getElementById('exercise-filter-diff');
    const typeSelect = document.getElementById('exercise-filter-type');

    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const muscle = muscleSelect ? muscleSelect.value : 'all';
    const equip = equipSelect ? equipSelect.value : 'all';
    const diff = diffSelect ? diffSelect.value : 'all';
    const type = typeSelect ? typeSelect.value : 'all';

    const exercises = window.FITNEXA_DATA.exercises;
    const filtered = exercises.filter(ex => {
      const matchQuery = !query || ex.name.toLowerCase().includes(query) || ex.target.toLowerCase().includes(query);
      const matchMuscle = muscle === 'all' || ex.target.toLowerCase() === muscle.toLowerCase();
      const matchEquip = equip === 'all' || ex.equipment.toLowerCase() === equip.toLowerCase();
      const matchDiff = diff === 'all' || ex.difficulty.toLowerCase() === diff.toLowerCase();
      const matchType = type === 'all' || ex.type.toLowerCase() === type.toLowerCase();
      return matchQuery && matchMuscle && matchEquip && matchDiff && matchType;
    });

    const grid = document.getElementById('exercise-cards-grid');
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-box card-glass col-span-full text-center py-10">
          <div class="text-4xl">🔍</div>
          <h3 class="text-lg font-bold mt-2">No matching exercises found</h3>
          <p class="text-xs text-muted mt-1">Try resetting your filters or search query.</p>
          <button type="button" class="btn-secondary btn-sm mt-3" onclick="FitnexaApp.resetExerciseFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(ex => `
      <div class="exercise-card card-glass clickable-card animate-fade-in" onclick="FitnexaApp.openExerciseById('${ex.id}')">
        <div class="flex justify-between items-start mb-2">
          <span class="badge-mini uppercase">${ex.type}</span>
          <span class="badge-pill">${ex.difficulty}</span>
        </div>
        <h3 class="text-lg font-bold">${ex.name}</h3>
        <div class="exercise-card-meta mt-1">
          <span>Target: <strong class="text-primary">${ex.target}</strong></span> • 
          <span>Equip: <strong>${ex.equipment}</strong></span>
        </div>
        <div class="text-xs text-muted mt-2 line-clamp-2">
          ${ex.instructions[0] || ''}
        </div>
        <div class="mt-3 pt-2 border-t border-glass flex justify-between items-center text-xs text-accent font-semibold">
          <span>View Guide & Form Tips</span>
          <span>→</span>
        </div>
      </div>
    `).join('');
  }

  function resetExerciseFilters() {
    ['exercise-search-input', 'exercise-filter-muscle', 'exercise-filter-equip', 'exercise-filter-diff', 'exercise-filter-type'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = id === 'exercise-search-input' ? '' : 'all';
    });
    renderExercisesView();
  }

  function openExerciseById(exerciseId) {
    const ex = window.FITNEXA_DATA.exercises.find(i => i.id === exerciseId);
    if (!ex) return;
    openExerciseModal(ex);
  }

  function openExerciseByName(exerciseName) {
    const ex = window.FITNEXA_DATA.exercises.find(i => i.name.toLowerCase().includes(exerciseName.toLowerCase()));
    if (!ex) {
      alert(`Exercise details for "${exerciseName}" not found in current library.`);
      return;
    }
    openExerciseModal(ex);
  }

  function openExerciseModal(ex) {
    const modal = document.getElementById('generic-detail-modal');
    const body = document.getElementById('generic-detail-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div>
        <div class="flex justify-between items-start">
          <div>
            <span class="badge-mini uppercase tracking-wider">${ex.type} • ${ex.difficulty}</span>
            <h2 class="text-2xl font-bold mt-1">${ex.name}</h2>
          </div>
          <span class="badge-status status-ready font-bold">${ex.equipment}</span>
        </div>

        <div class="summary-stats-grid my-3">
          <div class="stat-card card-glass">
            <span class="text-xs text-muted">Primary Muscle</span>
            <span class="font-bold text-primary">${ex.target}</span>
          </div>
          <div class="stat-card card-glass">
            <span class="text-xs text-muted">Secondary Muscles</span>
            <span class="font-bold">${(ex.secondary || []).join(', ') || 'None'}</span>
          </div>
        </div>

        <div class="card-glass p-3 my-3 border-l-4 border-accent">
          <span class="text-xs font-bold uppercase text-accent">Recommended Scheme</span>
          <div class="font-mono text-sm font-bold mt-1">${ex.recommendation}</div>
        </div>

        <div class="mt-4">
          <h4 class="text-xs uppercase font-bold text-muted tracking-wider mb-2">Step-by-Step Instructions</h4>
          <ol class="ordered-step-list">
            ${ex.instructions.map((step, i) => `<li><span class="step-bullet">${i + 1}</span> ${step}</li>`).join('')}
          </ol>
        </div>

        ${ex.mistakes && ex.mistakes.length > 0 ? `
          <div class="mt-4">
            <h4 class="text-xs uppercase font-bold text-danger tracking-wider mb-2">Common Mistakes to Avoid</h4>
            <ul class="mistake-list">
              ${ex.mistakes.map(m => `<li>⚠️ ${m}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${ex.safety ? `
          <div class="mt-4 p-3 card-glass border-l-4 border-yellow-500 text-xs">
            <strong class="text-yellow-400">Safety Tip:</strong> ${ex.safety}
          </div>
        ` : ''}

        <button type="button" class="btn-primary w-full mt-6 btn-lg font-bold" onclick="FitnexaApp.closeGenericModal(); FitnexaPlayer.startWorkout({ title: '${ex.name} Focus', category: '${ex.type}', exercises: [{ name: '${ex.name}', sets: 4, reps: 10, rest: 60, target: '${ex.target}', weight: 20 }] })">
          🚀 Practice This Exercise Now
        </button>
      </div>
    `;

    modal.classList.add('open');
  }

  function closeGenericModal() {
    const modal = document.getElementById('generic-detail-modal');
    if (modal) modal.classList.remove('open');
  }

  // --- NUTRITION VIEW ---
  function renderNutritionView() {
    const nutr = FitnexaStorage.getNutrition();
    const prof = FitnexaStorage.getProfile();

    // Macro Meters
    const elCal = document.getElementById('nutr-cal-val');
    const elProt = document.getElementById('nutr-prot-val');
    const elCarb = document.getElementById('nutr-carb-val');
    const elFat = document.getElementById('nutr-fat-val');
    const elWater = document.getElementById('nutr-water-val');

    if (elCal) elCal.textContent = `${nutr.current.calories} / ${nutr.goals.calories} kcal`;
    if (elProt) elProt.textContent = `${nutr.current.protein} / ${nutr.goals.protein} g`;
    if (elCarb) elCarb.textContent = `${nutr.current.carbs} / ${nutr.goals.carbs} g`;
    if (elFat) elFat.textContent = `${nutr.current.fats} / ${nutr.goals.fats} g`;
    if (elWater) elWater.textContent = `${prof.todayWaterLiters || 2.1} L / 3.0 L`;

    // Progress Bars
    const setBar = (id, cur, goal) => {
      const el = document.getElementById(id);
      if (el) el.style.width = `${Math.min(100, Math.round((cur / goal) * 100))}%`;
    };
    setBar('nutr-cal-bar', nutr.current.calories, nutr.goals.calories);
    setBar('nutr-prot-bar', nutr.current.protein, nutr.goals.protein);
    setBar('nutr-carb-bar', nutr.current.carbs, nutr.goals.carbs);
    setBar('nutr-fat-bar', nutr.current.fats, nutr.goals.fats);

    // Meals Listing
    const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
    meals.forEach(meal => {
      const container = document.getElementById(`meal-items-${meal}`);
      if (container) {
        const items = nutr.meals[meal] || [];
        if (items.length === 0) {
          container.innerHTML = `<span class="text-xs text-muted">No items logged yet.</span>`;
        } else {
          container.innerHTML = items.map(item => `
            <div class="meal-food-row">
              <span class="font-medium">${item.name}</span>
              <span class="text-xs text-muted">${item.calories} kcal • ${item.protein}g P</span>
            </div>
          `).join('');
        }
      }
    });
  }

  function addWaterLog(liters = 0.25) {
    FitnexaStorage.addWater(liters);
    FitnexaAudio.playTap();
    renderNutritionView();
    renderDashboardView();
  }

  function openAddFoodModal(mealType = 'breakfast') {
    const modal = document.getElementById('add-food-modal');
    const select = document.getElementById('food-meal-type-select');
    if (select) select.value = mealType;

    // Render popular food list in modal
    const popList = document.getElementById('popular-food-suggestions');
    if (popList) {
      popList.innerHTML = window.FITNEXA_DATA.nutrition.popularFoods.map(food => `
        <div class="food-suggestion-chip card-glass" onclick="FitnexaApp.selectPopularFood('${food.name}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fat})">
          <div class="font-bold text-xs">${food.name}</div>
          <div class="text-muted text-xs">${food.calories} kcal • ${food.protein}g Prot</div>
        </div>
      `).join('');
    }

    if (modal) modal.classList.add('open');
  }

  function closeAddFoodModal() {
    const modal = document.getElementById('add-food-modal');
    if (modal) modal.classList.remove('open');
  }

  function selectPopularFood(name, cal, prot, carb, fat) {
    document.getElementById('food-name-input').value = name;
    document.getElementById('food-cal-input').value = cal;
    document.getElementById('food-prot-input').value = prot;
    document.getElementById('food-carb-input').value = carb;
    document.getElementById('food-fat-input').value = fat;
  }

  function submitFoodLog() {
    const mealType = document.getElementById('food-meal-type-select')?.value || 'breakfast';
    const name = document.getElementById('food-name-input')?.value.trim();
    const calories = parseInt(document.getElementById('food-cal-input')?.value, 10) || 0;
    const protein = parseFloat(document.getElementById('food-prot-input')?.value) || 0;
    const carbs = parseFloat(document.getElementById('food-carb-input')?.value) || 0;
    const fat = parseFloat(document.getElementById('food-fat-input')?.value) || 0;

    if (!name) {
      alert('Please enter a food name.');
      return;
    }

    FitnexaStorage.addFoodItem(mealType, { name, calories, protein, carbs, fat });
    FitnexaAudio.playSetComplete();
    closeAddFoodModal();
    renderNutritionView();
  }

  // --- PROGRESS VIEW ---
  function renderProgressView() {
    // Render Measurements list
    const measurements = FitnexaStorage.getMeasurements();
    const mContainer = document.getElementById('measurements-table-body');
    if (mContainer) {
      const sorted = [...measurements].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
      mContainer.innerHTML = sorted.map((m, idx) => {
        const prev = sorted[idx + 1];
        let diffHtml = '';
        if (prev) {
          const delta = (m.weightKg - prev.weightKg).toFixed(1);
          diffHtml = delta < 0
            ? `<span class="text-primary font-bold">↓ ${Math.abs(delta)} kg</span>`
            : delta > 0
            ? `<span class="text-accent font-bold">↑ ${delta} kg</span>`
            : `<span class="text-muted">= 0 kg</span>`;
        }
        return `
          <tr class="border-b border-glass">
            <td class="py-2 text-xs">${new Date(m.recordedAt).toLocaleDateString()}</td>
            <td class="py-2 font-bold">${m.weightKg} kg</td>
            <td class="py-2 text-xs">${diffHtml}</td>
            <td class="py-2 text-xs">${m.waistCm || '-'} cm</td>
            <td class="py-2 text-xs">${m.bodyFatPct || '-'}%</td>
            <td class="py-2 text-xs text-muted">${m.notes || '-'}</td>
          </tr>
        `;
      }).join('');
    }

    // Render PRs list
    renderPRsList();
  }

  function renderPRsList() {
    const prs = FitnexaStorage.getPRs();
    const container = document.getElementById('prs-grid-container');
    if (!container) return;

    container.innerHTML = prs.map(pr => `
      <div class="pr-card card-glass animate-fade-in">
        <div class="flex justify-between items-center mb-1">
          <span class="font-bold text-sm">${pr.exerciseName}</span>
          <span class="badge-mini text-accent">${pr.delta || 'Personal Best'}</span>
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-2xl font-extrabold text-gradient">${pr.currentPr}</span>
          <span class="text-sm text-muted">${pr.unit}</span>
        </div>
        <div class="text-xs text-muted mt-2 flex justify-between">
          <span>Previous: ${pr.previousPr || '-'} ${pr.unit}</span>
          <span>${pr.date || 'Recent'}</span>
        </div>
      </div>
    `).join('');
  }

  function openAddMeasurementModal() {
    const modal = document.getElementById('add-measurement-modal');
    if (modal) modal.classList.add('open');
  }

  function closeAddMeasurementModal() {
    const modal = document.getElementById('add-measurement-modal');
    if (modal) modal.classList.remove('open');
  }

  function submitMeasurement() {
    const weight = parseFloat(document.getElementById('m-weight')?.value);
    const chest = parseFloat(document.getElementById('m-chest')?.value) || null;
    const waist = parseFloat(document.getElementById('m-waist')?.value) || null;
    const arms = parseFloat(document.getElementById('m-arms')?.value) || null;
    const thighs = parseFloat(document.getElementById('m-thighs')?.value) || null;
    const bf = parseFloat(document.getElementById('m-bf')?.value) || null;
    const notes = document.getElementById('m-notes')?.value || '';

    if (!weight) {
      alert('Please enter weight in kg.');
      return;
    }

    FitnexaStorage.addMeasurement({
      weightKg: weight,
      chestCm: chest,
      waistCm: waist,
      armsCm: arms,
      thighsCm: thighs,
      bodyFatPct: bf,
      notes
    });

    FitnexaAudio.playSetComplete();
    closeAddMeasurementModal();
    renderProgressView();
    renderDashboardView();
  }

  function openAddPRModal() {
    const modal = document.getElementById('add-pr-modal');
    if (modal) modal.classList.add('open');
  }

  function closeAddPRModal() {
    const modal = document.getElementById('add-pr-modal');
    if (modal) modal.classList.remove('open');
  }

  function submitPR() {
    const name = document.getElementById('pr-exercise-name')?.value.trim();
    const current = parseFloat(document.getElementById('pr-current-val')?.value);
    const prev = parseFloat(document.getElementById('pr-prev-val')?.value) || 0;
    const unit = document.getElementById('pr-unit-val')?.value || 'kg';

    if (!name || isNaN(current)) {
      alert('Please fill out exercise name and current record.');
      return;
    }

    FitnexaStorage.savePR({
      exerciseName: name,
      currentPr: current,
      previousPr: prev,
      unit,
      delta: prev > 0 ? `+${(current - prev).toFixed(1)} ${unit}` : 'New Record'
    });

    // Celebration Fanfare & Confetti!
    FitnexaAudio.playCelebration();
    FitnexaConfetti.burst(100);

    closeAddPRModal();
    renderPRsList();
  }

  // --- BMI & BMR CALCULATOR ---
  function openBmiCalculator() {
    const modal = document.getElementById('bmi-calculator-modal');
    const prof = FitnexaStorage.getProfile();
    if (modal) {
      document.getElementById('calc-height').value = prof.heightCm || 180;
      document.getElementById('calc-weight').value = prof.weightKg || 72;
      document.getElementById('calc-age').value = prof.age || 26;
      modal.classList.add('open');
      computeBmi();
    }
  }

  function closeBmiCalculator() {
    const modal = document.getElementById('bmi-calculator-modal');
    if (modal) modal.classList.remove('open');
  }

  function computeBmi() {
    const h = parseFloat(document.getElementById('calc-height')?.value) / 100;
    const w = parseFloat(document.getElementById('calc-weight')?.value);
    const age = parseInt(document.getElementById('calc-age')?.value, 10) || 26;
    const gender = document.getElementById('calc-gender')?.value || 'male';
    const activity = parseFloat(document.getElementById('calc-activity')?.value) || 1.55;

    if (!h || !w || h <= 0 || w <= 0) return;

    // BMI
    const bmi = (w / (h * h)).toFixed(1);
    let category = 'Normal Weight';
    let catClass = 'status-ready';

    if (bmi < 18.5) {
      category = 'Underweight';
      catClass = 'status-recovering';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      catClass = 'status-recovering';
    } else if (bmi >= 30) {
      category = 'Obesity Class';
      catClass = 'status-fatigued';
    }

    // BMR (Mifflin-St Jeor formula)
    let bmr = (10 * w) + (6.25 * (h * 100)) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;
    const maintenance = Math.round(bmr * activity);

    const elBmi = document.getElementById('calc-res-bmi');
    const elCat = document.getElementById('calc-res-cat');
    const elBmr = document.getElementById('calc-res-bmr');
    const elMaint = document.getElementById('calc-res-maint');
    const elCut = document.getElementById('calc-res-cut');
    const elBulk = document.getElementById('calc-res-bulk');

    if (elBmi) elBmi.textContent = bmi;
    if (elCat) {
      elCat.textContent = category;
      elCat.className = `badge-status ${catClass}`;
    }
    if (elBmr) elBmr.textContent = `${Math.round(bmr)} kcal/day`;
    if (elMaint) elMaint.textContent = `${maintenance} kcal`;
    if (elCut) elCut.textContent = `${maintenance - 400} kcal`;
    if (elBulk) elBulk.textContent = `${maintenance + 300} kcal`;
  }

  // --- CHALLENGES VIEW ---
  function renderChallengesView() {
    const list = FitnexaStorage.getChallenges();
    const container = document.getElementById('challenges-grid-container');
    if (!container) return;

    container.innerHTML = list.map(c => `
      <div class="challenge-card card-glass animate-fade-in">
        <div class="flex justify-between items-start mb-2">
          <span class="badge-mini uppercase tracking-wider">${c.category}</span>
          <span class="badge-status ${c.isJoined ? 'status-ready' : ''}">${c.isJoined ? 'Active Challenge' : 'Open'}</span>
        </div>
        <h3 class="text-xl font-bold">${c.title}</h3>
        <p class="text-xs text-muted mt-1">${c.description}</p>

        <div class="challenge-progress-bar-wrap my-4">
          <div class="flex justify-between text-xs mb-1">
            <span>Progress: <strong>${c.daysCompleted} / ${c.totalDays} Days</strong></span>
            <span class="font-bold text-accent">${Math.round((c.daysCompleted / c.totalDays) * 100)}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-val" style="width: ${(c.daysCompleted / c.totalDays) * 100}%;"></div>
          </div>
        </div>

        <div class="reward-pill card-glass text-xs p-2 flex items-center gap-2">
          <span>🎁</span>
          <span>Reward: <strong>${c.reward}</strong></span>
        </div>

        <div class="mt-4 pt-3 border-t border-glass flex gap-2">
          ${c.isJoined ? `
            <button type="button" class="btn-primary flex-1 font-bold" onclick="FitnexaApp.checkinChallenge('${c.id}')" ${c.daysCompleted >= c.totalDays ? 'disabled' : ''}>
              ${c.daysCompleted >= c.totalDays ? '🎉 Completed!' : '✓ Check-in Today'}
            </button>
          ` : `
            <button type="button" class="btn-primary flex-1 font-bold" onclick="FitnexaApp.joinChallenge('${c.id}')">
              🎯 Join Challenge
            </button>
          `}
        </div>
      </div>
    `).join('');
  }

  function joinChallenge(id) {
    FitnexaStorage.joinChallenge(id);
    FitnexaAudio.playCelebration();
    FitnexaConfetti.burst(50);
    renderChallengesView();
  }

  function checkinChallenge(id) {
    FitnexaStorage.checkinChallengeDay(id);
    FitnexaAudio.playSetComplete();
    FitnexaConfetti.burst(30);
    renderChallengesView();
    renderDashboardView();
  }

  // --- PROFILE VIEW ---
  function renderProfileView() {
    const prof = FitnexaStorage.getProfile();
    const badges = window.FITNEXA_DATA.badges;

    document.getElementById('prof-name-display').textContent = prof.name;
    document.getElementById('prof-goal-display').textContent = prof.goal;
    document.getElementById('prof-level-display').textContent = `Level ${prof.level} Athlete`;
    document.getElementById('prof-xp-display').textContent = `${prof.xp} XP`;
    document.getElementById('prof-streak-display').textContent = `${prof.streakDays} Days`;
    document.getElementById('prof-weight-display').textContent = `${prof.weightKg} kg`;
    document.getElementById('prof-height-display').textContent = `${prof.heightCm} cm`;
    document.getElementById('prof-freq-display').textContent = `${prof.weeklyDays} days/wk`;

    // Render Badges
    const badgeContainer = document.getElementById('prof-badges-grid');
    if (badgeContainer) {
      badgeContainer.innerHTML = badges.map(b => `
        <div class="badge-item-card card-glass ${b.unlocked ? 'unlocked' : 'locked'}">
          <div class="badge-icon-box text-3xl">${b.icon}</div>
          <div class="mt-2 font-bold text-xs">${b.name}</div>
          <div class="text-xs text-muted mt-1 leading-tight">${b.desc}</div>
          <div class="mt-2 text-xs font-semibold ${b.unlocked ? 'text-primary' : 'text-muted'}">
            ${b.unlocked ? '✓ Unlocked' : b.progress}
          </div>
        </div>
      `).join('');
    }
  }

  function openEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    const prof = FitnexaStorage.getProfile();
    if (modal) {
      document.getElementById('edit-prof-name').value = prof.name || 'Alex';
      document.getElementById('edit-prof-goal').value = prof.goal || 'Build Muscle';
      document.getElementById('edit-prof-level').value = prof.fitnessLevel || 'Intermediate';
      document.getElementById('edit-prof-weight').value = prof.weightKg || 72;
      document.getElementById('edit-prof-height').value = prof.heightCm || 180;
      document.getElementById('edit-prof-days').value = prof.weeklyDays || 5;
      modal.classList.add('open');
    }
  }

  function closeEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) modal.classList.remove('open');
  }

  function submitEditProfile() {
    const name = document.getElementById('edit-prof-name')?.value.trim();
    const goal = document.getElementById('edit-prof-goal')?.value;
    const level = document.getElementById('edit-prof-level')?.value;
    const weight = parseFloat(document.getElementById('edit-prof-weight')?.value);
    const height = parseFloat(document.getElementById('edit-prof-height')?.value);
    const days = parseInt(document.getElementById('edit-prof-days')?.value, 10);

    FitnexaStorage.saveProfile({
      name: name || 'Alex',
      goal,
      fitnessLevel: level,
      weightKg: weight,
      heightCm: height,
      weeklyDays: days
    });

    closeEditProfileModal();
    renderProfileView();
    renderDashboardView();
  }

  // --- SETTINGS MODAL ---
  function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const settings = FitnexaStorage.getSettings();
    if (modal) {
      document.getElementById('set-density-select').value = settings.density || 'comfortable';
      document.getElementById('set-sound-toggle').checked = !!settings.soundEnabled;
      document.getElementById('set-cursor-toggle').checked = !!settings.cursorEffects;
      document.getElementById('set-motion-toggle').checked = !!settings.reducedMotion;
      document.getElementById('set-gemini-key').value = settings.googleApiKey || '';
      document.getElementById('set-supabase-url').value = settings.supabaseUrl || '';
      document.getElementById('set-supabase-key').value = settings.supabaseAnonKey || '';

      // Populate account info
      try {
        let session = null;
        try {
          const raw = localStorage.getItem('vesper_session');
          if (raw) session = JSON.parse(raw);
        } catch (e) {}

        const profile = FitnexaStorage.getProfile();
        const userNameEl = document.getElementById('settings-user-name');
        const userEmailEl = document.getElementById('settings-user-email');
        const userAvatarEl = document.getElementById('settings-user-avatar');

        const displayName = (session && session.name) || (profile && profile.name) || 'Alex Mercer';
        const displayEmail = (session && session.email) || localStorage.getItem('vesper_remembered_email') || 'alex@enterprise.com';

        if (userNameEl) userNameEl.textContent = displayName;
        if (userEmailEl) userEmailEl.textContent = displayEmail;
        if (userAvatarEl) userAvatarEl.textContent = (displayName[0] || 'A').toUpperCase();
      } catch (err) {
        console.warn('Error populating user info in settings:', err);
      }

      modal.classList.add('open');
      testBackendConnections();
    }
  }

  function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('open');
  }

  function logout() {
    if (!window.confirm('Are you sure you want to log out of your session?')) {
      return;
    }

    try {
      localStorage.removeItem('vesper_session');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error clearing session:', e);
    }

    closeSettingsModal();
    window.location.href = 'login.html?logged_out=1';
  }

  function togglePasswordVisibility(fieldId, btn) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    if (field.type === 'password') {
      field.type = 'text';
      btn.textContent = '🔒';
    } else {
      field.type = 'password';
      btn.textContent = '👁️';
    }
  }

  async function testGeminiKeyLive() {
    const keyInput = document.getElementById('set-gemini-key');
    const feedback = document.getElementById('gemini-test-feedback');
    const key = keyInput ? keyInput.value.trim() : '';

    if (!key) {
      if (feedback) feedback.innerHTML = `<span class="text-warning">⚠️ Please enter a Google Gemini API Key first.</span>`;
      return;
    }

    if (feedback) feedback.innerHTML = `<span class="text-muted"><span class="spinner-sm"></span> Testing Google Gemini connection...</span>`;

    try {
      const res = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (feedback) {
          feedback.innerHTML = `<span class="text-primary font-semibold">🟢 Success! ${data.message} (${data.latencyMs}ms)</span>`;
        }
        const tag = document.getElementById('gemini-status-tag');
        if (tag) {
          tag.textContent = 'Active 🟢';
          tag.className = 'badge-status status-ready';
        }
      } else {
        if (feedback) {
          feedback.innerHTML = `<span class="text-danger font-semibold">🔴 Error: ${data.message || 'Key validation failed.'}</span>`;
        }
      }
    } catch (err) {
      if (feedback) feedback.innerHTML = `<span class="text-danger">Failed to reach server: ${err.message}</span>`;
    }
  }

  async function testSupabaseLive() {
    const urlInput = document.getElementById('set-supabase-url');
    const keyInput = document.getElementById('set-supabase-key');
    const feedback = document.getElementById('supabase-test-feedback');

    const url = urlInput ? urlInput.value.trim() : '';
    const key = keyInput ? keyInput.value.trim() : '';

    if (!url || !key) {
      if (feedback) feedback.innerHTML = `<span class="text-warning">⚠️ Enter both Supabase Project URL and Anon Public Key.</span>`;
      return;
    }

    if (feedback) feedback.innerHTML = `<span class="text-muted"><span class="spinner-sm"></span> Pinging Supabase PostgreSQL...</span>`;

    try {
      const res = await fetch('/api/test-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseUrl: url, supabaseAnonKey: key })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (feedback) {
          feedback.innerHTML = `<span class="text-primary font-semibold">🟢 ${data.message}</span>`;
        }
        const tag = document.getElementById('supabase-status-tag');
        if (tag) {
          tag.textContent = `Connected 🟢 (${data.readyCount}/${data.totalCount} tables)`;
          tag.className = 'badge-status status-ready';
        }
      } else {
        if (feedback) {
          feedback.innerHTML = `<span class="text-danger font-semibold">🟡 ${data.message}</span>`;
        }
      }
    } catch (err) {
      if (feedback) feedback.innerHTML = `<span class="text-danger">Failed to ping Supabase: ${err.message}</span>`;
    }
  }

  async function copySupabaseSchema(btn) {
    try {
      const res = await fetch('/api/schema');
      const sql = await res.text();
      await navigator.clipboard.writeText(sql);
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ SQL Copied!';
      btn.classList.add('text-primary');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('text-primary');
      }, 2500);
      alert('Supabase SQL Schema copied to clipboard!\n\nPaste this directly into your Supabase Dashboard > SQL Editor > Run.');
    } catch (err) {
      alert('Could not copy automatically. You can copy the schema from supabase_schema.sql in the project root.');
    }
  }

  function saveSettingsForm() {
    const density = document.getElementById('set-density-select')?.value;
    const sound = document.getElementById('set-sound-toggle')?.checked;
    const cursor = document.getElementById('set-cursor-toggle')?.checked;
    const motion = document.getElementById('set-motion-toggle')?.checked;
    const geminiKey = document.getElementById('set-gemini-key')?.value.trim();
    const supabaseUrl = document.getElementById('set-supabase-url')?.value.trim();
    const supabaseKey = document.getElementById('set-supabase-key')?.value.trim();

    FitnexaStorage.saveSettings({
      density,
      soundEnabled: sound,
      cursorEffects: cursor,
      reducedMotion: motion,
      googleApiKey: geminiKey,
      supabaseUrl,
      supabaseAnonKey: supabaseKey
    });

    FitnexaAudio.setMuted(!sound);
    applyDensity(density);
    applyReducedMotion(motion);
    initCursorEffects(cursor);

    closeSettingsModal();
    alert('Settings saved and persisted to server!');
    if (window.FitnexaCoach) FitnexaCoach.checkAiStatus();
  }

  async function testBackendConnections() {
    const resEl = document.getElementById('settings-test-results');
    const geminiTag = document.getElementById('gemini-status-tag');
    const supabaseTag = document.getElementById('supabase-status-tag');

    if (resEl) resEl.innerHTML = `<span class="text-xs text-muted">Checking backend status...</span>`;

    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (resEl) {
        resEl.innerHTML = `
          <div class="mt-2 text-xs p-3 card-glass space-y-1">
            <div class="flex justify-between">
              <span>Google Gemini AI:</span>
              <strong class="${data.googleAi.configured ? 'text-primary' : 'text-warning'}">
                ${data.googleAi.configured ? '🟢 Active Key' : '🟡 Smart Fallback Active'}
              </strong>
            </div>
            <div class="flex justify-between">
              <span>Supabase Cloud DB:</span>
              <strong class="${data.supabase.connected ? 'text-primary' : 'text-warning'}">
                ${data.supabase.connected ? '🟢 Connected' : '🟡 Local Storage Active'}
              </strong>
            </div>
            <div class="text-muted text-micro pt-1 border-t border-glass">${data.supabase.message || ''}</div>
          </div>
        `;
      }

      if (geminiTag) {
        geminiTag.textContent = data.googleAi.configured ? 'Active 🟢' : 'Fallback Ready 🟡';
        geminiTag.className = data.googleAi.configured ? 'badge-status status-ready' : 'badge-mini';
      }

      if (supabaseTag) {
        supabaseTag.textContent = data.supabase.connected ? 'Connected 🟢' : 'Local Storage 🟡';
        supabaseTag.className = data.supabase.connected ? 'badge-status status-ready' : 'badge-mini';
      }
    } catch (e) {
      if (resEl) resEl.innerHTML = `<span class="text-xs text-danger">Server check failed: ${e.message}</span>`;
    }
  }

  // --- NOTIFICATIONS CENTER ---
  function updateNotificationBadge() {
    const list = FitnexaStorage.getNotifications();
    const unread = list.filter(n => n.unread).length;
    const badge = document.getElementById('nav-notif-badge');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'inline-flex' : 'none';
    }
  }

  function toggleNotificationPanel() {
    const panel = document.getElementById('notification-dropdown-panel');
    if (!panel) return;
    panel.classList.toggle('open');

    if (panel.classList.contains('open')) {
      const list = FitnexaStorage.getNotifications();
      const container = document.getElementById('notification-items-list');
      if (container) {
        if (list.length === 0) {
          container.innerHTML = `<div class="p-4 text-center text-xs text-muted">No notifications yet.</div>`;
        } else {
          container.innerHTML = list.map(n => `
            <div class="notif-item-row ${n.unread ? 'unread' : ''}">
              <span class="notif-icon">${n.icon || '🔔'}</span>
              <div class="flex-1">
                <div class="font-bold text-xs">${n.title}</div>
                <div class="text-xs text-muted">${n.message}</div>
                <span class="text-micro text-muted">${n.time}</span>
              </div>
            </div>
          `).join('');
        }
      }
    }
  }

  function markAllNotificationsRead() {
    FitnexaStorage.markNotificationsAsRead();
    toggleNotificationPanel();
  }

  // --- GLOBAL SEARCH MODAL (Ctrl+K) ---
  function openGlobalSearch() {
    const modal = document.getElementById('global-search-modal');
    const input = document.getElementById('global-search-input');
    if (modal) {
      modal.classList.add('open');
      if (input) {
        input.value = '';
        input.focus();
        handleGlobalSearch('');
      }
    }
  }

  function closeGlobalSearch() {
    const modal = document.getElementById('global-search-modal');
    if (modal) modal.classList.remove('open');
  }

  function handleGlobalSearch(query) {
    const q = query.toLowerCase().trim();
    const resultsContainer = document.getElementById('global-search-results');
    if (!resultsContainer) return;

    if (!q) {
      resultsContainer.innerHTML = `
        <div class="text-xs text-muted p-4 text-center">
          Type to search exercises, workouts, yoga poses, or challenges...
        </div>
      `;
      return;
    }

    const exMatches = window.FITNEXA_DATA.exercises.filter(e => e.name.toLowerCase().includes(q) || e.target.toLowerCase().includes(q)).slice(0, 4);
    const wMatches = window.FITNEXA_DATA.workouts.filter(w => w.title.toLowerCase().includes(q) || w.category.toLowerCase().includes(q)).slice(0, 3);
    const chMatches = window.FITNEXA_DATA.challenges.filter(c => c.title.toLowerCase().includes(q)).slice(0, 2);

    let html = '';
    if (exMatches.length > 0) {
      html += `<div class="search-category-title">Exercises</div>`;
      html += exMatches.map(e => `
        <div class="search-result-item" onclick="FitnexaApp.closeGlobalSearch(); FitnexaApp.openExerciseById('${e.id}')">
          <span>💪 ${e.name}</span>
          <span class="badge-mini">${e.target}</span>
        </div>
      `).join('');
    }

    if (wMatches.length > 0) {
      html += `<div class="search-category-title mt-2">Workouts</div>`;
      html += wMatches.map(w => `
        <div class="search-result-item" onclick="FitnexaApp.closeGlobalSearch(); FitnexaApp.previewWorkout('${w.id}')">
          <span>🏋️ ${w.title}</span>
          <span class="badge-mini">${w.category}</span>
        </div>
      `).join('');
    }

    if (chMatches.length > 0) {
      html += `<div class="search-category-title mt-2">Challenges</div>`;
      html += chMatches.map(c => `
        <div class="search-result-item" onclick="FitnexaApp.closeGlobalSearch(); FitnexaApp.navigateTo('challenges')">
          <span>🎯 ${c.title}</span>
          <span class="badge-mini">${c.totalDays} Days</span>
        </div>
      `).join('');
    }

    if (!html) {
      html = `<div class="text-xs text-muted p-4 text-center">No results found for "${query}".</div>`;
    }

    resultsContainer.innerHTML = html;
  }

  // --- ONBOARDING WIZARD FLOW (6 Steps) ---
  let onbCurrentStep = 1;
  const onbAnswers = { goal: 'Build Muscle', training: 'Gym', level: 'Intermediate', days: 5, duration: 45 };

  function openOnboardingWizard() {
    const modal = document.getElementById('onboarding-modal');
    onbCurrentStep = 1;
    showOnboardingStep(1);
    if (modal) modal.classList.add('open');
  }

  function closeOnboardingWizard() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.classList.remove('open');
  }

  function showOnboardingStep(step) {
    onbCurrentStep = step;
    document.querySelectorAll('.onb-step-card').forEach(el => el.style.display = 'none');
    const activeCard = document.getElementById(`onb-step-${step}`);
    if (activeCard) activeCard.style.display = 'block';

    const progBar = document.getElementById('onb-progress-fill');
    if (progBar) progBar.style.width = `${(step / 6) * 100}%`;
  }

  function selectOnboardingOption(key, val, el) {
    onbAnswers[key] = val;
    el.parentElement.querySelectorAll('.btn-choice').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  }

  function nextOnboardingStep() {
    if (onbCurrentStep < 6) {
      showOnboardingStep(onbCurrentStep + 1);
    } else {
      // Finish onboarding!
      FitnexaStorage.saveProfile({
        goal: onbAnswers.goal,
        trainingPreference: onbAnswers.training,
        fitnessLevel: onbAnswers.level,
        weeklyDays: onbAnswers.days,
        workoutDurationMin: onbAnswers.duration
      });
      FitnexaAudio.playCelebration();
      FitnexaConfetti.burst(90);
      closeOnboardingWizard();
      renderDashboardView();
      alert('Welcome aboard! Your personalized FITNEXA AI dashboard is ready.');
    }
  }

  function prevOnboardingStep() {
    if (onbCurrentStep > 1) {
      showOnboardingStep(onbCurrentStep - 1);
    }
  }

  // --- MOBILE MENU ---
  function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.toggle('open');
  }

  function closeMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.remove('open');
  }

  // --- KEYBOARD SHORTCUTS ---
  function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl+K / Cmd+K for global search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openGlobalSearch();
      }
      // Escape closes modals
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
        const notifPanel = document.getElementById('notification-dropdown-panel');
        if (notifPanel) notifPanel.classList.remove('open');
      }
    });
  }

  return {
    init: function () {
      initTheme();
      initKeyboardShortcuts();
      this.updateNotificationBadge();

      // Handle URL hash routing
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      navigateTo(hash);

      // Event listener for hash change
      window.addEventListener('hashchange', () => {
        const h = window.location.hash.replace('#', '') || 'dashboard';
        navigateTo(h);
      });
    },

    navigateTo,
    applyTheme,
    applyDensity,
    applyReducedMotion,
    renderDashboardView,
    renderWorkoutsView,
    filterWorkouts,
    previewWorkout,
    renderExercisesView,
    resetExerciseFilters,
    openExerciseById,
    openExerciseByName,
    closeGenericModal,
    renderNutritionView,
    addWaterLog,
    openAddFoodModal,
    closeAddFoodModal,
    selectPopularFood,
    submitFoodLog,
    renderProgressView,
    openAddMeasurementModal,
    closeAddMeasurementModal,
    submitMeasurement,
    openAddPRModal,
    closeAddPRModal,
    submitPR,
    openBmiCalculator,
    closeBmiCalculator,
    computeBmi,
    renderChallengesView,
    joinChallenge,
    checkinChallenge,
    renderProfileView,
    openEditProfileModal,
    closeEditProfileModal,
    submitEditProfile,
    openSettingsModal,
    closeSettingsModal,
    logout,
    saveSettingsForm,
    testBackendConnections,
    togglePasswordVisibility,
    testGeminiKeyLive,
    testSupabaseLive,
    copySupabaseSchema,
    toggleNotificationPanel,
    markAllNotificationsRead,
    updateNotificationBadge,
    openGlobalSearch,
    closeGlobalSearch,
    handleGlobalSearch,
    openOnboardingWizard,
    closeOnboardingWizard,
    selectOnboardingOption,
    nextOnboardingStep,
    prevOnboardingStep,
    toggleMobileMenu,
    closeMobileMenu,
    toggleHabit
  };
})();

window.FitnexaApp = FitnexaApp;

// Auto-boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  FitnexaApp.init();
});
