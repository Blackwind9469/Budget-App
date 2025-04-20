/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // İstemci tarafı pakette Node.js modüllerini kullanma
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        path: false,
        crypto: false,
        child_process: false,
        "pg-native": false, // pg-native bağımlılığını yoksay
      };
    }
    return config;
  },
};

module.exports = nextConfig;
