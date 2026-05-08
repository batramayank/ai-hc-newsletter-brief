import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.local.example to .env.local and fill in the values.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

export type Issue = {
  id: string;
  slug: string;
  title: string;
  intro: string | null;
  html_body: string;
  categories: string[] | Record<string, unknown>;
  article_count: number;
  published_at: string;
  created_at: string;
};

export type IssueListItem = Omit<Issue, 'html_body'>;

/** Fetch all issues for the homepage list (omits html_body for payload size). */
export async function getAllIssues(): Promise<IssueListItem[]> {
  const { data, error } = await supabase
    .from('issues')
    .select('id, slug, title, intro, categories, article_count, published_at, created_at')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Supabase getAllIssues error:', error);
    return [];
  }
  return (data ?? []) as IssueListItem[];
}

/** Fetch one full issue by slug. Returns null on miss. */
export async function getIssueBySlug(slug: string): Promise<Issue | null> {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Supabase getIssueBySlug error:', error);
    return null;
  }
  return data as Issue | null;
}

/** Fetch all slugs — used by generateStaticParams. */
export async function getAllSlugs(): Promise<{ slug: string }[]> {
  const { data, error } = await supabase.from('issues').select('slug');
  if (error) {
    console.error('Supabase getAllSlugs error:', error);
    return [];
  }
  return (data ?? []) as { slug: string }[];
}

/** Format a published_at ISO string into "April 28, 2026" style. */
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/** Format into "Apr 28" for compact use. */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/** Issue number — derives a 1-based number from publication order. */
export function issueNumber(allIssues: IssueListItem[], slug: string): number {
  const sortedAsc = [...allIssues].sort(
    (a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
  );
  const idx = sortedAsc.findIndex((i) => i.slug === slug);
  return idx === -1 ? 0 : idx + 1;
}

/** Pull a flat string[] of category names from the JSONB column, regardless of shape. */
export function flattenCategories(raw: Issue['categories']): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((x) => typeof x === 'string') as string[];
  if (typeof raw === 'object') return Object.keys(raw);
  return [];
}

/** Convert a category name to a URL-safe slug. e.g. "Clinical AI" → "clinical-ai" */
export function categoryToSlug(cat: string): string {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Search issues by title and intro text (case-insensitive). */
export async function searchIssues(query: string): Promise<IssueListItem[]> {
  const safe = query.trim().slice(0, 200);
  if (!safe) return [];
  const { data, error } = await supabase
    .from('issues')
    .select('id, slug, title, intro, categories, article_count, published_at, created_at')
    .or(`title.ilike.%${safe}%,intro.ilike.%${safe}%`)
    .order('published_at', { ascending: false });
  if (error) {
    console.error('Supabase searchIssues error:', error);
    return [];
  }
  return (data ?? []) as IssueListItem[];
}

/** Return all issues tagged with a given category name. */
export async function getIssuesByCategory(category: string): Promise<IssueListItem[]> {
  const all = await getAllIssues();
  return all.filter((issue) => flattenCategories(issue.categories).includes(category));
}

/** Return up to `limit` other issues that share at least one category with the given issue. */
export async function getRelatedIssues(
  currentSlug: string,
  categories: string[],
  limit = 3
): Promise<IssueListItem[]> {
  if (categories.length === 0) return [];
  const all = await getAllIssues();
  return all
    .filter((issue) => issue.slug !== currentSlug)
    .map((issue) => ({
      issue,
      shared: flattenCategories(issue.categories).filter((c) => categories.includes(c)).length
    }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, limit)
    .map(({ issue }) => issue);
}

/** Return all unique category names across all issues, sorted alphabetically. */
export async function getAllCategories(): Promise<string[]> {
  const all = await getAllIssues();
  const set = new Set<string>();
  all.forEach((issue) => flattenCategories(issue.categories).forEach((c) => set.add(c)));
  return Array.from(set).sort();
}
