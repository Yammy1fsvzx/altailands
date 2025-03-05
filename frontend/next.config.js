/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.mds.yandex.net',
        port: '',
        pathname: '/get-ydo/**',
      },
      {
        protocol: 'https',
        hostname: 's0.rbk.ru',
        port: '',
        pathname: '/v6_top_pics/**',
      },
      {
        protocol: 'https',
        hostname: 'img.dmclk.ru',
        port: '',
        pathname: '/vitrina/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '89.104.70.179',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '8000',
        pathname: '/**',
      }
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 
