// Server-only, used while the pages are built (`next build`): the catalogue and the home films
// as plain text, so the titles, descriptions and series pages are part of the HTML that search
// engines read. The video links are not included; the browser fetches those from /api/library.
import { findFile, getHomeFilms, getLibrary, videoRatio } from "./library.js";

export const SITE_URL = "https://www.brandsonsteroids.com";

// The picture shown when a page is shared (WhatsApp, LinkedIn, X ...)
export const SHARE_IMAGE = { url: "/posters/hero.jpg", alt: "Brands On Steroids" };

export async function staticCatalogue() {
  const c = await getLibrary();
  return {
    ...c,
    series: c.series.map((s) => ({ ...s, poster: null, episodes: s.episodes.map((e) => ({ ...e, src: null })) })),
  };
}

export async function staticFilms() {
  const f = await getHomeFilms();
  const items = await Promise.all(
    f.items.map(async (i) => {
      const file = await findFile(i.key);
      const ratio = file ? await videoRatio(file) : null;
      return { ...i, src: null, ratio: ratio ? Math.min(2.4, Math.max(0.45, ratio)) : null };
    })
  );
  return { ...f, items };
}
