/* Join PNG tiles side by side into one PNG.

   WHY THIS EXISTS. Headless Chrome will not paint a surface as wide as the 40ft
   bay back wall: at 24,464 device pixels it fills a band at the top left and
   leaves the rest of the screenshot flat background, silently - the file is the
   right size and most of the artwork is simply not in it. Authoring at half the
   unit and shooting with --force-device-scale-factor=2 keeps the WINDOW legal
   but not the surface, because the surface is sized in device pixels and the
   scale factor is what multiplies them. So rasterize-bay.sh shoots such a panel
   as several tiles, each within the ceiling, and this joins them back up.

   Pure Node - no image library. It handles what Chrome emits (8-bit,
   non-interlaced, greyscale or truecolour with or without alpha) and refuses
   anything else rather than writing a plausible-looking wrong file.

   Tiles must all be the same height and must be given in left-to-right order;
   their widths are summed, so a narrower last tile is expected and fine. The
   seam is invisible by construction: every tile is the same page at the same
   unit, clipped to a different whole-pixel window, so glyphs land on identical
   subpixel positions in each.

     node stitch-png.js <out.png> <tile0.png> <tile1.png> [...]

   VERIFIED against the thing it replaces: the back wall page rendered whole at
   1px/mm (small enough that Chrome paints it in one go) and the same page shot
   as three tiles and joined here differ in 2,415 of 26.6M pixels - 0.009%, with
   a median delta of 2/255 - and NOT ONE of them is within 2px of a seam. The
   joins are exact; the residue is antialiasing on the curves of the lockup and
   the ghost drops, which Chrome resolves fractionally differently when the page
   is clipped to a tile. It is invisible at 51dpi on a 12m banner. Repeat that
   check before trusting a change to the slicing or to this file - and note that
   Chrome itself is deterministic run to run, so any NEW difference is yours.
*/
const fs = require("fs");
const zlib = require("zlib");

/* ---- PNG plumbing ---- */
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

/* Channels per pixel by colour type. 3 (palette) is absent on purpose: a
   palette would have to be merged across tiles, and Chrome never writes one. */
const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 };

/* ---- decode one tile to raw pixels ----
   Returns the unfiltered bytes: h rows of w*channels, no per-row filter byte. */
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
    /* None and Up are what a screenshot of flat artwork is mostly made of, so
       they get a copy loop rather than the general per-byte one. */
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

/* ---- encode ----
   Rows are filtered and deflated as they are built rather than assembled into
   one buffer first: the back wall is 24464 x 4348 x 3 bytes = 300MB of raw
   pixels, and holding a compressed copy of that alongside it is what turns a
   slow step into a failed one. Deflate output is wrapped chunk by chunk, which
   is why the file carries many IDATs - exactly as Chrome's own do.

   Every row is written with the Up filter: the artwork is flat colour and long
   vertical runs, so most rows subtract to zero and compress to nearly nothing. */
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
  /* prev is COPIED into, never pointed at the row: rowOf hands back one reused
     scratch buffer, so keeping a reference would make prev and row the same
     bytes, every delta zero, and the whole image row 0 repeated.

     The filtered line, in turn, is allocated PER ROW and never reused. A stream
     queues the buffer it is handed by reference, so a shared line buffer is
     rewritten under any write that has not been consumed yet - which is most of
     them, since deflate is slower than this loop. Both of these produce a
     perfectly valid PNG full of wrong pixels. */
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

/* ---- main ---- */
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

  /* Column each tile starts at in the joined image. */
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
