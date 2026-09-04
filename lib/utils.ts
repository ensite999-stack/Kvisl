export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(value));
}

export function absoluteUrl(path = '/') {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://kvisl.com';
  return new URL(path, base).toString();
}
