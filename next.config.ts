// ============================================================
// Archivo: next.config.ts (reemplaza el existente)
// ============================================================

import type { NextConfig } from 'next'
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
})

const nextConfig: NextConfig = {
  turbopack: {}, // silencia el error de turbopack
}

module.exports = withPWA(nextConfig)