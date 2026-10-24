// The dance battle's song, made in code with the Web Audio API: drums, bass and a square-wave lead.
import { audio } from './sfx.js';

const SEMITONE = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };
export const freq = name => {
  const [, note, octave] = name.match(/^([A-G]#?)(\d)$/);
  return 440 * 2 ** ((SEMITONE[note] + (octave - 4) * 12) / 12);
};

let noise;
function noiseBuffer(ctx) {
  if (!noise || noise.sampleRate !== ctx.sampleRate) {
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noise;
}

// A gain that starts at `peak` and dies away over `decay` seconds.
function envelope(ctx, out, at, peak, decay) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(peak, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  g.connect(out);
  return g;
}

function tone(ctx, out, f, at, dur, type, peak) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.connect(envelope(ctx, out, at, peak, dur));
  o.start(at);
  o.stop(at + dur + 0.02);
}

function hiss(ctx, out, at, cutoff, peak, decay) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuffer(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = cutoff;
  s.connect(f).connect(envelope(ctx, out, at, peak, decay));
  s.start(at);
  s.stop(at + decay + 0.02);
}

function kick(ctx, out, at) {
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(140, at);
  o.frequency.exponentialRampToValueAtTime(45, at + 0.12);
  o.connect(envelope(ctx, out, at, 0.55, 0.16));
  o.start(at);
  o.stop(at + 0.2);
}

function snare(ctx, out, at) {
  hiss(ctx, out, at, 1200, 0.25, 0.13);
  tone(ctx, out, 190, at, 0.08, 'triangle', 0.16);
}

const hat = (ctx, out, at, open) => hiss(ctx, out, at, 7000, open ? 0.07 : 0.045, open ? 0.12 : 0.035);

// Schedules the whole song and returns its timeline. Times are seconds from the first beat.
// Melody notes that have an arrow are left silent here: they only sound when someone hits them.
export function startSong({ theme, bass, turns, countInBpm, laneOf }) {
  const ctx = audio();
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  const start = ctx.currentTime + 0.5;
  const notes = [], beats = [], turnStarts = [];
  let t = 0;

  const beat = 60 / countInBpm;
  for (let b = 0; b < 4; b++) {
    beats.push(t);
    hat(ctx, master, start + t, false);
    tone(ctx, master, b === 3 ? 1320 : 880, start + t, 0.05, 'square', 0.04);
    t += beat;
  }

  turns.forEach((turn, index) => {
    const eighth = 30 / turn.bpm;
    turnStarts.push({ at: t, who: turn.who, index });
    theme.forEach((bar, b) => {
      bar.forEach((note, step) => {
        const at = t + step * eighth;
        if (step % 2 === 0) {
          beats.push(at);
          kick(ctx, master, start + at);
          if (step === 2 || step === 6) snare(ctx, master, start + at);
        }
        hat(ctx, master, start + at, step === 7);
        tone(ctx, master, freq(bass[b]), start + at, eighth * 0.8, 'triangle', 0.22);
        if (note === '-') return;
        let length = 1;
        while (bar[step + length] === '-') length++;
        const dur = length * eighth * 0.9;
        if (turn.steps[b].includes(step)) notes.push({ time: at, lane: laneOf[note], who: turn.who, turn: index, freq: freq(note), dur });
        else tone(ctx, master, freq(note), start + at, dur, 'square', 0.05);
      });
      t += 8 * eighth;
    });
  });

  // a big B minor chord and a crash to finish
  kick(ctx, master, start + t);
  hiss(ctx, master, start + t, 3000, 0.14, 0.7);
  for (const n of ['B3', 'D4', 'F#4', 'B4']) tone(ctx, master, freq(n), start + t, 0.8, 'square', 0.04);

  return {
    notes, beats, turnStarts, end: t,
    now: () => ctx.currentTime - start,
    // Sounds a melody note for an arrow that was hit, on its beat if that is still to come.
    voice: n => tone(ctx, master, n.freq, Math.max(ctx.currentTime, start + n.time), n.dur, 'square', 0.07),
    stop: () => {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      setTimeout(() => master.disconnect(), 400);
    },
  };
}
