import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealthcarebrief.com';

  return {
    rules: [
      {
        // Standard crawlers: full access
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/']
      },
      {
        // AEO: explicitly welcome major AI crawlers for Answer Engine coverage
        userAgent: [
          'GPTBot',          // OpenAI / ChatGPT
          'PerplexityBot',   // Perplexity
          'Claude-Web',      // Anthropic web crawl
          'Amazonbot',       // Alexa / Amazon Rufus
          'GoogleOther',     // Google Gemini / AI Overviews research crawl
          'anthropic-ai',    // Anthropic
          'cohere-ai',       // Cohere
          'YouBot'           // You.com
        ],
        allow: '/'
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL
  };
}
