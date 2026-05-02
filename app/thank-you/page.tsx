import type { Metadata } from 'next';
import Link from 'next/link';
import { decryptEmail } from '@/lib/crypto';

export const metadata: Metadata = {
  title: "You're subscribed",
  description: 'Thanks for subscribing to Healthcare AI Brief.'
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getContactId(email: string, apiKey: string): Promise<string | null> {
  const res = await fetch('https://api.sendgrid.com/v3/marketing/contacts/search/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails: [email] })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.result?.[email]?.contact?.id ?? null;
}

async function removeFromList(contactId: string, listId: string, apiKey: string): Promise<void> {
  await fetch(
    `https://api.sendgrid.com/v3/marketing/lists/${listId}/contacts?contact_ids=${contactId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${apiKey}` } }
  );
}

async function addToList(email: string, listId: string, apiKey: string): Promise<boolean> {
  const res = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ list_ids: [listId], contacts: [{ email }] })
  });
  return res.status === 202;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SuccessView() {
  return (
    <>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-highlight border border-accent/20 mb-8">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="font-sans font-bold text-3xl md:text-4xl text-ink mb-4">
        You&apos;re confirmed.
      </h1>
      <p className="text-ink-soft text-base md:text-lg leading-relaxed mb-3">
        Welcome to <span className="font-semibold text-ink">Healthcare AI Brief</span>.
      </p>
      <p className="text-ink-soft text-base leading-relaxed mb-10">
        Your first issue arrives Monday morning at 10am ET. In the meantime, catch
        up on what you&apos;ve missed in the archive.
      </p>
    </>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-8">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="font-sans font-bold text-3xl md:text-4xl text-ink mb-4">
        Something went wrong.
      </h1>
      <p className="text-ink-soft text-base leading-relaxed mb-10">{message}</p>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ThankYouPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams;

  let verified = false;
  let errorMessage = '';

  if (token) {
    const apiKey = process.env.SENDGRID_API_KEY;
    const unverifiedListId = process.env.SENDGRID_UNVERIFIED_LIST_ID;
    const verifiedListId = process.env.SENDGRID_VERIFIED_LIST_ID;

    if (!apiKey || !unverifiedListId || !verifiedListId) {
      errorMessage = 'Server configuration error. Please contact us.';
    } else {
      try {
        const email = decryptEmail(token);

        const contactId = await getContactId(email, apiKey);
        if (!contactId) {
          errorMessage = "We couldn't find your subscription. Please subscribe again.";
        } else {
          await removeFromList(contactId, unverifiedListId, apiKey);
          const ok = await addToList(email, verifiedListId, apiKey);
          if (ok) {
            verified = true;
          } else {
            errorMessage = 'Could not confirm your subscription. Please try again or contact us.';
          }
        }
      } catch {
        errorMessage = 'This confirmation link is invalid or has already been used.';
      }
    }
  }

  const showError = token && !verified && errorMessage;
  const showSuccess = !token || verified;

  return (
    <div className="max-w-xl mx-auto px-6 py-20 md:py-32 text-center animate-fade">
      {showError ? (
        <ErrorView message={errorMessage} />
      ) : (
        <SuccessView />
      )}

      <div className="border-t border-rule mb-10" />

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-accent text-white font-mono text-xs uppercase tracking-eyebrow hover:bg-accent-bright transition-colors duration-300 rounded-sm"
        >
          Browse the archive →
        </Link>
        <Link href="/" className="eyebrow text-ink-soft hover:text-accent transition-colors">
          ← Back to home
        </Link>
      </div>

      {showSuccess && (
        <p className="mt-14 text-xs text-ink-faint">
          Wrong email?{' '}
          <Link href="/subscribe" className="underline hover:text-accent transition-colors">
            Subscribe again
          </Link>{' '}
          with the correct address.
        </p>
      )}

      {showError && (
        <p className="mt-8 text-xs text-ink-faint">
          <Link href="/subscribe" className="underline hover:text-accent transition-colors">
            Subscribe again
          </Link>
        </p>
      )}
    </div>
  );
}
