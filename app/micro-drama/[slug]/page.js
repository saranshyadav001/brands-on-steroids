import Link from "next/link";
import { notFound } from "next/navigation";
import Rail from "@/components/Rail";
import Nav from "@/components/Nav";
import Contact from "@/components/Contact";
import { SHARE_IMAGE, SITE_URL, staticCatalogue } from "@/lib/site-data";

// One page per title in the catalogue (/micro-drama/<title>), made when the site is built:
// its own address, title and description for search engines, the full text of the series,
// and a "Watch now" button that opens the player on the micro-drama page.
// A title added to the bucket later gets its page at the next `npm run deploy`.

export const dynamicParams = false;

const find = async (slug) => (await staticCatalogue()).series.find((s) => s.slug === slug);
const describe = (s) => {
  const hook = s.logline ? s.logline.replace(/[.!?]?$/, ".") : "";
  const t = ([hook, s.plot].filter(Boolean).join(" ") || `${s.title} - an AI micro-drama series by Brands On Steroids.`).replace(/\s+/g, " ").trim();
  return t.length > 158 ? `${t.slice(0, 155).replace(/\s+\S*$/, "")}...` : t;
};
const paras = (t) => t.split(/\n{2,}/).filter(Boolean);

export async function generateStaticParams() {
  const { series } = await staticCatalogue();
  return series.length ? series.map((s) => ({ slug: s.slug })) : [{ slug: "none" }];
}

export async function generateMetadata({ params }) {
  const s = await find((await params).slug);
  if (!s) return {};
  const url = `/micro-drama/${s.slug}`;
  return {
    title: `${s.title} — AI Micro-Drama${s.genre ? ` (${s.genre})` : ""}`,
    description: describe(s),
    alternates: { canonical: url },
    openGraph: { url, type: "video.tv_show", title: s.title, description: describe(s), images: [SHARE_IMAGE] },
  };
}

export default async function SeriesPage({ params }) {
  const { slug } = await params;
  const { series } = await staticCatalogue();
  const s = series.find((x) => x.slug === slug);
  if (!s) notFound();
  const url = `${SITE_URL}/micro-drama/${s.slug}`;
  const episodes = s.episodes.filter((e) => !e.trailer);
  const others = series.filter((x) => x.slug !== s.slug);

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TVSeries",
        name: s.title,
        url,
        description: describe(s),
        genre: s.genres,
        numberOfEpisodes: Math.max(1, episodes.length),
        inLanguage: "en",
        productionCompany: { "@id": `${SITE_URL}/#org` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Micro Drama", item: `${SITE_URL}/micro-drama` },
          { "@type": "ListItem", position: 3, name: s.title, item: url },
        ],
      },
    ],
  };

  const mono = "font-mono text-[11px] uppercase tracking-[0.18em]";
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      <Rail />
      <Nav />
      <main className="md:pl-[84px]">
        <article className="px-5 pb-24 pt-28 md:px-12 md:pt-36">
          <div className="max-w-4xl">
            <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-x-2 ${mono} text-ink/50`}>
              <Link href="/" className="hover:text-brand">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/micro-drama#catalogue" className="hover:text-brand">Micro Drama</Link>
              <span aria-hidden="true">/</span>
              <span className="text-ink" aria-current="page">{s.title}</span>
            </nav>

            <h1 className="h-display mt-8 break-words text-[clamp(2rem,7vw,4.5rem)] leading-[0.95]">{s.title}</h1>
            <p className="label mt-5">[ {[s.genre, episodes.length > 1 ? `${episodes.length} episodes` : s.episodes[0]?.label].filter(Boolean).join(" · ")} ]</p>
            {s.logline && <p className="mt-8 max-w-2xl text-xl font-medium leading-snug md:text-2xl">{s.logline}</p>}

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={`/micro-drama?watch=${s.slug}`} data-cursor="Watch" className="btn btn-solid">Watch now →</Link>
              <Link href="/micro-drama#contact" data-cursor="Talk" className="btn btn-line">Discuss this series</Link>
            </div>

            {s.plot && (
              <section className="mt-14">
                <h2 className={`${mono} text-ink/50`}>Plot</h2>
                <div className="mt-4 max-w-2xl space-y-4 border-l-2 border-brand pl-5 text-lg leading-relaxed text-ink/75">
                  {paras(s.plot).map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </div>
              </section>
            )}

            {(s.genres.length > 0 || s.facts.length > 0) && (
              <section className="mt-14">
                <h2 className={`${mono} text-ink/50`}>Details</h2>
                {s.genres.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {s.genres.map((g) => (
                      <li key={g} className="border border-ink/20 px-3 py-2 font-mono text-[11px] uppercase tracking-widest">{g}</li>
                    ))}
                  </ul>
                )}
                {s.facts.length > 0 && (
                  <dl className="mt-6 max-w-2xl border-t border-ink/10">
                    {s.facts.map((f) => (
                      <div key={f.k} className="flex gap-4 border-b border-ink/10 py-3">
                        <dt className="w-36 shrink-0 font-mono text-[10px] uppercase leading-5 tracking-widest text-ink/50">{f.k}</dt>
                        <dd className="min-w-0 flex-1 text-ink/85">{f.v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            )}

            {episodes.some((e) => e.title || e.tagline || e.plot) && (
              <section className="mt-14">
                <h2 className={`${mono} text-ink/50`}>Episodes</h2>
                <ol className="mt-4 max-w-2xl space-y-4">
                  {episodes.map((e) => (
                    <li key={e.key} className="border border-ink/10 bg-white p-5">
                      <h3 className={`${mono} text-brand`}>
                        {e.label}
                        {e.title ? ` · ${e.title}` : ""}
                      </h3>
                      {e.tagline && <p className="mt-2 font-medium">{e.tagline}</p>}
                      {e.plot && <p className="mt-2 text-ink/70">{e.plot}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {others.length > 0 && (
              <section className="mt-16 border-t border-ink/10 pt-10">
                <h2 className={`${mono} text-ink/50`}>More from the catalogue</h2>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {others.map((x) => (
                    <li key={x.slug}>
                      <Link href={`/micro-drama/${x.slug}`} className="flex items-baseline justify-between gap-4 border border-ink/10 bg-white px-4 py-3 transition hover:border-brand">
                        <span className="min-w-0 truncate font-display text-sm font-extrabold uppercase">{x.title}</span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink/50">{x.genre}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>
        <Contact />
      </main>
    </>
  );
}
