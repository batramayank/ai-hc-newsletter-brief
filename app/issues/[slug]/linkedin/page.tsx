import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { sanitizeNewsletterHtml } from '@/lib/sanitize';

export const revalidate = 60;

export default async function LinkedInView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data } = await supabase
    .from('issues')
    .select('linkedin_title, linkedin_html')
    .eq('slug', slug)
    .maybeSingle();

  if (!data?.linkedin_html) notFound();

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem', fontFamily: 'Georgia, serif' }}>
      {data.linkedin_title && <h1>{data.linkedin_title}</h1>}
      <div dangerouslySetInnerHTML={{ __html: sanitizeNewsletterHtml(data.linkedin_html) }} />
    </main>
  );
}
