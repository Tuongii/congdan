import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://meet.jit.si https://8x8.vc; connect-src 'self' https: http: wss: ws:; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https:; frame-src 'self' https://meet.jit.si https://8x8.vc; media-src 'self' data: blob:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
