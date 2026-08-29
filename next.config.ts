import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Type and lint errors are no longer suppressed: they caught the
  // camelCase/snake_case drift between the UI and the database schema.
};

export default nextConfig;
