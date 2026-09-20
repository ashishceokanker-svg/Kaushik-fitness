import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcTarget = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(crcTarget), 8 + len);
  return buf;
}

function generateGymIconPNG(size) {
  // RGBA buffer for uncompressed scanlines: each row has 1 filter byte (0) + width * 4 bytes
  const rowBytes = 1 + size * 4;
  const rawData = Buffer.alloc(rowBytes * size);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.44;
  const innerRadius = size * 0.41;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded dark slate background (#0f172a)
      let r = 15, g = 23, b = 42, a = 255;

      // Golden amber ring (#f59e0b)
      if (dist <= radius && dist >= innerRadius) {
        r = 245; g = 158; b = 11; a = 255;
      } else if (dist < innerRadius) {
        // Dark metallic center
        r = 30; g = 41; b = 59; a = 255;

        // Dumbbell graphic in center
        // Center bar: width 0.44 * size, thickness 0.08 * size
        const inBar = Math.abs(dx) <= size * 0.22 && Math.abs(dy) <= size * 0.04;
        
        // Left plate:
        const inLeftPlate = Math.abs(dx - (-size * 0.22)) <= size * 0.045 && Math.abs(dy) <= size * 0.16;
        const inLeftCollar = Math.abs(dx - (-size * 0.16)) <= size * 0.025 && Math.abs(dy) <= size * 0.11;

        // Right plate:
        const inRightPlate = Math.abs(dx - (size * 0.22)) <= size * 0.045 && Math.abs(dy) <= size * 0.16;
        const inRightCollar = Math.abs(dx - (size * 0.16)) <= size * 0.025 && Math.abs(dy) <= size * 0.11;

        if (inBar || inLeftPlate || inLeftCollar || inRightPlate || inRightCollar) {
          r = 245; g = 158; b = 11; // Amber #f59e0b
          a = 255;
        }
      } else {
        // Outside border: rounded corners
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy)) - (size * 0.42);
        if (cornerDist > 0) {
          // Semi rounded
          r = 15; g = 23; b = 42;
          a = 255;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData[8] = 8; // bit depth: 8
  ihdrData[9] = 6; // color type: 6 (RGBA)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve('public');
const icon192 = generateGymIconPNG(192);
const icon512 = generateGymIconPNG(512);

fs.writeFileSync(path.join(pubDir, 'icon-192.png'), icon192);
fs.writeFileSync(path.join(pubDir, 'icon-512.png'), icon512);
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), icon192);

console.log('Successfully generated icon-192.png, icon-512.png, and apple-touch-icon.png');
