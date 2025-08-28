/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Configure for GitHub Pages with repo name 'Pomonotes'
  basePath: '/Pomonotes',
  assetPrefix: '/Pomonotes/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
