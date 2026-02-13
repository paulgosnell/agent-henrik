import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "fjnfsabvuiyzuzfhxzcc.supabase.co",
      },
      {
        protocol: "https",
        hostname: "api.chilledsites.com",
      },
    ],
  },
};

export default nextConfig;
