/** @type {import('next').NextConfig} */
const dev = process.env.NODE_ENV !== "production";

const nextConfig = {
  // The published site is plain static files (the `out` folder); see wrangler.jsonc.
  ...(dev ? {} : { output: "export" }),
  // "route.dev.js" files are only picked up by `npm run dev` (see app/api).
  pageExtensions: dev ? ["dev.js", "js", "jsx"] : ["js", "jsx"],
};
export default nextConfig;
