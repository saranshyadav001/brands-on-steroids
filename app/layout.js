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

export const metadata = {
  title: "Brands On Steroids — AI Micro-Drama Studio",
  description: "On-demand AI video, bulk micro-drama production, branded content and sponsored series.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ParticleField />
        {children}
        <Cursor />
      </body>
    </html>
  );
}
