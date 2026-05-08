import type { Metadata } from 'next';
import Link from 'next/link';
import { searchIssues, formatShortDate, flattenCategories, categoryToSlug } from '@/lib/supabase';
import { getCategoryColor } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search all AI Healthcare Brief newsletter issues.'
};

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = query ? await searchIssues(query) : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <h1 className="font-sans font-bold text-3xl md:text-4xl text-ink mb-2">Search</h1>
      <p className="text-ink-soft text-sm mb-8">
        Search across all newsletter issues by title and summary.
      </p>

      <form method="GET" action="/search" className="mb-10">
        <div className="flex gap-3">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="e.g. prior auth, FDA clearance, ambient AI…"
            autoFocus
            className="flex-1 px-4 py-3 border border-rule rounded-sm text-sm text-ink placeholder:text-ink-faint bg-paper focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-accent text-white font-mono text-xs uppercase tracking-eyebrow hover:bg-accent-bright transition-colors rounded-sm"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <p className="eyebrow text-ink-soft mb-6">
          {results.length === 0
            ? `No results for "${query}"`
            : `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`}
        </p>
      )}

      {results.length > 0 && (
        <ol className="space-y-0">
          {results.map((issue) => (
            <li key={issue.id} className="border-b border-rule">
              <Link
                href={`/issues/${issue.slug}`}
                className="grid md:grid-cols-12 gap-4 md:gap-8 py-6 group items-start"
              >
                <div className="md:col-span-2">
                  <span className="eyebrow text-ink-soft">{formatShortDate(issue.published_at)}</span>
                </div>
                <div className="md:col-span-7">
                  <h2 className="font-sans font-semibold text-base md:text-lg text-ink leading-snug group-hover:text-accent transition-colors duration-300">
                    {issue.title}
                  </h2>
                  {issue.intro && (
                    <p className="mt-2 text-ink-soft text-sm line-clamp-2">{issue.intro}</p>
                  )}
                </div>
                <div className="md:col-span-3 flex flex-wrap gap-1.5 md:justify-end">
                  {flattenCategories(issue.categories)
                    .slice(0, 2)
                    .map((cat) => (
                      <span key={cat} className={`category-pill ${getCategoryColor(cat)}`}>
                        {cat}
                      </span>
                    ))}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {!query && (
        <div className="text-center py-16 text-ink-faint">
          <p className="text-sm">Type a keyword above to search all issues.</p>
          <p className="mt-2 text-xs">
            Or{' '}
            <Link href="/topics" className="text-accent hover:underline">
              browse by topic
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
