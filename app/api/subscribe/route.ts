import { NextRequest, NextResponse } from 'next/server';
import { encryptEmail } from '@/lib/crypto';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // Parse body
  let email: string;
  try {
    const body = await req.json();
    email = (body.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 422 });
  }

  // Encrypt the email into a URL-safe token
  let token: string;
  try {
    token = encryptEmail(email);
  } catch (err) {
    console.error('Encryption error:', err);
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  // Required env vars
  const apiKey = process.env.SENDGRID_API_KEY;
  const listId = process.env.SENDGRID_UNVERIFIED_LIST_ID;
  const fieldId = process.env.SENDGRID_CUSTOM_FIELD_ID;

  if (!apiKey || !listId || !fieldId) {
    console.error('Missing SendGrid env vars: SENDGRID_API_KEY, SENDGRID_UNVERIFIED_LIST_ID, or SENDGRID_CUSTOM_FIELD_ID');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  // Add contact to Unverified list with encrypted token in custom field
  const sgRes = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      list_ids: [listId],
      contacts: [
        {
          email,
          custom_fields: { [fieldId]: token }
        }
      ]
    })
  });

  if (sgRes.status !== 202) {
    const detail = await sgRes.text();
    console.error(`SendGrid error ${sgRes.status}:`, detail);
    return NextResponse.json(
      { error: 'Could not add your subscription. Please try again.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
