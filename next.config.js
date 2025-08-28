/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Configure for GitHub Pages with repo name 'Pomonotes'
  basePath: '',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
};

// Add GitHub Pages specific configuration for production
if (process.env.NODE_ENV === 'production') {
  nextConfig.basePath = '/Pomonotes';
  nextConfig.assetPrefix = '/Pomonotes/';
}

module.exports = nextConfig;
