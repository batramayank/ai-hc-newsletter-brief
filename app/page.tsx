import Link from 'next/link';
import {
  getAllIssues,
  formatLongDate,
  formatShortDate,
  flattenCategories,
  categoryToSlug
} from '@/lib/supabase';
import { getCategoryColor } from '@/lib/utils';
import JsonLd from '@/components/JsonLd';

// Revalidate every 60s so new issues appear quickly without manual deploys
export const revalidate = 60;

export default async function HomePage() {
  const issues = await getAllIssues();

  if (issues.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 animate-fade">
        {/* Launch label */}
        <p className="eyebrow text-accent mb-6">Launching soon</p>

        {/* Headline */}
        <h1 className="font-sans font-bold text-3xl md:text-5xl text-ink leading-tight tracking-tight mb-6">
          The weekly briefing on AI in healthcare — starting Monday.
        </h1>

        {/* Description */}
        <p className="text-ink-soft text-base md:text-lg leading-relaxed mb-10 max-w-xl">
          Clinical AI, regulation, funding, and what it means for providers,
          payers, and patients. One concise email every Monday at 10am ET.
          Free.
        </p>

        {/* Subscribe CTA */}
        <Link
          href="/subscribe"
          className="inline-block px-7 py-3.5 bg-accent text-white font-mono text-xs uppercase tracking-eyebrow hover:bg-accent-bright transition-colors duration-300 rounded-sm"
        >
          Subscribe — it&apos;s free →
        </Link>

        {/* Divider */}
        <div className="border-t border-rule mt-16 mb-12" />

        {/* What to expect */}
        <p className="eyebrow text-ink-faint mb-6">What each issue covers</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Clinical AI', desc: 'Tools entering the clinical workflow — diagnostics, documentation, decision support.' },
            { label: 'Regulation', desc: 'FDA clearances, CMS guidance, state-level policy moves.' },
            { label: 'Funding & M&A', desc: 'Who raised, who acquired, and what it signals.' },
            { label: 'Admin & RCM', desc: 'AI in coding, prior auth, staffing, and revenue cycle.' },
          ].map(({ label, desc }) => (
            <div key={label} className="border border-rule rounded-sm p-4">
              <p className="font-sans font-semibold text-sm text-ink mb-1">{label}</p>
              <p className="text-ink-soft text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-ink-faint">
          No spam. Unsubscribe any time. Curated with AI, edited by humans.
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
                  <Link key={cat} href={`/topics/${categoryToSlug(cat)}`} className={`category-pill ${getCategoryColor(cat)} hover:opacity-80 transition-opacity`}>{cat}</Link>
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
                        <Link key={cat} href={`/topics/${categoryToSlug(cat)}`} className={`category-pill ${getCategoryColor(cat)} hover:opacity-80 transition-opacity`}>{cat}</Link>
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
