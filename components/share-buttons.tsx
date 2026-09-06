'use client';

import { useState } from 'react';

export function ShareButtons({ title, version }: { title: string; version?: string }) {
  const [status, setStatus] = useState('');

  function currentShareUrl() {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    if (version) url.searchParams.set('v', version);
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
