import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ogsnap/core"],
  serverExternalPackages: ["@resvg/resvg-js"],
};

export default nextConfig;
