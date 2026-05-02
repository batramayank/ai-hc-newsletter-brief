import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getAllSlugs,
  getIssueBySlug,
  getAllIssues,
  formatLongDate,
  flattenCategories,
  issueNumber
} from '@/lib/supabase';
import { getCategoryColor } from '@/lib/utils';
import { sanitizeNewsletterHtml } from '@/lib/sanitize';
import JsonLd from '@/components/JsonLd';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);
  if (!issue) return { title: 'Issue not found' };

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealthcarebrief.com';
  const url = `${BASE_URL}/issues/${slug}`;

  return {
    title: issue.title,
    description: issue.intro ?? 'A weekly briefing on AI in healthcare from AI Healthcare Brief.',
    authors: [{ name: 'AI Healthcare Brief', url: BASE_URL }],
    alternates: { canonical: url },
    openGraph: {
      title: issue.title,
      description: issue.intro ?? undefined,
      type: 'article',
      url,
      siteName: 'AI Healthcare Brief',
      publishedTime: issue.published_at,
      authors: ['AI Healthcare Brief'],
      tags: flattenCategories(issue.categories)
    },
    twitter: {
      card: 'summary_large_image',
      title: issue.title,
      description: issue.intro ?? undefined
    }
  };
}

export default async function IssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [issue, allIssues] = await Promise.all([
    getIssueBySlug(slug),
    getAllIssues()
  ]);

  if (!issue) notFound();

  const number = issueNumber(allIssues, issue.slug);
  const cats = flattenCategories(issue.categories);
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealthcarebrief.com';
  const issueUrl = `${BASE_URL}/issues/${slug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Archive', item: BASE_URL },
      { '@type': 'ListItem', position: 3, name: issue.title, item: issueUrl }
    ]
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': issueUrl,
    headline: issue.title,
    description: issue.intro ?? undefined,
    url: issueUrl,
    datePublished: issue.published_at,
    dateModified: issue.published_at,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    keywords: cats.join(', ') || 'healthcare AI, artificial intelligence, health technology',
    articleSection: cats[0] ?? 'Healthcare AI',
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'AI Healthcare Brief',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo-mark.svg`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': issueUrl
    }
  };

  // Find the next/previous issue for navigation
  const sortedDesc = [...allIssues].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
  const idx = sortedDesc.findIndex((i) => i.slug === issue.slug);
  const newer = idx > 0 ? sortedDesc[idx - 1] : null;
  const older = idx < sortedDesc.length - 1 ? sortedDesc[idx + 1] : null;

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-20 animate-fade">
      <JsonLd data={[breadcrumbSchema, articleSchema]} />
      {/* Back link */}
      <Link
        href="/"
        className="eyebrow text-ink-soft hover:text-accent transition-colors inline-block mb-12"
      >
        ← All issues
      </Link>

      {/* Issue header */}
      <header className="mb-12 pb-8 border-b border-rule">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-mono text-xs text-accent uppercase tracking-eyebrow">
            Issue №{String(number).padStart(3, '0')}
          </span>
          <span className="text-rule">·</span>
          <span className="eyebrow text-ink-soft">
            {formatLongDate(issue.published_at)}
          </span>
        </div>
        <h1 className="font-sans font-bold text-3xl md:text-4xl lg:text-5xl text-ink leading-tight tracking-tight">
          {issue.title}
        </h1>
        {issue.intro && (
          <p className="mt-6 text-ink-soft text-lg md:text-xl leading-relaxed">
            {issue.intro}
          </p>
        )}
        {cats.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {cats.map((cat) => (
              <span key={cat} className={`category-pill ${getCategoryColor(cat)}`}>{cat}</span>
            ))}
          </div>
        )}
      </header>

      {/* Issue body — sanitized before render to guard against script injection */}
      <div
        className="issue-body"
        dangerouslySetInnerHTML={{ __html: sanitizeNewsletterHtml(issue.html_body) }}
      />

      {/* Issue navigation */}
      <nav className="mt-20 pt-10 border-t border-rule">
        <div className="grid grid-cols-2 gap-4">
          <div>
            {older && (
              <Link href={`/issues/${older.slug}`} className="group block">
                <div className="eyebrow text-ink-faint mb-2">← Previous issue</div>
                <div className="font-sans font-semibold text-base text-ink group-hover:text-accent transition-colors duration-300">
                  {older.title}
                </div>
              </Link>
            )}
          </div>
          <div className="text-right">
            {newer && (
              <Link href={`/issues/${newer.slug}`} className="group block">
                <div className="eyebrow text-ink-faint mb-2">Next issue →</div>
                <div className="font-sans font-semibold text-base text-ink group-hover:text-accent transition-colors duration-300">
                  {newer.title}
                </div>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Subscribe prompt */}
      <div className="mt-20 p-8 md:p-10 border border-rule rounded-sm bg-highlight text-center">
        <div className="eyebrow text-accent mb-3">Get next week&apos;s issue</div>
        <h3 className="font-sans font-bold text-2xl md:text-3xl text-ink mb-3">
          Read by people who decide what gets deployed.
        </h3>
        <p className="text-ink-soft text-sm md:text-base mb-6 max-w-md mx-auto">
          One email. Monday morning. Free.
        </p>
        <Link
          href="/subscribe"
          className="inline-block px-6 py-3 bg-accent text-white font-mono text-xs uppercase tracking-eyebrow hover:bg-accent-bright transition-colors duration-300 rounded-sm"
        >
          Subscribe →
        </Link>
      </div>
    </article>
  );
}
