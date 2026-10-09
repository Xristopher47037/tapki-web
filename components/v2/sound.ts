// Web Audio synth: a soft ambient pad plus an NFC "ping" when the phone touches the plate.

let ctx: AudioContext | null = null;
let pad: { master: GainNode; stop: () => void } | null = null;

export function startPad() {
  ctx ??= new AudioContext();
  void ctx.resume();
  if (pad) return;
  const c = ctx;
  const master = c.createGain();
  master.gain.value = 0;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.8;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 450;
  lfo.connect(lfoGain).connect(filter.frequency);
  filter.connect(master).connect(c.destination);

  // A minor add9, each voice a slightly detuned pair
  const oscs = [110, 164.81, 246.94, 329.63].flatMap((f, i) =>
    [-4, 4].map((detune) => {
      const o = c.createOscillator();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = detune;
      const g = c.createGain();
      g.gain.value = i === 0 ? 0.35 : 0.12;
      o.connect(g).connect(filter);
      o.start();
      return o;
    }),
  );
  lfo.start();
  master.gain.linearRampToValueAtTime(0.09, c.currentTime + 1.5);

  pad = {
    master,
    stop: () => {
      const now = c.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.6);
      [...oscs, lfo].forEach((o) => o.stop(now + 0.65));
    },
  };
}

export function stopPad() {
  pad?.stop();
  pad = null;
}

export function ping() {
  if (!ctx || !pad) return;
  const c = ctx;
  [1318.5, 1975.5].forEach((f, i) => {
    const at = c.currentTime + i * 0.09;
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.18, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
    o.connect(g).connect(c.destination);
    o.start(at);
    o.stop(at + 0.4);
  });
}
