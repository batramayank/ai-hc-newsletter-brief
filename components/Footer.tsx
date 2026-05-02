import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-rule mt-20 bg-paper-deep/40">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-end">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans font-semibold text-base text-accent">AI</span>
              <span className="font-sans font-semibold text-base text-ink">Healthcare</span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">Brief</span>
            </div>
            <p className="text-sm text-ink-soft max-w-md">
              Curated by AI Healthcare Brief. New issue every Monday at 10am ET.
            </p>
          </div>
          <div className="flex gap-8 eyebrow">
            <Link href="/" className="link-underline">Archive</Link>
            <Link href="/subscribe" className="link-underline text-accent">
              Subscribe
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-rule flex justify-between text-xs text-ink-faint font-mono">
          <span>© {new Date().getFullYear()} AI Healthcare Brief.</span>
          <span>Curated with AI, edited by humans.</span>
        </div>
      </div>
    </footer>
  );
}
