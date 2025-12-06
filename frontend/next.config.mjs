/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'docs.material-tailwind.com',
      },
    ],
  },
};

export default nextConfig;