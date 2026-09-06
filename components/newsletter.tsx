'use client';

import { FormEvent, useState } from 'react';
import type { NewsletterFrequency } from '@/lib/types';

type SubmissionState = 'idle' | 'pending' | 'success' | 'error';

export function Newsletter() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState('');
  const [frequency, setFrequency] = useState<NewsletterFrequency>('weekly');
  const pending = submissionState === 'pending';

  function clearFeedback() {
    if (submissionState === 'idle' || pending) return;
    setSubmissionState('idle');
    setMessage('');
    setDetail('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setSubmissionState('pending');
    setMessage('Sending confirmation…');
    setDetail('Preparing a secure confirmation link.');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), website: form.get('website'), frequency })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmissionState('error');
        setMessage('Confirmation email failed');
        setDetail(data.message || 'Unable to send a confirmation email right now. Please try again.');
        return;
      }

      setSubmissionState('success');
      setMessage('Check your inbox to confirm');
      setDetail('Open the email from Kvisl and select “Confirm subscription”. The link expires in 24 hours.');
      formElement.reset();
    } catch {
      setSubmissionState('error');
      setMessage('Confirmation email failed');
      setDetail('Unable to send a confirmation email right now. Please try again.');
    }
  }

  return (
    <form id="newsletter" className={`newsletter newsletter-${submissionState}`} onSubmit={submit} aria-describedby="newsletter-note newsletter-status" aria-busy={pending}>
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
            onChange={() => { setFrequency('daily'); clearFeedback(); }}
          />
          <span>Daily</span>
        </label>
        <label>
          <input
            type="radio"
            name="frequency"
            value="weekly"
            checked={frequency === 'weekly'}
            onChange={() => { setFrequency('weekly'); clearFeedback(); }}
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
          onChange={clearFeedback}
        />
        <button type="submit" disabled={pending} aria-disabled={pending}>
          <span>{pending ? 'Sending…' : submissionState === 'success' ? 'Email sent' : 'Subscribe'}</span>
        </button>
      </div>

      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <p id="newsletter-note" className="newsletter-note">See our <a href="/newsletter-privacy">newsletter privacy policy</a>.</p>

      <div
        id="newsletter-status"
        className={`newsletter-feedback is-${submissionState}`}
        role={submissionState === 'error' ? 'alert' : 'status'}
        aria-live="polite"
        aria-atomic="true"
        hidden={submissionState === 'idle'}
      >
        <span className="newsletter-feedback-icon" aria-hidden="true">
          {submissionState === 'success' ? (
            <svg viewBox="0 0 32 32" focusable="false">
              <circle className="newsletter-check-circle" cx="16" cy="16" r="14" />
              <path className="newsletter-check-path" d="m9.5 16.4 4.1 4.1 8.9-9" />
            </svg>
          ) : submissionState === 'pending' ? (
            <span className="newsletter-spinner" />
          ) : (
            <span className="newsletter-error-mark">!</span>
          )}
        </span>
        <span className="newsletter-feedback-copy">
          <strong>{message}</strong>
          <span>{detail}</span>
        </span>
      </div>
    </form>
  );
}
