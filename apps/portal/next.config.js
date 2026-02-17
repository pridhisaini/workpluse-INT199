/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@repo/ui', '@repo/api', '@repo/types'],
    reactStrictMode: true,
};

module.exports = nextConfig;
