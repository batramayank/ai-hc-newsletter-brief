import { getAllIssues } from '@/lib/supabase';

export const revalidate = 3600;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealthcarebrief.com';
  const issues = await getAllIssues();

  const items = issues
    .map((issue) => {
      const url = `${BASE_URL}/issues/${issue.slug}`;
      const pubDate = new Date(issue.published_at).toUTCString();
      const description = issue.intro ? escapeXml(issue.intro) : '';
      return `    <item>
      <title>${escapeXml(issue.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>${description ? `\n      <description>${description}</description>` : ''}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI Healthcare Brief</title>
    <link>${BASE_URL}</link>
    <description>A weekly briefing on artificial intelligence in healthcare — clinical AI, regulation, funding, and what it means for providers, payers, and patients.</description>
    <language>en-us</language>
    <copyright>© ${new Date().getFullYear()} AI Healthcare Brief</copyright>
    <ttl>60</ttl>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
