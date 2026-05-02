import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap'
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealthcarebrief.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'AI Healthcare Brief — Weekly AI in Healthcare Newsletter',
    template: '%s · AI Healthcare Brief'
  },
  description:
    'A weekly briefing on artificial intelligence in healthcare — clinical AI, regulation, funding, and what it means for providers, payers, and patients. Read by CIOs, CMIOs, and digital health executives.',
  keywords: [
    'healthcare AI', 'artificial intelligence in healthcare', 'clinical AI',
    'health tech newsletter', 'AI regulation healthcare', 'digital health',
    'healthcare automation', 'RCM AI', 'patient experience AI', 'AI weekly newsletter'
  ],
  authors: [{ name: 'AI Healthcare Brief', url: BASE_URL }],
  creator: 'AI Healthcare Brief',
  publisher: 'AI Healthcare Brief',
  category: 'Healthcare Technology',
  openGraph: {
    type: 'website',
    siteName: 'AI Healthcare Brief',
    title: 'AI Healthcare Brief — Weekly AI in Healthcare Newsletter',
    description:
      'A weekly briefing on artificial intelligence in healthcare — clinical AI, regulation, funding, and what it means for providers, payers, and patients.',
    locale: 'en_US',
    url: BASE_URL
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Healthcare Brief',
    description:
      'A weekly briefing on AI in healthcare — clinical AI, regulation, funding. Read by health system leaders every Monday.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  alternates: {
    canonical: BASE_URL
  }
};

// Global Organization + WebSite schema — emitted once on every page
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'AI Healthcare Brief',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo-mark.svg`,
    width: 120,
    height: 120
  },
  description:
    'A weekly briefing on artificial intelligence in healthcare, curated for health system leaders.'
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: 'AI Healthcare Brief',
  url: BASE_URL,
  description:
    'Weekly AI in healthcare newsletter covering clinical AI, regulation, funding, and patient experience.',
  publisher: { '@id': `${BASE_URL}/#organization` },
  inLanguage: 'en-US'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans bg-paper text-ink min-h-screen flex flex-col" suppressHydrationWarning>
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
