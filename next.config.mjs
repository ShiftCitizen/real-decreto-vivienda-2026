/** @type {import('next').NextConfig} */

const nextConfig = {
  // Hybrid: pages stay statically prerendered, but /api/chat is a dynamic
  // route handler (it holds the NIM key server-side), so `output: 'export'`
  // had to go. See AGENTS.md for what this changes about local commands.
  trailingSlash: true,
  // Note: redirects/rewrites/headers in this file are silently ignored by
  // Next. They belong in vercel.json if you need them.
};

export default nextConfig;
