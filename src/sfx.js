// Sounds made in code, so no audio files are needed yet.
let ctx;

function tone(freq, dur, vol) {
  try {
    ctx = ctx || new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch { /* no sound available */ }
}

export const sfx = {
  advance: () => tone(660, 0.09, 0.07),
  tick: () => tone(440, 0.03, 0.02),
  select: () => tone(880, 0.07, 0.05),
  hit: () => tone(160, 0.18, 0.08),
  heal: () => tone(990, 0.15, 0.04),
};
