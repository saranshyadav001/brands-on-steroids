import { SITE_URL } from "@/lib/site-data";

// /robots.txt - every search engine may read every page (the video API is left out).
export const dynamic = "force-static";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
