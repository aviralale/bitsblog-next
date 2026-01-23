import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-blog.ctrlbits.com",
        pathname: "/media/**",
      },
    ],
    unoptimized: true,
  },

  experimental: {
    serverComponentsExternalPackages: ["fs"],
  },
};

export default nextConfig;
