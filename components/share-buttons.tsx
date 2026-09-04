'use client';

import { useState } from 'react';

export function ShareButtons({ title }: { title: string }) {
  const [status, setStatus] = useState('');

  async function share() {
    const data = { title, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
        setStatus('Shared.');
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(window.location.href);
    setStatus('Link copied.');
  }

  return (
    <div className="share-wrap">
      <button className="text-button" type="button" onClick={share}>Share</button>
      <span role="status" aria-live="polite">{status}</span>
    </div>
  );
}
