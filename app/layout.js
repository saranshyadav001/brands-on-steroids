import "./globals.css";
import Cursor from "@/components/Cursor";
import ParticleField from "@/components/ParticleField";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/caveat/600.css";
import { site, team } from "@/data/site";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site-data";

// Search engines: the default title / description / preview for every page.
// Each page sets its own title, description and canonical address on top of this.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Brands On Steroids — AI-Native Films, Ads & Micro-Dramas", template: "%s | Brands On Steroids" },
  description:
    "Brands On Steroids is an AI-native media house making ad films, branded entertainment and AI micro-drama series that people actually want to watch.",
  applicationName: "Brands On Steroids",
  authors: [{ name: "Saransh Yadav", url: "https://www.linkedin.com/in/saransh-yadav-ba2105185" }],
  creator: "Brands On Steroids",
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: "Brands On Steroids", locale: "en_IN", images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image" },
};

// Who the site belongs to, for Google (Organization + its founder + the website)
const org = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Brands On Steroids",
      alternateName: "BOS",
      url: SITE_URL,
      email: site.email,
      description: "AI-native media house: ad films, branded entertainment and AI micro-drama series.",
      sameAs: site.socials.map((s) => s.href),
      founder: { "@id": `${SITE_URL}/#founder` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      name: team[0].name,
      jobTitle: team[0].role,
      description: team[0].focus,
      image: `${SITE_URL}${team[0].photo}`,
      worksFor: { "@id": `${SITE_URL}/#org` },
      sameAs: ["https://www.linkedin.com/in/saransh-yadav-ba2105185"],
    },
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, name: "Brands On Steroids", url: SITE_URL, publisher: { "@id": `${SITE_URL}/#org` } },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
        <ParticleField />
        {children}
        <Cursor />
      </body>
    </html>
  );
}
