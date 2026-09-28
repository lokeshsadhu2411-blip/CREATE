// ===================================================================
// FITNEXA AI: Workout Player & Dedicated Rest Timer Engine
// Complete workout execution flow, circular progress, audio chimes,
// volume tracking, and celebratory completion summary
// ===================================================================

const FitnexaPlayer = (function () {
  let workout = null;
  let currentExIndex = 0;
  let currentSetNumber = 1;
  let isPaused = false;
  let workoutTimerHandle = null;
  let elapsedSeconds = 0;
  let totalVolumeKg = 0;
  let totalCompletedSets = 0;
  let setHistory = []; // stores { exercise, set, reps, weight }

  // Rest Timer State
  let restDuration = 60;
  let restRemaining = 60;
  let restIntervalHandle = null;
  let restIsActive = false;

  // Standalone Rest Timer State
  let standaloneRestTime = 60;
  let standaloneRemaining = 60;
  let standaloneInterval = null;
  let standaloneIsRunning = false;

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- REST TIMER ENGINE ---
  function startRestTimer(seconds) {
    stopRestTimer();
    restDuration = seconds || restDuration || 60;
    restRemaining = restDuration;
    restIsActive = true;
    updateRestDisplay();

    restIntervalHandle = setInterval(() => {
      if (restRemaining > 0) {
        restRemaining--;
        updateRestDisplay();

        // Audio countdown for final 3 seconds
        if (restRemaining <= 3 && restRemaining > 0) {
          FitnexaAudio.playCountdownBeep();
        }

        if (restRemaining === 0) {
          stopRestTimer();
          FitnexaAudio.playTimerFinished();
          triggerRestAlarmVisual();
        }
      }
    }, 1000);
  }

  function pauseRestTimer() {
    if (restIntervalHandle) {
      clearInterval(restIntervalHandle);
      restIntervalHandle = null;
      restIsActive = false;
    }
  }

  function resumeRestTimer() {
    if (restRemaining > 0 && !restIntervalHandle) {
      restIsActive = true;
      restIntervalHandle = setInterval(() => {
        if (restRemaining > 0) {
          restRemaining--;
          updateRestDisplay();
          if (restRemaining <= 3 && restRemaining > 0) FitnexaAudio.playCountdownBeep();
          if (restRemaining === 0) {
            stopRestTimer();
            FitnexaAudio.playTimerFinished();
            triggerRestAlarmVisual();
          }
        }
      }, 1000);
    }
  }

  function stopRestTimer() {
    if (restIntervalHandle) {
      clearInterval(restIntervalHandle);
      restIntervalHandle = null;
    }
    restIsActive = false;
  }

  function resetRestTimer(newSec) {
    stopRestTimer();
    restDuration = newSec !== undefined ? newSec : restDuration;
    restRemaining = restDuration;
    updateRestDisplay();
  }

  function triggerRestAlarmVisual() {
    const el = document.getElementById('player-rest-card');
    if (el) {
      el.classList.add('timer-alarm-flash');
      setTimeout(() => el.classList.remove('timer-alarm-flash'), 2500);
    }
  }

  function updateRestDisplay() {
    const timeDisplay = document.getElementById('player-rest-countdown');
    const ring = document.getElementById('player-rest-ring-fill');
    if (timeDisplay) {
      timeDisplay.textContent = formatTime(restRemaining);
    }
    if (ring && restDuration > 0) {
      const circumference = 2 * Math.PI * 45; // r=45
      const progress = restRemaining / restDuration;
      const offset = circumference * (1 - progress);
      ring.style.strokeDashoffset = offset;
    }
  }

  // --- WORKOUT STOPWATCH ---
  function startWorkoutTimer() {
    stopWorkoutTimer();
    workoutTimerHandle = setInterval(() => {
      if (!isPaused) {
        elapsedSeconds++;
        const el = document.getElementById('player-elapsed-time');
        if (el) el.textContent = formatTime(elapsedSeconds);
      }
    }, 1000);
  }

  function stopWorkoutTimer() {
    if (workoutTimerHandle) {
      clearInterval(workoutTimerHandle);
      workoutTimerHandle = null;
    }
  }

  // --- PLAYER UI RENDERING ---
  function renderPlayerUI() {
    const container = document.getElementById('workout-player-container');
    if (!container || !workout) return;

    const currentEx = workout.exercises[currentExIndex];
    if (!currentEx) return;

    const totalSets = currentEx.sets || 3;
    const targetReps = currentEx.reps || 10;
    const defaultWeight = currentEx.weight || 0;
    const totalExercises = workout.exercises.length;
    const overallProgressPct = Math.round(((currentExIndex + (currentSetNumber - 1) / totalSets) / totalExercises) * 100);

    container.innerHTML = `
      <div class="player-wrapper animate-fade-in">
        <!-- Top Navigation Bar -->
        <div class="player-topbar card-glass">
          <div class="flex items-center gap-3">
            <button type="button" class="btn-icon" onclick="FitnexaPlayer.confirmExit()" title="Minimize / Exit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <span class="text-xs uppercase tracking-wider text-muted">${workout.category} • ${workout.title}</span>
              <h2 class="text-lg font-bold flex items-center gap-2">
                ${currentEx.name}
                <span class="badge-mini">${currentEx.target || 'Full Body'}</span>
              </h2>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="player-stat-badge">
              <span class="text-xs text-muted">Time</span>
              <span id="player-elapsed-time" class="font-mono font-bold text-accent">${formatTime(elapsedSeconds)}</span>
            </div>
            <button type="button" class="btn-sm btn-outline-danger" onclick="FitnexaPlayer.confirmExit()">
              End Workout
            </button>
          </div>
        </div>

        <!-- Overall Progress Bar -->
        <div class="player-progress-bar-wrap">
          <div class="player-progress-bar-fill" style="width: ${overallProgressPct}%;"></div>
        </div>

        <!-- Main Exercise Grid -->
        <div class="player-grid mt-4">
          <!-- Exercise Visual & Details -->
          <div class="card-glass player-exercise-card">
            <div class="flex justify-between items-center mb-3">
              <span class="badge-exercise-step">Exercise ${currentExIndex + 1} of ${totalExercises}</span>
              <span class="text-xs text-muted">Next: ${workout.exercises[currentExIndex + 1]?.name || 'Workout Finish!'}</span>
            </div>

            <!-- Animated Exercise Visualizer -->
            <div class="exercise-visual-box">
              <div class="exercise-visual-animation">
                <div class="pulse-aura"></div>
                <div class="exercise-icon-avatar">🏋️</div>
              </div>
              <div class="text-center mt-2">
                <h3 class="text-xl font-bold">${currentEx.name}</h3>
                <p class="text-xs text-muted mt-1">Target: <strong class="text-primary">${currentEx.target || 'General'}</strong></p>
              </div>
            </div>

            <!-- Set Counter & Target -->
            <div class="set-indicator-row mt-4">
              ${Array.from({ length: totalSets }).map((_, i) => `
                <div class="set-circle ${i + 1 < currentSetNumber ? 'completed' : i + 1 === currentSetNumber ? 'active' : ''}">
                  ${i + 1 < currentSetNumber ? '✓' : i + 1}
                </div>
              `).join('')}
            </div>

            <!-- Inputs for Reps & Weight -->
            <div class="grid grid-cols-2 gap-3 mt-4">
              <div class="input-stat-box">
                <label class="text-xs text-muted">REPS (Target: ${targetReps})</label>
                <div class="flex items-center justify-between mt-1">
                  <button type="button" class="btn-micro" onclick="FitnexaPlayer.adjustInput('player-reps-input', -1)">-</button>
                  <input type="number" id="player-reps-input" class="input-stat-field" value="${targetReps}" min="1" max="100">
                  <button type="button" class="btn-micro" onclick="FitnexaPlayer.adjustInput('player-reps-input', 1)">+</button>
                </div>
              </div>
              <div class="input-stat-box">
                <label class="text-xs text-muted">WEIGHT (kg)</label>
                <div class="flex items-center justify-between mt-1">
                  <button type="button" class="btn-micro" onclick="FitnexaPlayer.adjustInput('player-weight-input', -2.5)">-</button>
                  <input type="number" id="player-weight-input" class="input-stat-field" value="${defaultWeight}" min="0" step="2.5">
                  <button type="button" class="btn-micro" onclick="FitnexaPlayer.adjustInput('player-weight-input', 2.5)">+</button>
                </div>
              </div>
            </div>

            <!-- Complete Set Action Button -->
            <div class="mt-4">
              <button type="button" id="btn-complete-set" class="btn-primary w-full btn-lg font-bold shadow-glow" onclick="FitnexaPlayer.completeSet()">
                ✓ Complete Set ${currentSetNumber} of ${totalSets}
              </button>
            </div>

            <!-- Navigation Controls (Skip / Previous) -->
            <div class="flex justify-between items-center mt-3 pt-3 border-t border-glass">
              <button type="button" class="btn-ghost btn-sm" onclick="FitnexaPlayer.previousExercise()" ${currentExIndex === 0 && currentSetNumber === 1 ? 'disabled' : ''}>
                ← Previous
              </button>
              <button type="button" class="btn-ghost btn-sm" onclick="FitnexaPlayer.togglePause()">
                ${isPaused ? '▶️ Resume Workout' : '⏸️ Pause Workout'}
              </button>
              <button type="button" class="btn-ghost btn-sm" onclick="FitnexaPlayer.skipExercise()">
                Skip Exercise →
              </button>
            </div>
          </div>

          <!-- Rest Timer Section -->
          <div id="player-rest-card" class="card-glass player-rest-card">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-muted flex items-center justify-between">
              <span>Rest Timer</span>
              <span class="badge-mini text-primary">${restIsActive ? 'COUNTING DOWN' : 'READY'}</span>
            </h3>

            <!-- Circular Timer Display -->
            <div class="rest-timer-dial-wrap mt-3">
              <svg class="rest-timer-svg" viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="45" />
                <circle id="player-rest-ring-fill" class="ring-fill" cx="50" cy="50" r="45" />
              </svg>
              <div class="rest-timer-digits">
                <span id="player-rest-countdown" class="font-mono text-3xl font-extrabold">${formatTime(restRemaining)}</span>
                <span class="text-xs text-muted">Rest Time</span>
              </div>
            </div>

            <!-- Quick Action Preset Buttons -->
            <div class="rest-presets-grid mt-4">
              <button type="button" class="btn-preset" onclick="FitnexaPlayer.applyRestPreset(30)">30s</button>
              <button type="button" class="btn-preset" onclick="FitnexaPlayer.applyRestPreset(45)">45s</button>
              <button type="button" class="btn-preset" onclick="FitnexaPlayer.applyRestPreset(60)">60s</button>
              <button type="button" class="btn-preset" onclick="FitnexaPlayer.applyRestPreset(90)">90s</button>
              <button type="button" class="btn-preset" onclick="FitnexaPlayer.applyRestPreset(120)">2m</button>
              <button type="button" class="btn-preset" onclick="FitnexaPlayer.applyRestPreset(180)">3m</button>
            </div>

            <!-- Start / Pause / Reset Rest Controls -->
            <div class="flex gap-2 mt-4">
              <button type="button" class="btn-secondary btn-sm flex-1 font-semibold" onclick="FitnexaPlayer.toggleRestTimer()">
                ${restIsActive ? '⏸️ Pause' : '▶️ Start'}
              </button>
              <button type="button" class="btn-ghost btn-sm" onclick="FitnexaPlayer.resetRestTimer()">
                🔄 Reset
              </button>
              <button type="button" class="btn-ghost btn-sm" onclick="FitnexaPlayer.addRestTime(30)">
                +30s
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    updateRestDisplay();
  }

  return {
    startWorkout: function (workoutObj) {
      if (!workoutObj || !workoutObj.exercises || workoutObj.exercises.length === 0) {
        alert('Invalid workout data.');
        return;
      }

      workout = JSON.parse(JSON.stringify(workoutObj));
      currentExIndex = 0;
      currentSetNumber = 1;
      elapsedSeconds = 0;
      totalVolumeKg = 0;
      totalCompletedSets = 0;
      setHistory = [];
      isPaused = false;

      // Switch view to workout player
      FitnexaApp.navigateTo('player');
      renderPlayerUI();
      startWorkoutTimer();
      FitnexaAudio.playTap();
    },

    adjustInput: function (elementId, delta) {
      const input = document.getElementById(elementId);
      if (input) {
        let val = parseFloat(input.value) || 0;
        val = Math.max(0, val + delta);
        input.value = val;
      }
    },

    completeSet: function () {
      if (!workout) return;
      const currentEx = workout.exercises[currentExIndex];
      const repsInput = document.getElementById('player-reps-input');
      const weightInput = document.getElementById('player-weight-input');

      const reps = repsInput ? parseInt(repsInput.value, 10) || 10 : 10;
      const weight = weightInput ? parseFloat(weightInput.value) || 0 : 0;

      // Track volume
      totalVolumeKg += reps * weight;
      totalCompletedSets++;
      setHistory.push({
        exercise: currentEx.name,
        set: currentSetNumber,
        reps,
        weight
      });

      // Sound and micro-celebration
      FitnexaAudio.playSetComplete();
      FitnexaConfetti.burst(30);

      const totalSets = currentEx.sets || 3;

      if (currentSetNumber < totalSets) {
        currentSetNumber++;
        renderPlayerUI();
        // Auto-start rest timer
        startRestTimer(currentEx.rest || 60);
      } else {
        // Exercise completed!
        if (currentExIndex < workout.exercises.length - 1) {
          currentExIndex++;
          currentSetNumber = 1;
          renderPlayerUI();
          startRestTimer(workout.exercises[currentExIndex].rest || 90);
        } else {
          // Entire workout complete!
          FitnexaPlayer.finishWorkout();
        }
      }
    },

    skipExercise: function () {
      if (!workout) return;
      if (currentExIndex < workout.exercises.length - 1) {
        currentExIndex++;
        currentSetNumber = 1;
        renderPlayerUI();
      } else {
        FitnexaPlayer.finishWorkout();
      }
    },

    previousExercise: function () {
      if (!workout) return;
      if (currentSetNumber > 1) {
        currentSetNumber--;
      } else if (currentExIndex > 0) {
        currentExIndex--;
        currentSetNumber = workout.exercises[currentExIndex].sets || 3;
      }
      renderPlayerUI();
    },

    togglePause: function () {
      isPaused = !isPaused;
      if (isPaused) {
        pauseRestTimer();
      }
      renderPlayerUI();
    },

    applyRestPreset: function (seconds) {
      resetRestTimer(seconds);
      startRestTimer(seconds);
    },

    toggleRestTimer: function () {
      if (restIsActive) {
        pauseRestTimer();
      } else {
        resumeRestTimer();
      }
      renderPlayerUI();
    },

    resetRestTimer: function () {
      resetRestTimer();
    },

    addRestTime: function (extraSec) {
      restRemaining += extraSec;
      restDuration = Math.max(restDuration, restRemaining);
      updateRestDisplay();
    },

    confirmExit: function () {
      if (confirm('Are you sure you want to end this workout session early?')) {
        FitnexaPlayer.finishWorkout();
      }
    },

    finishWorkout: function () {
      stopWorkoutTimer();
      stopRestTimer();

      const durationMin = Math.max(1, Math.round(elapsedSeconds / 60));
      const caloriesBurned = Math.round(durationMin * 8.2);
      const exercisesCount = currentExIndex + 1;
      const xpEarned = 150 + totalCompletedSets * 10;

      // Celebrate!
      FitnexaAudio.playCelebration();
      FitnexaConfetti.burst(120);

      // Record in storage & sync
      const logEntry = {
        id: `log_${Date.now()}`,
        workoutTitle: workout.title,
        category: workout.category,
        durationSec: elapsedSeconds,
        durationMin,
        caloriesBurned,
        volumeKg: totalVolumeKg,
        exercisesCompleted: exercisesCount,
        setsCompleted: totalCompletedSets,
        xpEarned,
        completedAt: new Date().toISOString()
      };

      FitnexaStorage.recordWorkoutCompletion(logEntry);

      // Show Complete Modal
      this.showSummaryModal(logEntry);
    },

    showSummaryModal: function (log) {
      const modal = document.getElementById('workout-complete-modal');
      const body = document.getElementById('workout-complete-body');
      if (!modal || !body) return;

      body.innerHTML = `
        <div class="text-center py-4">
          <div class="text-5xl animate-bounce">🏆</div>
          <h2 class="text-3xl font-extrabold mt-2 text-gradient">Workout Complete!</h2>
          <p class="text-sm text-muted mt-1">Outstanding session, champion. Your progress is locked in.</p>

          <div class="summary-stats-grid mt-6">
            <div class="stat-card card-glass">
              <span class="text-xs text-muted uppercase">Duration</span>
              <span class="text-xl font-bold text-accent">${log.durationMin} mins</span>
            </div>
            <div class="stat-card card-glass">
              <span class="text-xs text-muted uppercase">Calories</span>
              <span class="text-xl font-bold text-primary">${log.caloriesBurned} kcal</span>
            </div>
            <div class="stat-card card-glass">
              <span class="text-xs text-muted uppercase">Volume Lifted</span>
              <span class="text-xl font-bold">${log.volumeKg > 0 ? log.volumeKg + ' kg' : 'Bodyweight'}</span>
            </div>
            <div class="stat-card card-glass">
              <span class="text-xs text-muted uppercase">Sets Crushed</span>
              <span class="text-xl font-bold">${log.setsCompleted}</span>
            </div>
          </div>

          <div class="xp-award-box card-glass mt-4 flex items-center justify-between p-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">⚡</span>
              <div class="text-left">
                <span class="font-bold text-sm">+${log.xpEarned} XP Earned</span>
                <p class="text-xs text-muted">Daily streak increased!</p>
              </div>
            </div>
            <span class="badge-status status-ready font-mono font-bold">LEVEL UP PROGRESS</span>
          </div>

          <button type="button" class="btn-primary w-full mt-6 btn-lg font-bold" onclick="FitnexaPlayer.closeSummaryModal()">
            Return to Dashboard
          </button>
        </div>
      `;

      modal.classList.add('open');
    },

    closeSummaryModal: function () {
      const modal = document.getElementById('workout-complete-modal');
      if (modal) modal.classList.remove('open');
      workout = null;
      FitnexaApp.navigateTo('dashboard');
    },

    // --- STANDALONE REST TIMER TOOL ---
    openStandaloneTimer: function () {
      const modal = document.getElementById('standalone-timer-modal');
      if (modal) {
        modal.classList.add('open');
        FitnexaPlayer.updateStandaloneDisplay();
      }
    },

    closeStandaloneTimer: function () {
      const modal = document.getElementById('standalone-timer-modal');
      if (modal) modal.classList.remove('open');
    },

    toggleStandaloneTimer: function () {
      if (standaloneIsRunning) {
        clearInterval(standaloneInterval);
        standaloneInterval = null;
        standaloneIsRunning = false;
      } else {
        standaloneIsRunning = true;
        standaloneInterval = setInterval(() => {
          if (standaloneRemaining > 0) {
            standaloneRemaining--;
            FitnexaPlayer.updateStandaloneDisplay();
            if (standaloneRemaining <= 3 && standaloneRemaining > 0) FitnexaAudio.playCountdownBeep();
            if (standaloneRemaining === 0) {
              clearInterval(standaloneInterval);
              standaloneIsRunning = false;
              FitnexaAudio.playTimerFinished();
            }
          }
        }, 1000);
      }
      FitnexaPlayer.updateStandaloneDisplay();
    },

    resetStandaloneTimer: function (newTime) {
      if (standaloneInterval) clearInterval(standaloneInterval);
      standaloneIsRunning = false;
      standaloneRestTime = newTime !== undefined ? newTime : standaloneRestTime;
      standaloneRemaining = standaloneRestTime;
      FitnexaPlayer.updateStandaloneDisplay();
    },

    updateStandaloneDisplay: function () {
      const txt = document.getElementById('standalone-timer-digits');
      const btn = document.getElementById('btn-standalone-toggle');
      if (txt) txt.textContent = formatTime(standaloneRemaining);
      if (btn) btn.textContent = standaloneIsRunning ? '⏸️ Pause' : '▶️ Start';
    }
  };
})();

window.FitnexaPlayer = FitnexaPlayer;
