'use client';

import { useState } from 'react';

export function CopyAddress({ value }: { value: string }) {
  const [label, setLabel] = useState('Copy');
  return (
    <button
      type="button"
      className="text-button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setLabel('Copied');
        setTimeout(() => setLabel('Copy'), 1500);
      }}
    >
      {label}
    </button>
  );
}
