/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@arena/shared", "@arena/database"],
  images: {
    domains: ["localhost", "arena-debate-media.s3.amazonaws.com"],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
