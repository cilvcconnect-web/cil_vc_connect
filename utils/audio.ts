/**
 * CIL VC Connect Audio Synthesizer
 * Uses Web Audio API to construct clean, modular tunes.
 * Handles browser user-gesture restrictions gracefully.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * VC Reminder Tune Options
 * Supports:
 * - 'crystal': Ascending high-frequency glass bell chimes (Sine helper)
 * - 'zen': Meditative F Major 7 acoustic arpeggio (Triangle helper)
 */
export function playVcReminderTune(type: string = 'crystal') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'zen') {
      // Gentle Fmaj7 relaxing tones
      const notes = [
        { freq: 349.23, time: 0 },    // F4
        { freq: 440.00, time: 0.12 },  // A4
        { freq: 523.25, time: 0.24 },  // C5
        { freq: 659.25, time: 0.36 },  // E5
      ];
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.time);
        
        gainNode.gain.setValueAtTime(0, now + note.time);
        gainNode.gain.linearRampToValueAtTime(0.15, now + note.time + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + note.time + 0.8);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now + note.time);
        osc.stop(now + note.time + 0.82);
      });
    } else {
      // Default: 'crystal' chimes
      const notes = [
        { freq: 523.25, time: 0 },     // C5
        { freq: 659.25, time: 0.12 },  // E5
        { freq: 783.99, time: 0.24 },  // G5
        { freq: 1046.50, time: 0.36 }, // C6
      ];
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.time);
        
        gainNode.gain.setValueAtTime(0, now + note.time);
        gainNode.gain.linearRampToValueAtTime(0.18, now + note.time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + note.time + 0.6);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now + note.time);
        osc.stop(now + note.time + 0.62);
      });
    }
  } catch (error) {
    console.error('Failed to trigger VC reminder tune:', error);
  }
}

/**
 * Technical Issue Tune Options
 * Supports:
 * - 'siren': Two-note heavy sawtooth warning sirens (Industrial grade)
 * - 'warble': Strobe frequency modulated alert blip (High frequency sweep)
 */
export function playTechnicalIssueTune(type: string = 'siren') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'warble') {
      // High frequency pitch sweep warning signal
      const duration = 0.5;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.25);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } else {
      // Default: 'siren' dual pulse pattern
      const pulses = [
        { freq1: 880, freq2: 440, time: 0 },
        { freq1: 880, freq2: 440, time: 0.22 },
        { freq1: 880, freq2: 440, time: 0.44 },
      ];
      pulses.forEach((pulse) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(pulse.freq1, now + pulse.time);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(pulse.freq2, now + pulse.time);

        gainNode.gain.setValueAtTime(0, now + pulse.time);
        gainNode.gain.linearRampToValueAtTime(0.12, now + pulse.time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + pulse.time + 0.2);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now + pulse.time);
        osc2.start(now + pulse.time);

        osc1.stop(now + pulse.time + 0.21);
        osc2.stop(now + pulse.time + 0.21);
      });
    }
  } catch (error) {
    console.error('Failed to trigger technical issue tune:', error);
  }
}
