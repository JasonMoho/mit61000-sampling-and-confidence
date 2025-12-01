import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
  basePath: isProd ? "/mit61000-sampling-and-confidence" : "",
  assetPrefix: isProd ? "/mit61000-sampling-and-confidence/" : "",
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
