// ===================================================================
// FITNEXA AI: Interactive SVG Body Muscle Map & Recovery System
// Vector anatomical human model with Front/Back toggle and recovery metrics
// ===================================================================

const FitnexaMuscleMap = (function () {
  let currentView = 'front'; // 'front' or 'back'
  let selectedMuscle = 'chest';

  function getStatusColor(pct) {
    if (pct >= 90) return { color: '#10b981', label: 'Ready to Train', class: 'status-ready' };
    if (pct >= 75) return { color: '#06b6d4', label: 'Recovering', class: 'status-recovering' };
    return { color: '#f59e0b', label: 'Fatigued / Rest', class: 'status-fatigued' };
  }

  function renderSvgBody() {
    const isFront = currentView === 'front';

    // SVG paths and clickable anatomical regions
    return `
      <div class="muscle-map-view-toggle">
        <button type="button" class="btn-toggle ${isFront ? 'active' : ''}" onclick="FitnexaMuscleMap.toggleView('front')">
          Front View
        </button>
        <button type="button" class="btn-toggle ${!isFront ? 'active' : ''}" onclick="FitnexaMuscleMap.toggleView('back')">
          Back View
        </button>
      </div>

      <div class="muscle-svg-wrapper">
        <svg viewBox="0 0 280 440" class="human-body-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="muscle-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="bodyBaseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="rgba(255, 255, 255, 0.08)" />
              <stop offset="100%" stop-color="rgba(255, 255, 255, 0.03)" />
            </linearGradient>
          </defs>

          <!-- Head & Neck -->
          <ellipse cx="140" cy="40" rx="22" ry="28" fill="url(#bodyBaseGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
          <path d="M 132 68 L 132 82 L 148 82 L 148 68 Z" fill="url(#bodyBaseGrad)" />

          ${isFront ? `
            <!-- FRONT VIEW -->
            <!-- Shoulders (Deltoids) -->
            <path id="muscle-path-shoulders" class="muscle-clickable ${selectedMuscle === 'shoulders' ? 'active' : ''}"
              d="M 98 82 C 104 80 120 86 122 96 C 114 112 100 114 92 108 C 86 100 88 88 98 82 Z"
              data-muscle="shoulders" />
            <path class="muscle-clickable ${selectedMuscle === 'shoulders' ? 'active' : ''}"
              d="M 182 82 C 176 80 160 86 158 96 C 166 112 180 114 188 108 C 194 100 192 88 182 82 Z"
              data-muscle="shoulders" />

            <!-- Chest (Pectorals) -->
            <path id="muscle-path-chest" class="muscle-clickable ${selectedMuscle === 'chest' ? 'active' : ''}"
              d="M 104 96 C 122 92 138 98 138 126 C 122 134 104 130 98 116 C 98 106 100 100 104 96 Z"
              data-muscle="chest" />
            <path class="muscle-clickable ${selectedMuscle === 'chest' ? 'active' : ''}"
              d="M 176 96 C 158 92 142 98 142 126 C 158 134 176 130 182 116 C 182 106 180 100 176 96 Z"
              data-muscle="chest" />

            <!-- Biceps -->
            <path id="muscle-path-biceps" class="muscle-clickable ${selectedMuscle === 'biceps' ? 'active' : ''}"
              d="M 88 114 C 98 118 96 142 88 152 C 80 152 76 134 82 120 Z"
              data-muscle="biceps" />
            <path class="muscle-clickable ${selectedMuscle === 'biceps' ? 'active' : ''}"
              d="M 192 114 C 182 118 184 142 192 152 C 200 152 204 134 198 120 Z"
              data-muscle="biceps" />

            <!-- Forearms -->
            <path d="M 82 156 L 74 196 L 86 198 L 92 156 Z" fill="url(#bodyBaseGrad)" stroke="rgba(255,255,255,0.15)" />
            <path d="M 198 156 L 206 196 L 194 198 L 188 156 Z" fill="url(#bodyBaseGrad)" stroke="rgba(255,255,255,0.15)" />

            <!-- Abs & Core -->
            <path id="muscle-path-abs" class="muscle-clickable ${selectedMuscle === 'abs' ? 'active' : ''}"
              d="M 124 134 L 156 134 L 158 190 L 122 190 Z"
              data-muscle="abs" />
            <!-- Six pack line details -->
            <line x1="140" y1="134" x2="140" y2="190" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" pointer-events="none" />
            <line x1="126" y1="152" x2="154" y2="152" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" pointer-events="none" />
            <line x1="126" y1="170" x2="154" y2="170" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" pointer-events="none" />

            <!-- Pelvis / Hip base -->
            <path d="M 120 190 L 160 190 L 152 216 L 128 216 Z" fill="url(#bodyBaseGrad)" />

            <!-- Quads (Quadriceps) -->
            <path id="muscle-path-quads" class="muscle-clickable ${selectedMuscle === 'quads' ? 'active' : ''}"
              d="M 112 218 C 126 218 134 230 132 290 C 120 292 110 274 108 244 C 108 230 110 222 112 218 Z"
              data-muscle="quads" />
            <path class="muscle-clickable ${selectedMuscle === 'quads' ? 'active' : ''}"
              d="M 168 218 C 154 218 146 230 148 290 C 160 292 170 274 172 244 C 172 230 170 222 168 218 Z"
              data-muscle="quads" />

            <!-- Knees -->
            <circle cx="120" cy="300" r="7" fill="url(#bodyBaseGrad)" stroke="rgba(255,255,255,0.2)" />
            <circle cx="160" cy="300" r="7" fill="url(#bodyBaseGrad)" stroke="rgba(255,255,255,0.2)" />

            <!-- Calves (Shins / Front Calves) -->
            <path id="muscle-path-calves" class="muscle-clickable ${selectedMuscle === 'calves' ? 'active' : ''}"
              d="M 114 310 C 124 314 122 360 118 384 L 110 384 C 106 360 108 324 114 310 Z"
              data-muscle="calves" />
            <path class="muscle-clickable ${selectedMuscle === 'calves' ? 'active' : ''}"
              d="M 166 310 C 156 314 158 360 162 384 L 170 384 C 174 360 172 324 166 310 Z"
              data-muscle="calves" />

            <!-- Feet -->
            <path d="M 106 386 L 122 386 L 126 404 L 102 404 Z" fill="url(#bodyBaseGrad)" />
            <path d="M 174 386 L 158 386 L 154 404 L 178 404 Z" fill="url(#bodyBaseGrad)" />
          ` : `
            <!-- BACK VIEW -->
            <!-- Traps & Upper Back (Back) -->
            <path id="muscle-path-back" class="muscle-clickable ${selectedMuscle === 'back' ? 'active' : ''}"
              d="M 124 82 L 156 82 L 170 120 L 140 148 L 110 120 Z"
              data-muscle="back" />

            <!-- Lats (Middle/Lower Back) -->
            <path class="muscle-clickable ${selectedMuscle === 'back' ? 'active' : ''}"
              d="M 110 120 C 124 136 126 168 126 186 L 154 186 C 154 168 156 136 170 120 Z"
              data-muscle="back" />

            <!-- Rear Delts -->
            <path class="muscle-clickable ${selectedMuscle === 'shoulders' ? 'active' : ''}"
              d="M 94 86 C 104 84 110 94 108 106 C 98 108 90 98 94 86 Z"
              data-muscle="shoulders" />
            <path class="muscle-clickable ${selectedMuscle === 'shoulders' ? 'active' : ''}"
              d="M 186 86 C 176 84 170 94 172 106 C 182 108 190 98 186 86 Z"
              data-muscle="shoulders" />

            <!-- Triceps -->
            <path id="muscle-path-triceps" class="muscle-clickable ${selectedMuscle === 'triceps' ? 'active' : ''}"
              d="M 86 110 C 96 114 94 140 86 150 C 78 148 76 128 86 110 Z"
              data-muscle="triceps" />
            <path class="muscle-clickable ${selectedMuscle === 'triceps' ? 'active' : ''}"
              d="M 194 110 C 184 114 186 140 194 150 C 202 148 204 128 194 110 Z"
              data-muscle="triceps" />

            <!-- Glutes -->
            <path id="muscle-path-glutes" class="muscle-clickable ${selectedMuscle === 'glutes' ? 'active' : ''}"
              d="M 114 190 C 136 190 138 226 116 230 C 108 220 108 200 114 190 Z"
              data-muscle="glutes" />
            <path class="muscle-clickable ${selectedMuscle === 'glutes' ? 'active' : ''}"
              d="M 166 190 C 144 190 142 226 164 230 C 172 220 172 200 166 190 Z"
              data-muscle="glutes" />

            <!-- Hamstrings -->
            <path id="muscle-path-hamstrings" class="muscle-clickable ${selectedMuscle === 'hamstrings' ? 'active' : ''}"
              d="M 114 232 C 128 232 132 250 130 290 C 118 290 110 270 110 248 Z"
              data-muscle="hamstrings" />
            <path class="muscle-clickable ${selectedMuscle === 'hamstrings' ? 'active' : ''}"
              d="M 166 232 C 152 232 148 250 150 290 C 162 290 170 270 170 248 Z"
              data-muscle="hamstrings" />

            <!-- Calves (Back Gastrocnemius) -->
            <path class="muscle-clickable ${selectedMuscle === 'calves' ? 'active' : ''}"
              d="M 114 310 C 128 316 126 364 118 384 L 108 384 C 104 360 106 324 114 310 Z"
              data-muscle="calves" />
            <path class="muscle-clickable ${selectedMuscle === 'calves' ? 'active' : ''}"
              d="M 166 310 C 152 316 154 364 162 384 L 172 384 C 176 360 174 324 166 310 Z"
              data-muscle="calves" />

            <!-- Heels -->
            <path d="M 106 386 L 122 386 L 120 404 L 104 404 Z" fill="url(#bodyBaseGrad)" />
            <path d="M 174 386 L 158 386 L 160 404 L 176 404 Z" fill="url(#bodyBaseGrad)" />
          `}
        </svg>

        <div class="muscle-quick-legend">
          <span class="legend-dot dot-ready"></span> Ready (90%+)
          <span class="legend-dot dot-recovering"></span> Recovering (75-89%)
          <span class="legend-dot dot-fatigued"></span> Rest (<75%)
        </div>
      </div>
    `;
  }

  function renderSelectedCard() {
    const data = window.FITNEXA_DATA.muscles[selectedMuscle] || window.FITNEXA_DATA.muscles.chest;
    const status = getStatusColor(data.recoveryPct);

    return `
      <div class="muscle-detail-card card-glass">
        <div class="card-header-flex">
          <div>
            <span class="badge-mini uppercase tracking-wider">${currentView} View</span>
            <h3 class="text-2xl font-bold mt-1">${data.name}</h3>
          </div>
          <div class="recovery-meter-pill ${status.class}">
            <span class="meter-val font-extrabold">${data.recoveryPct}%</span>
            <span class="meter-text">${status.label}</span>
          </div>
        </div>

        <div class="recovery-progress-bar-bg my-3">
          <div class="recovery-progress-bar-fill" style="width: ${data.recoveryPct}%; background-color: ${status.color};"></div>
        </div>

        <div class="detail-row">
          <span class="text-muted">Last Trained:</span>
          <span class="font-medium">${data.lastTrained}</span>
        </div>

        <div class="detail-row mt-1">
          <span class="text-muted">Status Analysis:</span>
          <span>${data.recoveryPct >= 90 ? 'Glycogen replenished, neuromuscular recovery complete.' : 'Microtrauma healing in progress. Protein synthesis elevated.'}</span>
        </div>

        <div class="mt-4">
          <h4 class="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Recommended Exercises</h4>
          <div class="recommended-chips-grid">
            ${data.recommended.map(exName => `
              <button type="button" class="chip-exercise" onclick="FitnexaApp.openExerciseByName('${exName}')">
                <span>💪 ${exName}</span>
                <span class="chip-arrow">→</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-glass text-xs text-muted">
          ℹ️ Recovery status is based on your logged workouts and volume algorithms. Not intended as medical diagnosis.
        </div>
      </div>
    `;
  }

  function renderRecoveryDashboard() {
    const muscles = window.FITNEXA_DATA.muscles;
    const list = Object.keys(muscles).map(k => muscles[k]);

    return `
      <div class="recovery-overview-grid">
        ${list.map(m => {
          const st = getStatusColor(m.recoveryPct);
          return `
            <div class="recovery-gauge-card card-glass clickable-card" onclick="FitnexaMuscleMap.selectMuscle('${m.name.toLowerCase().split(' ')[0]}')">
              <div class="gauge-header">
                <span class="font-bold">${m.name}</span>
                <span class="badge-status ${st.class}">${st.label}</span>
              </div>
              <div class="gauge-bar-track">
                <div class="gauge-bar-val" style="width: ${m.recoveryPct}%; background-color: ${st.color}"></div>
              </div>
              <div class="gauge-footer text-xs text-muted">
                <span>Recovery: ${m.recoveryPct}%</span>
                <span>${m.lastTrained}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function attachListeners() {
    const wrapper = document.getElementById('muscle-map-container');
    if (!wrapper) return;

    wrapper.querySelectorAll('.muscle-clickable').forEach(el => {
      el.addEventListener('click', (e) => {
        const muscle = el.getAttribute('data-muscle');
        if (muscle) {
          FitnexaMuscleMap.selectMuscle(muscle);
        }
      });
    });
  }

  return {
    init: function () {
      this.render();
    },

    toggleView: function (view) {
      currentView = view;
      this.render();
    },

    selectMuscle: function (muscleKey) {
      selectedMuscle = muscleKey;
      this.render();
    },

    render: function () {
      const container = document.getElementById('muscle-map-container');
      const detailsContainer = document.getElementById('muscle-details-container');
      const dashboardContainer = document.getElementById('recovery-dashboard-container');

      if (container) {
        container.innerHTML = renderSvgBody();
        attachListeners();
      }
      if (detailsContainer) {
        detailsContainer.innerHTML = renderSelectedCard();
      }
      if (dashboardContainer) {
        dashboardContainer.innerHTML = renderRecoveryDashboard();
      }
    }
  };
})();

window.FitnexaMuscleMap = FitnexaMuscleMap;
