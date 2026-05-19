/**
 * Generates PWA icons (192x192 and 512x512) as solid PNG files using only
 * Node.js built-in modules — no external dependencies required.
 *
 * Run with: node scripts/generate-icons.mjs
 */

import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'

// ── CRC-32 table ──────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(data) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function u32(n) {
  const b = Buffer.allocUnsafe(4)
  b.writeUInt32BE(n, 0)
  return b
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const crcInput  = Buffer.concat([typeBytes, data])
  return Buffer.concat([u32(data.length), typeBytes, data, u32(crc32(crcInput))])
}

/**
 * Creates a solid-colour PNG with a "B" drawn using pixel art blocks.
 * @param {number} size - Canvas size in pixels
 * @param {number[]} bg  - Background RGB [r,g,b]
 * @param {number[]} fg  - Foreground RGB [r,g,b]
 */
function createIconPNG(size, bg, fg) {
  // Build raw image: each row = 0x00 (filter None) + width * 3 bytes RGB
  const row = size * 3 + 1
  const raw = Buffer.alloc(size * row)

  // Fill background
  for (let y = 0; y < size; y++) {
    raw[y * row] = 0 // no filter
    for (let x = 0; x < size; x++) {
      const off = y * row + 1 + x * 3
      raw[off] = bg[0]; raw[off + 1] = bg[1]; raw[off + 2] = bg[2]
    }
  }

  // Draw a stylised "B" using relative grid positions
  // Grid is an 8×10 matrix centred in the icon
  const gridCols = 8, gridRows = 10
  const cellW = Math.floor(size * 0.7 / gridCols)
  const cellH = Math.floor(size * 0.7 / gridRows)
  const offX  = Math.floor((size - gridCols * cellW) / 2)
  const offY  = Math.floor((size - gridRows * cellH) / 2)

  // Letter B pixel map (1 = foreground)
  const B = [
    [1,1,1,1,0,0,0,0],
    [1,0,0,0,1,0,0,0],
    [1,0,0,0,1,0,0,0],
    [1,0,0,0,1,0,0,0],
    [1,1,1,1,0,0,0,0],
    [1,0,0,0,0,1,0,0],
    [1,0,0,0,0,1,0,0],
    [1,0,0,0,0,1,0,0],
    [1,0,0,0,0,1,0,0],
    [1,1,1,1,1,0,0,0],
  ]

  for (let gy = 0; gy < gridRows; gy++) {
    for (let gx = 0; gx < gridCols; gx++) {
      if (!B[gy] || !B[gy][gx]) continue
      // Fill the cell
      for (let py = 0; py < cellH; py++) {
        for (let px = 0; px < cellW; px++) {
          const imgX = offX + gx * cellW + px
          const imgY = offY + gy * cellH + py
          if (imgX >= size || imgY >= size) continue
          const off = imgY * row + 1 + imgX * 3
          raw[off] = fg[0]; raw[off + 1] = fg[1]; raw[off + 2] = fg[2]
        }
      }
    }
  }

  const sig  = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = chunk('IHDR', Buffer.concat([u32(size), u32(size), Buffer.from([8, 2, 0, 0, 0])]))
  const idat = chunk('IDAT', deflateSync(raw))
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdr, idat, iend])
}

// Navy blue background, white "B"
const BG = [0x1B, 0x2A, 0x4A]
const FG = [0xFF, 0xFF, 0xFF]

mkdirSync('./public/icons', { recursive: true })

writeFileSync('./public/icons/icon-192.png',        createIconPNG(192, BG, FG))
writeFileSync('./public/icons/icon-512.png',        createIconPNG(512, BG, FG))
writeFileSync('./public/icons/apple-touch-icon.png', createIconPNG(180, BG, FG))

console.log('✅  Icons generated in public/icons/')
console.log('    icon-192.png  (192×192)')
console.log('    icon-512.png  (512×512)')
console.log('    apple-touch-icon.png  (180×180)')
