'use client';

import Link from 'next/link';
import { useState } from 'react';

type State = 'idle' | 'submitting' | 'success' | 'error';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setState('error');
        return;
      }

      setSubmittedEmail(email);
      setState('success');
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setState('error');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 md:py-14 animate-fade">
      {/* Back link */}
      <Link
        href="/"
        className="eyebrow text-ink-soft hover:text-accent transition-colors inline-block mb-8"
      >
        ← Back to archive
      </Link>

      {state === 'success' ? (
        /* ── Success state ── */
        <div className="py-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-highlight border border-accent/20 mb-6 text-accent">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-ink mb-3">
            Almost there!
          </h1>
          <p className="text-ink-soft text-base mb-1">
            We sent a confirmation link to
          </p>
          <p className="font-semibold text-ink text-base mb-5">{submittedEmail}</p>
          <p className="text-ink-soft text-sm">
            Click the link in the email to complete your subscription.
          </p>
          <p className="mt-8 text-xs text-ink-faint">
            Wrong email?{' '}
            <button
              onClick={() => { setState('idle'); setEmail(''); }}
              className="underline hover:text-accent transition-colors"
            >
              Try again
            </button>
          </p>
        </div>
      ) : (
        /* ── Form state (idle / submitting / error) ── */
        <>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email" className="block font-sans font-medium text-sm text-ink mb-2">
              Email address
            </label>
            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={state === 'submitting'}
                className="flex-1 px-4 py-3 border border-rule rounded-sm text-ink placeholder-ink-faint bg-paper focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={state === 'submitting' || !email}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-mono text-xs uppercase tracking-eyebrow hover:bg-accent-bright transition-colors duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {state === 'submitting' ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Subscribing…
                  </>
                ) : (
                  'Subscribe →'
                )}
              </button>
            </div>

            {state === 'error' && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">{errorMsg}</p>
            )}
          </form>

          {/* Supporting context */}
          <div className="mt-10 pt-8 border-t border-rule">
            <p className="eyebrow text-accent mb-3">Free · Every Monday · 10am ET</p>
            <p className="text-ink-soft text-sm leading-relaxed">
              One concise briefing every week — clinical AI, regulation, funding, and
              what it means for providers, payers, and patients.
            </p>
            <p className="mt-4 text-xs text-ink-faint">
              No spam. Unsubscribe any time. Curated with AI, edited by humans.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
