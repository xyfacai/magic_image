/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['midjourney-plus.oss-us-west-1.aliyuncs.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
}

export default nextConfig 