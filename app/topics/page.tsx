import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories, getAllIssues, flattenCategories, categoryToSlug } from '@/lib/supabase';
import { getCategoryColor } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Browse AI Healthcare Brief issues by topic — clinical AI, regulation, funding, and more.'
};

export default async function TopicsPage() {
  const [allCategories, allIssues] = await Promise.all([getAllCategories(), getAllIssues()]);

  const categoryCounts = allCategories.map((cat) => ({
    cat,
    slug: categoryToSlug(cat),
    count: allIssues.filter((issue) =>
      flattenCategories(issue.categories).includes(cat)
    ).length
  }));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <Link
        href="/"
        className="eyebrow text-ink-soft hover:text-accent transition-colors inline-block mb-10"
      >
        ← All issues
      </Link>

      <h1 className="font-sans font-bold text-3xl md:text-4xl text-ink mb-2">Browse by topic</h1>
      <p className="text-ink-soft text-sm mb-10">
        Every issue is tagged with one or more topics. Pick one to see all related coverage.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {categoryCounts.map(({ cat, slug, count }) => (
          <Link
            key={cat}
            href={`/topics/${slug}`}
            className="group border border-rule rounded-sm p-5 hover:border-accent transition-colors duration-300"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`category-pill ${getCategoryColor(cat)}`}>{cat}</span>
              <span className="font-mono text-xs text-ink-faint pt-0.5">
                {count} {count === 1 ? 'issue' : 'issues'}
              </span>
            </div>
            <div className="mt-3 eyebrow text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Browse →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
