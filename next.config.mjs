/** @type {import('next').NextConfig} */

const nextConfig = {
  // Static site: no server, no database. Everything must work as flat files in out/.
  output: 'export',
  trailingSlash: true,
  // Note: `output: 'export'` silently ignores redirects/rewrites/headers here.
  // Legacy .html -> route redirects would need a vercel.json.
};

export default nextConfig;
