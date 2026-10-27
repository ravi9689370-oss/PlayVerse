// Tiny WebAudio sound-effects helper.
// Sound can be muted via the player toolbar; the preference is persisted.
// All playback is wrapped in try/catch so audio failures never break gameplay.

const KEY = 'playverse.sound';
let enabled = true;

try {
  enabled = localStorage.getItem(KEY) !== 'off';
} catch {
  /* storage unavailable - keep default */
}

let ctx = null;

function ensureCtx() {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  } catch {
    return null;
  }
}

const TONES = {
  flip: { freq: 320, dur: 0.07, type: 'triangle' },
  match: { freq: 620, dur: 0.16, type: 'sine' },
  win: { freq: 760, dur: 0.35, type: 'sine' },
  lose: { freq: 180, dur: 0.3, type: 'sawtooth' },
  hit: { freq: 520, dur: 0.08, type: 'square' },
  bounce: { freq: 240, dur: 0.05, type: 'square' },
  brick: { freq: 420, dur: 0.09, type: 'square' },
  slide: { freq: 200, dur: 0.05, type: 'triangle' },
};

export const sfx = {
  isEnabled() {
    return enabled;
  },
  setEnabled(v) {
    enabled = !!v;
    try {
      localStorage.setItem(KEY, enabled ? 'on' : 'off');
    } catch {
      /* ignore */
    }
  },
  play(name) {
    if (!enabled) return;
    const tone = TONES[name];
    if (!tone) return;
    try {
      const c = ensureCtx();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = tone.type;
      osc.frequency.value = tone.freq;
      gain.gain.setValueAtTime(0.08, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + tone.dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + tone.dur);
    } catch {
      /* audio unavailable - silently ignore */
    }
  },
};
