import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center px-5 md:px-12 md:pl-[calc(84px+3rem)]">
      <p className="label">[ 404 ]</p>
      <h1 className="h-display mt-4 text-[clamp(2rem,8vw,5rem)]">
        This frame <span className="text-brand">didn&apos;t make the cut.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-ink/70">The page you were looking for isn&apos;t here.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-solid">Home</Link>
        <Link href="/micro-drama" className="btn btn-line">Micro dramas</Link>
      </div>
    </main>
  );
}
