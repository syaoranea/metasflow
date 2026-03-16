// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/resolucao',
  reactStrictMode: true,
  eslint: {
    // se quiser mesmo pular lints no build:
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // mantém os erros de TS como bloqueadores
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig