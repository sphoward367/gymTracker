/**
 * Generates placeholder PWA icons (purple background with white "L").
 * Uses only Node.js built-in modules — no dependencies needed.
 * Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(size) {
  const bgR = 0x67, bgG = 0x50, bgB = 0xA4; // --color-primary #6750A4
  const fgR = 0xFF, fgG = 0xFF, fgB = 0xFF; // white

  // Create raw pixel data (RGBA) with filter byte per row
  const rowBytes = size * 4 + 1; // +1 for filter byte
  const rawData = Buffer.alloc(rowBytes * size);

  // Fill background
  for (let y = 0; y < size; y++) {
    rawData[y * rowBytes] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const offset = y * rowBytes + 1 + x * 4;
      rawData[offset] = bgR;
      rawData[offset + 1] = bgG;
      rawData[offset + 2] = bgB;
      rawData[offset + 3] = 0xFF;
    }
  }

  // Draw "L" letter
  const margin = Math.floor(size * 0.25);
  const thickness = Math.max(Math.floor(size * 0.12), 2);
  const right = size - margin;
  const bottom = size - margin;

  for (let y = margin; y < bottom; y++) {
    for (let x = margin; x < margin + thickness; x++) {
      setPixel(rawData, rowBytes, x, y, fgR, fgG, fgB);
    }
  }
  for (let y = bottom - thickness; y < bottom; y++) {
    for (let x = margin; x < right; x++) {
      setPixel(rawData, rowBytes, x, y, fgR, fgG, fgB);
    }
  }

  // Compress
  const compressed = zlib.deflateSync(rawData);

  // Build PNG
  const chunks = [];
  chunks.push(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])); // PNG signature

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);  // width
  ihdr.writeUInt32BE(size, 4);  // height
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type: RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace
  chunks.push(makeChunk('IHDR', ihdr));

  // IDAT
  chunks.push(makeChunk('IDAT', compressed));

  // IEND
  chunks.push(makeChunk('IEND', Buffer.alloc(0)));

  return Buffer.concat(chunks);
}

function setPixel(data, rowBytes, x, y, r, g, b) {
  const offset = y * rowBytes + 1 + x * 4;
  data[offset] = r;
  data[offset + 1] = g;
  data[offset + 2] = b;
  data[offset + 3] = 0xFF;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData) >>> 0, 0);

  return Buffer.concat([len, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return crc ^ 0xFFFFFFFF;
}

// Generate icons
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

const sizes = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180 };

for (const [filename, size] of Object.entries(sizes)) {
  const png = createPNG(size);
  fs.writeFileSync(path.join(iconsDir, filename), png);
  console.log(`Created ${filename} (${size}x${size})`);
}

console.log('Done!');
