const nextConfig = {
  // Remove the output: 'export' line
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};
export default nextConfig;