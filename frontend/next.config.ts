import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 开启 standalone 模式：Docker 部署时仅需复制 .next/standalone，不含 node_modules
  output: "standalone",
  // 禁用构建时的类型检查和 Lint，以节省 VPS 内存
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: "http://tianji-backend:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
