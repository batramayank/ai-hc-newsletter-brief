import Link from 'next/link';
import {
  getAllIssues,
  formatLongDate,
  formatShortDate,
  flattenCategories
} from '@/lib/supabase';
import { getCategoryColor } from '@/lib/utils';
import JsonLd from '@/components/JsonLd';

// Revalidate every 60s so new issues appear quickly without manual deploys
export const revalidate = 60;

export default async function HomePage() {
  const issues = await getAllIssues();

  if (issues.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-fade">
        <p className="eyebrow mb-4">No issues yet</p>
        <h2 className="font-sans font-bold text-3xl mb-4 text-ink">The presses are warm.</h2>
        <p className="text-ink-soft">
          Once your n8n workflow inserts its first issue into Supabase, it&apos;ll appear here.
        </p>
      </div>
    );
  }

  const [latest, ...rest] = issues;
  const totalIssues = issues.length;
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealthcarebrief.com';

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AI Healthcare Brief — Newsletter Archive',
    description: 'Full archive of weekly AI in healthcare newsletter issues.',
    url: BASE_URL,
    numberOfItems: totalIssues,
    itemListElement: issues.map((issue, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: issue.title,
      url: `${BASE_URL}/issues/${issue.slug}`,
      description: issue.intro ?? undefined
    }))
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <JsonLd data={itemListSchema} />
      {/* Latest issue — hero treatment */}
      <section className="mb-20 animate-rise" style={{ animationDelay: '50ms' }}>
        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-3 md:border-r md:border-rule md:pr-8">
            <div className="eyebrow text-accent mb-2">— Latest issue</div>
            <div className="font-mono text-xs text-ink-soft uppercase tracking-eyebrow">
              No. {String(totalIssues).padStart(3, '0')}
            </div>
            <div className="mt-4 text-sm text-ink-soft">
              {formatLongDate(latest.published_at)}
            </div>
            <div className="mt-2 text-sm text-ink-faint">
              {latest.article_count} {latest.article_count === 1 ? 'story' : 'stories'}
            </div>
          </div>
          <div className="md:col-span-9">
            <Link href={`/issues/${latest.slug}`} className="group block">
              <h2 className="font-sans font-bold text-2xl md:text-4xl lg:text-5xl text-ink leading-tight tracking-tight transition-colors duration-300 group-hover:text-accent">
                {latest.title}
              </h2>
              {latest.intro && (
                <p className="mt-5 text-ink-soft text-base md:text-lg leading-relaxed max-w-3xl">
                  {latest.intro}
                </p>
              )}
              <div className="mt-7 flex items-center gap-4">
                <span className="eyebrow text-accent border-b border-accent pb-1 transition-all duration-300 group-hover:tracking-[0.22em]">
                  Read this issue
                </span>
              </div>
            </Link>
            {flattenCategories(latest.categories).length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {flattenCategories(latest.categories).map((cat) => (
                  <span key={cat} className={`category-pill ${getCategoryColor(cat)}`}>{cat}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Archive */}
      {rest.length > 0 && (
        <section className="border-t-2 border-rule pt-0">
          <div className="mb-10"></div>
          <div className="flex justify-between items-baseline mb-10">
            <h3 className="font-sans font-semibold text-xl text-ink">From the archive</h3>
            <span className="eyebrow text-ink-faint">
              {rest.length} earlier {rest.length === 1 ? 'issue' : 'issues'}
            </span>
          </div>

          <ol className="space-y-0">
            {rest.map((issue, i) => {
              const number = totalIssues - 1 - i;
              return (
                <li
                  key={issue.id}
                  className="border-b border-rule animate-rise"
                  style={{ animationDelay: `${100 + i * 40}ms` }}
                >
                  <Link
                    href={`/issues/${issue.slug}`}
                    className="grid md:grid-cols-12 gap-4 md:gap-8 py-6 md:py-8 group items-start"
                  >
                    <div className="md:col-span-2 flex md:block items-center gap-3">
                      <span className="font-mono text-xs text-ink-faint">
                        №{String(number).padStart(3, '0')}
                      </span>
                      <span className="eyebrow text-ink-soft md:mt-1 md:block">
                        {formatShortDate(issue.published_at)}
                      </span>
                    </div>
                    <div className="md:col-span-7">
                      <h4 className="font-sans font-semibold text-base md:text-lg text-ink leading-snug transition-colors duration-300 group-hover:text-accent">
                        {issue.title}
                      </h4>
                      {issue.intro && (
                        <p className="mt-2 text-ink-soft text-sm md:text-base line-clamp-2">
                          {issue.intro}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-3 flex flex-wrap gap-1.5 md:justify-end">
                      {flattenCategories(issue.categories).slice(0, 2).map((cat) => (
                        <span key={cat} className={`category-pill ${getCategoryColor(cat)}`}>{cat}</span>
                      ))}
                      {flattenCategories(issue.categories).length > 2 && (
                        <span className="font-mono text-[0.68rem] text-ink-faint self-center">
                          +{flattenCategories(issue.categories).length - 2}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
