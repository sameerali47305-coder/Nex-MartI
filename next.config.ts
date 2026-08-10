import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its built-in .afm font files from a path relative to its
  // own package folder at runtime. If Next.js bundles it into the route,
  // that path gets rewritten and the fonts can't be found (ENOENT).
  //
  // firebase-admin pulls in jwks-rsa -> jose, whose ESM build breaks when
  // Turbopack tries to bundle it into a CommonJS require() (ERR_REQUIRE_ESM).
  // Keeping both external means they're require()'d from node_modules as-is,
  // which Node resolves correctly on its own.
  serverExternalPackages: ["pdfkit", "firebase-admin"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;