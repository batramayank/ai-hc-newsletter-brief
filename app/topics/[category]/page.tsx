import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllCategories,
  getIssuesByCategory,
  formatShortDate,
  flattenCategories,
  categoryToSlug
} from '@/lib/supabase';
import { getCategoryColor } from '@/lib/utils';

export const revalidate = 3600;

export async function generateStaticParams() {
  const cats = await getAllCategories();
  return cats.map((cat) => ({ category: categoryToSlug(cat) }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const allCats = await getAllCategories();
  const match = allCats.find((c) => categoryToSlug(c) === category);
  if (!match) return { title: 'Topic not found' };

  return {
    title: match,
    description: `Browse all AI Healthcare Brief newsletter issues tagged with "${match}".`
  };
}

export default async function TopicPage({
  params
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const allCats = await getAllCategories();
  const categoryName = allCats.find((c) => categoryToSlug(c) === category);
  if (!categoryName) notFound();

  const issues = await getIssuesByCategory(categoryName);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <Link
        href="/topics"
        className="eyebrow text-ink-soft hover:text-accent transition-colors inline-block mb-10"
      >
        ← All topics
      </Link>

      <div className="flex items-center gap-4 mb-2">
        <span className={`category-pill ${getCategoryColor(categoryName)}`}>{categoryName}</span>
      </div>
      <h1 className="font-sans font-bold text-3xl md:text-4xl text-ink mb-2 mt-4">
        {categoryName}
      </h1>
      <p className="text-ink-soft text-sm mb-10">
        {issues.length} {issues.length === 1 ? 'issue' : 'issues'} tagged with this topic.
      </p>

      {issues.length === 0 ? (
        <p className="text-ink-soft text-sm">No issues yet.</p>
      ) : (
        <ol className="space-y-0">
          {issues.map((issue) => (
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
                    .filter((c) => c !== categoryName)
                    .slice(0, 2)
                    .map((cat) => (
                      <Link
                        key={cat}
                        href={`/topics/${categoryToSlug(cat)}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`category-pill ${getCategoryColor(cat)} hover:opacity-80 transition-opacity`}
                      >
                        {cat}
                      </Link>
                    ))}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
