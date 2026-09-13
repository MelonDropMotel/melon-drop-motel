let ctx: AudioContext | null = null;
let wave: PeriodicWave | null = null;
let note = 0;

// Stay with Melon hook, quantized for 16-bit doots.
const MELODY = [
  67, 58, 67, 58, 62, 58, 65, 67, 69, 67, 62, 67, 62, 57, 65, 57, 67, 62, 65,
  62, 65, 69, 62, 65, 67, 65, 53, 57, 58, 53,
];

function hz(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function audio() {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    if (!wave) {
      const n = 16;
      const real = new Float32Array(n);
      const imag = new Float32Array(n);
      for (let i = 1; i < n; i++) {
        real[i] = i % 4 === 1 ? 0.55 / i : 0.08 / i;
      }
      wave = ctx.createPeriodicWave(real, imag);
    }
    return ctx;
  } catch {
    return null;
  }
}

export function resumeArcade() {
  audio();
}

export function pegDoot(shift = 0) {
  const c = audio();
  if (!c || !wave) return;
  const t = c.currentTime;
  const midi = MELODY[note % MELODY.length] + shift;
  note += 1;
  const f = hz(midi);

  const osc = c.createOscillator();
  osc.setPeriodicWave(wave);
  osc.frequency.setValueAtTime(f, t);
  osc.frequency.exponentialRampToValueAtTime(f * 0.985, t + 0.12);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.09, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2800, t);
  filter.frequency.exponentialRampToValueAtTime(900, t + 0.12);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.15);

  const echo = c.createOscillator();
  echo.setPeriodicWave(wave);
  echo.frequency.value = f;
  const eg = c.createGain();
  eg.gain.setValueAtTime(0.0001, t + 0.07);
  eg.gain.exponentialRampToValueAtTime(0.03, t + 0.08);
  eg.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  echo.connect(eg);
  eg.connect(c.destination);
  echo.start(t + 0.07);
  echo.stop(t + 0.22);
}

export function landNoise() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const thud = c.createOscillator();
  const thudGain = c.createGain();
  thud.type = "triangle";
  thud.frequency.setValueAtTime(140, t);
  thud.frequency.exponentialRampToValueAtTime(48, t + 0.22);
  thudGain.gain.setValueAtTime(0.16, t);
  thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  thud.connect(thudGain);
  thudGain.connect(c.destination);
  thud.start(t);
  thud.stop(t + 0.3);

  const n = c.createBuffer(1, Math.floor(c.sampleRate * 0.18), c.sampleRate);
  const data = n.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const noise = c.createBufferSource();
  noise.buffer = n;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.12, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  noise.connect(filter);
  filter.connect(ng);
  ng.connect(c.destination);
  noise.start(t);
  noise.stop(t + 0.18);
}
