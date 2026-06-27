import type { NextConfig } from "next";

const nextConfig: any = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/customer-debts",
        destination: "/debts",
        permanent: true,
      },
      {
        source: "/supplier-debts",
        destination: "/debts",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
