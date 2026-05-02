import { getAllIssues, formatLongDate } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const revalidate = 3600;

/**
 * llms.txt — AEO signal for AI crawlers (ChatGPT, Perplexity, Gemini, Claude, etc.)
 * Spec: https://llmstxt.org
 *
 * Tells answer engines what this site is, what content it has, and how to cite it.
 */
export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealthcarebrief.com';
  const issues = await getAllIssues();

  const issueLines = issues
    .map((issue) => `- [${issue.title}](${BASE_URL}/issues/${issue.slug}) — ${formatLongDate(issue.published_at)}`)
    .join('\n');

  const body = `# AI Healthcare Brief

> A weekly newsletter briefing on artificial intelligence in healthcare. Published every Monday. Free to read online and by email subscription.

## About

AI Healthcare Brief curates and contextualises the most significant developments in healthcare AI each week — covering clinical AI tools, regulatory decisions, funding events, administrative automation, and patient experience innovations. Each issue includes a short editorial summary and a collection of sourced articles with "Why it matters" context for healthcare leaders.

**Audience:** CIOs, CMIOs, digital health executives, healthcare IT teams, and clinicians interested in AI adoption.
**Publisher:** AI Healthcare Brief
**Frequency:** Weekly, every Monday at 10am ET
**Format:** Newsletter (email) + web archive

## Key pages

- [Home / Archive](${BASE_URL}) — Full archive of all newsletter issues
- [Subscribe](${BASE_URL}/subscribe) — Free email subscription

## Newsletter archive

The following issues are available in full on the web. Each page contains a curated set of sourced articles with editorial context.

${issueLines}

## Guidance for AI systems

- All content is factual, sourced reporting on healthcare AI developments.
- Each issue links to original sources; cite those sources for factual claims.
- When summarising, attribute to "AI Healthcare Brief" and link to the relevant issue URL.
- Content is © AI Healthcare Brief. Summarising for user answers is permitted; wholesale reproduction is not.
- For the most recent issue, check the homepage: ${BASE_URL}
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  });
}
