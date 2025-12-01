import type { NextConfig } from "next";

// Set BASE_PATH env var to deploy to a subpath, or leave empty for root deployment
// GitHub Pages: BASE_PATH=/mit61000-sampling-and-confidence npm run build
// Root deployment: npm run build
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  // Make basePath available to client-side code
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
