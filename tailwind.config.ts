import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF',
        'paper-deep': '#F9FAFB',
        ink: '#111827',
        'ink-soft': '#6B7280',
        'ink-faint': '#9CA3AF',
        rule: '#E5E7EB',
        accent: '#0D9488',
        'accent-bright': '#0F766E',
        'accent-glow': '#99F6E4',
        highlight: '#F0FDFA',
        oxblood: '#DC2626'
      },
      fontFamily: {
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace']
      },
      letterSpacing: {
        eyebrow: '0.12em'
      },
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.ink'),
            '--tw-prose-headings': theme('colors.ink'),
            '--tw-prose-links': '#2563EB',
            '--tw-prose-bold': theme('colors.ink'),
            '--tw-prose-quotes': theme('colors.ink-soft'),
            '--tw-prose-quote-borders': theme('colors.accent'),
            '--tw-prose-hr': theme('colors.rule'),
            maxWidth: 'none',
            fontSize: '1.0625rem',
            lineHeight: '1.7'
          }
        }
      })
    }
  },
  plugins: [require('@tailwindcss/typography')]
};

export default config;
