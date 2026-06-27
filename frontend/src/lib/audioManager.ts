/**
 * Advanced Nebula Deep-Space Procedural Audio Synthesis Engine
 * Generates organic, high-fidelity ambient stellar music and micro-synthesized sound effects.
 * Complies with browser autoplay restrictions by leveraging lazy-init audio contexts.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicActive: boolean = false;
  private sfxActive: boolean = false;

  // Background Synth Node Ref Lists
  private padVol: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private timerId: any = null;

  // Debouncing for mouse movement sounds
  private lastCursorSoundTime: number = 0;

  constructor() {
    // Lazy init via user actions
  }

  /**
   * Initializes the AudioContext upon user gesture
   */
  private init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMusicState(active: boolean) {
    this.init();
    this.musicActive = active;
    if (active) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
  }

  public setSfxState(active: boolean) {
    this.init();
    this.sfxActive = active;
  }

  public isMusicEnabled(): boolean {
    return this.musicActive;
  }

  public isSfxEnabled(): boolean {
    return this.sfxActive;
  }

  /**
   * Starts the slow, evolving background cosmic drone and chords
   */
  private startAmbientMusic() {
    if (!this.ctx) return;
    
    this.stopAmbientMusic(); // Ensure pristine setup

    const ctx = this.ctx;

    // Create Main Gain controller for background music
    this.padVol = ctx.createGain();
    this.padVol.gain.setValueAtTime(0, ctx.currentTime);
    // Smooth ramp-in to avoid clicking
    this.padVol.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 3);

    // Create low-pass space-suit filtering effect
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(320, ctx.currentTime);
    this.filter.Q.setValueAtTime(1.5, ctx.currentTime);

    // Deep space delay echo line to simulate a vast galactic void
    this.delayNode = ctx.createDelay(2.0);
    this.delayNode.delayTime.setValueAtTime(0.8, ctx.currentTime);
    this.delayGain = ctx.createGain();
    this.delayGain.gain.setValueAtTime(0.4, ctx.currentTime);

    // Connect delay loop feedback
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.delayNode);

    // Dynamic LFO to breathe air into the cutoff filter
    this.lfo = ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow 12s cycle

    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.setValueAtTime(140, ctx.currentTime);

    // Chain LFO
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);

    // Connect outputs
    this.padVol.connect(this.filter);
    this.filter.connect(ctx.destination);
    
    // Connect a split into delay to give it echo
    this.filter.connect(this.delayNode);
    this.delayNode.connect(ctx.destination);

    // Start filter modulation
    this.lfo.start();

    // Spawn rich ambient harmony oscillators
    this.playChordSystem();

    // Schedule evolving chord progressions every 10 seconds
    const loopChords = () => {
      this.playChordSystem();
      this.timerId = setTimeout(loopChords, 10000);
    };
    this.timerId = setTimeout(loopChords, 10000);
  }

  /**
   * Play dynamic evolving space frequencies mapping pentatonic major/minor chords
   */
  private playChordSystem(themeShift: boolean = false) {
    if (!this.ctx || !this.padVol) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Fade out previous oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop(now + 1.5);
      } catch (e) {}
    });
    this.oscillators = [];

    // Chords mapped as frequencies (pentatonic, deep, atmospheric)
    // Progression A: Cosmic Harmony (Cmaj9, Am9, Fmaj7)
    // Progression B: Deep stress (tension Drone)
    const chordSetStable = [
      [130.81, 164.81, 196.00, 246.94, 293.66], // C3, E3, G3, B3, D4 (Cmaj9)
      [110.00, 130.81, 164.81, 196.00, 220.00], // A2, C3, E3, G3, A3 (Am7)
      [87.31, 130.81, 174.61, 220.00, 261.63],   // F2, C3, F3, A3, C4 (Fmaj7)
    ];

    const randomChord = chordSetStable[Math.floor(Math.random() * chordSetStable.length)];

    randomChord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      // Use warm triangle waves for analog spacecraft cockpit vibes
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Micro detuning to create spatial stereo chorus texture
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0, now);
      // Soft fading attack to avoid visual/audio clipping
      oscGain.gain.linearRampToValueAtTime(0.12, now + 2.5);
      oscGain.gain.setValueAtTime(0.12, now + 7.5);
      // Soft release
      oscGain.gain.linearRampToValueAtTime(0, now + 10.0);

      osc.connect(oscGain);
      oscGain.connect(this.padVol!);
      
      osc.start(now);
      this.oscillators.push(osc);
    });
  }

  /**
   * Stops ambient pad generation
   */
  private stopAmbientMusic() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    const now = this.ctx ? this.ctx.currentTime : 0;

    this.oscillators.forEach(osc => {
      try {
        osc.stop(now);
      } catch (e) {}
    });
    this.oscillators = [];

    if (this.lfo) {
      try { this.lfo.stop(); } catch (e) {}
      this.lfo = null;
    }

    this.padVol = null;
    this.filter = null;
    this.delayNode = null;
    this.delayGain = null;
  }

  /**
   * Adjusts the low-pass cutoff and detune based on real-time stress levels
   */
  public handleStressChange(stress: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.filter) {
      // High stress opens up filter (harsher tone), low stress is deeply muted
      const cutoff = 200 + (1 - stress) * 180 + stress * 350;
      this.filter.frequency.setTargetAtTime(cutoff, now, 0.4);
    }
  }

  /**
   * Plays a delicate, crystalline cursor-sweep particle puff
   */
  public playCursorTick() {
    if (!this.sfxActive || !this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastCursorSoundTime < 0.12) return; // Cap density to avoid annoyance
    this.lastCursorSoundTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      // High cosmic frequency sparkle
      const randomPitch = 1200 + Math.random() * 800;
      osc.frequency.setValueAtTime(randomPitch, now);

      gain.gain.setValueAtTime(0.003, now); // extremely quiet and subtle
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(randomPitch, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch(e) {}
  }

  /**
   * Play clean tactile, futuristic digital UI button click sound effect
   */
  public playInterfaceClick() {
    if (!this.sfxActive || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High-frequency tactile ping followed by warm sub-resonance
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  /**
   * Action completed (Task checkbox or mastery trigger)
   * Uplifting dynamic arpeggio
   */
  public playTaskCompletion() {
    if (!this.sfxActive || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const pitches = [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6

      pitches.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.08 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  /**
   * Cybernetic calibration sweep when stress scales past limits (0.7)
   */
  public playSystemAlert() {
    if (!this.sfxActive || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      // Sweeps downwards to alert the brain
      osc.frequency.linearRampToValueAtTime(60, now + 0.5);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch (e) {}
  }

  /**
   * Sparkle sweep when system relaxes back to healthy flow state
   */
  public playSystemRecovered() {
    if (!this.sfxActive || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.3);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }
}

export const audioManager = new AudioManager();
