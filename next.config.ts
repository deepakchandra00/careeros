import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Ensure @sparticuz/chromium is not bundled — it must stay external
  // so it can find its binary at runtime on Vercel.
  // See: https://github.com/Sparticuz/chromium#bundler-configuration
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
