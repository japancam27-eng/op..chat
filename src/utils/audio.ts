/**
 * Procedural Web Audio API sound generator for WhatsApp 3D.
 * Guarantees zero 404 external asset dependencies.
 */

class SoundFX {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // WhatsApp sent "pop/swoosh"
  playSent() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  // WhatsApp incoming message "ping"
  playReceived() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      
      // Dual harmonic bell tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(784, now); // G5
      osc1.frequency.setValueAtTime(1046.5, now + 0.07); // C6

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now); // D6
      osc2.frequency.setValueAtTime(1567.98, now + 0.07); // G6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // ignore
    }
  }

  // UI click tap
  playTap() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // ignore
    }
  }

  // Call ringtone generator (repeats harmonic ring)
  private ringOsc1: OscillatorNode | null = null;
  private ringOsc2: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private ringInterval: number | null = null;

  startRingtone() {
    try {
      const ctx = this.initCtx();
      this.stopRingtone();

      const ringBurst = () => {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setValueAtTime(0.12, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
      };

      ringBurst();
      this.ringInterval = window.setInterval(ringBurst, 2400);
    } catch {
      // ignore
    }
  }

  stopRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  // Call connected chime
  playCallConnected() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // ignore
    }
  }

  // Play procedurally synthesized voice note audio preview
  playVoiceNote(durationSeconds: number, onProgress?: (pct: number) => void, onComplete?: () => void) {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Formant simulation for voice-like timbre
      osc.type = 'sawtooth';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(3, now);

      // Random natural speech pitch modulation
      let t = now;
      const step = 0.15;
      const pitches = [180, 220, 260, 200, 190, 240, 210, 270, 185];
      for (let i = 0; i < Math.floor(durationSeconds / step); i++) {
        const pitch = pitches[i % pitches.length] + (Math.sin(i * 0.7) * 30);
        osc.frequency.setValueAtTime(pitch, t);
        filter.frequency.setValueAtTime(600 + Math.sin(i * 1.2) * 500, t);
        t += step;
      }

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0.08, now + durationSeconds - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);

      const startTime = Date.now();
      const timer = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(1, elapsed / durationSeconds);
        onProgress?.(progress);
        if (progress >= 1) {
          clearInterval(timer);
          onComplete?.();
        }
      }, 50);

      return () => {
        clearInterval(timer);
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      };
    } catch {
      onComplete?.();
      return () => {};
    }
  }
}

export const soundFX = new SoundFX();
