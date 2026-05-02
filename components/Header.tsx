import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="border-b border-rule bg-white">
      {/* Top utility bar */}
      <div className="border-b border-rule bg-paper-deep/60">
        <div className="max-w-5xl mx-auto px-6 py-2 flex justify-between items-center">
          <span className="eyebrow hidden sm:inline">{today}</span>
          <span className="eyebrow sm:hidden text-ink-soft">Healthcare AI Brief</span>
          <Link href="/subscribe" className="eyebrow text-accent link-underline">
            Subscribe →
          </Link>
        </div>
      </div>

      {/* Masthead */}
      <div className="max-w-5xl mx-auto px-6 py-7 md:py-9">
        <div className="flex items-center justify-between">
          {/* Horizontal logo — desktop */}
          <Link href="/" className="hidden sm:block transition-opacity hover:opacity-80">
            <Image
              src="/logo-horizontal.svg"
              alt="AI Healthcare Brief"
              width={260}
              height={70}
              priority
            />
          </Link>

          {/* Mark-only logo — mobile */}
          <Link href="/" className="sm:hidden transition-opacity hover:opacity-80">
            <Image
              src="/logo-mark.svg"
              alt="AI Healthcare Brief"
              width={48}
              height={48}
              priority
            />
          </Link>

          {/* Issue label */}
          <div className="text-right hidden sm:block">
            <div className="font-sans font-semibold text-sm text-accent">Weekly</div>
            <div className="font-sans text-xs text-ink-soft mt-0.5">{today}</div>
          </div>
        </div>

        {/* Tagline */}
        <p className="mt-5 text-sm text-ink-soft max-w-xl">
          A weekly briefing on artificial intelligence in healthcare —
          <span className="italic"> for the people deploying it.</span>
        </p>
      </div>

      {/* Teal accent rule */}
      <div className="border-t-2 border-accent/20" />
    </header>
  );
}
