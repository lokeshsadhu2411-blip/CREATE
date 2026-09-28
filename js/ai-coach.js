// ===================================================================
// FITNEXA AI: Dedicated AI Fitness Coach Engine
// Conversational chat assistant, Google Gemini API bridge,
// Interactive workout questionnaire, and instant routine builder
// ===================================================================

const FitnexaCoach = (function () {
  let chatHistory = [
    {
      role: 'assistant',
      text: "Hey! I'm your **FITNEXA AI Coach**. 🏋️‍♂️\n\nI can build you a tailored workout routine, optimize your daily nutrition, fine-tune your lifting form, or calculate your recovery. How can I help you level up today?",
      time: 'Just now'
    }
  ];

  let isTyping = false;
  let activeGeneratedPlan = null;
  let selectedModel = 'gemini-3.8-flash';
  let selectedMode = 'AiCoche';

  function formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/^### (.*$)/gim, '<h4 class="text-base font-bold text-accent my-2">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold text-primary my-2">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 class="text-xl font-bold my-2">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="code-inline">$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/^\* (.*$)/gim, '<div class="bullet-item">• $1</div>');
    return html;
  }

  function renderChat() {
    const listEl = document.getElementById('coach-chat-messages');
    if (!listEl) return;

    listEl.innerHTML = chatHistory.map(msg => `
      <div class="chat-message-row ${msg.role === 'user' ? 'user-row' : 'coach-row'} animate-fade-in">
        <div class="chat-avatar ${msg.role === 'user' ? 'avatar-user' : 'avatar-coach'}">
          ${msg.role === 'user' ? '👤' : '⚡'}
        </div>
        <div class="chat-bubble-wrap">
          <div class="chat-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-coach'}">
            ${formatMarkdown(msg.text)}
          </div>
          <div class="chat-time-tag flex items-center gap-2">
            <span>${msg.time || ''}</span>
            ${msg.modelUsed ? `<span class="badge text-2xs px-1.5 py-0.2 rounded bg-surface/50 opacity-80 border border-glass">${msg.modelUsed}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    if (isTyping) {
      listEl.innerHTML += `
        <div class="chat-message-row coach-row">
          <div class="chat-avatar avatar-coach">⚡</div>
          <div class="chat-bubble bubble-coach typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      `;
    }

    listEl.scrollTop = listEl.scrollHeight;
  }

  return {
    init: function () {
      renderChat();
      this.checkAiStatus();
    },

    setModel: function (modelName) {
      if (modelName) {
        selectedModel = modelName;
        console.log(`[AiCoche] Active model set to: ${modelName}`);
      }
    },

    setMode: function (modeName) {
      if (modeName) {
        selectedMode = modeName;
        console.log(`[AiCoche] Active mode set to: ${modeName}`);
      }
    },

    checkAiStatus: async function () {
      try {
        const [statusRes, modelsRes] = await Promise.allSettled([
          fetch('/api/status'),
          fetch('/api/ai/models')
        ]);

        if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
          const data = await statusRes.value.json();
          const badge = document.getElementById('coach-ai-model-badge');
          if (badge) {
            if (data.googleAi && data.googleAi.configured) {
              badge.innerHTML = `<span class="dot-online"></span> AiCoche (Gemini 3.8 Flash Active • All Models Allowed)`;
              badge.classList.add('badge-gemini-active');
            } else {
              badge.innerHTML = `<span class="dot-fallback"></span> Smart AI Engine (Ready)`;
              badge.title = 'Add Google API key in Settings to activate Gemini AI';
            }
          }
        }

        // Dynamically populate model select if models are returned
        if (modelsRes.status === 'fulfilled' && modelsRes.value.ok) {
          const modelData = await modelsRes.value.json();
          const select = document.getElementById('coach-model-select');
          if (select && Array.isArray(modelData.models) && modelData.models.length > 0) {
            select.innerHTML = modelData.models.map(m => `
              <option value="${m.id}" ${m.id === selectedModel ? 'selected' : ''}>
                ${m.name || m.id}
              </option>
            `).join('');
          }
        }
      } catch (e) {
        // Fallback
      }
    },

    sendMessage: async function (text) {
      const msg = text || (document.getElementById('coach-input-field') ? document.getElementById('coach-input-field').value.trim() : '');
      if (!msg || isTyping) return;

      const input = document.getElementById('coach-input-field');
      if (input) input.value = '';

      // Add user message
      chatHistory.push({
        role: 'user',
        text: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      renderChat();

      // Trigger typing indicator
      isTyping = true;
      renderChat();

      try {
        const profile = FitnexaStorage.getProfile();
        const historyContext = chatHistory.slice(-5);

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msg,
            profile,
            history: historyContext,
            mode: selectedMode,
            model: selectedModel
          })
        });

        if (res.ok) {
          const data = await res.json();
          isTyping = false;
          chatHistory.push({
            role: 'assistant',
            text: data.reply,
            modelUsed: data.modelUsed,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          renderChat();
          return;
        }
      } catch (e) {
        console.warn('Chat request failed, using local fallback:', e);
      }

      // Offline / error fallback
      setTimeout(() => {
        isTyping = false;
        chatHistory.push({
          role: 'assistant',
          text: `Got your request! Keep maintaining progressive overload, tracking your macros, and staying consistent with your streak. What routine would you like to review next?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        renderChat();
      }, 500);
    },

    sendPromptChip: function (prompt) {
      if (prompt.toLowerCase().includes('create my workout')) {
        this.openWorkoutWizard();
      } else {
        this.sendMessage(prompt);
      }
    },

    // --- INTERACTIVE WORKOUT QUESTIONNAIRE WIZARD ---
    openWorkoutWizard: function () {
      const modal = document.getElementById('ai-wizard-modal');
      const profile = FitnexaStorage.getProfile();
      if (modal) {
        // Pre-fill fields with user profile defaults
        const ageEl = document.getElementById('wiz-age');
        const heightEl = document.getElementById('wiz-height');
        const weightEl = document.getElementById('wiz-weight');
        const goalEl = document.getElementById('wiz-goal');
        const levelEl = document.getElementById('wiz-level');
        const daysEl = document.getElementById('wiz-days');

        if (ageEl) ageEl.value = profile.age || 26;
        if (heightEl) heightEl.value = profile.heightCm || 180;
        if (weightEl) weightEl.value = profile.weightKg || 72;
        if (goalEl) goalEl.value = profile.goal || 'Build Muscle';
        if (levelEl) levelEl.value = profile.fitnessLevel || 'Intermediate';
        if (daysEl) daysEl.value = profile.weeklyDays || 5;

        modal.classList.add('open');
      }
    },

    closeWorkoutWizard: function () {
      const modal = document.getElementById('ai-wizard-modal');
      if (modal) modal.classList.remove('open');
    },

    submitWorkoutWizard: async function () {
      const modal = document.getElementById('ai-wizard-modal');
      const btn = document.getElementById('btn-generate-plan');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span> Generating Custom Routine...`;
      }

      const params = {
        age: document.getElementById('wiz-age')?.value || 26,
        gender: document.getElementById('wiz-gender')?.value || 'Male',
        height: document.getElementById('wiz-height')?.value || 180,
        weight: document.getElementById('wiz-weight')?.value || 72,
        fitnessLevel: document.getElementById('wiz-level')?.value || 'Intermediate',
        goal: document.getElementById('wiz-goal')?.value || 'Build Muscle',
        days: document.getElementById('wiz-days')?.value || 5,
        duration: document.getElementById('wiz-duration')?.value || 45,
        equipment: document.getElementById('wiz-equipment')?.value || 'Full Gym',
        style: document.getElementById('wiz-style')?.value || 'Gym',
        model: selectedModel
      };

      try {
        const res = await fetch('/api/ai/workout-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success && result.plan) {
            activeGeneratedPlan = result.plan;
            this.closeWorkoutWizard();
            this.showGeneratedPlanModal(result.plan, result.isRealAi);

            // Also post notification into chat
            chatHistory.push({
              role: 'assistant',
              text: `🎯 I've crafted your **${result.plan.title}** (${result.plan.category} • ${result.plan.durationMin} mins) tailored to your **${params.goal}** goal! Click below to preview and launch it.`,
              time: 'Just now'
            });
            renderChat();
          }
        }
      } catch (e) {
        alert('Failed to generate workout plan: ' + e.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `⚡ Generate My Workout Plan`;
        }
      }
    },

    showGeneratedPlanModal: function (plan, isRealAi = false) {
      const modal = document.getElementById('generated-plan-modal');
      const body = document.getElementById('generated-plan-body');
      if (!modal || !body) return;

      body.innerHTML = `
        <div class="plan-preview-wrapper">
          <div class="flex justify-between items-center mb-3">
            <span class="badge-mini uppercase tracking-wider">${plan.category} • ${plan.difficulty}</span>
            <span class="badge-status status-ready">${isRealAi ? '🟢 Generated by Gemini AI' : '🟡 Fitnexa Smart Planner'}</span>
          </div>

          <h2 class="text-2xl font-extrabold text-gradient">${plan.title}</h2>
          <p class="text-xs text-muted mt-1">Est. Duration: <strong>${plan.durationMin} mins</strong> • Calories: <strong>~${plan.caloriesBurn} kcal</strong></p>

          ${plan.coachNotes ? `
            <div class="coach-tip-callout mt-3 card-glass p-3 border-l-4 border-primary">
              <span class="text-xs font-bold text-primary uppercase">Coach Focus Tip</span>
              <p class="text-xs text-muted mt-1">${plan.coachNotes}</p>
            </div>
          ` : ''}

          <div class="mt-4">
            <h4 class="text-xs uppercase font-bold text-muted tracking-wider mb-2">Exercise Breakdown (${plan.exercises.length} Exercises)</h4>
            <div class="plan-exercise-list">
              ${plan.exercises.map((ex, i) => `
                <div class="plan-exercise-item card-glass">
                  <div class="flex items-center gap-3">
                    <span class="step-num">${i + 1}</span>
                    <div>
                      <div class="font-bold text-sm">${ex.name}</div>
                      <div class="text-xs text-muted">Target: <strong class="text-primary">${ex.target || 'General'}</strong></div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-mono font-bold text-sm">${ex.sets} × ${ex.reps} reps</div>
                    <div class="text-xs text-muted">Rest: ${ex.rest || 60}s</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-6">
            <button type="button" class="btn-primary btn-lg font-bold" onclick="FitnexaCoach.startGeneratedPlan()">
              🚀 Start This Workout Now
            </button>
            <button type="button" class="btn-secondary btn-lg font-semibold" onclick="FitnexaCoach.saveToCustomWorkouts()">
              💾 Save to My Workouts
            </button>
          </div>
        </div>
      `;

      modal.classList.add('open');
    },

    closeGeneratedPlanModal: function () {
      const modal = document.getElementById('generated-plan-modal');
      if (modal) modal.classList.remove('open');
    },

    startGeneratedPlan: function () {
      if (!activeGeneratedPlan) return;
      this.closeGeneratedPlanModal();
      FitnexaPlayer.startWorkout(activeGeneratedPlan);
    },

    saveToCustomWorkouts: function () {
      if (!activeGeneratedPlan) return;
      window.FITNEXA_DATA.workouts.unshift(activeGeneratedPlan);
      FitnexaStorage.addNotification({
        title: 'Workout Saved!',
        message: `"${activeGeneratedPlan.title}" has been saved to your Workout library.`,
        icon: '📁',
        time: 'Just now'
      });
      this.closeGeneratedPlanModal();
      FitnexaApp.navigateTo('workouts');
      FitnexaApp.renderWorkoutsView();
    }
  };
})();

window.FitnexaCoach = FitnexaCoach;
