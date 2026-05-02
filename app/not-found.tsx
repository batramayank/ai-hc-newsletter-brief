import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-32 text-center animate-fade">
      <div className="eyebrow text-accent mb-4">404 · No such issue</div>
      <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">
        That issue isn&apos;t in our archive.
      </h1>
      <p className="text-ink-soft mb-10">
        It may have been retired, renamed, or never published. Either way — there&apos;s
        plenty more.
      </p>
      <Link
        href="/"
        className="inline-block eyebrow text-accent border-b border-accent pb-1 hover:tracking-[0.24em] transition-all duration-300"
      >
        Back to the archive
      </Link>
    </div>
  );
}
