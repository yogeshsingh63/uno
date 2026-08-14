// Generates tiny synthesized WAV sound effects for the game.
// Run: node scripts/generate-sounds.js   (from apps/mobile)
const fs = require('fs');
const path = require('path');

const SR = 22050; // sample rate
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

function writeWav(name, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);      // fmt chunk size
  buf.writeUInt16LE(1, 20);       // PCM
  buf.writeUInt16LE(1, 22);       // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);  // byte rate
  buf.writeUInt16LE(2, 32);       // block align
  buf.writeUInt16LE(16, 34);      // bits per sample
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT_DIR, name), buf);
  console.log('wrote', name, (buf.length / 1024).toFixed(1) + 'KB');
}

function env(i, n, attack, release) {
  const a = Math.floor(n * attack);
  const r = Math.floor(n * release);
  if (i < a) return i / a;
  if (i > n - r) return Math.max(0, (n - i) / r);
  return 1;
}

// ---- draw: rising whoosh (noise + pitch sweep) ----
function draw() {
  const n = Math.floor(SR * 0.3);
  const out = new Array(n);
  let phase = 0;
  let noise = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const freq = 300 + 900 * t * t;
    phase += (2 * Math.PI * freq) / SR;
    noise = noise * 0.9 + (Math.random() * 2 - 1) * 0.1;
    const tone = Math.sin(phase) * 0.35;
    const e = env(i, n, 0.05, 0.5);
    out[i] = (tone + noise * 1.4) * e * 0.5 * t;
  }
  return out;
}

// ---- play: card slap (fast noise burst + low thump) ----
function play() {
  const n = Math.floor(SR * 0.14);
  const out = new Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const e = Math.exp(-t * 22) * env(i, n, 0.01, 0.25);
    const snap = (Math.random() * 2 - 1) * e;
    lp = lp * 0.82 + snap * 0.18; // cheap lowpass → thump
    out[i] = snap * 0.8 + lp * 1.2;
  }
  return out;
}

// ---- uno: bright two-tone chime ----
function uno() {
  const n = Math.floor(SR * 0.42);
  const out = new Array(n);
  const notes = [880, 1174.66];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const seg = t < 0.5 ? 0 : 1;
    const local = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
    const freq = notes[seg];
    const fade = Math.exp(-local * 6) * env(i, n, 0.02, 0.4);
    const s = Math.sin(2 * Math.PI * freq * i / SR) + 0.4 * Math.sin(2 * Math.PI * freq * 2 * i / SR);
    out[i] = s * fade * 0.4;
  }
  return out;
}

// ---- win: quick C-E-G-C fanfare ----
function win() {
  const n = Math.floor(SR * 0.9);
  const out = new Array(n).fill(0);
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const segLen = n / 4;
  notes.forEach((freq, seg) => {
    for (let i = 0; i < segLen; i++) {
      const idx = Math.floor(seg * segLen) + i;
      if (idx >= n) return;
      const local = i / segLen;
      const e = Math.min(1, local * 6) * Math.exp(-(1 - local) * 4);
      const s = Math.sin(2 * Math.PI * freq * idx / SR) + 0.3 * Math.sin(4 * Math.PI * freq * idx / SR);
      out[idx] += s * e * 0.32;
    }
  });
  return out;
}

// ---- error: low buzz ----
function error() {
  const n = Math.floor(SR * 0.28);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const e = env(i, n, 0.02, 0.5);
    const s = Math.sin(2 * Math.PI * 160 * i / SR) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 8 * i / SR));
    out[i] = s * e * 0.5;
  }
  return out;
}

// ---- pick: short tick ----
function pick() {
  const n = Math.floor(SR * 0.07);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const e = Math.exp(-i / (n * 0.25));
    out[i] = Math.sin(2 * Math.PI * 1400 * i / SR) * e * 0.3;
  }
  return out;
}

// ---- turn: gentle two-note ping (fires often — must not annoy) ----
function turn() {
  const n = Math.floor(SR * 0.24);
  const out = new Array(n);
  const notes = [660, 880];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const seg = t < 0.55 ? 0 : 1;
    const local = seg === 0 ? t / 0.55 : (t - 0.55) / 0.45;
    const freq = notes[seg];
    const e = Math.min(1, local * 20) * Math.exp(-local * 9);
    const s = Math.sin(2 * Math.PI * freq * i / SR) + 0.35 * Math.sin(4 * Math.PI * freq * i / SR);
    out[i] = s * e * 0.22;
  }
  return out;
}

// ---- caught: comedic gotcha buzzer (wobbly low tone) ----
function caught() {
  const n = Math.floor(SR * 0.34);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const freq = 190 - 60 * t + 8 * Math.sin(2 * Math.PI * 11 * t);
    const e = env(i, n, 0.03, 0.4);
    const s = Math.sin(2 * Math.PI * freq * i / SR) + 0.5 * Math.sin(2 * Math.PI * freq * 1.5 * i / SR);
    out[i] = s * e * 0.34;
  }
  return out;
}

// ---- click: near-silent tactile tick ----
function click() {
  const n = Math.floor(SR * 0.045);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const e = Math.exp(-i / (n * 0.2));
    out[i] = Math.sin(2 * Math.PI * 900 * i / SR) * e * 0.16;
  }
  return out;
}

// ---- pop: soft room join/leave blip ----
function pop() {
  const n = Math.floor(SR * 0.14);
  const out = new Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const freq = 300 + 260 * t;
    phase += (2 * Math.PI * freq) / SR;
    const e = Math.min(1, t * 30) * Math.exp(-t * 16);
    out[i] = Math.sin(phase) * e * 0.3;
  }
  return out;
}

// ---- reverse: rising-then-falling whoosh ----
function reverse() {
  const n = Math.floor(SR * 0.3);
  const out = new Array(n);
  let phase = 0;
  let noise = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    // arc: up then down
    const sweep = t < 0.5 ? t * 2 : 1 - (t - 0.5) * 2;
    const freq = 220 + 620 * sweep;
    phase += (2 * Math.PI * freq) / SR;
    noise = noise * 0.85 + (Math.random() * 2 - 1) * 0.15;
    const e = env(i, n, 0.08, 0.45) * Math.sin(Math.PI * t);
    out[i] = (Math.sin(phase) * 0.3 + noise * 0.9) * e * 0.4;
  }
  return out;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
writeWav('draw.wav', draw());
writeWav('play.wav', play());
writeWav('uno.wav', uno());
writeWav('win.wav', win());
writeWav('error.wav', error());
writeWav('pick.wav', pick());
writeWav('turn.wav', turn());
writeWav('caught.wav', caught());
writeWav('click.wav', click());
writeWav('pop.wav', pop());
writeWav('reverse.wav', reverse());
