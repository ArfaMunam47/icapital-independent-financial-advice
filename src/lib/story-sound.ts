export type Soundscape = "wind" | "forest" | "ocean" | "birds" | "silk" | "quiet";
const scenes: Soundscape[] = ["wind", "wind", "wind", "quiet", "forest", "forest", "ocean", "birds", "silk", "silk", "ocean", "wind", "wind", "quiet"];
export function soundMix(progress: number): Record<Soundscape, number> {
  const mix = { wind: 0, forest: 0, ocean: 0, birds: 0, silk: 0, quiet: 0 };
  const p = Math.max(0, Math.min(scenes.length - 1, progress));
  const i = Math.floor(p);
  const current = scenes[i];
  const next = scenes[Math.min(i + 1, scenes.length - 1)];
  if (current) mix[current] += 1 - (p - i);
  if (next) mix[next] += p - i;
  return mix;
}

export function createStorySound() {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  const limiter = context.createDynamicsCompressor();
  master.connect(limiter).connect(context.destination);
  const gains: Partial<Record<Soundscape, GainNode>> = {};
  const sources: AudioScheduledSourceNode[] = [];
  const buffer = context.createBuffer(1, context.sampleRate * 12, context.sampleRate);
  const data = buffer.getChannelData(0);
  let previous = 0;
  for (let i = 0; i < data.length; i++) {
    previous = (previous + (Math.random() * 2 - 1) * 0.025) / 1.025;
    data[i] = previous * 5;
  }
  const noise = (name: Soundscape, frequency: number, level: number, pulse: number) => {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = frequency;
    const breathing = context.createGain();
    breathing.gain.value = level;
    const lfo = context.createOscillator();
    lfo.frequency.value = pulse;
    const depth = context.createGain();
    depth.gain.value = level * 0.45;
    lfo.connect(depth).connect(breathing.gain);
    const gain = context.createGain();
    gain.gain.value = 0;
    source.connect(filter).connect(breathing).connect(gain).connect(master);
    source.start(context.currentTime, Math.random() * 8);
    lfo.start();
    gains[name] = gain;
    sources.push(source, lfo);
  };
  noise("wind", 650, 0.23, 0.085);
  noise("ocean", 1400, 0.28, 0.13);
  noise("forest", 2300, 0.09, 0.06);
  noise("birds", 1100, 0.08, 0.1);
  const silk = context.createGain();
  silk.gain.value = 0;
  silk.connect(master);
  gains.silk = silk;
  for (const frequency of [130.81, 196, 261.63]) {
    const tone = context.createOscillator();
    tone.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.value = 0.025;
    tone.connect(gain).connect(silk);
    tone.start();
    sources.push(tone);
  }
  let mix = soundMix(0);
  let enabled = false;
  let disposed = false;
  const timer = window.setInterval(() => {
    if (!enabled || document.hidden || context.state !== "running") return;
    const amount = mix.birds * 0.035 + mix.forest * 0.018;
    if (amount < 0.003) return;
    const bird = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    bird.frequency.setValueAtTime(1800 + Math.random() * 800, now);
    bird.frequency.exponentialRampToValueAtTime(3200, now + 0.09);
    bird.frequency.exponentialRampToValueAtTime(1700, now + 0.23);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(amount, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    bird.connect(gain).connect(master);
    bird.start(now);
    bird.stop(now + 0.28);
    bird.onended = () => { bird.disconnect(); gain.disconnect(); };
  }, 3300);
  const visibility = () => {
    if (document.hidden) void context.suspend();
    else if (enabled) void context.resume().catch(() => undefined);
  };
  document.addEventListener("visibilitychange", visibility);
  return {
    async setEnabled(value: boolean) {
      enabled = value;
      if (value) await context.resume();
      if (!disposed) master.gain.setTargetAtTime(value ? 0.65 : 0, context.currentTime, 0.15);
    },
    update(progress: number) {
      if (disposed) return;
      mix = soundMix(progress);
      for (const [name, node] of Object.entries(gains)) node.gain.setTargetAtTime(mix[name as Soundscape], context.currentTime, 0.65);
    },
    dispose() {
      disposed = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
      sources.forEach(source => source.stop());
      void context.close();
    },
  };
}