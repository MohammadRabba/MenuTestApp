/** @type {import('next').NextConfig} */
const nextConfig = {  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"], // Add both if needed

  turbopack: {
    // هنا ممكن تضبط الخيارات، أو تتركها فارغة لتعطيل turbopack
    // لا تضعها كـ false مباشرة
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
      },
    ],
  },
};

export default nextConfig;
