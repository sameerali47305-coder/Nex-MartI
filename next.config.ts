import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its built-in .afm font files from a path relative to its
  // own package folder at runtime. If Next.js bundles it into the route,
  // that path gets rewritten and the fonts can't be found (ENOENT).
  // Keeping it external means it's require()'d from node_modules as-is.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
