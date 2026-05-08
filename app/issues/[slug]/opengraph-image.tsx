import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AI Healthcare Brief';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch issue data directly via REST so this works in Edge runtime
  let title = 'AI Healthcare Brief';
  let intro = 'A weekly briefing on AI in healthcare.';
  let dateStr = '';

  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/issues?slug=eq.${encodeURIComponent(slug)}&select=title,intro,published_at&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
      }
    });
    if (res.ok) {
      const [issue] = await res.json();
      if (issue) {
        title = issue.title ?? title;
        intro = issue.intro ?? intro;
        if (issue.published_at) {
          dateStr = new Date(issue.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }
    }
  } catch {
    // Fall through to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: 0
        }}
      >
        {/* Teal top bar */}
        <div style={{ width: '100%', height: 8, backgroundColor: '#0D9488' }} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 80px 60px'
          }}
        >
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* ECG icon */}
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="8" fill="#0D9488" />
              <polyline
                points="4,24 12,24 16,16 20,32 24,20 28,28 32,24 44,24"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#111827',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              AI Healthcare Brief
            </span>
          </div>

          {/* Title */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: 32 }}>
            <h1
              style={{
                fontSize: title.length > 80 ? 44 : title.length > 50 ? 52 : 60,
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1.15,
                margin: 0,
                maxWidth: 900
              }}
            >
              {title}
            </h1>
          </div>

          {/* Intro + date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {intro && (
              <p
                style={{
                  fontSize: 22,
                  color: '#6B7280',
                  lineHeight: 1.5,
                  margin: 0,
                  maxWidth: 860,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {intro}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 3,
                  backgroundColor: '#0D9488',
                  borderRadius: 2
                }}
              />
              {dateStr && (
                <span
                  style={{
                    fontSize: 16,
                    color: '#9CA3AF',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  {dateStr}
                </span>
              )}
              <span
                style={{
                  fontSize: 16,
                  color: '#9CA3AF',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                aihealthcarebrief.com
              </span>
            </div>
          </div>
        </div>

        {/* Teal bottom bar */}
        <div style={{ width: '100%', height: 4, backgroundColor: '#0D9488', opacity: 0.3 }} />
      </div>
    ),
    { ...size }
  );
}
