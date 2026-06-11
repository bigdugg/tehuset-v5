const path = require('path');

const isGitHubPagesPreview = process.env.GITHUB_PAGES === 'true';
const repoBasePath = '/tehuset-website';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  ...(isGitHubPagesPreview
    ? {
        output: 'export',
        basePath: repoBasePath,
        assetPrefix: `${repoBasePath}/`,
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
