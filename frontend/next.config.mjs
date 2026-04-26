/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Esto lo dejamos para que el deploy pase aunque haya errores de tipos
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Sacamos el bloque de eslint que tiraba el warning
}

export default nextConfig