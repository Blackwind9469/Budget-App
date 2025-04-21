/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Tip kontrollerini build sırasında devre dışı bırakıyor ve derlemeyi hızlandırıyor
    ignoreBuildErrors: true,
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
  // Auth yönlendirme için domain ayarları
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },
  // Auth callback için güvenilir domainler
  async headers() {
    // Geliştirme ortamı için farklı origin ayarları
    const allowedOrigin = process.env.NODE_ENV === 'production' 
      ? 'https://www.erdoganaltiparmak.com' 
      : 'http://localhost:3000';
      
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: allowedOrigin }, // Güvenilir domain
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      }
    ];
  }
};

module.exports = nextConfig;
