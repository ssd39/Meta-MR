module.exports = {
  reactStrictMode: true,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, os: false, path:false, process: false };

    return config;
  },
  distDir: 'build',
}
