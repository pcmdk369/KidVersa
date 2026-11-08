let context: AudioContext | null = null;
let oscillators: OscillatorNode[] = [];
let master: GainNode | null = null;
function getAudio(): AudioContext | null {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  context ??= new window.AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}
export function playKidVersaSound(kind: 'tap' | 'success' = 'tap') {
  const audio = getAudio();
  if (!audio) return;
  const now = audio.currentTime;
  const notes = kind === 'success' ? [523.25, 659.25, 783.99] : [440];
  notes.forEach((frequency, index) => {
    const start = now + index * 0.11;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(kind === 'success' ? 0.075 : 0.035, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.22);
  });
}
export function setKidVersaMusic(enabled: boolean) {
  const audio = getAudio();
  if (!audio) return;
  if (!enabled) {
    oscillators.forEach(oscillator => { try { oscillator.stop(); } catch { /* stopped */ } });
    oscillators = [];
    master?.disconnect();
    master = null;
    return;
  }
  if (oscillators.length) return;
  master = audio.createGain();
  master.gain.value = 0.012;
  master.connect(audio.destination);
  [130.81, 164.81, 196].forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const voice = audio.createGain();
    oscillator.type = index === 0 ? 'sine' : 'triangle';
    oscillator.frequency.value = frequency;
    voice.gain.value = index === 0 ? 0.42 : 0.18;
    oscillator.connect(voice);
    voice.connect(master as GainNode);
    oscillator.start();
    oscillators.push(oscillator);
  });
}
