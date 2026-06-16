import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/home/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
