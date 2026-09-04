'use client';

import { FormEvent, useState } from 'react';
import type { NewsletterFrequency } from '@/lib/types';

export function Newsletter() {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [frequency, setFrequency] = useState<NewsletterFrequency>('weekly');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setPending(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), website: form.get('website'), frequency })
      });
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || (response.ok ? 'Subscribed.' : 'Unable to subscribe right now.'));
      if (response.ok) formElement.reset();
    } catch {
      setMessage('Unable to subscribe right now. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="newsletter" onSubmit={submit} aria-describedby="newsletter-note newsletter-status" aria-busy={pending}>
      <div className="newsletter-copy">
        <label htmlFor="newsletter-email">Subscribe to our newsletter</label>
        <p><span className="notranslate" translate="no">Kvisl</span> latest news.</p>
      </div>

      <fieldset className="newsletter-frequency">
        <legend className="sr-only">Choose newsletter frequency</legend>
        <label>
          <input
            type="radio"
            name="frequency"
            value="daily"
            checked={frequency === 'daily'}
            onChange={() => setFrequency('daily')}
          />
          <span>Daily</span>
        </label>
        <label>
          <input
            type="radio"
            name="frequency"
            value="weekly"
            checked={frequency === 'weekly'}
            onChange={() => setFrequency('weekly')}
          />
          <span>Weekly</span>
        </label>
      </fieldset>

      <div className="newsletter-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Your email address"
          required
          maxLength={254}
        />
        <button type="submit" disabled={pending} aria-disabled={pending}>
          <span>{pending ? 'Subscribing…' : 'Subscribe'}</span>
        </button>
      </div>

      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <p id="newsletter-note" className="newsletter-note">See our <a href="/newsletter-privacy">newsletter privacy policy</a>.</p>
      <p id="newsletter-status" className="newsletter-status" role="status" aria-live="polite" aria-atomic="true">{message}</p>
    </form>
  );
}
