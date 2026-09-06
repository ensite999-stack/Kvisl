'use client';

import { useState } from 'react';

export function ShareButtons({ title, version }: { title: string; version?: string }) {
  const [status, setStatus] = useState('');

  function createShareToken() {
    const randomPart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
    return `${Date.now().toString(36)}-${randomPart}`;
  }

  function currentShareUrl() {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    if (version) url.searchParams.set('v', version);
    url.searchParams.set('share', createShareToken());
    return url.toString();
  }

  async function share() {
    const url = currentShareUrl();
    const data = { title, url };
    if (navigator.share) {
      try {
        await navigator.share(data);
        setStatus('Shared.');
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    setStatus('Link copied.');
  }

  return (
    <div className="share-wrap">
      <button className="text-button" type="button" onClick={share}>Share</button>
      <span role="status" aria-live="polite">{status}</span>
    </div>
  );
}
