// ============================================================
// Archivo: scripts/generate-icons.mjs
// Script para generar todos los íconos PWA desde uno base
// Uso: node scripts/generate-icons.mjs
// Requiere: npm install sharp --save-dev
// ============================================================

import sharp from 'sharp'
import { mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const outputDir = join(process.cwd(), 'public', 'icons')

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
}

// Genera un SVG simple con la letra "G" como ícono base
// Puedes reemplazar esto con tu propio PNG de 512x512
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#0a0805"/>
  <rect width="512" height="512" rx="80" fill="url(#bg)"/>
  <defs>
    <radialGradient id="bg" cx="30%" cy="20%" r="80%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0a0805" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Borde amber sutil -->
  <rect x="8" y="8" width="496" height="496" rx="75" fill="none" stroke="#f59e0b" stroke-width="6" stroke-opacity="0.3"/>
  <!-- Ícono de moneda / dollar -->
  <circle cx="256" cy="256" r="140" fill="none" stroke="#f59e0b" stroke-width="16" stroke-opacity="0.9"/>
  <text x="256" y="310" font-family="Georgia, serif" font-size="180" fill="#f59e0b" text-anchor="middle" font-weight="400">$</text>
</svg>
`

const svgBuffer = Buffer.from(svgIcon)

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(outputDir, `icon-${size}x${size}.png`))
  console.log(`✓ icon-${size}x${size}.png`)
}

console.log('\n✅ Íconos generados en public/icons/')
console.log('   Puedes reemplazarlos con tus propios diseños.')
