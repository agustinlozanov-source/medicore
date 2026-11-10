import type { NextConfig } from 'next';

// Exportación estática: el demo es un sitio sin servidor que Netlify sirve tal cual.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
