export function InstagramIcon({ className = 'instagram-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 30" aria-hidden="true" focusable="false">
      <path d="M6 2.5h18L27.5 6v18L24 27.5H6L2.5 24V6L6 2.5Z" fill="none" stroke="currentColor" strokeWidth="1.55" />
      <path d="M9.2 15c0-3.7 2.6-6.2 5.8-6.2s5.8 2.5 5.8 6.2-2.6 6.2-5.8 6.2S9.2 18.7 9.2 15Z" fill="none" stroke="currentColor" strokeWidth="1.55" />
      <path d="M21.7 7.3h.01" stroke="currentColor" strokeWidth="3.3" strokeLinecap="square" />
      <path d="M3.8 9.1h2.6M23.6 20.9h2.6" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
