import { SITE_URL, staticCatalogue } from "@/lib/site-data";

// /sitemap.xml - every page, for search engines. Made when the site is built.
export const dynamic = "force-static";

export default async function sitemap() {
  const { series } = await staticCatalogue();
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/micro-drama`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...series.map((s) => ({ url: `${SITE_URL}/micro-drama/${s.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 })),
  ];
}
