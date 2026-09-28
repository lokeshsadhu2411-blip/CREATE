// ===================================================================
// FITNEXA AI: Audio Synthesizer (Web Audio API)
// Provides clean, responsive auditory cues without external MP3 files
// ===================================================================

const FitnexaAudio = (function () {
  let audioCtx = null;
  let isMuted = false;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function setMuted(muted) {
    isMuted = !!muted;
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1, delay = 0) {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  return {
    setMuted,

    // Short beep for timer countdowns (3.. 2.. 1..)
    playCountdownBeep: function () {
      playTone(587.33, 'triangle', 0.12, 0.15); // D5
    },

    // Final alert when rest timer hits zero
    playTimerFinished: function () {
      if (isMuted) return;
      playTone(523.25, 'sine', 0.2, 0.2, 0);     // C5
      playTone(659.25, 'sine', 0.2, 0.2, 0.12);  // E5
      playTone(783.99, 'sine', 0.35, 0.25, 0.24); // G5
      playTone(1046.50, 'sine', 0.5, 0.3, 0.38); // C6
    },

    // Crisp positive click when completing a set
    playSetComplete: function () {
      if (isMuted) return;
      playTone(600, 'sine', 0.08, 0.15, 0);
      playTone(900, 'sine', 0.15, 0.2, 0.07);
    },

    // Triumphant chord for workout completion or new PR
    playCelebration: function () {
      if (isMuted) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, index) => {
        playTone(freq, 'triangle', 0.35, 0.18, index * 0.09);
      });
    },

    // Subtle tactile tap
    playTap: function () {
      playTone(400, 'sine', 0.04, 0.05);
    }
  };
})();

window.FitnexaAudio = FitnexaAudio;
