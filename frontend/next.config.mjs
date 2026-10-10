import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  agentRules: false, // do not generate AGENTS.md in the project

  poweredByHeader: false,
  // Self-contained server bundle in .next/standalone (for Docker / any Node host; Vercel ignores it).
  output: "standalone",
  // This app lives in a monorepo folder; pin the root so Next does not pick up lockfiles further up the tree.
  outputFileTracingRoot: root,
  turbopack: { root },
};

export default nextConfig;
