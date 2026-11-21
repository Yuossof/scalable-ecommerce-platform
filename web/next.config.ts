import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "pixabay.com" },
      {
        protocol: "https",
        hostname: "7473add3cfc484e1859de60fe03e9284.r2.cloudflarestorage.com",
      },
      // Cloudflare R2 public development URLs used by the backend (R2_PUBLIC_URL).
      { protocol: "https", hostname: "pub-44b1fab0f8864d1584b9edcbe74c75df.r2.dev" },
      { protocol: "https", hostname: "pub-9d4983b742b84a9196c3bc0b8c70846a.r2.dev" },
      { protocol: "http", hostname: "68.210.203.225" },
      { protocol: "http", hostname: "68.210.203.225:8090" },
    ],
  },
  reactCompiler: true,
  output: "standalone"
};

export default nextConfig;
