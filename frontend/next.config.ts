const nextConfig = {
  output: 'export', // <--- This forces Next.js to create the 'out' folder
  images: { unoptimized: true }, // Needed for static export
  turbopack: { root: process.cwd() },
};
export default nextConfig;