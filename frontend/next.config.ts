import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 开启 standalone 模式：Docker 部署时仅需复制 .next/standalone，不含 node_modules
  output: "standalone",
};

export default nextConfig;
