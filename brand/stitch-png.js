/* Join same-height PNG tiles, left to right, into one PNG.
   Exists because headless Chrome silently won't paint a surface past its ceiling
   (device px, so dsf doesn't help) - see CLAUDE.md "Generated assets".
   Pure Node; handles 8-bit non-interlaced grey/truecolour(+alpha) and refuses
   anything else rather than writing a plausible wrong file.

     node stitch-png.js <out.png> <tile0.png> <tile1.png> [...]

   Verified: back wall whole at 1px/mm vs 3 tiles stitched differ in 2,415 of 26.6M
   px (median 2/255), none within 2px of a seam - curve antialiasing only. Chrome is
   deterministic, so re-run that check after changing slicing or this file.
*/
const fs = require("fs");
const zlib = require("zlib");

const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc = (buf, c) => {
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c;
};
const chunk = (type, data) => {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE((crc(data, crc(t, 0xffffffff)) ^ 0xffffffff) >>> 0, 0);
  return Buffer.concat([len, t, data, sum]);
};

// Palette (3) absent on purpose: it'd need merging across tiles, and Chrome never writes one.
const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 };

// Returns unfiltered bytes: h rows of w*channels, no filter byte.
function decode(file) {
  const b = fs.readFileSync(file);
  if (!b.subarray(0, 8).equals(SIG)) throw new Error(`${file}: not a PNG`);

  let head = null;
  const idat = [];
  for (let off = 8; off + 8 <= b.length; ) {
    const len = b.readUInt32BE(off);
    const type = b.toString("ascii", off + 4, off + 8);
    const data = b.subarray(off + 8, off + 8 + len);
    if (type === "IHDR")
      head = {
        w: data.readUInt32BE(0), h: data.readUInt32BE(4),
        depth: data[8], color: data[9], interlace: data[12],
      };
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  if (!head) throw new Error(`${file}: no IHDR`);
  const ch = CHANNELS[head.color];
  if (head.depth !== 8 || head.interlace !== 0 || !ch)
    throw new Error(
      `${file}: unsupported PNG (depth ${head.depth}, colour type ${head.color}, ` +
        `interlace ${head.interlace}) - expected 8-bit, non-interlaced, colour type 0/2/4/6`
    );

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = head.w * ch;
  if (raw.length < head.h * (stride + 1)) throw new Error(`${file}: truncated image data`);

  const out = Buffer.allocUnsafe(head.h * stride);
  for (let y = 0, p = 0; y < head.h; y++) {
    const ft = raw[p++];
    const line = raw.subarray(p, p + stride);
    p += stride;
    const o = y * stride;
    const up = o - stride;
    if (ft === 0) {
      line.copy(out, o);
    } else if (ft === 2) {
      if (y === 0) line.copy(out, o);
      else for (let x = 0; x < stride; x++) out[o + x] = (line[x] + out[up + x]) & 0xff;
    } else if (ft === 1 || ft === 3 || ft === 4) {
      for (let x = 0; x < stride; x++) {
        const a = x >= ch ? out[o + x - ch] : 0;
        const bb = y > 0 ? out[up + x] : 0;
        const c = x >= ch && y > 0 ? out[up + x - ch] : 0;
        let v = line[x];
        if (ft === 1) v += a;
        else if (ft === 3) v += (a + bb) >> 1;
        else {
          const pa = Math.abs(bb - c), pb = Math.abs(a - c), pc = Math.abs(a + bb - 2 * c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c;
        }
        out[o + x] = v & 0xff;
      }
    } else throw new Error(`${file}: bad row filter ${ft} on row ${y}`);
  }
  return { w: head.w, h: head.h, ch, color: head.color, data: out, stride };
}

/* Streamed row by row: the back wall is ~300MB raw, and buffering it plus a
   compressed copy fails. Up filter throughout - flat art compresses to near nothing. */
async function encode(file, w, h, ch, color, rowOf) {
  const out = fs.createWriteStream(file);
  const push = (buf) => (out.write(buf) ? null : new Promise((r) => out.once("drain", r)));

  await push(SIG);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = color;
  await push(chunk("IHDR", ihdr));

  const def = zlib.createDeflate({ level: 6 });
  def.on("data", (d) => {
    if (!out.write(chunk("IDAT", d))) def.pause();
  });
  out.on("drain", () => def.resume());
  const closed = new Promise((res, rej) => {
    def.on("end", () => out.end(chunk("IEND", Buffer.alloc(0)), res));
    def.on("error", rej);
    out.on("error", rej);
  });

  const stride = w * ch;
  /* Both give a valid PNG full of wrong pixels if "simplified": prev must be COPIED
     (rowOf reuses one buffer), and `line` allocated per row (streams queue by
     reference, so a shared buffer is overwritten before deflate consumes it). */
  const prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const row = rowOf(y);
    const line = Buffer.allocUnsafe(1 + stride);
    line[0] = 2; // Up
    for (let x = 0; x < stride; x++) line[1 + x] = (row[x] - prev[x]) & 0xff;
    row.copy(prev);
    if (!def.write(line)) await new Promise((r) => def.once("drain", r));
  }
  def.end();
  await closed;
}

(async () => {
  const [outFile, ...tileFiles] = process.argv.slice(2);
  if (!outFile || !tileFiles.length) {
    console.error("usage: node stitch-png.js <out.png> <tile0.png> <tile1.png> [...]");
    process.exit(2);
  }

  const tiles = tileFiles.map(decode);
  const h = tiles[0].h;
  const { ch, color } = tiles[0];
  for (const [i, t] of tiles.entries()) {
    if (t.h !== h) throw new Error(`${tileFiles[i]}: height ${t.h}, expected ${h}`);
    if (t.ch !== ch) throw new Error(`${tileFiles[i]}: colour type ${t.color}, expected ${color}`);
  }
  const w = tiles.reduce((a, t) => a + t.w, 0);

  let x = 0;
  const at = tiles.map((t) => {
    const o = x * ch;
    x += t.w;
    return o;
  });

  const row = Buffer.allocUnsafe(w * ch);
  await encode(outFile, w, h, ch, color, (y) => {
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      t.data.copy(row, at[i], y * t.stride, (y + 1) * t.stride);
    }
    return row;
  });

  console.log(
    `  ${outFile.replace(/^.*\//, "")}  ${w}x${h}  ` +
      `(${tiles.map((t) => t.w).join(" + ")} joined)`
  );
})().catch((e) => {
  console.error(`stitch-png: ${e.message}`);
  process.exit(1);
});
