/** @type {import('next').NextConfig} */

// Backend URL — server-side rewrite target.
// In development: defaults to http://localhost:3001 (the Hono backend).
// In production (Vercel): set BACKEND_URL=https://your-backend.vercel.app
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Server-side rewrite: /api/* on the frontend transparently proxies to the
  // /backend service. Keeps the browser fetching same-origin (no CORS), works
  // identically in v0 preview, local dev, and Vercel production.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ]
  },
}

export default nextConfig
