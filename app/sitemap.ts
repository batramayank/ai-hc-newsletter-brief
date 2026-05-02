import type { MetadataRoute } from 'next';
import { getAllIssues } from '@/lib/supabase';

export const revalidate = 3600; // rebuild hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealthcarebrief.com';
  const issues = await getAllIssues();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${BASE_URL}/subscribe`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${BASE_URL}/thank-you`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2
    }
  ];

  const issueRoutes: MetadataRoute.Sitemap = issues.map((issue) => ({
    url: `${BASE_URL}/issues/${issue.slug}`,
    lastModified: new Date(issue.published_at),
    changeFrequency: 'never' as const,
    priority: 0.8
  }));

  return [...staticRoutes, ...issueRoutes];
}
