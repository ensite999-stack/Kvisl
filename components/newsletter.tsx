'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import type { NewsletterFrequency } from '@/lib/types';

export function Newsletter() {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [frequency, setFrequency] = useState<NewsletterFrequency>('weekly');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), website: form.get('website'), frequency })
    });
    const data = await response.json().catch(() => ({}));
    setMessage(data.message || (response.ok ? 'Subscribed.' : 'Unable to subscribe right now.'));
    setPending(false);
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form className="newsletter" onSubmit={submit} aria-describedby="newsletter-note newsletter-status">
      <div className="newsletter-copy">
        <label htmlFor="newsletter-email">Subscribe to our newsletter</label>
        <p><span className="notranslate" translate="no">Kvisl</span> latest news.</p>
      </div>
      <div className="newsletter-frequency" role="radiogroup" aria-label="Newsletter frequency">
        <label><input type="radio" name="frequency" value="daily" checked={frequency === 'daily'} onChange={() => setFrequency('daily')} /><span>Daily</span></label>
        <label><input type="radio" name="frequency" value="weekly" checked={frequency === 'weekly'} onChange={() => setFrequency('weekly')} /><span>Weekly</span></label>
      </div>
      <div className="newsletter-row">
        <input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="Your email address" required />
        <button type="submit" disabled={pending}>{pending ? 'Subscribing…' : 'Subscribe'}</button>
      </div>
      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <p id="newsletter-note" className="newsletter-note">See our <Link href="/newsletter-privacy">newsletter privacy policy</Link>.</p>
      <p id="newsletter-status" className="newsletter-status" role="status" aria-live="polite">{message}</p>
    </form>
  );
}
