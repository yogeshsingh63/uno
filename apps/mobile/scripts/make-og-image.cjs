// Generates public/og-image.png — a 1200x630 social preview banner.
// Draws a tilted fan of red/yellow/blue UNO cards + blocky "UNO" text.
const fs = require('fs');
const zlib = require('zlib');

const W = 1200, H = 630;
const buf = Buffer.alloc(W * H * 4); // RGBA

const BG = [12, 10, 15, 255];

function setPx(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = c[3];
}

// Rounded-rect membership in local (unrotated) coords
function inRoundedRect(lx, ly, cw, ch, r) {
  const hw = cw / 2, hh = ch / 2;
  const dx = Math.abs(lx) - (hw - r);
  const dy = Math.abs(ly) - (hh - r);
  if (dx <= 0 && dy <= 0) return true;
  if (dx <= 0) return dy <= r;
  if (dy <= 0) return dx <= r;
  return dx * dx + dy * dy <= r * r;
}

// Card: white border + inner color + white center oval-ish
function drawCard(px, py, rotDeg, color, scale) {
  const cw = 150 * scale, ch = 214 * scale, r = 16 * scale;
  const rad = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const white = [255, 255, 255, 255];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - px, dy = y - py;
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;
      if (!inRoundedRect(lx, ly, cw, ch, r)) continue;
      // white border 10px
      if (!inRoundedRect(lx, ly, cw - 20 * scale, ch - 20 * scale, Math.max(6, r - 10 * scale))) {
        setPx(x, y, white);
        continue;
      }
      setPx(x, y, color);
      // center white oval (rotated)
      const ox = lx, oy = ly - 0; // card-local
      if ((ox * ox) / (46 * scale * 46 * scale) + (oy * oy) / (70 * scale * 70 * scale) <= 1) {
        setPx(x, y, white);
      }
    }
  }
}

// 5x7 blocky font for U N O
const FONT = {
  U: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
};

function drawText(text, cx, cy, scale, color) {
  const glyphW = 5, glyphH = 7;
  const totalW = text.length * glyphW * scale + (text.length - 1) * scale * 2;
  let x0 = Math.round(cx - totalW / 2);
  let y0 = Math.round(cy - (glyphH * scale) / 2);
  for (let gi = 0; gi < text.length; gi++) {
    const rows = FONT[text[gi]];
    for (let ry = 0; ry < glyphH; ry++) {
      for (let rx = 0; rx < glyphW; rx++) {
        if (rows[ry][rx] === '1') {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              setPx(x0 + gi * (glyphW + 2) * scale + rx * scale + sx, y0 + ry * scale + sy, color);
            }
          }
        }
      }
    }
  }
}

// Background
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) setPx(x, y, BG);

// Subtle glow circles
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const d1 = Math.hypot(x - 200, y - 100) / 480;
    const d2 = Math.hypot(x - 1000, y - 560) / 520;
    if (d1 < 1) setPx(x, y, [237, 28, 36, Math.round(8 * (1 - d1))]);
    if (d2 < 1) setPx(x, y, [255, 186, 0, Math.round(8 * (1 - d2))]);
  }
}

// Card fan
drawCard(560, 300, -14, [232, 54, 75, 255], 1);
drawCard(690, 300, 0, [245, 184, 0, 255], 1);
drawCard(820, 300, 14, [43, 139, 245, 255], 1);

// "UNO" wordmark
drawText('UNO', 690, 500, 26, [254, 252, 250, 255]);

// Encode PNG
function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  };
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// CRC32
const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

const outDir = require('path').join(__dirname, '..', 'public');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(require('path').join(outDir, 'og-image.png'), encodePNG(W, H, buf));
console.log('wrote public/og-image.png', W + 'x' + H);
