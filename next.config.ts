import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  allowedDevOrigins: process.env.PUBLIC_HOST ? [process.env.PUBLIC_HOST] : [],
};

export default nextConfig;
