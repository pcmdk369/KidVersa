let audioContext: AudioContext | null = null;
let engineOscillator: OscillatorNode | null = null;
let engineGain: GainNode | null = null;
let musicOscillator: OscillatorNode | null = null;
let musicGain: GainNode | null = null;

function context() {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  audioContext ??= new window.AudioContext();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

export function startRaceAudio() {
  const ctx = context();
  if (!ctx || engineOscillator) return;
  engineOscillator = ctx.createOscillator();
  engineGain = ctx.createGain();
  engineOscillator.type = 'sawtooth';
  engineOscillator.frequency.value = 72;
  engineGain.gain.value = 0.018;
  engineOscillator.connect(engineGain);
  engineGain.connect(ctx.destination);
  engineOscillator.start();
  musicOscillator = ctx.createOscillator();
  musicGain = ctx.createGain();
  musicOscillator.type = 'sine';
  musicOscillator.frequency.value = 196;
  musicGain.gain.value = 0.006;
  musicOscillator.connect(musicGain);
  musicGain.connect(ctx.destination);
  musicOscillator.start();
}

export function updateRaceAudio(speed: number) {
  if (!audioContext || !engineOscillator) return;
  engineOscillator.frequency.setTargetAtTime(58 + speed * 1.15, audioContext.currentTime, 0.08);
  musicOscillator?.frequency.setTargetAtTime(180 + (Math.floor(speed / 10) % 4) * 18, audioContext.currentTime, 0.3);
}

export function playRaceEffect(kind: 'boost' | 'crash' | 'finish') {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = kind === 'crash' ? 150 : kind === 'finish' ? 520 : 360;
  const end = kind === 'crash' ? 65 : kind === 'finish' ? 880 : 720;
  oscillator.type = kind === 'crash' ? 'triangle' : 'sine';
  oscillator.frequency.setValueAtTime(start, now);
  oscillator.frequency.exponentialRampToValueAtTime(end, now + (kind === 'finish' ? 0.42 : 0.16));
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(kind === 'crash' ? 0.07 : 0.045, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'finish' ? 0.48 : 0.2));
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + (kind === 'finish' ? 0.5 : 0.22));
}

export function stopRaceAudio() {
  [engineOscillator, musicOscillator].forEach(oscillator => {
    if (oscillator) { try { oscillator.stop(); } catch { /* already stopped */ } }
  });
  engineOscillator = null;
  musicOscillator = null;
  engineGain?.disconnect();
  musicGain?.disconnect();
  engineGain = null;
  musicGain = null;
}
